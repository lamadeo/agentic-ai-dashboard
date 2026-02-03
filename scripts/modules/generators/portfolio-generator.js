/**
 * Portfolio Generator
 *
 * Generates project portfolio table with 11 columns for dashboard integration.
 * Formats scored and scheduled projects into the structure used by
 * AnnualPlanPresentation.jsx and PortfolioTable.jsx components.
 *
 * Output Columns:
 * 1. Rank - Priority rank (1-11)
 * 2. Project - Project ID and name
 * 3. Score - Final hybrid score (0-100)
 * 4. Tier - TIER 0/1/2 classification
 * 5. Status - in-progress, proposed, committed
 * 6. Value - Annual value ($XXM)
 * 7. ROI - Return on investment percentage
 * 8. Target KPIs - Success metrics
 * 9. Dependencies - HARD/SOFT dependency list
 * 10. Q Start - Target quarter
 * 11. Priority Reasoning - Why this ranking
 *
 * Dependencies: None (pure formatting logic)
 */

/**
 * Generate project portfolio table
 *
 * @param {Object} options - Configuration options
 * @param {Array} options.rankedProjects - Ranked projects from hybrid-scorer
 * @param {Object} options.scores - Detailed scores from hybrid-scorer
 * @param {Object} options.schedule - Schedule from constraint-scheduler
 * @param {Object} options.dependencyGraph - Dependency graph from dependency-analyzer
 * @param {Object} options.rationales - Dependency rationales from dependency-analyzer
 * @param {Array} options.projects - Original parsed projects from project-ingestor
 * @param {boolean} options.verbose - Enable detailed logging (default: false)
 * @returns {Promise<Object>} Portfolio table data
 */
async function generatePortfolio(options = {}) {
  const {
    rankedProjects = [],
    scores = {},
    schedule = {},
    dependencyGraph = {},
    rationales = {},
    projects = [],
    verbose = false
  } = options;

  if (verbose) {
    console.log('\n📊 Generating project portfolio table...\n');
  }

  const portfolioProjects = [];

  // Generate portfolio entry for each ranked project
  for (const ranked of rankedProjects) {
    const project = projects.find(p => p.id === ranked.id);
    if (!project) continue;

    const score = scores[project.id];
    const projectNode = dependencyGraph[project.id];

    const entry = {
      rank: ranked.rank,
      project: `${project.id}: ${project.name}`,
      score: score.finalScore.toFixed(1),
      tier: project.strategic.tier || 'TBD',
      status: determineStatus(project.id, schedule),
      value: formatValue(project.value),
      roi: formatROI(project.roi),
      targetKPIs: formatKPIs(project.kpis),
      dependencies: formatDependencies(projectNode, rationales),
      qStart: determineQuarterStart(project.id, schedule),
      qStartDetail: determineQuarterDetail(project.id, schedule, project),
      priorityReasoning: generatePriorityReasoning(project, score, projectNode)
    };

    portfolioProjects.push(entry);

    if (verbose) {
      console.log(`   ${entry.rank}. ${project.id}: ${score.finalScore.toFixed(1)} (${entry.tier})`);
    }
  }

  if (verbose) {
    console.log(`\n✅ Portfolio generation complete: ${portfolioProjects.length} projects`);
  }

  return {
    projects: portfolioProjects,
    metadata: {
      totalProjects: portfolioProjects.length,
      tiers: {
        foundation: portfolioProjects.filter(p => p.tier.includes('TIER 0')).length,
        revenue: portfolioProjects.filter(p => p.tier.includes('TIER 1')).length,
        retention: portfolioProjects.filter(p => p.tier.includes('TIER 2')).length
      },
      status: {
        committed: portfolioProjects.filter(p => p.status === 'committed').length,
        inProgress: portfolioProjects.filter(p => p.status === 'in-progress').length,
        proposed: portfolioProjects.filter(p => p.status === 'proposed').length
      }
    }
  };
}

/**
 * Determine project status based on schedule
 */
function determineStatus(projectId, schedule) {
  if (schedule.Q1?.committed?.includes(projectId) || schedule.Q1?.projects?.includes(projectId)) {
    return 'committed';
  }

  // Check if already in progress (heuristic: OP-000, OP-008, OP-011 are ongoing)
  if (['OP-000', 'OP-008', 'OP-011'].includes(projectId)) {
    return 'in-progress';
  }

  return 'proposed';
}

