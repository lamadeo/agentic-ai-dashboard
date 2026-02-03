/**
 * ROI Calculator
 *
 * Calculates Return on Investment (ROI) for current state and expansion scenarios.
 * Includes incremental ROI calculations for migration paths and industry benchmarking.
 *
 * Key Features:
 * - Current state ROI (actual licensed users)
 * - Incremental ROI scenarios (GitHub → Claude Code, M365 → Claude Enterprise)
 * - Industry benchmark comparisons
 * - Department-specific value calculations
 *
 * Dependencies: ROI configuration, productivity metrics
 */

/**
 * Aggregate M365 Copilot benchmarks across all roles
 * Combines studies from all roles and calculates weighted statistics
 *
 * @param {Object} roiConfig - ROI configuration from roi_config.json
 * @returns {Object|null} Aggregated benchmark data or null if no benchmarks available
 * @private
 */
function aggregateM365Benchmarks(roiConfig) {
  const m365Benchmarks = roiConfig.industryBenchmarks?.m365Copilot;
  if (!m365Benchmarks) {
    return null;
  }

  // Collect all studies from all roles (excluding 'default')
  const allStudies = [];
  const allSources = [];
  const roles = ['software_engineer', 'sales', 'marketing', 'customer_success'];

  roles.forEach(role => {
    const roleBenchmark = m365Benchmarks[role];
    if (roleBenchmark && roleBenchmark.sources && roleBenchmark.sources.length > 0) {
      // For each source, reconstruct the study data for weighted calculation
      roleBenchmark.sources.forEach(source => {
        // Only include if we have a valid hoursSavedPerMonth value
        const hoursSaved = typeof source.findingHours === 'number'
          ? source.findingHours
          : (typeof source.findingHours === 'string' && source.findingHours.includes('~')
              ? parseFloat(source.findingHours.replace('~', '').split('-')[0])
              : null);

        if (hoursSaved && source.sampleSize) {
          allStudies.push({
            title: source.title,
            author: source.author,
            year: source.year,
            sampleSize: typeof source.sampleSize === 'number' ? source.sampleSize : parseInt(source.sampleSize),
            hoursSavedPerMonth: hoursSaved,
            url: source.url,
            role: role
          });
        }

        // Add to combined sources (for citation)
        allSources.push({
          ...source,
          role: role
        });
      });
    }
  });

  if (allStudies.length === 0) {
    return null;
  }

  // Calculate weighted mean across all studies
  const currentYear = new Date().getFullYear();
  const studiesWithWeights = allStudies.map(study => {
    // Recency factor: exponential decay with 2-year half-life
    const ageInYears = currentYear - study.year;
    const recencyFactor = Math.exp(-ageInYears / 2);

    // Credibility factor based on author
    let credibilityFactor = 0.5;
    const author = study.author.toLowerCase();
    if (author.includes('forrester') || author.includes('gartner')) {
      credibilityFactor = 1.2;
    } else if (author.includes('academic') || author.includes('university')) {
      credibilityFactor = 1.1;
    } else if (author.includes('microsoft') || author.includes('github') || author.includes('openai')) {
      credibilityFactor = 0.8; // Vendor studies - potential bias
    }

    // Sample size factor (normalize to 1000)
    const sampleSizeFactor = study.sampleSize / 1000;

    // Combined weight
    const weight = sampleSizeFactor * recencyFactor * credibilityFactor;

    return { ...study, weight };
  });

  // Calculate weighted mean
  const totalWeight = studiesWithWeights.reduce((sum, s) => sum + s.weight, 0);
  const weightedMean = studiesWithWeights.reduce((sum, s) =>
    sum + (s.hoursSavedPerMonth * s.weight), 0
  ) / totalWeight;

  // Calculate variance for confidence assessment
  const mean = allStudies.reduce((sum, s) => sum + s.hoursSavedPerMonth, 0) / allStudies.length;
  const variance = allStudies.reduce((sum, s) =>
    sum + Math.pow(s.hoursSavedPerMonth - mean, 2), 0
  ) / allStudies.length;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / mean;

  // Calculate confidence interval
  const standardError = stdDev / Math.sqrt(allStudies.length);
  const marginOfError = 1.96 * standardError;
  const confidenceInterval = [
    Math.max(0, weightedMean - marginOfError),
    weightedMean + marginOfError
  ];

  // Determine confidence level
  let confidenceLevel = 'high';
  let lowConfidence = false;
  if (allStudies.length < 3 || cv > 0.6) {
    confidenceLevel = 'low';
    lowConfidence = true;
  } else if (allStudies.length < 5 || cv > 0.4) {
    confidenceLevel = 'medium';
  }

  const totalSampleSize = allStudies.reduce((sum, s) => sum + s.sampleSize, 0);

  return {
    hoursSavedPerMonth: Math.round(weightedMean * 10) / 10,
    confidenceInterval: [
      Math.round(confidenceInterval[0] * 10) / 10,
      Math.round(confidenceInterval[1] * 10) / 10
    ],
    confidenceLevel,
    lowConfidence,
    coefficientOfVariation: Math.round(cv * 100) / 100,
    studyCount: allStudies.length,
    totalSampleSize,
    aggregationMethod: 'weighted_mean_across_roles',
    sources: allSources
  };
}

