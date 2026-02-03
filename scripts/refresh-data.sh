#!/bin/bash

# Data Refresh Orchestration Script
# Purpose: Automated, repeatable process to regenerate dashboard data
# Usage: ./scripts/refresh-data.sh

set -e  # Exit on any error

echo ""
echo "📊 Starting Dashboard Data Refresh"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DATA_DIR="$PROJECT_ROOT/data"

# Change to project root
cd "$PROJECT_ROOT"

# Step 1: Verify license configuration exists
echo "📋 Step 1: Verifying license configuration..."
if [ ! -f "$DATA_DIR/license_config.csv" ]; then
  echo "❌ Error: License configuration not found!"
  echo "   Please ensure /data/license_config.csv exists"
  echo "   See /docs/DATA_REFRESH.md for details"
  exit 1
fi
echo "✅ License configuration found"
echo ""

# Step 2: Verify required data files exist
echo "📋 Step 2: Checking for data files..."
echo "   Looking in: $DATA_DIR"

# Check for org chart
if [ ! -f "$DATA_DIR/absencesoft_org_chart.json" ]; then
  echo "⚠️  Warning: absencesoft_org_chart.json not found (optional)"
else
  echo "✅ Org chart found"
fi

# Check for Claude Enterprise seats
if [ ! -f "$DATA_DIR/claude_enterprise_seats.json" ]; then
  echo "⚠️  Warning: claude_enterprise_seats.json not found (optional)"
else
  echo "✅ Claude Enterprise seats found"
fi

# Check for Claude Enterprise ZIP files (use -L to follow symlinks)
CLAUDE_ZIPS=$(find -L "$DATA_DIR" -name "claude-ent-data-*.zip" 2>/dev/null | wc -l)
if [ "$CLAUDE_ZIPS" -eq 0 ]; then
  echo "⚠️  Warning: No Claude Enterprise ZIP files found"
else
  echo "✅ Found $CLAUDE_ZIPS Claude Enterprise ZIP file(s)"
fi

# Check for M365 CSV files (use -L to follow symlinks)
M365_CSVS=$(find -L "$DATA_DIR" -name "365*Copilot*.csv" 2>/dev/null | wc -l)
if [ "$M365_CSVS" -eq 0 ]; then
  echo "⚠️  Warning: No M365 Copilot CSV files found"
else
  echo "✅ Found $M365_CSVS M365 Copilot CSV file(s)"
fi

# Check for Claude Code CSV files (use -L to follow symlinks)
CLAUDE_CODE_CSVS=$(find -L "$DATA_DIR" -name "claude_code_team_*.csv" 2>/dev/null | wc -l)
if [ "$CLAUDE_CODE_CSVS" -eq 0 ]; then
  echo "⚠️  Warning: No Claude Code CSV files found"
else
  echo "✅ Found $CLAUDE_CODE_CSVS Claude Code CSV file(s)"
fi

# Check for GitHub Copilot NDJSON files (use -L to follow symlinks)
GH_CODEGEN=$(find -L "$DATA_DIR" -name "github-copilot-code-generation-data*.ndjson" 2>/dev/null | wc -l)
if [ "$GH_CODEGEN" -eq 0 ]; then
  echo "⚠️  Warning: No GitHub Copilot code generation data found"
else
  echo "✅ Found $GH_CODEGEN GitHub Copilot code generation file(s)"
fi

GH_USAGE=$(find -L "$DATA_DIR" -name "github-copilot-usage-data*.ndjson" 2>/dev/null | wc -l)
if [ "$GH_USAGE" -eq 0 ]; then
  echo "⚠️  Warning: No GitHub Copilot usage data found"
else
  echo "✅ Found $GH_USAGE GitHub Copilot usage file(s)"
fi

echo ""

# Step 2a: Research industry benchmarks (with 30-day caching)
echo "📋 Step 2a: Checking industry benchmarks..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if node "$SCRIPT_DIR/research-industry-benchmarks.js"; then
  echo ""
