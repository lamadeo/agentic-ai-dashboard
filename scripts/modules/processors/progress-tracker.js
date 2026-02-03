/**
 * Progress Tracker Module
 *
 * Three-tier progress analysis for AI projects:
 * - Tier 1: Phase completion markers from project markdown
 * - Tier 2: Behavioral signals from dashboard metrics
 * - Tier 3: GitHub repository analysis (commits, PRs, issues, releases)
 *
 * Smart detection: Auto-analyzes repos only for in-progress/committed projects
 */

const { Octokit } = require('@octokit/rest');

/**
 * Main entry point: Track progress for all projects
 * @param {Object} params
 * @param {Array} params.projects - Projects from project-ingestor
 * @param {Object} params.dashboardMetrics - Metrics from dashboard-data-ingestor
 * @param {Object} params.schedule - Schedule from constraint-scheduler
 * @param {Date} params.currentDate - Current date (or override for testing)
 * @param {String} params.githubToken - Optional GitHub API token
 * @param {Boolean} params.verbose - Enable verbose logging
 * @returns {Promise<Array>} Array of progress reports
 */
async function trackProgress({
  projects,
  dashboardMetrics,
  schedule,
  currentDate = new Date(),
  githubToken = process.env.GITHUB_TOKEN,
  verbose = false
}) {
  if (verbose) {
    console.log('\n🔍 Progress Tracker: Starting analysis...');
    console.log(`   Projects: ${projects.length}`);
    console.log(`   Current Date: ${currentDate.toISOString().split('T')[0]}`);
  }

  const progressReports = [];

  for (const project of projects) {
    if (verbose) console.log(`\n   Analyzing ${project.id}...`);

    const report = await analyzeProjectProgress(
      project,
      dashboardMetrics,
      schedule,
      currentDate,
      githubToken,
      verbose
    );

    progressReports.push(report);
  }

  if (verbose) {
    console.log(`\n✅ Progress Tracker: Complete`);
    console.log(`   Generated ${progressReports.length} progress reports`);
  }

  return progressReports;
}

/**
 * Analyze progress for a single project
 */
async function analyzeProjectProgress(
  project,
  dashboardMetrics,
  schedule,
  currentDate,
  githubToken,
  verbose
) {
  // Tier 1: Phase completion analysis
  const tier1 = analyzePhaseCompletion(project, currentDate, verbose);

  // Tier 2: Behavioral signal analysis
  const tier2 = analyzeBehavioralSignals(project, dashboardMetrics, verbose);

  // Tier 3: GitHub repo analysis (smart detection)
  let tier3 = null;
  const repoUrl = project.repoUrl || PROJECT_REPO_MAPPINGS[project.id];
  if (repoUrl && shouldAnalyzeRepo(project, schedule, currentDate)) {
    tier3 = await analyzeGitHubRepo(
      repoUrl,
      project.startDate || new Date('2026-01-01'),
      githubToken,
      verbose
    );
  }

  // Aggregate progress
  const overallProgress = aggregateProgress(tier1, tier2, tier3);

  // Classify status
  const plannedQuarter = getProjectQuarter(project, schedule);
  const currentQuarter = getCurrentQuarter(currentDate);
  const actualProgress = classifyProgressStatus(overallProgress, plannedQuarter, currentQuarter);

  // Extract blockers
  const blockers = extractBlockers(project, tier3);

  // Calculate velocity
  const velocity = calculateVelocity(tier3);

  return {
    projectId: project.id,
    projectName: project.name,
    overallProgress,
    progressBreakdown: {
      phases: tier1,
      behavioral: tier2,
      repo: tier3
    },
    status: project.status,
    plannedQuarter: `Q${plannedQuarter}`,
    currentQuarter: `Q${currentQuarter}`,
    actualProgress,
    blockers,
    velocity,
    lastAnalyzed: new Date().toISOString(),
    metadata: {
      tier1Available: tier1.confidence !== 'none',
      tier2Available: tier2.confidence !== 'none',
      tier3Available: tier3 !== null && tier3.confidence !== 'none',
      confidence: determineOverallConfidence(tier1, tier2, tier3)
    }
  };
}

/**
 * TIER 1: Phase Completion Analysis
 *
 * Parses project markdown to detect:
 * - Phase markers (### Phase X, **Phase X:**, numbered lists)
 * - Completion indicators (✓ COMPLETE, ✓ DONE, status=completed, ✅ in tables)
 * - Timeline/quarter information (Q1, Q2, Q3, Q4)
 *
 * Calculates progress and determines if on track.
 */
