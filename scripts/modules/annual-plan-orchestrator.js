/**
 * Annual Plan Orchestrator
 *
 * Orchestrates the complete annual plan generation pipeline.
 * Coordinates all modules: ingestors → processors → generators → output.
 *
 * Pipeline Flow:
 * 1. INGEST - Load project definitions and dashboard metrics
 * 2. ANALYZE - Build dependency graph with data-driven classification
 * 3. SCORE - Calculate hybrid priority scores
 * 4. SCHEDULE - Constraint-based quarterly roadmap
 * 5. PROGRESS - Track project progress (3-tier analysis)
 * 6. AI_ANALYZE - Analyze temporal context and determine narrative
 * 7. GENERATE - Create presentation and portfolio structures (AI-driven or static)
 * 8. OUTPUT - Write JSON files for dashboard integration
 *
 * Dependencies: All annual plan modules
 */

const fs = require('fs');
const path = require('path');

// Ingestors
const { ingestProjects } = require('./ingestors/project-ingestor');
const { ingestDashboardData } = require('./ingestors/dashboard-data-ingestor');

// Processors
const { analyzeDependencies } = require('./processors/dependency-analyzer');
const { calculateScores } = require('./processors/hybrid-scorer');
const { scheduleProjects } = require('./processors/constraint-scheduler');
const { trackProgress } = require('./processors/progress-tracker');
const { analyzeContext } = require('./processors/ai-context-analyzer');

// Generators
const { generatePortfolio } = require('./generators/portfolio-generator');
const { generatePresentation: generatePresentationOld } = require('./generators/presentation-generator');
const { generatePresentation: generatePresentationAI } = require('./generators/ai-presentation-generator');

/**
 * Orchestrate complete annual plan generation
 *
 * @param {Object} options - Configuration options
 * @param {string} options.quarter - Target quarter for scoring (default: Q1)
 * @param {string} options.outputDir - Output directory for generated files
 * @param {boolean} options.verbose - Enable detailed logging (default: true)
 * @returns {Promise<Object>} Complete annual plan data
 */
