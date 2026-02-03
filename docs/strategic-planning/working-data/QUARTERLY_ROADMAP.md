# 2026 Quarterly Roadmap - Agentic AI Team

**Generated:** January 5, 2026
**Team Size:** 6 people (Q1-Q2), 7 people (Q2+ with Data Engineer hire)
**Constraint:** 80% capacity committed to Hypergrowth (OP-012/013) in Q1-Q3

---

## Capacity Model

### Q1 2026 (January-March)
- **Team:** 6 people
- **Available:** 20% (80% on Hypergrowth)
- **Core Capacity:** 6 × 60 days × 20% = **72 eng-days**
- **Champion Capacity:** 0 (testing Lucas, Brett, Sara)
- **Total:** 72 eng-days

### Q2 2026 (April-June)
- **Team:** 7 people (+ Data Engineer hire)
- **Available:** 20% (80% on Hypergrowth)
- **Core Capacity:** 7 × 60 days × 20% = **84 eng-days**
- **Champion Capacity:**
  - Plugin/Marketplace: 80% champion-led = +60 eng-days
  - Data/Infrastructure: 20% champion-led = +15 eng-days
  - BDR/Domain: 60% champion-led (Lucas) = +45 eng-days
- **Total:** 84 + 120 = **204 eng-days**

### Q3 2026 (July-September)
- **Team:** 7 people
- **Available:** ~40% (Hypergrowth major milestone complete)
- **Core Capacity:** 7 × 60 days × 40% = **168 eng-days**
- **Champion Capacity:**
  - Plugin projects: +120 eng-days
  - Data projects: +30 eng-days
  - Domain-specific: +90 eng-days
- **Total:** 168 + 240 = **408 eng-days**

### Q4 2026 (October-December)
- **Team:** 7 people
- **Available:** ~60% (Hypergrowth stabilized)
- **Core Capacity:** 7 × 60 days × 60% = **252 eng-days**
- **Champion Capacity:** ~360 eng-days (1.5x Q3)
- **Total:** 252 + 360 = **612 eng-days**

---

## Q1 2026: Foundation & Hypergrowth (COMMITTED)

**Status:** 100% capacity allocated
**Focus:** Enable Engineering, build foundations, deliver Hypergrowth

### Committed Projects (72 eng-days)

#### OP-000 Phase 1: Claude Enterprise/Code Expansion (Engineering/Product)
- **Effort:** 15 eng-days
- **Deliverables:**
  - Activate 26 unused Premium licenses
  - Training program (leverage existing Anthropic content)
  - Windows/.NET enablement plan (via Marketplace)
  - Champion identification (Brett, Sara confirmed)
- **Success Criteria:** Claude Code adoption 42% → 70%+
- **Dependencies:** None
- **Owner:** CAO + Operations team

#### OP-011: Marketplace Windows/.NET Expansion
- **Effort:** 25 eng-days
- **Deliverables:**
  - Windows compatibility layer
  - .NET-specific plugins (5-10 new)
  - Engineering team onboarding
  - Plugin library: 30 → 45 plugins
- **Success Criteria:** All Engineering teams can use Marketplace
- **Dependencies:** OP-000 Phase 1 (parallel execution)
- **Owner:** Agentic AI team

#### OP-008: Law2Engine Prototype Continuation
- **Effort:** 20 eng-days
- **Deliverables:**
  - Continue from 60% → 75% completion
  - Test harness implementation
  - PostgreSQL database setup
  - Authentication system
- **Success Criteria:** 75% complete, production-ready blockers identified
- **Dependencies:** OP-011 (plugin architecture), OP-014 (data access) - will complete in Q1
- **Owner:** Agentic AI team + Legal SME

#### OP-014: Operational Data Foundation MVP
- **Effort:** 12 eng-days (week 1-2 of 10-week sprint, Data Engineer starts mid-Q1)
- **Deliverables:**
  - 10-week MVP sprint kickoff
  - NetSuite connector
  - Salesforce connector (MCP integration)
  - Initial data models
