# Agentic Organization Chart - Implementation Roadmap

**Status**: Phase 1 Complete ✅
**Created**: 2026-01-21
**Last Updated**: 2026-01-21
**Owner**: AI Dashboard Team

---

## 🎯 Vision

Create an **"Agentic Organization Chart"** that visualizes the true organizational capacity by showing both human employees and their AI-augmented capacity. This provides executives with a clear view of how AI tools are multiplying workforce capability across the organization.

**Key Insight**: TechCo Inc operates with **258 employees but delivers capacity equivalent to 338+ FTE** through AI tool adoption.

---

## 📊 Current State (Phase 1 Complete)

### What We Have Now

**✅ Data Foundation:**
- Renamed "Virtual FTE" → "Agentic FTE" across entire codebase
- Per-employee agentic FTE tracking in org chart schema
- Recursive team rollup aggregation (employee + all reports)
- Organization-wide agentic FTE summary

**✅ Org Chart Schema:**
```json
{
  "name": "Employee Name",
  "title": "Job Title",
  "agenticFTE": {
    "current": 0.18,
    "breakdown": {
      "claudeEnterprise": 0.12,
      "m365Copilot": 0.05,
      "claudeCode": 0.01
    }
  },
  "teamAgenticFTE": {
    "current": 3.4,
    "breakdown": { /* sum of team */ }
  }
}
```

**✅ Scripts:**
- `enrich-org-chart-with-agentic-fte.js` - Enriches org chart with AI capacity data
- `agentic-fte-calculator.js` - Calculates per-user agentic FTE
- Updated pipeline orchestrator with new terminology

**✅ Current Metrics:**
- Total Org: 258 employees + 80.3 agentic FTEs = **338.3 effective FTE**
- Primary Source: Claude Code (80.3 FTEs from Engineering)
- Claude Enterprise & M365 Copilot: Will populate after next data refresh

---

## 🚀 Roadmap: Phases 2-5

### **Phase 2: Visualization Foundation** 🎨
**Timeline**: Q1 2026
**Effort**: 2-3 weeks
**Status**: Not Started

**Goals:**
- Build interactive org chart visualization component
- Show human employees with their AI-augmented capacity
- Enable basic navigation and exploration

**Deliverables:**

1. **New Dashboard Tab: "Agentic Org Chart"**
   - Location: `app/components/tabs/AgenticOrgChart.jsx`
   - Navigation: Add to sidebar under "Organization"

2. **Org Chart Visualization Component**
   - Technology: D3.js or React Flow for tree visualization
   - Features:
     - Hierarchical tree layout (top-down or left-to-right)
     - Node styling: Different colors for executives/managers/ICs
     - Expandable/collapsible branches
     - Zoom and pan capabilities
     - Search/filter employees

3. **Employee Node Display**
   Each node shows:
   - Name + Title
   - Personal agentic FTE: "+0.18 FTE"
   - Team agentic FTE: "Team: +3.4 FTE"
   - Color intensity based on AI adoption level
   - Tooltip with detailed breakdown

4. **Summary Dashboard**
   - Top metrics:
     - "Total Capacity: 258 employees + 80 agentic FTEs = 338 effective FTE"
     - "AI Contribution: +31% capacity gain"
   - Department breakdown table
   - Top contributors leaderboard

**Technical Requirements:**
```javascript
// Component structure
<AgenticOrgChart>
  <OrgChartSummary />
  <OrgChartFilters />
  <OrgChartVisualization>
    <EmployeeNode />
  </OrgChartVisualization>
  <OrgChartLegend />
</AgenticOrgChart>
```

**Dependencies:**
- D3.js or React Flow library
- Responsive layout for large org charts
- Performance optimization for 258 nodes

---

### **Phase 3: Month-over-Month Tracking** 📈
**Timeline**: Q1 2026
**Effort**: 1-2 weeks
**Status**: Not Started

**Goals:**
- Track agentic FTE changes over time
- Show which teams are growing AI capacity
- Identify adoption trends and patterns

**Deliverables:**

1. **Enhanced Agentic FTE Schema**
   Add historical comparison fields:
   ```json
   {
     "agenticFTE": {
       "current": 0.18,
       "previous": 0.15,
       "change": +0.03,
       "changePercent": 20.0,
       "trend": "increasing",
       "breakdown": { /* ... */ }
     }
   }
   ```

2. **Enhanced Snapshot Comparison**
   - Modify `compare-org-charts.js` to compare agentic FTE
   - Generate agentic FTE change reports
   - Identify top gainers and decliners

3. **Trend Visualization**
   - Add trend indicators (↑ green, ↓ red) to org chart nodes
   - Show month-over-month changes in tooltips
   - Highlight teams with significant changes

4. **Comparison Report**
   ```
   Organization-Wide Agentic FTE Changes
   =====================================
   Total: 80.3 → 85.1 FTEs (+4.8 FTEs, +6.0%)

   Top Gainers:
   - Engineering: +3.2 FTEs
   - Product: +1.1 FTEs
   - Marketing: +0.5 FTEs

   By Employee:
   - Chris Patullo: +0.8 FTEs (expanded Claude Code usage)
   - Laura Jackson: +0.3 FTEs (increased M365 adoption)
   ```

