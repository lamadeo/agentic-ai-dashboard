#!/usr/bin/env node
/**
 * Extract Tool/Integration Usage from Claude Enterprise conversations.json
 *
 * Standalone utility for ad-hoc analysis. For production data processing,
 * use `npm run refresh` which runs the full pipeline.
 *
 * Handles large files (500MB+) using jq streaming to avoid memory issues.
 *
 * Usage: node scripts/utilities/extract-tool-usage.js [conversations.json path]
 * Output: Writes tool-usage-summary.json to data/
 *
 * @see scripts/modules/ingestors/connectors-ingestor.js for pipeline equivalent
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { spawn, execFileSync } = require('child_process');

// Default to conversations.json in data (user should specify path for extracted directories)
const inputFile = process.argv[2] ||
  path.join(__dirname, '../../data/conversations.json');
const usersFile = path.join(__dirname, '../../data/users.json');
const outputFile = path.join(__dirname, '../../data/tool-usage-summary.json');

async function main() {
  console.log('🔍 Extracting tool usage from:', inputFile);
  console.log('📊 File size:', (fs.statSync(inputFile).size / 1024 / 1024).toFixed(1), 'MB');

  // Load users for email mapping
  let userMap = new Map();
  try {
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    users.forEach(u => userMap.set(u.uuid, u.email_address || u.full_name));
    console.log('👥 Loaded', userMap.size, 'users for mapping');
  } catch (e) {
    console.log('⚠️  Could not load users.json, will use UUIDs');
  }

  // Process using streaming approach
  console.log('⏳ Processing with jq streaming (this may take a few minutes for large files)...');

  try {
    await processChunked(inputFile, userMap, outputFile);
  } catch (error) {
    console.error('❌ Error processing file:', error.message);
    process.exit(1);
  }
}

async function processChunked(inputFile, userMap, outputFile) {
  // Process conversations one at a time using jq streaming
  const toolCounts = new Map();
  const integrationCounts = new Map();
  const userCounts = new Map();

  // Use jq to emit one conversation per line (execFile with array args - safe from injection)
  const jq = spawn('jq', ['-c', '.[]', inputFile], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  const rl = readline.createInterface({
    input: jq.stdout,
    crlfDelay: Infinity
  });

  let processed = 0;
  let errors = 0;

  for await (const line of rl) {
    try {
      const conv = JSON.parse(line);
      const userUuid = conv.account?.uuid;

      for (const msg of conv.chat_messages || []) {
        for (const content of msg.content || []) {
          if (content.type === 'tool_use') {
            const tool = content.name;
            const integration = content.integration_name;

            // Count tool
            toolCounts.set(tool, (toolCounts.get(tool) || 0) + 1);

            // Count integration
            if (integration) {
              integrationCounts.set(integration, (integrationCounts.get(integration) || 0) + 1);
            }

            // Count user usage
            if (userUuid) {
              const userData = userCounts.get(userUuid) || { count: 0, tools: new Set() };
              userData.count++;
              userData.tools.add(tool);
              userCounts.set(userUuid, userData);
            }
          }
        }
      }

      processed++;
      if (processed % 1000 === 0) {
        process.stdout.write(`\r   Processed ${processed} conversations...`);
      }
    } catch (e) {
      errors++;
      // Skip malformed lines
    }
  }

  // Wait for jq to finish
  await new Promise((resolve, reject) => {
    jq.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`jq exited with code ${code}`));
    });
    jq.on('error', reject);
  });

  console.log(`\n   Processed ${processed} conversations total (${errors} errors)`);

  // Build summary
  const toolCountsData = Array.from(toolCounts.entries())
    .map(([tool, count]) => ({ tool, count }))
    .sort((a, b) => b.count - a.count);

  const integrationCountsData = Array.from(integrationCounts.entries())
    .map(([integration, count]) => ({ integration, count }))
    .sort((a, b) => b.count - a.count);

  const userToolsData = Array.from(userCounts.entries())
    .map(([uuid, data]) => ({
      user: uuid,
      email: userMap.get(uuid) || uuid,
      tool_count: data.count,
      unique_tools: data.tools.size
    }))
    .sort((a, b) => b.tool_count - a.tool_count)
    .slice(0, 50);

  const summary = {
    generated_at: new Date().toISOString(),
    source_file: inputFile,
    tool_usage: {
      by_tool: toolCountsData,
      by_integration: integrationCountsData,
      by_user: userToolsData
    },
    totals: {
      total_tool_calls: toolCountsData.reduce((sum, t) => sum + t.count, 0),
      unique_tools: toolCountsData.length,
      unique_integrations: integrationCountsData.length,
      users_with_tool_usage: userToolsData.length
    }
  };

  fs.writeFileSync(outputFile, JSON.stringify(summary, null, 2));
  console.log('✅ Wrote summary to:', outputFile);

  // Print summary
  console.log('\n📈 Summary:');
  console.log('   Total tool calls:', summary.totals.total_tool_calls);
  console.log('   Unique tools:', summary.totals.unique_tools);
  console.log('   Unique integrations:', summary.totals.unique_integrations);
  console.log('   Users with tool usage:', summary.totals.users_with_tool_usage);

  console.log('\n🔧 Top 10 Tools:');
  toolCountsData.slice(0, 10).forEach((t, i) => {
    console.log(`   ${i + 1}. ${t.tool} - ${t.count} calls`);
  });

  console.log('\n🔌 Top Integrations:');
  integrationCountsData.forEach((t, i) => {
    console.log(`   ${i + 1}. ${t.integration} - ${t.count} calls`);
  });
}

main().catch(console.error);
