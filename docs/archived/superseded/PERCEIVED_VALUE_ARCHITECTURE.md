# Perceived Value: Sentiment Analysis Architecture & UI

## Executive Summary

**Current Gap**: The dashboard captures **objective metrics** (usage, lines of code, conversations) but not **subjective sentiment** (how users *feel*, what they *value*, pain points, success stories).

**Solution**: Add "Perceived Value" as part of the **💎 Value Framework**, which encompasses:
- **Productivity** (Data-Driven): Quantitative efficiency gains
- **Perceived Value** (Sentiment-Driven): User satisfaction & sentiment ← THIS DOCUMENT
- **Outcomes** (Business Impact - Future): Department-specific KPIs

**Perceived Value Data Sources**:
- Slack channel sentiment analysis (6 channels, automated via Slack API)
- Confluence wikis & retrospectives (automated via Confluence API)
- Survey responses (structured feedback, CSV import)
- Interview transcripts (qualitative insights, markdown files)

**Value Proposition**: Sentiment data is the **leading indicator** of adoption trends. Usage metrics tell you *what happened*, sentiment tells you *what will happen next*.

**Navigation**: Perceived Value will be accessible via: **💎 Value → Perceived Value** in the grouped navigation dropdown.

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Data Architecture (Pipeline)](#data-architecture-pipeline)
3. [UI/UX Integration](#uiux-integration)
4. [Implementation Roadmap](#implementation-roadmap)
5. [AI Insights from Sentiment](#ai-insights-from-sentiment)

---

## Current State Analysis

### What You Already Have

**Manually Collected Sentiment Data:**
- `/docs/plan/03 - engineering-sentiment-copilot-vs-claude.md` - Engineer quotes from Slack
- **6 Slack channels** identified for monitoring (CLAUDE.md):
  - `#claude-code-dev` - Engineering feedback, wins, issues
  - `#claude-enterprise` - General adoption, use cases, questions
  - `#ai-collab` - Cross-functional collaboration, best practices
  - `#techco-thrv` - Company-wide discussions, strategic insights
  - `#as-ai-dev` - AI development team coordination, technical insights
  - `#technology` - Technical evaluations, budget discussions

**Existing Sentiment Insights:**
- "10x faster than Copilot" - Devin Wagner (Engineering)
- "I prefer Claude over GitHub Copilot" - Roger Hampton (Engineering)
- "Saved me so much time" - Taran Pierce (Engineering)
- Engineers choose Claude models 72% of time in GitHub Copilot

### What's Missing

**No Automated Pipeline:**
- Sentiment data is manually copy-pasted from Slack → markdown files
- No real-time monitoring or trend detection
- No sentiment scoring (positive/negative/neutral)
- No topic extraction (what features/pain points are mentioned most?)
- No cross-tool comparison (Claude vs M365 vs Copilot sentiment)

**No Structured Storage:**
- Quotes live in markdown docs, not queryable database
- Can't filter by date, department, tool, sentiment score
- Can't generate sentiment trends over time
- Can't correlate sentiment with usage metrics

**No Quantification:**
- No Net Promoter Score (NPS)
- No sentiment score distribution
- No "voice of customer" themes/topics
- No keyword frequency analysis

---

## Data Architecture (Pipeline)

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       DATA SOURCES (Sentiment)                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  📱 Slack API      📋 Survey Tools    🎤 Interview Notes  📚 Confluence │
│  (6 channels)      (Google Forms)     (Markdown files)    (Wiki Pages)  │
│                                                                          │
│  • Messages        • Structured Q&A   • Transcripts       • Wiki pages  │
│  • Reactions       • Ratings (1-5)    • Key quotes        • Comments    │
│  • Threads         • NPS scores       • Themes            • Page labels │
│  • User metadata   • Open feedback    • Action items      • Attachments │
│                                                                          │
└──────────┬────────────────┬────────────────┬────────────────┬───────────┘
           │                │                │                │
           ▼                ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     INGESTION LAYER (New Scripts)                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  scripts/parse-slack-sentiment.js                                       │
│  • Fetch messages from 6 Slack channels via Slack API                   │
│  • Filter to AI tool mentions (Claude, M365, Copilot, GitHub)           │
│  • Extract user, timestamp, message, reactions, thread context          │
│  • Enrich with employee metadata (dept, role) from org chart            │
│                                                                          │
│  scripts/parse-survey-data.js                                           │
│  • Parse CSV exports from Google Forms/SurveyMonkey                     │
│  • Extract NPS scores, ratings, open-ended feedback                     │
│  • Map respondents to employees (email → dept, role)                    │
│                                                                          │
│  scripts/parse-interview-notes.js                                       │
│  • Read markdown files from /docs/interviews/                           │
│  • Extract key quotes using regex or AI                                 │
│  • Tag with themes (productivity, ease of use, pain points)             │
│                                                                          │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                  AI ANALYSIS LAYER (Sentiment Scoring)                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  scripts/analyze-sentiment.js (NEW)                                     │
│  • Uses Claude API (Sonnet 4.5) to analyze each message/quote           │
│  • Extracts:                                                             │
│    - Sentiment score: -1 (negative) to +1 (positive)                    │
│    - Confidence: 0-1 (how confident is the analysis?)                   │
│    - Topics: ["productivity", "ease_of_use", "cost_concerns"]           │
│    - Tool mentioned: Claude Enterprise | M365 | Claude Code | GitHub    │
│    - Feature mentioned: "projects", "artifacts", "code_completion"      │
│    - Intent: complaint | praise | question | feature_request            │
│    - Summary: 1-2 sentence summary of the feedback                      │
│                                                                          │
│  Example Claude API prompt:                                             │
│  ```                                                                     │
│  Analyze this Slack message for AI tool sentiment.                      │
│                                                                          │
│  Message: "I've been using Claude Code and have seen impressive         │
│  results... What would have taken weeks is now 80% complete over        │
│  a single week."                                                         │
│                                                                          │
│  User: Devin Wagner (Engineering)                                       │
│  Channel: #claude-code-dev                                              │
│  Date: 2024-11-15                                                       │
│                                                                          │
│  Extract:                                                                │
│  1. sentiment_score (-1 to +1)                                          │
│  2. confidence (0-1)                                                     │
│  3. topics (list of themes)                                             │
│  4. tool_mentioned                                                       │
│  5. features_mentioned                                                   │
│  6. intent (complaint/praise/question/feature_request)                  │
│  7. summary (1-2 sentences)                                             │
│                                                                          │
│  Return JSON.                                                            │
│  ```                                                                     │
│                                                                          │
│  AI Response:                                                            │
│  ```json                                                                 │
│  {                                                                       │
│    "sentiment_score": 0.95,                                             │
│    "confidence": 0.98,                                                   │
│    "topics": ["productivity", "speed", "time_savings"],                 │
│    "tool_mentioned": "Claude Code",                                     │
│    "features_mentioned": ["multi-file tasks", "automation"],            │
│    "intent": "praise",                                                   │
│    "summary": "Engineer reports 10x productivity boost using Claude     │
│    Code for tasks that previously took weeks."                          │
│  }                                                                       │
│  ```                                                                     │
│                                                                          │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       AGGREGATION LAYER                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  scripts/parse-copilot-data.js (UPDATED)                                │
│  • Import sentiment data from analyze-sentiment.js output               │
│  • Aggregate metrics:                                                    │
│    - Average sentiment score by tool                                    │
│    - Sentiment trend over time (monthly average)                        │
│    - Top topics by frequency                                            │
│    - NPS score calculation (% promoters - % detractors)                 │
│    - Department sentiment breakdown                                     │
│    - Correlation: sentiment vs usage (do happy users use more?)         │
│                                                                          │
│  Calculate Perceived Value Score (NEW METRIC):                          │
│  ```javascript                                                           │
│  function calculatePerceivedValueScore(sentimentData) {                 │
│    const avgSentiment = average(sentimentData.scores); // -1 to +1     │
│    const nps = calculateNPS(sentimentData.ratings);    // -100 to +100  │
│    const volumeBoost = Math.log(sentimentData.count);  // More feedback = more reliable │
│                                                                          │
│    // Normalize to 0-100 scale                                          │
│    const sentimentScore = (avgSentiment + 1) * 50;     // 0-100        │
│    const npsScore = (nps + 100) / 2;                   // 0-100        │
│                                                                          │
│    return {                                                              │
│      perceivedValueScore: (sentimentScore * 0.6 + npsScore * 0.4),     │
│      avgSentiment: avgSentiment,                                        │
│      nps: nps,                                                           │
│      feedbackCount: sentimentData.count,                                │
│      confidence: Math.min(volumeBoost / 5, 1) // More feedback = more confident │
│    };                                                                    │
│  }                                                                       │
│  ```                                                                     │
│                                                                          │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          OUTPUT (Enhanced)                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  app/ai-tools-data.json (UPDATED)                                       │
│  {                                                                       │
│    "perceivedValue": {                                                   │
│      "claudeEnterprise": {                                              │
│        "perceivedValueScore": 87,                                       │
│        "avgSentiment": 0.74,  // -1 to +1                               │
│        "nps": 68,              // -100 to +100                          │
│        "feedbackCount": 142,                                            │
│        "sentimentTrend": [                                              │
│          { "month": "Sep 2024", "score": 0.65, "count": 34 },          │
│          { "month": "Oct 2024", "score": 0.72, "count": 45 },          │
│          { "month": "Nov 2024", "score": 0.78, "count": 53 }           │
│        ],                                                                │
│        "topThemes": [                                                    │
│          { "theme": "productivity", "count": 78, "avgSentiment": 0.89 },│
│          { "theme": "ease_of_use", "count": 45, "avgSentiment": 0.62 },│
│          { "theme": "cost_concerns", "count": 23, "avgSentiment": -0.35}│
│        ],                                                                │
│        "departmentSentiment": [                                          │
│          { "dept": "Engineering", "score": 0.92, "count": 67 },        │
│          { "dept": "Product", "score": 0.81, "count": 34 },            │
│          { "dept": "Marketing", "score": 0.58, "count": 19 }           │
│        ],                                                                │
│        "representativeQuotes": [                                         │
│          {                                                               │
│            "quote": "10x faster than Copilot with better quality",     │
│            "author": "Devin Wagner",                                    │
│            "department": "Engineering",                                  │
│            "date": "2024-11-15",                                        │
│            "sentiment": 0.95,                                            │
│            "source": "slack:#claude-code-dev"                           │
│          }                                                               │
│        ],                                                                │
│        "painPoints": [                                                   │
│          {                                                               │
│            "theme": "cost",                                             │
│            "description": "Engineers want Premium but budget constrained",│
│            "frequency": 12,                                              │
│            "avgSentiment": -0.45                                        │
│          }                                                               │
│        ]                                                                 │
│      },                                                                  │
│      "m365Copilot": { /* similar structure */ },                        │
│      "claudeCode": { /* similar structure */ },                         │
│      "githubCopilot": { /* similar structure */ },                      │
│      "crossToolComparison": {                                            │
│        "claudeVsGithub": {                                              │
│          "preferenceScore": 0.68, // % preferring Claude               │
│          "quotes": [/* quotes comparing both */]                        │
│        }                                                                 │
│      }                                                                   │
│    }                                                                     │
│  }                                                                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Data Pipeline Implementation

### Phase 1: Slack API Integration (Highest Priority)

**Script**: `scripts/parse-slack-sentiment.js`

#### Step 1: Setup Slack App

```bash
# 1. Create Slack App at https://api.slack.com/apps
#    - App Name: "AI Tools Sentiment Analyzer"
#    - Workspace: TechCo Inc
#
# 2. Add Bot Token Scopes:
#    - channels:history (read public channel messages)
#    - channels:read (list channels)
#    - users:read (get user info)
#
# 3. Install App to Workspace
#
# 4. Copy Bot Token (xoxb-...) to .env file
```

#### Step 2: Environment Setup

**✅ API Tokens We Already Have:**
- **ANTHROPIC_API_KEY**: Already configured and working!
  - Currently used by: `scripts/generate-insights.js` (generates 15 AI insights)
  - Will also be used by: `scripts/analyze-sentiment.js` (sentiment scoring)
  - No additional token needed - same key works for both!

**❌ API Tokens We Need (For Data Collection):**
- **SLACK_BOT_TOKEN**: Fetch messages from 6 Slack channels
- **CONFLUENCE_API_TOKEN**: Fetch wiki pages and retrospectives
- **Surveys & Interviews**: No API needed (local CSV/markdown files)

```bash
# .env file (add to .gitignore!)

# ✅ ALREADY HAVE (for AI sentiment analysis)
ANTHROPIC_API_KEY=your-existing-key

# ❌ NEED TO ADD (for data collection)
SLACK_BOT_TOKEN=xoxb-your-token-here
CONFLUENCE_BASE_URL=https://techco.atlassian.net/wiki
CONFLUENCE_EMAIL=your-email@techco.com
CONFLUENCE_API_TOKEN=your-confluence-token-here
```

#### Step 3: Script Architecture

```javascript
// scripts/parse-slack-sentiment.js

const { WebClient } = require('@slack/web-api');
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Configuration
const SLACK_CHANNELS = {
  'claude-code-dev': 'C01234567',      // Replace with actual channel IDs
  'claude-enterprise': 'C01234568',
  'ai-collab': 'C01234569',
  'techco-thrv': 'C01234570',
  'as-ai-dev': 'C01234571',
  'technology': 'C01234572'
};

const AI_TOOL_KEYWORDS = [
  'claude', 'copilot', 'm365', 'microsoft 365', 'github copilot',
  'chatgpt', 'gemini', 'ai tool', 'llm'
];

// Main function
async function parseSlackSentiment() {
  console.log('🔍 Fetching Slack messages from 6 channels...');

  const allMessages = [];
  const now = Math.floor(Date.now() / 1000);
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60); // Last 30 days

  // Fetch messages from each channel
  for (const [channelName, channelId] of Object.entries(SLACK_CHANNELS)) {
    try {
      console.log(`  Fetching from #${channelName}...`);

      const result = await slack.conversations.history({
        channel: channelId,
        oldest: thirtyDaysAgo.toString(),
        limit: 1000
      });

      const messages = result.messages
        .filter(msg => !msg.bot_id) // Exclude bot messages
        .filter(msg => containsAIToolKeyword(msg.text))
        .map(msg => ({
          channelId,
          channelName,
          userId: msg.user,
          text: msg.text,
          timestamp: new Date(parseFloat(msg.ts) * 1000),
          reactions: msg.reactions || [],
          threadTs: msg.thread_ts,
          replyCount: msg.reply_count || 0
        }));

      allMessages.push(...messages);
      console.log(`    Found ${messages.length} relevant messages`);

    } catch (error) {
      console.error(`    Error fetching #${channelName}:`, error.message);
    }
  }

  console.log(`\n✅ Total messages collected: ${allMessages.length}`);

  // Enrich with user metadata
  console.log('\n👤 Enriching with user metadata...');
  const enrichedMessages = await enrichWithUserData(allMessages);

  // Analyze sentiment with Claude
  console.log('\n🤖 Analyzing sentiment with Claude API...');
  const analyzedMessages = await analyzeSentimentBatch(enrichedMessages);

  // Save raw output
  fs.writeFileSync(
    'data/slack-sentiment-raw.json',
    JSON.stringify(analyzedMessages, null, 2)
  );

  console.log('\n💾 Saved to data/slack-sentiment-raw.json');

  return analyzedMessages;
}

// Helper: Check if message contains AI tool keyword
function containsAIToolKeyword(text) {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return AI_TOOL_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

// Helper: Enrich messages with user data
async function enrichWithUserData(messages) {
  const orgChart = JSON.parse(fs.readFileSync('data/techco_org_chart.json', 'utf8'));
  const emailToEmployee = {};

  // Build email lookup map from org chart
  function traverseOrgChart(node) {
    if (node.email) {
      emailToEmployee[node.email.toLowerCase()] = {
        name: node.name,
        department: node.department || 'Unknown',
        title: node.title || 'Unknown'
      };
    }
    if (node.reports) {
      node.reports.forEach(traverseOrgChart);
    }
  }
  traverseOrgChart(orgChart);

  // Enrich each message
  const enriched = [];
  for (const msg of messages) {
    try {
      // Fetch Slack user info
      const userInfo = await slack.users.info({ user: msg.userId });
      const email = userInfo.user?.profile?.email?.toLowerCase();

      const employee = email ? emailToEmployee[email] : null;

      enriched.push({
        ...msg,
        userName: userInfo.user?.real_name || 'Unknown',
        userEmail: email,
        department: employee?.department || 'Unknown',
        title: employee?.title || 'Unknown'
      });

    } catch (error) {
      console.error(`    Error fetching user ${msg.userId}:`, error.message);
      enriched.push({ ...msg, userName: 'Unknown', department: 'Unknown' });
    }
  }

  return enriched;
}

// Helper: Analyze sentiment in batches
async function analyzeSentimentBatch(messages) {
  const analyzed = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];

    console.log(`  [${i + 1}/${messages.length}] Analyzing: ${msg.text.substring(0, 50)}...`);

    try {
      const sentiment = await analyzeSentimentWithClaude(msg);
      analyzed.push({ ...msg, ...sentiment });
    } catch (error) {
      console.error(`    Error analyzing message:`, error.message);
      analyzed.push({ ...msg, sentiment_score: 0, confidence: 0, topics: [] });
    }

    // Rate limiting: wait 100ms between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return analyzed;
}

// Helper: Analyze single message with Claude
async function analyzeSentimentWithClaude(message) {
  const prompt = `Analyze this Slack message for AI tool sentiment.

Message: "${message.text}"

User: ${message.userName} (${message.department})
Channel: #${message.channelName}
Date: ${message.timestamp.toISOString().split('T')[0]}

Extract:
1. sentiment_score: -1 (very negative) to +1 (very positive)
2. confidence: 0 (uncertain) to 1 (very confident)
3. topics: list of themes (e.g., "productivity", "ease_of_use", "cost", "performance")
4. tool_mentioned: "Claude Enterprise" | "Claude Code" | "M365 Copilot" | "GitHub Copilot" | "ChatGPT" | "Other" | null
5. features_mentioned: list of specific features mentioned (e.g., "projects", "artifacts", "code completion")
6. intent: "praise" | "complaint" | "question" | "feature_request" | "neutral"
7. summary: 1-2 sentence summary of the feedback

Return ONLY valid JSON, no other text.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    temperature: 0.2,
    messages: [{ role: 'user', content: prompt }]
  });

  const jsonText = response.content[0].text;
  return JSON.parse(jsonText);
}

// Run
if (require.main === module) {
  parseSlackSentiment()
    .then(() => console.log('\n✅ Slack sentiment parsing complete!'))
    .catch(error => console.error('\n❌ Error:', error));
}

module.exports = { parseSlackSentiment };
```

#### Step 4: Aggregate Sentiment Data

```javascript
// scripts/aggregate-sentiment.js

function aggregateSentiment(analyzedMessages) {
  const byTool = {};

  // Group by tool
  for (const msg of analyzedMessages) {
    const tool = msg.tool_mentioned || 'Unknown';
    if (!byTool[tool]) {
      byTool[tool] = [];
    }
    byTool[tool].push(msg);
  }

  // Calculate metrics for each tool
  const aggregated = {};
  for (const [tool, messages] of Object.entries(byTool)) {
    aggregated[tool] = {
      perceivedValueScore: calculatePerceivedValueScore(messages),
      avgSentiment: average(messages.map(m => m.sentiment_score)),
      nps: calculateNPS(messages),
      feedbackCount: messages.length,
      sentimentTrend: calculateTrend(messages),
      topThemes: extractTopThemes(messages),
      departmentSentiment: groupByDepartment(messages),
      representativeQuotes: extractTopQuotes(messages, 5),
      painPoints: extractPainPoints(messages)
    };
  }

  return aggregated;
}

function calculatePerceivedValueScore(messages) {
  const avgSentiment = average(messages.map(m => m.sentiment_score));
  const sentimentScore = (avgSentiment + 1) * 50; // Normalize to 0-100

  // Boost for high volume (logarithmic)
  const volumeBoost = Math.min(Math.log10(messages.length) / 2, 1);

  return Math.round(sentimentScore * (0.7 + volumeBoost * 0.3));
}

function calculateNPS(messages) {
  // Simulate NPS: sentiment > 0.5 = promoter, < -0.5 = detractor
  const promoters = messages.filter(m => m.sentiment_score > 0.5).length;
  const detractors = messages.filter(m => m.sentiment_score < -0.5).length;
  const total = messages.length;

  return Math.round(((promoters - detractors) / total) * 100);
}

function extractTopThemes(messages) {
  const themeCounts = {};

  for (const msg of messages) {
    for (const topic of msg.topics || []) {
      if (!themeCounts[topic]) {
        themeCounts[topic] = { count: 0, totalSentiment: 0 };
      }
      themeCounts[topic].count++;
      themeCounts[topic].totalSentiment += msg.sentiment_score;
    }
  }

  return Object.entries(themeCounts)
    .map(([theme, data]) => ({
      theme,
      count: data.count,
      avgSentiment: data.totalSentiment / data.count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function extractTopQuotes(messages, limit = 5) {
  return messages
    .filter(m => Math.abs(m.sentiment_score) > 0.6) // High positive or negative
    .filter(m => m.confidence > 0.7) // High confidence
    .sort((a, b) => Math.abs(b.sentiment_score) - Math.abs(a.sentiment_score))
    .slice(0, limit)
    .map(m => ({
      quote: m.text.substring(0, 200),
      author: m.userName,
      department: m.department,
      date: m.timestamp.toISOString().split('T')[0],
      sentiment: m.sentiment_score,
      source: `slack:#${m.channelName}`
    }));
}

