# Data Refresh Process

**Purpose**: Automated, repeatable process to refresh dashboard data from latest CSV/JSON/ZIP files, including main dashboard metrics AND annual plan data.

**Last Updated**: February 2, 2026

---

## Prerequisites

Before running a data refresh, you need the source data files. See **[Data Sources Setup Guide](./DATA_SOURCES_SETUP.md)** for:
- Where to download source files (SharePoint location)
- How to obtain exports from each admin console
- Local setup instructions for new contributors

---

## 📋 Two-Phase Refresh Process

The dashboard has TWO data refresh processes that must run in order:

1. **Main Dashboard Data** (`npm run refresh`) - Usage metrics, Agentic FTEs, AI insights
2. **Annual Plan Data** (`npm run refresh-annual-plan`) - Project portfolio, progress tracking, presentations

**⚠️ IMPORTANT**: Always refresh main dashboard data FIRST, then annual plan data. The annual plan depends on dashboard metrics for progress tracking.

---

## Quick Start - Main Dashboard Refresh

###  1. Slash Command (Easiest)
```bash
/refresh-data
```
Claude Code slash command that runs the full process automatically.

### 2. NPM Script
```bash
npm run refresh
```

### 3. Direct Script
```bash
./scripts/refresh-data.sh
```

---

## Quick Start - Annual Plan Refresh

**After main dashboard refresh is complete:**

```bash
npm run refresh-annual-plan
```

**With AI-driven dynamic presentation:**
```bash
USE_AI_PRESENTER=true npm run refresh-annual-plan
```

**Complete refresh (both):**
```bash
npm run refresh && npm run refresh-annual-plan
```

---

## What Gets Refreshed

The refresh process regenerates `app/ai-tools-data.json` from:

1. **License Configuration** (`data/license_config.csv`)
   - M365 Copilot license counts
   - Claude Enterprise (Premium + Standard) license counts
   - Claude Code Premium license counts
   - Last updated dates

2. **Claude Enterprise Data** (ZIP files)
   - Pattern: `claude-ent-data-*.zip`
   - Auto-extracted to `data/claude-monthly-data/`

3. **M365 Copilot Data** (CSV files)
   - Pattern: `365*Copilot*.csv`
   - Multiple monthly reports supported

4. **Claude Code Data** (CSV files)
   - Pattern: `claude_code_team_YYYY_MM_DD_to_YYYY_MM_DD.csv`

5. **GitHub Copilot Data** (NDJSON files)
   - `github-copilot-code-generation-data.ndjson`
   - `github-copilot-usage-data.ndjson`

6. **Org Chart** (JSON file)
   - `techco_org_chart.json` (department/role mappings)

7. **Claude Enterprise Seats** (JSON file)
   - `claude_enterprise_seats.json` (Premium/Standard tiers)

8. **AI Insights** (Generated)
   - 15-24 AI-powered insights using Claude API
   - Automatically generated during parse

9. **Connectors/Integrations** (Extracted from conversations.json)
   - MCP integration usage, call counts, user mapping

10. **Projects Sophistication** (Extracted from conversations.json)
    - Project categorization, sophistication scoring

11. **Industry Benchmarks** (Researched via AI)
    - Comparative adoption rates, industry context

12. **Agentic FTE Enrichment** (Calculated)
    - Per-user Agentic FTE scores enriched onto org chart data

---

## File Upload Process

### Step 1: Update Claude Enterprise Seats (If Changed)

