/**
 * Dependency Analyzer
 *
 * Analyzes project dependencies and classifies them as HARD or SOFT based on:
 * - Explicit keywords in markdown files
 * - Dashboard metrics (productivity, engagement, adoption, perceived value)
 * - Architecture dependencies (one project provides infrastructure for another)
 *
 * Key Features:
 * - Builds dependency graph from project data
 * - Classifies HARD vs SOFT dependencies using data-driven criteria
 * - Detects circular dependencies
 * - Identifies blocking relationships
 * - Generates dependency rationale explanations
 *
 * Dependencies: dashboard-data-ingestor (for classification criteria)
 */

const { shouldBeHardDependency } = require('../ingestors/dashboard-data-ingestor');

/**
 * Analyze project dependencies
 *
 * @param {Object} options - Configuration options
 * @param {Array} options.projects - Parsed projects from project-ingestor
 * @param {Object} options.dashboardMetrics - Metrics from dashboard-data-ingestor
 * @param {boolean} options.verbose - Enable detailed logging (default: false)
 * @returns {Promise<Object>} Dependency graph and analysis
 */
async function analyzeDependencies(options = {}) {
  const {
    projects = [],
    dashboardMetrics = {},
    verbose = false
  } = options;

  if (verbose) {
    console.log('\n📊 Analyzing project dependencies...\n');
  }

  // Step 1: Build initial dependency graph
  const graph = buildDependencyGraph(projects);

  // Step 2: Enhance with data-driven classification
  enhanceWithDashboardData(graph, dashboardMetrics, verbose);

  // Step 3: Detect circular dependencies
  const cycles = detectCircularDependencies(graph);

  // Step 4: Calculate blocking relationships
  const blocking = calculateBlocking(graph);

  // Step 5: Generate rationale
  const rationales = generateRationales(graph, dashboardMetrics);

  if (verbose) {
    console.log(`\n✅ Dependency Analysis Summary:`);
    console.log(`   - Projects analyzed: ${projects.length}`);
    console.log(`   - Total dependencies: ${Object.values(graph).reduce((sum, p) => sum + p.dependsOn.length, 0)}`);
    console.log(`   - HARD dependencies: ${Object.values(graph).reduce((sum, p) => sum + p.dependsOn.filter(d => d.type === 'HARD').length, 0)}`);
    console.log(`   - SOFT dependencies: ${Object.values(graph).reduce((sum, p) => sum + p.dependsOn.filter(d => d.type === 'SOFT').length, 0)}`);
    console.log(`   - Circular dependencies: ${cycles.length}`);
  }

  return {
    graph,
    cycles,
    blocking,
    rationales,
    metadata: {
      totalProjects: projects.length,
      totalDependencies: Object.values(graph).reduce((sum, p) => sum + p.dependsOn.length, 0),
      hardDependencies: Object.values(graph).reduce((sum, p) => sum + p.dependsOn.filter(d => d.type === 'HARD').length, 0),
      softDependencies: Object.values(graph).reduce((sum, p) => sum + p.dependsOn.filter(d => d.type === 'SOFT').length, 0),
      circularDependencies: cycles.length
    }
  };
}

/**
 * Build initial dependency graph from project data
 */
function buildDependencyGraph(projects) {
  const graph = {};

  // Initialize graph nodes
  projects.forEach(project => {
    graph[project.id] = {
      id: project.id,
      name: project.name,
      dependsOn: [],
      enablers: [],      // Projects that depend on this one
      blockedBy: [],     // HARD dependencies not yet met
      canStartWhen: []   // List of prerequisite completions
    };
  });

  // Add dependencies from project data
  projects.forEach(project => {
    project.dependencies.forEach(dep => {
      if (graph[project.id] && graph[dep.project]) {
        graph[project.id].dependsOn.push({
          project: dep.project,
          type: dep.type || 'SOFT',  // Default to SOFT if not specified
          source: 'explicit'          // From markdown
        });

        // Track reverse relationship
        graph[dep.project].enablers.push(project.id);
      }
    });
  });

  return graph;
}

/**
 * Enhance dependency classification with dashboard metrics
 */
