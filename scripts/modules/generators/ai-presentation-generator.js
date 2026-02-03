/**
 * AI Presentation Generator Module
 *
 * Uses Claude API to generate fully dynamic presentation structure:
 * - Builds context from all data sources
 * - Calls Claude API to determine optimal slide count and types
 * - Populates slides with actual data
 * - Falls back to rule-based structure if API fails
 */

const Anthropic = require('@anthropic-ai/sdk');

/**
 * Main entry point: Generate dynamic presentation
 * @param {Object} params
 * @param {Object} params.contextAnalysis - From ai-context-analyzer
 * @param {Array} params.progressReports - From progress-tracker
 * @param {Array} params.projects - From project-ingestor
 * @param {Object} params.scores - From hybrid-scorer
 * @param {Object} params.schedule - From constraint-scheduler
 * @param {Array} params.portfolioProjects - From portfolio-generator
 * @param {Object} params.dashboardMetrics - From dashboard-data-ingestor
 * @param {Object} params.previousPresentation - Optional: Last presentation
 * @param {Object} params.options - Generation options
 * @param {Boolean} params.verbose - Enable verbose logging
 * @returns {Promise<Object>} Generated presentation
 */
async function generatePresentation({
  contextAnalysis,
  progressReports,
  projects,
  scores,
  schedule,
  portfolioProjects,
  dashboardMetrics,
  previousPresentation = null,
  options = {},
  verbose = false
}) {
  const defaultOptions = {
    maxSlides: 15,
    minSlides: 5,
    includeAppendix: false,
    model: 'claude-sonnet-4-20250514'
  };

  const opts = { ...defaultOptions, ...options };

  if (verbose) {
    console.log('\n🎨 AI Presentation Generator: Starting...');
    console.log(`   Narrative Type: ${contextAnalysis.narrative.narrativeType}`);
  }

  // Step 1: Build prompt context
  const promptContext = buildPromptContext({
    contextAnalysis,
    progressReports,
    projects,
    scores,
    schedule,
    portfolioProjects
  });

  if (verbose) {
    console.log(`   Context: ${promptContext.totalProjects} projects, ${promptContext.projectsAtRisk.length} at risk`);
  }

  // Step 2: Generate slide structure via Claude API
  let slideStructure;
  let generationError = null;
  try {
    slideStructure = await generateSlideStructure(promptContext, opts, verbose);
  } catch (error) {
    console.error('Claude API error:', error.message);
    if (verbose) console.log('   Falling back to rule-based structure...');
    generationError = {
      message: error.message,
      type: error.name || 'APIError',
      timestamp: new Date().toISOString(),
      phase: 'slide_structure_generation'
    };
    slideStructure = generateFallbackStructure(promptContext, opts);
  }

  if (verbose) {
    console.log(`   Slide Structure: ${slideStructure.slideCount} slides generated`);
  }

  // Step 3: Populate slide content
  const populatedSlides = await populateSlideContent(slideStructure, {
    contextAnalysis,
    progressReports,
    projects,
    scores,
    schedule,
    portfolioProjects,
    dashboardMetrics
  });

  if (verbose) {
    console.log(`   Content: All ${populatedSlides.length} slides populated`);
    console.log(`\n✅ AI Presentation Generator: Complete`);
  }

  return {
    metadata: {
      generatedAt: new Date().toISOString(),
      generatedBy: 'ai-presentation-generator',
      version: `${contextAnalysis.temporal.fiscalYear}-${contextAnalysis.temporal.currentQuarter}`,
      narrativeType: contextAnalysis.narrative.narrativeType,
      model: opts.model,
      slideCount: populatedSlides.length,
      usedFallback: slideStructure.usedFallback || false,
      error: generationError
    },
    presentation: {
      title: slideStructure.presentationTitle,
      subtitle: slideStructure.presentationSubtitle || `${contextAnalysis.temporal.currentQuarter} ${contextAnalysis.temporal.fiscalYear}`,
      presenter: 'Agentic AI Team',
      date: contextAnalysis.temporal.currentDate,
      narrativeArc: slideStructure.narrativeArc,
      keyMessages: slideStructure.keyMessages
    },
    slides: populatedSlides
  };
}

