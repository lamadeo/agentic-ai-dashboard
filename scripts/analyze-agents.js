const fs = require('fs');
const csv = fs.readFileSync('./data/365 Copilot - DeclarativeAgents_Users___agents_30_2025-12-31T14-13-50 - Dec_2_to_Dec_31.csv', 'utf-8');
const lines = csv.split('\n').filter(l => l.trim());

console.log('Total rows (including header):', lines.length);

// Parse and analyze
const rows = lines.slice(1).map(line => {
  const match = line.match(/^([^,]+),([^,]+),([^,]+),([^,]+),(\d+),"(.+?)"$/);
  if (match) {
    return {
      agentName: match[2],
      creatorType: match[3],
      username: match[4],
      responses: parseInt(match[5]),
      lastActivity: match[6]
    };
  }
  return null;
}).filter(r => r !== null);

console.log('Parsed rows:', rows.length);

// Active in December (responses > 0)
const activeInDec = rows.filter(r => r.responses > 0);
console.log('Active in December (responses > 0):', activeInDec.length);

// Top agents by total responses
const agentTotals = {};
rows.forEach(r => {
  if (!agentTotals[r.agentName]) {
    agentTotals[r.agentName] = { responses: 0, users: 0, creatorType: r.creatorType };
  }
  agentTotals[r.agentName].responses += r.responses;
  agentTotals[r.agentName].users += 1;
});

const topAgents = Object.entries(agentTotals)
  .sort((a, b) => b[1].responses - a[1].responses)
  .slice(0, 15);

console.log('\nTop 15 Agents by Total Responses:');
topAgents.forEach(([name, data], idx) => {
  console.log(`  ${idx+1}. ${name}: ${data.responses} responses, ${data.users} users, ${data.creatorType}`);
});

// Creator type breakdown
const creatorTypes = {};
rows.forEach(r => {
  creatorTypes[r.creatorType] = (creatorTypes[r.creatorType] || 0) + 1;
});
console.log('\nCreator Type Distribution:');
Object.entries(creatorTypes).forEach(([type, count]) => {
  console.log(`  ${type}: ${count} user-agent combinations`);
});

// Sample usernames for department mapping
console.log('\nSample usernames (first 10):');
rows.slice(0, 10).forEach(r => {
  console.log(`  ${r.username}`);
});
