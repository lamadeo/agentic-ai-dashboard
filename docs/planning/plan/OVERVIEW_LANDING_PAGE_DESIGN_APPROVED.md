# Overview Landing Page Design - APPROVED FOR IMPLEMENTATION

**Created**: December 26, 2024
**Status**: ✅ APPROVED - Ready for MVP implementation
**Design Principle**: 100% data-driven from parsed JSON schemas (NO HARDCODING)

---

## Approved Decisions

1. ✅ **Navigation**: Overview becomes a direct link to this Home page (not a dropdown)
2. ✅ **Insights Display**: Single stacked panel showing all insights (not carousel)
3. ✅ **Department Heatmap**: Show all 8 departments
4. ✅ **Data Requirement**: ALL metrics must come from `ai-tools-data.json` (NO HARDCODING)

---

## MVP Page Structure (Data-Driven Only)

### Section 1: Hero KPIs - 4 Metric Cards

```
┌─────────────────────────────────────────────────────────────────────┐
│  AI Tools Portfolio Overview                                        │
├─────────────────────────────────────────────────────────────────────┤
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌─────────┐│
│  │ 👥 Licensed   │ │ 💬 Total      │ │ 📊 Portfolio  │ │ 💰 ROI  ││
│  │ Users         │ │ Activity      │ │ Adoption      │ │ Multiple││
│  │               │ │               │ │               │ │         ││
│  │     84        │ │    4,284      │ │      34%      │ │  55.5x  ││
│  │ (250 total)   │ │conversations  │ │  (84/250)     │ │         ││
│  └───────────────┘ └───────────────┘ └───────────────┘ └─────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

**Data Sources** (from `ai-tools-data.json`):
1. **Licensed Users**: `orgMetrics.totalLicensedUsers` (84)
   - Subtext: `orgMetrics.totalEmployees` (250)
2. **Total Activity**: `claudeEnterprise.totalConversations` (4,284)
   - Alternative: Could also show `claudeEnterprise.totalProjects + totalArtifacts`
3. **Portfolio Adoption**: `orgMetrics.penetrationRate` (34%)
   - Formula already calculated: `(licensedUsers / totalEmployees) * 100`
4. **ROI Multiple**: `currentStateROI.roi` (55.5x)
   - Already calculated in parser

**Color Coding**:
- Blue: Licensed Users (people)
- Green: Total Activity (engagement/success)
- Purple: Portfolio Adoption (analytics)
- Orange: ROI Multiple (value/money)

---

### Section 2: Tool Portfolio Breakdown - Horizontal Bar Chart

```
┌─────────────────────────────────────────────────────────────────────┐
│  Active Users by AI Tool                                            │
├─────────────────────────────────────────────────────────────────────┤
│  M365 Copilot         ████████████████████████████████  238 users   │
│  Claude Enterprise    ███████████████████                87 users   │
│  GitHub Copilot       ████████████                       46 users   │
│  Claude Code          ███                                12 users   │
│                                                                      │
│  Total Active Users: 383 (deduplicated)                             │
└─────────────────────────────────────────────────────────────────────┘
```

**Data Sources** (from `ai-tools-data.json`):
- **Claude Enterprise**: `claudeEnterprise.activeUsers` (87)
- **M365 Copilot**: `m365Copilot.activeUsers` (238)
- **Claude Code**: `claudeCode.activeUsers` (12)
- **GitHub Copilot**: `githubCopilot.activeUsers` (46)

**Note**: Total shown is SUM (not deduplicated in MVP - requires user-level overlap analysis in future parser enhancement)

---

### Section 3: Adoption Trends - Multi-line Time Series Chart

```
┌─────────────────────────────────────────────────────────────────────┐
│  Adoption Trends - Last 6 Months                                    │
├─────────────────────────────────────────────────────────────────────┤
│  250 │                                                               │
│      │                           M365 Copilot ─────────────         │
│  200 │                      ──────                                   │
│      │               ──────                                          │
│  150 │          ────                                                 │
│      │     ────            Claude Enterprise ───────────            │
│  100 │ ───                                   ────────                │
│      │                   GitHub Copilot ────────────                │
│   50 │                                Claude Code ──────             │
│      │                                                               │
│    0 │                                                               │
│      └─────────────────────────────────────────────────────────────│
│        Sep    Oct    Nov    Dec    Jan    Feb                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Data Sources** (from `ai-tools-data.json`):
- **Claude Enterprise**: `claudeEnterprise.monthlyTrend[]` → map `activeUsers` by month
- **M365 Copilot**: `m365Copilot.monthlyTrend[]` → map `activeUsers` by month
- **Claude Code**: `claudeCode.monthlyTrend[]` → map `activeUsers` by month
- **GitHub Copilot**: `githubCopilot.monthlyTrend[]` (if exists) OR derive from topUsers data

