/**
 * Connectors/Integrations Processor
 *
 * Processes raw connectors data from the ingestor:
 * - Maps users to departments via org hierarchy
 * - Calculates per-user metrics (calls, integrations, diversity score)
 * - Calculates per-integration metrics (calls, users, department breakdown)
 * - Calculates per-department metrics (calls, diversity, power users)
 * - Identifies power users (>50 calls OR >5 unique integrations)
 *
 * Dependencies: parse-hierarchy (getDepartmentInfo)
 */

const { getDepartmentInfo } = require('../../parse-hierarchy');

/**
 * Calculate diversity score for a user
 * Based on number of unique integrations used
 * @param {number} uniqueIntegrations - Number of unique integrations
 * @returns {number} Diversity score 0-100
 * @private
 */
function calculateDiversityScore(uniqueIntegrations) {
  // Score: 1 integration = 10, max out at 10+ integrations = 100
  return Math.min(uniqueIntegrations * 10, 100);
}

/**
 * Determine if user is a power user
 * @param {Object} userData - User usage data
 * @returns {boolean} True if power user
 * @private
 */
function isPowerUser(userData) {
  return userData.count > 50 || userData.integrations.size > 5;
}

/**
 * Process connectors data and enrich with department info
 *
 * @param {Object} options - Configuration options
 * @param {Map} options.byUser - Map of userUuid → { count, tools, integrations }
 * @param {Map} options.byIntegration - Map of integration → count
 * @param {Map} options.byTool - Map of tool → count
 * @param {Map} options.userEmailLookup - Map of UUID → email
 * @param {Map} options.orgEmailMap - Org hierarchy email map from parse-hierarchy
 * @param {Array} options.toolCalls - Raw tool call records
 * @param {boolean} options.verbose - Enable detailed logging
 * @returns {Promise<Object>} Processed connectors data
 */
