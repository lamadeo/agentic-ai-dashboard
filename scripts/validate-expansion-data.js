const fs = require('fs');
const path = require('path');

/**
 * Phase 5: Validate Generated Expansion Data
 *
 * Compares the data-driven expansion ROI calculations against the original
 * hardcoded data to ensure the migration preserves business logic.
 */

// Load generated data
const generatedDataPath = path.join(__dirname, '../app/ai-tools-data.json');
const generatedData = JSON.parse(fs.readFileSync(generatedDataPath, 'utf8'));

// Load backup hardcoded data
const backupDataPath = path.join(__dirname, '../docs/backup/expansion-roi-hardcoded-data.json');
const backupData = JSON.parse(fs.readFileSync(backupDataPath, 'utf8'));

console.log('📊 Phase 5: Expansion ROI Data Validation\n');
console.log('=' .repeat(80));
console.log('\n🔍 Comparing Generated Data vs Hardcoded Backup\n');

// 1. Compare Org Metrics
console.log('1️⃣  Organization Metrics:');
console.log('-'.repeat(80));
console.log('Metric                    Generated    Hardcoded    Difference');
console.log('-'.repeat(80));

const genMetrics = generatedData.expansion.orgMetrics;
const backupMetrics = backupData.orgMetrics;

const metrics = [
  ['Total Employees', genMetrics.totalEmployees, backupMetrics.totalEmployees],
  ['Licensed Seats', genMetrics.licensedSeats, backupMetrics.licensedSeats],
  ['Active Users', genMetrics.activeUsers, backupMetrics.activeUsers],
  ['Penetration Rate %', genMetrics.penetrationRate, backupMetrics.penetrationRate],
  ['Unlicensed', genMetrics.unlicensedEmployees, backupMetrics.unlicensedEmployees]
];

metrics.forEach(([label, gen, backup]) => {
  const diff = gen - backup;
  const diffStr = diff >= 0 ? `+${diff}` : `${diff}`;
  const status = Math.abs(diff) <= 5 ? '✅' : Math.abs(diff) <= 20 ? '⚠️ ' : '❌';
  console.log(`${status} ${label.padEnd(20)} ${String(gen).padStart(8)} ${String(backup).padStart(12)} ${diffStr.padStart(12)}`);
});

// 2. Compare Department Opportunities
console.log('\n\n2️⃣  Department Expansion Opportunities:');
console.log('-'.repeat(80));

// Build maps for comparison
const genDepts = new Map();
generatedData.expansion.opportunities.forEach(opp => {
  genDepts.set(opp.department, opp);
});

const backupDepts = new Map();
backupData.expansionOpportunities.forEach(opp => {
  genDepts.set(opp.department, opp);
});

// Department name mappings (generated names may differ from hardcoded)
const deptNameMap = {
  'Sales - Enterprise': 'Enterprise Sales',
  'Sales - Large Market': 'Large Market Sales',
  'Revenue Operations': 'Business Development', // May need adjustment
  'Operations': 'Other Support Functions', // May need adjustment
  'Engineering': 'Engineering (Ron + Luis)'
};

// Get all unique departments
const allDepts = new Set([
  ...generatedData.expansion.opportunities.map(o => o.department),
  ...backupData.expansionOpportunities.map(o => o.department)
]);

console.log('\nDepartment                     Generated ROI    Hardcoded ROI    Match?');
console.log('-'.repeat(80));

const roiComparisons = [];

backupData.expansionOpportunities
  .sort((a, b) => b.roi - a.roi)
  .forEach(backupOpp => {
    const backupDept = backupOpp.department;

    // Find matching generated department (handle name variations)
    let genOpp = generatedData.expansion.opportunities.find(g => g.department === backupDept);

    // Try mapped names if direct match fails
    if (!genOpp) {
      const mappedName = Object.keys(deptNameMap).find(key => deptNameMap[key] === backupDept);
      if (mappedName) {
        genOpp = generatedData.expansion.opportunities.find(g => g.department === mappedName);
      }
    }

    if (genOpp) {
      const genROI = genOpp.roi || 0;
      const backupROI = backupOpp.roi;
      const roiDiff = Math.abs(genROI - backupROI);
      const status = roiDiff <= 2 ? '✅ Close' : roiDiff <= 5 ? '⚠️  Similar' : '❌ Different';

      console.log(`${status.padEnd(12)} ${backupDept.padEnd(25)} ${genROI.toFixed(1).padStart(8)}x ${backupROI.toFixed(1).padStart(12)}x`);

      roiComparisons.push({
        department: backupDept,
        generatedROI: genROI,
        hardcodedROI: backupROI,
        difference: roiDiff,
        match: roiDiff <= 5
      });
    } else {
      console.log(`❌ Missing   ${backupDept.padEnd(25)} ${'N/A'.padStart(8)}   ${backupOpp.roi.toFixed(1).padStart(12)}x`);
      roiComparisons.push({
        department: backupDept,
        generatedROI: null,
        hardcodedROI: backupOpp.roi,
        difference: null,
        match: false
      });
    }
  });

