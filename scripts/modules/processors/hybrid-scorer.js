/**
 * Hybrid Scorer
 *
 * Calculates final priority scores using adaptive weighting between Multi-Factor and ROI scoring.
 * Implements the hybrid scoring algorithm from /docs/strategic-planning/methodology.md
 *
 * Formula:
 *   Q1-Q2: Final_Score = (0.7 × Multi_Factor) + (0.3 × ROI)
 *   Q3-Q4: Final_Score = (0.6 × Multi_Factor) + (0.4 × ROI)
 *
 * Multi-Factor Score (0-100):
 *   = (0.3 × Financial) + (0.25 × Strategic) + (0.25 × Feasibility) + (0.2 × TimeToValue)
 *
 * Dependencies: None (pure calculation logic)
 */

/**
 * Calculate hybrid scores for all projects
 *
 * @param {Object} options - Configuration options
 * @param {Array} options.projects - Parsed projects from project-ingestor
 * @param {Object} options.dependencyGraph - Dependency graph from dependency-analyzer
 * @param {string} options.quarter - Target quarter for adaptive weighting (Q1-Q4)
 * @param {boolean} options.verbose - Enable detailed logging (default: false)
 * @returns {Promise<Object>} Scored and ranked projects
 */
async function calculateScores(options = {}) {
  const {
    projects = [],
    dependencyGraph = {},
    quarter = 'Q1',
    verbose = false
  } = options;

  if (verbose) {
    console.log('\n📊 Calculating hybrid scores...\n');
    console.log(`   Target quarter: ${quarter}`);
    console.log(`   Weighting: ${getWeighting(quarter)}\n`);
  }

  const scores = {};
  const ranked = [];

  // Calculate scores for each project
  for (const project of projects) {
    const score = await calculateProjectScore(project, dependencyGraph, quarter, verbose);
    scores[project.id] = score;
    ranked.push({
      id: project.id,
      name: project.name,
      score: score.finalScore,
      tier: project.strategic.tier
    });
  }

  // Sort by final score (descending)
  ranked.sort((a, b) => b.score - a.score);

  // Add rank
  ranked.forEach((project, idx) => {
    project.rank = idx + 1;
    scores[project.id].rank = idx + 1;
  });

  if (verbose) {
    console.log(`\n✅ Scoring Summary:`);
    console.log(`   - Projects scored: ${projects.length}`);
    console.log(`   - Top project: ${ranked[0].id} (${ranked[0].score.toFixed(1)})`);
    console.log(`   - Score range: ${ranked[ranked.length - 1].score.toFixed(1)} - ${ranked[0].score.toFixed(1)}`);
  }

  return {
    scores,
    ranked,
    metadata: {
      quarter,
      weighting: getWeighting(quarter),
      totalProjects: projects.length
    }
  };
}

/**
 * Calculate score for a single project
 */
async function calculateProjectScore(project, dependencyGraph, quarter, verbose = false) {
  // Calculate component scores
  const financialScore = calculateFinancialScore(project);
  const strategicScore = calculateStrategicScore(project);
  const feasibilityScore = calculateFeasibilityScore(project, dependencyGraph);
  const timeToValueScore = calculateTimeToValueScore(project);

  // Calculate Multi-Factor Score
  const multiFactorScore =
    (0.3 * financialScore) +
    (0.25 * strategicScore) +
    (0.25 * feasibilityScore) +
    (0.2 * timeToValueScore);

  // Calculate ROI Score
  const roiScore = calculateROIScore(project);

  // Calculate Final Score with adaptive weighting
  const weights = getWeighting(quarter);
  const finalScore = (weights.multiFactor * multiFactorScore) + (weights.roi * roiScore);

  if (verbose) {
    console.log(`   ${project.id}: ${finalScore.toFixed(1)}`);
    console.log(`      Multi-Factor: ${multiFactorScore.toFixed(1)} (Financial: ${financialScore.toFixed(0)}, Strategic: ${strategicScore.toFixed(0)}, Feasibility: ${feasibilityScore.toFixed(0)}, TTV: ${timeToValueScore.toFixed(0)})`);
    console.log(`      ROI: ${roiScore.toFixed(1)}`);
  }

  return {
    finalScore,
    multiFactorScore,
    roiScore,
    breakdown: {
      financial: financialScore,
      strategic: strategicScore,
      feasibility: feasibilityScore,
      timeToValue: timeToValueScore
    }
  };
}

/**
 * Get adaptive weighting based on quarter
 */
