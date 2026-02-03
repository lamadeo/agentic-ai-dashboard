# ADR-002: Organizational Chart Data Architecture

**Status**: Active
**Date**: December 21, 2024
**Author:** Luis Amadeo, Chief Agentic Officer, TechCo Inc
**Architect:** Luis Amadeo, Chief Agentic Officer, TechCo Inc
**Context**: Documenting how organizational hierarchy data is parsed, stored, and used throughout the AI Tools Dashboard

---

## Context

The AI Tools Dashboard requires accurate employee department and team attribution to:
- **Enrich AI tool usage metrics** with organizational context (e.g., which department uses Claude the most)
- **Calculate department-level adoption rates** and expansion opportunities
- **Generate department-specific insights** and recommendations
- **Identify power users** and low-engagement users by department
- **Aggregate metrics by department** for the Departments tab

Without a reliable source of truth for organizational structure, the dashboard would:
- Show incomplete or incorrect department breakdowns
- Unable to calculate department-specific ROI
- Miss expansion opportunities in specific departments
- Provide inaccurate headcount-based penetration rates

## Decision

**Use Rippling HRIS as single source of truth** for organizational structure, exported as hierarchical JSON and parsed into an email-based lookup system.

### Architecture Components:

1. **Source Data**: `data/techco_org_chart.json`
   - Exported from Rippling HRIS (Human Resources Information System)
   - Hierarchical JSON representing CEO → Department Heads → Teams → Individual Contributors
   - Contains: name, title, directReports count, totalTeamSize, reports array

2. **Parser Module**: `scripts/parse-hierarchy.js`
   - Generates unique email addresses from names
   - Handles duplicate name conflicts with fallback strategies
   - Maps department heads to human-readable department names
   - Provides lookup functions for department/team attribution
   - Exports headcount data by department

3. **Data Processing Pipeline**: `scripts/parse-copilot-data.js`
   - Imports org chart mapping on startup
   - Enriches all user metrics with department/team information
   - Groups metrics by department for aggregation
   - Uses department headcounts for expansion opportunity calculations

4. **Dashboard UI**: `app/page.jsx`
   - Imports generated data from `app/ai-tools-data.json`
   - Filters and displays metrics by department across all 9 tabs
   - Renders department-specific charts and tables

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ SOURCE: Rippling HRIS (Manual Export)                          │
└───────────────┬─────────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│ data/techco_org_chart.json                           │
│ {                                                               │
│   "organization": {                                             │
│     "ceo": {                                                    │
│       "name": "Jess Keeney",                                    │
│       "reports": [                                              │
│         {                                                       │
│           "name": "Luis Amadeo",                                │
│           "title": "Chief Agentic Officer",                     │
│           "directReports": 2,                                   │
│           "totalTeamSize": 5,                                   │
│           "reports": [...]                                      │
│         }                                                       │
│       ]                                                         │
│     }                                                           │
│   }                                                             │
│ }                                                               │
└───────────────┬─────────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│ scripts/parse-hierarchy.js                                      │
│                                                                 │
│ 1. buildOrgMappingFromHierarchy(hierarchyPath)                 │
│    - Recursively traverses org chart JSON                      │
│    - Generates unique email for each employee                  │
│    - Determines department from CEO direct report              │
│    - Determines team from mid-level manager                    │
│                                                                 │
│ 2. Returns: Map<email, employeeInfo>                           │
│    {                                                            │
│      "lamadeo@techco.com": {                              │
│        name: "Luis Amadeo",                                    │
│        title: "Chief Agentic Officer",                         │
│        department: "Agentic AI",                               │
│        team: null,                                             │
│        departmentHead: "Luis Amadeo",                          │
│        teamLeader: null,                                       │
│        isDeptHead: true,                                       │
│        isTeamLeader: false,                                    │
│        primaryEmail: "lamadeo@techco.com"                 │
│      }                                                          │
│    }                                                            │
└───────────────┬─────────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│ scripts/parse-copilot-data.js                                   │
│                                                                 │
│ Line 482: orgEmailMap = buildOrgMappingFromHierarchy()         │
│                                                                 │
│ Line 726: Loop through all AI tool users                       │
│   const deptInfo = getDepartmentInfo(email, orgEmailMap)       │
│   userMetric.department = deptInfo.department                  │
│   userMetric.team = deptInfo.team                              │
│                                                                 │
│ Line 1985-2038: Group by department (deptUserActivities)       │
│   {                                                             │
│     "Engineering": [                                            │
│       { email, name, conversations, claudeCodeLines, ... },    │
│       ...                                                       │
│     ],                                                          │
│     "Agentic AI": [...],                                       │
│     ...                                                         │
│   }                                                             │
│                                                                 │
│ Line 2040-2042: Get department headcounts                      │
│   const deptHeadcounts = getDepartmentHeadcounts(path)          │
│   // Used for expansion opportunity calculations               │
│                                                                 │
│ Line 2534-2557: Generate expansion opportunities               │
│   expansion: {                                                  │
│     opportunities: [                                            │
│       {                                                         │
│         department: "Engineering",                             │
│         totalEmployees: 77,  // From getDepartmentHeadcounts() │
│         currentUsers: 16,    // From deptUserActivities        │
│         targetPremium: 77,                                     │
│         roi: 35.1,                                             │
│         ...                                                     │
│       }                                                         │
│     ]                                                           │
│   }                                                             │
└───────────────┬─────────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│ app/ai-tools-data.json                                          │
│ {                                                               │
│   "claudeEnterprise": {                                         │
│     "departmentBreakdown": [                                    │
│       {                                                         │
│         "department": "Engineering",                            │
│         "users": 16,                                            │
│         "conversations": 1234,                                  │
│         "messages": 5678,                                       │
│         "topUser": { ... }                                      │
│       }                                                         │
│     ]                                                           │
│   },                                                            │
│   "expansion": {                                                │
│     "opportunities": [...]                                      │
│   }                                                             │
│ }                                                               │
└───────────────┬─────────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│ app/page.jsx (Dashboard UI)                                     │
│                                                                 │
│ Imports: const data = require('./ai-tools-data.json')          │
│                                                                 │
│ Usage Examples:                                                 │
│                                                                 │
│ 1. Departments Tab (Line 1488-1577):                           │
│    - Filters top 5 departments by user count                   │
│    - Renders line charts of department adoption over time      │
│    - Shows department-specific power users                     │
│                                                                 │
│ 2. Expansion ROI Tab:                                           │
│    - Maps over data.expansion.opportunities                    │
│    - Displays department, totalEmployees, currentUsers, ROI    │
│    - Sorts by ROI to show best opportunities first             │
│                                                                 │
│ 3. Claude Code Tab (Line 804-893):                             │
│    - Aggregates lines of code by department                    │
│    - Filters out 'Unknown' department                          │
│    - Renders stacked area chart by department                  │
│                                                                 │
│ 4. M365 Deep Dive Tab (Line 1304-1372):                        │
│    - Shows app usage by department                             │
│    - Identifies departments with low engagement               │
│    - Renders department performance metrics                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Files and Functions

