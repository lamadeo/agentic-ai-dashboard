# Sentiment Aggregation Pipeline - Architectural Diagram

## Overview & Strategic Context

### Value Framework Integration

This sentiment pipeline powers the **Perceived Value** dimension within the **💎 Value Framework**:

- **💎 Value** (Top-level navigation group)
  - **Productivity** (Data-Driven): Quantitative efficiency gains from usage metrics
  - **Perceived Value** (Sentiment-Driven): User satisfaction & sentiment ← **THIS PIPELINE**
  - **Outcomes** (Business Impact - Future): Department-specific KPIs

**Navigation Path**: Dashboard → 💎 Value → Perceived Value

**Purpose**: Complement objective productivity metrics with subjective user feedback to provide a complete ROI picture.

### API Token Requirements

This pipeline uses two types of API integrations:

**✅ Already Available:**
- `ANTHROPIC_API_KEY` - Powers AI sentiment analysis (same key used for dashboard insights)
  - Model: claude-sonnet-4-20250514
  - Cost: ~$1/month for sentiment analysis
  - Purpose: Analyze text → extract sentiment scores, topics, intent

**❌ Requires Configuration:**
- `SLACK_BOT_TOKEN` - For collecting Slack messages (6 channels)
- `CONFLUENCE_API_TOKEN` - For fetching wiki pages and comments
- Survey/Interview data: No API needed (local files)

See `.env.example` for configuration details.

---

## Complete End-to-End Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    DATA SOURCES LAYER                                            │
│                                  (External Systems & Files)                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    │                         │                         │
                    ▼                         ▼                         ▼                         ▼
        ┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
        │   📱 Slack API    │   │ 📋 Survey Tools   │   │ 🎤 Interview Notes│   │ 📚 Confluence API │
        │   (Real-time)     │   │  (Structured)     │   │  (Qualitative)    │   │  (Wiki Pages)     │
        ├───────────────────┤   ├───────────────────┤   ├───────────────────┤   ├───────────────────┤
        │ • 6 channels      │   │ • Google Forms    │   │ • Markdown files  │   │ • Atlassian API   │
        │ • Messages        │   │ • NPS scores      │   │ • Transcripts     │   │ • Wiki pages      │
        │ • Reactions       │   │ • Ratings (1-5)   │   │ • Key quotes      │   │ • Comments        │
        │ • Threads         │   │ • Open feedback   │   │ • Themes          │   │ • Labels          │
        │ • User metadata   │   │ • CSV exports     │   │ • Action items    │   │ • Attachments     │
        └───────────────────┘   └───────────────────┘   └───────────────────┘   └───────────────────┘
                    │                         │                         │                         │
                    └─────────────────────────┼─────────────────────────┘                         │
                                              │                                                     │
                                              ▼                                                     │
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   INGESTION LAYER (Node.js Scripts)                              │
│                                  Fetch, Parse, Filter, Enrich                                    │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
                                              │
        ┌─────────────────────────────────────┼─────────────────────────────────────┐
        │                                     │                                     │
        ▼                                     ▼                                     ▼
