const { getDepartmentHeadcounts } = require('./parse-hierarchy');
const path = require('path');

// Test getDepartmentHeadcounts
const hierarchyPath = path.join(__dirname, '../data/techco_org_chart.json');
const deptCounts = getDepartmentHeadcounts(hierarchyPath);

console.log('📊 Department Headcounts:\n');
const sorted = Array.from(deptCounts.entries()).sort((a, b) => b[1] - a[1]);

let total = 0;
sorted.forEach(([dept, count]) => {
  console.log(`   ${dept.padEnd(30)} ${count}`);
  total += count;
});

console.log(`\n   ${'TOTAL'.padEnd(30)} ${total}`);
console.log(`\nTotal departments: ${deptCounts.size}`);