### 1. `data/techco_org_chart.json`

**Purpose**: Source of truth for organizational structure
**Format**: Hierarchical JSON representing reporting relationships
**Update Frequency**: Manual export from Rippling (as needed)
**Key Fields**:
- `name`: Employee full name
- `title`: Job title
- `directReports`: Number of direct reports (integer)
- `totalTeamSize`: Total team size including indirect reports
- `reports`: Array of direct report objects (recursive structure)

**Structure**:
```json
{
  "organization": {
    "ceo": {
      "name": "Seth Turner",
      "title": "CEO",
      "directReports": 19,
      "totalTeamSize": 250,
      "reports": [
        {
          "name": "Luis Amadeo",
          "title": "Chief Agentic Officer",
          "directReports": 2,
          "totalTeamSize": 5,
          "reports": [
            { "name": "Jeff Rivero", "reports": [...] },
            { "name": "Robert Foster", "reports": [...] }
          ]
        }
      ]
    }
  }
}
```

---

### 2. `scripts/parse-hierarchy.js`

**Purpose**: Core module for parsing org chart and providing lookup functions

#### Key Functions:

##### `generateEmail(name)` (Lines 14-34)
Generates email address from full name using TechCo Inc format: `{firstInitial}{lastname}@techco.com`

**Example**:
- "Luis Amadeo" → `lamadeo@techco.com`
- "Jeff Rivero" → `jrivero@techco.com`

**Handles**:
- Multi-word names (uses last word as lastname)
- Special characters removal
- Middle names (3-word names)

##### `EmailGenerator` class (Lines 39-76)
Handles duplicate email conflicts with 3 fallback strategies:

1. **First try**: `{firstInitial}{lastname}@techco.com`
   - Example: `jsmith@techco.com`

2. **Second try**: `{firstname}.{lastname}@techco.com`
   - Example: `john.smith@techco.com`

3. **Third try (if middle name exists)**: `{firstInitial}{middleInitial}{lastname}@techco.com`
   - Example: `jmsmith@techco.com`

4. **Final fallback**: Add numeric suffix
   - Example: `jsmith2@techco.com`

##### `DEPARTMENT_NAME_MAPPING` (Lines 81-101)
Maps CEO direct report names to human-readable department names:

```javascript
const DEPARTMENT_NAME_MAPPING = {
  'Luis Amadeo': 'Agentic AI',
  'Kelly Wells': 'Customer Success',
  'Erika McKibben': 'Professional Services',
  'Ron Slosberg': 'Engineering',
  'Kathryn Hilton': 'Marketing',
  'Laura Jackson': 'Product',
  // ... 14 total departments
};
```

**Critical**: Every CEO direct report MUST be in this mapping, otherwise they'll use their name as the department name.

##### `traverseHierarchy(node, departmentHead, teamLeader, emailGen, results)` (Lines 107-152)
Recursively walks org chart tree to extract all employees.

**Key Logic**:
- **Department attribution**: Inherited from CEO's direct report (top-level leader)
- **Team attribution**: Inherited from mid-level manager (if exists)
- **Role identification**:
  - `isDepartmentHead`: Direct report to CEO
  - `isTeamLeader`: Has direct reports AND not a department head

**Example**:
```
Seth Turner (CEO)
└── Luis Amadeo (Department Head: "Agentic AI")
    └── Jeff Rivero (Team Leader: "Jeff Rivero")
        └── Gunther Taborga (Individual Contributor)
```

Results:
- Luis: `department: "Agentic AI"`, `departmentHead: "Luis Amadeo"`, `team: null`
- Jeff: `department: "Agentic AI"`, `departmentHead: "Luis Amadeo"`, `team: "Jeff Rivero"`
- Gunther: `department: "Agentic AI"`, `departmentHead: "Luis Amadeo"`, `team: "Jeff Rivero"`

##### `buildOrgMappingFromHierarchy(hierarchyPath)` (Lines 157-240)
Main entry point that builds complete email → employee mapping.

**Returns**: `Map<email, employeeInfo>`
```javascript
Map {
  "lamadeo@techco.com" => {
    name: "Luis Amadeo",
    title: "Chief Agentic Officer",
    department: "Agentic AI",
    team: null,
    departmentHead: "Luis Amadeo",
    teamLeader: null,
    isDeptHead: true,
    isTeamLeader: false,
    primaryEmail: "lamadeo@techco.com"
  }
}
```

