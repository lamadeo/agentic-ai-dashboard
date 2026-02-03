/**
 * Expansion Analyzer
 *
 * Analyzes expansion opportunities and prioritizes departments for AI tool rollout.
 * Calculates ROI for expanding licenses and identifies high-value expansion targets.
 *
 * Key Features:
 * - Department-level expansion opportunity analysis
 * - Premium vs Standard allocation recommendations
 * - Upgrade path analysis (Standard → Premium)
 * - Priority ranking by ROI
 * - Expansion prioritization by adoption gaps
 *
 * Dependencies: premium-allocation-processor (recommendLicenseAllocation)
 */

const { recommendLicenseAllocation } = require('./premium-allocation-processor');

/**
 * Calculate expansion opportunities by department
 * Uses actual usage patterns to identify who needs Premium vs Standard
 *
 * @param {Object} options - Configuration options
 * @param {Object} options.deptHeadcounts - Total employees per department { dept: count }
 * @param {Object} options.deptUserActivities - User activities by department { dept: activities[] }
 * @param {Object} options.currentAdoption - Current adoption { dept: { users, premium, standard } }
 * @param {Object} options.pricing - Pricing config { premium, standard }
 * @param {Function} options.getDepartmentValueMetrics - Function to get dept value metrics
 * @param {boolean} options.verbose - Enable detailed logging (default: false)
 * @returns {Promise<Object>} Expansion opportunities analysis
 */
