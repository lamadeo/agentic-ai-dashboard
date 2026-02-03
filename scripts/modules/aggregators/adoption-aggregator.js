/**
 * Adoption Aggregator
 *
 * Aggregates activation and seat utilization metrics for the Adoption tab.
 * Tracks user activation rates, seat utilization (Premium vs Standard),
 * and activation trends over time.
 *
 * Key Features:
 * - Licensed vs activated user metrics
 * - Seat utilization breakdown (Premium/Standard)
 * - Daily active users trend
 * - Activation trend by month
 *
 * Dependencies: None (pure aggregation logic)
 */

/**
 * Aggregate adoption data for dashboard
 *
 * @param {Object} options - Configuration options
 * @param {number} options.claudeEnterpriseActiveUsers - Active Claude Enterprise users
 * @param {number} options.claudeCodeActiveUsers - Active Claude Code users
 * @param {Object} options.licenseConfig - License configuration
 * @param {Array} options.claudeEnterpriseWeekly - Weekly trend data
 * @param {Array} options.claudeEnterpriseMonthly - Monthly trend data
 * @param {boolean} options.verbose - Enable detailed logging (default: false)
 * @returns {Promise<Object>} Adoption metrics
 */
async function aggregateAdoptionData(options = {}) {
  const {
    claudeEnterpriseActiveUsers,
    claudeCodeActiveUsers,
    licenseConfig,
    claudeEnterpriseWeekly = [],
    claudeEnterpriseMonthly = [],
    verbose = false
  } = options;

  if (verbose) {
    console.log('\n📊 Calculating Adoption metrics...\n');
  }

  // Daily active users (approximate from weekly data)
  const dailyActiveUsers = claudeEnterpriseWeekly.slice(-10).map(week => ({
    date: week.week,
    users: week.users
  }));

  // Seat utilization (Premium vs Standard for Claude Enterprise)
  const premiumSeats = licenseConfig.claudeCode.licensedUsers;
  const standardSeats = licenseConfig.claudeEnterprise.licensedUsers - premiumSeats;

  const adoptionData = {
    licensedUsers: licenseConfig.claudeEnterprise.licensedUsers,
    activatedUsers: claudeEnterpriseActiveUsers,
    activeUsers: claudeEnterpriseActiveUsers,
    activationRate: Math.round((claudeEnterpriseActiveUsers / licenseConfig.claudeEnterprise.licensedUsers) * 100),
    activeRate: 100,
    dailyActiveUsers,
    seatUtilization: {
      Premium: {
        licensed: premiumSeats,
        active: claudeCodeActiveUsers,
        rate: Math.round((claudeCodeActiveUsers / premiumSeats) * 100)
      },
      Standard: {
        licensed: standardSeats,
        active: claudeEnterpriseActiveUsers - claudeCodeActiveUsers,
        rate: Math.round(((claudeEnterpriseActiveUsers - claudeCodeActiveUsers) / standardSeats) * 100)
      }
    },
    activationTrend: claudeEnterpriseMonthly.map(m => ({
      month: m.monthLabel,
      activated: m.users,
      rate: Math.round((m.users / licenseConfig.claudeEnterprise.licensedUsers) * 100)
    }))
  };

  if (verbose) {
    console.log(`✅ Adoption Metrics:`);
    console.log(`   - Activation Rate: ${adoptionData.activationRate}%`);
    console.log(`   - Premium Utilization: ${adoptionData.seatUtilization.Premium.rate}%`);
  }

  return adoptionData;
}

module.exports = {
  aggregateAdoptionData
};
