/**
 * Premium Allocation Processor
 *
 * Processes user activity data to recommend Premium vs Standard seat allocations
 * using hybrid approach: behavioral scoring + department baselines.
 *
 * Key Features:
 * - Behavioral scoring (0-115 points) based on usage patterns
 * - Department-specific baseline percentages (10%-100%)
 * - Hybrid "take MAX" allocation strategy
 * - Special handling for Engineering/Agentic AI (100% Premium)
 *
 * Dependencies: None (pure business logic)
 */

/**
 * Calculate Premium seat candidacy score based on actual usage patterns
 *
 * Premium candidates are identified by:
 * 1. Code writing activity (Claude Code lines, GitHub Copilot usage)
 * 2. Heavy analysis/complex work (high conversation volume)
 * 3. Document/artifact creation (artifacts, file uploads)
 * 4. M365 Copilot engagement (prompts per day, active days)
 *
 * Score breakdown:
 * - Code writing: 0-30 points (automatic high score for developers)
 * - Engagement: 0-30 points (conversation volume)
 * - Artifacts: 0-25 points (document creation)
 * - File uploads: 0-15 points (data analysis work)
 * - M365 prompts/day: 0-10 points (AI usage intensity)
 * - M365 active days: 0-5 points (usage consistency)
 * - Maximum: 115 points
 *
 * @param {Object} userActivity - User activity metrics
 * @param {number} userActivity.claudeCodeLines - Lines generated with Claude Code
 * @param {number} userActivity.conversations - Total conversations in Claude Enterprise
 * @param {number} userActivity.artifacts - Artifacts created
 * @param {number} userActivity.filesUploaded - Files uploaded for analysis
 * @param {number} userActivity.m365PromptsPerDay - M365 Copilot prompts per day
 * @param {number} userActivity.m365ActiveDays - Active days in 180-day window
 * @returns {number} Premium score (0-115)
 * @private
 */
function calculatePremiumScore(userActivity) {
  let score = 0;

  // 1. Code writing activity (0-30 points)
  // Anyone writing code with Claude Code is a strong Premium candidate
  if (userActivity.claudeCodeLines > 0) {
    score += 30; // Automatic high score for code generation
  }

  // 2. High engagement/capacity needs (0-30 points)
  // High conversation volume indicates power user needing more capacity
  if (userActivity.conversations >= 100) {
    score += 30;
  } else if (userActivity.conversations >= 50) {
    score += 20;
  } else if (userActivity.conversations >= 20) {
    score += 10;
  }

  // 3. Document/artifact creation (0-25 points)
  // Creating many artifacts indicates complex document work
  if (userActivity.artifacts >= 20) {
    score += 25;
  } else if (userActivity.artifacts >= 10) {
    score += 15;
  } else if (userActivity.artifacts >= 5) {
    score += 8;
  }

  // 4. Heavy analysis/complex work (0-15 points)
  // File uploads indicate working with data, analysis, research
  if (userActivity.filesUploaded >= 50) {
    score += 15;
  } else if (userActivity.filesUploaded >= 20) {
    score += 10;
  } else if (userActivity.filesUploaded >= 10) {
    score += 5;
  }

  // 5. M365 Engagement - Prompts per day intensity (0-10 points)
  // High M365 Copilot usage indicates AI-powered work patterns
  if (userActivity.m365PromptsPerDay >= 20) {
    score += 10; // Power user: 20+ prompts/day
  } else if (userActivity.m365PromptsPerDay >= 10) {
    score += 7; // Heavy user: 10-19 prompts/day
  } else if (userActivity.m365PromptsPerDay >= 5) {
    score += 4; // Regular user: 5-9 prompts/day
  } else if (userActivity.m365PromptsPerDay >= 2) {
    score += 2; // Light user: 2-4 prompts/day
  }

  // 6. M365 Consistency - Active days regularity (0-5 points)
  // Consistent usage indicates AI is integral to daily workflow
  if (userActivity.m365ActiveDays >= 120) {
    score += 5; // Highly consistent: 67%+ of 180-day window
  } else if (userActivity.m365ActiveDays >= 90) {
    score += 4; // Consistent: 50-66% of window
  } else if (userActivity.m365ActiveDays >= 60) {
    score += 3; // Moderate: 33-50% of window
  } else if (userActivity.m365ActiveDays >= 30) {
    score += 1; // Occasional: 17-33% of window
  }

  return Math.min(score, 115);
}

