const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Rate limiting delay (100ms between requests)
const RATE_LIMIT_DELAY = 100;

// Sleep utility for rate limiting
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Analyze sentiment of a single message/quote with Claude API
 * @param {Object} data - Message data to analyze
 * @param {string} data.text - The text to analyze
 * @param {string} data.author - Author name
 * @param {string} data.department - Department name
 * @param {Date} data.date - Date of message
 * @param {string} data.source - Source type (slack, survey, interview, confluence)
 * @returns {Promise<Object>} Sentiment analysis result
 */
async function analyzeSentimentWithClaude(data) {
  const { text, author, department, date, source } = data;

  // Skip empty or very short messages
  if (!text || text.trim().length < 10) {
    return null;
  }

  const prompt = `Analyze this ${source} message for AI tool sentiment.

Message: "${text}"
Author: ${author || 'Unknown'} (${department || 'Unknown Department'})
Date: ${date ? date.toISOString().split('T')[0] : 'Unknown'}

Extract the following information and return ONLY valid JSON (no other text):

{
  "sentiment_score": [number from -1 (very negative) to +1 (very positive)],
  "confidence": [number from 0 (uncertain) to 1 (very confident)],
  "topics": [array of themes like "productivity", "ease_of_use", "cost", "learning_curve", "collaboration", "features"],
  "tool_mentioned": "[Claude Enterprise|Claude Code|M365 Copilot|GitHub Copilot|ChatGPT|Other|None]",
  "features_mentioned": [array of specific features mentioned],
  "intent": "[praise|complaint|question|feature_request|neutral|documentation|lesson_learned]",
  "summary": "[1-2 sentence summary of the sentiment]"
}

Important:
- sentiment_score must be a number between -1 and 1
- confidence must be a number between 0 and 1
- Focus on sentiment about AI tools, not general sentiment
- If no AI tool is clearly mentioned, tool_mentioned should be "None"
- Be objective and accurate in sentiment scoring`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      temperature: 0.2, // Low temperature for consistent analysis
      messages: [{ role: 'user', content: prompt }]
    });

    const result = JSON.parse(response.content[0].text);

    // Validate result structure
    if (!result.sentiment_score || !result.confidence || !result.topics || !result.intent) {
      console.warn('⚠️  Invalid sentiment result structure:', result);
      return null;
    }

    // Clamp values to valid ranges
    result.sentiment_score = Math.max(-1, Math.min(1, result.sentiment_score));
    result.confidence = Math.max(0, Math.min(1, result.confidence));

    return result;
  } catch (error) {
    console.error('❌ Error analyzing sentiment:', error.message);
    return null;
  }
}

/**
 * Analyze sentiment for multiple messages with rate limiting
 * @param {Array<Object>} messages - Array of message objects
 * @param {Object} options - Options for batch processing
 * @param {number} options.batchSize - Number of messages to process in parallel (default: 5)
 * @param {boolean} options.showProgress - Show progress updates (default: true)
 * @returns {Promise<Array<Object>>} Array of analyzed messages
 */
async function analyzeSentimentBatch(messages, options = {}) {
  const { batchSize = 5, showProgress = true } = options;

  console.log(`\n🤖 Analyzing sentiment for ${messages.length} messages...`);

  const results = [];
  let processed = 0;
  let successful = 0;
  let failed = 0;

  // Process in batches to avoid overwhelming the API
  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize);

    // Process batch in parallel
    const batchPromises = batch.map(async (message) => {
      await sleep(RATE_LIMIT_DELAY); // Rate limiting

      const sentiment = await analyzeSentimentWithClaude({
        text: message.text || message.quote || message.content,
        author: message.author || message.userName || message.user,
        department: message.department || message.dept,
        date: message.date || message.timestamp || new Date(),
        source: message.source
      });

      if (sentiment) {
        successful++;
        return {
          ...message,
          sentiment
        };
      } else {
        failed++;
        return null;
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults.filter(r => r !== null));

    processed += batch.length;

    if (showProgress) {
      const progress = Math.round((processed / messages.length) * 100);
      console.log(`   Progress: ${processed}/${messages.length} (${progress}%) - ✅ ${successful} successful, ❌ ${failed} failed`);
    }
  }

  console.log(`✅ Sentiment analysis complete: ${successful}/${messages.length} successful`);

  return results;
}

/**
 * Calculate aggregate sentiment metrics for a set of analyzed messages
 * @param {Array<Object>} analyzedMessages - Messages with sentiment analysis
 * @returns {Object} Aggregate sentiment metrics
 */
