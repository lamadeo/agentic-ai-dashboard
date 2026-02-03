# Contributing to AS-AI-Dashboard

Thank you for your interest in contributing to the AbsenceSoft AI Analytics Dashboard! This guide will help you get started with data updates, code contributions, and deployments.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Data Updates](#data-updates)
3. [Development Workflow](#development-workflow)
4. [Code Contributions](#code-contributions)
5. [Deployment](#deployment)
6. [Testing](#testing)
7. [Documentation](#documentation)
8. [Getting Help](#getting-help)

---

## Quick Start

### Prerequisites

- **Node.js**: 20.x or higher
- **npm**: 10.x or higher
- **Git**: 2.x or higher
- **Anthropic API Key**: For AI insights generation (optional but recommended)
- **Claude Code**: Recommended CLI tool for efficient development work ([Installation Guide](https://docs.anthropic.com/claude/docs/claude-code))

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/absencesoft/as-ai-dashboard.git
cd as-ai-dashboard

# Install dependencies
npm install

# Create environment file from template
# IMPORTANT: .env contains personal API keys and is NOT uploaded to git
cp .env.example .env

# Edit .env and add your personal API keys
# Required for AI insights generation:
# ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx
# Optional for Slack integration:
# SLACK_BOT_TOKEN=xoxb-xxxxxxxxxxxxxxxxxxxxx

# Start development server
npm run dev
```

**Important Notes**:
- **`.env` is git-ignored**: Your personal API keys in `.env` will NOT be uploaded to the repository
- **`.env.example` is the template**: This file is tracked in git and shows the required configuration structure
- **API keys are personal**: Do not share your `.env` file or commit it to git

Open [http://localhost:3001](http://localhost:3001) in your browser.

### Using Claude Code (Recommended)

For efficient development work, we recommend using **Claude Code**, an AI-powered CLI tool that helps with code development, documentation, and complex tasks.

**Installation**:
```bash
# Install Claude Code globally
npm install -g @anthropic-ai/claude-code

# Verify installation
claude-code --version
```

**Benefits**:
- AI-assisted code development and refactoring
- Automated documentation generation
- Complex task orchestration (data refresh, testing, deployment)
- Session-based context for multi-step workflows
- Access to project-specific instructions in `.claude/` directory

**Getting Started with Claude Code**:
1. Install Claude Code (see above)
2. Navigate to project root: `cd as-ai-dashboard`
3. Start Claude Code session: `claude-code`
4. Claude Code will read `.claude/CLAUDE.md` for project context
5. Ask Claude to help with development tasks

**Example Commands**:
```bash
# Start Claude Code session
claude-code

# In Claude Code, try:
"What's the next todo for this session?"  # Uses SESSION_RESUME.md for context
"Help me update the dashboard data"
"Run the test suite and fix any failures"
"Explain the hybrid premium allocation algorithm"
```

For detailed Claude Code documentation, see: [https://docs.anthropic.com/claude/docs/claude-code](https://docs.anthropic.com/claude/docs/claude-code)

---

## Data Updates

The dashboard displays data generated from raw CSV/JSON files. Here's how to update the data:

### Source Data Location

**Primary source files are stored in SharePoint** for team collaboration. See **[Data Sources Setup Guide](./docs/guides/DATA_SOURCES_SETUP.md)** for:
- SharePoint folder structure and URLs
- How to download files from each admin console
- Step-by-step setup for new contributors
- Monthly refresh checklist

### 1. Collect Raw Data Files

Collect the following data files from their sources (or download from SharePoint):

#### Claude Enterprise Data
**Location**: `/data/claude-monthly-data/`
**Source**: Claude Enterprise Admin Console → Audit Logs
**Format**: ZIP file containing JSON files
**Naming**: `claude-ent-data-YYYY-MM-DD-HH-MM-SS-batch-0000-MonthName_Start_to_End.zip`
**Frequency**: Monthly

**How to collect**:
1. Go to Claude Enterprise Admin Console
2. Navigate to Audit Logs section
3. Select date range (e.g., "Dec 1 to Dec 31")
4. Export as ZIP
5. Download and place in `/data/claude-monthly-data/`
6. Extract ZIP contents in same directory

#### M365 Copilot Data
**Location**: `/data/`
**Source**: Microsoft 365 Admin Center → Copilot Usage Reports
**Format**: CSV files
**Naming**: `Copilot-usage-YYYY-MM-DD.csv`
**Frequency**: Monthly

**How to collect**:
1. Go to Microsoft 365 Admin Center
2. Navigate to Reports → Usage → Microsoft 365 Copilot
3. Select month (e.g., "December 2025")
4. Export as CSV
5. Download and place in `/data/`

#### GitHub Copilot Data
**Location**: `/data/`
**Source**: GitHub organization settings → Copilot usage
**Format**: NDJSON file
**Naming**: `github-copilot-usage-data.ndjson`
**Frequency**: Monthly (cumulative export)

**How to collect**:
1. Go to GitHub organization settings
2. Navigate to Copilot → Usage
3. Select "All time" date range
4. Export as NDJSON
5. Download and replace `/data/github-copilot-usage-data.ndjson`

#### Claude Code Data
**Location**: `/data/`
**Source**: Claude Code admin dashboard
**Format**: CSV files
**Naming**: `claude-code-usage-YYYY-MM.csv`
**Frequency**: Monthly

**How to collect**:
1. Contact Claude Enterprise admin for export
2. Request usage data for specific month
3. Download CSV and place in `/data/`

#### Claude Enterprise Seats
**Location**: `/data/`
**Source**: Claude Enterprise Admin Console → Members OR `/update-claude-seats` slash command
**Format**: JSON file
**Naming**: `claude_enterprise_seats.json`
**Frequency**: Monthly or when seat changes occur

**How to collect (Recommended: Slash Command)**:
```bash
# Interactive command that handles seat updates with historical tracking
/update-claude-seats
```
The command will:
- Guide you through providing the CSV export from Admin Console
- Parse and validate seat allocations (Premium/Standard/Unassigned)
- Calculate changes from previous snapshot
- Update current seat data
- Add snapshot to license history
- Save raw CSV backup
- Optionally trigger data refresh

**How to collect (Manual Method)**:
1. Go to Claude Enterprise Admin Console
2. Navigate to Members/Users section
3. Export users list as CSV
4. Download file (usually named `absencesoft_users_current.csv`)
5. Run the update command with file path

**Historical Tracking**:
The system maintains:
- **Current data**: `claude_enterprise_seats.json` (latest seat allocations)
- **History**: `claude_enterprise_license_history.json` (all snapshots with changes)
- **Raw backups**: `absencesoft_users_snapshot_YYYY-MM-DD.csv` (original CSVs)

**Snapshot Benefits**:
- Track seat growth over time (Premium vs Standard trends)
- Monitor activation rates (Active vs Pending users)
- Identify seat optimization opportunities (Unassigned seats)
- Calculate historical ROI and adoption trends

**Documentation**:
- Slash Command: `.claude/commands/update-claude-seats.md`
- History file format documented in-file with metadata and keyInsights

#### Organization Chart
**Location**: `/data/`
**Source**: Rippling HRIS system OR `/generate-org-chart` slash command
**Format**: JSON file
**Naming**: `absencesoft_org_chart.json`
**Frequency**: Monthly or when org changes

**How to collect (Method 1: Rippling Export)**:
1. Go to Rippling → Organization Chart
2. Export as PDF or JSON
3. If PDF, use `/generate-org-chart` slash command to convert to JSON
4. If JSON, replace `/data/absencesoft_org_chart.json`

**How to collect (Method 2: Slash Command)**:
```bash
# Interactive command that handles PDF, text, or other formats
/generate-org-chart
```
The command will:
- Guide you through providing org chart data (PDF, text, spreadsheet, etc.)
- Parse and validate the hierarchy
- Generate properly formatted JSON
- Save monthly snapshot automatically
- Compare with previous month if snapshot exists

**Monthly Snapshot Process**:
After updating org chart, save a snapshot for historical tracking:
```bash
# Save monthly snapshot
node scripts/manage-org-chart-snapshot.js save $(date +%Y-%m-%d)

# Compare with previous month
node scripts/manage-org-chart-snapshot.js compare <prev-date> <curr-date>

# List all snapshots
node scripts/manage-org-chart-snapshot.js list
```

**Agentic FTE Enrichment**:
After data refresh, enrich org chart with per-employee agentic FTE:
```bash
node scripts/enrich-org-chart-with-agentic-fte.js
```
This adds AI-augmented capacity metrics to each employee in the org chart.

**Documentation**:
- Snapshot System: `data/org-chart-snapshots/README.md`
- Slash Command: `.claude/commands/generate-org-chart.md`
- Architecture: `docs/architecture/ADR-002-organizational-chart-data-architecture.md`

#### Email Mapping & Department Attribution
**Location**: `scripts/parse-hierarchy.js` (EMAIL_ALIAS_MAP)
**Source**: Interactive workflow mapping Claude Enterprise emails → org chart
**Format**: JavaScript object constant
**Frequency**: One-time setup + updates when new users join

**Purpose**: Maps actual Claude Enterprise emails to generated org chart emails for 100% department attribution.

**Why it's needed**:
- Org chart generates emails from names (e.g., `luis@absencesoft.com`)
- Claude Enterprise uses actual emails from identity provider (e.g., `lamadeo@absencesoft.com`)
- Without mapping, users show as "Unknown" department and are excluded from expansion analysis

**How to collect (Interactive Workflow)**:
```bash
# Interactive workflow (recommended)
/setup-org-data
# Or: node scripts/setup-org-email-mapping.js
```

The workflow will:
1. Load org chart JSON
2. Load Claude Enterprise seats JSON
3. **Auto-match 98% of users** using:
   - Exact email matches
   - Email pattern variants (3 formats)
   - Name similarity matching (Levenshtein distance, 80% threshold)
4. **Interactive resolution** for remaining 2-3% of users:
   - Shows potential matches from org chart
   - Allows manual selection or email entry
   - Option to skip users not in org chart
5. **Generate EMAIL_ALIAS_MAP** code and update `scripts/parse-hierarchy.js`
6. **Validate 100% coverage** before completing
7. **Summary** of results

**Example Auto-Matching Results**:
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

**Example Interactive Resolution**:
```
[1/2] Claude Enterprise User:
   Name: Sarah Thomas
   Email: sfthomas@absencesoft.com

   Potential org chart matches:
   1. Sarah Thomas (98% match)
      Email: sthomas@absencesoft.com
      Dept: Customer Success

   Select match (1-3), S to skip, or enter org chart email manually: 1
   ✅ Matched to: Sarah Thomas
```

**Validation**:
```bash
# Verify 100% coverage
node scripts/validate-coverage.js

📊 Coverage Validation Results:
   Total users:    115
   ✅ Matched:     115
   ❌ Unmatched:   0
   📈 Coverage:    100%

✅ SUCCESS: 100% coverage achieved!
```

**When to run**:
- **Initial setup**: After generating org chart for first time
- **New employees**: When users join and receive Claude Enterprise licenses
- **Name changes**: Marriage, legal name changes
- **Symptoms of issues**:
  - Expansion ROI shows fewer users than expected
  - Users listed as "Unknown" department
  - Department breakdowns missing licensed users

**Architecture**:
- **Core Module**: `scripts/modules/email-mapper.js` (reusable functions)
- **Interactive Script**: `scripts/setup-org-email-mapping.js` (CLI orchestrator)
- **Validation Scripts**: `scripts/validate-coverage.js`, `scripts/check-unmatched-details.js`
- **Modular Design**: Pure functions, DRY principles, testable components

**Documentation**:
- Slash Command: `.claude/commands/setup-org-data.md`
- Data Refresh Guide: `docs/guides/DATA_REFRESH.md`
- Architecture: `docs/architecture/ADR-002-organizational-chart-data-architecture.md` (Email Mapping section)

#### AI Projects & Annual Plan
**Location**: `/data/ai-projects/`
**Source**: Project markdown files (specifications, analyses, summaries)
**Format**: Markdown files (.md)
**Naming**: `OP-XXX - Project_Name.md` (e.g., `OP-000 - Claude_Enterprise_Expansion_Project_Analysis.md`)
**Frequency**: As projects are added or updated

**How to collect**:
1. Create or update project markdown files in `/data/ai-projects/`
2. Each project should include sections:
   - Executive Summary
   - Problem Statement
   - Solution Overview
   - Key Features
   - Implementation Phases
   - Dependencies
   - Success Metrics
   - ROI/Value

**How to refresh (Method 1: Interactive Slash Command)**:
```bash
# Interactive command with guided workflow
/refresh-annual-plan
```
The command will:
- Ask about project file updates
- Guide you through the generation process
- Generate all annual plan artifacts (portfolio, presentation, schedule, scores)
- Integrated automatically with main data refresh

**How to refresh (Method 2: Standalone Script)**:
```bash
# Generate all annual plan files
npm run refresh-annual-plan

# Or with custom options
node scripts/generate-annual-plan.js --quarter Q2 --quiet
```

**What gets generated** (8 files in `/app/`):
- `ai-projects-details.json` - Project details for drill-down views
- `ai-projects-portfolio.json` - Portfolio table (11 columns)
- `ai-projects-presentation.json` - 9-slide presentation for Annual Plan tab
- `ai-projects-schedule.json` - Quarterly roadmap
- `ai-projects-scores.json` - Detailed scoring breakdown
- `ai-projects-dependencies.json` - Dependency graph
- `ai-projects-progress.json` - Progress tracking (3-tier analysis)
- `ai-projects-context.json` - AI context analysis

**Advanced Options**:
```bash
# AI-driven presentation (BETA - requires ANTHROPIC_API_KEY)
USE_AI_PRESENTER=true npm run refresh-annual-plan

# Specify target quarter for scoring
node scripts/generate-annual-plan.js --quarter Q3

# Minimal output (quiet mode)
node scripts/generate-annual-plan.js --quiet
```

**Integration Notes**:
- Annual plan generation is **automatically included** in `npm run refresh` workflow
- If no project files exist in `/data/ai-projects/`, it will be skipped gracefully
- Both project details (for detail views) and full plan (portfolio/presentation) are generated
- All outputs are regenerated fresh on every run (not cached)

**Documentation**:
- Slash Command: `.claude/commands/refresh-annual-plan.md`
- Module Architecture: `scripts/modules/annual-plan-orchestrator.js`

#### License Configuration
**Location**: `/data/`
**Source**: Manual tracking or license admin portals
**Format**: CSV file
**Naming**: `license_config.csv`
**Frequency**: Monthly

**CSV Format**:
```csv
tool,licensed_users,premium_users,standard_users,last_updated
M365 Copilot,251,0,0,2026-01-07
Claude Enterprise,87,13,74,2026-01-07
Claude Code,11,11,0,2026-01-07
GitHub Copilot,46,0,0,2025-12-31
```

**How to update**:
1. Open `/data/license_config.csv` in text editor or Excel
2. Update licensed user counts for each tool
3. Update premium/standard splits if applicable
4. Update last_updated date to today
5. Save file

#### Sentiment Data (Optional - Manual Collection)
**Location**: `/data/`
**Source**: Slack channels
**Format**: JSON file
**Naming**: `ai_tools_feedback_comprehensive_dataset.json`
**Frequency**: Weekly or monthly

**Channels to monitor**:
- `#claude-code-dev`
- `#claude-enterprise`
- `#ai-collab`
- `#absencesoft-thrv`
- `#as-ai-dev`
- `#technology`

**How to collect** (manual):
1. Search Slack channels for mentions of AI tools
2. Copy relevant messages to JSON format (see existing file for structure)
3. Update `/data/ai_tools_feedback_comprehensive_dataset.json`

**Future**: Slack API automation (see `/docs/SLACK_SETUP_CHECKLIST.md`)

### 2. Verify Data Files

Before refreshing, verify all required files are present:

```bash
# Check for required data files
ls -la /data/

# Expected files:
# - license_config.csv
# - absencesoft_org_chart.json
# - github-copilot-usage-data.ndjson
# - claude-code-usage-*.csv
# - Copilot-usage-*.csv (multiple monthly files)
# - claude-monthly-data/ (directory with extracted ZIPs)
```

### 3. Refresh Dashboard Data

Run the data refresh pipeline to generate updated `ai-tools-data.json`:

```bash
# Full data refresh (recommended)
npm run refresh

# Or use bash script directly
./scripts/refresh-data.sh

# Or run individual parsers
node scripts/parse-copilot-data.js
node scripts/parse-project-details.js
```

**What happens during refresh**:
1. **Parse org chart** → Build email → department mappings
2. **Parse license config** → Load current license counts
3. **Parse M365 data** → Extract usage by app, department, user
4. **Parse Claude Enterprise data** → Extract conversations, artifacts, projects
5. **Parse GitHub Copilot data** → Extract lines/user, model preferences
6. **Parse Claude Code data** → Extract lines/user per month
7. **Calculate comparisons** → Productivity/engagement multipliers
8. **Generate AI insights** → 15-24 insights using Claude API (~$0.10 cost)
9. **Write output** → `/app/ai-tools-data.json` (240KB)

**Duration**: 2-5 minutes (depending on AI insights generation)

### 4. Verify Generated Data

```bash
# Check generated file size and timestamp
ls -lh app/ai-tools-data.json

# Expected: ~240KB file with recent timestamp

# Preview first 50 lines
head -n 50 app/ai-tools-data.json

# Should see JSON with:
# - githubCopilot: { activeUsers, linesPerUser, ... }
# - claudeCode: { activeUsers, linesPerUser, ... }
# - m365Copilot: { activeUsers, totalPrompts, ... }
# - claudeEnterprise: { conversationsPerUser, ... }
# - insights: { 15+ AI-generated insights }
```

### 5. Test Updated Dashboard

```bash
# Start dev server
npm run dev

# Open http://localhost:3001 in browser

# Verify:
# - Overview tab shows updated metrics
# - All 11 tabs load without errors
# - Charts display recent data
# - AI insights are relevant
# - No console errors in browser DevTools
```

### 6. Commit Changes

```bash
# Stage generated data file
git add app/ai-tools-data.json

# Stage any updated raw data files
git add data/

# Commit with descriptive message
git commit -m "data: Update dashboard data for [Month YYYY]

- Updated M365 Copilot usage through [Date]
- Updated Claude Enterprise data through [Date]
- Updated GitHub Copilot cumulative data
- Updated org chart as of [Date]
- License counts: M365 (251), Claude Ent (87), Claude Code (11), GitHub (46)
- Generated 18 AI insights
"

# Push to remote
git push origin main
```

---

## Development Workflow

### Branch Strategy

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Or bug fix branch
git checkout -b fix/bug-description

# Or documentation update
git checkout -b docs/update-description
```

**Branch Naming Conventions**:
- `feature/` - New features or enhancements
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or modifications
- `chore/` - Dependency updates, config changes

### Local Development

```bash
# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev

# Build for production (test before deploying)
npm run build

# Start production server locally
npm start
```

**Development Server**:
- URL: http://localhost:3001
- Hot reload: Enabled (changes auto-refresh)
- Console: Check terminal for build errors

**Browser DevTools**:
- Open DevTools (F12 or Cmd+Option+I)
- Check Console tab for errors
- Use React DevTools extension for component debugging

### Code Style

Follow existing patterns:

**React Components**:
```javascript
// Use functional components with hooks
export default function MyComponent({ data }) {
  const [state, setState] = useState(initialValue);

  return (
    <div className="space-y-4">
      {/* Component JSX */}
    </div>
  );
}
```

**Tailwind CSS**:
```javascript
// Use Tailwind utility classes
<div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
  <h2 className="text-xl font-semibold text-gray-900 mb-4">Title</h2>
</div>
```

**Data Parsing Scripts**:
```javascript
// Node.js scripts with clear sections
const fs = require('fs');

// 1. Read input data
const data = JSON.parse(fs.readFileSync('/path/to/data.json', 'utf-8'));

// 2. Transform data
const transformed = data.map(item => ({ ... }));

// 3. Write output
fs.writeFileSync('/path/to/output.json', JSON.stringify(transformed, null, 2));
```

---

## Code Contributions

### Types of Contributions

1. **Bug Fixes**: Fix broken functionality
2. **New Features**: Add new tabs, metrics, or visualizations
3. **Performance Improvements**: Optimize bundle size, load times
4. **Documentation**: Improve guides, add examples
5. **Testing**: Add unit tests, integration tests
6. **Refactoring**: Improve code quality (see ADR-011 for monolith breakup)

### Contribution Process

#### 1. Find or Create an Issue

```bash
# Check existing issues
https://github.com/absencesoft/as-ai-dashboard/issues

# Create new issue if needed
# Describe problem, proposed solution, and impact
```

#### 2. Fork and Clone (External Contributors)

```bash
# Fork repository on GitHub (click "Fork" button)

# Clone your fork
git clone https://github.com/YOUR_USERNAME/as-ai-dashboard.git
cd as-ai-dashboard

# Add upstream remote
git remote add upstream https://github.com/absencesoft/as-ai-dashboard.git
```

#### 3. Create Feature Branch

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

#### 4. Make Changes

```bash
# Edit files
# Test locally: npm run dev

# Stage changes
git add path/to/changed/files

# Commit with descriptive message
git commit -m "feat: Add new metric card to Overview tab

- Add total active users metric card
- Display across-tool aggregation
- Update data pipeline to calculate metric
"
```

**Commit Message Format**:
```
<type>: <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semi-colons, etc.
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests
- `chore`: Updating build tasks, package manager configs, etc.

#### 5. Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name

# Go to GitHub and create Pull Request
# Fill out PR template with:
# - Description of changes
# - Related issue number
# - Testing steps
# - Screenshots (if UI changes)
```

#### 6. Code Review Process

- **Automated Checks**: CI will run build and tests
- **Human Review**: Team member will review code
- **Feedback**: Address requested changes
- **Approval**: Once approved, PR will be merged

### Pull Request Guidelines

**Good PR**:
- ✅ Single focused change
- ✅ Descriptive title and description
- ✅ Tests added/updated
- ✅ Documentation updated
- ✅ No unrelated changes
- ✅ Passes CI checks

**Bad PR**:
- ❌ Multiple unrelated changes
- ❌ No description
- ❌ Breaks existing functionality
- ❌ No tests
- ❌ Massive refactor without plan

---

## Deployment

### Vercel Deployment (Recommended)

#### Initial Setup

1. **Install Vercel CLI** (if deploying via CLI):
```bash
npm install -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Link Project** (first time only):
```bash
vercel link
```

#### Deploy via CLI

```bash
# Deploy to preview (branch deployment)
vercel

# Deploy to production
vercel --prod
```

#### Deploy via GitHub Integration (Recommended)

1. **Connect Repository to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Select "as-ai-dashboard" repository
   - Click "Import"

2. **Configure Project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

3. **Add Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add `ANTHROPIC_API_KEY` (for AI insights generation)
   - Add `SLACK_BOT_TOKEN` (optional, for sentiment collection)

4. **Deploy**:
   - Push to `main` branch → Automatic production deployment
   - Push to feature branch → Automatic preview deployment
   - Preview URL shared in PR comments

#### Environment Variables

Required for production:
- `ANTHROPIC_API_KEY`: For AI insights generation (optional but recommended)

Optional:
- `SLACK_BOT_TOKEN`: For automated sentiment collection
- `SLACK_CHANNEL_*`: Channel IDs for sentiment monitoring

**How to set**:
```bash
# Via Vercel CLI
vercel env add ANTHROPIC_API_KEY

# Or via Vercel Dashboard
# Project Settings → Environment Variables → Add
```

### Manual Deployment (Static Export)

For hosting on S3, Netlify, or custom server:

```bash
# Build production bundle
npm run build

# Export static site
npm run export

# Output directory: /out/
# Upload /out/ contents to your hosting provider
```

---

## CI/CD Pipeline

### Overview

This project uses **automated continuous integration and deployment** to ensure code quality and streamline development:

- **GitHub Actions (CI)**: Runs tests automatically on every PR and push
- **Vercel (CD)**: Creates preview deployments for PRs, production deployments for main

### What Happens on Every Pull Request

When you open a PR, two automated processes run in parallel:

#### 1. GitHub Actions CI (Test Pipeline)
Validates code quality before merge:

```
✅ test (Node 18.x)    - Runs 76 tests in ~2 minutes
✅ test (Node 20.x)    - Runs 76 tests in ~2 minutes
✅ build               - Verifies Next.js build succeeds
✅ lint-check          - Placeholder for future linting
```

**How to monitor**:
- Check your PR page on GitHub
- Look for green ✅ checkmarks next to "test (18.x)", "test (20.x)", "build"
- Click "Details" to see full test output

**If tests fail** ❌:
- CI will block your PR from merging
- Click "Details" to see which test failed
- Fix the issue locally, push new commit
- CI automatically re-runs on new commits

#### 2. Vercel CD (Preview Deployment)
Creates a live preview of your changes:

```
🚀 Preview deployment ready!
   https://as-ai-dashboard-abc123.vercel.app
```

**How it works**:
1. Vercel bot comments on your PR with preview URL
2. Visit URL to see your changes live
3. Validate all tabs work correctly
4. Share URL with reviewers for testing

**What to check on preview**:
- [ ] Dashboard loads without errors
- [ ] Your changes are visible
- [ ] All 13 tabs still functional
- [ ] No console errors (F12 → Console)

### Requirements for Contributors

#### What You Need
1. **GitHub Account** - To create PRs (already have this!)
2. **Tests Must Pass** - PR cannot merge until CI is green
3. **Build Must Succeed** - PR blocked if Next.js build fails

#### What You Don't Need
- ❌ **Vercel Account** - Automatic via GitHub integration
- ❌ **Manual Deployments** - Happens automatically
- ❌ **Special Permissions** - Standard contributor access is enough

### Development Workflow with CI/CD

#### Recommended Workflow

```bash
# 1. Create feature branch
git checkout -b feature/your-feature

# 2. Make changes and test locally
npm test                    # Run tests locally first!
npm run build               # Verify build works
npm run dev                 # Test in browser

# 3. Commit and push
git add .
git commit -m "feat: Your feature description"
git push origin feature/your-feature

# 4. Create PR on GitHub
# - Go to repository
# - Click "New Pull Request"
# - Select your branch
# - Fill out PR description

# 5. Wait for CI/CD (automatic)
# ✅ GitHub Actions runs tests
# ✅ Vercel creates preview deployment

# 6. Review automated feedback
# - Check test results (green ✅ or red ❌)
# - Visit Vercel preview URL
# - Validate your changes work

# 7. Address feedback
# - Fix any failing tests
# - Make requested code changes
# - Push new commits (CI re-runs automatically)

# 8. Merge when ready
# - All checks green ✅
# - Code review approved
# - Click "Merge Pull Request"
```

### Running Tests Locally (Before Pushing)

**Always run tests locally before pushing!** This catches issues early:

```bash
# Run full test suite (same as CI)
npm test

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage

# Build verification (catches build errors)
npm run build
```

**Expected output**:
```
Test Suites: 15 passed, 15 total
Tests:       76 passed, 76 total
Snapshots:   0 total
Time:        1.168 s
Ran all test suites.
```

### Monitoring CI Pipeline

#### Via GitHub Web Interface

1. Go to your PR page
2. Scroll to "Checks" section (bottom of PR)
3. See status of all checks:
   - ⏳ Yellow dot = Running
   - ✅ Green check = Passed
   - ❌ Red X = Failed

#### Via GitHub CLI (Optional)

```bash
# Install GitHub CLI
brew install gh  # macOS
# Or: https://cli.github.com/

# Watch CI runs in real-time
gh pr checks

# View detailed logs
gh run view --log
```

### What Gets Deployed

#### Preview Deployments (PRs)
- **Trigger**: Every PR commit
- **URL**: Unique preview URL per PR
- **Purpose**: Test changes before merging
- **Lifetime**: Active while PR is open
- **Cost**: $0 (included in Vercel free tier)

#### Production Deployments (Main)
- **Trigger**: Every push to `main` branch
- **URL**: https://as-ai-dashboard.vercel.app
- **Purpose**: Live production site
- **Rollback**: Vercel dashboard → Deployments → Promote previous
- **Cost**: $0 (included in Vercel free tier)

### Branch Protection Rules

**Once enabled** (recommended), the `main` branch will require:

- ✅ **Tests must pass** - Cannot merge with failing tests
- ✅ **Build must succeed** - Cannot merge if build fails
- ✅ **Branch must be up-to-date** - Must rebase/merge main first
- ✅ **Code review approved** (optional) - Requires team approval

**What this means for you**:
- PRs are automatically validated before merge
- Prevents broken code from reaching production
- Forces code quality standards

### Troubleshooting CI/CD

#### Problem: Tests Pass Locally but Fail in CI

**Possible causes**:
- Node version mismatch (CI uses 18.x and 20.x)
- Missing dependencies in `package.json`
- Environment-specific code

**Solution**:
```bash
# Test with exact Node version CI uses
nvm use 18    # or nvm use 20
npm ci        # Clean install (same as CI)
npm test

# Check package.json for missing deps
npm ls
```

#### Problem: Build Fails in CI

**Possible causes**:
- Import errors (typos, wrong paths)
- Missing dependencies
- Syntax errors

**Solution**:
```bash
# Run build locally
npm run build

# Check build output for errors
# Fix issues in code
# Push new commit
```

#### Problem: Vercel Preview Not Deploying

**Possible causes**:
- Build failed in Vercel
- GitHub-Vercel integration disconnected

**Solution**:
1. Check Vercel dashboard: https://vercel.com/dashboard
2. Find your deployment in Deployments tab
3. Click deployment → View logs
4. Fix build errors shown in logs

#### Problem: CI Taking Too Long

**Normal duration**:
- test (18.x): ~2 minutes
- test (20.x): ~2 minutes
- build: ~3 minutes
- **Total**: ~8 minutes per PR

**If longer**:
- Check GitHub Actions status: https://www.githubstatus.com/
- Retry workflow (if stuck): Actions tab → Re-run jobs

### Cost Breakdown

| Service | Usage | Free Tier | Current Cost |
|---------|-------|-----------|--------------|
| GitHub Actions | ~160 min/month | 2,000 min | **$0** |
| Vercel | ~70 deploys/month | Unlimited | **$0** |
| **Total** | | | **$0/month** |

No special accounts or paid plans required for contributors!

### Documentation

For detailed CI/CD documentation, see:
- **[CI/CD Setup Guide](docs/guides/CI_CD_SETUP.md)** - Comprehensive guide
- **[Testing Strategy](docs/guides/TESTING_STRATEGY.md)** - Test architecture
- **[GitHub Actions Workflow](.github/workflows/ci.yml)** - CI configuration

---

## Testing

### Manual Testing Checklist

Before submitting PR, test:

- [ ] **Overview Tab**: All KPIs display correctly
- [ ] **All 11 Tabs**: Load without errors
- [ ] **Navigation**: Sidebar navigation works (expand/collapse, dropdowns)
- [ ] **Breadcrumbs**: Display correctly for all tabs
- [ ] **Portfolio Detail Views**: Clickable project names, detail view renders
- [ ] **Charts**: Render without errors, tooltips work
- [ ] **Responsive Design**: Test on mobile/tablet (if UI changes)
- [ ] **Console**: No errors in browser DevTools console
- [ ] **Build**: `npm run build` succeeds

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Adding Tests

Create test files next to components:

```
app/
├─ components/
│  ├─ MetricCard.jsx
│  └─ MetricCard.test.js  # Test file
```

Example test:
```javascript
import { render, screen } from '@testing/library/react';
import MetricCard from './MetricCard';

test('renders metric card with value', () => {
  render(<MetricCard title="Active Users" value={87} />);
  expect(screen.getByText('Active Users')).toBeInTheDocument();
  expect(screen.getByText('87')).toBeInTheDocument();
});
```

---

## Documentation

### When to Update Documentation

Update documentation when you:
- Add new features
- Change existing behavior
- Add new data sources or parsers
- Modify data refresh process
- Update deployment process
- Fix bugs that affect usage

### Documentation Files

- **README.md**: Project overview, quick start
- **CONTRIBUTING.md**: This file (data updates, development, deployment)
- **SESSION_RESUME.md**: Active work, session history
- **ADR-XXX**: Architectural Decision Records (see `/docs/architecture/`)
- **DATA_REFRESH.md**: Detailed data refresh documentation
- **Component README**: Add README.md in component directories

### Architecture Decision Records (ADRs)

When making architectural decisions, document them:

```bash
# Create new ADR
cp docs/architecture/ADR-TEMPLATE.md docs/architecture/ADR-XXX-decision-name.md

# Edit ADR with:
# - Context and problem statement
# - Decision drivers
# - Considered options (with pros/cons)
# - Decision outcome
# - Consequences
```

---

## Getting Help

### Resources

- **Documentation**: `/docs/` directory
- **ADRs**: `/docs/architecture/` for architectural decisions
- **Session History**: `/docs/SESSION_RESUME.md` for recent changes
- **Claude Context**: `/.claude/` for AI assistant context

### Communication Channels

- **GitHub Issues**: https://github.com/absencesoft/as-ai-dashboard/issues
- **Pull Requests**: https://github.com/absencesoft/as-ai-dashboard/pulls
- **Slack** (Internal): `#as-ai-dev` channel
- **Email**: Contact the Agentic AI team

### Common Issues

#### Issue: `npm run build` fails

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

#### Issue: Data refresh fails

**Solution**:
```bash
# Check that all required data files exist
ls -la data/

# Run parsers individually to identify issue
node scripts/parse-hierarchy.js
node scripts/parse-copilot-data.js
```

#### Issue: AI insights not generating

**Solution**:
```bash
# Verify ANTHROPIC_API_KEY is set
echo $ANTHROPIC_API_KEY

# Or check .env file
cat .env | grep ANTHROPIC_API_KEY

# Test API connection
node scripts/test-credentials.js
```

#### Issue: Dashboard shows stale data

**Solution**:
```bash
# Check ai-tools-data.json timestamp
ls -lh app/ai-tools-data.json

# Refresh data
npm run refresh

# Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)
```

---

## Code of Conduct

- **Be respectful**: Treat all contributors with respect
- **Be constructive**: Provide helpful feedback
- **Be collaborative**: Work together to solve problems
- **Be professional**: Maintain professional communication

---

## License

This is an internal AbsenceSoft project. All contributions remain property of AbsenceSoft, Inc.

---

**Thank you for contributing! 🚀**

If you have questions not covered in this guide, please open an issue or reach out to the Agentic AI team.
