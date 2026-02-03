# Data Sources & Schemas

## Available Data Files (`/data/`)

### Claude Enterprise Data

#### 1. Audit Logs
**File**: `Claude Usage - audit_logs Nov_1_to_Dec_9.csv` (2.2MB)

**Schema**:
```csv
event, created_at, actor_info, conversation_id, project_id
```

**Fields**:
- `event`: Event type (e.g., 'conversation_created', 'project_created', 'file_uploaded', 'message_created')
- `created_at`: ISO 8601 timestamp (e.g., '2025-11-01T14:23:45.123Z')
- `actor_info`: JSON string with single quotes (⚠️ needs parsing)
  ```json
  {
    "metadata": {
      "email_address": "user@techco.com",
      "name": "First Last"
    },
    "username": "username"
  }
  ```
- `conversation_id`: UUID
- `project_id`: UUID (null if not project-related)

**Parsing Notes**:
- `actor_info` has single quotes, must replace with double quotes: `.replace(/'/g, '"')`
- Extract email from: `JSON.parse(actor_info).metadata.email_address`
- Some rows may have null/missing actor_info (handle gracefully)

**Use For**:
- Conversation counts
- User activity tracking
- Last seen timestamps
- Daily active users
- Event-level analytics

---

#### 2. Usage Analytics Reports (PDFs)
**Files**:
- `Claude Usage Analytics Report - Oct 2025.pdf` (530KB)
- `Claude Usage Analytics Report - Nov 1 to Dec 9 2025.pdf` (1.4MB)

**Content**:
- Summary metrics from Anthropic console
- Visual charts (may need manual extraction)
- User counts, conversation counts
- Adoption rates
- Department breakdowns (if available)

**Parsing**: Manual extraction or OCR (not critical - we have CSV data)

---

#### 3. License List (Structured CSV)
**File**: `Claude Usage - October 2025.csv` (12KB)

**Schema**: (Need to verify exact format)
```csv
email, name, seat_tier, status, activated_at
```

**Use For**:
- Total licensed users (85)
- Premium vs Standard breakdown (12 Premium, 73 Standard)
- Activation status (Active vs Pending)
- User roster for cross-referencing

---

### Claude Code Data

#### 1. Usage Reports (PDFs)
**Files**:
- `Claude Code Usage Report - November 01-30, 2025.pdf` (353KB)
- `Claude Code Usage Report - December 01-31, 2025.pdf` (371KB)

**Format**: Leaderboard text format
```
Top users by lines of code generated:
1. gtaborga 52,347 lines
2. jhampton 43,210 lines
3. user3 38,921 lines
...
```

**Parsing Strategy**:
```typescript
const regex = /(\d+)\.\s+(\w+)\s+([\d,]+)\s+lines/g;
const matches = [...text.matchAll(regex)];

matches.forEach(match => {
  const rank = parseInt(match[1]);
  const username = match[2];
  const lines = parseInt(match[3].replace(/,/g, ''));
  // Map username to email: `${username}@techco.com`
});
```

**Use For**:
- Leaderboard display
- Lines of code per user
- Productivity metrics
- Month-over-month trends

---

#### 2. Structured CSVs (if available)
**Files**:
- `claude_code_team_2025_11_01_to_2025_11_30.csv` (324B)
- `claude_code_team_2025_12_01_to_2025_12_31.csv` (438B)

**Schema** (likely):
```csv
username, lines_of_code, rank, period_start, period_end
```

**Use For**: Same as PDF data, but easier to parse

---

### GitHub Copilot Data

#### 1. Usage Data (NDJSON)
**File**: `github-copilot-usage-data.ndjson` (1.5MB)

**Format**: Newline-delimited JSON (one object per line)

**Schema** (example):
```json
{
  "username": "dmccom",
  "date": "2025-11-15",
  "lines_suggested": 1247,
  "lines_accepted": 342,
  "feature": "code_completion",
  "language": "typescript",
  "editor": "vscode"
}
```

**Parsing**:
```typescript
const lines = ndjsonContent.split('\n').filter(Boolean);
const records = lines.map(line => JSON.parse(line));
```

**Use For**:
- Active Copilot users (46)
- Feature usage (code_completion, agent_edit, chat_panel)
- Language breakdown
- Lines suggested vs accepted (acceptance rate)

---

#### 2. Code Generation Data (NDJSON)
**File**: `github-copilot-code-generation-data.ndjson` (1.5MB)

**Format**: Newline-delimited JSON

