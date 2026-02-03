// Quick test script for project-ingestor
const { ingestProjects } = require('./modules/ingestors/project-ingestor');

(async () => {
  const result = await ingestProjects({ verbose: true });

  console.log('\n\n📋 Parsed Projects:\n');
  result.projects.forEach(project => {
    console.log(`\n${project.id}: ${project.name}`);
    console.log(`   Files: ${project.files.join(', ')}`);
    console.log(`   Value: $${project.value ? (project.value / 1000000).toFixed(2) : 'TBD'}M`);
    console.log(`   ROI: ${project.roi || 'TBD'}%`);
    console.log(`   Effort: ${project.effort || 'TBD'} days`);
    console.log(`   Quarters: ${project.quarters.join(', ')}`);
    console.log(`   Dependencies: ${project.dependencies.length}`);
    console.log(`   KPIs: ${project.kpis.length}`);
    console.log(`   Tier: ${project.strategic.tier}`);
  });

  console.log(`\n\n✅ Total projects parsed: ${result.projects.length}`);
})();
