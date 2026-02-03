# Perceived Value Dynamic Implementation Plan

**Date**: January 4, 2026
**Branch**: `feature/perceived-value-dynamic-analysis`
**Goal**: Replace static perceived-value.json with dynamic sentiment analysis pipeline

---

## 🎯 Objective

Transform the Perceived Value tab from static manually-curated data to a fully automated sentiment analysis pipeline that:
1. Fetches messages from 6 Slack channels via API
2. Analyzes sentiment using Claude API (Anthropic SDK)
3. Aggregates metrics (perceived value score, NPS, themes, quotes)
4. Integrates into main data pipeline (`parse-copilot-data.js`)
5. Generates AI-powered insights

---

## 📋 Current State

### What We Have
- ✅ **UI Already Built**: Perceived Value tab fully implemented in `app/page.jsx` (lines 5470-5669)
- ✅ **Static Data**: `data/perceived-value.json` with 145 feedback items
- ✅ **Dependencies Installed**:
  - `@slack/web-api@7.0.0` for Slack API
  - `@anthropic-ai/sdk@0.71.2` for Claude sentiment analysis
  - `axios@1.6.0` for Confluence API (future)
- ✅ **Architecture Documented**: Comprehensive plan in `docs/PERCEIVED_VALUE_ARCHITECTURE.md`
- ✅ **Data Schema Defined**: TypeScript interfaces for all data structures

### What's Missing
- ❌ Slack API integration script (`scripts/parse-slack-sentiment.js`)
- ❌ Sentiment analysis script (`scripts/analyze-sentiment.js`)
- ❌ Aggregation script (`scripts/aggregate-sentiment.js`)
- ❌ Integration into main pipeline (`scripts/parse-copilot-data.js`)
- ❌ Environment variables for Slack API (`.env`)
- ❌ New AI insights for sentiment trends

---

## 📊 Data Structure (Target)

### Input: Slack Messages
```javascript
[
  {
    channelId: "C01234567",
    channelName: "claude-code-dev",
    userId: "U01234567",
    text: "Claude Code is 10x faster than Copilot...",
    timestamp: Date,
    reactions: [],
    threadTs: null
  }
]
```

### Output: Aggregated Sentiment
```javascript
{
  "perceivedValue": {
    "Claude Enterprise": {
      "perceivedValueScore": 87,
      "avgSentiment": 0.72,
      "nps": 64,
      "feedbackCount": 67,
      "sentimentTrend": [...],
      "topThemes": [...],
      "representativeQuotes": [...],
      "painPoints": [...],
      "departmentSentiment": [...]
    }
  }
}
```

---

## 🏗️ Implementation Plan (Baby Steps)

### Phase 1: Slack API Integration (Week 1)

#### Step 1.1: Environment Setup
- [ ] Add `SLACK_BOT_TOKEN` to `.env` file
- [ ] Document Slack app setup in README
- [ ] Test Slack API connection with simple fetch

**Files Modified**:
- `.env` (add token)
- `.env.example` (add placeholder)

---

#### Step 1.2: Create Slack Sentiment Parser
- [ ] Create `scripts/parse-slack-sentiment.js`
- [ ] Implement Slack WebClient connection
- [ ] Fetch messages from 6 channels (last 30 days)
- [ ] Filter by AI tool keywords
- [ ] Enrich with user metadata (Slack Users API)
- [ ] Match user emails to org chart departments
- [ ] Output raw messages to `data/slack-sentiment-raw.json`

**Files Created**:
- `scripts/parse-slack-sentiment.js` (~530 lines, see architecture doc)

**Configuration**:
```javascript
const SLACK_CHANNELS = {
  'claude-code-dev': 'C01234567',
  'claude-enterprise': 'C01234568',
  'ai-collab': 'C01234569',
  'techco-thrv': 'C01234570',
  'as-ai-dev': 'C01234571',
  'technology': 'C01234572'
};

const AI_TOOL_KEYWORDS = [
  'claude', 'copilot', 'm365', 'microsoft 365',
  'github copilot', 'chatgpt', 'ai tool'
];
```

**Testing**:
```bash
node scripts/parse-slack-sentiment.js
# Expected output: data/slack-sentiment-raw.json with ~100-200 messages
```

---

### Phase 2: Sentiment Analysis with Claude API (Week 1)

