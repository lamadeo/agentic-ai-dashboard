// Test portfolio generator
const { ingestProjects } = require('./modules/ingestors/project-ingestor');
const { ingestDashboardData } = require('./modules/ingestors/dashboard-data-ingestor');
const { analyzeDependencies } = require('./modules/processors/dependency-analyzer');
const { calculateScores } = require('./modules/processors/hybrid-scorer');
const { scheduleProjects } = require('./modules/processors/constraint-scheduler');
const { generatePortfolio } = require('./modules/generators/portfolio-generator');

(async () => {
  console.log('🔍 Testing Portfolio Generator\n');

  // Step 1: Ingest projects
  const projectsResult = await ingestProjects({ verbose: false });
  console.log(`✅ Ingested ${projectsResult.projects.length} projects`);

  // Step 2: Ingest dashboard data
  const dashboardMetrics = await ingestDashboardData({ verbose: false });
  console.log(`✅ Ingested dashboard metrics`);

  // Step 3: Analyze dependencies
  const analysis = await analyzeDependencies({
    projects: projectsResult.projects,
    dashboardMetrics,
    verbose: false
  });
  console.log(`✅ Analyzed dependencies`);

  // Step 4: Calculate scores
  const scoring = await calculateScores({
    projects: projectsResult.projects,
    dependencyGraph: analysis.graph,
    quarter: 'Q1',
    verbose: false
  });
  console.log(`✅ Calculated scores`);

  // Step 5: Schedule projects
  const scheduling = await scheduleProjects({
    rankedProjects: scoring.ranked,
    scores: scoring.scores,
    dependencyGraph: analysis.graph,
    verbose: false
  });
  console.log(`✅ Scheduled projects`);

  // Step 6: Generate portfolio
  const portfolio = await generatePortfolio({
    rankedProjects: scoring.ranked,
    scores: scoring.scores,
    schedule: scheduling.schedule,
    dependencyGraph: analysis.graph,
    rationales: analysis.rationales,
    projects: projectsResult.projects,
    verbose: true
  });

  // Display portfolio table
  console.log('\n\n📊 Project Portfolio Table:\n');
  console.log('═'.repeat(120));
  console.log(`${'Rank'.padEnd(6)}${'Project'.padEnd(35)}${'Score'.padEnd(8)}${'Tier'.padEnd(10)}${'Status'.padEnd(12)}${'Value'.padEnd(10)}${'ROI'.padEnd(8)}${'Q Start'.padEnd(10)}`);
  console.log('═'.repeat(120));

  portfolio.projects.forEach(p => {
    console.log(
      `${String(p.rank).padEnd(6)}` +
      `${p.project.substring(0, 33).padEnd(35)}` +
      `${p.score.padEnd(8)}` +
      `${p.tier.padEnd(10)}` +
      `${p.status.padEnd(12)}` +
      `${p.value.padEnd(10)}` +
      `${p.roi.padEnd(8)}` +
      `${p.qStart.padEnd(10)}`
    );
    console.log(`      Dependencies: ${p.dependencies}`);
    console.log(`      KPIs: ${p.targetKPIs}`);
    console.log(`      Reasoning: ${p.priorityReasoning}`);
    console.log('');
  });

  console.log('═'.repeat(120));
  console.log('\n📈 Portfolio Metadata:');
  console.log(`   Total Projects: ${portfolio.metadata.totalProjects}`);
  console.log(`   TIER 0 (Foundation): ${portfolio.metadata.tiers.foundation}`);
  console.log(`   TIER 1 (Revenue): ${portfolio.metadata.tiers.revenue}`);
  console.log(`   TIER 2 (Retention): ${portfolio.metadata.tiers.retention}`);
  console.log(`   Committed: ${portfolio.metadata.status.committed}`);
  console.log(`   In Progress: ${portfolio.metadata.status.inProgress}`);
  console.log(`   Proposed: ${portfolio.metadata.status.proposed}`);

  console.log('\n✅ Portfolio generation complete\n');
})();
