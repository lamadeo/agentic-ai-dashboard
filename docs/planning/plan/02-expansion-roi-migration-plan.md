# Expansion ROI Tab Migration Plan

**Status**: Not Started
**Priority**: Medium
**Complexity**: High
**Estimated Effort**: 4-6 hours

## Overview

The Expansion ROI tab currently uses hardcoded data for department expansion opportunities. This plan outlines the work needed to make it fully data-driven.

## Current State

The tab has extensive hardcoded data in `app/page.jsx` (lines 177-315):
- `orgMetrics` object with static employee counts
- `expansionOpportunities` array with 10 departments containing:
  - Total employees per department
  - Current licensed users
  - Standard vs Premium license gaps
  - Monthly/annual costs and ROI calculations
  - License allocation rules (Engineering 100% Premium, others 90% Standard + 10% Premium)

## Migration Requirements

### 1. Calculate Department Employee Counts

**File**: `scripts/parse-hierarchy.js`

Add function to traverse org hierarchy and count total employees per department:

```javascript
/**
 * Calculate total employee count by department from org hierarchy
 * @returns {Map<string, number>} Map of department name to employee count
 */
function getDepartmentHeadcounts(hierarchyPath) {
  const hierarchyData = JSON.parse(fs.readFileSync(hierarchyPath, 'utf8'));
  const deptCounts = new Map();

  // Traverse hierarchy and count employees per department
  // Include CEO in Executive
  // Count all employees under each department head

  return deptCounts;
}
```

Export this function from `parse-hierarchy.js`.

### 2. Track License Types (Premium vs Standard)

**Challenge**: Claude Enterprise ZIP exports don't currently include license type information.

**Options**:
- **A. Manual configuration**: Add license type mapping to `LICENSE_CONFIGURATION` in `parse-copilot-data.js`
- **B. Infer from usage**: Users with Claude Code are Premium, others are Standard
- **C. External data source**: Request license type data from Anthropic/admin panel

**Recommended**: Start with Option A (manual config) as it's most accurate and maintainable.

```javascript
// In parse-copilot-data.js
const PREMIUM_USERS = [
  'user1@techco.com',
  'user2@techco.com',
  // ... list all Premium license holders
];

function getLicenseType(email) {
  return PREMIUM_USERS.includes(email) ? 'premium' : 'standard';
}
```

### 3. Expansion Calculation Function

**File**: `scripts/parse-copilot-data.js`

Add function to calculate expansion opportunities:

```javascript
/**
 * Calculate expansion opportunities by department
 * Business rules:
 * - Engineering: 100% Premium (Claude Code)
 * - Other departments: 90% Standard + 10% Premium (rounded up)
 *
 * @param {Map} deptHeadcounts - Total employees per department
 * @param {Map} currentAdoption - Current licensed users per department with license types
 * @param {Object} pricing - License pricing (Premium: $200/mo, Standard: $40/mo)
 * @param {Object} valueMetrics - Hourly rates for ROI calculation
 * @returns {Array} Expansion opportunities by department with costs, value, ROI
 */
function calculateExpansionOpportunities(deptHeadcounts, currentAdoption, pricing, valueMetrics) {
  const opportunities = [];

  for (const [dept, totalEmployees] of deptHeadcounts) {
    const current = currentAdoption.get(dept) || { users: 0, premium: 0, standard: 0 };

    // Determine target license allocation
    const isEngineering = dept === 'Engineering' || dept === 'AI & Data';
    let targetPremium, targetStandard;

    if (isEngineering) {
      targetPremium = totalEmployees;
      targetStandard = 0;
    } else {
      targetStandard = Math.floor(totalEmployees * 0.9);
      targetPremium = Math.ceil(totalEmployees * 0.1);
    }

    // Calculate gaps
    const premiumGap = Math.max(0, targetPremium - current.premium);
    const standardGap = Math.max(0, targetStandard - current.standard);

    // Calculate costs
    const upgradesToPremium = Math.min(current.standard, premiumGap);
    const newPremium = premiumGap - upgradesToPremium;
    const newStandard = standardGap;

    const monthlyCost =
      (upgradesToPremium * (pricing.premium - pricing.standard)) +
      (newPremium * pricing.premium) +
      (newStandard * pricing.standard);

    // Calculate value (hours saved * hourly rate)
    const newUsers = premiumGap + standardGap;
    const monthlyHoursSaved = newUsers * valueMetrics.hoursPerUserPerMonth;
    const monthlyValue = monthlyHoursSaved * valueMetrics.avgHourlyRate;

    const netBenefit = monthlyValue - monthlyCost;
    const roi = monthlyCost > 0 ? monthlyValue / monthlyCost : 0;

    opportunities.push({
      department: dept,
      totalEmployees,
      currentUsers: current.users,
      currentPremium: current.premium,
      currentStandard: current.standard,
      targetPremium,
      targetStandard,
      standardGap,
      premiumGap,
      upgradesToPremium,
      newPremium,
      newStandard,
      totalAdditionalCost: monthlyCost,
      monthlyOpportunityCost: monthlyValue,
      netBenefit,
      roi
    });
  }

  return opportunities.sort((a, b) => b.roi - a.roi); // Sort by ROI descending
}
```