function getWeighting(quarter) {
  const q = quarter.toUpperCase();
  if (q === 'Q1' || q === 'Q2') {
    return {
      multiFactor: 0.7,
      roi: 0.3,
      rationale: 'Q1-Q2: Strategy-heavy while validating ROI assumptions'
    };
  } else {
    return {
      multiFactor: 0.6,
      roi: 0.4,
      rationale: 'Q3-Q4: Increased ROI weight as data accuracy improves'
    };
  }
}

/**
 * Calculate Financial Impact Score (0-100)
 *
 * Formula: min(100, Annual_Value_Millions × 25)
 * Examples:
 *   - $4M+ value = 100 points
 *   - $2M value = 50 points
 *   - $1M value = 25 points
 */
function calculateFinancialScore(project) {
  if (!project.value || project.value === null) {
    return 0;
  }

  const valueInMillions = project.value / 1000000;
  return Math.min(100, valueInMillions * 25);
}

/**
 * Calculate Strategic Alignment Score (0-100)
 *
 * Maps to TechCo Inc Strategic Framework:
 * - 4 Strategic Pillars: Impactful, Intuitive, Intelligent, Trustworthy (+20 each)
 * - 3 Growth Drivers: Win (Sales +20), Retain (Churn +15), Innovate (Future +10)
 * Max 100 points
 */
function calculateStrategicScore(project) {
  let score = 0;

  // Strategic Pillars (+20 each)
  const pillars = project.strategic.pillars || [];
  score += pillars.length * 20;

  // Growth Drivers (weighted)
  const drivers = project.strategic.drivers || [];
  drivers.forEach(driver => {
    if (driver === 'Win') score += 20;
    else if (driver === 'Retain') score += 15;
    else if (driver === 'Innovate') score += 10;
  });

  return Math.min(100, score);
}

/**
 * Calculate Execution Feasibility Score (0-100)
 *
 * Factors:
 * - Dependencies cleared: +30
 * - Team has domain expertise: +20
 * - Technology proven/mature: +20
 * - No external vendor blockers: +15
 * - Champion available: +15
 * - Penalty: Hard dependencies not met = -50
 */
function calculateFeasibilityScore(project, dependencyGraph) {
  let score = 0;

  const projectNode = dependencyGraph[project.id];
  if (!projectNode) {
    // No dependency data, assume moderate feasibility
    return 50;
  }

  // Check if HARD dependencies are met
  const hardDeps = projectNode.dependsOn.filter(d => d.type === 'HARD');
  if (hardDeps.length === 0) {
    score += 30;  // No hard dependencies
  } else {
    score -= 50;  // Penalty for unmet hard dependencies
  }

  // Domain expertise (heuristic: infer from project description)
  score += 20;  // Assume team has expertise

  // Technology maturity (heuristic: check for pilot/prototype keywords)
  const hasPilot = project.phases.some(p =>
    p.name.toLowerCase().includes('pilot') ||
    p.name.toLowerCase().includes('prototype')
  );
  if (hasPilot) {
    score += 20;  // Technology being tested
  }

  // No external vendor blockers (heuristic: check dependencies for external tools)
  const hasExternalDep = project.dependencies.some(d =>
    d.project.toLowerCase().includes('gong') ||
    d.project.toLowerCase().includes('salesforce') ||
    d.project.toLowerCase().includes('mcp')
  );
  if (!hasExternalDep) {
    score += 15;
  }

  // Champion available (heuristic: placeholder)
  score += 15;

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate Time to Value Score (0-100)
 *
 * Scoring:
 * - < 1 quarter: 100 points
 * - 1 quarter: 80 points
 * - 2 quarters: 60 points
 * - 3 quarters: 40 points
 * - 4+ quarters: 20 points
 */
function calculateTimeToValueScore(project) {
  // Estimate quarters from effort (rough heuristic)
  const effort = project.effort || 60;  // Default to 60 days
  const quarters = Math.ceil(effort / 60);

  if (quarters < 1) return 100;
  else if (quarters === 1) return 80;
  else if (quarters === 2) return 60;
  else if (quarters === 3) return 40;
  else return 20;
}

/**
 * Calculate ROI Score (0-100)
 *
 * Formula: min(100, Project_ROI_Percentage / 5)
 * Examples:
 *   - 1,560% ROI = 100 points (capped)
 *   - 500% ROI = 100 points (capped)
 *   - 300% ROI = 60 points
 *   - 150% ROI = 30 points
 */
function calculateROIScore(project) {
  if (!project.roi || project.roi === null) {
    return 0;
  }

  return Math.min(100, project.roi / 5);
}

module.exports = {
  calculateScores,
  getWeighting
};