function extractPainPoints(messages) {
  const painPointMessages = messages
    .filter(m => m.sentiment_score < -0.3)
    .filter(m => m.intent === 'complaint' || m.topics.includes('cost') || m.topics.includes('usability'));

  const themeGroups = {};
  for (const msg of painPointMessages) {
    for (const topic of msg.topics || []) {
      if (!themeGroups[topic]) {
        themeGroups[topic] = [];
      }
      themeGroups[topic].push(msg);
    }
  }

  return Object.entries(themeGroups)
    .map(([theme, msgs]) => ({
      theme,
      description: msgs[0].summary,
      frequency: msgs.length,
      avgSentiment: average(msgs.map(m => m.sentiment_score))
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);
}

function average(arr) {
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

module.exports = { aggregateSentiment };
```

---

### Phase 2: Survey Data Integration (Medium Priority)

**Script**: `scripts/parse-survey-data.js`

**Survey Format** (Google Forms / SurveyMonkey):

```
AI Tools Satisfaction Survey
────────────────────────────
1. Which AI tools do you use? (multi-select)
   [ ] Claude Enterprise
   [ ] Claude Code
   [ ] M365 Copilot
   [ ] GitHub Copilot
   [ ] ChatGPT (personal)
   [ ] Other

2. How likely are you to recommend [Tool] to a colleague? (0-10 NPS)
   0 1 2 3 4 5 6 7 8 9 10

3. Rate your satisfaction with [Tool]: (1-5 stars)
   ⭐ ⭐⭐ ⭐⭐⭐ ⭐⭐⭐⭐ ⭐⭐⭐⭐⭐

4. What do you value most about [Tool]? (open-ended)
   [Text box]

5. What would you improve about [Tool]? (open-ended)
   [Text box]
```

**Parser Script**:

```javascript
// scripts/parse-survey-data.js
const fs = require('fs');
const csv = require('csv-parser');

async function parseSurveyData() {
  const results = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream('data/ai-tools-survey-results.csv')
      .pipe(csv())
      .on('data', (row) => {
        results.push({
          timestamp: new Date(row['Timestamp']),
          email: row['Email Address'],
          toolsUsed: row['Tools Used'].split(', '),
          npsScore: parseInt(row['NPS Score (0-10)']),
          satisfactionRating: parseInt(row['Satisfaction (1-5)']),
          valuesText: row['What do you value most?'],
          improvementsText: row['What would you improve?']
        });
      })
      .on('end', () => {
        console.log(`✅ Parsed ${results.length} survey responses`);
        resolve(results);
      })
      .on('error', reject);
  });
}

module.exports = { parseSurveyData };
```

---

### Phase 3: Interview Transcripts (Low Priority)

**Script**: `scripts/parse-interview-notes.js`

**Markdown Format**:

```markdown
# Interview: Sarah Johnson (Product Manager)
**Date:** 2024-11-20
**Tool:** Claude Enterprise
**Interviewer:** Luis Amadeo

## Key Quotes

> "Claude has completely changed how I write PRDs. What used to take 3 days now takes 4 hours."

**Sentiment:** Very Positive (+0.9)
**Theme:** Productivity

> "I wish I could share my Claude projects with my team. Right now it's siloed."

**Sentiment:** Neutral/Constructive (0.0)
**Theme:** Collaboration, Feature Request

## Action Items
- [ ] Explore team Projects feature in Claude Enterprise
```

**Parser Script**:

```javascript
// scripts/parse-interview-notes.js
const fs = require('fs');
const path = require('path');

function parseInterviewNotes() {
  const interviewsDir = 'docs/interviews';
  const files = fs.readdirSync(interviewsDir).filter(f => f.endsWith('.md'));

  const allQuotes = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(interviewsDir, file), 'utf8');

    // Extract metadata
    const nameMatch = content.match(/# Interview: (.+)/);
    const dateMatch = content.match(/\*\*Date:\*\* (.+)/);
    const toolMatch = content.match(/\*\*Tool:\*\* (.+)/);

    // Extract quotes (between > markers)
    const quoteRegex = /> "(.+?)"/g;
    let match;
    while ((match = quoteRegex.exec(content)) !== null) {
      allQuotes.push({
        quote: match[1],
        author: nameMatch ? nameMatch[1] : 'Unknown',
        date: dateMatch ? new Date(dateMatch[1]) : null,
        tool: toolMatch ? toolMatch[1] : 'Unknown',
        source: `interview:${file}`
      });
    }
  }

  console.log(`✅ Extracted ${allQuotes.length} quotes from ${files.length} interviews`);
  return allQuotes;
}

