# Data Pipeline Modularization Plan

**Date**: January 9, 2026
**Status**: Planning / POC Phase
**Priority**: Tier 1 - High Priority

## Executive Summary

Refactor the monolithic `parse-copilot-data.js` (4,191 lines) into a componentized data ingestion and processing pipeline. This modularization will improve maintainability, testability, and extensibility while preparing for future automation and real-time data processing capabilities.

## Current State

### Monolithic Script Analysis

**File**: `scripts/parse-copilot-data.js`
**Size**: 4,191 lines
**Responsibilities**: All data ingestion, processing, and output generation

**Structure Breakdown**:
- **Lines 1-732**: Data ingestion (license config, GitHub Copilot, Claude Code, Claude Enterprise, M365, org chart)
- **Lines 733-2846**: Data processing (productivity calculations, premium allocation, M365 analytics, expansion ROI)
- **Lines 2847-4026**: Business logic (incremental ROI, current state ROI, industry benchmarks, adoption scoring)
- **Lines 4027-4150**: Output generation (tab-specific data structures)
- **Lines 4154-4191**: Orchestration (main execution, AI insights, sentiment analysis, JSON output)

**Pain Points**:
1. **Single point of failure**: One error in any section breaks the entire pipeline
2. **Difficult to test**: Cannot test individual components in isolation
3. **Hard to extend**: Adding new data sources requires modifying large file
4. **No parallelization**: All data sources processed sequentially
5. **Unclear dependencies**: Business logic mixed with data ingestion
6. **Limited reusability**: Functions cannot be used independently

### Success Story: Sentiment Pipeline

The `scripts/modules/sentiment-pipeline.js` module demonstrates excellent modular design:
- **Single responsibility**: Orchestrates sentiment analysis pipeline
- **Clean API**: Simple interface for integration
- **Graceful error handling**: Fallback to static data
- **Independently testable**: Can run and test in isolation
- **Clear logging**: Observable pipeline stages

## Target Architecture

### Directory Structure

```
scripts/
├── modules/
│   ├── pipeline-orchestrator.js       ← Main entry point (replaces parse-copilot-data.js)
│   │
│   ├── ingestors/                     ← Data ingestion modules
│   │   ├── README.md
│   │   ├── license-config-ingestor.js
│   │   ├── github-copilot-ingestor.js
│   │   ├── claude-code-ingestor.js
│   │   ├── claude-enterprise-ingestor.js
│   │   ├── m365-copilot-ingestor.js
│   │   └── org-hierarchy-ingestor.js
│   │
│   ├── processors/                    ← Business logic processors
│   │   ├── README.md
│   │   ├── premium-allocation-processor.js
│   │   ├── productivity-calculator.js
│   │   ├── roi-calculator.js
│   │   ├── expansion-analyzer.js
│   │   └── adoption-scorer.js
│   │
│   ├── aggregators/                   ← Tab data generators
│   │   ├── README.md
│   │   ├── overview-aggregator.js
│   │   ├── adoption-aggregator.js
│   │   ├── productivity-aggregator.js
│   │   ├── code-aggregator.js
│   │   ├── enablement-aggregator.js
│   │   └── expansion-aggregator.js
│   │
│   └── sentiment-pipeline.js          ← Already modularized ✅
│
├── parse-copilot-data.js              ← Thin wrapper (backwards compatibility)
└── refresh-data.sh                    ← Shell script entry point
```

### Pipeline Stages

**STAGE 1: INGEST** - Load raw data from files
- Each data source has its own ingestor module
- Parallel execution where possible
- Graceful error handling with fallbacks
- Returns normalized data structures

**STAGE 2: PROCESS** - Calculate metrics and business logic
- Premium seat allocation algorithm
- Productivity multiplier calculations
- ROI calculations (incremental and current state)
- Expansion opportunity analysis
- Adoption scoring

**STAGE 3: AGGREGATE** - Generate tab-specific data structures
- Overview tab data
- Adoption tab data
- Productivity tab data
- Code tab data
- Enablement tab data
- Expansion tab data

**STAGE 4: ENRICH** - Add AI-generated insights and sentiment
- Generate AI insights using Claude API
- Run sentiment analysis pipeline
- Enrich dashboard data with recommendations

**STAGE 5: OUTPUT** - Write unified JSON
- Validate data structure
- Write to `app/ai-tools-data.json`
- Generate metadata (refresh timestamp, data sources used)

### Module Design Principles

Each module follows these principles:

1. **Single Responsibility**: One clear purpose per module
2. **Clean API**: Simple, documented interface
3. **Error Handling**: Graceful failures with fallbacks
4. **Testability**: Can be tested in isolation
5. **Observability**: Clear logging at appropriate verbosity levels
6. **Dependencies**: Minimal, explicit dependencies

### Example: Ingestor Module Template

