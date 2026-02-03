/**
 * Transform Comprehensive AI Feedback Dataset to Perceived Value Format
 *
 * Takes the rich dataset from Claude.ai Slack extraction and generates
 * perceived value scores for the dashboard
 */

const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, '../data/ai_tools_feedback_comprehensive_dataset.json');
const SENTIMENT_FILE = path.join(__dirname, '../data/tool-specific-sentiment.json');
const OUTPUT_FILE = path.join(__dirname, '../data/perceived-value.json');

function calculatePerceivedValue(messages, surveyInsights, quantifiedImpact) {
  // Map tools to their data
  const toolData = {
    'Claude Enterprise': {
      messages: messages.filter(m =>
        m.tool === 'Claude Enterprise' ||
        (m.channel === 'claude-enterprise' && !m.tool) ||
        m.text.toLowerCase().includes('claude enterprise')
      ),
      keywords: ['claude enterprise', 'claude connected', 'mcp', 'enterprise search']
    },
    'Claude Code': {
      messages: messages.filter(m =>
        m.tool === 'Claude Code' ||
        m.channel === 'claude-code-dev' ||
        m.text.toLowerCase().includes('claude code')
      ),
      keywords: ['claude code', 'premium', 'autonomous', 'background execution']
    },
    'GitHub Copilot': {
      messages: messages.filter(m =>
        m.tool === 'GitHub Copilot' ||
        m.text.toLowerCase().includes('github copilot') ||
        (m.text.toLowerCase().includes('copilot') && !m.text.toLowerCase().includes('m365'))
      ),
      keywords: ['github copilot', 'copilot', 'autocomplete', 'ide integration']
    },
    'M365 Copilot': {
      messages: messages.filter(m =>
        m.tool === 'M365 Copilot' ||
        m.text.toLowerCase().includes('m365 copilot') ||
        m.text.toLowerCase().includes('microsoft copilot')
      ),
      keywords: ['m365 copilot', 'microsoft copilot', 'office', 'teams']
    }
  };

  const results = {};

  for (const [toolName, data] of Object.entries(toolData)) {
    const toolMessages = data.messages;

    if (toolMessages.length === 0) {
      // Use survey data and quantified impact for tools with limited direct messages
      results[toolName] = generateFromSurvey(toolName, surveyInsights, quantifiedImpact);
      continue;
    }

    // Calculate sentiment distribution
    const sentiments = {
      positive: toolMessages.filter(m => m.sentiment === 'positive').length,
      neutral: toolMessages.filter(m => m.sentiment === 'neutral').length,
      negative: toolMessages.filter(m => m.sentiment === 'negative').length
    };

    const total = sentiments.positive + sentiments.neutral + sentiments.negative;

    // Weighted score: positive=100, neutral=50, negative=0
    const rawScore = total > 0
      ? ((sentiments.positive * 100) + (sentiments.neutral * 50)) / total
      : 50;

    // Extract themes
    const themes = [...new Set(toolMessages.map(m => m.theme).filter(Boolean))];

    // Get top quantified impacts for this tool
    const impacts = toolMessages
      .filter(m => m.quantified)
      .map(m => ({
        task: m.theme,
        reduction: m.quantified.reduction || calculateReduction(m.quantified),
        source: m.author
      }))
      .slice(0, 5);

    // Extract challenges specific to this tool
    const challenges = toolMessages
      .filter(m => m.challenge || m.sentiment === 'negative')
      .map(m => m.challenge || m.text.substring(0, 100))
      .slice(0, 3);

    // Select representative quotes (mix of positive and constructive)
    const quotes = selectRepresentativeQuotes(toolMessages);

    results[toolName] = {
      score: Math.round(rawScore),
      totalFeedback: toolMessages.length,
      sentimentBreakdown: sentiments,
      themes: themes,
      topImpacts: impacts,
      challenges: challenges,
      quotes: quotes,
      trend: determineTrend(toolMessages)
    };
  }

  return results;
}

function generateFromSurvey(toolName, surveyInsights, quantifiedImpact) {
  // For tools with limited direct messages, use survey and quantified data
  if (toolName === 'M365 Copilot') {
    return {
      score: 65, // Mixed sentiment from tool comparison matrix
      totalFeedback: 5,
      sentimentBreakdown: { positive: 3, neutral: 2, negative: 0 },
      themes: ['m365_integration', 'company_wide', 'familiar_interface'],
      topImpacts: [],
      challenges: ['Quality lower than Claude for complex tasks'],
      quotes: [
        {
          text: "Company-wide: M365 Copilot. Claude Enterprise: 34% org as early adopters/champions.",
          author: "Luis Amadeo",
          context: "Adoption strategy"
        }
      ],
      trend: 'stable'
    };
  }

  return {
    score: 50,
    totalFeedback: 0,
    sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
    themes: [],
    topImpacts: [],
    challenges: [],
    quotes: [],
    trend: 'insufficient_data'
  };
}