┌───────────────────────┐       ┌───────────────────────┐       ┌───────────────────────┐
│ parse-slack-          │       │ parse-survey-         │       │ parse-interview-      │
│ sentiment.js          │       │ data.js               │       │ notes.js              │
├───────────────────────┤       ├───────────────────────┤       ├───────────────────────┤
│ 1. Create Slack API   │       │ 1. Read CSV exports   │       │ 1. Read MD files      │
│    client (WebClient) │       │    from Google Forms  │       │    from /docs/        │
│                       │       │                       │       │    interviews/        │
│ 2. Fetch messages     │       │ 2. Parse structured   │       │                       │
│    from 6 channels    │       │    data (NPS, rating) │       │ 2. Extract quotes     │
│    (last 30 days)     │       │                       │       │    (regex: > "...")   │
│                       │       │ 3. Map respondents    │       │                       │
│ 3. Filter by AI       │       │    to employees       │       │ 3. Extract metadata   │
│    tool keywords      │       │    (email → dept)     │       │    (author, date)     │
│                       │       │                       │       │                       │
│ 4. Fetch user info    │       │ 4. Output structured  │       │ 4. Output quote array │
│    (Slack Users API)  │       │    survey responses   │       │                       │
│                       │       │                       │       │                       │
│ 5. Enrich with dept/  │       │ Output:               │       │ Output:               │
│    role from org chart│       │ surveyResponses[]     │       │ interviewQuotes[]     │
│                       │       │                       │       │                       │
│ Output:               │       │                       │       │                       │
│ slackMessages[]       │       │                       │       │                       │
└───────────────────────┘       └───────────────────────┘       └───────────────────────┘
        │                                     │                                     │
        └─────────────────────────────────────┼─────────────────────────────────────┘
                                              │
                                              │       ┌───────────────────────┐
                                              │       │ parse-confluence-     │
                                              │       │ wikis.js              │
                                              │       ├───────────────────────┤
                                              │       │ 1. Create Confluence  │
                                              │       │    API client (axios) │
                                              │       │                       │
                                              │       │ 2. Search wiki pages  │
                                              │       │    via CQL queries    │
                                              │       │    (labels, text)     │
                                              │       │                       │
                                              │       │ 3. Fetch page body +  │
                                              │       │    inline comments    │
                                              │       │                       │
                                              │       │ 4. Strip HTML tags    │
                                              │       │    to plain text      │
                                              │       │                       │
                                              │       │ 5. Enrich with author │
                                              │       │    metadata (dept)    │
                                              │       │                       │
                                              │       │ Output:               │
                                              │       │ confluencePages[]     │
                                              │       │ confluenceComments[]  │
                                              │       └───────────────────────┘
                                              │                   │
                                              └───────────────────┘
                                              │
                                              ▼
                        ┌──────────────────────────────────────────┐
                        │   RAW SENTIMENT DATA (Unanalyzed)        │
                        │   Array of messages/responses/quotes     │
                        │                                          │
                        │   [                                      │
                        │     { text, author, date, source },      │
                        │     { text, author, date, source },      │
                        │     ...                                  │
                        │   ]                                      │
                        └──────────────────────────────────────────┘
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                              AI ANALYSIS LAYER (Claude API via Anthropic SDK)                    │
│                           Sentiment Scoring, Topic Extraction, Intent Classification             │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
                                              │
                                              ▼
                        ┌──────────────────────────────────────────┐
                        │   analyze-sentiment.js                   │
                        │   (Batch Processing Loop)                │
                        ├──────────────────────────────────────────┤
                        │ FOR EACH message/quote/response:         │
                        │                                          │
                        │  1. Construct Claude API prompt:         │
                        │     ┌────────────────────────────────┐  │
                        │     │ Analyze this [source] content  │  │
                        │     │ for AI tool sentiment.         │  │
                        │     │                                │  │
                        │     │ Message: "[text]"              │  │
                        │     │ Author: [name] ([dept])        │  │
                        │     │ Date: [date]                   │  │
                        │     │                                │  │
                        │     │ Extract:                       │  │
                        │     │ 1. sentiment_score (-1 to +1)  │  │
                        │     │ 2. confidence (0 to 1)         │  │
                        │     │ 3. topics (array)              │  │
                        │     │ 4. tool_mentioned (string)     │  │
                        │     │ 5. features_mentioned (array)  │  │
                        │     │ 6. intent (enum)               │  │
                        │     │ 7. summary (1-2 sentences)     │  │
                        │     │                                │  │
                        │     │ Return JSON only.              │  │
                        │     └────────────────────────────────┘  │
                        │                                          │
                        │  2. Call Anthropic API:                  │
                        │     • Model: claude-sonnet-4-20250514    │
                        │     • Max tokens: 500-700                │
                        │     • Temperature: 0.2-0.3               │
                        │                                          │
                        │  3. Parse JSON response:                 │
                        │     {                                    │
                        │       sentiment_score: 0.85,             │
                        │       confidence: 0.92,                  │
                        │       topics: ["productivity", "speed"], │
                        │       tool_mentioned: "Claude Code",     │
                        │       features_mentioned: ["multi-file"],│
                        │       intent: "praise",                  │
                        │       summary: "User reports 10x..."     │
                        │     }                                    │
                        │                                          │
                        │  4. Merge sentiment data with original:  │
                        │     { ...original, ...sentiment }        │
                        │                                          │
                        │  5. Rate limiting: wait 100ms between    │
                        │     requests (avoid API throttling)      │
                        │                                          │
                        │ END FOR EACH                             │
                        │                                          │
                        │ Output: analyzedSentimentData[]          │
                        └──────────────────────────────────────────┘
                                              │
                                              ▼
                        ┌──────────────────────────────────────────┐
                        │   ANALYZED SENTIMENT DATA (Enriched)     │
                        │   Array with AI-extracted sentiment      │
                        │                                          │
                        │   [                                      │
                        │     {                                    │
                        │       text: "...",                       │
                        │       author: "Devin Wagner",            │
                        │       department: "Engineering",         │
                        │       date: "2024-11-15",                │
                        │       source: "slack:#claude-code-dev",  │
                        │       sentiment_score: 0.95,             │
                        │       confidence: 0.98,                  │
                        │       topics: ["productivity", "speed"], │
                        │       tool_mentioned: "Claude Code",     │
                        │       intent: "praise",                  │
                        │       summary: "Engineer reports 10x..." │
                        │     },                                   │
                        │     ...                                  │
                        │   ]                                      │
                        │                                          │
                        │   Save to: data/                    │
                        │   sentiment-analyzed.json                │
                        └──────────────────────────────────────────┘
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  AGGREGATION LAYER (Node.js)                                     │
│                      Group, Calculate Metrics, Extract Insights, Score                          │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
                                              │
                                              ▼
                        ┌──────────────────────────────────────────────────────┐
                        │   aggregate-sentiment.js                             │
                        ├──────────────────────────────────────────────────────┤
                        │                                                      │
                        │ STEP 1: Group by Tool                                │
                        │ ├─ Filter messages by tool_mentioned                 │
                        │ ├─ Create map: tool → messages[]                     │
                        │ └─ Tools: Claude Enterprise, Claude Code,            │
                        │           M365 Copilot, GitHub Copilot               │
                        │                                                      │
                        │ STEP 2: Calculate Core Metrics (per tool)            │
                        │ ├─ avgSentiment = mean(sentiment_score)              │
                        │ ├─ nps = calculateNPS(sentiment_scores)              │
                        │ │   • Promoters: sentiment > 0.5                     │
                        │ │   • Detractors: sentiment < -0.5                   │
                        │ │   • NPS = (promoters - detractors) / total * 100   │
                        │ ├─ feedbackCount = messages.length                   │
                        │ └─ perceivedValueScore = composite formula           │
                        │     • sentimentScore = (avgSentiment + 1) * 50       │
                        │     • npsScore = (nps + 100) / 2                     │
                        │     • volumeBoost = min(log(feedbackCount) / 5, 1)  │
                        │     • score = sentimentScore * 0.6 + npsScore * 0.4  │
                        │                                                      │
                        │ STEP 3: Calculate Sentiment Trend (per tool)         │
                        │ ├─ Group messages by month                           │
                        │ ├─ Calculate avgSentiment per month                  │
                        │ └─ Output: [ {month, score, count}, ... ]           │
                        │                                                      │
                        │ STEP 4: Extract Top Themes (per tool)                │
                        │ ├─ Count topic occurrences                           │
                        │ ├─ Calculate avgSentiment per topic                  │
                        │ ├─ Sort by frequency (descending)                    │
                        │ └─ Output: [ {theme, count, avgSentiment}, ... ]    │
                        │                                                      │
                        │ STEP 5: Department Breakdown (per tool)              │
                        │ ├─ Group messages by department                      │
                        │ ├─ Calculate avgSentiment per department             │
                        │ └─ Output: [ {dept, score, count}, ... ]            │
                        │                                                      │
                        │ STEP 6: Extract Representative Quotes (per tool)     │
                        │ ├─ Filter: |sentiment_score| > 0.6 (strong)          │
                        │ ├─ Filter: confidence > 0.7                          │
                        │ ├─ Sort by |sentiment_score| (descending)            │
                        │ ├─ Take top 5-10                                     │
                        │ └─ Output: [ {quote, author, dept, date,            │
                        │              sentiment, source}, ... ]               │
                        │                                                      │
                        │ STEP 7: Extract Pain Points (per tool)               │
                        │ ├─ Filter: sentiment_score < -0.3 (negative)         │
                        │ ├─ Filter: intent = "complaint" OR                   │
                        │ │          topics.includes("cost", "usability")      │
                        │ ├─ Group by theme (topic)                            │
                        │ ├─ Calculate frequency per theme                     │
                        │ └─ Output: [ {theme, description, frequency,        │
                        │              avgSentiment}, ... ]                    │
                        │                                                      │
                        │ STEP 8: Source Breakdown (per tool)                  │
                        │ ├─ Group messages by source (slack, survey,          │
                        │ │  interview, confluence)                            │
                        │ ├─ Calculate avgSentiment per source                 │
                        │ └─ Special: Extract confluence-specific data         │
                        │     • totalPages, totalComments                      │
                        │     • retrospectives count                           │
                        │     • actionItems extracted                          │
                        │     • bestPracticesPages metadata                    │
                        │                                                      │
                        │ STEP 9: Cross-Tool Comparison                        │
                        │ ├─ Calculate preference scores                       │
                        │ │   (e.g., Claude vs GitHub: 72% prefer Claude)     │
                        │ ├─ Extract comparison quotes                         │
                        │ └─ Output: { claudeVsGithub: {...}, ... }           │
                        │                                                      │
                        │ Output: aggregatedSentiment{}                        │
                        └──────────────────────────────────────────────────────┘
                                              │
                                              ▼
                        ┌──────────────────────────────────────────┐
                        │   AGGREGATED SENTIMENT METRICS           │
                        │   (Structured for Dashboard Consumption) │
                        │                                          │
                        │   {                                      │
                        │     "claudeEnterprise": {                │
                        │       perceivedValueScore: 87,           │
                        │       avgSentiment: 0.74,                │
                        │       nps: 68,                           │
                        │       feedbackCount: 142,                │
                        │       sentimentTrend: [...],             │
                        │       topThemes: [...],                  │
                        │       departmentSentiment: [...],        │
                        │       representativeQuotes: [...],       │
                        │       painPoints: [...],                 │
                        │       confluence: {...}                  │
                        │     },                                   │
                        │     "claudeCode": {...},                 │
                        │     "m365Copilot": {...},                │
                        │     "githubCopilot": {...},              │
                        │     "crossToolComparison": {...}         │
                        │   }                                      │
                        └──────────────────────────────────────────┘
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   INTEGRATION LAYER                                              │
│                        Merge with Usage Data, Generate Final Output                             │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
                                              │
                                              ▼
                        ┌──────────────────────────────────────────┐
                        │   parse-copilot-data.js (Main Pipeline)  │
                        ├──────────────────────────────────────────┤
                        │ 1. Parse usage data (existing):          │
                        │    • Claude Enterprise CSV               │
                        │    • Claude Code PDFs                    │
                        │    • M365 Copilot CSV                    │
                        │    • GitHub Copilot NDJSON               │
                        │                                          │
                        │ 2. Calculate usage metrics (existing):   │
                        │    • Active users, conversations         │
                        │    • Lines of code, productivity         │
                        │    • Adoption rates, ROI                 │
                        │                                          │
                        │ 3. Call sentiment pipeline (NEW):        │
                        │    • parseSlackSentiment()               │
                        │    • parseSurveyData()                   │
                        │    • parseInterviewNotes()               │
                        │    • parseConfluenceWikis()              │
                        │    • analyzeSentiment() (Claude API)     │
                        │    • aggregateSentiment()                │
                        │                                          │
                        │ 4. Merge sentiment with usage data:      │
                        │    outputData = {                        │
                        │      overview: {...},                    │
                        │      claudeEnterprise: {                 │
                        │        ...usageMetrics,                  │
                        │        perceivedValue: sentiment         │
                        │      },                                  │
                        │      claudeCode: {...},                  │
                        │      m365Copilot: {...},                 │
                        │      perceivedValue: aggregatedSentiment │
                        │    }                                     │
                        │                                          │
                        │ 5. Generate AI insights (existing):      │
                        │    • Call generate-insights.js           │
                        │    • Add NEW insight types:              │
                        │      - sentimentTrend analysis           │
                        │      - perceivedValueOverview            │
                        │      - sentimentVsUsageCorrelation       │
                        │                                          │
                        │ 6. Save final output:                    │
                        │    • app/ai-tools-data.json              │
                        └──────────────────────────────────────────┘
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       OUTPUT LAYER                                               │
│                                  JSON Files + Dashboard UI                                       │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    │                         │                         │
                    ▼                         ▼                         ▼
        ┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐
        │ app/ai-tools-data.json│ │ Dashboard UI (Next.js)│ │ External Outputs      │
        ├───────────────────────┤ ├───────────────────────┤ ├───────────────────────┤
        │ {                     │ │ Perceived Value Tab:  │ │ • Email reports       │
        │   metadata: {...},    │ │                       │ │ • Slack notifications │
        │   overview: {...},    │ │ ┌─────────────────┐   │ │ • PDF exports         │
        │   claudeEnterprise:{  │ │ │ 💬 Perceived    │   │ │ • API endpoints       │
        │     ...usageMetrics,  │ │ │    Value        │   │ │   (for future use)    │
        │   },                  │ │ ├─────────────────┤   │ └───────────────────────┘
        │   perceivedValue: {   │ │ │ Key Metrics:    │   │
        │     claudeEnterprise:{│ │ │ • Score: 87/100 │   │
        │       score: 87,      │ │ │ • NPS: +68      │   │
        │       avgSentiment:   │ │ │ • Sentiment:+0.74│  │
        │         0.74,         │ │ │                 │   │
        │       nps: 68,        │ │ │ Sentiment Trend │   │
        │       feedbackCount:  │ │ │ [Chart ───────] │   │
        │         142,          │ │ │                 │   │
        │       sentimentTrend: │ │ │ Top Themes:     │   │
        │         [...],        │ │ │ • Productivity  │   │
        │       topThemes: [...],│ │ │ • Ease of use  │   │
        │       quotes: [...],  │ │ │                 │   │
        │       painPoints: [...],│ │ What Users Say: │   │
        │       confluence: {...}│ │ │ "10x faster..." │   │
        │     },                │ │ │                 │   │
        │     claudeCode: {...},│ │ │ Pain Points:    │   │
        │     m365Copilot:{...},│ │ │ • Cost concerns │   │
        │     githubCopilot:{...}│ │ │                 │   │
        │   }                   │ │ │ Confluence:     │   │
        │ }                     │ │ │ • 8 wiki pages  │   │
        │                       │ │ │ • 3 retros      │   │
        │ Consumed by:          │ │ │ [View Details]  │   │
        │ • Overview tab        │ │ └─────────────────┘   │
        │ • Tool Deep Dive tabs │ │                       │
        │ • Compare Tools tab   │ │ Also displayed in:    │
        │ • Perceived Value tab │ │ • Overview tab        │
        │ • AI Insights         │ │   (sentiment cards)   │
        └───────────────────────┘ │ • Tool Deep Dive      │
                                  │   (sentiment section) │
                                  │ • Compare Tools       │
                                  │   (sentiment row)     │
                                  └───────────────────────┘
