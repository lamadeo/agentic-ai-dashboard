# Overview Landing Page Design

**Created**: December 26, 2024
**Purpose**: Design specification for the main landing page (home view) of the AI Tools Dashboard
**Status**: Design phase - ready for review and implementation

---

## Executive Summary

The **Overview landing page** is the first view users see when entering the dashboard. It provides a comprehensive, executive-level snapshot of the entire AI tools portfolio at TechCo Inc, synthesizing data from:
- Claude Enterprise (87 users)
- Claude Code (12 users)
- M365 Copilot (238 users)
- GitHub Copilot (46 users)

**Design Philosophy**: "Glanceable Intelligence" - executives should understand the complete AI portfolio health in under 30 seconds.

---

## Current Navigation Structure

The Overview page will be accessible via:

1. **Default route** `/` (landing page on app load)
2. **Overview dropdown** → **Home** (new menu item)
3. **Clicking dashboard title** in header (breadcrumb "Home")

```
Navigation Structure:
┌────────────────────────────────────────────────────────────┐
│ 📊 Overview ▼                                              │
│    ├─ Home (NEW - this page)                              │
│    └─ Briefings ▸                                         │
│         ├─ Leadership Summary                             │
│         └─ Organization-wide Summary                      │
└────────────────────────────────────────────────────────────┘
```

---

## Page Layout

### 1. Hero Section - Portfolio KPIs (4 metric cards)

```
┌─────────────────────────────────────────────────────────────────────┐
│  AI Tools Portfolio - Company Overview                              │
├─────────────────────────────────────────────────────────────────────┤
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌─────────┐│
│  │ 👥 Total      │ │ 💬 Total      │ │ 📊 Portfolio  │ │ 💰 ROI  ││
│  │ Active Users  │ │ Activity      │ │ Adoption      │ │ Multiple││
│  │               │ │               │ │               │ │         ││
│  │     383       │ │    89,479     │ │      88%      │ │   3.2x  ││
│  │    (+18%)     │ │   (+23%)      │ │     (+5%)     │ │  (+12%) ││
│  └───────────────┘ └───────────────┘ └───────────────┘ └─────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

**Data Sources**:
- **Total Active Users**: Sum of unique users across all tools
  - Claude Enterprise: 87 active users
  - M365 Copilot: 238 active users
  - Claude Code: 12 active users
  - GitHub Copilot: 46 active users
  - **Total**: 383 (dedupe where users overlap)

- **Total Activity**: Combined activity across tools
  - Claude: Conversations + projects + artifacts
  - M365: Actions/engagements
  - GitHub Copilot: Lines of code generated
  - Claude Code: Lines of code generated

- **Portfolio Adoption**: Weighted average adoption rate
  - Formula: `(sum of tool adoptions × tool weights) / total employees`
  - Claude Enterprise: 86% (weight: 0.3)
  - M365 Copilot: 95% (weight: 0.5)
  - Claude Code: 26% (of engineers) (weight: 0.1)
  - GitHub Copilot: 55% (of engineers) (weight: 0.1)

- **ROI Multiple**: From `aiToolsData.currentStateROI.roi`
  - Shows current investment return (e.g., 3.2x)
  - Calculate month-over-month change

**Visual Design**:
- Blue card: Total Users (blue = people)
- Green card: Total Activity (green = growth/success)
- Purple card: Portfolio Adoption (purple = analytics)
- Orange card: ROI Multiple (orange = money/value)

---

### 2. Tool Portfolio Breakdown (Horizontal bar chart)

```
┌─────────────────────────────────────────────────────────────────────┐
│  AI Tools Portfolio Distribution                                    │
├─────────────────────────────────────────────────────────────────────┤
│  M365 Copilot         ████████████████████████████████  238 users   │
│  Claude Enterprise    ███████████████████                87 users   │
│  GitHub Copilot       ████████████                       46 users   │
│  Claude Code          ███                                12 users   │
│                                                                      │
│  Total: 383 users across 4 tools                                    │
└─────────────────────────────────────────────────────────────────────┘
```

**Purpose**: Show relative adoption of each tool at a glance

**Data Source**: `aiToolsData.<tool>.activeUsers`

**Visual Design**:
- Horizontal bars, colored by tool
- Tool names on left
- User counts on right
- Hover shows: Adoption %, cost per user, primary use case

---

### 3. Adoption Trends Over Time (Multi-line chart)

```
┌─────────────────────────────────────────────────────────────────────┐
│  Adoption Trends - Last 6 Months                                    │
├─────────────────────────────────────────────────────────────────────┤
│  250 │                                                               │
│      │                                                               │
│  200 │                           M365 Copilot ─────────────         │
│      │                      ──────                                   │
│  150 │               ──────                                          │
│      │          ────                                                 │
│  100 │     ────            Claude Enterprise ───────────            │
│      │ ───                                   ────────                │
│   50 │                   GitHub Copilot ────────────                │
│      │                                Claude Code ──────             │
│    0 │                                                               │
│      └─────────────────────────────────────────────────────────────│
│        Sep    Oct    Nov    Dec    Jan    Feb                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Data Sources**:
- `aiToolsData.claudeEnterprise.monthlyTrend[]`
- `aiToolsData.m365Copilot.monthlyTrend[]`
- `aiToolsData.claudeCode.monthlyTrend[]`
- `aiToolsData.githubCopilot.monthlyTrend[]` (derive from topUsers data)

