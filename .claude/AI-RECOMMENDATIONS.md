# AI-Powered Recommendations Engine

## Purpose

Transform the dashboard from a **reporting tool** into an **intelligent advisor** that:
1. Analyzes usage patterns, sentiment, and outcomes
2. Identifies optimization opportunities
3. Generates actionable recommendations for executives
4. Continuously learns and adapts strategies

---

## Core Principle: Data-Driven, Not Prescriptive

**❌ Wrong Approach**: Hardcode positioning like "M365 Copilot is complementary to Claude Enterprise"

**✅ Right Approach**: Analyze actual usage data and let AI determine:
- "Based on usage patterns, M365 Copilot and Claude Enterprise serve complementary use cases (M365 for routine Office work: 78% of actions in Word/Excel; Claude for strategic work: 94% of conversations involve complex analysis)"
- OR "Based on overlap analysis, 67% of Claude Enterprise users rarely use M365 Copilot, suggesting competitive rather than complementary positioning"

---

## Data Inputs for AI Analysis

### 1. Usage Metrics
- **Claude Enterprise**: Conversations, projects, artifacts, daily active users
- **Claude Code**: Lines of code, active users, productivity
- **GitHub Copilot**: Model preferences (Claude 72%), feature usage, acceptance rates
- **M365 Copilot**: App usage (Word, Excel, Teams), actions per user, adoption rate

### 2. Sentiment Data (from Slack)
Continuously monitor these channels:
- `#claude-code-dev` - Engineering feedback, technical issues, wins
- `#claude-enterprise` - General Claude adoption, use cases, questions
- `#ai-collab` - Cross-functional AI usage, collaboration patterns
- `#techco-thrv` - Company-wide discussions, strategic insights
- `#engineering` - Engineering team sentiment, tool preferences
- `#technology` - Technical decisions, tool evaluations

**Extract**:
- Success stories ("Saved 3 hours debugging with Claude Code")
- Pain points ("Can't access Claude Code, still using Copilot")
- Use cases ("Using Claude for release risk assessments")
- Preferences ("Claude is wayyyy better than Copilot")
- ROI stories ("What would have taken weeks is now 80% done in a week")

### 3. Cost Data
- License costs (actual spend)
- User-level allocation
- Competitor pricing

### 4. Organizational Context
- Department sizes (from Rippling)
- Reporting structure
- Role types (engineer, sales, support, etc.)

---

## AI Recommendation Categories

### 1. Tool Positioning Recommendations

**Question**: How do tools relate to each other?

**Analysis**:
```typescript
// Analyze usage overlap
const claudeUsers = getUsersWithActivity('claude_enterprise', last30Days);
const m365Users = getUsersWithActivity('m365_copilot', last30Days);
const overlap = intersection(claudeUsers, m365Users);

const claudeOnlyUsers = claudeUsers.filter(u => !m365Users.includes(u));
const m365OnlyUsers = m365Users.filter(u => !claudeUsers.includes(u));
const bothUsers = overlap;

// Analyze use case patterns
const claudeUseCases = extractUseCasesFromSlack('claude_enterprise');
const m365UseCases = extractUseCasesFromSlack('m365_copilot');

// Generate recommendation
if (overlapPercentage > 70 && useCaseSimilarity > 0.6) {
  recommendation = "COMPETITIVE: High user overlap and similar use cases suggest redundancy";
} else if (overlapPercentage > 70 && useCaseSimilarity < 0.4) {
  recommendation = "COMPLEMENTARY: Users use both tools for different purposes";
} else {
  recommendation = "SEGMENTED: Different user bases with minimal overlap";
}
```

**Example Output**:
> **M365 Copilot vs Claude Enterprise Positioning**: COMPLEMENTARY
> - 68% of Claude Enterprise users also use M365 Copilot weekly
> - M365 usage concentrated in Office apps (Word: 45%, Excel: 32%, Teams: 18%)
> - Claude usage concentrated in complex analysis (76% of conversations involve multi-turn problem-solving)
> - Slack sentiment: Users describe M365 for "quick docs" and Claude for "strategic thinking"
> - **Recommendation**: Position as complementary tools serving different needs

### 2. Business Rule Optimization

**Question**: Should we change our allocation strategy?

**Analysis**:
```typescript
// Current rule: 10% of non-engineering departments get Premium
// Analyze if this is optimal

const salesDept = getDepartmentMetrics('Sales');
const salesPremiumUsers = salesDept.users.filter(u => u.tier === 'Premium');
const salesStandardUsers = salesDept.users.filter(u => u.tier === 'Standard');

// Compare productivity and value
const premiumAvgConversations = average(salesPremiumUsers.map(u => u.conversations));
const standardAvgConversations = average(salesStandardUsers.map(u => u.conversations));

// Extract value stories from Slack
const salesValueStories = extractValueFromSlack('#sales', 'claude_enterprise');

if (premiumAvgConversations / standardAvgConversations > 3 && salesValueStories.length > 10) {
  recommendation = "Consider increasing Premium allocation to Sales from 10% to 25% based on high engagement and documented value";
}
```

