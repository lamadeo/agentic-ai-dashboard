#!/usr/bin/env node

/**
 * Fix Org Chart Reporting Structure
 *
 * Corrects the reporting relationships:
 * - Jeff Rivero should report to Luis Amadeo (not Robert Foster)
 * - Kirmanie Ravariere should report to Robert Foster (not Jeff Rivero)
 */

const fs = require('fs');
const path = require('path');

const ORG_CHART_PATH = path.join(__dirname, '..', 'docs', 'data', 'techco_org_chart.json');

console.log('\n🔧 Fixing Org Chart Reporting Structure...\n');

// Load org chart
const orgChart = JSON.parse(fs.readFileSync(ORG_CHART_PATH, 'utf8'));

function findEmployeeInTree(node, name) {
  if (node.name.toLowerCase().includes(name.toLowerCase())) {
    return node;
  }
  if (node.reports) {
    for (const r of node.reports) {
      const found = findEmployeeInTree(r, name);
      if (found) return found;
    }
  }
  return null;
}

function removeFromParent(parent, childName) {
  if (!parent.reports) return null;
  const index = parent.reports.findIndex(r => r.name.toLowerCase().includes(childName.toLowerCase()));
  if (index >= 0) {
    const removed = parent.reports.splice(index, 1)[0];
    parent.directReports = parent.reports.length;
    return removed;
  }
  return null;
}

function addToParent(parent, child) {
  if (!parent.reports) parent.reports = [];
  parent.reports.push(child);
  parent.directReports = parent.reports.length;
}

// Find employees
const luis = findEmployeeInTree(orgChart.organization.ceo, 'Luis Amadeo');
const robert = findEmployeeInTree(orgChart.organization.ceo, 'Robert Foster');
const jeff = findEmployeeInTree(orgChart.organization.ceo, 'Jeff Rivero');

if (!luis || !robert || !jeff) {
  console.error('❌ Could not find all employees');
  process.exit(1);
}

console.log('Current structure:');
console.log('  Luis Amadeo → Robert Foster → Jeff Rivero → Kirmanie Ravariere\n');

// Step 1: Remove Kirmanie from Jeff's reports and add to Robert's reports
console.log('Step 1: Moving Kirmanie from Jeff to Robert...');
const kirmanie = removeFromParent(jeff, 'Kirmanie');
if (kirmanie) {
  addToParent(robert, kirmanie);
  console.log('  ✅ Kirmanie now reports to Robert\n');
} else {
  console.log('  ⚠️  Could not find Kirmanie under Jeff\n');
}

// Step 2: Remove Jeff from Robert's reports and add to Luis's reports
console.log('Step 2: Moving Jeff from Robert to Luis...');
const jeffRemoved = removeFromParent(robert, 'Jeff Rivero');
if (jeffRemoved) {
  addToParent(luis, jeffRemoved);
  console.log('  ✅ Jeff now reports to Luis\n');
} else {
  console.log('  ⚠️  Could not find Jeff under Robert\n');
}

// Display new structure
console.log('New structure:');
console.log('  Luis Amadeo has', luis.directReports, 'direct reports:', luis.reports.map(r => r.name).join(', '));
console.log('  Robert Foster has', robert.directReports, 'direct reports:', robert.reports.map(r => r.name).join(', '));
console.log('  Jeff Rivero has', jeff.directReports, 'direct reports:', jeff.reports.map(r => r.name).join(', '));

// Write back to file
fs.writeFileSync(ORG_CHART_PATH, JSON.stringify(orgChart, null, 2));
console.log('\n✅ Org chart structure fixed and saved to:', ORG_CHART_PATH);
console.log('\n📝 Next step: Run org chart enrichment to update FTE data\n');