**Visual Design**:
- 4 colored lines (one per tool)
- X-axis: Last 6 months
- Y-axis: Active user count
- Legend with tool colors
- Hover tooltip shows exact values

---

### 4. Department Adoption Heatmap (Grid visualization)

```
┌─────────────────────────────────────────────────────────────────────┐
│  Adoption by Department                                             │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┬──────────┬──────────┬──────────┬──────────┐      │
│  │ Department  │ Claude   │ M365     │ GitHub   │ Claude   │      │
│  │             │ Ent.     │ Copilot  │ Copilot  │ Code     │      │
│  ├─────────────┼──────────┼──────────┼──────────┼──────────┤      │
│  │ Engineering │ 🟢 92%   │ 🟢 95%   │ 🟡 55%   │ 🟡 26%   │      │
│  │ Product     │ 🟢 88%   │ 🟢 98%   │ ⚫ N/A   │ ⚫ N/A   │      │
│  │ Sales       │ 🟡 73%   │ 🟢 93%   │ ⚫ N/A   │ ⚫ N/A   │      │
│  │ Marketing   │ 🟡 79%   │ 🟢 94%   │ ⚫ N/A   │ ⚫ N/A   │      │
│  │ Cust Success│ 🟢 85%   │ 🟢 96%   │ ⚫ N/A   │ ⚫ N/A   │      │
│  │ Prof Services│ 🟡 76%   │ 🟢 92%   │ ⚫ N/A   │ ⚫ N/A   │      │
│  │ Operations  │ 🟡 68%   │ 🟢 97%   │ ⚫ N/A   │ ⚫ N/A   │      │
│  │ Executive   │ 🟢 100%  │ 🟢 100%  │ ⚫ N/A   │ ⚫ N/A   │      │
│  └─────────────┴──────────┴──────────┴──────────┴──────────┘      │
└─────────────────────────────────────────────────────────────────────┘

Legend: 🟢 ≥85%  🟡 60-84%  🔴 <60%  ⚫ N/A
```

**Data Sources**:
- `aiToolsData.claudeEnterprise.departmentInsights[]`
- `aiToolsData.m365Copilot.departmentBreakdown[]`
- `aiToolsData.githubCopilot` (engineering only)
- `aiToolsData.claudeCode` (engineering only)

**Visual Design**:
- Table with color-coded cells
- Green (≥85%): High adoption
- Yellow (60-84%): Medium adoption
- Red (<60%): Low adoption (opportunity!)
- Black/Gray: Not applicable (e.g., GitHub for non-engineers)

**Interaction**:
- Click any cell → Navigate to that tool's department breakdown
- Hover shows: Employee count, active users, engagement score

---

### 5. AI-Powered Insights (3-card carousel)

