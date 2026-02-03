# Technical Architecture

## Current Implementation (Static)
- **Framework**: Next.js 14 (App Router)
- **Deployment**: Vercel
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Main file**: `/app/page.jsx` (68KB single component with hardcoded data)
- **Dependencies**: See `package.json` (react, recharts, lucide-react)

## Current Dashboard Structure
Single-file component with 7 tabs:
1. **Overview** - Summary metrics, key insights
2. **Adoption** - User activation, daily active trends
3. **Productivity** - Time savings, engineer quotes, use cases
4. **Departments** - Department-by-department breakdown
5. **Code** - Claude Code leaderboard, productivity metrics
6. **Enablement** - Training needs, expansion priorities
7. **Expansion** - Cost/ROI calculations for full rollout

## Planned Architecture (Dynamic)
- **Backend**: Next.js API routes + Server Actions
- **Database**: Vercel Postgres (or Supabase)
- **File Processing**: Server-side
  - CSV: PapaParse
  - PDF: pdf-parse
  - NDJSON: Native JSON parsing
- **Authentication**: Vercel Auth (or Clerk) - for admin upload access
- **Cron Jobs**: Vercel Cron for daily updates
- **Caching**: Vercel KV or database metrics_cache table

## Database Schema (Planned)

### Core Tables
```sql
-- Users/Licenses table
CREATE TABLE claude_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  username VARCHAR(100),
  department VARCHAR(100),
  seat_tier VARCHAR(20), -- 'Premium' or 'Standard'
  status VARCHAR(20), -- 'Active', 'Pending'
  activated_at TIMESTAMP,
  last_seen TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Audit events table (Claude Enterprise usage)
CREATE TABLE audit_events (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(255) REFERENCES claude_users(email),
  event_type VARCHAR(50), -- 'conversation_created', 'project_created', 'file_uploaded'
  event_date TIMESTAMP NOT NULL,
  conversation_id VARCHAR(255),
  project_id VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Claude Code usage table
CREATE TABLE code_usage (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(255) REFERENCES claude_users(email),
  period_start DATE,
  period_end DATE,
  lines_of_code INTEGER,
  rank INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- GitHub Copilot usage table (NEW)
CREATE TABLE github_copilot_usage (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255), -- mapped from username
  period_start DATE,
  period_end DATE,
  lines_added INTEGER,
  lines_suggested INTEGER,
  lines_accepted INTEGER,
  model VARCHAR(50), -- 'Claude 4.5 Sonnet', 'GPT-5-mini', etc.
  feature VARCHAR(50), -- 'code_completion', 'agent_edit', 'chat_panel'
  suggestions_count INTEGER,
  acceptance_rate DECIMAL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- M365 Copilot usage table (NEW)
CREATE TABLE m365_copilot_usage (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(255),
  period_start DATE,
  period_end DATE,
  word_usage INTEGER,
  excel_usage INTEGER,
  powerpoint_usage INTEGER,
  teams_usage INTEGER,
  outlook_usage INTEGER,
  total_actions INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Department org structure
CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  parent_department VARCHAR(100),
  total_employees INTEGER,
  manager_email VARCHAR(255),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Calculated metrics cache (for performance)
CREATE TABLE metrics_cache (
  id SERIAL PRIMARY KEY,
  metric_date DATE NOT NULL,
  metric_type VARCHAR(50), -- 'daily_active', 'conversations', etc.
  department VARCHAR(100),
  value JSONB,
  calculated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(metric_date, metric_type, department)
);

-- Slack sentiment data (NEW - Phase 3/4)
CREATE TABLE slack_sentiment (
  id SERIAL PRIMARY KEY,
  channel_name VARCHAR(100), -- e.g., 'claude-code-dev'
  message_ts VARCHAR(50), -- Slack timestamp (unique ID)
  user_id VARCHAR(50),
  message_text TEXT,
  tool_mentioned VARCHAR(50), -- 'claude_code', 'claude_enterprise', 'copilot', etc.
  sentiment VARCHAR(20), -- 'positive', 'negative', 'neutral'
  use_case TEXT, -- Extracted use case
  value_story TEXT, -- Extracted ROI story
  time_savings INTEGER, -- Minutes saved (if mentioned)
  posted_at TIMESTAMP,
  analyzed_at TIMESTAMP DEFAULT NOW()
);

-- AI recommendations (NEW - Phase 4)
CREATE TABLE ai_recommendations (
  id SERIAL PRIMARY KEY,
  week_start DATE NOT NULL,
  category VARCHAR(50), -- 'tool_positioning', 'business_rules', 'adoption', 'consolidation', 'executive_summary'
  recommendation TEXT, -- AI-generated recommendation
  data_snapshot JSONB, -- Data used for recommendation
  confidence_score DECIMAL, -- 0-1 confidence
  status VARCHAR(20), -- 'pending', 'acted_upon', 'dismissed'
  impact_measured JSONB, -- Actual vs projected outcomes
  generated_at TIMESTAMP DEFAULT NOW()
);
```