async function generateAnnualPlan(options = {}) {
  const {
    quarter = 'Q1',
    outputDir = path.join(__dirname, '..', '..', 'app'),
    verbose = true
  } = options;

  const startTime = Date.now();

  if (verbose) {
    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║  Annual Plan Generator - 2026 AI Strategy                     ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');
  }

  try {
    // Phase 1: INGEST
    if (verbose) {
      console.log('📥 Phase 1: INGESTION\n');
    }

    const projectsResult = await ingestProjects({ verbose });
    if (verbose) {
      console.log(`   ✅ Ingested ${projectsResult.projects.length} projects (${projectsResult.metadata.totalFiles} files)\n`);
    }

    const dashboardMetrics = await ingestDashboardData({ verbose });
    if (verbose) {
      console.log(`   ✅ Ingested dashboard metrics\n`);
    }

    // Load raw dashboard data for progress tracking (Tier 2)
    const rawDashboardPath = path.join(outputDir, 'ai-tools-data.json');
    const rawDashboardData = JSON.parse(fs.readFileSync(rawDashboardPath, 'utf8'));

    // Phase 2: ANALYZE
    if (verbose) {
      console.log('🔍 Phase 2: ANALYSIS\n');
    }

    const analysis = await analyzeDependencies({
      projects: projectsResult.projects,
      dashboardMetrics,
      verbose
    });
    if (verbose) {
      console.log(`   ✅ Analyzed ${Object.keys(analysis.graph).length} project dependencies\n`);
    }

    // Phase 3: SCORE
    if (verbose) {
      console.log('📊 Phase 3: SCORING\n');
    }

    const scoring = await calculateScores({
      projects: projectsResult.projects,
      dependencyGraph: analysis.graph,
      quarter,
      verbose
    });
    if (verbose) {
      console.log(`   ✅ Calculated scores for ${scoring.ranked.length} projects\n`);
    }

    // Phase 4: SCHEDULE
    if (verbose) {
      console.log('📅 Phase 4: SCHEDULING\n');
    }

    const scheduling = await scheduleProjects({
      rankedProjects: scoring.ranked,
      scores: scoring.scores,
      dependencyGraph: analysis.graph,
      verbose
    });
    if (verbose) {
      console.log(`   ✅ Scheduled projects across 4 quarters\n`);
    }

    // Phase 5: PROGRESS TRACKING
    if (verbose) {
      console.log('📈 Phase 5: PROGRESS TRACKING\n');
    }

    const progressReports = await trackProgress({
      projects: projectsResult.projects,
      dashboardMetrics: rawDashboardData,  // Pass raw data for Tier 2 behavioral signals
      schedule: scheduling.schedule,
      currentDate: new Date(),
      githubToken: process.env.GITHUB_TOKEN,
      verbose
    });
    if (verbose) {
      console.log(`   ✅ Tracked progress for ${progressReports.length} projects\n`);
    }

    // Phase 6: AI CONTEXT ANALYSIS
    if (verbose) {
      console.log('🧠 Phase 6: AI CONTEXT ANALYSIS\n');
    }

    const contextAnalysis = await analyzeContext({
      progressReports,
      projects: projectsResult.projects,
      schedule: scheduling.schedule,
      scores: scoring.scores,
      currentDate: new Date(),
      previousPlanData: null, // TODO: Load previous plan for comparison
      verbose
    });
    if (verbose) {
      console.log(`   ✅ Analyzed context: ${contextAnalysis.narrative.narrativeType} narrative\n`);
    }

    // Phase 7: GENERATE
    if (verbose) {
      console.log('🎨 Phase 7: GENERATION\n');
    }

    const portfolio = await generatePortfolio({
      rankedProjects: scoring.ranked,
      scores: scoring.scores,
      schedule: scheduling.schedule,
      dependencyGraph: analysis.graph,
      rationales: analysis.rationales,
      projects: projectsResult.projects,
      verbose
    });
    if (verbose) {
      console.log(`   ✅ Generated portfolio table (${portfolio.projects.length} projects)\n`);
    }

    // Generate presentation (use AI generator if enabled, otherwise use old generator)
    const useAIGenerator = process.env.USE_AI_PRESENTER === 'true';
    let presentation;

    if (useAIGenerator) {
      presentation = await generatePresentationAI({
        contextAnalysis,
        progressReports,
        projects: projectsResult.projects,
        scores: scoring.scores,
        schedule: scheduling.schedule,
        portfolioProjects: portfolio.projects,
        dashboardMetrics,
        verbose
      });
      if (verbose) {
        console.log(`   ✅ Generated AI-driven presentation (${presentation.metadata.slideCount} slides, ${presentation.metadata.narrativeType})\n`);
      }
    } else {
      presentation = await generatePresentationOld({
        rankedProjects: scoring.ranked,
        scores: scoring.scores,
        schedule: scheduling.schedule,
        dependencyGraph: analysis.graph,
        capacityModel: scheduling.capacityModel,
        deferredProjects: scheduling.deferredProjects,
        projects: projectsResult.projects,
        portfolioProjects: portfolio.projects,
        verbose
      });
      if (verbose) {
        console.log(`   ✅ Generated presentation structure (${presentation.metadata.totalSlides} slides)\n`);
      }
    }

    // Phase 8: OUTPUT
    if (verbose) {
      console.log('💾 Phase 8: OUTPUT\n');
    }

    const output = await writeOutputFiles({
      portfolio,
      presentation,
      schedule: scheduling.schedule,
      scores: scoring.scores,
      dependencyGraph: analysis.graph,
      progressReports,
      contextAnalysis,
      metadata: {
        generatedAt: new Date().toISOString(),
        quarter,
        projectCount: projectsResult.projects.length,
        version: `2026-${quarter}`,
        narrativeType: contextAnalysis.narrative.narrativeType
      },
      outputDir,
      useAIGenerator,
      verbose
    });

    if (verbose) {
      console.log(`   ✅ Written ${output.filesWritten} output files\n`);
    }

    // Summary
    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);

    if (verbose) {
      console.log('═'.repeat(65));
      console.log('\n✅ Annual Plan Generation Complete\n');
      console.log(`   Projects Analyzed: ${projectsResult.projects.length}`);
      console.log(`   Top Priority: ${scoring.ranked[0].id} (Score: ${scoring.ranked[0].score.toFixed(1)})`);
      console.log(`   Q1 Committed: ${scheduling.schedule.Q1.projects.length} projects`);
      console.log(`   Q2-Q4 Potential: ${scheduling.schedule.Q2.projects.length + scheduling.schedule.Q3.projects.length + scheduling.schedule.Q4.projects.length} projects`);
      console.log(`   Deferred: ${scheduling.deferredProjects.length} projects`);
      console.log(`   Files Written: ${output.filesWritten}`);
      console.log(`   Execution Time: ${elapsedTime}s\n`);
      console.log('═'.repeat(65));
      console.log('\n📁 Output Files:\n');
      output.files.forEach(file => {
        console.log(`   • ${file.path}`);
        console.log(`     ${file.description}\n`);
      });
    }

    return {
      projects: projectsResult.projects,
      analysis,
      scoring,
      scheduling,
      progressReports,
      contextAnalysis,
      portfolio,
      presentation,
      output,
      metadata: {
        generatedAt: new Date().toISOString(),
        quarter,
        executionTime: elapsedTime,
        version: `2026-${quarter}`,
        narrativeType: contextAnalysis.narrative.narrativeType
      }
    };

  } catch (error) {
    console.error('\n❌ Annual Plan Generation Failed\n');
    console.error(`   Error: ${error.message}`);
    console.error(`   Stack: ${error.stack}\n`);
    throw error;
  }
}

