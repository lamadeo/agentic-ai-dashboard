# Documentation Index

Welcome to the TechCo Inc AI Dashboard documentation. This index helps you navigate all documentation files and understand where to find what you need.

---

## 🚀 Start Here

### New to the Project?
1. **[CONTRIBUTING.md](../CONTRIBUTING.md)** - How to contribute (data updates, development, deployment)
2. **[SESSION_RESUME.md](./SESSION_RESUME.md)** - Current active work and session context
3. **[Main README](../README.md)** - Project overview and quick start

### Starting a Claude Code Session?
1. **[SESSION_RESUME.md](./SESSION_RESUME.md)** - Active work, current todos, session history
2. **[architecture/](./architecture/)** - Architecture Decision Records (ADRs)
3. **[../.claude/ROADMAP.md](../.claude/ROADMAP.md)** - Detailed roadmap and progress tracking

---

## 📁 Directory Structure

```
/docs/
├── README.md                    # This file - documentation index
├── SESSION_RESUME.md            # Active work tracker (read first!)
│
├── architecture/                # Architecture Decision Records (ADRs)
│   ├── ADR-001-ai-tools-dashboard-architecture.md
│   ├── ADR-002-organizational-chart-data-architecture.md
│   ├── ADR-003-sidebar-navigation-pattern.md
│   ├── ADR-006-hybrid-premium-seat-allocation.md
│   ├── ADR-007-multi-tool-sentiment-attribution.md
│   └── ADR-011-monolith-breakup-strategy.md
│
├── guides/                      # How-to guides and setup instructions
│   ├── DATA_REFRESH.md
│   ├── SLACK_SETUP_CHECKLIST.md
│   ├── PERCEIVED_VALUE_IMPLEMENTATION_PLAN.md
│   └── CLAUDE_SEATS_UPDATE_PROCESS.md
│
├── planning/                    # Planning documents and implementation plans
│   ├── 01 - vercel-app-implementation-plan.md
│   ├── 02 - hybrid-premium-allocation-plan.md
│   └── archived/                # Completed planning docs
│
├── strategic-planning/          # Strategic planning and annual planning
│   ├── 2026-annual-plan.md
│   ├── methodology.md
│   └── projects/                # Individual project plans
│
├── data/                        # Raw data files (CSVs, JSONs, ZIPs)
│   ├── license_config.csv
│   ├── org-chart/
│   ├── claude-enterprise/
│   ├── m365-copilot/
│   ├── github-copilot/
│   ├── claude-code/
│   ├── ai-projects/
│   └── slack-sentiment/
│
└── archived/                    # Historical and superseded documents
    ├── superseded/              # Superseded architecture docs
    │   ├── DATA_ARCHITECTURE.md
    │   ├── PERCEIVED_VALUE_ARCHITECTURE.md
    │   └── SENTIMENT_PIPELINE_ARCHITECTURE.md
    ├── REFACTORING_PLAN_CLAUDE_TABS.md
    └── ORG_CHART_VERIFICATION_REPORT.md
```

---

## 📖 Documentation Categories

### Architecture Decision Records (ADRs)
Documents all architectural decisions with context, alternatives considered, and consequences.