/**
 * STEP 1: Build Prompt Context
 */
function buildPromptContext(inputs) {
  const { contextAnalysis, progressReports, projects, portfolioProjects } = inputs;

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
      id: p.projectId || p.project.split(':')[0].trim(),
      name: p.project,
      score: p.score,
      progress: progressReports.find(r => r.projectId === (p.projectId || p.project.split(':')[0].trim()))?.overallProgress || 0,
      status: p.status
    })),

    // Recommendations
    recommendations: contextAnalysis.recommendations
  };
}

/**
 * STEP 2: Generate Slide Structure via Claude API
 */
async function generateSlideStructure(promptContext, options, verbose) {
  const systemPrompt = `You are an expert executive presentation architect specializing in annual planning and progress reporting. Your role is to design slide structures for C-suite presentations that are:

1. BLUF-driven (Bottom Line Up Front)
2. Data-driven with clear metrics
3. Action-oriented with specific recommendations
4. Context-aware (adapting to timing and progress)

You will receive context about a company's AI project portfolio and current progress. Design a presentation structure that tells the right story for the current moment in time.`;

  const userPrompt = `Design an executive presentation for the 2026 AI Annual Plan.

TEMPORAL CONTEXT:
- Current Date: ${promptContext.currentDate}
- Current Quarter: ${promptContext.currentQuarter}
- Year Progress: ${promptContext.yearProgress} (${promptContext.timePhase} phase)
- Fiscal Year: ${promptContext.fiscalYear}

NARRATIVE TYPE: ${promptContext.narrativeType}
- Focus: ${promptContext.focus}
- Tone: ${promptContext.tone}
- Emphasis Areas: ${promptContext.suggestedEmphasis.join(', ')}

PROJECT STATUS:
- Total Projects: ${promptContext.totalProjects}
- Committed Projects: ${promptContext.committedProjects}
- Progress: ${promptContext.onTrackCount} on track, ${promptContext.behindCount} behind, ${promptContext.completedCount} completed
- Average Progress: ${promptContext.avgProgress}%

RISKS & GAPS:
${promptContext.projectsAtRisk.length > 0 ? `- ${promptContext.projectsAtRisk.length} projects at risk: ${promptContext.projectsAtRisk.map(p => p.id).join(', ')}` : '- No projects at risk'}
${promptContext.executionGaps.length > 0 ? `- Execution gaps in: ${promptContext.executionGaps.map(g => g.projectId).join(', ')}` : ''}
${promptContext.resourceGaps.length > 0 ? `- Resource constraints: ${promptContext.resourceGaps.map(g => `${g.quarter} ${g.issue}`).join(', ')}` : ''}

FINANCIAL SUMMARY:
- Total Portfolio Value: ${promptContext.totalValue}
- Average ROI: ${promptContext.avgROI}

TOP 5 PROJECTS:
${promptContext.topProjects.map((p, i) => `${i+1}. ${p.id}: ${p.name} (Score: ${p.score}, Progress: ${p.progress}%, Status: ${p.status})`).join('\n')}

CHANGES FROM PREVIOUS PLAN:
${promptContext.hasChanges ? `- ${promptContext.changesSummary.length} changes detected:\n${promptContext.changesSummary.map(c => `  • ${c.type}: ${c.description || c.projectId}`).join('\n')}` : '- No significant changes from previous plan'}

KEY RECOMMENDATIONS:
${promptContext.recommendations.map(r => `- [${r.priority.toUpperCase()}] ${r.action}`).join('\n')}

TASK:
Design a slide structure (${options.minSlides}-${options.maxSlides} slides) that tells the right story for this moment. Return a JSON object with this structure:

{
  "slideCount": <number>,
  "presentationTitle": "<title>",
  "presentationSubtitle": "<subtitle>",
  "slides": [
    {
      "slideNumber": 1,
      "type": "<slide_type>",
      "title": "<slide title>",
      "subtitle": "<optional subtitle>",
      "purpose": "<why this slide is needed>",
      "contentGuidance": {
        "sections": ["<section 1>", "<section 2>", ...],
        "keyMetrics": ["<metric 1>", "<metric 2>", ...],
        "dataSource": "<which data to use>",
        "visualization": "<chart/table/text>"
      }
    }
  ],
  "narrativeArc": "<overall story being told>",
  "keyMessages": ["<message 1>", "<message 2>", "<message 3>"]
}

SLIDE TYPES TO CHOOSE FROM:
- title: Opening slide with presentation title
- executive_summary: BLUF summary with key takeaways
- current_state: Where we are now (wins + challenges)
- progress_update: What was planned vs. what happened
- achievements: Major wins and completed projects
- challenges: Problems, risks, blockers
- strategic_context: Why these projects matter
- portfolio_overview: All projects summary
- portfolio_detail: Deep dive on specific project
- quarterly_roadmap: Q1-Q4 timeline
- q1_committed: Detailed Q1 execution plan
- q2_q4_potential: Future quarters planning
- resource_capacity: Team and capacity model
- dependencies_risks: Blockers and mitigation
- gap_analysis: Planned vs. actual gaps
- pivot_strategy: Course corrections needed
- year_end_summary: Annual achievements recap
- next_steps: Recommendations and actions
- appendix: Supporting details

IMPORTANT GUIDELINES:
1. Start with title slide, then executive_summary (BLUF)
2. Match slide emphasis to narrative type (${promptContext.narrativeType})
3. If ${promptContext.timePhase} === 'beginning': Focus on forward-looking slides (strategy, roadmap, commitment)
4. If ${promptContext.timePhase} === 'early' or 'mid': Balance past progress + future plans
5. If ${promptContext.timePhase} === 'late': Focus on retrospective (achievements, outcomes, lessons)
6. Include risks/challenges slides if projects are behind or at-risk
7. Include gap_analysis or pivot_strategy if major course corrections needed
8. Always end with next_steps/recommendations
9. Keep slide count appropriate for narrative (NEW_PLAN: 9-12 slides, PROGRESS_UPDATE: 7-10 slides, YEAR_END_SUMMARY: 8-11 slides)

Return ONLY valid JSON, no additional text.`;

  // Call Claude API
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });

  if (verbose) console.log('   Calling Claude API for slide structure...');

  const message = await anthropic.messages.create({
    model: options.model,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7
  });

  const responseText = message.content[0].text;
  const cleanedResponse = stripMarkdownCodeFence(responseText);
  const slideStructure = JSON.parse(cleanedResponse);

  // Validate structure
  if (!slideStructure.slides || !Array.isArray(slideStructure.slides)) {
    throw new Error('Invalid slide structure returned from Claude API');
  }

  // Enforce limits
  if (slideStructure.slideCount > options.maxSlides) {
    console.warn(`Claude suggested ${slideStructure.slideCount} slides, truncating to ${options.maxSlides}`);
    slideStructure.slides = slideStructure.slides.slice(0, options.maxSlides);
    slideStructure.slideCount = options.maxSlides;
  }

  return slideStructure;
}

