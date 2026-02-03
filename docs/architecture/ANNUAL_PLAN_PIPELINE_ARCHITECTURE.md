# Annual Plan Generation Pipeline Architecture

**Created**: January 10, 2026
**Author**: Luis Amadeo, Chief Agentic Officer, TechCo Inc
**Architect**: Luis Amadeo, Chief Agentic Officer, TechCo Inc
**Status**: Design Phase
**Branch**: `feature/annual-plan-automation`

---

## Overview

Automated pipeline to generate data-driven, agile annual plans for the Agentic AI team. Similar to the data pipeline architecture, this will be a modular, testable system that can be run independently or integrated into the main refresh workflow.

## Architecture

### Pipeline Stages

```
Project Files + Dashboard Data
  ↓
1. INGEST - Load project definitions and dependencies
  ↓
2. SCORE - Calculate hybrid scores (Multi-Factor + ROI)
  ↓
3. SCHEDULE - Constraint-based quarterly roadmap
  ↓
4. GENERATE - Create presentation data structure
  ↓
5. OUTPUT - Write JSON for dashboard integration
```

### Module Structure

```
scripts/
├── generate-annual-plan.js          (CLI entry point, ~100 lines)
└── modules/
    ├── annual-plan-orchestrator.js  (Pipeline coordinator, ~500 lines)
    │
    ├── ingestors/
    │   ├── project-ingestor.js      (Parse OP-XXX markdown files)
    │   └── dashboard-data-ingestor.js (Import ai-tools-data.json)
    │
    ├── processors/
    │   ├── dependency-analyzer.js   (Extract and classify dependencies)
    │   ├── hybrid-scorer.js         (70/30 Multi-Factor + ROI)
    │   └── constraint-scheduler.js  (Capacity-aware quarterly scheduling)
    │
    └── generators/
        ├── presentation-generator.js (9-slide structure)
        └── portfolio-generator.js    (Project table data)
```

---

## Stage 1: INGEST

### project-ingestor.js

**Purpose**: Parse all OP-XXX markdown files from `/data/ai-projects/`

**Input**: Directory path
**Output**:
```javascript
{
  projects: [
    {
      id: "OP-000",
      name: "Claude Enterprise & Code Expansion",
      file: "/path/to/file.md",
      content: "...",
      parsed: {
        value: 5060000,        // Annual value
        cost: 300000,          // Annual cost
        roi: 1560,             // ROI percentage
        effort: 15,            // Engineering days
        quarters: ["Q1"],      // Target quarters
        dependencies: [        // Extracted from markdown
          { type: "HARD", project: "OP-011" },
          { type: "SOFT", project: "OP-014" }
        ],
        strategic: {           // Strategic alignment
          pillars: ["Intelligent", "Impactful"],
          drivers: ["Innovate"]
        },
        kpis: [                // Target KPIs
          "Adoption: 150 WAU (67%)",
          "Time Saved: 3 hrs/wk/user"
        ]
      }
    },
    // ... more projects
  ],
  metadata: {
    totalProjects: 11,
    filesProcessed: 25,
    parseErrors: []
  }
}
```

**Key Logic**:
- Read all `.md` files matching `OP-*` pattern
- Parse frontmatter and sections
- Extract financial data (value, cost, ROI)
- Extract dependencies (explicit and implicit)
- Extract strategic alignment markers
- Extract KPIs and success metrics

### dashboard-data-ingestor.js

**Purpose**: Import current dashboard metrics for dependency analysis

**Input**: Path to `ai-tools-data.json`
**Output**:
```javascript
{
  adoption: {
    claudeEnterprise: 86,    // Adoption rate %
    claudeCode: 27,
    m365Copilot: 95
  },
  productivity: {
    claudeCodeMultiplier: 14.1,
    engagementMultiplier: 5.8
  },
  perceivedValue: {
    claudeEnterprise: 85,
    m365Copilot: 38
  },
  orgMetrics: {
    departments: {...},
    totalEmployees: 251
  }
}
```

---

## Stage 2: SCORE

### dependency-analyzer.js

**Purpose**: Classify dependencies as HARD or SOFT based on dashboard data

**Key Algorithm**:
```javascript
function classifyDependency(project, dependency, dashboardData) {
  // HARD criteria (any met = HARD)
  if (
    dashboardData.productivity.claudeCodeMultiplier > 10 ||
    dashboardData.productivity.engagementMultiplier > 4 ||
    Math.abs(dashboardData.perceivedValue.claude - dashboardData.perceivedValue.m365) > 30 ||
    dashboardData.adoption.claudeEnterprise > 80 ||
    dependency.explicitType === "requires" ||
    dependency.explicitType === "prerequisite"
  ) {
    return "HARD";
  }

  // Otherwise SOFT
  return "SOFT";
}
```

**Output**:
```javascript
{
  dependencyGraph: {
    "OP-011": {
      dependsOn: [
        { project: "OP-000", type: "HARD", rationale: "17.6x productivity, architecture foundation" }
      ],
      blockedBy: [],
      enablers: ["OP-008", "OP-001"]  // What this project enables
    },
    // ... more
  },
  resolved: true,
  cycles: []  // Circular dependencies detected
}
```

