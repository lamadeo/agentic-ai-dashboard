# Phase 2: Processor Module Extraction Plan

**Created**: January 10, 2026
**Branch**: `feature/modularize-data-pipeline-phase2`
**Status**: In Progress

## Overview

Extract business logic processor modules from `parse-copilot-data.js` (currently 3,920 lines after Phase 1).

## Target Processor Modules

### 1. **premium-allocation-processor.js** (~150 lines)
**Purpose**: Behavioral scoring and Premium/Standard seat allocation recommendations

**Functions to Extract**:
- `calculatePremiumScore(userActivity)` (line 93)
  - Scores users 0-115 based on: code writing, engagement, artifacts, file uploads, M365 usage
- `getDepartmentPremiumBaseline(department)` (line 173)
  - Department-specific baseline percentages (10%-100%)
- `recommendLicenseAllocation(department, userActivities, totalEmployees)` (line 223)
  - Hybrid allocation: behavioral scoring + department baselines

**Input**: User activity data from ingestors
**Output**: `{ recommendedPremium, recommendedStandard, powerUsers[] }`

### 2. **productivity-calculator.js** (~100 lines)
**Purpose**: Calculate productivity multipliers and value metrics

**Functions to Extract**:
- Lines productivity comparison (GitHub Copilot vs Claude Code)
- Hours saved calculations per user/department
- Productivity multiplier calculations (14.1x observed)
- Value per seat calculations

**Input**: Code generation data (GitHub Copilot, Claude Code)
**Output**: `{ multiplier, hoursPerUser, valuePerSeat, comparisons }`

### 3. **roi-calculator.js** (~200 lines)
**Purpose**: ROI calculations for current state and expansion scenarios

**Functions to Extract**:
- `calculateGitHubToClaudeCodeIncrementalROI()` (line 2171)
- `calculateM365ToClaudeEnterpriseIncrementalROI(m365MonthlyData)` (line 2398)
- Current state ROI (costs vs value)
- Expansion ROI projections
- Payback period calculations

**Input**: License data, usage data, pricing config, ROI config
**Output**: `{ currentStateROI, expansionROI, paybackMonths, netBenefit }`

### 4. **expansion-analyzer.js** (~250 lines)
**Purpose**: Expansion opportunity analysis and prioritization

**Functions to Extract**:
- `calculateExpansionOpportunities(deptHeadcounts, deptUserActivities, currentAdoption, pricing, getDepartmentValueMetrics)` (line 310)
- `calculateExpansionPriorities(m365Monthly, claudeEnterpriseMonthly, orgEmailMap)` (line 3410)
- Department-level expansion recommendations
- Priority ranking and phased rollout plans

**Input**: Org metrics, current adoption, user activities, dept headcounts
**Output**: `{ opportunities[], priorities[], rolloutPhases[] }`

### 5. **adoption-scorer.js** (~150 lines)
**Purpose**: User activity scoring, adoption metrics, engagement analysis

**Functions to Extract**:
- `calculateMoMGrowth(monthlyData, metric)` (line 3330)
- `calculateTopDepartments(m365Monthly, claudeEnterpriseMonthly)` (line 3339)
- `calculateRecentActivity(weeklyData, days)` (line 3388)
- Adoption rate calculations
- Engagement scoring (power users, at-risk users)
- Growth trend analysis

**Input**: User activity data, monthly/weekly trends
**Output**: `{ adoptionRate, powerUsers[], atRiskUsers[], growthTrends }`

## Extraction Pattern (Consistent with Phase 1)

```javascript
/**
 * [Module Name] - [Purpose]
 *
 * [Description]
 *
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Processed results
 */
async function process[Feature](options = {}) {
  const { /* params */, verbose = true } = options;

  try {
    // Processing logic

    return {
      // Processed data
      results: {},

      // Metrics
      metrics: {},

      // Metadata
      metadata: {
        processedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error(`Error in ${moduleName}:`, error.message);
    throw error;
  }
}

module.exports = { process[Feature] };
```

## Integration Strategy

1. **Extract functions** into processor modules
2. **Import in main script**:
   ```javascript
   const { processPremiumAllocation } = require('./modules/processors/premium-allocation-processor');
   ```
3. **Replace inline logic** with processor calls
4. **Maintain backward compatibility** - variable names unchanged
5. **Verify output** - diff ai-tools-data.json before/after

## Success Criteria

- ✅ All 5 processor modules created (~850 lines extracted)
- ✅ Main script reduced to ~3,070 lines (~22% total reduction from start)
- ✅ Full verification test passes
- ✅ Dashboard data JSON identical to pre-modularization
- ✅ All 27 AI insights generated correctly
- ✅ Preview deployment working

## Verification Steps

1. Run `node scripts/parse-copilot-data.js`
2. Check console output for errors
3. Verify `app/ai-tools-data.json` generated
4. Compare key metrics (users, departments, ROI values)
5. Test dashboard in preview deployment

## Next Steps After Phase 2

**Phase 3**: Extract aggregator modules (tab data generators)
**Phase 4**: Create pipeline orchestrator
**Phase 5**: Final cleanup, testing, documentation
