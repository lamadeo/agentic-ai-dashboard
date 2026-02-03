# Implementation Roadmap

**Last Updated**: January 26, 2026
**Current State**: Tier 3 Complete ✅ | Connectors & Projects Analytics Complete ✅ | Tier 4 Next 🎯

---

## ✅ Connectors & Projects Analytics Complete (January 2026)

**Goal**: Add comprehensive analytics for Claude Enterprise Connectors/Integrations and Projects

### What Was Delivered (PR #49)

#### Data Pipeline (Phase 1-2)
- [x] **Connectors Ingestor** - Stream-parse conversations.json for MCP tool_use records
- [x] **Connectors Processor** - User/department metrics, power user identification
- [x] **Connectors Aggregator** - Dashboard-ready data with trends
- [x] **Projects Processor** - Sophistication scoring, categorization
- [x] **Projects Aggregator** - Creator leaderboards, featured projects

#### Dashboard Views (Phase 3)
- [x] **Claude Integrations Tab** - Integration usage rankings, department heatmap, power users
- [x] **Claude Projects Tab** - Project analytics, categories, creator leaderboards
- [x] **Navigation Restructure** - Claude Enterprise submenu with 4 items

#### Key Metrics (January 2026)
| Metric | Value |
|--------|-------|
| Integration Calls | 3,876 |
| Unique Integrations | 14 |
| Users with Integration Usage | 71 |
| Total Projects | 182 |
| Project Creators | 46 |

#### Phase 4: Compliance API Research (PENDING)
- [ ] Research Anthropic Compliance API for Claude Code skills/plugins tracking
- [ ] Evaluate local instrumentation options
- [ ] Design data pipeline for skills analytics

---

## ✅ Tier 3 Complete (January 2026): Monolith Breakup

**Goal**: Break up 6,237-line `page.jsx` monolith into modular component architecture

### What Was Delivered (ADR-011)

- [x] All 13 tabs extracted to `/app/components/tabs/`
- [x] Shared components extracted to `/app/components/shared/`
- [x] Layout components extracted to `/app/components/layout/`
- [x] Main `page.jsx` reduced to 836 lines (from 6,248 - 86% reduction)
- [x] Collapsible sidebar navigation with submenu support
- [x] All tabs render identically to before

---

## ✅ Phase 2 Complete (Dec 2025 - Jan 2026): Data-Driven Architecture

**Goal**: Migrate from hardcoded static dashboard to fully data-driven architecture with AI insights

### What Was Delivered

#### Core Architecture
- [x] **All 11 tabs data-driven** from `ai-tools-data.json` (100% migration complete)
- [x] **AI-generated insights** using Claude API (15-24 insights per refresh, ~$0.10 cost)
- [x] **Email alias resolution** (12+ aliases handled automatically)
- [x] **Department mapping** from org chart hierarchy (16 departments, 251 employees)
- [x] **License configuration** CSV-based (no hardcoded constants)
- [x] **Batch processing pipeline** with `npm run refresh` command

