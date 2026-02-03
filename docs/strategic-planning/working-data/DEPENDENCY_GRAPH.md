# Project Dependency Graph - 2026 Annual Plan

**Created:** January 5, 2026
**Purpose:** Map dependencies between AI projects to inform scheduling

---

## Dependency Classification Rules

### HARD Dependencies (Blockers)
- **Productivity multiplier > 10x** (e.g., Claude Code 17.6x vs GitHub Copilot)
- **Engagement multiplier > 4x** (e.g., Claude Enterprise 8.4x vs M365)
- **Perceived value gap > 30 points** (e.g., Claude Enterprise 85 vs M365 38 = 47 points)
- **Adoption rate > 80%** on core team
- **Explicit statements:** "requires," "depends on," "must have," "prerequisite"
- **Architecture dependencies:** One project provides infrastructure for another

### SOFT Dependencies (Nice-to-Have)
- **Productivity multiplier < 10x**
- **Engagement multiplier < 4x**
- **Perceived value gap < 30 points**
- **Statements:** "benefits from," "enhanced by," "recommended," "optional"

---

## Foundation Layer (Tier 0) - Must Complete First

### OP-000: Claude Enterprise/Code Expansion
**Status:** Proposed (Phase 1 for Q1)
**Dependencies:** None (foundational)
**Enables:** ALL projects below
**Phases:**
- **Phase 1 (Q1):** Activate 26 unused Premium licenses for Engineering/Product
  - Training/enablement
  - Windows/.NET tooling (Marketplace)
  - Target: 42% → 70%+ Claude Code adoption
- **Phase 2 (Q2+):** Expand to Sales/Marketing/CS departments

**Why Foundational:**
- 17.6x productivity multiplier (HARD dependency threshold: >10x)
- 94/100 perceived value
- Engineering needs effective AI tools before building AI projects

---

### OP-011: Claude Code Marketplace
**Status:** Active (30 plugins, needs expansion)
**Dependencies:**
- **HARD:** OP-000 Phase 1 (Claude Enterprise Premium licenses for Engineering)
  - Reason: 17.6x productivity, marketplace built on Claude Code
**Enables:**
- OP-004 (AI Proposal Generator) - templates
- OP-006 (PS Time-to-Value) - playbook generators
- OP-008 (Law2Engine) - plugin architecture
- OP-005 (BDR Platform) - shared patterns

**Q1 Focus:**
- Windows/.NET expansion (enable all Engineering)
- Plugin library growth (15 → 30 plugins)

**Why Foundational:**
- Architecture layer for plugin-based AI solutions
- Enables community/champion model
- Prevents duplicate development across teams

---

### OP-014: Operational Data Foundation
**Status:** Proposed (Q1 2026 launch, 10-week MVP)
**Dependencies:**
- **HARD:** None (greenfield project)
- **SOFT:** OP-011 (Marketplace) for data connectors/plugins
**Enables:**
- OP-001 (Deal Intelligence) - revenue trends, deal prioritization
- OP-002 (Ops Knowledge) - customer-specific context
- OP-004 (Proposals) - usage benchmarks for ROI models
- OP-005 (BDR Platform) - customer firmographics (+10-12% conversion)
- OP-006 (PS TTV) - implementation patterns (+15-20% efficiency)
- OP-012 (Leave Planning) - active lives data for volume estimates
- OP-013 (Case Management) - customer health data for intelligent routing

**Why Foundational:**
- Unified data infrastructure (NetSuite, Salesforce, Platform)
- Enables data-driven AI features across 7+ projects
- Claude Enterprise AI layer for analytics

---

## Product Foundation (Tier 0) - Hypergrowth Commitment

### OP-012: Leave Planning Tool V1
**Status:** Proposed (June 2026 launch, Hypergrowth commitment)
**Dependencies:**
- **SOFT:** OP-014 (Data Foundation) for active lives data
- **HARD:** Claude Enterprise (AI conversational UX)
**Commitment:** 80% of Agentic AI team capacity in Q1-Q2

**Why Tier 0:**
- Core product feature (not internal tool)
- CEO-mandated priority
- Competitive differentiation (AI-native leave planning)

---

### OP-013: AI-Powered Case Management
**Status:** Proposed (June 2026 launch, Hypergrowth commitment)
**Dependencies:**
- **HARD:** OP-014 (Data Foundation) for customer health, intelligent routing
- **HARD:** Claude Enterprise (conversational AI)
**Commitment:** 80% of Agentic AI team capacity in Q1-Q2

