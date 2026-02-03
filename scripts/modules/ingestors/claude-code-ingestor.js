/**
 * Claude Code Data Ingestor
 *
 * Ingests Claude Code team usage data from CSV files.
 *
 * Input:  CSV files matching pattern in /data/
 *         - claude_code_team_*.csv
 *
 * Output: Normalized data structure with:
 *         - Combined user activity data
 *         - Code generation metrics per user
 *
 * Dependencies: None (pure ingestion)
 */

const fs = require('fs');
const path = require('path');

/**
 * Parse CSV file with proper handling of quoted values
 * @param {string} filePath - Path to CSV file
 * @returns {Array<Object>} Parsed CSV records
 * @private
 */
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());

  // Parse first line to get headers
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

/**
 * Helper function to parse a single CSV line with quoted values
 * @param {string} line - CSV line
 * @returns {Array<string>} Parsed values
 * @private
 */
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

/**
 * Ingest Claude Code data
 * @param {Object} options - Configuration options
 * @param {string} options.dataDir - Data directory path (default: '../../../data')
 * @param {boolean} options.verbose - Enable detailed logging (default: true)
 * @returns {Promise<Object>} Normalized Claude Code data structure
 * @throws {Error} If required files not found or parsing fails
 */
async function ingestClaudeCode(options = {}) {
  const {
    dataDir = path.join(__dirname, '../../../data'),
    verbose = true
  } = options;

  if (verbose) console.log('📊 Parsing Claude Code data...\n');

  try {
    // 1. Find all Claude Code CSV files (check root and claude-code/ subfolder)
    const findClaudeCodeFiles = (dir) => {
      if (!fs.existsSync(dir)) return [];
      return fs.readdirSync(dir)
        .filter(file => file.startsWith('claude_code_team_') && file.endsWith('.csv'))
        .map(file => ({ file, fullPath: path.join(dir, file) }));
    };

    const subfolderDir = path.join(dataDir, 'claude-code');
    const filesFromRoot = findClaudeCodeFiles(dataDir);
    const filesFromSubfolder = findClaudeCodeFiles(subfolderDir);

    // Combine and dedupe (prefer subfolder if same filename exists in both)
    const fileMap = new Map();
    filesFromRoot.forEach(f => fileMap.set(f.file, f));
    filesFromSubfolder.forEach(f => fileMap.set(f.file, f));

    const claudeCodeFilesWithPaths = Array.from(fileMap.values()).sort((a, b) => a.file.localeCompare(b.file));
    const claudeCodeFiles = claudeCodeFilesWithPaths.map(f => f.file);

    if (verbose) {
      const fromSub = filesFromSubfolder.length;
      console.log(`   Found ${claudeCodeFiles.length} Claude Code report files${fromSub > 0 ? ` (${fromSub} from claude-code/)` : ''}`);
    }

    if (claudeCodeFiles.length === 0) {
      throw new Error('No Claude Code files found');
    }

    // 2. Parse all CSV files and combine
    const allClaudeCodeData = [];
    claudeCodeFilesWithPaths.forEach(({ file, fullPath }) => {
      const data = parseCSV(fullPath);

      if (verbose) {
        console.log(`   Loading: ${file} (${data.length} users)`);
      }

      allClaudeCodeData.push(...data);
    });

    // 3. Return normalized structure
    return {
      // Raw data for processors
      userData: allClaudeCodeData,

      // Metrics
      metrics: {
        totalUsers: allClaudeCodeData.length,
        filesProcessed: claudeCodeFiles.length
      },

      // Metadata
      metadata: {
        filesProcessed: claudeCodeFiles.length,
        fileNames: claudeCodeFiles,
        filePaths: claudeCodeFilesWithPaths, // Full path info for later processing
        recordsIngested: allClaudeCodeData.length,
        ingestedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error(`❌ Error ingesting Claude Code data:`, error.message);
    throw error; // Let orchestrator handle fallback
  }
}

module.exports = { ingestClaudeCode };
