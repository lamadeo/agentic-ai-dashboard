// Quick test script for dashboard-data-ingestor
const { ingestDashboardData, getDependencyThresholds } = require('./modules/ingestors/dashboard-data-ingestor');

(async () => {
  const metrics = await ingestDashboardData({ verbose: true });

  console.log('\n\n📋 Dependency Classification Thresholds:\n');
  const thresholds = getDependencyThresholds();
  console.log(`   Productivity Multiplier: >${thresholds.productivityMultiplier}x = HARD`);
  console.log(`   Engagement Multiplier: >${thresholds.engagementMultiplier}x = HARD`);
  console.log(`   Perceived Value Gap: >${thresholds.perceivedValueGap} points = HARD`);
  console.log(`   Adoption Rate: >${thresholds.adoptionRate}% = HARD`);

  console.log('\n\n📊 Current Metrics vs Thresholds:\n');
  console.log(`   Claude Code productivity: ${metrics.productivity.claudeCodeMultiplier.toFixed(1)}x ${metrics.productivity.claudeCodeMultiplier > thresholds.productivityMultiplier ? '✅ HARD' : '❌ SOFT'}`);
  console.log(`   Engagement: ${metrics.productivity.engagementMultiplier.toFixed(1)}x ${metrics.productivity.engagementMultiplier > thresholds.engagementMultiplier ? '✅ HARD' : '❌ SOFT'}`);
  console.log(`   Value gap: ${Math.abs(metrics.perceivedValue.claudeEnterprise - metrics.perceivedValue.m365Copilot)} points ${Math.abs(metrics.perceivedValue.claudeEnterprise - metrics.perceivedValue.m365Copilot) > thresholds.perceivedValueGap ? '✅ HARD' : '❌ SOFT'}`);
  console.log(`   Claude Enterprise adoption: ${metrics.adoption.claudeEnterprise}% ${metrics.adoption.claudeEnterprise > thresholds.adoptionRate ? '✅ HARD' : '❌ SOFT'}`);

  console.log('\n✅ Dashboard data ingestion complete\n');
})();
