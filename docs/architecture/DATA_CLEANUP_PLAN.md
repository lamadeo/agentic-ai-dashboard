# Data Cleanup Plan

**Created**: January 26, 2026
**Status**: Ready for Implementation
**Estimated Reduction**: 95MB → ~5MB tracked in git

---

## Summary

This plan removes large source export files from the git repository while keeping essential configuration and documentation files. Source exports should be downloaded locally when needed for data refresh.

---

## Files to REMOVE from Git (Stop Tracking)

### 1. M365 Copilot Export CSVs (~500KB total)

```
docs/data/365 Copilot - DeclarativeAgents_Users - Dec 26 2025 - Jan 24 2026.csv
docs/data/365 Copilot - DeclarativeAgents_Users___agents_30_2025-12-31T14-13-50 - Dec_2_to_Dec_31.csv
docs/data/365 Copilot - DeclarativeAgents_Users_7_2026-01-07T21-38-02 - Dec_30_to_Jan_5.csv
docs/data/365 Copilot Usage - November 2025(in).csv
docs/data/365 CopilotActivityUserDetail - Dec 22 2025 - Jan 20 2026 .csv
docs/data/365 CopilotActivityUserDetail - December 30 - January 5 2026.csv
docs/data/365 CopilotActivityUserDetail - Last 6 months prior to Dec 30.csv
docs/data/365 CopilotActivityUserDetail - November 1 - December 1.csv
docs/data/365 CopilotActivityUserDetail - November 28 - December 27.csv
docs/data/365 CopilotActivityUserDetail - October 1 - November 1.csv
docs/data/365 CopilotActivityUserDetail - September 1 to October 1.csv
docs/data/365 CopilotActivityUserDetail - September 7 to December 7.csv
docs/data/365 CopilotActivityUserDetail- Last 6 months prior to Dec 11.csv
docs/data/365 CopilotAgentActivityAgentDetail - November 12 to December 12.csv
```

**Gitignore pattern**: `docs/data/365 *.csv`

### 2. GitHub Copilot Export NDJSONs (~5MB total)

```
docs/data/github-copilot-code-generation-data - Dec 27 2025 - Jan 23 2026.ndjson
docs/data/github-copilot-code-generation-data - December 2 - December 29.ndjson
docs/data/github-copilot-code-generation-data - December 3 - December 30.ndjson
docs/data/github-copilot-code-generation-data - December 30 - January 5.ndjson
docs/data/github-copilot-code-generation-data - November 12 - December 9.ndjson
docs/data/github-copilot-usage-data - December 2 - December 29.ndjson
docs/data/github-copilot-usage-data - December 3 - December 30.ndjson
docs/data/github-copilot-usage-data - November 12 - December 9.ndjson
```

**Gitignore pattern**: `docs/data/github-copilot-*.ndjson`

### 3. Claude Code Export CSVs (~3KB total)

```
docs/data/claude_code_team_2025_11_01_to_2025_11_30.csv
docs/data/claude_code_team_2025_12_01_to_2025_12_31.csv
docs/data/claude_code_team_2026_01_01_to_2026_01_31.csv
```

**Gitignore pattern**: `docs/data/claude_code_team_*.csv`

### 4. ChatGPT/ZScaler Export CSVs (~30KB total)

```
docs/data/ChatGPT ZS October 2025(2025-11-05_16_27_04_SHADOW_IT_R).csv
docs/data/November 2025 - AI All(AI & ML - November 2025).csv
docs/data/October 2025 AI Usage(October All AI & ML).csv
```

**Gitignore pattern**: `docs/data/ChatGPT*.csv`, `docs/data/*AI*.csv`

### 5. Old/Archived Directory (~85MB total)

```
docs/data/old/365 CopilotActivityUserDetail - December 1 to December 7 --- OLD.csv
docs/data/old/Claude Code Usage Report - December 01-31, 2025.pdf
docs/data/old/Claude Code Usage Report - November 01-30, 2025.pdf
docs/data/old/Claude Usage - audit_logs Nov_1_to_Dec_9.csv
docs/data/old/Claude Usage - October 2025.csv
docs/data/old/Claude Usage Analytics Report - Nov 1 to Dec 9 2025.pdf
docs/data/old/Claude Usage Analytics Report - October 2025.pdf
docs/data/old/claude_code_team_2025_12_01_to_2025_12_31 --- OLD.csv
docs/data/old/claude_code_team_2025_12_01_to_2025_12_31.csv
docs/data/old/claude-ent-data-2025-12-17-00-11-38-batch-0000-Dec_1_to_Dec_17 ---- OLD.zip
docs/data/old/Org Chart - Org Diagram - Rippling.pdf
```

**Gitignore pattern**: `docs/data/old/`

### 6. Temp Directory

```
docs/data/temp/Claude Enterprise - techco_users.csv
```

**Gitignore pattern**: `docs/data/temp/`

### 7. User Snapshot CSVs (~13KB total)

```
docs/data/techco_users_latest - Jan 7 2026 snapshot.csv
docs/data/techco_users_snapshot_2026-01-22.csv
```

**Gitignore pattern**: `docs/data/techco_users*.csv`

### 8. Intermediate/Generated Data Files (~1.5MB total)

```
docs/data/memories.json
docs/data/projects.json
docs/data/users.json
docs/data/conversations.json (already gitignored)
docs/data/ai_tools_feedback_comprehensive_dataset.json
docs/data/tool-specific-sentiment.json
docs/data/perceived-value.json
```

**Note**: These are intermediate files. Keep `perceived-value.json` as it's used as a fallback.

---

## Files to KEEP in Git

### 1. Configuration Files (Essential)

