# Utility Scripts

Standalone utility scripts for ad-hoc analysis and debugging. These scripts are **not part of the main data pipeline** but can be useful for quick investigations.

## Available Utilities

### `extract-tool-usage.js`

Standalone CLI tool for extracting MCP tool/integration usage from Claude Enterprise `conversations.json` files.

**Purpose**: Quick ad-hoc analysis of tool usage without running the full data refresh pipeline.

**When to use**:
- Debugging tool usage data before running full pipeline
- Quick analysis of a specific conversations.json file
- Verifying tool extraction logic

**Usage**:
```bash
# Default: processes the December 2025 conversations.json
node scripts/utilities/extract-tool-usage.js

# Custom file path
node scripts/utilities/extract-tool-usage.js /path/to/conversations.json
```

**Output**: Writes `docs/data/tool-usage-summary.json` with:
- Tool usage counts by tool name
- Tool usage counts by integration
- Top 50 users by tool usage
- Summary totals

**Note**: For production data processing, use `npm run refresh` which runs the full pipeline including `connectors-ingestor.js`.

## Relationship to Pipeline Modules

| Utility Script | Pipeline Equivalent | Difference |
|----------------|---------------------|------------|
| `extract-tool-usage.js` | `modules/ingestors/connectors-ingestor.js` | Standalone CLI vs pipeline module |

The pipeline modules in `scripts/modules/` are the canonical implementations used by `npm run refresh`. Utility scripts here are simplified versions for debugging and ad-hoc analysis.
