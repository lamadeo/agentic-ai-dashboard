/**
 * AI Tools Dashboard Data Parser - CLI Entry Point
 *
 * Main entry point for the data processing pipeline. Orchestrates:
 * 1. Data ingestion and processing (via pipeline orchestrator)
 * 2. AI-powered insights generation
 * 3. Sentiment analysis
 * 4. Output generation
 *
 * Usage:
 *   node scripts/parse-copilot-data.js [--verbose]
 *   npm run refresh
 *   ./scripts/refresh-data.sh
 *
 * Phase 5: Simplified to thin CLI wrapper (January 10, 2026)
 * Phases 1-3: Modularized ingestion, processing, and aggregation layers
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { runPipeline } = require('./modules/pipeline-orchestrator');
const { generateAllInsights } = require('./generate-insights');
const { runSentimentPipeline } = require('./modules/sentiment-pipeline');

// ============================================================================
// CLI ARGUMENT PARSING
// ============================================================================

const args = process.argv.slice(2);
const verbose = args.includes('--verbose');

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  try {
    console.log('🚀 Starting AI Tools Dashboard data pipeline...\n');

    // Step 1: Run data pipeline (ingestion → processing → aggregation)
    console.log('📊 Step 1/4: Running data pipeline...');
    const dashboardData = await runPipeline({ verbose });
    console.log('✅ Data pipeline complete\n');

    // Step 2: Generate AI-powered insights
    console.log('🤖 Step 2/4: Generating AI-powered insights...');
    const insights = await generateAllInsights(dashboardData);
    dashboardData.insights = insights;
    console.log(`✅ Generated ${insights.length} insights\n`);

    // Step 3: Run sentiment analysis pipeline
    console.log('💭 Step 3/4: Running sentiment analysis...');
    const perceivedValueData = await runSentimentPipeline({
      fallbackToStatic: true,  // Use static data if APIs fail
      verbose
    });

    // Add perceived value data to dashboard
    dashboardData.perceivedValue = perceivedValueData.perceivedValue;

    // Add sentiment analysis summary to metadata
    if (!dashboardData.metadata) {
      dashboardData.metadata = {};
    }
    dashboardData.metadata.sentimentAnalysis = {
      lastUpdated: perceivedValueData.lastUpdated,
      totalFeedbackAnalyzed: perceivedValueData.summary.totalFeedbackAnalyzed,
      sourceBreakdown: perceivedValueData.summary.sourceBreakdown
    };

    // Add data refresh timestamp
    dashboardData.metadata.lastRefreshed = new Date().toISOString();
    console.log('✅ Sentiment analysis complete\n');

    // Step 4: Write output file
    console.log('💾 Step 4/4: Writing output file...');
    const outputPath = path.join(__dirname, '../app/ai-tools-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(dashboardData, null, 2));

    // Display summary
    const fileSizeKB = Math.round(fs.statSync(outputPath).size / 1024);
    console.log(`✅ Dashboard data written to: ${outputPath}`);
    console.log(`   File size: ${fileSizeKB} KB`);
    console.log(`   Insights: ${insights.length}`);
    console.log(`   Sentiment feedback: ${perceivedValueData.summary.totalFeedbackAnalyzed} items\n`);

    console.log('🎉 Done! Dashboard data is ready.\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Pipeline failed:');
    console.error(error);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the pipeline
main();