/**
 * Calculate ROI metrics
 *
 * @param {Object} options - Configuration options
 * @param {Object} options.productivityMetrics - Productivity metrics from productivity calculator
 * @param {Object} options.currentAdoption - Current adoption by department { dept: { users, premium, standard } }
 * @param {Object} options.pricing - Pricing configuration { premium, standard, m365Copilot, githubCopilot }
 * @param {Object} options.roiConfig - ROI configuration from roi_config.json
 * @param {Object} options.m365MonthlyData - M365 Copilot monthly trend data
 * @param {Object} options.claudeEnterpriseMonthly - Claude Enterprise monthly trend data
 * @param {boolean} options.verbose - Enable detailed logging (default: true)
 * @returns {Promise<Object>} ROI calculations for current state and incremental scenarios
 */
async function calculateROI(options = {}) {
  const {
    productivityMetrics = {},
    currentAdoption = {},
    pricing = {},
    roiConfig = {},
    m365MonthlyData = [],
    claudeEnterpriseMonthly = [],
    verbose = true
  } = options;

  if (verbose) {
    console.log('\n💰 Calculating Incremental ROI...\n');
  }

  const {
    productivityMultiplier,
    claudeCodeHoursSaved,
    baselineHoursSaved,
    conservativeFactor,
    engineering,
    getDepartmentValueMetrics
  } = productivityMetrics;

  /**
   * Calculate incremental ROI for GitHub Copilot → Claude Code Premium scenario
   * @private
   */
  function calculateGitHubToClaudeCodeIncrementalROI() {
    // GitHub Copilot baseline hours (derived from Claude Code hours and productivity multiplier)
    // Formula: CLAUDE_CODE_HOURS_SAVED / (multiplier / conservativeFactor)
    const githubCopilotBaselineHours = Math.round(claudeCodeHoursSaved / (productivityMultiplier / conservativeFactor));

    // Incremental metrics (data-driven) - shared values
    const incrementalHours = claudeCodeHoursSaved - githubCopilotBaselineHours;
    const incrementalValue = Math.round(incrementalHours * engineering.hourlyRate);

    // REPLACEMENT SCENARIO: Cancel GitHub ($19), Add Claude Code ($200) = Net $181
    const replacementCost = roiConfig.pricing.claudeCodePremium - roiConfig.pricing.githubCopilot;
    const replacementROI = replacementCost > 0 ? parseFloat((incrementalValue / replacementCost).toFixed(1)) : 0;

    // ADDITIVE SCENARIO: Keep GitHub ($19) + Add Claude Code ($200) = $200 incremental cost
    const additiveCost = roiConfig.pricing.claudeCodePremium;
    const additiveROI = additiveCost > 0 ? parseFloat((incrementalValue / additiveCost).toFixed(1)) : 0;

    // Industry benchmark ROI (if available)
    const industryGHBenchmark = roiConfig.industryBenchmarks?.githubCopilot?.software_engineer;
    let benchmarkReplacementROI = null;
    let benchmarkAdditiveROI = null;
    let benchmarkIncrementalHours = null;
    let benchmarkIncrementalValue = null;

    if (industryGHBenchmark && industryGHBenchmark.hoursSavedPerMonth) {
      benchmarkIncrementalHours = claudeCodeHoursSaved - industryGHBenchmark.hoursSavedPerMonth;
      benchmarkIncrementalValue = Math.round(benchmarkIncrementalHours * engineering.hourlyRate);
      benchmarkReplacementROI = replacementCost > 0 ? parseFloat((benchmarkIncrementalValue / replacementCost).toFixed(1)) : 0;
      benchmarkAdditiveROI = additiveCost > 0 ? parseFloat((benchmarkIncrementalValue / additiveCost).toFixed(1)) : 0;
    }

    // Calculate deltas
    const replacementDelta = benchmarkReplacementROI ? replacementROI - benchmarkReplacementROI : null;
    const replacementDeltaPercent = benchmarkReplacementROI && benchmarkReplacementROI > 0
      ? Math.round((replacementDelta / benchmarkReplacementROI) * 100)
      : null;

    const additiveDelta = benchmarkAdditiveROI ? additiveROI - benchmarkAdditiveROI : null;
    const additiveDeltaPercent = benchmarkAdditiveROI && benchmarkAdditiveROI > 0
      ? Math.round((additiveDelta / benchmarkAdditiveROI) * 100)
      : null;

    return {
      scenario: 'GitHub Copilot → Claude Code Premium',
      type: 'gh_to_premium',
      baselineHours: githubCopilotBaselineHours,
      baselineCost: roiConfig.pricing.githubCopilot,
      currentHours: claudeCodeHoursSaved,
      currentCost: roiConfig.pricing.claudeCodePremium,
      incrementalHours,
      incrementalValue,
      hourlyRate: engineering.hourlyRate,
      replacement: {
        incrementalCost: replacementCost,
        incrementalROI: replacementROI,
        industryBenchmark: benchmarkReplacementROI ? {
          incrementalROI: benchmarkReplacementROI,
          incrementalHours: benchmarkIncrementalHours,
          incrementalValue: benchmarkIncrementalValue
        } : null,
        roiComparison: {
          delta: replacementDelta,
          deltaPercent: replacementDeltaPercent
        }
      },
      additive: {
        incrementalCost: additiveCost,
        incrementalROI: additiveROI,
        industryBenchmark: benchmarkAdditiveROI ? {
          incrementalROI: benchmarkAdditiveROI,
          incrementalHours: benchmarkIncrementalHours,
          incrementalValue: benchmarkIncrementalValue
        } : null,
        roiComparison: {
          delta: additiveDelta,
          deltaPercent: additiveDeltaPercent
        }
      },
      industryBenchmark: benchmarkReplacementROI ? {
        baselineHours: industryGHBenchmark.hoursSavedPerMonth,
        baselineCost: roiConfig.pricing.githubCopilot,
        currentHours: claudeCodeHoursSaved,
        currentCost: roiConfig.pricing.claudeCodePremium,
        confidenceLevel: industryGHBenchmark.confidenceLevel,
        lowConfidence: industryGHBenchmark.lowConfidence,
        studyCount: industryGHBenchmark.studyCount,
        sources: industryGHBenchmark.sources || []
      } : null
    };
  }

  /**
   * Calculate incremental ROI for M365 Copilot → Claude Enterprise Standard scenario
   * @private
   */
  function calculateM365ToClaudeEnterpriseIncrementalROI() {
    // Calculate M365 baseline from monthly trend data (data-driven approach)
    const latestM365Month = m365MonthlyData && m365MonthlyData.length > 0
      ? m365MonthlyData[m365MonthlyData.length - 1]
      : null;
    const m365PromptsPerUser = latestM365Month && latestM365Month.promptsPerUser
      ? latestM365Month.promptsPerUser
      : 0;

    const claudeMessagesPerUser = claudeEnterpriseMonthly.length > 0
      ? Math.round(claudeEnterpriseMonthly[claudeEnterpriseMonthly.length - 1].messages / claudeEnterpriseMonthly[claudeEnterpriseMonthly.length - 1].users)
      : 0;

    // Productivity ratio (prompt equivalency = 1, per roi_config.json)
    const productivityRatio = m365PromptsPerUser > 0 ? claudeMessagesPerUser / m365PromptsPerUser : 1.0;

    // M365 baseline hours (data-driven: conservative estimate)
    const m365BaselineHours = baselineHoursSaved;
    const claudeEnterpriseHours = Math.round(baselineHoursSaved * productivityRatio);

    // Incremental metrics (data-driven) - shared values
    const incrementalHours = claudeEnterpriseHours - m365BaselineHours;
    const incrementalValue = Math.round(incrementalHours * roiConfig.generalMetrics.avgHourlyRate);

    // REPLACEMENT SCENARIO: Cancel M365 ($30), Add Claude ($40) = Net $10
    const replacementCost = roiConfig.pricing.claudeEnterpriseStandard - roiConfig.pricing.m365Copilot;
    const replacementROI = replacementCost > 0 ? parseFloat((incrementalValue / replacementCost).toFixed(1)) : 0;

    // ADDITIVE SCENARIO: Keep M365 ($30) + Add Claude ($40) = $40 incremental cost
    const additiveCost = roiConfig.pricing.claudeEnterpriseStandard;
    const additiveROI = additiveCost > 0 ? parseFloat((incrementalValue / additiveCost).toFixed(1)) : 0;

    // Industry benchmark ROI (aggregate across all M365 roles)
    const industryM365Benchmark = aggregateM365Benchmarks(roiConfig);

    let benchmarkReplacementROI = null;
    let benchmarkAdditiveROI = null;
    let benchmarkIncrementalHours = null;
    let benchmarkIncrementalValue = null;

    if (industryM365Benchmark && industryM365Benchmark.hoursSavedPerMonth) {
      benchmarkIncrementalHours = claudeEnterpriseHours - industryM365Benchmark.hoursSavedPerMonth;
      benchmarkIncrementalValue = Math.round(benchmarkIncrementalHours * roiConfig.generalMetrics.avgHourlyRate);
      benchmarkReplacementROI = replacementCost > 0 ? parseFloat((benchmarkIncrementalValue / replacementCost).toFixed(1)) : 0;
      benchmarkAdditiveROI = additiveCost > 0 ? parseFloat((benchmarkIncrementalValue / additiveCost).toFixed(1)) : 0;
    }

    // Calculate deltas
    const replacementDelta = benchmarkReplacementROI ? replacementROI - benchmarkReplacementROI : null;
    const replacementDeltaPercent = benchmarkReplacementROI && benchmarkReplacementROI > 0
      ? Math.round((replacementDelta / benchmarkReplacementROI) * 100)
      : null;

    const additiveDelta = benchmarkAdditiveROI ? additiveROI - benchmarkAdditiveROI : null;
    const additiveDeltaPercent = benchmarkAdditiveROI && benchmarkAdditiveROI > 0
      ? Math.round((additiveDelta / benchmarkAdditiveROI) * 100)
      : null;

    // Collect Claude Enterprise sources from all roles for citation
    const claudeEnterpriseBenchmarks = roiConfig.industryBenchmarks?.claudeEnterprise;
    const claudeEnterpriseSources = [];
    if (claudeEnterpriseBenchmarks) {
      const roles = ['software_engineer', 'sales', 'marketing', 'customer_success'];
      roles.forEach(role => {
        const roleBenchmark = claudeEnterpriseBenchmarks[role];
        if (roleBenchmark && roleBenchmark.sources && roleBenchmark.sources.length > 0) {
          roleBenchmark.sources.forEach(source => {
            // Avoid duplicates by checking title
            if (!claudeEnterpriseSources.find(s => s.title === source.title)) {
              claudeEnterpriseSources.push({
                ...source,
                role: role
              });
            }
          });
        }
      });
    }

    return {
      scenario: 'M365 Copilot → Claude Enterprise Standard',
      type: 'm365_to_standard',
      baselineHours: m365BaselineHours,
      baselineCost: roiConfig.pricing.m365Copilot,
      currentHours: claudeEnterpriseHours,
      currentCost: roiConfig.pricing.claudeEnterpriseStandard,
      incrementalHours,
      incrementalValue,
      productivityRatio: parseFloat(productivityRatio.toFixed(2)),
      m365PromptsPerUser,
      claudeMessagesPerUser,
      hourlyRate: roiConfig.generalMetrics.avgHourlyRate,
      replacement: {
        incrementalCost: replacementCost,
        incrementalROI: replacementROI,
        industryBenchmark: benchmarkReplacementROI ? {
          incrementalROI: benchmarkReplacementROI,
          incrementalHours: benchmarkIncrementalHours,
          incrementalValue: benchmarkIncrementalValue
        } : null,
        roiComparison: {
          delta: replacementDelta,
          deltaPercent: replacementDeltaPercent
        }
      },
      additive: {
        incrementalCost: additiveCost,
        incrementalROI: additiveROI,
        industryBenchmark: benchmarkAdditiveROI ? {
          incrementalROI: benchmarkAdditiveROI,
          incrementalHours: benchmarkIncrementalHours,
          incrementalValue: benchmarkIncrementalValue
        } : null,
        roiComparison: {
          delta: additiveDelta,
          deltaPercent: additiveDeltaPercent
        }
      },
      industryBenchmark: benchmarkReplacementROI ? {
        baselineHours: industryM365Benchmark.hoursSavedPerMonth,
        baselineCost: roiConfig.pricing.m365Copilot,
        currentHours: claudeEnterpriseHours,
        currentCost: roiConfig.pricing.claudeEnterpriseStandard,
        confidenceLevel: industryM365Benchmark.confidenceLevel,
        lowConfidence: industryM365Benchmark.lowConfidence,
        studyCount: industryM365Benchmark.studyCount,
        totalSampleSize: industryM365Benchmark.totalSampleSize,
        hoursSavedPerMonth: industryM365Benchmark.hoursSavedPerMonth,
        confidenceInterval: industryM365Benchmark.confidenceInterval,
        coefficientOfVariation: industryM365Benchmark.coefficientOfVariation,
        aggregationMethod: industryM365Benchmark.aggregationMethod,
        sources: industryM365Benchmark.sources || []
      } : null,
      claudeEnterpriseSources
    };
  }

  // Calculate incremental ROI scenarios
  const githubToClaudeCodeROI = calculateGitHubToClaudeCodeIncrementalROI();
  const m365ToClaudeEnterpriseROI = calculateM365ToClaudeEnterpriseIncrementalROI();

  // Calculate current state ROI
  if (verbose) {
    console.log('\n📊 Calculating Current State ROI...\n');
  }

  const totalCurrentUsers = Object.values(currentAdoption).reduce((sum, d) => sum + d.users, 0);
  const totalCurrentPremium = Object.values(currentAdoption).reduce((sum, d) => sum + d.premium, 0);
  const totalCurrentStandard = Object.values(currentAdoption).reduce((sum, d) => sum + d.standard, 0);

  // Calculate current license costs
  const currentPremiumCost = totalCurrentPremium * pricing.premium;
  const currentStandardCost = totalCurrentStandard * pricing.standard;
  const currentTotalCost = currentPremiumCost + currentStandardCost;

  if (verbose) {
    console.log(`💰 Current License Costs:`);
    console.log(`   Premium: ${totalCurrentPremium} seats × $${pricing.premium}/mo = $${currentPremiumCost.toLocaleString()}/mo`);
    console.log(`   Standard: ${totalCurrentStandard} seats × $${pricing.standard}/mo = $${currentStandardCost.toLocaleString()}/mo`);
    console.log(`   Total: $${currentTotalCost.toLocaleString()}/month\n`);
  }

  // Calculate actual productivity value from current Claude users
  let currentStateValue = 0;
  Object.entries(currentAdoption).forEach(([dept, adoption]) => {
    const deptMetrics = getDepartmentValueMetrics(dept);
    const deptValue = adoption.users * deptMetrics.hoursPerUserPerMonth * deptMetrics.avgHourlyRate;
    currentStateValue += deptValue;
    if (verbose) {
      console.log(`   ${dept}: ${adoption.users} users × ${deptMetrics.hoursPerUserPerMonth} hrs × $${deptMetrics.avgHourlyRate}/hr = $${Math.round(deptValue).toLocaleString()}/mo`);
    }
  });

  const currentNetBenefit = currentStateValue - currentTotalCost;
  const currentROI = currentTotalCost > 0 ? (currentStateValue / currentTotalCost).toFixed(1) : 0;

  if (verbose) {
    console.log(`\n✅ Current State ROI Summary:`);
    console.log(`   Current licensed users: ${totalCurrentUsers} (${totalCurrentPremium} Premium, ${totalCurrentStandard} Standard)`);
    console.log(`   Current monthly cost: $${currentTotalCost.toLocaleString()}`);
    console.log(`   Current monthly value: $${Math.round(currentStateValue).toLocaleString()}`);
    console.log(`   Current net benefit: $${Math.round(currentNetBenefit).toLocaleString()}/month`);
    console.log(`   Current ROI: ${currentROI}x\n`);
  }

  return {
    // Current state ROI
    currentState: {
      licensedUsers: totalCurrentUsers,
      premiumSeats: totalCurrentPremium,
      standardSeats: totalCurrentStandard,
      monthlyCost: currentTotalCost,
      monthlyValue: Math.round(currentStateValue),
      netBenefit: Math.round(currentNetBenefit),
      roi: parseFloat(currentROI),
      costs: {
        premium: currentPremiumCost,
        standard: currentStandardCost,
        total: currentTotalCost
      },
      value: {
        hoursSaved: Math.round(currentStateValue / roiConfig.generalMetrics.avgHourlyRate),
        netBenefit: Math.round(currentNetBenefit)
      },
      pricing: {
        premiumPerSeat: pricing.premium,
        standardPerSeat: pricing.standard
      }
    },

    // Incremental ROI scenarios
    incrementalROI: {
      githubToClaudeCode: githubToClaudeCodeROI,
      m365ToClaudeEnterprise: m365ToClaudeEnterpriseROI
    },

    // Metadata
    metadata: {
      calculatedAt: new Date().toISOString()
    }
  };
}

module.exports = {
  calculateROI,
  // Export helper functions for testing/reuse
  aggregateM365Benchmarks
};