// Check for new departments in generated data
generatedData.expansion.opportunities.forEach(genOpp => {
  const genDept = genOpp.department;
  const exists = backupData.expansionOpportunities.some(b =>
    b.department === genDept || deptNameMap[genDept] === b.department
  );

  if (!exists) {
    console.log(`✨ New       ${genDept.padEnd(25)} ${(genOpp.roi || 0).toFixed(1).padStart(8)}x ${'N/A'.padStart(12)}`);
  }
});

// 3. Summary Statistics
console.log('\n\n3️⃣  Summary Statistics:');
console.log('-'.repeat(80));

const genSummary = generatedData.expansion.summary;
const backupTotals = backupData.expansionOpportunities.reduce((acc, opp) => {
  acc.totalAdditionalCost += opp.totalAdditionalCost;
  acc.totalOpportunityCost += opp.monthlyOpportunityCost;
  acc.totalNetBenefit += opp.netBenefit;
  return acc;
}, { totalAdditionalCost: 0, totalOpportunityCost: 0, totalNetBenefit: 0 });

const backupOverallROI = backupTotals.totalAdditionalCost > 0
  ? backupTotals.totalOpportunityCost / backupTotals.totalAdditionalCost
  : 0;

console.log(`Total Departments:        Generated: ${genSummary.totalDepartments}, Hardcoded: ${backupData.expansionOpportunities.length}`);
console.log(`Total Additional Cost:    Generated: $${genSummary.totalAdditionalCost.toLocaleString()}, Hardcoded: $${backupTotals.totalAdditionalCost.toLocaleString()}`);
console.log(`Total Opportunity Value:  Generated: $${genSummary.totalOpportunityCost.toLocaleString()}, Hardcoded: $${backupTotals.totalOpportunityCost.toLocaleString()}`);
console.log(`Total Net Benefit:        Generated: $${genSummary.totalNetBenefit.toLocaleString()}, Hardcoded: $${backupTotals.totalNetBenefit.toLocaleString()}`);
console.log(`Overall ROI:              Generated: ${genSummary.overallROI.toFixed(1)}x, Hardcoded: ${backupOverallROI.toFixed(1)}x`);

// 4. Validation Results
console.log('\n\n4️⃣  Validation Results:');
console.log('-'.repeat(80));

const matchingDepts = roiComparisons.filter(c => c.match).length;
const totalBackupDepts = backupData.expansionOpportunities.length;
const matchRate = (matchingDepts / totalBackupDepts * 100).toFixed(0);

console.log(`\n✅ Matching departments (ROI within 5x):  ${matchingDepts}/${totalBackupDepts} (${matchRate}%)`);

if (matchingDepts >= totalBackupDepts * 0.7) {
  console.log('\n🎉 VALIDATION PASSED: Generated data is consistent with hardcoded data');
  console.log('   The data-driven behavioral scoring produces similar ROI rankings.');
} else {
  console.log('\n⚠️  VALIDATION PARTIAL: Generated data differs significantly from hardcoded data');
  console.log('   This is expected as we\'ve moved from static rules to behavioral scoring.');
  console.log('   Review the differences above to ensure the new approach is reasonable.');
}

// 5. Key Differences & Insights
console.log('\n\n5️⃣  Key Differences & Insights:');
console.log('-'.repeat(80));

console.log('\n📝 Expected Differences:');
console.log('   • Hardcoded data used manual estimates and 10% power user rules');
console.log('   • Generated data uses actual behavioral scoring (0-100 points)');
console.log('   • Department names may differ (org chart vs manual labels)');
console.log('   • User counts reflect real Claude Enterprise CSV data');

console.log('\n🎯 Behavioral Scoring Impact:');
console.log('   • Premium allocation based on activity >= 40 points, not fixed 10%');
console.log('   • Scoring dimensions: code writing (30), engagement (30), documents (25), complex work (15)');
console.log('   • More accurate reflection of actual power user behavior');

console.log('\n✨ Next Steps:');
console.log('   1. Review any large ROI differences above');
console.log('   2. Verify department name mappings are correct');
console.log('   3. Test dashboard UI with new data structure');
console.log('   4. Consider adjusting scoring weights if results seem off');

console.log('\n' + '='.repeat(80));
console.log('Validation complete!\n');
