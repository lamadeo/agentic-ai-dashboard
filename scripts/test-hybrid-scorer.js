// Test hybrid scorer
const { ingestProjects } = require('./modules/ingestors/project-ingestor');
const { analyzeDependencies } = require('./modules/processors/dependency-analyzer');
const { calculateScores } = require('./modules/processors/hybrid-scorer');

(async () => {
  console.log('🔍 Testing Hybrid Scorer\n');

  // Step 1: Ingest projects
  const projectsResult = await ingestProjects({ verbose: false });
  console.log(`✅ Ingested ${projectsResult.projects.length} projects`);

  // Step 2: Analyze dependencies
  const analysis = await analyzeDependencies({
    projects: projectsResult.projects,
    dashboardMetrics: {},
    verbose: false
  });
  console.log(`✅ Analyzed dependencies`);

  // Step 3: Calculate scores
  const scoring = await calculateScores({
    projects: projectsResult.projects,
    dependencyGraph: analysis.graph,
    quarter: 'Q1',
    verbose: true
  });

  // Display ranked projects
  console.log('\n\n📊 Ranked Projects (Q1 weighting: 70% Multi-Factor + 30% ROI):\n');
  scoring.ranked.forEach((project, idx) => {
    const details = scoring.scores[project.id];
    console.log(`${idx + 1}. ${project.id}: ${project.name}`);
    console.log(`   Final Score: ${project.score.toFixed(1)}`);
    console.log(`   Multi-Factor: ${details.multiFactorScore.toFixed(1)} | ROI: ${details.roiScore.toFixed(1)}`);
    console.log(`   Breakdown: Financial ${details.breakdown.financial.toFixed(0)}, Strategic ${details.breakdown.strategic.toFixed(0)}, Feasibility ${details.breakdown.feasibility.toFixed(0)}, Time-to-Value ${details.breakdown.timeToValue.toFixed(0)}`);
    console.log(`   Tier: ${project.tier}\n`);
  });

  console.log('✅ Hybrid scoring complete\n');
})();
