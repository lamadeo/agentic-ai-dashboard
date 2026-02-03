const { buildOrgMappingFromHierarchy, resolveEmailAlias, getDepartmentInfo } = require('./parse-hierarchy');
const fs = require('fs');
const path = require('path');

// Load org chart
const orgChartPath = path.join(__dirname, '../data/techco_org_chart.json');
const orgEmailMap = buildOrgMappingFromHierarchy(orgChartPath);

// Load Claude Enterprise users
const seatsPath = path.join(__dirname, '../data/claude_enterprise_seats.json');
const seatsData = JSON.parse(fs.readFileSync(seatsPath, 'utf-8'));
const claudeUsers = seatsData.users.filter(u => u.status === 'Active' && u.seatTier !== 'Unassigned');

console.log('\n🔍 Checking each user through getDepartmentInfo...\n');

const withDept = [];
const withoutDept = [];

claudeUsers.forEach(user => {
  const email = user.email.toLowerCase();
  const deptInfo = getDepartmentInfo(email, orgEmailMap);

  if (deptInfo.department && deptInfo.department !== 'Unknown') {
    withDept.push({ ...user, department: deptInfo.department });
  } else {
    withoutDept.push({ ...user, resolved: resolveEmailAlias(email), deptInfo });
  }
});

console.log(`✅ Users WITH department: ${withDept.length}`);
console.log(`❌ Users WITHOUT department: ${withoutDept.length}\n`);

if (withoutDept.length > 0) {
  console.log('Users without department mapping:\n');
  withoutDept.forEach(u => {
    console.log(`  • ${u.name} (${u.email})`);
    console.log(`    Resolved to: ${u.resolved}`);
    console.log(`    Department: ${u.deptInfo.department}`);
    console.log(`    In org map: ${orgEmailMap.has(u.resolved)}`);
    console.log();
  });
}