##### `EMAIL_ALIAS_MAP` (Lines 246-278)
Maps alternative email formats to canonical org chart emails.

**Use Cases**:
1. **CEO alias**: `seth@techco.com` → `sturner@techco.com`
2. **Name variations**: `braftery@techco.com` → `braferty@techco.com` (typo fix)
3. **Nickname handling**: `ypiloto@techco.com` → `pmorejon@techco.com` (Pilo Piloto)

**Critical**: When AI tool exports use different email formats than org chart, add aliases here.

##### `getDepartmentInfo(email, emailMap)` (Lines 300-325)
Lookup function used throughout data processing pipeline.

**Usage**:
```javascript
const deptInfo = getDepartmentInfo('lamadeo@techco.com', orgEmailMap);
// Returns: { department: "Agentic AI", team: null, title: "...", ... }
```

**Handles**:
- Email alias resolution (checks EMAIL_ALIAS_MAP first)
- Unknown emails (returns `department: "Unknown"`)
- Current vs former employees

##### `getDepartmentHeadcounts(hierarchyPath)` (Lines 334-365)
Returns employee count by department (excludes CEO).

**Returns**: `Map<department, count>`
```javascript
Map {
  "Agentic AI" => 6,
  "Engineering" => 77,
  "Customer Success" => 42,
  "Professional Services" => 39,
  // ... all departments
}
```

**Used For**:
- Expansion opportunity calculations (total employees vs licensed users)
- Department penetration rates
- Headcount-based metrics

---

### 3. `scripts/parse-copilot-data.js`

**Purpose**: Main data aggregation pipeline that enriches AI tool metrics with org chart data

#### Key Usage Points:

##### **Line 8**: Import Functions
```javascript
const {
  buildOrgMappingFromHierarchy,
  getDepartmentInfo,
  isCurrentEmployee,
  getDepartmentHeadcounts
} = require('./parse-hierarchy');
```

##### **Lines 479-487**: Initialize Org Chart Mapping
```javascript
const orgHierarchyPath = path.join(__dirname, '../data/techco_org_chart.json');
let orgEmailMap;
try {
  orgEmailMap = buildOrgMappingFromHierarchy(orgHierarchyPath);
} catch (error) {
  console.error('❌ Error parsing org hierarchy:', error.message);
  console.log('⚠️  Falling back to Unknown department for all users\n');
  orgEmailMap = new Map();
}
```

**Critical**: If org chart parsing fails, ALL users will have `department: "Unknown"`

##### **Line 726**: Department Lookup (Example)
```javascript
const deptInfo = getDepartmentInfo(email, orgEmailMap);
claudeCodeUsers.set(email, {
  email: email,
  name: deptInfo.name,
  department: deptInfo.department,  // ← Enriched from org chart
  linesGenerated: 0,
  sessions: 0
});
```

**Pattern**: This pattern is repeated for:
- Claude Enterprise users (line 1700+)
- Claude Code users (line 726)
- M365 Copilot users (processed in separate module)
- GitHub Copilot users (username-based, no email)

##### **Lines 1834-1877**: Department Aggregation Example
```javascript
// Department Breakdown: Aggregate Claude Enterprise usage by department
const claudeEnterpriseDeptMap = new Map();
claudeEnterpriseUsersArray.forEach(user => {
  if (!user.department) return;  // Skip Unknown

  if (!claudeEnterpriseDeptMap.has(user.department)) {
    claudeEnterpriseDeptMap.set(user.department, {
      department: user.department,
      users: 0,
      conversations: 0,
      messages: 0,
      artifacts: 0,
      filesUploaded: 0,
      topUser: null
    });
  }

  const dept = claudeEnterpriseDeptMap.get(user.department);
  dept.users++;
  dept.conversations += user.conversations;
  dept.messages += user.messages;
  // ...
});
```

**Result**: Department-level aggregate metrics for dashboard charts

##### **Lines 1985-2042**: Expansion ROI Calculation
```javascript
// Step 2: Group users by department to create deptUserActivities
const deptUserActivities = {};

claudeEnterpriseUserMetrics.forEach((userMetric) => {
  const dept = userMetric.department;
  if (!dept || dept === 'Unknown') return;

  if (!deptUserActivities[dept]) {
    deptUserActivities[dept] = [];
  }

  deptUserActivities[dept].push({
    email: userMetric.email,
    name: userMetric.name,
    conversations: userMetric.conversations,
    // ... all user metrics
  });
});

// Step 3: Get department headcounts from org hierarchy
const deptHeadcounts = getDepartmentHeadcounts(hierarchyPath);
// Map { "Engineering" => 77, "Agentic AI" => 6, ... }

// Used to calculate expansion opportunities:
// Example: Engineering has 77 employees but only 16 licensed → 61 expansion opportunity
```

##### **Lines 2534-2557**: Expansion Opportunities Output
```javascript
expansion: {
  orgMetrics: {
    totalEmployees: expansionTotalEmployees,  // Sum of all deptHeadcounts
    licensedSeats: totalCurrentUsers,
    penetrationRate: Math.round((totalCurrentUsers / expansionTotalEmployees) * 100),
    unlicensedEmployees: expansionTotalEmployees - totalCurrentUsers
  },
  opportunities: expansionOpportunities,  // Array of department opportunities
  summary: { ... }
}
```

**Key Insight**: Department headcounts from org chart are THE denominator for all penetration and expansion calculations.

---

### 4. `app/page.jsx`

