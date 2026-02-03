// Test presentation generator
const { ingestProjects } = require('./modules/ingestors/project-ingestor');
const { ingestDashboardData } = require('./modules/ingestors/dashboard-data-ingestor');
const { analyzeDependencies } = require('./modules/processors/dependency-analyzer');
const { calculateScores } = require('./modules/processors/hybrid-scorer');
const { scheduleProjects } = require('./modules/processors/constraint-scheduler');
const { generatePortfolio } = require('./modules/generators/portfolio-generator');
const { generatePresentation } = require('./modules/generators/presentation-generator');

(async () => {
  console.log('🔍 Testing Presentation Generator\n');

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
    verbose: false
  });
  console.log(`✅ Generated portfolio table`);

  // Step 7: Generate presentation
  const presentation = await generatePresentation({
    rankedProjects: scoring.ranked,
    scores: scoring.scores,
    schedule: scheduling.schedule,
    dependencyGraph: analysis.graph,
    capacityModel: scheduling.capacityModel,
    deferredProjects: scheduling.deferredProjects,
    projects: projectsResult.projects,
    portfolioProjects: portfolio.projects,
    verbose: true
  });

  // Display presentation structure
  console.log('\n\n📊 Annual Plan Presentation Structure:\n');
  console.log('═'.repeat(80));

  // Slide 1
  console.log(`\nSlide 1: ${presentation.slides.slide1.title}`);
  console.log(`   Subtitle: ${presentation.slides.slide1.subtitle}`);
  console.log(`   Presenter: ${presentation.slides.slide1.presenter}`);
  console.log(`   Date: ${presentation.slides.slide1.date}`);

  // Slide 2
  console.log(`\nSlide 2: ${presentation.slides.slide2.title}`);
  console.log(`   BLUF: ${presentation.slides.slide2.bluf.headline}`);
  console.log(`         ${presentation.slides.slide2.bluf.impact}`);
  console.log(`         ${presentation.slides.slide2.bluf.approach}`);
  console.log(`   Key Points:`);
  presentation.slides.slide2.keyPoints.forEach(point => {
    console.log(`      • ${point}`);
  });

  // Slide 3
  console.log(`\nSlide 3: ${presentation.slides.slide3.title}`);
  console.log(`   Strategic Pillars:`);
  presentation.slides.slide3.strategicFramework.pillars.forEach(p => {
    console.log(`      • ${p.name}: ${p.projectCount} projects`);
  });
  console.log(`   Growth Drivers:`);
  presentation.slides.slide3.strategicFramework.drivers.forEach(d => {
    console.log(`      • ${d.name}: ${d.projectCount} projects`);
  });

  // Slide 4
  console.log(`\nSlide 4: ${presentation.slides.slide4.title}`);
  console.log(`   Total Projects: ${presentation.slides.slide4.summary.total}`);
  console.log(`   By Tier: TIER 0: ${presentation.slides.slide4.summary.byTier.foundation}, TIER 1: ${presentation.slides.slide4.summary.byTier.revenue}, TIER 2: ${presentation.slides.slide4.summary.byTier.retention}`);
  console.log(`   By Status: Committed: ${presentation.slides.slide4.summary.byStatus.committed}, Proposed: ${presentation.slides.slide4.summary.byStatus.proposed}`);
  console.log(`   Top 5 Projects:`);
  presentation.slides.slide4.topProjects.forEach(p => {
    console.log(`      ${p.rank}. ${p.id} (Score: ${p.score}, ${p.qStart})`);
  });

  // Slide 5
  console.log(`\nSlide 5: ${presentation.slides.slide5.title}`);
  console.log(`   Status: ${presentation.slides.slide5.status}`);
  console.log(`   Capacity: ${presentation.slides.slide5.capacity.allocated}/${presentation.slides.slide5.capacity.total} days (${presentation.slides.slide5.capacity.utilization})`);
  console.log(`   Projects: ${presentation.slides.slide5.projects.length}`);
  presentation.slides.slide5.projects.forEach(p => {
    console.log(`      • ${p.id}: ${p.name}`);
  });

  // Slide 6
  console.log(`\nSlide 6: ${presentation.slides.slide6.title}`);
  console.log(`   Status: ${presentation.slides.slide6.status}`);
  presentation.slides.slide6.roadmap.forEach(q => {
    console.log(`   ${q.quarter}: ${q.projectCount} projects (${q.capacity.utilization} utilization, ${q.capacity.buffer}-day buffer)`);
  });

  // Slide 7
  console.log(`\nSlide 7: ${presentation.slides.slide7.title}`);
  console.log(`   Capacity by Quarter:`);
  presentation.slides.slide7.capacityChart.forEach(q => {
    console.log(`      ${q.quarter}: ${q.total} days (${q.core} core + ${q.champion} champion), ${q.allocated} allocated, ${q.buffer} buffer`);
  });

  // Slide 8
  console.log(`\nSlide 8: ${presentation.slides.slide8.title}`);
  console.log(`   Hard Dependencies: ${presentation.slides.slide8.dependencies.hardCount}`);
  console.log(`   Deferred Projects: ${presentation.slides.slide8.deferredProjects.count}`);
  console.log(`   Key Risks:`);
  presentation.slides.slide8.risks.slice(0, 3).forEach(r => {
    console.log(`      • ${r.risk}`);
  });

  // Slide 9
  console.log(`\nSlide 9: ${presentation.slides.slide9.title}`);
  console.log(`   Immediate Actions:`);
  presentation.slides.slide9.immediate.forEach(a => {
    console.log(`      • ${a.action} (${a.owner}, ${a.timeline})`);
  });
  console.log(`   Financial Impact: ${presentation.slides.slide9.financialImpact.total} (Avg ROI: ${presentation.slides.slide9.financialImpact.avgROI})`);

  console.log('\n═'.repeat(80));
  console.log(`\n📈 Presentation Metadata:`);
  console.log(`   Total Slides: ${presentation.metadata.totalSlides}`);
  console.log(`   Version: ${presentation.metadata.version}`);
  console.log(`   Generated: ${presentation.metadata.generatedAt}`);

  console.log('\n✅ Presentation generation complete\n');
})();
