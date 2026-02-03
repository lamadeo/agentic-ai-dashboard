/**
 * AI Context Analyzer Module
 *
 * Analyzes temporal context and determines presentation narrative:
 * - Temporal position analysis (where in fiscal year)
 * - Project progress assessment
 * - Narrative determination (5 types)
 * - Gap analysis (execution, strategic, dependency, resource)
 * - Change detection vs. previous plan
 * - Recommendation generation
 */

/**
 * Main entry point: Analyze context for presentation generation
 * @param {Object} params
 * @param {Array} params.progressReports - From progress-tracker
 * @param {Array} params.projects - From project-ingestor
 * @param {Object} params.schedule - From constraint-scheduler
 * @param {Object} params.scores - From hybrid-scorer
 * @param {Date} params.currentDate - Current date
 * @param {Date} params.fiscalYearStart - Fiscal year start (default Jan 1)
 * @param {Date} params.fiscalYearEnd - Fiscal year end (default Dec 31)
 * @param {Object} params.previousPlanData - Optional: Last plan for comparison
 * @param {Boolean} params.verbose - Enable verbose logging
 * @returns {Promise<Object>} Context analysis
 */
async function analyzeContext({
  progressReports,
  projects,
  schedule,
  scores,
  currentDate = new Date(),
  fiscalYearStart = new Date(currentDate.getFullYear(), 0, 1),
  fiscalYearEnd = new Date(currentDate.getFullYear(), 11, 31),
  previousPlanData = null,
  verbose = false
}) {
  if (verbose) {
    console.log('\n📊 AI Context Analyzer: Starting analysis...');
    console.log(`   Current Date: ${currentDate.toISOString().split('T')[0]}`);
  }

  // 1. Analyze temporal position
  const temporal = analyzeTemporalPosition(currentDate, fiscalYearStart, fiscalYearEnd);

  if (verbose) {
    console.log(`   Time Phase: ${temporal.timePhase} (${temporal.percentYearComplete}% through year)`);
  }

  // 2. Assess project progress
  const projectStatus = assessProjectProgress(progressReports, schedule, temporal.currentQuarter);

  if (verbose) {
    console.log(`   Project Status: ${projectStatus.committed.onTrack} on track, ${projectStatus.committed.behind} behind`);
  }

  // 3. Determine narrative
  const narrative = determineNarrative(temporal, projectStatus, previousPlanData);

  if (verbose) {
    console.log(`   Narrative: ${narrative.narrativeType} (${narrative.tone} tone)`);
  }

  // 4. Analyze gaps
  const gaps = analyzeGaps(progressReports, schedule, scores, temporal.currentQuarter);

  if (verbose) {
    console.log(`   Gaps: ${gaps.execution.length} execution, ${gaps.resource.length} resource`);
  }

  // 5. Detect changes
  const changes = detectChanges({ progressReports, projects, schedule }, previousPlanData);

  if (verbose) {
    console.log(`   Changes: ${changes.changeCount} detected`);
  }

  // 6. Generate recommendations
  const recommendations = generateRecommendations(
    { temporal, projectStatus, narrative, gaps, changes },
    progressReports,
    gaps
  );

  if (verbose) {
    console.log(`   Recommendations: ${recommendations.length} generated`);
    console.log(`\n✅ AI Context Analyzer: Complete`);
  }

  return {
    temporal,
    projectStatus,
    narrative,
    gaps,
    changes,
    recommendations,
    presentationHints: generatePresentationHints(narrative, gaps, projectStatus)
  };
}

/**
 * FUNCTION 1: Temporal Position Analysis
 */
function analyzeTemporalPosition(currentDate, fiscalYearStart, fiscalYearEnd) {
  const totalDays = daysBetween(fiscalYearStart, fiscalYearEnd);
  const elapsedDays = daysBetween(fiscalYearStart, currentDate);
  const remainingDays = daysBetween(currentDate, fiscalYearEnd);

  const percentComplete = Math.round((elapsedDays / totalDays) * 100);
  const currentQuarter = `Q${Math.ceil((currentDate.getMonth() + 1) / 3)}`;

  // Classify time phase
  let timePhase;
  if (percentComplete < 10) timePhase = 'beginning';
  else if (percentComplete < 40) timePhase = 'early';
  else if (percentComplete < 70) timePhase = 'mid';
  else timePhase = 'late';

  return {
    currentDate: currentDate.toISOString().split('T')[0],
    currentQuarter,
    fiscalYear: currentDate.getFullYear(),
    percentYearComplete: percentComplete,
    elapsedDays,
    remainingDays,
    timePhase,
    daysUntilNextQuarter: calculateDaysToNextQuarter(currentDate),
    isBeginningOfYear: percentComplete < 10,
    isMidYear: percentComplete >= 40 && percentComplete < 60,
    isEndOfYear: percentComplete > 85
  };
}

/**
 * FUNCTION 2: Project Progress Assessment
 */
function assessProjectProgress(progressReports, schedule, currentQuarter) {
  const assessment = {
    committed: { total: 0, onTrack: 0, behind: 0, ahead: 0, completed: 0 },
    potential: { total: 0, started: 0, notStarted: 0, deferred: 0 },
    overall: { avgProgress: 0, projectsAtRisk: [], projectsExceeding: [] }
  };

  progressReports.forEach(report => {
    const quarterNum = parseInt(currentQuarter.replace('Q', ''));
    const isCommitted = schedule[currentQuarter]?.committed?.includes(report.projectId) ||
                       schedule[`Q${quarterNum}`]?.committed?.includes(report.projectId);

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
  assessment.overall.avgProgress = progressReports.length > 0 ?
    Math.round(totalProgress / progressReports.length) : 0;

  return assessment;
}

/**
 * FUNCTION 3: Narrative Determination
 */
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
      message: `Year-end summary: Delivered ${committed.completed} projects, preparing ${temporalPosition.fiscalYear + 1} plan`
    };
  }

  // Default fallback
  return {
    narrativeType: 'PROGRESS_UPDATE',
    focus: 'balanced',
    slideEmphasis: ['progress', 'roadmap'],
    tone: 'measured',
    message: 'Standard progress update'
  };
}

