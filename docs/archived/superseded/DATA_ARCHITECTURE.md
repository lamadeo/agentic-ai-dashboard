# Data Architecture & Processing Pipeline

## Overview

This dashboard uses a **batch data processing pipeline** that transforms raw usage data from multiple sources into a unified JSON file consumed by the UI. The process is entirely data-driven: no hardcoded metrics, all calculations derived from actual usage patterns.

**Key Principle**: The UI never hardcodes data. All metrics, insights, and visualizations come from the generated `ai-tools-data.json`.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         RAW DATA SOURCES                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  📁 data/                                                       │
│  ├── techco_org_chart.json          [Org structure]            │
│  ├── claude_enterprise_seats.json        [License allocations]      │
│  ├── Claude Usage - audit_logs....csv    [Claude activity]          │
│  ├── claude_code_team_2025_XX_XX.csv     [Code generation metrics]  │
│  ├── github-copilot-*.ndjson             [GitHub Copilot usage]     │
│  ├── 365 CopilotActivityUserDetail.csv   [M365 Copilot usage]       │
│  └── perceived-value.json                [Sentiment analysis data]  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│                       PARSING & PROCESSING                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  🔧 scripts/parse-hierarchy.js                                       │
│     - Parses org chart JSON                                          │
│     - Generates employee email addresses                             │
│     - Maps employees → departments → teams                           │
│     - Calculates department headcounts                               │
│     - Resolves email aliases (duplicate names)                       │
│     Output: orgEmailMap (employee → department mapping)              │
│                                                                       │
│  🔧 scripts/parse-copilot-data.js          [MAIN PIPELINE]          │
│     Phase 1: Load & Parse                                            │
│       ├── Parse NDJSON (GitHub Copilot)                              │
│       ├── Parse CSV (Claude, M365, Claude Code)                      │
│       └── Parse JSON (org chart, seat allocations)                   │
│                                                                       │
│     Phase 2: Calculate Metrics                                       │
│       ├── GitHub Copilot: lines/user, model preferences, features    │
│       ├── Claude Enterprise: conversations, artifacts, files         │
│       ├── Claude Code: lines/user, top coders, monthly trends        │
│       └── M365 Copilot: prompts/user, app adoption, departments      │
│                                                                       │
│     Phase 3: Cross-Tool Analysis                                     │
│       ├── Premium candidacy scoring (0-115 points)                   │
│       ├── Department-level aggregations                              │
│       ├── Tool comparison metrics                                    │
│       └── Expansion opportunity calculations                         │
│                                                                       │
│     Phase 4: AI Insight Generation → generate-insights.js            │
│       ├── Call Claude API with expert prompts                        │
│       ├── Generate 15+ insights for different views                  │
│       └── Embed insights into output JSON                            │
│                                                                       │
│     Output: app/ai-tools-data.json                                   │
│                                                                       │
│  🔧 scripts/generate-insights.js                                     │
│     - Uses Claude API (Sonnet 4.5) to generate insights              │
│     - 15+ expert system prompts for different chart types            │
│     - Analyzes trends, patterns, anomalies                           │
│     - Provides actionable recommendations                            │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         GENERATED OUTPUT                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  📄 app/ai-tools-data.json     (~500KB unified data structure)      │
│     ├── metadata (lastGenerated timestamp)                           │
│     ├── overview (cross-tool summary)                                │
│     ├── claudeEnterprise { users, conversations, artifacts, ... }    │
│     ├── claudeCode { users, linesOfCode, topCoders, ... }            │
│     ├── m365Copilot { users, prompts, appAdoption, ... }             │
│     ├── githubCopilot { users, lines, modelPreferences, ... }        │
│     ├── orgMetrics { departments, headcounts, ... }                  │
│     ├── perceivedValue { scores, sentiment, themes, quotes, ... }    │
│     ├── expansion { opportunities, roi, recommendations, ... }       │
│     ├── currentStateROI { value, costs, roi, ... }                   │
│     └── aiInsights { 15+ insights for different views }              │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│                           UI LAYER                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ⚛️  app/page.jsx  (68KB React component)                           │
│     - Imports ai-tools-data.json statically                          │
│     - Renders 9 tabs with charts, tables, insights                   │
│     - NO data calculations in UI (all pre-calculated)                │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Sources Breakdown