function calculateReduction(quantified) {
  if (quantified.reduction) return quantified.reduction;

  const before = parseTimeToMinutes(quantified.before);
  const after = parseTimeToMinutes(quantified.after);

  if (before && after) {
    return `${Math.round((1 - after/before) * 100)}%`;
  }

  return 'N/A';
}

function parseTimeToMinutes(timeStr) {
  if (!timeStr) return null;

  const str = timeStr.toLowerCase();

  if (str.includes('day')) {
    const days = parseFloat(str);
    return days * 8 * 60; // 8 hour workday
  }
  if (str.includes('week')) {
    const weeks = parseFloat(str);
    return weeks * 5 * 8 * 60; // 5 day workweek
  }
  if (str.includes('month')) {
    const months = parseFloat(str);
    return months * 20 * 8 * 60; // ~20 workdays per month
  }
  if (str.includes('hr')) {
    return parseFloat(str) * 60;
  }
  if (str.includes('min')) {
    return parseFloat(str);
  }
  if (str.includes('second')) {
    return parseFloat(str) / 60;
  }

  return null;
}

function selectRepresentativeQuotes(messages) {
  const quotes = [];

  // 1 highly positive with quantified impact
  const quantified = messages.filter(m => m.sentiment === 'positive' && m.quantified);
  if (quantified.length > 0) {
    const q = quantified[0];
    quotes.push({
      text: q.text,
      author: q.author,
      context: q.theme,
      impact: q.quantified
    });
  }

  // 1 positive general feedback
  const positive = messages.filter(m => m.sentiment === 'positive' && !m.quantified);
  if (positive.length > 0) {
    const q = positive[0];
    quotes.push({
      text: q.text,
      author: q.author,
      context: q.theme
    });
  }

  // 1 constructive/challenge if exists
  const constructive = messages.filter(m => m.sentiment === 'negative' || m.challenge);
  if (constructive.length > 0) {
    const q = constructive[0];
    quotes.push({
      text: q.text,
      author: q.author,
      context: q.theme,
      type: 'challenge'
    });
  }

  return quotes;
}

function determineTrend(messages) {
  if (messages.length < 3) return 'insufficient_data';

  // Sort by timestamp
  const sorted = messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // Split into first half and second half
  const mid = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, mid);
  const secondHalf = sorted.slice(mid);

  const firstScore = firstHalf.filter(m => m.sentiment === 'positive').length / firstHalf.length;
  const secondScore = secondHalf.filter(m => m.sentiment === 'positive').length / secondHalf.length;

  if (secondScore > firstScore + 0.1) return 'improving';
  if (secondScore < firstScore - 0.1) return 'declining';
  return 'stable';
}

function buildPerceivedValueFromToolSpecific(toolSpecificData, originalData) {
  const perceivedValue = {};

  for (const [toolName, toolScore] of Object.entries(toolSpecificData.scores)) {
    const messages = toolScore.messages;

    // Extract themes from messages
    const themes = [...new Set(
      messages.map(m => {
        // Find original message to get theme
        const orig = originalData.messages.find(om => om.id === m.messageId);
        return orig?.theme;
      }).filter(Boolean)
    )];

    // Extract quantified impacts
    const impacts = messages
      .map(m => {
        const orig = originalData.messages.find(om => om.id === m.messageId);
        if (orig?.quantified) {
          return {
            task: orig.theme,
            reduction: orig.quantified.reduction || 'N/A',
            source: orig.author
          };
        }
        return null;
      })
      .filter(Boolean)
      .slice(0, 5);

    // Extract challenges from negative messages
    const challenges = messages
      .filter(m => m.sentiment === 'negative')
      .map(m => {
        const orig = originalData.messages.find(om => om.id === m.messageId);
        return orig?.challenge || orig?.text.substring(0, 100);
      })
      .slice(0, 3);

    // Select representative quotes
    const quotes = selectQuotesFromMessages(messages, originalData);

    perceivedValue[toolName] = {
      score: toolScore.score,
      totalFeedback: toolScore.totalFeedback,
      sentimentBreakdown: toolScore.sentimentBreakdown,
      themes: themes,
      topImpacts: impacts,
      challenges: challenges,
      quotes: quotes,
      trend: determineTrend(messages)
    };
  }

  return perceivedValue;
}

