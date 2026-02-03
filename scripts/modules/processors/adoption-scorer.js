/**
 * Adoption Scorer
 *
 * Calculates adoption metrics, growth trends, and engagement scores.
 * Provides utility functions for analyzing user activity patterns and
 * identifying top-performing departments by engagement.
 *
 * Key Features:
 * - Month-over-month growth calculation
 * - Top departments by engagement (M365 + Claude)
 * - Recent activity metrics (users, conversations)
 * - Adoption rate analysis
 *
 * Dependencies: None (pure utility functions)
 */

/**
 * Calculate month-over-month growth percentage
 *
 * @param {Array} monthlyData - Monthly trend data (must have at least 2 entries)
 * @param {string} metric - Metric to calculate growth for (e.g., 'users', 'prompts')
 * @returns {number} Growth percentage (rounded to nearest integer, 0 if insufficient data)
 */
function calculateMoMGrowth(monthlyData, metric) {
  if (monthlyData.length < 2) return 0;
  const current = monthlyData[monthlyData.length - 1][metric];
  const previous = monthlyData[monthlyData.length - 2][metric];
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Calculate top departments by engagement
 * Combines M365 Copilot and Claude Enterprise activity data
 *
 * @param {Array} m365Monthly - M365 Copilot monthly trend data
 * @param {Array} claudeEnterpriseMonthly - Claude Enterprise monthly trend data
 * @returns {Array} Top 5 departments sorted by total engagement (prompts + conversations)
 */
function calculateTopDepartments(m365Monthly, claudeEnterpriseMonthly) {
  if (m365Monthly.length === 0 && claudeEnterpriseMonthly.length === 0) return [];

  // Get latest month data
  const latestM365 = m365Monthly[m365Monthly.length - 1];
  const latestClaude = claudeEnterpriseMonthly[claudeEnterpriseMonthly.length - 1];

  // Combine department data
  const deptMap = new Map();

  if (latestM365 && latestM365.byDept) {
    latestM365.byDept.forEach(dept => {
      deptMap.set(dept.department, {
        department: dept.department,
        m365Users: dept.users,
        m365Prompts: dept.prompts,
        claudeUsers: 0,
        claudeConversations: 0,
        totalEngagement: dept.prompts
      });
    });
  }

  if (latestClaude && latestClaude.byDept) {
    latestClaude.byDept.forEach(dept => {
      if (deptMap.has(dept.department)) {
        const existing = deptMap.get(dept.department);
        existing.claudeUsers = dept.users;
        existing.claudeConversations = dept.conversations;
        existing.totalEngagement += dept.conversations;
      } else {
        deptMap.set(dept.department, {
          department: dept.department,
          m365Users: 0,
          m365Prompts: 0,
          claudeUsers: dept.users,
          claudeConversations: dept.conversations,
          totalEngagement: dept.conversations
        });
      }
    });
  }

  return Array.from(deptMap.values())
    .sort((a, b) => b.totalEngagement - a.totalEngagement)
    .slice(0, 5);
}

/**
 * Calculate recent activity metrics
 * Aggregates user and conversation counts from recent weeks
 *
 * @param {Array} weeklyData - Weekly trend data
 * @param {number} days - Number of days to look back (will be rounded up to nearest week)
 * @returns {Object} { users: number, conversations: number }
 */
function calculateRecentActivity(weeklyData, days) {
  if (!weeklyData || weeklyData.length === 0) return { users: 0, conversations: 0 };

  // Get most recent weeks (approximate)
  const weeksNeeded = Math.ceil(days / 7);
  const recentWeeks = weeklyData.slice(-weeksNeeded);

  const uniqueUsers = new Set();
  let totalConversations = 0;

  recentWeeks.forEach(week => {
    totalConversations += week.conversations || 0;
    // Can't accurately track unique users from aggregated data, use latest week as proxy
  });

  return {
    users: recentWeeks[recentWeeks.length - 1]?.users || 0,
    conversations: totalConversations
  };
}

/**
 * Process adoption metrics (main processor function)
 * Calculates comprehensive adoption metrics including growth trends,
 * top departments, and recent activity
 *
 * @param {Object} options - Configuration options
 * @param {Array} options.m365Monthly - M365 Copilot monthly trend data
 * @param {Array} options.claudeEnterpriseMonthly - Claude Enterprise monthly trend data
 * @param {Array} options.claudeEnterpriseWeekly - Claude Enterprise weekly trend data
 * @param {number} options.recentDays - Number of days for recent activity calculation (default: 30)
 * @param {boolean} options.verbose - Enable detailed logging (default: false)
 * @returns {Promise<Object>} Adoption metrics and analysis
 */
async function processAdoptionMetrics(options = {}) {
  const {
    m365Monthly = [],
    claudeEnterpriseMonthly = [],
    claudeEnterpriseWeekly = [],
    recentDays = 30,
    verbose = false
  } = options;

  if (verbose) {
    console.log('\n📈 Processing adoption metrics...\n');
  }

  // Calculate growth metrics
  const m365UserGrowth = calculateMoMGrowth(m365Monthly, 'users');
  const m365PromptGrowth = calculateMoMGrowth(m365Monthly, 'prompts');
  const claudeUserGrowth = calculateMoMGrowth(claudeEnterpriseMonthly, 'users');
  const claudeConversationGrowth = calculateMoMGrowth(claudeEnterpriseMonthly, 'conversations');

  // Calculate top departments
  const topDepartments = calculateTopDepartments(m365Monthly, claudeEnterpriseMonthly);

  // Calculate recent activity
  const recentActivity = calculateRecentActivity(claudeEnterpriseWeekly, recentDays);

  if (verbose) {
    console.log('   Growth Metrics (MoM):');
    console.log(`     M365 Users: ${m365UserGrowth}%`);
    console.log(`     M365 Prompts: ${m365PromptGrowth}%`);
    console.log(`     Claude Users: ${claudeUserGrowth}%`);
    console.log(`     Claude Conversations: ${claudeConversationGrowth}%`);
    console.log(`\n   Top ${topDepartments.length} Departments by Engagement:`);
    topDepartments.forEach((dept, i) => {
      console.log(`     ${i + 1}. ${dept.department}: ${dept.totalEngagement.toLocaleString()} total engagement`);
    });
    console.log(`\n   Recent ${recentDays} Days:`);
    console.log(`     Active Users: ${recentActivity.users}`);
    console.log(`     Conversations: ${recentActivity.conversations.toLocaleString()}\n`);
  }

  return {
    // Growth metrics
    growth: {
      m365: {
        users: m365UserGrowth,
        prompts: m365PromptGrowth
      },
      claude: {
        users: claudeUserGrowth,
        conversations: claudeConversationGrowth
      }
    },

    // Top departments
    topDepartments,

    // Recent activity
    recentActivity: {
      days: recentDays,
      users: recentActivity.users,
      conversations: recentActivity.conversations
    },

    // Metadata
    metadata: {
      processedAt: new Date().toISOString(),
      m365MonthsAnalyzed: m365Monthly.length,
      claudeMonthsAnalyzed: claudeEnterpriseMonthly.length,
      claudeWeeksAnalyzed: claudeEnterpriseWeekly.length
    }
  };
}

module.exports = {
  processAdoptionMetrics,
  // Export individual functions for testing/reuse
  calculateMoMGrowth,
  calculateTopDepartments,
  calculateRecentActivity
};
