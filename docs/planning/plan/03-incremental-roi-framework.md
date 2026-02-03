# Incremental ROI Calculation Framework

**Date**: 2025-01-15
**Status**: Planning
**Purpose**: Shift from absolute Claude Enterprise ROI to incremental ROI showing value of switching from existing AI tools

## Executive Summary

This plan outlines the implementation of a dual-ROI framework that calculates the incremental value of switching from GitHub Copilot (for engineers) and M365 Copilot (for other roles) to Claude Enterprise. The system will provide both **data-driven ROI** (from actual usage metrics) and **industry benchmark ROI** (from research studies), displayed side-by-side to validate our calculations.

## Core Concept: Incremental ROI

**Current Approach** (Absolute ROI):
- Calculates total value of Claude Enterprise without considering prior tools
- ROI = Total Claude Value / Claude Cost

**New Approach** (Incremental ROI):
- Calculates the **additional** value gained by switching from existing tools
- ROI = (New Tool Value - Old Tool Value) / (New Tool Cost - Old Tool Cost)

## Two Switching Scenarios

### Scenario 1: GitHub Copilot → Claude Code Premium (Engineers)

**Baseline (GitHub Copilot)**:
- Cost: $19/month
- Hours saved: **CALCULATED FROM DATA** using productivity multiplier
  - Formula: `CLAUDE_CODE_HOURS_SAVED / (productivityMultiplier / 2)`
  - Example: If Claude Code saves 112 hrs and multiplier is 20.3x
  - Then GH Copilot baseline = 112 / (20.3 / 2) ≈ 11 hrs/month

**New State (Claude Code Premium)**:
- Cost: $200/month
- Hours saved: **CALCULATED FROM DATA** using productivity multiplier
  - Formula: `BASELINE_HOURS_SAVED × (productivityMultiplier / 2)`
  - Example: 11 hrs × (20.3 / 2) ≈ 112 hrs/month
  - Where productivityMultiplier = claudeCodeLinesPerUser / githubCopilotLinesPerUser

**Incremental ROI**:
- Incremental cost: $200 - $19 = $181/month
- Incremental hours: 112 - 11 = 101 hrs/month
- Incremental value: 101 hrs × $72/hr = $7,272/month
- **ROI = $7,272 / $181 = 40.2x**

### Scenario 2: M365 Copilot → Claude Enterprise Standard (Other Roles)

**Baseline (M365 Copilot)**:
- Cost: $30/month (configurable)
- Hours saved: **CALCULATED FROM DATA** using message/prompt ratio OR industry benchmark
  - **Data-driven approach**: Calculate from prompts/messages per user
    - M365 prompts/user/month (from M365 data)
    - Claude messages/user/month (from Claude data)
    - Productivity ratio = Claude messages / M365 prompts
    - Hours saved = baseline_hours × (productivity_ratio - 1)
    - Assumption: 1 M365 prompt = 1 Claude message (no complexity adjustment)
  - **Industry benchmark approach**: Use researched hours saved by role

**New State (Claude Enterprise Standard)**:
- Cost: $40/month
- Hours saved: **CALCULATED FROM DATA** based on actual Claude usage by role/department

**Incremental ROI**:
- Incremental cost: $40 - $30 = $10/month
- Incremental hours: [calculated] - baseline
- Incremental value: incremental hours × $77/hr (or role-specific rate)
- **ROI = incremental value / $10**

## Data-Driven vs Industry Benchmark ROI

### Dual ROI Calculation

For each switching scenario, we calculate **TWO ROI values**:

1. **Data-Driven ROI** ("Current Use")
   - Based on actual productivity metrics from our usage data
   - GitHub Copilot baseline derived from Claude Code multiplier
   - M365 Copilot baseline derived from message/prompt ratios
   - Shows what OUR data tells us

2. **Industry Benchmark ROI**
   - Based on published research studies (Forrester, Gartner, Anthropic, Microsoft, etc.)
   - Research refreshed every 30 days (cached)
   - Shows what INDUSTRY data tells us

### Side-by-Side Presentation

**Example Display**:
```
GitHub Copilot → Claude Code Premium ROI

Data-Driven: 40.2x | Industry Benchmark: 38.6x (+1.6x / +4.2%)
```