```
┌─────────────────────────────────────────────────────────────────────┐
│  💡 AI-Generated Portfolio Insights                                 │
├─────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐     │
│  │ 📈 Adoption Momentum                                      │     │
│  │                                                            │     │
│  │ M365 Copilot leads with 95% adoption and strong           │     │
│  │ engagement across all departments. Claude Enterprise      │     │
│  │ shows highest per-user engagement with 49.2 conversations │     │
│  │ per user. Consider expanding Claude to high-value depts.  │     │
│  │                                                            │     │
│  │ Impact: High  •  Confidence: 94%           [View More ▸] │     │
│  └───────────────────────────────────────────────────────────┘     │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────┐     │
│  │ 💰 ROI Opportunity                                        │     │
│  │                                                            │     │
│  │ 7 high-engagement users on Claude Standard qualify for    │     │
│  │ Premium upgrade. Projected value: $6,720/mo, investment:  │     │
│  │ $1,120/mo, ROI: 6.0x. Payback period: 2 months.          │     │
│  │                                                            │     │
│  │ Impact: High  •  Confidence: 97%           [View More ▸] │     │
│  └───────────────────────────────────────────────────────────┘     │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────┐     │
│  │ 🎯 Expansion Target                                       │     │
│  │                                                            │     │
│  │ Sales department shows 73% Claude adoption but low        │     │
│  │ engagement scores (2.3 vs 3.8 company avg). Recommend    │     │
│  │ targeted enablement: Sales-specific use cases, templates. │     │
│  │                                                            │     │
│  │ Impact: Med  •  Confidence: 89%            [View More ▸] │     │
│  └───────────────────────────────────────────────────────────┘     │
│                                                                      │
│  [◄]  1 of 3  [►]                                                  │
└─────────────────────────────────────────────────────────────────────┘
```

**Data Source**: `aiToolsData.insights[]` (AI-generated insights)

**Insight Selection Logic**:
- Filter insights by `category` or relevance
- Prioritize "high impact" insights
- Show top 3 insights in carousel
- Link to full insight details

**Visual Design**:
- Card layout with icon, title, description
- Impact level badge (High/Med/Low)
- Confidence score (AI certainty)
- "View More" link navigates to detailed view
- Carousel navigation (previous/next)

---

### 6. Quick Actions Bar (Sticky bottom or sidebar)

```
┌─────────────────────────────────────────────────────────────────────┐
│  Quick Actions                                                       │
├─────────────────────────────────────────────────────────────────────┤
│  [📊 View Detailed Briefing] [💰 Explore Expansion ROI]             │
│  [⚖️ Compare Tools]           [📈 View Department Insights]          │
└─────────────────────────────────────────────────────────────────────┘
```

**Purpose**: Fast navigation to common next steps from overview

**Actions**:
1. **View Detailed Briefing** → Overview → Briefings → Leadership Summary
2. **Explore Expansion ROI** → ROI & Planning → Expansion ROI
3. **Compare Tools** → Compare Tools → Coding/Productivity
4. **View Department Insights** → Tool Deep Dive → Claude Enterprise → Departments

---

## Data Requirements

### Metrics to Calculate (Derived from existing data)

1. **Total Active Users** (deduplicated)
   ```javascript
   // Pseudo-code
   const totalUsers = new Set([
     ...claudeEnterprise.users,
     ...m365Copilot.users,
     ...claudeCode.users,
     ...githubCopilot.users
   ]).size;
   ```

2. **Total Activity Score**
   ```javascript
   const totalActivity =
     claudeEnterprise.totalConversations +
     claudeEnterprise.totalProjects +
     claudeEnterprise.totalArtifacts +
     m365Copilot.totalActions + // (or engagement score)
     claudeCode.totalLines +
     githubCopilot.totalLines;
   ```

3. **Portfolio Adoption Rate** (weighted)
   ```javascript
   const weights = {
     claudeEnterprise: 0.3,
     m365Copilot: 0.5,
     claudeCode: 0.1,
     githubCopilot: 0.1
   };

   const portfolioAdoption = (
     (claudeEnterprise.adoptionRate * weights.claudeEnterprise) +
     (m365Copilot.adoptionRate * weights.m365Copilot) +
     (claudeCode.adoptionRate * weights.claudeCode) +
     (githubCopilot.adoptionRate * weights.githubCopilot)
   );
   ```

4. **ROI Multiple** (from existing data)
   ```javascript
   const roi = aiToolsData.currentStateROI.roi;
   ```

### Data Already Available

✅ All tool-specific metrics in `ai-tools-data.json`:
- `claudeEnterprise.*`
- `m365Copilot.*`
- `claudeCode.*`
- `githubCopilot.*`
- `currentStateROI.*`
- `insights[]`
- `orgMetrics.*`

---

## Mobile Responsive Design

### Desktop (>1024px)
- 4-column metric cards
- Full-width charts
- Side-by-side department table
- 3 insight cards visible

### Tablet (768px - 1024px)
- 2-column metric cards (2 rows)
- Full-width charts
- Scrollable department table
- 2 insight cards visible

### Mobile (<768px)
- 1-column metric cards (stacked)
- Full-width charts (scrollable if needed)
- Stacked department rows
- 1 insight card visible (swipe carousel)

---

## Interaction Patterns

