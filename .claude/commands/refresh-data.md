You are helping the user refresh the dashboard data with the latest files. Follow this workflow:

**Step 1: Ask about file updates**
Use the AskUserQuestion tool to ask if they have any of these file updates to upload:
- License count changes (license_config.csv)
- Org chart changes (techco_org_chart.json)
- New Claude Enterprise data (claude-ent-data-*.zip)
- New M365 Copilot reports (365*Copilot*.csv)
- New Claude Code reports (claude_code_team_*.csv)
- New GitHub Copilot data (github-copilot-*.ndjson)
- New Claude Enterprise seat assignments (claude_enterprise_seats.json)

**Step 2: Guide file uploads if needed**
If they have updates:
1. Guide them to update /data/license_config.csv with latest license counts (if changed)
2. Guide them to upload new org chart to /data/techco_org_chart.json (if changed)
3. Guide them to upload new data files to /data/ directory

Wait for them to confirm files are uploaded before proceeding.

**Step 3: Verify required files exist**
Use the Read or Bash tool to verify these REQUIRED files are present:
- /data/license_config.csv (REQUIRED - license counts)
- /data/techco_org_chart.json (REQUIRED - for department breakdowns)

Also check that at least one data source exists (Claude Enterprise, M365, Claude Code, or GitHub Copilot).

**Step 4: Run the refresh**
Execute: `./scripts/refresh-data.sh`

This comprehensive script will:
- ✅ Load license configuration from CSV
- ✅ Parse org hierarchy and department mappings
- ✅ Extract Claude Enterprise ZIP files
- ✅ Parse all data sources (M365, Claude Code, GitHub Copilot)
- ✅ Research industry benchmarks (AI-powered)
- ✅ Enrich org chart with Agentic FTE data
- ✅ Calculate all metrics and ROI
- ✅ **Generate 15-24 fresh AI insights** using Claude API
  - Portfolio insights (cross-tool analysis)
  - Per-tool insights (adoption, usage patterns)
  - Opportunity insights (expansion, optimization)
- ✅ Write unified app/ai-tools-data.json

**Step 5: Confirm success**
After the script completes:
- Verify that app/ai-tools-data.json was generated successfully
- Remind user to refresh their browser to see:
  - Updated metrics across all 15 dashboard tabs
  - Fresh AI-generated insights throughout the app
  - Updated department breakdowns
  - New monthly trends
- Summarize key changes if visible in the output (number of insights generated, data sources processed)

**Important Notes:**
- The process is idempotent and safe to re-run multiple times
- All insights are regenerated fresh on every run (not cached)
- Requires ANTHROPIC_API_KEY environment variable for insight generation