async function processConnectorsData(options = {}) {
  const {
    byUser,
    byIntegration,
    byTool,
    userEmailLookup,
    orgEmailMap,
    toolCalls = [],
    verbose = false
  } = options;

  if (verbose) {
    console.log('\n📊 Processing Connectors data...\n');
  }

  // 1. Process user data with department enrichment
  const processedUsers = [];
  const departmentStats = new Map();

  for (const [userUuid, userData] of byUser) {
    const email = userEmailLookup.get(userUuid) || '';
    const deptInfo = orgEmailMap ? getDepartmentInfo(email, orgEmailMap) : null;
    const department = deptInfo?.department || 'Unknown';
    const name = deptInfo?.name || email.split('@')[0] || 'Unknown';

    const diversityScore = calculateDiversityScore(userData.integrations.size);
    const userIsPowerUser = isPowerUser(userData);

    const processedUser = {
      email,
      name,
      department,
      totalCalls: userData.count,
      uniqueTools: userData.tools.size,
      uniqueIntegrations: userData.integrations.size,
      integrations: Array.from(userData.integrations),
      diversityScore,
      isPowerUser: userIsPowerUser
    };

    processedUsers.push(processedUser);

    // Aggregate department stats
    if (!departmentStats.has(department)) {
      departmentStats.set(department, {
        totalCalls: 0,
        users: new Set(),
        integrations: new Set(),
        powerUsers: 0,
        integrationCalls: new Map()
      });
    }

    const deptStats = departmentStats.get(department);
    deptStats.totalCalls += userData.count;
    deptStats.users.add(email);
    userData.integrations.forEach(i => deptStats.integrations.add(i));
    if (userIsPowerUser) deptStats.powerUsers++;

    // Track integration calls by department
    userData.integrations.forEach(integration => {
      const currentCalls = deptStats.integrationCalls.get(integration) || 0;
      // Estimate calls per integration proportionally
      const callsForIntegration = Math.round(userData.count / userData.integrations.size);
      deptStats.integrationCalls.set(integration, currentCalls + callsForIntegration);
    });
  }

  // Sort users by total calls
  processedUsers.sort((a, b) => b.totalCalls - a.totalCalls);

  // 2. Process integration data with department breakdown
  const processedIntegrations = [];

  for (const [integration, totalCalls] of byIntegration) {
    // Find users of this integration
    const usersOfIntegration = processedUsers.filter(u =>
      u.integrations.includes(integration)
    );

    // Department breakdown
    const deptBreakdown = new Map();
    usersOfIntegration.forEach(user => {
      const deptData = deptBreakdown.get(user.department) || { calls: 0, users: 0 };
      deptData.users++;
      // Estimate calls from this user for this integration
      const estimatedCalls = Math.round(user.totalCalls / user.uniqueIntegrations);
      deptData.calls += estimatedCalls;
      deptBreakdown.set(user.department, deptData);
    });

    processedIntegrations.push({
      name: integration,
      calls: totalCalls,
      users: usersOfIntegration.length,
      callsPerUser: usersOfIntegration.length > 0
        ? Math.round(totalCalls / usersOfIntegration.length)
        : 0,
      departments: Array.from(deptBreakdown.entries())
        .map(([dept, data]) => ({
          department: dept,
          calls: data.calls,
          users: data.users
        }))
        .sort((a, b) => b.calls - a.calls)
    });
  }

  // Sort integrations by call count
  processedIntegrations.sort((a, b) => b.calls - a.calls);

  // 3. Process department data
  const processedDepartments = [];

  for (const [department, stats] of departmentStats) {
    // Find top integration for this department
    let topIntegration = '';
    let topIntegrationCalls = 0;
    for (const [integration, calls] of stats.integrationCalls) {
      if (calls > topIntegrationCalls) {
        topIntegration = integration;
        topIntegrationCalls = calls;
      }
    }

    // Calculate engagement level
    const avgCallsPerUser = stats.users.size > 0
      ? stats.totalCalls / stats.users.size
      : 0;
    let engagementLevel = 'Low';
    if (avgCallsPerUser > 100) engagementLevel = 'High';
    else if (avgCallsPerUser > 30) engagementLevel = 'Medium';

    processedDepartments.push({
      department,
      totalCalls: stats.totalCalls,
      users: stats.users.size,
      uniqueIntegrations: stats.integrations.size,
      powerUsers: stats.powerUsers,
      topIntegration,
      diversityScore: calculateDiversityScore(stats.integrations.size),
      engagementLevel,
      avgCallsPerUser: Math.round(avgCallsPerUser)
    });
  }

  // Sort departments by total calls
  processedDepartments.sort((a, b) => b.totalCalls - a.totalCalls);

  // 4. Calculate monthly trend (if toolCalls have timestamps)
  const monthlyTrend = calculateMonthlyTrend(toolCalls);

  if (verbose) {
    console.log(`   Processed ${processedUsers.length} users`);
    console.log(`   Processed ${processedIntegrations.length} integrations`);
    console.log(`   Processed ${processedDepartments.length} departments`);
    console.log(`   Power users identified: ${processedUsers.filter(u => u.isPowerUser).length}`);
  }

  return {
    byUser: processedUsers,
    byIntegration: processedIntegrations,
    byDepartment: processedDepartments,
    monthlyTrend,
    metadata: {
      processedAt: new Date().toISOString(),
      totalUsers: processedUsers.length,
      totalIntegrations: processedIntegrations.length,
      totalDepartments: processedDepartments.length,
      powerUserCount: processedUsers.filter(u => u.isPowerUser).length
    }
  };
}

/**
 * Calculate monthly trend from tool calls
 * @param {Array} toolCalls - Array of tool call records with timestamps
 * @returns {Array} Monthly trend data
 * @private
 */
function calculateMonthlyTrend(toolCalls) {
  if (!toolCalls || toolCalls.length === 0) return [];

  const monthlyData = new Map();

  toolCalls.forEach(call => {
    if (!call.timestamp) return;

    try {
      const date = new Date(call.timestamp);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          month: monthKey,
          calls: 0,
          users: new Set(),
          integrations: new Set()
        });
      }

      const monthStats = monthlyData.get(monthKey);
      monthStats.calls++;
      if (call.userUuid) monthStats.users.add(call.userUuid);
      if (call.integration) monthStats.integrations.add(call.integration);
    } catch (e) {
      // Skip invalid timestamps
    }
  });

  // Convert to array and format
  return Array.from(monthlyData.values())
    .map(m => ({
      month: m.month,
      monthLabel: formatMonthLabel(m.month),
      calls: m.calls,
      users: m.users.size,
      integrations: m.integrations.size
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * Format month key to display label
 * @param {string} monthKey - Month key in YYYY-MM format
 * @returns {string} Formatted label like "Jan 2026"
 * @private
 */
function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split('-');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
}

module.exports = {
  processConnectorsData,
  calculateDiversityScore,
  isPowerUser
};