module.exports = { parseInterviewNotes };
```

---

### Phase 4: Integration into Main Pipeline

**Update**: `scripts/parse-copilot-data.js`

```javascript
// Add at the top
const { parseSlackSentiment } = require('./parse-slack-sentiment');
const { parseSurveyData } = require('./parse-survey-data');
const { parseInterviewNotes } = require('./parse-interview-notes');
const { aggregateSentiment } = require('./aggregate-sentiment');

// Add to main pipeline (after calculating ROI, before generating insights)
async function parseAllData() {
  // ... existing parsing logic ...

  // NEW: Parse sentiment data
  console.log('\n💬 Parsing sentiment data...');

  const slackMessages = await parseSlackSentiment();
  const surveyResponses = await parseSurveyData();
  const interviewQuotes = parseInterviewNotes();

  // Combine all sources
  const allSentimentData = [
    ...slackMessages,
    ...surveyResponses.map(s => ({
      text: `${s.valuesText} ${s.improvementsText}`,
      sentiment_score: (s.npsScore - 5) / 5, // Convert 0-10 NPS to -1 to +1
      source: 'survey',
      tool_mentioned: s.toolsUsed[0] // Primary tool
    })),
    ...interviewQuotes.map(q => ({
      text: q.quote,
      sentiment_score: 0.8, // Manually tagged as positive
      source: 'interview',
      tool_mentioned: q.tool
    }))
  ];

  // Aggregate by tool
  const perceivedValue = aggregateSentiment(allSentimentData);

  // Add to output
  outputData.perceivedValue = perceivedValue;

  // ... rest of pipeline ...
}
```

---

## UI/UX Integration

### Where to Put "Perceived Value" in Navigation

Based on the new navigation structure in `DASHBOARD_UX_RECOMMENDATIONS.md`, here's how to integrate:

#### Option 1: As a New Top-Level Tab (Recommended)

```
┌────────────────────────────────────────────────────────────────────────┐
│  📊 Overview  |  🔍 Tool Deep Dive ▼  |  ⚖️ Compare  |  💰 ROI  |  💬 Perceived Value  |  🎓 Enablement  │
└────────────────────────────────────────────────────────────────────────┘
```

**Rationale:**
- Sentiment is a **first-class dimension** alongside usage and ROI
- Deserves dedicated space for detailed analysis
- Keeps tabs organized by data type (quantitative vs qualitative)

#### Option 2: As a Section in Each Tool Deep Dive

```
Tool Deep Dive: Claude Enterprise
├─ Adoption Metrics (quantitative)
├─ Engagement & Productivity (quantitative)
├─ Department Breakdown (quantitative)
├─ 💬 Perceived Value & Sentiment (qualitative) ← NEW
└─ AI Insights
```

**Rationale:**
- Keeps all tool data together (usage + sentiment)
- Natural flow: "Here's what they do, here's what they think"
- Easier to correlate usage with sentiment

#### Option 3: Hybrid (Best of Both Worlds)

**1. Add sentiment cards to every tab:**
```
┌─────────────────────────────────────────────────────────┐
│ Overview Tab                                            │
├─────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│ │ 👤 Users │ │ 💬 Convos│ │ 📊 Rate  │ │ 💭 Sentiment│
│ │   87     │ │  4,284   │ │   86%    │ │   +0.74  │  │ ← NEW
│ │  +15%    │ │  +23%    │ │  +12%    │ │  🟢 High │  │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────────────────────────────────────────────┘
```

**2. Add dedicated "Perceived Value" tab for deep dive:**
```
💬 Perceived Value Tab
├─ Sentiment Trends (line chart over time)
├─ Top Themes (word cloud or bar chart)
├─ Department Sentiment Heatmap
├─ Representative Quotes (carousel)
├─ Pain Points & Feature Requests
└─ Cross-Tool Sentiment Comparison
```

**Rationale:**
- Quick sentiment glance everywhere (cards)
- Deep analysis when needed (dedicated tab)
- Balances discoverability with depth

---

### Perceived Value Tab Detailed UI Design

```
┌─────────────────────────────────────────────────────────────────────────┐
│  💬 Perceived Value: Claude Enterprise                [Filter: All ▼]  │
└─────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────┐
│  Key Sentiment Metrics                                                   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │ 💭 Perceived │ │ 🎯 NPS Score │ │ 📊 Avg       │ │ 💬 Feedback  │  │
│  │ Value Score  │ │              │ │ Sentiment    │ │ Volume       │  │
│  │     87       │ │    +68       │ │   +0.74      │ │    142       │  │
│  │  🟢 Excellent│ │  🟢 Great    │ │  🟢 Positive │ │  🟢 High     │  │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘  │
├─────────────────────────────────────────────────────────────────────────┤
│  Sentiment Trend (Last 6 Months)                                        │
│  ┌────────────────────────────────────────────────────────────┐        │
│  │                                                             │        │
│  │  +1.0  ┐                                             ●─────●        │
│  │   0.8  │                                    ●────────●              │
│  │   0.6  │                           ●────────●                       │
│  │   0.4  │                  ●────────●                                │
│  │   0.2  │         ●────────●                                         │
│  │   0.0  └──────────────────────────────────────────────             │
│  │        Jun    Jul    Aug    Sep    Oct    Nov    Dec               │
│  └────────────────────────────────────────────────────────────┘        │
│  📈 Sentiment improving +32% over 6 months                              │
├─────────────────────────────────────────────────────────────────────────┤
│  Top Themes & Topics                                                    │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │ Productivity         ████████████████████ 78 mentions (↑) │          │
│  │ Ease of Use          ████████████ 45 mentions (→)         │          │
│  │ Cost Concerns        ██████ 23 mentions (↓)               │          │
│  │ Speed/Performance    ████ 19 mentions (↑)                 │          │
│  │ Integration          ███ 15 mentions (→)                  │          │
│  └──────────────────────────────────────────────────────────┘          │
├─────────────────────────────────────────────────────────────────────────┤
│  What Users Love ❤️                                                     │
│  ┌────────────────────────────────────────────────────────────┐        │
│  │ "10x faster than Copilot with better quality"              │        │
│  │ — Devin Wagner, Engineering · Nov 15 · Sentiment: +0.95    │        │
│  │ Source: Slack #claude-code-dev                             │        │
│  │                                                             │        │
│  │ "I prefer Claude over GitHub Copilot for complex tasks"    │        │
│  │ — Roger Hampton, Engineering · Nov 18 · Sentiment: +0.88   │        │
│  │ Source: Slack #claude-code-dev                             │        │
│  │                                                             │        │
│  │ "Saved me so much time debugging. Multiple hours → 1 hour" │        │
│  │ — Taran Pierce, Engineering · Dec 2 · Sentiment: +0.92     │        │
│  │ Source: Slack #claude-code-dev                             │        │
│  │                                                             │        │
│  │                                      [View All Quotes →]   │        │
│  └────────────────────────────────────────────────────────────┘        │
├─────────────────────────────────────────────────────────────────────────┤
│  Pain Points & Concerns ⚠️                                              │
│  ┌────────────────────────────────────────────────────────────┐        │
│  │ 1. Cost / Budget Constraints                               │        │
│  │    • 12 mentions · Avg sentiment: -0.45                    │        │
│  │    "Engineers want Premium but budget is constrained"      │        │
│  │    [View Details]                                          │        │
│  │                                                            │        │
│  │ 2. Lack of Team Collaboration Features                     │        │
│  │    • 8 mentions · Avg sentiment: -0.25                     │        │
│  │    "Can't share Projects with team members"                │        │
│  │    [View Details]                                          │        │
│  └────────────────────────────────────────────────────────────┘        │
├─────────────────────────────────────────────────────────────────────────┤
│  Department Sentiment Breakdown                                         │
│  ┌────────────────────────────────────────────────────────────┐        │
│  │ Engineering      🟢 +0.92 (67 responses)                   │        │
│  │ Product          🟢 +0.81 (34 responses)                   │        │
│  │ Marketing        🟡 +0.58 (19 responses)                   │        │
│  │ Sales            🟡 +0.45 (12 responses)                   │        │
│  │ Customer Success 🟢 +0.73 (10 responses)                   │        │
│  └────────────────────────────────────────────────────────────┘        │
│  💡 Insight: Engineering has highest sentiment (+0.92) and volume.     │
│  Marketing sentiment is lower — consider targeted training?             │
├─────────────────────────────────────────────────────────────────────────┤
│  💡 AI-Generated Insights                                                │
│  ┌────────────────────────────────────────────────────────────┐        │
│  │ Sentiment is strongly positive (+0.74) and trending up.    │        │
│  │ Key drivers: productivity gains (78 mentions) and speed    │        │
│  │ improvements. Main concern: cost (23 mentions), especially │        │
│  │ for Premium upgrades. Engineering is highly satisfied and  │        │
│  │ can be champions for broader adoption. Recommend: Address  │        │
│  │ cost concerns with ROI data, expand to Product team next.  │        │
│  └────────────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Integration with Existing Tabs