function analyzePhaseCompletion(project, currentDate, verbose) {
  // Get content from project (may need to read markdown files)
  const content = project.content || project.summary || '';

  // Extract phases from structured data (already parsed by ingestor)
  const structuredPhases = project.phases || [];

  // Also parse markdown content for additional phase markers
  const markdownPhases = parseMarkdownPhases(content);

  // Parse tables for task completion (✅ markers)
  const tableTasks = parseTableTasks(content);

  // Combine all phase/task data
  const allPhases = [
    ...structuredPhases.map(p => ({
      ...p,
      source: 'structured',
      completed: isPhaseComplete(p)
    })),
    ...markdownPhases.map(p => ({
      ...p,
      source: 'markdown',
      completed: isPhaseComplete(p)
    })),
    ...tableTasks.map(t => ({
      name: t.name,
      timeline: t.quarter,
      source: 'table',
      completed: t.completed
    }))
  ];

  // Deduplicate phases (prefer structured > table > markdown)
  const uniquePhases = deduplicatePhases(allPhases);

  const totalPhases = uniquePhases.length;

  if (totalPhases === 0) {
    if (verbose) console.log(`      Tier 1: No phases found`);
    return {
      progress: 0,
      completedPhases: 0,
      totalPhases: 0,
      onTrack: null,
      confidence: 'none'
    };
  }

  // Count completed phases
  const completedPhases = uniquePhases.filter(p => p.completed).length;

  // Calculate progress
  const phaseProgress = Math.round((completedPhases / totalPhases) * 100);

  // Determine if on track
  const currentQuarter = getCurrentQuarter(currentDate);
  const expectedComplete = uniquePhases.filter(phase => {
    const phaseQuarter = extractQuarterFromTimeline(phase.timeline || phase.name);
    return phaseQuarter && phaseQuarter <= currentQuarter;
  }).length;

  const onTrack = expectedComplete === 0 ? null : (completedPhases >= expectedComplete);

  // Confidence based on data sources
  const hasStructured = uniquePhases.some(p => p.source === 'structured');
  const hasTable = uniquePhases.some(p => p.source === 'table');
  const confidence = hasStructured ? 'high' : (hasTable ? 'medium' : 'low');

  if (verbose) {
    console.log(`      Tier 1: ${completedPhases}/${totalPhases} phases complete (${phaseProgress}%) - ${onTrack === null ? 'UNKNOWN' : (onTrack ? 'ON TRACK' : 'BEHIND')}`);
    console.log(`              Sources: ${uniquePhases.map(p => p.source).join(', ')} | Confidence: ${confidence}`);
  }

  return {
    progress: phaseProgress,
    completedPhases,
    totalPhases,
    onTrack,
    confidence
  };
}

/**
 * Parse markdown content for phase markers
 */
function parseMarkdownPhases(content) {
  const phases = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Match phase headers: ### Phase X, **Phase X:**, numbered phases
    const phasePatterns = [
      /^###\s+(Phase\s+\d+.*)/i,
      /^\*\*\s*(Phase\s+\d+:.*)\*\*/i,
      /^\d+\.\s+\*\*(Phase\s+\d+.*)\*\*/i,
      /^#+\s+(.*?Phase.*)/i
    ];

    for (const pattern of phasePatterns) {
      const match = line.match(pattern);
      if (match) {
        const phaseName = match[1].trim();

        // Look ahead for timeline info in next few lines
        let timeline = '';
        for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
          const nextLine = lines[j].trim();
          if (nextLine.match(/Q[1-4]/)) {
            timeline = nextLine;
            break;
          }
        }

        phases.push({
          name: phaseName,
          timeline: timeline,
          description: ''
        });
        break;
      }
    }
  }

  return phases;
}

/**
 * Parse markdown tables for tasks with quarter columns
 */