**Example Output**:
> **Business Rule Recommendation**: EXPAND PREMIUM IN SALES
> - Current: 2 Premium seats in Sales (10% of team)
> - Analysis: Premium users in Sales average 47 conversations/month vs 12 for Standard users (3.9x)
> - Slack insights: 14 documented success stories from Sales team using Claude for proposal writing, customer research
> - ROI: Estimated $800/mo value per Premium Sales user (proposal quality improvements, faster response times)
> - **Recommendation**: Increase Sales Premium allocation to 25% (5 seats), projected ROI 4.2x

### 3. Adoption Improvement Strategies

**Question**: How do we increase adoption in underutilized teams?

**Analysis**:
```typescript
const allDepts = getDepartments();
const adoptionByDept = allDepts.map(dept => ({
  name: dept.name,
  employees: dept.totalEmployees,
  licenses: dept.licenses,
  activeUsers: dept.activeUsers,
  adoptionRate: dept.activeUsers / dept.licenses
}));

// Identify low adoption
const lowAdoptionDepts = adoptionByDept.filter(d => d.adoptionRate < 0.5);

// Analyze blockers from Slack
const blockers = extractBlockersFromSlack(lowAdoptionDepts.map(d => `#${d.name}`));

// Generate targeted recommendations
lowAdoptionDepts.forEach(dept => {
  const commonBlockers = findCommonPatterns(blockers.filter(b => b.department === dept.name));
  recommendations.push({
    department: dept.name,
    issue: `Low adoption: ${dept.adoptionRate * 100}%`,
    blockers: commonBlockers,
    actions: generateActions(commonBlockers)
  });
});
```

**Example Output**:
> **Adoption Alert**: MARKETING TEAM (32% adoption)
> - 7 of 21 licenses unused or inactive
> - Slack analysis: Common themes - "Don't know when to use Claude vs ChatGPT", "Need examples for marketing use cases"
> - **Recommended Actions**:
>   1. Host marketing-specific training session (show use cases: campaign ideation, copy refinement, market research)
>   2. Create Claude project template for campaign planning
>   3. Pair low-adoption users with power users for mentorship
>   4. Share success story from Sara Johnson (Marketing): "30-45min → 5-10min for daily catch-up"

### 4. Consolidation Opportunities

**Question**: Can we eliminate redundant tools?

**Analysis**:
```typescript
const copilotUsers = getUsers('github_copilot');
const copilotModelPreference = analyzeModelPreference(copilotUsers);

if (copilotModelPreference.claude > 0.70) {
  // Engineers prefer Claude models even in Copilot

  const claudeCodeUsers = getUsers('claude_code');
  const overlap = intersection(copilotUsers, claudeCodeUsers);

  const copilotCost = copilotUsers.length * 19 * 12; // Annual
  const claudeCodeCost = (copilotUsers.length - overlap.length) * 200 * 12; // Need to add these users

  const netCost = claudeCodeCost - copilotCost;

  // Analyze sentiment
  const copilotSentiment = analyzeSentiment('#engineering', 'github copilot');
  const claudeCodeSentiment = analyzeSentiment('#claude-code-dev', 'claude code');

  if (claudeCodeSentiment.positive > copilotSentiment.positive * 2) {
    recommendation = `SUNSET GITHUB COPILOT: Engineers prefer Claude (${copilotModelPreference.claude * 100}% of usage),
                      sentiment for Claude Code overwhelmingly positive, net cost ${netCost > 0 ? `+$${netCost}` : `saves $${Math.abs(netCost)}`}/year`;
  }
}
```

**Example Output**:
> **Consolidation Recommendation**: SUNSET GITHUB COPILOT (March 2026)
> - 46 engineers using GitHub Copilot
> - Model preference: Claude 72%, GPT 8%, Gemini 8%, Other 12%
> - Sentiment analysis:
>   - Claude Code: 23 positive mentions, 0 negative mentions
>   - GitHub Copilot: 3 positive mentions, 4 negative mentions ("prefer Claude", "Copilot fatigue")
> - Productivity: Claude Code users 7.5x more productive (27,650 vs 3,700 lines/user)
> - Cost impact: Current Copilot cost $10,512/year (46 × $19/mo). Consolidation to Claude Code Premium saves this cost.
> - **Recommendation**: Do not renew GitHub Copilot contract in March 2026. Migrate all 46 users to Claude Code Premium (already planned in Q1 2026 Engineering rollout).

### 5. Executive Summary Insights

**Format**: Weekly AI-generated executive summary with:

```markdown
# AI Analytics Executive Summary - Week of Dec 8, 2025

## Key Insights

### 🎯 Adoption Trends
- Claude Enterprise adoption up 8% this week (73 → 79 active users)
- Engineering team now at 94% adoption (66 of 70 using Claude Code)
- ⚠️ Marketing team adoption dropped to 32% (investigate)

