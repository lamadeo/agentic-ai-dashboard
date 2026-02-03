#!/usr/bin/env node

/**
 * Parse Claude Enterprise seat data from admin console text
 *
 * Usage:
 *   1. Copy user list from Claude Enterprise admin settings page
 *   2. Paste into /tmp/claude-seats-raw.txt
 *   3. Run: node scripts/parse-claude-seats.js
 *
 * Output: data/claude_enterprise_seats.json
 */

const fs = require('fs');
const path = require('path');

const INPUT_FILE = '/tmp/claude-seats-raw.txt';
const OUTPUT_FILE = path.join(__dirname, '../data/claude_enterprise_seats.json');

function parseClaudeSeats(rawText) {
  const lines = rawText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  // Skip header row if present
  let startIndex = 0;
  if (lines[0] === 'Name' && lines[1] === 'Role') {
    // Find where actual data starts (after header)
    startIndex = lines.findIndex((line, idx) =>
      idx > 5 && line.includes('@techco.com')
    ) - 1;
  }

  const users = [];

  // Parse in groups of 5 lines: Name, Email, Role, Seat Tier, Status
  for (let i = startIndex; i < lines.length; i += 5) {
    if (i + 4 >= lines.length) break;

    const name = lines[i];
    const email = lines[i + 1];
    const role = lines[i + 2];
    const seatTier = lines[i + 3];
    const status = lines[i + 4];

    // Validate this is a user entry (email should contain @techco.com)
    if (!email.includes('@techco.com')) {
      console.warn(`⚠️  Skipping invalid entry at line ${i}: ${name} (no valid email)`);
      continue;
    }

    users.push({
      name: name === '-' ? 'Unknown' : name,
      email: email.toLowerCase(),
      role: role,
      seatTier: seatTier,
      status: status
    });
  }

  // Calculate statistics
  const seatCounts = users.reduce((acc, user) => {
    const tier = user.seatTier.toLowerCase();
    acc[tier] = (acc[tier] || 0) + 1;
    return acc;
  }, {});

  const statusCounts = users.reduce((acc, user) => {
    const status = user.status.toLowerCase();
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  return {
    metadata: {
      lastUpdated: new Date().toISOString(),
      source: 'Claude Enterprise Admin Console',
      totalUsers: users.length
    },
    statistics: {
      seatCounts: {
        premium: seatCounts.premium || 0,
        standard: seatCounts.standard || 0,
        unassigned: seatCounts.unassigned || 0
      },
      statusCounts: {
        active: statusCounts.active || 0,
        pending: statusCounts.pending || 0,
        inactive: statusCounts.inactive || 0
      }
    },
    users: users.sort((a, b) => a.email.localeCompare(b.email))
  };
}

function main() {
  console.log('🔄 Parsing Claude Enterprise seat data...\n');

  // Check if input file exists
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`❌ Input file not found: ${INPUT_FILE}`);
    console.log('\n📋 Instructions:');
    console.log('   1. Go to Claude Enterprise admin settings');
    console.log('   2. Copy the entire user list (Name, Email, Role, Seat Tier, Status)');
    console.log('   3. Create file: /tmp/claude-seats-raw.txt');
    console.log('   4. Paste the copied text into that file');
    console.log('   5. Run this script again\n');
    process.exit(1);
  }

  // Read and parse
  const rawText = fs.readFileSync(INPUT_FILE, 'utf8');
  const data = parseClaudeSeats(rawText);

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write JSON
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));

  // Print summary
  console.log('✅ Parsing complete!\n');
  console.log('📊 Summary:');
  console.log(`   Total Users: ${data.metadata.totalUsers}`);
  console.log(`   Premium Seats: ${data.statistics.seatCounts.premium}`);
  console.log(`   Standard Seats: ${data.statistics.seatCounts.standard}`);
  console.log(`   Unassigned: ${data.statistics.seatCounts.unassigned}`);
  console.log(`   Active: ${data.statistics.statusCounts.active}`);
  console.log(`   Pending: ${data.statistics.statusCounts.pending}`);
  console.log('\n💾 Output saved to:', OUTPUT_FILE);

  // Show Premium seat holders
  console.log('\n🔑 Premium Seat Holders:');
  const premiumUsers = data.users.filter(u => u.seatTier === 'Premium');
  premiumUsers.forEach(user => {
    console.log(`   - ${user.name} (${user.email}) [${user.status}]`);
  });

  console.log('\n🔗 Next Steps:');
  console.log('   1. Verify the output looks correct');
  console.log('   2. Update parse-copilot-data.js to use this file');
  console.log('   3. Delete /tmp/claude-seats-raw.txt (contains sensitive data)');
  console.log('   4. Run: node scripts/parse-copilot-data.js\n');
}

if (require.main === module) {
  main();
}

module.exports = { parseClaudeSeats };
