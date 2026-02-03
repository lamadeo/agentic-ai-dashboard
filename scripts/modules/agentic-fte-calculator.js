/**
 * Agentic FTE Calculator Module
 *
 * Calculates per-user Agentic FTE (Full-Time Equivalent) values based on engagement metrics.
 * Agentic FTE represents the AI-augmented capacity that each employee adds to their work.
 * Uses proportional distribution methodology: distribute total monthly FTEs based on each user's
 * engagement score relative to the total engagement across all users.
 */

/**
 * Calculate Agentic FTE for Claude Enterprise users
 *
 * @param {Array} usersArray - Array of user objects with artifacts and messages
 * @param {Object} latestMonth - Latest month data with user count
 * @param {number} ftePerUser - FTE value per user (default: 0.28)
 * @returns {Map} Map of email -> agenticFTE value
 */
function calculateClaudeEnterpriseAgenticFTE(usersArray, latestMonth, ftePerUser = 0.28) {
  const totalMonthlyFTEs = latestMonth ? latestMonth.users * ftePerUser : 0;

  // Calculate engagement scores for active users
  // Engagement score = (artifacts × 2) + (messages / 100)
  // Artifacts weighted 2x as they represent actual deliverables
  const activeUsersWithEngagement = usersArray
    .filter(u => u.messages > 0)
    .map(user => ({
      email: user.email,
      name: user.name,
      engagementScore: (user.artifacts * 2) + (user.messages / 100)
    }));

  const totalEngagementScore = activeUsersWithEngagement.reduce((sum, u) => sum + u.engagementScore, 0);

  // Distribute FTEs proportionally
  const fteMap = new Map();
  activeUsersWithEngagement.forEach(user => {
    if (totalEngagementScore > 0) {
      const userWeight = user.engagementScore / totalEngagementScore;
      const agenticFTE = parseFloat((totalMonthlyFTEs * userWeight).toFixed(2));
      fteMap.set(user.email, agenticFTE);
    } else {
      fteMap.set(user.email, 0);
    }
  });

  // Log distribution stats
  console.log(`\n💡 Claude Enterprise Agentic FTE Distribution:`);
  console.log(`   Total monthly FTEs: ${totalMonthlyFTEs.toFixed(1)}`);
  console.log(`   Active users: ${activeUsersWithEngagement.length}`);

  const topContributor = activeUsersWithEngagement
    .map(u => ({ ...u, agenticFTE: fteMap.get(u.email) }))
    .sort((a, b) => b.agenticFTE - a.agenticFTE)[0];

  if (topContributor) {
    console.log(`   Top contributor: ${topContributor.name} (${topContributor.agenticFTE} FTEs)`);
  }
  console.log(`   Average per user: ${(totalMonthlyFTEs / activeUsersWithEngagement.length).toFixed(2)} FTEs`);

  return fteMap;
}

/**
 * Calculate Agentic FTE for M365 Copilot users
 *
 * @param {Array} userMetrics - Array of user objects with promptsPerDay
 * @param {Object} latestMonth - Latest month data with user count
 * @param {number} ftePerUser - FTE value per user (default: 0.14)
 * @returns {Map} Map of email -> agenticFTE value
 */
function calculateM365CopilotAgenticFTE(userMetrics, latestMonth, ftePerUser = 0.14) {
  const totalMonthlyFTEs = latestMonth ? latestMonth.users * ftePerUser : 0;

  // Calculate engagement scores for active users
  // Engagement score = promptsPerDay (direct intensity measure)
  const activeUsersWithEngagement = userMetrics
    .filter(u => u.totalPrompts > 0)
    .map(user => ({
      email: user.email,
      name: user.name,
      engagementScore: user.promptsPerDay
    }));

  const totalEngagementScore = activeUsersWithEngagement.reduce((sum, u) => sum + u.engagementScore, 0);

  // Distribute FTEs proportionally
  const fteMap = new Map();
  activeUsersWithEngagement.forEach(user => {
    if (totalEngagementScore > 0) {
      const userWeight = user.engagementScore / totalEngagementScore;
      const agenticFTE = parseFloat((totalMonthlyFTEs * userWeight).toFixed(2));
      fteMap.set(user.email, agenticFTE);
    } else {
      fteMap.set(user.email, 0);
    }
  });

  // Log distribution stats
  console.log(`\n💡 M365 Copilot Agentic FTE Distribution:`);
  console.log(`   Total monthly FTEs: ${totalMonthlyFTEs.toFixed(1)}`);
  console.log(`   Active users: ${activeUsersWithEngagement.length}`);

  const topContributor = activeUsersWithEngagement
    .map(u => ({ ...u, agenticFTE: fteMap.get(u.email) }))
    .sort((a, b) => b.agenticFTE - a.agenticFTE)[0];

  if (topContributor) {
    console.log(`   Top contributor: ${topContributor.name} (${topContributor.agenticFTE} FTEs)`);
  }
  console.log(`   Average per user: ${(totalMonthlyFTEs / activeUsersWithEngagement.length).toFixed(2)} FTEs`);

  return fteMap;
}