```javascript
/**
 * [Data Source] Ingestor
 *
 * Ingests [data source] data from [file format] files.
 *
 * Input:  [File format] files in /data/
 * Output: Normalized data structure with [key metrics]
 *
 * Dependencies: None (pure ingestion)
 */

const fs = require('fs');
const path = require('path');

/**
 * Ingest [data source] data
 * @param {Object} options - Configuration options
 * @param {string} options.dataDir - Data directory path (default: '../data')
 * @param {boolean} options.verbose - Enable detailed logging (default: true)
 * @returns {Promise<Object>} Normalized data structure
 */
async function ingest[DataSource](options = {}) {
  const { dataDir = '../data', verbose = true } = options;

  if (verbose) console.log('📊 Ingesting [Data Source] data...');

  try {
    // Find files
    // Parse files
    // Calculate metrics
    // Return normalized structure

    if (verbose) {
      console.log(`✅ [Data Source]: [key metric summary]`);
    }

    return normalizedData;
  } catch (error) {
    console.error(`❌ Error ingesting [Data Source]:`, error.message);
    throw error; // Orchestrator handles fallback
  }
}

module.exports = { ingest[DataSource] };
```

### Pipeline Orchestrator Interface

```javascript
/**
 * Data Pipeline Orchestrator
 *
 * Orchestrates the complete data ingestion, processing, and aggregation pipeline.
 *
 * @param {Object} options - Pipeline configuration options
 * @param {boolean} options.skipAIInsights - Skip AI insight generation (default: false)
 * @param {boolean} options.skipSentiment - Skip sentiment analysis (default: false)
 * @param {boolean} options.verbose - Enable detailed logging (default: true)
 * @param {string} options.outputPath - Output file path (default: '../app/ai-tools-data.json')
 * @param {Object} options.fallbacks - Fallback data for failed stages (optional)
 * @returns {Promise<Object>} Complete dashboard data structure
 */
async function runDataPipeline(options = {}) {
  // STAGE 1: INGEST
  const rawData = await ingestAllData({ verbose });

  // STAGE 2: PROCESS
  const processedData = await processBusinessLogic(rawData, { verbose });

  // STAGE 3: AGGREGATE
  const dashboardData = await aggregateTabData(processedData, { verbose });

  // STAGE 4: ENRICH
  if (!options.skipAIInsights) {
    dashboardData.insights = await generateAllInsights(dashboardData);
  }
  if (!options.skipSentiment) {
    const perceivedValue = await runSentimentPipeline({ fallbackToStatic: true });
    dashboardData.perceivedValue = perceivedValue.perceivedValue;
  }

  // STAGE 5: OUTPUT
  await writeOutput(dashboardData, options.outputPath, { verbose });

  return dashboardData;
}
```

## Implementation Plan

### Phase 1: GitHub Copilot Ingestor POC (Week 1)

**Goal**: Prove modularization pattern works end-to-end

**Tasks**:
1. Create `scripts/modules/ingestors/` directory
2. Extract GitHub Copilot ingestion logic into `github-copilot-ingestor.js`
3. Write unit tests for ingestor
4. Integrate into main script
5. Verify output unchanged (diff `ai-tools-data.json` before/after)
6. Document learnings and adjust pattern if needed

**Success Criteria**:
- ✅ Ingestor module passes all unit tests
- ✅ Integration produces identical output
- ✅ Code is cleaner and more readable
- ✅ Pattern is ready to replicate

### Phase 2: Extract All Ingestors (Week 2)

**Modules to Create**:
1. `license-config-ingestor.js` - Parse license_config.csv
2. `claude-code-ingestor.js` - Parse Claude Code CSV files
3. `claude-enterprise-ingestor.js` - Parse Claude Enterprise seat assignments
4. `m365-copilot-ingestor.js` - Parse M365 Copilot CSVs (180-day analysis)
5. `org-hierarchy-ingestor.js` - Parse org chart JSON

**Deliverables**:
- 6 tested ingestor modules (including GitHub Copilot from Phase 1)
- Updated main script using all ingestors
- Comprehensive unit test suite
- README.md in ingestors/ directory

### Phase 3: Extract Processors (Week 3)

**Modules to Create**:
1. `premium-allocation-processor.js` - Hybrid Premium seat allocation algorithm
2. `productivity-calculator.js` - Productivity multipliers and time savings
3. `roi-calculator.js` - Incremental and current state ROI
4. `expansion-analyzer.js` - Expansion opportunities and payback periods
5. `adoption-scorer.js` - Department adoption heatmap scoring

**Deliverables**:
- 5 tested processor modules
- Updated main script using all processors
- Comprehensive unit test suite
- README.md in processors/ directory

### Phase 4: Extract Aggregators (Week 4)

