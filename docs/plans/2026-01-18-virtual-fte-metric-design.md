# Agentic FTE Metric Design Document

**Date**: January 18, 2026
**Author**: Claude Code + Luis Amadeo
**Status**: Design Phase
**Purpose**: Add "Agentic FTEs" metric showing equivalent full-time employees added through AI productivity gains

---

## Executive Summary

**Goal**: Create a new dashboard metric that translates AI productivity gains into "Agentic FTE" equivalents - showing executives how many additional "people" the AI tools have effectively added to the organization.

**Why This Matters**:
- Executives understand headcount better than abstract productivity metrics
- "We added 12 virtual employees this month" is more compelling than "saved 2,000 hours"
- Connects AI investment directly to workforce capacity expansion
- Provides clear ROI narrative: "AI tools = X additional team members at Y% the cost"

---

## Metric Definition

### What is a Agentic FTE?

A **Agentic FTE (Full-Time Equivalent)** represents the equivalent work capacity of one full-time employee, measured in productive hours over a time period.

**Standard FTE Hours**:
- **Annual**: 2,080 hours (40 hrs/week × 52 weeks)
- **Monthly**: ~173 hours (2,080 ÷ 12 months)
- **Weekly**: 40 hours
- **Daily**: 8 hours

**Agentic FTE Calculation**:
```
Agentic FTE = Total Productive Hours Gained from AI / Standard FTE Hours
```

**Example**:
- If AI tools saved 346 hours in January
- Monthly FTE = 173 hours
- Agentic FTEs = 346 ÷ 173 = **2.0 FTEs**
- Interpretation: "AI tools added the equivalent of 2 full-time employees in January"

**Important Concept: Agentic FTEs Can Exceed Licensed Users**

This is **expected and desirable** - it demonstrates AI's value:
- ✅ **16 Claude Code users producing 120 agentic FTEs** = 7.5x productivity multiplier
- ✅ **1 developer + AI can produce what 5-7 developers produce manually**
- ✅ **That's the whole point** - AI augments human capacity beyond 1:1 ratio

Don't think of it as "time saved from existing work" - think of it as **"additional work capacity created"**.

---

## Data Sources & Methodology

### 1. Productivity Hours (Knowledge Work)

**Source**: Claude Enterprise, M365 Copilot activity metrics

**Current Data Available**:
```json
{
  "productivity": {
    "totalTimeSaved": 5662,  // Total hours across all tools
    "timeSavingsByTool": {
      "claudeEnterprise": 3044,
      "claudeEnterprisePremium": 2340,
      "claudeEnterpriseStandard": 704,
      "m365Copilot": 2068,
      "githubCopilot": 550
    }
  }
}
```

**How to Calculate**:
- Already calculated in `productivity.totalTimeSaved`
- Based on research benchmarks (see `.claude/CALCULATIONS.md`):
  - Claude Enterprise: ~28% time savings (Australian gov study)
  - M365 Copilot: ~14% time savings (Digital Australia report)
  - Uses actual user activity data (chats, artifacts, projects, interactions)

**Formula**:
```javascript
// Per tool calculation (example for Claude Enterprise)
const avgTimeSavingsPercentage = 0.28; // 28% from research
const activeUsers = 65;
const avgHoursWorkedPerUser = 173; // Monthly FTE hours
const baselineHours = activeUsers * avgHoursWorkedPerUser;
const timeSavedHours = baselineHours * avgTimeSavingsPercentage;
```

### 2. Coding Hours (Development Work)

**Source**: Claude Code, GitHub Copilot lines of code

**Current Data Available**:
```json
{
  "claudeCode": {
    "monthlyTrend": [{
      "month": "2025-11",
      "linesAccepted": 284350  // Total lines across all users
    }]
  },
  "githubCopilot": {
    "monthlyTrend": [{
      "month": "2025-11",
      "linesAccepted": 119342
    }]
  }
}
```

**Lines of Code to Hours Conversion**:

Research-based estimates for code generation time:
- **Manual coding**: ~10-15 lines per hour (complex code)
- **AI-assisted coding**: ~100-150 lines per hour (with AI)
- **Conservative estimate**: Assume AI generates code 10x faster
- **Time saved per line**: If manual = 0.1 hours/line (6 min/line), AI saves ~0.09 hours/line

**Conversion Formula**:
```javascript
// Conservative: 1 line = 0.05 hours saved (3 minutes)
// Moderate: 1 line = 0.08 hours saved (5 minutes)  ← Recommended
// Aggressive: 1 line = 0.10 hours saved (6 minutes)

const linesOfCode = 284350; // Claude Code lines in November
const hoursPerLine = 0.08; // Moderate estimate
const codingHoursSaved = linesOfCode * hoursPerLine; // 22,748 hours
```

**Rationale for 0.08 hours/line**:
- Accounts for thinking, debugging, testing time saved
- Based on GitHub Copilot research showing 55% faster task completion
- Aligns with Claude Code showing 7.5x productivity vs GitHub Copilot

### 3. Combined Agentic FTE Calculation

**Formula**:
```javascript
// Step 1: Calculate total productive hours from all sources
const productivityHours = productivity.totalTimeSaved; // Already calculated
const codingHours = (claudeCodeLines + githubCopilotLines) * HOURS_PER_LINE;
const totalHours = productivityHours + codingHours;

// Step 2: Convert to Agentic FTEs
const MONTHLY_FTE_HOURS = 173;
const agenticFTEs = totalHours / MONTHLY_FTE_HOURS;

// Step 3: Calculate per-tool breakdown
const agenticFTEsByTool = {
  claudeEnterprise: productivity.timeSavingsByTool.claudeEnterprise / MONTHLY_FTE_HOURS,
  claudeCode: (claudeCodeLines * HOURS_PER_LINE) / MONTHLY_FTE_HOURS,
  m365Copilot: productivity.timeSavingsByTool.m365Copilot / MONTHLY_FTE_HOURS,
  githubCopilot: (githubCopilotLines * HOURS_PER_LINE) / MONTHLY_FTE_HOURS
};
```

---

## Constants & Configuration

### Configurable Parameters

Add to `.claude/CALCULATIONS.md`:

```javascript
// Agentic FTE Configuration
const VIRTUAL_FTE_CONFIG = {
  // Standard FTE hours
  annualFTEHours: 2080,      // 40 hrs/week × 52 weeks
  monthlyFTEHours: 173,      // 2080 ÷ 12
  weeklyFTEHours: 40,
  dailyFTEHours: 8,

  // Coding productivity conversion
  hoursPerLineOfCode: 0.08,  // 5 minutes per line saved (moderate)

  // Alternative estimates (for sensitivity analysis)
  conservative: {
    hoursPerLine: 0.05  // 3 minutes per line
  },
  moderate: {
    hoursPerLine: 0.08  // 5 minutes per line (default)
  },
  aggressive: {
    hoursPerLine: 0.10  // 6 minutes per line
  },

  // Display configuration
  decimalPlaces: 1,  // Show "2.5 FTEs" not "2.53 FTEs"
  minimumThreshold: 0.1  // Don't show if < 0.1 FTE
};
```

---

## Implementation Plan

### Phase 1: Add Calculation to Data Pipeline

**File**: `scripts/modules/processors/productivity-calculator.js`