function enhanceWithDashboardData(graph, dashboardMetrics, verbose = false) {
  Object.values(graph).forEach(project => {
    project.dependsOn.forEach(dep => {
      // Only enhance if source was explicit (not already data-driven)
      if (dep.source === 'explicit') {
        // Check if dashboard data suggests this should be HARD
        const shouldBeHard = shouldBeHardDependency(dashboardMetrics, dep.project);

        if (shouldBeHard && dep.type === 'SOFT') {
          if (verbose) {
            console.log(`   ⬆️  Upgrading ${project.id} → ${dep.project} from SOFT to HARD (dashboard data)`);
          }
          dep.type = 'HARD';
          dep.source = 'data-driven';
        }
      }
    });

    // Calculate blocked status
    project.blockedBy = project.dependsOn
      .filter(d => d.type === 'HARD')
      .map(d => d.project);
  });
}

/**
 * Detect circular dependencies
 */
function detectCircularDependencies(graph) {
  const cycles = [];
  const visited = new Set();
  const recursionStack = new Set();

  function dfs(projectId, path = []) {
    if (recursionStack.has(projectId)) {
      // Found a cycle
      const cycleStart = path.indexOf(projectId);
      const cycle = path.slice(cycleStart).concat(projectId);
      cycles.push(cycle);
      return;
    }

    if (visited.has(projectId)) {
      return;
    }

    visited.add(projectId);
    recursionStack.add(projectId);
    path.push(projectId);

    const project = graph[projectId];
    if (project) {
      project.dependsOn.forEach(dep => {
        dfs(dep.project, [...path]);
      });
    }

    recursionStack.delete(projectId);
  }

  Object.keys(graph).forEach(projectId => {
    if (!visited.has(projectId)) {
      dfs(projectId);
    }
  });

  return cycles;
}

/**
 * Calculate blocking relationships
 */
function calculateBlocking(graph) {
  const blocking = {};

  Object.entries(graph).forEach(([projectId, project]) => {
    blocking[projectId] = {
      isBlocked: project.blockedBy.length > 0,
      blockedBy: project.blockedBy,
      blocks: project.enablers.filter(enabledId => {
        const enabled = graph[enabledId];
        return enabled && enabled.blockedBy.includes(projectId);
      }),
      canStartWhen: project.blockedBy.length > 0
        ? `After ${project.blockedBy.join(', ')} complete`
        : 'No blockers'
    };
  });

  return blocking;
}

/**
 * Generate rationale explanations for dependencies
 */
function generateRationales(graph, dashboardMetrics) {
  const rationales = {};

  Object.entries(graph).forEach(([projectId, project]) => {
    project.dependsOn.forEach(dep => {
      const key = `${projectId}->${dep.project}`;

      let rationale = '';

      if (dep.type === 'HARD') {
        // Explain why it's HARD
        const reasons = [];

        if (dashboardMetrics.productivity?.claudeCodeMultiplier > 10) {
          reasons.push(`${dashboardMetrics.productivity.claudeCodeMultiplier.toFixed(1)}x productivity multiplier`);
        }

        if (dashboardMetrics.productivity?.engagementMultiplier > 4) {
          reasons.push(`${dashboardMetrics.productivity.engagementMultiplier.toFixed(1)}x engagement multiplier`);
        }

        if (dashboardMetrics.adoption?.claudeEnterprise > 80) {
          reasons.push(`${dashboardMetrics.adoption.claudeEnterprise}% adoption rate`);
        }

        const valueGap = Math.abs(
          (dashboardMetrics.perceivedValue?.claudeEnterprise || 0) -
          (dashboardMetrics.perceivedValue?.m365Copilot || 0)
        );
        if (valueGap > 30) {
          reasons.push(`${valueGap} point perceived value gap`);
        }

        if (dep.source === 'explicit') {
          reasons.push('architecture foundation');
        }

        rationale = reasons.length > 0
          ? reasons.join(', ')
          : 'Required for architecture';
      } else {
        // Explain why it's SOFT
        rationale = 'Can proceed without, but enhanced with this dependency';
      }

      rationales[key] = {
        from: projectId,
        to: dep.project,
        type: dep.type,
        rationale
      };
    });
  });

  return rationales;
}

/**
 * Helper: Get all projects that can start in a given quarter
 */
function getStartableProjects(graph, completedProjects = []) {
  const startable = [];

  Object.entries(graph).forEach(([projectId, project]) => {
    // Check if all HARD dependencies are completed
    const hardDeps = project.dependsOn.filter(d => d.type === 'HARD').map(d => d.project);
    const allDepsMet = hardDeps.every(dep => completedProjects.includes(dep));

    if (allDepsMet && !completedProjects.includes(projectId)) {
      startable.push(projectId);
    }
  });

  return startable;
}

module.exports = {
  analyzeDependencies,
  getStartableProjects
};
