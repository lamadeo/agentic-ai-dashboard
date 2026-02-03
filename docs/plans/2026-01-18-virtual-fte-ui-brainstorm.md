# Agentic FTE UI Implementation - Brainstorm

**Date**: January 18, 2026
**Context**: Phase 2 - UI implementation for Agentic FTE metric
**Backend**: PR #40 merged ✅
**Design Doc**: `/docs/plans/2026-01-18-virtual-fte-metric-design.md`

---

## User's Proposed Approach

### 1. Overview Tab
- **Graph**: Monthly total Agentic FTEs (all tools combined)
- **Purpose**: Show executive-level trend of virtual workforce growth

### 2. Deep Dive Tabs (Claude Enterprise, Claude Code, M365, GitHub)
- **Graph**: Monthly Agentic FTEs for that specific tool
- **Purpose**: Show tool-specific virtual workforce contribution over time

### 3. Compare Tools Tab
- **Graph**: All tools' Agentic FTEs on same chart (multi-line comparison)
- **Purpose**: Compare which tools contribute most Agentic FTEs and trends

---

## 💭 Brainstorm: Additional Visualizations & Enhancements

### A. KPI Cards (Quick Metrics)

**Overview Tab - Hero Section**:
```
╔═══════════════════════════════════════╗
║   Agentic FTEs Added This Month       ║
║              42.5 FTEs                ║
║         ↑ +5.3 (14% MoM growth)      ║
║                                       ║
║   = 42 additional team members        ║
║   2,463 productive hours saved        ║
╚═══════════════════════════════════════╝
```

**Benefits**:
- Immediate visibility of current month's impact
- MoM trend indicator (↑ growing, ↓ declining)
- Context with hours saved
- Simple, executive-friendly

**Deep Dive Tabs**:
```
╔═══════════════════════════════════════╗
║   Claude Code Agentic FTEs            ║
║              18.3 FTEs                ║
║         ↑ +2.1 (13% MoM growth)      ║
║                                       ║
║   284,350 lines of code generated     ║
║   22,748 hours saved this month       ║
╚═══════════════════════════════════════╝
```

---

### B. Chart Type Options

#### Option 1: **Line Chart** (User's suggestion ✅)
- **Best for**: Showing trends over time
- **Use case**: Monthly Agentic FTE trends
- **Pros**: Clear trend visibility, easy to compare multiple lines
- **Cons**: Can be cluttered with too many lines

**Recommended for**:
- Overview: Single line (total Agentic FTEs)
- Deep Dive: Single line (tool-specific Agentic FTEs)
- Compare Tools: Multi-line (all tools on one chart)

#### Option 2: **Stacked Area Chart**
- **Best for**: Showing composition and total
- **Use case**: How each tool contributes to total Agentic FTEs
- **Pros**: Shows both individual contribution AND total
- **Cons**: Hard to compare individual tools

**Example**:
```
Agentic FTEs Over Time (Stacked)
   ┌────────────────────────────────
60 │                     ╱╲    GitHub Copilot
   │                   ╱    ╲  Claude Code
40 │               ╱╲╱        Claude Enterprise
   │         ╱╲╱╱              M365 Copilot
20 │   ╱╲╱╱
   │╱╱
 0 └────────────────────────────────
   Nov  Dec  Jan  Feb  Mar  Apr  May
```

**Recommended for**:
- Overview: Show total + breakdown in one view
- Alternative to multi-line comparison

#### Option 3: **Bar Chart** (Monthly Comparison)
- **Best for**: Comparing discrete monthly values
- **Use case**: Month-over-month comparison
- **Pros**: Easy to see discrete values, good for comparisons
- **Cons**: Less clear on continuous trends

**Recommended for**:
- Compare Tools: Side-by-side bars per month
- Deep Dive: Monthly breakdown with segments

#### Option 4: **Combo Chart** (Line + Bar)
- **Best for**: Showing two related metrics
- **Use case**: Agentic FTEs (line) + Lines of Code (bars)
- **Pros**: Shows correlation between metrics
- **Cons**: More complex to interpret

