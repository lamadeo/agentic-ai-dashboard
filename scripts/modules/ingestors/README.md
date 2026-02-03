# Data Ingestors

**Purpose**: Modular data ingestion components that read and parse raw data files into normalized structures.

## Overview

Ingestors are the first stage of the data pipeline. Each ingestor is responsible for:
1. **Finding files** - Discovering data files by pattern in `/data/`
2. **Parsing files** - Reading and parsing file formats (CSV, NDJSON, JSON)
3. **Deduplicating** - Removing duplicate records if needed
4. **Calculating basic metrics** - User counts, totals, summaries
5. **Returning normalized structure** - Consistent output format for processors

## Design Principles

### Single Responsibility
Each ingestor handles one data source and nothing more. No business logic, no calculations beyond basic metrics needed for validation.

### Pure Functions
Ingestors should be pure - same input always produces same output. No side effects except file I/O.

### Error Handling
Ingestors throw errors for orchestrator to handle. Orchestrator decides fallback strategy.

### Testing
Each ingestor should be independently testable with mock file data.

## Module Template

```javascript
/**
 * [Data Source] Ingestor
 *
 * Ingests [data source] data from [file format] files.
 *
 * Input:  [File format] files matching pattern in /data/
 * Output: Normalized data structure with [key metrics]
 *
 * Dependencies: None (pure ingestion)
 */

const fs = require('fs');
const path = require('path');

/**
 * Ingest [data source] data
 * @param {Object} options - Configuration options
 * @param {string} options.dataDir - Data directory path (default: '../../../data')
 * @param {boolean} options.verbose - Enable detailed logging (default: true)
 * @returns {Promise<Object>} Normalized data structure
 * @throws {Error} If required files not found or parsing fails
 */
async function ingest[DataSource](options = {}) {
  const {
    dataDir = path.join(__dirname, '../../../data'),
    verbose = true
  } = options;

  if (verbose) console.log('📊 Ingesting [Data Source] data...');

  try {
    // 1. Find files
    const files = findFiles(dataDir);
    if (files.length === 0) {
      throw new Error('No [data source] files found');
    }

    // 2. Parse files
    const rawData = parseFiles(files, dataDir);

    // 3. Deduplicate if needed
    const dedupedData = deduplicate(rawData);

    // 4. Calculate basic metrics
    const metrics = calculateMetrics(dedupedData);

    // 5. Return normalized structure
    if (verbose) {
      console.log(`✅ [Data Source]: ${metrics.count} records ingested`);
    }

    return {
      rawData: dedupedData,
      metrics,
      metadata: {
        filesProcessed: files.length,
        recordsIngested: metrics.count,
        ingestedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error(`❌ Error ingesting [Data Source]:`, error.message);
    throw error; // Let orchestrator handle fallback
  }
}

// Helper functions (internal to module)
function findFiles(dataDir) {
  // Implementation
}

function parseFiles(files, dataDir) {
  // Implementation
}

function deduplicate(data) {
  // Implementation
}

function calculateMetrics(data) {
  // Implementation
}

module.exports = { ingest[DataSource] };
```

## Normalized Output Structure

Each ingestor should return an object with this structure:

```javascript
{
  rawData: [...],        // Parsed records (array or map)
  metrics: {             // Basic metrics for validation
    count: number,       // Total records
    activeUsers: number, // If applicable
    // ... other key metrics
  },
  metadata: {            // Ingestion metadata
    filesProcessed: number,
    recordsIngested: number,
    ingestedAt: string   // ISO timestamp
  }
}
```

## Available Ingestors

### 1. GitHub Copilot Ingestor
**File**: `github-copilot-ingestor.js`
**Status**: ✅ Complete (POC)
**Input**: `github-copilot-code-generation-data*.ndjson`, `github-copilot-usage-data*.ndjson`
**Output**: User metrics, model preferences, feature usage

### 2. License Config Ingestor
**File**: `license-config-ingestor.js`
**Status**: 🚧 Planned
**Input**: `license_config.csv`
**Output**: License counts per tool

### 3. Claude Code Ingestor
**File**: `claude-code-ingestor.js`
**Status**: 🚧 Planned
**Input**: `claude_code_team_*.csv`
**Output**: User activity, code generations

### 4. Claude Enterprise Ingestor
**File**: `claude-enterprise-ingestor.js`
**Status**: 🚧 Planned
**Input**: `claude_enterprise_seats.json`, ZIP extracts
**Output**: Seat assignments, activity data

### 5. M365 Copilot Ingestor
**File**: `m365-copilot-ingestor.js`
**Status**: 🚧 Planned
**Input**: `M365_Copilot_*.csv`
**Output**: 180-day analysis, feature adoption

### 6. Org Hierarchy Ingestor
**File**: `org-hierarchy-ingestor.js`
**Status**: 🚧 Planned
**Input**: `techco_org_chart.json`
**Output**: Department mappings, email aliases

## Testing

Each ingestor should have a corresponding test file:

```bash
scripts/modules/ingestors/__tests__/
├── github-copilot-ingestor.test.js
├── license-config-ingestor.test.js
├── claude-code-ingestor.test.js
├── claude-enterprise-ingestor.test.js
├── m365-copilot-ingestor.test.js
└── org-hierarchy-ingestor.test.js
```

Run tests:
```bash
npm test -- ingestors
```

## Usage Example

```javascript
const { ingestGitHubCopilot } = require('./ingestors/github-copilot-ingestor');

// Ingest GitHub Copilot data
const githubData = await ingestGitHubCopilot({
  dataDir: '/path/to/data',
  verbose: true
});

console.log('Active users:', githubData.metrics.activeUsers);
console.log('Model preferences:', githubData.metrics.modelPreferences);
```

## Integration with Pipeline

Ingestors are called by the pipeline orchestrator in Stage 1 (INGEST):

```javascript
// pipeline-orchestrator.js
async function ingestAllData(options) {
  const { verbose } = options;

  if (verbose) console.log('\n🔹 STAGE 1: INGEST\n');

  // Parallel ingestion where possible
  const [githubData, claudeCodeData, m365Data] = await Promise.all([
    ingestGitHubCopilot(options),
    ingestClaudeCode(options),
    ingestM365Copilot(options)
  ]);

  // Sequential for dependencies
  const licenseConfig = await ingestLicenseConfig(options);
  const orgHierarchy = await ingestOrgHierarchy(options);
  const claudeEnterpriseData = await ingestClaudeEnterprise({
    ...options,
    orgHierarchy // Pass for email resolution
  });

  return {
    licenseConfig,
    githubCopilot: githubData,
    claudeCode: claudeCodeData,
    claudeEnterprise: claudeEnterpriseData,
    m365Copilot: m365Data,
    orgHierarchy
  };
}
```

## Reference

- **Documentation**: `/docs/architecture/DATA_PIPELINE_MODULARIZATION.md`
- **Pattern Reference**: `../sentiment-pipeline.js`
- **Original Script**: `../../parse-copilot-data.js`

---

**Last Updated**: January 9, 2026
**Status**: POC phase - GitHub Copilot ingestor complete