### 1. Org Chart & Employee Mapping
**File**: `techco_org_chart.json`
**Purpose**: Source of truth for organizational structure
**Processed by**: `parse-hierarchy.js`

**What it contains**:
- CEO and all reporting lines (hierarchical tree)
- Employee names, titles, direct report counts
- Team size (includes indirect reports)

**What we derive**:
- Email addresses (generated algorithmically from names)
- Department assignments (based on who they report to)
- Team assignments (mid-level managers)
- Department headcounts (for expansion calculations)
- Email alias resolution (handles duplicate names like "John Smith 1" vs "John Smith 2")

**Example transformation**:
```javascript
// Input (org chart node)
{
  name: "Luis Amadeo",
  title: "VP of Agentic AI",
  directReports: 5,
  totalTeamSize: 5,
  reports: [...]
}

// Output (employee record)
{
  email: "lamadeo@techco.com",
  name: "Luis Amadeo",
  department: "Agentic AI",
  departmentHead: "Luis Amadeo",
  isDepartmentHead: true,
  directReports: 5
}
```

---

### 2. Claude Enterprise Licenses
**File**: `claude_enterprise_seats.json`
**Purpose**: Who has which tier (Premium vs Standard)
**Processed by**: `parse-copilot-data.js` → `parseLicenseTiers()`

**What it contains**:
```json
{
  "users": [
    {
      "email": "user@techco.com",
      "seatTier": "Premium",  // or "Standard" or "Unassigned"
      "status": "Active"       // or "Pending"
    }
  ]
}
```

**Why it matters**:
- Premium users have Claude Code access (terminal integration)
- Standard users only have web/desktop access
- Used to calculate upgrade opportunities (Standard → Premium)

---

### 3. Claude Enterprise Activity Logs
**Files**: `Claude Usage - audit_logs Nov_1_to_Dec_9.csv`
**Purpose**: Track every action users take in Claude Enterprise
**Processed by**: `parse-copilot-data.js` → Claude Enterprise section

**Key fields**:
- `actor_info`: User email (JSON string needing parsing)
- `event`: conversation_created, project_created, file_uploaded, artifact_created
- `created_at`: Timestamp
- `conversation_id`, `project_id`: Entity IDs

**Metrics derived**:
- Active users (distinct emails)
- Conversations per user
- Artifacts created per user
- Files uploaded per user
- Monthly trends (time-series aggregation)
- Department-level usage patterns

**Example aggregation**:
```javascript
// Count conversations per user
const conversationsByUser = events
  .filter(e => e.event === 'conversation_created')
  .reduce((acc, event) => {
    const email = extractEmail(event.actor_info);
    acc[email] = (acc[email] || 0) + 1;
    return acc;
  }, {});
```

---

### 4. Claude Code Usage Reports
**Files**: `claude_code_team_2025_11_01_to_2025_11_30.csv`
**Purpose**: Track lines of code generated via terminal
**Processed by**: `parse-copilot-data.js` → Claude Code section

**Key fields**:
- `User`: Username (needs mapping to email)
- `Lines of Code`: Total lines generated
- `Rank`: Position in leaderboard
- Period: Derived from filename (monthly reports)

**Metrics derived**:
- Active coders (users with lines > 0)
- Lines per user
- Top coders (leaderboard)
- Monthly trend (lines generated over time)
- Department-level productivity (engineering vs non-engineering)

**Key insight**: Claude Code users generate 27,650 lines/user on average (vs 3,700 for GitHub Copilot)

---

### 5. GitHub Copilot Usage
**Files**: `github-copilot-code-generation-data.ndjson`, `github-copilot-usage-data.ndjson`
**Purpose**: Compare against Claude Code
**Processed by**: `parse-copilot-data.js` → GitHub Copilot section

**Format**: NDJSON (newline-delimited JSON, one object per line)