/**
 * Write output files for dashboard integration
 *
 * Output strategy:
 * - /app/*.json - Files imported at build time by React components
 * - /public/*.json - Files fetched at runtime via fetch()
 *
 * Files written:
 * 1. /app/ai-projects-portfolio.json - Imported by page.jsx
 * 2. /app/ai-projects-presentation.json - Imported by page.jsx (static version only)
 * 3. /public/ai-projects-presentation-dynamic.json - Fetched by DynamicAnnualPlanPresentation.jsx
 * 4. /public/ai-projects-progress.json - Fetched by AnnualPlanPresentation.jsx
 */
async function writeOutputFiles(options = {}) {
  const {
    portfolio,
    presentation,
    progressReports,
    metadata,
    outputDir,
    useAIGenerator = false,
    verbose = false
  } = options;

  const files = [];
  const publicDir = path.join(outputDir, '..', 'public');

  // File 1: ai-projects-portfolio.json (imported by page.jsx)
  const portfolioPath = path.join(outputDir, 'ai-projects-portfolio.json');
  const portfolioData = {
    projects: portfolio.projects,
    metadata: {
      ...portfolio.metadata,
      ...metadata
    }
  };
  fs.writeFileSync(portfolioPath, JSON.stringify(portfolioData, null, 2));
  files.push({
    path: portfolioPath,
    description: 'Portfolio table - imported by page.jsx'
  });
  if (verbose) {
    console.log(`   ✅ Written: ${portfolioPath}`);
  }

  // File 2: Presentation files
  const presentationData = {
    slides: presentation.slides,
    metadata: {
      ...presentation.metadata,
      ...metadata
    }
  };

  if (useAIGenerator) {
    // Dynamic presentation: write ONLY to /public/ (fetched at runtime)
    const publicPresentationPath = path.join(publicDir, 'ai-projects-presentation-dynamic.json');
    fs.writeFileSync(publicPresentationPath, JSON.stringify(presentationData, null, 2));
    files.push({
      path: publicPresentationPath,
      description: 'Dynamic presentation (beta) - fetched by DynamicAnnualPlanPresentation.jsx'
    });
    if (verbose) {
      console.log(`   ✅ Written: ${publicPresentationPath}`);
    }
  } else {
    // Static presentation: write to /app/ (imported at build time)
    const presentationPath = path.join(outputDir, 'ai-projects-presentation.json');
    fs.writeFileSync(presentationPath, JSON.stringify(presentationData, null, 2));
    files.push({
      path: presentationPath,
      description: 'Static presentation - imported by page.jsx'
    });
    if (verbose) {
      console.log(`   ✅ Written: ${presentationPath}`);
    }
  }

  // File 3: ai-projects-progress.json (fetched at runtime)
  const progressData = {
    reports: progressReports,
    metadata
  };
  const publicProgressPath = path.join(publicDir, 'ai-projects-progress.json');
  fs.writeFileSync(publicProgressPath, JSON.stringify(progressData, null, 2));
  files.push({
    path: publicProgressPath,
    description: 'Progress reports - fetched by AnnualPlanPresentation.jsx'
  });
  if (verbose) {
    console.log(`   ✅ Written: ${publicProgressPath}`);
  }

  return {
    filesWritten: files.length,
    files
  };
}

module.exports = {
  generateAnnualPlan,
  writeOutputFiles
};