#### Step 2.1: Create Sentiment Analyzer
- [ ] Create `scripts/analyze-sentiment.js`
- [ ] Implement Claude API prompt for sentiment extraction
- [ ] Batch process messages (100ms delay for rate limiting)
- [ ] Parse JSON responses with schema:
  - `sentiment_score` (-1 to +1)
  - `confidence` (0 to 1)
  - `topics` (array of themes)
  - `tool_mentioned` (string)
  - `features_mentioned` (array)
  - `intent` (praise/complaint/question/feature_request)
  - `summary` (1-2 sentences)
- [ ] Handle errors gracefully (retry logic)
- [ ] Output analyzed data to `data/sentiment-analyzed.json`

**Files Created**:
- `scripts/analyze-sentiment.js` (~300 lines)

**Claude API Prompt Template**:
```javascript
const prompt = `Analyze this Slack message for AI tool sentiment.

Message: "${message.text}"
User: ${message.userName} (${message.department})
Channel: #${message.channelName}
Date: ${message.timestamp.toISOString().split('T')[0]}

Extract:
1. sentiment_score: -1 (very negative) to +1 (very positive)
2. confidence: 0 (uncertain) to 1 (very confident)
3. topics: list of themes (e.g., "productivity", "ease_of_use", "cost")
4. tool_mentioned: "Claude Enterprise" | "Claude Code" | "M365 Copilot" | "GitHub Copilot" | "ChatGPT" | null
5. features_mentioned: list of specific features
6. intent: "praise" | "complaint" | "question" | "feature_request" | "neutral"
7. summary: 1-2 sentence summary

Return ONLY valid JSON, no other text.`;
```

**Testing**:
```bash
node scripts/analyze-sentiment.js data/slack-sentiment-raw.json
# Expected: Each message enriched with sentiment data
```

---

### Phase 3: Aggregation & Metrics Calculation (Week 2)

#### Step 3.1: Create Aggregation Script
- [ ] Create `scripts/aggregate-sentiment.js`
- [ ] Group messages by `tool_mentioned`
- [ ] Calculate core metrics per tool:
  - `perceivedValueScore` (composite: sentiment + NPS + volume boost)
  - `avgSentiment` (mean of scores)
  - `nps` (calculated from sentiment thresholds)
  - `feedbackCount`
- [ ] Calculate sentiment trend (monthly aggregation)
- [ ] Extract top themes (count + avg sentiment per topic)
- [ ] Extract representative quotes (high sentiment + high confidence)
- [ ] Extract pain points (negative sentiment + complaint intent)
- [ ] Calculate department sentiment breakdown
- [ ] Output aggregated data to `data/sentiment-aggregated.json`

**Files Created**:
- `scripts/aggregate-sentiment.js` (~400 lines)

**Key Algorithms**:
```javascript
// Perceived Value Score (0-100)
function calculatePerceivedValueScore(messages) {
  const avgSentiment = mean(messages.map(m => m.sentiment_score));
  const nps = calculateNPS(messages);

  const sentimentScore = (avgSentiment + 1) * 50; // 0-100
  const npsScore = (nps + 100) / 2; // 0-100
  const volumeBoost = Math.min(Math.log10(messages.length) / 5, 1);

  return Math.round(sentimentScore * 0.6 + npsScore * 0.4);
}

// NPS (-100 to +100)
function calculateNPS(messages) {
  const promoters = messages.filter(m => m.sentiment_score > 0.5).length;
  const detractors = messages.filter(m => m.sentiment_score < -0.5).length;
  return Math.round(((promoters - detractors) / messages.length) * 100);
}
```

**Testing**:
```bash
node scripts/aggregate-sentiment.js data/sentiment-analyzed.json
# Expected: Aggregated metrics matching perceived-value.json schema
```

---

### Phase 4: Integration into Main Pipeline (Week 2)

#### Step 4.1: Update Main Data Parser
- [ ] Update `scripts/parse-copilot-data.js`
- [ ] Import sentiment pipeline functions
- [ ] Add sentiment parsing step after usage metrics
- [ ] Merge sentiment data into `outputData.perceivedValue`
- [ ] Ensure backward compatibility (fallback to static data)
- [ ] Test full pipeline end-to-end

**Files Modified**:
- `scripts/parse-copilot-data.js` (add ~50 lines)

**Integration Code**:
```javascript
// Add after calculating usage metrics, before generating insights
console.log('\n💬 Parsing sentiment data...');

try {
  // Step 1: Fetch Slack messages
  const slackMessages = await parseSlackSentiment();

  // Step 2: Analyze sentiment with Claude API
  const analyzedMessages = await analyzeSentiment(slackMessages);

  // Step 3: Aggregate metrics
  const perceivedValue = await aggregateSentiment(analyzedMessages);

  // Step 4: Merge into output
  outputData.perceivedValue = perceivedValue;

  console.log(`✅ Analyzed ${analyzedMessages.length} feedback items`);
} catch (error) {
  console.error('⚠️ Sentiment analysis failed, using cached data:', error.message);
  // Fallback to static perceived-value.json
  outputData.perceivedValue = require('../data/perceived-value.json').perceivedValue;
}
```