**What it contains**:
- `user_login`: GitHub username
- `loc_added_sum`: Lines of code added (AI-generated)
- `totals_by_language_model`: Breakdown by model (Claude, GPT, Gemini)
- `totals_by_feature`: Usage by feature (code_completion, chat_panel, agent_edit)

**Key findings**:
- **72% of lines generated using Claude models** (not GPT)
- Engineers prefer Claude even within GitHub Copilot
- Agent Edit feature (Claude-powered) generates 57K lines (67% of total)

**Example record**:
```json
{
  "user_login": "gtaborga",
  "loc_added_sum": 12347,
  "totals_by_language_model": [
    {"model": "claude-sonnet-3.5", "loc_added_sum": 9500},
    {"model": "gpt-4", "loc_added_sum": 2847}
  ]
}
```

---

### 6. M365 Copilot Usage
**Files**: `365 CopilotActivityUserDetail - [date range].csv`
**Purpose**: Track M365 Copilot adoption and engagement
**Processed by**: `parse-copilot-data.js` → M365 Copilot section

**Key fields**:
- `User Principal Name`: Email
- `Last Activity Date`: Most recent usage
- `Has Performed Action`: Boolean (used at least once)
- `Word Last Activity Date`, `Excel Last Activity Date`, etc.: App-specific usage
- App-specific prompt counts (e.g., `Word Total Copilot Chats`)

**Metrics derived**:
- Active users (251 licensed, 238 active = 95% adoption)
- App adoption rates (Word: 67%, Excel: 33%, PowerPoint: 8%)
- Prompts per user (average: 86 prompts over period)
- Power users (top 20 by prompt volume)
- Department-level engagement

**Key insight**: M365 Copilot has 156 users who DON'T have Claude - expansion opportunity

---

## Calculation Logic

### Premium Candidacy Scoring (0-115 points)

**Purpose**: Identify who should get Premium vs Standard licenses based on actual usage patterns

**Scoring components**:
```javascript
function calculatePremiumScore(userActivity) {
  let score = 0;

  // 1. Code writing (0-30 points)
  if (userActivity.claudeCodeLines > 0) {
    score += 30;  // Auto-qualify: code writers need Premium
  }

  // 2. High engagement (0-30 points)
  if (userActivity.conversations >= 100) {
    score += 30;  // Power user: needs more capacity
  } else if (userActivity.conversations >= 50) {
    score += 20;
  } else if (userActivity.conversations >= 20) {
    score += 10;
  }

  // 3. Document creation (0-25 points)
  if (userActivity.artifacts >= 20) {
    score += 25;  // Heavy artifact creator
  } else if (userActivity.artifacts >= 10) {
    score += 15;
  } else if (userActivity.artifacts >= 5) {
    score += 8;
  }

  // 4. Complex work (0-15 points)
  if (userActivity.filesUploaded >= 50) {
    score += 15;  // Analysis/research work
  } else if (userActivity.filesUploaded >= 20) {
    score += 10;
  } else if (userActivity.filesUploaded >= 10) {
    score += 5;
  }

  // 5. M365 Engagement - Prompts per day (0-10 points)
  if (userActivity.m365PromptsPerDay >= 20) {
    score += 10;  // M365 power user likely needs Claude too
  } else if (userActivity.m365PromptsPerDay >= 10) {
    score += 7;
  } else if (userActivity.m365PromptsPerDay >= 5) {
    score += 4;
  }

  // 6. M365 Consistency (0-5 points)
  if (userActivity.m365ActiveDays >= 120) {
    score += 5;  // Regular AI user
  } else if (userActivity.m365ActiveDays >= 90) {
    score += 4;
  }

  return Math.min(score, 115);
}

// Threshold: 40 points = Premium candidate
// Example: Code writer (30) + 20 conversations (10) = 40 → Premium
```

**Why M365 data matters**: Identifies high AI engagement patterns even if user isn't using Claude yet.

---

### Department Baseline Allocation

**Purpose**: Ensure minimum Premium coverage based on role complexity, regardless of current usage