#### New Features (6 Major)
1. **Sidebar Navigation** (PR #22, Jan 7)
   - Horizontal tabs → Collapsible sidebar (64px expanded → 16px collapsed)
   - 7 navigation groups, 11 total tabs
   - Smooth transitions, icon-based navigation
   - Scalable for 15+ future tabs

2. **Multi-Tool Sentiment Analysis** (PR #16, Jan 5)
   - Context-aware attribution using Claude API
   - Fixed M365 vs GitHub Copilot conflation
   - Corrected scores: M365 38/100 (was 75), GitHub 33/100 (was 20)
   - Multi-tool support: One message → multiple tool attributions

3. **Hybrid Premium Seat Allocation** (PR #21, Jan 7)
   - Behavioral scoring (0-115pts) + Department baselines (0-100%)
   - Engineering 100% Premium (Claude Code requirement)
   - Other departments: 10-35% by role complexity
   - Automated recommendations by department

4. **Portfolio Detail Views** (PR #21, Jan 7)
   - Clickable project names in portfolio table
   - 5 projects with comprehensive detail views
   - Breadcrumb navigation: Home → Portfolio → Project
   - Markdown rendering for executive summaries

5. **Phase 2 Rollout Tracker** (PR #21, Jan 7)
   - Live tracking: Engineering 19/77 seats (25% complete)
   - Progress bar with status indicators
   - Target: 77/77 by Q1 2026 end
   - Automatic calculation on each refresh

6. **2026 Annual Plan Presentation** (PR #20, Jan 6)
   - Interactive 8-slide presentation
   - Full-screen mode (F key), keyboard navigation
   - Portfolio integration (Slide 9)
   - Methodology: Hybrid scoring, dependency analysis, capacity planning

### Data Pipeline
```
Raw Data (500KB)
  ├─ M365 Copilot: 16 CSV files
  ├─ Claude Enterprise: 33 JSON files
  ├─ GitHub Copilot: 1 JSON file
  ├─ Claude Code: 2 CSV files
  ├─ Org Chart: 1 JSON (251 employees)
  └─ License Config: 1 CSV
       ↓
  parse-hierarchy.js (12+ alias resolution)
       ↓
  parse-copilot-data.js (1,000+ lines aggregation)
       ↓
  generate-insights.js (Claude API, 15-24 insights)
       ↓
  ai-tools-data.json (240KB unified output)
       ↓
  Dashboard (11 tabs, all data-driven)
```

### Key Metrics (Jan 2026)
| Tool | Licensed | Active | Adoption | Sentiment |
|------|----------|--------|----------|-----------|
| Claude Enterprise | 87 (13P, 74S) | 75 | 86% | 85/100 |
| Claude Code | 11 (Premium only) | 12 | 109% | 94/100 |
| M365 Copilot | 251 | 238 | 95% | 38/100 |
| GitHub Copilot | 46 | 46 | 100% | 33/100 |

**Key Insights**:
- Claude Code: 17.6x productivity vs GitHub Copilot
- Claude Enterprise: 4.9x engagement vs M365 Copilot
- GitHub Copilot: 72% prefer Claude model (in multi-model setup)
- **Recommendation**: Sunset GitHub Copilot March 2026, save $21.5K/year

---

---

## 🔮 Tier 4 (Q2 2026): Database Layer

**Goal**: Convert from static JSON to database-backed real-time application

**Why Not Urgent**:
- Monthly updates sufficient for executive decisions
- Static JSON performs well (240KB, <100ms load)
- Must complete Tier 3 (monolith breakup) first

### Implementation Plan

#### Database Schema (Vercel Postgres + Prisma)

**Core Tables**:
```sql
-- Users & Organization
users (email, department, team, title, is_current)
departments (name, baseline_premium_pct, headcount)

-- Tool Usage History
tool_usage_history (user_id, tool, metric, value, date)
-- Enables multi-year trend analysis

-- Projects & Portfolio
projects (projectId, name, score, tier, status, value, roi)
project_phases (projectId, phase_name, timeline, deliverables)
project_kpis (projectId, metric, target_value)

-- Expansion & Recommendations
expansion_snapshot (dept, behavioral_score, baseline, recommended_seats, date)
rollout_tracking (dept, target_seats, current_seats, progress_pct, date)

-- Sentiment & Feedback
feedback (tool, department, sentiment_score, message, source, channel, date)
```

#### Implementation Phases
1. **Phase 1** (1 week): Database setup, schema creation, migrations
2. **Phase 2** (1 week): Data ingestion pipelines (CSV → database)
3. **Phase 3** (1 week): API routes for all metrics
4. **Phase 4** (1 week): Frontend updates to use API instead of JSON
5. **Phase 5** (1 week): Real-time updates, historical views, trend analysis

### Benefits of Database Layer
- **Historical Analysis**: Multi-year trends, not just latest month
- **Real-Time Updates**: When APIs available (Anthropic, Microsoft, GitHub)
- **Advanced Filtering**: Date range, department, tool, user queries
- **Predictive Analytics**: Trend analysis, forecasting, recommendations
- **Audit Trail**: Track all data changes, who updated what when

**Timeline**: 5-6 weeks (after Tier 3 complete)
**Effort**: ~150-200 hours
**Priority**: Medium (nice-to-have, not blocking)

---

## 🚀 Tier 5 (Q3-Q4 2026): Automation & Expansion

**Goal**: Automate data collection, expand tool coverage, add predictive analytics

### Automation

#### Slack API Integration
- [ ] Set up Slack Bot Token and channel permissions
- [ ] Implement automated message collection (6 channels)
- [ ] Weekly sentiment analysis batch job
- [ ] Real-time sentiment trends

**See**: `/docs/guides/SLACK_SETUP_CHECKLIST.md` for setup guide

#### Scheduled Data Refresh
- [ ] Vercel Cron job for daily/weekly updates
- [ ] Automated CSV/JSON ingestion from cloud storage
- [ ] Email alerts on data refresh failures
- [ ] Dashboard status page (last update, data freshness)

### Tool Expansion
- [ ] **ChatGPT tracking** via ZScaler logs
- [ ] **Gemini** usage (if adopted)
- [ ] **Perplexity** usage (if adopted)
- [ ] **Custom LLM** tracking (if self-hosted models)

**Target**: 15-20 tools tracked by end of 2026

### Predictive Analytics
- [ ] **Adoption forecasting**: Predict future active users by department
- [ ] **Churn prediction**: Identify users at risk of abandoning tools
- [ ] **ROI forecasting**: Predict future value based on usage trends
- [ ] **Expansion recommendations**: AI suggests next departments to target
- [ ] **Cost optimization**: AI identifies underutilized licenses

---

## 📋 Immediate Todos (This Week)

### High Priority

1. [ ] **Obtain January 2026 Claude Enterprise Export** (~15 min)
   - Current data only has Jan 1-7, missing Jan 8-31
   - Download from Claude Enterprise admin console
   - Run `npm run refresh` to update Connectors/Projects analytics

2. [ ] **Research Anthropic Compliance API** (~2-4 hours)
   - Investigate if audit logs exist for Claude Code skills/plugins
   - Contact Anthropic support for API documentation
   - Evaluate feasibility for tracking custom skills usage

3. [ ] **Configure Slack API for Automated Collection** (~4 hours)
   - Set up Slack Bot Token with channel permissions
   - Implement automated message collection for 6 channels
   - Create weekly sentiment analysis batch job

### Medium Priority

4. [ ] **Complete portfolio detail views** (~2-3 hours)
   - 5/11 projects have details (OP-000, 001, 005, 011, 014)
   - Missing: OP-002, 004, 006, 008, 012, 013
   - Create markdown files for remaining 6 projects

5. [ ] **Implement snapshot tracking** (~1-2 hours)
   - Track Phase 2 rollout progress over time
   - Historical data capture on each refresh
   - Delta calculation, weekly growth rate

---

## ⏸️ Deferred / Not Planned

### URL Deep Linking (Portfolio)
- **Why Deferred**: State-based navigation works fine
- **Trade-off**: Can't share links to specific projects
- **Priority**: Low (enhancement, not critical)

### Micro-Frontends Architecture
- **Why Rejected**: Too complex for 11-tab dashboard
- **Alternative**: Modular components (Tier 3) provides benefits without complexity
- **Priority**: Not planned

### Real-Time Streaming Pipeline
- **Why Deferred**: Data sources don't support real-time APIs
- **Alternative**: Batch processing sufficient for monthly trends
- **Priority**: Low (future when APIs available)

---

## 📊 Progress Tracking

### Connectors & Projects Analytics: 100% Complete ✅
- Connectors data pipeline: Complete (ingestor, processor, aggregator)
- Projects data pipeline: Complete (processor, aggregator)
- Dashboard views: 2/2 complete (ClaudeIntegrations, ClaudeProjects)
- Navigation restructure: Complete (Claude Enterprise submenu)
- Compliance API research: Pending (Phase 4)

### Tier 3 Progress: 100% Complete ✅
- Monolith breakup: Complete (ADR-011)
- All 13 tabs extracted to components
- page.jsx reduced from 6,248 → 836 lines (86%)
- Sidebar navigation with submenu support

### Phase 2 Progress: 100% Complete ✅
- Dashboard tabs: 13/13 complete (100%)
- AI insights: 15-24 per refresh (operational)
- Sentiment analysis: Multi-tool attribution (operational)
- Portfolio: 5/11 projects with detail views (45%)
- Annual plan: Complete with dynamic presentation (100%)

### Tier 4 Progress: 0% Complete
- Database layer: Not started
- Target start: Q2 2026

---

## 🎯 Success Metrics

### Phase 2 (Complete)
- [x] 100% of tabs use generated data (not hardcoded)
- [x] <$0.50 per dashboard refresh (AI insights cost)
- [x] <5 minutes refresh time (acceptable for monthly updates)
- [x] Accurate sentiment scores (multi-tool attribution)
- [x] Phase 2 rollout tracker operational

### Tier 3 (Complete ✅)
- [x] Main page.jsx < 1000 lines (836 lines, from 6,248 - 86% reduction)
- [x] All 13 tabs extracted as separate components
- [x] Shared components library created
- [x] Layout components (sidebar, header) modularized
- [x] Build succeeds with no errors

### Tier 4 (Target)
- [ ] Historical data: 12+ months of trends
- [ ] API response time: < 500ms per endpoint
- [ ] Real-time updates: < 5 minute delay when APIs available
- [ ] Query performance: < 100ms for standard filters

---

**For Detailed Planning**: See `/docs/planning/` directory for implementation guides

**For Architecture Decisions**: See `/docs/architecture/` for ADRs
