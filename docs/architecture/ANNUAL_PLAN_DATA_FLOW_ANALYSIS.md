# Annual Plan Data Flow Analysis
**Date**: January 12, 2026
**Status**: Critical Findings - Partial Implementation ⚠️

## Executive Summary

The annual plan automation pipeline (PR #36) successfully generates data, but **the UI integration (PR #37) is incomplete**. The Annual Plan Presentation component still uses hardcoded data and does NOT consume the generated `ai-projects-presentation.json` file.

### Status by Component

| Component | Status | Data Source | Notes |
|-----------|--------|-------------|-------|
| **Portfolio Tab** | ✅ DYNAMIC | `ai-projects-portfolio.json` | Fully integrated, 7 projects displayed |
| **Annual Plan Slide 9** | ❌ HARDCODED | Inline array (lines 358-550) | Duplicate of portfolio data - NOT using generated JSON |
| **Annual Plan Slides 1-8** | ⚠️ PARTIAL | `aiToolsData` + hardcoded | Only uses metrics, not generated presentation structure |
| **Expansion ROI Tab** | ✅ DYNAMIC | `aiToolsData.expansion` | From main pipeline, fully data-driven |

## Architecture Diagrams

### Current State: Dual Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATA GENERATION LAYER                            │
└─────────────────────────────────────────────────────────────────────────┘

Pipeline 1: Main Dashboard Data (WORKING ✅)
┌──────────────────────┐
│ parse-copilot-data.js│
│                      │
│ • License config     │
│ • Org hierarchy      │
│ • Claude Enterprise  │
│ • Claude Code        │
│ • M365 Copilot       │
│ • GitHub Copilot     │
└──────────┬───────────┘
           │
           ↓
    ┌─────────────────┐
    │ ai-tools-data   │
    │    .json        │
    │   (240KB)       │
    └────────┬────────┘
             │
             ↓
   ┌─────────────────────┐
   │  Dashboard UI       │
   │  ✅ Expansion ROI   │
   │  ✅ All other tabs  │
   └─────────────────────┘


Pipeline 2: Annual Plan Data (PARTIALLY WORKING ⚠️)
┌─────────────────────────┐
│ generate-annual-plan.js │
│                         │
│ Stages:                 │
│ 1. INGEST   ┐          │
│ 2. ANALYZE  │ 7 modules│
│ 3. SCORE    │ 2,643    │
│ 4. SCHEDULE │ lines    │
│ 5. GENERATE ┘          │
└────────────┬────────────┘
             │
             ├────────────────────────────────────────┐
             │                                        │
             ↓                                        ↓
   ┌─────────────────────┐              ┌─────────────────────────┐
   │ ai-projects-        │              │ ai-projects-            │
   │ portfolio.json      │              │ presentation.json       │
   │ (3.6KB)             │              │ (13KB)                  │
   │                     │              │                         │
   │ 11-column table     │              │ 9-slide deck structure  │
   │ for all 7 projects  │              │ with BLUF, roadmap,     │
   └──────────┬──────────┘              │ recommendations         │
              │                         └────────┬────────────────┘
              │                                  │
              ↓                                  │
   ┌─────────────────────┐                     │
   │  Portfolio Tab      │                     │
   │  ✅ USING DYNAMIC   │                     │
   │     DATA            │                     ↓
   └─────────────────────┘              ┌─────────────────────────┐
                                        │ Annual Plan             │
   ┌─────────────────────┐              │ Presentation            │
   │  Annual Plan        │              │ ❌ IMPORTED BUT         │
   │  Presentation       │              │    NOT USED             │
   │  Slide 9            │              │                         │
   │  ❌ HARDCODED       │              │ Still using hardcoded   │
   │     DUPLICATE       │              │ getSlidesData()         │
   └─────────────────────┘              └─────────────────────────┘
```

### Detailed Data Flow: Portfolio Data

```
Source: /docs/ai-projects/OP-*.md (16 markdown files)
   │
   ↓
┌──────────────────────────────────────────────────────────┐
│ generate-annual-plan.js                                  │
│                                                          │
│ 1. project-ingestor.js                                   │
│    → Discovers 7 projects (OP-000, OP-001, OP-002,      │
│       OP-005, OP-008, OP-011, OP-014)                   │
│    → Groups multiple files per project                   │
│    → Extracts: value, ROI, KPIs, phases, dependencies   │
│                                                          │
│ 2. hybrid-scorer.js                                      │
│    → Calculates: Multi-Factor (70%) + ROI (30%)         │
│    → Ranks by final score (100-point scale)             │
│                                                          │
│ 3. portfolio-generator.js                                │
│    → Formats 11-column table                             │
│    → Adds: rank, tier, status, qStart, reasoning        │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ↓
          ┌──────────────────────────┐
          │ ai-projects-portfolio    │
          │        .json              │
          │                          │
          │ {                        │
          │   methodology: {...},    │
          │   projects: [            │
          │     {                    │
          │       rank: 1,           │
          │       project: "OP-005...│
          │       score: "84.1",     │
          │       tier: "TIER 0",    │
          │       ...                │
          │     }                    │
          │   ]                      │
          │ }                        │
          └─────────┬────────────────┘
                    │
                    ├──────────────────────────────────┐
                    │                                  │
                    ↓                                  ↓
         ┌──────────────────────┐         ┌──────────────────────────┐
         │ page.jsx (line 222)  │         │ AnnualPlanPresentation   │
         │                      │         │ Slide 9 (lines 358-550)  │
         │ ✅ USING GENERATED   │         │                          │
         │    DATA              │         │ ❌ HARDCODED DUPLICATE   │
         │                      │         │                          │
         │ portfolioData = {    │         │ slide 9 content = {      │
         │   projects:          │         │   projects: [            │
         │   portfolioData      │         │     {rank: 1, project:   │
         │   Generated          │         │     "OP-000: Claude...   │
         │   .projects          │         │     },                   │
         │   .map(...)          │         │     {rank: 2, ...},      │
         │ }                    │         │     ...hardcoded 11      │
         │                      │         │     projects...          │
         │ Dynamic              │         │   ]                      │
         │ transformation       │         │ }                        │
         │ adds UI fields       │         │                          │
         └──────────┬───────────┘         └──────────┬───────────────┘
                    │                                │
                    ↓                                ↓
         ┌──────────────────────┐         ┌─────────────────────────┐
         │ Portfolio Tab        │         │ Annual Plan Presentation│
         │                      │         │ Slide 9                 │
         │ Shows 7 projects     │         │                         │
         │ from generated data  │         │ Shows 11 projects       │
         │                      │         │ from hardcoded data     │
         │ ✅ CORRECT           │         │                         │
         └──────────────────────┘         │ ❌ OUT OF SYNC          │
                                          └─────────────────────────┘
```

## Proof Points

### 1. Portfolio Tab is Dynamic ✅

**Evidence:**
```javascript
// File: app/page.jsx, lines 12-13
import portfolioDataGenerated from './ai-projects-portfolio.json';
import presentationDataGenerated from './ai-projects-presentation.json';

// File: app/page.jsx, lines 222-243
const portfolioData = {
  methodology: {
    formula: "Q1-Q2: (0.7 × Multi_Factor) + (0.3 × ROI)",
    components: ["Financial Impact (30%)", ...]
  },
  projects: portfolioDataGenerated.projects.map(proj => {
    // Extract project ID from project string
    const projectId = proj.project.split(':')[0].trim();

    // Derive tierCategory from tier string
    let tierCategory = 'foundation';
    if (proj.tier.includes('TIER 1')) tierCategory = 'revenue';
    else if (proj.tier.includes('TIER 2')) tierCategory = 'retention';

    // Return transformed project with UI fields
    return {
      ...proj,
      projectId,
      tierCategory,
      statusCategory,
      targetKPIs: proj.targetKPIs || 'TBD'
    };
  })
};
```

**Result:** Portfolio tab displays 7 projects from generated data, dynamically updated when pipeline runs.

### 2. Annual Plan Slide 9 is Hardcoded ❌

**Evidence:**
```javascript
// File: app/components/AnnualPlanPresentation.jsx, lines 358-550
{
  id: 9,
  title: "AI Project Portfolio - Priority & Scoring",
  subtitle: "11 Projects Ranked by Hybrid Score (70% Multi-Factor + 30% ROI)",
  type: "portfolio",
  content: {
    methodology: {...},
    projects: [
      {
        rank: 1,
        project: "OP-000: Claude Enterprise & Code Expansion",
        score: "95.6",  // ❌ Hardcoded - actual generated score is 54.1
        tier: "TIER 0: FOUNDATION",
        status: "Proposed",
        ...
      },
      {
        rank: 2,
        project: "OP-011: TechCo Inc Claude Marketplace",
        score: "81.7",  // ❌ Hardcoded - actual generated score is 50.8
        ...
      },
      // ...9 more hardcoded projects
    ]
  }
}
```

**Rendering:**
```javascript
// File: app/components/AnnualPlanPresentation.jsx, lines 1110-1300
const renderPortfolioSlide = () => {
  return (
    <table>
      <tbody>
        {slide.content.projects.map((project, idx) => (
          // ❌ Renders hardcoded projects from getSlidesData()
          <tr key={idx}>
            <td>{project.rank}</td>
            <td>{project.project}</td>
            <td>{project.score}</td>  {/* Hardcoded scores! */}
            ...
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

**Result:** Presentation slide 9 shows 11 hardcoded projects with incorrect scores, completely ignoring generated data.

### 3. Presentation JSON is Unused ❌

**Evidence:**
```bash
$ grep -r "presentationDataGenerated" app/
app/page.jsx:import presentationDataGenerated from './ai-projects-presentation.json';
```

**Only 1 match:** File is imported but NEVER referenced anywhere in the codebase.

**AnnualPlanPresentation.jsx receives only aiToolsData:**
```javascript
// File: app/components/tabs/AnnualPlan.jsx, lines 9-12
const AnnualPlan = ({ aiToolsData }) => {
  return (
    <div className="h-[calc(100vh-12rem)]">
      <AnnualPlanPresentation aiToolsData={aiToolsData} />
    </div>
  );
};
```

**Result:** Generated presentation JSON (13KB, 9 slides) is completely unused.

### 4. Expansion ROI is Dynamic ✅

**Evidence:**
```javascript
// File: app/components/tabs/ExpansionROI.jsx, lines 18-22
export default function ExpansionROI({ aiToolsData }) {
  const expansionOpportunities = aiToolsData.expansion.opportunities;
  const orgMetrics = aiToolsData.orgMetrics;
  const expansion = aiToolsData.expansion;

  return (
    // Renders dynamic data from aiToolsData
    {expansionOpportunities
      .sort((a, b) => (b.netBenefit * 12) - (a.netBenefit * 12))
      .map((dept, idx) => (
        <tr key={idx}>
          <td>{dept.department}</td>
          <td>{dept.totalEmployees}</td>
          <td>${dept.totalAdditionalCost.toLocaleString()}</td>
          ...
        </tr>
      ))}
  );
}
```

**Data Source:**
```javascript
// Generated by: scripts/parse-copilot-data.js
// via: scripts/modules/aggregators/overview-aggregator.js
// Output: app/ai-tools-data.json → aiToolsData.expansion
```

**Result:** Expansion ROI fully dynamic, recalculates on every data refresh.

## Impact Analysis

### Data Accuracy Issues

| Component | Expected | Actual | Impact |
|-----------|----------|--------|--------|
| Portfolio Tab (Rank 1) | OP-005 (84.1) | OP-005 (84.1) | ✅ Correct |
| Presentation Slide 9 (Rank 1) | OP-005 (84.1) | OP-000 (95.6) | ❌ Wrong project, wrong score |
| Portfolio Tab (Rank 2) | OP-008 (75.0) | OP-008 (75.0) | ✅ Correct |
| Presentation Slide 9 (Rank 2) | OP-008 (75.0) | OP-011 (81.7) | ❌ Wrong project, wrong score |

**Critical Issue:** Presentation shows different rankings and scores than the Portfolio tab, causing confusion and eroding trust in data-driven decisions.

### User Experience Issues

1. **Inconsistency:** Portfolio tab shows 7 projects, Presentation shows 11 projects
2. **Out of sync:** Rankings differ between tabs
3. **Stale data:** Presentation doesn't update when running `npm run refresh-annual-plan`
4. **Misleading:** Executives see incorrect scores in presentation mode

## Recommended Fixes

### Option A: Use Generated Presentation JSON (Ideal)

**Scope:** Complete replacement of hardcoded slides with generated structure

**Changes Required:**
1. Pass `presentationDataGenerated` to `AnnualPlanPresentation`
2. Rewrite `getSlidesData()` to consume `presentationDataGenerated.slides`
3. Adapt rendering logic to match generated slide structure
4. Add fallback to hardcoded slides if JSON missing

**Effort:** 4-6 hours
**Risk:** Medium (requires significant component refactoring)
**Benefit:** Full automation, consistent data everywhere

### Option B: Fix Slide 9 Only (Quick Win)

**Scope:** Make presentation slide 9 use same portfolioData as Portfolio tab

**Changes Required:**
1. Pass `portfolioData` prop to `AnnualPlanPresentation`
2. Replace slide 9 hardcoded projects with `portfolioData.projects`
3. Keep slides 1-8 as-is (they provide strategic context)

**Effort:** 30 minutes
**Risk:** Low (minimal changes)
**Benefit:** Immediate consistency between tabs

### Option C: Hybrid Approach (Recommended)

**Scope:** Fix slide 9 now, plan full integration later

**Phase 1 (Immediate):**
- Implement Option B (fix slide 9)
- Add comment marking slides 1-8 for future enhancement
- Document that `presentationDataGenerated` available but not yet used

**Phase 2 (Future):**
- Implement Option A when ready for full automation
- Consider if strategic context slides (wins, challenges) should remain hardcoded
- May need hybrid model: generated data + curated narrative

**Effort:** 30 min now, 4-6 hours later
**Risk:** Low
**Benefit:** Quick fix + clear path forward

## Data Pipeline Validation

### Pipeline Execution ✅

```bash
$ npm run refresh-annual-plan

✅ Phase 1: INGESTION
   ✅ Ingested 7 projects (16 files)
   ✅ Ingested dashboard metrics

✅ Phase 2: ANALYSIS
   ✅ Analyzed 7 project dependencies

✅ Phase 3: SCORING
   ✅ Calculated scores for 7 projects

✅ Phase 4: SCHEDULING
   ✅ Scheduled projects across 4 quarters

✅ Phase 5: GENERATION
   ✅ Generated portfolio table (7 projects)
   ✅ Generated presentation structure (9 slides)

✅ Phase 6: OUTPUT
   ✅ Written 5 output files

Projects Analyzed: 7
Top Priority: OP-005 (Score: 84.1)
Q1 Committed: 3 projects
Files Written: 5
Execution Time: 0.02s
```

### Generated Files ✅

```bash
$ ls -lh app/ai-projects-*.json
-rw-r--r--  1.7K  ai-projects-dependencies.json
-rw-r--r--  3.6K  ai-projects-portfolio.json
-rw-r--r--   13K  ai-projects-presentation.json
-rw-r--r--  964B  ai-projects-schedule.json
-rw-r--r--  2.0K  ai-projects-scores.json
```

All files generated correctly ✅

### Scoring Algorithm ✅

```javascript
// Verified in: scripts/modules/processors/hybrid-scorer.js

Q1-Q2 Formula: (0.7 × Multi-Factor) + (0.3 × ROI)

Multi-Factor = (0.3 × Financial) +
               (0.25 × Strategic) +
               (0.25 × Feasibility) +
               (0.2 × TimeToValue)

Results (Q1 weighting):
1. OP-005: 84.1 (Financial: 100, ROI: 100) ✅
2. OP-008: 75.0 (Financial: 40, ROI: 100)  ✅
3. OP-014: 55.6 (Financial: 46, ROI: 31)   ✅
4. OP-000: 54.1 (Financial: 100, ROI: 0)   ✅
5. OP-011: 50.8 (Financial: 0, ROI: 59)    ✅
```

Algorithm working correctly ✅

## Conclusion

**Pipeline Status:** ✅ WORKING - Generates correct data
**UI Integration Status:** ⚠️ PARTIAL - Portfolio tab integrated, presentation not

**Critical Finding:** Annual Plan Presentation component (840 lines) uses hardcoded slides and does NOT consume generated JSON, despite PR #37 claiming "full integration."

**Recommendation:** Implement Option C (Hybrid Approach):
1. Fix slide 9 immediately (30 min)
2. Document remaining work
3. Plan full presentation automation in next sprint

**Business Impact:** Medium - Data inconsistency between tabs undermines trust in "data-driven strategy" narrative. Should be fixed before CEO presentation.