- **Success Criteria:** MVP foundation laid, Data Engineer onboarded
- **Dependencies:** None (greenfield)
- **Owner:** Data Engineer (new hire) + Agentic AI support

**Total Q1 Core Projects:** 72 eng-days (100% of available capacity)

### Hypergrowth Projects (Parallel - 80% Capacity)
- **OP-012:** Leave Planning Tool V1
- **OP-013:** AI-Powered Case Management

**Q1 Review Gate (March 31, 2026):**
- OP-000 Phase 1: Claude Code adoption metrics
- OP-011: Windows engineering adoption
- OP-014: MVP sprint progress
- Champion model validation (Lucas, Brett, Sara contributions)
- Decision: Proceed to Q2 plan or adjust

---

## Q2 2026: Revenue Generation & Data Foundation (PLANNED)

**Status:** Subject to Q1 review
**Capacity:** 204 eng-days (84 core + 120 champion)
**Focus:** Complete Data Foundation, launch BDR Platform, expand champions

### Planned Projects (190 eng-days allocated, 14 buffer)

#### OP-014: Data Foundation Production Expansion (Continuation)
- **Effort:** 48 eng-days (weeks 3-10 of MVP, then production expansion)
- **Deliverables:**
  - Complete 10-week MVP sprint
  - Platform connector (product usage data)
  - Claude Enterprise AI layer
  - Metric catalog for AI queries
  - Production infrastructure
- **Success Criteria:** Production-ready, 3 data sources connected
- **Dependencies:** Q1 kickoff complete
- **Owner:** Data Engineer + Agentic AI

#### OP-005 Phase 1: BDR Intelligence Platform Quick Wins
- **Effort:** 60 eng-days (Lucas 20% + champions ~40 days)
- **Deliverables:**
  - OP-016: Tech Stack Mapper (pilot with 5 BDRs)
  - OP-011: Champion Tracker (pilot)
  - Integration with M365 AI Agents (BDR Cold Outreach Builder, MEDDPICC Coach)
  - Slack alerting system
- **Success Criteria:** 5 BDRs using tools, +10% response rate improvement
- **Dependencies:** SOFT on OP-000 Phase 2 (can use M365 initially)
- **Owner:** Lucas Melgaard (20%) + CAO support
- **Champion Capacity:** 45 eng-days (Lucas-led, domain-specific)

#### OP-011 Phase 2: Plugin Library Expansion
- **Effort:** 40 eng-days (mostly champion-led)
- **Deliverables:**
  - 15 new plugins (45 → 60 total)
  - Plugin marketplace UI improvements
  - Documentation and training materials
- **Success Criteria:** 3-4 departments actively using, 100 WAU
- **Dependencies:** Q1 Windows/.NET expansion complete
- **Owner:** Brett (champion-led) + Agentic AI support
- **Champion Capacity:** 60 eng-days (plugin projects, 80% champion-led)

#### OP-000 Phase 2: Sales/Marketing License Expansion
- **Effort:** 20 eng-days
- **Deliverables:**
  - Expand Claude Enterprise to Sales (20-30 users)
  - Expand to Marketing (15-20 users)
  - Training and enablement
  - Champion program launch (formal structure)
- **Success Criteria:** Sales/Marketing 60%+ adoption within 30 days
- **Dependencies:** Q1 Phase 1 success, budget approval
- **Owner:** CAO + Operations

#### OP-002: Operations Knowledge Agent (Pilot)
- **Effort:** 22 eng-days
- **Deliverables:**
  - Claude Enterprise project setup
  - Confluence and SharePoint connectors
  - Pilot with #the-rock-stars channel members
  - Content audit and gap identification
- **Success Criteria:** >70 perceived value score, replaces failed M365 agent
- **Dependencies:** OP-000 Phase 1 (Claude Enterprise proven)
- **Owner:** Operations team + Agentic AI

**Total Q2 Allocated:** 190 eng-days (93% capacity utilized)
**Buffer:** 14 eng-days for overruns or emerging priorities

