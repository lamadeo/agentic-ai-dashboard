# Static Tabs Migration Plan - Data-Driven Architecture

**Date Created:** December 16, 2024
**Status:** Planning
**Priority:** High
**Estimated Effort:** 2-3 weeks

---

## Executive Summary

Migrate 7 static tabs (Overview, Adoption, Productivity, Departments, Code, Enablement, Expansion) from hardcoded data arrays to the data-driven architecture used by Coding Tools and Productivity Tools tabs. This will enable:
- Single source of truth (ai-tools-data.json)
- Automated updates via data parsing pipeline
- Consistent data accuracy across all tabs
- Leverage existing org hierarchy, email aliases, and filtering logic

---

## Current State Analysis

### ✅ Data-Driven Tabs (Already Migrated)
1. **Coding Tools** - GitHub Copilot vs Claude Code
2. **Productivity Tools** - M365 Copilot vs Claude Enterprise

**Architecture:**
```
parse-hierarchy.js → parse-copilot-data.js → generate-insights.js
  ↓
ai-tools-data.json (110KB unified data)
  ↓
page.jsx imports and renders
```

### ❌ Static Tabs (Need Migration)
3. **Overview** - Summary metrics, key insights
4. **Adoption** - User activation, daily active trends
5. **Productivity** - Time savings, ROI examples
6. **Departments** - Department-by-department breakdown
7. **Code** - Claude Code leaderboard
8. **Enablement** - Training needs, expansion priorities
9. **Expansion** - Cost/ROI calculations for full rollout

**Current Implementation:**
- Hardcoded data arrays in `page.jsx` (lines 40-389)
- `summaryMetrics`, `departmentData`, `claudeCodeLeaderboard`, etc.
- Static values from early December snapshots
- No automated updates

---

## Data Availability Assessment

### Already Available in ai-tools-data.json

From `parse-copilot-data.js` output:

✅ **GitHub Copilot:**
- `activeUsers`, `totalLines`, `linesPerUser`
- `modelPreferences` (Claude 72%)
- `topUsers` (username, lines)
- `featureUsage` (code_completion, agent_edit, chat_panel)
- `monthlyTrend` (users, lines per month)

✅ **Claude Code:**
- `activeUsers`, `licensedUsers`, `totalLines`, `linesPerUser`
- `monthlyTrend` (Sept-Dec: users, lines, lines/user)

✅ **M365 Copilot:**
- `activeUsers`, `licensedUsers`, `totalPrompts`, `promptsPerUser`
- `appUsage` (Teams, Outlook, Chat, Word, Excel, PowerPoint)
- `monthlyTrend` (Sept-Dec: users, prompts, prompts/user)
- `departmentBreakdown` (department, users, prompts, adoption rate)

✅ **Claude Enterprise:**
- `activeUsers`, `licensedUsers`
- `totalConversations`, `totalProjects`, `totalArtifacts`
- `conversationsPerUser`, `promptsPerUser`
- `weeklyTrend` (users, conversations, messages)
- `monthlyTrend` (Sept-Dec: users, conversations, messages, messages/user)
- `departmentBreakdown` (department, users, conversations, adoption rate)

✅ **Organization Hierarchy:**
- Email → department/team mappings (251 employees)
- 15 departments with adoption rates
- Email alias resolution
- Current vs former employee filtering

✅ **AI Insights:**
- 9 pre-generated insights per chart
- Strategic positioning, productivity comparisons

✅ **Cross-Tool Comparisons:**
- `productivityMultiplier`: 17.6x (Claude Code vs GitHub Copilot)
- `engagementMultiplier`: 4.9x (Claude Enterprise vs M365)

### Missing Data (Need to Add to Parser)

❌ **For Overview Tab:**
- Time-based metrics (last 7 days, last 30 days)
- Growth rates (month-over-month %)
- Top performing departments (by engagement)

❌ **For Adoption Tab:**
- Daily active users trend (not just monthly)
- Activation funnel (licensed → activated → active)
- Seat utilization by tier (Premium vs Standard)

❌ **For Productivity Tab:**
- Time savings calculations (hours saved per user)
- ROI examples (specific use cases with impact)
- Feature usage patterns (what features drive value)

❌ **For Code Tab:**
- Claude Code leaderboard with rankings
- Weekly active users (not just monthly)
- User growth trend (new users per week)

