const data = require('../app/ai-tools-data.json');

if (data.m365CopilotDeepDive.agents) {
  console.log('✅ Agents data found!');
  console.log('\nTop 5 agents by usage:');
  data.m365CopilotDeepDive.agents.topAgentsByUsage.slice(0, 5).forEach((a, i) => {
    console.log(`  ${i+1}. ${a.agentName}: ${a.totalResponses} responses, ${a.totalUsers} users`);
    console.log(`     Creator: ${a.creatorType}`);
  });

  console.log('\nTop agent by department breakdown:');
  const top = data.m365CopilotDeepDive.agents.topAgentsByDepartment[0];
  console.log(`  ${top.agentName} (${top.totalResponses} total responses):`);
  top.byDepartment.slice(0, 5).forEach(d => {
    console.log(`    - ${d.department}: ${d.responses} responses, ${d.users} users`);
  });

  console.log('\nCreator type breakdown:');
  Object.entries(data.m365CopilotDeepDive.agents.creatorTypeBreakdown).forEach(([type, count]) => {
    console.log(`  ${type}: ${count} combinations`);
  });
} else {
  console.log('❌ Agents data not found');
}