---

### C. Recommended Chart Strategy

**Overview Tab** (Executive View):
1. **Hero KPI Card**: Current month Agentic FTEs with MoM change
2. **Line Chart**: Total Agentic FTEs trend (last 6-12 months)
3. **Stacked Area Chart** (optional): Show tool contributions over time
4. **Breakdown Table**: Per-tool breakdown with hours, FTEs, percentage

**Deep Dive Tabs** (Tool-Specific):
1. **KPI Card**: Tool's Agentic FTEs this month with MoM change
2. **Line Chart**: Tool's Agentic FTEs trend over time
3. **Efficiency Metric**: Agentic FTEs per licensed user
4. **Source Breakdown**: Productivity hours vs Coding hours (for coding tools)

**Compare Tools Tab** (Side-by-Side):
1. **Multi-Line Chart**: All tools' Agentic FTEs on same chart
2. **Stacked Bar Chart**: Monthly comparison showing tool contributions
3. **Efficiency Table**: Agentic FTEs per licensed user per tool
4. **Cost Efficiency**: Cost per Agentic FTE per tool

---

### D. Advanced Metrics (Future Enhancements)

#### 1. **Efficiency Metrics**
```
Agentic FTEs per Licensed User
- Claude Code: 18.3 FTEs / 12 users = 1.53 FTEs/user
- GitHub Copilot: 5.2 FTEs / 46 users = 0.11 FTEs/user
- Claude Enterprise: 12.1 FTEs / 87 users = 0.14 FTEs/user
- M365 Copilot: 6.9 FTEs / 251 users = 0.03 FTEs/user
```
**Insight**: Claude Code users are 14x more efficient than M365 Copilot users

#### 2. **Cost Metrics**
```
Cost per Agentic FTE
- Claude Code: $2,400/user ÷ 1.53 FTEs/user = $1,569/FTE/month
- GitHub Copilot: $19/user ÷ 0.11 FTEs/user = $173/FTE/month
- M365 Copilot: $30/user ÷ 0.03 FTEs/user = $1,000/FTE/month
- Actual Hire: ~$10,000/FTE/month (fully loaded cost)
```
**Insight**: All AI tools are 6-50x cheaper than actual hires per FTE

#### 3. **Cumulative Agentic FTEs**
```
Year-to-Date Virtual Workforce
- Q1 2026: 127.5 FTEs added (cumulative)
- Average: 42.5 FTEs/month
- Projection: 510 FTEs for full year 2026
```

#### 4. **Agentic FTE vs Actual Headcount**
```
Workforce Growth Comparison
- Actual headcount: 251 → 263 (+12 people, +4.8%)
- Agentic FTEs: 0 → 127.5 (+127.5 "people", +∞%)
- Combined workforce: 251 → 390.5 (+55.6% capacity)
```
**Insight**: AI tools added 10x more capacity than actual hiring

#### 5. **Source Attribution** (Coding Tools)
```
Claude Code Agentic FTEs Breakdown
- Coding hours: 16.8 FTEs (92%)
- Productivity hours: 1.5 FTEs (8%)
Total: 18.3 FTEs

GitHub Copilot Agentic FTEs Breakdown
- Coding hours: 4.9 FTEs (94%)
- Productivity hours: 0.3 FTEs (6%)
Total: 5.2 FTEs
```

---

### E. User Experience Considerations

#### 1. **Data Availability**
**Current State**: We only have cumulative data, no monthly breakdown yet
- Currently: 442.4 total FTEs (cumulative)
- Need: Monthly FTE values for trend charts

**Solution**:
- **Short-term**: Show single data point until we get monthly data
- **Message**: "Monthly trend data will populate after next data refresh"
- **Alternative**: Show cumulative growth chart (0 → 442.4 over time)