/**
 * Get department-specific Premium seat baseline percentage
 * Based on role complexity and AI tool requirements
 *
 * Rationale:
 * - High-complexity departments (Finance, Product, PS, RevOps): 35% need Premium for deep analytical work
 * - Medium-complexity (Customer Success, Sales): 20-25% for client-facing analytical tasks
 * - Moderate (Marketing, BizDev): 18% for content and campaign work
 * - Standard (Support, Ops): 10% for operational efficiency
 * - Engineering/Agentic AI: 100% (Claude Code Premium requirement)
 *
 * @param {string} department - Department name
 * @returns {number} Baseline percentage (0.0 to 1.0)
 * @private
 */
function getDepartmentPremiumBaseline(department) {
  // Engineering/Agentic AI always 100% (Claude Code Premium requirement)
  if (department === 'Engineering' || department === 'Agentic AI') {
    return 1.00;
  }

  // High complexity departments (35%)
  // Deep analytical work, complex decision-making, strategic planning
  const highComplexity = ['Finance', 'Product', 'Professional Services', 'Revenue Operations'];
  if (highComplexity.includes(department)) {
    return 0.35;
  }

  // Medium complexity - Customer-facing analytical (25%)
  if (department === 'Customer Success') {
    return 0.25;
  }

  // Medium complexity - Sales (20%)
  if (department === 'Sales - Enterprise' || department === 'Sales - Large Market' || department === 'Sales') {
    return 0.20;
  }

  // Moderate complexity (18%)
  // Content creation, campaign management, partnership development
  const moderateComplexity = ['Marketing', 'Partnerships'];
  if (moderateComplexity.includes(department)) {
    return 0.18;
  }

  // Standard complexity (10%)
  // Operational efficiency, support workflows
  const standardComplexity = ['Support', 'Operations', 'IT', 'Human Resources', 'Legal'];
  if (standardComplexity.includes(department)) {
    return 0.10;
  }

  // Default for unknown departments (15% - conservative)
  return 0.15;
}

/**
 * Analyze department usage to recommend Premium vs Standard seat allocation
 * Uses actual usage patterns to identify power users
 *
 * @param {string} department - Department name
 * @param {Array} userActivities - Array of user activity objects for the department
 * @param {number} totalEmployees - Total employees in department
 * @returns {Object} { recommendedPremium, recommendedStandard, powerUsers }
 * @private
 */