```
docs/data/license_config.csv                    # License counts, pricing rules
docs/data/license_config_snapshot_2025-12-30.csv  # Historical reference
docs/data/roi_config.json                       # ROI calculation parameters
```

### 2. Organizational Data (Essential)

```
docs/data/techco_org_chart.json            # Current org structure (388KB)
docs/data/claude_enterprise_seats.json          # User seat assignments (19KB)
docs/data/claude_enterprise_seats - December 22.json  # Historical reference
docs/data/claude_enterprise_license_history.json  # License history tracking
```

### 3. Org Chart Snapshots (Historical Reference)

```
docs/data/org-chart-snapshots/techco_org_chart_2025-12-12.json
docs/data/org-chart-snapshots/techco_org_chart_2026-01-21.json
docs/data/org-chart-snapshots/CHANGELOG.md
docs/data/org-chart-snapshots/comparison_2025-12-12_to_2026-01-21.json
docs/data/org-chart-snapshots/README.md
```

### 4. AI Projects Documentation (Project Content)

```
docs/data/ai-projects/*.md                      # Project analysis documents
docs/data/ai-projects/*.pdf                     # PRDs and analysis
docs/data/ai-projects/TechCo Inc_AI_Projects_2026.csv  # Project list
docs/data/ai-projects/TechCo Inc - Financial Reporting*.csv  # Financial data
```

### 5. Fallback Data File

```
docs/data/perceived-value.json                  # Used as fallback in page.jsx
```

---

## Updated .gitignore

Add these patterns to `.gitignore`:

```gitignore
# M365 Copilot exports (download fresh from Microsoft 365 Admin)
docs/data/365 *.csv

# GitHub Copilot exports (download fresh from GitHub Enterprise)
docs/data/github-copilot-*.ndjson

# Claude Code exports (download fresh from Anthropic Admin)
docs/data/claude_code_team_*.csv

# ChatGPT/ZScaler exports
docs/data/ChatGPT*.csv
docs/data/*AI*.csv

# User snapshot exports
docs/data/techco_users*.csv

# Intermediate generated files (regenerated by pipeline)
docs/data/memories.json
docs/data/projects.json
docs/data/users.json
docs/data/ai_tools_feedback_comprehensive_dataset.json
docs/data/tool-specific-sentiment.json

# Historical/temp files
docs/data/old/
docs/data/temp/
```

---

## Implementation Commands

### Step 1: Update .gitignore

```bash
# Add new patterns to .gitignore (see above)
```

### Step 2: Remove Files from Git Tracking (Keep Locally)

```bash
# Remove from git but keep local copies
git rm --cached "docs/data/365 Copilot*.csv"
git rm --cached "docs/data/365 CopilotActivity*.csv"
git rm --cached "docs/data/365 CopilotAgentActivity*.csv"
git rm --cached docs/data/github-copilot-*.ndjson
git rm --cached docs/data/claude_code_team_*.csv
git rm --cached "docs/data/ChatGPT*.csv"
git rm --cached "docs/data/November 2025*.csv"
git rm --cached "docs/data/October 2025*.csv"
git rm --cached docs/data/techco_users*.csv
git rm --cached docs/data/memories.json
git rm --cached docs/data/projects.json
git rm --cached docs/data/users.json
git rm --cached docs/data/ai_tools_feedback_comprehensive_dataset.json
git rm --cached docs/data/tool-specific-sentiment.json
git rm -r --cached docs/data/old/
git rm -r --cached docs/data/temp/
```

### Step 3: Commit Changes

```bash
git add .gitignore
git add docs/architecture/DATA_ARCHITECTURE.md
git add docs/architecture/DATA_CLEANUP_PLAN.md
git commit -m "chore: Remove source export files from git tracking

- Add gitignore patterns for M365, GitHub, Claude exports
- Remove 89 source files from tracking (keep locally)
- Keep config files, org chart, project docs
- Add comprehensive data architecture documentation
- Reduce tracked data from 95MB to ~5MB"
```

---

## Expected Results

### Before Cleanup

| Category | Tracked Files | Size |
|----------|---------------|------|
| M365 Copilot CSVs | 14 | ~500KB |
| GitHub Copilot NDJSONs | 8 | ~5MB |
| Claude Code CSVs | 3 | ~3KB |
| ChatGPT/ZScaler CSVs | 3 | ~30KB |
| Old directory | 11 | ~85MB |
| User snapshots | 2 | ~13KB |
| Intermediate files | 6 | ~1.5MB |
| **Total to Remove** | **47** | **~92MB** |

### After Cleanup

| Category | Tracked Files | Size |
|----------|---------------|------|
| Config files | 4 | ~2KB |
| Org chart + seats | 4 | ~420KB |
| Org snapshots | 5 | ~800KB |
| AI projects | ~25 | ~3MB |
| Fallback data | 1 | ~25KB |
| **Total Remaining** | **~39** | **~4.2MB** |

### Reduction

- **Files**: 89 → 39 (~56% reduction)
- **Size**: 95MB → 4.2MB (~96% reduction)

---

## Developer Workflow After Cleanup

### For Code Changes (Most Common)

No change - just clone and work. Runtime files are in repo.

### For Data Refresh

1. Download latest exports from admin consoles
2. Place in `docs/data/` (gitignored, stays local)
3. Run `npm run refresh`
4. Commit generated `app/*.json` files

### For New Team Members

1. Clone repo (includes runtime data)
2. Dashboard works immediately
3. Only download source exports if you need to refresh data

---

## Rollback Plan

If cleanup causes issues:

```bash
# Revert the commit
git revert <cleanup-commit-hash>

# Or restore specific files from git history
git checkout <commit-before-cleanup> -- docs/data/
```

All files remain in git history and can be restored if needed.