**Script Updates:**
- `enrich-org-chart-with-agentic-fte.js`: Add historical comparison logic
- `compare-org-charts.js`: Add agentic FTE comparison section
- `manage-org-chart-snapshot.js`: Include agentic FTE in comparison output

---

### **Phase 4: Dashboard Integration** 🎯
**Timeline**: Q2 2026
**Effort**: 1 week
**Status**: Not Started

**Goals:**
- Surface agentic FTE metrics on main dashboard
- Make AI capacity gains visible to all users
- Create executive summary view

**Deliverables:**

1. **Overview Tab Enhancement**
   Add new metric card:
   ```
   ┌─────────────────────────────────────┐
   │ Effective Organizational Capacity   │
   │                                     │
   │ 338 FTE                            │
   │ ├─ 258 Employees                   │
   │ └─ 80 Agentic FTEs (+31%)          │
   │                                     │
   │ MoM: +4.8 FTEs (+6.0%) ↑           │
   └─────────────────────────────────────┘
   ```

2. **Briefing Updates**
   - **Leadership Briefing**: Add "Agentic Capacity Summary" section
   - **Org Briefing**: Highlight department-level AI capacity
   - Executive talking points: "We deliver 338 FTE capacity with 258 employees"

3. **Quick Stats Component**
   Reusable component showing agentic FTE stats:
   - Used in Overview, Briefings, Tool Deep Dives
   - Shows breakdown by tool
   - Links to Agentic Org Chart for details

4. **AI Insights Enhancement**
   New AI-generated insights:
   - "Your organization gained 4.8 FTE worth of AI capacity this month"
   - "Engineering team now operates at 135% capacity through AI"
   - "Top opportunity: Enable Claude Enterprise in Sales (potential +8 FTEs)"

**Component Structure:**
```javascript
// New shared component
<AgenticFTECard
  totalFTE={338}
  humanFTE={258}
  agenticFTE={80}
  change={4.8}
  changePercent={6.0}
  breakdown={{
    claudeEnterprise: 25,
    m365Copilot: 35,
    claudeCode: 80
  }}
/>
```

---

### **Phase 5: Analytics & Optimization** 📊
**Timeline**: Q2 2026
**Effort**: 2-3 weeks
**Status**: Not Started

**Goals:**
- Department-level benchmarking
- ROI analysis and optimization recommendations
- Manager accountability and leaderboards

**Deliverables:**

1. **Department Benchmarking**
   - Compare agentic FTE across departments
   - Normalize by headcount (agentic FTE per employee)
   - Identify high/low adoption teams
   - Best practices from top-performing departments

   ```
   Department Performance (Agentic FTE per Employee)
   =================================================
   1. Engineering:  0.98 FTE/employee (82 employees)
   2. Product:      0.85 FTE/employee (16 employees)
   3. Marketing:    0.22 FTE/employee (24 employees)
   4. Sales:        0.15 FTE/employee (16 employees)

   Opportunity: Bringing Sales to Engineering level = +13 FTEs
   ```

2. **Manager Leaderboards**
   - Rank managers by team agentic FTE growth
   - Show adoption rates within teams
   - Recognize top performers
   - Identify managers needing enablement support

3. **ROI Analysis Dashboard**
   New section showing:
   - AI tool costs: $X/month
   - Agentic FTE delivered: Y FTEs
   - Cost per agentic FTE: $X/Y
   - Equivalent hiring cost saved: Y × $150K/year
   - ROI percentage: (Savings - Cost) / Cost

   Example:
   ```
   AI Investment ROI
   ==================
   Monthly Cost: $50,000
   Agentic FTE Delivered: 80 FTEs
   Cost per FTE: $625/month

   Equivalent Hiring Cost: 80 × $12.5K/month = $1M/month
   Net Savings: $950K/month
   ROI: 1,900%
   ```

4. **Optimization Recommendations**
   AI-powered suggestions:
   - "Sales team has low AI adoption - enable Claude Enterprise (+8 FTEs)"
   - "3 managers have zero team AI usage - schedule enablement"
   - "Engineering peaked - focus on non-technical teams for next gains"

5. **Predictive Modeling**
   - Forecast agentic FTE growth based on adoption trends
   - "At current rate, you'll reach 100 agentic FTEs by March"
   - "Full organization enablement could deliver 150+ agentic FTEs"

**New Scripts:**
- `analyze-agentic-fte-roi.js` - Calculate ROI metrics
- `generate-agentic-fte-insights.js` - AI-powered optimization recommendations
- `forecast-agentic-capacity.js` - Predictive modeling

---

## 🎨 Future Enhancements (Post-Phase 5)