**Chart Type**: Recharts `LineChart` with 4 colored lines

---

### Section 4: Department Adoption Heatmap - Table Grid

```
┌─────────────────────────────────────────────────────────────────────┐
│  Adoption by Department (Claude Enterprise Only)                   │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┬──────────┬───────────┬─────────────┐         │
│  │ Department      │ Users    │ Adoption% │ Engagement  │         │
│  ├─────────────────┼──────────┼───────────┼─────────────┤         │
│  │ Engineering     │ 77       │ 🟢 93%    │ ⭐⭐⭐⭐   │         │
│  │ Product         │ 18       │ 🟢 90%    │ ⭐⭐⭐⭐   │         │
│  │ Customer Success│ 45       │ 🟢 85%    │ ⭐⭐⭐     │         │
│  │ Marketing       │ 14       │ 🟡 82%    │ ⭐⭐⭐⭐   │         │
│  │ Professional Svc│ 37       │ 🟡 76%    │ ⭐⭐⭐     │         │
│  │ Sales           │ 21       │ 🟡 72%    │ ⭐⭐       │         │
│  │ Operations      │ 19       │ 🟡 70%    │ ⭐⭐       │         │
│  │ Executive       │ 6        │ 🟢 100%   │ ⭐⭐⭐⭐⭐ │         │
│  └─────────────────┴──────────┴───────────┴─────────────┘         │
│                                                                      │
│  Legend: 🟢 ≥85%  🟡 70-84%  🔴 <70%                                │
└─────────────────────────────────────────────────────────────────────┘
```

**Data Source** (from `ai-tools-data.json`):
- **Source**: `claudeEnterprise.departmentBreakdown[]`
- **Fields Used**:
  - `department`: Department name
  - `users`: Active users count
  - `avgConversationsPerUser`: For engagement scoring
  - `avgMessagesPerUser`: For engagement scoring
  - `artifacts`: For engagement scoring

**Adoption % Calculation** (requires parser enhancement):
```javascript
// Need to add to parser: departmentTotalEmployees
adoptionRate = (users / departmentTotalEmployees) * 100
```

**Engagement Score** (already calculated in data):
- Uses combined scoring from conversations, messages, artifacts per user
- Star rating: 5 stars (90+), 4 stars (75-89), 3 stars (50-74), 2 stars (25-49), 1 star (<25)

**Note for MVP**: If adoption% requires new parsing, show "Users" column only and defer % calculation to parser enhancement.

---

### Section 5: AI-Powered Insights - Stacked Panel

```
┌─────────────────────────────────────────────────────────────────────┐
│  💡 AI-Generated Portfolio Insights                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────────────────────────────────────────────────────┐     │
│  │ 📈 Adoption Momentum                        [View Details] │     │
│  │                                                            │     │
│  │ M365 Copilot leads with 95% adoption and strong           │     │
│  │ engagement across all departments...                      │     │
│  │                                                            │     │
│  │ Impact: High  •  Category: adoption                       │     │
│  └───────────────────────────────────────────────────────────┘     │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────┐     │
│  │ 💰 ROI Opportunity                          [View Details] │     │
│  │                                                            │     │
│  │ 7 high-engagement users on Claude Standard qualify...     │     │
│  │                                                            │     │
│  │ Impact: High  •  Category: optimization                   │     │
│  └───────────────────────────────────────────────────────────┘     │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────┐     │
│  │ 🎯 Expansion Target                         [View Details] │     │
│  │                                                            │     │
│  │ Sales department shows 73% Claude adoption but low...     │     │
│  │                                                            │     │
│  │ Impact: Med  •  Category: growth                          │     │
│  └───────────────────────────────────────────────────────────┘     │
│                                                                      │
│  Showing top 3 insights • 21 more available [View All →]           │
└─────────────────────────────────────────────────────────────────────┘
```

