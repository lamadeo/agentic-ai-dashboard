# ADR-001: AI Tools Dashboard Architecture

**Status:** Approved
**Date:** 2024-12-15
**Author:** Luis Amadeo, Chief Agentic Officer, TechCo Inc
**Architect:** Luis Amadeo, Chief Agentic Officer, TechCo Inc
**Decision:** Comprehensive AI Tools Analytics Dashboard with Batch Processing & AI-Generated Insights

---

## Table of Contents

1. [Context](#1-context)
2. [Data Sources](#2-data-sources)
3. [Data Ingestion & Processing](#3-data-ingestion--processing)
4. [Data Schema & Format](#4-data-schema--format)
5. [Application Architecture](#5-application-architecture)
6. [Design-Time to Runtime Flow](#6-design-time-to-runtime-flow)
7. [Automation & Real-Time Considerations](#7-automation--real-time-considerations)
8. [Technologies Used](#8-technologies-used)
9. [Architectural Decisions](#9-architectural-decisions)
10. [Future Considerations](#10-future-considerations)

---

## 1. Context

### Problem Statement

The organization needed a unified dashboard to:
- Track adoption and effectiveness of multiple AI tools (M365 Copilot, Claude Enterprise, Claude Code, GitHub Copilot)
- Compare productivity metrics across coding and productivity tools
- Analyze departmental and team-level usage patterns
- Measure ROI and engagement trends over time
- Provide AI-powered insights to inform strategic decisions

### Key Requirements

- **Unified View:** Single dashboard comparing all AI tools
- **Accurate Metrics:** Correct employee filtering, license tracking, and usage calculations
- **Organizational Context:** Department/team breakdowns based on actual org hierarchy
- **Trend Analysis:** Time-series data showing adoption and engagement patterns
- **AI-Powered Insights:** Automated insight generation for executive consumption
- **Cost-Effective:** Minimize external API calls; use batch processing

---

## 2. Data Sources

### 2.1 True Data Sources

The dashboard aggregates data from multiple disconnected sources:

#### Microsoft 365 Copilot
- **Source:** Microsoft 365 Admin Center → Reports → Copilot Activity
- **Format:** CSV exports (manual download)
- **Files:** 16 CSV files in `/data/`
- **Coverage:** Monthly snapshots (September 2024 - December 2024)
- **Key Fields:**
  - `User Principal Name` (email)
  - `Prompts submitted for All Apps` (monthly count)
  - Individual app usage: Teams, Outlook, Word, Excel, PowerPoint, OneNote, Loop, Whiteboard

**Files:**
```
365 CopilotActivityUserDetail - September 1 to October 1.csv
365 CopilotActivityUserDetail - October 1 - November 1.csv
365 CopilotActivityUserDetail - November 1 - December 1.csv
365 CopilotActivityUserDetail - December 1 to December 7.csv
365 CopilotActivityUserDetail - September 7 to December 7.csv (cumulative)
```

**Important Notes:**
- Microsoft reports are **cumulative 30-day snapshots** (not monthly deltas)
- Monthly delta calculation: `current_month_prompts - previous_month_prompts`
- Microsoft filtering: Excludes 34 users vs our comprehensive count (internal business logic we cannot replicate)

#### Claude Enterprise
- **Source:** Anthropic Admin Console → Data Export API
- **Format:** JSON exports per time period
- **Files:** 33 JSON files in `/data/claude-monthly-data/`
- **Coverage:** Monthly batches (September 2024 - December 2024)
- **Structure:**
  - `conversations.json` - conversation metadata
  - `users.json` - user activity data
  - `projects.json` - project usage
  - `memories.json` - memory/knowledge base usage (currently unused)

**Directory Structure:**
```
claude-monthly-data/
├── claude-ent-data-2025-12-11-21-39-51-batch-0000-Sept_1_to_Sept_30/
├── claude-ent-data-2025-12-11-21-43-37-batch-0000-Oct_1_to_Oct_31/
├── claude-ent-data-2025-12-11-22-11-58-batch-0000-Nov_1_to_Nov_30/
└── claude-ent-data-2025-12-11-22-20-20-batch-0000-Dec_1_to_Dec_11/
```

**Weekly Aggregation:**
- Claude data also includes weekly CSV files for finer-grained trend analysis
- Parsed separately for weekly trend charts

#### GitHub Copilot
- **Source:** GitHub Enterprise Admin → Copilot Usage Metrics
- **Format:** JSON export (manual download)
- **Files:** 1 JSON file in `/data/`
- **Coverage:** All-time cumulative (no time breakdown)
- **Key Metrics:**
  - Lines of code accepted per user
  - Model preferences (Claude, GPT, Gemini, Unknown)
  - Feature usage (code_completion, agent_edit, chat_panel, etc.)

#### Claude Code
- **Source:** Claude Code telemetry or manual tracking
- **Format:** JSON
- **Files:** 1 JSON file in `/data/`
- **Coverage:** Monthly data (September 2024 - December 2024)
- **Key Metrics:**
  - Lines of code generated per user per month
  - Total users per month

#### Organization Hierarchy
- **Source:** Rippling HRIS → Manual export
- **Format:** JSON
- **File:** `techco_org_chart.json` (77KB, 251 employees)
- **Structure:** Hierarchical tree from CEO down through department heads and team leaders
- **Purpose:**
  - Email-to-department/team mapping
  - Identify current vs former employees
  - Calculate departmental adoption rates

**Key Fields:**
```json
{
  "organization": {
    "ceo": {
      "name": "Seth Turner",
      "title": "CEO",
      "directReports": 13,
      "totalTeamSize": 251,
      "reports": [...]
    }
  }
}
```

### 2.2 Data Totals
- **CSV Files:** 16 (M365 Copilot data)
- **JSON Files:** 33 (Claude Enterprise) + 3 (GitHub Copilot, Claude Code, Org Chart) = 36
- **Total Size:** ~500KB (excluding large telemetry files)
- **Time Range:** September 2024 - December 2024 (4 months)
- **Employee Count:** 251 total, 238 active in M365 data

---

## 3. Data Ingestion & Processing

### 3.1 Processing Pipeline

The data processing pipeline consists of three main scripts:

#### **Script 1: `parse-hierarchy.js`**
**Purpose:** Parse organizational hierarchy and build email mappings

**Key Functions:**
- `buildOrgMappingFromHierarchy()`: Parses JSON org chart, extracts all employees
- `generateEmail()`: Generates canonical email from employee name
- `EmailGenerator`: Handles duplicate email detection and generates variants
- `resolveEmailAlias()`: Maps email aliases to canonical org chart emails
- `isCurrentEmployee()`: Validates if email belongs to current employee
- `getDepartmentInfo()`: Returns department/team/title for a given email

**Email Alias Resolution:**
Handles 10+ common email variations:
```javascript
// CEO aliases
'seth@techco.com' → 'sturner@techco.com'

// Name variations/typos
'braftery@techco.com' → 'braferty@techco.com'

// Married name changes
'mkessler@techco.com' → 'mkesslerkiproff@techco.com'

// First-name-only aliases
'lisa@techco.com' → 'lmueller@techco.com'
'missy@techco.com' → 'mmyers@techco.com'
```

**Department Name Mapping:**
Maps department head names to functional department names:
```javascript
'Luis Amadeo' → 'AI & Data'
'Ron Slosberg' → 'Engineering'
'Kelly Wells' → 'Customer Success'
'Laura Jackson' → 'Product'
'Paul Marvin' → 'Finance'
// ... 15 departments total
```

**Output:**
- `orgEmailMap`: Map of email → {name, title, department, team, departmentHead, teamLeader, isDeptHead, isTeamLeader}

---

#### **Script 2: `parse-copilot-data.js`**
**Purpose:** Main data parser that aggregates all tool data into unified dashboard format

**Responsibilities:**
1. Parse organization hierarchy (via `parse-hierarchy.js`)
2. Parse M365 Copilot CSV files (monthly snapshots)
3. Parse Claude Enterprise JSON files (monthly + weekly)
4. Parse GitHub Copilot JSON data
5. Parse Claude Code JSON data
6. Filter non-current employees
7. Calculate monthly deltas and aggregations
8. Generate AI-powered insights (via `generate-insights.js`)
9. Write unified JSON output (`ai-tools-data.json`)

**Key Processing Steps:**

**Step 1: License Configuration**
```javascript
const LICENSE_CONFIG = {
  m365Copilot: {
    licensedUsers: 251,
    lastUpdated: '2024-12-15'
  },
  claudeEnterprise: {
    licensedUsers: 87,
    lastUpdated: '2024-12-15'
  },
  claudeCode: {
    licensedUsers: 11,
    lastUpdated: '2024-12-15'
  }
};
```

**Step 2: M365 Data Processing**
- Read monthly CSV files sorted by date
- For each snapshot:
  - Parse all user rows
  - Filter out non-current employees using `isCurrentEmployee()`
  - Extract prompt counts by app
  - Store cumulative snapshot data
- Calculate monthly deltas: `delta = current_month - previous_month`
- Aggregate app usage across all users

**Step 3: Employee Filtering**
```javascript
snapshot.data.forEach(row => {
  const userEmail = row['User Principal Name']?.toLowerCase().trim();

  // Skip non-current employees (uses email alias resolution internally)
  if (!isCurrentEmployee(userEmail, orgEmailMap)) {
    filteredOutUsers++;
    nonCurrentEmployees.add(userEmail);
    return;
  }

  // Process valid current employee...
});
```

**Filtering Results:**
- Raw M365 users: 265
- Filtered out: 33 non-current employees
- Final active users: 238
- Microsoft's count: 204 (34 fewer due to internal business logic)

**Step 4: Claude Enterprise Processing**
- Read monthly conversation JSON files
- Read weekly user activity CSV files
- For each conversation:
  - Extract user email
  - Count messages (prompts)
  - Track projects and artifacts
  - Map to department/team via `getDepartmentInfo()`
- Aggregate by month and week
- Calculate per-user metrics

**Step 5: GitHub Copilot Processing**
- Read cumulative JSON export
- Extract lines of code by user and model
- Calculate model preference percentages
- Identify top users
- Aggregate feature usage

**Step 6: Claude Code Processing**
- Read monthly JSON data
- Extract lines per user per month
- Calculate total lines and averages

**Step 7: Cross-Tool Comparisons**
```javascript
// Productivity multiplier: Claude Code lines/user ÷ GitHub Copilot lines/user
const productivityMultiplier = claudeCodeLinesPerUser / githubCopilotLinesPerUser;

// Engagement multiplier: Claude prompts/user ÷ M365 prompts/user
const engagementMultiplier = claudePromptsPerUser / m365PromptsPerUser;
```

**Output:**
- `/app/ai-tools-data.json`: 110KB unified dashboard data file

---

#### **Script 3: `generate-insights.js`**
**Purpose:** Generate AI-powered insights for charts using Claude API

**Key Features:**
- Expert system prompts for each chart type
- Graceful degradation if API key not configured
- Rate limiting handling with retries
- Concise, actionable insights (2-3 sentences)

**Insight Types:**
```javascript
const insightTypes = [
  'lines_per_user_trend',      // Code generation productivity
  'adoption_trend',             // User adoption patterns
  'engagement_trend',           // Prompt/conversation trends
  'model_preference',           // AI model selection patterns
  'app_usage_trend',            // M365 app usage distribution
  'productivity_comparison',    // Coding tools comparison
  'strategic_positioning',      // Cross-tool strategy insights
  'claude_enterprise_features', // Feature utilization analysis
  'coding_tools_business_question' // Business value insights
];
```

**Configuration:**
- Model: `claude-sonnet-4-20250514` (default)
- Max Tokens: 500 per insight
- Temperature: 0.3 (consistent, factual)
- Total Insights: 9 per dashboard generation

**Example Insight Generation:**
```javascript
const prompt = `
Data: ${JSON.stringify(data, null, 2)}
Context: ${context}

Analyze this data and provide a concise, actionable insight (2-3 sentences) that highlights
the most important trend and its business implications.
`;

const response = await anthropic.messages.create({
  model: AI_CONFIG.model,
  max_tokens: AI_CONFIG.maxTokens,
  temperature: AI_CONFIG.temperature,
  system: expertPrompt,
  messages: [{ role: 'user', content: prompt }]
});
```

---

### 3.2 Manual vs Automated Steps

#### Manual Steps (Required)
1. **M365 Copilot:** Download monthly CSV from Microsoft 365 Admin Center
2. **Claude Enterprise:** Run data export from Anthropic Admin Console API
3. **GitHub Copilot:** Download JSON from GitHub Enterprise Admin
4. **Claude Code:** Export telemetry or manually compile usage data
5. **Org Chart:** Export hierarchy JSON from Rippling HRIS
6. **Run Parser:** Execute `node scripts/parse-copilot-data.js`
7. **Refresh Dashboard:** Reload Next.js app to display new data

#### Automated Steps
1. Email alias resolution
2. Employee filtering (current vs former)
3. Monthly delta calculations
4. Department/team aggregations
5. Cross-tool comparisons
6. AI insight generation
7. JSON data file generation

---

## 4. Data Schema & Format

### 4.1 Output Schema: `ai-tools-data.json`

The unified dashboard data follows this structure:

```json
{
  "githubCopilot": {
    "activeUsers": 46,
    "totalLines": 85195,
    "linesPerUser": 1852,
    "modelPreferences": [
      {"model": "Claude", "lines": 61763, "percentage": 72},
      {"model": "GPT", "lines": 7670, "percentage": 9}
    ],
    "topUsers": [
      {"username": "dmccom", "lines": 12700}
    ],
    "featureUsage": [
      {"feature": "code_completion", "users": 44, "lines": 5438},
      {"feature": "agent_edit", "users": 27, "lines": 57067}
    ]
  },

  "claudeCode": {
    "activeUsers": 12,
    "licensedUsers": 11,
    "totalLines": 390702,
    "linesPerUser": 32559,
    "monthlyTrend": [
      {"month": "September", "users": 9, "totalLines": 83618, "linesPerUser": 9291},
      {"month": "October", "users": 10, "totalLines": 100861, "linesPerUser": 10086},
      {"month": "November", "users": 12, "totalLines": 99642, "linesPerUser": 8304},
      {"month": "December", "users": 12, "totalLines": 106581, "linesPerUser": 8882}
    ]
  },

  "m365Copilot": {
    "activeUsers": 238,
    "licensedUsers": 251,
    "totalPrompts": 2594,
    "promptsPerUser": 11,
    "appUsage": [
      {"app": "Teams", "users": 215},
      {"app": "Copilot Chat", "users": 190},
      {"app": "Outlook", "users": 134}
    ],
    "monthlyTrend": [
      {"month": "September", "users": 206, "prompts": 443, "promptsPerUser": 2},
      {"month": "October", "users": 226, "prompts": 1022, "promptsPerUser": 5},
      {"month": "November", "users": 238, "prompts": 1129, "promptsPerUser": 5},
      {"month": "December", "users": 47, "prompts": 221, "promptsPerUser": 5}
    ],
    "departmentBreakdown": [
      {
        "department": "Engineering",
        "users": 79,
        "totalPrompts": 776,
        "promptsPerUser": 10,
        "activeUsers": 79,
        "adoptionRate": 100
      }
    ]
  },

  "claudeEnterprise": {
    "activeUsers": 87,
    "licensedUsers": 87,
    "totalConversations": 4284,
    "totalProjects": 182,
    "totalArtifacts": 3681,
    "conversationsPerUser": 49,
    "promptsPerUser": 103,
    "weeklyTrend": [
      {"week": "2025-08-26", "users": 14, "conversations": 56, "messages": 350}
    ],
    "monthlyTrend": [
      {"month": "September", "users": 42, "conversations": 568, "messages": 3993, "messagesPerUser": 95},
      {"month": "October", "users": 56, "conversations": 907, "messages": 8214, "messagesPerUser": 147},
      {"month": "November", "users": 77, "conversations": 1760, "messages": 14417, "messagesPerUser": 187},
      {"month": "December", "users": 75, "conversations": 1019, "messages": 7747, "messagesPerUser": 103}
    ],
    "departmentBreakdown": [...]
  },

  "insights": {
    "lines_per_user_trend": "Claude Code shows 17.6x higher productivity...",
    "adoption_trend": "Steady growth from 206 to 238 users (15% increase)...",
    "engagement_trend": "M365 engagement increased 5x from Sept to Nov...",
    "model_preference": "72% of GitHub Copilot users prefer Claude models...",
    "app_usage_trend": "Teams leads with 215 users, followed by Copilot Chat...",
    "productivity_comparison": "Claude Code generates 17.6x more lines per user...",
    "claude_enterprise_features": "187 messages per user in November shows high engagement...",
    "strategic_positioning": "Claude dominates both coding (72% preference) and productivity...",
    "coding_tools_business_question": "Claude Code's 17.6x productivity advantage justifies premium pricing..."
  },

  "productivityMultiplier": 17.6,
  "engagementMultiplier": 4.9
}
```

### 4.2 Schema Design Principles

1. **Tool-Centric Structure:** Top-level keys for each tool enable easy navigation
2. **Consistent Metrics:** All tools track `activeUsers`, `licensedUsers` (where applicable)
3. **Trend Arrays:** Monthly/weekly trends as arrays for easy charting
4. **Normalized Units:**
   - Code: lines of code
   - Productivity: prompts/messages
   - Users: count of unique emails
5. **Comparative Metrics:** Cross-tool multipliers for executive dashboards
6. **AI Insights:** Separate object with pre-generated insights keyed by chart type
7. **Department Breakdowns:** Consistent structure across M365 and Claude Enterprise

### 4.3 Data Validation Rules

The parser enforces these validation rules:
- Email must match org chart (after alias resolution)
- Prompt counts must be non-negative integers
- Monthly trends must be chronologically ordered
- Department names must match org hierarchy
- Active users ≤ Licensed users (except where actual usage exceeds licenses, e.g., Claude Code)

---

## 5. Application Architecture

### 5.1 Technology Stack

#### Frontend
- **Framework:** Next.js 14.2.0 (React 18.3.1)
- **Styling:** Tailwind CSS 3.4.1
- **Charts:** Recharts 2.12.0
- **Icons:** Lucide React 0.263.1
- **Rendering:** Server-Side Rendering (SSR) with static data import

#### Backend / Processing
- **Runtime:** Node.js 20+
- **CSV Parsing:** Node.js `fs` + custom CSV parser
- **JSON Processing:** Native JSON.parse
- **AI Integration:** Anthropic SDK 0.71.2

#### Development
- **Language:** JavaScript (with JSX for React components)
- **Build Tool:** Next.js built-in webpack
- **Package Manager:** npm
- **Environment:** `.env` file for API keys

### 5.2 Directory Structure

```
as-ai-dashboard/
├── app/                          # Next.js app directory
│   ├── page.jsx                  # Main dashboard UI (Coding Tools & Productivity Tools tabs)
│   ├── layout.jsx                # Root layout wrapper
│   ├── globals.css               # Global styles
│   └── ai-tools-data.json        # Generated dashboard data (110KB)
│
├── scripts/                      # Data processing scripts
│   ├── parse-copilot-data.js     # Main parser (aggregates all data)
│   ├── parse-hierarchy.js        # Org chart parser + email alias resolution
│   ├── generate-insights.js      # AI insight generation module
│   ├── diagnose-m365-data.js     # Debugging utility
│   └── [other utility scripts]
│
├── docs/                         # Documentation & data sources
│   ├── data/                     # Raw data files (not in git)
│   │   ├── *.csv                 # M365 Copilot exports (16 files)
│   │   ├── claude-monthly-data/  # Claude Enterprise exports (33 JSON files)
│   │   ├── techco_org_chart.json
│   │   ├── github-copilot-data.json
│   │   └── claude-code-data.json
│   ├── designs/                  # UI mockups and wireframes
│   ├── plan/                     # Project planning documents
│   └── ADR-001-*.md              # This document!
│
├── .env                          # Environment variables (API keys)
├── .env.example                  # Example env file (checked into git)
├── package.json                  # Dependencies
├── next.config.js                # Next.js configuration
└── tailwind.config.js            # Tailwind CSS configuration
```

### 5.3 Component Architecture

The dashboard UI (`app/page.jsx`) is organized into reusable components:

#### Core Layout Components
- `<TabNavigation>`: Switch between "Coding Tools" and "Productivity Tools" tabs
- `<MetricCard>`: KPI cards showing key metrics (e.g., "M365 Active Users %")
- `<InsightCard>`: AI-generated insights with expandable details

#### Chart Components (using Recharts)
- `<LineChart>`: Trend lines (adoption over time, engagement trends)
- `<BarChart>`: Comparisons (app usage, department breakdowns)
- `<PieChart>`: Distributions (model preferences)
- `<ComposedChart>`: Multi-series data (users + prompts per user)

#### Data Flow
```
ai-tools-data.json (static import)
         ↓
    page.jsx (SSR)
         ↓
    Component state
         ↓
    Recharts components
         ↓
    Rendered dashboard
```

**Key Design Decision:** Static data import (not API fetch) because:
- Data updates infrequently (monthly)
- Reduces runtime dependencies
- Faster page load (no API latency)
- Simplified deployment (no backend server needed)

---

## 6. Design-Time to Runtime Flow

### 6.1 Complete Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                   DESIGN-TIME (Manual)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
   ┌───────────────────────────────────────────────┐
   │  1. Data Collection (Manual Downloads)        │
   │     • M365 Admin Center → CSV exports         │
   │     • Anthropic Console → JSON exports        │
   │     • GitHub Enterprise → JSON export         │
   │     • Rippling HRIS → Org chart JSON          │
   │     • Claude Code → Usage JSON                │
   └───────────────────────────────────────────────┘
                              │
                              ▼
   ┌───────────────────────────────────────────────┐
   │  2. Data Placement                            │
   │     • Place all files in /data/          │
   │     • Maintain monthly folder structure       │
   └───────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  BUILD-TIME (Automated)                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
   ┌───────────────────────────────────────────────┐
   │  3. Parse Organization Hierarchy              │
   │     Script: parse-hierarchy.js                │
   │     • Build email → department/team map       │
   │     • Resolve email aliases                   │
   │     • Identify current employees              │
   │     Output: orgEmailMap (in-memory)           │
   └───────────────────────────────────────────────┘
                              │
                              ▼
   ┌───────────────────────────────────────────────┐
   │  4. Parse M365 Copilot Data                   │
   │     Script: parse-copilot-data.js             │
   │     • Read monthly CSV files                  │
   │     • Filter non-current employees            │
   │     • Calculate monthly deltas                │
   │     • Aggregate by department/app             │
   └───────────────────────────────────────────────┘
                              │
                              ▼
   ┌───────────────────────────────────────────────┐
   │  5. Parse Claude Enterprise Data              │
   │     • Read monthly/weekly JSON files          │
   │     • Extract conversations, messages         │
   │     • Track projects and artifacts            │
   │     • Map users to departments                │
   └───────────────────────────────────────────────┘
                              │
                              ▼
   ┌───────────────────────────────────────────────┐
   │  6. Parse GitHub Copilot Data                 │
   │     • Read cumulative JSON export             │
   │     • Extract lines by user and model         │
   │     • Calculate model preferences             │
   └───────────────────────────────────────────────┘
                              │
                              ▼
   ┌───────────────────────────────────────────────┐
   │  7. Parse Claude Code Data                    │
   │     • Read monthly JSON data                  │
   │     • Extract lines per user per month        │
   └───────────────────────────────────────────────┘
                              │
                              ▼
   ┌───────────────────────────────────────────────┐
   │  8. Calculate Cross-Tool Comparisons          │
   │     • Productivity multiplier (17.6x)         │
   │     • Engagement multiplier (4.9x)            │
   │     • Department adoption rates               │
   └───────────────────────────────────────────────┘
                              │
                              ▼
   ┌───────────────────────────────────────────────┐
   │  9. Generate AI Insights                      │
   │     Script: generate-insights.js              │
   │     • Call Claude API for each chart          │
   │     • Expert system prompts                   │
   │     • Handle rate limits gracefully           │
   │     Output: 9 insights (2-3 sentences each)   │
   └───────────────────────────────────────────────┘
                              │
                              ▼
   ┌───────────────────────────────────────────────┐
   │  10. Write Unified JSON Output                │
   │     File: /app/ai-tools-data.json (110KB)     │
   │     • All tool metrics                        │
   │     • Trends and breakdowns                   │
   │     • AI-generated insights                   │
   └───────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    RUNTIME (Next.js SSR)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
   ┌───────────────────────────────────────────────┐
   │  11. Next.js Server Startup                   │
   │     • Import ai-tools-data.json (static)      │
   │     • No API calls at runtime                 │
   └───────────────────────────────────────────────┘
                              │
                              ▼
   ┌───────────────────────────────────────────────┐
   │  12. User Requests Dashboard                  │
   │     • Browser: GET http://localhost:3001/     │
   │     • Next.js SSR renders page.jsx            │
   └───────────────────────────────────────────────┘
                              │
                              ▼
   ┌───────────────────────────────────────────────┐
   │  13. Render Dashboard UI                      │
   │     • Display KPI cards                       │
   │     • Render charts with Recharts             │
   │     • Show AI insights                        │
   │     • Enable tab navigation                   │
   └───────────────────────────────────────────────┘
                              │
                              ▼
   ┌───────────────────────────────────────────────┐
   │  14. User Interaction                         │
   │     • Switch tabs (Coding vs Productivity)    │
   │     • Hover charts for details                │
   │     • Expand/collapse insights                │
   │     • All interactions are client-side        │
   └───────────────────────────────────────────────┘
```

### 6.2 Key Phases

#### Design-Time (Manual, ~30 minutes/month)
- Download data exports from each platform
- Place files in appropriate directories
- Verify file formats and naming conventions

#### Build-Time (Automated, ~2-5 minutes)
- Run parser script: `node scripts/parse-copilot-data.js`
- Processing time depends on Claude API response times
- Output: Single unified JSON file

#### Runtime (Instant, <100ms)
- Next.js imports static JSON file
- Server-side rendering generates HTML
- Client receives fully-rendered dashboard
- No backend APIs or database queries

---

## 7. Automation & Real-Time Considerations

### 7.1 Current Automation Level

| Task | Status | Notes |
|------|--------|-------|
| Data Collection | ❌ Manual | Requires admin access to each platform |
| Data Placement | ❌ Manual | File system copy/paste |
| Org Chart Sync | ❌ Manual | Rippling export (monthly) |
| Email Alias Resolution | ✅ Automated | In parse-hierarchy.js |
| Employee Filtering | ✅ Automated | Uses org chart |
| Monthly Delta Calculations | ✅ Automated | In parse-copilot-data.js |
| Department Aggregations | ✅ Automated | Uses org hierarchy |
| Cross-Tool Comparisons | ✅ Automated | Calculated in parser |
| AI Insight Generation | ✅ Automated | Claude API calls |
| Dashboard Rendering | ✅ Automated | Next.js SSR |

**Automation Score:** 7/10 tasks automated (70%)

### 7.2 Real-Time vs Batch Processing

#### Batch Processing (Current)
- **Frequency:** Monthly (on-demand)
- **Latency:** Data is 1-30 days old
- **Cost:** Minimal (9 Claude API calls per run, ~$0.10)
- **Complexity:** Low (single-threaded Node.js script)

**Rationale for Batch:**
- AI tool usage data doesn't require real-time monitoring
- Monthly trend analysis is sufficient for strategic decisions
- Manual data collection from M365/Claude/GitHub inherently limits freshness
- Cost-effective: Avoid continuous API polling

#### Real-Time Not Feasible
- **M365 Copilot:** No real-time API; only CSV exports
- **Claude Enterprise:** Batch export API only
- **GitHub Copilot:** No webhook or streaming API
- **Claude Code:** No centralized telemetry server

### 7.3 Future Automation Opportunities

#### High-Priority (Recommended)
1. **Scheduled Data Collection:**
   - Cron job to trigger M365/Claude exports monthly
   - Automated download via API (if/when available)
   - Notification when new data is ready

2. **Git-Based Workflow:**
   - Store raw data files in separate git repo (private)
   - CI/CD pipeline runs parser on commit
   - Auto-deploys updated dashboard

3. **Org Chart API Integration:**
   - Rippling API to fetch live org structure
   - Daily sync to catch new hires/departures
   - Automatic email alias detection

#### Medium-Priority
4. **Incremental Processing:**
   - Only parse new monthly data (not full re-parse)
   - Cache previous months' aggregations
   - Faster build times

5. **Web UI for Data Upload:**
   - Admin panel to upload CSV/JSON files
   - Trigger parser from browser
   - View processing logs

#### Low-Priority
6. **Real-Time Claude Enterprise:**
   - If Anthropic adds webhook support
   - Stream conversations as they happen
   - Daily dashboard updates

---

## 8. Technologies Used

### 8.1 Current Stack

#### Frontend
- **Next.js 14.2.0:** React framework with SSR, file-based routing
- **React 18.3.1:** UI component library
- **Tailwind CSS 3.4.1:** Utility-first CSS framework
- **Recharts 2.12.0:** React charting library built on D3
- **Lucide React 0.263.1:** Icon library (open-source Feather Icons successor)

#### Backend / Data Processing
- **Node.js 20+:** JavaScript runtime for scripts
- **Anthropic SDK 0.71.2:** Official Claude API client
- **dotenv 17.2.3:** Environment variable management
- **Native fs module:** File system operations
- **Native JSON.parse:** JSON parsing (built-in)
- **Custom CSV parser:** Lightweight CSV parsing (no dependencies)

#### Development Tools
- **TypeScript 5.x:** Type definitions for Node/React (not enforced)
- **PostCSS 8.x:** CSS processing for Tailwind
- **Autoprefixer 10.x:** CSS vendor prefixes

### 8.2 Key Technology Decisions

#### Why Next.js?
- **SSR:** Fast initial page load
- **Static Export:** Can deploy as static site if needed
- **React:** Component reusability
- **File-based routing:** Simple project structure
- **Zero config:** Works out of the box

**Alternatives Considered:**
- ❌ Create React App: No SSR, slower
- ❌ Vite: Requires more setup for SSR
- ❌ Remix: Overkill for static dashboard

#### Why Recharts?
- **React-native:** Components integrate seamlessly
- **Declarative:** Easy to customize
- **Responsive:** Auto-scales to container
- **TypeScript support:** Better DX

**Alternatives Considered:**
- ❌ Chart.js: Imperative API, harder to integrate with React
- ❌ D3.js: Too low-level, steep learning curve
- ❌ Victory: Less mature ecosystem

#### Why Custom CSV Parser?
- **Simplicity:** M365 CSVs are straightforward
- **No Dependencies:** Avoid heavy parsing libraries
- **Control:** Handle edge cases (commas in fields, encoding)

**Alternatives Considered:**
- ❌ Papa Parse: 100KB+ dependency for simple CSV
- ❌ csv-parser: Stream-based (overkill for <1MB files)

#### Why Anthropic Claude API?
- **Quality:** Best-in-class insight generation
- **Consistency:** Low temperature (0.3) produces reliable output
- **Context Window:** Large enough for full dataset
- **Cost-Effective:** $0.01 per insight (9 insights = $0.10/run)

**Alternatives Considered:**
- ❌ OpenAI GPT-4: More expensive, similar quality
- ❌ Local LLM (Llama): Requires GPU, slower, lower quality
- ❌ Template-based insights: Static, not adaptive

### 8.3 Potential Future Technologies

#### Database (if scaling beyond 251 employees)
- **PostgreSQL:** Relational data (users, departments)
- **TimescaleDB:** Time-series optimization (monthly trends)
- **SQLite:** Embedded, zero-config for local development

#### Real-Time Streaming (if APIs become available)
- **Server-Sent Events (SSE):** Push updates to browser
- **WebSockets:** Bi-directional real-time communication
- **Redis:** Pub/sub for event streaming

#### Data Warehousing (if multi-year history)
- **DuckDB:** In-process analytical database (like SQLite for analytics)
- **ClickHouse:** Column-oriented OLAP database
- **BigQuery:** Cloud data warehouse

#### Workflow Automation
- **n8n:** Self-hosted workflow automation (like Zapier)
- **Apache Airflow:** Robust data pipeline orchestration
- **GitHub Actions:** CI/CD for automated parsing

#### Visualization Enhancements
- **Tremor:** React components for dashboards (built on Recharts)
- **Visx:** Low-level visualization primitives from Airbnb
- **Observable Plot:** D3 successor for declarative plotting

---

## 9. Architectural Decisions

### 9.1 Decision 1: Employee Filtering Strategy (Option A)

**Context:**
Our M365 data showed 265 active users, but Microsoft's dashboard showed only 204. Analysis revealed 61 extra users:
- 18 were former employees (non-current in org chart)
- 43 were current employees that Microsoft excludes for unknown internal reasons

**Options Considered:**
- **Option A:** Keep comprehensive count (filter only non-current employees)
- **Option B:** Approximate Microsoft's filtering logic (complex, incomplete)
- **Option C:** Use Microsoft's CSV as source of truth (lose departmental breakdowns)

**Decision:** **Option A - Comprehensive Count**

**Rationale:**
- More accurate representation of actual usage
- Transparent filtering (can explain to stakeholders)
- Departmental breakdowns rely on org chart
- Microsoft's internal filtering cannot be replicated without their business rules

**Outcome:**
- Active Users: **238** (filtered from 265)
- Microsoft's Count: **204** (34 fewer)
- Difference: Accepted as Microsoft's internal business logic

**Pros:**
✅ Accurate departmental adoption rates
✅ Transparent, explainable filtering
✅ Includes all legitimate usage
✅ Consistent with org hierarchy

**Cons:**
❌ 34-user discrepancy vs Microsoft's dashboard
❌ May confuse stakeholders expecting exact match
❌ Cannot replicate Microsoft's internal account type filtering

---

### 9.2 Decision 2: Email Alias Resolution

**Context:**
Employees use multiple email variations that don't match org chart emails:
- First-name aliases: `lisa@techco.com` vs `lmueller@techco.com`
- Married name changes: `mkessler@techco.com` vs `mkesslerkiproff@techco.com`
- Typos: `braftery@` vs `braferty@`

**Decision:** **Centralized Email Alias Mapping**

**Implementation:**
```javascript
const EMAIL_ALIAS_MAP = {
  'seth@techco.com': 'sturner@techco.com',
  'lisa@techco.com': 'lmueller@techco.com',
  // ... 10+ mappings
};
```

**Rationale:**
- One source of truth for email resolution
- Easy to maintain and extend
- Automatic resolution in all data parsing

**Pros:**
✅ Handles name changes gracefully
✅ Catches historical data with old emails
✅ Centralized maintenance
✅ No manual data cleanup required

**Cons:**
❌ Requires manual mapping discovery
❌ May miss new aliases until manually added
❌ No automatic fuzzy matching

---

### 9.3 Decision 3: License Count Management

**Context:**
Initially used `orgEmailMap.size` (251 total employees) as licensed user count for ALL tools, which was incorrect.

**Decision:** **Tool-Specific LICENSE_CONFIG**

**Implementation:**
```javascript
const LICENSE_CONFIG = {
  m365Copilot: { licensedUsers: 251, lastUpdated: '2024-12-15' },
  claudeEnterprise: { licensedUsers: 87, lastUpdated: '2024-12-15' },
  claudeCode: { licensedUsers: 11, lastUpdated: '2024-12-15' },
  githubCopilot: { /* uses actual active users */ }
};
```

**Rationale:**
- Each tool has different license counts
- Easy to update monthly
- Documents when counts were last verified
- GitHub Copilot doesn't have fixed licenses (seat-based)

**Pros:**
✅ Accurate adoption rate calculations
✅ Documents license verification dates
✅ Easy to update monthly
✅ Clear separation of concerns

**Cons:**
❌ Requires manual updates
❌ No API to fetch live license counts
❌ Risk of stale data if not updated

---

### 9.4 Decision 4: Monthly Delta Calculation for M365

**Context:**
Microsoft reports are cumulative 30-day snapshots (e.g., "prompts in last 30 days"). To calculate monthly trends, we need deltas.

**Decision:** **Subtract Previous Month's Cumulative from Current**

**Implementation:**
```javascript
const monthlyDelta = currentMonthCumulative - previousMonthCumulative;
```

**Rationale:**
- Microsoft doesn't provide monthly deltas directly
- Subtraction method is mathematically sound for non-overlapping months
- Handles edge cases (new users, returning users)

**Edge Cases:**
- **First month:** No previous snapshot → use cumulative as delta
- **Returning users:** User in Month 3 but not Month 2 → full Month 3 count
- **Gaps in data:** If missing Month 2, Month 3 delta includes both months

**Pros:**
✅ Accurate monthly activity tracking
✅ Handles new users correctly
✅ Works with Microsoft's reporting format

**Cons:**
❌ Requires multiple monthly files
❌ Gaps in data collection create inflated deltas
❌ Complex to explain to non-technical stakeholders

---

### 9.5 Decision 5: Batch Processing vs Real-Time

**Decision:** **Batch Processing with Manual Triggering**

**Rationale:**
- Data sources don't support real-time APIs
- Monthly trend analysis is sufficient
- Cost-effective (9 Claude API calls per run)
- Simpler architecture (no websockets, no database)

**Pros:**
✅ Simple architecture
✅ Low cost ($0.10 per run)
✅ No database required
✅ Predictable performance
✅ Easy to debug

**Cons:**
❌ Data is 1-30 days stale
❌ Requires manual execution
❌ No alerts for unusual activity
❌ Cannot track intra-month trends

---

### 9.6 Decision 6: AI Insight Generation Strategy

**Decision:** **Per-Chart Expert System Prompts with Claude API**

**Implementation:**
- Expert system prompt for each chart type (9 total)
- Low temperature (0.3) for consistency
- 500 max tokens per insight (2-3 sentences)
- Graceful degradation if API key missing

**Rationale:**
- Better insights than template-based
- Consistent tone and format
- Adapts to data changes automatically
- Low cost ($0.01 per insight)

**Pros:**
✅ High-quality, adaptive insights
✅ Consistent tone across dashboard
✅ Automatically updates with new data
✅ Cost-effective ($0.10 per dashboard generation)
✅ Graceful degradation (dashboard works without insights)

**Cons:**
❌ Requires Anthropic API key
❌ Rate limiting can delay processing
❌ Insights quality depends on prompt engineering
❌ No human review before display (trust AI output)

---

### 9.7 Decision 7: Static JSON Import vs API

**Decision:** **Static JSON Import (No Runtime API)**

**Implementation:**
```javascript
import aiToolsData from './ai-tools-data.json';
```

**Rationale:**
- Data updates monthly (not real-time)
- Faster page load (no API latency)
- No backend server required
- Simpler deployment

**Pros:**
✅ Fast page load (<100ms)
✅ No backend server needed
✅ Works with static site deployment
✅ No API rate limiting issues
✅ Predictable performance

**Cons:**
❌ Requires rebuild to update data
❌ Cannot update data without redeploying
❌ Not suitable for real-time dashboards
❌ Large JSON file (110KB) included in bundle

---

### 9.8 Decision 8: Department Mapping from Org Hierarchy

**Decision:** **Use Actual Reporting Structure (Not Title-Based Inference)**

**Rationale:**
- Org chart is source of truth
- Titles are inconsistent ("Senior Engineer" vs "Staff Engineer")
- Reporting structure changes are reflected immediately
- Supports team-level granularity

**Implementation:**
- CEO's direct reports = Department Heads
- Department Head's name maps to functional department name
- Mid-level managers = Team Leaders

**Pros:**
✅ Accurate departmental attribution
✅ Handles complex reporting structures
✅ Supports team-level analysis
✅ Source of truth (HRIS)

**Cons:**
❌ Requires monthly org chart export
❌ Department name mapping requires maintenance
❌ Matrix reporting not supported (assumes single manager)
❌ Contractors without org chart entries excluded

---

## 10. Future Considerations

### 10.1 Scalability

#### Current Limits
- **Employee Count:** 251 (fits in memory)
- **Time Range:** 4 months (Sept-Dec 2024)
- **File Count:** 49 files (~500KB total)
- **Processing Time:** 2-5 minutes (Claude API bottleneck)

#### Scaling to 1,000+ Employees
- **Memory:** Node.js default heap (512MB) is sufficient
- **Processing:** Linear time complexity (O(n) per file)
- **Storage:** ~2MB per month (acceptable)
- **Optimization:** Parallel file parsing, incremental processing

#### Scaling to 2+ Years of History
- **Current:** Store all monthly trends in JSON (4 months = 10KB)
- **Future:** Database for historical data (PostgreSQL/TimescaleDB)
- **UI:** Add date range filters to dashboard
- **Insight Generation:** Limit to recent 6-12 months

### 10.2 Real-Time Data Integration

#### Prerequisites
- **M365 Copilot API:** Microsoft Graph API support (not yet available)
- **Claude Enterprise Webhooks:** Real-time conversation events (not yet available)
- **GitHub Copilot Webhooks:** Usage event streaming (not yet available)

#### Architecture Changes Required
- **Database:** Store event streams (PostgreSQL + TimescaleDB)
- **Backend:** Express.js or Next.js API routes for webhooks
- **WebSocket:** Push live updates to dashboard
- **Aggregation:** Background job to compute hourly/daily rollups
- **Caching:** Redis for frequently accessed metrics

#### Estimated Effort
- **MVP (hourly updates):** 2-3 weeks
- **Real-time (WebSocket):** 4-6 weeks
- **Production-ready:** 8-12 weeks

### 10.3 Advanced Analytics

#### Predictive Insights
- **Adoption Forecasting:** Linear regression on monthly growth
- **Churn Prediction:** Identify users with declining activity
- **ROI Modeling:** Cost per prompt vs productivity gain

#### Cohort Analysis
- **New Hire Onboarding:** Track first 90 days of AI tool usage
- **Department Comparison:** Which teams adopt fastest?
- **Power Users:** Identify and study top 10% users

#### Sentiment Analysis
- **Claude Conversations:** Analyze user messages for frustration/satisfaction
- **M365 Prompts:** Topic modeling to understand common use cases

#### Collaboration Patterns
- **Project Sharing:** Track Claude Enterprise project collaborations
- **Knowledge Transfer:** Identify subject matter experts by conversation topics

### 10.4 Multi-Tenant / SaaS Version

If building this as a product for other companies:

#### Data Isolation
- **Database:** Schema per tenant (PostgreSQL schemas)
- **File Storage:** S3 bucket per tenant
- **API Keys:** Encrypted per tenant

#### Onboarding
- **Org Chart Import:** CSV/JSON upload + mapping wizard
- **Email Alias Configuration:** Admin UI for managing aliases
- **License Counts:** Manual entry or API integration

#### Pricing Model
- **Per Employee:** $2-5 per employee per month
- **Per Dashboard:** $500-1,000 per month flat fee
- **Enterprise:** Custom pricing for 1,000+ employees

### 10.5 AI Governance & Observability

#### Usage Tracking
- **Who:** Track which executives view which insights
- **What:** Log questions asked in natural language
- **When:** Time-series of dashboard views
- **Cost:** Track Claude API usage per tenant

#### Audit Logging
- **Data Access:** Log all raw data file accesses
- **Configuration Changes:** Track LICENSE_CONFIG updates
- **Insight Regeneration:** Log AI prompt/response pairs

#### Security
- **Data Encryption:** Encrypt raw CSV/JSON files at rest
- **Access Control:** Role-based permissions (Admin, Viewer)
- **Data Retention:** Auto-delete files older than 2 years

### 10.6 Enhanced User Experience

#### Interactive Filters
- **Date Range:** Filter to specific months or quarters
- **Department:** Focus on specific department or team
- **Tool:** Compare any two tools side-by-side
- **User Search:** Look up individual user's activity

#### Export & Reporting
- **PDF Reports:** Generate executive summary PDFs
- **CSV Exports:** Download raw data tables
- **Email Digests:** Weekly/monthly summary emails
- **Slack Integration:** Post insights to channels

#### Natural Language Queries
- **Chat Interface:** "Which department uses Claude most?"
- **Voice Input:** Speak questions to dashboard
- **Insight Drill-Down:** Click insight to see underlying data

#### Mobile Responsiveness
- **Current:** Desktop-only layout
- **Future:** Responsive design for tablets/phones
- **Mobile App:** Native iOS/Android apps

### 10.7 Cost Optimization

#### Current Costs (Per Month)
- **Claude API:** $0.10 per dashboard generation × 1 generation/month = $0.10/month
- **Hosting:** Next.js on Vercel Free Tier = $0/month
- **Total:** ~$0.10/month

#### At Scale (100 dashboards/month)
- **Claude API:** $0.10 × 100 = $10/month
- **Hosting:** Vercel Pro ($20/month) or self-hosted ($5-10/month)
- **Total:** ~$30/month

#### Optimizations
- **Caching:** Cache AI insights for 24 hours (reuse for multiple viewers)
- **Batch Processing:** Generate all insights in parallel (reduce latency)
- **Cheaper Models:** Use Claude Haiku for simple insights ($0.001 per insight)
- **Template Fallbacks:** Use templates for repetitive insights (100% savings)

### 10.8 Data Quality & Validation

#### Automated Checks
- **Email Validation:** Flag emails not in org chart
- **Anomaly Detection:** Alert on 10x usage spikes
- **Completeness:** Warn if monthly data missing
- **Consistency:** Cross-check totals across tools

#### Manual Review Workflows
- **Approval Queue:** Review insights before publishing
- **Data Corrections:** UI to manually adjust incorrect values
- **Feedback Loop:** Report incorrect insights to improve prompts

### 10.9 Integration Ecosystem

#### HRIS Integration
- **Rippling API:** Auto-sync org chart daily
- **BambooHR:** Support alternative HRIS
- **Workday:** Enterprise HRIS integration

#### Business Intelligence Tools
- **Looker/Tableau:** Export data to BI platforms
- **Power BI:** Embed dashboard as Power BI visual
- **Google Data Studio:** Connector for live data

#### Communication Platforms
- **Slack:** Post weekly summaries to #ai-tools channel
- **Microsoft Teams:** Embed dashboard as Teams app
- **Email:** Automated monthly reports to executives

---

## Summary & Recommendations

### What We Built

A comprehensive AI tools analytics dashboard that:
- Aggregates data from 4 AI tools (M365 Copilot, Claude Enterprise, Claude Code, GitHub Copilot)
- Processes 49 data files (16 CSVs + 33 JSONs) into a unified 110KB JSON format
- Generates 9 AI-powered insights using Claude API
- Displays metrics across two tabs: Coding Tools and Productivity Tools
- Filters 238 active users from 251 total employees using org hierarchy
- Tracks adoption rates, engagement trends, and productivity multipliers
- Renders as a fast, static Next.js dashboard with SSR

### Key Architectural Strengths

✅ **Simple & Maintainable:** Single parser script, no database
✅ **Cost-Effective:** $0.10 per dashboard generation
✅ **Fast:** <100ms page load with SSR
✅ **Accurate:** Org chart-based filtering with email alias resolution
✅ **Extensible:** Easy to add new tools or metrics
✅ **AI-Powered:** Automated insight generation saves manual analysis

### Known Limitations

❌ **Manual Data Collection:** Requires monthly CSV/JSON downloads
❌ **Batch Processing:** Data is 1-30 days stale
❌ **No Real-Time:** Cannot monitor live activity
❌ **Scaling:** Not optimized for 1,000+ employees or 2+ years of history
❌ **Single Tenant:** Not designed for multi-company SaaS

### Recommended Next Steps

#### Phase 1: Improve Automation (Next 1-3 Months)
1. **Git-based workflow:** Store data in private repo, CI/CD triggers parser
2. **Scheduled exports:** Cron job for monthly data collection
3. **Org chart API:** Rippling integration for daily sync
4. **Notifications:** Email/Slack when new dashboard is ready

#### Phase 2: Enhanced Analytics (Next 3-6 Months)
5. **Database migration:** PostgreSQL for historical data (6+ months)
6. **Advanced filtering:** Department, team, date range filters in UI
7. **Predictive insights:** Adoption forecasting, churn prediction
8. **Export functionality:** PDF reports, CSV downloads

#### Phase 3: Real-Time Capabilities (Next 6-12 Months)
9. **API integrations:** When M365/Claude/GitHub support webhooks
10. **WebSocket updates:** Live dashboard updates
11. **Anomaly detection:** Alerts for unusual activity
12. **Natural language queries:** Chat interface for ad-hoc questions

---

## Approval & Sign-Off

**Decision Status:** ✅ Approved
**Date Approved:** 2024-12-15
**Approved By:** Luis Amadeo
**Implementation Status:** Complete (v1.0)

**Next Review Date:** 2025-03-15 (3 months)

---

## Appendix

### A. Glossary

- **ADR:** Architecture Decision Record
- **SSR:** Server-Side Rendering
- **M365:** Microsoft 365
- **Org Chart:** Organization hierarchy (reporting structure)
- **Email Alias:** Alternative email address for the same person
- **Cumulative Snapshot:** Report showing data for last N days (not monthly delta)
- **Monthly Delta:** Activity in a specific month (calculated by subtraction)
- **Active User:** User with at least 1 prompt/conversation in a time period
- **Licensed User:** User with an active license (may or may not be active)
- **Adoption Rate:** Active users ÷ Licensed users

### B. File Naming Conventions

#### M365 Copilot CSVs
```
365 CopilotActivityUserDetail - [Month] [Start Date] to [End Date].csv
Example: 365 CopilotActivityUserDetail - November 1 - December 1.csv
```

#### Claude Enterprise JSON Batches
```
claude-ent-data-[YYYY-MM-DD-HH-mm-ss]-batch-[ID]-[MonthName]_[Start]_to_[MonthName]_[End]/
Example: claude-ent-data-2025-12-11-22-11-58-batch-0000-Nov_1_to_Nov_30/
```

#### Output File
```
/app/ai-tools-data.json
```

### C. Key Metrics Definitions

| Metric | Definition | Calculation |
|--------|------------|-------------|
| Active Users | Users with any activity in time period | `COUNT(DISTINCT user_email WHERE activity > 0)` |
| Licensed Users | Users with active license | Manual count from admin console |
| Adoption Rate | % of license holders who are active | `(Active Users ÷ Licensed Users) × 100` |
| Prompts per User | Average prompts per active user | `Total Prompts ÷ Active Users` |
| Lines per User | Average lines of code per active user | `Total Lines ÷ Active Users` |
| Productivity Multiplier | Relative productivity vs baseline | `Tool A Lines/User ÷ Tool B Lines/User` |
| Engagement Multiplier | Relative engagement vs baseline | `Tool A Prompts/User ÷ Tool B Prompts/User` |

### D. Email Alias Examples

```javascript
// CEO
'seth@techco.com' → 'sturner@techco.com'

// Typos
'braftery@techco.com' → 'braferty@techco.com'
'lobrien-schwarz@techco.com' → 'lobrienschwarz@techco.com'

// Married name changes
'mkessler@techco.com' → 'mkesslerkiproff@techco.com'
'msmithclary@techco.com' → 'mclary@techco.com'

// First-name aliases
'lisa@techco.com' → 'lmueller@techco.com'
'missy@techco.com' → 'mmyers@techco.com'
'madison@techco.com' → 'mswenson@techco.com'

// Name variations
'mlsilva@techco.com' → 'msilva@techco.com'
'zfeng@techco.com' → 'jfeng@techco.com'
'ymakovsky@techco.com' → 'emakovsky@techco.com'
```

### E. Related Documents

- `/docs/plan/` - Original project planning documents
- `/docs/designs/` - UI mockups and wireframes
- `/docs/SESSION_RESUME.md` - Development session notes
- `/.env.example` - Environment variable template
- `/package.json` - Dependency versions

---

**Document Version:** 1.0
**Last Updated:** 2024-12-15
**Maintained By:** Luis Amadeo (AI & Data Team)