function parseTableTasks(content) {
  const tasks = [];
  const lines = content.split('\n');

  let inTable = false;
  let headerIndices = { q1: -1, q2: -1, q3: -1, q4: -1, name: -1 };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detect table header with Q1, Q2, Q3, Q4 columns
    if (line.includes('|') && (line.includes('Q1') || line.includes('Q2'))) {
      const headers = line.split('|').map(h => h.trim().toLowerCase());
      headerIndices.q1 = headers.indexOf('q1');
      headerIndices.q2 = headers.indexOf('q2');
      headerIndices.q3 = headers.indexOf('q3');
      headerIndices.q4 = headers.indexOf('q4');

      // Find name/description column (usually first or second)
      for (let j = 0; j < headers.length; j++) {
        if (headers[j] && !headers[j].match(/^q[1-4]$/) && headers[j].length > 2) {
          headerIndices.name = j;
          break;
        }
      }

      inTable = true;
      continue;
    }

    // Skip separator row
    if (line.match(/^\|[\s\-:]+\|/)) {
      continue;
    }

    // Parse table rows
    if (inTable && line.includes('|')) {
      const cells = line.split('|').map(c => c.trim());

      if (cells.length > Math.max(headerIndices.q1, headerIndices.q4) && headerIndices.name >= 0) {
        const taskName = cells[headerIndices.name];

        // Check which quarter has checkmark
        const quarters = ['q1', 'q2', 'q3', 'q4'];
        for (const quarter of quarters) {
          const idx = headerIndices[quarter];
          if (idx >= 0 && idx < cells.length) {
            const cell = cells[idx];
            if (cell.includes('✅') || cell.includes('✓')) {
              tasks.push({
                name: taskName,
                quarter: quarter.toUpperCase(),
                completed: true
              });
            } else if (cell && cell.trim().length > 0) {
              // Non-empty cell without checkmark = planned but not complete
              tasks.push({
                name: taskName,
                quarter: quarter.toUpperCase(),
                completed: false
              });
            }
          }
        }
      }
    } else if (inTable) {
      // Exit table
      inTable = false;
    }
  }

  return tasks;
}

/**
 * Check if a phase is complete based on various markers
 */
function isPhaseComplete(phase) {
  const name = (phase.name || '').toLowerCase();
  const description = (phase.description || '').toLowerCase();
  const status = (phase.status || '').toLowerCase();

  // Check for completion markers
  return (
    name.includes('✓ complete') ||
    name.includes('✓ done') ||
    name.includes('✅') ||
    status === 'completed' ||
    status === 'done' ||
    description.includes('✓ complete') ||
    description.includes('completed') ||
    phase.completed === true
  );
}

/**
 * Deduplicate phases from multiple sources
 */
function deduplicatePhases(phases) {
  const seen = new Map();

  for (const phase of phases) {
    const key = normalizePhaseKey(phase.name);

    if (!seen.has(key)) {
      seen.set(key, phase);
    } else {
      // Prefer structured > table > markdown
      const existing = seen.get(key);
      const priority = { structured: 3, table: 2, markdown: 1 };

      if ((priority[phase.source] || 0) > (priority[existing.source] || 0)) {
        seen.set(key, phase);
      }
    }
  }

  return Array.from(seen.values());
}

/**
 * Normalize phase name for deduplication
 */
function normalizePhaseKey(name) {
  return (name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20);
}

/**
 * TIER 2: Behavioral Signal Analysis
 *
 * Maps projects to real dashboard metrics and calculates progress
 * based on actual adoption/usage data vs targets.
 *
 * Each project has:
 * - metrics: Dashboard paths to extract (e.g., 'claudeCode.activeUsers')
 * - targets: Goal values for each metric
 * - formula: How to calculate progress from metrics vs targets
 */