❌ **For Enablement Tab:**
- Training completion rates
- Support ticket volume
- Feature adoption by user cohort
- Expansion priorities (departments to target)

❌ **For Expansion Tab:**
- Cost projections (full rollout scenarios)
- ROI modeling (payback period, NPV)
- Seat expansion recommendations
- Budget impact analysis

---

## Migration Strategy

### Phase 1: Extend Parser for Missing Data (Week 1)

**Goal:** Add all missing metrics to `parse-copilot-data.js` and `ai-tools-data.json`

#### 1.1 Overview Tab Data
**File:** `scripts/parse-copilot-data.js`

Add to output schema:
```javascript
dashboardData.overview = {
  // Summary metrics
  totalActiveUsers: claudeEnterpriseActiveUsers + m365ActiveUsers,
  totalLicensedUsers: LICENSE_CONFIG.claudeEnterprise.licensedUsers + LICENSE_CONFIG.m365Copilot.licensedUsers,
  overallAdoptionRate: Math.round((totalActiveUsers / totalLicensedUsers) * 100),

  // Growth metrics (month-over-month)
  userGrowth: calculateMoMGrowth(claudeEnterpriseMonthly, 'users'),
  conversationGrowth: calculateMoMGrowth(claudeEnterpriseMonthly, 'conversations'),

  // Top departments (by engagement)
  topDepartments: calculateTopDepartments(
    [...m365DepartmentBreakdown, ...claudeEnterpriseDepartmentBreakdown]
  ),

  // Recent activity (last 7 days, last 30 days)
  recentActivity: {
    last7Days: calculateRecentActivity(claudeEnterpriseWeekly, 7),
    last30Days: calculateRecentActivity(claudeEnterpriseMonthly, 30)
  }
};
```

**Helper Functions to Add:**
```javascript
function calculateMoMGrowth(monthlyData, metric) {
  if (monthlyData.length < 2) return 0;
  const current = monthlyData[monthlyData.length - 1][metric];
  const previous = monthlyData[monthlyData.length - 2][metric];
  return Math.round(((current - previous) / previous) * 100);
}

function calculateTopDepartments(departmentBreakdowns) {
  // Combine M365 and Claude Enterprise, sort by total engagement
  return departmentBreakdowns
    .map(dept => ({
      department: dept.department,
      totalEngagement: dept.totalPrompts || dept.totalConversations || 0,
      activeUsers: dept.activeUsers,
      adoptionRate: dept.adoptionRate
    }))
    .sort((a, b) => b.totalEngagement - a.totalEngagement)
    .slice(0, 5);
}
```

#### 1.2 Adoption Tab Data
Add to output schema:
```javascript
dashboardData.adoption = {
  // Funnel metrics
  licensedUsers: LICENSE_CONFIG.claudeEnterprise.licensedUsers,
  activatedUsers: orgEmailMap.size, // Users in org chart
  activeUsers: claudeEnterpriseActiveUsers,
  activationRate: Math.round((activatedUsers / licensedUsers) * 100),
  activeRate: Math.round((activeUsers / activatedUsers) * 100),

  // Daily active users (from weekly data)
  dailyActiveUsers: calculateDailyActive(claudeEnterpriseWeekly),

  // Seat utilization by tier
  seatUtilization: calculateSeatUtilization(orgEmailMap, claudeEnterpriseUsers),

  // Monthly activation trend
  activationTrend: claudeEnterpriseMonthly.map(m => ({
    month: m.month,
    activated: m.users,
    rate: Math.round((m.users / licensedUsers) * 100)
  }))
};
```

#### 1.3 Productivity Tab Data
Add to output schema:
```javascript
dashboardData.productivity = {
  // Time savings (based on prompts/conversations)
  avgTimeSavingsPerUser: calculateTimeSavings(
    claudeEnterprisePromptsPerUser,
    m365PromptsPerUser
  ),
  totalTimeSaved: avgTimeSavingsPerUser * (claudeEnterpriseActiveUsers + m365ActiveUsers),

  // ROI examples (from AI insights or manual curation)
  roiExamples: [
    {
      useCase: "Code Generation",
      timeSaved: "4 hours/week",
      tool: "Claude Code",
      impact: "17.6x productivity gain"
    },
    // ... more examples
  ],

  // Feature usage patterns
  topFeatures: [
    ...githubCopilot.featureUsage.slice(0, 5),
    { feature: "Claude Projects", users: claudeEnterpriseData.totalProjects }
  ]
};
```