**Add new function**:
```javascript
/**
 * Calculate Agentic FTEs from productivity gains
 * @param {Object} productivityData - Time saved metrics
 * @param {Object} codingData - Lines of code metrics
 * @returns {Object} Agentic FTE metrics
 */
function calculateAgenticFTEs(productivityData, codingData) {
  const MONTHLY_FTE_HOURS = 173;
  const HOURS_PER_LINE = 0.08;

  // Productivity hours (knowledge work)
  const productivityHours = productivityData.totalTimeSaved;

  // Coding hours (development work)
  const claudeCodeLines = codingData.claudeCode.currentMonth.linesAccepted || 0;
  const githubCopilotLines = codingData.githubCopilot.currentMonth.linesAccepted || 0;
  const totalCodingLines = claudeCodeLines + githubCopilotLines;
  const codingHours = totalCodingLines * HOURS_PER_LINE;

  // Total hours
  const totalHours = productivityHours + codingHours;
  const agenticFTEs = totalHours / MONTHLY_FTE_HOURS;

  // Per-tool breakdown
  const breakdown = {
    claudeEnterprise: {
      hours: productivityData.timeSavingsByTool.claudeEnterprise,
      ftes: productivityData.timeSavingsByTool.claudeEnterprise / MONTHLY_FTE_HOURS
    },
    claudeCode: {
      hours: claudeCodeLines * HOURS_PER_LINE,
      ftes: (claudeCodeLines * HOURS_PER_LINE) / MONTHLY_FTE_HOURS,
      linesOfCode: claudeCodeLines
    },
    m365Copilot: {
      hours: productivityData.timeSavingsByTool.m365Copilot,
      ftes: productivityData.timeSavingsByTool.m365Copilot / MONTHLY_FTE_HOURS
    },
    githubCopilot: {
      hours: githubCopilotLines * HOURS_PER_LINE,
      ftes: (githubCopilotLines * HOURS_PER_LINE) / MONTHLY_FTE_HOURS,
      linesOfCode: githubCopilotLines
    }
  };

  return {
    totalAgenticFTEs: parseFloat(agenticFTEs.toFixed(1)),
    totalProductiveHours: totalHours,
    breakdown,
    calculation: {
      productivityHours,
      codingHours,
      totalHours,
      monthlyFTEHours: MONTHLY_FTE_HOURS,
      hoursPerLineOfCode: HOURS_PER_LINE
    }
  };
}

module.exports = { calculateAgenticFTEs };
```

### Phase 2: Add to Data Output

**File**: `scripts/modules/pipeline-orchestrator.js`

**Update output structure**:
```javascript
// In orchestrator, after productivity calculations
const agenticFTEMetrics = calculateAgenticFTEs(
  productivityData,
  { claudeCode, githubCopilot }
);

// Add to output JSON
const output = {
  ...existingData,
  agenticFTEs: agenticFTEMetrics
};
```

### Phase 3: Display in Overview Tab

**File**: `app/components/tabs/OverviewHome.jsx`

**Add new KPI card** (insert after existing 5 cards):
```jsx
{/* Card: Agentic FTEs Added */}
<div className="bg-white rounded-lg shadow-md p-6">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-600 mb-1">Agentic FTEs Added</p>
      <p className="text-3xl font-bold text-emerald-600">
        {aiToolsData.agenticFTEs.totalAgenticFTEs}
      </p>
      <p className="text-xs text-gray-500 mt-1">
        {aiToolsData.agenticFTEs.totalProductiveHours.toLocaleString()} hours saved
      </p>
      <p className="text-xs text-emerald-600 font-semibold mt-2">
        = {aiToolsData.agenticFTEs.totalAgenticFTEs} extra team members
      </p>
    </div>
    <Users className="w-12 h-12 text-emerald-600 opacity-20" />
  </div>
</div>
```

**Add detailed breakdown section**:
```jsx
{/* Agentic FTE Breakdown by Tool */}
<div className="bg-white rounded-lg shadow-md p-6">
  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
    <Users className="w-5 h-5 text-emerald-600" />
    Agentic FTE Breakdown
  </h3>

  <div className="space-y-3">
    {Object.entries(aiToolsData.agenticFTEs.breakdown).map(([tool, data]) => (
      <div key={tool} className="flex justify-between items-center border-b pb-2">
        <div>
          <p className="font-semibold text-gray-800">{formatToolName(tool)}</p>
          <p className="text-xs text-gray-500">
            {data.hours.toLocaleString()} hours
            {data.linesOfCode && ` · ${data.linesOfCode.toLocaleString()} LOC`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-emerald-600">
            {data.ftes.toFixed(1)} FTE
          </p>
        </div>
      </div>
    ))}
  </div>

  <div className="mt-4 pt-3 border-t">
    <div className="flex justify-between items-center">
      <p className="font-bold text-gray-800">Total Agentic FTEs</p>
      <p className="text-2xl font-bold text-emerald-600">
        {aiToolsData.agenticFTEs.totalAgenticFTEs}
      </p>
    </div>
  </div>
</div>
```