**Testing**:
```bash
npm run refresh
# Expected: ai-tools-data.json contains dynamically generated perceivedValue
```

---

### Phase 5: AI Insights Generation (Week 2)

#### Step 5.1: Add Sentiment Insights
- [ ] Update `scripts/generate-insights.js`
- [ ] Add new insight generators:
  - `perceivedValueOverview` - Overall sentiment summary
  - `sentimentTrend` - Trend analysis over time
  - `sentimentVsUsageCorrelation` - Correlate sentiment with usage
  - `topPainPoints` - Key areas for improvement
  - `departmentSentimentVariance` - Department comparison
- [ ] Test AI-generated insights quality
- [ ] Validate insights align with data

**Files Modified**:
- `scripts/generate-insights.js` (add ~200 lines)

**New Insight Types**:
```javascript
async function generateSentimentInsight(chartType, perceivedValueData) {
  if (chartType === 'perceivedValueOverview') {
    const prompt = `You are a user sentiment analyst reviewing AI tool feedback.

Data:
- Claude Enterprise: Sentiment ${perceivedValueData.claudeEnterprise.avgSentiment}, NPS ${perceivedValueData.claudeEnterprise.nps}, ${perceivedValueData.claudeEnterprise.feedbackCount} responses
- M365 Copilot: Sentiment ${perceivedValueData.m365Copilot.avgSentiment}, NPS ${perceivedValueData.m365Copilot.nps}, ${perceivedValueData.m365Copilot.feedbackCount} responses

Top themes: ${JSON.stringify(perceivedValueData.claudeEnterprise.topThemes.slice(0, 3))}
Pain points: ${JSON.stringify(perceivedValueData.claudeEnterprise.painPoints.slice(0, 2))}

Provide 2-3 sentences analyzing:
1. Which tool has best sentiment and why?
2. What are users loving vs. struggling with?
3. Actionable recommendation to improve sentiment

Be specific. Reference numbers. Be concise.`;

    return await callClaudeAPI(prompt);
  }
}
```

**Testing**:
```bash
node scripts/generate-insights.js
# Expected: Insights array includes 3-5 new sentiment-based insights
```

---

### Phase 6: UI Integration & Testing (Week 3)

#### Step 6.1: Update UI Data Source
- [ ] Verify `app/page.jsx` Perceived Value tab consumes `aiToolsData.perceivedValue`
- [ ] Remove hardcoded import of `perceived-value.json`
- [ ] Test all UI components render correctly with dynamic data
- [ ] Test edge cases (missing data, empty arrays)

**Files Modified**:
- `app/page.jsx` (remove static import, add null checks)

**Before**:
```javascript
import perceivedValueData from '../data/perceived-value.json';
```

**After**:
```javascript
// Perceived value data now comes from aiToolsData.perceivedValue
const perceivedValueData = aiToolsData.perceivedValue || {};
```

---

#### Step 6.2: End-to-End Testing
- [ ] Run full data pipeline: `npm run refresh`
- [ ] Verify `ai-tools-data.json` contains `perceivedValue` section
- [ ] Start dev server: `npm run dev`
- [ ] Navigate to Perceived Value tab
- [ ] Verify all sections render:
  - Overview cards (4 tools)
  - Sentiment trend charts
  - Top themes with bars
  - Representative quotes
  - Pain points
  - Department sentiment breakdown
- [ ] Check browser console for errors
- [ ] Test mobile responsive layout

**Testing Checklist**:
- [ ] Overview cards show correct scores (0-100)
- [ ] Sentiment trend line charts display
- [ ] Themes sorted by frequency
- [ ] Quotes display with proper attribution
- [ ] Pain points show negative sentiment
- [ ] Department bars render correctly
- [ ] No console errors
- [ ] Mobile layout works

---

## 🔧 Environment Setup

### Required API Tokens

#### Slack Bot Token (REQUIRED)
1. Go to https://api.slack.com/apps
2. Create new app: "AI Tools Sentiment Analyzer"
3. Add Bot Token Scopes:
   - `channels:history` (read public channel messages)
   - `channels:read` (list channels)
   - `users:read` (get user info)
