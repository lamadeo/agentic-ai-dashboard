# Phase 3: Aggregator Module Extraction Plan

**Created**: January 10, 2026
**Branch**: `feature/modularize-data-pipeline-phase3`
**Status**: In Progress

## Overview

Extract tab data aggregator modules from `parse-copilot-data.js` (currently 3,543 lines after Phase 2).

## Target Aggregator Modules

### 1. **overview-aggregator.js** (~40 lines)
**Purpose**: Aggregate top-level overview metrics

**Functions to Extract**:
- `aggregateOverviewData(options)` - Main aggregator function
  - Total active users
  - Overall adoption rate
  - User growth MoM
  - Top departments
  - Recent activity (7 days, 30 days)

**Input**: License config, user counts, monthly/weekly trends
**Output**: `{ totalActiveUsers, overallAdoptionRate, userGrowth, topDepartments, recentActivity }`

**Lines**: ~3097-3125 (28 lines of aggregation logic)

---

### 2. **adoption-aggregator.js** (~50 lines)
**Purpose**: Aggregate activation and seat utilization metrics

**Functions to Extract**:
- `aggregateAdoptionData(options)` - Main aggregator function
  - Licensed vs active users
  - Activation rate
  - Seat utilization (Premium vs Standard)
  - Daily active users trend
  - Activation trend by month

**Input**: License config, active user counts, weekly/monthly data
**Output**: `{ licensedUsers, activatedUsers, activationRate, seatUtilization, activationTrend }`

**Lines**: ~3127-3171 (44 lines of aggregation logic)

---

### 3. **productivity-aggregator.js** (~85 lines)
**Purpose**: Aggregate productivity metrics and time savings

**Functions to Extract**:
- `aggregateProductivityData(options)` - Main aggregator function
  - Average time savings per user
  - Total time saved (all tools)
  - Time savings by tool (Claude Enterprise, M365, GitHub Copilot)
  - ROI examples
  - Top features

**Input**: Time savings constants, active users by tool, feature usage
**Output**: `{ avgTimeSavingsPerUser, totalTimeSaved, timeSavingsByTool, roiExamples, topFeatures }`

**Lines**: ~3173-3254 (81 lines of aggregation logic)

---

### 4. **code-aggregator.js** (~95 lines)
**Purpose**: Aggregate Claude Code leaderboard and usage metrics

**Functions to Extract**:
- `aggregateCodeData(options)` - Main aggregator function
  - Build leaderboard from all Claude Code data
  - Rank users by lines generated
  - Department breakdown
  - Weekly active users
  - User growth trend

**Input**: All Claude Code data, org email map, monthly trends
**Output**: `{ leaderboard, weeklyActiveUsers, userGrowthTrend, departmentBreakdown }`

**Lines**: ~3257-3350 (93 lines of aggregation logic)

---

### 5. **enablement-aggregator.js** (~20 lines)
**Purpose**: Aggregate enablement and expansion data

**Functions to Extract**:
- `aggregateEnablementData(options)` - Main aggregator function
  - Expansion priorities
  - Low adoption departments
  - Potential users

**Input**: M365 monthly, Claude Enterprise monthly, org email map
**Output**: `{ expansionPriorities }`

**Lines**: ~3352-3370 (18 lines of aggregation logic)

---

## Extraction Pattern (Consistent with Phase 1 & 2)

```javascript
/**
 * [Aggregator Name]
 *
 * Aggregates [description] for dashboard tab
 *
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Aggregated tab data
 */
async function aggregate[TabName]Data(options = {}) {
  const { /* params */, verbose = false } = options;

  if (verbose) {
    console.log(`\n📊 Aggregating ${tabName} data...\n`);
  }

  // Aggregation logic

  if (verbose) {
    console.log(`✅ ${tabName} data aggregated successfully\n`);
  }

  return {
    // Tab-specific data
    ...aggregatedData,

    // Metadata
    metadata: {
      aggregatedAt: new Date().toISOString()
    }
  };
}

module.exports = { aggregate[TabName]Data };
```

## Integration Strategy

1. **Extract functions** into aggregator modules
2. **Import in main script**:
   ```javascript
   const { aggregateOverviewData } = require('./modules/aggregators/overview-aggregator');
   ```
3. **Replace inline aggregation** with aggregator calls
4. **Maintain backward compatibility** - variable names unchanged
5. **Verify output** - diff ai-tools-data.json before/after

## Success Criteria

- ✅ All 5 aggregator modules created (~290 lines extracted)
- ✅ Main script reduced to ~3,250 lines (~8% reduction from Phase 2)
- ✅ Full verification test passes
- ✅ Dashboard data JSON identical to pre-Phase 3
- ✅ All 27 AI insights generated correctly
- ✅ Preview deployment working

## Verification Steps

1. Run `node scripts/parse-copilot-data.js`
2. Check console output for errors
3. Verify `app/ai-tools-data.json` generated
4. Compare key metrics (users, departments, ROI values)
5. Test dashboard in preview deployment

## Next Steps After Phase 3

**Phase 4**: Create pipeline orchestrator
**Phase 5**: Final cleanup, testing, documentation

## Notes

- Aggregators are simpler than processors (mostly data reshaping)
- Focus on extracting pure aggregation logic
- Keep console logging in aggregators for debugging
- Maintain consistent parameter naming across aggregators
