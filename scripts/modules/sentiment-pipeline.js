/**
 * Sentiment Pipeline Orchestrator
 *
 * Provides a clean, modular interface for running the complete sentiment analysis pipeline.
 * This module orchestrates the three-step process:
 *   1. Parse (fetch Slack messages)
 *   2. Analyze (Claude API sentiment analysis)
 *   3. Aggregate (calculate metrics and perceived value scores)
 *
 * Design Goals:
 * - Single responsibility: orchestrate the sentiment pipeline
 * - Clean API for integration into main parser
 * - Graceful error handling with fallback to static data
 * - Independently testable
 * - Clear logging for observability
 *
 * Usage:
 *   const { runSentimentPipeline } = require('./modules/sentiment-pipeline');
 *   const perceivedValue = await runSentimentPipeline({ fallbackToStatic: true });
 */

const fs = require('fs');
const path = require('path');

// Import existing sentiment analysis modules
const { fetchSlackMessages, enrichWithDepartmentData } = require('../parse-slack-sentiment');
const { analyzeSentimentBatch } = require('../analyze-sentiment');
const {
  groupByTool,
  calculateSentimentTrend,
  calculateDepartmentSentiment,
  aggregateToolSentiment
} = require('../aggregate-sentiment');

// Paths
const STATIC_PERCEIVED_VALUE_PATH = path.join(__dirname, '../../data/perceived-value.json');
const SENTIMENT_OUTPUT_DIR = path.join(__dirname, '../../data/sentiment');

/**
 * Configuration options for sentiment pipeline
 * @typedef {Object} SentimentPipelineOptions
 * @property {boolean} fallbackToStatic - If true, use static data on errors (default: true)
 * @property {boolean} skipSlackFetch - If true, use cached Slack data (default: false)
 * @property {number} slackDaysBack - Days of history to fetch (default: 30)
 * @property {boolean} verbose - Enable detailed logging (default: true)
 * @property {number} batchSize - Sentiment analysis batch size (default: 5)
 */

/**
 * Run the complete sentiment analysis pipeline
 *
 * @param {SentimentPipelineOptions} options - Pipeline configuration options
 * @returns {Promise<Object>} Perceived value data structure matching UI expectations
 */