function calculateAggregateMetrics(analyzedMessages) {
  if (!analyzedMessages || analyzedMessages.length === 0) {
    return {
      avgSentiment: 0,
      nps: 0,
      perceivedValueScore: 0,
      feedbackCount: 0,
      sentimentDistribution: { positive: 0, neutral: 0, negative: 0 }
    };
  }

  // Calculate average sentiment
  const avgSentiment = analyzedMessages.reduce((sum, m) => sum + m.sentiment.sentiment_score, 0) / analyzedMessages.length;

  // Calculate NPS (Net Promoter Score)
  const promoters = analyzedMessages.filter(m => m.sentiment.sentiment_score > 0.5).length;
  const detractors = analyzedMessages.filter(m => m.sentiment.sentiment_score < -0.5).length;
  const nps = ((promoters - detractors) / analyzedMessages.length) * 100;

  // Calculate Perceived Value Score (0-100)
  const sentimentScore = (avgSentiment + 1) * 50; // Normalize -1/+1 to 0-100
  const npsScore = (nps + 100) / 2; // Normalize -100/+100 to 0-100

  // Volume boost (more feedback = more reliable)
  const volumeBoost = Math.min(Math.log10(analyzedMessages.length + 1) / 5, 1);

  // Weighted composite: 60% sentiment, 40% NPS, with volume boost
  const perceivedValueScore = Math.round((sentimentScore * 0.6 + npsScore * 0.4) * (0.7 + volumeBoost * 0.3));

  // Sentiment distribution
  const positive = analyzedMessages.filter(m => m.sentiment.sentiment_score > 0.2).length;
  const negative = analyzedMessages.filter(m => m.sentiment.sentiment_score < -0.2).length;
  const neutral = analyzedMessages.length - positive - negative;

  return {
    avgSentiment: Math.round(avgSentiment * 100) / 100,
    nps: Math.round(nps),
    perceivedValueScore,
    feedbackCount: analyzedMessages.length,
    sentimentDistribution: {
      positive,
      neutral,
      negative
    }
  };
}

/**
 * Extract top themes from analyzed messages
 * @param {Array<Object>} analyzedMessages - Messages with sentiment analysis
 * @param {number} topN - Number of top themes to return (default: 5)
 * @returns {Array<Object>} Top themes with counts and average sentiment
 */
function extractTopThemes(analyzedMessages, topN = 5) {
  const themeMap = new Map();

  analyzedMessages.forEach(msg => {
    msg.sentiment.topics.forEach(topic => {
      if (!themeMap.has(topic)) {
        themeMap.set(topic, { count: 0, totalSentiment: 0 });
      }
      const theme = themeMap.get(topic);
      theme.count++;
      theme.totalSentiment += msg.sentiment.sentiment_score;
    });
  });

  const themes = Array.from(themeMap.entries()).map(([theme, data]) => ({
    theme,
    count: data.count,
    avgSentiment: Math.round((data.totalSentiment / data.count) * 100) / 100
  }));

  return themes.sort((a, b) => b.count - a.count).slice(0, topN);
}

/**
 * Extract representative quotes (high sentiment + high confidence)
 * @param {Array<Object>} analyzedMessages - Messages with sentiment analysis
 * @param {number} count - Number of quotes to extract (default: 5)
 * @returns {Array<Object>} Representative quotes
 */
function extractRepresentativeQuotes(analyzedMessages, count = 5) {
  // Sort by sentiment * confidence (highest positive impact)
  const sortedMessages = [...analyzedMessages].sort((a, b) => {
    const scoreA = Math.abs(a.sentiment.sentiment_score) * a.sentiment.confidence;
    const scoreB = Math.abs(b.sentiment.sentiment_score) * b.sentiment.confidence;
    return scoreB - scoreA;
  });

  return sortedMessages.slice(0, count).map(msg => ({
    quote: msg.text || msg.quote || msg.content,
    author: msg.author || msg.userName || msg.user,
    department: msg.department || msg.dept,
    date: msg.date || msg.timestamp,
    sentiment: msg.sentiment.sentiment_score,
    confidence: msg.sentiment.confidence,
    source: msg.source,
    tool: msg.sentiment.tool_mentioned,
    summary: msg.sentiment.summary
  }));
}

/**
 * Extract pain points (negative sentiment themes)
 * @param {Array<Object>} analyzedMessages - Messages with sentiment analysis
 * @param {number} topN - Number of pain points to return (default: 5)
 * @returns {Array<Object>} Pain points with frequency and sentiment
 */
function extractPainPoints(analyzedMessages, topN = 5) {
  // Filter negative messages
  const negativeMessages = analyzedMessages.filter(m => m.sentiment.sentiment_score < -0.2);

  // Group by intent and topics
  const painPointMap = new Map();

  negativeMessages.forEach(msg => {
    msg.sentiment.topics.forEach(topic => {
      if (!painPointMap.has(topic)) {
        painPointMap.set(topic, {
          theme: topic,
          messages: [],
          totalSentiment: 0
        });
      }
      const painPoint = painPointMap.get(topic);
      painPoint.messages.push(msg);
      painPoint.totalSentiment += msg.sentiment.sentiment_score;
    });
  });

  const painPoints = Array.from(painPointMap.values()).map(pp => ({
    theme: pp.theme,
    description: pp.messages[0]?.sentiment.summary || 'No description',
    frequency: pp.messages.length,
    avgSentiment: Math.round((pp.totalSentiment / pp.messages.length) * 100) / 100,
    examples: pp.messages.slice(0, 2).map(m => ({
      quote: m.text || m.quote || m.content,
      author: m.author || m.userName || m.user
    }))
  }));

  return painPoints.sort((a, b) => b.frequency - a.frequency).slice(0, topN);
}

module.exports = {
  analyzeSentimentWithClaude,
  analyzeSentimentBatch,
  calculateAggregateMetrics,
  extractTopThemes,
  extractRepresentativeQuotes,
  extractPainPoints
};