function analyzeBehavioralSignals(project, dashboardMetrics, verbose) {
  // Comprehensive behavioral mappings for all projects
  const BEHAVIORAL_MAPPINGS = {
    // OP-011: Claude Code Marketplace
    'OP-011': {
      metrics: {
        activeUsers: 'claudeCode.activeUsers',
        totalLines: 'claudeCode.totalLines',
        adoptionRate: 'claudeCode.engineeringAdoptionRate',
        licensedUsers: 'claudeCode.licensedUsers'
      },
      targets: {
        activeUsers: 60,       // 60-80% of engineering (goal: 60)
        adoptionRate: 60,       // 60% adoption target
        totalLines: 1000000,    // 1M lines milestone
        licensedUsers: 83       // Full engineering team
      },
      formula: 'adoption'  // Weighted average of adoption metrics
    },

    // OP-008: Engineering Quality (Law2Engine - COMPLETED project)
    'OP-008': {
      metrics: {
        githubUsers: 'githubCopilot.activeUsers',
        claudeCodeUsers: 'claudeCode.activeUsers',
        combinedUsers: 'claudeCode.combinedCodingToolsUsers',
        combinedAdoption: 'claudeCode.combinedCodingToolsAdoption'
      },
      targets: {
        combinedUsers: 70,      // 70+ engineers using AI coding tools
        combinedAdoption: 85    // 85% combined adoption
      },
      formula: 'adoption'
    },

    // OP-000: AI Strategy & Governance
    'OP-000': {
      metrics: {
        claudeEnterpriseUsers: 'claudeEnterprise.activeUsers',
        claudeCodeUsers: 'claudeCode.activeUsers',
        totalEmployees: 'summary.totalEmployees'
      },
      targets: {
        claudeEnterpriseUsers: 150,  // 150-300 seat target
        claudeCodeUsers: 60           // Engineering coverage
      },
      formula: 'adoption'
    },

    // OP-001: Deal Intelligence Platform
    'OP-001': {
      metrics: {
        salesConversations: 'claudeEnterprise.totalConversations',  // Sales team usage
        artifacts: 'claudeEnterprise.totalArtifacts',                // Deal analysis artifacts
        projectsCreated: 'claudeEnterprise.totalProjects'            // Deal workspaces
      },
      targets: {
        salesConversations: 2000,     // Sales team active usage
        artifacts: 200,                // Deal analysis outputs
        projectsCreated: 100           // Deal-specific projects
      },
      formula: 'usage'  // Usage-based progress
    },

    // OP-002: Operations Knowledge Agent
    'OP-002': {
      metrics: {
        conversations: 'claudeEnterprise.totalConversations',
        artifacts: 'claudeEnterprise.totalArtifacts',
        filesUploaded: 'claudeEnterprise.totalFilesUploaded'
      },
      targets: {
        conversations: 3000,      // Ops team conversations
        artifacts: 300,           // Knowledge artifacts
        filesUploaded: 4000       // Document uploads
      },
      formula: 'usage'
    },

    // OP-005: Lead Generation / BDR Intelligence
    'OP-005': {
      metrics: {
        conversations: 'claudeEnterprise.totalConversations',
        messages: 'claudeEnterprise.totalMessages',
        conversationsPerUser: 'claudeEnterprise.conversationsPerUser'
      },
      targets: {
        conversations: 4000,            // BDR team usage
        messages: 40000,                 // Lead research depth
        conversationsPerUser: 80         // Per-BDR productivity
      },
      formula: 'usage'
    },

    // OP-014: Operational Data Foundation
    'OP-014': {
      metrics: {
        totalUsers: 'claudeEnterprise.activeUsers',
        totalMessages: 'claudeEnterprise.totalMessages',
        filesUploaded: 'claudeEnterprise.totalFilesUploaded'
      },
      targets: {
        totalUsers: 150,          // Broad org adoption
        totalMessages: 60000,      // Data interaction volume
        filesUploaded: 8000        // Data file uploads
      },
      formula: 'usage'
    }
  };

  const mapping = BEHAVIORAL_MAPPINGS[project.id];

  if (!mapping) {
    if (verbose) console.log(`      Tier 2: No behavioral mapping for ${project.id}`);
    return { progress: 0, signals: {}, confidence: 'none' };
  }

  // Extract actual values from dashboard
  const actualValues = {};
  const signals = {};

  for (const [key, path] of Object.entries(mapping.metrics)) {
    const value = getNestedValue(dashboardMetrics, path);
    if (value !== undefined && value !== null) {
      actualValues[key] = value;
      signals[key] = value;
    }
  }

  if (Object.keys(actualValues).length === 0) {
    if (verbose) console.log(`      Tier 2: No metrics found in dashboard`);
    return { progress: 0, signals: {}, confidence: 'none' };
  }

  // Calculate progress based on formula type
  let progress = 0;
  const targets = mapping.targets;

  if (mapping.formula === 'adoption') {
    // Adoption formula: weighted average of (actual / target) * 100
    const percentages = [];
    for (const [key, target] of Object.entries(targets)) {
      if (actualValues[key] !== undefined) {
        const pct = Math.min(100, (actualValues[key] / target) * 100);
        percentages.push(pct);
      }
    }
    progress = percentages.length > 0
      ? Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length)
      : 0;

  } else if (mapping.formula === 'usage') {
    // Usage formula: weighted average with exponential scaling for growth
    const percentages = [];
    for (const [key, target] of Object.entries(targets)) {
      if (actualValues[key] !== undefined) {
        // Exponential scaling: 50% at 50% of target, 100% at 100%, 150% at 200%
        const ratio = actualValues[key] / target;
        const pct = Math.min(150, ratio * 100);
        percentages.push(pct);
      }
    }
    progress = percentages.length > 0
      ? Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length)
      : 0;
  }

  // Cap at 100% for progress tracking (can exceed in signals)
  const cappedProgress = Math.min(100, progress);

  // Confidence based on number of signals
  const signalCount = Object.keys(actualValues).length;
  const confidence = signalCount >= 3 ? 'high' : (signalCount >= 2 ? 'medium' : 'low');

  if (verbose) {
    console.log(`      Tier 2: ${cappedProgress}% from ${signalCount} signals (${mapping.formula} formula)`);
    Object.entries(actualValues).forEach(([key, value]) => {
      const target = targets[key];
      const pct = target ? Math.round((value / target) * 100) : 0;
      console.log(`              ${key}: ${value} / ${target || '?'} (${pct}%)`);
    });
  }

  return {
    progress: cappedProgress,
    signals: signals,
    confidence: confidence
  };
}