/**
 * STEP 3: Populate Slide Content
 */
async function populateSlideContent(slideStructure, inputs) {
  const populatedSlides = [];

  for (let i = 0; i < slideStructure.slides.length; i++) {
    const slide = slideStructure.slides[i];
    const content = await generateContentForSlideType(slide.type, slide.contentGuidance || {}, inputs, slide);

    populatedSlides.push({
      id: i + 1,
      type: slide.type,
      title: slide.title,
      subtitle: slide.subtitle || '',
      purpose: slide.purpose || '',
      content: content
    });
  }

  return populatedSlides;
}

/**
 * Content Generator Router
 */
async function generateContentForSlideType(slideType, guidance, data, slide) {
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

  const generator = contentGenerators[slideType];
  if (!generator) {
    console.warn(`Unknown slide type: ${slideType}, using generic content`);
    return { note: `Content for ${slideType} slide` };
  }

  return await generator(data, guidance, slide);
}

/**
 * STEP 4: Fallback Structure Generator
 */
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
      { type: 'next_steps', title: 'Recommendations & Next Steps' }
    ],
    PROGRESS_UPDATE: [
      { type: 'title', title: `${promptContext.currentQuarter} Progress Update` },
      { type: 'executive_summary', title: 'Executive Summary' },
      { type: 'achievements', title: 'Key Wins' },
      { type: 'progress_update', title: 'Planned vs. Actual' },
      { type: 'challenges', title: 'Challenges & Risks' },
      { type: 'portfolio_overview', title: 'Portfolio Status' },
      { type: 'quarterly_roadmap', title: 'Remaining Year Roadmap' },
      { type: 'next_steps', title: 'Actions & Decisions Needed' }
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
    presentationTitle: `2026 Annual Plan: ${promptContext.narrativeType.replace(/_/g, ' ')}`,
    presentationSubtitle: `${promptContext.currentQuarter} Update`,
    narrativeArc: {
      opening: `Opening: ${promptContext.narrativeType} presentation`,
      body: `Body: Status and recommendations`,
      closing: `Closing: Next steps and decisions`
    },
    keyMessages: [
      `${promptContext.totalProjects} projects in portfolio`,
      `${promptContext.committedProjects} committed for ${promptContext.currentQuarter}`,
      `Average progress: ${promptContext.avgProgress}%`
    ],
    slides: selectedTemplate.map((slide, index) => ({
      slideNumber: index + 1,
      type: slide.type,
      title: slide.title,
      subtitle: '',
      purpose: `Standard ${slide.type} slide`,
      contentGuidance: {}
    })),
    usedFallback: true
  };
}