**Benefits**:
- Validates our calculations against industry standards
- Shows confidence when our ROI exceeds industry benchmarks
- Identifies gaps when our ROI underperforms
- Provides transparency and credibility

## Key Design Principles

### 1. NO HARDCODED VALUES
**CRITICAL**: All productivity metrics must be calculated from actual data:
- ✅ Productivity multiplier: `claudeCodeLinesPerUser / githubCopilotLinesPerUser` (from data)
- ✅ Claude Code hours saved: `BASELINE_HOURS_SAVED × (multiplier / 2)` (from data)
- ✅ GitHub Copilot baseline: `CLAUDE_CODE_HOURS_SAVED / (multiplier / 2)` (from data)
- ❌ Hardcoded constants like "112 hours" or "20.3x multiplier"

### 2. Configurable Constants
All pricing and baseline assumptions must be configurable in `/data/roi_config.json`:
- Tool pricing (Claude Premium/Standard, GH Copilot, M365 Copilot)
- Engineering salary/hourly rate
- General hourly rate
- Baseline hours assumptions (if needed)

### 3. Deterministic Calculations
Same input data must always produce same output:
- No random elements
- Clear calculation formulas
- Reproducible results
- Transparent methodology

### 4. Industry-Grounded
Use AI-powered research to validate assumptions:
- Research actual productivity studies
- Weight by study quality and sample size
- Calculate confidence intervals
- Show when confidence is low (warning flags in UI)

## User Segmentation Logic

### Engineers with GitHub Copilot
```javascript
{
  baseline: calculateGHCopilotBaseline(user),  // FROM DATA
  currentState: calculateClaudeCodeValue(user),  // FROM DATA
  benchmarkBaseline: industryBenchmarks.githubCopilot.hoursSavedPerMonth,  // FROM RESEARCH
  benchmarkCurrentState: calculateClaudeCodeValue(user),
  type: 'gh_to_premium',
  incrementalCost: 181,
  incrementalHours: currentState - baseline
}
```

### Non-Engineers with M365 Copilot
```javascript
{
  baseline: calculateM365Baseline(user),  // FROM DATA or RESEARCH
  currentState: calculateClaudeEnterpriseValue(user),  // FROM DATA
  benchmarkBaseline: industryBenchmarks.m365Copilot[user.role],  // FROM RESEARCH
  benchmarkCurrentState: calculateClaudeEnterpriseValue(user),
  type: 'm365_to_standard',
  incrementalCost: 10,
  incrementalHours: currentState - baseline
}
```

### Users Without Prior AI Tools
```javascript
{
  baseline: 0,  // No prior tool
  currentState: calculateClaudeEnterpriseValue(user),  // FROM DATA
  benchmarkBaseline: industryBenchmarks[getRelevantBenchmark(user)],  // FROM RESEARCH
  benchmarkCurrentState: calculateClaudeEnterpriseValue(user),
  type: 'new_to_claude',
  incrementalCost: fullClaudeCost,
  incrementalHours: currentState
}
```

## Industry Research Framework

### Research Sources
- Forrester Research
- Gartner
- Anthropic published studies
- Microsoft (M365 Copilot studies)
- OpenAI (GitHub Copilot studies)
- Google (Workspace AI studies)

### Research Methodology

**Collection**:
1. Use Claude API to search for productivity studies
2. Extract hours saved, sample sizes, methodologies
3. Categorize by tool, role, and work type
4. Store raw findings with source citations

**Validation**:
1. Filter for statistical significance (p < 0.05, n > 100)
2. Check for peer review or independent validation
3. Flag vendor-funded studies for bias awareness

**Weighting Algorithm**:
```javascript
weight = (sampleSize / 1000) × recencyFactor × credibilityFactor

recencyFactor = exp(-age_in_years / 2)  // Exponential decay, half-life 2 years
credibilityFactor = {
  Forrester/Gartner: 1.2,
  Academic: 1.1,
  Vendor studies: 0.8,
  Unknown: 0.5
}
```

**Aggregation**:
1. Calculate weighted mean
2. Calculate median (outlier-resistant)
3. Calculate coefficient of variation (CV)
4. Use median if CV > 0.5 (high variance)
5. Use weighted mean if CV < 0.5 (low variance)
6. Calculate 95% confidence interval