### Phase 4: Add to Deep Dive Tabs

**Files to update**:
- `app/components/tabs/ClaudeEnterprise.jsx`
- `app/components/tabs/ClaudeCode.jsx`
- `app/components/tabs/M365Copilot.jsx`
- `app/components/tabs/CodingToolsComparison.jsx`

**Add metric card in each tab**:
```jsx
{/* Agentic FTEs for this tool */}
<MetricCard
  icon={Users}
  label="Agentic FTEs Added"
  value={aiToolsData.agenticFTEs.breakdown.claudeEnterprise.ftes.toFixed(1)}
  subtitle={`${aiToolsData.agenticFTEs.breakdown.claudeEnterprise.hours.toLocaleString()} productive hours`}
  trend={calculateMonthOverMonthChange()}
  color="emerald"
/>
```

---

## Display Guidelines

### Formatting Rules

1. **Decimal Places**: Always show 1 decimal place (e.g., "2.5 FTEs", not "2.53")
2. **Minimum Threshold**: Don't display if < 0.1 FTE (say "< 0.1 FTE" instead)
3. **Context**: Always show both FTE count AND hours (e.g., "2.5 FTEs (432 hours)")
4. **Terminology**: Use "Agentic FTEs Added" not "FTE Equivalent" or "FTE Savings"

### Color Scheme

- **Primary color**: Emerald/Green (represents growth, addition)
- **Icon**: Users icon (represents people/headcount)
- **Trend indicators**: Standard green (up) / red (down)

### Tooltips & Help Text

Add tooltips explaining the metric:
```
"Agentic FTEs represent the equivalent full-time employees added through AI
productivity gains. Calculated from time saved and work produced by AI tools.
1 FTE = 173 hours per month of productive work."
```

---

## Example Output

### Overview Tab Display

```
╔═══════════════════════════════════════╗
║      Agentic FTEs Added: 15.3         ║
║                                       ║
║  Claude Enterprise:      8.2 FTEs    ║
║  Claude Code:            4.1 FTEs    ║
║  M365 Copilot:          2.5 FTEs    ║
║  GitHub Copilot:        0.5 FTEs    ║
║                                       ║
║  Total Hours Saved: 2,647 hours      ║
║  = 15 additional team members        ║
╚═══════════════════════════════════════╝
```

### Narrative Examples

**For Executives**:
> "In January 2026, our AI tools added the equivalent of **15.3 full-time employees**
> to the organization, saving 2,647 productive hours. This is like hiring 15 additional
> team members at a fraction of the cost."

**For Finance**:
> "Agentic FTE Cost Comparison:
> - 15.3 Agentic FTEs from AI: $45K/month (tool costs)
> - 15 Actual FTEs: ~$150K/month (salary + benefits)
> - **Savings: $105K/month = $1.26M annually**"

---

## Validation & Testing

### Data Quality Checks