**Why Tier 0:**
- Core product feature
- Enables downmarket expansion (SMB/mid-market)
- First-mover AI-native case management

---

## Revenue Generation (Tier 1)

### OP-005: BDR Intelligence Platform
**Status:** Planning (Q1-Q3 2026 phased rollout)
**Dependencies:**
- **SOFT:** OP-000 Phase 2 (Sales/Marketing licenses)
  - Reason: Can start with M365 AI Agents (already working: BDR Cold Outreach Builder, MEDDPICC Coach)
  - Upgrade path: M365 → Claude Enterprise for 8.4x engagement improvement
- **SOFT:** OP-014 (Data Foundation) for customer firmographics (+10-12% conversion)
- **SOFT:** OP-011 (Marketplace) for shared patterns/plugins
**Champion:** Lucas Melgaard (20% capacity)

**Why Soft on Claude Licenses:**
- BDRs successfully using M365 Copilot AI Agents (318 responses, 10 users)
- Claude Enterprise 8.4x better but not blocking (< 10x threshold)
- Perceived value gap: 85 vs 38 = 47 points (> 30 points suggests strong upgrade case)
- Can implement with M365, migrate to Claude in Q2

**Enablement Burden:**
- Small team (15-20 BDRs) = feasible Q1
- Lucas championing = reduced training burden

---

### OP-001: Deal Intelligence Platform
**Status:** Proposed (Q4 2026, dependent on external vendor)
**Dependencies:**
- **HARD:** Gong MCP integration (external vendor, launched Oct 2025, needs maturity)
- **SOFT:** OP-000 Phase 2 (Sales licenses)
- **SOFT:** OP-014 (Data Foundation) for revenue trends, deal prioritization

**Why Q4:**
- External dependency (Gong) needs to mature
- Sales team enablement burden (high)
- Q4 allows time for Gong MCP stabilization

---

### OP-004: AI Proposal Generator
**Status:** Proposed (Q2 2026)
**Dependencies:**
- **SOFT:** OP-011 (Marketplace) for templates
- **SOFT:** OP-014 (Data Foundation) for usage benchmarks (+8-10% win rate)
- **HARD:** Claude Enterprise (AI backbone)

**Why Q2:**
- Depends on Marketplace templates
- Synergies with OP-005 (shared ROI engine saves $20K)

---

## Customer Retention (Tier 2)

### OP-002: Operations Knowledge Agent
**Status:** Proposed (Q2 2026)
**Dependencies:**
- **HARD:** Claude Enterprise (replacing failed M365 Copilot agent)
- **SOFT:** OP-014 (Data Foundation) for customer-specific context (+5-10% relevance)

**Why Claude is HARD:**
- Replacement of failed M365 Copilot solution (129 sessions, poor accuracy)
- Perceived value gap: 85 vs 38 = 47 points
- Needs superior accuracy for operational knowledge

---

### OP-006: PS Time-to-Value Accelerator
**Status:** Proposed (Q2-Q3 2026)
**Dependencies:**
- **SOFT:** OP-011 (Marketplace) for playbook generators
- **SOFT:** OP-014 (Data Foundation) for implementation patterns (+15-20% efficiency)
- **HARD:** Claude Enterprise for knowledge discovery
**Champion:** Sara Johnson (Product, potential)

---

## Product Innovation (Tier 0 continued)

### OP-008: Law2Engine (Compliance Automation)
**Status:** 60% Complete (v1 branch prototype)
**Dependencies:**
- **HARD:** OP-011 (Marketplace) - plugin architecture required
- **HARD:** OP-014 (Data Foundation) - compliance data access
- **HARD:** Claude Enterprise (AI legal analysis)

**Why Q1 Continuation:**
- Already 60% built (sunk cost)
- High strategic value (competitive differentiation)
- Small continuation effort (vs starting new project)

---

## Dependency Graph Visualization

