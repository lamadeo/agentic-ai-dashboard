# Strategic Planning Module - Design & Methodology

**Purpose**: Data-driven, agile annual planning system for the Agentic AI team

**Created**: January 5, 2026
**Author**: Chief Agentic Officer (Luis Amadeo) & Claude Code
**Status**: Design Complete, Implementation In Progress

---

## Table of Contents

1. [System Architecture Overview](#section-1-system-architecture-overview)
2. [Dependency Extraction Logic](#section-2-dependency-extraction-logic)
3. [Hybrid Scoring Algorithm](#section-3-hybrid-scoring-algorithm)
4. [Constraint-Based Scheduler](#section-4-constraint-based-scheduler)
5. [Quarterly Review Process](#section-5-quarterly-review-process)
6. [Presentation Structure & Content](#section-6-presentation-structure--content)
7. [Implementation Plan](#section-7-implementation-plan)
8. [Future Automation Architecture](#section-8-future-automation-architecture)

---

## Section 1: System Architecture Overview

The Strategic Planning Module is a **two-phase system** that generates data-driven, agile annual plans for the Agentic AI team:

### Phase 1 (Immediate - CEO Presentation)

```
Project Analysis Files + Dashboard Data
  ↓
Dependency Extraction & Classification
  ↓
Hybrid Scoring Algorithm (Multi-Factor + ROI)
  ↓
Constraint-Based Scheduling
  ↓
Markdown Report Generation
  ↓
PowerPoint Export (via skill)
```

### Phase 2 (Post-Presentation - Dashboard Integration)

```
Same pipeline as Phase 1
  ↓
Automated Script (`generate-annual-plan.js`)
  ↓
Dashboard Tab: "Strategic Planning"
  ↓
Quarterly Review Workflow
  ↓
Interactive React Presentation
```

### Key Architectural Principles

1. **Data-Driven**: Extracts dependencies, costs, ROI from existing markdown files
2. **Dashboard-Integrated**: Leverages existing AI tools data (adoption, productivity, sentiment)
3. **Repeatable**: Same process works for annual planning and quarterly reviews
4. **Agile**: Q1 committed, Q2-Q4 subject to quarterly re-prioritization
5. **Capacity-Aware**: Realistic scheduling based on team constraints

### File Structure

```
/docs/strategic-planning/
  ├── methodology.md                   (this file - design documentation)
  ├── 2026-annual-plan.md              (generated markdown)
  ├── 2026-annual-plan.json            (generated data)
  ├── 2026-annual-plan.pptx            (generated presentation)
  ├── quarterly-reviews/
  │   ├── Q1-2026-review.md
  │   ├── Q2-2026-review.md
  │   ├── Q3-2026-review.md
  │   └── Q4-2026-review.md
  └── versions/
      ├── 2026-01-06-annual-plan.md    (initial version)
      ├── 2026-03-31-Q1-review.md      (after Q1 review)
      ├── 2026-06-30-Q2-review.md      (after Q2 review)
      └── 2026-09-30-Q3-review.md      (after Q3 review)

/scripts/
  └── generate-annual-plan.js          (future automation script)

/app/strategic-planning/
  ├── page.jsx                         (future dashboard tab)
  └── presentation.jsx                 (interactive React presentation)
```

---

## Section 2: Dependency Extraction Logic

The algorithm analyzes all project markdown files in `/data/ai-projects/` to extract and classify dependencies.

### Extraction Process

**1. Read all OP-XXX markdown files**
   - Parse "Dependencies" or "Prerequisites" sections
   - Identify mentions of other projects (e.g., "requires OP-011 Marketplace")
   - Extract technology dependencies (Claude Enterprise, Data Foundation, etc.)

**2. Classify Dependency Type**

#### HARD Dependencies (Blockers)

Project CANNOT start until dependency is complete.

**Detection Criteria:**
- **Dashboard data thresholds:**
  - Productivity multiplier > 10x (e.g., Claude Code 17.6x vs GitHub Copilot)
  - Engagement multiplier > 4x (e.g., Claude Enterprise 4.9x vs M365 Copilot)
  - Perceived value gap > 30 points (e.g., Claude Enterprise 85 vs M365 38)
  - Adoption rate > 80% on core team
- **Explicit statements:** "requires," "depends on," "must have," "prerequisite"
- **Architecture dependencies:** One project provides infrastructure for another

#### SOFT Dependencies (Nice-to-Have)

Project is better/easier if dependency exists but can proceed.

**Detection Criteria:**
- Productivity multiplier < 10x
- Engagement multiplier < 4x
- Perceived value gap < 30 points
- Statements: "benefits from," "enhanced by," "recommended," "optional"

**3. License Scale Factor**

Factor in training/enablement burden:
- **Small team (< 10 users):** Low training burden, feasible
- **Department-wide (10-50 users):** Medium burden, evaluate carefully
- **Multi-department (> 50 users):** High burden, likely Q3-Q4 only

### Example Dependencies

| Project | Depends On | Type | Rationale |
|---------|-----------|------|-----------|
| OP-011 (Marketplace) | OP-000 Phase 1 (Engineering licenses) | HARD | 17.6x productivity multiplier, architecture foundation |
| OP-008 (Law2Engine) | OP-011 (Marketplace) | HARD | Plugin architecture required |
| OP-008 (Law2Engine) | OP-014 (Data Foundation) | HARD | Compliance data access required |
| OP-005 (BDR Intelligence) | OP-000 Phase 2 (Sales licenses) | SOFT | Can start with M365 Agents, Claude is better (4.9x) |
| OP-001 (Deal Intelligence) | Gong MCP Integration | HARD | External vendor, launched Oct 2025 but needs maturity |

---

## Section 3: Hybrid Scoring Algorithm

The algorithm calculates a final priority score using adaptive weighting between Multi-Factor and ROI scoring.

### Scoring Formula

**Adaptive Weighting:**
```
Q1-Q2: Final_Score = (0.7 × Multi_Factor_Score) + (0.3 × ROI_Score)
Q3-Q4: Final_Score = (0.6 × Multi_Factor_Score) + (0.4 × ROI_Score)
```

**Rationale:** Start strategy-heavy while validating ROI assumptions in Q1-Q2, then increase ROI weight in Q3-Q4 as data accuracy improves.

---

### 3.1 Multi-Factor Score (0-100 points)

**Components (weighted):**
```
Multi_Factor_Score =
  (0.3 × Financial_Impact) +
  (0.25 × Strategic_Alignment) +
  (0.25 × Execution_Feasibility) +
  (0.2 × Time_to_Value)
```

#### Financial Impact (0-100)

**Formula:**
```
Financial_Impact = min(100, Annual_Value_Millions × 25)
```

**Examples:**
- $4M+ value = 100 points
- $2M value = 50 points
- $1M value = 25 points
- $500K value = 12.5 points

#### Strategic Alignment (0-100)

**Maps to TechCo Inc Strategic Framework:**

**4 Strategic Pillars:**
- **Impactful:** Product quality, customer impact (+20 points)
- **Intuitive:** User experience, ease of use (+20 points)
- **Intelligent:** AI/automation capabilities (+20 points)
- **Trustworthy:** Compliance, security, reliability (+20 points)

**3 Growth Drivers:**
- **Win (Sales):** Revenue generation (+20 points)
- **Retain (Churn):** Customer retention (+15 points)
- **Innovate (Future):** Long-term competitive advantage (+10 points)

**Calculation:** Count supported pillars/drivers × appropriate weight, max 100

#### Execution Feasibility (0-100)

**Scoring Factors:**
- Dependencies cleared: +30 points
- Team has domain expertise: +20 points
- Technology proven/mature: +20 points
- No external vendor blockers: +15 points
- Champion available: +15 points
- **Penalty:** Hard dependencies not met = -50 points

#### Time to Value (0-100)

**Scoring:**
- < 1 quarter: 100 points
- 1 quarter: 80 points
- 2 quarters: 60 points
- 3 quarters: 40 points
- 4+ quarters: 20 points

---

### 3.2 ROI Score (0-100 points)

**Formula:**
```
ROI_Score = min(100, (Project_ROI_Percentage / 5))
```

**Examples:**
- 1,560% ROI (OP-000) = 100 points (capped)
- 500% ROI = 100 points (capped)
- 300% ROI = 60 points
- 150% ROI = 30 points
- 100% ROI = 20 points

**Note:** ROI data from project markdown files may be estimates, hence lower weighting in Q1-Q2 (30%) until validated.

---

### 3.3 Final Score Examples

**OP-011 (Marketplace) in Q1:**
- Multi-Factor: 85 (high strategic value, proven tech, medium time-to-value)
- ROI: 61 (306% ROI)
- **Final: (0.7 × 85) + (0.3 × 61) = 77.8**

**OP-005 (BDR Intelligence) in Q1:**
- Multi-Factor: 70 (high value, soft dependency on licenses)
- ROI: 96 (481% ROI)
- **Final: (0.7 × 70) + (0.3 × 96) = 77.8**

**OP-012 (Leave Planning Tool) in Q1:**
- Multi-Factor: 95 (committed Hypergrowth project, product foundation)
- ROI: 35 (173% ROI)
- **Final: (0.7 × 95) + (0.3 × 35) = 77.0**

---

## Section 4: Constraint-Based Scheduler

The scheduler takes scored and prioritized projects and creates a realistic quarterly roadmap based on team capacity and dependencies.

---

### 4.1 Capacity Model

#### Agentic AI Team Capacity (Engineering Days)

**Q1 2026:**
- Team: 6 people
- Available: 20% (80% committed to Hypergrowth: OP-012 Leave Planning, OP-013 Case Management)
- **Capacity: 6 × 60 days × 20% = 72 eng-days**
- Reserved for: Marketplace expansion, Law2Engine continuation, enablement

**Q2 2026:**
- Team: 6 people + Data Engineer hire = 7 people
- Available: 20% (still Hypergrowth-constrained)
- **Core capacity: 7 × 60 days × 20% = 84 eng-days**
- Champion capacity: Variable by project type (see below)

**Q3 2026:**
- Team: 7 people
- Available: ~40% (Hypergrowth major milestone complete)
- **Core capacity: 7 × 60 days × 40% = 168 eng-days**
- Champion capacity: Mature community contributions

**Q4 2026:**
- Team: 7 people
- Available: ~60% (Hypergrowth stabilized)
- **Core capacity: 7 × 60 days × 60% = 252 eng-days**
- Champion capacity: Self-sustaining community

#### Champion Capacity (Q2+)

**Q1: No champion capacity modeled**
- Testing champion model with Lucas Melgaard (BDR), Brett (Engineering), Sara Johnson (Product)
- Champions contribute but not formalized

**Q2: Variable by project type**
- Plugin/Marketplace projects: 80% champion-led = +60 eng-days
- Data/Infrastructure projects: 20% champion-led = +15 eng-days
- Product features: 40% champion-led = +30 eng-days
- BDR/Domain-specific: 60% champion-led (Lucas) = +45 eng-days

**Q3: Established champion community**
- Plugin projects: +120 eng-days
- Data projects: +30 eng-days
- Product features: +60 eng-days
- Domain-specific: +90 eng-days

**Q4: Mature community**
- Scale Q3 by 1.5x

---

### 4.2 Scheduling Algorithm

**Step 1: Identify Hard Dependencies**
- Build dependency graph
- Mark projects that CANNOT start until dependencies complete
- Example: OP-008 (Law2Engine) blocked until OP-011 (Marketplace) + OP-014 (Data Foundation) complete

**Step 2: Reserve Q1 Committed Work**
- OP-012 (Leave Planning Tool): Forever Code commitment
- OP-013 (Case Management): Forever Code commitment
- OP-011 (Marketplace expansion): Enablement priority
- OP-008 (Law2Engine): Continue prototype (40% → ongoing)
- OP-000 Phase 1: Training/enablement for Engineering/Product
- **Total: Consumes 72 eng-days (100% of Q1 capacity)**

**Step 3: Sort Remaining Projects by Score**
- Use Final_Score from Section 3
- Highest score = highest priority

**Step 4: Schedule by Quarter (Greedy Algorithm)**

```
For each quarter (Q2, Q3, Q4):
  Available_Capacity = Core_Capacity + Champion_Capacity

  For each project (sorted by score, descending):
    IF project dependencies are complete:
      IF project effort ≤ Available_Capacity:
        Schedule project in this quarter
        Available_Capacity -= project effort
        Mark project as "scheduled"
      ELSE:
        Mark as "deferred to next quarter" (capacity constraint)
    ELSE:
      Mark as "blocked" (dependency not met)

  Move to next quarter
```

**Step 5: Handle Overflows**
- If high-priority project doesn't fit in any quarter:
  - Flag as "requires additional resources"
  - Show in "what-if" scenario: "If we add 2 people in Q3, we can deliver OP-001"

---

### 4.3 Output Format

**Quarterly Roadmap Structure:**

```
Q1 2026 (Committed - XX eng-days):
  ✓ Project A: Description (effort estimate)
  ✓ Project B: Description (effort estimate)
  Status: XX% capacity utilized

Q2 2026 (Planned - XX eng-days):
  → Project C: Description (effort estimate)
  → Project D: Description (effort estimate)
  Status: XX% capacity utilized
  Review Gate: KPIs to evaluate

Q3 2026 (Planned - XX eng-days):
  → Project E: Description (effort estimate)
  Status: XX% capacity utilized
  Review Gate: KPIs to evaluate

Q4 2026 (Planned - XX eng-days):
  → Project F: Description (effort estimate)
  Status: XX% capacity utilized
  Review Gate: Annual planning for 2027

Deferred (Requires Additional Resources):
  ⏸ Project G: Reason for deferral
```

---

### 4.4 "What-If" Scenarios

The scheduler generates capacity expansion scenarios:

**Scenario A: Hire 2 Additional Engineers in Q2**
- Q2-Q4 capacity: +360 eng-days total
- Enables: Earlier delivery of deferred projects
- Cost: ~$300K (2 engineers × $150K annually)
- Value unlock: Calculate incremental project value

**Scenario B: Expand Champion Program Aggressively**
- Identify 10 champions by Q2 (vs 3-4 baseline)
- Q2-Q4 capacity: +200 eng-days
- Enablement cost: +30 eng-days for training
- Net capacity gain: +170 eng-days

---

## Section 5: Quarterly Review Process

The quarterly review process enables agile re-prioritization based on actual results and changing conditions.

---

### 5.1 Review Cadence

**Timing:**
- **End of Q1 (March 2026):** Review Q1 results, finalize Q2 commitments
- **End of Q2 (June 2026):** Review Q2 results, finalize Q3 commitments, adjust Q4 plan
- **End of Q3 (September 2026):** Review Q3 results, finalize Q4 commitments
- **End of Q4 (December 2026):** Annual review, plan 2027

**Participants:**
- Chief Agentic Officer (Luis Amadeo)
- Agentic AI team leads
- CEO (Chris Murphy) - strategic decisions
- Finance - budget adjustments
- Department champions - project-specific input

---

### 5.2 Project-Level KPIs

Track these KPIs per project:

**1. Delivery Health (Green/Yellow/Red)**
- **Green:** On schedule ± 2 weeks, hitting milestones
- **Yellow:** 2-4 weeks behind, mitigation plan in place
- **Red:** >4 weeks behind, scope/resources need adjustment

**2. Adoption Rate**
- **Target:** >60% of intended users within 30 days of launch
- **Measured from:** Dashboard data (active users / licensed users)
- **Example:** OP-000 Phase 1 should drive Claude Code adoption from 42% → 70%+

**3. ROI Realization**
- **Measured:** Actual value delivered vs forecast
- **Examples:** Productivity gains, time saved, revenue impact
- **Validation:** Compare actual to forecast, calculate variance

**4. User Sentiment**
- **Target:** >70 perceived value score
- **Sources:** Dashboard sentiment analysis, Slack feedback, champion input
- **Baseline:** Claude Enterprise 85/100, Claude Code 94/100

**5. Champion Engagement (Q2+)**
- **Measured:** Commits, plugins published, users enabled
- **Target:** Champions contributing as expected per capacity model
- **Validation:** Actual vs forecast champion eng-days

---

### 5.3 Portfolio-Level KPIs

Derived from dashboard data + project KPIs:

**1. AI Tool Adoption (from dashboard)**
- Claude Enterprise: Active users, engagement trend
- Claude Code: Active users, lines of code, productivity multiplier
- M365 Copilot: Active users (baseline comparison)
- **Target:** Maintain or improve adoption rates quarter-over-quarter

**2. Productivity Metrics (from dashboard)**
- Claude Code lines per user (baseline: 34,509)
- Productivity multiplier vs GitHub Copilot (baseline: 17.6x)
- Claude Enterprise engagement multiplier vs M365 (baseline: 4.9x)
- **Target:** Maintain or improve productivity

**3. Perceived Value (from dashboard)**
- Claude Enterprise: 85/100 (baseline)
- Claude Code: 94/100 (baseline)
- M365 Copilot: 38/100 (baseline)
- **Target:** Improve or maintain >80 for core tools

**4. ROI Across Portfolio**
- Total value delivered vs total investment
- Blended ROI across all active projects
- **Target:** >300% blended ROI

**5. Strategic Pillar Coverage**
- % of projects supporting each pillar (Impactful, Intuitive, Intelligent, Trustworthy)
- % of projects supporting each growth driver (Win, Retain, Innovate)
- **Target:** Balanced portfolio (not over-indexed on one area)

---

### 5.4 Re-Prioritization Decision Framework

At each quarterly review:

**Step 1: Evaluate Each In-Flight Project**

```
FOR each active project:

  IF Delivery = Green AND Adoption ≥ 60% AND Sentiment ≥ 70:
    Decision: CONTINUE as planned

  IF Delivery = Yellow OR Adoption 40-60% OR Sentiment 60-70:
    Decision: REASSESS
    - Identify root cause (capacity? dependency? design issue?)
    - Apply mitigation (add resources, adjust scope, improve training)
    - Continue with monitoring

  IF Delivery = Red OR Adoption < 40% OR Sentiment < 60:
    Decision: PAUSE or PIVOT
    - Conduct deep retrospective
    - Consider: Pause, reduce scope, cancel, or major pivot
    - Reallocate capacity to higher-value projects
```

**Step 2: Re-Score All Planned Projects**

- Run the hybrid scoring algorithm again with updated data:
  - ROI data is now more accurate (actual vs forecast)
  - Dashboard data shows latest adoption/productivity trends
  - Champion capacity is validated (not estimated)

- Re-run constraint-based scheduler with:
  - Updated capacity (actual champion contributions)
  - Cleared dependencies (projects that completed)
  - New blocked dependencies (external vendor delays, e.g., Gong)

**Step 3: Identify Changes to Plan**

Compare new schedule to original plan:
- Which projects moved earlier? (dependencies cleared faster)
- Which projects moved later? (capacity constraints, blockers)
- Which new projects entered the plan? (emerging priorities)
- Which projects dropped out? (lower value, resource constraints)

**Step 4: Executive Decision**

- Present comparison to CEO/leadership
- Highlight trade-offs and options
- Get approval for adjusted plan

---

### 5.5 Adaptive Scoring Weight Adjustment

**Q1-Q2 Review (June 2026):**
- Current weights: 70% Multi-Factor, 30% ROI
- **Evaluate:** How accurate were ROI forecasts for completed projects?
- **If ROI forecasts ≥80% accurate:** Increase ROI weight to 60/40 for Q3-Q4
- **If ROI forecasts <80% accurate:** Keep 70/30 for Q3-Q4

**Q3-Q4 Review (September 2026):**
- Adjust to 60% Multi-Factor, 40% ROI (if accuracy improved)
- Continue refining weights based on data quality

---

### 5.6 Output: Quarterly Review Report

**Generated markdown report:**

```markdown
# Q1 2026 Review & Q2 2026 Plan Update

## Executive Summary
- Projects delivered: X of Y
- Adoption targets: X met, Y missed
- Portfolio ROI: Actual vs forecast
- Key decisions: Projects adjusted, paused, or accelerated

## Project Scorecards
[Per-project KPI summary with green/yellow/red status]

## Portfolio Health
[Dashboard metrics: adoption, productivity, sentiment]

## Updated Q2 Plan
[Re-scheduled roadmap with rationale for changes]

## Q3-Q4 Outlook
[Preview of upcoming work, dependencies to watch]

## Recommendations
[Strategic adjustments, resource needs, risks to mitigate]
```

---

## Section 6: Presentation Structure & Content

The presentation for CEO Chris Murphy follows a narrative arc that celebrates wins, acknowledges challenges, and presents a data-driven, agile plan.

---

### 6.1 Main Presentation Structure (8 Slides)

**Slide 1: Executive Summary**
- One-page overview of the 2026 plan
- Key message: Data-driven, agile approach to maximize AI ROI while staying capacity-constrained
- Headline numbers: X projects, $YM value, Z quarters, quarterly re-prioritization

**Slide 2: Current State - Wins & Successes**
- Celebrate Agentic AI team achievements
- Dashboard metrics:
  - Claude Enterprise: 84% adoption, 85/100 perceived value, 4.9x engagement vs M365
  - Claude Code: 17.6x productivity multiplier vs GitHub Copilot, 94/100 perceived value
  - M365 Copilot: 95% adoption (238 of 251 users), AI Agents usage patterns
- Key wins: Marketplace foundation, Law2Engine prototype, AI dashboard intelligence
- Message: "We've proven AI works at TechCo Inc"

**Slide 3: Current State - Challenges & Opportunities**
- Honest assessment of gaps:
  - Claude Code: Only 42% adoption (19 of 45 licensed engineers)
  - Windows/.NET engineers lack tooling
  - 11 AI project opportunities ($22M potential value)
  - Limited Agentic AI team capacity (6 people, 80% on Hypergrowth)
- Message: "We have more opportunities than capacity - need strategic prioritization"

**Slide 4: Strategic Rationale**
- Why this plan, why now
- Philosophy:
  - **Short-term:** Enable existing licenses, prove ROI, build foundations
  - **Long-term:** Scale through champions, community-driven innovation
  - **Agility:** Quarterly reviews adapt to results and changing conditions
  - **Conservative spend:** Maximize existing investments before expanding
- Strategic priorities:
  1. Dependencies first (licenses, marketplace, data foundation)
  2. Quick wins (high ROI, realistic execution)
  3. Champion validation (prove the scaling model)

**Slide 5: 2026 Annual Plan - Quarterly View**
- The core roadmap (Quarterly Milestone format)
- Q1: Committed projects with capacity allocation
- Q2: Planned projects (subject to Q1 review)
- Q3: Planned projects (subject to Q2 review)
- Q4: Planned projects (subject to Q3 review)
- Visual indicators: Committed vs Planned, dependencies shown

**Slide 6: Resource Requirements & Capacity Model**
- Team composition: 6 people + Q2 Data Engineer hire
- Capacity reality: 20% available Q1-Q2, 40% Q3, 60% Q4 (Hypergrowth commitment)
- Champion model: Test in Q1 (Lucas, Brett, Sara), scale in Q2+
- What-if scenarios: "If we add 2 engineers in Q2, we unlock [project] in Q3"

**Slide 7: Quarterly Review Process & KPIs**
- How we stay agile
- Project-level KPIs: Delivery, adoption, ROI, sentiment
- Portfolio-level KPIs: Dashboard metrics (adoption, productivity, perceived value)
- Decision framework: Continue / Reassess / Pause
- Review cadence: End of each quarter with CEO

**Slide 8: Risks & Mitigation**
- Key risks:
  1. Champion model doesn't scale → Q1 validation with 3 champions
  2. Hypergrowth delays impact capacity → Firewall 80% capacity, adjust Q3-Q4
  3. External dependencies (Gong MCP) → Schedule flexibly, can defer to 2027
  4. ROI forecasts inaccurate → Quarterly re-prioritization based on actuals
  5. Training/enablement burden → Leverage existing content, prioritize Engineering/Product first
- Message: "We've identified risks and have mitigation strategies"

---

### 6.2 Appendix (5-10 Slides)

**Appendix A: Alternative Roadmap Views**
- Timeline View (Gantt-style visualization)
- Tier-Based View (Foundation/Revenue/Retention grouping)
- Scorecard View (Prioritized list with scores and rationale)

#### 6.2.1 Portfolio Table (Enhanced Scorecard View)

**Purpose**: Comprehensive reference table for CEO backup/Q&A during presentation

**Use Case**: Appendix slide for quick lookup when CEO asks "What about project X?" or "Why isn't Y higher priority?"

**Presentation Columns (11 columns for CEO reference)**:

| Column | Width | Purpose | Example Value |
|--------|-------|---------|---------------|
| Rank | 4% | Priority order | #1, #2, #3 |
| Project | 16% | ID + Full Name | OP-000: Claude Enterprise Expansion |
| Score | 5% | Final hybrid score | 95.6 |
| Tier | 8% | Strategic grouping | FOUNDATION / REVENUE / RETENTION |
| Status | 8% | Current state | Active / Proposed / 60% Complete |
| Value | 6% | Annual value | $4.6M |
| ROI | 6% | Return percentage | 1,560% |
| Target KPIs | 18% | Success metrics | Adoption: 92→192 seats; WAU: 62→128 |
| Dependencies | 10% | Blockers | None / OP-000 (Phase 1) / Gong MCP |
| Q Start | 11% | Launch quarter + Q1 detail | Q1 (Deploy licenses, Champions program) |
| Priority Reasoning | 8% | Why this rank? | "FOUNDATIONAL - Enables all 8+ downstream projects" |

**Dashboard Columns (8 additional columns for interactive module - future)**:
- Investment ($276K)
- Payback (1.0 mo)
- Resources (0.3 FTE breakdown)
- Q1 Deliverable (full phased delivery)
- Q2 Deliverable (full phased delivery)
- Q3 Deliverable (full phased delivery)
- Q4 Deliverable (full phased delivery)
- Multi-Factor Score (93.75 - shows methodology)

**Visual Design Specifications**:

```javascript
// Table styling
header: "bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200"
rows: "hover:bg-gray-50 border-b border-gray-200"
fontSize: "text-xs" (10px for 11 columns)

// Tier color coding
TIER 0 (Foundation): bg-blue-100 text-blue-800 border-blue-300 + 🔷
TIER 1 (Revenue): bg-green-100 text-green-800 border-green-300 + 💰
TIER 2 (Retention): bg-orange-100 text-orange-800 border-orange-300 + 🔄

// Status indicators
Active: bg-green-500 dot + text-green-700 font-semibold
Proposed: bg-gray-400 dot + text-gray-700
60% Complete: bg-yellow-500 dot + text-yellow-700 font-semibold
Planning: bg-blue-400 dot + text-blue-700

// Typography hierarchy
Rank: font-bold text-gray-900 text-sm
Project: font-semibold text-gray-900
Score: font-bold text-indigo-600
Value/ROI: font-bold text-green-600
Target KPIs: text-xs text-gray-700
Priority Reasoning: text-xs italic text-gray-600
```

**Data Sources**:
- `/docs/strategic-planning/working-data/PROJECT_SCORES.md` (lines 446-461: final ranking table)
- `/data/ai-projects/OP-*.md` (per-project metadata: KPIs, deliverables, resources, dependencies)

**Implementation Architecture**:

**Reusable Component (Implemented)**:
```javascript
// /app/components/PortfolioTable.jsx
const PortfolioTable = ({
  projects,
  methodology,
  showMethodology = true,
  showLegend = true
}) => {
  // Helper functions: getTierBadgeClass, getStatusDotClass, etc.
  // Returns: scrollable table with 11 columns, methodology note, legend
};

// Used by both presentation and dashboard:
// 1. AnnualPlanPresentation.jsx (Slide 9)
// 2. page.jsx (ROI & Planning → AI Projects Portfolio tab)
```

**CEO Presentation (Implemented)**:
```javascript
// /app/components/AnnualPlanPresentation.jsx - Slide 9
{
  id: 9,
  title: "AI Project Portfolio - Priority & Scoring",
  subtitle: "11 Projects Ranked by Hybrid Score",
  type: "portfolio",
  content: {
    methodology: {
      formula: "Q1-Q2: (0.7 × Multi_Factor) + (0.3 × ROI)",
      components: ["Financial Impact", "Strategic Alignment",
                   "Execution Feasibility", "Time to Value", "ROI"]
    },
    projects: [ /* 11 projects with all 11 presentation columns */ ]
  }
}

// Uses: <PortfolioTable projects={...} methodology={...} />
```

**Dashboard Tab (Implemented)**:
```javascript
// /app/page.jsx - Portfolio tab under ROI & Planning dropdown
const portfolioData = { methodology, projects: [...] };

{activeTab === 'portfolio' && (
  <>
    {/* 4 summary metric cards */}
    <PortfolioTable
      projects={portfolioData.projects}
      methodology={portfolioData.methodology}
      showMethodology={true}
      showLegend={true}
    />
    {/* Strategic context + link to full presentation */}
  </>
)}
```

**Future (Automated Pipeline - Q2 2026)**:
```javascript
// /scripts/generate-annual-plan.js (extends existing pipeline)
const planData = {
  roadmap: { /* quarterly schedule */ },
  scores: { /* project scores */ },
  dependencies: { /* dependency graph */ },
  portfolio: {  // NEW SECTION
    projects: [ /* 11 projects with all 19 columns */ ]
  },
  kpis: { /* KPI data */ }
};

// Output: /docs/strategic-planning/2026-annual-plan.json
// Consumed by: /app/strategic-planning/page.jsx (Strategic Planning module)
```

**Scrollable Container** (if >11 rows):
```javascript
<div className="flex-1 overflow-auto max-h-[500px]">
  {/* Table scrolls vertically, optimized for projection */}
</div>
```

**Integration Points**:
1. **Presentation Slide** (Appendix A): Slide 9 in `AnnualPlanPresentation.jsx`
2. **Dashboard Tab** (Implemented): `/app/page.jsx` under "ROI & Planning → AI Projects Portfolio" using reusable `PortfolioTable.jsx` component
3. **Strategic Planning Module** (Future): `/app/strategic-planning/page.jsx` with multiple views (Quarterly, Timeline, Portfolio)
4. **Automation** (Future): `generate-annual-plan.js` includes portfolio data generation

**Alignment with Methodology**:
- Extends Section 3 (Hybrid Scoring Algorithm) by visualizing all scored projects
- Extends Section 4 (Constraint-Based Scheduler) by showing quarterly assignments
- Extends Section 6.2 (Appendix A: Scorecard View) with comprehensive columns
- Supports Section 5 (Quarterly Review Process) by providing baseline for comparison

---

**Appendix B: Scoring Methodology**
- Hybrid scoring formula (70/30 Q1-Q2, 60/40 Q3-Q4)
- Multi-factor components (Financial, Strategic, Feasibility, Time-to-Value)
- ROI scoring approach
- Example scored projects with rationale

**Appendix C: Dependency Graph**
- Visual diagram showing project dependencies
- HARD vs SOFT dependencies
- License dependencies (Claude Enterprise Premium)
- Data Foundation as enabler

**Appendix D: Project Deep Dives**
- 1-slide summaries for each major project:
  - OP-000: Claude Enterprise/Code Expansion
  - OP-011: Marketplace (full scope)
  - OP-014: Operational Data Foundation
  - OP-005: BDR Intelligence Platform
  - OP-008: Law2Engine
  - OP-001: Deal Intelligence Platform
- Each includes: Problem, solution, investment, value, timeline, dependencies

**Appendix E: Dashboard Data Insights**
- Detailed charts from AI Dashboard:
  - Adoption trends (monthly)
  - Productivity multipliers (17.6x, 4.9x)
  - Perceived value by tool
  - Department adoption heatmap
  - Sentiment analysis
- References Executive Leadership Summary and Organization-wide Summary from dashboard
- Message: "This plan is grounded in real data"

**Appendix F: Champion Model Details**
- How champions contribute by project type
- Capacity assumptions Q2-Q4
- Training/enablement plan
- Success metrics for champion program

**Appendix G: Financial Summary**
- Total portfolio investment over 18 months
- Expected annual value
- Blended ROI
- Quarterly cash flow and payback periods

---

### 6.3 Presenter Notes (Per Slide)

Each slide includes:
- **Key talking points** (3-5 bullets)
- **Anticipated questions** and suggested answers
- **Data sources** (dashboard metrics, project files, briefings)
- **Transitions** to next slide

**Example for Slide 2 (Current State - Wins):**

```
PRESENTER NOTES:

Key Talking Points:
- "The Agentic AI team has proven that AI delivers real value at TechCo Inc"
- "Claude Code is 17.6x more productive than GitHub Copilot - that's transformational"
- "Claude Enterprise shows 4.9x higher engagement than M365 Copilot - users prefer it"
- "95% M365 Copilot adoption shows our organization embraces AI when properly enabled"
- "We've built foundational infrastructure: Marketplace with 30 plugins, Law2Engine 40% complete"

Anticipated Questions:
Q: "Why is Claude Code adoption only 42% if it's 17.6x better?"
A: "Windows/.NET engineers lack tooling. Q1 focuses on Marketplace expansion. Expect 70%+ by Q2."

Q: "What's the dollar value of these wins?"
A: "OP-000 Claude Enterprise expansion delivers $4.6M annual value at 1,560% ROI."

Data Sources:
- Dashboard: /app/ai-tools-data.json (adoption, productivity, perceived value, engagement multipliers)
- Dashboard Briefings: Executive Leadership Summary, Organization-wide Summary
- Project: OP-000 Claude Enterprise Expansion executive summary

Transition:
"While we've had significant wins, we also have clear opportunities and challenges..."
```

---

### 6.4 Visual Design Guidelines (TechCo Inc Branding)

**Color Palette:**
- Primary: TechCo Inc blue (from branding standards)
- Accent: Green for wins/growth, Yellow for caution, Red for risks
- Neutral: Gray for supporting text

**Typography:**
- Headers: Bold, clear hierarchy
- Body: Readable at distance (18pt minimum)
- Data: Highlight key numbers (large, bold)

**Charts:**
- Simple, uncluttered
- Consistent style across all charts
- Annotations for key insights

**Layout:**
- Generous white space
- One key message per slide
- Visuals > text (80/20 rule)

---

### 6.5 Markdown Generation Template

```markdown
# TechCo Inc Agentic AI Team - 2026 Annual Plan
*Presentation for CEO Chris Murphy*
*Date: January 6, 2026*

---

## Slide 1: Executive Summary

### Content
[Slide content here]

### Presenter Notes
**Key Talking Points:**
- [Point 1]
- [Point 2]

**Anticipated Questions:**
- Q: [Question]
- A: [Answer]

**Data Sources:**
- [Source references]

**Transition:**
[Transition to next slide]

---

## Slide 2: Current State - Wins & Successes

### Content
[Slide content here]

### Presenter Notes
[Notes here]

---

[Continue for all slides...]
```

---

## Section 7: Implementation Plan

Step-by-step process to generate tomorrow's CEO presentation.

---

### 7.1 Implementation Steps (Sequential)

**Step 1: Analyze All Project Files (30-45 min)**
- Read all OP-XXX markdown files in `/data/ai-projects/`
- Extract for each project:
  - Project ID, name, description
  - Investment cost, annual value, ROI
  - Dependencies (explicit and inferred)
  - Effort estimate (eng-days)
  - Current status (%, prototype, proposed)
  - Strategic alignment (pillars, growth drivers)
- Store in structured JSON for processing

**Step 2: Extract Dashboard Data (10 min)**
- Read `/app/ai-tools-data.json` (key sections only, due to size)
- Extract:
  - Claude Enterprise: adoption, perceived value, engagement, **productivity multiplier vs M365 (4.9x)**
  - Claude Code: adoption, productivity multiplier vs GitHub Copilot (17.6x), lines per user
  - **M365 Copilot:** adoption baseline, **AI Agents usage patterns** (app usage breakdown)
  - Sentiment scores by tool
  - **Executive Leadership Summary** (from Briefings)
  - **Organization-wide Summary** (from Briefings)
- Use for dependency classification, strategic rationale, and presentation data
- Validate extracted insights against briefing summaries

**Step 3: Build Dependency Graph (15 min)**
- Map project dependencies
- Classify HARD vs SOFT using dashboard data thresholds
- Identify license dependencies (Claude Enterprise Premium for Engineering)
- Identify blocking chains (what must complete before what)

**Step 4: Calculate Hybrid Scores (10 min)**
- For each project, calculate:
  - Multi-Factor Score (Financial, Strategic, Feasibility, Time-to-Value)
  - ROI Score
  - Final Score (70/30 weighted for Q1-Q2)
- Rank projects by final score

**Step 5: Run Constraint-Based Scheduler (15 min)**
- Reserve Q1 capacity for committed work:
  - OP-012, OP-013 (Hypergrowth - 80% of capacity)
  - OP-011 (Marketplace expansion - including Windows/.NET)
  - OP-008 (Law2Engine continuation from 40% prototype)
  - OP-000 Phase 1 (License activation - Engineering/Product first)
- Schedule Q2-Q4 projects based on:
  - Scores (highest first)
  - Dependencies (must be cleared)
  - Capacity (must fit within available eng-days)
- Generate what-if scenarios (add resources)

**Step 6: Generate Markdown Report (20 min)**
- Create `/docs/strategic-planning/2026-annual-plan.md`
- Populate all 8 main slides with content
- Populate appendix slides (A-G)
- Include presenter notes for each slide
- Include data source references

**Step 7: Review & Refine (30-60 min)**
- User reviews the markdown
- Identify gaps, inaccuracies, or missing context
- Iterate and refine content
- Validate roadmap makes sense given Q1 commitments

**Step 8: Generate PowerPoint (15 min)**
- Use `techco-powerpoint` skill to convert markdown → PPTX
- Apply TechCo Inc branding
- Save to `/docs/strategic-planning/2026-annual-plan.pptx`

**Step 9: Final Review (15 min)**
- Review PowerPoint output
- Identify any visual/formatting issues
- Make final adjustments if needed

**Total Time: ~2.5-3.5 hours**

---

### 7.2 Tools & Approach

**Analysis Tools:**
- Task tool with Explore agents (parallel analysis of project files)
- Read tool (for specific file extraction)
- Grep tool (for searching across files)

**Processing:**
- Structured thinking through scoring algorithm
- Manual dependency mapping with user validation
- Capacity modeling with realistic constraints

**Output Generation:**
- Write markdown to `/docs/strategic-planning/2026-annual-plan.md`
- Skill tool: `techco-powerpoint` for PPTX generation

**Iteration:**
- User reviews each major section (dependency graph, scores, schedule)
- Refine before moving to next section
- Incremental validation throughout

---

### 7.3 Decision Points (User Validation Required)

**Decision Point 1: Dependency Classification**
- Present extracted dependencies
- User validates HARD vs SOFT classification
- Confirm license dependencies for Engineering projects

**Decision Point 2: Project Scores**
- Show top 10 scored projects with rationale
- User validates scoring feels right
- Adjust weights if needed

**Decision Point 3: Q1 Committed Work**
- Confirm what's locked for Q1 (Hypergrowth, Marketplace, Law2Engine, etc.)
- Validate 72 eng-days capacity is realistic
- Adjust if needed

**Decision Point 4: Quarterly Roadmap**
- Review scheduled projects Q2-Q4
- Validate sequencing makes sense
- Adjust if priorities feel wrong

**Decision Point 5: Presentation Content**
- Review full markdown before PowerPoint generation
- Validate messaging, tone, data points
- Refine content and presenter notes

---

### 7.4 Post-Presentation (After CEO Meeting)

**After CEO presentation (January 6, 2026):**

1. **Capture Feedback**
   - Document Chris Murphy's questions and concerns
   - Note what resonated vs what needed more explanation
   - Identify presentation improvements

2. **Refine the Plan**
   - Incorporate CEO feedback
   - Update markdown and PPTX
   - Save as v2 in versions folder

3. **Design Automation Script**
   - Create `/scripts/generate-annual-plan.js`
   - Codify the algorithm executed manually
   - Make it repeatable for Q2 review

4. **Plan Dashboard Integration**
   - Design `/app/strategic-planning/page.jsx` tab
   - Interactive React presentation component
   - Quarterly review workflow UI

5. **Document Methodology**
   - This document serves as methodology reference
   - Update based on learnings from manual process
   - Make it transparent and auditable

---

### 7.5 Success Criteria

**The presentation is ready if:**
- ✓ Tells a compelling story (wins → challenges → plan)
- ✓ Roadmap is realistic given team capacity
- ✓ Dependencies are identified and sequenced correctly
- ✓ Data is accurate (drawn from actual project files and dashboard)
- ✓ Agility is clear (Q1 committed, Q2-Q4 subject to review)
- ✓ Presenter notes help answer anticipated questions
- ✓ Visual design is professional (TechCo Inc branding)
- ✓ Appendix has depth for detailed questions

**Chris Murphy should walk away with:**
- Confidence in the Agentic AI team's achievements
- Understanding of the strategic rationale
- Comfort with the quarterly review process
- Clarity on what's committed vs planned
- Excitement about the champion scaling model

---

## Section 8: Future Automation Architecture

Convert manual process into automated dashboard module for quarterly reviews.

---

### 8.1 Automation Script Architecture

**File: `/scripts/generate-annual-plan.js`**

High-level structure:

```javascript
const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

async function generateAnnualPlan() {
  // Step 1: Load and parse all project files
  const projects = await loadProjectFiles('/data/ai-projects/');

  // Step 2: Load dashboard data
  const dashboardData = JSON.parse(
    fs.readFileSync('app/ai-tools-data.json', 'utf8')
  );

  // Step 3: Extract dependencies
  const dependencyGraph = buildDependencyGraph(projects, dashboardData);

  // Step 4: Calculate scores
  const scoredProjects = projects.map(project => ({
    ...project,
    scores: calculateHybridScore(project, dashboardData, dependencyGraph),
  }));

  // Step 5: Run scheduler
  const roadmap = scheduleProjects(
    scoredProjects,
    dependencyGraph,
    getCapacityModel()
  );

  // Step 6: Generate markdown
  const markdown = generateMarkdown(roadmap, dashboardData, scoredProjects);
  fs.writeFileSync('/docs/strategic-planning/2026-annual-plan.md', markdown);

  // Step 7: Generate JSON output for dashboard
  const planData = {
    roadmap,
    scores: scoredProjects,
    dependencies: dependencyGraph,
    kpis: extractKPIs(dashboardData),
    generatedAt: new Date().toISOString(),
  };
  fs.writeFileSync('/docs/strategic-planning/2026-annual-plan.json',
    JSON.stringify(planData, null, 2)
  );

  console.log('✅ Annual plan generated successfully');
}
```

**Integration with existing refresh workflow:**
```bash
npm run refresh         # Refreshes dashboard data
npm run generate-plan   # Generates annual plan from latest data
```

---

### 8.2 Dashboard Tab Integration

**File: `/app/strategic-planning/page.jsx`**

High-level structure:

```jsx
import strategicPlanData from '@/docs/strategic-planning/2026-annual-plan.json';

export default function StrategicPlanningPage() {
  const [view, setView] = useState('quarterly'); // quarterly, timeline, tier, scorecard

  return (
    <div>
      {/* Navigation: Quarterly View | Timeline | Tiers | Scorecard */}
      <ViewSelector currentView={view} onChange={setView} />

      {/* Main Content */}
      {view === 'quarterly' && <QuarterlyRoadmap data={strategicPlanData} />}
      {view === 'timeline' && <TimelineView data={strategicPlanData} />}
      {view === 'tier' && <TierBasedView data={strategicPlanData} />}
      {view === 'scorecard' && <ScorecardView data={strategicPlanData} />}

      {/* KPI Dashboard */}
      <KPIDashboard
        projectKPIs={strategicPlanData.kpis.projects}
        portfolioKPIs={strategicPlanData.kpis.portfolio}
      />

      {/* Dependency Graph Visualization */}
      <DependencyGraph dependencies={strategicPlanData.dependencies} />

      {/* Actions */}
      <button onClick={() => exportToPowerPoint()}>
        Generate PowerPoint
      </button>
      <button onClick={() => exportToMarkdown()}>
        Export Markdown
      </button>
    </div>
  );
}
```

**Dashboard Navigation Update:**
Add "Strategic Planning" to main navigation alongside "Overview", "Briefings", "Tool Deep Dive", etc.

---

### 8.3 Interactive React Presentation

**File: `/app/strategic-planning/presentation.jsx`**

Keyboard-navigable, full-screen presentation mode:

```jsx
export default function InteractivePresentation({ slides }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showNotes, setShowNotes] = useState(false);

  // Keyboard navigation: Arrow keys, space bar, 'n' for notes
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'n') setShowNotes(!showNotes);
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, showNotes]);

  return (
    <div className="h-screen bg-gradient-to-br from-blue-900 to-blue-700">
      {/* Slide Content */}
      <SlideRenderer
        slide={slides[currentSlide]}
        brandingColors={techcoColors}
      />

      {/* Presenter Notes (toggle with 'n' key) */}
      {showNotes && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/90 p-6">
          <PresenterNotes notes={slides[currentSlide].presenterNotes} />
        </div>
      )}

      {/* Progress Indicator */}
      <div className="fixed bottom-4 right-4">
        {currentSlide + 1} / {slides.length}
      </div>
    </div>
  );
}
```

**TechCo Inc Branding:**
- Use company color palette
- Consistent typography
- Logo placement
- Chart styling matching dashboard

---

### 8.4 PowerPoint Export Pipeline

**Using `techco-powerpoint` skill:**

```javascript
async function exportToPowerPoint(planData) {
  // Step 1: Render React slides to structured markdown
  const markdown = renderSlidesToMarkdown(planData.slides);

  // Step 2: Use techco-powerpoint skill
  await Skill('techco-powerpoint', {
    markdown: markdown,
    outputPath: '/docs/strategic-planning/2026-annual-plan.pptx',
    branding: 'techco',
    template: 'executive-presentation',
  });

  console.log('✅ PowerPoint exported');
}
```

**Markdown format compatible with powerpoint skill:**
- Slide delimiter: `---`
- Slide title: `## Slide Title`
- Content: Bullets, tables, code blocks
- Presenter notes: Specified format per skill requirements
- Charts: Embed as images or data tables

---

### 8.5 Quarterly Review Workflow (Automated)

**Quarterly review process (Q2, Q3, Q4):**

```bash
# End of Q1 (March 2026)

# Step 1: Refresh dashboard with latest data
npm run refresh

# Step 2: Manually update project statuses
# Edit /data/ai-projects/OP-XXX files with:
# - Actual delivery dates
# - Adoption metrics
# - ROI realization
# - KPI status (green/yellow/red)

# Step 3: Re-generate annual plan (with updated data)
npm run generate-plan

# Step 4: Generate comparison report
npm run generate-quarterly-review --quarter Q1

# Output:
# /docs/strategic-planning/quarterly-reviews/Q1-2026-review.md
# - What changed in the plan
# - Projects that moved earlier/later
# - KPI scorecard
# - Recommendations for Q2

# Step 5: Generate PowerPoint for CEO review
npm run generate-plan-presentation
```

**Comparison algorithm:**
```javascript
function generateQuarterlyReview(previousPlan, newPlan) {
  const changes = {
    projectsMoved: compareSchedules(previousPlan.roadmap, newPlan.roadmap),
    kpiStatus: compareKPIs(previousPlan.kpis, newPlan.kpis),
    scoreChanges: compareScores(previousPlan.scores, newPlan.scores),
    recommendations: generateRecommendations(changes),
  };

  return renderQuarterlyReviewMarkdown(changes);
}
```

---

### 8.6 Data Storage & Version Control

**Versioning strategy:**

```
/docs/strategic-planning/
  ├── 2026-annual-plan.md              (latest version)
  ├── 2026-annual-plan.json            (latest data)
  ├── 2026-annual-plan.pptx            (latest presentation)
  ├── versions/
  │   ├── 2026-01-06-annual-plan.md    (initial version)
  │   ├── 2026-03-31-Q1-review.md      (after Q1 review)
  │   ├── 2026-06-30-Q2-review.md      (after Q2 review)
  │   └── 2026-09-30-Q3-review.md      (after Q3 review)
  └── quarterly-reviews/
      ├── Q1-2026-review.md            (what changed)
      ├── Q2-2026-review.md
      └── Q3-2026-review.md
```

**Git workflow:**
- Commit each version with descriptive message
- Tag releases: `git tag 2026-annual-plan-v1`
- Track changes over time for retrospectives

---

### 8.7 Future Enhancements (Phase 3+)

**Phase 3 (Q2-Q3 2026):**
- Real-time KPI tracking dashboard
- Project status updates via API (not manual markdown edits)
- Slack integration: Post quarterly reviews to `#agentic-ai` channel
- Email digests: Send KPI updates to stakeholders

**Phase 4 (Q4 2026+):**
- Predictive analytics: "Based on Q1-Q2 trends, OP-005 likely to deliver 120% of forecast ROI"
- What-if simulator: "If we delay OP-001 by 1 quarter, we can accelerate OP-008"
- Natural language queries: "Which projects are behind schedule?" → AI answers
- Integration with Jira/Linear: Auto-sync project status

**Phase 5 (2027+):**
- Multi-year planning (2026-2028 roadmap)
- Portfolio optimization AI: "Recommend best portfolio given constraints"
- Competitor benchmarking: "How does our AI adoption compare to industry?"

---

## Appendix: Decision Log

**Key Decisions Made During Design:**

1. **Adaptive Scoring Weights:** 70/30 Q1-Q2, 60/40 Q3-Q4 (Multi-Factor/ROI)
   - Rationale: ROI data uncertainty in early quarters

2. **Simple Capacity Model:** Engineering days over complex role-based
   - Rationale: Simplicity, team is mostly fungible

3. **Q1 Champion Testing:** Lucas (BDR), Brett (Engineering), Sara (Product)
   - Rationale: Validate model before scaling in Q2

4. **Presentation Priority:** Option B (Quarterly View) for main, others in appendix
   - Rationale: CEO preference unknown, cover all bases

5. **Strategic Rationale First:** Celebrate wins before diving into plan
   - Rationale: CEO doesn't fully understand Agentic AI team's achievements yet

6. **Dashboard Briefings as Validation:** Use existing summaries to validate findings
   - Rationale: Consistency check, leverages existing AI-generated content

---

## Changelog

**Version 1.0 (January 5, 2026)**
- Initial design document created
- All 8 sections complete
- Ready for implementation

---

*End of Methodology Document*