/**
 * Extract nested value from object using dot notation
 * Example: getNestedValue(obj, 'claudeCode.activeUsers')
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * TIER 3: GitHub Repository Analysis
 *
 * Analyzes GitHub repos for commit activity, PR velocity, and roadmap progress.
 * Maps projects to known repositories and calculates progress from activity metrics.
 */

// Project-to-repository mappings (known repos)
const PROJECT_REPO_MAPPINGS = {
  'OP-011': 'https://github.com/techco/claude-code.marketplace',  // Note: dot in name
  'OP-008': 'https://github.com/techco/law2engine',
  'OP-000': 'https://github.com/techco/as-ai-dashboard',  // This dashboard
  // Add more mappings as projects get repos
};

async function analyzeGitHubRepo(repoUrl, projectStartDate, githubToken, verbose) {
  if (!repoUrl || !githubToken) {
    if (verbose) console.log(`      Tier 3: Skipped (no repo URL or token)`);
    return null;
  }

  try {
    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      if (verbose) console.log(`      Tier 3: Invalid GitHub URL`);
      return null;
    }

    const { owner, repo } = parsed;
    const octokit = new Octokit({ auth: githubToken });

    // Verify repo exists
    try {
      await octokit.rest.repos.get({ owner, repo });
    } catch (error) {
      if (verbose) console.log(`      Tier 3: Repo not accessible (${error.status})`);
      return null;
    }

    // Fetch commits since project start
    const { data: commits } = await octokit.rest.repos.listCommits({
      owner,
      repo,
      since: projectStartDate.toISOString(),
      per_page: 100
    });

    // Fetch all PRs (to calculate merge rate)
    const { data: prs } = await octokit.rest.pulls.list({
      owner,
      repo,
      state: 'all',
      per_page: 100
    });

    // Fetch issues (exclude PRs)
    const { data: allIssues } = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      state: 'all',
      per_page: 100
    });
    const issues = allIssues.filter(i => !i.pull_request);

    // Fetch releases
    const { data: releases } = await octokit.rest.repos.listReleases({
      owner,
      repo,
      per_page: 20
    });

    // Analyze roadmap files for task completion
    const roadmapProgress = await analyzeRoadmapFiles(octokit, owner, repo, verbose);

    // Calculate metrics
    const commitFrequency = calculateCommitFrequency(commits, projectStartDate);
    const velocity = calculateRepoVelocity(commits, prs);

    // Calculate progress from multiple signals
    const progress = calculateGitHubProgress({
      commits: commits.length,
      prs: prs.filter(pr => pr.merged_at).length,
      releases: releases.length,
      roadmapProgress: roadmapProgress?.progress,
      velocity,
      projectStartDate
    });

    // Get last commit date for recency
    const lastCommitDate = commits.length > 0
      ? commits[0].commit.author.date
      : null;

    // Calculate weekly commit average
    const daysSinceStart = (Date.now() - projectStartDate.getTime()) / (1000 * 60 * 60 * 24);
    const weeksSinceStart = Math.max(1, daysSinceStart / 7);
    const weeklyCommitAvg = commits.length / weeksSinceStart;

    if (verbose) {
      console.log(`      Tier 3: ${progress}% (${commits.length} commits, ${prs.length} PRs, velocity: ${velocity})`);
      if (roadmapProgress) {
        console.log(`              Roadmap: ${roadmapProgress.completedTasks}/${roadmapProgress.totalTasks} tasks (${roadmapProgress.file})`);
      }
    }

    return {
      progress,
      activity: {
        commitCount: commits.length,
        prCount: prs.length,
        issueCount: issues.length,
        releaseCount: releases.length,
        lastCommitDate,
        weeklyCommitAvg: Math.round(weeklyCommitAvg * 10) / 10
      },
      roadmapProgress: roadmapProgress || { tasksTotal: 0, tasksCompleted: 0, tasksInProgress: 0 },
      velocity,
      confidence: 'high'
    };

  } catch (error) {
    if (verbose) console.log(`      Tier 3: Error - ${error.message}`);
    return null;
  }
}

