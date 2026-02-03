/**
 * Overview Aggregator
 *
 * Aggregates top-level overview metrics for the Overview tab.
 * Combines data from multiple sources to provide executive summary metrics.
 *
 * Key Features:
 * - Total active users across all tools
 * - Overall adoption rate
 * - User growth trends (MoM)
 * - Top departments by engagement
 * - Recent activity metrics
 *
 * Dependencies: adoption-scorer (calculateMoMGrowth, calculateTopDepartments, calculateRecentActivity)
 */

const { calculateMoMGrowth, calculateTopDepartments, calculateRecentActivity } = require('../processors/adoption-scorer');

/**
 * Aggregate overview data for dashboard
 *
 * @param {Object} options - Configuration options
 * @param {number} options.claudeEnterpriseActiveUsers - Active Claude Enterprise users
 * @param {number} options.m365ActiveUsers - Active M365 Copilot users
 * @param {number} options.claudeEnterpriseTotalConversations - Total conversations in Claude Enterprise
 * @param {Object} options.licenseConfig - License configuration { claudeEnterprise, m365Copilot }
 * @param {Array} options.claudeEnterpriseMonthly - Claude Enterprise monthly trend data
 * @param {Array} options.claudeEnterpriseWeekly - Claude Enterprise weekly trend data
 * @param {Array} options.m365Monthly - M365 Copilot monthly trend data
 * @param {boolean} options.verbose - Enable detailed logging (default: false)
 * @returns {Promise<Object>} Overview metrics
 */
async function aggregateOverviewData(options = {}) {
  const {
    claudeEnterpriseActiveUsers,
    m365ActiveUsers,
    claudeEnterpriseTotalConversations,
    licenseConfig,
    claudeEnterpriseMonthly = [],
    claudeEnterpriseWeekly = [],
    m365Monthly = [],
    verbose = false
  } = options;

  if (verbose) {
    console.log('\n📊 Calculating Overview metrics...\n');
  }

  const totalActiveUsers = claudeEnterpriseActiveUsers + m365ActiveUsers;
  const totalLicensedUsers = licenseConfig.claudeEnterprise.licensedUsers + licenseConfig.m365Copilot.licensedUsers;

  const overviewData = {
    totalActiveUsers,
    totalLicensedUsers,
    overallAdoptionRate: Math.round((totalActiveUsers / totalLicensedUsers) * 100),
    userGrowth: calculateMoMGrowth(claudeEnterpriseMonthly, 'users'),
    conversationGrowth: calculateMoMGrowth(claudeEnterpriseMonthly, 'conversations'),
    topDepartments: calculateTopDepartments(m365Monthly, claudeEnterpriseMonthly),
    recentActivity: {
      last7Days: calculateRecentActivity(claudeEnterpriseWeekly, 7),
      last30Days: {
        users: claudeEnterpriseActiveUsers,
        conversations: claudeEnterpriseTotalConversations
      }
    }
  };

  if (verbose) {
    console.log(`✅ Overview Metrics:`);
    console.log(`   - Total Active Users: ${overviewData.totalActiveUsers}`);
    console.log(`   - Overall Adoption Rate: ${overviewData.overallAdoptionRate}%`);
    console.log(`   - User Growth (MoM): ${overviewData.userGrowth}%`);
  }

  return overviewData;
}

module.exports = {
  aggregateOverviewData
};
