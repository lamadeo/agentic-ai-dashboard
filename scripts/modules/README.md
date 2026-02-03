# Parser Modules

This directory contains modular components extracted from the main parser to improve maintainability and testability.

## 🎯 Goals

The main parser (`parse-copilot-data.js`) has grown to 4,100+ lines. We're refactoring it into focused, single-responsibility modules:

- **Easier to maintain**: Each module handles one domain
- **Easier to test**: Modules can be tested independently
- **Easier to understand**: Clear boundaries and responsibilities
- **Easier to extend**: Add new data sources without growing the monolith

## 📦 Current Modules

### `sentiment-pipeline.js`

**Purpose**: Orchestrates the complete sentiment analysis pipeline

**Responsibilities**:
- Fetch Slack messages (via `parse-slack-sentiment.js`)
- Analyze sentiment with Claude API (via `analyze-sentiment.js`)
- Aggregate metrics and calculate scores (via `aggregate-sentiment.js`)
- Graceful error handling with fallback to static data
- Clean logging and observability

**API**:
```javascript
const { runSentimentPipeline } = require('./modules/sentiment-pipeline');

// Run with defaults (fallback to static data on errors)
const perceivedValue = await runSentimentPipeline();

// Run with custom options
const perceivedValue = await runSentimentPipeline({
  fallbackToStatic: true,   // Use static data if API fails
  skipSlackFetch: false,    // Set true to use cached data
  slackDaysBack: 30,        // Days of history to fetch
  verbose: true,            // Enable detailed logging
  batchSize: 5              // Claude API batch size
});
```

**Returns**:
```javascript
{
  lastUpdated: "2026-01-04T...",
  summary: {
    totalFeedbackAnalyzed: 142,
    sourceBreakdown: { slack: 89, confluence: 32, ... },
    toolMentions: { "Claude Enterprise": 67, ... }
  },
  perceivedValue: {
    "Claude Enterprise": {
      perceivedValueScore: 87,
      avgSentiment: 0.72,
      nps: 64,
      feedbackCount: 67,
      sentimentTrend: [...],
      topThemes: [...],
      representativeQuotes: [...],
      painPoints: [...],
      departmentSentiment: [...]
    },
    // ... other tools
  }
}
```

**Error Handling**:
- If Slack API fails: Falls back to cached data or static JSON
- If Claude API fails: Falls back to static JSON
- If no data available: Returns empty structure (with optional static fallback)
- All errors logged clearly for debugging

**Integration Example**:
```javascript
// In parse-copilot-data.js
const { runSentimentPipeline } = require('./modules/sentiment-pipeline');

// ... parse usage data ...

// Add sentiment analysis
const perceivedValueData = await runSentimentPipeline({
  fallbackToStatic: true,
  verbose: true
});

outputData.perceivedValue = perceivedValueData.perceivedValue;
outputData.summary.sentimentAnalysis = perceivedValueData.summary;
```

## 🏗️ Future Modules (Planned)

As we continue refactoring the parser, these are candidates for extraction:

### `claude-enterprise-parser.js`
- Parse Claude Enterprise ZIP files
- Extract user activity metrics
- Calculate adoption rates

### `claude-code-parser.js`
- Parse Claude Code PDFs
- Extract code generation metrics
- Calculate productivity gains

### `m365-copilot-parser.js`
- Parse M365 Copilot CSV
- Extract Copilot usage data
- Calculate M365 AI agent metrics

### `github-copilot-parser.js`
- Parse GitHub Copilot NDJSON
- Extract code suggestions and acceptances
- Calculate IDE integration metrics

### `roi-calculator.js`
- Calculate ROI for all tools
- Premium vs Standard analysis
- Expansion scenario modeling

### `department-aggregator.js`
- Aggregate metrics by department
- Calculate composite adoption scores
- Generate department heatmaps

## 📐 Module Design Principles

All modules in this directory should follow these principles:

### 1. Single Responsibility
Each module handles one domain or capability. Don't create "utility" or "helpers" modules.

### 2. Clean API
- Export a primary function with clear name (`runSentimentPipeline`, not `process` or `execute`)
- Accept options object for configuration
- Return data in format matching UI/output expectations
- Document with JSDoc comments

### 3. Error Handling
- Never throw unhandled errors (catch and return meaningful error objects)
- Provide graceful degradation (fallbacks, default values)
- Log errors clearly with context

### 4. Testability
- No side effects (don't modify global state)
- Pure functions where possible
- Dependency injection for external services (APIs, file system)
- Can be tested without running full pipeline

### 5. Observability
- Log progress for debugging
- Provide verbose option for detailed logging
- Log timing/performance metrics
- Clear success/error messages

### 6. Independence
- Minimize coupling to main parser
- Can be run standalone for testing
- Own dependencies (require statements at module level)
- Own data paths and configuration

## 🧪 Testing Modules

Each module should be testable independently:

```bash
# Test sentiment pipeline standalone
node -e "require('./modules/sentiment-pipeline').runSentimentPipeline({ verbose: true }).then(console.log)"

# Test with cached data (no API calls)
node -e "require('./modules/sentiment-pipeline').runSentimentPipeline({ skipSlackFetch: true, verbose: true }).then(console.log)"
```

## 📚 Documentation

Each module should have:
- **Header comment** explaining purpose and responsibilities
- **JSDoc** for all exported functions
- **Usage examples** in comments
- **Error scenarios** documented

## 🔄 Refactoring Strategy

To refactor a section of the main parser:

1. **Identify a cohesive domain** (e.g., "parse M365 data", "calculate ROI")
2. **Extract to new module** in this directory
3. **Define clean API** (what data in, what data out)
4. **Add error handling** (graceful degradation)
5. **Update main parser** to import and use the module
6. **Test independently** (module works without full pipeline)
7. **Test integration** (full pipeline still works)
8. **Document** in this README

## 📦 Directory Structure

```
scripts/
├── modules/
│   ├── README.md                    (this file)
│   ├── sentiment-pipeline.js        (orchestrates sentiment analysis)
│   ├── claude-enterprise-parser.js  (future)
│   ├── m365-copilot-parser.js       (future)
│   └── roi-calculator.js            (future)
├── parse-copilot-data.js            (main orchestrator)
├── parse-slack-sentiment.js         (sentiment data source)
├── analyze-sentiment.js             (sentiment analysis)
├── aggregate-sentiment.js           (sentiment aggregation)
└── generate-insights.js             (AI insights generation)
```

## 🎓 Benefits of This Architecture

**Before** (monolithic parser):
- 4,100 lines in one file
- Hard to find specific logic
- Risky to change (might break something else)
- Can't test individual parts
- New features make file even larger

**After** (modular architecture):
- Main parser orchestrates modules (<500 lines goal)
- Each module has clear purpose
- Safe to change (isolated impact)
- Easy to test each module
- New features = new modules (doesn't grow main file)

---

**Last Updated**: January 4, 2026
**Status**: 1 module implemented, 5 planned
