# TechCo Inc AI Dashboard

**Purpose**: Interactive executive dashboard that reports on AI tool adoption and provides optimization recommendations through data analysis and sentiment insights.

**Core Problem**: Executives lack understanding of AI tool differentiation and struggle to justify costs. Need continuous insights to optimize spend, improve adoption, and maximize ROI.

**What It Does**: Reports key metrics + AI-driven optimization recommendations

**Current State**: Next.js dashboard with batch-processed data pipeline
- **✅ Modular architecture**: 15 tabs extracted, page.jsx reduced 86% (6,248 → 836 lines)
- **✅ Component-based**: Layout, shared, and tab components in `/app/components/`
- **✅ Connectors & Projects Analytics**: Integration usage and project sophistication tracking (PR #49)
- 15/15 tabs fully data-driven (ALL tabs migrated ✅)
- AI-generated insights using Claude API (15-24 per refresh)
- Collapsible sidebar navigation with submenu support
- Multi-tool sentiment analysis (context-aware attribution)
- Hybrid Premium allocation (behavioral + department baselines)
- Portfolio detail views with breadcrumb navigation
- Phase 2 rollout tracker (Engineering: active)
- 2026 Annual Plan presentation (9 slides, dynamic)
- Email alias resolution (21+ mappings)
- Department mapping from org chart (16 departments, 258 employees)
- M365 Copilot integration (238 active users tracked)
- Claude Enterprise integration tracking (14 integrations, 3,876 calls)

**Target State**: Dynamic dashboard with:
- Real-time usage metrics
- Slack sentiment analysis (6 channels)
- Continuous optimization insights

## 🚨 ALWAYS READ FIRST 🚨
**`/docs/SESSION_RESUME.md`** - Active work, current todos, and session context
**`/docs/architecture/`** - Architecture Decision Records (ADRs) - all architectural decisions documented

## Quick Start for Claude Code Sessions
1. **READ `/docs/SESSION_RESUME.md`** - Current active work and session history
2. **READ `/docs/architecture/`** - Architecture Decision Records (ADRs) - understand decisions made
   - ADR-001: Dashboard Architecture (foundation)
   - ADR-003: Sidebar Navigation Pattern (PR #22)
   - ADR-006: Hybrid Premium Seat Allocation
   - ADR-007: Multi-Tool Sentiment Attribution (PR #16)
   - ADR-011: Monolith Breakup Strategy ✅ IMPLEMENTED
3. Review `.claude/CALCULATIONS.md` for critical business logic (⚠️ IMPORTANT!)
4. Review `.claude/AI-RECOMMENDATIONS.md` for AI analysis strategy
5. Check `.claude/ROADMAP.md` for current phase and priorities

## Data Refresh Process
To refresh dashboard data with latest files from `/data/`:
- **Use slash command**: `/refresh-data` (recommended - interactive workflow)
- **Use npm script**: `npm run refresh`
- **Use bash script**: `./scripts/refresh-data.sh`
- **See full documentation**: `/docs/guides/DATA_REFRESH.md`

The refresh process is fully automated, data-driven, and idempotent:
- Reads license counts from `/data/license_config.csv` (no hardcoded values)
- Auto-discovers data files by pattern (Claude Enterprise ZIPs, M365 CSVs, etc.)
- Extracts Connectors/Integrations data from conversations.json via jq streaming
- Processes Projects data with sophistication scoring and categorization
- Regenerates all 15-24 AI insights using Claude API
- Writes unified `app/ai-tools-data.json` - all 15 tabs update automatically

## Key Files & Architecture

### ✅ Modular Component Structure (ADR-011 Implemented)
**Main Orchestrator:**
- `/app/page.jsx` - Dashboard orchestrator (836 lines, reduced from 6,248)

**Layout Components** (`/app/components/layout/`):
- `DashboardLayout.jsx` - Main layout wrapper with sidebar + content
- `DashboardHeader.jsx` - Logo, breadcrumbs, GitHub link
- `SidebarNavigation.jsx` - Collapsible sidebar with nav groups

**Shared Components** (`/app/components/shared/`):
- `MetricCard.jsx` - Reusable KPI display component
- `MarkdownRenderer.jsx` - Bold text parser for AI insights
- `ClaudeCodePowerUsersTable.jsx`, `ClaudeCodeKeyInsights.jsx`, `ClaudeCodeLowEngagementUsers.jsx`

**Tab Components** (`/app/components/tabs/` - 15 files):
- `OverviewHome.jsx`, `ClaudeEnterprise.jsx`, `ProductivityToolsComparison.jsx`
- `ExpansionROI.jsx`, `M365Copilot.jsx`, `CodingToolsComparison.jsx`
- `PerceivedValue.jsx`, `Portfolio.jsx`, `ClaudeCode.jsx`
- `BriefingOrg.jsx`, `BriefingLeadership.jsx`, `Enablement.jsx`
- `ClaudeIntegrations.jsx` (NEW - integration usage analytics)
- `ClaudeProjects.jsx` (NEW - project sophistication analytics)
- `AnnualPlan.jsx` (wrapper for AnnualPlanPresentation)

**Other Components:**
- `/app/components/AnnualPlanPresentation.jsx` - 2026 Annual Plan (850+ lines)
- `/app/components/PortfolioTable.jsx` - Project portfolio table
- `/app/components/ProjectDetail.jsx` - Project detail views

**Data & Scripts:**
- `/app/ai-tools-data.json` - Generated unified data (240KB, regenerated via scripts)
- `/app/ai-projects-details.json` - Project portfolio data (20KB)
- `/scripts/parse-hierarchy.js` - Org chart parser, email alias resolution
- `/scripts/parse-copilot-data.js` - Main data aggregation pipeline (1,000+ lines)
- `/scripts/parse-project-details.js` - Project markdown → JSON parser
- `/scripts/generate-insights.js` - AI-powered insight generation (Claude API)
- `/scripts/extract-multi-tool-sentiment.js` - Context-aware sentiment analysis

**Documentation:**
- `/data/` - Raw data files (CSVs, JSONs) - see ADR-001 for structure
- `/docs/architecture/` - Architecture Decision Records (6 ADRs documenting all decisions)
- `/backups/modularization-2026-01-07/` - Backup of original page.jsx for reference

## Critical Business Rules (Initial Defaults - AI Can Recommend Changes)
- Engineering: 100% get Claude Code Premium (only way to get enterprise license)
- Other departments: ~10% get Premium seats (power users)
- Pricing: Premium $200/mo, Standard $40/mo, GitHub Copilot $19/mo
- ⚠️ **ALL OTHER METRICS MUST BE CALCULATED** from data - no hardcoded constants
- AI analyzes if these rules are still optimal and recommends adjustments

## Strategic Priorities
**See `.claude/ROADMAP.md`** for detailed roadmap, progress tracking, and implementation plans.

**Current Phase**: Connectors & Projects Analytics complete ✅ | Compliance API Research next 🎯

**Key Focus Areas**:
- ✅ Modular component architecture (ADR-011 complete)
- ✅ Connectors & Projects Analytics (PR #49 complete)
- 🔬 Anthropic Compliance API research (Claude Code skills tracking)
- Data-driven architecture (all tabs use generated data)
- AI-powered insights and optimization recommendations
- Continuous sentiment analysis from Slack channels
- Expansion planning and ROI optimization

## AI Tools Landscape at TechCo Inc
- **Claude Enterprise**: 115 licenses (41 Premium, 74 Standard), chat/projects/artifacts/integrations
- **Claude Code**: Active users (Premium only), terminal-based coding
- **M365 Copilot**: 251 licenses, 238 active users (95% adoption), Word/Excel/Teams/PowerPoint
- **GitHub Copilot**: 46 engineers @ $19/mo, IDE-integrated coding assistant
- **ChatGPT**: Shadow IT usage tracked via ZScaler

**New Analytics (January 2026)**:
- **Connectors/Integrations**: 14 MCP integrations tracked, 3,876 total calls, 71 users with usage
- **Projects**: 182 Claude projects tracked, 46 creators, sophistication scoring

## Slack Sentiment Data Sources (Continuous)
Monitor these channels for real-time insights:
- `#claude-code-dev` - Engineering feedback, wins, issues
- `#claude-enterprise` - General adoption, use cases, questions
- `#ai-collab` - Cross-functional collaboration, best practices
- `#techco-thrv` - Company-wide discussions, strategic insights
- `#as-ai-dev` - AI development team coordination, technical insights
- `#technology` - Technical evaluations, budget discussions