```

## Data Flow Summary

### Phase 1: Data Collection (Ingestion Layer)
```
External APIs/Files → Parse Scripts → Raw Sentiment Data Array
```
- **Input**: Slack messages, survey CSVs, interview MDs, Confluence pages
- **Process**: Fetch, parse, filter, enrich with employee metadata
- **Output**: `Array<{text, author, date, source}>`

### Phase 2: AI Analysis (Claude API Layer)
```
Raw Sentiment Data → Claude API (Batch Processing) → Analyzed Sentiment Data
```
- **Input**: Raw text + metadata
- **Process**: Claude API analyzes each item for sentiment, topics, intent
- **Output**: `Array<{...original, sentiment_score, topics, intent, summary}>`

### Phase 3: Aggregation (Metrics Calculation Layer)
```
Analyzed Data → Group by Tool → Calculate Metrics → Aggregated Sentiment Metrics
```
- **Input**: Analyzed sentiment data with scores
- **Process**: Group by tool, calculate avg/NPS/trends/themes
- **Output**: `Object<tool → {score, nps, trend, themes, quotes, painPoints}>`

### Phase 4: Integration (Merge with Usage Data)
```
Aggregated Sentiment + Usage Metrics → Merge → Final Dashboard Data
```
- **Input**: Sentiment metrics + usage metrics (existing pipeline)
- **Process**: Merge into unified data structure, generate AI insights
- **Output**: `app/ai-tools-data.json` (complete dashboard data)

### Phase 5: Presentation (Dashboard UI)
```
ai-tools-data.json → React Components → Interactive Dashboard
```
- **Input**: Complete dashboard data JSON
- **Process**: React components render charts, cards, tables
- **Output**: Interactive web dashboard (Next.js app)

---

## Key Components Detail

### Component 1: Claude API Sentiment Analyzer

**Input:**
```javascript
{
  text: "I've been using Claude Code and have seen impressive results...",
  author: "Devin Wagner",
  department: "Engineering",
  date: "2024-11-15",
  source: "slack:#claude-code-dev"
}
```

**Claude API Prompt Template:**
```
Analyze this [source] for AI tool sentiment.