#### Overview Tab (Add Sentiment Cards)

```diff
┌─────────────────────────────────────────────────────────────────────────┐
│  Overview / All Tools                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                  │
│  │ 👤 Users │ │ 💬 Convos│ │ 📊 Rate  │ │ 💰 ROI   │                  │
│  │   342    │ │  12,450  │ │   88%    │ │  3.2x    │                  │
│  │  +18%    │ │  +25%    │ │  +5%     │ │  +12%    │                  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘                  │
+                                                                          │
+  Perceived Value (Sentiment Analysis)                                   │
+  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                   │
+  │ Claude Ent.  │ │ M365 Copilot │ │ Claude Code  │                   │
+  │ 🟢 +0.74     │ │ 🟡 +0.52     │ │ 🟢 +0.89     │                   │
+  │ 87/100 score │ │ 68/100 score │ │ 93/100 score │                   │
+  └──────────────┘ └──────────────┘ └──────────────┘                   │
+                                                                          │
+  💡 Claude Code has highest sentiment (+0.89) among engineers.          │
+  [View Full Sentiment Analysis →]                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Tool Deep Dive (Add Sentiment Section)

```diff
┌─────────────────────────────────────────────────────────────────────────┐
│  Tool Deep Dive: Claude Enterprise                                      │
├─────────────────────────────────────────────────────────────────────────┤
│  Adoption Metrics                                                        │
│  • 87 active users (86% adoption)                                       │
│  • 4,284 conversations last 30 days                                     │
├─────────────────────────────────────────────────────────────────────────┤
│  Engagement & Productivity                                               │
│  • 49 conversations/user/month (avg)                                    │
│  • 156 projects created                                                  │
+├─────────────────────────────────────────────────────────────────────────┤
+│  💬 Perceived Value & Sentiment                          [View Full →] │
+│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                  │
+│  │ 💭 Sentiment │ │ 🎯 NPS       │ │ 💬 Feedback  │                  │
+│  │   +0.74      │ │   +68        │ │   142 msgs   │                  │
+│  │ 🟢 Positive  │ │ 🟢 Great     │ │ 🟢 High      │                  │
+│  └──────────────┘ └──────────────┘ └──────────────┘                  │
+│                                                                         │
+│  Top Themes: Productivity (78), Ease of Use (45), Cost (23)           │
+│                                                                         │
+│  What Users Say:                                                        │
+│  "10x faster than Copilot" — Devin, Engineering                        │
+│  "I prefer Claude over GitHub Copilot" — Roger, Engineering            │
+│  [View All Quotes →]                                                    │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Compare Tools Tab (Add Sentiment Comparison)

