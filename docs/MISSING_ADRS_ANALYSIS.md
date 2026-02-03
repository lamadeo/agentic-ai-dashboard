# Missing ADRs Analysis

**Date**: January 7, 2026
**Based On**: Comprehensive codebase architecture exploration
**Purpose**: Identify architectural decisions implemented but not documented as ADRs

---

## Summary

Based on the codebase exploration, **8 significant architectural decisions** have been implemented but are NOT documented in ADR format:

1. **ADR-003**: Sidebar Navigation Pattern (PR #22)
2. **ADR-004**: Static JSON Import Strategy
3. **ADR-005**: Batch Processing vs Real-Time Architecture
4. **ADR-006**: Hybrid Premium Seat Allocation Algorithm
5. **ADR-007**: Multi-Tool Sentiment Attribution System
6. **ADR-008**: Portfolio Detail Views & Breadcrumb Navigation
7. **ADR-009**: License Configuration Management (CSV-based)
8. **ADR-010**: Org Chart as Single Source of Truth

Additionally, **1 planning document** should be converted to an ADR:
- **ADR-011**: Monolith Breakup Strategy (currently in `/docs/plan/BREAKING_MONOLITH_IMPROVEMENTS_GUIDE.md`)

---

## Missing ADRs - Detailed Analysis

### ADR-003: Sidebar Navigation Pattern

**Status**: ✅ IMPLEMENTED (PR #22, Jan 7, 2026)
**Current Documentation**: None (only mentioned in SESSION_RESUME.md)

**Decision Summary**:
- Changed from horizontal tabs to collapsible sidebar navigation
- Sidebar: 64px expanded → 16px collapsed with toggle
- 7 navigation groups organizing 11 tabs
- Icon-based navigation with tooltips
- Smooth CSS transitions (`transition-all duration-300`)

**Context**:
- Horizontal tabs insufficient for 11+ navigation items
- Need better organization with dropdown groups
- Space efficiency when collapsed
- Scalability for future tabs (15+ expected)

**Consequences**:
- ✅ Better UX for 11+ tabs
- ✅ Space-efficient collapsed mode
- ✅ Scalable for future growth
- ❌ Required 5,566 line deletion/refactor in page.jsx
- ❌ Breaking change for users familiar with horizontal tabs

**Alternatives Considered**:
- Option A: Enhanced horizontal tabs with overflow menu
- **Option B (Chosen)**: Sidebar with collapsible groups
- Option C: Multi-level dropdown menus

**Implementation Details**:
- File: `/app/page.jsx` (lines with sidebar JSX)
- State: `sidebarCollapsed` boolean
- CSS: Conditional classes `w-16`/`w-64`, `ml-16`/`ml-64`
- Icons: lucide-react (Menu, X, group icons)

**Should Be ADR**: YES - Major UX/navigation architecture decision

---

### ADR-004: Static JSON Import Strategy

**Status**: ✅ IMPLEMENTED (v1.0, foundation architecture)
**Current Documentation**: Mentioned in ADR-001 but not as formal decision

**Decision Summary**:
- Import generated JSON files directly in page.jsx at build time
- No runtime API calls for dashboard data
- 240KB `ai-tools-data.json` bundled with app

**Context**:
- Data updates monthly (not real-time requirement)
- Anthropic/M365/GitHub don't provide real-time APIs
- Need fast page load (<100ms)
- Want simple deployment (no backend server)

**Consequences**:
- ✅ Fast page load: <100ms, no API latency
- ✅ Simpler deployment: Static hosting capable (Vercel, Netlify, S3)
- ✅ No backend server needed
- ✅ Reliable: No runtime API failures
- ❌ Requires rebuild to update data (acceptable for monthly updates)
- ❌ 240KB in bundle size (acceptable for modern browsers)

**Alternatives Considered**:
- Option A: Runtime API calls to backend service
- **Option B (Chosen)**: Static JSON import at build time
- Option C: Hybrid (static + incremental updates)

**Trade-offs**:
| Approach | Load Time | Deployment | Data Freshness | Cost |
|----------|-----------|------------|----------------|------|
| Runtime API | Slow (200-500ms) | Complex | Real-time | High |
| Static Import | Fast (<100ms) | Simple | Build-time | Low |
| Hybrid | Medium | Medium | Near real-time | Medium |

**Should Be ADR**: YES - Fundamental data architecture decision

---

### ADR-005: Batch Processing vs Real-Time Architecture

**Status**: ✅ IMPLEMENTED (foundation architecture)
**Current Documentation**: Mentioned in various docs but not as formal ADR

**Decision Summary**:
- Batch processing via manual script execution (`npm run refresh`)
- Monthly data update frequency
- ~10 Claude API calls per run (~$0.10 cost)
- Single-threaded Node.js parser scripts

**Context**:
- Data sources don't support real-time APIs
- Monthly trends sufficient for strategic executive decisions
- Cost-effectiveness for AI insights generation
- Simplicity over complexity for Phase 2

**Consequences**:
- ✅ Cost-effective: ~$0.10 per dashboard refresh (15-24 insights)
- ✅ Simple architecture: Single-threaded scripts, no worker queues
- ✅ Sufficient for monthly executive reviews
- ✅ 70% automation: Email alias, filtering, calculations automated
- ❌ Manual data collection: CSV/JSON files must be placed manually
- ❌ No real-time updates: 30-day lag acceptable
- ❌ 30% still manual: File placement, org chart sync

**Alternatives Considered**:
- Option A: Real-time streaming pipeline (Kafka, webhooks)
- **Option B (Chosen)**: Batch processing with manual trigger
- Option C: Scheduled automation (cron jobs, daily updates)

**Automation Score**: 70% (7 of 10 tasks automated)
| Task | Status | Details |
|------|--------|---------|
| Data collection | ❌ Manual | CSV/JSON files must be placed |
| File parsing | ✅ Automated | All parsers run automatically |
| Employee filtering | ✅ Automated | Org chart validation |
| Email alias resolution | ✅ Automated | 12+ aliases handled |
| Department mapping | ✅ Automated | Org chart traversal |
| Metric calculations | ✅ Automated | All formulas scripted |
| AI insight generation | ✅ Automated | Claude API integration |
| JSON output | ✅ Automated | Single unified file |
| Org chart sync | ❌ Manual | Rippling export needed |
| Data verification | 🟡 Semi | Diagnostic scripts available |

**Should Be ADR**: YES - Core processing architecture decision

---

### ADR-006: Hybrid Premium Seat Allocation Algorithm

**Status**: ✅ IMPLEMENTED (PR #21, Jan 7, 2026)
**Current Documentation**: Code comments in `parse-copilot-data.js` only

**Decision Summary**:
- Dual scoring system: Behavioral (0-115pts) + Department Baseline (0-100%)
- Behavioral score: Code writing (30pts), Engagement (30pts), Artifacts (25pts), Analysis (15pts), M365 intensity (10pts), Consistency (5pts)
- Department baselines: Engineering 100%, High complexity 35%, Medium 25%, Sales 20%, etc.
- Recommend Premium seats = MAX(behavioral score, baseline %)

**Context**:
- Need to identify who SHOULD get Premium licenses
- Pure usage-based: Misses role complexity (e.g., new hires)
- Pure role-based: Misses actual usage patterns (e.g., inactive users)
- Engineering needs 100% (Claude Code Premium is only way to get enterprise)
- Other departments vary by complexity

**Consequences**:
- ✅ Captures both capability (usage) and demand (role)
- ✅ Engineering gets 100% as required for Claude Code
- ✅ Power users identified by behavioral scoring
- ✅ Department-appropriate allocation
- ❌ Complex to explain to non-technical stakeholders
- ❌ Requires tuning of point thresholds

**Scoring Formula**:
```javascript
function calculatePremiumScore(userActivity) {
  let score = 0;

  // Code writing (30pts)
  if (userActivity.claudeCodeLines > 0) score += 30;

  // Engagement (30pts)
  if (userActivity.conversations >= 100) score += 30;
  else if (userActivity.conversations >= 50) score += 20;
  else if (userActivity.conversations >= 20) score += 10;

  // Artifacts (25pts)
  if (userActivity.artifacts >= 20) score += 25;
  else if (userActivity.artifacts >= 10) score += 15;
  else if (userActivity.artifacts >= 5) score += 8;

  // Analysis work (15pts)
  if (userActivity.fileUploads > 50) score += 15;
  else if (userActivity.fileUploads > 20) score += 10;

  // M365 intensity (10pts)
  const m365PromptsPerDay = userActivity.m365Prompts / 30;
  if (m365PromptsPerDay >= 10) score += 10;
  else if (m365PromptsPerDay >= 5) score += 5;

  // Consistency (5pts)
  if (userActivity.activeDays >= 20) score += 5;
  else if (userActivity.activeDays >= 10) score += 3;

  return score;
}

function getDepartmentPremiumBaseline(department) {
  const baselines = {
    'Engineering': 1.00,           // 100% need Premium
    'Finance': 0.35,               // High complexity
    'Product': 0.35,
    'Professional Services': 0.35,
    'RevOps': 0.35,
    'Customer Success': 0.25,      // Medium complexity
    'Sales-Enterprise': 0.20,
    'Sales-Commercial': 0.20,
    'Marketing': 0.18,
    'Partnerships': 0.18,
    'Support': 0.10,
    'Operations': 0.10,
    default: 0.15
  };
  return baselines[department] || baselines.default;
}

// Recommendation logic
const recommendedPremiumSeats = Math.max(
  countUsersByBehavioralScore(dept, threshold=70),  // High scorers
  deptHeadcount * getDepartmentPremiumBaseline(dept) // Baseline %
);
```

**Department Baselines**:
| Department | Baseline | Rationale |
|------------|----------|-----------|
| Engineering | 100% | Claude Code Premium required |
| Finance | 35% | Complex analysis, financial modeling |
| Product | 35% | Feature planning, technical specs |
| Professional Services | 35% | Client solutions, implementations |
| RevOps | 35% | Data analysis, pipeline optimization |
| Customer Success | 25% | Customer interactions, reporting |
| Sales (Enterprise/Commercial) | 20% | Deal research, proposals |
| Marketing | 18% | Content creation, campaigns |
| Partnerships | 18% | Relationship management |
| Support | 10% | Ticket resolution (less artifacts) |
| Operations | 10% | Administrative tasks |

**Alternatives Considered**:
- Option A: Pure behavioral scoring (misses role complexity)
- Option B: Pure role-based allocation (misses actual usage)
- **Option C (Chosen)**: Hybrid (MAX of behavioral + baseline)

**Should Be ADR**: YES - Critical business logic for expansion strategy

---

### ADR-007: Multi-Tool Sentiment Attribution System

**Status**: ✅ IMPLEMENTED (PR #16, Jan 5, 2026)
**Current Documentation**: Implementation plan exists but not ADR format

**Decision Summary**:
- Use Claude API to analyze each Slack message with context-aware attribution
- Context clues distinguish tool mentions:
  - GitHub Copilot: IDE, VS Code, coding, development, PR review
  - M365 Copilot: Outlook, SharePoint, Teams, Word, Excel, PowerPoint, pre-call prep, BDR team
- One message can generate multiple tool-specific feedback items
- Fixes conflation of "Copilot" generic mentions

**Context (The Problem)**:
- M365 Copilot showed 75/100 score with 0 negative feedback
- Raw Slack messages clearly showed negative sentiment from sales/business users
- Generic "Copilot" mentions defaulting to GitHub Copilot without context
- Sales/business context messages wrongly attributed to GitHub Copilot

**Examples of Misattribution** (before fix):
- ❌ "BDR team on Copilot... results are very mediocre" → Was GitHub Copilot (WRONG - BDR = sales = M365)
- ❌ "pre-call prep with Copilot took 5+ min" → Was GitHub Copilot (WRONG - sales research = M365)
- ❌ "outlook, sharepoint...Copilot" → Was GitHub Copilot (WRONG - M365 tools mentioned)

**Consequences**:
- ✅ Accurate sentiment attribution: M365 38/100 (was 75), GitHub 33/100 (was 20)
- ✅ Context-aware: BDR/sales mentions → M365, IDE mentions → GitHub
- ✅ Multi-tool support: One message can be about multiple tools
- ✅ Comparative statements handled: "Claude > Copilot" → Claude +positive, Copilot +negative
- ❌ Cost: ~$0.02 per 31 messages (~$0.20 per 500 messages)
- ❌ Complexity: Requires Claude API vs simple keyword matching

**Implementation**:
- Script: `/scripts/extract-multi-tool-sentiment.js` (257 lines)
- Model: claude-sonnet-4-20250514
- Prompt: Expert system prompt with context clues
- Output: Tool-specific sentiment scores (0-100)

**Results** (31 messages → 43 tool-specific items):
| Tool | Score | Messages | Positive | Neutral | Negative |
|------|-------|----------|----------|---------|----------|
| Claude Enterprise | 85/100 | 20 | 15 | 4 | 1 |
| Claude Code | 94/100 | 9 | 8 | 1 | 0 |
| GitHub Copilot | 33/100 | 6 | 2 | 0 | 4 |
| M365 Copilot | 38/100 | 8 | 2 | 2 | 4 |
| ChatGPT | 50/100 | 2 | 1 | 0 | 1 |

**Alternatives Considered**:
- Option A: Simple keyword matching (misses context)
- Option B: Manual classification (doesn't scale)
- **Option C (Chosen)**: Claude API with context-aware prompts

**Should Be ADR**: YES - Critical for accurate executive sentiment reporting

---

### ADR-008: Portfolio Detail Views & Breadcrumb Navigation

**Status**: ✅ IMPLEMENTED (PR #21, Jan 7, 2026)
**Current Documentation**: Implementation plan exists but not ADR

**Decision Summary**:
- Clickable project names in portfolio table
- Conditional rendering: `selectedProject` state toggles PortfolioTable ↔ ProjectDetail
- Breadcrumb navigation: Home → ROI & Planning → Portfolio → [Project Name]
- Back button on breadcrumb resets `selectedProject` to null
- No URL routing changes (stays SPA)

**Context**:
- Portfolio table shows 11 projects with 11 columns (high-density)
- Executives need detailed information: goals, phases, KPIs, risks
- Need drilldown capability without navigation complexity
- Must maintain consistency with existing SPA architecture

**Consequences**:
- ✅ Simple state-based navigation (no routing library needed)
- ✅ Breadcrumb back button intuitive
- ✅ Backward compatible: Portfolio table reusable in AnnualPlanPresentation
- ✅ Markdown rendering for executive summaries
- ❌ No deep linking: Can't share URL to specific project
- ❌ Browser back button doesn't work (SPA limitation)

**Implementation**:
- State: `selectedProject` (string | null) in page.jsx
- Components: `PortfolioTable.jsx` (191 lines), `ProjectDetail.jsx` (157 lines)
- Data: `/app/ai-projects-details.json` (20KB, 5 projects)
- Parser: `/scripts/parse-project-details.js` (335 lines)

**Navigation Flow**:
```
User clicks project name → onProjectClick(projectId) → setSelectedProject(projectId)
  ↓
React re-renders portfolio tab
  ↓
selectedProject !== null → render ProjectDetail component
  ↓
User clicks breadcrumb "AI Projects Portfolio"
  ↓
onClick handler → setSelectedProject(null) → render PortfolioTable
```

**Alternatives Considered**:
- Option A: Add URL routing with Next.js dynamic routes
- **Option B (Chosen)**: State-based conditional rendering
- Option C: Modal overlay for project details

**Should Be ADR**: YES - Navigation pattern decision with trade-offs

---

### ADR-009: License Configuration Management (CSV-based)

**Status**: ✅ IMPLEMENTED (foundation architecture)
**Current Documentation**: Mentioned in code comments only

**Decision Summary**:
- Store license counts in `/data/license_config.csv`
- CSV format: tool, licensed_users, premium_users, standard_users, last_updated
- Parser reads CSV dynamically (no hardcoded constants)
- Documents verification dates

**Context**:
- License counts change monthly (additions, removals, tier changes)
- Hardcoding in source code = merge conflicts, errors, stale data
- Need auditable history (when was count last verified?)
- Must support tool-specific counts (M365, Claude, GitHub)

**Consequences**:
- ✅ No hardcoded constants: Single source of truth
- ✅ Easy monthly updates: Edit CSV, run refresh
- ✅ Auditable: last_updated column tracks verification
- ✅ Tool-specific: Handles Premium/Standard splits
- ❌ Manual updates required: No API automation
- ❌ CSV must be committed: Risk of conflicts

**CSV Format**:
```csv
tool,licensed_users,premium_users,standard_users,last_updated
M365 Copilot,251,0,0,2026-01-07
Claude Enterprise,87,13,74,2026-01-07
Claude Code,11,11,0,2026-01-07
GitHub Copilot,46,0,0,2025-12-31
```

**Current Values** (from CSV):
| Tool | Licensed | Premium | Standard | Last Updated |
|------|----------|---------|----------|--------------|
| M365 Copilot | 251 | 0 | 0 | 2026-01-07 |
| Claude Enterprise | 87 | 13 | 74 | 2026-01-07 |
| Claude Code | 11 | 11 | 0 | 2026-01-07 |
| GitHub Copilot | 46 | 0 | 0 | 2025-12-31 |

**Alternatives Considered**:
- Option A: Hardcode in source code (unmaintainable)
- **Option B (Chosen)**: CSV configuration file
- Option C: Database table (overkill for Phase 2)

**Should Be ADR**: YES - Configuration management strategy

---

### ADR-010: Org Chart as Single Source of Truth

**Status**: ✅ IMPLEMENTED (foundation architecture)
**Current Documentation**: ADR-002 exists, but could be clearer

**Decision Summary**:
- Use org chart JSON (77KB, 251 employees) as canonical source
- Reporting structure more reliable than job titles
- Hierarchical traversal: CEO → Dept Heads → Team Leaders → ICs
- Email → Department mapping via parent node lookup
- Filters: Current vs non-current employees via org chart validation

**Context**:
- Need accurate department assignments for all metrics
- Job titles inconsistent ("Engineer" vs "Software Engineer" vs "Senior Engineer")
- Reporting structure reflects actual work organization
- Must support 16 departments + team-level granularity
- Need to filter out former employees (non-current)

**Consequences**:
- ✅ Accurate department mapping: 251 employees correctly assigned
- ✅ Hierarchical organization: Supports multi-level reporting
- ✅ Team-level granularity: Can report by team within department
- ✅ Filters non-current employees: 238 M365 users from 265 total
- ❌ Manual Rippling export required: No API automation yet
- ❌ Staleness risk: Need monthly sync

**Implementation**:
- File: `/data/techco_org_chart.json` (77KB)
- Parser: `/scripts/parse-hierarchy.js` (150+ lines)
- Function: `traverseHierarchy()` recursively builds email → {dept, team, title} map
- Email alias resolution: 12+ aliases handled (seth@ → sturner@, etc.)

**Department Mapping** (16 departments):
```javascript
const DEPARTMENT_NAME_MAPPING = {
  'Agentic AI': ['Agentic AI'],
  'Engineering': ['Engineering', 'Product Development'],
  'Customer Success': ['Customer Success', 'CS'],
  'Finance': ['Finance', 'Accounting'],
  'Product': ['Product', 'Product Management'],
  'Marketing': ['Marketing', 'Growth'],
  'Sales-Enterprise': ['Sales - Enterprise', 'Enterprise Sales'],
  'Sales-Commercial': ['Sales - Commercial', 'Commercial Sales'],
  'Professional Services': ['Professional Services', 'PS'],
  'Partnerships': ['Partnerships', 'Partner Success'],
  'Support': ['Support', 'Customer Support'],
  'Operations': ['Operations', 'Ops'],
  'RevOps': ['RevOps', 'Revenue Operations'],
  'People': ['People', 'HR', 'Human Resources'],
  'IT': ['IT', 'Information Technology'],
  'Legal': ['Legal', 'Compliance']
};
```

**Email Alias Resolution** (12+ aliases):
- seth@ → sturner@
- lisa@ → lmueller@
- And 10+ more...

**Alternatives Considered**:
- Option A: Manual department CSV (requires duplicate maintenance)
- **Option B (Chosen)**: Org chart as single source
- Option C: Job title parsing (unreliable)

**Should Be ADR**: MAYBE - Already covered in ADR-002, but could be clearer

---

## Planning Document to Convert to ADR

### ADR-011: Monolith Breakup Strategy

**Status**: 📋 PLANNED (not yet implemented)
**Current Location**: `/docs/plan/BREAKING_MONOLITH_IMPROVEMENTS_GUIDE.md`
**Should Be**: ADR format (decision to break up monolith, not implementation guide)

**Decision Summary** (proposed):
- Break up 6,237-line `page.jsx` into modular components
- Extract 11 tabs to `/app/components/tabs/`
- Create layout components: `DashboardLayout`, `DashboardHeader`, `TabNavigation`
- Create shared components: `InsightCard`, `DataTable`, `MetricCard`
- Reduce main page.jsx to < 200 lines (orchestrator only)

**Context**:
- Current: 6,237 lines, 68KB+ monolith
- Hard to maintain, test, or parallelize development
- Performance implications (all code loaded for single tab)
- Difficult onboarding for new developers

**Consequences** (expected):
- ✅ Maintainability: Each tab 200-300 lines vs 68KB monolith
- ✅ Testability: Unit test individual components
- ✅ Parallel development: Multiple developers can work on different tabs
- ✅ Performance: Next.js code splitting, caching
- ❌ Effort: 1-2 weeks refactoring
- ❌ Risk: Potential regression bugs during extraction

**Alternatives**:
- Option A: Keep monolith, improve structure within file
- **Option B (Chosen)**: Break up into modular components
- Option C: Migrate to micro-frontends (overkill)

**Why This Should Be ADR**:
- It's an architectural decision to break up the monolith
- Has consequences, alternatives, and trade-offs
- Will affect future development patterns
- Should be documented BEFORE implementation (not after)

**Recommendation**: Convert BREAKING_MONOLITH_IMPROVEMENTS_GUIDE.md → ADR-011

---

## Existing Architecture Docs - Keep or Convert?

### 1. `/docs/DATA_ARCHITECTURE.md` (36KB)

**Analysis**: Large doc covering data sources, schemas, parsing strategies
**Overlap with ADRs**: Some overlap with ADR-001, ADR-002
**Recommendation**:
- **Keep as supplementary reference** (detailed schemas, examples)
- Link from ADR-001 for "more details"
- Don't convert to ADR (too operational, not decision-focused)

### 2. `/docs/PERCEIVED_VALUE_ARCHITECTURE.md` (92KB)

**Analysis**: Massive doc on sentiment analysis architecture
**Overlap with ADRs**: Could be ADR-007, but includes implementation details
**Recommendation**:
- **Archive to `/docs/archived/superseded/`**
- Key decision (multi-tool attribution) captured in new ADR-007
- Keep file for historical reference (implementation evolution)

### 3. `/docs/SENTIMENT_PIPELINE_ARCHITECTURE.md` (49KB)

**Analysis**: Overlaps with PERCEIVED_VALUE_ARCHITECTURE
**Recommendation**:
- **Archive to `/docs/archived/superseded/`**
- Superseded by multi-tool sentiment implementation (PR #16)
- Keep for historical reference

---

## Action Plan: Create Missing ADRs

### Phase 1: High-Priority ADRs (Immediate)

1. **ADR-003: Sidebar Navigation Pattern**
   - Just implemented (PR #22)
   - Captures recent major UX decision
   - Effort: 1 hour

2. **ADR-006: Hybrid Premium Seat Allocation**
   - Critical business logic
   - Affects expansion strategy
   - Effort: 1.5 hours

3. **ADR-007: Multi-Tool Sentiment Attribution**
   - Fixed major misattribution issue
   - Critical for accurate executive reporting
   - Effort: 1 hour

### Phase 2: Foundation ADRs (Short-term)

4. **ADR-004: Static JSON Import Strategy**
   - Fundamental data architecture
   - Affects performance, deployment
   - Effort: 1 hour

5. **ADR-005: Batch Processing Architecture**
   - Core processing decision
   - Affects automation, costs
   - Effort: 1.5 hours

6. **ADR-008: Portfolio Detail Views & Navigation**
   - Recently implemented (PR #21)
   - Navigation pattern with trade-offs
   - Effort: 1 hour

### Phase 3: Supporting ADRs (Medium-term)

7. **ADR-009: License Configuration Management**
   - Configuration strategy
   - Affects maintainability
   - Effort: 45 minutes

8. **ADR-010: Org Chart as Single Source** (optional)
   - Review ADR-002, possibly update
   - May not need new ADR
   - Effort: 30 minutes

### Phase 4: Future Planning ADR (Before Implementation)

9. **ADR-011: Monolith Breakup Strategy**
   - Convert BREAKING_MONOLITH_IMPROVEMENTS_GUIDE.md
   - Document decision BEFORE implementation
   - Effort: 1 hour

---

## Total Effort Estimate

- **Phase 1** (3 ADRs): 3.5 hours
- **Phase 2** (3 ADRs): 3.5 hours
- **Phase 3** (2 ADRs): 1.25 hours
- **Phase 4** (1 ADR): 1 hour
- **Archive/organize**: 1 hour

**Total**: ~10 hours to complete all missing ADRs + organize architecture docs

---

## Recommendation

**Immediate Action** (Phase 1 + Phase 4):
1. Create ADR-003 (Sidebar)
2. Create ADR-006 (Premium Allocation)
3. Create ADR-007 (Sentiment)
4. **Create ADR-011 (Monolith Breakup) BEFORE starting implementation**

**Rationale**: These 4 ADRs document the most critical recent decisions and the upcoming major refactoring. ADR-011 is especially important to document BEFORE breaking up the monolith.

**Short-term** (Phase 2):
- Create remaining foundation ADRs (4, 5, 8)

**Medium-term** (Phase 3):
- Create supporting ADRs (9, 10)
- Archive superseded architecture docs
