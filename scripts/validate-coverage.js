const { buildOrgMappingFromHierarchy, resolveEmailAlias } = require('./parse-hierarchy');
const fs = require('fs');
const path = require('path');

// Load org chart
const orgChartPath = path.join(__dirname, '../data/techco_org_chart.json');
const orgEmailMap = buildOrgMappingFromHierarchy(orgChartPath);

// Load Claude Enterprise users
const seatsPath = path.join(__dirname, '../data/claude_enterprise_seats.json');
const seatsData = JSON.parse(fs.readFileSync(seatsPath, 'utf-8'));
const claudeUsers = seatsData.users.filter(u => u.status === 'Active' && u.seatTier !== 'Unassigned');

// Validate
const matched = [];
const unmatched = [];

claudeUsers.forEach(user => {
  const email = user.email.toLowerCase();
  const resolved = resolveEmailAlias(email);

  if (orgEmailMap.has(resolved)) {
    matched.push(user);
  } else {
    unmatched.push({ ...user, resolved });
  }
});

console.log('\n📊 Coverage Validation Results:\n');
console.log(`   Total users:    ${claudeUsers.length}`);
console.log(`   ✅ Matched:     ${matched.length}`);
console.log(`   ❌ Unmatched:   ${unmatched.length}`);
console.log(`   📈 Coverage:    ${Math.round((matched.length / claudeUsers.length) * 100)}%\n`);

if (unmatched.length > 0) {
  console.log('⚠️  Unmatched users:\n');
  unmatched.forEach(u => {
    console.log(`   • ${u.name} (${u.email}) → resolved to: ${u.resolved}`);
    console.log(`     Seat: ${u.seatTier}\n`);
  });
} else {
  console.log('✅ SUCCESS: 100% coverage achieved!\n');
}
