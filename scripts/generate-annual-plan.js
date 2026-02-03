#!/usr/bin/env node

/**
 * Annual Plan Generator - CLI Entry Point
 *
 * Generates the complete 2026 Annual Plan data structure from project markdown files.
 * Orchestrates full pipeline: INGEST → ANALYZE → SCORE → SCHEDULE → GENERATE → OUTPUT
 *
 * Usage:
 *   node scripts/generate-annual-plan.js              # Generate with defaults
 *   node scripts/generate-annual-plan.js --quarter Q2  # Specify quarter for scoring
 *   node scripts/generate-annual-plan.js --quiet       # Minimal output
 *   npm run refresh-annual-plan                       # Via npm script
 *
 * Environment Variables:
 * - USE_AI_PRESENTER=true                             Enable AI-driven presentation generation (Beta)
 *
 * Output Files (written to app/):
 * - ai-projects-portfolio.json      Portfolio table (11 columns)
 * - ai-projects-presentation.json   9-slide presentation (or -dynamic.json if AI enabled)
 * - ai-projects-schedule.json       Quarterly roadmap
 * - ai-projects-scores.json         Detailed scoring breakdown
 * - ai-projects-dependencies.json   Dependency graph
 */

// Load environment variables
require('dotenv').config();

const { generateAnnualPlan } = require('./modules/annual-plan-orchestrator');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  quarter: 'Q1',
  verbose: true
};

// Parse CLI arguments
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--quarter' || arg === '-q') {
    options.quarter = args[i + 1];
  } else if (arg === '--output' || arg === '-o') {
    options.outputDir = args[i + 1];
  } else if (arg === '--quiet' || arg === '-q') {
    options.verbose = false;
  }
}

(async () => {
  try {
    await generateAnnualPlan(options);
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
})();