**Logic**:
```javascript
function getDepartmentPremiumBaseline(department) {
  // Engineering/Agentic AI: 100% (Claude Code requirement)
  if (department === 'Engineering' || department === 'Agentic AI') {
    return 1.00;
  }

  // High complexity: 35% (deep analytical work)
  if (['Finance', 'Product', 'Professional Services', 'Revenue Operations'].includes(department)) {
    return 0.35;
  }

  // Medium complexity: 20-25% (client-facing analytical)
  if (department === 'Customer Success') return 0.25;
  if (department.includes('Sales')) return 0.20;

  // Moderate: 18% (content/campaign work)
  if (['Marketing', 'Partnerships'].includes(department)) {
    return 0.18;
  }

  // Standard: 10% (operational efficiency)
  if (['Support', 'Operations', 'IT', 'Human Resources', 'Legal'].includes(department)) {
    return 0.10;
  }

  // Default: 15% (conservative)
  return 0.15;
}
```

**Rationale**:
- Finance: Complex modeling, forecasting, analysis → needs Premium capacity
- Product: Design, strategy, roadmapping → needs artifacts, Projects feature
- Sales: Deal analysis, proposal generation → moderate Premium need
- Support: Operational, less capacity-intensive → mostly Standard

---

### Hybrid Allocation (MAX Logic)

**Purpose**: Combine behavioral scoring + department baselines to get best recommendation

**Algorithm**:
```javascript
function recommendLicenseAllocation(department, userActivities, totalEmployees) {
  // 1. Behavioral: Score all active users, count those >= 40 points
  const premiumCandidates = userActivities.filter(u =>
    calculatePremiumScore(u) >= 40
  );
  const behavioralPremiumCount = premiumCandidates.length;

  // 2. Baseline: Apply department-specific percentage
  const baselinePercentage = getDepartmentPremiumBaseline(department);
  const baselinePremiumCount = Math.ceil(totalEmployees * baselinePercentage);

  // 3. MAX Logic: Take whichever is HIGHER
  const recommendedPremium = Math.max(behavioralPremiumCount, baselinePremiumCount);
  const recommendedStandard = totalEmployees - recommendedPremium;

  return {
    recommendedPremium,
    recommendedStandard,
    allocationMethod: behavioralPremiumCount > baselinePremiumCount
      ? 'behavioral_scoring'  // Data-driven (actual usage)
      : 'department_baseline'  // Role-based (complexity)
  };
}
```

**Example (Product department)**:
- Total employees: 18
- Baseline (35%): 7 Premium seats needed
- Behavioral (active users scored): 4 Premium candidates
- **Recommendation**: 7 Premium (MAX wins) → baseline ensures adequate coverage
- Method: `department_baseline`

**Example (Engineering department)**:
- Total employees: 83
- Baseline (100%): 83 Premium (Claude Code requirement)
- Behavioral: 21 active users
- **Recommendation**: 83 Premium → ALL engineers need it
- Method: `engineering_100_percent`

---

### Expansion ROI Calculation

**Purpose**: Calculate cost, value, and ROI for expanding Claude Enterprise to each department

**Formula**:
```javascript
function calculateExpansionOpportunities(departments) {
  for (const dept of departments) {
    // 1. Calculate license gaps
    const targetPremium = recommendedPremium;  // From hybrid allocation
    const targetStandard = recommendedStandard;

    const premiumGap = targetPremium - currentPremium;
    const standardGap = targetStandard - currentStandard;

    // Handle conversions: excess Standard → Premium upgrades
    const excessStandard = Math.max(0, currentStandard - targetStandard);
    const upgrades = Math.min(excessStandard, premiumGap);
    const newPremium = premiumGap - upgrades;  // New Premium purchases

    // 2. Calculate monthly costs
    const upgradeCost = upgrades * (200 - 40);  // $160/upgrade
    const newPremiumCost = newPremium * 200;
    const newStandardCost = standardGap * 40;
    const totalCost = upgradeCost + newPremiumCost + newStandardCost;

    // 3. Calculate monthly value (hours saved × hourly rate)
    const newUsers = (standardGap + newPremium);
    const baseValue = newUsers * 11 hours/month * $77/hour;  // $847/user

    // Premium upgrade value: Claude Code gives 10 extra hours/month
    const upgradeValue = upgrades * 10 hours * $77/hour;  // $770/upgrade

    const totalValue = baseValue + upgradeValue;

    // 4. Calculate ROI
    const netBenefit = totalValue - totalCost;
    const roi = totalCost > 0 ? totalValue / totalCost : 0;

    // Example: Product department
    // Target: 18 total (7 Premium, 11 Standard)
    // Current: 13 total (1 Premium, 12 Standard)
    // Gap: +6 Premium, -1 Standard
    // Action: 1 Standard→Premium upgrade + 6 new Premium
    // Cost: $160 + $1,200 = $1,360/month
    // Value: 5 new users × $847 + 1 upgrade × $770 = $5,005/month
    // ROI: 3.7x ($5,005 / $1,360)
  }
}
```