function recommendLicenseAllocation(department, userActivities, totalEmployees) {
  // Score all active users
  const scoredUsers = userActivities.map(user => ({
    ...user,
    premiumScore: calculatePremiumScore(user)
  }));

  // Calculate average score for context
  const avgScore = scoredUsers.length > 0
    ? scoredUsers.reduce((sum, u) => sum + u.premiumScore, 0) / scoredUsers.length
    : 0;

  // CRITICAL: Engineering and Agentic AI departments need ALL Premium seats
  // because Claude Code (required for developers) only works with Premium licenses
  // This overrides behavioral scoring - all engineers/developers must have Premium
  if (department === 'Engineering' || department === 'Agentic AI') {
    return {
      recommendedPremium: totalEmployees,
      recommendedStandard: 0,
      powerUsers: totalEmployees,  // All engineers are considered power users
      activeUsers: scoredUsers.length,
      averageScore: avgScore,
      allocationMethod: 'engineering_100_percent',
      baselinePremiumCount: totalEmployees,
      behavioralPremiumCount: totalEmployees,
      baselinePercentage: 1.00
    };
  }

  // For non-technical departments, use HYBRID allocation (take MAX)
  // Sort by score descending
  scoredUsers.sort((a, b) => b.premiumScore - a.premiumScore);

  // Premium threshold: score >= 40 (moderate to high usage)
  const PREMIUM_THRESHOLD = 40;
  const powerUsers = scoredUsers.filter(u => u.premiumScore >= PREMIUM_THRESHOLD);

  // 1. Calculate behavioral allocation (data-driven, usage-based)
  const behavioralPremiumCount = powerUsers.length;

  // 2. Calculate department baseline allocation (role complexity-based)
  const baselinePercentage = getDepartmentPremiumBaseline(department);
  const baselinePremiumCount = Math.ceil(totalEmployees * baselinePercentage);

  // 3. Apply "take MAX" logic - use whichever is higher
  const recommendedPremium = Math.max(behavioralPremiumCount, baselinePremiumCount);
  const recommendedStandard = totalEmployees - recommendedPremium;

  // 4. Determine which method won
  let allocationMethod;
  if (behavioralPremiumCount > baselinePremiumCount) {
    allocationMethod = 'behavioral_scoring';
  } else if (baselinePremiumCount > behavioralPremiumCount) {
    allocationMethod = 'department_baseline';
  } else {
    allocationMethod = 'tied';
  }

  return {
    recommendedPremium,
    recommendedStandard,
    powerUsers: powerUsers.length,
    activeUsers: scoredUsers.length,
    averageScore: avgScore,
    allocationMethod,           // Which method won: 'behavioral_scoring', 'department_baseline', 'tied', 'engineering_100_percent'
    baselinePremiumCount,       // What baseline recommended
    behavioralPremiumCount,     // What behavioral scoring recommended
    baselinePercentage          // Percentage used (e.g., 0.35)
  };
}

/**
 * Process Premium allocation recommendations for all departments
 *
 * @param {Object} options - Configuration options
 * @param {Object} options.deptUserActivities - User activities grouped by department
 * @param {Object} options.deptHeadcounts - Total employees per department
 * @param {boolean} options.verbose - Enable detailed logging (default: false)
 * @returns {Promise<Object>} Processing results with allocation recommendations
 */
async function processPremiumAllocation(options = {}) {
  const {
    deptUserActivities = {},
    deptHeadcounts = {},
    verbose = false
  } = options;

  if (verbose) {
    console.log('\n💎 Processing Premium allocation recommendations...\n');
  }

  const recommendations = {};
  const departments = Object.keys(deptHeadcounts);

  departments.forEach(dept => {
    const userActivities = deptUserActivities[dept] || [];
    const totalEmployees = deptHeadcounts[dept] || 0;

    if (totalEmployees === 0) return;

    recommendations[dept] = recommendLicenseAllocation(dept, userActivities, totalEmployees);

    if (verbose) {
      const rec = recommendations[dept];
      console.log(`   ${dept}:`);
      console.log(`     Total: ${totalEmployees} employees`);
      console.log(`     Recommended: ${rec.recommendedPremium} Premium, ${rec.recommendedStandard} Standard`);
      console.log(`     Method: ${rec.allocationMethod}`);
    }
  });

  return {
    // Processed recommendations
    recommendations,

    // Summary metrics
    metrics: {
      departmentsProcessed: Object.keys(recommendations).length,
      totalRecommendedPremium: Object.values(recommendations).reduce((sum, r) => sum + r.recommendedPremium, 0),
      totalRecommendedStandard: Object.values(recommendations).reduce((sum, r) => sum + r.recommendedStandard, 0)
    },

    // Metadata
    metadata: {
      processedAt: new Date().toISOString()
    }
  };
}

module.exports = {
  processPremiumAllocation,
  // Export individual functions for testing/reuse
  calculatePremiumScore,
  getDepartmentPremiumBaseline,
  recommendLicenseAllocation
};