- **[ADR-001: Dashboard Architecture](./architecture/ADR-001-ai-tools-dashboard-architecture.md)** - Foundation architecture
- **[ADR-002: Org Chart Architecture](./architecture/ADR-002-organizational-chart-data-architecture.md)** - Single source of truth for employee data
- **[ADR-003: Sidebar Navigation](./architecture/ADR-003-sidebar-navigation-pattern.md)** - Collapsible sidebar pattern (PR #22)
- **[ADR-006: Hybrid Premium Allocation](./architecture/ADR-006-hybrid-premium-seat-allocation.md)** - Behavioral scoring algorithm
- **[ADR-007: Multi-Tool Sentiment](./architecture/ADR-007-multi-tool-sentiment-attribution.md)** - Context-aware sentiment analysis (PR #16)
- **[ADR-011: Monolith Breakup](./architecture/ADR-011-monolith-breakup-strategy.md)** - Component modularization strategy (next priority)

### How-To Guides
Step-by-step instructions for common tasks.

- **[DATA_REFRESH.md](./guides/DATA_REFRESH.md)** - How to refresh dashboard data
- **[SLACK_SETUP_CHECKLIST.md](./guides/SLACK_SETUP_CHECKLIST.md)** - Setting up Slack API integration
- **[PERCEIVED_VALUE_IMPLEMENTATION_PLAN.md](./guides/PERCEIVED_VALUE_IMPLEMENTATION_PLAN.md)** - Sentiment analysis implementation
- **[CLAUDE_SEATS_UPDATE_PROCESS.md](./guides/CLAUDE_SEATS_UPDATE_PROCESS.md)** - Updating Claude license counts

### Strategic Planning
Annual planning, methodology, and project specifications.

- **[2026 Annual Plan](./strategic-planning/2026-annual-plan.md)** - Strategic planning methodology
- **[Portfolio Projects](./data/ai-projects/)** - AI project specifications (OP-000 through OP-014)
- **[Methodology](./strategic-planning/methodology.md)** - Scoring and prioritization approach

### Active Work Tracking
Current work, session context, and todos.

- **[SESSION_RESUME.md](./SESSION_RESUME.md)** - Active work tracker (source of truth)
- **[../.claude/ROADMAP.md](../.claude/ROADMAP.md)** - Detailed roadmap and progress tracking
- **[DOCUMENTATION_CLEANUP_PLAN.md](./DOCUMENTATION_CLEANUP_PLAN.md)** - Current documentation cleanup plan
- **[MISSING_ADRS_ANALYSIS.md](./MISSING_ADRS_ANALYSIS.md)** - Analysis of architectural decisions needing ADRs

---

## 🔍 Finding What You Need

### I want to...

**Update dashboard data**
→ [guides/DATA_REFRESH.md](./guides/DATA_REFRESH.md) or [CONTRIBUTING.md](../CONTRIBUTING.md)

**Understand a past architectural decision**
→ [architecture/](./architecture/) - Browse ADRs

**Know what we're working on right now**
→ [SESSION_RESUME.md](./SESSION_RESUME.md)

**See the roadmap and future plans**
→ [../.claude/ROADMAP.md](../.claude/ROADMAP.md)

**Contribute code or data**
→ [CONTRIBUTING.md](../CONTRIBUTING.md)

**Deploy to Vercel**
→ [CONTRIBUTING.md](../CONTRIBUTING.md#deployment)

**Set up Slack integration**
→ [guides/SLACK_SETUP_CHECKLIST.md](./guides/SLACK_SETUP_CHECKLIST.md)

**Understand current implementation**
→ [architecture/ADR-001](./architecture/ADR-001-ai-tools-dashboard-architecture.md)

**Plan a new feature**
→ [planning/](./planning/) - Review similar plans first

**Find AI project specs**
→ [data/ai-projects/](./data/ai-projects/)

---

## 📝 Document Types

### ADRs (Architecture Decision Records)
**Format**: Context → Decision → Alternatives → Consequences
**When to create**: Before implementing architectural changes
**Location**: `/docs/architecture/`

### How-To Guides
**Format**: Step-by-step instructions with examples
**When to create**: Common tasks that need documentation
**Location**: `/docs/guides/`

### Planning Documents
**Format**: Implementation plans with phases and tasks
**When to create**: Before starting significant features
**Location**: `/docs/planning/`

### Strategic Planning
**Format**: Methodology, scoring, project specifications
**When to create**: Annual planning cycles
**Location**: `/docs/strategic-planning/`

---

## 🔄 Document Lifecycle

1. **Active** - Current work, reference frequently (SESSION_RESUME.md, ADRs)
2. **Reference** - Stable documentation (guides, architecture)
3. **Archived** - Historical or superseded (`/docs/archived/`)

### When to Archive
- Document superseded by newer version
- Implementation completed and documented in ADR
- Historical reference only, no longer actionable

---

## 🤝 Contributing to Documentation

### Adding New Documentation
1. Determine document type (ADR, guide, plan)
2. Place in appropriate directory
3. Update this index (docs/README.md)
4. Link from main README.md or CONTRIBUTING.md if relevant

### Updating Existing Documentation
1. Follow existing format and structure
2. Add "Last Updated" date at top
3. Update links if file moved/renamed
4. Archive superseded versions

### Creating ADRs
See existing ADRs for format examples:
- Context: Why are we making this decision?
- Decision: What did we decide?
- Alternatives Considered: What options did we evaluate?
- Consequences: What are the trade-offs?

---

**Questions?** Check [CONTRIBUTING.md](../CONTRIBUTING.md) or ask in `#as-ai-dev` Slack channel.
