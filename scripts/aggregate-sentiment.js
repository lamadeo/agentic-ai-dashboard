const fs = require('fs');
const path = require('path');
require('dotenv').config();

const {
  analyzeSentimentBatch,
  calculateAggregateMetrics,
  extractTopThemes,
  extractRepresentativeQuotes,
  extractPainPoints
} = require('./analyze-sentiment.js');

const SENTIMENT_DIR = path.join(__dirname, '../data/sentiment');
const OUTPUT_FILE = path.join(__dirname, '../data/perceived-value.json');

/**
 * Load all sentiment data sources
 */
function loadAllSentimentSources() {
  console.log('\n📥 Loading sentiment data from all sources...\n');

  const sources = {
    slack: path.join(SENTIMENT_DIR, 'slack-messages.json'),
    confluence: path.join(SENTIMENT_DIR, 'confluence-items.json'),
    surveys: path.join(SENTIMENT_DIR, 'survey-responses.json'),
    interviews: path.join(SENTIMENT_DIR, 'interview-quotes.json')
  };

  const allData = [];
  const sourceStats = {};

  for (const [sourceName, filePath] of Object.entries(sources)) {
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      console.log(`   ✅ ${sourceName}: ${data.length} items`);
      allData.push(...data);
      sourceStats[sourceName] = data.length;
    } else {
      console.log(`   ⚠️  ${sourceName}: file not found (${filePath})`);
      sourceStats[sourceName] = 0;
    }
  }

  console.log(`\n   Total items: ${allData.length}`);

  return { allData, sourceStats };
}

/**
 * Group analyzed messages by AI tool mentioned
 */
function groupByTool(analyzedMessages) {
  const groups = {
    'Claude Enterprise': [],
    'Claude Code': [],
    'M365 Copilot': [],
    'GitHub Copilot': [],
    'ChatGPT': [],
    'Other': [],
    'None': []
  };

  analyzedMessages.forEach(msg => {
    const tool = msg.sentiment.tool_mentioned;
    if (groups[tool]) {
      groups[tool].push(msg);
    } else {
      groups['Other'].push(msg);
    }
  });

  return groups;
}

/**
 * Calculate sentiment trend by month
 */
function calculateSentimentTrend(analyzedMessages) {
  const monthMap = new Map();

  analyzedMessages.forEach(msg => {
    const date = new Date(msg.date || msg.timestamp);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, { messages: [], totalSentiment: 0 });
    }

    const month = monthMap.get(monthKey);
    month.messages.push(msg);
    month.totalSentiment += msg.sentiment.sentiment_score;
  });

  const trend = Array.from(monthMap.entries())
    .map(([monthKey, data]) => {
      const [year, month] = monthKey.split('-');
      const monthName = new Date(year, parseInt(month) - 1, 1).toLocaleString('en-US', { month: 'short', year: 'numeric' });

      return {
        month: monthName,
        monthKey: monthKey,
        score: Math.round((data.totalSentiment / data.messages.length) * 100) / 100,
        count: data.messages.length
      };
    })
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey));

  return trend;
}

/**
 * Calculate department sentiment breakdown
 */