**Output**:
```json
{
  "tool": "githubCopilot",
  "role": "software_engineer",
  "hoursSavedPerMonth": 15.2,
  "confidenceInterval": [12.1, 18.3],
  "confidenceLevel": "high",
  "coefficientOfVariation": 0.28,
  "aggregationMethod": "weighted_mean",
  "studyCount": 8,
  "totalSampleSize": 4200,
  "sources": [
    {
      "title": "GitHub Copilot Productivity Study",
      "author": "Forrester",
      "year": 2024,
      "sampleSize": 1200,
      "findingHours": 14.5,
      "weight": 0.25
    }
  ],
  "lastUpdated": "2025-01-15T00:00:00Z"
}
```

### Research Caching
- Run research on first data refresh OR if cached data > 30 days old
- Store in `/data/roi_config.json` under `industryBenchmarks`
- Include cache expiry timestamp
- Allow manual refresh via script parameter

### Low-Confidence Handling
When research returns low confidence:
- Use the data anyway (don't block on it)
- Add `lowConfidence: true` flag to benchmark data
- Display warning indicator in UI
- Show confidence interval range

## Configuration Structure

### `/data/roi_config.json`

```json
{
  "pricing": {
    "claudeCodePremium": 200,
    "claudeEnterpriseStandard": 40,
    "githubCopilot": 19,
    "m365Copilot": 30
  },
  "engineeringMetrics": {
    "annualSalary": 150000,
    "hoursPerYear": 2080,
    "hourlyRate": 72
  },
  "generalMetrics": {
    "avgHourlyRate": 77
  },
  "assumptions": {
    "m365PromptEquivalency": 1,
    "productivityMultiplierConservativeFactor": 2,
    "baselineHoursSaved": 11
  },
  "industryBenchmarks": {
    "cacheExpiry": "2025-02-14T00:00:00Z",
    "lastUpdated": "2025-01-15T10:30:00Z",
    "githubCopilot": {
      "software_engineer": {
        "hoursSavedPerMonth": 15.2,
        "confidenceInterval": [12.1, 18.3],
        "confidenceLevel": "high",
        "lowConfidence": false,
        "coefficientOfVariation": 0.28,
        "studyCount": 8,
        "sources": []
      }
    },
    "m365Copilot": {
      "software_engineer": {
        "hoursSavedPerMonth": 8.5,
        "confidenceInterval": [6.2, 10.8],
        "confidenceLevel": "medium",
        "lowConfidence": false,
        "coefficientOfVariation": 0.42,
        "studyCount": 5,
        "sources": []
      },
      "sales": {
        "hoursSavedPerMonth": 6.3,
        "confidenceLevel": "medium",
        "sources": []
      },
      "marketing": {
        "hoursSavedPerMonth": 5.8,
        "confidenceLevel": "medium",
        "sources": []
      },
      "customer_success": {
        "hoursSavedPerMonth": 7.1,
        "confidenceLevel": "medium",
        "sources": []
      },
      "default": {
        "hoursSavedPerMonth": 6.5,
        "confidenceLevel": "low",
        "lowConfidence": true,
        "sources": []
      }
    }
  }
}
```

## Implementation Phases

### Phase 1: Configuration & Research Script ✅
- [x] Create `/data/roi_config.json` with pricing and benchmark structure
- [ ] Create `/scripts/research-industry-benchmarks.js`
  - Claude API integration for research
  - Statistical aggregation algorithm
  - 30-day caching logic
  - Role-specific benchmark output

### Phase 2: Parser Updates for Incremental ROI
- [ ] Update `/scripts/parse-copilot-data.js`:
  - Load roi_config.json
  - Calculate GitHub Copilot baseline FROM productivity multiplier
  - Calculate M365 Copilot baseline FROM message/prompt ratios
  - Calculate incremental costs, hours, values, ROI
  - Calculate BOTH data-driven and industry benchmark ROI
  - Output dual ROI values to ai-tools-data.json

### Phase 3: Data Schema Updates
- [ ] Update `/app/ai-tools-data.json` schema:
  - Add `incrementalROI` section
  - Include both `dataDriven` and `industryBenchmark` ROI values
  - Include `roiDelta` (difference between approaches)
  - Include confidence flags and warnings

### Phase 4: UI Updates
- [ ] Update `/app/page.jsx`:
  - Display side-by-side ROI values
  - Show delta percentage
  - Display warning indicators for low-confidence benchmarks
  - Remove hardcoded calculations (use parser values only)

### Phase 5: Refresh Process Integration
- [ ] Update `/scripts/refresh-data.sh`:
  - Add research step (with cache check)
  - Ensure correct execution order
  - Add error handling for research failures

### Phase 6: Testing & Validation
- [ ] Test full refresh with sample data
- [ ] Verify cache behavior (30-day expiry)
- [ ] Validate ROI calculations against manual calculations
- [ ] Check UI rendering of dual ROI values

## Calculation Examples

### Example 1: Engineer with GitHub Copilot

**Input Data**:
- GitHub Copilot: 1,852 lines/user
- Claude Code: 37,585 lines/user
- Productivity multiplier: 37,585 / 1,852 = 20.3x
- Engineering hourly rate: $72/hr
- Baseline hours: 11 hrs/month

**Calculated Values** (FROM DATA):
- Claude Code hours saved: 11 × (20.3 / 2) = 112 hrs/month
- GitHub Copilot baseline: 112 / (20.3 / 2) = 11 hrs/month

**Incremental ROI (Data-Driven)**:
- Incremental hours: 112 - 11 = 101 hrs
- Incremental value: 101 × $72 = $7,272/month
- Incremental cost: $200 - $19 = $181/month
- **ROI: $7,272 / $181 = 40.2x**

**Incremental ROI (Industry Benchmark)**:
- Industry GH baseline: 15.2 hrs/month (from research)
- Incremental hours: 112 - 15.2 = 96.8 hrs
- Incremental value: 96.8 × $72 = $6,970/month
- Incremental cost: $181/month
- **ROI: $6,970 / $181 = 38.5x**

**Delta**: +1.7x (4.4% higher than industry benchmark)

### Example 2: Sales Rep with M365 Copilot

**Input Data**:
- M365 prompts: 120/month (from data)
- Claude messages: 360/month (from data)
- Productivity ratio: 360 / 120 = 3.0x
- Sales hourly rate: $77/hr
- M365 baseline (data): 5 hrs/month (conservative)

**Calculated Values** (FROM DATA):
- Claude Enterprise hours saved: 5 × (3.0 - 1) = 10 hrs/month additional
- Total Claude hours: 5 + 10 = 15 hrs/month
- M365 baseline: 5 hrs/month

**Incremental ROI (Data-Driven)**:
- Incremental hours: 15 - 5 = 10 hrs
- Incremental value: 10 × $77 = $770/month
- Incremental cost: $40 - $30 = $10/month
- **ROI: $770 / $10 = 77x**

**Incremental ROI (Industry Benchmark)**:
- Industry M365 baseline (sales): 6.3 hrs/month (from research)
- Incremental hours: 15 - 6.3 = 8.7 hrs
- Incremental value: 8.7 × $77 = $670/month
- Incremental cost: $10/month
- **ROI: $670 / $10 = 67x**

**Delta**: +10x (14.9% higher than industry benchmark)

## Success Criteria

1. **Data Integrity**: All values calculated from actual usage data, no hardcoded metrics
2. **Determinism**: Same input data always produces same output
3. **Industry Validation**: Benchmarks successfully researched and aggregated
4. **Cache Performance**: Research only runs when needed (30-day expiry)
5. **UI Clarity**: Side-by-side ROI presentation is clear and actionable
6. **Confidence Transparency**: Low-confidence warnings displayed when appropriate

## Future Enhancements

1. **Role-Specific Refinement**: Add more granular role categories beyond engineer/sales/marketing
2. **Time-Series Analysis**: Track how ROI changes over time as usage patterns evolve
3. **Scenario Modeling**: Allow executives to model "what-if" scenarios (e.g., "What if we move 50% of users?")
4. **M365 Copilot ROI**: Extend framework to calculate M365 Copilot's own ROI (currently only used as baseline)
5. **Custom Benchmarks**: Allow manual entry of custom benchmarks from company-specific studies

## References

- ADR-001: AI Tools Dashboard Architecture
- `.claude/CALCULATIONS.md`: Original calculation methodology
- `/docs/DATA_REFRESH.md`: Data refresh process documentation