**Engineering department special case**:
- Engineering uses **20.3x productivity multiplier** (from actual data)
- Claude Code users generate 27,650 lines/month vs 3,700 for GitHub Copilot
- 20.3x = 27,650 / 1,356 (baseline Standard user productivity)
- Value: 20 hours/user/month (vs 11 hours for non-engineers)
- This makes Engineering the highest ROI expansion opportunity

---

## AI Insight Generation

### How It Works

**Trigger**: After all metrics are calculated, `generate-insights.js` is called

**Process**:
1. Extract specific data subsets for each insight type
2. Build expert system prompt (15+ different expert personas)
3. Call Claude API (Sonnet 4.5) with data + prompt
4. Parse response (2-5 sentence insights)
5. Embed insights into output JSON

**Example flow**:
```javascript
// 1. Extract data for "adoption_trend" insight
const adoptionData = {
  months: ['Sep', 'Oct', 'Nov', 'Dec'],
  activeUsers: [62, 68, 77, 75],
  conversations: [1847, 2583, 3621, 4284]
};

// 2. Build expert prompt
const prompt = `You are an expert in technology adoption analysis...
Analyze user adoption patterns over time to identify growth trajectories...
Data: ${JSON.stringify(adoptionData)}
Provide 2-3 sentences highlighting the most significant adoption pattern.`;

// 3. Call Claude API
const insight = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 500,
  temperature: 0.3,  // Low temp = more consistent
  messages: [{
    role: 'user',
    content: prompt
  }]
});

// 4. Extract text
const insightText = insight.content[0].text;
// "November showed record growth with 77 active users (14% increase).
//  Engineering adoption drives this growth, with conversations up 40%
//  month-over-month as new Premium seats enabled Claude Code access."

// 5. Embed in output
aiInsights.adoption_trend = insightText;
```

**Expert personas used**:
1. `adoption_trend` - Technology adoption analyst
2. `engagement_trend` - User engagement specialist
3. `lines_per_user_trend` - Developer productivity analyst
4. `model_preference` - AI model selection expert
5. `app_usage_trend` - Multi-app product analyst
6. `productivity_comparison` - Tool effectiveness analyst
7. `coding_tools_business_question` - Strategic technology advisor
8. `claude_enterprise_features` - Enterprise software adoption expert
9. `strategic_positioning` - Technology portfolio consultant
10. `overview_kpi_metrics` - Executive dashboard analyst
11. `monthly_growth_chart` - Growth analytics expert
12. `adoption_output_trends` - Adoption-to-output correlation analyst
13. `department_insights` - Strategic AI adoption consultant
14. `m365_power_users` - Power user behavior analyst
15. `cross_platform_department_comparison` - Cross-tool portfolio analyst
16. `expansion_opportunities_explanation` - Workforce analytics advisor
17. `rollout_strategy_explanation` - Change management strategist
18. `executiveSummary` - Strategic AI advisor to Board/Executives

**Why 15+ insights?**
- Different tabs need different contexts (Adoption tab vs Expansion tab)
- Different audiences (engineers vs executives)
- Different question types (trends vs comparisons vs recommendations)

---

## Output Structure

### Generated File: `app/ai-tools-data.json`

**Size**: ~500KB (all data for all 9 tabs)

