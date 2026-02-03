/**
 * Multi-Tool Sentiment Extraction
 *
 * Analyzes each message for tool-specific sentiment using Claude API.
 * A single message can have different sentiments for different tools.
 *
 * Example:
 * "Claude is amazing but Copilot was slow"
 *   → Claude: positive
 *   → Copilot: negative
 */

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const INPUT_FILE = path.join(__dirname, '../data/ai_tools_feedback_comprehensive_dataset.json');
const OUTPUT_FILE = path.join(__dirname, '../data/tool-specific-sentiment.json');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const TOOLS = [
  'Claude Enterprise',
  'Claude Code',
  'GitHub Copilot',
  'M365 Copilot',
  'ChatGPT'
];

async function extractToolSpecificSentiment(message) {
  const prompt = `Analyze this feedback message and extract sentiment for EACH AI tool mentioned.

Message: "${message.text}"
Author: ${message.author}
Channel: ${message.channel}

For each of these tools mentioned in the message, determine:
1. Is the tool explicitly or implicitly mentioned?
2. What is the sentiment toward that specific tool? (positive, neutral, negative, or not_mentioned)

Tools to analyze:
- Claude Enterprise (includes "Claude", "Claude connected", "Claude Enterprise")
- Claude Code (includes "Claude Code", "Premium")
- GitHub Copilot (coding assistant for engineers)
- M365 Copilot (Microsoft Office assistant for business users)
- ChatGPT

CRITICAL: When "Copilot" is mentioned WITHOUT specifying which one, use CONTEXT CLUES:

GitHub Copilot indicators:
- Mentions: VS Code, Visual Studio, IDE, code editor, code review, PR review
- Activities: coding, programming, debugging, testing, development
- Tools/Tech: Git, repositories, pull requests, code completion
- Job roles: Engineers, developers, software engineers

M365 Copilot indicators:
- Mentions: Outlook, SharePoint, Teams, Word, Excel, PowerPoint, Office, M365
- Activities: pre-call prep, sales research, email drafting, document creation
- Job roles: BDR, sales, business development, account executives
- Use cases: customer research, meeting prep, business analysis

If message says "BDR team on Copilot" or "pre-call prep with Copilot" → M365 Copilot
If message says "Copilot in VS Code" or "coding with Copilot" → GitHub Copilot

IMPORTANT:
- Comparative statements have different sentiments for each tool
  Example: "Claude is faster than Copilot" → Claude: positive, Copilot: negative
- "Previous with X" or "Used to use X" indicates negative sentiment toward X
- "Prefer Y over X" → Y: positive, X: negative
- When context indicates M365 Copilot, do NOT mark GitHub Copilot

Return ONLY valid JSON (no markdown, no explanation):
{
  "Claude Enterprise": "positive|neutral|negative|not_mentioned",
  "Claude Code": "positive|neutral|negative|not_mentioned",
  "GitHub Copilot": "positive|neutral|negative|not_mentioned",
  "M365 Copilot": "positive|neutral|negative|not_mentioned",
  "ChatGPT": "positive|neutral|negative|not_mentioned"
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      temperature: 0.1,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const content = response.content[0].text.trim();

    // Remove markdown code blocks if present
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                     content.match(/```\s*([\s\S]*?)\s*```/);
    const jsonText = jsonMatch ? jsonMatch[1] : content;

    const toolSentiments = JSON.parse(jsonText);

    return {
      messageId: message.id,
      text: message.text,
      author: message.author,
      channel: message.channel,
      timestamp: message.timestamp,
      toolSentiments: toolSentiments
    };

  } catch (error) {
    console.error(`Error analyzing message ${message.id}:`, error.message);
    return null;
  }
}

async function processMessagesInBatches(messages, batchSize = 5) {
  const results = [];

  console.log(`\n📊 Processing ${messages.length} messages in batches of ${batchSize}...\n`);

  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(messages.length / batchSize);

    console.log(`   Batch ${batchNum}/${totalBatches}: Processing messages ${i + 1}-${Math.min(i + batchSize, messages.length)}...`);

    const batchPromises = batch.map(msg => extractToolSpecificSentiment(msg));
    const batchResults = await Promise.all(batchPromises);

    results.push(...batchResults.filter(r => r !== null));

    // Rate limiting: wait 1 second between batches
    if (i + batchSize < messages.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}

function redistributeByTool(analyzedMessages) {
  const toolMessages = {
    'Claude Enterprise': [],
    'Claude Code': [],
    'GitHub Copilot': [],
    'M365 Copilot': [],
    'ChatGPT': []
  };

  for (const msg of analyzedMessages) {
    for (const [tool, sentiment] of Object.entries(msg.toolSentiments)) {
      if (sentiment !== 'not_mentioned') {
        toolMessages[tool].push({
          messageId: msg.messageId,
          text: msg.text,
          author: msg.author,
          channel: msg.channel,
          timestamp: msg.timestamp,
          sentiment: sentiment // positive, neutral, or negative FOR THIS TOOL
        });
      }
    }
  }

  return toolMessages;
}

function calculateToolScores(toolMessages) {
  const scores = {};

  for (const [tool, messages] of Object.entries(toolMessages)) {
    const sentiments = {
      positive: messages.filter(m => m.sentiment === 'positive').length,
      neutral: messages.filter(m => m.sentiment === 'neutral').length,
      negative: messages.filter(m => m.sentiment === 'negative').length
    };

    const total = sentiments.positive + sentiments.neutral + sentiments.negative;

    // Weighted score: positive=100, neutral=50, negative=0
    const score = total > 0
      ? Math.round(((sentiments.positive * 100) + (sentiments.neutral * 50)) / total)
      : 50;

    scores[tool] = {
      score: score,
      totalFeedback: total,
      sentimentBreakdown: sentiments,
      messages: messages
    };
  }

  return scores;
}

async function main() {
  console.log('\n🔍 Multi-Tool Sentiment Extraction');
  console.log('━'.repeat(70));

  // Load comprehensive dataset
  const data = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
  console.log(`\n✅ Loaded ${data.messages.length} messages`);

  // Process messages with Claude API
  const analyzedMessages = await processMessagesInBatches(data.messages);

  console.log(`\n✅ Analyzed ${analyzedMessages.length} messages successfully\n`);

  // Redistribute messages by tool
  const toolMessages = redistributeByTool(analyzedMessages);

  console.log('📊 Messages per tool:');
  for (const [tool, messages] of Object.entries(toolMessages)) {
    const pos = messages.filter(m => m.sentiment === 'positive').length;
    const neu = messages.filter(m => m.sentiment === 'neutral').length;
    const neg = messages.filter(m => m.sentiment === 'negative').length;
    console.log(`   ${tool}: ${messages.length} (${pos} pos, ${neu} neu, ${neg} neg)`);
  }

  // Calculate scores
  const scores = calculateToolScores(toolMessages);

  console.log('\n📈 Calculated scores:');
  for (const [tool, data] of Object.entries(scores)) {
    console.log(`   ${tool}: ${data.score}/100`);
  }

  // Save results
  const output = {
    lastUpdated: new Date().toISOString(),
    methodology: 'Multi-tool sentiment extraction using Claude API',
    toolMessages: toolMessages,
    scores: scores,
    rawAnalysis: analyzedMessages
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

  console.log(`\n💾 Saved to: ${OUTPUT_FILE}`);
  console.log('\n📋 Next steps:');
  console.log('   1. Run: node scripts/transform-comprehensive-data.js');
  console.log('   2. Run: npm run refresh');
  console.log('   3. View corrected data in dashboard\n');
}

if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { extractToolSpecificSentiment, redistributeByTool };