/**
 * Calculate progress from GitHub activity metrics
 */
function calculateGitHubProgress(metrics) {
  const {
    commits,
    prs,
    releases,
    roadmapProgress,
    velocity,
    projectStartDate
  } = metrics;

  // If roadmap progress available, use it with high weight
  if (roadmapProgress !== null && roadmapProgress !== undefined) {
    return roadmapProgress;
  }

  // Otherwise, calculate from activity metrics
  const signals = [];

  // Commit activity (0-40 points)
  // 0-10 commits = 0-20%, 10-50 commits = 20-40%, 50+ = 40%
  if (commits > 0) {
    const commitScore = Math.min(40, (commits / 50) * 40);
    signals.push(commitScore);
  }

  // PR activity (0-30 points)
  // 0-5 PRs = 0-15%, 5-20 PRs = 15-30%, 20+ = 30%
  if (prs > 0) {
    const prScore = Math.min(30, (prs / 20) * 30);
    signals.push(prScore);
  }

  // Release activity (0-30 points)
  // 1 release = 15%, 2 releases = 30%, 3+ = 30%
  if (releases > 0) {
    const releaseScore = Math.min(30, (releases / 2) * 30);
    signals.push(releaseScore);
  }

  // Velocity bonus (0-10 points)
  if (velocity === 'high') {
    signals.push(10);
  } else if (velocity === 'medium') {
    signals.push(5);
  }

  // Average all signals
  return signals.length > 0
    ? Math.round(signals.reduce((a, b) => a + b, 0) / signals.length * 100 / 40)  // Normalize to 100%
    : 0;
}

/**
 * Smart detection: Should we analyze this repo?
 */
function shouldAnalyzeRepo(project, schedule, currentDate) {
  // Check if project has repo URL or is in mappings
  const hasRepo = project.repoUrl || PROJECT_REPO_MAPPINGS[project.id];
  if (!hasRepo) return false;

  // Always analyze active projects
  if (project.status === 'in-progress' || project.status === 'committed') {
    return true;
  }

  // Check if scheduled for current or past quarter
  const projectQuarter = getProjectQuarter(project, schedule);
  const currentQuarter = getCurrentQuarter(currentDate);

  return projectQuarter <= currentQuarter;
}

/**
 * Aggregate progress across all tiers
 */