**Schema** (example):
```json
{
  "username": "dmccom",
  "date": "2025-11-15",
  "model": "Claude 4.5 Sonnet",
  "lines_added": 842,
  "suggestions_count": 127,
  "acceptance_rate": 0.112,
  "feature": "agent_edit"
}
```

**CRITICAL FIELD**: `model` - Shows which AI model was used
- "Claude 4.5 Sonnet" - 81,198 lines (48%)
- "Claude 4.0 Sonnet" - 42,328 lines (25%)
- "Gemini 2.5 Pro" - 13,268 lines (8%)
- "GPT-5-mini" - 8,396 lines (5%)
- "GPT-5.0" - 5,708 lines (3%)
- "Auto" / "Unknown" - 18,494 lines (11%)

**KEY INSIGHT**: Claude models = 72% of total lines (123,526 / 170,390)

**Use For**:
- Model preference analysis (CRITICAL for March decision)
- Lines per user by model
- Total Copilot productivity
- Comparison with Claude Code productivity

---

### Microsoft 365 Copilot Data

#### 1. Usage Reports (CSVs)
**Files**:
- `365 Copilot Usage October 2025(CopilotActivityUserDetailV411_4).csv` (34KB)
- `365 Copilot Usage - November 2025(in).csv` (26KB)
- `365 CopilotActivityUserDetail - November 10 to December 10.csv` (37KB)

**Schema** (typical M365 Copilot report):
```csv
UserPrincipalName, DisplayName, LastActivityDate, Word, Excel, PowerPoint, Teams, Outlook, TotalActions
```

**Fields**:
- `UserPrincipalName`: Email address
- `DisplayName`: User's full name
- `LastActivityDate`: Last time user used M365 Copilot
- `Word`: Number of Copilot actions in Word
- `Excel`: Number of Copilot actions in Excel
- `PowerPoint`: Number of Copilot actions in PowerPoint
- `Teams`: Number of Copilot actions in Teams (chat, meetings)
- `Outlook`: Number of Copilot actions in Outlook (email drafting)
- `TotalActions`: Sum of all actions

**Use For**:
- M365 Copilot adoption rate (% of org)
- Usage by application
- Active users trend
- Comparison with Claude Enterprise adoption
- Use case analysis (Office work vs strategic work)

---

### Organizational Data

#### 1. Org Chart (PDF)
**File**: `Org Chart - Org Diagram - Rippling.pdf` (15MB)

**Content**:
- Visual org chart from Rippling
- Department structure
- Reporting relationships
- Employee names and titles

**Use For**:
- Total employees per department
- Department hierarchy
- Manager assignments
- Expansion planning (total addressable users per dept)

**Parsing**: Manual extraction for now, MCP connector in future

---

#### 2. Department Mapping
Need to maintain manual mapping for departments mentioned in data:

```typescript
const DEPARTMENT_MAPPING = {
  // Engineering
  'Engineering': { parent: null, type: 'engineering' },
  'AI Team': { parent: 'Engineering', type: 'engineering' },
  'Platform': { parent: 'Engineering', type: 'engineering' },
  'Product Engineering': { parent: 'Engineering', type: 'engineering' },

  // Product
  'Product': { parent: null, type: 'product' },

  // GTM (Go-to-Market)
  'Sales': { parent: 'GTM', type: 'gtm' },
  'Marketing': { parent: 'GTM', type: 'gtm' },
  'Customer Success': { parent: 'GTM', type: 'gtm' },

  // Service
  'Service': { parent: null, type: 'service' },
  'Support': { parent: 'Service', type: 'service' },
  'Professional Services': { parent: 'Service', type: 'service' },

  // Corporate
  'Finance': { parent: 'Corporate', type: 'corporate' },
  'HR': { parent: 'Corporate', type: 'corporate' },
  'Legal': { parent: 'Corporate', type: 'corporate' },
  'IT': { parent: 'Corporate', type: 'corporate' }
};
```

---

### Slack Sentiment & Use Cases (Continuous Data Source)

#### Monitored Channels
Real-time sentiment analysis and use case extraction from:

1. **`#claude-code-dev`**
   - Engineering feedback on Claude Code
   - Technical issues and solutions
   - Productivity wins and time savings
   - Feature requests

2. **`#claude-enterprise`**
   - General Claude adoption questions
   - Use case sharing across teams
   - Success stories
   - Onboarding challenges

3. **`#ai-collab`**
   - Cross-functional AI collaboration
   - Tool comparison discussions
   - Best practices sharing
   - Strategic AI initiatives

4. **`#techco-thrv`**
   - Company-wide discussions
   - Executive visibility into AI adoption
   - Strategic insights
   - Organizational impact stories