Message: "[text]"
Author: [author] ([department])
Date: [date]

Extract:
1. sentiment_score (-1 to +1)
2. confidence (0 to 1)
3. topics (array of themes)
4. tool_mentioned (string)
5. features_mentioned (array)
6. intent (enum)
7. summary (1-2 sentences)

Return JSON only.
```

**Output:**
```javascript
{
  ...original,
  sentiment_score: 0.95,
  confidence: 0.98,
  topics: ["productivity", "speed"],
  tool_mentioned: "Claude Code",
  features_mentioned: ["multi-file tasks"],
  intent: "praise",
  summary: "Engineer reports 10x productivity boost..."
}
```

### Component 2: Perceived Value Score Calculator

**Formula:**
```javascript
function calculatePerceivedValueScore(messages) {
  // Step 1: Average sentiment (-1 to +1)
  const avgSentiment = mean(messages.map(m => m.sentiment_score));

  // Step 2: Calculate NPS (-100 to +100)
  const promoters = messages.filter(m => m.sentiment_score > 0.5).length;
  const detractors = messages.filter(m => m.sentiment_score < -0.5).length;
  const nps = ((promoters - detractors) / messages.length) * 100;

  // Step 3: Normalize to 0-100 scale
  const sentimentScore = (avgSentiment + 1) * 50;  // 0-100
  const npsScore = (nps + 100) / 2;                // 0-100

  // Step 4: Volume boost (more feedback = more reliable)
  const volumeBoost = Math.min(Math.log10(messages.length) / 5, 1);

  // Step 5: Weighted composite
  const baseScore = sentimentScore * 0.6 + npsScore * 0.4;
  const finalScore = baseScore * (0.7 + volumeBoost * 0.3);

  return Math.round(finalScore);
}
```

**Example:**
- 142 feedback items for Claude Enterprise
- avgSentiment: +0.74
- NPS: +68 (78 promoters, 10 detractors)
- sentimentScore: 87/100
- npsScore: 84/100
- volumeBoost: 0.43 (log10(142) / 5)
- **Final Score: 87/100** ✅

### Component 3: Sentiment Trend Analyzer

**Input:** Array of messages with timestamps

**Process:**
```javascript
function calculateSentimentTrend(messages) {
  // Group by month
  const byMonth = groupBy(messages, m => format(m.date, 'MMM yyyy'));

  // Calculate avg per month
  return Object.entries(byMonth).map(([month, msgs]) => ({
    month,
    score: mean(msgs.map(m => m.sentiment_score)),
    count: msgs.length
  })).sort((a, b) => new Date(a.month) - new Date(b.month));
}
```

**Output:**
```javascript
[
  { month: "Sep 2024", score: 0.65, count: 34 },
  { month: "Oct 2024", score: 0.72, count: 45 },
  { month: "Nov 2024", score: 0.78, count: 53 },
  { month: "Dec 2024", score: 0.74, count: 10 }  // Partial month
]
```

**Insight:** Sentiment improving +20% over 3 months (0.65 → 0.78)

---

## Execution Flow (Chronological)

### Daily Automated Run (Cron Job)

```
00:00 UTC - Trigger data pipeline
  |
  ├─> 00:01 - Fetch Slack messages (last 24 hours delta)
  |     └─> Rate limit: 100ms between channel fetches
  |
  ├─> 00:05 - Fetch Confluence updates (last 24 hours)
  |     └─> Rate limit: 100ms between page fetches
  |
  ├─> 00:10 - Check for new survey responses (Google Forms API)
  |
  ├─> 00:12 - Parse interview notes (if new files in /docs/interviews/)
  |
  ├─> 00:15 - AI Analysis Phase (Claude API)
  |     ├─> Batch process: 100ms delay between requests
  |     └─> ~150 messages * 100ms = 15 seconds
  |
  ├─> 00:16 - Aggregation Phase
  |     ├─> Group by tool
  |     ├─> Calculate metrics
  |     └─> Extract quotes/themes/pain points
  |
  ├─> 00:18 - Integration Phase
  |     ├─> Parse usage data (Claude, M365, GitHub)
  |     ├─> Merge sentiment + usage
  |     └─> Generate AI insights
  |
  ├─> 00:20 - Generate final output
  |     └─> Write app/ai-tools-data.json
  |
  └─> 00:21 - Pipeline complete ✅
        └─> Dashboard auto-updates (ISR or manual refresh)