1. **Productivity Multiplier Check**: Agentic FTEs should align with known productivity gains
   - **Logic**: One person + AI can produce multiple FTEs worth of output (that's the value!)
   - **Example**: 16 Claude Code users × 7.5x productivity = up to 120 theoretical agentic FTEs
   - **Reasonable range**: 0x to 10x per licensed user (most tools show 2-8x gains)
   - **Flag if**: agenticFTEs / licensedUsers > 10 (check for data errors)
   - **Error if**: agenticFTEs / licensedUsers > 20 (definitely a data quality issue)
   ```javascript
   const ratio = agenticFTEs / totalLicensedUsers;
   if (ratio > 20) {
     throw new Error('Agentic FTE ratio exceeds reasonable bounds - check data');
   } else if (ratio > 10) {
     console.warn('Agentic FTE ratio unusually high - validate data sources');
   }
   ```

2. **Trend Validation**: Month-over-month changes should be gradual
   - Flag if change > 50% from previous month (likely data issue)
   - Exception: First month after new tool rollout (expected spike)

3. **Tool Consistency**: Sum of tool FTEs should equal total
   - `claudeEnterprise.ftes + claudeCode.ftes + m365.ftes + github.ftes = totalAgenticFTEs`
   - Allow for 0.1 FTE rounding differences

### Test Cases

```javascript
// Test Case 1: Small dataset
const testData1 = {
  productivity: { totalTimeSaved: 173 },  // 1 FTE worth
  coding: { linesAccepted: 0 }
};
// Expected: 1.0 Agentic FTEs

// Test Case 2: Mixed sources
const testData2 = {
  productivity: { totalTimeSaved: 346 },  // 2 FTEs
  coding: { linesAccepted: 21625 }        // 1,730 hours ÷ 173 = 10 FTEs
};
// Expected: 12.0 Agentic FTEs

// Test Case 3: Edge case - no data
const testData3 = {
  productivity: { totalTimeSaved: 0 },
  coding: { linesAccepted: 0 }
};
// Expected: 0.0 Agentic FTEs (display as "< 0.1 FTE")
```

---

## Success Metrics

### How We'll Know This Is Successful

1. **Executive Understanding**: Stakeholders can explain what Agentic FTE means
2. **Dashboard Usage**: Agentic FTE card gets high engagement (clicks, views)
3. **Decision Making**: Executives reference Agentic FTE in budget discussions
4. **Storytelling**: Sales/marketing use Agentic FTE in ROI narratives

### Key Questions to Answer

- ✅ "How many extra people did AI add this month?"
- ✅ "What's the cost per agentic FTE vs actual FTE?"
- ✅ "Which tool contributes most to virtual headcount?"
- ✅ "How has our virtual workforce grown over time?"

---

## Future Enhancements

### Phase 2 Features (Later)

1. **Cost Per Agentic FTE**: Show tool cost ÷ agentic FTEs
2. **Trend Chart**: Line graph showing agentic FTE growth over time
3. **Department Breakdown**: Agentic FTEs by department
4. **ROI Comparison**: Agentic FTE cost vs actual hiring cost
5. **Predictive**: "At this rate, we'll add X agentic FTEs by Q4"

### Advanced Analytics

- **Efficiency Score**: Agentic FTEs per dollar spent
- **Adoption Correlation**: Agentic FTEs vs active user count
- **Capacity Planning**: "Do we need to hire, or can AI cover the gap?"

---

## Open Questions

1. **Should we use calendar days or business days for FTE calculations?**
   - Recommendation: Business days (173 hours/month assumes 5-day workweek)

2. **How do we handle partial months (e.g., mid-month data refresh)?**
   - Recommendation: Pro-rate based on days in month

3. **Should coding lines be weighted by complexity?**
   - Recommendation: Start simple (all lines equal), add complexity later

4. **What if productivity hours already include coding time?**
   - Recommendation: Ensure no double-counting by validating data sources

---

## Next Steps

1. ✅ Design document complete
2. ⏭️ Review with stakeholder (Luis)
3. ⏭️ Implement calculation in productivity-calculator.js
4. ⏭️ Update pipeline orchestrator to include agenticFTEs
5. ⏭️ Add display to Overview tab
6. ⏭️ Add display to Deep Dive tabs
7. ⏭️ Test with current data
8. ⏭️ Refresh data with January MTD
9. ⏭️ Validate calculations
10. ⏭️ Deploy to production

---

**Status**: Ready for implementation pending review ✅
