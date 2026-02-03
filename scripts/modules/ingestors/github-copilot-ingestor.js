/**
 * GitHub Copilot Data Ingestor
 *
 * Ingests GitHub Copilot usage and code generation data from NDJSON files.
 *
 * Input:  NDJSON files matching patterns in /data/
 *         - github-copilot-code-generation-data*.ndjson
 *         - github-copilot-usage-data*.ndjson
 *
 * Output: Normalized data structure with:
 *         - User metrics (lines added, model usage, feature usage)
 *         - Model preferences (Claude, GPT, Gemini distribution)
 *         - Feature usage statistics
 *         - Top users leaderboard
 *
 * Dependencies: None (pure ingestion)
 */

const fs = require('fs');
const path = require('path');

/**
 * Parse NDJSON file (newline-delimited JSON)
 * @param {string} filePath - Path to NDJSON file
 * @returns {Array<Object>} Parsed JSON objects
 * @private
 */
function parseNDJSON(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return content
    .split('\n')
    .filter(line => line.trim())
    .map(line => JSON.parse(line));
}

/**
 * Find GitHub Copilot files in data directory (checks root and github-copilot/ subfolder)
 * @param {string} dataDir - Data directory path
 * @returns {Object} Object with codeGenFiles and usageFiles arrays (with full paths)
 * @private
 */
function findGitHubCopilotFiles(dataDir) {
  const findFiles = (dir, pattern) => {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
      .filter(file => file.startsWith(pattern) && file.endsWith('.ndjson'))
      .map(file => ({ file, fullPath: path.join(dir, file) }));
  };

  const subfolderDir = path.join(dataDir, 'github-copilot');

  // Find code generation files
  const codeGenFromRoot = findFiles(dataDir, 'github-copilot-code-generation-data');
  const codeGenFromSub = findFiles(subfolderDir, 'github-copilot-code-generation-data');
  const codeGenMap = new Map();
  codeGenFromRoot.forEach(f => codeGenMap.set(f.file, f));
  codeGenFromSub.forEach(f => codeGenMap.set(f.file, f));
  const codeGenFiles = Array.from(codeGenMap.values()).sort((a, b) => a.file.localeCompare(b.file));

  // Find usage files
  const usageFromRoot = findFiles(dataDir, 'github-copilot-usage-data');
  const usageFromSub = findFiles(subfolderDir, 'github-copilot-usage-data');
  const usageMap = new Map();
  usageFromRoot.forEach(f => usageMap.set(f.file, f));
  usageFromSub.forEach(f => usageMap.set(f.file, f));
  const usageFiles = Array.from(usageMap.values()).sort((a, b) => a.file.localeCompare(b.file));

  return {
    codeGenFiles,
    usageFiles,
    fromSubfolder: codeGenFromSub.length + usageFromSub.length
  };
}

/**
 * Parse and deduplicate code generation files
 * @param {Array<Object>} codeGenFiles - List of code generation file objects with fullPath
 * @param {boolean} verbose - Enable logging
 * @returns {Array<Object>} Deduplicated code generation records
 * @private
 */
function parseCodeGenFiles(codeGenFiles, verbose) {
  const codeGenMap = new Map(); // Key: "user_login|day", Value: entry

  codeGenFiles.forEach(({ file, fullPath }) => {
    const data = parseNDJSON(fullPath);

    if (verbose) {
      console.log(`   Loading: ${file} (${data.length} records)`);
    }

    data.forEach(entry => {
      const key = `${entry.user_login}|${entry.day}`;
      // Keep the first occurrence (could merge if needed in future)
      if (!codeGenMap.has(key)) {
        codeGenMap.set(key, entry);
      }
    });
  });

  return Array.from(codeGenMap.values());
}

/**
 * Parse and deduplicate usage files
 * @param {Array<Object>} usageFiles - List of usage file objects with fullPath
 * @param {boolean} verbose - Enable logging
 * @returns {Array<Object>} Deduplicated usage records
 * @private
 */
