/**
 * Constraint-Based Scheduler
 *
 * Schedules projects across quarters based on team capacity and dependencies.
 * Implements the constraint-based scheduling algorithm from methodology.md
 *
 * Capacity Model (Engineering Days):
 * - Q1: 72 core (6 people × 60 days × 20%), 0 champion
 * - Q2: 84 core (7 people × 60 days × 20%), 60 champion (variable by project type)
 * - Q3: 168 core (7 people × 60 days × 40%), 120 champion
 * - Q4: 252 core (7 people × 60 days × 60%), 180 champion
 *
 * Algorithm:
 * 1. Reserve Q1 committed work (OP-000, OP-011, OP-012, OP-013, OP-008)
 * 2. Sort remaining projects by final score (descending)
 * 3. For each quarter (Q2, Q3, Q4):
 *    - Calculate available capacity
 *    - For each project (by score):
 *      - Check if HARD dependencies are met
 *      - Check if effort ≤ available capacity
 *      - If yes: schedule project, reduce capacity
 *      - If no: defer to next quarter
 *
 * Dependencies: dependency-analyzer (for dependency graph)
 */

/**
 * Schedule projects across quarters with capacity constraints
 *
 * @param {Object} options - Configuration options
 * @param {Array} options.rankedProjects - Scored projects from hybrid-scorer
 * @param {Object} options.scores - Detailed scores from hybrid-scorer
 * @param {Object} options.dependencyGraph - Dependency graph from dependency-analyzer
 * @param {boolean} options.verbose - Enable detailed logging (default: false)
 * @returns {Promise<Object>} Quarterly schedule with capacity allocation
 */
async function scheduleProjects(options = {}) {
  const {
    rankedProjects = [],
    scores = {},
    dependencyGraph = {},
    verbose = false
  } = options;

  if (verbose) {
    console.log('\n📅 Scheduling projects across quarters...\n');
  }

  // Step 1: Define capacity model
  const capacityModel = getCapacityModel();

  // Step 2: Reserve Q1 committed work
  const q1Committed = reserveQ1Committed(rankedProjects, dependencyGraph, verbose);

  // Step 3: Initialize schedule
  const schedule = {
    Q1: {
      committed: q1Committed.projects,
      capacity: capacityModel.Q1.total,
      allocated: q1Committed.effort,
      buffer: capacityModel.Q1.total - q1Committed.effort,
      projects: q1Committed.projects
    },
    Q2: { potential: [], capacity: capacityModel.Q2.total, allocated: 0, buffer: 0, projects: [] },
    Q3: { potential: [], capacity: capacityModel.Q3.total, allocated: 0, buffer: 0, projects: [] },
    Q4: { potential: [], capacity: capacityModel.Q4.total, allocated: 0, buffer: 0, projects: [] }
  };

  // Step 4: Schedule remaining projects
  const completedProjects = [...q1Committed.projectIds];
  const remainingProjects = rankedProjects.filter(p => !completedProjects.includes(p.id));

  scheduleQuarter('Q2', remainingProjects, schedule, dependencyGraph, completedProjects, verbose);
  scheduleQuarter('Q3', remainingProjects, schedule, dependencyGraph, completedProjects, verbose);
  scheduleQuarter('Q4', remainingProjects, schedule, dependencyGraph, completedProjects, verbose);

  // Step 5: Identify deferred projects
  const scheduledIds = new Set([
    ...schedule.Q1.projects,
    ...schedule.Q2.projects,
    ...schedule.Q3.projects,
    ...schedule.Q4.projects
  ]);

  const deferredProjects = rankedProjects
    .filter(p => !scheduledIds.has(p.id))
    .map(p => ({
      id: p.id,
      name: p.name,
      score: p.score,
      reason: getDeferralReason(p.id, dependencyGraph, completedProjects)
    }));

  if (verbose) {
    console.log(`\n✅ Scheduling Summary:`);
    console.log(`   - Q1 committed: ${schedule.Q1.projects.length} projects (${schedule.Q1.allocated}/${schedule.Q1.capacity} days, ${schedule.Q1.buffer}-day buffer)`);
    console.log(`   - Q2 potential: ${schedule.Q2.projects.length} projects (${schedule.Q2.allocated}/${schedule.Q2.capacity} days, ${schedule.Q2.buffer}-day buffer)`);
    console.log(`   - Q3 potential: ${schedule.Q3.projects.length} projects (${schedule.Q3.allocated}/${schedule.Q3.capacity} days, ${schedule.Q3.buffer}-day buffer)`);
    console.log(`   - Q4 potential: ${schedule.Q4.projects.length} projects (${schedule.Q4.allocated}/${schedule.Q4.capacity} days, ${schedule.Q4.buffer}-day buffer)`);
    console.log(`   - Deferred: ${deferredProjects.length} projects`);
  }

  return {
    schedule,
    deferredProjects,
    capacityModel,
    metadata: {
      totalProjects: rankedProjects.length,
      scheduled: scheduledIds.size,
      deferred: deferredProjects.length
    }
  };
}

/**
 * Get capacity model for all quarters
 */
function getCapacityModel() {
  return {
    Q1: {
      core: 72,        // 6 people × 60 days × 20%
      champion: 0,     // No champion capacity yet
      total: 72,
      notes: '80% committed to Hypergrowth (OP-012 Leave Planning, OP-013 Case Management)'
    },
    Q2: {
      core: 84,        // 7 people × 60 days × 20% (+ Data Engineer hire)
      champion: 60,    // Variable by project type
      total: 144,
      notes: 'Champion model starting to mature'
    },
    Q3: {
      core: 168,       // 7 people × 60 days × 40%
      champion: 120,   // Established champion community
      total: 288,
      notes: 'Hypergrowth major milestone complete, more capacity available'
    },
    Q4: {
      core: 252,       // 7 people × 60 days × 60%
      champion: 180,   // Mature community
      total: 432,
      notes: 'Hypergrowth stabilized, maximum capacity'
    }
  };
}