### 💰 ROI Highlights
- Documented time savings this week: 127 hours across 34 Slack mentions
- Top ROI story: Devin Wagner (Engineering) - "3-4 days → 1 hour" for test migration project
- Estimated value created this week: $38,400 (based on documented savings)

### 🔧 Tool Insights
- GitHub Copilot: Claude model usage increased to 74% (was 72% last week)
- M365 Copilot: Steady usage in Office apps, no overlap with strategic Claude work
- ChatGPT shadow IT: Down 23% (users shifting to Claude Enterprise)

### 📊 Recommendations This Week
1. **URGENT**: Marketing team needs intervention (adoption dropped 11 points)
2. **OPPORTUNITY**: Sales team showing high Premium engagement - consider expanding allocation
3. **DECISION**: GitHub Copilot contract renewal in 12 weeks - data strongly supports non-renewal

### 💬 Sentiment Highlights
- "Claude Code saved me so much time" - Taran Pierce (Engineering)
- "I am OVER co-pilot! Who is using Claude?" - Courtney Rogan (Sales)
- "Having Claude connected to Atlassian has made working with Solution Design Documents really easy" - Roger Hampton (Engineering)

---

*This summary is AI-generated from usage data and Slack sentiment analysis. Review full dashboard for details.*
```

---

## Implementation Architecture

### AI Pipeline

```typescript
// 1. Data Collection (automated)
const usageData = await fetchAllUsageMetrics();
const slackData = await fetchSlackMessages(MONITORED_CHANNELS, last7Days);
const costData = await fetchCostData();
const orgData = await fetchOrgChart();

// 2. Analysis (Claude API)
const analysisPrompt = `
Analyze this AI tool usage data and Slack sentiment to generate recommendations:

Usage Data: ${JSON.stringify(usageData)}
Slack Sentiment: ${JSON.stringify(slackData)}
Cost Data: ${JSON.stringify(costData)}

Generate recommendations for:
1. Tool positioning (complementary vs competitive)
2. Business rule optimization
3. Adoption improvement strategies
4. Consolidation opportunities
5. Executive summary insights

Format as structured JSON.
`;

const recommendations = await claude.messages.create({
  model: 'claude-sonnet-4',
  max_tokens: 4000,
  messages: [{
    role: 'user',
    content: analysisPrompt
  }]
});

// 3. Store & Display
await db.recommendations.create({
  week: currentWeek,
  category: 'executive_summary',
  insights: recommendations.content,
  generated_at: new Date()
});
```

### Slack Integration

```typescript
// Slack MCP Connector or API
import { SlackClient } from '@slack/web-api';

const slack = new SlackClient(process.env.SLACK_BOT_TOKEN);

async function fetchSlackSentiment(channels: string[], days: number) {
  const messages = [];

  for (const channel of channels) {
    const result = await slack.conversations.history({
      channel: channel,
      oldest: daysAgo(days).getTime() / 1000
    });

    messages.push(...result.messages);
  }

  // Filter for AI tool mentions
  const relevantMessages = messages.filter(msg =>
    msg.text?.match(/(claude|copilot|chatgpt|ai)/i)
  );

  return relevantMessages;
}

// Sentiment extraction with Claude
async function analyzeSentiment(messages) {
  const prompt = `
  Analyze these Slack messages for sentiment about AI tools.
  Categorize by: tool, sentiment (positive/negative/neutral), use case, value story.

  Messages: ${JSON.stringify(messages)}
  `;

  const analysis = await claude.messages.create({
    model: 'claude-sonnet-4',
    messages: [{ role: 'user', content: prompt }]
  });

  return JSON.parse(analysis.content[0].text);
}
```

---

## Continuous Learning

The AI recommendation engine should:

1. **Track recommendation outcomes**:
   - Was the recommendation followed?
   - Did it improve metrics?
   - Feedback from executives

2. **Refine models over time**:
   - Which types of recommendations drive most value?
   - Which Slack channels have highest signal?
   - What patterns predict successful adoption?

3. **A/B test strategies**:
   - Test different allocation strategies
   - Measure impact of interventions
   - Compare predicted vs actual ROI

---

## Security & Privacy

- Slack messages analyzed at aggregate level, not individual
- No PII exposed in recommendations
- Sentiment analysis focuses on tool usage, not personal performance
- Access controls: Recommendations visible to executives only
- Audit trail: Log all AI-generated recommendations

---

## Success Metrics for AI Recommendations

Track effectiveness:
- % of recommendations acted upon
- Measured impact (adoption increase, cost savings, ROI improvement)
- Executive satisfaction scores
- Time saved in decision-making
- Accuracy of predictions (projected vs actual ROI)

---

## Phasing

**Phase 2**: Static recommendations (manual Slack analysis)
**Phase 3**: Slack integration + basic sentiment extraction
**Phase 4**: Full AI recommendation engine with Claude API
**Phase 5**: Continuous learning and adaptive strategies