async function runSentimentPipeline(options = {}) {
  const {
    fallbackToStatic = true,
    skipSlackFetch = false,
    slackDaysBack = 30,
    verbose = true,
    batchSize = 5
  } = options;

  const startTime = Date.now();

  if (verbose) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💬 SENTIMENT ANALYSIS PIPELINE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  try {
    // ========================================================================
    // STEP 1: Fetch Sentiment Data (Slack Messages)
    // ========================================================================
    let allMessages = [];

    if (skipSlackFetch) {
      if (verbose) console.log('⏭️  Skipping Slack fetch (using cached data)');
      allMessages = loadCachedSlackMessages();
    } else {
      if (verbose) console.log('📱 Step 1/3: Fetching Slack messages...');

      // Check if Slack API is configured
      if (!process.env.SLACK_BOT_TOKEN || process.env.SLACK_BOT_TOKEN.startsWith('xoxb-xxxxx')) {
        if (verbose) {
          console.log('   ⚠️  Slack API not configured - skipping live fetch');
          console.log('   💡 To enable: Add SLACK_BOT_TOKEN to .env file');
          console.log('   📚 See: docs/PERCEIVED_VALUE_IMPLEMENTATION_PLAN.md\n');
        }

        // Try to load cached data as fallback
        allMessages = loadCachedSlackMessages();

        if (allMessages.length === 0 && fallbackToStatic) {
          if (verbose) console.log('   ↩️  No cached data - falling back to static perceived-value.json\n');
          return loadStaticPerceivedValue();
        }
      } else {
        try {
          // Fetch fresh Slack messages
          const slackMessages = await fetchSlackMessages(slackDaysBack);

          // Enrich with department data
          const hierarchyData = loadHierarchyData();
          allMessages = enrichWithDepartmentData(slackMessages, hierarchyData);

          // Cache the results
          cacheSlackMessages(allMessages);

          if (verbose) {
            console.log(`   ✅ Fetched ${allMessages.length} messages from Slack`);
            console.log(`   💾 Cached to: ${SENTIMENT_OUTPUT_DIR}/slack-messages.json\n`);
          }
        } catch (error) {
          if (verbose) {
            console.error(`   ❌ Error fetching Slack messages: ${error.message}`);
          }

          // Try cached data
          allMessages = loadCachedSlackMessages();

          if (allMessages.length === 0 && fallbackToStatic) {
            if (verbose) console.log('   ↩️  Falling back to static data\n');
            return loadStaticPerceivedValue();
          }
        }
      }
    }

    if (allMessages.length === 0) {
      if (verbose) {
        console.log('⚠️  No sentiment data available');
        console.log('   Run: node scripts/parse-slack-sentiment.js (to fetch Slack data)\n');
      }

      if (fallbackToStatic) {
        return loadStaticPerceivedValue();
      } else {
        return createEmptyPerceivedValue();
      }
    }

    // ========================================================================
    // STEP 2: Analyze Sentiment (Claude API)
    // ========================================================================
    if (verbose) console.log('🤖 Step 2/3: Analyzing sentiment with Claude API...');

    let analyzedMessages = [];

    try {
      // Check if Anthropic API key is configured
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY not configured');
      }

      analyzedMessages = await analyzeSentimentBatch(allMessages, {
        batchSize,
        showProgress: verbose
      });

      if (verbose) {
        console.log(`   ✅ Analyzed ${analyzedMessages.length}/${allMessages.length} messages successfully\n`);
      }
    } catch (error) {
      if (verbose) {
        console.error(`   ❌ Error analyzing sentiment: ${error.message}`);
      }

      if (fallbackToStatic) {
        if (verbose) console.log('   ↩️  Falling back to static data\n');
        return loadStaticPerceivedValue();
      } else {
        throw error;
      }
    }

    if (analyzedMessages.length === 0) {
      if (verbose) console.log('   ⚠️  No messages successfully analyzed');

      if (fallbackToStatic) {
        return loadStaticPerceivedValue();
      } else {
        return createEmptyPerceivedValue();
      }
    }

    // ========================================================================
    // STEP 3: Aggregate Metrics (Perceived Value Scores)
    // ========================================================================
    if (verbose) console.log('📊 Step 3/3: Aggregating metrics and calculating scores...');

    // Group by tool
    const toolGroups = groupByTool(analyzedMessages);

    // Aggregate metrics for each tool
    const perceivedValue = {};

    for (const [toolName, messages] of Object.entries(toolGroups)) {
      // Skip tools with no data or generic categories
      if (toolName === 'None' || toolName === 'Other' || messages.length === 0) {
        continue;
      }

      perceivedValue[toolName] = aggregateToolSentiment(toolName, messages);

      if (verbose) {
        const score = perceivedValue[toolName].perceivedValueScore;
        const count = perceivedValue[toolName].feedbackCount;
        console.log(`   ${toolName.padEnd(20)} Score: ${score}/100 (${count} messages)`);
      }
    }

    // Create output structure matching UI expectations
    const output = {
      lastUpdated: new Date().toISOString(),
      summary: {
        totalFeedbackAnalyzed: analyzedMessages.length,
        sourceBreakdown: {
          slack: allMessages.length,
          confluence: 0,  // Future enhancement
          surveys: 0,      // Future enhancement
          interviews: 0    // Future enhancement
        },
        toolMentions: Object.fromEntries(
          Object.entries(toolGroups).map(([tool, msgs]) => [tool, msgs.length])
        )
      },
      perceivedValue: perceivedValue
    };

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    if (verbose) {
      console.log(`\n✅ Sentiment pipeline complete in ${duration}s`);
      console.log(`   Analyzed: ${analyzedMessages.length} messages`);
      console.log(`   Tools with data: ${Object.keys(perceivedValue).length}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    return output;

  } catch (error) {
    console.error('\n❌ Sentiment pipeline error:', error.message);

    if (fallbackToStatic) {
      console.log('   ↩️  Falling back to static perceived-value.json\n');
      return loadStaticPerceivedValue();
    } else {
      throw error;
    }
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Load cached Slack messages from previous run
 */
function loadCachedSlackMessages() {
  const cachePath = path.join(SENTIMENT_OUTPUT_DIR, 'slack-messages.json');

  if (!fs.existsSync(cachePath)) {
    return [];
  }

  try {
    const data = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn(`⚠️  Error loading cached Slack data: ${error.message}`);
    return [];
  }
}

/**
 * Cache Slack messages for future runs
 */
function cacheSlackMessages(messages) {
  if (!fs.existsSync(SENTIMENT_OUTPUT_DIR)) {
    fs.mkdirSync(SENTIMENT_OUTPUT_DIR, { recursive: true });
  }

  const cachePath = path.join(SENTIMENT_OUTPUT_DIR, 'slack-messages.json');
  fs.writeFileSync(cachePath, JSON.stringify(messages, null, 2));
}

/**
 * Load hierarchy data for department enrichment
 */
function loadHierarchyData() {
  const hierarchyPath = path.join(__dirname, '../../data/hierarchy.json');

  if (!fs.existsSync(hierarchyPath)) {
    console.warn('⚠️  hierarchy.json not found - department data will be limited');
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(hierarchyPath, 'utf8'));
  } catch (error) {
    console.warn(`⚠️  Error loading hierarchy: ${error.message}`);
    return null;
  }
}

/**
 * Load static perceived value data as fallback
 */
function loadStaticPerceivedValue() {
  if (!fs.existsSync(STATIC_PERCEIVED_VALUE_PATH)) {
    console.warn('⚠️  Static perceived-value.json not found');
    return createEmptyPerceivedValue();
  }

  try {
    const data = JSON.parse(fs.readFileSync(STATIC_PERCEIVED_VALUE_PATH, 'utf8'));
    console.log('   ℹ️  Using static perceived value data (last updated: ' +
                new Date(data.lastUpdated).toLocaleDateString() + ')');
    return data;
  } catch (error) {
    console.warn(`⚠️  Error loading static data: ${error.message}`);
    return createEmptyPerceivedValue();
  }
}

/**
 * Create empty perceived value structure
 */
function createEmptyPerceivedValue() {
  return {
    lastUpdated: new Date().toISOString(),
    summary: {
      totalFeedbackAnalyzed: 0,
      sourceBreakdown: {},
      toolMentions: {}
    },
    perceivedValue: {}
  };
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  runSentimentPipeline
};