function calculateDepartmentSentiment(analyzedMessages) {
  const deptMap = new Map();

  analyzedMessages.forEach(msg => {
    const dept = msg.department || 'Unknown';

    if (!deptMap.has(dept)) {
      deptMap.set(dept, { messages: [], totalSentiment: 0 });
    }

    const deptData = deptMap.get(dept);
    deptData.messages.push(msg);
    deptData.totalSentiment += msg.sentiment.sentiment_score;
  });

  return Array.from(deptMap.entries())
    .map(([dept, data]) => ({
      department: dept,
      score: Math.round((data.totalSentiment / data.messages.length) * 100) / 100,
      count: data.messages.length
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Aggregate sentiment data for a specific tool
 */
function aggregateToolSentiment(toolName, analyzedMessages) {
  if (analyzedMessages.length === 0) {
    return {
      perceivedValueScore: 0,
      avgSentiment: 0,
      nps: 0,
      feedbackCount: 0,
      sentimentDistribution: { positive: 0, neutral: 0, negative: 0 },
      sentimentTrend: [],
      topThemes: [],
      departmentSentiment: [],
      representativeQuotes: [],
      painPoints: [],
      sourceBreakdown: {}
    };
  }

  const metrics = calculateAggregateMetrics(analyzedMessages);
  const trend = calculateSentimentTrend(analyzedMessages);
  const themes = extractTopThemes(analyzedMessages, 5);
  const deptSentiment = calculateDepartmentSentiment(analyzedMessages);
  const quotes = extractRepresentativeQuotes(analyzedMessages, 5);
  const painPoints = extractPainPoints(analyzedMessages, 5);

  // Calculate source breakdown
  const sourceBreakdown = {};
  analyzedMessages.forEach(msg => {
    const source = msg.source || 'unknown';
    if (!sourceBreakdown[source]) {
      sourceBreakdown[source] = 0;
    }
    sourceBreakdown[source]++;
  });

  return {
    ...metrics,
    sentimentTrend: trend,
    topThemes: themes,
    departmentSentiment: deptSentiment,
    representativeQuotes: quotes,
    painPoints: painPoints,
    sourceBreakdown: sourceBreakdown
  };
}

/**
 * Main aggregation function
 */
async function aggregateSentiment() {
  try {
    console.log('🚀 Starting sentiment aggregation pipeline...\n');

    // Step 1: Load all sentiment sources
    const { allData, sourceStats } = loadAllSentimentSources();

    if (allData.length === 0) {
      console.log('\n⚠️  No sentiment data found. Please run the parse scripts first:');
      console.log('  1. node scripts/parse-slack-sentiment.js');
      console.log('  2. node scripts/parse-confluence-wikis.js');
      console.log('  3. node scripts/parse-survey-data.js');
      console.log('  4. node scripts/parse-interview-notes.js');
      return null;
    }

    // Step 2: Analyze sentiment with Claude API
    const analyzedMessages = await analyzeSentimentBatch(allData, {
      batchSize: 5,
      showProgress: true
    });

    if (analyzedMessages.length === 0) {
      console.log('\n⚠️  Sentiment analysis failed. Check Claude API configuration.');
      return null;
    }

    // Step 3: Group by tool
    console.log('\n📊 Grouping analyzed data by AI tool...');
    const toolGroups = groupByTool(analyzedMessages);

    Object.entries(toolGroups).forEach(([tool, messages]) => {
      console.log(`   ${tool}: ${messages.length} messages`);
    });

    // Step 4: Aggregate metrics for each tool
    console.log('\n🧮 Calculating perceived value metrics for each tool...');

    const perceivedValue = {};

    for (const [toolName, messages] of Object.entries(toolGroups)) {
      if (toolName === 'None' || toolName === 'Other') continue;

      console.log(`\n   Aggregating ${toolName}...`);
      perceivedValue[toolName] = aggregateToolSentiment(toolName, messages);

      console.log(`      Perceived Value Score: ${perceivedValue[toolName].perceivedValueScore}/100`);
      console.log(`      Avg Sentiment: ${perceivedValue[toolName].avgSentiment}`);
      console.log(`      NPS: ${perceivedValue[toolName].nps}`);
      console.log(`      Feedback Count: ${perceivedValue[toolName].feedbackCount}`);
    }

    // Step 5: Create final output structure
    const output = {
      lastUpdated: new Date().toISOString(),
      summary: {
        totalFeedbackAnalyzed: analyzedMessages.length,
        sourceBreakdown: sourceStats,
        toolMentions: Object.fromEntries(
          Object.entries(toolGroups).map(([tool, msgs]) => [tool, msgs.length])
        )
      },
      perceivedValue: perceivedValue
    };

    // Step 6: Save to file
    console.log(`\n💾 Saving perceived value data...`);

    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
    console.log(`   Saved to: ${OUTPUT_FILE}`);

    console.log('\n✅ Sentiment aggregation complete!');
    console.log(`\n📊 Summary:`);
    console.log(`   Total feedback analyzed: ${analyzedMessages.length}`);
    console.log(`   Tools with data: ${Object.keys(perceivedValue).length}`);
    console.log(`\nPerceived Value Scores:`);
    Object.entries(perceivedValue).forEach(([tool, data]) => {
      console.log(`   ${tool}: ${data.perceivedValueScore}/100 (${data.feedbackCount} messages)`);
    });

    console.log(`\nNext steps:`);
    console.log(`  1. Review: ${OUTPUT_FILE}`);
    console.log(`  2. Integrate with main pipeline (parse-copilot-data.js)`);
    console.log(`  3. Build UI components to display perceived value`);

    return output;

  } catch (error) {
    console.error('\n❌ Error during sentiment aggregation:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Export function for use in other scripts
module.exports = {
  aggregateSentiment,
  groupByTool,
  calculateSentimentTrend,
  calculateDepartmentSentiment,
  aggregateToolSentiment
};

// Run if called directly
if (require.main === module) {
  aggregateSentiment();
}