### 4. Add to Dashboard Data

**File**: `scripts/parse-copilot-data.js`

In the main dashboard data generation:

```javascript
// Calculate department headcounts from org hierarchy
const { getDepartmentHeadcounts } = require('./parse-hierarchy');
const deptHeadcounts = getDepartmentHeadcounts(orgHierarchyPath);

// Calculate current adoption by department with license types
const currentAdoption = calculateCurrentAdoption(
  allConversations,
  allCodeActivity,
  orgEmailMap,
  PREMIUM_USERS
);

// Calculate expansion opportunities
const expansionOpportunities = calculateExpansionOpportunities(
  deptHeadcounts,
  currentAdoption,
  { premium: 200, standard: 40 },
  { hoursPerUserPerMonth: 11, avgHourlyRate: 77 }
);

// Add to dashboard data
dashboardData.expansion.opportunities = expansionOpportunities;
dashboardData.expansion.orgMetrics = {
  totalEmployees: Array.from(deptHeadcounts.values()).reduce((a, b) => a + b, 0),
  licensedSeats: /* calculate from current adoption */,
  activeUsers: /* calculate from conversations + code activity */,
  penetrationRate: /* calculate percentage */,
  unlicensedEmployees: /* total - licensed */
};
```

### 5. Update UI to Use Generated Data

**File**: `app/page.jsx`

Replace hardcoded arrays with data from `aiToolsData.expansion`:

```javascript
// Remove lines 177-315 (orgMetrics and expansionOpportunities)

// Use generated data instead:
const orgMetrics = aiToolsData.expansion.orgMetrics;
const expansionOpportunities = aiToolsData.expansion.opportunities;
```

## Implementation Steps

### Phase 1: Data Collection (1-2 hours)
1. Add `getDepartmentHeadcounts()` to `parse-hierarchy.js`
2. Test department headcount calculation
3. Create `PREMIUM_USERS` configuration in `parse-copilot-data.js`
4. Update current adoption calculation to track license types

### Phase 2: Calculation Logic (2-3 hours)
1. Implement `calculateExpansionOpportunities()` function
2. Add business rules for license allocation
3. Calculate costs, value, and ROI
4. Add unit tests for calculation logic

### Phase 3: Integration (1 hour)
1. Add expansion data to dashboard generation
2. Update UI to use generated data
3. Test all expansion tab visualizations
4. Verify calculations match current hardcoded values

### Phase 4: Validation (30 min)
1. Compare generated vs hardcoded numbers
2. Verify ROI rankings
3. Test with different scenarios
4. Update documentation

## Data Dependencies

### Required from Org Hierarchy:
- Total employee count per department
- Department names (must match dashboard department names)

### Required from Claude Enterprise Data:
- Current licensed users per department
- License type (Premium vs Standard) - **needs manual config**

### Required from Claude Code Data:
- Active Claude Code users (implies Premium licenses)

### Business Rules to Maintain:
- Premium: $200/month, Standard: $40/month
- Engineering departments: 100% Premium (Claude Code)
- Other departments: 90% Standard + 10% Premium (rounded up)
- Estimated 11 hours saved per user per month
- Hourly rate range: $44-$110, average $77

## Testing Checklist

- [ ] Department headcounts match expected values
- [ ] Current adoption numbers are accurate
- [ ] License type classification is correct
- [ ] Target allocation follows business rules
- [ ] Gap calculations are accurate (Premium gap, Standard gap, upgrades)
- [ ] Cost calculations include upgrade costs correctly
- [ ] ROI calculations match expected formulas
- [ ] Departments sorted by ROI descending
- [ ] Totals in table footer are correct
- [ ] All expansion tab charts render correctly
- [ ] Phased rollout numbers update correctly

## Risks & Considerations

1. **License Type Data**: No automated way to determine Premium vs Standard from exports
   - Mitigation: Manual configuration list, updated when licenses change

2. **Department Name Consistency**: Must match between org chart and usage data
   - Mitigation: Use existing `getDepartmentInfo()` function consistently

3. **Business Rules Changes**: License allocation strategy may change
   - Mitigation: Make rules configurable constants

4. **ROI Formula Accuracy**: Time savings estimates are approximate
   - Mitigation: Use same formulas as current hardcoded version, iterate later

## Future Enhancements

1. **Dynamic License Type Detection**: Integrate with admin API if available
2. **Configurable Business Rules**: Move to JSON config file for easier updates
3. **Scenario Planning**: Allow "what-if" analysis with different allocation strategies
4. **Historical Tracking**: Track expansion progress over time
5. **AI-Powered Recommendations**: Use Claude to suggest optimal expansion strategies

## Success Criteria

✅ All expansion opportunity data is calculated from source data
✅ No hardcoded employee counts or department lists
✅ UI displays accurate, up-to-date expansion analysis
✅ Regenerating data with `npm run parse` updates expansion tab
✅ Calculations can be independently verified
✅ Documentation is updated with new data flow