#### 1.4 Code Tab Data (Claude Code Leaderboard)
Add to output schema:
```javascript
dashboardData.code = {
  leaderboard: claudeCodeTopUsers, // From Claude Code JSON or infer from lines
  weeklyActiveUsers: calculateWeeklyActive(claudeCodeMonthly),
  userGrowthTrend: claudeCodeMonthly.map(m => ({
    month: m.month,
    newUsers: m.users - (previousMonth?.users || 0),
    totalUsers: m.users
  }))
};
```

#### 1.5 Enablement Tab Data
Add to output schema:
```javascript
dashboardData.enablement = {
  // Training completion (placeholder - would need new data source)
  trainingCompletion: 0, // Not yet tracked

  // Support metrics (placeholder)
  supportTickets: 0, // Not yet tracked

  // Feature adoption by cohort
  adoptionByCohort: calculateCohortAdoption(claudeEnterpriseMonthly),

  // Expansion priorities (departments with low adoption)
  expansionPriorities: calculateExpansionPriorities(
    m365DepartmentBreakdown,
    claudeEnterpriseDepartmentBreakdown
  )
};
```

#### 1.6 Expansion Tab Data
Add to output schema:
```javascript
dashboardData.expansion = {
  // Cost projections (use LICENSE_CONFIG pricing)
  currentCosts: calculateCurrentCosts(LICENSE_CONFIG),
  fullRolloutCosts: calculateFullRolloutCosts(orgEmailMap.size, LICENSE_CONFIG),

  // ROI modeling
  paybackPeriod: calculatePaybackPeriod(
    fullRolloutCosts,
    avgTimeSavingsPerUser,
    avgSalary // Would need to add as constant
  ),

  // Seat expansion recommendations
  recommendations: generateExpansionRecommendations(
    departmentBreakdowns,
    LICENSE_CONFIG
  )
};
```

**Estimated Effort:** 3-4 days (20-25 hours)

---

### Phase 2: Update UI Components (Week 2)

**Goal:** Replace hardcoded data with ai-tools-data.json imports

#### 2.1 Overview Tab Migration
**File:** `app/page.jsx` (lines 411-516)

**Before:**
```javascript
const summaryMetrics = {
  claudeUsers: 78, // Hardcoded
  claudeConversations: 2377,
  // ...
};
```

**After:**
```javascript
// Already imported at top: import aiToolsData from './ai-tools-data.json';
const { overview } = aiToolsData;
```

**Changes:**
- Replace all `summaryMetrics` references with `overview.*`
- Update charts to use `overview.recentActivity`, `overview.topDepartments`
- Update growth indicators with `overview.userGrowth`, `overview.conversationGrowth`

#### 2.2 Adoption Tab Migration
**File:** `app/page.jsx` (lines 1798-1843)

**Before:**
```javascript
const adoptionData = [
  { day: 'Mon', users: 68 }, // Hardcoded
  { day: 'Tue', users: 72 },
  // ...
];
```

**After:**
```javascript
const { adoption } = aiToolsData;
```

**Changes:**
- Replace `adoptionData` with `adoption.dailyActiveUsers`
- Update funnel chart with `adoption.licensedUsers`, `adoption.activatedUsers`, `adoption.activeUsers`
- Update activation trend with `adoption.activationTrend`

#### 2.3 Productivity Tab Migration
**File:** `app/page.jsx` (lines 1844-1921)

**Before:**
```javascript
const productivityData = [
  { metric: 'Time Saved', value: '320 hours', icon: Clock },
  // Hardcoded
];
```

**After:**
```javascript
const { productivity } = aiToolsData;
```

**Changes:**
- Replace `productivityData` with `productivity.avgTimeSavingsPerUser`, `productivity.totalTimeSaved`
- Update ROI examples with `productivity.roiExamples`
- Update feature usage with `productivity.topFeatures`

#### 2.4 Departments Tab Migration
**File:** `app/page.jsx` (lines 1922-2004)

**Before:**
```javascript
const departmentData = [
  { name: 'AI & Data', users: 12, adoption: 100, avgConversations: 45 },
  // Hardcoded
];
```

**After:**
```javascript
const { m365Copilot, claudeEnterprise } = aiToolsData;
const departmentData = [
  ...m365Copilot.departmentBreakdown,
  ...claudeEnterprise.departmentBreakdown
];
```

