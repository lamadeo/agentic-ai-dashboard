/**
 * M365 Copilot Data Ingestor
 *
 * Ingests M365 Copilot usage data from CSV files.
 *
 * Input:  CSV files matching pattern in /data/
 *         - Files containing "365" and "CopilotActivityUserDetail"
 *         - 180-day overview files (Last 6 months)
 *
 * Output: Normalized data structure with:
 *         - Deep dive user metrics (180-day analysis)
 *         - App usage statistics
 *         - User activity data
 *
 * Dependencies: parse-hierarchy (for employee filtering)
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
 * Ingest M365 Copilot data
 * @param {Object} options - Configuration options
 * @param {string} options.dataDir - Data directory path (default: '../../../data')
 * @param {boolean} options.verbose - Enable detailed logging (default: true)
 * @returns {Promise<Object>} Normalized M365 Copilot data structure
 * @throws {Error} If required files not found or parsing fails
 */
async function ingestM365Copilot(options = {}) {
  const {
    dataDir = path.join(__dirname, '../../../data'),
    verbose = true
  } = options;

  if (verbose) console.log('\n📊 Parsing M365 Copilot data...\n');

  try {
    // 1. Find all M365 Copilot files (check root and m365-copilot/ subfolder)
    const findM365Files = (dir) => {
      if (!fs.existsSync(dir)) return [];
      return fs.readdirSync(dir)
        .filter(file => file.includes('365') && file.includes('CopilotActivityUserDetail') && file.endsWith('.csv'))
        .map(file => ({ file, dir, fullPath: path.join(dir, file) }));
    };

    const subfolderDir = path.join(dataDir, 'm365-copilot');
    const filesFromRoot = findM365Files(dataDir);
    const filesFromSubfolder = findM365Files(subfolderDir);

    // Combine and dedupe (prefer subfolder if same filename exists in both)
    const fileMap = new Map();
    filesFromRoot.forEach(f => fileMap.set(f.file, f));
    filesFromSubfolder.forEach(f => fileMap.set(f.file, f));

    const m365AllFilesWithPaths = Array.from(fileMap.values()).sort((a, b) => a.file.localeCompare(b.file));
    const m365AllFiles = m365AllFilesWithPaths.map(f => f.file);

    // 2. Find 180-day overview file
    const overviewFilesWithPaths = m365AllFilesWithPaths.filter(f =>
      f.file.includes('Last 6 months') || f.file.includes('180')
    );

    if (overviewFilesWithPaths.length === 0) {
      throw new Error('No 180-day overview file found for M365 Deep Dive');
    }

    // Sort by file modification time to get most recent
    const latestOverview = overviewFilesWithPaths
      .map(f => ({
        ...f,
        mtime: fs.statSync(f.fullPath).mtime
      }))
      .sort((a, b) => b.mtime - a.mtime)[0];

    const latestOverviewFile = latestOverview.file;

    if (verbose) {
      const fromSub = filesFromSubfolder.length;
      console.log(`   Found ${m365AllFiles.length} M365 Copilot file(s)${fromSub > 0 ? ` (${fromSub} from m365-copilot/)` : ''}`);
      console.log(`   Using 180-day overview for Deep Dive: ${latestOverviewFile}`);
    }

    // 3. Load and parse the 180-day overview file
    const overviewFilePath = latestOverview.fullPath;
    const m365DeepDiveUsers = parseCSV(overviewFilePath);

    if (verbose) {
      console.log(`   Total unique M365 users: ${m365DeepDiveUsers.length}`);
    }

    // 4. Return normalized structure
    return {
      // Raw data for processors
      deepDiveUsers: m365DeepDiveUsers,

      // File metadata
      fileInfo: {
        latestOverviewFile,
        allFiles: m365AllFiles
      },

      // Metrics
      metrics: {
        totalUsers: m365DeepDiveUsers.length
      },

      // Metadata
      metadata: {
        filesFound: m365AllFiles.length,
        overviewFile: latestOverviewFile,
        ingestedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error(`❌ Error ingesting M365 Copilot data:`, error.message);
    throw error; // Let orchestrator handle fallback
  }
}

module.exports = { ingestM365Copilot };