```diff
┌─────────────────────────────────────────────────────────────────────────┐
│  Compare Tools: Claude Code vs GitHub Copilot                           │
├─────────────────────────────────────────────────────────────────────────┤
│  Side-by-Side Metrics                                                    │
│  ┌──────────────────────┬──────────────────────┐                       │
│  │ Claude Code          │ GitHub Copilot       │                       │
│  ├──────────────────────┼──────────────────────┤                       │
│  │ 👤 12 users          │ 👤 46 users          │                       │
│  │ 📊 27,650 lines/user │ 📊 3,700 lines/user  │                       │
│  │ 💰 $200/mo           │ 💰 $19/mo            │                       │
+│  │ 💭 +0.89 sentiment   │ 💭 +0.42 sentiment   │                       │
+│  │ 🟢 Highly positive   │ 🟡 Neutral/positive  │                       │
│  └──────────────────────┴──────────────────────┘                       │
+├─────────────────────────────────────────────────────────────────────────┤
+│  Sentiment Comparison                                                    │
+│  ┌────────────────────────────────────────────────────────────┐        │
+│  │ Users who tried both:                                      │        │
+│  │ • 72% prefer Claude Code                                   │        │
+│  │ • "10x faster" (Devin)                                     │        │
+│  │ • "60min → 5min" (Roger)                                   │        │
+│  │                                                            │        │
+│  │ GitHub Copilot users who haven't tried Claude Code:        │        │
+│  │ • 34 users (74% of Copilot users)                          │        │
+│  │ • Opportunity: Demo Claude Code to show 7.5x advantage     │        │
+│  └────────────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Roadmap

### Phase 1: MVP (2-3 weeks)

**Week 1: Slack API Integration**
- [ ] Create Slack app and get API token
- [ ] Write `scripts/parse-slack-sentiment.js`
- [ ] Test on 1-2 channels first
- [ ] Implement Claude API sentiment analysis
- [ ] Output to `slack-sentiment-raw.json`

**Week 2: Aggregation & Integration**
- [ ] Write `scripts/aggregate-sentiment.js`
- [ ] Integrate into `scripts/parse-copilot-data.js`
- [ ] Add `perceivedValue` section to `ai-tools-data.json`
- [ ] Test end-to-end pipeline

**Week 3: UI Integration**
- [ ] Add sentiment metric cards to Overview tab
- [ ] Add sentiment section to Tool Deep Dive tabs
- [ ] Create basic "Perceived Value" tab with:
  - Key metrics (score, NPS, avg sentiment)
  - Sentiment trend chart
  - Top 5 quotes
  - Top themes
- [ ] Test on production data

### Phase 2: Enhancement (1-2 weeks)

**Week 4: Survey Integration**
- [ ] Create AI Tools Satisfaction Survey (Google Forms)
- [ ] Send to all users, collect responses
- [ ] Write `scripts/parse-survey-data.js`
- [ ] Integrate survey NPS into sentiment pipeline

**Week 5: Advanced UI**
- [ ] Add department sentiment heatmap
- [ ] Add pain points section
- [ ] Add sentiment comparison to Compare Tools tab
- [ ] Add AI-generated insights from sentiment
- [ ] Polish animations and interactions

### Phase 3: Automation (Ongoing)

**Week 6+: Scheduled Runs**
- [ ] Set up cron job to run `parse-slack-sentiment.js` daily
- [ ] Add delta detection (only new messages since last run)
- [ ] Add Slack alert when sentiment drops suddenly
- [ ] Dashboard auto-refresh with new sentiment data

---

## AI Insights from Sentiment

### New Insight Types (Add to generate-insights.js)

```javascript
// scripts/generate-insights.js

