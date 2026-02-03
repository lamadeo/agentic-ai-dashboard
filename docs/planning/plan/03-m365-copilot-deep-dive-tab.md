# M365 Copilot Deep Dive Tab - Design & Implementation Plan

**Status**: Planning
**Priority**: High
**Complexity**: Medium
**Estimated Effort**: 6-8 hours
**Created**: December 16, 2024

## Executive Summary

Create a dedicated M365 Copilot tab that provides deep insights into the 180-day usage data, focusing on power users, app-specific adoption patterns, and opportunity identification. This tab will be **additive** to existing tabs by surfacing granular insights not available elsewhere.

## Strategic Context

From Claude AI analysis of 180-day M365 Copilot data:
- **267 total Copilot licenses**, 239 active users (89.5% activation)
- **127,925 total prompts** submitted across organization
- **535 prompts per active user** (average over 180 days)
- **Power users**: Top user (Ambra Hubenthal) submitted 3,431 prompts over 112 active days
- **App dominance**: Teams (92.9%), Chat (82.0%), Outlook (74.9%)
- **Department leaders**: Marketing (429 avg prompts), Customer (416.6), People/HR (366.2)

## What Makes This Tab Additive (Not Duplicative)

### Existing Tab Coverage:
- **Overview**: High-level KPIs (total active users, prompts)
- **Productivity Tools**: M365 vs Claude comparison at org level
- **Departments**: Department adoption across ALL tools (M365 + Claude)
- **Adoption**: Monthly trend data

### New Tab Focus (Additive):
1. **Power User & Champion Identification** - Who are top 10-20 users? Which apps do they use?
2. **App-Specific Deep Dive** - Usage breakdown by M365 app (Teams, Word, Excel, PowerPoint, Outlook)
3. **Usage Intensity Analysis** - Prompts per active day, engagement quality metrics
4. **Adoption Maturity Segmentation** - Power users, Regular users, Light users, Inactive
5. **Opportunity Identification** - Low adopters, underutilized apps (e.g., PowerPoint at 37.7%)
6. **Department Benchmarking** - M365-specific department performance vs org average

## Data Available from M365 CSVs (180-day reports)

### Per-User Metrics:
```
- User Principal Name (email)
- Display Name
- Last Activity Date
- Report Period (180 days)
- Prompts submitted for All Apps
- Prompts submitted for Copilot Chat (work)
- Prompts submitted for Copilot Chat (web)
- Active Usage Days for All Apps
- Last activity date for each app:
  * Copilot Chat (work)
  * Copilot Chat (web)
  * Teams Copilot
  * Word Copilot
  * Excel Copilot
  * PowerPoint Copilot
  * Outlook Copilot
  * OneNote Copilot
  * Loop Copilot
  * M365 Copilot (app)
  * Edge
  * Copilot Agent
```

