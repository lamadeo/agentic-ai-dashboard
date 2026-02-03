// Test constraint scheduler
const { ingestProjects } = require('./modules/ingestors/project-ingestor');
const { ingestDashboardData } = require('./modules/ingestors/dashboard-data-ingestor');
const { analyzeDependencies } = require('./modules/processors/dependency-analyzer');
const { calculateScores } = require('./modules/processors/hybrid-scorer');
const { scheduleProjects } = require('./modules/processors/constraint-scheduler');

(async () => {
  console.log('🔍 Testing Constraint-Based Scheduler\n');

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
    verbose: true
  });

  // Display quarterly schedule
  console.log('\n\n📅 2026 Quarterly Roadmap:\n');

  ['Q1', 'Q2', 'Q3', 'Q4'].forEach(quarter => {
    const q = scheduling.schedule[quarter];
    const status = quarter === 'Q1' ? 'committed' : 'potential';

    console.log(`${quarter} (${status.toUpperCase()}):`);
    console.log(`   Capacity: ${q.capacity} eng-days (${q.allocated} allocated, ${q.buffer} buffer)`);
    console.log(`   Projects: ${q.projects.length}`);

    q.projects.forEach(projectId => {
      const project = scoring.ranked.find(p => p.id === projectId);
      if (project) {
        console.log(`      • ${projectId}: ${project.name} (Score: ${project.score.toFixed(1)})`);
      }
    });

    console.log('');
  });

  // Display deferred projects
  if (scheduling.deferredProjects.length > 0) {
    console.log('⏸️  Deferred Projects (2027+):\n');
    scheduling.deferredProjects.forEach(project => {
      console.log(`   • ${project.id}: ${project.name}`);
      console.log(`     Reason: ${project.reason}`);
      console.log('');
    });
  }

  console.log('✅ Scheduling complete\n');
})();