// ============================================================================
// CONTENT GENERATORS (Stubs - to be implemented)
// ============================================================================

function generateTitleSlide(data, guidance, slide) {
  return {
    presenter: 'Agentic AI Team',
    date: data.contextAnalysis.temporal.currentDate,
    organization: 'TechCo Inc'
  };
}

function generateExecutiveSummary(data, guidance, slide) {
  const { contextAnalysis, portfolioProjects } = data;

  return {
    bluf: {
      headline: `${portfolioProjects.length} AI projects prioritized for 2026 delivery`,
      impact: calculateTotalValue(portfolioProjects),
      approach: 'Hybrid scoring (Multi-Factor + ROI) with capacity constraints',
      confidence: 'High'
    },
    keyPoints: [
      `${contextAnalysis.temporal.currentQuarter}: ${contextAnalysis.projectStatus.committed.total} committed projects`,
      `Average progress: ${contextAnalysis.projectStatus.overall.avgProgress}%`,
      `${contextAnalysis.projectStatus.overall.projectsAtRisk.length} projects need attention`
    ],
    recommendations: contextAnalysis.recommendations.slice(0, 3).map(r => r.action)
  };
}

function generateCurrentState(data, guidance, slide) {
  // TODO: Implement
  return { note: 'Current state content' };
}