function aggregateProgress(tier1, tier2, tier3) {
  const tiers = [];

  // Tier 1: Phase markers (always available)
  if (tier1.confidence !== 'none') {
    tiers.push({ value: tier1.progress, weight: 0.4 });
  }

  // Tier 2: Behavioral signals
  if (tier2.confidence !== 'none') {
    tiers.push({ value: tier2.progress, weight: 0.3 });
  }

  // Tier 3: GitHub repo
  if (tier3 && tier3.confidence !== 'none') {
    tiers.push({ value: tier3.progress, weight: 0.3 });
  }

  // Reweight if Tier 3 unavailable
  if (!tier3 || tier3.confidence === 'none') {
    if (tiers[0]) tiers[0].weight = 0.5;
    if (tiers[1]) tiers[1].weight = 0.5;
  }

  // Calculate weighted average
  const totalWeight = tiers.reduce((sum, t) => sum + t.weight, 0);
  const weightedSum = tiers.reduce((sum, t) => sum + (t.value * t.weight), 0);

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

/**
 * Classify progress status
 */
function classifyProgressStatus(overallProgress, plannedQuarter, currentQuarter) {
  if (plannedQuarter > currentQuarter) {
    return 'on-track'; // Not started yet
  }

  const expectedProgress = calculateExpectedProgress(plannedQuarter, currentQuarter);
  const variance = overallProgress - expectedProgress;

  if (variance > 20) return 'ahead';
  if (variance > -10) return 'on-track';
  if (variance > -30) return 'behind';
  return 'at-risk';
}

// ============================================================================
// HELPER FUNCTIONS (Stubs - to be implemented)
// ============================================================================

function getCurrentQuarter(date) {
  return Math.ceil((date.getMonth() + 1) / 3);
}

function getProjectQuarter(project, schedule) {
  // Extract quarter from schedule
  for (const [quarter, data] of Object.entries(schedule)) {
    if (data.projects?.includes(project.id)) {
      return parseInt(quarter.replace('Q', ''));
    }
  }
  return 1; // Default Q1
}

function extractQuarterFromTimeline(timeline) {
  if (!timeline) return null;
  const match = timeline.match(/Q(\d)/);
  return match ? parseInt(match[1]) : null;
}

function extractMetrics(dashboardMetrics, metricPaths) {
  // TODO: Implement metric extraction from dashboard data
  return {};
}

function parseGitHubUrl(url) {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  return match ? { owner: match[1], repo: match[2].replace('.git', '') } : null;
}

async function analyzeRoadmapFiles(octokit, owner, repo, verbose) {
  const roadmapFiles = ['README.md', 'ROADMAP.md', 'PLAN.md', 'docs/ROADMAP.md'];

  for (const path of roadmapFiles) {
    try {
      const { data } = await octokit.rest.repos.getContent({ owner, repo, path });
      const content = Buffer.from(data.content, 'base64').toString('utf8');

      const totalTasks = (content.match(/- \[[ x]\]/gi) || []).length;
      const completedTasks = (content.match(/- \[x\]/gi) || []).length;

      if (totalTasks > 0) {
        return {
          file: path,
          totalTasks,
          completedTasks,
          progress: Math.round((completedTasks / totalTasks) * 100)
        };
      }
    } catch (error) {
      continue;
    }
  }

  return null;
}

function calculateCommitFrequency(commits, projectStartDate) {
  if (commits.length === 0) return 0;

  const now = Date.now();
  const start = projectStartDate ? projectStartDate.getTime() : Date.now();
  const daySpan = (now - start) / (1000 * 60 * 60 * 24);

  return daySpan > 0 ? Math.round((commits.length / daySpan) * 100) / 100 : 0;
}

function calculateRepoVelocity(commits, prs) {
  const now = Date.now();
  const twoWeeksAgo = now - (14 * 24 * 60 * 60 * 1000);

  const recentCommits = commits.filter(c =>
    new Date(c.commit.author.date).getTime() > twoWeeksAgo
  ).length;

  const recentPRs = prs.filter(pr =>
    new Date(pr.created_at).getTime() > twoWeeksAgo
  ).length;

  const commitRate = recentCommits / 2;
  const prRate = recentPRs / 2;

  if (commitRate > 10 || prRate > 3) return 'high';
  if (commitRate > 5 || prRate > 1) return 'medium';
  return 'low';
}

function calculateVelocity(tier3) {
  return tier3?.velocity || 'unknown';
}

function extractBlockers(project, tier3) {
  const blockers = [];

  // Extract from project risks
  if (project.risks) {
    blockers.push(...project.risks.map(r => r.description || r));
  }

  // Extract from GitHub issues
  if (tier3?.activity?.issues?.open > 0) {
    blockers.push(`${tier3.activity.issues.open} open issues`);
  }

  return blockers;
}

function determineOverallConfidence(tier1, tier2, tier3) {
  const availableTiers = [tier1, tier2, tier3].filter(t => t && t.confidence !== 'none');

  if (availableTiers.length === 3) return 'high';
  if (availableTiers.length === 2) return 'medium';
  if (availableTiers.length === 1) return 'low';
  return 'none';
}

function calculateExpectedProgress(plannedQuarter, currentQuarter) {
  if (plannedQuarter > currentQuarter) return 0;
  if (plannedQuarter === currentQuarter) return 50;
  return 100;
}

module.exports = {
  trackProgress,
  analyzePhaseCompletion,
  analyzeBehavioralSignals,
  shouldAnalyzeRepo
};