**Changes:**
- Use existing `departmentBreakdown` from both tools
- Merge M365 and Claude Enterprise data by department
- Calculate combined adoption rates

#### 2.5 Code Tab Migration
**File:** `app/page.jsx` (lines 2005-2091)

**Before:**
```javascript
const claudeCodeLeaderboard = [
  { rank: 1, name: 'Gabriel Taborga', lines: 52347, department: 'Engineering' },
  // Hardcoded
];
```

**After:**
```javascript
const { code, claudeCode } = aiToolsData;
const leaderboard = code.leaderboard || claudeCode.topUsers;
```

**Changes:**
- Use `code.leaderboard` or derive from `claudeCode.topUsers`
- Update weekly active users with `code.weeklyActiveUsers`
- Update growth trend with `code.userGrowthTrend`

#### 2.6 Enablement Tab Migration
**File:** `app/page.jsx` (lines 2092-2156)

**Before:**
```javascript
// Mixed static content and some data
```

**After:**
```javascript
const { enablement } = aiToolsData;
```

**Changes:**
- Use `enablement.expansionPriorities` for department targeting
- Use `enablement.adoptionByCohort` for cohort analysis
- Training/support metrics remain placeholders until data source available

#### 2.7 Expansion Tab Migration
**File:** `app/page.jsx` (lines 2157-end)

**Before:**
```javascript
const expansionScenarios = [
  { scenario: 'Engineering Only', cost: '$168,000/year', users: 70 },
  // Hardcoded
];
```

**After:**
```javascript
const { expansion } = aiToolsData;
```

**Changes:**
- Use `expansion.currentCosts`, `expansion.fullRolloutCosts`
- Use `expansion.paybackPeriod` for ROI modeling
- Use `expansion.recommendations` for seat expansion suggestions

**Estimated Effort:** 4-5 days (25-30 hours)

---

### Phase 3: Testing & Validation (Week 2-3)

#### 3.1 Data Accuracy Testing
- [ ] Compare old hardcoded values vs new calculated values
- [ ] Verify all charts render correctly with new data structure
- [ ] Check edge cases (missing data, zero values, etc.)
- [ ] Validate departmental breakdowns match org hierarchy

#### 3.2 Performance Testing
- [ ] Measure page load time (target: <2 seconds)
- [ ] Check ai-tools-data.json file size (target: <200KB)
- [ ] Verify no memory leaks from large data arrays

#### 3.3 UI/UX Testing
- [ ] Verify all tabs render without errors
- [ ] Check responsive design on mobile/tablet
- [ ] Verify charts are interactive (tooltips, legends)
- [ ] Test tab switching performance

**Estimated Effort:** 2-3 days (12-18 hours)

---

### Phase 4: Documentation & Deployment (Week 3)

#### 4.1 Update Documentation
- [ ] Update SESSION_RESUME.md with migration completion status
- [ ] Update ADR-001 with new data schema additions
- [ ] Document new helper functions in parse-copilot-data.js
- [ ] Create migration notes for future reference

#### 4.2 Deployment
- [ ] Regenerate ai-tools-data.json with all new metrics
- [ ] Test locally with `npm run dev`
- [ ] Create PR for review
- [ ] Deploy to Vercel production
- [ ] Verify production dashboard renders correctly

**Estimated Effort:** 1-2 days (6-12 hours)

---

## Data Schema Extensions

### New Top-Level Keys in ai-tools-data.json

