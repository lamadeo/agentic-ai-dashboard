const fs = require('fs');
const path = require('path');

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());

  function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current);
    return values;
  }

  const headers = parseCSVLine(lines[0]).map(h => h.trim().replace(/﻿/g, ''));
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = values[i]?.trim() || '';
    });
    return obj;
  });
}

console.log('\n🔍 M365 COPILOT DATA DIAGNOSTICS\n');
console.log('═══════════════════════════════════════════════════════════════\n');

const dataDir = path.join(__dirname, '../data');
const m365Files = fs.readdirSync(dataDir)
  .filter(f => f.includes('365') && f.includes('Copilot') && f.endsWith('.csv') && !f.includes('Agent'))
  .map(f => path.join(dataDir, f));

console.log(`Found ${m365Files.length} M365 Copilot files:\n`);

m365Files.forEach((filePath, idx) => {
  const filename = path.basename(filePath);
  console.log(`\n📄 File ${idx + 1}: ${filename}`);
  console.log('─'.repeat(70));

  const data = parseCSV(filePath);

  if (data.length === 0) {
    console.log('   ⚠️  File is empty or has no data rows');
    return;
  }

  // Analyze Report Period
  const reportPeriods = new Set(data.map(r => r['Report Period']).filter(Boolean));
  console.log(`   Report Period(s): ${Array.from(reportPeriods).join(', ')} days`);

  // Analyze Report Refresh Date
  const refreshDates = new Set(data.map(r => r['Report Refresh Date']).filter(Boolean));
  console.log(`   Report Refresh Date(s): ${Array.from(refreshDates).join(', ')}`);

  // Analyze Last Activity Date range
  const lastActivityDates = data.map(r => r['Last Activity Date']).filter(Boolean);
  if (lastActivityDates.length > 0) {
    const sortedDates = lastActivityDates.sort();
    console.log(`   Last Activity Date range: ${sortedDates[0]} to ${sortedDates[sortedDates.length - 1]}`);
  }

  // Count unique users
  const uniqueUsers = new Set(data.map(r => r['User Principal Name']).filter(Boolean));
  console.log(`   Unique users: ${uniqueUsers.size}`);

  // Calculate total prompts
  const totalPrompts = data.reduce((sum, r) => {
    const prompts = parseInt(r['Prompts submitted for All Apps']) || 0;
    return sum + prompts;
  }, 0);
  console.log(`   Total prompts (if summed): ${totalPrompts.toLocaleString()}`);
  console.log(`   Avg prompts per user: ${(totalPrompts / uniqueUsers.size).toFixed(0)}`);

  // Show sample user data
  if (data.length > 0) {
    console.log(`\n   Sample user (first row):`);
    const sample = data[0];
    console.log(`      User: ${sample['Display Name']} (${sample['User Principal Name']})`);
    console.log(`      Last Activity: ${sample['Last Activity Date']}`);
    console.log(`      Report Period: ${sample['Report Period']} days`);
    console.log(`      Prompts: ${sample['Prompts submitted for All Apps']}`);
    console.log(`      Active Days: ${sample['Active Usage Days for All Apps']}`);
  }
});

console.log('\n\n🚨 IDENTIFIED ISSUES:\n');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('1. CUMULATIVE REPORTING PERIODS');
console.log('   Microsoft reports show CUMULATIVE totals, not monthly breakdown.');
console.log('   - 30-day report = all prompts in last 30 days');
console.log('   - 180-day report = all prompts in last 180 days');
console.log('   - We cannot simply sum these across files!\n');

console.log('2. OVERLAPPING DATA');
console.log('   Multiple files have overlapping date ranges:');
console.log('   - "Last 6 months" file covers July-December');
console.log('   - "October 1 to November 1" covers October');
console.log('   - "November 10 to December 10" covers Nov-Dec');
console.log('   - Same users appear in multiple files with different cumulative totals\n');

console.log('3. INCORRECT AGGREGATION METHOD');
console.log('   Current code sums prompts from each user in each file:');
console.log('   - User A in Oct file: 500 prompts (30-day cumulative)');
console.log('   - User A in 6-month file: 2000 prompts (180-day cumulative)');
console.log('   - We add both → 2500 prompts (WRONG!)');
console.log('   - Should use: Latest snapshot OR calculate deltas\n');

console.log('\n💡 RECOMMENDATIONS:\n');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('Option 1: USE SINGLE SOURCE OF TRUTH');
console.log('   - Use ONLY the "Last 6 months" file (180-day report)');
console.log('   - Group users by Last Activity Date month');
console.log('   - Count unique users per month');
console.log('   - Treat "Prompts" as cumulative, not monthly\n');

console.log('Option 2: USE MONTHLY SNAPSHOTS ONLY');
console.log('   - Use only 30-day reports (Oct, Nov, Dec)');
console.log('   - Ignore 90-day and 180-day reports');
console.log('   - Treat each 30-day report as a monthly snapshot\n');

console.log('Option 3: DOWNLOAD NEW REPORTS');
console.log('   - Get separate monthly reports from Microsoft');
console.log('   - Each report should cover exactly one month');
console.log('   - No overlapping periods\n');