// Add new insight generator
async function generateSentimentInsight(chartType, chartData, perceivedValueData) {
  if (chartType === 'perceivedValueOverview') {
    const prompt = `You are a user sentiment analyst reviewing AI tool feedback.

Data:
- Claude Enterprise: Sentiment ${perceivedValueData.claudeEnterprise.avgSentiment}, NPS ${perceivedValueData.claudeEnterprise.nps}, ${perceivedValueData.claudeEnterprise.feedbackCount} responses
- M365 Copilot: Sentiment ${perceivedValueData.m365Copilot.avgSentiment}, NPS ${perceivedValueData.m365Copilot.nps}, ${perceivedValueData.m365Copilot.feedbackCount} responses
- Claude Code: Sentiment ${perceivedValueData.claudeCode.avgSentiment}, NPS ${perceivedValueData.claudeCode.nps}, ${perceivedValueData.claudeCode.feedbackCount} responses

Top themes for Claude Enterprise: ${JSON.stringify(perceivedValueData.claudeEnterprise.topThemes.slice(0, 3))}

Pain points: ${JSON.stringify(perceivedValueData.claudeEnterprise.painPoints.slice(0, 2))}

Provide 2-3 sentences analyzing:
1. Which tool has best sentiment and why?
2. What are users loving vs. struggling with?
3. Actionable recommendation to improve sentiment

Be specific. Reference numbers. Be concise.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }]
    });

    return response.content[0].text;
  }

  // ... existing insight generators ...
}
```

### Example AI-Generated Sentiment Insights

**Perceived Value Overview Insight:**
> "Claude Code leads sentiment at +0.89 (NPS +82), driven by productivity gains (78 mentions) and speed improvements. Engineers report '10x faster' than alternatives. Main concern is cost (23 mentions), with users wanting Premium but constrained by budget. Recommend: Present ROI data to justify Premium upgrades, target high-impact users first."

**Cross-Tool Sentiment Comparison Insight:**
> "Among engineers who use both, 72% prefer Claude Code over GitHub Copilot for complex tasks, citing better quality and 7.5x productivity advantage. However, GitHub Copilot has broader adoption (46 vs 12 users) due to lower cost and IDE integration. Opportunity: Demo Claude Code to remaining 34 Copilot users to drive migration."

**Sentiment Trend Insight:**
> "Claude Enterprise sentiment improved +32% over 6 months (from +0.56 to +0.74), correlating with feature releases (Projects in July, improved context window in Sept). Engineering maintains highest satisfaction (+0.92), while Marketing lags (+0.58) — likely due to less training. Recommend: Targeted enablement for Marketing team."

---

## Success Metrics

### Quantitative Metrics

1. **Data Coverage**
   - Target: 80%+ of active users provide feedback (Slack, survey, or interview)
   - Current: ~30% (manual Slack quotes)
   - Improvement: Automated Slack monitoring + quarterly surveys

2. **Sentiment Correlation with Usage**
   - Hypothesis: Users with sentiment > +0.6 use tool 2x more than users with sentiment < +0.2
   - Measure: Correlation coefficient between sentiment score and usage metrics
   - Target: r > 0.6 (strong positive correlation)

3. **Predictive Power**
   - Hypothesis: Sentiment decline predicts churn/disengagement by 30 days
   - Measure: % of users whose sentiment dropped > 0.3 in a month then stopped using tool next month
   - Target: 70%+ predictive accuracy

4. **Actionability**
   - Target: 50%+ of pain points get addressed within 1 quarter
   - Track: # of pain points identified → # addressed with training/features/policy changes

### Qualitative Metrics

1. **Executive Buy-In**
   - Do executives reference sentiment data in budget discussions?
   - Is sentiment data cited in contract renewal decisions?

2. **User Trust**
   - Do users believe their feedback is being heard and acted upon?
   - Measure via follow-up survey: "I feel my feedback influences AI tool strategy" (1-5 scale)

3. **Data Richness**
   - Are sentiment insights revealing NEW information not visible in usage data?
   - Example: Usage shows high adoption, but sentiment reveals cost concerns → proactive issue

---

## Privacy & Ethics Considerations

### Slack Data Collection

**Transparency:**
- [ ] Announce in #general that Slack messages in AI channels will be analyzed for sentiment
- [ ] Post in each monitored channel: "This channel is monitored for AI tool feedback analysis"
- [ ] Provide opt-out mechanism: DM feedback to specific person instead

**Anonymization:**
- [ ] Dashboard shows aggregated sentiment, not individual messages (unless user consents)
- [ ] Representative quotes only use first name + department (e.g., "Devin, Engineering")
- [ ] Executive dashboard shows trends, not individual employee sentiment

**Data Retention:**
- [ ] Sentiment scores stored indefinitely (aggregated)
- [ ] Raw Slack messages deleted after 90 days
- [ ] Survey responses stored indefinitely (consented)

### Survey Best Practices

**Voluntary:**
- Make survey optional, not mandatory
- Allow anonymous responses (don't require email)
- Clearly state how data will be used

**Actionability:**
- Share survey results with respondents: "Here's what we learned, here's what we're doing"
- Close the feedback loop within 30 days of survey

---

## Appendix: Data Schema

### Sentiment Data Schema

```typescript
interface SentimentMessage {
  // Source metadata
  messageId: string;
  source: 'slack' | 'survey' | 'interview';
  channelName?: string;        // Slack only
  timestamp: Date;

  // User metadata
  userId: string;
  userName: string;
  userEmail: string;
  department: string;
  title: string;

  // Message content
  text: string;                // Full message text

  // AI-analyzed sentiment
  sentiment_score: number;     // -1 (negative) to +1 (positive)
  confidence: number;          // 0 (uncertain) to 1 (very confident)
  topics: string[];            // ["productivity", "cost", "ease_of_use"]
  tool_mentioned: string | null; // "Claude Enterprise" | "M365 Copilot" | etc.
  features_mentioned: string[]; // ["projects", "artifacts", "code_completion"]
  intent: 'praise' | 'complaint' | 'question' | 'feature_request' | 'neutral';
  summary: string;             // 1-2 sentence summary
}

interface AggregatedSentiment {
  // Overall metrics
  perceivedValueScore: number; // 0-100 composite score
  avgSentiment: number;        // -1 to +1
  nps: number;                 // -100 to +100
  feedbackCount: number;

  // Trends
  sentimentTrend: {
    month: string;             // "Nov 2024"
    score: number;             // Avg sentiment that month
    count: number;             // # of feedback items
  }[];

  // Themes
  topThemes: {
    theme: string;             // "productivity"
    count: number;             // # of mentions
    avgSentiment: number;      // Avg sentiment for this theme
  }[];

  // Department breakdown
  departmentSentiment: {
    dept: string;
    score: number;
    count: number;
  }[];

  // Representative quotes
  representativeQuotes: {
    quote: string;
    author: string;
    department: string;
    date: string;
    sentiment: number;
    source: string;            // "slack:#claude-code-dev"
  }[];

  // Pain points
  painPoints: {
    theme: string;
    description: string;
    frequency: number;
    avgSentiment: number;
  }[];
}
```

---

## Conclusion

**Perceived Value / Sentiment Analysis** fills the critical gap between **what users do** (usage metrics) and **how users feel** (sentiment). This creates a **complete picture**:

- **Objective metrics** (usage, productivity, ROI) tell you WHAT is happening
- **Subjective sentiment** (feedback, quotes, themes) tells you WHY and predicts WHAT WILL happen

**Implementation Priority:**

1. **Phase 1 (Weeks 1-3):** Slack API integration + basic UI → Highest ROI, automated pipeline
2. **Phase 2 (Weeks 4-5):** Survey integration + advanced UI → Structured quantitative data (NPS)
3. **Phase 3 (Ongoing):** Interview parsing + automation → Deep qualitative insights

**Expected Impact:**

- Predict adoption trends 30 days ahead (sentiment leads usage)
- Identify pain points before they cause churn
- Quantify "voice of customer" for executive presentations
- Guide training, feature requests, and expansion decisions

This positions the dashboard as not just a **reporting tool** but a **predictive, actionable intelligence platform**.

---

### Phase 4: Confluence Wiki Integration (Medium Priority)

**Script**: `scripts/parse-confluence-wikis.js`

#### Why Confluence?

Confluence wikis are a rich source of **structured, long-form sentiment** data:
- **Retrospectives & Post-Mortems**: Team reflections on what worked/didn't work
- **Best Practices Guides**: Documented "how we use X tool" pages  
- **Meeting Notes**: Sprint reviews, planning sessions, standup notes
- **Feature Requests**: Formal tracking of "things we wish the tool could do"
- **Onboarding Docs**: New user experiences, common pain points
- **Project Documentation**: Lessons learned, workflow documentation

**Key Difference vs Slack:**
- **Slack**: Real-time, informal, high-volume, short messages
- **Confluence**: Structured, formal, curated, long-form content

#### Setup: Confluence API

```bash
# 1. Generate API Token:
#    - Go to https://id.atlassian.com/manage-profile/security/api-tokens
#    - Create new API token
#    - Save token securely
#
# 2. Get Confluence Instance URL:
#    - Format: https://your-domain.atlassian.net/wiki
#
# 3. Add to .env file:
CONFLUENCE_BASE_URL=https://techco.atlassian.net/wiki
CONFLUENCE_EMAIL=your-email@techco.com
CONFLUENCE_API_TOKEN=your-api-token-here
```

#### Script Architecture

```javascript
// scripts/parse-confluence-wikis.js

const axios = require('axios');
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Configuration
const CONFLUENCE_CONFIG = {
  baseUrl: process.env.CONFLUENCE_BASE_URL,
  email: process.env.CONFLUENCE_EMAIL,
  apiToken: process.env.CONFLUENCE_API_TOKEN,
  
  // Pages to monitor (filter by label, space, or search query)
  searchQueries: [
    'label = "ai-tools"',
    'label = "claude"',
    'label = "copilot"',
    'label = "retrospective" AND (text ~ "claude" OR text ~ "copilot" OR text ~ "m365")',
    'space = "ENG" AND (title ~ "AI" OR text ~ "claude" OR text ~ "copilot")',
    'title ~ "Best Practices" AND text ~ "AI"'
  ],
  
  // How far back to look
  daysBack: 90
};

// Helper: Create Confluence API client
function createConfluenceClient() {
  const auth = Buffer.from(
    `${CONFLUENCE_CONFIG.email}:${CONFLUENCE_CONFIG.apiToken}`
  ).toString('base64');

  return axios.create({
    baseURL: `${CONFLUENCE_CONFIG.baseUrl}/rest/api`,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    }
  });
}

// Main function
async function parseConfluenceWikis() {
  console.log('📚 Fetching Confluence wiki pages...');

  const client = createConfluenceClient();
  const allPages = [];

  // Search for relevant pages using CQL (Confluence Query Language)
  for (const query of CONFLUENCE_CONFIG.searchQueries) {
    try {
      console.log(`  Searching: ${query}`);

      const response = await client.get('/content/search', {
        params: {
          cql: query,
          limit: 100,
          expand: 'body.storage,version,space,history.lastUpdated'
        }
      });

      const pages = response.data.results.map(page => ({
        id: page.id,
        title: page.title,
        spaceKey: page.space.key,
        spaceName: page.space.name,
        url: `${CONFLUENCE_CONFIG.baseUrl}${page._links.webui}`,
        body: page.body?.storage?.value || '',
        lastModified: new Date(page.history.lastUpdated.when),
        author: page.history.lastUpdated.by.displayName,
        authorEmail: page.history.lastUpdated.by.email
      }));

      allPages.push(...pages);
      console.log(`    Found ${pages.length} pages`);

    } catch (error) {
      console.error(`    Error searching "${query}":`, error.message);
    }
  }

  // Remove duplicates (same page might match multiple queries)
  const uniquePages = Array.from(
    new Map(allPages.map(p => [p.id, p])).values()
  );

  console.log(`\n✅ Total unique pages found: ${uniquePages.length}`);

  // Fetch comments for each page
  console.log('\n💬 Fetching comments for each page...');
  const enrichedPages = await fetchPageComments(client, uniquePages);

  // Extract content sections and analyze sentiment
  console.log('\n🤖 Analyzing page content with Claude API...');
  const analyzedPages = await analyzePagesBatch(enrichedPages);

  // Save raw output
  fs.writeFileSync(
    'data/confluence-sentiment-raw.json',
    JSON.stringify(analyzedPages, null, 2)
  );

  console.log('\n💾 Saved to data/confluence-sentiment-raw.json');

  return analyzedPages;
}

// Helper: Fetch comments for pages
async function fetchPageComments(client, pages) {
  const enriched = [];

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];

    console.log(`  [${i + 1}/${pages.length}] Fetching comments for: ${page.title}`);

    try {
      const response = await client.get(`/content/${page.id}/child/comment`, {
        params: {
          expand: 'body.storage,version,history.lastUpdated',
          limit: 100
        }
      });

      const comments = response.data.results.map(comment => ({
        id: comment.id,
        body: comment.body?.storage?.value || '',
        author: comment.history.lastUpdated.by.displayName,
        authorEmail: comment.history.lastUpdated.by.email,
        date: new Date(comment.history.lastUpdated.when)
      }));

      enriched.push({ ...page, comments });

    } catch (error) {
      console.error(`    Error fetching comments:`, error.message);
      enriched.push({ ...page, comments: [] });
    }
  }

  return enriched;
}

// Helper: Analyze pages in batches
async function analyzePagesBatch(pages) {
  const analyzed = [];

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];

    console.log(`  [${i + 1}/${pages.length}] Analyzing: ${page.title}`);

    try {
      // Analyze page body
      const pageSentiment = await analyzeConfluenceContent(
        page.body,
        page.title,
        page.author,
        page.lastModified,
        'page'
      );

      // Analyze each comment
      const commentSentiments = [];
      for (const comment of page.comments) {
        const commentSentiment = await analyzeConfluenceContent(
          comment.body,
          page.title,
          comment.author,
          comment.date,
          'comment'
        );
        commentSentiments.push({ ...comment, ...commentSentiment });

        // Rate limiting: wait 100ms between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      analyzed.push({
        ...page,
        ...pageSentiment,
        comments: commentSentiments
      });

    } catch (error) {
      console.error(`    Error analyzing page:`, error.message);
      analyzed.push({ ...page, sentiment_score: 0, confidence: 0, topics: [] });
    }
  }

  return analyzed;
}

// Helper: Analyze single piece of content with Claude
async function analyzeConfluenceContent(htmlContent, pageTitle, author, date, contentType) {
  // Strip HTML tags for cleaner text analysis
  const textContent = htmlContent
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 5000); // Limit to 5000 chars to avoid token limits

  if (textContent.length < 20) {
    // Too short to analyze meaningfully
    return { sentiment_score: 0, confidence: 0, topics: [], intent: 'neutral' };
  }

  const prompt = `Analyze this Confluence ${contentType} for AI tool sentiment.

${contentType === 'page' ? 'Page Title' : 'Comment on Page'}: "${pageTitle}"

Content: "${textContent}"

Author: ${author}
Date: ${date.toISOString().split('T')[0]}

Extract:
1. sentiment_score: -1 (very negative) to +1 (very positive)
2. confidence: 0 (uncertain) to 1 (very confident)
3. topics: list of themes (e.g., "productivity", "ease_of_use", "cost", "training")
4. tool_mentioned: "Claude Enterprise" | "Claude Code" | "M365 Copilot" | "GitHub Copilot" | "Other" | null
5. features_mentioned: list of specific features mentioned
6. intent: "documentation" | "praise" | "complaint" | "lesson_learned" | "feature_request" | "neutral"
7. summary: 1-2 sentence summary of the key points
8. is_retrospective: boolean (is this a retrospective/post-mortem?)
9. action_items: list of action items extracted (if any)

Return ONLY valid JSON, no other text.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 700,
    temperature: 0.2,
    messages: [{ role: 'user', content: prompt }]
  });

  const jsonText = response.content[0].text;
  return JSON.parse(jsonText);
}