**Top-level structure**:
```json
{
  "metadata": {
    "lastGenerated": "2024-12-22T10:30:00Z",
    "dataWindow": {
      "claude": "Nov 1 - Dec 9, 2024",
      "claudeCode": "Nov 1 - Dec 31, 2024",
      "m365": "Sep 1 - Dec 11, 2024",
      "github": "All time"
    }
  },

  "overview": {
    "overallAdoptionRate": 86,  // (75 active / 87 licensed)
    "totalConversations": 4284,
    "totalLinesOfCode": 304175,
    "aiToolsCount": 4  // Claude Enterprise, Claude Code, M365, GitHub
  },

  "claudeEnterprise": {
    "licensedUsers": 87,
    "activeUsers": 75,
    "premiumSeats": 13,
    "standardSeats": 74,
    "totalConversations": 4284,
    "totalArtifacts": 157,
    "totalFilesUploaded": 729,
    "conversationsPerUser": 57,
    "monthlyTrend": [
      {
        "monthLabel": "September",
        "users": 62,
        "conversations": 1847,
        "artifacts": 45,
        "engagementRate": 42,
        "engagedUsers": 26
      },
      // ... more months
    ],
    "departmentBreakdown": [
      {
        "department": "Engineering + Agentic AI",
        "users": 18,
        "conversations": 892,
        "artifacts": 45
      },
      // ... more departments
    ]
  },

  "claudeCode": {
    "activeUsers": 12,
    "totalLines": 331843,
    "linesPerUser": 27654,
    "topUsers": [
      { "username": "gtaborga", "lines": 52347 },
      // ... more users
    ],
    "monthlyTrend": [
      { "monthLabel": "November", "totalLines": 178515, "users": 11 },
      { "monthLabel": "December", "totalLines": 153328, "users": 12 }
    ]
  },

  "m365Copilot": {
    "licensedUsers": 251,
    "activeUsers": 238,
    "adoptionRate": 95,
    "totalPrompts": 20500,
    "promptsPerUser": 86,
    "appAdoption": {
      "Word": { "users": 160, "adoptionRate": 67 },
      "Excel": { "users": 79, "adoptionRate": 33 },
      "PowerPoint": { "users": 19, "adoptionRate": 8 },
      "Teams": { "users": 153, "adoptionRate": 64 }
    },
    "powerUsers": [
      {
        "email": "user@techco.com",
        "department": "Customer Success",
        "totalPrompts": 842,
        "promptsPerDay": 4.7
      },
      // ... top 20
    ],
    "monthlyTrend": [
      { "monthLabel": "September", "users": 210, "totalPrompts": 5200 },
      // ... more months
    ]
  },

  "githubCopilot": {
    "activeUsers": 46,
    "totalLines": 85195,
    "linesPerUser": 1852,
    "modelPreferences": [
      { "model": "Claude", "lines": 61763, "percentage": 72 },
      { "model": "GPT", "lines": 7670, "percentage": 9 },
      { "model": "Gemini", "lines": 6634, "percentage": 8 }
    ],
    "topUsers": [
      { "username": "dmccom", "lines": 12700 },
      // ... more users
    ],
    "featureUsage": [
      { "feature": "agent_edit", "users": 27, "lines": 57067 },
      { "feature": "code_completion", "users": 44, "lines": 5438 }
    ]
  },

  "orgMetrics": {
    "totalEmployees": 304,
    "totalDepartments": 15,
    "premiumSeats": 13,
    "standardSeats": 74,
    "departmentHeadcounts": {
      "Engineering": 83,
      "Customer Success": 45,
      "Professional Services": 37,
      // ... more
    }
  },

  "expansion": {
    "opportunities": [
      {
        "department": "Product",
        "totalEmployees": 18,
        "currentUsers": 13,
        "currentPremium": 1,
        "currentStandard": 12,
        "targetPremium": 7,
        "targetStandard": 11,
        "premiumGap": 6,
        "upgradesNeeded": 1,
        "newPremiumNeeded": 6,
        "totalAdditionalCost": 1360,
        "monthlyOpportunityCost": 5005,
        "netBenefit": 3645,
        "roi": 3.7,
        "allocationMethod": "department_baseline",
        "detail": "1 Std→Prem upgrade ($160) + 6 new Premium ($1,200) = $1,360"
      },
      // ... more departments sorted by ROI
    ],
    "phaseRecommendations": [
      {
        "phase": "Quick Wins (Q1 2026)",
        "departments": ["Product", "Revenue Operations", "Finance"],
        "reasoning": "High ROI + existing adoption base + small team size",
        "totalMonthlyIncrease": 4870,
        "cumulativeMonthlyValue": 15200,
        "paybackMonths": 0.4
      },
      // ... more phases
    ]
  },

  "currentStateROI": {
    "licensedUsers": 87,
    "costs": {
      "premium": 2600,  // 13 × $200
      "standard": 2960,  // 74 × $40
      "total": 5560
    },
    "value": {
      "hoursSaved": 957,  // 87 × 11 hours
      "monthlyValue": 73689,  // 957 × $77/hour
      "netBenefit": 68129
    },
    "roi": 13.2  // $73,689 / $5,560
  },

  "aiInsights": {
    "adoption_trend": "November showed record growth with 77 active users...",
    "engagement_trend": "Engaged users (≥3 prompts/day for 33%+ of days) increased...",
    "lines_per_user_trend": "December sustained high productivity at 12,777 lines/user...",
    "model_preference": "Engineers overwhelmingly prefer Claude models (72% of lines)...",
    "coding_tools_business_question": "With GitHub Copilot renewal in March 2026...",
    "strategic_positioning": "M365 Copilot and Claude Enterprise serve complementary...",
    "overview_kpi_metrics": ["Month-to-month analysis shows...", "User engagement remains strong..."],
    "monthly_growth_chart": ["Active users plateaued at 75-77...", "Conversations grew 18%..."],
    "department_insights": "Engineering + Agentic AI lead adoption with 18 active users...",
    "m365_power_users": "Top 20 M365 users average 421 prompts each...",
    "claude_enterprise_department_performance": "Product team leads with 13 active users...",
    "cross_platform_department_comparison": "Customer Success excels with M365...",
    "expansion_opportunities_explanation": "Our AI-powered recommendation engine analyzes...",
    "rollout_strategy_explanation": "We sequence by net benefit (not ROI%)...",
    "executiveSummary": {
      "bluf": "TechCo Inc has achieved 86% Claude Enterprise adoption...",
      "keyMetrics": [...],
      "strategicRecommendations": [...],
      "decisionPoints": [...]
    }
  }
}
```

