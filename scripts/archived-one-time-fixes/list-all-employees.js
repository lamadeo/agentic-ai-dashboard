const { buildOrgMapping } = require('./parse-org-chart.js');
const path = require('path');

(async () => {
  const orgChartPath = path.join(__dirname, '../data/org chart - org diagram - rippling.pdf');
  const orgEmailMap = await buildOrgMapping(orgChartPath);

  console.log('\n📋 ALL EMPLOYEES EXTRACTED FROM ORG CHART\n');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Group by department
  const byDept = new Map();
  orgEmailMap.forEach((info, email) => {
    if (!byDept.has(info.department)) {
      byDept.set(info.department, []);
    }
    byDept.get(info.department).push({
      name: info.name,
      title: info.title,
      email: info.primaryEmail,
      isDeptHead: info.isDeptHead
    });
  });

  // Sort departments
  const sortedDepts = Array.from(byDept.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  sortedDepts.forEach(([dept, employees]) => {
    console.log(`\n📁 ${dept} (${employees.length} employees)`);
    console.log('   ───────────────────────────────────────────────────────────────');
    employees.sort((a, b) => a.name.localeCompare(b.name)).forEach(emp => {
      const deptHeadMarker = emp.isDeptHead ? ' 👑 DEPT HEAD' : '';
      console.log(`   • ${emp.name}${deptHeadMarker}`);
      console.log(`     Title: ${emp.title}`);
      console.log(`     Email: ${emp.email}`);
    });
  });

  console.log('\n\n═══════════════════════════════════════════════════════════════');
  console.log(`Total employees: ${orgEmailMap.size}`);
})();