## Data Flow Architecture
```
Data Sources → Ingestion Layer → Database → AI Analysis → API Layer → Dashboard
     ↓                                           ↓
1. Manual uploads (CSV/PDF/NDJSON)         Claude API
2. Slack sentiment (MCP/API)                    ↓
3. API integrations (Anthropic, etc.)      Recommendations
4. MCP connectors (Rippling, etc.)
5. Scheduled fetches (Vercel Cron)
```

### AI-Powered Workflow
```
1. Data Collection (automated)
   ├─ Usage metrics (Claude, Copilot, M365)
   ├─ Slack messages (6 channels, last 7 days)
   └─ Cost & org data

2. AI Analysis (Claude API)
   ├─ Sentiment extraction from Slack
   ├─ Use case identification
   ├─ Pattern recognition
   └─ Recommendation generation

3. Storage & Display
   ├─ Store in slack_sentiment table
   ├─ Store recommendations in ai_recommendations table
   ├─ Cache insights in metrics_cache
   └─ Display in Dashboard with Executive Summary

4. Continuous Learning
   ├─ Track recommendation outcomes
   ├─ Measure impact (adoption, ROI improvements)
   └─ Refine models over time
```

## Component Structure (Planned)

### Breaking Up the Monolith
Current: Single 68KB `/app/page.jsx` file
Target: Modular component structure

```
app/
├── dashboard/
│   └── page.tsx                 # Main dashboard page (orchestrator)
├── api/
│   ├── upload/route.ts          # File upload endpoint
│   ├── metrics/
│   │   ├── summary/route.ts     # Summary metrics
│   │   ├── daily-active/route.ts
│   │   └── monthly/route.ts
│   ├── departments/route.ts
│   ├── expansion/route.ts
│   ├── copilot-comparison/route.ts  # NEW - Copilot vs Claude Code
│   ├── m365-comparison/route.ts     # NEW - M365 vs Claude Enterprise
│   └── cron/
│       └── daily-refresh/route.ts
└── layout.tsx

components/
├── DashboardTabs.tsx
├── DataUpload.tsx
├── MetricCard.tsx
├── tabs/
│   ├── OverviewTab.tsx
│   ├── AdoptionTab.tsx
│   ├── ProductivityTab.tsx
│   ├── DepartmentsTab.tsx
│   ├── CodeTab.tsx
│   ├── CodingToolsTab.tsx           # NEW - GitHub Copilot vs Claude Code
│   ├── ProductivityToolsTab.tsx     # NEW - M365 Copilot vs Claude Enterprise
│   ├── EnablementTab.tsx
│   └── ExpansionTab.tsx
└── charts/
    ├── DailyActiveChart.tsx
    ├── DepartmentPieChart.tsx
    ├── ExpansionBarChart.tsx
    ├── ModelPreferenceChart.tsx      # NEW - Claude 72% in Copilot
    └── ToolComparisonChart.tsx       # NEW - M365 vs Claude usage

lib/
├── db.ts                        # Database client (Prisma)
├── data-ingestion/
│   ├── audit-logs.ts            # Claude Enterprise audit logs
│   ├── code-usage.ts            # Claude Code PDFs
│   ├── licenses.ts              # License list
│   ├── github-copilot.ts        # NEW - NDJSON parser
│   ├── m365-copilot.ts          # NEW - CSV parser
│   └── org-chart.ts             # Rippling PDF
├── calculations/
│   ├── metrics.ts               # Core metric calculations
│   ├── expansion.ts             # Expansion cost logic
│   ├── roi.ts                   # ROI calculations
│   ├── departments.ts
│   ├── copilot-comparison.ts    # NEW - GitHub Copilot metrics
│   └── m365-comparison.ts       # NEW - M365 Copilot metrics
└── utils/
    ├── date-helpers.ts
    └── formatters.ts
```