**Modules to Create**:
1. `overview-aggregator.js` - Overview tab data structure
2. `adoption-aggregator.js` - Adoption tab data structure
3. `productivity-aggregator.js` - Productivity tab data structure
4. `code-aggregator.js` - Code leaderboard tab data structure
5. `enablement-aggregator.js` - Enablement tab data structure
6. `expansion-aggregator.js` - Expansion tab data structure

**Deliverables**:
- 6 tested aggregator modules
- Updated main script using all aggregators
- Comprehensive unit test suite
- README.md in aggregators/ directory

### Phase 5: Build Orchestrator (Week 5)

**Tasks**:
1. Create `pipeline-orchestrator.js` with clean API
2. Wire up all modules with proper error handling
3. Add CLI options for partial runs (skip stages, use cached data)
4. Update `parse-copilot-data.js` to call orchestrator (backwards compatibility)
5. Add integration tests for full pipeline
6. Update documentation (`docs/guides/DATA_REFRESH.md`)

**Deliverables**:
- Complete modular pipeline
- Backwards-compatible interface
- Integration test suite
- Updated documentation

## Benefits

### 1. Maintainability
- **Smaller files**: 100-300 lines per module vs 4,191 lines
- **Clear responsibilities**: Each module has one job
- **Easier debugging**: Isolate issues to specific modules
- **Code reuse**: Modules can be used independently

### 2. Testability
- **Unit tests**: Test each module in isolation
- **Mock dependencies**: Easy to mock data sources
- **Fast tests**: Run specific module tests without full pipeline
- **Coverage**: Track coverage per module

### 3. Extensibility
- **Add data sources**: Create new ingestor, register in orchestrator
- **Add metrics**: Create new processor, wire into pipeline
- **Add tabs**: Create new aggregator, add to dashboard
- **No regression risk**: New modules don't affect existing ones

### 4. Performance
- **Parallel ingestion**: Ingest independent data sources simultaneously
- **Partial runs**: Skip stages that don't need refresh
- **Caching**: Cache expensive calculations between runs
- **Incremental updates**: Update only changed data sources

### 5. Automation Readiness
- **Scheduled ingestion**: Run specific ingestors on cron schedules
- **Real-time updates**: Stream data into pipeline as it arrives
- **Event-driven**: Trigger processing on data file changes
- **Monitoring**: Track pipeline stage health independently

### 6. Error Resilience
- **Isolated failures**: One ingestor failure doesn't stop pipeline
- **Fallback strategies**: Use cached data when sources unavailable
- **Retry logic**: Retry failed stages with exponential backoff
- **Graceful degradation**: Dashboard works with partial data

## Risk Mitigation

### Risk 1: Data Output Changes
**Mitigation**:
- Compare JSON output before/after each phase
- Automated diff tests in CI/CD
- Manual QA on dashboard after each phase

### Risk 2: Regression Bugs
**Mitigation**:
- Comprehensive unit test suite
- Integration tests for full pipeline
- Keep original script for comparison during transition

### Risk 3: Performance Degradation
**Mitigation**:
- Benchmark each phase
- Profile module overhead
- Optimize bottlenecks before moving forward

### Risk 4: Over-Engineering
**Mitigation**:
- Start with simple POC (GitHub Copilot)
- Validate pattern before replicating
- Keep modules focused and simple

## Success Metrics

### Quantitative
- ✅ All 11 dashboard tabs work identically
- ✅ JSON output diff shows zero changes (excluding metadata)
- ✅ All 76 existing unit tests pass
- ✅ New unit tests cover 80%+ of modularized code
- ✅ Pipeline execution time ≤ current time (ideally faster with parallelization)
- ✅ Average module size < 500 lines

### Qualitative
- ✅ Code is easier to understand and navigate
- ✅ New team members can understand individual modules
- ✅ Adding new data sources is straightforward
- ✅ Debugging issues is faster
- ✅ CI/CD pipeline remains stable

## Next Steps

1. **Review and approve this plan** - Get stakeholder sign-off
2. **Create feature branch** - `feature/modularize-data-pipeline`
3. **Start Phase 1 POC** - Extract GitHub Copilot ingestor
4. **Validate pattern** - Ensure POC meets success criteria
5. **Continue phases 2-5** - Follow implementation plan

## References

- ADR-001: Dashboard Architecture
- ADR-011: Monolith Breakup Strategy
- `scripts/parse-copilot-data.js` - Current monolithic implementation
- `scripts/modules/sentiment-pipeline.js` - Example of good modular design
- `/docs/guides/DATA_REFRESH.md` - Current data refresh documentation

---

**Author**: Luis Amadeo, Chief Agentic Officer, TechCo Inc
**Architect**: Luis Amadeo, Chief Agentic Officer, TechCo Inc
**Last Updated**: January 9, 2026
**Next Review**: After Phase 1 POC completion