### hybrid-scorer.js

**Purpose**: Calculate final priority scores using adaptive weighting

**Formula**:
```
Q1-Q2: Final_Score = (0.7 × Multi_Factor) + (0.3 × ROI)
Q3-Q4: Final_Score = (0.6 × Multi_Factor) + (0.4 × ROI)

Multi_Factor =
  (0.3 × Financial_Impact) +
  (0.25 × Strategic_Alignment) +
  (0.25 × Execution_Feasibility) +
  (0.2 × Time_to_Value)

Financial_Impact = min(100, Annual_Value_Millions × 25)
ROI_Score = min(100, Project_ROI_Percentage / 5)
```

**Output**:
```javascript
{
  scores: {
    "OP-000": {
      multiFactorScore: 92,
      roiScore: 100,
      finalScore: 95.6,
      breakdown: {
        financialImpact: 100,  // $5.06M
        strategicAlignment: 85,
        executionFeasibility: 90,
        timeToValue: 100
      }
    },
    // ... more
  },
  ranked: [
    { id: "OP-000", score: 95.6, rank: 1 },
    { id: "OP-011", score: 81.7, rank: 2 },
    // ...
  ]
}
```

### constraint-scheduler.js

**Purpose**: Schedule projects across quarters based on capacity and dependencies

**Capacity Model**:
```javascript
const CAPACITY = {
  Q1: {
    core: 72,           // 6 people × 60 days × 20%
    champion: 0,        // No champion capacity yet
    committed: [        // Pre-allocated work
      "OP-012",         // Leave Planning (Forever Code)
      "OP-013",         // Case Management (Forever Code)
      "OP-000-Phase1",  // Claude Enterprise rollout
      "OP-011-Phase1",  // Marketplace launch
      "OP-008-Phase1"   // Law2Engine prototype
    ]
  },
  Q2: {
    core: 84,           // 7 people (+ Data Engineer)
    champion: 60        // Variable by project type
  },
  Q3: {
    core: 168,          // 40% availability
    champion: 120
  },
  Q4: {
    core: 252,          // 60% availability
    champion: 180
  }
};
```

**Algorithm**:
```
1. Build dependency graph
2. Reserve Q1 committed work
3. Sort remaining projects by final score (descending)
4. For each quarter (Q2, Q3, Q4):
     available = core + champion

     For each project (by score):
       IF dependencies met AND effort ≤ available:
         Schedule project
         available -= effort
         Mark dependencies as "scheduled"
       ELSE:
         Defer to next quarter
```

**Output**:
```javascript
{
  schedule: {
    Q1: {
      committed: ["OP-000-Phase1", "OP-011-Phase1", ...],
      capacity: 72,
      allocated: 72,
      buffer: 0
    },
    Q2: {
      potential: ["OP-014", "OP-005-Phase1", "OP-001"],
      capacity: 144,
      allocated: 134,
      buffer: 10
    },
    Q3: {
      potential: ["OP-008-GA", "OP-005-Phase2", ...],
      capacity: 288,
      allocated: 265,
      buffer: 23
    },
    Q4: {
      potential: ["OP-001", "OP-002", "OP-004"],
      capacity: 432,
      allocated: 390,
      buffer: 42
    }
  },
  deferredProjects: [],  // Couldn't fit in 2026
  resourceConflicts: []
}
```

---

## Stage 3: GENERATE

### presentation-generator.js

**Purpose**: Generate 9-slide presentation structure

**Output**:
```javascript
{
  slides: [
    {
      number: 1,
      title: "Executive Summary",
      content: {...}
    },
    {
      number: 2,
      title: "Strategic Context & Priorities",
      content: {...}
    },
    // ... through slide 9
  ]
}
```

### portfolio-generator.js

**Purpose**: Generate project portfolio table with 11 columns

**Output**:
```javascript
{
  projects: [
    {
      rank: 1,
      project: "OP-000: Claude Enterprise & Code Expansion",
      score: "95.6",
      tier: "TIER 0: FOUNDATION",
      status: "in-progress",
      value: "$5.06M",
      roi: "1560%",
      targetKPIs: "Adoption: 150 WAU (67%); Time Saved: 3 hrs/wk/user",
      dependencies: "None",
      qStart: "Q1",
      qStartDetail: "Q1 (Phase 1: Add 33 Premium licenses)",
      priorityReasoning: "Foundation for all agentic workflows..."
    },
    // ... 10 more projects
  ]
}
```

---

## Stage 4: OUTPUT

### Output Files

**1. JSON for Dashboard** (`/app/ai-annual-plan-data.json`)
```json
{
  "lastUpdated": "2026-01-10",
  "version": "2026.1",
  "portfolio": {
    "projects": [...],  // 11 projects with all metadata
    "summary": {
      "totalValue": "$20M+",
      "avgROI": "600%",
      "q1Committed": 5,
      "q2Potential": 5,
      "q3Potential": 4,
      "q4Potential": 3
    }
  },
  "presentation": {
    "slides": [...]  // 9 slides with content
  },
  "schedule": {...},
  "dependencies": {...},
  "metadata": {
    "generated": "2026-01-10T14:30:00Z",
    "projectsAnalyzed": 11,
    "dashboardDataVersion": "2026-01-10"
  }
}
```

