You are helping the user refresh the 2026 Annual Plan data with the latest project information. Follow this workflow:

**Step 1: Ask about project updates**
Use the AskUserQuestion tool to ask if they have any project updates:
- New project markdown files in `/data/ai-projects/`
- Updated project specifications (features, phases, dependencies)
- Changes to project priorities or timelines
- New strategic initiatives to add to the portfolio

**Step 2: Guide file updates if needed**
If they have updates:
1. Guide them to add/update project markdown files in `/data/ai-projects/`
   - Each project should have a markdown file with standard sections:
     - Executive Summary
     - Problem Statement
     - Solution Overview
     - Key Features
     - Implementation Phases
     - Dependencies
     - Success Metrics
2. Ensure project files follow naming convention: `OP-XXX - Project_Name.md`
3. Verify `/app/ai-tools-data.json` is up-to-date (run `/refresh-data` if needed)

Wait for them to confirm files are updated before proceeding.

**Step 3: Verify required files exist**
Use the Read or Bash tool to verify:
- `/data/ai-projects/` directory exists with project markdown files
- `/app/ai-tools-data.json` exists (required for dashboard metrics integration)
- At least one project markdown file is present

**Step 4: Run the annual plan generator**
Execute: `npm run refresh-annual-plan`

This comprehensive orchestrator will:
- ✅ **INGEST** - Load all project markdown files from `/data/ai-projects/`
- ✅ **INGEST** - Load dashboard metrics from `ai-tools-data.json`
- ✅ **ANALYZE** - Build dependency graph with data-driven classification
- ✅ **SCORE** - Calculate hybrid priority scores (technical + business)
- ✅ **SCHEDULE** - Generate constraint-based quarterly roadmap
- ✅ **PROGRESS** - Track project progress (3-tier analysis)
- ✅ **AI_ANALYZE** - Analyze temporal context using Claude API (optional)
- ✅ **GENERATE** - Create presentation and portfolio structures
- ✅ **OUTPUT** - Write 5 JSON files to `/app/`:
  - `ai-projects-portfolio.json` - Portfolio table (11 columns)
  - `ai-projects-presentation.json` - 9-slide presentation
  - `ai-projects-schedule.json` - Quarterly roadmap
  - `ai-projects-scores.json` - Detailed scoring breakdown
  - `ai-projects-dependencies.json` - Dependency graph

**Step 5: Confirm success**
After the script completes:
- Verify that all 5 JSON files were generated successfully in `/app/`
- Remind user to refresh their browser to see:
  - Updated AI Projects Portfolio tab
  - Updated 2026 Annual Plan presentation
  - New project scores and priorities
  - Refreshed quarterly roadmap
- Summarize key changes:
  - Number of projects processed
  - Projects by quarter (Q1, Q2, Q3, Q4)
  - Any dependency warnings or conflicts

**Important Notes:**
- The process is idempotent and safe to re-run multiple times
- All outputs are regenerated fresh on every run (not cached)
- AI-driven presentation generation is BETA (set USE_AI_PRESENTER=true to enable)
- Requires ANTHROPIC_API_KEY environment variable for AI features (optional)
- If `ai-tools-data.json` is stale, run `/refresh-data` first

**Advanced Options:**
```bash
# Specify target quarter for scoring
node scripts/generate-annual-plan.js --quarter Q2

# Minimal output (quiet mode)
node scripts/generate-annual-plan.js --quiet

# Custom output directory
node scripts/generate-annual-plan.js --output /custom/path
```

**Integration with Main Refresh:**
The annual plan generator is also integrated into the main data refresh workflow.
Running `npm run refresh` or `/refresh-data` will automatically:
1. Refresh AI tools data
2. Regenerate annual plan (if project files exist)

This ensures all dashboard data stays synchronized.