## Migration Path from Static to Dynamic

### Step 1: Extract Current Dashboard Component
```bash
# Backup current working version
cp app/page.jsx app/page.backup.jsx
```

### Step 2: Separate Data from UI
```typescript
// Before (artifact): Hardcoded data in component
const summaryMetrics = { claudeUsers: 78, ... };

// After (production): Fetch from API
const [summaryMetrics, setSummaryMetrics] = useState(null);

useEffect(() => {
  fetch('/api/metrics/summary')
    .then(r => r.json())
    .then(data => setSummaryMetrics(data));
}, []);
```

### Step 3: Break into Modular Components
- Extract each tab into separate component file
- Extract charts into reusable components
- Extract metric cards into shared component
- Extract calculation logic into utility functions

### Step 4: Add Data Management Layer
- Create API routes for each metric type
- Add database queries
- Implement caching strategy

### Step 5: Add Upload Interface
- Build file upload UI
- Implement server-side processing
- Add validation and error handling

## API Routes Design

### Existing Data APIs
- `GET /api/metrics/summary` - Summary metrics for Overview tab
- `GET /api/metrics/daily-active?days=30` - Daily active users trend
- `GET /api/departments` - Department breakdown
- `GET /api/expansion` - Expansion cost calculations

### New Comparison APIs
- `GET /api/copilot-comparison` - GitHub Copilot vs Claude Code metrics
  - Model preferences (Claude 72%)
  - Productivity (lines/user)
  - User overlap analysis
  - Cost comparison

- `GET /api/m365-comparison` - M365 Copilot vs Claude Enterprise metrics
  - Adoption rates (% of org)
  - Use cases breakdown
  - Value/ROI comparison
  - Feature usage (Word, Excel, Teams vs Chat, Projects, Artifacts)

### Upload API
- `POST /api/upload` - Handle file uploads
  - Form data: file, type (audit-logs, code-usage, github-copilot, m365-copilot)
  - Returns: { success: true, imported: N }

### Cron API
- `GET /api/cron/daily-refresh` - Automated daily update
  - Vercel Cron secret authentication
  - Recalculate cached metrics
  - Future: Fetch from Anthropic API

## Performance Considerations
- **Cache expensive calculations** - daily aggregations in metrics_cache table
- **Paginate large tables** - expansion opportunities, user lists
- **Lazy load charts** - only render active tab's charts
- **Debounce data refreshes** - prevent API hammering
- **ISR (Incremental Static Regeneration)** - revalidate API routes every hour

## Security Considerations
- **Authentication** - Upload interface requires admin access
- **Cron secret** - Verify authorization header for automated updates
- **Data validation** - Validate uploads before database insertion
- **SQL injection** - Use parameterized queries (Prisma ORM)
- **Rate limiting** - Prevent abuse of upload endpoints

## Deployment Configuration

### Vercel Configuration (`vercel.json`)
```json
{
  "crons": [{
    "path": "/api/cron/daily-refresh",
    "schedule": "0 6 * * *"
  }]
}
```

### Environment Variables
```
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-ant-...
CRON_SECRET=...
RIPPLING_API_KEY=...  # future
NEXT_PUBLIC_APP_URL=https://...
```

## Testing Strategy
- **Unit tests**: Calculation functions in `/lib/calculations/`
- **Integration tests**: Data ingestion pipeline
- **E2E tests**: Upload flow, dashboard rendering
- **Data validation**: Test with real files from `/data/`

See `/docs/plan/01 - vercel-app-implementation-plan.md` for detailed implementation steps.

---

## Current Implementation Updates (2026-01-21)

### Org Chart & Agentic FTE System

**Status**: Phase 1 Complete ✅

While the above describes the planned dynamic architecture, the current static implementation has been significantly enhanced with:

#### 1. Organizational Chart Snapshot System

**Purpose**: Historical tracking of organizational changes (headcount, structure, roles).

**Components**:
- **Storage**: `data/org-chart-snapshots/` - Monthly snapshots + comparison reports
- **Management**: `scripts/manage-org-chart-snapshot.js` - CLI for save/list/compare/latest
- **Comparison**: `scripts/compare-org-charts.js` - Delta detection engine
- **Generation**: `/generate-org-chart` slash command - Multi-format input (PDF, text, tables)