### Calculated Metrics (New):
- **Prompts per Active Day** (intensity metric)
- **App Utilization Score** (# of apps used / total apps available)
- **Engagement Consistency** (active days / 180)
- **User Segment** (Power/Regular/Light/Inactive based on thresholds)

## Tab Design: Layout & Visualizations

### Section 1: Executive KPIs (4 cards)
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Power Users │ Avg Prompts │ Avg Active  │ Most Used   │
│   (10%+)    │  per Day    │    Days     │    App      │
│             │             │             │             │
│    42       │    2.8      │    38       │   Teams     │
│  (17.6%)    │             │  (21.1%)    │  (92.9%)    │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

### Section 2: Power User Champions (Table)
**Top 20 Users by Total Prompts (180 days)**

| Rank | Name | Dept | Total Prompts | Active Days | Prompts/Day | Top Apps Used |
|------|------|------|---------------|-------------|-------------|---------------|
| 1 | Ambra Hubenthal | Customer | 3,431 | 112 | 30.6 | Teams, Chat, Outlook |
| 2 | Erica Makovsky | Customer | 2,465 | 130 | 19.0 | Teams, Word, Excel |
| ... | ... | ... | ... | ... | ... | ... |

**Key Insight**: *AI-generated analysis identifying patterns among power users*

### Section 3: App Utilization Breakdown (Horizontal Bar Chart)
**M365 App Adoption Rates (% of Active Users)**

```
Teams Copilot          ████████████████████████████████ 92.9% (222 users)
Copilot Chat (work)    ███████████████████████████ 82.0% (196 users)
Outlook Copilot        ████████████████████ 74.9% (179 users)
M365 App               ███████████████████ 73.6% (176 users)
Word Copilot           ████████████████ 67.4% (161 users)
Excel Copilot          ██████████████ 61.1% (146 users)
PowerPoint Copilot     ████████ 37.7% (90 users)
```

**Key Insight**: *AI identifies PowerPoint as opportunity area (37.7% vs 60%+ for other apps)*

### Section 4: Usage Intensity Distribution (Histogram)
**User Distribution by Prompts per Active Day**

```
           │
  80 users │     ████
           │     ████
  60 users │     ████  ████
           │     ████  ████
  40 users │ ████████  ████  ███
           │ ████████  ████  ███  ██
  20 users │ ████████  ████  ███  ██  █  █
           └─────────────────────────────────
             0-1   1-3   3-5  5-10 10-20 20+
                    Prompts per Active Day
```

### Section 5: Department Performance Matrix (Heatmap/Table)
**M365 Copilot Engagement by Department**

| Department | Active Users | Avg Prompts (180d) | Avg Active Days | Prompts/Day | Engagement Level |
|------------|--------------|-------------------|-----------------|-------------|------------------|
| Marketing | 22 | 429.0 | 41.9 | 10.2 | 🟢 High |
| Customer | 76 | 416.6 | 51.5 | 8.1 | 🟢 High |
| People/HR | 4 | 366.2 | 56.5 | 6.5 | 🟢 High |
| Sales | 18 | 217.6 | 35.7 | 6.1 | 🟡 Medium |
| Engineering | 74 | 161.7 | 28.5 | 5.7 | 🟡 Medium |
| ... | ... | ... | ... | ... | ... |

**Key Insight**: *AI analyzes department engagement patterns and identifies adoption leaders vs laggards*

### Section 6: User Engagement Segments (Pie Chart)
**M365 Copilot User Segmentation (239 Active Users)**

```
    Power Users (20+ prompts/active day): 12 users (5.0%) 🔥
    Engaged Users (5-20 prompts/day): 87 users (36.4%) 🟢
    Regular Users (1-5 prompts/day): 98 users (41.0%) 🟡
    Light Users (<1 prompt/day): 42 users (17.6%) 🔴
```

**Key Insight**: *AI recommends enablement strategies for each segment*

### Section 7: App Usage Patterns Over Time (Line Chart)
**Monthly Active Users by M365 App**

```
  250 │                              ╭─Teams
      │                         ╭────╯
  200 │                    ╭────╯ ╭──Chat (work)
      │               ╭────╯    ╭─╯
  150 │          ╭────╯      ╭──╯ ╭─Outlook
      │     ╭────╯       ╭───╯ ╭──╯
  100 │╭────╯        ╭───╯  ╭──╯ ╭─Word
      │          ╭───╯   ╭──╯ ╭──╯
   50 │     ╭────╯    ╭──╯ ╭──╯ ╭─Excel
      │╭────╯     ╭───╯ ╭──╯ ╭──╯
    0 └────────────────────────────────
      Sep   Oct   Nov   Dec
```

### Section 8: Opportunity Analysis (Cards + Table)

**Opportunity Areas**

```
┌────────────────────────┬────────────────────────┐
│  Low PowerPoint Usage  │    Inactive Users      │
│                        │                        │
│   90 users missing     │   28 licensed users    │
│   (37.7% adoption)     │   (0 prompts in 180d)  │
│                        │                        │
│   Potential: +150      │   Potential: Reclaim   │
│   presentations/month  │   $532/month licenses  │
└────────────────────────┴────────────────────────┘
```

**Low Engagement Users** (Candidates for Training)

| Name | Dept | Total Prompts | Active Days | Last Activity |
|------|------|---------------|-------------|---------------|
| ... | ... | 3 | 2 | 45 days ago |

**Key Insight**: *AI-generated recommendations for improving adoption*

## Data Schema Updates

### Add to `ai-tools-data.json`:

```javascript
{
  "m365CopilotDeepDive": {
    "summaryMetrics": {
      "powerUserCount": 42,
      "powerUserPercent": 17.6,
      "avgPromptsPerDay": 2.8,
      "avgActiveDays": 38,
      "avgActiveDaysPercent": 21.1,
      "mostUsedApp": "Teams Copilot",
      "mostUsedAppPercent": 92.9
    },

    "powerUsers": [
      {
        "rank": 1,
        "name": "Ambra Hubenthal",
        "email": "ahubenthal@techco.com",
        "department": "Customer",
        "totalPrompts": 3431,
        "activeDays": 112,
        "promptsPerDay": 30.6,
        "appsUsed": ["Teams", "Chat", "Outlook", "Word", "Excel"],
        "appUsageScore": 0.83  // 5/6 core apps
      },
      // ... top 20 users
    ],

    "appAdoption": [
      { "app": "Teams Copilot", "users": 222, "percent": 92.9 },
      { "app": "Copilot Chat (work)", "users": 196, "percent": 82.0 },
      { "app": "Outlook Copilot", "users": 179, "percent": 74.9 },
      { "app": "M365 App", "users": 176, "percent": 73.6 },
      { "app": "Word Copilot", "users": 161, "percent": 67.4 },
      { "app": "Excel Copilot", "users": 146, "percent": 61.1 },
      { "app": "PowerPoint Copilot", "users": 90, "percent": 37.7 }
    ],

    "intensityDistribution": [
      { "range": "0-1", "count": 42, "label": "Light Users" },
      { "range": "1-3", "count": 98, "label": "Regular Users" },
      { "range": "3-5", "count": 53, "label": "Engaged Users" },
      { "range": "5-10", "count": 34, "label": "Engaged Users" },
      { "range": "10-20", "count": 8, "label": "Power Users" },
      { "range": "20+", "count": 4, "label": "Power Users" }
    ],

    "departmentPerformance": [
      {
        "department": "Marketing",
        "activeUsers": 22,
        "avgPrompts": 429.0,
        "avgActiveDays": 41.9,
        "promptsPerDay": 10.2,
        "engagementLevel": "High",
        "color": "green"
      },
      // ... all departments
    ],

    "userSegments": {
      "powerUsers": { "count": 12, "percent": 5.0, "threshold": "20+ prompts/day" },
      "engagedUsers": { "count": 87, "percent": 36.4, "threshold": "5-20 prompts/day" },
      "regularUsers": { "count": 98, "percent": 41.0, "threshold": "1-5 prompts/day" },
      "lightUsers": { "count": 42, "percent": 17.6, "threshold": "<1 prompt/day" }
    },

    "appUsageTimeSeries": [
      {
        "month": "2024-09",
        "monthLabel": "September",
        "teams": 180,
        "chat": 150,
        "outlook": 120,
        "word": 95,
        "excel": 85,
        "powerpoint": 40
      },
      // ... monthly data
    ],

    "opportunities": {
      "lowPowerPointUsage": {
        "currentUsers": 90,
        "targetUsers": 161,  // Match Word adoption
        "gapUsers": 71,
        "potentialValue": "150 presentations/month"
      },
      "inactiveUsers": {
        "count": 28,
        "reclaimableLicenses": 28,
        "monthlySavings": 532  // $19/user * 28
      },
      "lowEngagementUsers": [
        {
          "name": "User Name",
          "department": "Dept",
          "totalPrompts": 3,
          "activeDays": 2,
          "lastActivity": "2024-10-22",
          "daysSinceLastActivity": 45
        },
        // ... users with <10 prompts in 180 days
      ]
    }
  }
}
```

## Implementation Plan

### Phase 1: Data Parsing Enhancement (2-3 hours)

**File**: `scripts/parse-copilot-data.js`

1. **Parse 180-day M365 CSV** (use "Last 6 months" file as primary source)
   - Extract per-user metrics (prompts, active days, last activity dates per app)
   - Calculate prompts per day for each user
   - Determine app usage for each user

2. **Calculate Power Users**
   - Sort by total prompts, identify top 20
   - Calculate usage intensity (prompts/day)
   - Identify which apps each power user uses

3. **Calculate App Adoption Rates**
   - Count users who have used each app (non-null last activity date)
   - Calculate percentage of active users

4. **Calculate Usage Intensity Distribution**
   - Bucket users by prompts/day ranges
   - Count users in each bucket

5. **Calculate Department Performance**
   - Group by department
   - Calculate avg prompts, avg active days, prompts/day per department

6. **Identify Opportunities**
   - Find users with <10 prompts in 180 days (low engagement)
   - Find users with 0 prompts (inactive licenses)
   - Calculate app adoption gaps (e.g., PowerPoint)

7. **Generate Time Series Data**
   - Use monthly CSV files to build app usage trends over time

### Phase 2: AI Insight Generation (1-2 hours)

**File**: `scripts/generate-insights.js`

Add new expert prompts:

1. **`m365_power_users`**: Analyzes power user patterns
   - What makes power users successful?
   - Which apps do they use?
   - Department patterns?

2. **`m365_app_adoption`**: Analyzes app utilization
   - Why is PowerPoint low (37.7%)?
   - What's driving Teams/Chat dominance?
   - Recommendations for underutilized apps

3. **`m365_department_performance`**: Analyzes department engagement
   - Why is Marketing/Customer outperforming?
   - What can Engineering learn from them?
   - Department-specific recommendations

4. **`m365_opportunities`**: Identifies improvement areas
   - Low engagement users (training candidates)
   - Inactive licenses (reclaim opportunities)
   - App adoption gaps (enablement opportunities)

### Phase 3: UI Implementation (2-3 hours)

**File**: `app/page.jsx`

1. Add new tab button: "M365 Deep Dive"
2. Implement 8 sections per design above:
   - Executive KPIs (4 MetricCard components)
   - Power User table (sortable, searchable)
   - App Utilization chart (horizontal bar chart)
   - Intensity Distribution histogram
   - Department Performance table/heatmap
   - User Segmentation pie chart
   - App Usage Time Series line chart
   - Opportunity Analysis cards + table

3. Add Key Insights sections with AI-generated content

### Phase 4: Testing & Validation (1 hour)

1. Verify power user rankings match Claude AI analysis
2. Validate app adoption percentages (Teams 92.9%, etc.)
3. Check department performance calculations
4. Test all charts and tables render correctly
5. Validate AI insights are relevant and accurate

## Business Value

### For Executives:
- **Identify Champions**: Top 20 users to feature in case studies
- **Spot Opportunities**: 71 users could adopt PowerPoint, 28 inactive licenses
- **Benchmark Departments**: Learn from Marketing's success (429 avg prompts)

### For Enablement Team:
- **Target Training**: 42 light users (<1 prompt/day) need enablement
- **App-Specific Campaigns**: Drive PowerPoint adoption (37.7% → 60%+)
- **Success Stories**: Showcase Ambra Hubenthal (3,431 prompts, 112 active days)

### For Finance:
- **License Optimization**: $532/month reclaimed from 28 inactive users
- **ROI Calculation**: Power users generate 20x more value than light users
- **Expansion Planning**: Identify high-value departments for additional licenses

## Success Metrics

- ✅ Power user table shows top 20 with correct rankings
- ✅ App adoption matches external analysis (Teams 92.9%, PowerPoint 37.7%)
- ✅ Department performance shows Marketing/Customer as leaders
- ✅ 4 AI-generated insights provide actionable recommendations
- ✅ Opportunity analysis identifies 28 inactive licenses, 71 PowerPoint adoption gap
- ✅ All visualizations render correctly and are responsive

## Future Enhancements

1. **Cohort Analysis**: Track new hire adoption journey (days to first prompt)
2. **Predictive Churn**: Identify users at risk of becoming inactive
3. **App Recommendation Engine**: Suggest which apps each user should try next
4. **Custom Segments**: Allow filtering by department, engagement level, app usage
5. **Export Functionality**: Download power user lists, opportunity reports as CSV

## Dependencies

### Data Sources:
- `365 CopilotActivityUserDetail- Last 6 months prior to Dec 11.csv` (primary)
- Monthly M365 CSV files (for time series trends)
- `techco_org_chart.json` (department mapping)

### Technologies:
- Recharts for visualizations (bar chart, line chart, pie chart)
- Existing MetricCard component
- Existing getDepartmentInfo() function
- Claude API for AI insights

### Business Rules:
- Power User threshold: 20+ prompts per active day OR top 10% of users
- Engaged User: 5-20 prompts per active day
- Regular User: 1-5 prompts per active day
- Light User: <1 prompt per active day
- Inactive User: 0 prompts in 180 days

## Risk Mitigation

1. **Data Quality**: Some users may have incomplete data (older CSVs missing columns)
   - **Mitigation**: Use most recent 180-day file as primary source

2. **Privacy Concerns**: Displaying individual user names/prompts
   - **Mitigation**: Only show aggregate data + top 20 power users (champions)

3. **Performance**: Large dataset (267 users × 12+ app columns)
   - **Mitigation**: Pre-calculate all metrics at build time, not runtime

## Timeline Estimate

- **Phase 1** (Data Parsing): 2-3 hours
- **Phase 2** (AI Insights): 1-2 hours
- **Phase 3** (UI): 2-3 hours
- **Phase 4** (Testing): 1 hour
- **Total**: 6-9 hours (1-1.5 days)

## Next Steps

1. Review and approve this plan
2. Identify which 180-day CSV file to use as primary data source
3. Confirm power user threshold definition (20+ prompts/day vs top 10%)
4. Begin Phase 1 implementation

---

**Document Version**: 1.0
**Last Updated**: December 16, 2024
**Owner**: Dashboard Development Team