function parseUsageFiles(usageFiles, verbose) {
  const usageMap = new Map(); // Key: "user_login|day", Value: entry

  usageFiles.forEach(({ file, fullPath }) => {
    const data = parseNDJSON(fullPath);

    if (verbose) {
      console.log(`   Loading: ${file} (${data.length} records)`);
    }

    data.forEach(entry => {
      const key = `${entry.user_login}|${entry.day}`;
      if (!usageMap.has(key)) {
        usageMap.set(key, entry);
      }
    });
  });

  return Array.from(usageMap.values());
}

/**
 * Calculate per-user metrics from code generation data
 * @param {Array<Object>} codeGenData - Code generation records
 * @returns {Map<string, Object>} Map of username to user metrics
 * @private
 */
function calculateUserMetrics(codeGenData) {
  const userMetrics = new Map();

  codeGenData.forEach(entry => {
    const username = entry.user_login;

    if (!userMetrics.has(username)) {
      userMetrics.set(username, {
        username,
        totalLinesAdded: 0,
        byModel: {},
        byFeature: {}
      });
    }

    const user = userMetrics.get(username);
    user.totalLinesAdded += entry.loc_added_sum || 0;

    // Track lines by model
    if (entry.totals_by_language_model) {
      entry.totals_by_language_model.forEach(item => {
        const model = item.model || 'unknown';
        if (!user.byModel[model]) {
          user.byModel[model] = 0;
        }
        user.byModel[model] += item.loc_added_sum || 0;
      });
    }

    // Track usage by feature
    if (entry.totals_by_feature) {
      entry.totals_by_feature.forEach(item => {
        const feature = item.feature;
        if (!user.byFeature[feature]) {
          user.byFeature[feature] = 0;
        }
        user.byFeature[feature] += item.loc_added_sum || 0;
      });
    }
  });

  return userMetrics;
}

/**
 * Normalize model name to family (Claude, GPT, Gemini, Unknown)
 * @param {string} model - Raw model name
 * @returns {string} Normalized model family
 * @private
 */
function normalizeModelName(model) {
  if (model.includes('claude')) return 'Claude';
  if (model.includes('gpt')) return 'GPT';
  if (model.includes('gemini')) return 'Gemini';
  return 'Unknown';
}

/**
 * Calculate model preferences from user metrics
 * @param {Map<string, Object>} userMetrics - User metrics map
 * @returns {Array<Object>} Model preferences sorted by usage
 * @private
 */
function calculateModelPreferences(userMetrics) {
  // Aggregate model usage across all users
  const modelTotals = {};
  userMetrics.forEach(user => {
    Object.entries(user.byModel).forEach(([model, lines]) => {
      if (!modelTotals[model]) {
        modelTotals[model] = 0;
      }
      modelTotals[model] += lines;
    });
  });

  // Group by model family
  const modelFamilyTotals = {};
  Object.entries(modelTotals).forEach(([model, lines]) => {
    const family = normalizeModelName(model);
    if (!modelFamilyTotals[family]) {
      modelFamilyTotals[family] = 0;
    }
    modelFamilyTotals[family] += lines;
  });

  // Calculate percentages
  const totalLines = Object.values(modelFamilyTotals).reduce((sum, lines) => sum + lines, 0);
  const modelPreferences = Object.entries(modelFamilyTotals).map(([model, lines]) => ({
    model,
    lines,
    percentage: Math.round((lines / totalLines) * 100)
  })).sort((a, b) => b.lines - a.lines);

  return { modelPreferences, totalLines };
}

/**
 * Calculate feature usage statistics
 * @param {Map<string, Object>} userMetrics - User metrics map
 * @returns {Array<Object>} Feature usage sorted by number of users
 * @private
 */
function calculateFeatureUsage(userMetrics) {
  const featureTotals = {};

  userMetrics.forEach(user => {
    Object.entries(user.byFeature).forEach(([feature, lines]) => {
      if (!featureTotals[feature]) {
        featureTotals[feature] = { users: new Set(), lines: 0 };
      }
      featureTotals[feature].users.add(user.username);
      featureTotals[feature].lines += lines;
    });
  });

  const featureUsage = Object.entries(featureTotals).map(([feature, data]) => ({
    feature,
    users: data.users.size,
    lines: data.lines
  })).sort((a, b) => b.users - a.users);

  return featureUsage;
}

