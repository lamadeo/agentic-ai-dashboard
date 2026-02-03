const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../app/ai-tools-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log('\n📊 DEPARTMENT & TEAM STRUCTURE FROM ORG CHART\n');
console.log('═══════════════════════════════════════════════\n');

// Collect department statistics across all tools
const deptStats = new Map();

function addDeptStats(dept, tool, users, metric, metricValue) {
  if (!deptStats.has(dept)) {
    deptStats.set(dept, {
      tools: new Map(),
      totalUsers: 0
    });
  }

  const deptData = deptStats.get(dept);
  if (!deptData.tools.has(tool)) {
    deptData.tools.set(tool, { users, metric, metricValue });
  }
}

// Process GitHub Copilot (weekly data - use latest week)
const latestGHWeek = data.githubCopilot.weeklyTrend[data.githubCopilot.weeklyTrend.length - 1];
if (latestGHWeek && latestGHWeek.byDept) {
  latestGHWeek.byDept.forEach(d => {
    addDeptStats(d.department, 'GitHub Copilot', d.users, 'Lines Generated', d.lines);
  });
}

// Process Claude Code (monthly data - use latest month)
const latestCCMonth = data.claudeCode.monthlyTrend[data.claudeCode.monthlyTrend.length - 1];
if (latestCCMonth && latestCCMonth.byDept) {
  latestCCMonth.byDept.forEach(d => {
    addDeptStats(d.department, 'Claude Code', d.users, 'Lines Generated', d.lines);
  });
}

// Process M365 Copilot (monthly data - use latest month)
const latestM365Month = data.m365Copilot.monthlyTrend[data.m365Copilot.monthlyTrend.length - 1];
if (latestM365Month && latestM365Month.byDept) {
  latestM365Month.byDept.forEach(d => {
    addDeptStats(d.department, 'M365 Copilot', d.users, 'Prompts', d.prompts);
  });
}

// Process Claude Enterprise (monthly data - use latest month)
const latestCEMonth = data.claudeEnterprise.monthlyTrend[data.claudeEnterprise.monthlyTrend.length - 1];
if (latestCEMonth && latestCEMonth.byDept) {
  latestCEMonth.byDept.forEach(d => {
    addDeptStats(d.department, 'Claude Enterprise', d.users, 'Conversations', d.conversations);
  });
}

// Sort departments by total unique users across all tools
const sortedDepts = Array.from(deptStats.entries())
  .map(([dept, data]) => {
    // Get unique user count across all tools
    const userSet = new Set();
    data.tools.forEach(tool => userSet.add(tool.users));
    const totalUsers = Array.from(data.tools.values()).reduce((sum, t) => sum + t.users, 0);
    return { dept, data, totalUsers };
  })
  .sort((a, b) => b.totalUsers - a.totalUsers);

// Display results
let knownDeptUsers = 0;
let unknownDeptUsers = 0;

sortedDepts.forEach(({ dept, data, totalUsers }) => {
  const isUnknown = dept === 'Unknown';
  if (isUnknown) {
    unknownDeptUsers += totalUsers;
  } else {
    knownDeptUsers += totalUsers;
  }

  console.log(`📁 ${dept}`);
  console.log(`   Total Users (across all tools): ${totalUsers}`);
  console.log(`   ────────────────────────────────────────────`);

  // Display by tool
  data.tools.forEach((toolData, tool) => {
    const { users, metric, metricValue } = toolData;
    console.log(`   ${tool}:`);
    console.log(`      • ${users} active users`);
    console.log(`      • ${metricValue.toLocaleString()} ${metric.toLowerCase()}`);
  });

  console.log(``);
});

console.log('\n═══════════════════════════════════════════════');
console.log('📈 SUMMARY STATISTICS\n');
console.log(`Total Departments: ${sortedDepts.length}`);
console.log(`Total User Instances (sum across all tools): ${sortedDepts.reduce((sum, d) => sum + d.totalUsers, 0)}`);
console.log(`Unknown Department User Instances: ${unknownDeptUsers}`);
console.log(`Known Department User Instances: ${knownDeptUsers}`);
console.log(`\nMapping Success Rate: ${((knownDeptUsers / (knownDeptUsers + unknownDeptUsers)) * 100).toFixed(1)}%`);

// Show org chart extraction summary
console.log('\n═══════════════════════════════════════════════');
console.log('🏢 ORG CHART EXTRACTION SUMMARY\n');
console.log('From: /data/org chart - org diagram - rippling.pdf');
console.log('• 243 employees extracted');
console.log('• 12 department heads identified');
console.log('• 243 email mappings generated');