**Q2 Review Gate (June 30, 2026):**
- OP-014: Data Foundation production-ready?
- OP-005 Phase 1: BDR quick wins validated?
- Champion model: Is it scaling as expected?
- Hypergrowth: OP-012/013 on track for June launch?
- Decision: Adjust Q3-Q4 based on results

---

## Q3 2026: Scale & Production Launches (PLANNED)

**Status:** Subject to Q2 review
**Capacity:** 408 eng-days (168 core + 240 champion)
**Focus:** Production launches, scale BDR platform, expand product features

### Planned Projects (385 eng-days allocated, 23 buffer)

#### OP-008: Law2Engine Production Launch
- **Effort:** 90 eng-days
- **Deliverables:**
  - Complete 75% → 100% (production-ready)
  - Production infrastructure deployment
  - Legal team training and adoption
  - Customer pilot program (3-5 customers)
- **Success Criteria:** GA launch, 3 customers using, cost savings realized
- **Dependencies:** OP-011 (Q1 complete), OP-014 (Q2 complete)
- **Owner:** Agentic AI team + Legal SME

#### OP-005 Phase 2: BDR Intelligence Full Platform
- **Effort:** 120 eng-days (60 core + 60 champion)
- **Deliverables:**
  - Expand to all 6 integrated solutions:
    - OP-018: Trigger Event Intelligence
    - OP-017: Leave Volume Estimator
    - OP-012: Hiring Monitor
    - OP-015: Compliance Risk Predictor
  - Scale from 5 → 15 BDRs
  - Migrate from M365 to Claude Enterprise (if OP-000 Phase 2 successful)
- **Success Criteria:** 15 BDRs using, $1M+ ARR pipeline generated
- **Dependencies:** OP-005 Phase 1 success (Q2)
- **Owner:** Lucas Melgaard + CAO + champions
- **Champion Capacity:** 90 eng-days (domain-specific, Lucas-led community)

#### OP-006: PS Time-to-Value Accelerator
- **Effort:** 85 eng-days (60 core + 25 champion)
- **Deliverables:**
  - Standardized playbooks (Confluence integration)
  - Automated knowledge discovery (SharePoint + Jira)
  - New-hire onboarding system
  - Pilot with PS team (37 employees)
- **Success Criteria:** -30% implementation time, +10 CSAT points
- **Dependencies:** OP-011 (playbook generators), OP-014 (implementation patterns)
- **Owner:** Sara Johnson (champion) + Agentic AI
- **Champion Capacity:** 60 eng-days (product features, 40% champion-led)

#### OP-004: AI Proposal Generator (Start)
- **Effort:** 50 eng-days (planning + initial build)
- **Deliverables:**
  - Requirements gathering with Sales
  - Salesforce integration architecture
  - ROI calculator engine (shared with OP-005, saves $20K)
  - Prototype with 3-5 AEs
- **Success Criteria:** Prototype validated, AEs see time savings
- **Dependencies:** OP-011 (templates), OP-014 (usage benchmarks)
- **Owner:** Agentic AI team + Sales

#### Hypergrowth Maintenance
- **Effort:** 40 eng-days (OP-012/013 post-launch support, 40% → 20% of capacity)

**Total Q3 Allocated:** 385 eng-days (94% capacity utilized)
**Buffer:** 23 eng-days

**Q3 Review Gate (September 30, 2026):**
- OP-008: Law2Engine GA launched successfully?
- OP-005: BDR platform delivering pipeline ROI?
- Champion community: Self-sustaining?
- Q3-Q4 capacity: Can we accelerate OP-001 (Deal Intelligence)?

---

## Q4 2026: Strategic Bets & Annual Planning (PLANNED)

**Status:** Subject to Q3 review
**Capacity:** 612 eng-days (252 core + 360 champion)
**Focus:** Deal Intelligence launch, expand product features, plan 2027

### Planned Projects (560 eng-days allocated, 52 buffer)