#### 2. **Color Scheme**
**Consistency across charts**:
- **Total/Combined**: Emerald/Green (#10b981) - growth, positive
- **Claude Code**: Orange (#f97316) - matches existing branding
- **Claude Enterprise**: Blue (#3b82f6) - matches existing branding
- **M365 Copilot**: Purple (#a855f7) - matches existing branding
- **GitHub Copilot**: Green (#22c55e) - GitHub brand color

#### 3. **Interactivity**
- **Tooltips**: Show exact values on hover
- **Legend**: Toggle tool visibility on/off
- **Time Range**: Switch between 3mo / 6mo / 12mo / YTD / All Time
- **Drill-down**: Click chart to see detailed breakdown

#### 4. **Responsiveness**
- **Desktop**: Full charts with all details
- **Tablet**: Condensed charts, scrollable tables
- **Mobile**: KPI cards only, charts on separate view

---

### F. Recommended Chart Library

**Current dashboard uses**: Recharts (from `recharts` package)

**Pros**:
- Already integrated in the codebase
- React-friendly, declarative API
- Supports all chart types we need
- Good documentation and examples

**Chart Components Available**:
- `LineChart` - for trend lines ✅
- `AreaChart` - for stacked areas ✅
- `BarChart` - for comparisons ✅
- `ComposedChart` - for combo charts ✅
- `Tooltip`, `Legend`, `ResponsiveContainer` - all available ✅

**Keep using Recharts** - no need to introduce new dependencies.

---

## 📋 Recommended Implementation Plan

### Phase 2A: Core Visualizations (This PR)

**Priority 1: Overview Tab**
- [ ] Add Agentic FTE KPI card (hero section)
- [ ] Add line chart: Total Agentic FTEs trend
- [ ] Add breakdown table: Per-tool contributions

**Priority 2: Deep Dive Tabs**
- [ ] Claude Code: Add Agentic FTE KPI + trend chart
- [ ] Claude Enterprise: Add Agentic FTE KPI + trend chart
- [ ] M365 Copilot: Add Agentic FTE KPI + trend chart
- [ ] GitHub Copilot: (optional, may be in Compare Tools tab)

**Priority 3: Compare Tools Tab**
- [ ] Add multi-line chart: All tools Agentic FTEs comparison
- [ ] Add efficiency table: FTEs per licensed user

### Phase 2B: Advanced Metrics (Future PR)

**Nice-to-have enhancements**:
- [ ] Stacked area chart (tool contributions)
- [ ] Cost per Agentic FTE metric
- [ ] Cumulative Agentic FTEs (YTD)
- [ ] Agentic FTE vs actual headcount comparison
- [ ] Source attribution breakdown (coding vs productivity)
- [ ] Efficiency metrics per tool
- [ ] Time range selector (3mo / 6mo / 12mo)

---

## ✅ Final Recommendation

**User's proposed approach is excellent! ✅**

**Core Implementation (Phase 2A)**:
1. **Overview Tab**:
   - KPI card: Current month Agentic FTEs with MoM change
   - Line chart: Total Agentic FTEs trend over time
   - Table: Per-tool breakdown

2. **Deep Dive Tabs** (Claude Enterprise, Claude Code, M365):
   - KPI card: Tool-specific Agentic FTEs with MoM change
   - Line chart: Tool's Agentic FTEs trend over time

3. **Compare Tools Tab**:
   - Multi-line chart: All tools' Agentic FTEs on same chart
   - Efficiency table: Agentic FTEs per licensed user

**Enhancement Ideas for Later**:
- Stacked area chart showing tool contributions
- Cost per Agentic FTE metrics
- Cumulative YTD Agentic FTEs
- Agentic FTE vs actual headcount growth comparison

---

## 🚀 Ready to Proceed?

**Questions for User**:
1. ✅ Do you approve the core implementation plan (Overview + Deep Dive + Compare)?
2. 📊 Line charts for trends - good choice?
3. 🎨 Should we add stacked area chart now, or save for later?
4. 💰 Should we include cost metrics (cost per Agentic FTE) in this PR?
5. 📅 Should we add time range selector (3mo/6mo/12mo) or just show all available data?

**Once approved, I'll start implementing!**
