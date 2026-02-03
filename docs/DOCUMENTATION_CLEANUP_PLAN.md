# Documentation Cleanup Plan

**Branch**: `feature/docs-cleanup`
**Created**: January 7, 2026
**Purpose**: Reorganize and update documentation to reflect current codebase state

---

## 🎯 Goals

1. **Accuracy**: Ensure all documentation reflects the current implemented state
2. **Organization**: Clear structure with logical grouping
3. **Maintainability**: Easy to find and update documentation
4. **Remove Cruft**: Archive or delete outdated/superseded files

---

## 📊 Current State Analysis

### Root Directory
- **README.md**: ❌ **OUTDATED**
  - Says 9 tabs (should be 11)
  - Wrong port (3000 vs 3001)
  - Says "8/9 tabs data-driven" (all 11 are now)
  - Missing: Sidebar navigation, Portfolio detail views, Phase 2 tracker
  - Missing: 2026 Annual Plan presentation tab

### /docs/ Root (12 files)
- ✅ **SESSION_RESUME.md** - Active, current, accurate
- ✅ **ADR-001-ai-tools-dashboard-architecture.md** - Good, foundational
- ✅ **ADR-002-organizational-chart-data-architecture.md** - Good, foundational
- ⚠️ **DATA_REFRESH.md** - Missing parser scripts documentation
- ⚠️ **DATA_ARCHITECTURE.md** - May overlap with ADRs, needs review
- ⚠️ **PERCEIVED_VALUE_ARCHITECTURE.md** - 92KB, may be outdated/superseded
- ⚠️ **SENTIMENT_PIPELINE_ARCHITECTURE.md** - 49KB, may overlap with PERCEIVED_VALUE
- ✅ **PERCEIVED_VALUE_IMPLEMENTATION_PLAN.md** - Current, accurate
- ⚠️ **REFACTORING_PLAN_CLAUDE_TABS.md** - Completed work, should be archived
- ⚠️ **CLAUDE_SEATS_UPDATE_PROCESS.md** - May be outdated
- ✅ **SLACK_SETUP_CHECKLIST.md** - Current, accurate
- ⚠️ **ORG_CHART_VERIFICATION_REPORT.md** - Point-in-time, archive?

### /docs/plan/ (18 files)
- ✅ **01 - vercel-app-implementation-plan.md** - Foundational, keep
- ⚠️ **02-expansion-roi-migration-plan.md** - Completed? Review status
- ⚠️ **02 - copilot-vs-claude-code-analysis.md** - Completed, archive?
- ⚠️ **03-m365-copilot-deep-dive-tab.md** - Completed, archive?
- ⚠️ **03 - engineering-sentiment-copilot-vs-claude.md** - Completed, archive?
- ⚠️ **03-dynamic-roi-prioritization-plan.md** - Status unclear
- ⚠️ **03-incremental-roi-framework.md** - Status unclear
- ⚠️ **04 - coding-tools-tab-content.md** - Completed, archive?
- ⚠️ **04-incremental-roi-ui-updates.md** - Status unclear
- ⚠️ **05 - static-tabs-migration-plan.md** - Completed, archive?
- ✅ **BREAKING_MONOLITH_IMPROVEMENTS_GUIDE.md** - Active, keep
- ⚠️ **DASHBOARD_UX_RECOMMENDATIONS.md** - Status unclear
- ⚠️ **NAVIGATION_IMPLEMENTATION_PLAN.md** - Completed? (sidebar done)
- ⚠️ **NAVIGATION_UX_MOCKUPS.md** - Completed? (sidebar done)
- ⚠️ **OVERVIEW_LANDING_PAGE_DESIGN.md** - Completed, archive?
- ⚠️ **OVERVIEW_LANDING_PAGE_DESIGN_APPROVED.md** - Duplicate? Archive?
- ⚠️ **PERCEIVED_VALUE_UX.md** - Status unclear
- ✅ **portfolio-project-detail-views-implementation.md** - Recently completed

### /docs/analysis/ (2 files)
- ⚠️ **M365_ARTIFACTS_DATA_ANALYSIS.md** - Point-in-time analysis, archive?
- ⚠️ **M365_ARTIFACTS_FIX_SUMMARY.md** - Completed work, archive?

### /docs/backup/
- 1 file: `expansion-roi-hardcoded-data.json` - Keep for reference or delete?