```json
{
  "githubCopilot": { /* existing */ },
  "claudeCode": { /* existing */ },
  "m365Copilot": { /* existing */ },
  "claudeEnterprise": { /* existing */ },
  "insights": { /* existing */ },
  "productivityMultiplier": 17.6,
  "engagementMultiplier": 4.9,

  // NEW: Overview tab data
  "overview": {
    "totalActiveUsers": 325,
    "totalLicensedUsers": 338,
    "overallAdoptionRate": 96,
    "userGrowth": 15,
    "conversationGrowth": 42,
    "topDepartments": [
      { "department": "Engineering", "totalEngagement": 8990, "activeUsers": 79, "adoptionRate": 100 }
    ],
    "recentActivity": {
      "last7Days": { "users": 245, "conversations": 1250 },
      "last30Days": { "users": 325, "conversations": 4284 }
    }
  },

  // NEW: Adoption tab data
  "adoption": {
    "licensedUsers": 87,
    "activatedUsers": 87,
    "activeUsers": 87,
    "activationRate": 100,
    "activeRate": 100,
    "dailyActiveUsers": [
      { "date": "2024-12-09", "users": 65 },
      { "date": "2024-12-10", "users": 68 }
    ],
    "seatUtilization": {
      "Premium": { "licensed": 12, "active": 12, "rate": 100 },
      "Standard": { "licensed": 75, "active": 75, "rate": 100 }
    },
    "activationTrend": [
      { "month": "September", "activated": 42, "rate": 48 },
      { "month": "October", "activated": 56, "rate": 64 },
      { "month": "November", "activated": 77, "rate": 89 },
      { "month": "December", "activated": 87, "rate": 100 }
    ]
  },

  // NEW: Productivity tab data
  "productivity": {
    "avgTimeSavingsPerUser": 4.5,
    "totalTimeSaved": 1463,
    "roiExamples": [
      {
        "useCase": "Code Generation",
        "timeSaved": "4 hours/week",
        "tool": "Claude Code",
        "impact": "17.6x productivity gain"
      }
    ],
    "topFeatures": [
      { "feature": "code_completion", "users": 44 },
      { "feature": "agent_edit", "users": 27 }
    ]
  },

  // NEW: Code tab data
  "code": {
    "leaderboard": [
      { "rank": 1, "username": "dmccom", "lines": 12700, "department": "Engineering" }
    ],
    "weeklyActiveUsers": [
      { "week": "Dec 1-7", "users": 11 }
    ],
    "userGrowthTrend": [
      { "month": "September", "newUsers": 9, "totalUsers": 9 },
      { "month": "October", "newUsers": 1, "totalUsers": 10 },
      { "month": "November", "newUsers": 2, "totalUsers": 12 },
      { "month": "December", "newUsers": 0, "totalUsers": 12 }
    ]
  },

  // NEW: Enablement tab data
  "enablement": {
    "trainingCompletion": 0,
    "supportTickets": 0,
    "adoptionByCohort": [
      { "cohort": "Q3 2024", "users": 42, "adoptionRate": 95 }
    ],
    "expansionPriorities": [
      { "department": "Sales - Enterprise", "currentAdoption": 45, "targetAdoption": 80, "priority": "high" }
    ]
  },

  // NEW: Expansion tab data
  "expansion": {
    "currentCosts": {
      "claudeEnterprise": 30360,
      "claudeCode": 26400,
      "m365Copilot": 90360,
      "total": 147120
    },
    "fullRolloutCosts": {
      "claudeEnterprise": 91200,
      "claudeCode": 168000,
      "m365Copilot": 90360,
      "total": 349560
    },
    "paybackPeriod": 6,
    "recommendations": [
      {
        "department": "Engineering",
        "action": "Expand Claude Code to all 70 engineers",
        "cost": 168000,
        "roi": "17.6x productivity gain"
      }
    ]
  }
}
```

---

## Reusable Data & Structures

### Already Available (Can Reuse Directly)

1. **Organization Hierarchy** (`orgEmailMap` from parse-hierarchy.js)
   - Use for: Departments tab, Enablement priorities, Expansion recommendations
   - Provides: 251 employees, 15 departments, email → department mapping

2. **Email Alias Resolution** (`EMAIL_ALIAS_MAP` from parse-hierarchy.js)
   - Use for: All user-level metrics across all tabs
   - Handles: Name changes, typos, first-name aliases

3. **Employee Filtering** (`isCurrentEmployee()` from parse-hierarchy.js)
   - Use for: All active user counts across all tabs
   - Filters: 33 non-current employees from raw data

4. **Department Breakdowns** (M365 & Claude Enterprise)
   - Use for: Departments tab, Overview top departments, Enablement priorities
   - Provides: Per-department users, engagement, adoption rates

5. **Monthly Trends** (All 4 tools)
   - Use for: Overview growth metrics, Adoption trends, Productivity trends
   - Provides: Sept-Dec 2024 monthly data with user counts and engagement

6. **Cross-Tool Comparisons** (Productivity & Engagement multipliers)
   - Use for: Overview summary, Productivity tab, Expansion ROI modeling
   - Provides: 17.6x (Claude Code), 4.9x (Claude Enterprise) multipliers

