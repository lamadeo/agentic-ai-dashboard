/**
 * Productivity Calculator
 *
 * Calculates productivity multipliers, hours saved, and value metrics
 * by comparing code generation tools (GitHub Copilot vs Claude Code).
 *
 * Key Features:
 * - Productivity multiplier calculation (lines/user comparison)
 * - Hours saved per user/month (engineering vs non-engineering)
 * - Department-specific value metrics
 * - ROI value calculations
 *
 * Dependencies: ROI configuration (roiConfig)
 */

/**
 * Calculate productivity multiplier and value metrics
 *
 * @param {Object} options - Configuration options
 * @param {Object} options.githubCopilotData - GitHub Copilot productivity data
 * @param {number} options.githubCopilotData.linesPerUser - Average lines per user
 * @param {number} options.githubCopilotData.activeUsers - Number of active users
 * @param {number} options.githubCopilotData.totalLines - Total lines generated
 * @param {Object} options.claudeCodeData - Claude Code productivity data
 * @param {number} options.claudeCodeData.linesPerUser - Average lines per user
 * @param {number} options.claudeCodeData.activeUsers - Number of active users
 * @param {number} options.claudeCodeData.totalLines - Total lines generated
 * @param {Object} options.roiConfig - ROI configuration from roi_config.json
 * @param {boolean} options.verbose - Enable detailed logging (default: true)
 * @returns {Promise<Object>} Productivity metrics and value calculations
 */
async function calculateProductivityMetrics(options = {}) {
  const {
    githubCopilotData = {},
    claudeCodeData = {},
    roiConfig = {},
    verbose = true
  } = options;

  // Calculate productivity multiplier from coding tools comparison
  const productivityMultiplier = githubCopilotData.linesPerUser > 0
    ? claudeCodeData.linesPerUser / githubCopilotData.linesPerUser
    : 0;

  if (verbose) {
    console.log(`\n💡 Productivity Multiplier Calculation (Claude Code vs GitHub Copilot):`);
    console.log(`   - GitHub Copilot: ${githubCopilotData.linesPerUser.toLocaleString()} lines/user`);
    console.log(`   - Claude Code: ${claudeCodeData.linesPerUser.toLocaleString()} lines/user`);
    console.log(`   - Multiplier: ${productivityMultiplier.toFixed(1)}x`);
  }

  // Engineering-specific value metrics (from roi_config.json + derived from productivity data)
  const engineerAnnualSalary = roiConfig.engineeringMetrics?.annualSalary || 150000;
  const hoursPerYear = roiConfig.engineeringMetrics?.hoursPerYear || 2080;
  const engineerHourlyRate = roiConfig.engineeringMetrics?.hourlyRate || 72;

  // Time savings constants
  const BASELINE_HOURS_SAVED = roiConfig.assumptions?.baselineHoursSaved || 11;
  const conservativeFactor = roiConfig.assumptions?.productivityMultiplierConservativeFactor || 2;
  const CLAUDE_CODE_HOURS_SAVED = Math.round(BASELINE_HOURS_SAVED * (productivityMultiplier / conservativeFactor));

  if (verbose) {
    console.log(`\n💰 Engineering Value Calculation:`);
    console.log(`   - Baseline hours saved: ${BASELINE_HOURS_SAVED} hrs/user/month (non-engineering)`);
    console.log(`   - Claude Code hours saved: ${CLAUDE_CODE_HOURS_SAVED} hrs/user/month (with ${productivityMultiplier.toFixed(1)}x multiplier)`);
    console.log(`   - Engineer hourly rate: $${Math.round(engineerHourlyRate)}/hour`);
    console.log(`   - Value per engineer per month: $${Math.round(CLAUDE_CODE_HOURS_SAVED * engineerHourlyRate).toLocaleString()}`);
    console.log(`   - Annual value per engineer: $${Math.round(CLAUDE_CODE_HOURS_SAVED * engineerHourlyRate * 12).toLocaleString()}`);
  }

  /**
   * Get department-specific value metrics
   * @param {string} department - Department name
   * @returns {Object} Value metrics for the department
   */
  function getDepartmentValueMetrics(department) {
    // Engineering departments get Claude Code productivity metrics
    if (department === 'Engineering' || department === 'Product' || department.includes('Engineering')) {
      return {
        hoursPerUserPerMonth: CLAUDE_CODE_HOURS_SAVED,
        avgHourlyRate: Math.round(engineerHourlyRate),
        productivityMultiplier: productivityMultiplier,
        dataSource: 'Derived from Claude Code vs GitHub Copilot productivity comparison'
      };
    }

    // Default for other departments (baseline from roi_config.json)
    return {
      hoursPerUserPerMonth: BASELINE_HOURS_SAVED,
      avgHourlyRate: roiConfig.generalMetrics?.avgHourlyRate || 77,
      productivityMultiplier: 1.0,
      dataSource: 'Baseline estimate for non-engineering departments'
    };
  }

  return {
    // Productivity metrics
    productivityMultiplier,
    baselineHoursSaved: BASELINE_HOURS_SAVED,
    claudeCodeHoursSaved: CLAUDE_CODE_HOURS_SAVED,
    conservativeFactor,

    // Engineering metrics
    engineering: {
      hourlyRate: engineerHourlyRate,
      annualSalary: engineerAnnualSalary,
      hoursPerYear,
      valuePerMonth: Math.round(CLAUDE_CODE_HOURS_SAVED * engineerHourlyRate),
      valuePerYear: Math.round(CLAUDE_CODE_HOURS_SAVED * engineerHourlyRate * 12)
    },

    // General metrics
    general: {
      hourlyRate: roiConfig.generalMetrics?.avgHourlyRate || 77,
      valuePerMonth: Math.round(BASELINE_HOURS_SAVED * (roiConfig.generalMetrics?.avgHourlyRate || 77)),
      valuePerYear: Math.round(BASELINE_HOURS_SAVED * (roiConfig.generalMetrics?.avgHourlyRate || 77) * 12)
    },

    // Helper function for department-specific metrics
    getDepartmentValueMetrics,

    // Raw data for reference
    githubCopilot: githubCopilotData,
    claudeCode: claudeCodeData,

    // Metadata
    metadata: {
      calculatedAt: new Date().toISOString()
    }
  };
}

