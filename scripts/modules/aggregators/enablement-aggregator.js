/**
 * Enablement Aggregator
 *
 * Aggregates enablement and expansion data for the Enablement tab.
 * Tracks cohort adoption, expansion priorities, and identifies departments
 * with low adoption for targeted rollout.
 *
 * Key Features:
 * - Cohort adoption by month
 * - Expansion priorities (low adoption departments)
 * - Training and support placeholders
 *
 * Dependencies: expansion-analyzer (calculateExpansionPriorities)
 */

const { calculateExpansionPriorities } = require('../processors/expansion-analyzer');

/**
 * Aggregate enablement data for dashboard
 *
 * @param {Object} options - Configuration options
 * @param {number} options.claudeEnterpriseActiveUsers - Active Claude Enterprise users
 * @param {Array} options.claudeEnterpriseMonthly - Monthly trend data
 * @param {Array} options.m365Monthly - M365 monthly trend data
 * @param {Map} options.orgEmailMap - Org hierarchy email mapping
 * @param {boolean} options.verbose - Enable detailed logging (default: false)
 * @returns {Promise<Object>} Enablement metrics
 */
async function aggregateEnablementData(options = {}) {
  const {
    claudeEnterpriseActiveUsers,
    claudeEnterpriseMonthly = [],
    m365Monthly = [],
    orgEmailMap,
    verbose = false
  } = options;

  if (verbose) {
    console.log('\n📊 Calculating Enablement metrics...\n');
  }

  // Cohort adoption (by month first used)
  const cohortAdoption = claudeEnterpriseMonthly.map((m, idx) => ({
    cohort: m.monthLabel,
    users: m.users,
    adoptionRate: idx === claudeEnterpriseMonthly.length - 1
      ? 100
      : Math.round((m.users / claudeEnterpriseActiveUsers) * 100)
  }));

  const enablementData = {
    trainingCompletion: 0, // Placeholder - not yet tracked
    supportTickets: 0, // Placeholder - not yet tracked
    adoptionByCohort: cohortAdoption,
    expansionPriorities: await calculateExpansionPriorities({
      m365Monthly,
      claudeEnterpriseMonthly,
      orgEmailMap,
      verbose: false
    })
  };

  if (verbose) {
    console.log(`✅ Enablement Metrics:`);
    console.log(`   - Expansion priorities: ${enablementData.expansionPriorities.length} departments`);
  }

  return enablementData;
}

module.exports = {
  aggregateEnablementData
};
