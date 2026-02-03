/**
 * Connectors/Integrations Data Ingestor
 *
 * Stream-parses large conversations.json files (up to 500MB) to extract
 * tool_use records for integration analytics.
 *
 * Uses jq streaming (adapted from /scripts/extract-tool-usage.js) to avoid memory issues.
 *
 * Input:  conversations.json from Claude Enterprise exports
 *         users.json for UUID → email mapping
 *
 * Output: {
 *   toolCalls: [{ tool, integration, userUuid, timestamp }],
 *   byIntegration: Map<integration, count>,
 *   byTool: Map<tool, count>,
 *   byUser: Map<userUuid, { count, tools: Set, integrations: Set }>,
 *   userEmailLookup: Map<uuid, email>,
 *   metadata: { filesProcessed, totalToolCalls, uniqueIntegrations, uniqueTools, usersWithUsage }
 * }
 *
 * Dependencies: child_process (for jq), fs, readline
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { spawn } = require('child_process');

/**
 * Stream-parse a conversations.json file and extract tool_use records
 * @param {string} conversationsPath - Path to conversations.json
 * @param {boolean} verbose - Enable detailed logging
 * @returns {Promise<Object>} Tool usage data
 * @private
 */
async function parseConversationsStream(conversationsPath, verbose = true) {
  const toolCounts = new Map();
  const integrationCounts = new Map();
  const userCounts = new Map();
  const toolCalls = [];

  if (verbose) {
    const fileSizeMB = (fs.statSync(conversationsPath).size / 1024 / 1024).toFixed(1);
    console.log(`   Streaming ${path.basename(conversationsPath)} (${fileSizeMB} MB)...`);
  }

  // Use jq to emit one conversation per line (safe from injection with array args)
  const jq = spawn('jq', ['-c', '.[]', conversationsPath], {
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
      const convTimestamp = conv.created_at || conv.updated_at;

      for (const msg of conv.chat_messages || []) {
        for (const content of msg.content || []) {
          if (content.type === 'tool_use') {
            const tool = content.name;
            const integration = content.integration_name;

            // Only count if there's an integration (MCP tool)
            if (integration) {
              // Count tool
              toolCounts.set(tool, (toolCounts.get(tool) || 0) + 1);

              // Count integration
              integrationCounts.set(integration, (integrationCounts.get(integration) || 0) + 1);

              // Count user usage
              if (userUuid) {
                const userData = userCounts.get(userUuid) || {
                  count: 0,
                  tools: new Set(),
                  integrations: new Set()
                };
                userData.count++;
                userData.tools.add(tool);
                userData.integrations.add(integration);
                userCounts.set(userUuid, userData);
              }

              // Store individual tool call (for detailed analysis)
              toolCalls.push({
                tool,
                integration,
                userUuid,
                timestamp: convTimestamp
              });
            }
          }
        }
      }

      processed++;
      if (verbose && processed % 5000 === 0) {
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

  if (verbose) {
    console.log(`\r   Processed ${processed} conversations (${errors} errors)`);
  }

  return { toolCounts, integrationCounts, userCounts, toolCalls };
}

/**
 * Load user email lookup from users.json
 * @param {string} usersPath - Path to users.json
 * @returns {Map<string, string>} Map of UUID to email
 * @private
 */
function loadUserEmailLookup(usersPath) {
  const userEmailLookup = new Map();

  try {
    if (fs.existsSync(usersPath)) {
      const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
      users.forEach(user => {
        if (user.uuid && user.email_address) {
          userEmailLookup.set(user.uuid, user.email_address.toLowerCase().trim());
        }
      });
    }
  } catch (error) {
    console.warn(`   ⚠️  Could not load users.json: ${error.message}`);
  }

  return userEmailLookup;
}

/**
 * Ingest Connectors/Integrations data from Claude Enterprise exports
 *
 * @param {Object} options - Configuration options
 * @param {string} options.dataDir - Data directory path (default: '../../../data')
 * @param {boolean} options.verbose - Enable detailed logging (default: true)
 * @returns {Promise<Object>} Connectors usage data structure
 * @throws {Error} If required files not found or parsing fails
 */
async function ingestConnectors(options = {}) {
  const {
    dataDir = path.join(__dirname, '../../../data'),
    tmpDir = path.join(__dirname, '../../../data/claude-monthly-data'),
    verbose = true
  } = options;

  if (verbose) console.log('\n🔌 Parsing Connectors/Integrations data...\n');

  try {
    // 1. Find conversations.json files (both ZIPs extracted and loose folders)
    // Check multiple locations: dataDir, tmpDir (claude-monthly-data), and claude-enterprise subfolder
    const findExtractedDirs = (dir) => {
      if (!fs.existsSync(dir)) return [];
      return fs.readdirSync(dir)
        .filter(file => file.startsWith('claude-ent-data') && !file.endsWith('.zip'))
        .map(subdir => path.join(dir, subdir))
        .filter(fullPath => fs.statSync(fullPath).isDirectory());
    };

    // Look in multiple locations
    const dirsFromRoot = findExtractedDirs(dataDir);
    const dirsFromTmp = findExtractedDirs(tmpDir);
    const claudeEnterpriseSubfolder = path.join(dataDir, 'claude-enterprise');
    const dirsFromSubfolder = findExtractedDirs(claudeEnterpriseSubfolder);
    const tmpInSubfolder = path.join(claudeEnterpriseSubfolder, 'claude-monthly-data');
    const dirsFromSubfolderTmp = findExtractedDirs(tmpInSubfolder);

    // Combine all found directories (dedupe by basename, prefer tmpDir)
    const dirMap = new Map();
    dirsFromRoot.forEach(d => dirMap.set(path.basename(d), d));
    dirsFromSubfolder.forEach(d => dirMap.set(path.basename(d), d));
    dirsFromSubfolderTmp.forEach(d => dirMap.set(path.basename(d), d));
    dirsFromTmp.forEach(d => dirMap.set(path.basename(d), d)); // tmpDir takes precedence

    const claudeDataDirs = Array.from(dirMap.values());

    // Also check for loose conversations.json
    const looseConversations = path.join(dataDir, 'conversations.json');
    if (fs.existsSync(looseConversations)) {
      claudeDataDirs.push(dataDir);
    }

    if (claudeDataDirs.length === 0) {
      throw new Error('No Claude Enterprise data directories found');
    }

    if (verbose) {
      const fromTmp = dirsFromTmp.length;
      console.log(`   Found ${claudeDataDirs.length} Claude Enterprise data directories${fromTmp > 0 ? ` (${fromTmp} from claude-monthly-data/)` : ''}`);
    }

    // 2. Load user email lookup (check multiple locations)
    let usersPath = path.join(dataDir, 'users.json');
    if (!fs.existsSync(usersPath)) {
      // Try claude-enterprise subfolder
      usersPath = path.join(claudeEnterpriseSubfolder, 'users.json');
    }
    // Also try finding in extracted directories
    if (!fs.existsSync(usersPath) && claudeDataDirs.length > 0) {
      for (const dir of claudeDataDirs) {
        const potentialUsersPath = path.join(dir, 'users.json');
        if (fs.existsSync(potentialUsersPath)) {
          usersPath = potentialUsersPath;
          break;
        }
      }
    }
    const userEmailLookup = loadUserEmailLookup(usersPath);
    if (verbose) {
      console.log(`   Loaded ${userEmailLookup.size} user email mappings`);
    }

    // 3. Process each conversations.json
    const aggregatedToolCounts = new Map();
    const aggregatedIntegrationCounts = new Map();
    const aggregatedUserCounts = new Map();
    const allToolCalls = [];
    let filesProcessed = 0;

    for (const dir of claudeDataDirs) {
      const conversationsPath = path.join(dir, 'conversations.json');
      if (!fs.existsSync(conversationsPath)) continue;

      const { toolCounts, integrationCounts, userCounts, toolCalls } =
        await parseConversationsStream(conversationsPath, verbose);

      // Aggregate tool counts
      for (const [tool, count] of toolCounts) {
        aggregatedToolCounts.set(tool, (aggregatedToolCounts.get(tool) || 0) + count);
      }

      // Aggregate integration counts
      for (const [integration, count] of integrationCounts) {
        aggregatedIntegrationCounts.set(integration, (aggregatedIntegrationCounts.get(integration) || 0) + count);
      }

      // Aggregate user counts
      for (const [userUuid, userData] of userCounts) {
        const existing = aggregatedUserCounts.get(userUuid) || {
          count: 0,
          tools: new Set(),
          integrations: new Set()
        };
        existing.count += userData.count;
        userData.tools.forEach(t => existing.tools.add(t));
        userData.integrations.forEach(i => existing.integrations.add(i));
        aggregatedUserCounts.set(userUuid, existing);
      }

      allToolCalls.push(...toolCalls);
      filesProcessed++;
    }

    // 4. Calculate totals
    const totalToolCalls = Array.from(aggregatedIntegrationCounts.values())
      .reduce((sum, count) => sum + count, 0);

    if (verbose) {
      console.log(`\n   📊 Connectors Summary:`);
      console.log(`   - Total integration calls: ${totalToolCalls.toLocaleString()}`);
      console.log(`   - Unique integrations: ${aggregatedIntegrationCounts.size}`);
      console.log(`   - Unique tools: ${aggregatedToolCounts.size}`);
      console.log(`   - Users with usage: ${aggregatedUserCounts.size}`);
    }

    // 5. Return normalized structure
    return {
      // Raw aggregated data for processors
      byIntegration: aggregatedIntegrationCounts,
      byTool: aggregatedToolCounts,
      byUser: aggregatedUserCounts,
      toolCalls: allToolCalls,
      userEmailLookup,

      // Metrics
      metrics: {
        totalToolCalls,
        uniqueIntegrations: aggregatedIntegrationCounts.size,
        uniqueTools: aggregatedToolCounts.size,
        usersWithUsage: aggregatedUserCounts.size
      },

      // Metadata
      metadata: {
        filesProcessed,
        dataDir,
        ingestedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error(`❌ Error ingesting Connectors data:`, error.message);
    throw error;
  }
}

module.exports = { ingestConnectors };