**Purpose**: Dashboard UI that consumes generated data with department breakdowns

#### Key Usage Patterns:

##### **Pattern 1**: Department Filtering (Lines 1494-1509)
```javascript
// Get top 5 departments for Claude Enterprise by total users across all months
const deptUserTotals = new Map();
data.claudeEnterprise.monthlyTrend.forEach(m => {
  m.byDept.forEach(d => {
    if (d.department !== 'Unknown') {  // ← Filter out Unknown
      deptUserTotals.set(d.department, (deptUserTotals.get(d.department) || 0) + d.users);
    }
  });
});

const topDepts = Array.from(deptUserTotals.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([dept]) => dept);
```

**Why**: Prevents cluttering charts with "Unknown" department noise

##### **Pattern 2**: Department-Level Charting (Lines 1516-1550)
```javascript
// Create monthly data points with user counts for each top department
const chartData = data.claudeEnterprise.monthlyTrend.map(m => {
  const dataPoint = { month: m.monthLabel };
  topDepts.forEach(dept => {
    const deptData = m.byDept.find(d => d.department === dept);
    dataPoint[dept] = deptData ? deptData.users : 0;
  });
  return dataPoint;
});

// Render line chart with department as separate lines
<LineChart data={chartData}>
  {topDepts.map(dept => (
    <Line key={dept} dataKey={dept} stroke={colors[dept]} />
  ))}
</LineChart>
```

**Result**: Multi-line chart showing department trends over time

##### **Pattern 3**: Expansion Opportunities Table
```javascript
{data.expansion.opportunities.map(opp => (
  <tr key={opp.department}>
    <td>{opp.department}</td>
    <td>{opp.totalEmployees}</td>       {/* From getDepartmentHeadcounts() */}
    <td>{opp.currentUsers}</td>         {/* From deptUserActivities */}
    <td>{opp.targetPremium}</td>        {/* Calculated recommendation */}
    <td>${opp.totalAdditionalCost}</td>
    <td>{opp.roi}x</td>
  </tr>
))}
```

**Key**: Department name is primary key for all expansions rows

---

## Department Attribution Logic

### How Departments Are Determined:

1. **For CEO Direct Reports** (Department Heads):
   - Their name is looked up in `DEPARTMENT_NAME_MAPPING`
   - Example: "Luis Amadeo" → "Agentic AI"
   - If not in mapping, their name becomes the department name