4. Install app to workspace
5. Copy Bot Token (starts with `xoxb-`)
6. Add to `.env`: `SLACK_BOT_TOKEN=xoxb-...`

#### Anthropic API Key (ALREADY HAVE)
- ✅ Already configured in `.env`
- Used by `scripts/generate-insights.js` (working)
- Will reuse for sentiment analysis

#### Slack Channel IDs (NEEDED)
Run this script to get channel IDs:
```javascript
const { WebClient } = require('@slack/web-api');
const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

async function listChannels() {
  const result = await slack.conversations.list({ types: 'public_channel' });
  result.channels.forEach(ch => {
    if (['claude-code-dev', 'claude-enterprise', 'ai-collab',
         'techco-thrv', 'as-ai-dev', 'technology'].includes(ch.name)) {
      console.log(`'${ch.name}': '${ch.id}',`);
    }
  });
}
listChannels();
```

---

## 📈 Success Metrics

### Technical Metrics
- ✅ Pipeline runs successfully in < 30 minutes
- ✅ Sentiment analysis confidence > 0.7 for 80%+ of messages
- ✅ 100+ feedback items analyzed per month
- ✅ All 4 tools have sentiment data (Claude Enterprise, Claude Code, M365, GitHub)
- ✅ Perceived value scores align with usage trends

### Quality Metrics
- ✅ Representative quotes are actual user quotes (not hallucinated)
- ✅ Pain points match themes with negative sentiment
- ✅ Department sentiment correlates with usage patterns
- ✅ AI insights provide actionable recommendations

### Business Impact
- ✅ Executives use perceived value data in budget discussions
- ✅ Sentiment trends predict adoption changes 30 days ahead
- ✅ Pain points addressed result in improved sentiment scores

---

## 🚨 Risk Mitigation

### Risk: Slack API Rate Limits
- **Mitigation**: 100ms delay between requests, sequential channel processing
- **Fallback**: Use cached data from previous run

### Risk: Claude API Failures
- **Mitigation**: Retry logic with exponential backoff, queue failed items
- **Fallback**: Rule-based sentiment (keyword matching)

### Risk: Missing User Metadata
- **Mitigation**: Gracefully handle unknown departments/users
- **Fallback**: Mark as "Unknown" department, still include in aggregation

### Risk: Data Quality (Spam/Bot Messages)
- **Mitigation**: Filter out bot messages, require AI tool keywords
- **Validation**: Manual review of first 50 messages before full run

---

## 🎓 Next Steps After Phase 1

### Phase 2: Survey Integration (Future)
- Create Google Forms survey for AI tool satisfaction
- Parse CSV exports → sentiment pipeline
- Structured NPS scores (more reliable than inferred)

### Phase 3: Confluence Integration (Future)
- Fetch wiki pages with labels: "ai-tools", "retrospective"
- Parse markdown content → Claude API analysis
- Extract action items and best practices

### Phase 4: Automation (Future)
- Set up cron job for daily pipeline runs
- Delta processing (only new messages since last run)
- Slack alerts for sudden sentiment drops

---

## 📚 References

- **Architecture**: `/docs/PERCEIVED_VALUE_ARCHITECTURE.md` (2037 lines)
- **Pipeline Diagram**: `/docs/SENTIMENT_PIPELINE_ARCHITECTURE.md` (791 lines)
- **Current UI**: `app/page.jsx` lines 5470-5669
- **Current Data**: `data/perceived-value.json` (486 lines)
- **Slack API Docs**: https://api.slack.com/methods
- **Anthropic SDK**: https://github.com/anthropics/anthropic-sdk-typescript

---

## ✅ Completion Criteria

**Phase 1 Complete When**:
- ✅ Slack API integration working (fetches messages from 6 channels)
- ✅ Claude API sentiment analysis working (JSON responses parsed)
- ✅ Aggregation generates perceived value scores matching schema
- ✅ Integration into main pipeline successful (ai-tools-data.json updated)
- ✅ UI renders dynamic data correctly (all sections display)
- ✅ No console errors, no visual regressions
- ✅ Documentation updated (SESSION_RESUME.md)

**Ready for Production When**:
- ✅ All Phase 1 criteria met
- ✅ End-to-end testing passed (checklist above)
- ✅ Performance acceptable (< 30 min pipeline runtime)
- ✅ Error handling robust (graceful fallbacks)
- ✅ Code reviewed and committed to feature branch

---

**Last Updated**: January 4, 2026
**Status**: Planning Complete → Ready to Implement Phase 1.1