else
  echo ""
  echo "⚠️  Warning: Industry benchmark research failed"
  echo "   The parser will continue with existing benchmark data"
  echo "   Check ANTHROPIC_API_KEY if you want to refresh benchmarks"
  echo ""
fi

# Step 3: Enrich org chart with agentic FTE data
echo "📋 Step 3: Enriching org chart with agentic FTE data..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f "$DATA_DIR/absencesoft_org_chart.json" ]; then
  if node "$SCRIPT_DIR/enrich-org-chart-with-agentic-fte.js"; then
    echo ""
    echo "✅ Org chart enrichment complete"
    echo ""
  else
    echo ""
    echo "⚠️  Warning: Org chart enrichment failed"
    echo "   The dashboard will still work without enriched org chart data"
    echo ""
  fi
else
  echo "   ℹ️  No org chart found, skipping enrichment"
  echo ""
fi

# Step 4: Run the data parser
echo "📋 Step 4: Running data parser..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if NODE_OPTIONS="--max-old-space-size=8192" node "$SCRIPT_DIR/parse-copilot-data.js"; then
  echo ""
  echo "✅ AI tools data generation complete"
  echo ""
else
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "❌ Data refresh failed!"
  echo ""
  echo "🔍 Troubleshooting:"
  echo "   - Check that all required data files are in /data/"
  echo "   - Verify CSV file formats are correct"
  echo "   - Check ANTHROPIC_API_KEY is set for insight generation"
  echo "   - See /docs/DATA_REFRESH.md for detailed instructions"
  echo ""
  exit 1
fi

# Step 5: Generate Annual Plan (if project files exist)
echo "📋 Step 5: Generating Annual Plan..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if project files directory exists
if [ -d "$DATA_DIR/ai-projects" ] && [ "$(ls -A $DATA_DIR/ai-projects/*.md 2>/dev/null | wc -l)" -gt 0 ]; then
  echo "   Found AI project files, generating annual plan..."
  echo ""

  # Generate project details (for detail views)
  if node "$SCRIPT_DIR/parse-project-details.js"; then
    echo ""
    echo "   ✅ Project details generated"
    echo ""
  else
    echo ""
    echo "   ⚠️  Warning: Project details generation failed"
    echo "      Continuing with annual plan generation..."
    echo ""
  fi

  # Generate full annual plan (portfolio, presentation, schedule, scores)
  if npm run refresh-annual-plan --silent; then
    echo ""
    echo "   ✅ Annual plan generation complete"
    echo ""
  else
    echo ""
    echo "   ⚠️  Warning: Annual plan generation failed"
    echo "      The dashboard will still work with AI tools data"
    echo ""
  fi
else
  echo "   ℹ️  No AI project files found in $DATA_DIR/ai-projects/"
  echo "   Skipping annual plan generation"
  echo ""
fi

# Final Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Data refresh complete!"
echo ""
echo "📝 Generated Files:"
echo "   • app/ai-tools-data.json (AI tools metrics)"
if [ -f "$PROJECT_ROOT/app/ai-projects-details.json" ]; then
  echo "   • app/ai-projects-details.json (Project details)"
fi
if [ -f "$PROJECT_ROOT/app/ai-projects-portfolio.json" ]; then
  echo "   • app/ai-projects-portfolio.json (Portfolio table)"
  echo "   • app/ai-projects-presentation.json (Annual plan)"
  echo "   • app/ai-projects-schedule.json (Quarterly roadmap)"
fi
echo ""
echo "🎯 Next Steps:"
echo "   1. Refresh your browser to see updated dashboard"
echo "   2. Review the AI-generated insights"
echo "   3. Check department breakdowns for accuracy"
if [ -f "$PROJECT_ROOT/app/ai-projects-presentation.json" ]; then
  echo "   4. View updated 2026 Annual Plan presentation"
fi
echo ""
echo "💡 Tip: You can run this script as many times as needed"
echo "   It's idempotent and safe to re-run with the same files"
echo ""