function generateProgressUpdate(data, guidance, slide) {
  const { contextAnalysis, progressReports, portfolioProjects } = data;

  return {
    timeframe: `${contextAnalysis.temporal.currentQuarter} 2026`,
    planned: {
      title: 'What We Planned',
      projects: portfolioProjects
        .filter(p => p.qStart === contextAnalysis.temporal.currentQuarter)
        .map(p => ({
          id: p.projectId || p.project.split(':')[0].trim(),
          name: p.project,
          status: p.status
        }))
    },
    actual: {
      title: 'What Happened',
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
    metrics: {
      avgProgress: contextAnalysis.projectStatus.overall.avgProgress
    }
  };
}

function generateAchievements(data, guidance, slide) {
  // TODO: Implement
  return { note: 'Achievements content' };
}

function generateChallenges(data, guidance, slide) {
  // TODO: Implement
  return { note: 'Challenges content' };
}

function generateStrategicContext(data, guidance, slide) {
  // TODO: Implement
  return { note: 'Strategic context content' };
}

function generatePortfolioOverview(data, guidance, slide) {
  return {
    projects: data.portfolioProjects,
    totalValue: calculateTotalValue(data.portfolioProjects),
    avgROI: calculateAverageROI(data.portfolioProjects),
    projectCount: data.portfolioProjects.length
  };
}

function generatePortfolioDetail(data, guidance, slide) {
  // TODO: Implement
  return { note: 'Portfolio detail content' };
}

function generateQuarterlyRoadmap(data, guidance, slide) {
  // Enrich schedule with full project names
  const enrichedSchedule = {};

  for (const quarter in data.schedule) {
    const quarterData = data.schedule[quarter];

    // Map project IDs to full names
    const projectsWithNames = (quarterData.projects || []).map(projectId => {
      const project = data.projects.find(p => p.id === projectId);
      return project ? `${project.id}: ${project.name}` : projectId;
    });

    enrichedSchedule[quarter] = {
      ...quarterData,
      projects: projectsWithNames
    };
  }

  return {
    schedule: enrichedSchedule,
    currentQuarter: data.contextAnalysis.temporal.currentQuarter
  };
}

function generateQ1Committed(data, guidance, slide) {
  // TODO: Implement
  return { note: 'Q1 committed content' };
}

function generateQ2Q4Potential(data, guidance, slide) {
  // TODO: Implement
  return { note: 'Q2-Q4 potential content' };
}

function generateResourceCapacity(data, guidance, slide) {
  // TODO: Implement
  return { note: 'Resource capacity content' };
}

function generateDependenciesRisks(data, guidance, slide) {
  return {
    gaps: data.contextAnalysis.gaps,
    projectsAtRisk: data.contextAnalysis.projectStatus.overall.projectsAtRisk
  };
}

function generateGapAnalysis(data, guidance, slide) {
  return {
    executionGaps: data.contextAnalysis.gaps.execution,
    strategicGaps: data.contextAnalysis.gaps.strategic,
    resourceGaps: data.contextAnalysis.gaps.resource,
    dependencyGaps: data.contextAnalysis.gaps.dependency
  };
}

function generatePivotStrategy(data, guidance, slide) {
  // TODO: Implement
  return { note: 'Pivot strategy content' };
}

function generateYearEndSummary(data, guidance, slide) {
  // TODO: Implement
  return { note: 'Year-end summary content' };
}

function generateNextSteps(data, guidance, slide) {
  return {
    recommendations: data.contextAnalysis.recommendations
  };
}

function generateAppendix(data, guidance, slide) {
  // TODO: Implement
  return { note: 'Appendix content' };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Strip markdown code fences from AI response
 * Handles responses wrapped in ```json ... ``` or ``` ... ```
 */
function stripMarkdownCodeFence(text) {
  if (!text) return text;

  // Remove leading/trailing whitespace
  let cleaned = text.trim();

  // Check for code fence patterns and extract JSON
  // Pattern 1: ```json\n...\n``` or ```\n...\n```
  const codeFenceMatch = cleaned.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/);
  if (codeFenceMatch) {
    cleaned = codeFenceMatch[1].trim();
  }

  // Pattern 2: Sometimes AI adds extra text before/after the JSON
  // Look for the first { and last } to extract JSON object
  if (!cleaned.startsWith('{') && !cleaned.startsWith('[')) {
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }
  }

  return cleaned;
}

function calculateTotalValue(portfolioProjects) {
  const total = portfolioProjects.reduce((sum, p) => {
    // Skip TBD values
    if (!p.value || p.value === 'TBD') return sum;

    // Extract numeric value
    const cleaned = p.value.replace(/[$M,]/g, '');
    const value = parseFloat(cleaned);

    // Only add if it's a valid number
    return isNaN(value) ? sum : sum + value;
  }, 0);

  return `$${total.toFixed(2)}M`;
}

function calculateAverageROI(portfolioProjects) {
  const rois = portfolioProjects
    .map(p => {
      // Skip TBD values
      if (!p.roi || p.roi === 'TBD') return null;

      // Extract numeric value
      const cleaned = p.roi.replace(/%/g, '');
      const roi = parseFloat(cleaned);

      // Only include valid positive numbers
      return isNaN(roi) || roi <= 0 ? null : roi;
    })
    .filter(roi => roi !== null);

  if (rois.length === 0) return 'TBD';

  const avg = rois.reduce((sum, roi) => sum + roi, 0) / rois.length;
  return `${Math.round(avg)}%`;
}

module.exports = {
  generatePresentation,
  buildPromptContext,
  generateFallbackStructure
};