```

**Total Runtime:** ~21 minutes (mostly AI analysis bottleneck)

### On-Demand Manual Run

```bash
# Full pipeline
npm run parse-data

# Individual components (for debugging)
node scripts/parse-slack-sentiment.js
node scripts/parse-confluence-wikis.js
node scripts/aggregate-sentiment.js
node scripts/parse-copilot-data.js  # Main integration
```

---

## Performance Considerations

### Bottlenecks

1. **Claude API Calls** (Slowest)
   - ~500ms per message analysis
   - 150 messages = 75 seconds
   - **Mitigation**: Batch process, 100ms delays

2. **Slack API Rate Limits**
   - 50 requests/minute per workspace
   - **Mitigation**: Sequential channel processing

3. **Confluence API Rate Limits**
   - 10 requests/second
   - **Mitigation**: 100ms delays between requests

### Optimizations

1. **Delta Processing** (Only New Data)
   - Store `lastProcessedDate` in state file
   - Only fetch messages/pages after that date
   - Reduces API calls by 90%+ after initial run

2. **Caching**
   - Cache analyzed sentiment for 7 days
   - Only re-analyze if message text changes
   - Reduces Claude API costs by 80%

3. **Parallel Processing**
   - Fetch Slack + Confluence in parallel (separate processes)
   - Analyze sentiment in batches of 10 (Promise.all)

4. **Incremental Aggregation**
   - Don't recalculate all metrics from scratch
   - Update only changed tool segments
   - Use streaming aggregation for large datasets

---

## Error Handling & Resilience

### Failure Scenarios

| Failure | Impact | Recovery Strategy |
|---------|--------|-------------------|
| Slack API down | No new Slack data | Use cached data, continue with other sources |
| Claude API rate limit | Sentiment analysis fails | Queue for retry, exponential backoff |
| Confluence auth expires | No wiki data | Alert admin, use stale data, refresh token |
| Parse error (malformed CSV) | Survey data missing | Log error, skip source, alert |
| Network timeout | Partial data loss | Retry 3 times, fallback to cached data |

### Graceful Degradation

```javascript
try {
  const slackMessages = await parseSlackSentiment();
} catch (error) {
  console.error('Slack parsing failed:', error);
  // Use cached Slack data from previous run
  const slackMessages = loadCachedData('slack-sentiment-cache.json');
}