**Data Source** (from `ai-tools-data.json`):
- **Source**: `insights[]` array (24 insights available)
- **Fields Used**:
  - `title`: Insight heading
  - `description`: Full text (truncate to ~150 chars on card)
  - `impact`: "high", "medium", "low"
  - `category`: "adoption", "optimization", "growth", etc.
  - `confidence`: AI confidence score (0-100) - optional display

**Display Logic**:
```javascript
// Filter and sort insights
const topInsights = aiToolsData.insights
  .sort((a, b) => {
    const impactOrder = { high: 3, medium: 2, low: 1 };
    return impactOrder[b.impact] - impactOrder[a.impact];
  })
  .slice(0, 3); // Show top 3 in MVP
```

**Interaction**:
- Click "View Details" → Expand insight in modal or navigate to full view
- Click "View All →" → Navigate to insights page (future enhancement)

---

### Section 6: Quick Actions Bar

```
┌─────────────────────────────────────────────────────────────────────┐
│  Quick Actions                                                       │
├─────────────────────────────────────────────────────────────────────┤
│  [📊 View Detailed Briefing] [💰 Explore Expansion ROI]             │
│  [⚖️ Compare Tools]           [📈 View Claude Enterprise]            │
└─────────────────────────────────────────────────────────────────────┘
```

**Actions** (navigation only, no data needed):
1. **View Detailed Briefing** → `setActiveTab('briefing-leadership')`
2. **Explore Expansion ROI** → `setActiveTab('expansion')`
3. **Compare Tools** → `setActiveTab('coding-tools')` or show tool picker modal
4. **View Claude Enterprise** → `setActiveTab('claude-enterprise')`

---

## Data Schema Mapping (MVP)

### Available Data (✅ = Use in MVP)

| Section | Metric | Data Path | Status |
|---------|--------|-----------|--------|
| **Hero KPIs** |
| | Licensed Users | `orgMetrics.totalLicensedUsers` | ✅ MVP |
| | Total Employees | `orgMetrics.totalEmployees` | ✅ MVP |
| | Total Activity | `claudeEnterprise.totalConversations` | ✅ MVP |
| | Portfolio Adoption | `orgMetrics.penetrationRate` | ✅ MVP |
| | ROI Multiple | `currentStateROI.roi` | ✅ MVP |
| **Tool Portfolio** |
| | Claude Enterprise Users | `claudeEnterprise.activeUsers` | ✅ MVP |
| | M365 Copilot Users | `m365Copilot.activeUsers` | ✅ MVP |
| | Claude Code Users | `claudeCode.activeUsers` | ✅ MVP |
| | GitHub Copilot Users | `githubCopilot.activeUsers` | ✅ MVP |
| **Adoption Trends** |
| | Claude Monthly Trend | `claudeEnterprise.monthlyTrend[]` | ✅ MVP |
| | M365 Monthly Trend | `m365Copilot.monthlyTrend[]` | ✅ MVP |
| | Code Monthly Trend | `claudeCode.monthlyTrend[]` | ✅ MVP |
| | GitHub Monthly Trend | `githubCopilot.monthlyTrend[]` | ✅ MVP |
| **Department Heatmap** |
| | Department Breakdown | `claudeEnterprise.departmentBreakdown[]` | ✅ MVP |
| | Department Adoption % | Not in schema | ⏳ Parser enhancement |
| **AI Insights** |
| | Insights Array | `insights[]` | ✅ MVP (24 available) |

---

## Implementation Plan - MVP (Week 1)

### Phase 1A: Navigation Update (Day 1 - 2 hours)