#### OP-001: Deal Intelligence Platform
- **Effort:** 180 eng-days
- **Deliverables:**
  - Gong MCP integration (assuming maturity by Q4)
  - Salesforce MCP integration
  - Claude Enterprise workflows (Monitor, Reviewer, Briefer, Ask Anything)
  - Pilot with 5-10 AEs
  - Training program for Sales team
- **Success Criteria:** Pilot shows +5-8 pt win rate improvement, cycle time reduction
- **Dependencies:** Gong MCP mature, OP-000 Phase 2 (Sales licenses), OP-014 (revenue data)
- **Owner:** Agentic AI + VP Sales (Michael Schwartz)
- **Risk:** Gong MCP may not be mature - have contingency plan

#### OP-002: Operations Knowledge Agent (Full Launch)
- **Effort:** 90 eng-days (expansion from Q2 pilot)
- **Deliverables:**
  - Expand from pilot → full Ops team (CS, PS, Support)
  - Additional connectors (if needed)
  - Integration with Slack for real-time queries
  - Measure results vs baseline
- **Success Criteria:** >70% adoption, time savings validated
- **Dependencies:** Q2 pilot success
- **Owner:** Operations team + champions

#### OP-004: AI Proposal Generator (Complete)
- **Effort:** 120 eng-days (complete from Q3 start)
- **Deliverables:**
  - Production launch to all AEs
  - Salesforce full integration
  - Template library (via Marketplace)
  - Training and enablement
- **Success Criteria:** 8-12 hrs → 2-3 hrs proposal time, +3-5 pt win rate
- **Dependencies:** Q3 prototype success
- **Owner:** Agentic AI + Sales

#### OP-013: Case Management Enhancements (Post-Launch)
- **Effort:** 60 eng-days (enhancements after June launch)
- **Deliverables:**
  - Feature enhancements based on customer feedback
  - Additional AI capabilities
  - Performance optimization
- **Dependencies:** June launch success
- **Owner:** Product + Agentic AI

#### Hypergrowth Support & Iteration
- **Effort:** 50 eng-days (ongoing support, now ~10% of capacity)

#### 2027 Annual Planning
- **Effort:** 60 eng-days
- **Deliverables:**
  - Refresh strategic plan using updated dashboard data
  - Q4 2026 results analysis
  - 2027 project portfolio prioritization
  - Budget planning for 2027
- **Owner:** CAO + Agentic AI team

**Total Q4 Allocated:** 560 eng-days (92% capacity utilized)
**Buffer:** 52 eng-days

**Q4 Review Gate (December 31, 2026):**
- Annual retrospective: What worked? What didn't?
- ROI validation: Did projects deliver forecasted value?
- 2027 Planning: Portfolio for next year
- Team scaling: Do we need to hire in 2027?

---

## Deferred / Not Scheduled

### Projects Not Fitting in 2026 Capacity

**OP-007:** Finance Forecasting & Scenario Planning
- **Reason:** Self-service tier, Finance can implement with Rippling AI
- **2027 Consideration:** Evaluate if needed or self-service sufficient

**OP-010:** HR Recruitment AI
- **Reason:** Self-service tier, HR can implement with Rippling AI
- **2027 Consideration:** Evaluate if needed or self-service sufficient

**OP-012 Phase 2:** Leave Planning Tool V2
- **Reason:** V1 launch in June, need usage data before V2
- **2027 Consideration:** Prioritize based on V1 adoption and feedback

**OP-013 Phase 2:** Case Management Advanced Features
- **Reason:** V1 launch in June, need market feedback
- **2027 Consideration:** Product roadmap decision based on customer demand

---

## What-If Scenarios

### Scenario A: Hire 2 Additional Engineers in Q2
- **Cost:** ~$300K (2 engineers × $150K annually, 9 months)
- **Capacity Unlock:**
  - Q2: +120 eng-days
  - Q3: +240 eng-days
  - Q4: +360 eng-days
  - **Total:** +720 eng-days