---

## Script Execution

### How to Run

```bash
# 1. Ensure you have required environment variables
cp .env.example .env
# Edit .env and add ANTHROPIC_API_KEY=sk-ant-...

# 2. Run the main parsing script
node scripts/parse-copilot-data.js

# Output:
# ✅ Parsing org hierarchy...
# ✅ Parsing GitHub Copilot data...
# ✅ Parsing Claude Code data...
# ✅ Parsing Claude Enterprise data...
# ✅ Parsing M365 Copilot data...
# ✅ Calculating metrics...
# ✅ Calculating expansion opportunities...
# 🤖 Generating AI insights... (15 insights)
# ✅ Data written to app/ai-tools-data.json
```

### Execution Time

- **Without AI insights**: ~2-3 seconds
- **With AI insights** (15 API calls): ~30-45 seconds
  - Claude API calls run sequentially (not parallel)
  - Each insight: 500 tokens @ ~$0.003 = ~$0.045 total cost

### When to Re-run

**Trigger regeneration when**:
1. New monthly usage data available (CSV/PDF reports)
2. License changes (new users, upgrades, downgrades)
3. Org chart updates (new hires, departures, restructuring)

**Frequency**: Monthly (first week of each month when reports arrive)

---

## Key Design Decisions

### 1. Why Batch Processing (Not Real-Time)?

**Pros**:
- ✅ Simpler architecture (no database, no API layer)
- ✅ Fast UI (pre-calculated data, no runtime queries)
- ✅ Reproducible (same inputs → same outputs)
- ✅ Easy to debug (inspect intermediate steps)
- ✅ Git-tracked data (audit trail of changes)