/**
 * FUNCTION 4: Gap Analysis
 */
function analyzeGaps(progressReports, schedule, scores, currentQuarter) {
  const gaps = {
    execution: [],
    strategic: [],
    dependency: [],
    resource: []
  };

  const quarterNum = parseInt(currentQuarter.replace('Q', ''));

  // 1. Execution gaps
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

  // 2. Strategic gaps
  const highPriorityProjects = Object.entries(scores)
    .filter(([id, data]) => data.finalScore > 70)
    .map(([id]) => id);

  const notStartedHighPriority = highPriorityProjects.filter(id => {
    const report = progressReports.find(r => r.projectId === id);
    const plannedQ = typeof report?.plannedQuarter === 'string'
      ? parseInt(report.plannedQuarter.replace('Q', ''))
      : report?.plannedQuarter;
    return report?.status === 'proposed' && plannedQ && plannedQ <= quarterNum;
  });

  gaps.strategic = notStartedHighPriority.map(id => ({
    projectId: id,
    score: scores[id].finalScore,
    reason: 'High priority but not started'
  }));

  // 3. Resource gaps
  Object.entries(schedule).forEach(([quarter, data]) => {
    const utilization = (data.allocated / data.capacity) * 100;
    const qNum = parseInt(quarter.replace('Q', ''));

    if (utilization > 95) {
      gaps.resource.push({
        quarter,
        issue: 'over-allocated',
        allocated: data.allocated,
        capacity: data.capacity,
        buffer: data.buffer
      });
    } else if (utilization < 50 && qNum <= quarterNum) {
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

/**
 * FUNCTION 5: Change Detection
 */
function detectChanges(currentData, previousPlanData) {
  if (!previousPlanData) {
    return { hasChanges: false, changes: [], changeCount: 0 };
  }

  const changes = [];

  // TODO: Implement change detection logic
  // - Detect re-prioritization
  // - Detect status changes
  // - Detect deferred projects

  return {
    hasChanges: changes.length > 0,
    changes: changes,
    changeCount: changes.length
  };
}

/**
 * FUNCTION 6: Recommendation Engine
 */
function generateRecommendations(contextAnalysis, progressReports, gaps) {
  const recommendations = [];

  // Immediate actions (high priority)
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

  // Near-term actions
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

  // Long-term actions
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

/**
 * Generate presentation hints
 */
function generatePresentationHints(narrative, gaps, projectStatus) {
  const hints = {
    suggestedSlideCount: 9,
    criticalSlides: ['executive_summary'],
    skipSlides: [],
    emphasisSlides: []
  };

  // Adjust based on narrative type
  if (narrative.narrativeType === 'NEW_PLAN') {
    hints.suggestedSlideCount = 9;
    hints.criticalSlides.push('strategic_context', 'quarterly_roadmap');
    hints.emphasisSlides.push('roadmap', 'resources');
  } else if (narrative.narrativeType === 'PROGRESS_UPDATE') {
    hints.suggestedSlideCount = 8;
    hints.criticalSlides.push('progress_update', 'challenges');
    hints.emphasisSlides.push('wins', 'adjustments');
  } else if (narrative.narrativeType === 'COURSE_CORRECTION') {
    hints.suggestedSlideCount = 9;
    hints.criticalSlides.push('gap_analysis', 'pivot_strategy');
    hints.emphasisSlides.push('gaps', 'pivot');
  } else if (narrative.narrativeType === 'MID_YEAR_CHECKPOINT') {
    hints.suggestedSlideCount = 8;
    hints.criticalSlides.push('achievements', 'quarterly_roadmap');
    hints.emphasisSlides.push('achievements', 'Q3-Q4-plan');
  } else if (narrative.narrativeType === 'YEAR_END_SUMMARY') {
    hints.suggestedSlideCount = 7;
    hints.criticalSlides.push('achievements', 'year_end_summary');
    hints.emphasisSlides.push('outcomes', 'lessons');
  }

  // Add risks slide if projects at risk
  if (projectStatus.overall.projectsAtRisk.length > 0) {
    hints.criticalSlides.push('dependencies_risks');
  }

  return hints;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function daysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date2 - date1) / oneDay));
}

function calculateDaysToNextQuarter(currentDate) {
  const currentMonth = currentDate.getMonth();
  const currentQuarter = Math.ceil((currentMonth + 1) / 3);
  const nextQuarterMonth = currentQuarter * 3; // 3, 6, 9, 12

  let nextQuarterDate;
  if (nextQuarterMonth > 11) {
    nextQuarterDate = new Date(currentDate.getFullYear() + 1, 0, 1);
  } else {
    nextQuarterDate = new Date(currentDate.getFullYear(), nextQuarterMonth, 1);
  }

  return daysBetween(currentDate, nextQuarterDate);
}

module.exports = {
  analyzeContext,
  analyzeTemporalPosition,
  assessProjectProgress,
  determineNarrative,
  analyzeGaps
};