### **Advanced Visualization**
- Animated transitions showing org chart changes over time
- Heat map overlay showing AI adoption intensity
- 3D org chart for large organizations
- Export org chart as image/PDF for presentations

### **Integration with HR Systems**
- Auto-sync org chart from Rippling API
- Real-time updates when employees join/leave
- Connect to performance review systems
- Link to learning management system (LMS) for AI training

### **Advanced Analytics**
- Correlation: AI adoption vs. productivity metrics
- Predictive attrition: Low AI users more likely to leave?
- Skill gap analysis: Which teams need AI training?
- Competitive benchmarking: How do we compare to industry?

### **Gamification**
- Team challenges: "Increase agentic FTE by 10% this quarter"
- Badges/achievements for AI adoption milestones
- Department competitions with leaderboards
- Recognition for top contributors

---

## 📏 Success Metrics

### Phase 2 Success Criteria:
- [ ] Agentic org chart visualizes all 258 employees
- [ ] Render time < 2 seconds for full org chart
- [ ] Users can drill down to any employee in ≤3 clicks
- [ ] 90%+ of executives view org chart in first week

### Phase 3 Success Criteria:
- [ ] Month-over-month changes visible for all employees
- [ ] Comparison report generated with each snapshot
- [ ] Trend direction (↑/↓) accurate for 95%+ of employees
- [ ] Historical data preserved for 12+ months

### Phase 4 Success Criteria:
- [ ] Agentic FTE visible on Overview tab
- [ ] Briefings include AI capacity metrics
- [ ] 100% of AI insights mention agentic FTE when relevant
- [ ] Executive team references agentic FTE in board meetings

### Phase 5 Success Criteria:
- [ ] ROI dashboard shows positive ROI (target: >500%)
- [ ] Department benchmarking identifies 3+ optimization opportunities
- [ ] Manager leaderboard drives 20%+ increase in low-adoption teams
- [ ] Predictive model accuracy within 10% of actual results

---

## 🚧 Technical Considerations

### Performance
- **Challenge**: Rendering 258-node org chart
- **Solution**: Virtual scrolling, progressive rendering, WebGL acceleration

### Data Quality
- **Challenge**: Matching employees to usage data (email vs. name)
- **Solution**: Phase 1 uses name matching, Phase 2+ adds email resolution

### Scalability
- **Challenge**: Org charts can grow to 500+ employees
- **Solution**: Lazy loading, collapsible branches, pagination

### Historical Data
- **Challenge**: Need 12+ months of snapshots for trends
- **Solution**: Monthly snapshots, archive old data, efficient storage

---

## 📋 Dependencies

### Phase 2:
- [ ] D3.js or React Flow library selection
- [ ] UX design for org chart layout
- [ ] Mobile responsiveness strategy

### Phase 3:
- [ ] 2+ months of snapshot data for comparison
- [ ] Historical agentic FTE calculations backfilled

### Phase 4:
- [ ] AI insight generation templates updated
- [ ] Executive dashboard design review

### Phase 5:
- [ ] HR/Finance data for cost calculations
- [ ] Industry benchmark data (optional)
- [ ] Predictive modeling algorithms

---

## 🎯 Milestones

| Phase | Target Completion | Status | Deliverables |
|-------|------------------|--------|--------------|
| Phase 1: Foundation | 2026-01-21 | ✅ Complete | Schema, calculations, terminology |
| Phase 2: Visualization | 2026-02-15 | 🔜 Next | Interactive org chart |
| Phase 3: Tracking | 2026-03-01 | 📋 Planned | MoM comparisons |
| Phase 4: Integration | 2026-03-15 | 📋 Planned | Dashboard widgets |
| Phase 5: Analytics | 2026-04-15 | 📋 Planned | ROI, benchmarking |

---

## 📚 Related Documentation

- **ADR-002**: Organizational Chart Data Architecture
- **ADR-001**: AI Tools Dashboard Architecture
- **DATA_REFRESH.md**: Data pipeline and org chart refresh process
- **org-chart-snapshots/README.md**: Snapshot system documentation
- **2026-01-18-agentic-fte-metric-design.md**: Original virtual FTE design

---

## 👥 Stakeholders

- **Executive Sponsor**: Jess Keeney (CEO)
- **Technical Owner**: Luis Amadeo (Chief Agentic Officer)
- **Key Users**: Executive team, Department heads, HR
- **Contributors**: AI Dashboard dev team

---

## ✅ Current Status Summary

**Phase 1 Complete (2026-01-21)**:
- ✅ 258 employees tracked in org chart
- ✅ 80.3 agentic FTEs calculated (Claude Code)
- ✅ 338.3 effective FTE organizational capacity
- ✅ Schema enhanced with per-employee + team rollup
- ✅ Snapshot system includes agentic FTE data
- ✅ All code and documentation updated with "agentic FTE" terminology

**Next Action**: Begin Phase 2 design and planning

**Estimated Value**: When complete, this will provide TechCo Inc with unique insight into true organizational capacity, enabling data-driven decisions about AI tool investment and ROI that most organizations lack.