**File**: `app/page.jsx` line ~206-221 (navigationStructure)

**Change**:
```javascript
// BEFORE (dropdown)
{
  id: 'overview',
  label: 'Overview',
  hasDropdown: true,
  items: [...]
}

// AFTER (direct link to home)
{
  id: 'overview',
  label: 'Overview',
  hasDropdown: false,
  tab: 'overview-home'  // NEW: Direct link to home page
}
```

**Add new dropdown for Briefings**:
```javascript
{
  id: 'briefings',
  label: 'Briefings',
  hasDropdown: true,
  items: [
    { id: 'briefing-leadership', label: 'Leadership Summary', tab: 'briefing-leadership' },
    { id: 'briefing-org', label: 'Organization-wide Summary', tab: 'briefing-org' }
  ]
}
```

---

### Phase 1B: Hero KPIs Section (Day 1 - 4 hours)

**File**: `app/page.jsx` - add new tab section `{activeTab === 'overview-home' && (...`

**Code Structure**:
```jsx
{activeTab === 'overview-home' && (
  <div className="space-y-6">
    {/* Hero KPIs - 4 Metric Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Licensed Users"
        value={aiToolsData.orgMetrics.totalLicensedUsers}
        subtext={`of ${aiToolsData.orgMetrics.totalEmployees} total`}
        icon={Users}
        color="blue"
      />
      <MetricCard
        title="Total Activity"
        value={aiToolsData.claudeEnterprise.totalConversations.toLocaleString()}
        subtext="conversations"
        icon={MessageSquare}
        color="green"
      />
      <MetricCard
        title="Portfolio Adoption"
        value={`${aiToolsData.orgMetrics.penetrationRate}%`}
        subtext={`${aiToolsData.orgMetrics.totalLicensedUsers} of ${aiToolsData.orgMetrics.totalEmployees} employees`}
        icon={TrendingUp}
        color="purple"
      />
      <MetricCard
        title="ROI Multiple"
        value={`${aiToolsData.currentStateROI.roi.toFixed(1)}x`}
        subtext="return on investment"
        icon={DollarSign}
        color="orange"
      />
    </div>
  </div>
)}
```

---

### Phase 1C: Tool Portfolio Breakdown (Day 2 - 3 hours)

**Code Structure**:
```jsx
{/* Tool Portfolio Breakdown */}
<div className="bg-white rounded-lg shadow-md p-6">
  <h3 className="text-lg font-semibold mb-4">Active Users by AI Tool</h3>

  {/* Horizontal bars */}
  <div className="space-y-3">
    {[
      { tool: 'M365 Copilot', users: aiToolsData.m365Copilot.activeUsers, color: '#0078d4' },
      { tool: 'Claude Enterprise', users: aiToolsData.claudeEnterprise.activeUsers, color: '#3b82f6' },
      { tool: 'GitHub Copilot', users: aiToolsData.githubCopilot.activeUsers, color: '#24292e' },
      { tool: 'Claude Code', users: aiToolsData.claudeCode.activeUsers, color: '#6366f1' }
    ].map(({ tool, users, color }) => {
      const maxUsers = aiToolsData.m365Copilot.activeUsers; // M365 has most
      const widthPercent = (users / maxUsers) * 100;

      return (
        <div key={tool} className="flex items-center">
          <div className="w-40 text-sm font-medium">{tool}</div>
          <div className="flex-1 mx-4">
            <div className="bg-gray-200 rounded-full h-6 overflow-hidden">
              <div
                className="h-full flex items-center justify-end pr-2 text-white text-xs font-semibold"
                style={{ width: `${widthPercent}%`, backgroundColor: color }}
              >
                {users} users
              </div>
            </div>
          </div>
        </div>
      );
    })}
  </div>

  {/* Total */}
  <div className="mt-4 pt-4 border-t text-sm text-gray-600">
    Total Active Users: {
      aiToolsData.m365Copilot.activeUsers +
      aiToolsData.claudeEnterprise.activeUsers +
      aiToolsData.githubCopilot.activeUsers +
      aiToolsData.claudeCode.activeUsers
    }
  </div>
</div>
```