**Cons**:
- ❌ Manual regeneration required (not automatic)
- ❌ No real-time updates (monthly cadence)
- ❌ Large JSON file (500KB, grows over time)

**Decision**: Batch is appropriate for **executive dashboards** (not operational tools). Monthly updates are sufficient for strategic decision-making.

### 2. Why Unified JSON (Not Multiple Files)?

**Pros**:
- ✅ Single source of truth
- ✅ Atomic updates (all tabs stay in sync)
- ✅ Simple import (`import data from './ai-tools-data.json'`)
- ✅ Easy to version control (one commit = one snapshot)

**Cons**:
- ❌ Large file size (500KB)
- ❌ Can't lazy-load individual tabs

**Decision**: 500KB is acceptable for modern browsers. If it grows beyond 2MB, consider splitting by tab.

### 3. Why Calculate Everything (Not Store Raw)?

**Pros**:
- ✅ UI stays dumb (no business logic)
- ✅ Consistent calculations (no drift between tabs)
- ✅ Easy to update formulas (change script, regenerate)
- ✅ Testable (unit test calculation functions)

**Cons**:
- ❌ Can't drill down to raw events in UI
- ❌ Hard to add ad-hoc calculations

**Decision**: Executive dashboards need **aggregated views**, not raw data exploration. For ad-hoc analysis, users should query raw CSVs directly.

### 4. Why AI-Generated Insights (Not Hardcoded)?

**Pros**:
- ✅ Adaptive (insights change as data changes)
- ✅ Expert perspective (15+ specialist personas)
- ✅ Natural language (easier for executives to consume)
- ✅ Trend detection (AI spots patterns humans might miss)

**Cons**:
- ❌ API cost (~$0.045 per regeneration)
- ❌ Non-deterministic (insights may vary slightly)
- ❌ Requires internet (Claude API call)

**Decision**: $0.045/month is negligible. AI insights provide **10x value** by surfacing non-obvious patterns and recommendations.

---

## Future Enhancements

### Phase 3: Database Migration
- Replace static JSON with PostgreSQL
- Enable real-time updates via webhooks
- Add historical trend tracking (currently only 4 months)

### Phase 4: Slack Integration
- Monitor `#claude-code-dev`, `#claude-enterprise` for sentiment
- Auto-detect adoption barriers ("can't figure out how to...")
- Track feature requests and bug reports

### Phase 5: Multi-Tenant
- Support multiple organizations
- Per-tenant data isolation
- Custom org-specific baselines

---

## Troubleshooting

### Common Issues

**1. "Could not parse license tiers"**
```bash
⚠️ Could not parse license tiers: ENOENT: no such file
```
**Fix**: Ensure `claude_enterprise_seats.json` exists in `data/`

**2. "ANTHROPIC_API_KEY not set"**
```bash
⚠️ ANTHROPIC_API_KEY not set. Skipping AI insight generation.
```
**Fix**: Add `ANTHROPIC_API_KEY=sk-ant-...` to `.env` file

**3. "Email duplicates detected"**
```bash
⚠️ Duplicate email detected: jsmith@techco.com
```
**Fix**: Script auto-resolves (generates `john.smith@techco.com` for 2nd person)

**4. "Department not mapped"**
```bash
⚠️ User lamadeo@techco.com: department not found in DEPARTMENT_NAME_MAPPING
```
**Fix**: Add mapping to `parse-hierarchy.js`:
```javascript
const DEPARTMENT_NAME_MAPPING = {
  'Luis Amadeo': 'Agentic AI',
  // Add new entry here
};
```

---

## Summary

This architecture transforms **20+ raw data files** → **1 unified JSON** → **9 dashboard tabs** with:
- ✅ Zero hardcoded metrics
- ✅ 15+ AI-generated insights
- ✅ Behavioral + role-based Premium allocation
- ✅ Cross-tool comparison (Claude vs M365 vs GitHub)
- ✅ Expansion ROI calculations
- ✅ Department-level breakdowns
- ✅ Monthly trend analysis

**Next evolution**: Phase 3 database migration for real-time updates, historical tracking, and API access.
