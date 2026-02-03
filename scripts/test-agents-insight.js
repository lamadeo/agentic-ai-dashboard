const data = require('../app/ai-tools-data.json');

console.log('Has m365AgentsAdoption insight?', !!data.insights.m365AgentsAdoption);

if (data.insights.m365AgentsAdoption) {
  console.log('\n✅ M365 Agents Adoption Insight found!\n');
  console.log('Preview (first 300 chars):');
  console.log(data.insights.m365AgentsAdoption.substring(0, 300) + '...\n');
  console.log(`Full length: ${data.insights.m365AgentsAdoption.length} characters`);
} else {
  console.log('\n❌ M365 Agents Adoption Insight NOT found');
  console.log('Need to regenerate insights');
}

// Check if agents data exists
console.log('\nAgents data exists?', !!data.m365CopilotDeepDive.agents);
if (data.m365CopilotDeepDive.agents) {
  console.log('Top agent:', data.m365CopilotDeepDive.agents.topAgentsByUsage[0]?.agentName);
}
