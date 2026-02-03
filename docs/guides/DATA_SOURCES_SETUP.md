# Data Sources Setup Guide

**Last Updated**: January 27, 2026

This guide explains how to obtain and set up the source data files needed to refresh the AI Dashboard.

---

## Overview

The AI Dashboard uses a **batch-processed data pipeline** that transforms raw exports from various admin consoles into the JSON files used by the dashboard. Source files are stored in SharePoint and can be synced locally via OneDrive symlink (recommended) or downloaded manually.

```
SharePoint (Source of Truth)     Local (/data/)              Dashboard (app/*.json)
─────────────────────────────    ──────────────────          ─────────────────────
     Admin Exports           →   OneDrive Symlink (auto)  →   npm run refresh
     (CSV, NDJSON, ZIP)          or Manual Download           (committed to repo)
```

---

## SharePoint Location

**URL**: [AI Dashboard Data Sources](https://techco.sharepoint.com/:f:/r/TechCo Inc%20Shared%20Documents/SPECIAL%20PROJECTS/AI%20and%20Data%20-%20Restricted/AI%20Dashboard%20Data%20Sources?csf=1&web=1&e=MNsiHd)

**Folder**: `AI Dashboard Data Sources`

```
AI Dashboard Data Sources/
├── claude-enterprise/           # Monthly Claude Enterprise exports
├── m365-copilot/                # M365 Copilot usage reports
├── github-copilot/              # GitHub Copilot usage data
├── claude-code/                 # Claude Code team reports
└── config/                      # Configuration files (license counts, etc.)
```

---

## Data Sources & How to Obtain

### 1. Claude Enterprise Exports

**Source**: Claude Enterprise Admin Console
**Frequency**: Monthly
**File Pattern**: `claude-ent-data-YYYY-MM-DD-HH-MM-SS-batch-0000-*.zip`

**Steps to Download**:
1. Go to [Claude Enterprise Admin](https://claude.ai/admin) (requires admin access)
2. Navigate to **Exports** or **Data Export**
3. Select date range (typically last month)
4. Download the ZIP file
5. Upload to SharePoint: `AI Dashboard Data Sources/claude-enterprise/`

**Contents of ZIP**:
- `conversations.json` - All conversations (can be 500MB+)
- `users.json` - User list with UUIDs
- `projects.json` - Project metadata
- `memories.json` - User memories

### 2. M365 Copilot Reports

**Source**: Microsoft 365 Admin Center
**Frequency**: Monthly
**File Pattern**: `365 CopilotActivityUserDetail - *.csv`

**Steps to Download**:
1. Go to [Microsoft 365 Admin Center](https://admin.microsoft.com)
2. Navigate to **Reports** → **Usage** → **Copilot**
3. Select date range
4. Export to CSV
5. Upload to SharePoint: `AI Dashboard Data Sources/m365-copilot/`

### 3. GitHub Copilot Reports

**Source**: GitHub Enterprise Settings
**Frequency**: Monthly
**File Pattern**: `github-copilot-*.ndjson`

**Steps to Download**:
1. Go to GitHub Enterprise → **Settings** → **Copilot** → **Usage**
2. Select date range
3. Download NDJSON export
4. Upload to SharePoint: `AI Dashboard Data Sources/github-copilot/`

### 4. Claude Code Reports

**Source**: Anthropic Admin Console
**Frequency**: Monthly
**File Pattern**: `claude_code_team_YYYY_MM_DD_to_YYYY_MM_DD.csv`

**Steps to Download**:
1. Go to Anthropic Admin Console
2. Navigate to Claude Code team usage
3. Export CSV for the month
4. Upload to SharePoint: `AI Dashboard Data Sources/claude-code/`

---

## Local Setup for Contributors

### First-Time Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/techco/as-ai-dashboard.git
   cd as-ai-dashboard
   npm install
   ```

2. **Set up data folder** (choose one option):

   **Option A: OneDrive Symlink (Recommended)** - See "OneDrive Symlink Setup" section above

   **Option B: Manual Download**:
   - Go to the SharePoint folder
   - Download files from each subfolder
   - Place them in `data/` maintaining the subfolder structure OR flat in root
   - The pipeline supports both structures:
     ```
     data/claude-enterprise/*.zip    OR    data/*.zip
     data/m365-copilot/*.csv         OR    data/365*.csv
     data/github-copilot/*.ndjson    OR    data/github-copilot-*.ndjson
     data/claude-code/*.csv          OR    data/claude_code_team_*.csv
     ```

**Note**: Claude Enterprise ZIP files are **automatically extracted** by the pipeline - no manual unzip required.

### OneDrive Symlink Setup (Recommended)

Instead of manually downloading files, sync the SharePoint folder via OneDrive and create a symlink. This gives you automatic sync whenever files are updated in SharePoint.

**Prerequisites**:
- OneDrive desktop app installed and signed in
- SharePoint folder synced to OneDrive

**Setup Steps**:

1. **Sync SharePoint folder to OneDrive**:
   - In SharePoint, click **Sync** button on the `The Hub - AI Dashboard Data Sources` folder
   - This creates a local copy at:
     - **Mac**: `~/Library/CloudStorage/OneDrive-SharedLibraries-TechCo Inc/The Hub - AI Dashboard Data Sources/`
     - **Windows**: `C:\Users\<username>\OneDrive - Shared Libraries - TechCo Inc\The Hub - AI Dashboard Data Sources\`

2. **Remove the existing data folder** (if exists):
   ```bash
   # From repo root
   rm -rf data
   ```

3. **Create symlink to OneDrive folder**:

   **Mac/Linux**:
   ```bash
   ln -s "$HOME/Library/CloudStorage/OneDrive-SharedLibraries-TechCo Inc/The Hub - AI Dashboard Data Sources" data
   ```

   **Windows (PowerShell as Admin)**:
   ```powershell
   New-Item -ItemType SymbolicLink -Path "data" -Target "$env:USERPROFILE\OneDrive - Shared Libraries - TechCo Inc\The Hub - AI Dashboard Data Sources"
   ```

4. **Verify the symlink**:
   ```bash
   ls -la data/
   # Should show your SharePoint files organized in subfolders
   ```

5. **Set up Git hooks for automatic symlink restoration** (Important!):

   Git will overwrite your symlink with the tracked `data/` folder on checkout/pull. Set up hooks to auto-restore:

   ```bash
   # Create post-checkout hook
   cat << 'EOF' > .git/hooks/post-checkout
   #!/bin/bash
   # Automatically restore data/ symlink after checkout
   SYMLINK_TARGET="$HOME/Library/CloudStorage/OneDrive-SharedLibraries-TechCo Inc/The Hub - AI Dashboard Data Sources"

   # Only restore if the target exists (developer has OneDrive set up)
   if [ -d "$SYMLINK_TARGET" ]; then
     # Case 1: data is a directory (not a symlink) - replace it
     if [ -d "data" ] && [ ! -L "data" ]; then
       rm -rf data
       ln -s "$SYMLINK_TARGET" data
       echo "✓ Restored data/ symlink to OneDrive"
     # Case 2: data doesn't exist at all - create symlink
     elif [ ! -e "data" ] && [ ! -L "data" ]; then
       ln -s "$SYMLINK_TARGET" data
       echo "✓ Created data/ symlink to OneDrive"
     # Case 3: data is a broken symlink - fix it
     elif [ -L "data" ] && [ ! -e "data" ]; then
       rm data
       ln -s "$SYMLINK_TARGET" data
       echo "✓ Fixed broken data/ symlink to OneDrive"
     fi
   fi
   EOF

   # Copy to post-merge (for git pull)
   cp .git/hooks/post-checkout .git/hooks/post-merge

   # Make executable
   chmod +x .git/hooks/post-checkout .git/hooks/post-merge
   ```

   The hook handles three scenarios:
   - **Directory restored by git**: Replaces with symlink
   - **Symlink accidentally deleted**: Creates symlink
   - **Broken symlink**: Fixes to point to correct target

   Now your symlink will be automatically restored after any `git checkout` or `git pull`.

**SharePoint Folder Structure**:
```
The Hub - AI Dashboard Data Sources/
├── claude-enterprise/     # Claude Enterprise ZIP exports
├── m365-copilot/          # M365 Copilot CSV reports
├── github-copilot/        # GitHub Copilot NDJSON files
├── claude-code/           # Claude Code CSV reports
├── zscaler/               # ZScaler/ChatGPT usage data
├── ai-projects/           # Annual Plan project files
├── org-chart-snapshots/   # Historical org chart data
├── license_config.csv     # License counts config
├── techco_org_chart.json  # Current org chart
└── ... other config files
```

**Benefits**:
- Files auto-sync when updated in SharePoint
- No manual download needed
- Multiple contributors stay in sync
- Works offline (syncs when reconnected)
- Git hooks prevent symlink breakage

**Note**: The `data/` symlink itself is not committed, but the pipeline supports both symlink and direct folder structures.

### Running Data Refresh

Once source files are in place:

```bash
# Interactive workflow (recommended)
/refresh-data

# Or direct command
npm run refresh
```

This will:
1. Read source files from `data/`
2. Process through the pipeline (ingestors → processors → aggregators)
3. Generate AI insights (~$0.10 API cost)
4. Write output to `app/*.json`

### Committing Changes

After refresh, commit only the generated files:

```bash
git add app/*.json
git commit -m "chore: Monthly data refresh - [Month Year]"
git push
```

**Note**: Source files in `data/` are gitignored and should NOT be committed.

---

## File Checklist

Before running `npm run refresh`, ensure you have these files. The pipeline checks both root `data/` and subfolders automatically:

| File Pattern | Location(s) | Required | Notes |
|--------------|-------------|----------|-------|
| `claude-ent-data-*.zip` | `data/` or `data/claude-enterprise/` | Yes | Auto-extracted by pipeline |
| `365 CopilotActivityUserDetail*.csv` | `data/` or `data/m365-copilot/` | Yes | Multiple snapshots OK |
| `github-copilot-*.ndjson` | `data/` or `data/github-copilot/` | Optional | Code gen + usage files |
| `claude_code_team_*.csv` | `data/` or `data/claude-code/` | Optional | Monthly team reports |
| `license_config.csv` | `data/` | Yes | License counts config |
| `techco_org_chart.json` | `data/` | Yes | Current org hierarchy |
| `claude_enterprise_seats.json` | `data/` | Yes | User seat assignments |

---

## Troubleshooting

### "File not found" errors during refresh
- Ensure all required files are in `data/`
- Check file naming matches expected patterns
- ZIP files are auto-extracted, but verify the ZIP contains valid data

### Large file memory issues
- The pipeline uses streaming for large files (500MB+)
- Ensure at least 4GB RAM available
- Close other memory-intensive applications

### Stale data after refresh
- Verify you downloaded the latest exports from admin consoles
- Check date ranges in filenames match expected period

---

## Access Requirements

| Data Source | Required Access |
|-------------|-----------------|
| Claude Enterprise | Claude Enterprise Admin role |
| M365 Copilot | Microsoft 365 Admin or Reports Reader |
| GitHub Copilot | GitHub Enterprise Owner or Admin |
| Claude Code | Anthropic Organization Admin |
| SharePoint | Member of AI Dashboard team |

---

## Monthly Refresh Checklist

### If using OneDrive Symlink (Recommended)
- [ ] Download latest Claude Enterprise export (1st week of month)
- [ ] Download latest M365 Copilot report
- [ ] Download latest GitHub Copilot report (if available)
- [ ] Download latest Claude Code report
- [ ] Upload all to SharePoint (auto-syncs to local via OneDrive)
- [ ] Run `npm run refresh`
- [ ] Verify dashboard shows updated data
- [ ] Commit and push `app/*.json` changes
- [ ] Create PR for review

### If manually downloading
- [ ] Download latest exports from admin consoles
- [ ] Upload to SharePoint
- [ ] Download from SharePoint to local `data/`
- [ ] Run `npm run refresh`
- [ ] Verify dashboard shows updated data
- [ ] Commit and push `app/*.json` changes
- [ ] Create PR for review

**Note**: Claude Enterprise ZIP files are auto-extracted by the pipeline - no manual unzip required.

---

## Related Documentation

- [Data Architecture](../architecture/DATA_ARCHITECTURE.md) - Pipeline design and file structure
- [Data Cleanup Plan](../architecture/DATA_CLEANUP_PLAN.md) - What's tracked vs gitignored
- [Data Refresh Guide](./DATA_REFRESH.md) - Detailed refresh process