### Metric Card Interactions
- **Hover**: Show tooltip with detailed breakdown
  - Example: "87 active users: 13 Premium, 74 Standard"
- **Click**: Navigate to relevant deep dive
  - "Total Active Users" → Tool Deep Dive → Claude Enterprise

### Chart Interactions
- **Hover on line**: Show tooltip with exact value
- **Click on line**: Filter view to that tool
- **Legend click**: Toggle tool visibility

### Department Heatmap Interactions
- **Hover on cell**: Show tooltip
  - "Engineering - Claude Enterprise"
  - "83 employees, 77 active users, 92% adoption"
- **Click on cell**: Navigate to department deep dive
  - Tool Deep Dive → Claude Enterprise → Department: Engineering

### Insight Card Interactions
- **Click "View More"**: Expand insight in modal or navigate to detail page
- **Carousel navigation**: Swipe or click prev/next buttons
- **Dismiss**: Hide insight (with undo option)

---

## Implementation Notes

### Phase 1: Core Layout & Metrics (Week 1)
- [ ] Add "Home" option to Overview dropdown (nav structure update)
- [ ] Create new tab condition: `activeTab === 'overview-home'`
- [ ] Implement 4 hero metric cards with data
- [ ] Add tool portfolio breakdown (horizontal bars)
- [ ] Test responsive layout (desktop/tablet/mobile)

### Phase 2: Charts & Visualization (Week 1-2)
- [ ] Implement adoption trends multi-line chart
- [ ] Add department adoption heatmap table
- [ ] Add hover tooltips for all charts
- [ ] Implement click-through navigation

### Phase 3: Insights & Actions (Week 2)
- [ ] Integrate AI-powered insights carousel
- [ ] Add quick actions bar
- [ ] Implement insight filtering/prioritization
- [ ] Add "View More" insight detail modal

### Phase 4: Polish & Optimization (Week 2)
- [ ] Add loading skeletons for async data
- [ ] Error handling (missing data, API failures)
- [ ] Accessibility audit (keyboard nav, screen readers)
- [ ] Performance optimization (lazy loading charts)

---

## Success Metrics

**Quantitative**:
- Time to first insight: <10 seconds
- Click-through rate to detailed views: >40%
- Mobile usage: Expect 20-30% of traffic

**Qualitative**:
- Executive feedback: "I understand our AI portfolio health immediately"
- User testing: 90%+ find overview page useful
- Navigation: Users know where to go next from overview

---

## Alternative Layout Options

### Option A: Single Column (Recommended)
- Hero metrics → Portfolio → Trends → Departments → Insights → Actions
- **Pros**: Simple, clear flow, mobile-friendly
- **Cons**: Requires scrolling for full picture

### Option B: Two-Column
- Left: Hero metrics, Portfolio, Trends
- Right: Insights, Departments, Actions
- **Pros**: More compact, less scrolling
- **Cons**: Cluttered on tablet, complex responsive logic

### Option C: Dashboard Grid
- 2x2 grid of sections (metrics, portfolio, trends, insights)
- **Pros**: Very dense, fits more on screen
- **Cons**: Overwhelming, hard to prioritize

**Recommendation**: **Option A** for clarity and mobile-first design.

---

## Future Enhancements (Post-MVP)

1. **Customizable View**: Let users drag/drop sections, hide irrelevant cards
2. **Date Range Picker**: Filter all charts by custom date range
3. **Department Filter**: View overview scoped to specific department
4. **Export Overview**: PDF report generation
5. **Real-time Updates**: WebSocket connection for live data (Phase 3)
6. **Comparison Mode**: Side-by-side view of two time periods
7. **Alerts**: Show banner if critical metrics drop (e.g., adoption < 70%)

---

## Design Mockup References

This design draws from:
- **DASHBOARD_UX_RECOMMENDATIONS.md**: Tab 1: Overview (lines 167-201)
- **NAVIGATION_UX_MOCKUPS.md**: Full Dashboard Layout (lines 157-219)
- **Existing data structure**: `ai-tools-data.json`

---

## Next Steps

1. **Review this design** with stakeholders (Luis, product team)
2. **Clarify questions**:
   - Should "Home" be a separate dropdown item or replace "Overview" as direct link?
   - Do we want carousel or single insight display?
   - Should department heatmap show all 8 departments or top 5?
3. **Create implementation plan** (break down into tasks)
4. **Update SESSION_RESUME.md** with next steps
5. **Begin Phase 1 implementation** (core layout & metrics)

---

**Status**: ✅ Design complete, ready for review and implementation planning