**2. Markdown Report** (`/docs/strategic-planning/2026-annual-plan.md`)
- Human-readable version
- Can be used for presentations
- Version tracked in git

---

## CLI Entry Point

### scripts/generate-annual-plan.js

**Usage**:
```bash
# Generate annual plan
node scripts/generate-annual-plan.js

# With verbose output
node scripts/generate-annual-plan.js --verbose

# Regenerate from updated project files
npm run refresh-annual-plan
```

**Output**:
```
🚀 Starting Annual Plan generation...

📊 Step 1/5: Ingesting project files...
   - Found 11 projects in /data/ai-projects/
   - Loaded dashboard data from ai-tools-data.json
✅ Ingestion complete

🔢 Step 2/5: Calculating scores...
   - Analyzed 11 projects
   - Top score: OP-000 (95.6)
✅ Scoring complete

📅 Step 3/5: Scheduling quarters...
   - Q1: 5 committed projects (72/72 eng-days)
   - Q2: 5 potential projects (134/144 eng-days, 10-day buffer)
   - Q3: 4 potential projects (265/288 eng-days, 23-day buffer)
   - Q4: 3 potential projects (390/432 eng-days, 42-day buffer)
✅ Scheduling complete

📋 Step 4/5: Generating presentation...
   - Created 9-slide structure
   - Generated portfolio table (11 projects)
✅ Generation complete

💾 Step 5/5: Writing output files...
   - JSON: /app/ai-annual-plan-data.json (45 KB)
   - Markdown: /docs/strategic-planning/2026-annual-plan.md
✅ Output complete

🎉 Annual Plan generated successfully!
```

---

## Integration with Main Pipeline

### Option A: Separate Command (Recommended)
```bash
npm run refresh          # Dashboard data only
npm run refresh-annual-plan  # Annual plan only
npm run refresh-all      # Both pipelines
```

### Option B: Integrated into Main Refresh
```javascript
// In parse-copilot-data.js
async function main() {
  // ... existing pipeline

  // After dashboard data generated
  console.log('📋 Generating annual plan...');
  await generateAnnualPlan({
    dashboardDataPath: outputPath
  });
}
```

**Recommendation**: Option A for now. Keeps pipelines independent, easier to debug, faster iteration during annual plan changes.

---

## Testing Strategy

### Unit Tests
```
tests/annual-plan/
├── ingestors/
│   ├── project-ingestor.test.js
│   └── dashboard-data-ingestor.test.js
├── processors/
│   ├── dependency-analyzer.test.js
│   ├── hybrid-scorer.test.js
│   └── constraint-scheduler.test.js
└── generators/
    ├── presentation-generator.test.js
    └── portfolio-generator.test.js
```

### Integration Tests
- Full pipeline with sample project files
- Verify output matches expected structure
- Validate scoring algorithm accuracy
- Test scheduling with various capacity scenarios

---

## Implementation Plan

### Phase 1: Core Pipeline (Week 1)
- ✅ Create architecture document (this file)
- [ ] Create remaining 6 project detail files
- [ ] Implement project-ingestor.js
- [ ] Implement dashboard-data-ingestor.js
- [ ] Test ingestion with all 11 projects

### Phase 2: Scoring & Scheduling (Week 1-2)
- [ ] Implement dependency-analyzer.js
- [ ] Implement hybrid-scorer.js
- [ ] Implement constraint-scheduler.js
- [ ] Verify scores match manual calculations

### Phase 3: Generation & Output (Week 2)
- [ ] Implement presentation-generator.js
- [ ] Implement portfolio-generator.js
- [ ] Implement CLI entry point
- [ ] Test end-to-end pipeline

### Phase 4: Integration & Refinement (Week 2)
- [ ] Add npm script
- [ ] Update SESSION_RESUME.md
- [ ] Create PR
- [ ] Deploy and verify

---

## Success Criteria

- ✅ All 11 projects parsed correctly from markdown
- ✅ Hybrid scoring produces same results as manual calculation
- ✅ Scheduler respects capacity constraints and dependencies
- ✅ Output JSON matches dashboard integration requirements
- ✅ Pipeline runs in < 5 seconds
- ✅ Full test coverage (unit + integration)
- ✅ Documentation complete

---

## Future Enhancements

### Phase 2 (Post-Presentation)
1. **Quarterly Review Workflow**
   - Compare actual vs forecast
   - Re-score and re-schedule remaining quarters
   - Track adoption and ROI realization

2. **Dashboard Tab**
   - Interactive project portfolio table
   - Quarterly roadmap visualization
   - Dependency graph viewer
   - Risk tracker

3. **Real-Time Updates**
   - Auto-regenerate when project files change
   - Notify stakeholders of schedule shifts
   - Track project status updates

4. **AI-Powered Insights**
   - Generate strategic recommendations
   - Identify resource conflicts
   - Suggest dependency optimizations
   - Forecast completion dates