2. **For All Other Employees**:
   - They inherit department from their **top-level ancestor** (CEO's direct report)
   - Walk up the reporting chain until you reach someone who reports to CEO
   - Example: Gunther Taborga → Jeff Rivero → Luis Amadeo (department head) → "Agentic AI"

3. **Team Attribution** (Optional):
   - Mid-level managers (not department heads, but have direct reports) create team boundaries
   - Employees inherit team name from their closest manager ancestor
   - Example: Gunther Taborga → team: "Jeff Rivero"

### Example Hierarchy:
```
Seth Turner (CEO)
├── Luis Amadeo (Chief Agentic Officer)           ← Dept: "Agentic AI"
│   ├── Jeff Rivero (Principal AI Architect)      ← Dept: "Agentic AI", Team: "Jeff Rivero"
│   │   ├── Gunther Taborga                       ← Dept: "Agentic AI", Team: "Jeff Rivero"
│   │   └── Pilo Piloto Morejon                   ← Dept: "Agentic AI", Team: "Jeff Rivero"
│   └── Robert Foster (VP, Software Engineering)  ← Dept: "Agentic AI", Team: "Robert Foster"
│       └── Kirmanie Ravariere                    ← Dept: "Agentic AI", Team: "Robert Foster"
└── Ron Slosberg (VP, Engineering)                ← Dept: "Engineering"
    └── [77 employees]                            ← Dept: "Engineering", various teams
```

**Result**: All 6 people under Luis have `department: "Agentic AI"` regardless of nesting depth

---

## Email Resolution System

### Priority Order:

1. **Check EMAIL_ALIAS_MAP first**:
   ```javascript
   'ypiloto@techco.com': 'pmorejon@techco.com'
   ```
   If email is in alias map, use the mapped email

2. **Lookup in orgEmailMap**:
   ```javascript
   orgEmailMap.get('pmorejon@techco.com')
   ```
   If found, return department/team info

3. **Return Unknown**:
   ```javascript
   { department: 'Unknown', team: null, isCurrentEmployee: false }
   ```
   If email not found, user is either former employee or external

### When to Add Email Aliases:

**Scenario 1**: Different email formats across systems
- Org chart: `sturner@techco.com`
- Claude Enterprise CSV: `seth@techco.com`
- **Solution**: Add alias `'seth@techco.com': 'sturner@techco.com'`

**Scenario 2**: Nickname vs legal name
- Org chart uses legal name: "Yassel Piloto" → `ypiloto@techco.com`
- Person uses alias "Pilo Piloto Morejon" → `pmorejon@techco.com`
- **Solution**: Add alias `'ypiloto@techco.com': 'pmorejon@techco.com'`

**Scenario 3**: Typos in data exports
- Correct: `braferty@techco.com`
- Typo in CSV: `braftery@techco.com`
- **Solution**: Add alias `'braftery@techco.com': 'braferty@techco.com'`

---

## Consequences

### Positive:

1. **Single Source of Truth**: Rippling HRIS is authoritative source for org structure
2. **Automatic Department Assignment**: All employees automatically inherit correct department
3. **Email-Based Lookup**: Fast O(1) lookups using Map data structure
4. **Handles Duplicates**: EmailGenerator class gracefully handles name conflicts
5. **Team Visibility**: Mid-level team structure preserved for detailed analysis
6. **Scalable**: Can handle 250+ employees with fast processing
7. **Unknown Detection**: Easily identifies former employees or external users

### Negative:

1. **Manual Export Required**: Rippling org chart must be manually exported as JSON
2. **No Automation**: No API integration with Rippling for automatic updates
3. **Stale Data Risk**: Org chart can become outdated if not refreshed regularly
4. **Department Mapping Maintenance**: `DEPARTMENT_NAME_MAPPING` must be updated when CEO adds/removes direct reports
5. **Email Alias Maintenance**: `EMAIL_ALIAS_MAP` must be updated when email discrepancies discovered
6. **No Historical Tracking**: Cannot track department changes over time (employee moves to new dept)
7. **Unknown Department Noise**: Users with mismatched emails appear as "Unknown" in charts

### Mitigation Strategies:

**For Manual Export**:
- Document export process in SESSION_RESUME.md
- Create calendar reminder to refresh quarterly
- Log last update date in org chart JSON comment

**For Stale Data**:
- Add validation check: compare org chart totalEmployees vs Rippling employee count
- Alert if counts diverge by >5%

**For Department Mapping**:
- Add validation: warn if CEO direct report not in DEPARTMENT_NAME_MAPPING
- Log unmapped department heads to console during parsing

**For Email Aliases**:
- Add validation: log all "Unknown" department users with their emails
- Review Unknown users quarterly to identify new alias needs

---

## Maintenance Guidelines

### When Org Chart Changes:

1. **New CEO Direct Report (New Department)**:
   - Export fresh org chart JSON from Rippling
   - Add new entry to `DEPARTMENT_NAME_MAPPING` in `parse-hierarchy.js`
   - Run `node scripts/parse-copilot-data.js` to regenerate data
   - Verify new department appears in dashboard

2. **Department Head Name Change**:
   - Update entry in `DEPARTMENT_NAME_MAPPING`
   - Example: "Kelly Wells" → "Customer Success" (name stays, mapping stays)

3. **Employee Moves to New Department**:
   - Export fresh org chart JSON (their reporting structure changed in Rippling)
   - No code changes needed
   - Re-run parser to pick up new department attribution

4. **Employee Hired or Terminated**:
   - Export fresh org chart JSON
   - No code changes needed
   - Terminated employees will show as "Unknown" department (not in new export)

### When Email Discrepancies Occur:

**Symptom**: User shows "Unknown" department despite being current employee

**Diagnosis**:
1. Check console output from parser: "Could not generate email for: [name]"
2. Check if email exists in AI tool export but not org chart
3. Check for name variations (nickname, middle name, hyphenated names)

**Resolution**:
1. Identify correct org chart email (run parser and check console output)
2. Identify email used in AI tool exports (check CSV files)
3. Add mapping to `EMAIL_ALIAS_MAP` in `parse-hierarchy.js:246-278`
4. Re-run parser

**Example**:
```javascript
const EMAIL_ALIAS_MAP = {
  // AI tool export uses this ↓
  'nickname@techco.com': 'realname@techco.com',  // ← Org chart uses this
};
```

### When Unknown Users Appear:

**Check 1**: Are they former employees?
- Compare against Rippling active employee list
- If former, ignore (expected behavior)

**Check 2**: Are they external contractors?
- Check if they have company email but aren't in Rippling
- If external, ignore OR add manual entry to org chart JSON

**Check 3**: Email format mismatch?
- Follow "Email Discrepancies" process above

### Validation Checklist:

Run these checks after any org chart update:

```bash
# 1. Run parser and check for errors
node scripts/parse-copilot-data.js

# 2. Check total employee count matches Rippling
# (Look for console output: "✅ Extracted 250 employees from hierarchy")

# 3. Check for Unknown users in expansion opportunities
# (Should be minimal - only former employees or external users)
jq '.expansion.opportunities[] | select(.department == "Unknown")' app/ai-tools-data.json

# 4. Verify department headcounts match expectations
jq '.expansion.opportunities[] | {department, totalEmployees}' app/ai-tools-data.json

# 5. Check for unmapped department heads (console warnings)
# (Look for: "Department head 'John Doe' not in DEPARTMENT_NAME_MAPPING")
```

---

## Related Decisions

- **ADR-001**: Overall dashboard architecture (batch processing vs real-time)
- **Future ADR**: Rippling API integration for automated org chart sync
- **Future ADR**: Historical department tracking for employee transitions

---

## References

- **Rippling HRIS**: https://app.rippling.com (manual export process)
- **Email Generation Logic**: Based on TechCo Inc standard: `{firstInitial}{lastname}@techco.com`
- **Department Mapping**: Defined in `scripts/parse-hierarchy.js:81-101`
- **Expansion ROI Calculations**: Documented in `.claude/CALCULATIONS.md`

---

## UPDATE (2026-01-21): Snapshot System & Agentic FTE Enhancements

**Status**: Active
**Updated**: 2026-01-21
**Context**: Added org chart snapshot system for historical tracking and agentic FTE per-employee metrics

### New Features Added

#### 1. Org Chart Snapshot System

**Purpose**: Track organizational changes over time, enabling month-over-month comparison of structure, headcount, and AI-augmented capacity.

**Components**:

1. **Snapshot Directory**: `data/org-chart-snapshots/`
   - Stores monthly org chart snapshots
   - Format: `techco_org_chart_YYYY-MM-DD.json`
   - Comparison reports: `comparison_<old-date>_to_<new-date>.json`

2. **Management Script**: `scripts/manage-org-chart-snapshot.js`
   - Commands: `save`, `list`, `compare`, `latest`
   - Saves current org chart as dated snapshot
   - Compares two snapshots and generates change report
   - Lists all available snapshots with metadata

3. **Comparison Script**: `scripts/compare-org-charts.js`
   - Flattens hierarchical org chart into employee maps
   - Detects: added employees, removed employees, title changes, reporting changes
   - Calculates: net headcount change, growth rate, departmental shifts
   - Outputs: Console report + JSON comparison file

**Usage**:
```bash
# Save monthly snapshot
node scripts/manage-org-chart-snapshot.js save 2026-01-21

# Compare Dec 2025 → Jan 2026
node scripts/manage-org-chart-snapshot.js compare 2025-12-12 2026-01-21

# List all snapshots
node scripts/manage-org-chart-snapshot.js list
```

**Snapshot Comparison Output**:
```
📊 Total Employees: 253 → 258 (+5, 1.98%)
👥 Contingent Workers: 58 → 62 (+4)

✨ Summary:
   Added: 15
   Removed: 8
   Title Changes: 16
   Reporting Changes: 74
```

#### 2. Agentic FTE Per-Employee Tracking

**Purpose**: Track AI-augmented capacity at individual employee and team levels, enabling visualization of true organizational capacity.

**Terminology Change**: Renamed "Virtual FTE" → "Agentic FTE" across entire codebase to better reflect AI-augmented capacity.

**Enhanced Org Chart Schema**:

```json
{
  "organization": {
    "name": "TechCo Inc, LLC",
    "totalEmployees": 258,
    "totalAgenticFTE": 80.3,
    "agenticFTEBreakdown": {
      "claudeEnterprise": 0,
      "m365Copilot": 0,
      "claudeCode": 80.3
    },
    "ceo": {
      "id": "jess-keeney",
      "name": "Jess Keeney",
      "title": "Chief Executive Officer",
      
      // NEW: Individual agentic FTE contribution
      "agenticFTE": {
        "current": 0,
        "breakdown": {
          "claudeEnterprise": 0,
          "m365Copilot": 0,
          "claudeCode": 0
        }
      },
      
      // NEW: Team rollup (recursive sum)
      "teamAgenticFTE": {
        "current": 80.29,
        "breakdown": {
          "claudeEnterprise": 0,
          "m365Copilot": 0,
          "claudeCode": 80.29
        }
      },
      
      "reports": [...]
    }
  }
}
```

**Components**:

1. **Calculator Module**: `scripts/modules/agentic-fte-calculator.js` (renamed from virtual-fte-calculator.js)
   - Calculates per-user agentic FTE based on engagement metrics
   - Functions: `calculateClaudeEnterpriseAgenticFTE()`, `calculateM365CopilotAgenticFTE()`, `calculateClaudeCodeDepartmentAgenticFTE()`
   - Uses proportional distribution methodology

2. **Enrichment Script**: `scripts/enrich-org-chart-with-agentic-fte.js`
   - Reads org chart + AI tools data
   - Maps users to agentic FTE contributions
   - Adds `agenticFTE` field to each employee node
   - Calculates `teamAgenticFTE` via recursive aggregation
   - Writes enhanced org chart with AI capacity data

3. **Pipeline Integration**: Updated `scripts/modules/pipeline-orchestrator.js`
   - All references renamed to "agentic FTE"
   - Data flows through existing pipeline
   - Per-user calculations stored in ai-tools-data.json

**Enrichment Process**:
```bash
# Run after data refresh to add agentic FTE to org chart
node scripts/enrich-org-chart-with-agentic-fte.js
```

**Output**:
```
✅ Organization-Wide Agentic FTE Summary:
   Total Agentic FTE: 80.3 FTEs
   Breakdown:
     Claude Enterprise: 0.0 FTEs
     M365 Copilot: 0.0 FTEs
     Claude Code: 80.3 FTEs

   Total Organization Capacity: 258 employees + 80.3 agentic FTEs
   = 338.3 effective FTE capacity
```

**Key Insight**: TechCo Inc operates with **258 employees but delivers capacity equivalent to 338+ FTE** through AI tool adoption (+31% capacity).

#### 3. Slash Command: /generate-org-chart

**Purpose**: Interactive command to generate org chart JSON from various data sources (PDF, text, spreadsheet, etc.)

**Location**: `.claude/commands/generate-org-chart.md`

**Features**:
- Multi-format input support (PDF, text hierarchy, tables, narrative)
- Strict schema validation
- Handles large org charts (258+ employees) via Python script approach
- Auto-saves snapshot after generation
- Auto-compares with previous snapshot if available

**Workflow**:
```
/generate-org-chart
  ↓
1. Gather input data (PDF, file, text)
2. Parse hierarchy and extract employees
3. Build JSON (small: direct write, large: Python script)
4. Validate schema
5. Write to data/techco_org_chart.json
6. Save snapshot
7. Compare with previous snapshot (if exists)
8. Provide summary with key changes
```

### Updated Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ SOURCE: Rippling HRIS OR /generate-org-chart                   │
└───────────────┬─────────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│ data/techco_org_chart.json                           │
│ Enhanced with agenticFTE fields                                │
└───────────────┬─────────────────────────────────────────────────┘
                │
                ├──────────────────────────────────────┐
                │                                      │
                ▼                                      ▼
┌──────────────────────────────────┐  ┌──────────────────────────────────┐
│ scripts/parse-hierarchy.js       │  │ scripts/enrich-org-chart-       │
│ (Email/dept mapping)             │  │ with-agentic-fte.js              │
└──────────────┬───────────────────┘  └──────────────┬───────────────────┘
               │                                      │
               └──────────────┬───────────────────────┘
                              │
                              ▼
                 ┌──────────────────────────────────────┐
                 │ scripts/modules/                     │
                 │ pipeline-orchestrator.js             │
                 │ (Enriches with agentic FTE per user) │
                 └──────────────┬───────────────────────┘
                                │
                                ▼
                 ┌──────────────────────────────────────┐
                 │ app/ai-tools-data.json               │
                 │ (All data + agentic FTE per user)    │
                 └──────────────┬───────────────────────┘
                                │
                                ▼
                 ┌──────────────────────────────────────┐
                 │ Dashboard UI                         │
                 │ (Shows agentic FTE everywhere)       │
                 └──────────────────────────────────────┘

Parallel flow:
┌──────────────────────────────────────┐
│ scripts/manage-org-chart-snapshot.js │
│ (Save monthly snapshots)             │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ data/org-chart-snapshots/       │
│ - techco_org_chart_2026-01.json │
│ - comparison_2025-12_to_2026-01.json │
└──────────────────────────────────────┘
```

### Updated Maintenance Guidelines

#### When Org Chart Changes:

**In addition to existing process, now also:**

5. **Save Monthly Snapshot**:
   ```bash
   node scripts/manage-org-chart-snapshot.js save $(date +%Y-%m-%d)
   ```

6. **Compare with Previous Month**:
   ```bash
   # List snapshots to find previous date
   node scripts/manage-org-chart-snapshot.js list
   
   # Run comparison
   node scripts/manage-org-chart-snapshot.js compare <prev-date> <curr-date>
   ```

7. **Document Changes in CHANGELOG**:
   - Update `data/org-chart-snapshots/CHANGELOG.md`
   - Highlight significant changes (new hires, departures, promotions, restructuring)

8. **Enrich with Agentic FTE**:
   ```bash
   node scripts/enrich-org-chart-with-agentic-fte.js
   ```

#### Monthly Snapshot Process:

Recommended workflow for monthly org chart refresh:

```bash
# 1. Generate/update org chart (use slash command or manual update)
/generate-org-chart

# 2. Enrich with agentic FTE data
node scripts/enrich-org-chart-with-agentic-fte.js

# 3. Save snapshot
node scripts/manage-org-chart-snapshot.js save $(date +%Y-%m-%d)

# 4. Compare with previous month
node scripts/manage-org-chart-snapshot.js list
node scripts/manage-org-chart-snapshot.js compare <prev-date> <curr-date>

# 5. Document changes in CHANGELOG
# Edit: data/org-chart-snapshots/CHANGELOG.md
```

### Validation Checklist (Updated):

```bash
# Existing checks...

# 6. Verify agentic FTE enrichment
jq '.organization | {totalEmployees, totalAgenticFTE, agenticFTEBreakdown}' \
  data/techco_org_chart.json

# 7. Check CEO team rollup matches org total
jq '.organization.ceo.teamAgenticFTE.current' data/techco_org_chart.json
# Should match .organization.totalAgenticFTE

# 8. Verify snapshot saved successfully
ls -lh data/org-chart-snapshots/techco_org_chart_*.json | tail -3

# 9. Check latest comparison report exists
ls -lh data/org-chart-snapshots/comparison_*.json | tail -1
```

### Email Mapping and Alias Resolution (Added: 2026-01-22)

**Problem**: Org chart generates emails from names (`luis@techco.com`) but Claude Enterprise uses actual emails from identity provider (`lamadeo@techco.com`). Without proper mapping, 82% of users were unmatched to departments.

**Solution**: Email alias resolution system with automated matching and interactive workflow.

#### EMAIL_ALIAS_MAP

Static mapping in `scripts/parse-hierarchy.js` (lines 27-45):

```javascript
const EMAIL_ALIAS_MAP = {
  // Auto-generated mappings from /setup-org-data workflow
  'braftery@techco.com': 'braferty@techco.com',  // Brendan (name_similarity)
  'm.d.campbell@techco.com': 'mcampbell@techco.com',  // Melissa Campbell (email_variant)
  'madison@techco.com': 'mvoshell@techco.com',  // Madison Voshell (email_variant)
  'missy@techco.com': 'mmyers@techco.com',  // Missy (name_similarity)
  'sfthomas@techco.com': 'sthomas@techco.com',  // Sarah (manual_selection)
  'ypiloto@techco.com': 'pmorejon@techco.com',  // Yassel Piloto (manual_entry)
  // ... 21 total aliases as of 2026-01-22
};
```

#### resolveEmailAlias() function

Resolves actual emails to org chart emails:

```javascript
function resolveEmailAlias(email) {
  const normalized = email.toLowerCase().trim();
  return EMAIL_ALIAS_MAP[normalized] || normalized;
}
```

Usage: All lookups call `resolveEmailAlias()` before checking org map:

```javascript
const deptInfo = getDepartmentInfo(userEmail, orgEmailMap);
// getDepartmentInfo internally calls resolveEmailAlias()
```

#### Interactive Setup Workflow

**Slash Command**: `/setup-org-data` (defined in `.claude/commands/setup-org-data.md`)

**Script**: `node scripts/setup-org-email-mapping.js`

**7-Step Process**:

1. **Load Org Chart** - Read `techco_org_chart.json`
2. **Load Claude Enterprise Users** - Read `claude_enterprise_seats.json`
3. **Auto-Match Emails** (98% success rate):
   - Exact email match
   - Email variant patterns (3 formats)
   - Name similarity (Levenshtein distance, 80% threshold)
4. **Interactive Resolution** - Manually match remaining 2-3% of users
5. **Update EMAIL_ALIAS_MAP** - Write aliases to `parse-hierarchy.js`
6. **Validate 100% Coverage** - Ensure all licensed users matched
7. **Summary** - Display results and next steps

**Auto-Matching Results (Jan 22, 2026)**:
```
Total users: 115 (41 Premium, 74 Standard)
✅ Auto-matched: 113 users (98%)
⚠️ Manual resolution: 2 users
✅ Final coverage: 100% (115/115 users)
```

#### Modular Architecture

**Core Module** (`scripts/modules/email-mapper.js`):
- Pure functions, reusable across scripts
- `matchEmailsByName()` - Auto-matching algorithm
- `calculateNameSimilarity()` - Levenshtein distance (80% threshold)
- `generateEmailVariants()` - 3 email pattern formats
- `validateEmailCoverage()` - Coverage validation
- `generateAliasMapCode()` - Code generation for EMAIL_ALIAS_MAP
- `updateAliasMapInFile()` - File updating with regex replacement

**Interactive Script** (`scripts/setup-org-email-mapping.js`):
- CLI orchestrator using email-mapper module
- 7-step workflow with validation checkpoints
- Interactive resolution using readline interface
- Follows DRY (Don't Repeat Yourself) principles
- Single responsibility per function

**Validation Scripts**:
- `scripts/validate-coverage.js` - Quick coverage check (shows matched/unmatched counts)
- `scripts/check-unmatched-details.js` - Diagnostic details (getDepartmentInfo results)

#### Pipeline Integration

**Cache Clearing** (`scripts/modules/pipeline-orchestrator.js` lines 14-19):

```javascript
// Clear parse-hierarchy cache to ensure updated EMAIL_ALIAS_MAP is loaded
const parseHierarchyPath = path.resolve(__dirname, '../parse-hierarchy.js');
if (require.cache[parseHierarchyPath]) {
  delete require.cache[parseHierarchyPath];
}
```

**Critical**: Node.js caches required modules. Without cache clearing, updated EMAIL_ALIAS_MAP isn't loaded on data refresh.

**Licensed User Inclusion** (lines 1900-1925):

```javascript
// Add all licensed users to claudeEnterpriseUserMetrics
licenseTiers.forEach((tier, email) => {
  if (tier === 'Unassigned') return; // Skip unassigned

  if (!claudeEnterpriseUserMetrics.has(email)) {
    // Add licensed user with no activity
    const deptInfo = getDepartmentInfo(email, orgEmailMap); // Uses EMAIL_ALIAS_MAP
    claudeEnterpriseUserMetrics.set(email, { ... });
  }
});
```

**Result**: All 115 licensed users included in expansion analysis (was 94 before fix).

#### Validation and Verification

**Coverage Check**:
```bash
node scripts/validate-coverage.js

📊 Coverage Validation Results:
   Total users:    115
   ✅ Matched:     115
   ❌ Unmatched:   0
   📈 Coverage:    100%
```

**Diagnostic Details**:
```bash
node scripts/check-unmatched-details.js

🔍 Checking each user through getDepartmentInfo...
✅ Users WITH department: 115
❌ Users WITHOUT department: 0
```

**Expansion Data Verification**:
```bash
jq '[.expansion.opportunities[].currentUsers] | add' app/ai-tools-data.json
# Should show: 115 (not 94)
```

#### When to Run Email Mapping

**Initial Setup** (required once):
- After generating org chart for the first time
- Before first data refresh

**Periodic Updates** (as needed):
- New employees join with Claude Enterprise licenses
- Employees change names (marriage, legal name changes)
- "Unknown" departments appear in expansion data
- After org chart structure changes

**Symptoms of Mapping Issues**:
- Expansion ROI showing fewer users than expected
- Users listed as "Unknown" department
- Department breakdowns missing licensed users
- `scripts/validate-coverage.js` shows < 100% coverage

#### Benefits

**Before Email Mapping (Jan 22, 2026 AM)**:
- 94/115 users matched (82% unmatched)
- Expansion data: 94 users (31 Premium, 63 Standard)
- EMAIL_ALIAS_MAP: 14 aliases
- Manual alias creation, no validation

**After Email Mapping (Jan 22, 2026 PM)**:
- 115/115 users matched (100% coverage)
- Expansion data: 115 users (41 Premium, 74 Standard)
- EMAIL_ALIAS_MAP: 21 aliases
- Automated workflow with validation

**Architectural Improvements**:
- Modular, reusable code (DRY)
- Follows pipeline patterns (ingestors/processors/aggregators)
- Single responsibility per module
- Testable pure functions
- Interactive CLI with validation checkpoints

### Future Enhancements

See **docs/plans/2026-01-21-agentic-org-chart-roadmap.md** for comprehensive Phase 2-5 roadmap:

- **Phase 2**: Interactive agentic org chart visualization (Q1 2026)
- **Phase 3**: Month-over-month agentic FTE tracking (Q1 2026)
- **Phase 4**: Dashboard integration with agentic FTE metrics (Q2 2026)
- **Phase 5**: Analytics, benchmarking, ROI optimization (Q2 2026)

**Vision**: "Agentic Organization Chart" showing both human employees and their AI-augmented capacity, providing unprecedented visibility into true organizational capability.

### Related Documentation

- **Roadmap**: `docs/plans/2026-01-21-agentic-org-chart-roadmap.md`
- **Snapshot System**: `data/org-chart-snapshots/README.md`
- **Slash Command**: `.claude/commands/generate-org-chart.md`
- **Original Design**: `docs/plans/2026-01-18-agentic-fte-metric-design.md`

---

**Last Updated**: 2026-01-22 (Added Email Mapping section)
**Next Review**: Q2 2026 (Post-Phase 2 visualization)