/**
 * Get top users by lines of code added
 * @param {Map<string, Object>} userMetrics - User metrics map
 * @param {number} limit - Number of top users to return (default: 10)
 * @returns {Array<Object>} Top users sorted by total lines added
 * @private
 */
function getTopUsers(userMetrics, limit = 10) {
  return Array.from(userMetrics.values())
    .sort((a, b) => b.totalLinesAdded - a.totalLinesAdded)
    .slice(0, limit);
}

/**
 * Ingest GitHub Copilot data
 * @param {Object} options - Configuration options
 * @param {string} options.dataDir - Data directory path (default: '../../../data')
 * @param {boolean} options.verbose - Enable detailed logging (default: true)
 * @returns {Promise<Object>} Normalized GitHub Copilot data structure
 * @throws {Error} If required files not found or parsing fails
 */
async function ingestGitHubCopilot(options = {}) {
  const {
    dataDir = path.join(__dirname, '../../../data'),
    verbose = true
  } = options;

  if (verbose) console.log('📊 Ingesting GitHub Copilot data...\n');

  try {
    // 1. Find files
    const { codeGenFiles, usageFiles, fromSubfolder } = findGitHubCopilotFiles(dataDir);

    if (verbose) {
      const subNote = fromSubfolder > 0 ? ` (${fromSubfolder} from github-copilot/)` : '';
      console.log(`   Found ${codeGenFiles.length} code generation file(s)${subNote}`);
      console.log(`   Found ${usageFiles.length} usage file(s)`);
    }

    if (codeGenFiles.length === 0 && usageFiles.length === 0) {
      throw new Error('No GitHub Copilot files found');
    }

    // 2. Parse and deduplicate files
    const codeGenData = parseCodeGenFiles(codeGenFiles, verbose);
    const usageData = parseUsageFiles(usageFiles, verbose);

    if (verbose) {
      console.log(`   Total unique code generation records: ${codeGenData.length}`);
      console.log(`   Total unique usage records: ${usageData.length}`);
    }

    // 3. Calculate metrics
    const userMetrics = calculateUserMetrics(codeGenData);
    const { modelPreferences, totalLines } = calculateModelPreferences(userMetrics);
    const featureUsage = calculateFeatureUsage(userMetrics);
    const topUsers = getTopUsers(userMetrics, 10);

    // 4. Log summary
    if (verbose) {
      console.log('✅ GitHub Copilot Metrics:');
      console.log(`   - Active users: ${userMetrics.size}`);
      console.log(`   - Total lines generated: ${totalLines.toLocaleString()}`);
      console.log(`   - Lines per user (avg): ${Math.round(totalLines / userMetrics.size).toLocaleString()}`);
      console.log(`\n   Model Preferences:`);
      modelPreferences.forEach(({ model, lines, percentage }) => {
        console.log(`   - ${model}: ${percentage}% (${lines.toLocaleString()} lines)`);
      });
      console.log(''); // Empty line for spacing
    }

    // 5. Return normalized structure
    return {
      // Raw data for processors
      codeGenData,
      usageData,
      userMetrics: Array.from(userMetrics.values()), // Convert Map to Array

      // Calculated metrics
      metrics: {
        activeUsers: userMetrics.size,
        totalLines,
        avgLinesPerUser: Math.round(totalLines / userMetrics.size),
        modelPreferences,
        featureUsage,
        topUsers
      },

      // Metadata
      metadata: {
        filesProcessed: codeGenFiles.length + usageFiles.length,
        codeGenFiles: codeGenFiles.length,
        usageFiles: usageFiles.length,
        recordsIngested: codeGenData.length + usageData.length,
        ingestedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error(`❌ Error ingesting GitHub Copilot data:`, error.message);
    throw error; // Let orchestrator handle fallback
  }
}

module.exports = { ingestGitHubCopilot };