async function analyzeExpansionOpportunities(options = {}) {
  const {
    deptHeadcounts = {},
    deptUserActivities = {},
    currentAdoption = {},
    pricing = {},
    getDepartmentValueMetrics,
    verbose = false
  } = options;

  if (verbose) {
    console.log('\n📊 Calculating Expansion ROI Opportunities...\n');
  }

  const opportunities = [];

  for (const [dept, totalEmployees] of Object.entries(deptHeadcounts)) {
    const current = currentAdoption[dept] || { users: 0, premium: 0, standard: 0 };
    const userActivities = deptUserActivities[dept] || [];

    // Get data-driven recommendation for Premium vs Standard allocation
    const recommendation = recommendLicenseAllocation(dept, userActivities, totalEmployees);

    const targetPremium = recommendation.recommendedPremium;
    const targetStandard = recommendation.recommendedStandard;

    // Get department-specific value metrics
    const valueMetrics = getDepartmentValueMetrics(dept);

    // Calculate gaps (how many more licenses needed)
    // Standard gap: only if we need MORE Standard licenses than we currently have
    const standardGap = Math.max(0, targetStandard - current.standard);

    // Premium additions needed (total, including conversions and new purchases)
    const premiumAdditionsNeeded = Math.max(0, targetPremium - current.premium);

    // Calculate how many Premium additions can come from converting excess Standard licenses
    const excessStandard = Math.max(0, current.standard - targetStandard);
    const upgradesToPremium = Math.min(excessStandard, premiumAdditionsNeeded);

    // Premium gap: NEW Premium licenses needed (not counting conversions from Standard)
    const premiumGap = premiumAdditionsNeeded - upgradesToPremium;

    const newPremium = premiumGap;
    const newStandard = standardGap;

    // Calculate monthly costs
    const upgradeCost = upgradesToPremium * (pricing.premium - pricing.standard);
    const newPremiumCost = newPremium * pricing.premium;
    const newStandardCost = newStandard * pricing.standard;
    const totalAdditionalCost = upgradeCost + newPremiumCost + newStandardCost;

    // Calculate value (hours saved × hourly rate)
    // Count value from BOTH new users AND upgraded users
    const totalCurrent = current.standard + current.premium;
    const totalTarget = targetStandard + targetPremium;
    const newUsers = Math.max(0, totalTarget - totalCurrent);

    // Value from NEW users (new Standard + new Premium)
    const newUsersValue = newUsers * valueMetrics.hoursPerUserPerMonth * valueMetrics.avgHourlyRate;

    // Value from UPGRADED users (Standard → Premium)
    // Premium users with Claude Code are 20.3x more productive than Standard users
    // Standard users get baseline productivity, Premium users get 20.3x boost
    // Assuming Standard = 10 hrs/month baseline, Premium with Code = 20 hrs/month
    // Incremental value = 10 additional hours per month from Claude Code access
    const incrementalHoursPerUpgrade = 10;
    const upgradesValue = upgradesToPremium * incrementalHoursPerUpgrade * valueMetrics.avgHourlyRate;

    // Total value = new users + upgrades
    const monthlyOpportunityCost = newUsersValue + upgradesValue;

    // Calculate ROI
    const netBenefit = monthlyOpportunityCost - totalAdditionalCost;
    const roi = totalAdditionalCost > 0 ? monthlyOpportunityCost / totalAdditionalCost : 0;

    // Build detail string for complex cases
    let detail = null;
    if (upgradesToPremium > 0 || (newPremium > 0 && newStandard > 0)) {
      const parts = [];
      if (newStandard > 0) {
        parts.push(`${newStandard} new Std ($${newStandard * pricing.standard})`);
      }
      if (upgradesToPremium > 0) {
        parts.push(`${upgradesToPremium} Std→Prem upgrades ($${upgradeCost})`);
      }
      if (newPremium > 0) {
        parts.push(`${newPremium} new Premium ($${newPremiumCost})`);
      }
      detail = parts.join(' + ') + ` = $${totalAdditionalCost.toLocaleString()}`;
    }

    opportunities.push({
      department: dept,
      totalEmployees,
      currentUsers: current.users,
      currentStandard: current.standard,
      currentPremium: current.premium,
      powerUsersNeeded: targetPremium,
      targetStandard,
      targetPremium,
      standardGap,
      premiumGap,
      upgradesNeeded: upgradesToPremium,
      newPremiumNeeded: newPremium,
      totalAdditionalCost,
      monthlyOpportunityCost,
      netBenefit,
      roi: parseFloat(roi.toFixed(1)),
      ...(detail && { detail }),
      // Include recommendation context for debugging/transparency
      _recommendationContext: {
        powerUsers: recommendation.powerUsers,
        activeUsers: recommendation.activeUsers,
        avgScore: Math.round(recommendation.averageScore)
      }
    });
  }

  // Sort by ROI descending (best opportunities first)
  const sortedOpportunities = opportunities.sort((a, b) => b.roi - a.roi);

  // Calculate totals
  const totalEmployees = Object.values(deptHeadcounts).reduce((sum, count) => sum + count, 0);
  const totalCurrentUsers = Object.values(currentAdoption).reduce((sum, d) => sum + d.users, 0);
  const totalCurrentPremium = Object.values(currentAdoption).reduce((sum, d) => sum + d.premium, 0);
  const totalCurrentStandard = Object.values(currentAdoption).reduce((sum, d) => sum + d.standard, 0);

  const totalNewStandard = sortedOpportunities.reduce((sum, opp) => sum + (opp.standardGap || 0), 0);
  const totalNewPremium = sortedOpportunities.reduce((sum, opp) => sum + (opp.newPremiumNeeded || 0), 0);
  const totalUpgrades = sortedOpportunities.reduce((sum, opp) => sum + (opp.upgradesNeeded || 0), 0);
  const totalAdditionalCost = sortedOpportunities.reduce((sum, opp) => sum + opp.totalAdditionalCost, 0);
  const totalOpportunityCost = sortedOpportunities.reduce((sum, opp) => sum + opp.monthlyOpportunityCost, 0);
  const totalNetBenefit = sortedOpportunities.reduce((sum, opp) => sum + opp.netBenefit, 0);

  if (verbose) {
    console.log(`✅ Expansion opportunities calculated for ${sortedOpportunities.length} departments`);
    console.log(`   Total employees: ${totalEmployees}`);
    console.log(`   Current users: ${totalCurrentUsers} (${totalCurrentPremium} Premium, ${totalCurrentStandard} Standard)`);
    console.log(`   Recommended additions: ${totalNewStandard + totalNewPremium + totalUpgrades} users`);
    console.log(`   - New Standard: ${totalNewStandard}`);
    console.log(`   - New Premium: ${totalNewPremium}`);
    console.log(`   - Upgrades to Premium: ${totalUpgrades}`);
    console.log(`   Total additional cost: $${totalAdditionalCost.toLocaleString()}/month`);
    console.log(`   Total opportunity value: $${totalOpportunityCost.toLocaleString()}/month`);
    console.log(`   Total net benefit: $${totalNetBenefit.toLocaleString()}/month`);
    console.log(`   Overall ROI: ${totalAdditionalCost > 0 ? (totalOpportunityCost / totalAdditionalCost).toFixed(1) : 0}x\n`);
  }

  return {
    // Opportunities sorted by ROI
    opportunities: sortedOpportunities,

    // Summary metrics
    summary: {
      totalDepartments: sortedOpportunities.length,
      totalEmployees,
      currentUsers: totalCurrentUsers,
      currentPremium: totalCurrentPremium,
      currentStandard: totalCurrentStandard,
      recommendedAdditions: totalNewStandard + totalNewPremium + totalUpgrades,
      newStandard: totalNewStandard,
      newPremium: totalNewPremium,
      upgrades: totalUpgrades,
      totalAdditionalCost,
      totalOpportunityCost,
      totalNetBenefit,
      overallROI: totalAdditionalCost > 0 ? parseFloat((totalOpportunityCost / totalAdditionalCost).toFixed(1)) : 0
    },

    // Metadata
    metadata: {
      analyzedAt: new Date().toISOString()
    }
  };
}