5. **`#as-ai-dev`**
   - AI development team coordination
   - Technical insights and implementation details
   - Tool evaluation and testing
   - Engineering best practices with AI

6. **`#technology`**
   - Technical tool evaluations
   - IT/infrastructure considerations
   - Budget and procurement discussions
   - Vendor comparisons

#### Data Collection Strategy

**Slack API / MCP Connector**:
```typescript
// Fetch messages from channels
const messages = await slack.conversations.history({
  channel: channelId,
  oldest: timestampDaysAgo(7), // Last 7 days
  limit: 1000
});

// Filter for AI tool mentions
const relevant = messages.filter(msg =>
  msg.text?.match(/(claude|copilot|chatgpt|m365|ai|productivity)/i)
);
```

**What to Extract**:
- **Success stories**: Time savings, problem solving, value creation
- **Pain points**: Access issues, feature gaps, training needs
- **Use cases**: How teams actually use AI tools
- **Preferences**: Tool comparisons, user satisfaction
- **ROI stories**: Specific examples of business value
- **Blockers**: What prevents adoption or usage

**Sentiment Analysis** (via Claude API):
```typescript
const sentiment = await claude.analyze({
  prompt: `Analyze these Slack messages for AI tool sentiment.
  Categorize by: tool, sentiment (positive/negative/neutral), use case, value story.

  Messages: ${JSON.stringify(messages)}`
});
```

**Privacy Considerations**:
- Aggregate analysis only (no individual tracking)
- Focus on tool usage, not personal performance
- Public channel data only
- No PII in dashboards

---

### Other AI Tools (Shadow IT)

#### 1. ChatGPT Usage (via ZScaler)
**File**: `ChatGPT ZS October 2025(2025-11-05_16_27_04_SHADOW_IT_R).csv` (14KB)

**Use For**:
- Shadow IT tracking
- Users accessing ChatGPT (potentially bypassing Claude)
- Risk assessment

**Note**: Not primary focus but useful for comprehensive view

---

#### 2. AI Tool Summary
**Files**:
- `October 2025 AI Usage(October All AI & ML).csv` (3.6KB)
- `November 2025 - AI All(AI & ML - November 2025).csv` (3.0KB)

**Content**: Aggregated view of all AI tool usage across org

**Use For**: High-level trends, total AI spend, tool sprawl visualization

---

## Data Parsing Requirements

### CSV Parsing (PapaParse)
```typescript
import Papa from 'papaparse';

export function parseCSV(csvContent: string) {
  const result = Papa.parse(csvContent, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: 'greedy',
    transformHeader: (header) => header.trim()
  });

  if (result.errors.length > 0) {
    console.error('CSV parsing errors:', result.errors);
  }

  return result.data;
}
```

### PDF Parsing (pdf-parse)
```typescript
import pdf from 'pdf-parse';

export async function parsePDF(pdfBuffer: Buffer) {
  const data = await pdf(pdfBuffer);
  return data.text; // Extract raw text
}

// Example: Parse Claude Code leaderboard
export function parseCodeUsagePDF(pdfText: string) {
  const regex = /(\d+)\.\s+(\w+)\s+([\d,]+)\s+lines/g;
  const matches = [...pdfText.matchAll(regex)];

  return matches.map(match => ({
    rank: parseInt(match[1]),
    username: match[2],
    linesOfCode: parseInt(match[3].replace(/,/g, ''))
  }));
}
```

### NDJSON Parsing
```typescript
export function parseNDJSON(ndjsonContent: string) {
  const lines = ndjsonContent.split('\n').filter(line => line.trim());
  return lines.map(line => {
    try {
      return JSON.parse(line);
    } catch (error) {
      console.error('Failed to parse NDJSON line:', line);
      return null;
    }
  }).filter(Boolean);
}
```

### JSON in CSV (actor_info field)
```typescript
export function parseActorInfo(actorInfoString: string) {
  try {
    // Replace single quotes with double quotes
    const jsonString = actorInfoString.replace(/'/g, '"');
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to parse actor_info:', actorInfoString);
    return null;
  }
}

// Usage:
const actorInfo = parseActorInfo(row.actor_info);
const email = actorInfo?.metadata?.email_address;
```

---

## Data Quality Challenges

### 1. Username → Email Mapping
```typescript
// Claude Code uses usernames, need emails for cross-reference
function usernameToEmail(username: string): string {
  if (username.includes('@')) return username;
  return `${username}@techco.com`;
}
```