// Helper: Enrich with employee metadata
function enrichWithEmployeeData(confluencePages) {
  const orgChart = JSON.parse(fs.readFileSync('data/techco_org_chart.json', 'utf8'));
  const emailToEmployee = {};

  // Build email lookup map
  function traverseOrgChart(node) {
    if (node.email) {
      emailToEmployee[node.email.toLowerCase()] = {
        name: node.name,
        department: node.department || 'Unknown',
        title: node.title || 'Unknown'
      };
    }
    if (node.reports) {
      node.reports.forEach(traverseOrgChart);
    }
  }
  traverseOrgChart(orgChart);

  // Enrich pages and comments
  return confluencePages.map(page => {
    const pageEmployee = emailToEmployee[page.authorEmail?.toLowerCase()] || {};

    return {
      ...page,
      authorDepartment: pageEmployee.department || 'Unknown',
      authorTitle: pageEmployee.title || 'Unknown',
      comments: page.comments.map(comment => {
        const commentEmployee = emailToEmployee[comment.authorEmail?.toLowerCase()] || {};
        return {
          ...comment,
          authorDepartment: commentEmployee.department || 'Unknown',
          authorTitle: commentEmployee.title || 'Unknown'
        };
      })
    };
  });
}

// Run
if (require.main === module) {
  parseConfluenceWikis()
    .then(pages => {
      const enriched = enrichWithEmployeeData(pages);
      fs.writeFileSync(
        'data/confluence-sentiment-enriched.json',
        JSON.stringify(enriched, null, 2)
      );
      console.log('\n✅ Confluence parsing complete!');
    })
    .catch(error => console.error('\n❌ Error:', error));
}

module.exports = { parseConfluenceWikis };
```

#### Example Confluence Page Content

**Page: "Engineering Best Practices: AI Coding Tools"**
```
# AI Coding Tools Best Practices

Last Updated: 2024-11-20 | Author: Devin Wagner (Engineering)

## Tools We Use
- **Claude Code** (Premium): For complex refactoring, architecture
- **GitHub Copilot** (Enterprise): For quick code completion

## Recommendations
After 3 months of using both tools, here's what we've learned:

### When to Use Claude Code ✅
- Multi-file refactoring
- Complex migrations (test framework changes)
- Debugging production issues
- Architecture planning

**Quote from team**: "Claude Code is 10x faster for complex tasks that
span multiple files. What used to take 3-4 days now takes an hour."

### When to Use GitHub Copilot
- Single-file code completion
- Quick unit test generation
- Simple CRUD operations

### Pain Points 🚨
1. **Cost Concern**: Engineers want Claude Code Premium but only 12 seats
   allocated. Need to justify $200/mo vs $19/mo for Copilot.
2. **Context Switching**: Having two tools means context switching between
   IDE (Copilot) and terminal (Claude Code).