/**
 * Calculate Agentic FTEs from productivity gains
 *
 * Translates AI productivity hours into "Virtual Full-Time Equivalents" - showing
 * how many additional team members AI tools have effectively added to the organization.
 *
 * @param {Object} options - Configuration options
 * @param {Object} options.productivityData - Productivity time savings data
 * @param {number} options.productivityData.totalTimeSaved - Total hours saved across all tools
 * @param {Object} options.productivityData.timeSavingsByTool - Hours saved per tool
 * @param {Object} options.codingData - Coding productivity data
 * @param {Object} options.codingData.claudeCode - Claude Code monthly data
 * @param {number} options.codingData.claudeCode.linesAccepted - Lines of code accepted
 * @param {Object} options.codingData.githubCopilot - GitHub Copilot monthly data
 * @param {number} options.codingData.githubCopilot.linesAccepted - Lines of code accepted
 * @param {Object} options.config - Configuration constants
 * @param {number} options.config.monthlyFTEHours - Standard FTE hours per month (default: 173)
 * @param {number} options.config.hoursPerLine - Hours saved per line of code (default: 0.08)
 * @param {boolean} options.verbose - Enable detailed logging (default: true)
 * @returns {Object} Agentic FTE metrics with per-tool breakdown
 */
function calculateAgenticFTEs(options = {}) {
  const {
    productivityData = {},
    codingData = {},
    config = {},
    verbose = true
  } = options;

  // Configuration constants
  const MONTHLY_FTE_HOURS = config.monthlyFTEHours || 173; // 40 hrs/week × 52 weeks ÷ 12 months
  const HOURS_PER_LINE = config.hoursPerLine || 0.08; // 5 minutes per line saved (moderate estimate)

  // Extract productivity hours (knowledge work)
  const productivityHours = productivityData.totalTimeSaved || 0;
  const timeSavingsByTool = productivityData.timeSavingsByTool || {};

  // Extract coding data
  const claudeCodeLines = codingData.claudeCode?.linesAccepted || 0;
  const githubCopilotLines = codingData.githubCopilot?.linesAccepted || 0;
  const totalCodingLines = claudeCodeLines + githubCopilotLines;

  // Calculate coding hours
  const codingHours = totalCodingLines * HOURS_PER_LINE;

  // Total hours saved
  const totalHours = productivityHours + codingHours;

  // Calculate Agentic FTEs
  const agenticFTEs = totalHours / MONTHLY_FTE_HOURS;

  if (verbose) {
    console.log(`\n👥 Agentic FTE Calculation:`);
    console.log(`   Productivity hours (knowledge work): ${productivityHours.toLocaleString()} hrs`);
    console.log(`   Coding hours (${totalCodingLines.toLocaleString()} lines × ${HOURS_PER_LINE} hrs/line): ${codingHours.toLocaleString()} hrs`);
    console.log(`   Total productive hours: ${totalHours.toLocaleString()} hrs`);
    console.log(`   Monthly FTE hours: ${MONTHLY_FTE_HOURS} hrs`);
    console.log(`   Agentic FTEs: ${agenticFTEs.toFixed(1)} FTEs`);
    console.log(`   → Equivalent to adding ${Math.floor(agenticFTEs)} full-time team members\n`);
  }

  // Per-tool breakdown
  const breakdown = {
    claudeEnterprise: {
      hours: timeSavingsByTool.claudeEnterprise || 0,
      ftes: (timeSavingsByTool.claudeEnterprise || 0) / MONTHLY_FTE_HOURS,
      source: 'productivity'
    },
    claudeCode: {
      hours: claudeCodeLines * HOURS_PER_LINE,
      ftes: (claudeCodeLines * HOURS_PER_LINE) / MONTHLY_FTE_HOURS,
      linesOfCode: claudeCodeLines,
      source: 'coding'
    },
    m365Copilot: {
      hours: timeSavingsByTool.m365Copilot || 0,
      ftes: (timeSavingsByTool.m365Copilot || 0) / MONTHLY_FTE_HOURS,
      source: 'productivity'
    },
    githubCopilot: {
      hours: githubCopilotLines * HOURS_PER_LINE,
      ftes: (githubCopilotLines * HOURS_PER_LINE) / MONTHLY_FTE_HOURS,
      linesOfCode: githubCopilotLines,
      source: 'coding'
    }
  };

  // Validation: Check for unreasonable ratios
  const totalLicensedUsers = (codingData.totalLicensedUsers || 100); // Fallback to avoid division by zero
  const ratio = agenticFTEs / totalLicensedUsers;

  if (ratio > 20) {
    console.error(`⚠️  WARNING: Agentic FTE ratio (${ratio.toFixed(1)}x) exceeds reasonable bounds - check data quality`);
  } else if (ratio > 10) {
    console.warn(`⚠️  NOTICE: Agentic FTE ratio (${ratio.toFixed(1)}x) is unusually high - validate data sources`);
  }

  return {
    totalAgenticFTEs: parseFloat(agenticFTEs.toFixed(1)),
    totalProductiveHours: Math.round(totalHours),
    breakdown,
    calculation: {
      productivityHours: Math.round(productivityHours),
      codingHours: Math.round(codingHours),
      totalHours: Math.round(totalHours),
      monthlyFTEHours: MONTHLY_FTE_HOURS,
      hoursPerLineOfCode: HOURS_PER_LINE,
      totalLinesOfCode: totalCodingLines
    },
    validation: {
      ratio: parseFloat(ratio.toFixed(2)),
      totalLicensedUsers,
      status: ratio > 20 ? 'error' : ratio > 10 ? 'warning' : 'ok'
    },
    metadata: {
      calculatedAt: new Date().toISOString(),
      version: '1.0.0'
    }
  };
}