### 2. Department Name Inconsistencies
```typescript
// Normalize department names
function normalizeDepartment(dept: string): string {
  const normalized = dept.trim().toLowerCase();

  const mapping = {
    'eng': 'Engineering',
    'engineering': 'Engineering',
    'product eng': 'Engineering',
    'ai': 'AI Team',
    'ai team': 'AI Team',
    // ... more mappings
  };

  return mapping[normalized] || dept;
}
```

### 3. Date Format Variations
```typescript
// Handle multiple date formats
function parseDate(dateString: string): Date {
  // ISO 8601: "2025-11-01T14:23:45.123Z"
  // Short date: "2025-11-01"
  // US format: "11/01/2025"

  return new Date(dateString);
}
```

### 4. Missing/Invalid Data
```typescript
// Graceful handling
function safeGet<T>(obj: any, path: string, defaultValue: T): T {
  const keys = path.split('.');
  let value = obj;

  for (const key of keys) {
    if (value == null) return defaultValue;
    value = value[key];
  }

  return value ?? defaultValue;
}

// Usage:
const email = safeGet(actorInfo, 'metadata.email_address', 'unknown@techco.com');
```

---

## Data Aggregation Queries

### Example: Calculate Daily Active Users
```typescript
async function getDailyActiveUsers(startDate: Date, endDate: Date) {
  // Group audit events by date, count distinct users
  const result = await db.$queryRaw`
    SELECT
      DATE(event_date) as date,
      COUNT(DISTINCT user_email) as active_users
    FROM audit_events
    WHERE event_date >= ${startDate}
      AND event_date <= ${endDate}
    GROUP BY DATE(event_date)
    ORDER BY date ASC
  `;

  return result;
}
```

### Example: Model Preference in GitHub Copilot
```typescript
async function getModelPreference(startDate: Date, endDate: Date) {
  const result = await db.$queryRaw`
    SELECT
      model,
      SUM(lines_added) as total_lines,
      COUNT(*) as usage_count,
      AVG(acceptance_rate) as avg_acceptance_rate
    FROM github_copilot_usage
    WHERE period_start >= ${startDate}
      AND period_end <= ${endDate}
    GROUP BY model
    ORDER BY total_lines DESC
  `;

  // Calculate percentages
  const totalLines = result.reduce((sum, row) => sum + row.total_lines, 0);

  return result.map(row => ({
    ...row,
    percentage: Math.round((row.total_lines / totalLines) * 100)
  }));
}
```

### Example: Department Adoption
```typescript
async function getDepartmentAdoption() {
  const result = await db.$queryRaw`
    SELECT
      d.name as department,
      d.total_employees,
      COUNT(DISTINCT u.email) as claude_users,
      COUNT(DISTINCT CASE WHEN u.seat_tier = 'Premium' THEN u.email END) as premium_users,
      COUNT(DISTINCT CASE WHEN u.seat_tier = 'Standard' THEN u.email END) as standard_users
    FROM departments d
    LEFT JOIN claude_users u ON u.department = d.name AND u.status = 'Active'
    GROUP BY d.name, d.total_employees
    ORDER BY d.total_employees DESC
  `;

  return result.map(row => ({
    ...row,
    coverage: Math.round((row.claude_users / row.total_employees) * 100)
  }));
}
```

---

## Data Refresh Strategy

### Manual Upload (Phase 1)
1. User uploads file via UI
2. File type detection (CSV, PDF, NDJSON)
3. Parse file server-side
4. Validate data
5. Insert into database (upsert for updates)
6. Invalidate metrics cache
7. Recalculate affected metrics
8. Return success/error to user

### Automated Refresh (Phase 3)
1. Vercel Cron triggers daily at 6am
2. Fetch data from APIs:
   - Anthropic API (audit logs, licenses)
   - Rippling API (org chart)
   - GitHub API (Copilot usage)
   - Microsoft Graph API (M365 Copilot usage)
3. Parse and validate
4. Upsert into database
5. Recalculate metrics
6. Update metrics_cache
7. Send notification if errors

---

## Testing Data

Use actual files from `/data/` for testing:
- Known row counts
- Known edge cases
- Real-world messiness (missing fields, malformed JSON, etc.)
- Validate calculations against current static dashboard results

**Example Test**:
```typescript
test('Parse Claude Code PDF for November', async () => {
  const pdfBuffer = fs.readFileSync('/data/Claude Code Usage Report - November 01-30, 2025.pdf');
  const result = await parseCodeUsagePDF(pdfBuffer);

  expect(result.length).toBe(11); // 11 active users
  expect(result[0].username).toBe('gtaborga');
  expect(result[0].linesOfCode).toBe(52347);
  expect(result[0].rank).toBe(1);
});
```