---

### Phase 1D: Adoption Trends Chart (Day 2-3 - 4 hours)

**Code Structure**:
```jsx
{/* Adoption Trends Chart */}
<div className="bg-white rounded-lg shadow-md p-6">
  <h3 className="text-lg font-semibold mb-4">Adoption Trends - Last 6 Months</h3>

  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={prepareAdoptionTrendData()}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line
        type="monotone"
        dataKey="m365"
        stroke="#0078d4"
        name="M365 Copilot"
        strokeWidth={2}
      />
      <Line
        type="monotone"
        dataKey="claudeEnterprise"
        stroke="#3b82f6"
        name="Claude Enterprise"
        strokeWidth={2}
      />
      <Line
        type="monotone"
        dataKey="githubCopilot"
        stroke="#24292e"
        name="GitHub Copilot"
        strokeWidth={2}
      />
      <Line
        type="monotone"
        dataKey="claudeCode"
        stroke="#6366f1"
        name="Claude Code"
        strokeWidth={2}
      />
    </LineChart>
  </ResponsiveContainer>
</div>
```

**Helper Function**:
```javascript
const prepareAdoptionTrendData = () => {
  // Combine all monthlyTrend arrays
  const months = aiToolsData.claudeEnterprise.monthlyTrend.map(m => m.monthLabel);

  return months.map((month, idx) => ({
    month,
    m365: aiToolsData.m365Copilot.monthlyTrend[idx]?.activeUsers || 0,
    claudeEnterprise: aiToolsData.claudeEnterprise.monthlyTrend[idx]?.activeUsers || 0,
    githubCopilot: aiToolsData.githubCopilot.monthlyTrend?.[idx]?.activeUsers || 0,
    claudeCode: aiToolsData.claudeCode.monthlyTrend[idx]?.activeUsers || 0
  }));
};
```

---

### Phase 1E: Department Heatmap + Insights (Day 3-4 - 6 hours)

**Department Heatmap**:
```jsx
{/* Department Adoption Heatmap */}
<div className="bg-white rounded-lg shadow-md p-6">
  <h3 className="text-lg font-semibold mb-4">Claude Enterprise Adoption by Department</h3>

  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead>
        <tr>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Users</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Avg Conversations</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Engagement</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {aiToolsData.claudeEnterprise.departmentBreakdown.map(dept => (
          <tr key={dept.department}>
            <td className="px-4 py-3 text-sm font-medium">{dept.department}</td>
            <td className="px-4 py-3 text-sm">{dept.users}</td>
            <td className="px-4 py-3 text-sm">{dept.avgConversationsPerUser.toFixed(1)}</td>
            <td className="px-4 py-3 text-sm">
              {/* Show star rating based on engagement */}
              {getEngagementStars(dept.avgConversationsPerUser)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
```

**AI Insights Panel**:
```jsx
{/* AI Insights - Stacked Panel */}
<div className="bg-white rounded-lg shadow-md p-6">
  <h3 className="text-lg font-semibold mb-4">💡 AI-Generated Portfolio Insights</h3>

  <div className="space-y-4">
    {aiToolsData.insights
      .sort((a, b) => {
        const impactOrder = { high: 3, medium: 2, low: 1 };
        return impactOrder[b.impact] - impactOrder[a.impact];
      })
      .slice(0, 3)
      .map((insight, idx) => (
        <div key={idx} className="border rounded-lg p-4 hover:shadow-md transition">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-base">{insight.title}</h4>
            <button className="text-blue-600 text-sm hover:underline">
              View Details
            </button>
          </div>
          <p className="text-sm text-gray-700 mb-3">
            {insight.description.substring(0, 150)}...
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className={`font-semibold ${
              insight.impact === 'high' ? 'text-red-600' :
              insight.impact === 'medium' ? 'text-yellow-600' :
              'text-gray-600'
            }`}>
              Impact: {insight.impact}
            </span>
            <span>Category: {insight.category}</span>
          </div>
        </div>
      ))}
  </div>

  <div className="mt-4 text-center text-sm text-gray-600">
    Showing top 3 insights • {aiToolsData.insights.length - 3} more available
  </div>
</div>
```