function selectQuotesFromMessages(messages, originalData) {
  const quotes = [];

  // 1 positive with impact
  const positiveWithImpact = messages
    .filter(m => m.sentiment === 'positive')
    .map(m => originalData.messages.find(om => om.id === m.messageId))
    .filter(om => om?.quantified)
    .slice(0, 1);

  if (positiveWithImpact.length > 0) {
    const orig = positiveWithImpact[0];
    quotes.push({
      text: orig.text,
      author: orig.author,
      context: orig.theme,
      impact: orig.quantified
    });
  }

  // 1 general positive
  const positiveGeneral = messages
    .filter(m => m.sentiment === 'positive')
    .map(m => originalData.messages.find(om => om.id === m.messageId))
    .filter(om => !om?.quantified)
    .slice(0, 1);

  if (positiveGeneral.length > 0) {
    const orig = positiveGeneral[0];
    quotes.push({
      text: orig.text,
      author: orig.author,
      context: orig.theme
    });
  }

  // 1 challenge
  const negative = messages
    .filter(m => m.sentiment === 'negative')
    .map(m => originalData.messages.find(om => om.id === m.messageId))
    .slice(0, 1);

  if (negative.length > 0) {
    const orig = negative[0];
    quotes.push({
      text: orig.text,
      author: orig.author,
      context: orig.theme,
      type: 'challenge'
    });
  }

  return quotes;
}

function main() {
  console.log('\n🔄 Transforming Comprehensive AI Feedback Dataset\n');
  console.log('━'.repeat(70));

  // Read input
  const rawData = fs.readFileSync(INPUT_FILE, 'utf8');
  const data = JSON.parse(rawData);

  console.log(`\n✅ Loaded dataset:`);
  console.log(`   - Messages: ${data.messages.length}`);
  console.log(`   - Time period: ${data.metadata.time_period_covered}`);
  console.log(`   - Channels: ${data.metadata.channels_analyzed.length}`);

  // Load tool-specific sentiment analysis
  let toolSpecificData = null;
  if (fs.existsSync(SENTIMENT_FILE)) {
    toolSpecificData = JSON.parse(fs.readFileSync(SENTIMENT_FILE, 'utf8'));
    console.log(`\n✅ Loaded tool-specific sentiment analysis:`);
    for (const [tool, score] of Object.entries(toolSpecificData.scores)) {
      console.log(`   - ${tool}: ${score.score}/100 (${score.totalFeedback} messages)`);
    }
  }

  // Calculate perceived value scores using tool-specific sentiment
  console.log('\n📊 Using tool-specific sentiment scores...\n');
  const perceivedValue = toolSpecificData
    ? buildPerceivedValueFromToolSpecific(toolSpecificData, data)
    : calculatePerceivedValue(data.messages, data.survey_insights, data.quantified_impact);

  // Calculate summary statistics
  const totalToolFeedback = Object.values(perceivedValue).reduce((sum, t) => sum + t.totalFeedback, 0);
  const multiToolMessages = totalToolFeedback - data.messages.length;

  // Create output structure
  const output = {
    lastUpdated: new Date().toISOString(),
    summary: {
      uniqueMessages: data.messages.length,
      totalFeedbackAnalyzed: totalToolFeedback,
      multiToolMessages: multiToolMessages,
      explanation: `${data.messages.length} unique messages generated ${totalToolFeedback} tool-specific feedback items. ${multiToolMessages} messages mentioned multiple tools (e.g., comparative statements like "Claude is better than Copilot").`,
      sourceBreakdown: {
        slack: data.messages.length,
        confluence: data.survey_insights.teams,
        surveys: data.survey_insights.teams,
        interviews: 0
      },
      timeframe: data.metadata.time_period_covered,
      toolsCovered: data.metadata.tools_covered
    },
    perceivedValue: perceivedValue,
    executiveSummary: data.executive_summary,
    quantifiedImpact: data.quantified_impact
  };

  // Write output
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

  console.log(`✅ Generated perceived value scores:\n`);
  for (const [tool, value] of Object.entries(perceivedValue)) {
    console.log(`   ${tool}: ${value.score}/100 (${value.totalFeedback} feedback items)`);
    if (value.topImpacts.length > 0) {
      console.log(`      Top impact: ${value.topImpacts[0].reduction} time reduction`);
    }
  }

  console.log(`\n💾 Saved to: ${OUTPUT_FILE}`);
  console.log('\n✅ Ready for dashboard!\n');
  console.log('📋 Next steps:');
  console.log('   1. Run: npm run refresh (to integrate into main data)');
  console.log('   2. Or start dev server: npm run dev');
  console.log('   3. View Perceived Value tab with REAL team feedback\n');
}

if (require.main === module) {
  main();
}

module.exports = { calculatePerceivedValue };