### Action Items
- [ ] Create ROI analysis for Claude Code Premium expansion
- [ ] Pilot Claude Code with remaining top Copilot users
- [ ] Training session on when to use which tool
```

**Extracted Sentiment**:
```json
{
  "sentiment_score": 0.72,
  "confidence": 0.85,
  "topics": ["productivity", "cost", "tool_comparison", "best_practices"],
  "tool_mentioned": "Claude Code",
  "intent": "documentation",
  "is_retrospective": false,
  "pain_points": ["cost", "context_switching"],
  "action_items": [
    "Create ROI analysis for Claude Code Premium expansion",
    "Pilot Claude Code with remaining top Copilot users",
    "Training session on when to use which tool"
  ],
  "summary": "Engineering team documents best practices for AI coding tools,
    noting Claude Code is 10x faster for complex tasks but cost is a concern
    for Premium expansion."
}
```

#### Integration into Main Pipeline

**Update**: `scripts/parse-copilot-data.js`

```javascript
// Add at the top
const { parseConfluenceWikis } = require('./parse-confluence-wikis');

// Add to main pipeline (after Slack, surveys, interviews)
async function parseAllData() {
  // ... existing parsing logic ...

  // NEW: Parse Confluence wikis
  console.log('\n📚 Parsing Confluence wikis...');

  const confluencePages = await parseConfluenceWikis();

  // Flatten pages + comments into single sentiment array
  const confluenceSentiment = [];

  for (const page of confluencePages) {
    // Add page sentiment
    confluenceSentiment.push({
      text: page.title + ' ' + page.body.substring(0, 500),
      sentiment_score: page.sentiment_score,
      confidence: page.confidence,
      topics: page.topics,
      tool_mentioned: page.tool_mentioned,
      intent: page.intent,
      source: 'confluence-page',
      sourceUrl: page.url,
      author: page.author,
      authorDepartment: page.authorDepartment,
      date: page.lastModified,
      is_retrospective: page.is_retrospective,
      action_items: page.action_items
    });

    // Add comment sentiments
    for (const comment of page.comments) {
      confluenceSentiment.push({
        text: comment.body.substring(0, 500),
        sentiment_score: comment.sentiment_score,
        confidence: comment.confidence,
        topics: comment.topics,
        tool_mentioned: comment.tool_mentioned,
        intent: comment.intent,
        source: 'confluence-comment',
        sourceUrl: page.url,
        author: comment.author,
        authorDepartment: comment.authorDepartment,
        date: comment.date
      });
    }
  }

  console.log(`  Found ${confluenceSentiment.length} sentiment items from Confluence`);

  // Combine with other sentiment sources
  const allSentimentData = [
    ...slackMessages,
    ...surveyResponses.map(s => ({ ... })),
    ...interviewQuotes.map(q => ({ ... })),
    ...confluenceSentiment  // NEW
  ];

  // ... rest of pipeline ...
}
```

#### Confluence-Specific Metrics

Add to aggregated sentiment output:

```javascript
// scripts/aggregate-sentiment.js

function aggregateSentiment(analyzedMessages) {
  const byTool = { /* ... */ };

  // ... existing aggregation ...

  // NEW: Extract Confluence-specific insights
  for (const [tool, messages] of Object.entries(byTool)) {
    const confluenceData = messages.filter(m => 
      m.source === 'confluence-page' || m.source === 'confluence-comment'
    );

    aggregated[tool].confluence = {
      totalPages: confluenceData.filter(m => m.source === 'confluence-page').length,
      totalComments: confluenceData.filter(m => m.source === 'confluence-comment').length,
      retrospectives: confluenceData.filter(m => m.is_retrospective).length,
      actionItems: confluenceData
        .flatMap(m => m.action_items || [])
        .slice(0, 10), // Top 10 action items
      bestPracticesPages: confluenceData
        .filter(m => m.intent === 'documentation' && m.topics.includes('best_practices'))
        .map(m => ({
          title: m.text.substring(0, 100),
          url: m.sourceUrl,
          author: m.author,
          sentiment: m.sentiment_score
        }))
    };
  }

  return aggregated;
}
```

#### Output Schema Update

```json
{
  "perceivedValue": {
    "claudeEnterprise": {
      "perceivedValueScore": 87,
      "avgSentiment": 0.74,
      "nps": 68,
      "feedbackCount": 142,
      
      "confluence": {
        "totalPages": 8,
        "totalComments": 23,
        "retrospectives": 3,
        "actionItems": [
          "Create ROI analysis for Claude Code Premium expansion",
          "Pilot Claude Code with remaining top Copilot users",
          "Training session on when to use which tool"
        ],
        "bestPracticesPages": [
          {
            "title": "Engineering Best Practices: AI Coding Tools",
            "url": "https://techco.atlassian.net/wiki/spaces/ENG/pages/12345",
            "author": "Devin Wagner",
            "sentiment": 0.72
          }
        ]
      }
    }
  }
}
```

#### UI Integration

**Add Confluence Section to Perceived Value Tab:**

```jsx
┌─────────────────────────────────────────────────────────────────────────┐
│  💬 Perceived Value: Claude Enterprise                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  ...existing sections...                                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  📚 Confluence Documentation & Best Practices (NEW)                      │
│  ┌────────────────────────────────────────────────────────────┐        │
│  │ 8 wiki pages | 23 comments | 3 retrospectives             │        │
│  │                                                            │        │
│  │ 📄 Best Practices Pages:                                  │        │
│  │ • "Engineering Best Practices: AI Coding Tools"            │        │
│  │   by Devin Wagner · Engineering · Sentiment +0.72         │        │
│  │   [View on Confluence ↗]                                   │        │
│  │                                                            │        │
│  │ ✅ Action Items Extracted:                                 │        │
│  │ • Create ROI analysis for Claude Code Premium expansion   │        │
│  │ • Pilot Claude Code with remaining top Copilot users      │        │
│  │ • Training session on when to use which tool              │        │
│  │                                                            │        │
│  │ 🔄 Recent Retrospectives:                                  │        │
│  │ • "Q4 2024 Engineering Retrospective"                      │        │
│  │   Key insight: "Claude Code adoption slower than expected│        │
│  │   due to cost concerns. Recommend targeted rollout."      │        │
│  │   [View Retrospective ↗]                                   │        │
│  └────────────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Benefits of Confluence Integration

1. **Structured Long-Form Feedback**: Unlike Slack (short, informal), Confluence has curated, thoughtful content
2. **Historical Context**: Retrospectives and post-mortems provide longitudinal insights
3. **Action Items Tracking**: Automatically extract TODOs and feature requests
4. **Best Practices Discovery**: Find "how we use X tool" documentation automatically
5. **Cross-Team Insights**: Confluence pages span departments, providing org-wide perspective

---

## Updated Implementation Roadmap

### Phase 1: MVP (2-3 weeks)

**Week 1: Slack API Integration** ✅ (as before)
**Week 2: Aggregation & Integration** ✅ (as before)
**Week 3: UI Integration** ✅ (as before)

### Phase 2: Enhancement (2-3 weeks)

**Week 4: Survey Integration** ✅ (as before)
**Week 5: Confluence Integration** ⭐ NEW
- [ ] Create Confluence API client
- [ ] Write `scripts/parse-confluence-wikis.js`
- [ ] Test on 2-3 pages first
- [ ] Implement Claude API sentiment analysis for pages + comments
- [ ] Integrate into main pipeline
**Week 6: Advanced UI** ✅ (updated to include Confluence sections)

### Phase 3: Automation (Ongoing)

**Week 7+: Scheduled Runs**
- [ ] Set up cron job to run sentiment pipeline daily
- [ ] Slack: delta detection (only new messages since last run)
- [ ] Confluence: detect new/updated pages (use lastModified date)
- [ ] Add alert when sentiment drops suddenly
- [ ] Dashboard auto-refresh with new sentiment data

---

## Confluence-Specific Considerations

### Privacy & Permissions

**Space Access:**
- Only parse pages in spaces the API token has access to
- Respect Confluence permissions (don't expose restricted content)
- Option: Parse only "Public" or "All Users" spaces

**Attribution:**
- Wiki pages are authored content (vs anonymous Slack)
- Show author attribution in dashboard (with consent)
- Option: Anonymize in aggregated views, attribute in detailed drill-down

### Content Filtering

**Relevant Pages:**
Use Confluence labels and search to filter:
- Label: "ai-tools", "claude", "copilot"
- Text search: Pages containing "claude", "copilot", "m365"
- Space filter: Engineering, Product, specific team spaces

**Exclude:**
- Personal spaces (unless user opts in)
- Archived pages (older than 6 months)
- Draft pages (not published)

### Rate Limiting

Confluence API has rate limits:
- **Cloud**: 10 requests/second per IP
- **Best Practice**: Add 100ms delay between requests
- **Batching**: Fetch 100 pages at a time (max per request)