---

### Phase 1F: Quick Actions Bar (Day 4 - 1 hour)

```jsx
{/* Quick Actions */}
<div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <button
      onClick={() => setActiveTab('briefing-leadership')}
      className="flex flex-col items-center p-4 bg-white rounded-lg hover:shadow-md transition"
    >
      <FileText className="h-8 w-8 text-blue-600 mb-2" />
      <span className="text-sm font-medium text-center">View Detailed Briefing</span>
    </button>
    <button
      onClick={() => setActiveTab('expansion')}
      className="flex flex-col items-center p-4 bg-white rounded-lg hover:shadow-md transition"
    >
      <DollarSign className="h-8 w-8 text-green-600 mb-2" />
      <span className="text-sm font-medium text-center">Explore Expansion ROI</span>
    </button>
    <button
      onClick={() => setActiveTab('coding-tools')}
      className="flex flex-col items-center p-4 bg-white rounded-lg hover:shadow-md transition"
    >
      <Code className="h-8 w-8 text-purple-600 mb-2" />
      <span className="text-sm font-medium text-center">Compare Tools</span>
    </button>
    <button
      onClick={() => setActiveTab('claude-enterprise')}
      className="flex flex-col items-center p-4 bg-white rounded-lg hover:shadow-md transition"
    >
      <TrendingUp className="h-8 w-8 text-orange-600 mb-2" />
      <span className="text-sm font-medium text-center">View Claude Enterprise</span>
    </button>
  </div>
</div>
```

---

## Mobile Responsive Design

### Desktop (>1024px)
- 4-column hero cards
- Full-width charts and tables
- Side-by-side insights (if space allows)

### Tablet (768px - 1024px)
- 2-column hero cards (2 rows)
- Full-width charts
- Scrollable heatmap table

### Mobile (<768px)
- 1-column hero cards (stacked)
- Full-width charts (x-axis scrollable)
- Stacked department rows
- Stacked insights
- 2x2 quick actions grid

---

## Testing Checklist

### Data Integration
- [ ] All metrics pull from `ai-tools-data.json` (NO HARDCODING)
- [ ] Hero KPIs display correct values
- [ ] Tool portfolio bars show correct user counts
- [ ] Adoption trend chart renders all 4 tools correctly
- [ ] Department heatmap shows all 8 departments
- [ ] AI insights display top 3 sorted by impact

### Navigation
- [ ] Overview is direct link (not dropdown)
- [ ] Clicking Overview loads overview-home tab
- [ ] Briefings moved to separate dropdown
- [ ] Quick action buttons navigate correctly
- [ ] Breadcrumb shows "Home" for overview

### Responsive Design
- [ ] Desktop: 4-column cards, full charts
- [ ] Tablet: 2-column cards, scrollable tables
- [ ] Mobile: 1-column stacked, readable on 375px width
- [ ] All charts responsive with ResponsiveContainer

### Data Refresh
- [ ] After running `node scripts/parse-copilot-data.js`, new data appears
- [ ] No manual code changes needed to update metrics
- [ ] All calculations use latest parsed data

---

## Future Enhancements (Post-MVP)

### Phase 2: Enhanced Department View
- [ ] Add department adoption % (requires parser enhancement to include `departmentTotalEmployees`)
- [ ] Add M365 Copilot department breakdown (requires M365 dept data in parser)
- [ ] Show multi-tool department heatmap

### Phase 3: Advanced Insights
- [ ] Insight detail modal with full description
- [ ] Filter insights by category (adoption, optimization, growth)
- [ ] "View All Insights" page

### Phase 4: Interactive Elements
- [ ] Click tool in portfolio chart → navigate to tool deep dive
- [ ] Click department in heatmap → show department detail view
- [ ] Date range picker for trends chart
- [ ] Export overview as PDF

---

**Status**: ✅ Design approved, ready for implementation
**Estimated MVP Time**: 4 days (32 hours)
**Data Requirement**: 100% data-driven from `ai-tools-data.json` (NO HARDCODING)