try {
  const analyzed = await analyzeSentiment(allMessages);
} catch (error) {
  console.error('Claude API failed:', error);
  // Fall back to rule-based sentiment (basic keyword matching)
  const analyzed = fallbackSentimentAnalysis(allMessages);
}
```

---

## Monitoring & Observability

### Metrics to Track

1. **Pipeline Health**
   - Last successful run timestamp
   - Total runtime (target: < 30 minutes)
   - Error count per component

2. **Data Quality**
   - % of messages successfully analyzed
   - Average confidence score (target: > 0.7)
   - Missing tool mentions (% null tool_mentioned)

3. **API Usage**
   - Claude API tokens consumed
   - Slack API rate limit remaining
   - Confluence API calls per day

4. **Output Quality**
   - Sentiment score distribution (should be bell curve)
   - NPS score range (-100 to +100, expect 0-80 for good tools)
   - Feedback volume per tool (target: 50+ per month)

### Alerts

```javascript
// Send Slack alert if:
- Pipeline fails 2+ times in a row
- Sentiment drops > 0.3 for any tool in a week
- Feedback volume drops > 50% month-over-month
- Claude API confidence < 0.5 for > 20% of messages
```

---

## Cost Estimation

### Claude API Costs

**Pricing (Claude Sonnet 4):**
- Input: $3 per million tokens
- Output: $15 per million tokens

**Per Message Analysis:**
- Input: ~200 tokens (prompt + message)
- Output: ~100 tokens (JSON response)
- Cost per message: $0.0012

**Monthly Cost (Assuming 500 new messages/month):**
- 500 messages × $0.0012 = **$0.60/month**
- Annual: $7.20

**Extremely cost-effective!** 💰✅

### API Costs (Other)

- **Slack API**: Free (included in workspace plan)
- **Confluence API**: Free (included in Atlassian plan)
- **Google Forms**: Free

**Total Monthly Cost: ~$1 (Claude API only)**

---

This architecture provides a complete, scalable, and cost-effective sentiment analysis pipeline that enhances your AI tools dashboard with the critical "Perceived Value" dimension.
