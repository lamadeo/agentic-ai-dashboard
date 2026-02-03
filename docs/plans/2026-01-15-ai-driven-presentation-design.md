# AI-Driven Dynamic Presentation Generation System

**Design Document**
**Date**: January 15, 2026
**Author**: Claude Sonnet 4.5 (with Luis F. Amadeo)
**Status**: Design Complete - Ready for Implementation
**Related PR**: #37 (Annual Plan UI Integration)

---

## Executive Summary

This design replaces the current hardcoded 9-slide annual plan presentation with a fully dynamic, AI-generated presentation system that adapts to temporal context, project progress, and strategic pivots. The system uses Claude API to determine slide count, titles, and content based on where we are in the fiscal year and how projects are progressing.

**Key Capabilities**:
- **Temporal Intelligence**: Understands "where we are" in fiscal year (beginning vs. mid vs. end)
- **Progress Tracking**: Three-tier analysis (phase markers, behavioral metrics, GitHub repo activity)
- **Narrative Flexibility**: 5 narrative types that shift presentation focus based on context
- **AI-Generated Structure**: Claude API determines optimal slide count (5-15) and types
- **Smart GitHub Integration**: Automatic repo analysis for active projects only

**Example Scenarios**:
- **January 2026**: "NEW_PLAN" narrative, 9 forward-looking slides, focus on strategy and roadmap
- **July 2026**: "MID_YEAR_CHECKPOINT" narrative, 8 slides showing H1 achievements + H2 plan
- **October 2026**: "COURSE_CORRECTION" narrative, 9 slides with gap analysis and pivot strategy if behind

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [System Architecture](#2-system-architecture)
3. [Module 1: Progress Tracker](#3-module-1-progress-tracker)
4. [Module 2: AI Context Analyzer](#4-module-2-ai-context-analyzer)
5. [Module 3: AI Presentation Generator](#5-module-3-ai-presentation-generator)
6. [Data Flow](#6-data-flow)
7. [AI Project Markdown Standards](#7-ai-project-markdown-standards)
8. [GitHub Integration](#8-github-integration)
9. [UI Changes](#9-ui-changes)
10. [Error Handling & Fallbacks](#10-error-handling--fallbacks)
11. [Testing Strategy](#11-testing-strategy)
12. [Implementation Plan](#12-implementation-plan)
13. [Success Metrics](#13-success-metrics)

---

## 1. Problem Statement

### Current State

The annual plan presentation is **mostly hardcoded**:
- ✅ Slide 9 (Portfolio): Uses dynamic data from `ai-projects-portfolio.json` (fixed in PR #37)
- ❌ Slides 1-8: Hardcoded content in `AnnualPlanPresentation.jsx` (1,900 lines)
- ❌ Fixed structure: Always 9 slides regardless of context
- ❌ No temporal awareness: Same slides in January vs. July vs. December
- ❌ No progress tracking: Cannot show "planned vs. actual"
- ❌ Manual updates: Requires code changes to reflect reality

### User Requirements

> "The entire presentation, even how many slides are needed and their titles and content is FULLY DYNAMIC. The AI must have an agent that first assesses what needs to be generated for an annual plan, and should use the CURRENT DATE and how much is left in the year (Jan-December fiscal year) and the progress of each AI Project in scope for the annual plan, to then generate a presentation that says what has been done so far per ai-project and what is left to do for the remainder of the year."

> "If the annual plan is generated at the beginning of the year it is the new annual plan, but if it is regenerated a quarter later, it is the annual plan from the point of view of what was planned, what status progress is so far, and what to do next including pivoting or changing direction based on all the context analyzed."

### Success Criteria

1. **Dynamic Structure**: Slide count, titles, and content adapt to temporal context
2. **Progress Awareness**: System tracks actual vs. planned progress
3. **Narrative Intelligence**: Presentation tells the right story for the current moment
4. **Zero Hardcoding**: No business logic or content in React components
5. **AI-Powered**: Claude API determines presentation structure and emphasis

---

## 2. System Architecture

### High-Level Pipeline

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ANNUAL PLAN PIPELINE (Enhanced)                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  PHASE 1: INGEST                                                         │
│  ├── Project Ingestor (project-ingestor.js)                             │
│  ├── Dashboard Data Ingestor (dashboard-data-ingestor.js)               │
│  └── [Existing modules...]                                              │
│                                                                           │
│  PHASE 2: ANALYZE                                                        │
│  └── Dependency Analyzer (dependency-analyzer.js)                       │
│                                                                           │
│  PHASE 3: SCORE                                                          │
│  └── Hybrid Scorer (hybrid-scorer.js)                                   │
│                                                                           │
│  PHASE 4: SCHEDULE                                                       │
│  └── Constraint Scheduler (constraint-scheduler.js)                     │
│                                                                           │
│  PHASE 5: PROGRESS [NEW]                                                 │
│  └── Progress Tracker (progress-tracker.js)                             │
│      ├── Tier 1: Phase completion markers                               │
│      ├── Tier 2: Behavioral metrics                                     │
│      └── Tier 3: GitHub repo analysis (smart detection)                 │
│                                                                           │
│  PHASE 6: AI ANALYZE [NEW]                                               │
│  └── AI Context Analyzer (ai-context-analyzer.js)                       │
│      ├── Temporal position analysis                                     │
│      ├── Project progress assessment                                    │
│      ├── Narrative determination                                        │
│      ├── Gap analysis                                                   │
│      └── Change detection                                               │
│                                                                           │
│  PHASE 7: GENERATE                                                       │
│  ├── Portfolio Generator (portfolio-generator.js)                       │
│  └── AI Presentation Generator (ai-presentation-generator.js) [NEW]     │
│      ├── Build context for Claude API                                   │
│      ├── Generate slide structure via AI                                │
│      ├── Populate slide content                                         │
│      └── Fallback to rule-based if API fails                            │
│                                                                           │
│  PHASE 8: OUTPUT                                                         │
│  └── Write JSON files (orchestrator updates)                            │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### Three New Modules

| Module | Purpose | Claude API? | Inputs | Outputs |
|--------|---------|-------------|--------|---------|
| **progress-tracker.js** | Three-tier progress analysis | Optional (for GitHub) | Projects, metrics, schedule, date | `progressReports[]` |
| **ai-context-analyzer.js** | Temporal & narrative analysis | No | Progress reports, schedule, scores, date | `contextAnalysis{}` |
| **ai-presentation-generator.js** | Dynamic slide generation | **Yes (Primary)** | Context analysis, progress, data | `presentation{}` |

### Module Dependencies

```
project-ingestor ──┐
dashboard-ingestor ─┼──> progress-tracker ──┐
constraint-scheduler ┘                        │
                                              ├──> ai-context-analyzer ──┐
hybrid-scorer ────────────────────────────────┘                          │
                                                                          ├──> ai-presentation-generator
portfolio-generator ──────────────────────────────────────────────────────┘
```

### Key Design Principles

1. **Modularity**: Each module is independent and testable
2. **Graceful Degradation**: System works even if GitHub API or Claude API fails
3. **Data-Driven**: All content comes from generated data, not hardcoded strings
4. **AI-Augmented**: AI determines structure, deterministic code populates content
5. **Backward Compatible**: Existing pipeline modules unchanged

---

## 3. Module 1: Progress Tracker

### Purpose

Generate comprehensive progress reports for each project using three-tier analysis:
1. **Tier 1**: Phase completion markers from project markdown
2. **Tier 2**: Behavioral signals from dashboard metrics
3. **Tier 3**: GitHub repository analysis (commits, PRs, issues, releases)

### File Location

`/scripts/modules/processors/progress-tracker.js`

### Input Parameters

```javascript
{
  projects: Array,           // From project-ingestor
  dashboardMetrics: Object,  // From dashboard-data-ingestor
  schedule: Object,          // From constraint-scheduler
  currentDate: Date,         // System date or override for testing
  githubToken: String,       // Optional: GitHub API token
  verbose: Boolean
}
```

### Three-Tier Analysis

#### Tier 1: Phase Completion Analysis

**Data Source**: Project markdown files (`/data/ai-projects/OP-*.md`)

**Parsing Logic**:
```javascript
function analyzePhaseCompletion(project) {
  const phases = project.phases || [];
  const totalPhases = phases.length;
  const completedPhases = phases.filter(p =>
    p.name.includes('✓ COMPLETE') ||
    p.name.includes('✓ DONE') ||
    p.status === 'completed'
  ).length;

  const phaseProgress = totalPhases > 0 ? (completedPhases / totalPhases) * 100 : 0;

  // Check timeline alignment
  const currentQuarter = getCurrentQuarter(currentDate);
  const phaseTimelines = phases.map(p => extractQuarterFromTimeline(p.timeline));
  const expectedComplete = phaseTimelines.filter(q => q <= currentQuarter).length;

  const onTrack = completedPhases >= expectedComplete;

  return {
    progress: Math.round(phaseProgress),
    completedPhases,
    totalPhases,
    onTrack,
    confidence: 'high'
  };
}
```

**Example Output**:
```javascript
{
  progress: 60,              // 3 of 5 phases complete
  completedPhases: 3,
  totalPhases: 5,
  onTrack: false,            // Expected 4 complete by now
  confidence: 'high'
}
```

#### Tier 2: Behavioral Signal Analysis

**Data Source**: Dashboard metrics (`ai-tools-data.json`)

**Mapping Logic**:
```javascript
const BEHAVIORAL_MAPPINGS = {
  'OP-011': {  // TechCo Inc Claude Marketplace
    metrics: ['claudeEnterprise.plugins', 'claudeEnterprise.commitCount', 'claudeEnterprise.adoptionWAU'],
    kpiTargets: { plugins: 30, adoptionWAU: 150, commits: 40 },
    progressFormula: (actual, targets) => {
      const pluginProgress = (actual.plugins / targets.plugins) * 100;
      const adoptionProgress = (actual.adoptionWAU / targets.adoptionWAU) * 100;
      const commitProgress = (actual.commits / targets.commits) * 100;
      return Math.min(100, (pluginProgress + adoptionProgress + commitProgress) / 3);
    }
  },
  'OP-005': {  // Lead Gen Agentic Intelligence
    metrics: ['bdrProductivity', 'leadQuality', 'responseRate'],
    kpiTargets: { productivity: 1.5, responseRate: 10 },
    progressFormula: (actual, targets) => {
      // Infer progress from early signals if project started
      if (!actual.productivity) return 0;  // Not started yet
      return Math.min(100, ((actual.productivity - 1) / (targets.productivity - 1)) * 100);
    }
  },
  // ... mappings for other projects
};

function analyzeBehavioralSignals(project, dashboardMetrics) {
  const mapping = BEHAVIORAL_MAPPINGS[project.id];
  if (!mapping) {
    return { progress: 0, signals: {}, confidence: 'none' };
  }

  // Extract actual values from dashboard
  const actualValues = extractMetrics(dashboardMetrics, mapping.metrics);

  // Calculate progress
  const progress = mapping.progressFormula(actualValues, mapping.kpiTargets);

  return {
    progress: Math.round(progress),
    signals: actualValues,
    confidence: actualValues.complete ? 'high' : 'medium'
  };
}
```

**Example Output**:
```javascript
{
  progress: 70,
  signals: {
    plugins: 4,
    adoptionWAU: 67,
    commits: 42
  },
  confidence: 'medium'
}
```

#### Tier 3: GitHub Repository Analysis

**Data Source**: GitHub API (via Octokit or MCP)

**Smart Detection Logic**:
```javascript
function shouldAnalyzeRepo(project, schedule, currentDate) {
  // Skip if no repo URL
  if (!project.repoUrl) return false;

  // Always analyze active projects
  if (project.status === 'in-progress' || project.status === 'committed') {
    return true;
  }

  // Check if scheduled for current or past quarter
  const projectQuarter = getProjectQuarter(project, schedule);
  const currentQuarter = getCurrentQuarter(currentDate);

  if (projectQuarter <= currentQuarter) {
    return true;
  }

  // Skip proposed future projects
  return false;
}
```

**GitHub Data Collection**:
```javascript
async function analyzeGitHubRepo(repoUrl, projectStartDate, githubToken) {
  const { owner, repo } = parseGitHubUrl(repoUrl);
  const octokit = new Octokit({ auth: githubToken });

  try {
    // Fetch commits since project start
    const commits = await octokit.rest.repos.listCommits({
      owner,
      repo,
      since: projectStartDate.toISOString(),
      per_page: 100
    });

    // Fetch PRs
    const prs = await octokit.rest.pulls.list({
      owner,
      repo,
      state: 'all',
      per_page: 100
    });

    // Fetch issues
    const issues = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      state: 'all',
      per_page: 100
    });

    // Fetch releases
    const releases = await octokit.rest.repos.listReleases({
      owner,
      repo,
      per_page: 20
    });

    // Parse roadmap/plan markdown files
    const roadmapProgress = await analyzeRoadmapFiles(octokit, owner, repo);

    return {
      commits: {
        total: commits.data.length,
        frequency: calculateCommitFrequency(commits.data),
        contributors: [...new Set(commits.data.map(c => c.author.login))].length
      },
      prs: {
        open: prs.data.filter(pr => pr.state === 'open').length,
        merged: prs.data.filter(pr => pr.merged_at).length,
        closed: prs.data.filter(pr => pr.state === 'closed' && !pr.merged_at).length
      },
      issues: {
        open: issues.data.filter(i => i.state === 'open' && !i.pull_request).length,
        closed: issues.data.filter(i => i.state === 'closed').length
      },
      releases: {
        total: releases.data.length,
        latest: releases.data[0]?.tag_name || null
      },
      roadmapProgress: roadmapProgress,
      velocity: calculateVelocity(commits.data, prs.data)
    };

  } catch (error) {
    console.warn(`GitHub API error for ${repoUrl}:`, error.message);
    return null;
  }
}
```

**Roadmap File Analysis**:
```javascript
async function analyzeRoadmapFiles(octokit, owner, repo) {
  const roadmapFiles = ['README.md', 'ROADMAP.md', 'PLAN.md', 'docs/ROADMAP.md'];

  for (const path of roadmapFiles) {
    try {
      const { data } = await octokit.rest.repos.getContent({ owner, repo, path });
      const content = Buffer.from(data.content, 'base64').toString('utf8');

      // Parse markdown checkboxes
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
      // File not found, try next
      continue;
    }
  }

  return null;
}
```

**Velocity Calculation**:
```javascript
function calculateVelocity(commits, prs) {
  const now = new Date();
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const recentCommits = commits.filter(c => new Date(c.commit.author.date) > twoWeeksAgo);
  const recentPRs = prs.filter(pr => new Date(pr.created_at) > twoWeeksAgo);

  const commitRate = recentCommits.length / 2;  // commits per week
  const prRate = recentPRs.length / 2;          // PRs per week

  // Classify velocity
  if (commitRate > 10 || prRate > 3) return 'high';
  if (commitRate > 5 || prRate > 1) return 'medium';
  return 'low';
}
```

**Example Output**:
```javascript
{
  progress: 72,
  activity: {
    commits: { total: 127, frequency: 9.1, contributors: 4 },
    prs: { open: 2, merged: 16, closed: 0 },
    issues: { open: 5, closed: 12 },
    releases: { total: 2, latest: 'v1.2.0' },
    roadmapProgress: { file: 'ROADMAP.md', totalTasks: 25, completedTasks: 18, progress: 72 }
  },
  velocity: 'high',
  confidence: 'high'
}
```

### Progress Aggregation

**Weighted Average with Dynamic Reweighting**:
```javascript
function aggregateProgress(tier1, tier2, tier3) {
  const tiers = [];

  // Tier 1: Phase markers (always available)
  if (tier1.confidence !== 'none') {
    tiers.push({ value: tier1.progress, weight: 0.4, confidence: tier1.confidence });
  }

  // Tier 2: Behavioral signals
  if (tier2.confidence !== 'none') {
    tiers.push({ value: tier2.progress, weight: 0.3, confidence: tier2.confidence });
  }

  // Tier 3: GitHub repo (may not be available)
  if (tier3 && tier3.confidence !== 'none') {
    tiers.push({ value: tier3.progress, weight: 0.3, confidence: tier3.confidence });
  }

  // Reweight if Tier 3 unavailable
  if (!tier3 || tier3.confidence === 'none') {
    tiers[0].weight = 0.5;  // Increase Tier 1 weight
    if (tiers[1]) tiers[1].weight = 0.5;  // Increase Tier 2 weight
  }

  // Calculate weighted average
  const totalWeight = tiers.reduce((sum, t) => sum + t.weight, 0);
  const weightedSum = tiers.reduce((sum, t) => sum + (t.value * t.weight), 0);

  return Math.round(weightedSum / totalWeight);
}
```

**Status Classification**:
```javascript
function classifyProgressStatus(overallProgress, plannedQuarter, currentQuarter) {
  const expectedProgress = calculateExpectedProgress(plannedQuarter, currentQuarter);

  const variance = overallProgress - expectedProgress;

  if (variance > 20) return 'ahead';
  if (variance > -10) return 'on-track';
  if (variance > -30) return 'behind';
  return 'at-risk';
}
```

### Output Structure

```javascript
ProgressReport = {
  projectId: "OP-011",
  projectName: "TechCo Inc Claude Marketplace",
  overallProgress: 67,      // Percentage 0-100

  progressBreakdown: {
    phases: {
      progress: 60,
      completedPhases: 3,
      totalPhases: 5,
      onTrack: false,
      confidence: 'high'
    },
    behavioral: {
      progress: 70,
      signals: { plugins: 4, adoptionWAU: 67, commits: 42 },
      confidence: 'medium'
    },
    repo: {
      progress: 72,
      activity: { commits: {...}, prs: {...}, issues: {...} },
      velocity: 'high',
      confidence: 'high'
    }
  },

  status: "in-progress",
  plannedQuarter: "Q1",
  currentQuarter: "Q1",
  actualProgress: "on-track",  // ahead | on-track | behind | at-risk

  blockers: [
    "Test harness setup delayed by 2 weeks"
  ],

  velocity: "high",             // low | medium | high
  lastAnalyzed: "2026-01-15T10:30:00Z",

  metadata: {
    tier1Available: true,
    tier2Available: true,
    tier3Available: true,
    confidence: 'high'           // overall confidence in progress estimate
  }
}
```

### Error Handling

**Graceful Degradation**:
```javascript
try {
  tier3 = await analyzeGitHubRepo(project.repoUrl, projectStartDate, githubToken);
} catch (error) {
  console.warn(`GitHub analysis failed for ${project.id}:`, error.message);
  tier3 = { progress: 0, confidence: 'none' };
  // Continue with Tier 1 + 2 only
}
```

**Rate Limiting**:
```javascript
// Implement exponential backoff for GitHub API
async function analyzeWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 403 && error.message.includes('rate limit')) {
        const waitTime = Math.pow(2, i) * 1000;
        console.warn(`Rate limited, waiting ${waitTime}ms...`);
        await sleep(waitTime);
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}
```

---

## 4. Module 2: AI Context Analyzer

### Purpose

Analyze temporal context and determine the narrative arc for the presentation. This module is the "brain" that decides what kind of presentation to generate based on current date, fiscal year progress, and project statuses.

### File Location

`/scripts/modules/processors/ai-context-analyzer.js`

### Input Parameters

```javascript
{
  progressReports: Array,      // From progress-tracker
  projects: Array,             // From project-ingestor
  schedule: Object,            // From constraint-scheduler
  scores: Object,              // From hybrid-scorer
  currentDate: Date,           // System date (e.g., 2026-01-15)
  fiscalYearStart: Date,       // Default: Jan 1
  fiscalYearEnd: Date,         // Default: Dec 31
  previousPlanData: Object,    // Optional: Last generated plan for comparison
  verbose: Boolean
}
```

### Core Functions

#### Function 1: Temporal Position Analysis

**Purpose**: Determine where we are in the fiscal year

```javascript
function analyzeTemporalPosition(currentDate, fiscalYearStart, fiscalYearEnd) {
  const totalDays = daysBetween(fiscalYearStart, fiscalYearEnd);
  const elapsedDays = daysBetween(fiscalYearStart, currentDate);
  const remainingDays = daysBetween(currentDate, fiscalYearEnd);

  const percentComplete = (elapsedDays / totalDays) * 100;
  const currentQuarter = Math.ceil((currentDate.getMonth() + 1) / 3);

  // Classify time phase
  let timePhase;
  if (percentComplete < 10) timePhase = 'beginning';
  else if (percentComplete < 40) timePhase = 'early';
  else if (percentComplete < 70) timePhase = 'mid';
  else timePhase = 'late';

  return {
    currentQuarter: `Q${currentQuarter}`,
    percentYearComplete: Math.round(percentComplete),
    elapsedDays,
    remainingDays,
    timePhase,
    daysUntilNextQuarter: calculateDaysToNextQuarter(currentDate),

    // Context hints
    isBeginningOfYear: percentComplete < 10,
    isMidYear: percentComplete >= 40 && percentComplete < 60,
    isEndOfYear: percentComplete > 85
  };
}
```

**Example Outputs**:

| Date | Quarter | % Complete | Time Phase | Context |
|------|---------|------------|------------|---------|
| Jan 15 | Q1 | 4% | beginning | New plan season |
| Apr 20 | Q2 | 33% | early | Q1 review + Q2 execution |
| Jul 15 | Q3 | 54% | mid | Mid-year checkpoint |
| Oct 30 | Q4 | 84% | late | Year-end planning |

#### Function 2: Project Progress Assessment

**Purpose**: Aggregate progress across all projects and identify outliers

```javascript
function assessProjectProgress(progressReports, schedule, currentQuarter) {
  const assessment = {
    committed: { total: 0, onTrack: 0, behind: 0, ahead: 0, completed: 0 },
    potential: { total: 0, started: 0, notStarted: 0, deferred: 0 },
    overall: { avgProgress: 0, projectsAtRisk: [], projectsExceeding: [] }
  };

  progressReports.forEach(report => {
    const isCommitted = schedule[currentQuarter]?.committed?.includes(report.projectId);

    if (isCommitted) {
      assessment.committed.total++;

      if (report.status === 'completed') {
        assessment.committed.completed++;
      } else if (report.actualProgress === 'ahead') {
        assessment.committed.ahead++;
      } else if (report.actualProgress === 'on-track') {
        assessment.committed.onTrack++;
      } else {
        assessment.committed.behind++;
        assessment.overall.projectsAtRisk.push({
          id: report.projectId,
          progress: report.overallProgress,
          blockers: report.blockers,
          velocity: report.velocity
        });
      }
    } else {
      assessment.potential.total++;
      if (report.status === 'in-progress') {
        assessment.potential.started++;
      } else {
        assessment.potential.notStarted++;
      }
    }

    // Track exceeding projects
    if (report.actualProgress === 'ahead' && report.overallProgress > 80) {
      assessment.overall.projectsExceeding.push({
        id: report.projectId,
        progress: report.overallProgress,
        velocity: report.velocity
      });
    }
  });

  // Calculate average progress
  const totalProgress = progressReports.reduce((sum, r) => sum + r.overallProgress, 0);
  assessment.overall.avgProgress = Math.round(totalProgress / progressReports.length);

  return assessment;
}
```

#### Function 3: Narrative Determination

**Purpose**: Decide what kind of presentation to generate

**Five Narrative Types**:

| Narrative Type | When | Focus | Tone | Slide Emphasis |
|----------------|------|-------|------|----------------|
| **NEW_PLAN** | Beginning of year (<10%) | Forward-looking | Ambitious | Strategy, roadmap, resources, commitment |
| **PROGRESS_UPDATE** | Early year (10-40%) | Balanced | Measured | Wins, progress, challenges, adjustments |
| **COURSE_CORRECTION** | Mid-year + behind | Retrospective + adaptive | Candid | What-happened, gaps, lessons, pivot |
| **MID_YEAR_CHECKPOINT** | Mid-year + on track | Balanced | Confident | Achievements, metrics, Q3-Q4 plan |
| **YEAR_END_SUMMARY** | Late year (>70%) | Retrospective | Reflective | Achievements, outcomes, ROI, next year |

**Implementation**:
```javascript
function determineNarrative(temporalPosition, projectAssessment, previousPlanData) {
  const { timePhase, currentQuarter, percentYearComplete } = temporalPosition;
  const { committed, overall } = projectAssessment;

  // Scenario 1: Beginning of year
  if (timePhase === 'beginning') {
    return {
      narrativeType: 'NEW_PLAN',
      focus: 'forward-looking',
      slideEmphasis: ['strategy', 'roadmap', 'resources', 'commitment'],
      tone: 'ambitious',
      message: 'Setting the vision and committing to Q1 execution'
    };
  }

  // Scenario 2: Early year
  if (timePhase === 'early') {
    return {
      narrativeType: 'PROGRESS_UPDATE',
      focus: 'balanced',
      slideEmphasis: ['wins', 'progress', 'challenges', 'adjustments', 'remaining-work'],
      tone: 'measured',
      message: `${currentQuarter} progress: ${committed.completed} completed, ${committed.onTrack} on track, ${committed.behind} need attention`
    };
  }

  // Scenario 3: Mid-year
  if (timePhase === 'mid') {
    const needsPivot = committed.behind > (committed.onTrack + committed.ahead);

    if (needsPivot) {
      return {
        narrativeType: 'COURSE_CORRECTION',
        focus: 'retrospective-and-adaptive',
        slideEmphasis: ['what-happened', 'gaps', 'lessons', 'pivot-strategy', 'revised-roadmap'],
        tone: 'candid',
        message: `Mid-year review: ${overall.projectsAtRisk.length} projects at risk, strategic pivot needed`
      };
    } else {
      return {
        narrativeType: 'MID_YEAR_CHECKPOINT',
        focus: 'balanced',
        slideEmphasis: ['achievements', 'metrics', 'progress', 'Q3-Q4-plan', 'risks'],
        tone: 'confident',
        message: `Mid-year strong: ${percentYearComplete}% through year, ${committed.completed + committed.ahead} projects ahead/complete`
      };
    }
  }

  // Scenario 4: Late year
  if (timePhase === 'late') {
    return {
      narrativeType: 'YEAR_END_SUMMARY',
      focus: 'retrospective',
      slideEmphasis: ['achievements', 'outcomes', 'roi-realized', 'lessons', 'next-year-preview'],
      tone: 'reflective',
      message: `Year-end summary: Delivered ${committed.completed} projects, preparing 2027 plan`
    };
  }
}
```

#### Function 4: Gap Analysis

**Purpose**: Identify execution, strategic, dependency, and resource gaps

```javascript
function analyzeGaps(progressReports, schedule, scores, currentQuarter) {
  const gaps = {
    execution: [],      // Projects behind schedule
    strategic: [],      // Missing strategic pillars
    dependency: [],     // Blocked projects
    resource: []        // Capacity mismatches
  };

  // 1. Execution gaps (projects behind or at-risk)
  progressReports.forEach(report => {
    if (report.actualProgress === 'behind' || report.actualProgress === 'at-risk') {
      gaps.execution.push({
        projectId: report.projectId,
        plannedQuarter: report.plannedQuarter,
        currentQuarter: currentQuarter,
        progress: report.overallProgress,
        blockers: report.blockers,
        impact: scores[report.projectId]?.finalScore || 0
      });
    }

    // Dependency gaps
    if (report.blockers.length > 0) {
      gaps.dependency.push({
        projectId: report.projectId,
        blockers: report.blockers
      });
    }
  });

  // 2. Strategic gaps (high-priority projects not started)
  const highPriorityProjects = Object.entries(scores)
    .filter(([id, data]) => data.finalScore > 70)
    .map(([id]) => id);

  const notStartedHighPriority = highPriorityProjects.filter(id => {
    const report = progressReports.find(r => r.projectId === id);
    return report?.status === 'proposed' && report?.plannedQuarter <= currentQuarter;
  });

  gaps.strategic = notStartedHighPriority.map(id => ({
    projectId: id,
    score: scores[id].finalScore,
    reason: 'High priority but not started'
  }));

  // 3. Resource gaps (capacity over/under utilization)
  Object.entries(schedule).forEach(([quarter, data]) => {
    const utilization = (data.allocated / data.capacity) * 100;

    if (utilization > 95) {
      gaps.resource.push({
        quarter,
        issue: 'over-allocated',
        allocated: data.allocated,
        capacity: data.capacity,
        buffer: data.buffer
      });
    } else if (utilization < 50 && quarter <= currentQuarter) {
      gaps.resource.push({
        quarter,
        issue: 'under-utilized',
        allocated: data.allocated,
        capacity: data.capacity,
        buffer: data.buffer
      });
    }
  });

  return gaps;
}
```

#### Function 5: Change Detection

**Purpose**: Compare against previous plan to highlight pivots

```javascript
function detectChanges(currentData, previousPlanData) {
  if (!previousPlanData) return { hasChanges: false, changes: [] };

  const changes = [];

  // 1. Detect re-prioritization
  const currentTop5 = currentData.rankedProjects.slice(0, 5).map(p => p.id);
  const previousTop5 = previousPlanData.rankedProjects?.slice(0, 5).map(p => p.id) || [];

  const rankChanges = currentTop5.filter(id => !previousTop5.includes(id));
  if (rankChanges.length > 0) {
    changes.push({
      type: 'REPRIORITIZATION',
      description: `${rankChanges.length} projects entered top 5`,
      projects: rankChanges,
      impact: 'high'
    });
  }

  // 2. Detect status changes
  currentData.progressReports.forEach(current => {
    const previous = previousPlanData.progressReports?.find(p => p.projectId === current.projectId);
    if (previous && previous.status !== current.status) {
      changes.push({
        type: 'STATUS_CHANGE',
        projectId: current.projectId,
        from: previous.status,
        to: current.status,
        impact: 'medium'
      });
    }
  });

  // 3. Detect deferred projects
  const currentDeferred = currentData.schedule.deferredProjects || [];
  const previousDeferred = previousPlanData.schedule?.deferredProjects || [];
  const newlyDeferred = currentDeferred.filter(id => !previousDeferred.includes(id));

  if (newlyDeferred.length > 0) {
    changes.push({
      type: 'DEFERRAL',
      description: `${newlyDeferred.length} projects deferred`,
      projects: newlyDeferred,
      impact: 'high'
    });
  }

  return {
    hasChanges: changes.length > 0,
    changes: changes,
    changeCount: changes.length
  };
}
```

#### Function 6: Recommendation Engine

**Purpose**: Generate prioritized action items

```javascript
function generateRecommendations(contextAnalysis, progressReports, gaps) {
  const recommendations = [];

  // Immediate actions (high priority, this week)
  gaps.execution.forEach(gap => {
    if (gap.progress < 50 && gap.impact > 70) {
      recommendations.push({
        type: 'immediate',
        priority: 'high',
        action: `Address ${gap.projectId} blockers: ${gap.blockers.join(', ')}`,
        owner: 'Engineering Lead',
        timeline: 'This week',
        reason: `High-impact project (score ${gap.impact}) significantly behind schedule`
      });
    }
  });

  // Resource actions
  gaps.resource.forEach(gap => {
    if (gap.issue === 'over-allocated') {
      recommendations.push({
        type: 'immediate',
        priority: 'high',
        action: `${gap.quarter} over-allocated (${gap.allocated}/${gap.capacity} days). Defer lower-priority projects or add capacity.`,
        owner: 'PMO',
        timeline: 'This week',
        reason: 'Zero buffer capacity creates execution risk'
      });
    }
  });

  // Near-term actions (medium priority, monthly)
  if (progressReports.some(r => r.actualProgress === 'behind')) {
    recommendations.push({
      type: 'near-term',
      priority: 'medium',
      action: 'Establish weekly progress reviews for at-risk projects',
      owner: 'PMO',
      timeline: 'Next sprint',
      reason: 'Improve visibility into blocked work'
    });
  }

  // Long-term actions (strategic planning)
  if (contextAnalysis.temporal.timePhase === 'mid' || contextAnalysis.temporal.timePhase === 'late') {
    recommendations.push({
      type: 'long-term',
      priority: 'low',
      action: `Begin ${contextAnalysis.temporal.fiscalYear + 1} annual planning`,
      owner: 'CTO',
      timeline: 'Q4',
      reason: 'Prepare for next fiscal year'
    });
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}
```

### Output Structure

```javascript
ContextAnalysis = {
  temporal: {
    currentDate: "2026-01-15",
    currentQuarter: "Q1",
    fiscalYear: 2026,
    percentYearComplete: 4,
    elapsedDays: 15,
    remainingDays: 350,
    timePhase: "beginning",
    daysUntilNextQuarter: 75,
    isBeginningOfYear: true,
    isMidYear: false,
    isEndOfYear: false
  },

  projectStatus: {
    committed: {
      total: 3,
      onTrack: 2,
      behind: 1,
      ahead: 0,
      completed: 0
    },
    potential: {
      total: 4,
      started: 1,
      notStarted: 3,
      deferred: 0
    },
    overall: {
      avgProgress: 34,
      projectsAtRisk: [
        { id: "OP-008", progress: 45, blockers: ["Test harness delays"], velocity: "medium" }
      ],
      projectsExceeding: []
    }
  },

  narrative: {
    narrativeType: "NEW_PLAN",
    focus: "forward-looking",
    slideEmphasis: ["strategy", "roadmap", "resources", "commitment"],
    tone: "ambitious",
    message: "Setting the vision and committing to Q1 execution"
  },

  gaps: {
    execution: [
      { projectId: "OP-008", plannedQuarter: "Q1", currentQuarter: "Q1", progress: 45, blockers: [...], impact: 75.0 }
    ],
    strategic: [],
    dependency: [],
    resource: [
      { quarter: "Q1", issue: "over-allocated", allocated: 72, capacity: 72, buffer: 0 }
    ]
  },

  changes: {
    hasChanges: false,
    changes: [],
    changeCount: 0
  },

  recommendations: [
    {
      type: "immediate",
      priority: "high",
      action: "Address OP-008 test harness delays to avoid Q1 commitment risk",
      owner: "Engineering Lead",
      timeline: "This week",
      reason: "High-impact project significantly behind schedule"
    },
    {
      type: "near-term",
      priority: "medium",
      action: "Monitor Q1 capacity utilization (0% buffer remaining)",
      owner: "PMO",
      timeline: "Weekly",
      reason: "Zero buffer capacity creates execution risk"
    }
  ],

  presentationHints: {
    suggestedSlideCount: 9,
    criticalSlides: ["executive_summary", "q1_committed", "risks"],
    skipSlides: [],
    emphasisSlides: ["roadmap", "resources"]
  }
}
```

---

## 5. Module 3: AI Presentation Generator

### Purpose

Use Claude API to generate fully dynamic presentation structure with adaptive slide count, titles, and content based on temporal context and project progress.

### File Location

`/scripts/modules/generators/ai-presentation-generator.js`

### Input Parameters

```javascript
{
  contextAnalysis: Object,     // From ai-context-analyzer
  progressReports: Array,      // From progress-tracker
  projects: Array,             // From project-ingestor
  scores: Object,              // From hybrid-scorer
  schedule: Object,            // From constraint-scheduler
  portfolioProjects: Array,    // From portfolio-generator
  dashboardMetrics: Object,    // From dashboard-data-ingestor
  previousPresentation: Object, // Optional: Last generated presentation
  options: {
    maxSlides: 15,             // Safety limit
    minSlides: 5,              // Minimum viable presentation
    includeAppendix: boolean,  // Add project detail slides
    model: 'claude-sonnet-4-20250514'
  },
  verbose: Boolean
}
```

### Architecture

**Four-Step Process**:
1. **Build Context**: Package all data for Claude API
2. **Generate Structure**: Claude determines slide count, types, titles
3. **Populate Content**: Deterministic code fills in data
4. **Fallback**: Rule-based structure if API fails

### Step 1: Build Prompt Context

```javascript
function buildPromptContext(inputs) {
  const { contextAnalysis, progressReports, projects, scores, schedule, portfolioProjects } = inputs;

  return {
    // Temporal context
    currentDate: contextAnalysis.temporal.currentDate,
    currentQuarter: contextAnalysis.temporal.currentQuarter,
    fiscalYear: contextAnalysis.temporal.fiscalYear,
    yearProgress: `${contextAnalysis.temporal.percentYearComplete}% complete`,
    timePhase: contextAnalysis.temporal.timePhase,

    // Narrative guidance
    narrativeType: contextAnalysis.narrative.narrativeType,
    focus: contextAnalysis.narrative.focus,
    tone: contextAnalysis.narrative.tone,
    suggestedEmphasis: contextAnalysis.narrative.slideEmphasis,

    // Project status summary
    totalProjects: projects.length,
    committedProjects: contextAnalysis.projectStatus.committed.total,
    onTrackCount: contextAnalysis.projectStatus.committed.onTrack,
    behindCount: contextAnalysis.projectStatus.committed.behind,
    completedCount: contextAnalysis.projectStatus.committed.completed,
    avgProgress: contextAnalysis.projectStatus.overall.avgProgress,

    // Risk indicators
    projectsAtRisk: contextAnalysis.projectStatus.overall.projectsAtRisk,
    executionGaps: contextAnalysis.gaps.execution,
    resourceGaps: contextAnalysis.gaps.resource,

    // Financial summary
    totalValue: calculateTotalValue(portfolioProjects),
    avgROI: calculateAverageROI(portfolioProjects),

    // Changes from previous
    hasChanges: contextAnalysis.changes.hasChanges,
    changesSummary: contextAnalysis.changes.changes,

    // Top projects
    topProjects: portfolioProjects.slice(0, 5).map(p => ({
      id: p.projectId || p.project.split(':')[0],
      name: p.project,
      score: p.score,
      progress: progressReports.find(r => r.projectId === p.projectId)?.overallProgress || 0,
      status: p.status
    })),

    // Recommendations
    recommendations: contextAnalysis.recommendations
  };
}
```

### Step 2: Generate Slide Structure via Claude API

**System Prompt**:
```
You are an expert executive presentation architect specializing in annual planning and progress reporting. Your role is to design slide structures for C-suite presentations that are:

1. BLUF-driven (Bottom Line Up Front)
2. Data-driven with clear metrics
3. Action-oriented with specific recommendations
4. Context-aware (adapting to timing and progress)

You will receive context about a company's AI project portfolio and current progress. Design a presentation structure that tells the right story for the current moment in time.
```

**User Prompt Template**:
```javascript
const userPrompt = `Design an executive presentation for the 2026 AI Annual Plan.

TEMPORAL CONTEXT:
- Current Date: ${promptContext.currentDate}
- Current Quarter: ${promptContext.currentQuarter}
- Year Progress: ${promptContext.yearProgress} (${promptContext.timePhase} phase)

NARRATIVE TYPE: ${promptContext.narrativeType}
- Focus: ${promptContext.focus}
- Tone: ${promptContext.tone}
- Emphasis: ${promptContext.suggestedEmphasis.join(', ')}

PROJECT STATUS:
- Total: ${promptContext.totalProjects}
- Committed: ${promptContext.committedProjects}
- Progress: ${promptContext.onTrackCount} on track, ${promptContext.behindCount} behind
- Average: ${promptContext.avgProgress}%

RISKS & GAPS:
${promptContext.projectsAtRisk.length > 0 ? `- ${promptContext.projectsAtRisk.length} at risk` : '- None'}

TOP 5 PROJECTS:
${promptContext.topProjects.map((p, i) => `${i+1}. ${p.id} (Score: ${p.score}, Progress: ${p.progress}%)`).join('\n')}

TASK:
Design ${options.minSlides}-${options.maxSlides} slides. Return JSON:

{
  "slideCount": <number>,
  "presentationTitle": "<title>",
  "slides": [
    {
      "slideNumber": 1,
      "type": "<slide_type>",
      "title": "<title>",
      "purpose": "<why needed>",
      "contentGuidance": {
        "sections": ["<section>", ...],
        "keyMetrics": ["<metric>", ...],
        "dataSource": "<which data>",
        "visualization": "<chart/table/text>"
      }
    }
  ],
  "narrativeArc": "<overall story>",
  "keyMessages": ["<message>", ...]
}

SLIDE TYPES:
title, executive_summary, current_state, progress_update, achievements,
challenges, strategic_context, portfolio_overview, portfolio_detail,
quarterly_roadmap, q1_committed, q2_q4_potential, resource_capacity,
dependencies_risks, gap_analysis, pivot_strategy, year_end_summary,
next_steps, appendix

GUIDELINES:
1. Start with title + executive_summary (BLUF)
2. Match emphasis to ${promptContext.narrativeType}
3. Include risks if projects behind
4. End with next_steps/recommendations

Return ONLY valid JSON.`;
```

**API Call**:
```javascript
async function generateSlideStructure(promptContext, options) {
  try {
    const response = await callClaudeAPI({
      model: options.model || 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      temperature: 0.7
    });

    const slideStructure = JSON.parse(response.content[0].text);

    // Validate
    if (!slideStructure.slides || !Array.isArray(slideStructure.slides)) {
      throw new Error('Invalid structure');
    }

    // Enforce limits
    if (slideStructure.slideCount > options.maxSlides) {
      console.warn(`Truncating ${slideStructure.slideCount} slides to ${options.maxSlides}`);
      slideStructure.slides = slideStructure.slides.slice(0, options.maxSlides);
      slideStructure.slideCount = options.maxSlides;
    }

    return slideStructure;

  } catch (error) {
    console.error('Claude API error:', error);
    return generateFallbackStructure(promptContext, options);
  }
}
```

### Step 3: Populate Slide Content

**Content Population**:
```javascript
async function populateSlideContent(slideStructure, inputs) {
  const populatedSlides = await Promise.all(
    slideStructure.slides.map(async (slide, index) => {
      const content = await generateContentForSlideType(
        slide.type,
        slide.contentGuidance,
        inputs
      );

      return {
        id: index + 1,
        type: slide.type,
        title: slide.title,
        subtitle: slide.subtitle || '',
        purpose: slide.purpose,
        content: content
      };
    })
  );

  return populatedSlides;
}
```

**Content Generators by Type**:
```javascript
const contentGenerators = {
  title: generateTitleSlide,
  executive_summary: generateExecutiveSummary,
  current_state: generateCurrentState,
  progress_update: generateProgressUpdate,
  achievements: generateAchievements,
  challenges: generateChallenges,
  strategic_context: generateStrategicContext,
  portfolio_overview: generatePortfolioOverview,
  portfolio_detail: generatePortfolioDetail,
  quarterly_roadmap: generateQuarterlyRoadmap,
  q1_committed: generateQ1Committed,
  q2_q4_potential: generateQ2Q4Potential,
  resource_capacity: generateResourceCapacity,
  dependencies_risks: generateDependenciesRisks,
  gap_analysis: generateGapAnalysis,
  pivot_strategy: generatePivotStrategy,
  year_end_summary: generateYearEndSummary,
  next_steps: generateNextSteps,
  appendix: generateAppendix
};
```

**Example: Progress Update Slide Generator**:
```javascript
function generateProgressUpdate(data) {
  const { contextAnalysis, progressReports, portfolioProjects } = data;

  return {
    timeframe: `${contextAnalysis.temporal.currentQuarter} 2026`,

    planned: {
      title: "What We Planned",
      projects: portfolioProjects
        .filter(p => p.qStart === contextAnalysis.temporal.currentQuarter)
        .map(p => ({
          id: p.projectId || p.project.split(':')[0],
          name: p.project,
          status: p.status,
          plannedDelivery: p.qStartDetail
        }))
    },

    actual: {
      title: "What Happened",
      summary: `${contextAnalysis.projectStatus.committed.completed} completed, ${contextAnalysis.projectStatus.committed.onTrack} on track, ${contextAnalysis.projectStatus.committed.behind} behind`,
      details: progressReports
        .filter(r => r.plannedQuarter === contextAnalysis.temporal.currentQuarter)
        .map(r => ({
          id: r.projectId,
          progress: r.overallProgress,
          status: r.actualProgress,
          velocity: r.velocity,
          blockers: r.blockers
        }))
    },

    remaining: {
      title: "What's Next",
      nextMilestones: generateNextMilestones(progressReports, contextAnalysis),
      upcomingQuarter: generateUpcomingQuarterPreview(data)
    },

    metrics: {
      avgProgress: contextAnalysis.projectStatus.overall.avgProgress,
      onTimeDelivery: calculateOnTimeDeliveryRate(progressReports),
      velocityTrend: calculateVelocityTrend(progressReports)
    }
  };
}
```

**Example: Gap Analysis Slide Generator**:
```javascript
function generateGapAnalysis(data) {
  const { contextAnalysis } = data;

  return {
    executionGaps: contextAnalysis.gaps.execution.map(gap => ({
      projectId: gap.projectId,
      planned: gap.plannedQuarter,
      actual: gap.currentQuarter,
      progress: gap.progress,
      gap: `${100 - gap.progress}% behind`,
      impact: gap.impact,
      blockers: gap.blockers,
      mitigation: generateMitigation(gap)
    })),

    strategicGaps: contextAnalysis.gaps.strategic.map(gap => ({
      projectId: gap.projectId,
      priority: gap.score,
      reason: gap.reason,
      recommendation: 'Start immediately in next sprint'
    })),

    resourceGaps: contextAnalysis.gaps.resource.map(gap => ({
      quarter: gap.quarter,
      issue: gap.issue,
      allocated: gap.allocated,
      capacity: gap.capacity,
      shortfall: gap.issue === 'over-allocated' ? gap.allocated - gap.capacity : 0,
      recommendation: gap.issue === 'over-allocated'
        ? 'Defer lower-priority projects or add capacity'
        : 'Accelerate potential projects into this quarter'
    })),

    dependencyGaps: contextAnalysis.gaps.dependency.map(gap => ({
      projectId: gap.projectId,
      blockedBy: gap.blockers,
      canStartWhen: gap.canStartWhen,
      estimatedUnblock: estimateUnblockDate(gap, data.progressReports)
    }))
  };
}
```

### Step 4: Fallback Structure

**Rule-Based Templates by Narrative Type**:
```javascript
function generateFallbackStructure(promptContext, options) {
  console.warn('Using fallback presentation structure');

  const slideTemplates = {
    NEW_PLAN: [
      { type: 'title', title: '2026 Annual Plan' },
      { type: 'executive_summary', title: 'Executive Summary' },
      { type: 'strategic_context', title: 'Strategic Rationale' },
      { type: 'portfolio_overview', title: 'Project Portfolio' },
      { type: 'quarterly_roadmap', title: 'Quarterly Roadmap' },
      { type: 'q1_committed', title: 'Q1 Committed Work' },
      { type: 'resource_capacity', title: 'Resource & Capacity Model' },
      { type: 'dependencies_risks', title: 'Dependencies & Risks' },
      { type: 'next_steps', title: 'Recommendations' }
    ],

    PROGRESS_UPDATE: [
      { type: 'title', title: `${promptContext.currentQuarter} Progress Update` },
      { type: 'executive_summary', title: 'Executive Summary' },
      { type: 'achievements', title: 'Key Wins' },
      { type: 'progress_update', title: 'Planned vs. Actual' },
      { type: 'challenges', title: 'Challenges & Risks' },
      { type: 'portfolio_overview', title: 'Portfolio Status' },
      { type: 'quarterly_roadmap', title: 'Remaining Year' },
      { type: 'next_steps', title: 'Actions Needed' }
    ],

    COURSE_CORRECTION: [
      { type: 'title', title: 'Mid-Year Review & Course Correction' },
      { type: 'executive_summary', title: 'Executive Summary' },
      { type: 'progress_update', title: 'What Happened' },
      { type: 'gap_analysis', title: 'Gap Analysis' },
      { type: 'challenges', title: 'Root Causes' },
      { type: 'pivot_strategy', title: 'Proposed Pivot' },
      { type: 'quarterly_roadmap', title: 'Revised Roadmap' },
      { type: 'resource_capacity', title: 'Resource Reallocation' },
      { type: 'next_steps', title: 'Immediate Actions' }
    ],

    MID_YEAR_CHECKPOINT: [
      { type: 'title', title: 'Mid-Year Checkpoint' },
      { type: 'executive_summary', title: 'Executive Summary' },
      { type: 'achievements', title: 'H1 Achievements' },
      { type: 'progress_update', title: 'Progress Against Plan' },
      { type: 'portfolio_overview', title: 'Portfolio Status' },
      { type: 'quarterly_roadmap', title: 'H2 Roadmap' },
      { type: 'dependencies_risks', title: 'Risks & Mitigation' },
      { type: 'next_steps', title: 'H2 Priorities' }
    ],

    YEAR_END_SUMMARY: [
      { type: 'title', title: '2026 Year in Review' },
      { type: 'executive_summary', title: 'Executive Summary' },
      { type: 'achievements', title: '2026 Achievements' },
      { type: 'portfolio_overview', title: 'Portfolio Outcomes' },
      { type: 'year_end_summary', title: 'By The Numbers' },
      { type: 'challenges', title: 'Lessons Learned' },
      { type: 'next_steps', title: '2027 Preview' }
    ]
  };

  const selectedTemplate = slideTemplates[promptContext.narrativeType] || slideTemplates.NEW_PLAN;

  return {
    slideCount: selectedTemplate.length,
    presentationTitle: `2026 Annual Plan: ${promptContext.narrativeType.replace('_', ' ')}`,
    presentationSubtitle: `${promptContext.currentQuarter} Update`,
    narrativeArc: `Standard ${promptContext.narrativeType} presentation`,
    keyMessages: [
      `${promptContext.totalProjects} projects in portfolio`,
      `${promptContext.committedProjects} committed`,
      `Average progress: ${promptContext.avgProgress}%`
    ],
    slides: selectedTemplate.map((slide, index) => ({
      slideNumber: index + 1,
      type: slide.type,
      title: slide.title,
      subtitle: '',
      purpose: `Standard ${slide.type} slide`,
      contentGuidance: {}
    }))
  };
}
```

### Output Structure

```javascript
AIGeneratedPresentation = {
  metadata: {
    generatedAt: "2026-01-15T10:30:00Z",
    generatedBy: "ai-presentation-generator",
    version: "2026-Q1",
    narrativeType: "NEW_PLAN",
    model: "claude-sonnet-4-20250514",
    slideCount: 9,
    usedFallback: false
  },

  presentation: {
    title: "2026 Annual Plan: Data-Driven, Agile AI Strategy",
    subtitle: "Q1 2026 Kickoff",
    presenter: "Chris Murphy, CEO",
    date: "January 15, 2026",
    narrativeArc: "Setting ambitious vision with committed Q1 execution",
    keyMessages: [
      "7 AI projects prioritized for 2026",
      "$26.4M portfolio value",
      "Q1: 3 committed projects"
    ]
  },

  slides: [
    {
      id: 1,
      type: "title",
      title: "2026 Annual Plan",
      subtitle: "Data-Driven, Agile AI Strategy",
      purpose: "Set context",
      content: {
        presenter: "Chris Murphy, CEO",
        date: "January 15, 2026"
      }
    },
    {
      id: 2,
      type: "executive_summary",
      title: "Executive Summary",
      subtitle: "BLUF: Bottom Line Up Front",
      purpose: "C-suite takeaways",
      content: {
        bluf: {
          headline: "7 AI projects prioritized for 2026",
          impact: "$26.4M total value",
          approach: "Hybrid scoring with capacity constraints",
          confidence: "High"
        },
        keyPoints: [...],
        recommendations: [...]
      }
    }
    // ... 7 more slides with fully populated content
  ]
}
```

---

## 6. Data Flow

### Complete Pipeline Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         INPUT DATA SOURCES                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  /data/ai-projects/OP-*.md         Project definitions             │
│  /app/ai-tools-data.json                Dashboard metrics               │
│  /app/ai-projects-schedule.json         Quarterly schedule              │
│  /app/ai-projects-scores.json           Scoring results                 │
│  GitHub API                              Repo activity (optional)        │
│  System Date                             Current date/time               │
│                                                                           │
└────────────────────┬────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      PHASE 5: PROGRESS TRACKING                          │
├─────────────────────────────────────────────────────────────────────────┤
│  progress-tracker.js                                                     │
│  ├─ Tier 1: Phase completion markers (✓ COMPLETE)                       │
│  ├─ Tier 2: Behavioral metrics (adoption, usage)                        │
│  └─ Tier 3: GitHub repo analysis (commits, PRs, issues)                 │
│                                                                           │
│  Output: progressReports[]                                              │
│  - projectId, overallProgress, progressBreakdown, status,               │
│    actualProgress, blockers, velocity                                   │
└────────────────────┬────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      PHASE 6: AI CONTEXT ANALYSIS                        │
├─────────────────────────────────────────────────────────────────────────┤
│  ai-context-analyzer.js                                                  │
│  ├─ analyzeTemporalPosition() → temporal{}                              │
│  ├─ assessProjectProgress() → projectStatus{}                           │
│  ├─ determineNarrative() → narrative{}                                  │
│  ├─ analyzeGaps() → gaps{}                                              │
│  ├─ detectChanges() → changes{}                                         │
│  └─ generateRecommendations() → recommendations[]                       │
│                                                                           │
│  Output: contextAnalysis{}                                              │
│  - temporal, projectStatus, narrative, gaps, changes, recommendations   │
└────────────────────┬────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   PHASE 7: AI PRESENTATION GENERATION                    │
├─────────────────────────────────────────────────────────────────────────┤
│  ai-presentation-generator.js                                            │
│  ├─ buildPromptContext() → promptContext{}                              │
│  ├─ generateSlideStructure() → slideStructure (via Claude API)          │
│  ├─ populateSlideContent() → populatedSlides[]                          │
│  └─ (fallback) generateFallbackStructure()                              │
│                                                                           │
│  Output: presentation{}                                                 │
│  - metadata, presentation, slides[]                                     │
└────────────────────┬────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        PHASE 8: OUTPUT FILES                             │
├─────────────────────────────────────────────────────────────────────────┤
│  annual-plan-orchestrator.js::writeOutputFiles()                        │
│                                                                           │
│  /app/ai-projects-presentation.json  ← NEW STRUCTURE (dynamic)          │
│  /app/ai-projects-progress.json      ← NEW FILE                         │
│  /app/ai-projects-context.json       ← NEW FILE                         │
│  /app/ai-projects-portfolio.json     (existing)                         │
│  /app/ai-projects-schedule.json      (existing)                         │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### New Output Files

| File | Size Est. | Purpose | Structure |
|------|-----------|---------|-----------|
| **ai-projects-presentation.json** | 30-50KB | Dynamic presentation with 5-15 slides | `{ metadata, presentation, slides[] }` |
| **ai-projects-progress.json** | 15-20KB | Progress reports for all projects | `{ reports[], metadata }` |
| **ai-projects-context.json** | 8-12KB | Temporal & narrative analysis | `{ temporal, projectStatus, narrative, gaps, changes, recommendations }` |

---

## 7. AI Project Markdown Standards

### Required Fields for Progress Tracking

**Existing Fields (Already Supported)**:
- `id`: Project ID (e.g., OP-005)
- `name`: Project name
- `status`: proposed | in-progress | on-hold | completed
- `phases[]`: Array of phase objects

**New Optional Fields**:
```markdown
## Project Metadata

- **ID**: OP-005
- **Name**: Lead Generation Agentic Intelligence
- **Status**: in-progress
- **Repository**: https://github.com/techco/lead-gen-ai
- **Auto Analyze**: true
- **Start Date**: 2026-01-15
- **Target Quarter**: Q2

## Phases

### Phase 1: Foundation ✓ COMPLETE
- Timeline: Q1 2026 (Weeks 1-4)
- Completed: 2026-02-10
- Description: ...

### Phase 2: Implementation
- Timeline: Q2 2026 (Weeks 1-8)
- Status: in-progress (60% complete)
- Description: ...

### Phase 3: Rollout
- Timeline: Q3 2026
- Status: proposed
- Description: ...
```

**Parsing Logic Updates**:
```javascript
// In project-ingestor.js
function extractProjectMetadata(content) {
  return {
    id: extractField(content, 'ID'),
    name: extractField(content, 'Name'),
    status: extractField(content, 'Status'),
    repoUrl: extractField(content, 'Repository'),
    autoAnalyze: extractField(content, 'Auto Analyze') === 'true',
    startDate: extractDate(content, 'Start Date'),
    targetQuarter: extractField(content, 'Target Quarter'),
    phases: extractPhases(content)
  };
}

function extractPhases(content) {
  const phaseRegex = /### Phase \d+:(.+?)\n([\s\S]+?)(?=###|$)/g;
  const phases = [];

  let match;
  while ((match = phaseRegex.exec(content)) !== null) {
    const phaseName = match[1].trim();
    const phaseContent = match[2];

    phases.push({
      name: phaseName,
      status: phaseName.includes('✓ COMPLETE') ? 'completed' :
              phaseContent.includes('in-progress') ? 'in-progress' : 'proposed',
      timeline: extractField(phaseContent, 'Timeline'),
      completedDate: extractDate(phaseContent, 'Completed'),
      progress: extractProgress(phaseContent),
      description: extractField(phaseContent, 'Description')
    });
  }

  return phases;
}

function extractProgress(phaseContent) {
  const progressMatch = phaseContent.match(/(\d+)%\s+complete/i);
  return progressMatch ? parseInt(progressMatch[1]) : null;
}
```

### Markdown Template

**Create**: `/docs/templates/ai-project-template.md`
```markdown
# [Project ID]: [Project Name]

## Project Metadata

- **ID**: OP-XXX
- **Name**: [Full project name]
- **Status**: proposed | in-progress | on-hold | completed
- **Tier**: TIER 0: FOUNDATION | TIER 1: REVENUE | TIER 2: RETENTION
- **Repository**: [GitHub URL] (optional)
- **Auto Analyze**: true | false (default: false)
- **Start Date**: YYYY-MM-DD (optional)
- **Target Quarter**: Q1 | Q2 | Q3 | Q4

## Executive Summary

[2-3 sentence description]

## Strategic Context

### Pillars
- Intelligent | Personalized | Integrated | Automated

### Growth Drivers
- Win | Retain | Innovate

## Financial Impact

- **Annual Value**: $X.XM
- **ROI**: X%
- **Payback Period**: X months

## Target KPIs

- [KPI 1]: [Target]
- [KPI 2]: [Target]
- [KPI 3]: [Target]

## Phases

### Phase 1: [Phase Name]
- **Timeline**: Q1 2026 (Weeks 1-4)
- **Status**: proposed | in-progress | completed
- **Progress**: X% (if in-progress)
- **Completed**: YYYY-MM-DD (if completed)
- **Description**: [What happens in this phase]
- **Deliverables**:
  - [ ] Deliverable 1
  - [x] Deliverable 2 (completed items)
  - [ ] Deliverable 3

### Phase 2: [Phase Name]
...

## Dependencies

- **HARD**: [List hard dependencies]
- **SOFT**: [List soft dependencies]

## Risks

1. **[Risk Title]**: [Description] (Impact: High/Medium/Low, Likelihood: High/Medium/Low)
2. **[Risk Title]**: [Description]

## Team

- **Owner**: [Name]
- **Contributors**: [Names]
- **Champion**: [Name] (optional)
```

---

## 8. GitHub Integration

### GitHub MCP Integration

**Preferred Method**: Use existing GitHub MCP server if available

**MCP Tools**:
```javascript
// Check if GitHub MCP is available
const githubMCP = await getMCPServer('github');

if (githubMCP) {
  // Use MCP tools
  const commits = await githubMCP.listCommits({ owner, repo, since });
  const prs = await githubMCP.listPullRequests({ owner, repo });
  const issues = await githubMCP.listIssues({ owner, repo });
} else {
  // Fall back to Octokit
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  // ...
}
```

**Configuration**:
```javascript
// In .env or environment
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
GITHUB_ANALYZE_REPOS=true  // Enable Tier 3 analysis
```

### API Rate Limiting

**GitHub API Limits**:
- **Authenticated**: 5,000 requests/hour
- **Unauthenticated**: 60 requests/hour

**Rate Limit Handling**:
```javascript
async function analyzeWithRateLimit(repoUrl, projectStartDate, githubToken) {
  const octokit = new Octokit({ auth: githubToken });

  try {
    // Check rate limit before starting
    const { data: rateLimit } = await octokit.rest.rateLimit.get();

    if (rateLimit.rate.remaining < 10) {
      const resetTime = new Date(rateLimit.rate.reset * 1000);
      console.warn(`Rate limit low (${rateLimit.rate.remaining} remaining). Resets at ${resetTime}`);

      // Skip analysis if rate limit critical
      return null;
    }

    // Proceed with analysis
    return await analyzeGitHubRepo(repoUrl, projectStartDate, githubToken);

  } catch (error) {
    if (error.status === 403 && error.message.includes('rate limit')) {
      console.warn('Rate limit exceeded, skipping GitHub analysis');
      return null;
    }
    throw error;
  }
}
```

**Optimization**:
```javascript
// Batch analyze projects to minimize API calls
async function batchAnalyzeRepos(projects, githubToken) {
  const results = new Map();

  // Group by repo to avoid duplicate analysis
  const uniqueRepos = [...new Set(projects.map(p => p.repoUrl).filter(Boolean))];

  console.log(`Analyzing ${uniqueRepos.length} unique repositories...`);

  for (const repoUrl of uniqueRepos) {
    const analysis = await analyzeWithRateLimit(repoUrl, new Date('2026-01-01'), githubToken);
    results.set(repoUrl, analysis);
  }

  return results;
}
```

### Caching Strategy

**Cache GitHub Results**:
```javascript
// Cache in-memory for session
const GITHUB_CACHE = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function getCachedRepoAnalysis(repoUrl, projectStartDate, githubToken) {
  const cacheKey = `${repoUrl}:${projectStartDate.toISOString()}`;

  if (GITHUB_CACHE.has(cacheKey)) {
    const cached = GITHUB_CACHE.get(cacheKey);
    const age = Date.now() - cached.timestamp;

    if (age < CACHE_TTL) {
      console.log(`Using cached GitHub analysis for ${repoUrl} (age: ${Math.round(age/1000/60)}min)`);
      return cached.data;
    } else {
      GITHUB_CACHE.delete(cacheKey);
    }
  }

  const analysis = await analyzeGitHubRepo(repoUrl, projectStartDate, githubToken);

  if (analysis) {
    GITHUB_CACHE.set(cacheKey, {
      data: analysis,
      timestamp: Date.now()
    });
  }

  return analysis;
}
```

---

## 9. UI Changes

### React Component Updates

**File**: `/app/components/AnnualPlanPresentation.jsx`

**Current State** (1,900 lines):
- Hardcoded `getSlidesData()` function
- Fixed 9 slides
- Slide 9 uses dynamic portfolioData (PR #37)

**Target State** (simplified):
- Remove `getSlidesData()` function entirely
- Consume `ai-projects-presentation.json` directly
- Dynamic slide rendering based on JSON structure

**New Implementation**:
```javascript
"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const AnnualPlanPresentation = ({ aiToolsData, portfolioData, presentationData }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Use generated presentation structure
  const slidesData = presentationData.slides || [];
  const metadata = presentationData.metadata || {};
  const presentation = presentationData.presentation || {};

  // Render slide based on type
  const renderSlide = (slide) => {
    const SlideComponent = SLIDE_COMPONENTS[slide.type] || GenericSlide;
    return <SlideComponent slide={slide} />;
  };

  return (
    <div className="relative w-full h-full bg-gray-900">
      {/* Presentation header */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
        <h1 className="text-white text-xl font-semibold">{presentation.title}</h1>
        <p className="text-gray-300 text-sm">{presentation.subtitle}</p>
      </div>

      {/* Current slide */}
      <div className="w-full h-full flex items-center justify-center p-16">
        {renderSlide(slidesData[currentSlide])}
      </div>

      {/* Navigation */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-white text-sm">
            Slide {currentSlide + 1} of {slidesData.length}
          </div>

          <button
            onClick={() => setCurrentSlide(Math.min(slidesData.length - 1, currentSlide + 1))}
            disabled={currentSlide === slidesData.length - 1}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Metadata badge */}
      <div className="absolute top-4 right-4 bg-black/70 text-white text-xs px-3 py-1 rounded">
        {metadata.narrativeType} | Generated {new Date(metadata.generatedAt).toLocaleDateString()}
      </div>
    </div>
  );
};

// Slide component registry
const SLIDE_COMPONENTS = {
  title: TitleSlide,
  executive_summary: ExecutiveSummarySlide,
  current_state: CurrentStateSlide,
  progress_update: ProgressUpdateSlide,
  achievements: AchievementsSlide,
  challenges: ChallengesSlide,
  strategic_context: StrategicContextSlide,
  portfolio_overview: PortfolioOverviewSlide,
  portfolio_detail: PortfolioDetailSlide,
  quarterly_roadmap: QuarterlyRoadmapSlide,
  q1_committed: Q1CommittedSlide,
  q2_q4_potential: Q2Q4PotentialSlide,
  resource_capacity: ResourceCapacitySlide,
  dependencies_risks: DependenciesRisksSlide,
  gap_analysis: GapAnalysisSlide,
  pivot_strategy: PivotStrategySlide,
  year_end_summary: YearEndSummarySlide,
  next_steps: NextStepsSlide,
  appendix: AppendixSlide
};

export default AnnualPlanPresentation;
```

**Slide Components** (extract existing rendering logic):
```javascript
// TitleSlide.jsx
const TitleSlide = ({ slide }) => {
  const { content } = slide;
  return (
    <div className="text-center">
      <h1 className="text-6xl font-bold text-white mb-4">{slide.title}</h1>
      <h2 className="text-3xl text-gray-300 mb-8">{slide.subtitle}</h2>
      <div className="text-xl text-gray-400">
        <p>{content.presenter}</p>
        <p>{content.date}</p>
      </div>
    </div>
  );
};

// ExecutiveSummarySlide.jsx
const ExecutiveSummarySlide = ({ slide }) => {
  const { content } = slide;
  return (
    <div className="w-full h-full">
      <h2 className="text-4xl font-bold text-white mb-6">{slide.title}</h2>

      {/* BLUF Section */}
      <div className="bg-blue-600 p-6 rounded-lg mb-6">
        <h3 className="text-2xl font-semibold text-white mb-2">{content.bluf.headline}</h3>
        <p className="text-xl text-blue-100">{content.bluf.impact}</p>
        <p className="text-lg text-blue-200">{content.bluf.approach}</p>
      </div>

      {/* Key Points */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-3">Key Points</h3>
        <ul className="space-y-2">
          {content.keyPoints.map((point, i) => (
            <li key={i} className="text-lg text-gray-300 flex items-start">
              <span className="text-green-400 mr-2">▸</span>
              {point}
            </li>
          ))}
        </ul>
      </div>

      {/* Recommendations */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-3">Recommendations</h3>
        <ul className="space-y-2">
          {content.recommendations.map((rec, i) => (
            <li key={i} className="text-lg text-gray-300 flex items-start">
              <span className="text-yellow-400 mr-2">→</span>
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// ... similar components for other slide types
```

**Data Loading** (page.jsx):
```javascript
// In app/page.jsx
import presentationDataGenerated from './ai-projects-presentation.json';
import progressDataGenerated from './ai-projects-progress.json';
import contextDataGenerated from './ai-projects-context.json';

// Pass to component
<AnnualPlan
  aiToolsData={aiToolsData}
  portfolioData={portfolioData}
  presentationData={presentationDataGenerated}
  progressData={progressDataGenerated}
  contextData={contextDataGenerated}
/>
```

---

## 10. Error Handling & Fallbacks

### Tier 3 (GitHub) Failure

**Scenario**: GitHub API unavailable or rate limited

**Handling**:
```javascript
try {
  tier3 = await analyzeGitHubRepo(project.repoUrl, projectStartDate, githubToken);
} catch (error) {
  console.warn(`GitHub analysis failed for ${project.id}: ${error.message}`);
  tier3 = null;
  // Continue with Tier 1 + 2 only
}

// Reweight progress aggregation
if (!tier3) {
  tier1Weight = 0.5;
  tier2Weight = 0.5;
}
```

**Result**: Progress reports generated with Tier 1+2 data only, lower confidence score

### Claude API Failure

**Scenario**: Claude API timeout, rate limit, or error

**Handling**:
```javascript
try {
  const slideStructure = await generateSlideStructure(promptContext, options);
  return slideStructure;
} catch (error) {
  console.error('Claude API error:', error);
  console.warn('Falling back to rule-based presentation structure');
  return generateFallbackStructure(promptContext, options);
}
```

**Result**: Rule-based presentation structure used instead, presentation still generated

### Missing Data

**Scenario**: Dashboard metrics not available for behavioral analysis

**Handling**:
```javascript
function analyzeBehavioralSignals(project, dashboardMetrics) {
  const mapping = BEHAVIORAL_MAPPINGS[project.id];

  if (!mapping) {
    return { progress: 0, signals: {}, confidence: 'none' };
  }

  const actualValues = extractMetrics(dashboardMetrics, mapping.metrics);

  if (!actualValues || Object.keys(actualValues).length === 0) {
    return { progress: 0, signals: {}, confidence: 'none' };
  }

  // ... calculate progress
}
```

**Result**: Tier 2 skipped, progress based on Tier 1+3 only

### Graceful Degradation Summary

| Component | Failure Mode | Fallback | Impact |
|-----------|--------------|----------|--------|
| **GitHub API** | Rate limit, 403, timeout | Skip Tier 3, use Tier 1+2 | Progress confidence: high→medium |
| **Claude API** | Rate limit, 500, timeout | Rule-based structure | Presentation: AI→Template |
| **Dashboard Metrics** | Missing metrics | Skip Tier 2, use Tier 1+3 | Progress confidence: high→medium |
| **Project Markdown** | Missing phases | Use status only | Progress confidence: medium→low |
| **All Tiers Fail** | Complete failure | Use project status | Progress: 0%, confidence: none |

---

## 11. Testing Strategy

### Unit Tests

**Module**: `progress-tracker.js`
```javascript
describe('Progress Tracker', () => {
  test('Tier 1: Phase completion analysis', () => {
    const project = {
      id: 'OP-011',
      phases: [
        { name: 'Phase 1 ✓ COMPLETE', timeline: 'Q1' },
        { name: 'Phase 2', timeline: 'Q2' },
        { name: 'Phase 3', timeline: 'Q3' }
      ]
    };

    const result = analyzePhaseCompletion(project);

    expect(result.progress).toBe(33); // 1 of 3 complete
    expect(result.completedPhases).toBe(1);
    expect(result.totalPhases).toBe(3);
  });

  test('Tier 2: Behavioral signal mapping', () => {
    const project = { id: 'OP-011' };
    const metrics = {
      claudeEnterprise: {
        plugins: 4,
        adoptionWAU: 67,
        commitCount: 42
      }
    };

    const result = analyzeBehavioralSignals(project, metrics);

    expect(result.progress).toBeGreaterThan(0);
    expect(result.confidence).toBe('medium');
  });

  test('Progress aggregation with missing Tier 3', () => {
    const tier1 = { progress: 60, confidence: 'high' };
    const tier2 = { progress: 70, confidence: 'medium' };
    const tier3 = null;

    const result = aggregateProgress(tier1, tier2, tier3);

    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThanOrEqual(100);
  });
});
```

**Module**: `ai-context-analyzer.js`
```javascript
describe('AI Context Analyzer', () => {
  test('Temporal position: Beginning of year', () => {
    const result = analyzeTemporalPosition(
      new Date('2026-01-15'),
      new Date('2026-01-01'),
      new Date('2026-12-31')
    );

    expect(result.currentQuarter).toBe('Q1');
    expect(result.timePhase).toBe('beginning');
    expect(result.percentYearComplete).toBeLessThan(10);
  });

  test('Narrative determination: NEW_PLAN', () => {
    const temporal = { timePhase: 'beginning', currentQuarter: 'Q1' };
    const projectStatus = { committed: { total: 3, onTrack: 2 } };

    const result = determineNarrative(temporal, projectStatus, null);

    expect(result.narrativeType).toBe('NEW_PLAN');
    expect(result.tone).toBe('ambitious');
  });

  test('Gap analysis: Execution gaps detected', () => {
    const progressReports = [
      { projectId: 'OP-008', actualProgress: 'behind', overallProgress: 45, blockers: ['Test delays'] }
    ];
    const scores = { 'OP-008': { finalScore: 75 } };

    const result = analyzeGaps(progressReports, {}, scores, 'Q1');

    expect(result.execution.length).toBe(1);
    expect(result.execution[0].projectId).toBe('OP-008');
  });
});
```

**Module**: `ai-presentation-generator.js`
```javascript
describe('AI Presentation Generator', () => {
  test('Build prompt context', () => {
    const inputs = {
      contextAnalysis: {
        temporal: { currentDate: '2026-01-15', currentQuarter: 'Q1' },
        narrative: { narrativeType: 'NEW_PLAN' }
      },
      progressReports: [],
      portfolioProjects: []
    };

    const result = buildPromptContext(inputs);

    expect(result.currentDate).toBe('2026-01-15');
    expect(result.narrativeType).toBe('NEW_PLAN');
  });

  test('Fallback structure generation', () => {
    const promptContext = {
      narrativeType: 'PROGRESS_UPDATE',
      currentQuarter: 'Q2'
    };
    const options = { minSlides: 5, maxSlides: 15 };

    const result = generateFallbackStructure(promptContext, options);

    expect(result.slideCount).toBeGreaterThanOrEqual(5);
    expect(result.slideCount).toBeLessThanOrEqual(15);
    expect(result.slides[0].type).toBe('title');
    expect(result.slides[1].type).toBe('executive_summary');
  });
});
```

### Integration Tests

**Test**: End-to-end pipeline
```javascript
describe('Annual Plan Pipeline Integration', () => {
  test('Generate presentation with all modules', async () => {
    // Setup
    const projects = await ingestProjects({ verbose: false });
    const dashboardMetrics = await ingestDashboardData({ verbose: false });
    const schedule = await scheduleProjects({ /* ... */ });
    const scores = await calculateScores({ /* ... */ });

    // Execute new modules
    const progressReports = await trackProgress({
      projects: projects.projects,
      dashboardMetrics,
      schedule: schedule.schedule,
      currentDate: new Date('2026-01-15')
    });

    const contextAnalysis = await analyzeContext({
      progressReports,
      projects: projects.projects,
      schedule: schedule.schedule,
      scores: scores.scores,
      currentDate: new Date('2026-01-15')
    });

    const presentation = await generatePresentation({
      contextAnalysis,
      progressReports,
      projects: projects.projects,
      scores: scores.scores,
      schedule: schedule.schedule
    });

    // Assertions
    expect(progressReports.length).toBeGreaterThan(0);
    expect(contextAnalysis.narrative.narrativeType).toBeDefined();
    expect(presentation.slides.length).toBeGreaterThanOrEqual(5);
    expect(presentation.metadata.narrativeType).toBeDefined();
  }, 30000); // 30 second timeout
});
```

### Manual Testing Scenarios

| Scenario | Setup | Expected Result |
|----------|-------|----------------|
| **New Plan (Jan)** | Run pipeline on Jan 15 | NEW_PLAN narrative, 9 forward-looking slides |
| **Progress Update (Apr)** | Run pipeline on Apr 20, mark OP-011 60% complete | PROGRESS_UPDATE narrative, 8 slides with wins/challenges |
| **Mid-Year Behind** | Run pipeline on Jul 15, mark 2/3 projects behind | COURSE_CORRECTION narrative, 9 slides with gap analysis |
| **Mid-Year On Track** | Run pipeline on Jul 15, mark 2/3 projects on track | MID_YEAR_CHECKPOINT narrative, 8 slides with H1 achievements |
| **Year End (Nov)** | Run pipeline on Nov 15, mark 5/7 complete | YEAR_END_SUMMARY narrative, 7 slides retrospective |
| **GitHub Unavailable** | Disable GitHub token, run pipeline | Progress reports use Tier 1+2 only, lower confidence |
| **Claude API Failure** | Mock Claude API failure | Fallback to rule-based structure, presentation still generated |

---

## 12. Implementation Plan

### Phase 1: Foundation (Week 1)

**Tasks**:
1. Create module files with skeleton functions
   - `progress-tracker.js`
   - `ai-context-analyzer.js`
   - `ai-presentation-generator.js`
2. Update `annual-plan-orchestrator.js` to call new modules
3. Define output JSON schemas
4. Write unit tests for core functions

**Deliverables**:
- [ ] Three new module files
- [ ] Updated orchestrator
- [ ] JSON schema documentation
- [ ] Unit test suite (30+ tests)

### Phase 2: Progress Tracking (Week 2)

**Tasks**:
1. Implement Tier 1 (phase completion analysis)
2. Implement Tier 2 (behavioral signal mapping)
3. Implement Tier 3 (GitHub integration with smart detection)
4. Test progress aggregation logic
5. Add error handling and fallbacks

**Deliverables**:
- [ ] Working progress-tracker module
- [ ] GitHub MCP integration
- [ ] `ai-projects-progress.json` output
- [ ] Integration tests

### Phase 3: Context Analysis (Week 2)

**Tasks**:
1. Implement temporal position analysis
2. Implement project progress assessment
3. Implement narrative determination (5 types)
4. Implement gap analysis (4 categories)
5. Implement recommendation engine

**Deliverables**:
- [ ] Working ai-context-analyzer module
- [ ] `ai-projects-context.json` output
- [ ] Narrative type detection
- [ ] Unit tests

### Phase 4: AI Presentation Generation (Week 3)

**Tasks**:
1. Implement prompt context builder
2. Integrate Claude API for slide structure generation
3. Implement content population for all slide types
4. Implement fallback structure generator
5. Test with different narrative types

**Deliverables**:
- [ ] Working ai-presentation-generator module
- [ ] Claude API integration
- [ ] 19 slide type content generators
- [ ] `ai-projects-presentation.json` output (dynamic)
- [ ] Integration tests

### Phase 5: UI Integration (Week 4)

**Tasks**:
1. Refactor `AnnualPlanPresentation.jsx` to consume JSON
2. Extract slide components (19 types)
3. Remove hardcoded `getSlidesData()` function
4. Update `page.jsx` to load new JSON files
5. Test all 5 narrative types in UI

**Deliverables**:
- [ ] Simplified AnnualPlanPresentation component
- [ ] 19 slide component files
- [ ] Dynamic slide rendering
- [ ] UI tests

### Phase 6: Documentation & Testing (Week 4)

**Tasks**:
1. Update SESSION_RESUME.md
2. Create AI project markdown template
3. Write integration test suite
4. Manual testing of all scenarios
5. Performance optimization

**Deliverables**:
- [ ] Updated documentation
- [ ] Project template
- [ ] Complete test suite
- [ ] Performance benchmarks
- [ ] PR ready for review

### Timeline

| Week | Phase | Key Milestones |
|------|-------|----------------|
| **Week 1** | Foundation | Module skeletons, schemas, unit tests |
| **Week 2** | Progress + Context | Tier 1-3 tracking, narrative determination |
| **Week 3** | AI Generation | Claude API integration, 19 slide types |
| **Week 4** | UI + Testing | React components, integration tests, PR |

**Total Duration**: 4 weeks

---

## 13. Success Metrics

### Functional Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Slide Adaptability** | 5 narrative types supported | Manual testing of all scenarios |
| **Progress Accuracy** | >80% alignment with actual status | Compare Tier 1 vs Tier 3 results |
| **GitHub Coverage** | >50% of projects analyzed | Count projects with repoUrl |
| **API Reliability** | <5% fallback rate | Monitor Claude API success rate |
| **Response Time** | <30 seconds total generation | Benchmark full pipeline |

### Quality Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Test Coverage** | >80% code coverage | Jest coverage report |
| **Narrative Accuracy** | 100% correct narrative type | Manual review of 10 scenarios |
| **Content Completeness** | 100% slides populated | Validate all content fields |
| **Error Handling** | Zero crashes on API failure | Test all failure modes |

### Business Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Executive Adoption** | Presentation used in 3+ board meetings | User feedback |
| **Time Savings** | 80% reduction in manual updates | Before/after comparison |
| **Strategic Insights** | 5+ actionable recommendations per run | Review recommendation quality |
| **Decision Quality** | Faster project prioritization decisions | User feedback |

---

## Conclusion

This design creates a fully dynamic, AI-driven presentation system that adapts to temporal context and project progress. The three-module architecture (Progress Tracker, Context Analyzer, Presentation Generator) provides:

1. **Intelligent Progress Tracking**: Three-tier analysis with GitHub integration
2. **Narrative Intelligence**: Five narrative types that tell the right story
3. **AI-Powered Structure**: Claude API determines optimal slides
4. **Graceful Degradation**: Works even when APIs fail
5. **Zero Hardcoding**: All content from generated data

The system transforms the annual plan from a static snapshot into a living, breathing document that evolves throughout the year—always showing the right story at the right time.

**Next Steps**: Review this design, approve, and proceed to implementation Phase 1.