/**
 * Format value for display
 */
function formatValue(value) {
  if (!value) {
    return 'TBD';
  }

  const millions = value / 1000000;
  return `$${millions.toFixed(2)}M`;
}

/**
 * Format ROI for display
 */
function formatROI(roi) {
  if (!roi || roi === null) {
    return 'TBD';
  }

  return `${Math.round(roi)}%`;
}

/**
 * Format KPIs for display
 */
function formatKPIs(kpis) {
  if (!kpis || kpis.length === 0) {
    return 'TBD';
  }

  // Take first 3 KPIs, join with semicolons
  return kpis.slice(0, 3).join('; ');
}

/**
 * Format dependencies for display
 */
function formatDependencies(projectNode, rationales) {
  if (!projectNode || !projectNode.dependsOn || projectNode.dependsOn.length === 0) {
    return 'None';
  }

  // Format as: "HARD on OP-XXX, SOFT on OP-YYY"
  const deps = projectNode.dependsOn.map(dep => {
    return `${dep.type} on ${dep.project}`;
  });

  return deps.join(', ');
}

/**
 * Determine quarter start
 */
function determineQuarterStart(projectId, schedule) {
  if (schedule.Q1?.projects?.includes(projectId)) return 'Q1';
  if (schedule.Q2?.projects?.includes(projectId)) return 'Q2';
  if (schedule.Q3?.projects?.includes(projectId)) return 'Q3';
  if (schedule.Q4?.projects?.includes(projectId)) return 'Q4';
  return 'TBD';
}

/**
 * Determine quarter detail (what happens in that quarter)
 */
function determineQuarterDetail(projectId, schedule, project) {
  const quarter = determineQuarterStart(projectId, schedule);

  if (quarter === 'TBD') {
    return 'Deferred to 2027+';
  }

  // Get first phase name if available
  const firstPhase = project.phases && project.phases.length > 0
    ? project.phases[0].name
    : 'Implementation';

  return `${quarter} (${firstPhase})`;
}

/**
 * Generate priority reasoning explanation
 */
function generatePriorityReasoning(project, score, projectNode) {
  const reasons = [];

  // Financial impact
  if (score.breakdown.financial >= 80) {
    reasons.push('High financial impact');
  } else if (score.breakdown.financial >= 50) {
    reasons.push('Medium financial impact');
  }

  // Strategic alignment
  if (score.breakdown.strategic >= 80) {
    reasons.push('Strong strategic alignment');
  }

  // Dependencies
  if (projectNode) {
    const hardDeps = projectNode.dependsOn.filter(d => d.type === 'HARD');
    if (hardDeps.length === 0) {
      reasons.push('No blockers');
    } else {
      reasons.push(`Depends on ${hardDeps.map(d => d.project).join(', ')}`);
    }
  }

  // ROI
  if (score.roiScore >= 80) {
    reasons.push('Exceptional ROI');
  } else if (score.roiScore >= 50) {
    reasons.push('Strong ROI');
  }

  // Tier
  if (project.strategic.tier.includes('TIER 0')) {
    reasons.push('Foundation for future work');
  } else if (project.strategic.tier.includes('TIER 1')) {
    reasons.push('Direct revenue impact');
  }

  // Time to value
  if (score.breakdown.timeToValue >= 80) {
    reasons.push('Quick wins');
  }

  return reasons.length > 0
    ? reasons.join('; ')
    : 'Balanced across all factors';
}

/**
 * Helper: Generate summary statistics
 */
function generateSummary(portfolioProjects) {
  const totalValue = portfolioProjects.reduce((sum, p) => {
    const value = parseFloat(p.value.replace(/[$M]/g, ''));
    return sum + (isNaN(value) ? 0 : value);
  }, 0);

  const roiValues = portfolioProjects
    .map(p => parseInt(p.roi.replace('%', '')))
    .filter(v => !isNaN(v));

  const avgROI = roiValues.length > 0
    ? Math.round(roiValues.reduce((sum, v) => sum + v, 0) / roiValues.length)
    : 0;

  return {
    totalValue: `$${totalValue.toFixed(2)}M`,
    avgROI: `${avgROI}%`,
    projectCount: portfolioProjects.length
  };
}

module.exports = {
  generatePortfolio,
  generateSummary
};
