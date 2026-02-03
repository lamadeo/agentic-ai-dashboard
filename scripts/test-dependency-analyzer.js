// Test dependency analyzer
const { ingestProjects } = require('./modules/ingestors/project-ingestor');
const { ingestDashboardData } = require('./modules/ingestors/dashboard-data-ingestor');
const { analyzeDependencies, getStartableProjects } = require('./modules/processors/dependency-analyzer');

(async () => {
  console.log('🔍 Testing Dependency Analyzer\n');

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
    verbose: true
  });

  // Display dependency graph
  console.log('\n\n📊 Dependency Graph:\n');
  Object.entries(analysis.graph).forEach(([projectId, project]) => {
    console.log(`${projectId}: ${project.name}`);

    if (project.dependsOn.length > 0) {
      console.log(`   Depends on:`);
      project.dependsOn.forEach(dep => {
        const emoji = dep.type === 'HARD' ? '🔴' : '🟡';
        console.log(`      ${emoji} ${dep.project} (${dep.type}) - ${dep.source}`);
      });
    }

    if (project.blockedBy.length > 0) {
      console.log(`   ⛔ Blocked by: ${project.blockedBy.join(', ')}`);
    }

    if (project.enablers.length > 0) {
      console.log(`   ✅ Enables: ${project.enablers.join(', ')}`);
    }

    console.log('');
  });

  // Show rationales
  if (Object.keys(analysis.rationales).length > 0) {
    console.log('\n📝 Dependency Rationales:\n');
    Object.entries(analysis.rationales).forEach(([key, rat]) => {
      console.log(`   ${rat.from} → ${rat.to} (${rat.type})`);
      console.log(`      ${rat.rationale}`);
      console.log('');
    });
  }

  // Show startable projects
  console.log('\n🚀 Projects that can start now (no HARD blockers):\n');
  const startable = getStartableProjects(analysis.graph, []);
  startable.forEach(id => {
    console.log(`   ✅ ${id}: ${analysis.graph[id].name}`);
  });

  console.log('\n\n✅ Dependency analysis complete\n');
})();