If seat assignments have changed (new users, tier changes, departures), update the seats file first. See **[Updating Claude Enterprise Seats](#-updating-claude-enterprise-seats)** below for the full workflow.

### Step 2: Update Org Chart (If Changed)

If the org structure has changed (new hires, departures, reorgs), update the org chart. See **[Updating the Org Chart from Rippling](#-updating-the-org-chart-from-rippling)** below for the full workflow.

### Step 3: Upload New Data Files

Upload to `/data/`:

**Required Files**:
- Latest Claude Enterprise ZIP: `claude-ent-data-*.zip`
- Latest M365 CSV(s): `365 CopilotActivityUserDetail - MonthName YYYY.csv`
- Latest Claude Code CSV: `claude_code_team_YYYY_MM_DD_to_YYYY_MM_DD.csv`
- Latest GitHub NDJSON: `github-copilot-*.ndjson` (both files)

### Step 4: Run Refresh

Run any of the 3 methods above.

---

## 🪪 Updating Claude Enterprise Seats

**Required When:**
- New employees are added to Claude Enterprise
- Seat tiers change (Standard ↔ Premium)
- Employees leave the organization
- Monthly reconciliation of license counts

### Source: Claude Enterprise Admin Console

1. Go to [Claude Enterprise Admin](https://claude.ai/admin) (requires admin access)
2. Navigate to **People** or **Members**
3. Export the user list as CSV

The CSV should contain columns: **Name, Email, Role, Seat Tier, Status**

### Workflow: `/update-claude-seats` (Recommended)

```bash
/update-claude-seats
```

This interactive slash command will:

1. **Gather CSV export** — Prompts you for the Claude Enterprise admin CSV data
2. **Validate format** — Ensures expected columns (Name, Email, Role, Seat Tier, Status)
3. **Parse and calculate** — Extracts Premium/Standard/Unassigned counts and Active/Pending/Inactive status
4. **Compare with history** — Calculates deltas against previous snapshot in `claude_enterprise_license_history.json`
5. **Update `claude_enterprise_seats.json`** — Writes current seat assignments
6. **Update `license_config.csv`** — Updates license counts for backward compatibility
7. **Save to history** — Appends snapshot to `claude_enterprise_license_history.json` with change tracking
8. **Archive raw CSV** — Saves original to `data/techco_users_snapshot_YYYY-MM-DD.csv`
9. **Optional: Run data refresh** — Triggers `npm run refresh`

### Alternative: `parse-claude-seats.js`

For parsing raw text copied from the admin console (when CSV export isn't available):

```bash
# 1. Copy user list from admin console to a temp file
#    Format: 5 lines per user (Name, Email, Role, Seat Tier, Status)
# 2. Run the parser
node scripts/parse-claude-seats.js
```

This writes to `data/claude_enterprise_seats.json` with metadata, statistics, and user list.

### Files Updated

| File | Purpose |
|------|---------|
| `data/claude_enterprise_seats.json` | Current seat assignments (used by pipeline) |
| `data/license_config.csv` | License counts (used by pipeline) |
| `data/claude_enterprise_license_history.json` | Historical snapshots with deltas |
| `data/techco_users_snapshot_YYYY-MM-DD.csv` | Raw backup of admin export |

### After Updating Seats

If new users were added or emails changed, you should also run the email mapping workflow to maintain 100% department coverage:

```bash
/setup-org-data
```

See **[Org Data Setup & Email Mapping](#-org-data-setup--email-mapping-one-time-setup--updates)** below.

---

## 🏢 Updating the Org Chart from Rippling

**Required When:**
- New hires join the organization
- Employees leave
- Organizational restructuring (reorgs, title changes, reporting changes)
- Quarterly or monthly org chart reconciliation

### Source: Rippling HR System

1. Log into [Rippling](https://app.rippling.com)
2. Navigate to the **Org Chart** view
3. Export as **PDF** (this is the only export format Rippling supports for the full hierarchy)
4. Save the PDF locally

### Workflow: `/generate-org-chart` (Recommended)

```bash
/generate-org-chart
```

This interactive slash command will:

1. **Gather input** — Asks for the data source (PDF file path, pasted text, or other format)
2. **Parse hierarchy** — Extracts employees, titles, and reporting relationships from the input
3. **Build JSON structure** — Generates the org chart schema with:
   - Unique kebab-case IDs for each employee
   - Name, title, direct report count, total team size
   - Recursive `reports` arrays for the full hierarchy
4. **Validate structure** — Checks JSON syntax, unique IDs, required fields, no circular references
5. **⚠️ Verify reporting relationships** — Presents top 3 hierarchy levels for your review
   - This is critical: PDF visual proximity does NOT always mean a reporting relationship
   - Catches ~90% of structural errors before saving
6. **Write output** — Saves to `data/techco_org_chart.json`
7. **Optional: Save snapshot** — Archives to `data/org-chart-snapshots/techco_org_chart_YYYY-MM-DD.json`
8. **Optional: Compare** — Generates change report against previous snapshot

### Input Formats Supported

The `/generate-org-chart` command accepts multiple input formats:

| Format | Best For |
|--------|----------|
| **PDF file** | Rippling org chart export (primary use case) |
| **Indented text** | Manually typed or pasted hierarchy |
| **Table/spreadsheet** | HR system CSV/Excel exports |
| **Existing JSON** | Modifying a previous org chart |

### Output Schema

```json
{
  "organization": {
    "name": "TechCo Inc",
    "totalEmployees": 258,
    "lastUpdated": "2026-01-21",
    "ceo": {
      "id": "first-last",
      "name": "First Last",
      "title": "CEO",
      "directReports": 8,
      "totalTeamSize": 258,
      "reports": [...]
    }
  }
}
```

### Managing Org Chart Snapshots

Track org chart changes over time using the snapshot management script:

```bash
# Save current org chart as a dated snapshot
node scripts/manage-org-chart-snapshot.js save 2026-02-01

# List all available snapshots
node scripts/manage-org-chart-snapshot.js list

# Compare two snapshots (shows added/removed employees, title changes, reorg moves)
node scripts/manage-org-chart-snapshot.js compare 2026-01-21 2026-02-01

# Show latest snapshot info
node scripts/manage-org-chart-snapshot.js latest
```

The comparison report shows:
- Added and removed employees
- Title changes
- Reporting relationship changes
- Growth metrics and contingent worker tracking

Output is saved to `data/org-chart-snapshots/comparison_<old>_to_<new>.json`.

### After Updating the Org Chart

After generating a new org chart, you **must** re-run the email mapping workflow to ensure all employees are properly matched to their Claude Enterprise accounts:

```bash
/setup-org-data
```

Then run the data refresh to propagate the new department mappings:

```bash
npm run refresh
```

---

## 📧 Org Data Setup & Email Mapping (One-Time Setup + Updates)

**Required When:**
- Setting up the dashboard for the first time
- Adding new employees to Claude Enterprise
- Org chart structure changes
- Email mismatches causing "Unknown" departments (unmatched users)

### Why Email Mapping Matters

The org chart generates emails from names (e.g., `luis@techco.com`) but Claude Enterprise uses actual emails from your identity provider (e.g., `lamadeo@techco.com`). Without proper mapping, users won't match to departments and will be excluded from expansion analysis.

**Symptoms of mapping issues:**
- Claude Expansion ROI showing fewer users than expected
- Users listed as "Unknown" department
- Department breakdowns missing licensed users
- Inaccurate seat allocation recommendations

### Email Mapping Workflow

Use the `/setup-org-data` slash command to run the interactive workflow:

```bash
/setup-org-data
```

**Or run manually:**
```bash
node scripts/setup-org-email-mapping.js
```

**The workflow will:**

1. **Load org chart** - Reads `data/techco_org_chart.json`
2. **Load Claude Enterprise users** - Reads `data/claude_enterprise_seats.json`
3. **Auto-match emails** (98% success rate):
   - Exact email matches
   - Email pattern variants (`luis@` vs `lamadeo@`)
   - Name similarity matching (Levenshtein distance, 80% threshold)
4. **Interactive resolution** - Manually match remaining 2-3% of users
5. **Update EMAIL_ALIAS_MAP** - Writes aliases to `scripts/parse-hierarchy.js`
6. **Validate 100% coverage** - Confirms all licensed users are matched
7. **Summary** - Shows results and next steps

**Example Auto-Matching:**
```
📊 Auto-Matching Results:
   Total users:        115
   ✅ Auto-matched:    113 (98%)
   ⚠️  Needs resolution: 2

   Matching methods used:
     • Exact email: 87
     • Email variant: 18
     • Name similarity: 8
```

**Example Interactive Resolution:**
```
[1/2] Claude Enterprise User:
   Name: Sarah Thomas
   Email: sfthomas@techco.com

   Potential org chart matches:
   1. Sarah Thomas (98% match)
      Email: sthomas@techco.com
      Dept: Customer Success

   Select match (1-3), S to skip, or enter org chart email manually: 1
   ✅ Matched to: Sarah Thomas
```

**Result:**
- EMAIL_ALIAS_MAP expanded from 14 → 21+ aliases
- 100% department coverage (0 Unknown users)
- Expansion analysis shows accurate counts

### When to Run Email Mapping

**Initial Setup** (required once):
- After generating org chart for the first time
- Before first data refresh

**Periodic Updates** (as needed):
- When new employees join and receive Claude Enterprise licenses
- When employees change names (marriage, legal name changes)
- When you see "Unknown" departments in expansion data
- After org chart structure changes

**Validation:**
```bash
node scripts/validate-coverage.js
```

Shows:
```
📊 Coverage Validation Results:
   Total users:    115
   ✅ Matched:     115
   ❌ Unmatched:   0
   📈 Coverage:    100%

✅ SUCCESS: 100% coverage achieved!
```

### Modular Architecture

The email mapping system uses modular, reusable components:

**Core Module** (`scripts/modules/email-mapper.js`):
- `matchEmailsByName()` - Auto-matching algorithm
- `calculateNameSimilarity()` - Levenshtein distance
- `generateEmailVariants()` - Pattern generation
- `validateEmailCoverage()` - Coverage validation
- Pure functions, testable, reusable

**Interactive Script** (`scripts/setup-org-email-mapping.js`):
- CLI orchestrator using email-mapper module
- 7-step workflow with validation checkpoints
- Interactive resolution interface
- DRY (Don't Repeat Yourself) principles

**Validation Scripts**:
- `scripts/validate-coverage.js` - Quick coverage check
- `scripts/check-unmatched-details.js` - Diagnostic details

**Benefits:**
- No code duplication
- Follows pipeline architecture patterns
- Single responsibility per module
- Easy to test and maintain

---

## What Happens During Refresh

```
📊 Starting Dashboard Data Refresh
   └─ Reading license configuration...
   └─ Parsing org hierarchy...
   └─ Researching industry benchmarks...
   └─ Parsing GitHub Copilot data...
   └─ Parsing M365 Copilot data...
   └─ Parsing Claude Code data...
   └─ Extracting Claude Enterprise ZIPs...
   └─ Parsing Claude Enterprise data...
   └─ Enriching org chart with Agentic FTE data...
   └─ Calculating metrics...
   └─ Generating AI insights (15-24 insights)...
   └─ Writing app/ai-tools-data.json...
✅ Data refresh complete!

🎯 Next: Refresh browser to see updated dashboard
```

---

## What Happens During Annual Plan Refresh

**Prerequisites**: Main dashboard data must be refreshed first (`app/ai-tools-data.json` must be up-to-date)

```
📊 Starting Annual Plan Generation
   ↓
📥 Phase 1: INGESTION
   └─ Reading project markdown files (data/ai-projects/OP-*.md)
   └─ Loading dashboard metrics (app/ai-tools-data.json)
   └─ Loading financial data (optional)
   ↓
🔍 Phase 2: ANALYSIS
   └─ Building project dependency graph
   └─ Classifying dependencies (data-driven)
   ↓
📊 Phase 3: SCORING
   └─ Calculating hybrid priority scores
   └─ Strategic alignment + Technical readiness
   ↓
📅 Phase 4: SCHEDULING
   └─ Constraint-based quarterly roadmap (Q1-Q4 2026)
   └─ Respecting dependencies and capacity
   ↓
📈 Phase 5: PROGRESS TRACKING (3-Tier System)
   └─ Tier 1: Phase completion markers (✓ COMPLETE in markdown)
   └─ Tier 2: Behavioral signals (dashboard usage metrics)
   └─ Tier 3: GitHub activity (commits, PRs, issues) [Optional]
   ↓
🤖 Phase 6: AI CONTEXT ANALYSIS
   └─ Determining narrative context (NEW_PLAN / PROGRESS_UPDATE / YEAR_END)
   └─ Analyzing temporal position and progress trends
   ↓
🎯 Phase 7: GENERATION
   └─ Portfolio table structure
   └─ Presentation slides (static or AI-driven)
   └─ Progress reports
   ↓
💾 Phase 8: OUTPUT
   └─ Writing 9 JSON files to /app/
✅ Annual plan generation complete!

🎯 Next: Refresh browser to see updated portfolio & presentation
```

### Files Generated by Annual Plan Refresh

Written to `/app/` directory:

1. **ai-projects-portfolio.json** - Portfolio table (11 projects, 11 columns)
2. **ai-projects-presentation.json** - 9-slide static presentation
3. **ai-projects-presentation-dynamic.json** - AI-generated dynamic presentation (if USE_AI_PRESENTER=true)
4. **ai-projects-schedule.json** - Quarterly roadmap (Q1-Q4 2026)
5. **ai-projects-scores.json** - Priority scoring breakdown
6. **ai-projects-dependencies.json** - Project dependency graph
7. **ai-projects-progress.json** - 3-Tier progress tracking results
8. **ai-projects-context.json** - Narrative context (NEW_PLAN/PROGRESS_UPDATE/YEAR_END)
9. **ai-projects-details.json** - Project detail pages

### What Annual Plan READS vs WRITES

**✅ READS (Inputs)**:
- Project markdown files: `data/ai-projects/OP-*.md`
- Dashboard metrics: `app/ai-tools-data.json` (for Tier 2 progress tracking)
- GitHub repositories: Analyzes commits, PRs, issues (for Tier 3 progress)
- Financial data: `data/ai-projects/*Budget*.csv` (optional)

**✅ WRITES (Outputs)**:
- JSON files: 9 files in `/app/` directory (listed above)

**❌ DOES NOT WRITE**:
- Does NOT create or update OP-*.md markdown files
- Does NOT write back to GitHub repositories
- Does NOT modify source data files

**Manual Process Required**:
- You must manually update `data/ai-projects/OP-*.md` files to mark phases complete
- Add `✓ COMPLETE` markers in markdown when work is done
- The system reads these markers but doesn't write them

---

## Troubleshooting

### "License config not found"
- Ensure `/data/license_config.csv` exists
- Check file permissions

### "No Claude Enterprise data found"
- Check for ZIP files matching pattern: `claude-ent-data-*.zip`
- Verify files are in `/data/`

### "Insight generation failed"
- Check `ANTHROPIC_API_KEY` environment variable
- See `.env.example` for setup

### "Parse errors"
- Check CSV file formats match expected structure
- Look for encoding issues (UTF-8 required)

### "Expansion data shows wrong user counts"
- Check for "Unknown" departments in user metrics
- Run `/setup-org-data` to fix email mapping
- Verify 100% coverage with `node scripts/validate-coverage.js`
- Ensure EMAIL_ALIAS_MAP is up-to-date in `scripts/parse-hierarchy.js`

### "Users missing from department breakdowns"
- Symptom: Expansion shows 94 users but you have 115 licenses
- Cause: Email mismatch between org chart and Claude Enterprise seats
- Solution: Run `/setup-org-data` workflow to create EMAIL_ALIAS_MAP
- Validation: Ensure `scripts/validate-coverage.js` shows 100% coverage

---

## Data-Driven Architecture

The parser is **100% data-driven**:

✅ **No hardcoded license counts** - reads from `license_config.csv`
✅ **No hardcoded file paths** - auto-discovers files by pattern (uses `find -L` to follow symlinks and search subfolders)
✅ **No hardcoded metrics** - calculates from actual data
✅ **AI insights regenerated** - fresh insights every refresh

All dashboard tabs automatically update when you re-run the parser.

---

## Idempotent & Repeatable

You can run the refresh **as many times as needed** with the same files:

- ✅ Safe to re-run (doesn't double-count data)
- ✅ Overwrites `app/ai-tools-data.json` cleanly
- ✅ Consistent results from same inputs
- ✅ No manual cleanup needed

---

## Next Steps

After data refresh is working:

**Phase 3**: Convert to dynamic database-backed app
- Real-time data updates
- No manual file uploads
- API endpoints for data ingestion
- Live dashboard (no refresh needed)

**Phase 4**: Slack sentiment integration
- 6 Slack channels monitored
- Continuous feedback analysis
- Real-time insights

---

## For Claude Code Sessions

When starting a new Claude Code session and needing to refresh data:

### Main Dashboard Refresh

**Option 1: Slash Command**
```
/refresh-data
```

**Option 2: Ask Claude**
```
"Please refresh the dashboard data with the latest files in /data/"
```

Claude will:
1. Check for `license_config.csv`
2. Verify required data files exist
3. Run main data refresh pipeline
4. Confirm successful refresh
5. Display summary of changes

### Annual Plan Refresh

**After main dashboard refresh:**
```
"Please refresh the annual plan data"
```

Claude will:
1. Verify `app/ai-tools-data.json` is up-to-date
2. Read project markdown files from `data/ai-projects/`
3. Run 3-tier progress tracking
4. Generate 9 JSON files in `/app/`
5. Confirm successful generation

### Complete Monthly Refresh

**For monthly updates with new data:**
```
"Please run a complete data refresh including both dashboard and annual plan"
```

Claude will execute both phases in correct order:
1. Main dashboard data refresh
2. Annual plan data refresh
3. Verify all outputs
4. Show summary of updates

---

## 📋 Complete Monthly Refresh Checklist

Use this checklist for monthly data updates:

### Phase 0: Update Seats & Org Chart (If Changed)

- [ ] **0.1** Update Claude Enterprise seats (if users added/removed/changed tier):
  - Run `/update-claude-seats` with latest admin console export
  - Verify `data/claude_enterprise_seats.json` and `data/license_config.csv` updated
- [ ] **0.2** Update org chart (if hires, departures, or reorgs):
  - Export PDF from Rippling
  - Run `/generate-org-chart` with the PDF
  - Verify `data/techco_org_chart.json` updated
- [ ] **0.3** Re-run email mapping (if either seats or org chart changed):
  - Run `/setup-org-data`
  - Verify 100% coverage with `node scripts/validate-coverage.js`

### Phase 1: Prepare Data Files

- [ ] **1.1** Upload new Claude Enterprise ZIP to `/data/`
  - Pattern: `claude-ent-data-YYYY-MM-DD-*-MonthName_DD_to_MonthName_DD.zip`
- [ ] **1.2** Upload new M365 Copilot CSVs to `/data/`
  - Activity detail: `365 CopilotActivityUserDetail - MonthName YYYY.csv`
  - Agents (optional): `365 Copilot - DeclarativeAgents*.csv`
- [ ] **1.3** Upload new Claude Code CSV to `/data/`
  - Pattern: `claude_code_team_YYYY_MM_DD_to_YYYY_MM_DD.csv`
- [ ] **1.4** Upload new GitHub Copilot NDJSON files to `/data/`
  - `github-copilot-code-generation-data*.ndjson`
  - `github-copilot-usage-data*.ndjson`

### Phase 2: Refresh Main Dashboard Data

- [ ] **2.1** Run main dashboard refresh:
  ```bash
  npm run refresh
  ```
- [ ] **2.2** Verify successful completion (no errors)
- [ ] **2.3** Check `app/ai-tools-data.json` was updated (file size ~240KB)
- [ ] **2.4** Verify 15-24 AI insights were regenerated

### Phase 3: Update Project Progress (If Applicable)

- [ ] **3.1** Review project status in `data/ai-projects/OP-*.md`
- [ ] **3.2** Mark completed phases with `✓ COMPLETE` in markdown
- [ ] **3.3** Update project metadata if status changed (e.g., "Not Started" → "In Progress")

### Phase 4: Refresh Annual Plan Data

- [ ] **4.1** Run annual plan refresh:
  ```bash
  npm run refresh-annual-plan
  ```
  - Or with AI-driven presentation: `USE_AI_PRESENTER=true npm run refresh-annual-plan`
- [ ] **4.2** Verify successful completion (no errors)
- [ ] **4.3** Check 9 JSON files were updated in `/app/`:
  - `ai-projects-portfolio.json`
  - `ai-projects-presentation.json`
  - `ai-projects-schedule.json`
  - `ai-projects-scores.json`
  - `ai-projects-dependencies.json`
  - `ai-projects-progress.json`
  - `ai-projects-context.json`
  - `ai-projects-details.json`
  - `ai-projects-presentation-dynamic.json` (if using AI presenter)

### Phase 5: Verify & Test

- [ ] **5.1** Start local dev server: `npm run dev`
- [ ] **5.2** Verify Overview tab shows updated metrics
- [ ] **5.3** Check Tool Deep Dive tabs (Claude Enterprise, M365, Claude Code)
- [ ] **5.4** Verify Agentic FTE insights are tool-specific
- [ ] **5.5** Check Portfolio tab shows updated projects
- [ ] **5.6** Review 2026 Annual Plan presentation

### Phase 6: Commit Changes

- [ ] **6.1** Stage all changes:
  ```bash
  git add data/ app/ai-*.json
  ```
- [ ] **6.2** Commit with descriptive message:
  ```bash
  git commit -m "chore: Monthly data refresh - [Month] YYYY"
  ```
- [ ] **6.3** Push to repository:
  ```bash
  git push
  ```

### Quick Command Summary

**Complete refresh (all phases):**
```bash
# 1. Main dashboard
npm run refresh

# 2. Annual plan
npm run refresh-annual-plan

# 3. Test
npm run dev
```

---

## Files & Scripts Overview

### Main Dashboard Data Refresh

```
data/license_config.csv           # License configuration (UPDATE THIS FIRST!)
scripts/refresh-data.sh                # Bash orchestration script
scripts/parse-hierarchy.js             # Org chart & email alias parser (+ EMAIL_ALIAS_MAP)
scripts/parse-copilot-data.js          # Main data aggregation pipeline
scripts/generate-insights.js           # AI-powered insight generation
scripts/research-industry-benchmarks.js # Industry benchmark research (AI-powered)
scripts/enrich-org-chart-with-agentic-fte.js # Agentic FTE enrichment
scripts/transform-comprehensive-data.js # Data transformation
scripts/extract-multi-tool-sentiment.js # Sentiment analysis
scripts/modules/ingestors/             # Modular data ingestors (Claude, M365, GitHub, etc.)
scripts/modules/processors/            # Data processors (adoption scoring, connectors, projects)
scripts/modules/aggregators/           # Dashboard-ready data aggregators
scripts/modules/pipeline-orchestrator.js # Main pipeline orchestrator
.claude/commands/refresh-data.md       # Slash command definition

Claude Enterprise Seat Management:
scripts/parse-claude-seats.js          # Parse admin console text to JSON
.claude/commands/update-claude-seats.md # Slash command definition

Org Chart Management:
scripts/manage-org-chart-snapshot.js   # Save/list/compare org chart snapshots
scripts/compare-org-charts.js          # Detailed change reports between snapshots
.claude/commands/generate-org-chart.md # Slash command definition

Email Mapping (one-time + periodic updates):
scripts/setup-org-email-mapping.js     # Interactive email mapping workflow
scripts/modules/email-mapper.js        # Reusable email matching functions
scripts/validate-coverage.js           # Coverage validation utility
scripts/check-unmatched-details.js     # Diagnostic script
.claude/commands/setup-org-data.md     # Slash command definition

Output:
app/ai-tools-data.json                 # Unified dashboard data (~240KB)
```

### Annual Plan Data Refresh

```
scripts/generate-annual-plan.js        # CLI entry point
scripts/modules/annual-plan-orchestrator.js # Pipeline orchestrator

Ingestors:
scripts/modules/ingestors/project-ingestor.js       # Read OP-*.md files
scripts/modules/ingestors/dashboard-data-ingestor.js # Read metrics

Processors:
scripts/modules/processors/dependency-analyzer.js    # Build dependency graph
scripts/modules/processors/hybrid-scorer.js          # Priority scoring
scripts/modules/processors/constraint-scheduler.js   # Quarterly roadmap
scripts/modules/processors/progress-tracker.js       # 3-tier progress tracking
scripts/modules/processors/ai-context-analyzer.js    # Narrative context

Generators:
scripts/modules/generators/portfolio-generator.js        # Portfolio table
scripts/modules/generators/presentation-generator.js     # Static slides
scripts/modules/generators/ai-presentation-generator.js  # AI-driven slides

Output (9 JSON files in /app/):
ai-projects-portfolio.json              # Portfolio table
ai-projects-presentation.json           # Static presentation
ai-projects-presentation-dynamic.json   # AI-generated presentation
ai-projects-schedule.json               # Quarterly roadmap
ai-projects-scores.json                 # Priority scores
ai-projects-dependencies.json           # Dependency graph
ai-projects-progress.json               # Progress reports
ai-projects-context.json                # Narrative context
ai-projects-details.json                # Project detail pages
```

---

## Summary

### Before Automation
- Manually edit scripts to update license counts
- Remember exact file naming conventions
- Run multiple parser scripts manually
- Hope you didn't forget a step
- No annual plan automation

### After Automation
**Main Dashboard:**
1. Update `license_config.csv` (one CSV file)
2. Upload new data files to `/data/`
3. Run: `npm run refresh`
4. Dashboard auto-updates ✅

**Annual Plan:**
1. Update project markdown files (mark phases complete)
2. Run: `npm run refresh-annual-plan`
3. Portfolio & presentation auto-update ✅

**Complete Monthly Refresh:**
```bash
npm run refresh && npm run refresh-annual-plan
```

**Result**: Fully automated, repeatable, two-phase data refresh process. Main dashboard metrics feed into annual plan progress tracking. All tabs update automatically from generated JSON files.