**Projects Enabled:**
- **OP-001** moves to Q3 (from Q4) - earlier Deal Intelligence launch
- **OP-004** completes in Q3 (from Q3-Q4) - faster Proposals launch
- **OP-007** (Finance Forecasting) added to Q4
- **OP-010** (HR Recruitment) added to Q4

**Value Unlock:** +$7M (OP-001 earlier by 1 quarter = +$1.75M, plus OP-007 + OP-010)
**ROI:** $7M / $300K = 2,233% incremental ROI

**Recommendation:** Strong case if budget allows, but not critical given champion model scaling

---

### Scenario B: Expand Champion Program Aggressively (Q1)
- **Approach:** Identify 10 champions by Q2 (vs 3-4 baseline)
- **Enablement Cost:** +30 eng-days for training (Q1-Q2)
- **Capacity Unlock:**
  - Q2: +200 eng-days (vs +120 baseline)
  - Q3: +400 eng-days (vs +240 baseline)
  - Q4: +600 eng-days (vs +360 baseline)
  - **Net Gain:** +560 eng-days (after training cost)

**Projects Enabled:**
- All deferred projects can be added
- 2027 ramp-up accelerated

**Risk:** Training burden on Agentic AI team, champion quality dilution
**Mitigation:** Marketplace must be rock-solid for self-service, rigorous champion selection

**Recommendation:** Test in Q1, scale in Q2 based on results

---

### Scenario C: Pause Hypergrowth (NOT RECOMMENDED)
- **Capacity Unlock:** +336 eng-days/quarter (80% → 20% freed)
- **Projects Enabled:** All 11 projects fit in Q1-Q2

**Risks:**
- CEO mandate violated
- Product roadmap delayed
- Competitive position weakened
- Revenue impact (Leave Planning + Case Management are product features)

**Recommendation:** DO NOT PURSUE - Hypergrowth is non-negotiable

---

### Scenario D: Delay OP-001 to 2027
- **Rationale:** Gong MCP needs more time to mature, Sales enablement burden high
- **Capacity Freed:** 180 eng-days in Q4
- **Alternative Use:**
  - Accelerate OP-004 (Proposals) to Q2
  - Add OP-007 (Finance) and OP-010 (HR) to Q4
  - More buffer for Hypergrowth post-launch support

**Risk:** Miss $5-7M opportunity in 2026
**Mitigation:** Start pilot in Q4, full launch Q1 2027 (only 3-month delay)

**Recommendation:** Keep OP-001 in Q4 but with Q4 go/no-go gate based on Gong MCP maturity

---

## Summary: 2026 Annual Plan

| Quarter | Core Capacity | Champion Capacity | Total Capacity | Allocated | Buffer |
|---------|--------------|-------------------|----------------|-----------|--------|
| **Q1** | 72 | 0 | 72 | 72 (100%) | 0 |
| **Q2** | 84 | 120 | 204 | 190 (93%) | 14 |
| **Q3** | 168 | 240 | 408 | 385 (94%) | 23 |
| **Q4** | 252 | 360 | 612 | 560 (92%) | 52 |
| **Total** | 576 | 720 | 1,296 | 1,207 (93%) | 89 |

**Projects Delivered in 2026:**
- **Q1:** OP-000 Phase 1, OP-011 Phase 1, OP-014 MVP, OP-008 continuation (6 projects/phases)
- **Q2:** OP-014 complete, OP-005 Phase 1, OP-011 Phase 2, OP-000 Phase 2, OP-002 pilot (5 projects/phases)
- **Q3:** OP-008 GA, OP-005 Phase 2, OP-006, OP-004 start (4 projects)
- **Q4:** OP-001, OP-002 full, OP-004 complete (3 projects)
- **Hypergrowth (Parallel):** OP-012, OP-013 (2 major products)

**Total:** 11 projects + 2 Hypergrowth products = **13 major deliverables**

**Portfolio Value:** $22.4M+ annual value potential
**Total Investment:** $1.3M (team costs, assuming no additional hires)
**Blended ROI:** ~1,723% (portfolio-weighted)

---

*End of Quarterly Roadmap*