/**
 * Calculate monthly Agentic FTEs from monthly trend data
 *
 * Processes monthly trend data for all tools and calculates Agentic FTEs per month,
 * showing how virtual workforce capacity has grown over time.
 *
 * @param {Object} options - Configuration options
 * @param {Array} options.claudeEnterpriseMonthly - CE monthly trend data with users
 * @param {Array} options.claudeCodeMonthly - CC monthly trend data with users and totalLines
 * @param {Array} options.m365CopilotMonthly - M365 monthly trend data with users
 * @param {Array} options.githubCopilotMonthly - GH monthly trend data with users and totalLines
 * @param {Object} options.config - Configuration constants
 * @param {number} options.config.monthlyFTEHours - Standard FTE hours per month (default: 173)
 * @param {number} options.config.hoursPerLine - Hours saved per line of code (default: 0.08)
 * @param {Object} options.config.timeSavings - Time savings percentages per tool
 * @param {boolean} options.verbose - Enable detailed logging (default: true)
 * @returns {Array} Monthly Agentic FTE data with per-tool breakdown
 */
function calculateMonthlyAgenticFTEs(options = {}) {
  const {
    claudeEnterpriseMonthly = [],
    claudeCodeMonthly = [],
    m365CopilotMonthly = [],
    githubCopilotMonthly = [],
    config = {},
    verbose = true
  } = options;

  // Configuration constants
  const MONTHLY_FTE_HOURS = config.monthlyFTEHours || 173;
  const HOURS_PER_LINE = config.hoursPerLine || 0.08;
  const TIME_SAVINGS = config.timeSavings || {
    claudeEnterprise: 0.28,
    m365Copilot: 0.14
  };

  if (verbose) {
    console.log('\n📅 Calculating Monthly Agentic FTEs...');
  }

  // Create a map to merge all monthly data by month
  const monthlyDataMap = new Map();

  // Process Claude Enterprise monthly data
  claudeEnterpriseMonthly.forEach(month => {
    if (!monthlyDataMap.has(month.month)) {
      monthlyDataMap.set(month.month, {
        month: month.month,
        monthLabel: month.monthLabel,
        claudeEnterprise: { users: 0, hours: 0, ftes: 0 },
        claudeCode: { users: 0, lines: 0, hours: 0, ftes: 0 },
        m365Copilot: { users: 0, hours: 0, ftes: 0 },
        githubCopilot: { users: 0, lines: 0, hours: 0, ftes: 0 }
      });
    }

    const data = monthlyDataMap.get(month.month);
    const users = month.users || 0;
    const hours = users * TIME_SAVINGS.claudeEnterprise * MONTHLY_FTE_HOURS;
    const ftes = users * TIME_SAVINGS.claudeEnterprise;

    data.claudeEnterprise = { users, hours, ftes };
  });

  // Process Claude Code monthly data
  claudeCodeMonthly.forEach(month => {
    if (!monthlyDataMap.has(month.month)) {
      monthlyDataMap.set(month.month, {
        month: month.month,
        monthLabel: month.monthLabel,
        claudeEnterprise: { users: 0, hours: 0, ftes: 0 },
        claudeCode: { users: 0, lines: 0, hours: 0, ftes: 0 },
        m365Copilot: { users: 0, hours: 0, ftes: 0 },
        githubCopilot: { users: 0, lines: 0, hours: 0, ftes: 0 }
      });
    }

    const data = monthlyDataMap.get(month.month);
    const users = month.users || 0;
    const lines = month.totalLines || 0;
    const hours = lines * HOURS_PER_LINE;
    const ftes = hours / MONTHLY_FTE_HOURS;

    data.claudeCode = { users, lines, hours, ftes };
  });

  // Process M365 Copilot monthly data
  m365CopilotMonthly.forEach(month => {
    if (!monthlyDataMap.has(month.month)) {
      monthlyDataMap.set(month.month, {
        month: month.month,
        monthLabel: month.monthLabel,
        claudeEnterprise: { users: 0, hours: 0, ftes: 0 },
        claudeCode: { users: 0, lines: 0, hours: 0, ftes: 0 },
        m365Copilot: { users: 0, hours: 0, ftes: 0 },
        githubCopilot: { users: 0, lines: 0, hours: 0, ftes: 0 }
      });
    }

    const data = monthlyDataMap.get(month.month);
    const users = month.users || 0;
    const hours = users * TIME_SAVINGS.m365Copilot * MONTHLY_FTE_HOURS;
    const ftes = users * TIME_SAVINGS.m365Copilot;

    data.m365Copilot = { users, hours, ftes };
  });

  // Process GitHub Copilot monthly data
  githubCopilotMonthly.forEach(month => {
    if (!monthlyDataMap.has(month.month)) {
      monthlyDataMap.set(month.month, {
        month: month.month,
        monthLabel: month.monthLabel,
        claudeEnterprise: { users: 0, hours: 0, ftes: 0 },
        claudeCode: { users: 0, lines: 0, hours: 0, ftes: 0 },
        m365Copilot: { users: 0, hours: 0, ftes: 0 },
        githubCopilot: { users: 0, lines: 0, hours: 0, ftes: 0 }
      });
    }

    const data = monthlyDataMap.get(month.month);
    const users = month.users || 0;
    const lines = month.totalLines || 0;
    const hours = lines * HOURS_PER_LINE;
    const ftes = hours / MONTHLY_FTE_HOURS;

    data.githubCopilot = { users, lines, hours, ftes };
  });

  // Calculate total FTEs per month
  const monthlyData = Array.from(monthlyDataMap.values())
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(month => ({
      ...month,
      totalFTEs: parseFloat((
        month.claudeEnterprise.ftes +
        month.claudeCode.ftes +
        month.m365Copilot.ftes +
        month.githubCopilot.ftes
      ).toFixed(1)),
      totalHours: Math.round(
        month.claudeEnterprise.hours +
        month.claudeCode.hours +
        month.m365Copilot.hours +
        month.githubCopilot.hours
      ),
      breakdown: {
        claudeEnterprise: parseFloat(month.claudeEnterprise.ftes.toFixed(1)),
        claudeCode: parseFloat(month.claudeCode.ftes.toFixed(1)),
        m365Copilot: parseFloat(month.m365Copilot.ftes.toFixed(1)),
        githubCopilot: parseFloat(month.githubCopilot.ftes.toFixed(1))
      }
    }));

  if (verbose) {
    console.log(`\n📊 Monthly Agentic FTE Summary:`);
    monthlyData.forEach(month => {
      console.log(`\n${month.monthLabel} ${month.month.split('-')[0]}:`);
      console.log(`   Claude Enterprise: ${month.claudeEnterprise.users} users → ${month.breakdown.claudeEnterprise} FTEs`);
      console.log(`   Claude Code: ${month.claudeCode.users} users, ${month.claudeCode.lines.toLocaleString()} lines → ${month.breakdown.claudeCode} FTEs`);
      console.log(`   M365 Copilot: ${month.m365Copilot.users} users → ${month.breakdown.m365Copilot} FTEs`);
      console.log(`   GitHub Copilot: ${month.githubCopilot.users} users, ${month.githubCopilot.lines.toLocaleString()} lines → ${month.breakdown.githubCopilot} FTEs`);
      console.log(`   TOTAL: ${month.totalFTEs} Agentic FTEs (${month.totalHours.toLocaleString()} hours)`);
    });
    console.log('');
  }

  return monthlyData;
}

module.exports = {
  calculateProductivityMetrics,
  calculateAgenticFTEs,
  calculateMonthlyAgenticFTEs
};