**Data Flow**:
```
Rippling PDF → /generate-org-chart → techco_org_chart.json
    ↓
manage-org-chart-snapshot.js save → snapshot_YYYY-MM-DD.json
    ↓
compare-org-charts.js → comparison_<old>_to_<new>.json
```

**Tracks**:
- Added/removed employees (hires, departures)
- Title changes (promotions, role changes)
- Reporting changes (re-orgs, manager transfers)
- Headcount growth (net change, growth rate)
- Contingent worker statistics

#### 2. Agentic FTE Per-Employee Tracking

**Purpose**: Measure AI-augmented capacity at individual and team levels.

**Terminology**: Renamed "Virtual FTE" → "Agentic FTE" (better reflects AI agent augmentation)

**Enhanced Schema**:
```javascript
// Each employee node now has:
{
  "agenticFTE": {
    "current": 0.18,          // Personal AI-augmented capacity
    "breakdown": {
      "claudeEnterprise": 0.12,
      "m365Copilot": 0.05,
      "claudeCode": 0.01
    }
  },
  "teamAgenticFTE": {
    "current": 3.4,            // Recursive sum (employee + all reports)
    "breakdown": { /* ... */ }
  }
}

// Organization level:
{
  "organization": {
    "totalEmployees": 258,
    "totalAgenticFTE": 80.3,
    "agenticFTEBreakdown": { /* ... */ }
  }
}
```

**Components**:
- **Calculator**: `scripts/modules/agentic-fte-calculator.js` - Per-user calculations
- **Enrichment**: `scripts/enrich-org-chart-with-agentic-fte.js` - Adds to org chart
- **Pipeline Integration**: `scripts/modules/pipeline-orchestrator.js` - Data flow

**Calculation Methodology**:
- Proportional distribution based on engagement scores
- Claude Enterprise: (artifacts × 2) + (messages / 100)
- M365 Copilot: promptsPerDay intensity
- Claude Code: lines of code / (hours per line × FTE hours)

**Current Metrics**:
- **258 employees** + **80.3 agentic FTEs** = **338.3 effective FTE capacity** (+31%)
- Primary source: Claude Code (Engineering, 80.3 FTEs)
- Future: Claude Enterprise & M365 will populate after data refresh

#### 3. Data Pipeline Enhancements

**Updated Files (26 total)**:
- Renamed: `virtual-fte-calculator.js` → `agentic-fte-calculator.js`
- Updated: `pipeline-orchestrator.js` (100+ references)
- Updated: All React components (12 files) to use "agentic FTE"
- Updated: AI insight generation with new terminology
- Updated: All documentation with new concepts

**New Scripts**:
```bash
# Enrich org chart with AI capacity data
node scripts/enrich-org-chart-with-agentic-fte.js

# Manage monthly snapshots
node scripts/manage-org-chart-snapshot.js save 2026-01-21
node scripts/manage-org-chart-snapshot.js compare 2025-12 2026-01
node scripts/manage-org-chart-snapshot.js list
node scripts/manage-org-chart-snapshot.js latest
```

**Slash Commands**:
```
/generate-org-chart  # Interactive org chart generation (PDF, text, tables)
```

#### Future Phases (See Roadmap)

**Phase 2** (Q1 2026): Interactive agentic org chart visualization
- D3.js tree visualization
- Show human employees + AI-augmented capacity
- Drill-down by department

**Phase 3** (Q1 2026): Month-over-month tracking
- Historical comparison of agentic FTE changes
- Trend indicators, top gainers/decliners

**Phase 4** (Q2 2026): Dashboard integration
- Agentic FTE metric cards on Overview tab
- Executive briefing updates

**Phase 5** (Q2 2026): Analytics & optimization
- Department benchmarking
- ROI analysis
- Manager leaderboards
- Predictive modeling

**Roadmap**: `docs/plans/2026-01-21-agentic-org-chart-roadmap.md`
**Architecture**: `docs/architecture/ADR-002-organizational-chart-data-architecture.md` (updated)

---

**Last Updated**: 2026-01-21
**Status**: Static dashboard with enhanced org chart and agentic FTE tracking
**Next Major Milestone**: Agentic org chart visualization (Phase 2)
