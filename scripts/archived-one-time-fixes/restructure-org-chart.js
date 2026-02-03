const fs = require('fs');
const path = require('path');

/**
 * Restructure org chart to separate Professional Services from Customer Success
 *
 * Changes:
 * 1. Remove Erin Pierce and Erika McKibben from Kelly Wells' reports
 * 2. Add Erika McKibben as CEO direct report
 * 3. Add Erin Pierce as Erika McKibben direct report
 * 4. Update Erika McKibben's directReports and totalTeamSize
 */

const orgChartPath = path.join(__dirname, '../data/techco_org_chart.json');

// Load org chart
const orgChart = JSON.parse(fs.readFileSync(orgChartPath, 'utf8'));

console.log('📊 Restructuring Org Chart: Professional Services Separation\n');

// Find Kelly Wells in CEO's reports
const ceoReports = orgChart.organization.ceo.reports;
const kellyWells = ceoReports.find(r => r.id === 'kelly-wells');

if (!kellyWells) {
  console.error('❌ Error: Kelly Wells not found in CEO reports');
  process.exit(1);
}

console.log(`✓ Found Kelly Wells with ${kellyWells.reports.length} direct reports`);

// Find and extract Erin Pierce
const erinPierceIndex = kellyWells.reports.findIndex(r => r.id === 'erin-pierce');
if (erinPierceIndex === -1) {
  console.error('❌ Error: Erin Pierce not found in Kelly Wells reports');
  process.exit(1);
}
const erinPierce = kellyWells.reports[erinPierceIndex];
console.log(`✓ Found Erin Pierce (${erinPierce.totalTeamSize + 1} people including herself)`);

// Find and extract Erika McKibben
const erikaMcKibbenIndex = kellyWells.reports.findIndex(r => r.id === 'erika-mckibben');
if (erikaMcKibbenIndex === -1) {
  console.error('❌ Error: Erika McKibben not found in Kelly Wells reports');
  process.exit(1);
}
const erikaMcKibben = kellyWells.reports[erikaMcKibbenIndex];
console.log(`✓ Found Erika McKibben (${erikaMcKibben.totalTeamSize + 1} people including herself)`);

// Remove both from Kelly Wells' reports (remove in reverse order to preserve indices)
const removalOrder = [erinPierceIndex, erikaMcKibbenIndex].sort((a, b) => b - a);
removalOrder.forEach(index => {
  kellyWells.reports.splice(index, 1);
});

console.log(`✓ Removed Professional Services from Kelly Wells' reports`);
console.log(`  Kelly Wells now has ${kellyWells.reports.length} direct reports`);

// Add Erin Pierce to Erika McKibben's reports
erikaMcKibben.reports.push(erinPierce);

// Update Erika McKibben's metadata
const erinPierceTotalSize = erinPierce.totalTeamSize + 1; // +1 for Erin herself
erikaMcKibben.directReports = erikaMcKibben.reports.length;
erikaMcKibben.totalTeamSize = erikaMcKibben.totalTeamSize + erinPierceTotalSize;

console.log(`✓ Added Erin Pierce to Erika McKibben's reports`);
console.log(`  Erika McKibben now has ${erikaMcKibben.directReports} direct reports`);
console.log(`  Erika McKibben's total team size: ${erikaMcKibben.totalTeamSize}`);

// Add Erika McKibben as CEO direct report (after Kelly Wells in the array)
const kellyWellsIndex = ceoReports.findIndex(r => r.id === 'kelly-wells');
ceoReports.splice(kellyWellsIndex + 1, 0, erikaMcKibben);

console.log(`✓ Added Erika McKibben as CEO direct report`);
console.log(`  CEO now has ${ceoReports.length} direct reports`);

// Update CEO's metadata
orgChart.organization.ceo.directReports = ceoReports.length;
// Note: CEO's totalTeamSize remains the same (just reorganized, not adding/removing people)

// Verify structure
console.log('\n📋 Final Structure:');
console.log(`   CEO: ${orgChart.organization.ceo.directReports} direct reports, ${orgChart.organization.ceo.totalTeamSize} total team`);
console.log(`   ├─ Kelly Wells: ${kellyWells.directReports} direct reports, ${kellyWells.totalTeamSize} total team`);
console.log(`   ├─ Erika McKibben: ${erikaMcKibben.directReports} direct reports, ${erikaMcKibben.totalTeamSize} total team`);

// Write updated org chart
fs.writeFileSync(orgChartPath, JSON.stringify(orgChart, null, 2), 'utf8');

console.log('\n✅ Org chart restructured successfully!');
console.log(`   Saved to: ${orgChartPath}`);

// Output summary stats
console.log('\n📊 Summary:');
console.log(`   Professional Services total: ${erikaMcKibben.totalTeamSize + 1} people (including Erika)`);
console.log(`   Customer Success + Support: ${kellyWells.totalTeamSize + 1} people (including Kelly)`);
console.log(`   Org structure is now ready for department mapping updates`);
