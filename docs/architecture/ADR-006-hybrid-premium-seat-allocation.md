# ADR-006: Hybrid Premium Seat Allocation Algorithm

**Status**: Implemented
**Date**: January 7, 2026 (PR #21)
**Author:** Luis Amadeo, Chief Agentic Officer, TechCo Inc
**Architect:** Luis Amadeo, Chief Agentic Officer, TechCo Inc
**Implementation**: `/scripts/parse-copilot-data.js` (lines 800-950)

---

## Context and Problem Statement

TechCo Inc needs to allocate Claude Enterprise Premium licenses across departments to maximize ROI. Premium licenses ($200/mo) provide Claude Code access (essential for engineering) and higher usage limits. Standard licenses ($40/mo) provide Claude Enterprise chat only.

**Key Questions:**
1. Who SHOULD get Premium licenses to maximize business value?
2. How do we balance actual usage patterns vs role complexity?
3. How do we ensure Engineering gets 100% Premium (Claude Code requirement)?
4. How do we avoid over-allocating Premium to low-usage users?
5. How do we identify power users in non-Engineering departments?

**Current State** (Jan 2026):
- 87 total Claude Enterprise licenses
- 13 Premium ($200/mo = $2,600/mo)
- 74 Standard ($40/mo = $2,960/mo)
- **Total cost**: $5,560/mo ($66,720/year)

**Target State** (Phase 2-4):
- 192 total licenses
- 85 Premium (77 Engineering + 8 power users)
- 107 Standard
- **Target cost**: $21,280/mo ($255,360/year)

---

## Decision Drivers

1. **Engineering Requirement**: 100% of engineers need Premium (only way to access Claude Code enterprise)
2. **Usage Patterns**: Actual AI usage should influence allocation
3. **Role Complexity**: Job function drives AI needs (Finance, Product, PS higher than Support)
4. **Cost Efficiency**: Don't over-allocate Premium to low-usage users
5. **Business Value**: Maximize ROI by prioritizing high-impact roles
6. **Fairness**: Transparent, repeatable allocation methodology

---

## Considered Options

### Option A: Pure Behavioral Scoring (Usage-Based)
**Description**: Allocate Premium based purely on usage metrics (conversations, artifacts, code writing, M365 intensity)

**Scoring Formula**:
```javascript
score = 0;
if (claudeCodeLines > 0) score += 30;
if (conversations >= 100) score += 30;
else if (conversations >= 50) score += 20;
if (artifacts >= 20) score += 25;
if (fileUploads > 50) score += 15;
if (m365PromptsPerDay >= 10) score += 10;
if (activeDays >= 20) score += 5;
// Max score: 115
```

**Threshold**: Users with score ≥ 70 get Premium

**Pros:**
- ✅ Data-driven: Based on actual usage
- ✅ Objective: No subjective judgment
- ✅ Identifies power users: High engagement = Premium
- ✅ Rewards adoption: Users who use tools get better tools

**Cons:**
- ❌ **Misses new hires**: Haven't built usage history yet
- ❌ **Misses role complexity**: Junior engineer (low usage) vs Senior Finance (high need)
- ❌ **Penalizes slow adopters**: Late adopters with high potential not recognized
- ❌ **Seasonal variation**: Project-based usage fluctuates
- ❌ **Engineering not 100%**: Some engineers below threshold (unacceptable)

**Example Failure**:
- New Senior Finance Analyst joins: 0 usage → 0 score → Standard license
- But role requires complex analysis, should have Premium

**Verdict**: REJECTED - Misses new hires and role-based needs

---

### Option B: Pure Role-Based Allocation (Department Baselines)
**Description**: Allocate Premium based purely on department/role with fixed percentages

**Department Baselines**:
| Department | Premium % | Rationale |
|------------|-----------|-----------|
| Engineering | 100% | Claude Code required |
| Finance | 35% | Complex analysis, financial modeling |
| Product | 35% | Feature planning, technical specs |
| Professional Services | 35% | Client solutions, implementations |
| Customer Success | 25% | Customer interactions, reporting |
| Sales | 20% | Deal research, proposals |
| Marketing | 18% | Content creation, campaigns |
| Support | 10% | Ticket resolution (less artifacts) |

**Pros:**
- ✅ Handles new hires: Role-based = immediate allocation
- ✅ Predictable: Fixed percentages = budget forecasting
- ✅ Fair: Every department gets proportional allocation
- ✅ Engineering 100%: Requirement met

**Cons:**
- ❌ **Ignores usage**: Inactive users get Premium (waste)
- ❌ **Misses power users**: Support agent with 150 conversations/mo doesn't qualify
- ❌ **Static**: Doesn't adapt to changing behavior
- ❌ **Inefficient**: Allocates Premium to low-usage users

**Example Failure**:
- Support agent creates 50 artifacts/mo for kb articles → Still only 10% chance of Premium
- Finance analyst with 5 conversations/mo → Gets Premium despite low usage

**Verdict**: REJECTED - Inefficient, doesn't reward usage

---

### Option C: Hybrid Scoring (Behavioral + Role Baseline) (CHOSEN)
**Description**: Combine usage-based behavioral scoring with department baseline percentages, taking the MAX of both

**Formula**:
```javascript
// 1. Calculate behavioral score (0-115 points)
behavioralScore = calculateBehavioralScore(userActivity);

// 2. Get department baseline (0-100%)
departmentBaseline = getDepartmentPremiumBaseline(userDepartment);

// 3. Recommendation logic
if (behavioralScore >= 70) {
  recommendPremium = true; // High usage = Premium
} else {
  // Calculate how many users in department should get Premium by baseline
  deptPremiumCount = deptHeadcount * departmentBaseline;
  // Rank users by behavioral score, allocate top N
  recommendPremium = userRankInDept <= deptPremiumCount;
}
```

**Hybrid Logic**:
- **Behavioral path**: Score ≥ 70 → Automatic Premium (rewards power users)
- **Baseline path**: Top N users in department by score → Premium (handles new hires, role complexity)
- **Engineering exception**: 100% Premium regardless of score

**Pros:**
- ✅ **Captures power users**: High usage across any department → Premium
- ✅ **Handles new hires**: Department baseline ensures appropriate allocation
- ✅ **Role complexity**: Finance/Product get higher baselines than Support
- ✅ **Cost efficient**: Low-usage users only get Premium if department baseline requires
- ✅ **Engineering 100%**: Explicit 100% baseline for Engineering
- ✅ **Adapts over time**: As usage grows, users qualify via behavioral path
- ✅ **Transparent**: Clear scoring methodology, reproducible

**Cons:**
- ❌ **Complexity**: Harder to explain to non-technical stakeholders
- ❌ **Tuning required**: Point thresholds and baselines need periodic adjustment
- ❌ **Two paths**: Users may not understand why they got Premium

**Example Successes**:
- **New Senior Finance Analyst**: 0 usage → 0 behavioral score → But top 35% in Finance by baseline → Premium ✅
- **Support Power User**: 150 conversations, 50 artifacts → 85 behavioral score → Premium via behavioral path ✅
- **Inactive Engineer**: 2 conversations, 0 code → 5 behavioral score → Engineering 100% baseline → Premium ✅
- **Low-Usage Marketing**: 10 conversations, 2 artifacts → 15 behavioral score → Bottom 82% in Marketing → Standard ✅

**Verdict**: ACCEPTED - Best balance of usage, role complexity, and efficiency

---

## Decision Outcome

**Chosen Option**: Option C - Hybrid Scoring (Behavioral + Role Baseline)

**Rationale:**
- Captures power users across all departments (behavioral scoring)
- Handles new hires and role complexity (department baselines)
- Ensures Engineering 100% Premium (explicit baseline)
- Cost-efficient (doesn't over-allocate to low-usage users)
- Adapts over time (usage history improves recommendations)

---

## Implementation Details

### Behavioral Scoring Algorithm

**Function**: `calculatePremiumScore(userActivity)`
**Score Range**: 0-115 points
**Premium Threshold**: 70 points

**Scoring Breakdown**:

1. **Code Writing (30 points)**
   - Claude Code lines > 0 → 30 points
   - Rationale: Code generation = Premium required

2. **Engagement (30 points)**
   - ≥ 100 conversations → 30 points
   - ≥ 50 conversations → 20 points
   - ≥ 20 conversations → 10 points
   - Rationale: High conversation volume = power user

3. **Artifacts (25 points)**
   - ≥ 20 artifacts → 25 points
   - ≥ 10 artifacts → 15 points
   - ≥ 5 artifacts → 8 points
   - Rationale: Artifact creation = advanced usage

4. **Analysis Work (15 points)**
   - File uploads > 50 → 15 points
   - File uploads > 20 → 10 points
   - Rationale: Document analysis = complex work

5. **M365 Intensity (10 points)**
   - M365 prompts/day ≥ 10 → 10 points
   - M365 prompts/day ≥ 5 → 5 points
   - Rationale: Heavy M365 user likely needs higher Claude limits

6. **Consistency (5 points)**
   - Active days ≥ 20 → 5 points
   - Active days ≥ 10 → 3 points
   - Rationale: Regular usage = core tool

**Code Implementation**:
```javascript
function calculatePremiumScore(userActivity) {
  let score = 0;

  // Code writing (30pts)
  if (userActivity.claudeCodeLines > 0) {
    score += 30;
  }

  // Engagement (30pts)
  if (userActivity.conversations >= 100) {
    score += 30;
  } else if (userActivity.conversations >= 50) {
    score += 20;
  } else if (userActivity.conversations >= 20) {
    score += 10;
  }

  // Artifacts (25pts)
  if (userActivity.artifacts >= 20) {
    score += 25;
  } else if (userActivity.artifacts >= 10) {
    score += 15;
  } else if (userActivity.artifacts >= 5) {
    score += 8;
  }

  // Analysis work (15pts)
  if (userActivity.fileUploads > 50) {
    score += 15;
  } else if (userActivity.fileUploads > 20) {
    score += 10;
  }

  // M365 intensity (10pts)
  const m365PromptsPerDay = userActivity.m365Prompts / 30;
  if (m365PromptsPerDay >= 10) {
    score += 10;
  } else if (m365PromptsPerDay >= 5) {
    score += 5;
  }

  // Consistency (5pts)
  if (userActivity.activeDays >= 20) {
    score += 5;
  } else if (userActivity.activeDays >= 10) {
    score += 3;
  }

  return score;
}
```

### Department Baselines

**Function**: `getDepartmentPremiumBaseline(department)`
**Returns**: 0.00-1.00 (percentage needing Premium)

**Baseline Percentages**:
```javascript
function getDepartmentPremiumBaseline(department) {
  const baselines = {
    // Technical teams
    'Engineering': 1.00,               // 100% - Claude Code required
    'Agentic AI': 1.00,                // 100% - Specialized AI work
    'Product': 0.35,                   // 35% - Technical specs, planning

    // High-complexity business teams
    'Finance': 0.35,                   // 35% - Financial modeling, analysis
    'Professional Services': 0.35,     // 35% - Client implementations
    'RevOps': 0.35,                    // 35% - Data analysis, pipeline optimization

    // Medium-complexity business teams
    'Customer Success': 0.25,          // 25% - Customer interactions, reporting

    // Sales teams
    'Sales-Enterprise': 0.20,          // 20% - Deal research, proposals
    'Sales-Commercial': 0.20,          // 20% - Deal research, proposals

    // Marketing and partnerships
    'Marketing': 0.18,                 // 18% - Content creation, campaigns
    'Partnerships': 0.18,              // 18% - Relationship management

    // Operations and support
    'Support': 0.10,                   // 10% - Ticket resolution
    'Operations': 0.10,                // 10% - Administrative tasks
    'IT': 0.10,                        // 10% - Infrastructure management

    // Default for unknown departments
    'default': 0.15                    // 15% - Conservative default
  };

  return baselines[department] || baselines['default'];
}
```

**Rationale by Department**:

| Department | Baseline | Rationale |
|------------|----------|-----------|
| **Engineering** | 100% | Claude Code Premium only; no Standard option |
| **Agentic AI** | 100% | Specialized AI development requires full access |
| **Finance** | 35% | Complex financial modeling, analysis, forecasting |
| **Product** | 35% | Technical specifications, feature planning, roadmaps |
| **Professional Services** | 35% | Client implementations, custom solutions |
| **RevOps** | 35% | Data analysis, pipeline optimization, forecasting |
| **Customer Success** | 25% | Customer reporting, success plan development |
| **Sales-Enterprise** | 20% | Enterprise deal research, complex proposals |
| **Sales-Commercial** | 20% | Commercial deal research, proposals |
| **Marketing** | 18% | Content creation, campaign development |
| **Partnerships** | 18% | Relationship management, partner materials |
| **Support** | 10% | Knowledge base articles, ticket resolution |
| **Operations** | 10% | Administrative processes, documentation |
| **IT** | 10% | Infrastructure docs, runbooks |

### Recommendation Logic

**Process Flow**:
```
For each user:
  1. Calculate behavioral score (0-115)
  2. Get department baseline (0-1.00)
  3. IF behavioral score >= 70:
       → Recommend Premium (power user path)
  4. ELSE:
       → Rank users in department by behavioral score
       → Calculate department Premium count: headcount * baseline
       → IF user in top N by score:
            → Recommend Premium (baseline path)
       ELSE:
            → Recommend Standard
```

**Special Cases**:
- **Engineering**: Always Premium (100% baseline overrides all)
- **New Hires**: 0 behavioral score → baseline path handles
- **Inactive Users**: Low score + low ranking → Standard (cost-efficient)
- **Cross-Department Transfer**: Re-evaluate with new department baseline

### Example Scenarios

**Scenario 1: Engineering Team (77 employees)**
```
Target: 77 Premium (100% baseline)
Current: 19 Premium

Recommendations:
- All 77 engineers → Premium (regardless of behavioral score)
- Rationale: Claude Code Premium is only way to access enterprise
- Phase 2 Rollout: 19/77 complete (25% progress)
```

**Scenario 2: Finance Team (12 employees)**
```
Target: 4 Premium (35% baseline, 12 * 0.35 = 4.2 → 4)
Current: 1 Premium

Behavioral Scores:
  User A: 95 (150 conversations, 30 artifacts) → Premium (behavioral path)
  User B: 82 (120 conversations, 15 artifacts) → Premium (behavioral path)
  User C: 55 (40 conversations, 8 artifacts) → Premium (baseline path, rank #3)
  User D: 48 (25 conversations, 5 artifacts) → Premium (baseline path, rank #4)
  User E-L: 10-35 → Standard (below baseline threshold)

Recommendations: A, B, C, D get Premium (2 via behavioral, 2 via baseline)
```

**Scenario 3: Support Team (18 employees)**
```
Target: 2 Premium (10% baseline, 18 * 0.10 = 1.8 → 2)
Current: 0 Premium

Behavioral Scores:
  User A: 88 (150 conversations, 50 artifacts for KB) → Premium (behavioral path)
  User B: 65 (80 conversations, 20 artifacts) → Premium (baseline path, rank #1)
  User C-R: 5-45 → Standard (below baseline threshold)

Recommendations: A, B get Premium (1 via behavioral, 1 via baseline)
```

**Scenario 4: New Hire (Senior Product Manager)**
```
Department: Product (35% baseline)
Team size: 10 employees
Baseline allocation: 3.5 → 4 Premium seats

New hire:
- Behavioral score: 0 (no usage history)
- Department ranking: Not ranked (no history)

Initial allocation: Standard (safe default)
30-day review:
- Behavioral score: 45 (20 conversations, 5 artifacts)
- Department ranking: #2 by score
- Baseline path: Top 4 in department → Upgrade to Premium ✅
```

---

## Positive Consequences

1. **Maximizes ROI** ✅
   - Power users get Premium regardless of department
   - Low-usage users only get Premium if role requires
   - Engineering 100% ensures Claude Code enterprise access

2. **Handles Edge Cases** ✅
   - New hires: Department baseline ensures appropriate allocation
   - Late adopters: Can qualify via behavioral path as usage grows
   - Cross-department transfers: Re-evaluated with new baseline

3. **Cost Efficient** ✅
   - Doesn't over-allocate Premium to inactive users
   - Focuses Premium on high-value users (behavioral or role-based)

4. **Transparent & Reproducible** ✅
   - Clear scoring methodology
   - Automated calculations (no manual decisions)
   - Auditable (scores tracked in dashboard)

5. **Adapts Over Time** ✅
   - Usage history improves recommendations
   - Quarterly reviews can adjust baselines
   - Behavioral path rewards adoption

---

## Negative Consequences

1. **Explanation Complexity** ⚠️
   - **Challenge**: Two paths (behavioral vs baseline) confusing to explain
   - **Mitigation**: Dashboard shows scores + reasoning
   - **Mitigation**: Simple message: "High usage or role complexity = Premium"

2. **Threshold Tuning Required** ⚠️
   - **Challenge**: 70-point threshold and baselines need periodic review
   - **Mitigation**: Quarterly reviews with Finance team
   - **Mitigation**: Data-driven adjustments (track upgrade/downgrade rates)

3. **Perception of Unfairness** ⚠️
   - **Challenge**: Users in same department may get different tiers
   - **Mitigation**: Transparent scoring visible in dashboard
   - **Mitigation**: Clear communication: "Premium for power users"

4. **Gaming Risk** ⚠️
   - **Challenge**: Users might artificially inflate metrics to reach 70 threshold
   - **Mitigation**: Usage quality monitored (artifacts, file uploads harder to fake)
   - **Mitigation**: Quarterly audits review allocation appropriateness
   - **Impact**: Minimal - gaming requires sustained effort, actual usage aligns with value

---

## Metrics & Validation

### Pre-Implementation (Dec 2025)
- 87 total licenses (13 Premium, 74 Standard)
- Allocation: Manual, inconsistent
- No power user identification
- Engineering: 19/77 Premium (25%)

### Post-Implementation (Jan 2026)
- Automated scoring for all 238 active users
- Clear Premium recommendations by department
- Phase 2 rollout tracking: 19/77 Engineering (25% complete)
- Target: 85 Premium by Q2 2026

### Success Metrics (Q2 2026 Review)
- [ ] Premium users have 3x+ higher engagement than Standard
- [ ] < 10% misallocations (Premium to inactive or Standard to power users)
- [ ] 90%+ of Claude Code Premium licenses actively used
- [ ] Finance team approves ROI analysis

### Validation Examples

**Department: Finance (12 employees, 35% baseline = 4 Premium)**
| User | Conversations | Artifacts | Files | Score | Path | Recommendation |
|------|---------------|-----------|-------|-------|------|----------------|
| User A | 150 | 30 | 60 | 95 | Behavioral | Premium ✅ |
| User B | 120 | 15 | 45 | 82 | Behavioral | Premium ✅ |
| User C | 40 | 8 | 25 | 55 | Baseline (rank #3) | Premium ✅ |
| User D | 25 | 5 | 15 | 48 | Baseline (rank #4) | Premium ✅ |
| User E | 15 | 2 | 5 | 35 | Below threshold | Standard |
| User F-L | 5-12 | 0-3 | 0-10 | 10-30 | Below threshold | Standard |

**Result**: 4 Premium, 8 Standard (matches 35% baseline) ✅

---

## Related Decisions

- **ADR-001**: Dashboard Architecture (foundation for expansion analysis)
- **ADR-005**: Batch Processing Architecture (monthly recalculation of scores)
- **ADR-009**: License Configuration Management (CSV-based license tracking)

---

## Future Enhancements

1. **Machine Learning Predictions** (Q3 2026)
   - Predict future usage based on historical patterns
   - Proactive recommendations before quarterly reviews

2. **Team-Level Scoring** (Q3 2026)
   - Score entire teams (not just individuals)
   - Team collaboration metrics (shared artifacts, projects)

3. **Cost Optimization Dashboard** (Q4 2026)
   - Real-time cost tracking
   - What-if scenarios (adjust baselines, see cost impact)

4. **Automated Tier Adjustments** (Q4 2026)
   - Auto-upgrade users who cross 70 threshold
   - Auto-downgrade inactive Premium users (after approval)

5. **Customizable Scoring Weights** (2027)
   - Allow Finance to adjust point weights
   - Department-specific scoring (Sales prioritize proposals, Support prioritize KB articles)

---

## Notes

**Implementation File**: `/scripts/parse-copilot-data.js` (lines 800-950)

**Data Sources**:
- Claude Enterprise usage (conversations, artifacts, projects)
- Claude Code usage (lines generated)
- M365 Copilot usage (prompts per day)
- Org chart (department assignments)

**Refresh Frequency**: Monthly (aligned with license review cycle)

**Approval Process**:
1. Engineering runs `npm run refresh` to generate recommendations
2. Dashboard displays expansion opportunities by department
3. Finance reviews recommendations + cost impact
4. Executive approval for license changes
5. IT provisions new licenses

**Current Status** (Jan 2026):
- Algorithm implemented and generating recommendations
- Phase 2 rollout active: 19/77 Engineering Premium (25% complete)
- Target: 77/77 Engineering by Q1 end, full 192 licenses by Q4

---

## References

- Implementation: `/scripts/parse-copilot-data.js`
- Dashboard: Expansion ROI tab → Department recommendations
- Phase 2 Tracker: Expansion ROI tab → Rollout tracking card
- Pricing: Premium $200/mo, Standard $40/mo
- Requirements: Engineering 100% Premium (Claude Code enterprise access)