/**
 * Calculate expansion priorities based on adoption gaps
 * Identifies departments with low adoption rates (<70%) for targeted rollout
 *
 * @param {Object} options - Configuration options
 * @param {Array} options.m365Monthly - M365 Copilot monthly trend data
 * @param {Array} options.claudeEnterpriseMonthly - Claude Enterprise monthly trend data
 * @param {Map} options.orgEmailMap - Org hierarchy email mapping
 * @param {boolean} options.verbose - Enable detailed logging (default: false)
 * @returns {Promise<Array>} Priority departments for expansion
 */
async function calculateExpansionPriorities(options = {}) {
  const {
    m365Monthly = [],
    claudeEnterpriseMonthly = [],
    orgEmailMap = new Map(),
    verbose = false
  } = options;

  if (m365Monthly.length === 0 || !orgEmailMap || orgEmailMap.size === 0) {
    return [];
  }

  const latestM365 = m365Monthly[m365Monthly.length - 1];
  const latestClaude = claudeEnterpriseMonthly[claudeEnterpriseMonthly.length - 1];

  // Calculate adoption by department
  const deptStats = new Map();

  // Count total employees per department
  orgEmailMap.forEach((value, email) => {
    const dept = value.department;
    if (!deptStats.has(dept)) {
      deptStats.set(dept, {
        department: dept,
        totalEmployees: 0,
        activeUsers: 0,
        adoptionRate: 0
      });
    }
    deptStats.get(dept).totalEmployees++;
  });

  // Add active users from M365
  if (latestM365 && latestM365.byDept) {
    latestM365.byDept.forEach(dept => {
      if (deptStats.has(dept.department)) {
        deptStats.get(dept.department).activeUsers += dept.users;
      }
    });
  }

  // Add active users from Claude (avoid double counting)
  if (latestClaude && latestClaude.byDept) {
    latestClaude.byDept.forEach(dept => {
      if (deptStats.has(dept.department)) {
        // Rough estimate: add users (may overlap with M365)
        deptStats.get(dept.department).activeUsers += Math.floor(dept.users * 0.5);
      }
    });
  }

  // Calculate adoption rates
  deptStats.forEach(dept => {
    dept.adoptionRate = dept.totalEmployees > 0
      ? Math.round((dept.activeUsers / dept.totalEmployees) * 100)
      : 0;
  });

  // Return departments with <70% adoption, sorted by employee count
  const priorities = Array.from(deptStats.values())
    .filter(dept => dept.adoptionRate < 70 && dept.totalEmployees >= 5)
    .sort((a, b) => b.totalEmployees - a.totalEmployees)
    .slice(0, 5)
    .map(dept => ({
      department: dept.department,
      currentAdoption: dept.adoptionRate,
      targetAdoption: 80,
      priority: dept.adoptionRate < 40 ? 'high' : dept.adoptionRate < 60 ? 'medium' : 'low',
      potentialUsers: Math.floor(dept.totalEmployees * 0.8) - dept.activeUsers
    }));

  if (verbose && priorities.length > 0) {
    console.log('\n📊 Expansion Priorities (Low Adoption Departments):');
    priorities.forEach(p => {
      console.log(`   - ${p.department}: ${p.currentAdoption}% adoption (${p.priority} priority)`);
    });
  }

  return priorities;
}

module.exports = {
  analyzeExpansionOpportunities,
  calculateExpansionPriorities
};