### /docs/strategic-planning/ (2 files + subdirs)
- ✅ **2026-annual-plan.md** - Current, keep
- ✅ **methodology.md** - Current, keep
- **working-data/** - Keep (generated data)
- **versions/** - Check if needed
- **quarterly-reviews/** - Check if needed

### /.claude/ (11 files)
- ✅ **claude.md** (CLAUDE.md) - Active, but needs review
- ⚠️ **AI-RECOMMENDATIONS.md** - Needs review for accuracy
- ⚠️ **ARCHITECTURE.md** - May overlap with /docs/ADR-001, review
- ⚠️ **CALCULATIONS.md** - Needs review for accuracy
- ⚠️ **CONVENTIONS.md** - Needs review
- ⚠️ **DATA-SOURCES.md** - Needs review for accuracy
- ⚠️ **PROJECT.md** - Needs review
- ⚠️ **ROADMAP.md** - Likely outdated (says Phase 2 95% complete)
- ✅ **settings.local.json** - Keep
- **commands/** - Check contents

---

## 🗂️ Proposed New Structure

```
/docs/
├── README.md                          # Quick overview, points to SESSION_RESUME
├── SESSION_RESUME.md                  # ✅ Active work tracker (keep as-is)
│
├── architecture/                      # Architecture Decision Records
│   ├── ADR-001-dashboard-architecture.md
│   ├── ADR-002-org-chart-architecture.md
│   └── README.md                      # Index of all ADRs
│
├── guides/                            # How-to guides
│   ├── DATA_REFRESH.md               # Updated with all parsers
│   ├── SLACK_SETUP.md                # Slack API setup
│   └── DEVELOPMENT.md                # Local dev, deployment
│
├── planning/                          # Active and future planning
│   ├── BREAKING_MONOLITH_GUIDE.md    # Active work
│   ├── portfolio-detail-views.md     # Recently completed
│   └── archived/                      # Completed planning docs
│       ├── 01-vercel-implementation.md
│       ├── 02-expansion-roi-migration.md
│       ├── 03-m365-deep-dive.md
│       ├── 04-coding-tools-tab.md
│       ├── 05-static-tabs-migration.md
│       ├── navigation-implementation.md
│       ├── overview-landing-page.md
│       └── refactoring-claude-tabs.md
│
├── strategic-planning/                # ✅ Annual planning (keep as-is)
│   ├── 2026-annual-plan.md
│   ├── methodology.md
│   ├── working-data/
│   ├── quarterly-reviews/
│   └── versions/
│
├── data/                              # ✅ Raw data files (keep as-is)
│   ├── ai-projects/
│   ├── claude-monthly-data/
│   ├── license_config.csv
│   └── ...
│
└── archived/                          # Historical documents
    ├── analysis/
    │   ├── M365_ARTIFACTS_ANALYSIS.md
    │   └── M365_ARTIFACTS_FIX.md
    ├── point-in-time/
    │   └── ORG_CHART_VERIFICATION_REPORT.md
    └── superseded/
        ├── DATA_ARCHITECTURE.md
        ├── PERCEIVED_VALUE_ARCHITECTURE.md
        └── SENTIMENT_PIPELINE_ARCHITECTURE.md

/.claude/                              # Claude Code session context
├── claude.md                          # ✅ Main project instructions
├── CALCULATIONS.md                    # Business logic (review & update)
├── AI-RECOMMENDATIONS.md              # AI strategy (review & update)
├── DEVELOPMENT_GUIDE.md               # Consolidate CONVENTIONS + dev practices
├── settings.local.json                # ✅ Keep
└── archived/                          # Superseded context files
    ├── ARCHITECTURE.md                # Superseded by /docs/architecture/ADR-*
    ├── DATA-SOURCES.md                # Superseded by ADR-001
    ├── PROJECT.md                     # Integrate into claude.md
    └── ROADMAP.md                     # Superseded by SESSION_RESUME
```

---

## 📋 Cleanup Tasks

### 1. Update README.md
**Status**: Critical, outdated
**Actions**:
- [ ] Update tab count to 11 (add Portfolio, Annual Plan)
- [ ] Fix port number to 3001
- [ ] Update "Current State" section (all tabs data-driven, sidebar navigation)
- [ ] Add new features: Portfolio detail views, Phase 2 tracker, Annual Plan
- [ ] Update architecture diagram (add new parsers)
- [ ] Update roadmap section (Phase 2 complete, Phase 3 next)
- [ ] Fix data sources list (add latest Claude data files)

### 2. Consolidate /docs/ Root Files
**Status**: Important
**Actions**:
- [ ] Create `/docs/architecture/` directory
- [ ] Move ADR-001 and ADR-002 to `/docs/architecture/`
- [ ] Create `/docs/guides/` directory
- [ ] Move DATA_REFRESH.md, SLACK_SETUP_CHECKLIST.md to `/docs/guides/`
- [ ] Update DATA_REFRESH.md with missing parsers
- [ ] Create `/docs/archived/` directory
- [ ] Move completed analysis docs to `/docs/archived/analysis/`
- [ ] Move large architecture docs to `/docs/archived/superseded/`
- [ ] Create `/docs/README.md` as documentation index

### 3. Reorganize /docs/plan/
**Status**: Important
**Actions**:
- [ ] Rename `/docs/plan/` → `/docs/planning/`
- [ ] Create `/docs/planning/archived/` subdirectory
- [ ] Review each plan document status
- [ ] Move completed plans to archived/ with updated status
- [ ] Keep only active planning docs in root
- [ ] Rename files to remove numbering prefixes (easier maintenance)

### 4. Update .claude/ Files
**Status**: Critical for Claude Code sessions
**Actions**:
- [ ] Review and update `claude.md` (CLAUDE.md)
  - Update current state (11 tabs, sidebar navigation)
  - Update roadmap references
  - Add strategic planning references
- [ ] Review and update `CALCULATIONS.md`
  - Verify all business logic is current
  - Add Phase 2 rollout calculations
- [ ] Review and update `AI-RECOMMENDATIONS.md`
  - Add portfolio insight generation
  - Add annual plan analysis strategy
- [ ] Create `DEVELOPMENT_GUIDE.md` (consolidate CONVENTIONS + best practices)
- [ ] Archive superseded files:
  - ARCHITECTURE.md → link to /docs/architecture/ instead
  - DATA-SOURCES.md → integrated into ADR-001
  - PROJECT.md → integrate into claude.md
  - ROADMAP.md → use SESSION_RESUME instead

### 5. Create Documentation Index
**Status**: Nice-to-have
**Actions**:
- [ ] Create `/docs/README.md` with clear index
- [ ] Categorize all documents by purpose
- [ ] Add "Start here" guidance for different personas
- [ ] Link to SESSION_RESUME as source of truth

### 6. Clean Up Temp/Backup Directories
**Status**: Low priority
**Actions**:
- [ ] Review `/docs/backup/` contents
- [ ] Delete or move to archived/
- [ ] Review `/data/temp/` and `/data/old/`
- [ ] Clean up duplicate Claude data directories

### 7. Verify Against Codebase
**Status**: Important
**Actions**:
- [ ] Check all code references in docs match actual files
- [ ] Verify all component names are correct
- [ ] Verify all script names and paths
- [ ] Verify all data file patterns
- [ ] Test all documented commands

---

## 🚀 Execution Plan

### Phase 1: Critical Updates (1-2 hours)
1. Update README.md with current state
2. Update .claude/claude.md with current features
3. Update .claude/CALCULATIONS.md if needed
4. Update DATA_REFRESH.md with missing parsers

### Phase 2: Restructure (1-2 hours)
1. Create new directory structure
2. Move ADR files to /docs/architecture/
3. Move guides to /docs/guides/
4. Reorganize /docs/plan/ → /docs/planning/
5. Archive completed planning docs

### Phase 3: Consolidate & Archive (1 hour)
1. Archive superseded architecture docs
2. Archive completed analysis docs
3. Archive superseded .claude/ files
4. Clean up backup/temp directories

### Phase 4: Create Index & Test (30 mins)
1. Create /docs/README.md index
2. Verify all cross-references work
3. Test all documented commands
4. Final review

---

## ✅ Success Criteria

- [ ] README.md accurately describes current implementation
- [ ] All active documentation is easy to find
- [ ] Completed work is archived, not deleted (historical reference)
- [ ] .claude/ folder has only current, accurate context
- [ ] Documentation structure is logical and maintainable
- [ ] All code references in docs are accurate
- [ ] New contributors can easily find what they need

---

## 📝 Notes

- **Keep SESSION_RESUME.md as-is**: It's the source of truth for active work
- **Don't delete**: Move to archived/ for historical reference
- **Update links**: Ensure all cross-references work after moves
- **Test commands**: Verify all npm scripts, bash commands work as documented
