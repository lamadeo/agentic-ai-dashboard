#!/usr/bin/env node

/**
 * Org Chart Comparison Utility
 *
 * Compares two org chart snapshots and generates a detailed report of changes:
 * - Added/removed employees
 * - Role/title changes
 * - Reporting structure changes
 * - Department transfers
 * - Growth metrics
 *
 * Usage:
 *   node scripts/compare-org-charts.js <old-snapshot> <new-snapshot>
 *   node scripts/compare-org-charts.js 2025-12-12 2026-01-21
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: node scripts/compare-org-charts.js <old-date> <new-date>');
  console.error('Example: node scripts/compare-org-charts.js 2025-12-12 2026-01-21');
  process.exit(1);
}

const oldDate = args[0];
const newDate = args[1];

const snapshotDir = path.join(__dirname, '..', 'docs', 'data', 'org-chart-snapshots');
const oldPath = path.join(snapshotDir, `techco_org_chart_${oldDate}.json`);
const newPath = path.join(snapshotDir, `techco_org_chart_${newDate}.json`);

// Load snapshots
let oldChart, newChart;

try {
  oldChart = JSON.parse(fs.readFileSync(oldPath, 'utf8'));
  console.log(`✅ Loaded old snapshot: ${oldDate} (${oldChart.organization.totalEmployees} employees)`);
} catch (error) {
  console.error(`❌ Error loading old snapshot: ${oldPath}`);
  console.error(error.message);
  process.exit(1);
}

try {
  newChart = JSON.parse(fs.readFileSync(newPath, 'utf8'));
  console.log(`✅ Loaded new snapshot: ${newDate} (${newChart.organization.totalEmployees} employees)`);
} catch (error) {
  console.error(`❌ Error loading new snapshot: ${newPath}`);
  console.error(error.message);
  process.exit(1);
}

// Flatten org chart to employee map
function flattenOrgChart(node, parentId = null, results = {}) {
  if (!node) return results;

  results[node.id] = {
    id: node.id,
    name: node.name,
    title: node.title,
    parentId: parentId,
    directReports: node.directReports || 0,
    totalTeamSize: node.totalTeamSize || 0,
    employmentType: node.employmentType,
    initials: node.initials
  };

  if (node.reports && node.reports.length > 0) {
    node.reports.forEach(report => flattenOrgChart(report, node.id, results));
  }

  return results;
}

// Create employee maps
const oldEmployees = flattenOrgChart(oldChart.organization.ceo);
const newEmployees = flattenOrgChart(newChart.organization.ceo);

// Add CEO to maps with null parent
oldEmployees[oldChart.organization.ceo.id] = {
  ...oldEmployees[oldChart.organization.ceo.id],
  parentId: null
};
newEmployees[newChart.organization.ceo.id] = {
  ...newEmployees[newChart.organization.ceo.id],
  parentId: null
};

// Find changes
const oldIds = new Set(Object.keys(oldEmployees));
const newIds = new Set(Object.keys(newEmployees));

const added = [];
const removed = [];
const titleChanges = [];
const reportingChanges = [];
const unchanged = [];

// Find added employees
newIds.forEach(id => {
  if (!oldIds.has(id)) {
    added.push(newEmployees[id]);
  }
});

// Find removed employees
oldIds.forEach(id => {
  if (!newIds.has(id)) {
    removed.push(oldEmployees[id]);
  }
});

// Find changes in existing employees
oldIds.forEach(id => {
  if (newIds.has(id)) {
    const oldEmp = oldEmployees[id];
    const newEmp = newEmployees[id];

    let changes = [];

    // Check title change
    if (oldEmp.title !== newEmp.title) {
      titleChanges.push({
        id,
        name: newEmp.name,
        oldTitle: oldEmp.title,
        newTitle: newEmp.title
      });
      changes.push('title');
    }

    // Check reporting change
    if (oldEmp.parentId !== newEmp.parentId) {
      const oldManager = oldEmp.parentId ? oldEmployees[oldEmp.parentId]?.name : 'CEO (no manager)';
      const newManager = newEmp.parentId ? newEmployees[newEmp.parentId]?.name : 'CEO (no manager)';

      reportingChanges.push({
        id,
        name: newEmp.name,
        oldManager,
        newManager
      });
      changes.push('reporting');
    }

    if (changes.length === 0) {
      unchanged.push(newEmp);
    }
  }
});

// Calculate metrics
const oldTotal = oldChart.organization.totalEmployees;
const newTotal = newChart.organization.totalEmployees;
const netChange = newTotal - oldTotal;
const growthRate = ((netChange / oldTotal) * 100).toFixed(2);

// Count contingent workers
const oldContingent = Object.values(oldEmployees).filter(e => e.employmentType === 'contingent').length;
const newContingent = Object.values(newEmployees).filter(e => e.employmentType === 'contingent').length;

// Generate report
console.log('\n' + '='.repeat(80));
console.log('ORG CHART COMPARISON REPORT');
console.log('='.repeat(80));

console.log(`\n📅 Period: ${oldDate} → ${newDate}`);
console.log(`📊 Total Employees: ${oldTotal} → ${newTotal} (${netChange >= 0 ? '+' : ''}${netChange}, ${growthRate}%)`);
console.log(`👥 Contingent Workers: ${oldContingent} → ${newContingent} (${newContingent >= oldContingent ? '+' : ''}${newContingent - oldContingent})`);

console.log(`\n✨ Summary:`);
console.log(`   Added: ${added.length}`);
console.log(`   Removed: ${removed.length}`);
console.log(`   Title Changes: ${titleChanges.length}`);
console.log(`   Reporting Changes: ${reportingChanges.length}`);
console.log(`   Unchanged: ${unchanged.length}`);

if (added.length > 0) {
  console.log(`\n✅ ADDED EMPLOYEES (${added.length}):`);
  added.sort((a, b) => a.name.localeCompare(b.name)).forEach(emp => {
    const manager = emp.parentId ? newEmployees[emp.parentId]?.name : 'Reports to CEO';
    const typeLabel = emp.employmentType ? ` [${emp.employmentType}]` : '';
    console.log(`   + ${emp.name} - ${emp.title}${typeLabel}`);
    console.log(`     Reports to: ${manager}`);
  });
}

if (removed.length > 0) {
  console.log(`\n❌ REMOVED EMPLOYEES (${removed.length}):`);
  removed.sort((a, b) => a.name.localeCompare(b.name)).forEach(emp => {
    const manager = emp.parentId ? oldEmployees[emp.parentId]?.name : 'Reported to CEO';
    const typeLabel = emp.employmentType ? ` [${emp.employmentType}]` : '';
    console.log(`   - ${emp.name} - ${emp.title}${typeLabel}`);
    console.log(`     Reported to: ${manager}`);
  });
}

if (titleChanges.length > 0) {
  console.log(`\n🔄 TITLE CHANGES (${titleChanges.length}):`);
  titleChanges.sort((a, b) => a.name.localeCompare(b.name)).forEach(change => {
    console.log(`   📝 ${change.name}`);
    console.log(`      Old: ${change.oldTitle}`);
    console.log(`      New: ${change.newTitle}`);
  });
}

if (reportingChanges.length > 0) {
  console.log(`\n🔀 REPORTING CHANGES (${reportingChanges.length}):`);
  reportingChanges.sort((a, b) => a.name.localeCompare(b.name)).forEach(change => {
    console.log(`   👤 ${change.name}`);
    console.log(`      Old Manager: ${change.oldManager}`);
    console.log(`      New Manager: ${change.newManager}`);
  });
}

console.log('\n' + '='.repeat(80));
console.log('END OF REPORT');
console.log('='.repeat(80) + '\n');

// Export JSON report
const report = {
  comparison: {
    oldDate,
    newDate,
    oldTotal,
    newTotal,
    netChange,
    growthRate: parseFloat(growthRate)
  },
  summary: {
    added: added.length,
    removed: removed.length,
    titleChanges: titleChanges.length,
    reportingChanges: reportingChanges.length,
    unchanged: unchanged.length
  },
  details: {
    added,
    removed,
    titleChanges,
    reportingChanges
  },
  metrics: {
    oldContingent,
    newContingent,
    contingentChange: newContingent - oldContingent
  }
};

const reportPath = path.join(snapshotDir, `comparison_${oldDate}_to_${newDate}.json`);
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`✅ Detailed JSON report saved to: ${reportPath}\n`);
