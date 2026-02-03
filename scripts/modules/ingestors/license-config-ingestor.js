/**
 * License Configuration Ingestor
 *
 * Ingests license configuration from CSV file.
 *
 * Input:  license_config.csv in /data/
 *         Format: tool,licensed_users,premium_users,standard_users,last_updated,notes
 *
 * Output: Normalized license configuration structure with:
 *         - M365 Copilot license counts
 *         - Claude Enterprise license counts (Premium + Standard breakdown)
 *         - Claude Code license counts
 *         - GitHub Copilot configuration (uses actual active users)
 *
 * Dependencies: None (pure ingestion)
 */

const fs = require('fs');
const path = require('path');

/**
 * Parse a single line from license config CSV
 * @param {string} line - CSV line
 * @param {Object} config - Configuration object to populate
 * @private
 */
function parseLicenseConfigLine(line, config) {
  const parts = line.split(',').map(s => s.trim());
  if (parts.length < 5) return; // Skip incomplete lines

  const [tool, licensedUsers, premiumUsers, standardUsers, lastUpdated] = parts;

  switch(tool) {
    case 'm365_copilot':
      config.m365Copilot = {
        licensedUsers: parseInt(licensedUsers, 10),
        lastUpdated: lastUpdated
      };
      break;
    case 'claude_enterprise':
      config.claudeEnterprise = {
        licensedUsers: parseInt(licensedUsers, 10),
        premiumUsers: parseInt(premiumUsers, 10),
        standardUsers: parseInt(standardUsers, 10),
        lastUpdated: lastUpdated
      };
      break;
    case 'claude_code':
      config.claudeCode = {
        licensedUsers: parseInt(licensedUsers, 10),
        lastUpdated: lastUpdated
      };
      break;
    case 'github_copilot':
      config.githubCopilot = {
        // GitHub Copilot uses actual active users from data
        // No fixed license count
      };
      break;
  }
}

/**
 * Ingest license configuration data
 * @param {Object} options - Configuration options
 * @param {string} options.csvPath - Path to license_config.csv (default: '../../../data/license_config.csv')
 * @param {boolean} options.verbose - Enable detailed logging (default: true)
 * @returns {Promise<Object>} Normalized license configuration structure
 * @throws {Error} If CSV file not found or parsing fails
 */
async function ingestLicenseConfig(options = {}) {
  const {
    csvPath = path.join(__dirname, '../../../data/license_config.csv'),
    verbose = true
  } = options;

  if (verbose) console.log('📊 Ingesting license configuration...\n');

  try {
    // 1. Read CSV file
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.trim().split('\n');

    // 2. Parse lines (skip header and comments)
    const dataLines = lines.slice(1).filter(line => line.trim() && !line.startsWith('#'));

    if (dataLines.length === 0) {
      throw new Error('No license configuration data found in CSV');
    }

    // 3. Build configuration object
    const config = {
      m365Copilot: {},
      claudeEnterprise: {},
      claudeCode: {},
      githubCopilot: {}
    };

    dataLines.forEach(line => parseLicenseConfigLine(line, config));

    // 4. Validate required fields
    if (!config.m365Copilot.licensedUsers) {
      throw new Error('Missing m365_copilot configuration');
    }
    if (!config.claudeEnterprise.licensedUsers) {
      throw new Error('Missing claude_enterprise configuration');
    }
    if (!config.claudeCode.licensedUsers) {
      throw new Error('Missing claude_code configuration');
    }

    // 5. Log summary
    if (verbose) {
      console.log('✅ Loaded license configuration from CSV:');
      console.log(`   M365 Copilot: ${config.m365Copilot.licensedUsers} licenses`);
      console.log(`   Claude Enterprise: ${config.claudeEnterprise.licensedUsers} licenses (${config.claudeEnterprise.premiumUsers} Premium, ${config.claudeEnterprise.standardUsers} Standard)`);
      console.log(`   Claude Code: ${config.claudeCode.licensedUsers} licenses`);
      console.log(`   Last updated: ${config.m365Copilot.lastUpdated}\n`);
    }

    // 6. Return normalized structure
    return {
      // Configuration for each tool
      m365Copilot: config.m365Copilot,
      claudeEnterprise: config.claudeEnterprise,
      claudeCode: config.claudeCode,
      githubCopilot: config.githubCopilot,

      // Metadata
      metadata: {
        csvPath,
        linesProcessed: dataLines.length,
        ingestedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error(`❌ Error ingesting license configuration:`, error.message);
    console.error('   Please ensure /data/license_config.csv exists');
    throw error; // Let orchestrator handle fallback
  }
}

module.exports = { ingestLicenseConfig };
