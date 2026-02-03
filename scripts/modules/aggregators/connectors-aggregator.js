/**
 * Connectors/Integrations Aggregator
 *
 * Prepares dashboard-ready data structure from processed connectors data.
 * Outputs format compatible with ai-tools-data.json schema.
 *
 * Key Features:
 * - Summary metrics for KPI cards
 * - Integration usage rankings
 * - Department heatmap data
 * - Power user leaderboard
 * - Monthly trend data
 * - AI insight context
 *
 * Dependencies: None (pure aggregation)
 */

/**
 * Aggregate connectors data for dashboard display
 *
 * @param {Object} options - Configuration options
 * @param {Array} options.byUser - Processed user data with department info
 * @param {Array} options.byIntegration - Processed integration data
 * @param {Array} options.byDepartment - Processed department data
 * @param {Array} options.monthlyTrend - Monthly trend data
 * @param {Object} options.metrics - Raw metrics from ingestor
 * @param {boolean} options.verbose - Enable detailed logging
 * @returns {Promise<Object>} Dashboard-ready connectors data
 */
async function aggregateConnectorsData(options = {}) {
  const {
    byUser = [],
    byIntegration = [],
    byDepartment = [],
    monthlyTrend = [],
    metrics = {},
    verbose = false
  } = options;

  if (verbose) {
    console.log('\n📊 Aggregating Connectors data for dashboard...\n');
  }

  // 1. Calculate summary metrics
  const totalCalls = byIntegration.reduce((sum, i) => sum + i.calls, 0);
  const usersWithUsage = byUser.length;
  const avgCallsPerUser = usersWithUsage > 0
    ? Math.round(totalCalls / usersWithUsage)
    : 0;
  const topIntegration = byIntegration.length > 0 ? byIntegration[0] : null;

  const summary = {
    totalCalls,
    uniqueIntegrations: byIntegration.length,
    usersWithUsage,
    avgCallsPerUser,
    topIntegration: topIntegration ? topIntegration.name : 'N/A',
    topIntegrationCalls: topIntegration ? topIntegration.calls : 0
  };

  // 2. Format integration rankings (top 20)
  const integrationRankings = byIntegration.slice(0, 20).map((integration, index) => ({
    rank: index + 1,
    name: integration.name,
    calls: integration.calls,
    users: integration.users,
    callsPerUser: integration.callsPerUser,
    topDepartment: integration.departments.length > 0
      ? integration.departments[0].department
      : 'Unknown',
    trend: 0 // TODO: Calculate from monthly data
  }));

  // 3. Format department data for heatmap
  const departmentHeatmap = byDepartment.map(dept => ({
    department: dept.department,
    totalCalls: dept.totalCalls,
    users: dept.users,
    integrations: dept.uniqueIntegrations,
    avgCallsPerUser: dept.avgCallsPerUser,
    diversityScore: dept.diversityScore,
    engagementLevel: dept.engagementLevel,
    topIntegration: dept.topIntegration
  }));

  // 4. Power users leaderboard (top 25)
  const powerUsers = byUser
    .filter(u => u.isPowerUser)
    .slice(0, 25)
    .map((user, index) => ({
      rank: index + 1,
      name: user.name,
      email: user.email,
      department: user.department,
      totalCalls: user.totalCalls,
      uniqueIntegrations: user.uniqueIntegrations,
      diversityScore: user.diversityScore,
      topIntegrations: user.integrations.slice(0, 3)
    }));

  // 5. All users (for detailed view)
  const allUsers = byUser.slice(0, 100).map((user, index) => ({
    rank: index + 1,
    name: user.name,
    email: user.email,
    department: user.department,
    calls: user.totalCalls,
    integrations: user.uniqueIntegrations,
    isPowerUser: user.isPowerUser
  }));

  // 6. Generate insights context
  const insights = generateInsightsContext(byIntegration, byDepartment, byUser);

  if (verbose) {
    console.log(`   Summary: ${summary.totalCalls.toLocaleString()} calls across ${summary.uniqueIntegrations} integrations`);
    console.log(`   Power users: ${powerUsers.length}`);
    console.log(`   Top integration: ${summary.topIntegration} (${summary.topIntegrationCalls.toLocaleString()} calls)`);
  }

  return {
    summary,
    byIntegration: integrationRankings,
    byDepartment: departmentHeatmap,
    byUser: allUsers,
    powerUsers,
    monthlyTrend,
    insights
  };
}

/**
 * Generate insights context for AI analysis
 * @param {Array} integrations - Integration data
 * @param {Array} departments - Department data
 * @param {Array} users - User data
 * @returns {Object} Insights context
 * @private
 */
function generateInsightsContext(integrations, departments, users) {
  // Top integration by department
  const topIntegrationByDept = {};
  departments.forEach(dept => {
    if (dept.topIntegration) {
      topIntegrationByDept[dept.department] = dept.topIntegration;
    }
  });

  // Underutilized integrations (fewer than 5 users)
  const underutilizedIntegrations = integrations
    .filter(i => i.users < 5 && i.users > 0)
    .map(i => i.name);

  // Departments with low engagement
  const lowEngagementDepts = departments
    .filter(d => d.engagementLevel === 'Low')
    .map(d => d.department);

  // Growth opportunities: departments with few integrations but high calls
  const growthOpportunities = departments
    .filter(d => d.uniqueIntegrations < 3 && d.totalCalls > 50)
    .map(d => ({
      department: d.department,
      suggestion: `Could benefit from exploring more integrations (currently using ${d.uniqueIntegrations})`
    }));

  // Power user distribution
  const powerUsersByDept = {};
  departments.forEach(dept => {
    if (dept.powerUsers > 0) {
      powerUsersByDept[dept.department] = dept.powerUsers;
    }
  });

  return {
    topIntegrationByDept,
    underutilizedIntegrations,
    lowEngagementDepts,
    growthOpportunities,
    powerUsersByDept,
    totalPowerUsers: users.filter(u => u.isPowerUser).length,
    avgDiversityScore: users.length > 0
      ? Math.round(users.reduce((sum, u) => sum + u.diversityScore, 0) / users.length)
      : 0
  };
}

module.exports = {
  aggregateConnectorsData
};
