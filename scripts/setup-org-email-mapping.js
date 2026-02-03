#!/usr/bin/env node

/**
 * Interactive Org Email Mapping Setup
 *
 * Orchestrates the complete email mapping workflow:
 * 1. Load org chart and Claude Enterprise users
 * 2. Auto-match emails using name similarity
 * 3. Interactive resolution of unmatched users
 * 4. Generate and update EMAIL_ALIAS_MAP
 * 5. Validate 100% coverage
 * 6. Run data refresh
 *
 * Usage:
 *   node scripts/setup-org-email-mapping.js
 *   /setup-org-data (via Claude Code slash command)
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const {
  matchEmailsByName,
  generateAliasMapCode,
  updateAliasMapInFile
} = require('./modules/email-mapper');
const { buildOrgMappingFromHierarchy } = require('./parse-hierarchy');

// File paths
const ORG_CHART_PATH = path.join(__dirname, '../data/techco_org_chart.json');
const SEATS_PATH = path.join(__dirname, '../data/claude_enterprise_seats.json');
const PARSE_HIERARCHY_PATH = path.join(__dirname, 'parse-hierarchy.js');

// ============================================================================
// CLI Helpers
// ============================================================================

function printHeader(title) {
  console.log('\n' + '='.repeat(70));
  console.log(`  ${title}`);
  console.log('='.repeat(70) + '\n');
}

function printSection(title) {
  console.log('\n' + '-'.repeat(70));
  console.log(`  ${title}`);
  console.log('-'.repeat(70) + '\n');
}

async function promptUser(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// ============================================================================
// Step 1: Load Data
// ============================================================================

function loadOrgChart() {
  printSection('Step 1: Loading Org Chart');

  if (!fs.existsSync(ORG_CHART_PATH)) {
    console.error('❌ Org chart not found at:', ORG_CHART_PATH);
    console.error('   Run /generate-org-chart first to create the org chart');
    process.exit(1);
  }

  console.log('📊 Building org email map from hierarchy...\n');
  const orgEmailMap = buildOrgMappingFromHierarchy(ORG_CHART_PATH);

  // Extract employees as array for matching
  const orgEmployees = [];
  orgEmailMap.forEach((info, email) => {
    orgEmployees.push({
      email,
      name: info.name,
      department: info.department,
      title: info.title
    });
  });

  console.log(`✅ Loaded ${orgEmployees.length} employees from org chart\n`);

  return { orgEmailMap, orgEmployees };
}

function loadClaudeEnterpriseUsers() {
  printSection('Step 2: Loading Claude Enterprise Users');

  if (!fs.existsSync(SEATS_PATH)) {
    console.error('❌ Claude Enterprise seats file not found at:', SEATS_PATH);
    console.error('   Run /update-claude-seats first to import seat data');
    process.exit(1);
  }

  const seatsData = JSON.parse(fs.readFileSync(SEATS_PATH, 'utf-8'));

  // Filter to active users with assigned seats
  const users = seatsData.users.filter(u =>
    u.status === 'Active' && u.seatTier !== 'Unassigned'
  );

  console.log(`✅ Loaded ${users.length} active Claude Enterprise users\n`);
  console.log(`   Premium: ${users.filter(u => u.seatTier === 'Premium').length}`);
  console.log(`   Standard: ${users.filter(u => u.seatTier === 'Standard').length}\n`);

  return users;
}

// ============================================================================
// Step 3: Auto-Match Emails
// ============================================================================

function autoMatchEmails(claudeUsers, orgEmployees) {
  printSection('Step 3: Auto-Matching Emails');

  console.log('🔍 Matching real emails to org chart using:');
  console.log('   • Direct email match');
  console.log('   • Email pattern variants');
  console.log('   • Name similarity (80% threshold)\n');

  const results = matchEmailsByName(claudeUsers, orgEmployees, 80);

  console.log('📊 Auto-Matching Results:\n');
  console.log(`   Total users:        ${results.stats.total}`);
  console.log(`   ✅ Auto-matched:    ${results.stats.matched} (${results.stats.coverage}%)`);
  console.log(`   ⚠️  Needs resolution: ${results.stats.unmatched}\n`);

  // Show breakdown by method
  const byMethod = {};
  results.autoMatched.forEach(m => {
    byMethod[m.method] = (byMethod[m.method] || 0) + 1;
  });

  console.log('   Matching methods used:');
  Object.entries(byMethod).forEach(([method, count]) => {
    const methodName = method === 'exact_email' ? 'Exact email' :
                      method === 'email_variant' ? 'Email variant' :
                      'Name similarity';
    console.log(`     • ${methodName}: ${count}`);
  });
  console.log();

  return results;
}

// ============================================================================
// Step 4: Interactive Resolution
// ============================================================================

async function resolveUnmatchedUsers(unmatchedUsers) {
  if (unmatchedUsers.length === 0) {
    console.log('✅ All users matched! No manual resolution needed.\n');
    return [];
  }

  printSection('Step 4: Resolving Unmatched Users');

  console.log(`⚠️  ${unmatchedUsers.length} user(s) need manual resolution\n`);

  const manualMatches = [];
  const skipped = [];

  for (let i = 0; i < unmatchedUsers.length; i++) {
    const user = unmatchedUsers[i];

    console.log(`\n[${i + 1}/${unmatchedUsers.length}] Claude Enterprise User:`);
    console.log(`   Name: ${user.realName}`);
    console.log(`   Email: ${user.realEmail}`);
    console.log(`   Seat: ${user.seatTier}\n`);

    if (user.potentialMatches.length > 0) {
      console.log('   Potential org chart matches:\n');
      user.potentialMatches.slice(0, 3).forEach((match, idx) => {
        console.log(`   ${idx + 1}. ${match.orgName} (${match.similarity}% match)`);
        console.log(`      Email: ${match.orgEmail}`);
        console.log(`      Dept: ${match.department}\n`);
      });

      const answer = await promptUser('   Select match (1-3), S to skip, or enter org chart email manually: ');

      if (answer.toLowerCase() === 's') {
        skipped.push(user);
        console.log('   ⏭️  Skipped (user not in org chart)\n');
      } else if (/^[1-3]$/.test(answer)) {
        const matchIdx = parseInt(answer) - 1;
        const selectedMatch = user.potentialMatches[matchIdx];
        manualMatches.push({
          realEmail: user.realEmail,
          orgEmail: selectedMatch.orgEmail,
          name: user.realName,
          similarity: selectedMatch.similarity,
          method: 'manual_selection',
          seatTier: user.seatTier,
          status: user.status
        });
        console.log(`   ✅ Matched to: ${selectedMatch.orgName}\n`);
      } else if (answer.includes('@')) {
        manualMatches.push({
          realEmail: user.realEmail,
          orgEmail: answer.toLowerCase(),
          name: user.realName,
          similarity: 100,
          method: 'manual_entry',
          seatTier: user.seatTier,
          status: user.status
        });
        console.log(`   ✅ Matched to: ${answer}\n`);
      } else {
        console.log('   ❌ Invalid input, skipping...\n');
        skipped.push(user);
      }
    } else {
      console.log('   No potential matches found in org chart.\n');
      const answer = await promptUser('   Enter org chart email or S to skip: ');

      if (answer.toLowerCase() === 's') {
        skipped.push(user);
        console.log('   ⏭️  Skipped (user not in org chart)\n');
      } else if (answer.includes('@')) {
        manualMatches.push({
          realEmail: user.realEmail,
          orgEmail: answer.toLowerCase(),
          name: user.realName,
          similarity: 100,
          method: 'manual_entry',
          seatTier: user.seatTier,
          status: user.status
        });
        console.log(`   ✅ Matched to: ${answer}\n`);
      } else {
        console.log('   ❌ Invalid input, skipping...\n');
        skipped.push(user);
      }
    }
  }

  console.log('\n📊 Resolution Summary:');
  console.log(`   ✅ Resolved: ${manualMatches.length}`);
  console.log(`   ⏭️  Skipped: ${skipped.length}\n`);

  return manualMatches;
}

// ============================================================================
// Step 5: Generate and Update EMAIL_ALIAS_MAP
// ============================================================================

function updateEmailAliasMap(allMatches) {
  printSection('Step 5: Updating EMAIL_ALIAS_MAP');

  // Read existing EMAIL_ALIAS_MAP
  const parseHierarchyContent = fs.readFileSync(PARSE_HIERARCHY_PATH, 'utf-8');
  const existingMapMatch = parseHierarchyContent.match(/const EMAIL_ALIAS_MAP = \{([\s\S]*?)\};/);

  let existingAliasMap = {};
  if (existingMapMatch) {
    // Parse existing aliases (simple regex extraction)
    const mapContent = existingMapMatch[1];
    const aliasRegex = /'([^']+)':\s*'([^']+)'/g;
    let match;
    while ((match = aliasRegex.exec(mapContent)) !== null) {
      existingAliasMap[match[1]] = match[2];
    }
  }

  console.log(`📋 Current EMAIL_ALIAS_MAP: ${Object.keys(existingAliasMap).length} aliases\n`);

  // Generate new alias map code
  const newAliasMapCode = generateAliasMapCode(allMatches, existingAliasMap);

  // Count new aliases
  const newAliasCount = allMatches.filter(m => m.realEmail !== m.orgEmail).length;

  console.log(`🆕 New aliases to add: ${newAliasCount}\n`);
  console.log('Generated EMAIL_ALIAS_MAP preview:\n');
  console.log(newAliasMapCode.split('\n').slice(0, 15).join('\n'));
  if (newAliasMapCode.split('\n').length > 15) {
    console.log('   ...(truncated)...\n');
  }

  // Update file
  console.log('💾 Updating scripts/parse-hierarchy.js...\n');

  const success = updateAliasMapInFile(PARSE_HIERARCHY_PATH, newAliasMapCode);
  const totalAliases = Object.keys(existingAliasMap).length + newAliasCount;

  if (success) {
    console.log(`✅ EMAIL_ALIAS_MAP updated successfully`);
    console.log(`   Total aliases: ${totalAliases} (${newAliasCount} new)\n`);
  } else {
    console.error('❌ Failed to update EMAIL_ALIAS_MAP\n');
    process.exit(1);
  }

  return { success, totalAliases, newAliasCount };
}

// ============================================================================
// Step 6: Validate Coverage
// ============================================================================

function validateCoverage(claudeUsers, orgEmailMap) {
  printSection('Step 6: Validating Email Coverage');

  console.log('🔍 Validating all Claude Enterprise users are matched...\n');

  // Reload EMAIL_ALIAS_MAP after update
  delete require.cache[require.resolve('./parse-hierarchy')];
  const { resolveEmailAlias: newResolveAlias } = require('./parse-hierarchy');

  const unmatched = [];
  const matched = [];

  claudeUsers.forEach(user => {
    const email = user.email.toLowerCase();
    const resolved = newResolveAlias(email);

    if (orgEmailMap.has(resolved)) {
      matched.push(user);
    } else {
      unmatched.push(user);
    }
  });

  const coverage = Math.round((matched.length / claudeUsers.length) * 100);

  console.log('📊 Coverage Results:\n');
  console.log(`   Total users:    ${claudeUsers.length}`);
  console.log(`   ✅ Matched:     ${matched.length}`);
  console.log(`   ❌ Unmatched:   ${unmatched.length}`);
  console.log(`   📈 Coverage:    ${coverage}%\n`);

  if (unmatched.length > 0) {
    console.log('⚠️  Unmatched users:\n');
    unmatched.forEach(u => {
      console.log(`   • ${u.name} (${u.email}) - ${u.seatTier}`);
    });
    console.log();
    console.log('❌ VALIDATION FAILED: Not all users matched');
    console.log('   Re-run this script to resolve remaining users\n');
    return { success: false, coverage, unmatched };
  }

  console.log('✅ VALIDATION PASSED: 100% coverage achieved!\n');
  return { success: true, coverage, unmatched: [] };
}

// ============================================================================
// Step 7: Summary and Next Steps
// ============================================================================

function printSummary(stats) {
  printHeader('Setup Complete! 🎉');

  console.log('📊 Final Results:\n');
  console.log(`   Claude Enterprise Users: ${stats.totalUsers}`);
  console.log(`   Auto-matched: ${stats.autoMatched}`);
  console.log(`   Manually resolved: ${stats.manualMatched}`);
  console.log(`   Skipped: ${stats.skipped}`);
  console.log(`   EMAIL_ALIAS_MAP: ${stats.totalAliases} total aliases\n`);

  console.log('📁 Files Updated:\n');
  console.log(`   ✅ scripts/parse-hierarchy.js`);
  console.log(`      └─ EMAIL_ALIAS_MAP expanded (${stats.newAliases} new aliases)\n`);

  console.log('🎯 Next Steps:\n');
  console.log('   1. Run data refresh to update expansion analysis:');
  console.log('      npm run refresh\n');
  console.log('   2. Verify expansion opportunities show correct totals:');
  console.log('      - Should show ~115 users (not 94)');
  console.log('      - Premium/Standard breakdown: 41/74\n');
  console.log('   3. Check Phase 2 Rollout Tracker for accurate counts\n');

  console.log('💡 Maintenance:\n');
  console.log('   • Re-run when new employees join');
  console.log('   • Re-run after Claude Enterprise license changes');
  console.log('   • Re-run if you see "Unknown" departments in dashboard\n');
}

// ============================================================================
// Main Orchestration
// ============================================================================

async function main() {
  printHeader('Org Email Mapping Setup Workflow');

  try {
    // Step 1 & 2: Load data
    const { orgEmailMap, orgEmployees } = loadOrgChart();
    const claudeUsers = loadClaudeEnterpriseUsers();

    // Step 3: Auto-match
    const matchResults = autoMatchEmails(claudeUsers, orgEmployees);

    // Step 4: Resolve unmatched
    const manualMatches = await resolveUnmatchedUsers(matchResults.needsResolution);

    // Combine all matches
    const allMatches = [...matchResults.autoMatched, ...manualMatches];

    // Step 5: Update EMAIL_ALIAS_MAP
    const aliasStats = updateEmailAliasMap(allMatches);

    // Step 6: Validate coverage
    const validation = validateCoverage(claudeUsers, orgEmailMap);

    if (!validation.success) {
      console.log('⚠️  Setup incomplete - some users still unmatched');
      console.log('   Re-run this script to continue\n');
      process.exit(1);
    }

    // Step 7: Summary
    printSummary({
      totalUsers: claudeUsers.length,
      autoMatched: matchResults.autoMatched.length,
      manualMatched: manualMatches.length,
      skipped: matchResults.needsResolution.length - manualMatches.length,
      totalAliases: aliasStats.totalAliases,
      newAliases: aliasStats.newAliasCount
    });

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
