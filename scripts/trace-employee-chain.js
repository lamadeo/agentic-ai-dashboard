const fs = require('fs');
const path = require('path');

const orgChartPath = path.join(__dirname, '../data/techco_org_chart.json');
const orgData = JSON.parse(fs.readFileSync(orgChartPath, 'utf8'));

function findEmployeeChain(node, targetName, chain = []) {
  // Add current node to chain
  const currentChain = [...chain, { name: node.name, title: node.title }];

  // Check if this is the target
  if (node.name === targetName) {
    return currentChain;
  }

  // Search in reports
  if (node.reports && node.reports.length > 0) {
    for (const report of node.reports) {
      const found = findEmployeeChain(report, targetName, currentChain);
      if (found) return found;
    }
  }

  return null;
}

// Find Brett Honkanen
console.log('=== BRETT HONKANEN REPORTING CHAIN ===');
const brettChain = findEmployeeChain(orgData.organization.ceo, 'Brett Honkanen');
if (brettChain) {
  brettChain.forEach((person, index) => {
    const indent = '  '.repeat(index);
    console.log(`${indent}${index === 0 ? 'CEO' : '├──'} ${person.name} (${person.title})`);
  });
} else {
  console.log('Brett Honkanen NOT FOUND in org chart');
}

console.log('\n=== JIMI DODGE REPORTING CHAIN ===');
const jimiChain = findEmployeeChain(orgData.organization.ceo, 'Jimi Dodge');
if (jimiChain) {
  jimiChain.forEach((person, index) => {
    const indent = '  '.repeat(index);
    console.log(`${indent}${index === 0 ? 'CEO' : '├──'} ${person.name} (${person.title})`);
  });
} else {
  console.log('Jimi Dodge NOT FOUND in org chart');
}

// Also check Agentic AI team for reference
console.log('\n=== AGENTIC AI TEAM (FOR REFERENCE) ===');
const agenticChain = findEmployeeChain(orgData.organization.ceo, 'Luis Amadeo');
if (agenticChain) {
  console.log('Luis Amadeo (Chief Agentic Officer)');
  const luisNode = findNode(orgData.organization.ceo, 'Luis Amadeo');
  if (luisNode && luisNode.reports) {
    luisNode.reports.forEach(report => {
      console.log(`  ├── ${report.name} (${report.title})`);
      if (report.reports && report.reports.length > 0) {
        report.reports.forEach(subreport => {
          console.log(`      ├── ${subreport.name} (${subreport.title})`);
        });
      }
    });
  }
}

function findNode(node, targetName) {
  if (node.name === targetName) return node;
  if (node.reports && node.reports.length > 0) {
    for (const report of node.reports) {
      const found = findNode(report, targetName);
      if (found) return found;
    }
  }
  return null;
}