```
FOUNDATION LAYER (Tier 0 - Q1 Priority)
┌─────────────────────────────────────────────────────────────┐
│ OP-000 Phase 1: Claude Enterprise/Code (Engineering/Product)│
│ Status: Proposed | Effort: 15 eng-days                      │
│ Enables: ALL projects below                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴─────────────┬──────────────────────────┐
        │                          │                          │
        ▼                          ▼                          ▼
┌──────────────┐          ┌──────────────┐          ┌──────────────┐
│  OP-011      │          │  OP-014      │          │ OP-012/013   │
│ Marketplace  │          │ Data Found.  │          │ Hypergrowth  │
│ (Active)     │          │ (Proposed)   │          │ (Committed)  │
│ 25 eng-days  │          │ 60 eng-days  │          │ 80% capacity │
└──────┬───────┘          └──────┬───────┘          └──────────────┘
       │                         │
       │    ┌────────────────────┴────────────────────┐
       │    │                                          │
       ▼    ▼                                          ▼
┌─────────────────┐                         ┌─────────────────┐
│   OP-008        │                         │   OP-005        │
│  Law2Engine     │                         │ BDR Platform    │
│ (60% Complete)  │                         │  (Planning)     │
│  30 eng-days    │                         │ 120 eng-days    │
└─────────────────┘                         └─────────────────┘

       ▼                                          ▼
┌─────────────────┐                         ┌─────────────────┐
│   OP-004        │                         │   OP-001        │
│  Proposals      │                         │ Deal Intel.     │
│  (Proposed)     │                         │ (Q4 - Gong dep.)│
└─────────────────┘                         └─────────────────┘

       ▼                                          ▼
┌─────────────────┐                         ┌─────────────────┐
│   OP-002        │                         │   OP-006        │
│ Ops Knowledge   │                         │  PS TTV         │
│  (Proposed)     │                         │  (Proposed)     │
└─────────────────┘                         └─────────────────┘

LEGEND:
━━━ HARD Dependency (blocking)
─── SOFT Dependency (enhancing)
```

---

## Dependency Summary Table

| Project | HARD Dependencies | SOFT Dependencies | Blocks |
|---------|------------------|-------------------|--------|
| **OP-000 Phase 1** | None | None | ALL projects |
| **OP-011** | OP-000 Phase 1 | None | OP-004, OP-006, OP-008 |
| **OP-014** | None | OP-011 | OP-001, OP-002, OP-004, OP-005, OP-006, OP-012, OP-013 |
| **OP-012** | Claude Enterprise | OP-014 | None |
| **OP-013** | OP-014, Claude Enterprise | None | None |
| **OP-008** | OP-011, OP-014, Claude Enterprise | None | None |
| **OP-005** | None | OP-000 Phase 2, OP-014, OP-011 | None |
| **OP-001** | Gong MCP | OP-000 Phase 2, OP-014 | None |
| **OP-004** | Claude Enterprise | OP-011, OP-014 | None |
| **OP-002** | Claude Enterprise | OP-014 | None |
| **OP-006** | Claude Enterprise | OP-011, OP-014 | None |

---

## Critical Path Analysis

### Q1 Blockers (Must Complete)
1. **OP-000 Phase 1** - Activate Engineering/Product licenses (15 eng-days)
2. **OP-011 Expansion** - Windows/.NET support (25 eng-days)
3. **OP-014 MVP** - Data Foundation 10-week sprint (60 eng-days)
4. **OP-012/013** - Hypergrowth commitments (80% capacity, parallel work)

**Total Q1 Capacity Used:** 72 eng-days (20% of team) + Hypergrowth (80%)

### Q2 Unblocked (Dependencies Cleared)
- OP-005 (BDR Platform) - can start with M365, Data Foundation enhances
- OP-004 (Proposals) - Marketplace templates ready, Data Foundation enhances
- OP-002 (Ops Knowledge) - Claude Enterprise proven, Data Foundation enhances
- OP-006 (PS TTV) - Marketplace playbooks ready

### Q3-Q4 Unblocked
- OP-008 (Law2Engine) - Marketplace + Data Foundation complete
- OP-001 (Deal Intelligence) - Gong MCP matured, Data Foundation ready

---

## License Dependencies - Special Attention

### Claude Enterprise Premium (Includes Claude Code)
- **Current:** 45 licenses, 19 active (42% adoption) ⚠️
- **Wasted Capacity:** 26 unused licenses = $5,200/month
- **Q1 Priority:** Activate unused licenses via training + Marketplace expansion
- **Critical for:** Engineering team (83 employees, 76 seats, need 100% coverage)

### OP-000 Phase 1 Success Criteria
- Claude Code adoption: 42% → 70%+ among Engineers
- Windows/.NET engineers enabled (Marketplace)
- Training completed, champions identified
- **Outcome:** Engineering ready to build AI projects

---

*End of Dependency Graph*