/**
 * Calculate Agentic FTE for Claude Code users based on lines of code
 *
 * @param {Array} usersArray - Array of user objects with linesGenerated
 * @returns {Map} Map of email -> agenticFTE value
 */
function calculateClaudeCodeAgenticFTE(usersArray) {
  const HOURS_PER_LINE = 0.08; // 5 minutes per line saved
  const HOURS_PER_FTE = 173; // Monthly hours per FTE

  const fteMap = new Map();

  usersArray.forEach(user => {
    if (user.linesGenerated > 0) {
      const hoursSaved = user.linesGenerated * HOURS_PER_LINE;
      const agenticFTE = parseFloat((hoursSaved / HOURS_PER_FTE).toFixed(2));
      fteMap.set(user.email, agenticFTE);
    } else {
      fteMap.set(user.email, 0);
    }
  });

  // Log distribution stats
  console.log(`\n💡 Claude Code Agentic FTE Distribution:`);
  console.log(`   Active users: ${usersArray.filter(u => u.linesGenerated > 0).length}`);

  const topContributor = Array.from(fteMap.entries())
    .map(([email, fte]) => {
      const user = usersArray.find(u => u.email === email);
      return { name: user?.name, email, agenticFTE: fte };
    })
    .sort((a, b) => b.agenticFTE - a.agenticFTE)[0];

  if (topContributor) {
    console.log(`   Top contributor: ${topContributor.name} (${topContributor.agenticFTE} FTEs)`);
  }

  const totalFTE = Array.from(fteMap.values()).reduce((sum, fte) => sum + fte, 0);
  const avgFTE = usersArray.filter(u => u.linesGenerated > 0).length > 0
    ? totalFTE / usersArray.filter(u => u.linesGenerated > 0).length
    : 0;
  console.log(`   Total FTE: ${totalFTE.toFixed(1)}`);
  console.log(`   Average per user: ${avgFTE.toFixed(2)} FTEs`);

  return fteMap;
}

/**
 * Calculate Agentic FTE for Claude Code department based on lines of code
 *
 * @param {number} linesOfCode - Total lines of code written by the department
 * @returns {number} Agentic FTE value
 */
function calculateClaudeCodeDepartmentAgenticFTE(linesOfCode) {
  const HOURS_PER_LINE = 0.08; // 5 minutes per line saved
  const HOURS_PER_FTE = 173; // Monthly hours per FTE

  const hoursSaved = linesOfCode * HOURS_PER_LINE;
  const agenticFTE = parseFloat((hoursSaved / HOURS_PER_FTE).toFixed(2));

  return agenticFTE;
}

/**
 * Apply Agentic FTE values to user arrays
 * Mutates the arrays by adding/updating agenticFTE field
 *
 * @param {Map} fteMap - Map of email -> agenticFTE value
 * @param {...Array} userArrays - Variable number of user arrays to update
 */
function applyAgenticFTEToArrays(fteMap, ...userArrays) {
  userArrays.forEach(array => {
    if (Array.isArray(array)) {
      array.forEach(user => {
        user.agenticFTE = fteMap.get(user.email) || 0;
      });
    }
  });
}

module.exports = {
  calculateClaudeEnterpriseAgenticFTE,
  calculateM365CopilotAgenticFTE,
  calculateClaudeCodeAgenticFTE,
  calculateClaudeCodeDepartmentAgenticFTE,
  applyAgenticFTEToArrays
};
