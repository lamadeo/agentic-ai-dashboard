/**
 * Code Aggregator
 *
 * Aggregates Claude Code leaderboard and usage metrics for the Code tab.
 * Builds leaderboard from all Claude Code data, ranks users, and provides
 * department breakdowns.
 *
 * Key Features:
 * - Leaderboard generation (top 20 users by lines generated)
 * - Department breakdown
 * - Weekly active users trend
 * - User growth trend
 *
 * Dependencies: parse-hierarchy (getDepartmentInfo)
 */

/**
 * Aggregate code data for dashboard
 *
 * @param {Object} options - Configuration options
 * @param {Array} options.allClaudeCodeData - All Claude Code raw data rows
 * @param {Map} options.orgEmailMap - Org hierarchy email mapping
 * @param {Array} options.claudeCodeMonthly - Monthly trend data
 * @param {Function} options.getDepartmentInfo - Function to get department info from email
 * @param {boolean} options.verbose - Enable detailed logging (default: false)
 * @returns {Promise<Object>} Code metrics
 */
async function aggregateCodeData(options = {}) {
  const {
    allClaudeCodeData = [],
    orgEmailMap,
    claudeCodeMonthly = [],
    getDepartmentInfo,
    verbose = false
  } = options;

  if (verbose) {
    console.log('\n📊 Calculating Code tab metrics...\n');
  }

  // Build leaderboard from all Claude Code data (all months combined)
  const leaderboardMap = new Map();

  // Process all Claude Code data (dynamically loaded from all CSV files)
  allClaudeCodeData.forEach(row => {
    const email = row.User?.toLowerCase().trim();
    if (!email) return;

    const lines = parseInt(row['Lines this Month']?.replace(/,/g, '') || 0);
    if (lines === 0) return;

    if (!leaderboardMap.has(email)) {
      leaderboardMap.set(email, {
        email,
        username: email.split('@')[0],
        totalLines: 0,
        department: getDepartmentInfo(email, orgEmailMap).department
      });
    }

    leaderboardMap.get(email).totalLines += lines;
  });

  // Sort and rank
  const leaderboard = Array.from(leaderboardMap.values())
    .sort((a, b) => b.totalLines - a.totalLines)
    .map((user, idx) => ({
      rank: idx + 1,
      username: user.username,
      lines: user.totalLines,
      department: user.department
    }))
    .slice(0, 20);

  // Department Breakdown: Aggregate Claude Code usage by department
  const claudeCodeDeptMap = new Map();
  Array.from(leaderboardMap.values()).forEach(user => {
    if (!user.department) return;

    if (!claudeCodeDeptMap.has(user.department)) {
      claudeCodeDeptMap.set(user.department, {
        department: user.department,
        users: 0,
        totalLines: 0,
        topUser: null
      });
    }

    const dept = claudeCodeDeptMap.get(user.department);
    dept.users++;
    dept.totalLines += user.totalLines;

    // Track top user for this department
    if (!dept.topUser || user.totalLines > dept.topUser.lines) {
      dept.topUser = {
        username: user.username,
        lines: user.totalLines
      };
    }
  });

  // Add Agentic FTE from latest month's byDept data
  const latestMonth = claudeCodeMonthly.length > 0 ? claudeCodeMonthly[claudeCodeMonthly.length - 1] : null;
  const latestAgenticFTEMap = new Map();
  if (latestMonth?.byDept) {
    latestMonth.byDept.forEach(dept => {
      latestAgenticFTEMap.set(dept.department, dept.agenticFTE || 0);
    });
  }

  const claudeCodeDepartmentBreakdown = Array.from(claudeCodeDeptMap.values())
    .map(dept => ({
      ...dept,
      linesPerUser: dept.users > 0 ? Math.round(dept.totalLines / dept.users) : 0,
      agenticFTE: latestAgenticFTEMap.get(dept.department) || 0
    }))
    .sort((a, b) => b.totalLines - a.totalLines);

  const codeData = {
    leaderboard,
    weeklyActiveUsers: claudeCodeMonthly.map(m => ({
      week: m.monthLabel,
      users: m.users
    })),
    userGrowthTrend: claudeCodeMonthly.map((m, idx) => {
      const previousMonth = idx > 0 ? claudeCodeMonthly[idx - 1] : null;
      return {
        month: m.monthLabel,
        newUsers: previousMonth ? m.users - previousMonth.users : m.users,
        totalUsers: m.users
      };
    }),
    departmentBreakdown: claudeCodeDepartmentBreakdown
  };

  if (verbose) {
    console.log(`✅ Code Tab Metrics:`);
    console.log(`   - Leaderboard entries: ${leaderboard.length}`);
    console.log(`   - Top user: ${leaderboard[0]?.username} (${leaderboard[0]?.lines.toLocaleString()} lines)`);
  }

  return codeData;
}

module.exports = {
  aggregateCodeData
};