7. **AI Insights** (9 pre-generated insights)
   - Use for: All tabs can add AI insight cards
   - Provides: Strategic positioning, trends, recommendations

---

## Benefits of Migration

### 1. Single Source of Truth
- All tabs read from same `ai-tools-data.json`
- Consistent metrics across dashboard
- No conflicting numbers between tabs

### 2. Automated Updates
- Run `node scripts/parse-copilot-data.js` once/month
- All tabs update automatically
- No manual editing of page.jsx

### 3. Historical Tracking
- Commit ai-tools-data.json to git
- Track metric changes over time
- Rollback to previous snapshots if needed

### 4. Leverage Existing Infrastructure
- Use existing email alias resolution
- Use existing employee filtering
- Use existing department mappings
- Use existing AI insight generation

### 5. Maintainability
- Code changes in one place (parse-copilot-data.js)
- UI logic separate from data logic
- Easier to add new metrics

### 6. Scalability
- Easy to add new tools (GitHub Copilot Enterprise, ChatGPT)
- Easy to add new tabs
- Easy to extend data schema

---

## Risks & Mitigation

### Risk 1: Breaking Existing Tabs
**Impact:** High
**Likelihood:** Medium
**Mitigation:**
- Thorough testing of Coding Tools & Productivity Tools tabs after changes
- Create backup branch before migration
- Test each tab migration incrementally

### Risk 2: Missing Data Sources
**Impact:** Medium
**Likelihood:** High
**Mitigation:**
- Use placeholder values for unavailable data (training, support tickets)
- Document what data is not yet tracked
- Plan for future data source integrations

### Risk 3: Performance Degradation
**Impact:** Low
**Likelihood:** Low
**Mitigation:**
- Monitor ai-tools-data.json file size (target <200KB)
- Use lazy loading for large datasets
- Implement data pagination if needed

### Risk 4: Data Accuracy Issues
**Impact:** High
**Likelihood:** Medium
**Mitigation:**
- Cross-reference with existing hardcoded values
- Add data validation checks in parser
- Manual spot-checking after each regeneration

---

## Success Criteria

### Functional
- [ ] All 7 static tabs migrated to ai-tools-data.json
- [ ] No hardcoded data arrays in page.jsx (except constants like LICENSE_CONFIG)
- [ ] All charts render correctly with new data
- [ ] No console errors or warnings

### Technical
- [ ] ai-tools-data.json file size < 200KB
- [ ] Page load time < 2 seconds
- [ ] Parser execution time < 5 minutes
- [ ] Test coverage > 80%

### Business
- [ ] Metrics match previous hardcoded values (±5%)
- [ ] Dashboard updates automatically when data regenerated
- [ ] Stakeholders approve new data-driven tabs
- [ ] Documentation complete (ADR-001, SESSION_RESUME)

---

## Timeline

**Total Estimated Effort:** 2-3 weeks (55-85 hours)

### Week 1: Parser Extensions
- Days 1-2: Overview & Adoption tab data
- Days 3-4: Productivity & Code tab data
- Day 5: Enablement & Expansion tab data

### Week 2: UI Migration
- Days 1-2: Overview & Adoption tabs
- Days 3-4: Productivity, Departments, Code tabs
- Day 5: Enablement & Expansion tabs

### Week 3: Testing & Deployment
- Days 1-2: Testing & bug fixes
- Day 3: Documentation updates
- Days 4-5: PR review & deployment

---

## Next Steps

### Immediate (This Session)
1. ✅ Create this plan document
2. ✅ Add to SESSION_RESUME.md for future reference

### Next Session (Future)
1. Pull latest from main branch
2. Review this plan with stakeholders
3. Decide priority order for tab migration
4. Start with Phase 1: Parser Extensions (Overview tab first)

---

## References

- **ADR-001:** `/docs/ADR-001-ai-tools-dashboard-architecture.md` - Current architecture
- **Plan 01:** `/docs/plan/01 - vercel-app-implementation-plan.md` - Original database plan
- **SESSION_RESUME:** `/docs/SESSION_RESUME.md` - Current state and session history
- **Parser:** `/scripts/parse-copilot-data.js` - Main data parsing script
- **Dashboard:** `/app/page.jsx` - Current UI implementation

---

**Document Version:** 1.0
**Last Updated:** December 16, 2024
**Author:** Luis Amadeo + Claude Code
**Status:** Ready for Implementation