/**
 * Reserve Q1 committed work
 */
function reserveQ1Committed(rankedProjects, dependencyGraph, verbose = false) {
  const committed = [
    'OP-000',   // Claude Enterprise expansion (Phase 1)
    'OP-011',   // Marketplace expansion
    'OP-012',   // Leave Planning Tool (Forever Code - 80% capacity)
    'OP-013',   // Case Management (Forever Code - 80% capacity)
    'OP-008'    // Law2Engine prototype continuation
  ];

  const projects = [];
  let totalEffort = 72;  // Consume full Q1 capacity

  committed.forEach(id => {
    const project = rankedProjects.find(p => p.id === id);
    if (project) {
      projects.push(id);
      if (verbose) {
        console.log(`   ✅ Q1 Committed: ${id} (${project.name})`);
      }
    }
  });

  return {
    projects,
    projectIds: committed,
    effort: totalEffort
  };
}

/**
 * Schedule projects for a specific quarter
 */
function scheduleQuarter(quarter, remainingProjects, schedule, dependencyGraph, completedProjects, verbose) {
  const quarterData = schedule[quarter];
  let availableCapacity = quarterData.capacity;

  if (verbose) {
    console.log(`\n   📅 Scheduling ${quarter}:`);
    console.log(`      Available capacity: ${availableCapacity} eng-days`);
  }

  for (const project of remainingProjects) {
    // Skip if already scheduled
    if (schedule.Q1.projects.includes(project.id) ||
        schedule.Q2.projects.includes(project.id) ||
        schedule.Q3.projects.includes(project.id) ||
        schedule.Q4.projects.includes(project.id)) {
      continue;
    }

    // Check if HARD dependencies are met
    const projectNode = dependencyGraph[project.id];
    if (!projectNode) continue;

    const hardDeps = projectNode.dependsOn
      .filter(d => d.type === 'HARD')
      .map(d => d.project);

    const depsMet = hardDeps.every(dep => completedProjects.includes(dep));

    if (!depsMet) {
      if (verbose) {
        console.log(`      ⏸️  ${project.id}: Blocked by ${hardDeps.filter(d => !completedProjects.includes(d)).join(', ')}`);
      }
      continue;
    }

    // Estimate effort (use 60 days default if not specified)
    const effort = getProjectEffort(project.id, dependencyGraph);

    // Check if fits in available capacity
    if (effort <= availableCapacity) {
      quarterData.projects.push(project.id);
      quarterData.potential.push(project.id);
      quarterData.allocated += effort;
      availableCapacity -= effort;
      completedProjects.push(project.id);

      if (verbose) {
        console.log(`      ✅ ${project.id}: Scheduled (${effort} days, ${availableCapacity} remaining)`);
      }
    } else {
      if (verbose) {
        console.log(`      ❌ ${project.id}: Insufficient capacity (needs ${effort}, have ${availableCapacity})`);
      }
    }
  }

  quarterData.buffer = availableCapacity;

  if (verbose) {
    console.log(`      Final: ${quarterData.projects.length} projects, ${quarterData.allocated}/${quarterData.capacity} days, ${quarterData.buffer}-day buffer`);
  }
}

/**
 * Get project effort estimate
 */
function getProjectEffort(projectId, dependencyGraph) {
  // Default effort estimates by project type
  const defaultEfforts = {
    'OP-000': 15,   // Phase 1 rollout
    'OP-001': 180,  // Full platform
    'OP-002': 22,   // Pilot
    'OP-004': 50,   // Generator start
    'OP-005': 60,   // Phase 1
    'OP-006': 85,   // Accelerator
    'OP-008': 90,   // GA launch
    'OP-011': 40,   // Phase 2
    'OP-012': 50,   // V1
    'OP-013': 60,   // Enhancements
    'OP-014': 48    // Production complete
  };

  return defaultEfforts[projectId] || 60;
}

/**
 * Get deferral reason for a project
 */
function getDeferralReason(projectId, dependencyGraph, completedProjects) {
  const projectNode = dependencyGraph[projectId];
  if (!projectNode) {
    return 'Project not in dependency graph';
  }

  const hardDeps = projectNode.dependsOn
    .filter(d => d.type === 'HARD')
    .map(d => d.project);

  const unmetDeps = hardDeps.filter(dep => !completedProjects.includes(dep));

  if (unmetDeps.length > 0) {
    return `Blocked by: ${unmetDeps.join(', ')}`;
  }

  return 'Insufficient capacity in 2026';
}

/**
 * Helper: Get projects that can start in a given quarter
 */
function getStartableInQuarter(quarter, rankedProjects, schedule, dependencyGraph) {
  const completedProjects = [];

  // Accumulate completed projects up to this quarter
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const quarterIndex = quarters.indexOf(quarter);

  for (let i = 0; i <= quarterIndex; i++) {
    const q = quarters[i];
    if (schedule[q]) {
      completedProjects.push(...schedule[q].projects);
    }
  }

  // Filter projects that can start
  return rankedProjects.filter(project => {
    const projectNode = dependencyGraph[project.id];
    if (!projectNode) return true;

    const hardDeps = projectNode.dependsOn
      .filter(d => d.type === 'HARD')
      .map(d => d.project);

    return hardDeps.every(dep => completedProjects.includes(dep));
  });
}

module.exports = {
  scheduleProjects,
  getCapacityModel,
  getStartableInQuarter
};
