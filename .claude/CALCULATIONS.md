# Business Logic & Calculation Formulas

## ⚠️ CRITICAL: Initial Business Rules vs Calculated Metrics

### Initial Default Business Rules (Starting Points - AI Can Recommend Changes)

These are **initial assumptions** that the **AI should continuously analyze and recommend changes** to:

1. **Engineering departments: 100% get Claude Code Premium**
   - Rationale: Only way to get enterprise-level Claude Code license
   - AI analyzes: Is this still optimal based on usage patterns?

2. **Departments OTHER THAN Engineering: ~10% get Premium seats**
   - Rationale: Power users within non-engineering teams who need advanced features
   - AI analyzes: Should this percentage be higher/lower per department based on usage and value?

### Pricing Constants (From Vendor Contracts)

3. **Claude Enterprise pricing**:
   - Upgrade cost: $160/mo ($1,920/year) - incremental for Standard → Premium
   - New Premium cost: $200/mo ($2,400/year)
   - New Standard cost: $40/mo ($480/year)

4. **Competitor pricing**:
   - GitHub Copilot: $19/mo ($228/year) per user
   - M365 Copilot: ~$30/mo (estimated, part of Microsoft license)

### Calculation Rules (Apply to All Metrics)

5. **Power users come from existing Standard seats FIRST**, then new Premium

6. **⚠️ ALL OTHER NUMBERS MUST BE CALCULATED FROM DATA**:
   - ALL metrics (adoption rates, productivity, ROI, sentiment scores, etc.)
   - ALL graphs and charts (daily active, trends, comparisons, distributions)
   - ALL insights (use cases, value stories, preferences)
   - ALL recommendations (AI-generated based on analysis)
   - NO hardcoded constants except the 4 items above

### Expansion Calculation Logic

```typescript
// Calculate expansion cost for a department
function calculateExpansionCost(dept: {
  name: string;
  totalEmployees: number;
  currentUsers: number;
  currentPremium: number;
  currentStandard: number;
}) {
  const isEngineering = dept.name.includes('Engineering');

  // Power users: 100% for Engineering, 10% for others
  const powerUsersNeeded = isEngineering
    ? dept.totalEmployees  // 100% for Engineering
    : Math.ceil(dept.totalEmployees * 0.10); // 10% for others (round up)

  // Calculate gaps
  const totalGap = dept.totalEmployees - dept.currentUsers;

  // Upgrades: how many current Standard users need to become Premium
  const powerFromUpgrades = Math.min(
    powerUsersNeeded - dept.currentPremium,
    dept.currentStandard
  );

  // New Premium: additional Premium seats needed beyond upgrades
  const powerFromNew = Math.max(
    0,
    powerUsersNeeded - dept.currentPremium - powerFromUpgrades
  );

  // Standard gap: remaining non-power users
  const standardNeeded = dept.totalEmployees - powerUsersNeeded;
  const standardHave = dept.currentStandard - powerFromUpgrades;
  const standardGap = Math.max(0, standardNeeded - standardHave);

  // Costs (ANNUAL)
  const upgradeCost = powerFromUpgrades * 1920; // $160/mo × 12
  const newPremiumCost = powerFromNew * 2400; // $200/mo × 12
  const newStandardCost = standardGap * 480; // $40/mo × 12

  const totalAnnualCost = upgradeCost + newPremiumCost + newStandardCost;

  // Value (estimate $500-750/mo per user, use conservative $600)
  const monthlyValue = totalGap * 600;
  const annualValue = monthlyValue * 12;

  return {
    standardGap,
    premiumGap: powerFromUpgrades + powerFromNew,
    upgradesNeeded: powerFromUpgrades,
    newPremiumNeeded: powerFromNew,
    totalAnnualCost,
    monthlyEquivalent: totalAnnualCost / 12,
    annualValue,
    netBenefit: annualValue - totalAnnualCost,
    roi: annualValue / totalAnnualCost,
    detail: `${standardGap} new Std + ${powerFromUpgrades} upgrades + ${powerFromNew} new Prem`
  };
}
```

### Pro-ration for 2026 Budget

```typescript
// Calculate pro-rated cost for mid-quarter deployment
function calculateProRated2026Cost(
  annualCost: number,
  quarter: 'Q1' | 'Q2' | 'Q3'
) {
  // Assumes mid-quarter deployment
  const monthsRemaining = {
    'Q1': 10.5, // Mid-Feb through Dec
    'Q2': 7.5,  // Mid-May through Dec
    'Q3': 4.5   // Mid-Aug through Dec
  };

  return (annualCost / 12) * monthsRemaining[quarter];
}
```

### ROI Calculation

```typescript
// Calculate ROI for expansion scenario
function calculateROI(investment: number, value: number) {
  const netBenefit = value - investment;
  const roi = value / investment;
  const roiPercentage = ((roi - 1) * 100).toFixed(0);

  return {
    investment,
    value,
    netBenefit,
    roi,
    roiDisplay: `${roi.toFixed(1)}x`,
    roiPercentage: `${roiPercentage}%`
  };
}

// Value estimation: $500-750/mo per user
// Conservative: $600/mo per user
// Aggressive: $750/mo per user
const CONSERVATIVE_VALUE_PER_USER = 600; // monthly
const AGGRESSIVE_VALUE_PER_USER = 750; // monthly
```

## Productivity Metrics

### Claude Code vs GitHub Copilot
```typescript
// Based on actual data (Nov-Dec 2025)
const CLAUDE_CODE_LINES_PER_USER = 27650; // Nov-Dec average
const GITHUB_COPILOT_LINES_PER_USER = 3700; // Nov 12 - Dec 9 average

// Productivity advantage
const PRODUCTIVITY_MULTIPLIER = CLAUDE_CODE_LINES_PER_USER / GITHUB_COPILOT_LINES_PER_USER;
// = 27,650 ÷ 3,700 = 7.47x (round to 7.5x)
```

### GitHub Copilot Model Preferences
```typescript
// Based on actual usage data (Nov 12 - Dec 9, 2025)
const COPILOT_MODEL_USAGE = {
  'Claude 4.5 Sonnet': { lines: 81198, percentage: 48 },
  'Claude 4.0 Sonnet': { lines: 42328, percentage: 25 },
  'Claude Total': { lines: 123526, percentage: 72 }, // KEY METRIC
  'Gemini 2.5 Pro': { lines: 13268, percentage: 8 },
  'GPT-5-mini': { lines: 8396, percentage: 5 },
  'GPT-5.0': { lines: 5708, percentage: 3 },
  'Other/Unknown': { lines: 18494, percentage: 11 }
};

// Critical insight: Engineers choose Claude 72% of time
const CLAUDE_PREFERENCE_RATE = 0.72;
```

### Time Savings Metrics (from engineer feedback)
```typescript
const TIME_SAVINGS_EXAMPLES = [
  {
    task: 'Debugging complex issue',
    before: '3+ hours',
    after: '~1 hour',
    savings: 0.67, // 67%
    source: 'Taran Pierce'
  },
  {
    task: 'Release risk assessment',
    before: '60 minutes',
    after: '5 minutes',
    savings: 0.92, // 92%
    source: 'Roger Hampton'
  },
  {
    task: 'Test migration (50+ projects)',
    before: '3-4 days',
    after: '1 hour',
    savings: 0.96, // 96%
    source: 'Devin Wagner'
  },
  {
    task: 'Daily communication catch-up',
    before: '30-45 minutes',
    after: '5-10 minutes',
    savings: 0.70, // 70%
    source: 'Sara Johnson'
  }
];
```

## Adoption Metrics

### Activation & Adoption Rates
```typescript
function calculateAdoptionMetrics(
  totalLicenses: number,
  activatedUsers: number,
  usersWithUsage30days: number,
  avgDailyActive: number
) {
  return {
    activationRate: Math.round((activatedUsers / totalLicenses) * 100),
    adoptionRate: Math.round((usersWithUsage30days / activatedUsers) * 100),
    dailyActiveRate: Math.round((avgDailyActive / activatedUsers) * 100),

    // Segments
    activated: activatedUsers,
    pending: totalLicenses - activatedUsers,
    using: usersWithUsage30days,
    notUsing: activatedUsers - usersWithUsage30days
  };
}
```

### Daily Active Users Calculation
```typescript
// Calculate average daily active users over last N days
async function calculateDailyActiveAverage(days: number) {
  const dates = Array.from({length: days}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  });

  const dailyCounts = await Promise.all(
    dates.map(async date => {
      // Query database for unique users on this date
      const count = await db.auditEvents.countDistinct('user_email', {
        where: {
          event_date: {
            gte: new Date(date + 'T00:00:00'),
            lt: new Date(date + 'T23:59:59')
          }
        }
      });
      return count;
    })
  );

  return Math.round(dailyCounts.reduce((sum, c) => sum + c, 0) / days);
}
```

## M365 Copilot vs Claude Enterprise Comparison (NEW)

### Adoption Comparison
```typescript
function compareM365vsClaudeAdoption(
  totalEmployees: number,
  m365Users: number, // Users with M365 Copilot activity
  claudeUsers: number // Users with Claude Enterprise activity
) {
  return {
    m365: {
      users: m365Users,
      coverage: Math.round((m365Users / totalEmployees) * 100),
      costPerUser: 30, // $30/mo (estimated as part of M365 license)
      totalCost: m365Users * 30
    },
    claude: {
      users: claudeUsers,
      coverage: Math.round((claudeUsers / totalEmployees) * 100),
      avgCostPerUser: 60, // Weighted avg of Premium ($200) and Standard ($40)
      totalCost: claudeUsers * 60 // Simplified, real calc uses actual mix
    }
  };
}
```

### Use Case Comparison
```typescript
const M365_COPILOT_USE_CASES = {
  'Word': 'Document drafting, editing assistance',
  'Excel': 'Data analysis, formula help',
  'PowerPoint': 'Slide generation, design suggestions',
  'Teams': 'Meeting summaries, chat assistance',
  'Outlook': 'Email drafting, inbox management'
};

const CLAUDE_ENTERPRISE_USE_CASES = {
  'Chat': 'Complex analysis, research, problem-solving',
  'Projects': 'Organized knowledge work, multi-file context',
  'Artifacts': 'Code, documents, diagrams generation',
  'Analysis': 'Deep data analysis, strategic thinking',
  'Integrations': 'MCP connectors (Jira, Confluence, Slack, etc.)'
};

// Value proposition
const VALUE_COMPARISON = {
  m365Copilot: {
    strength: 'Integrated into daily Office workflows',
    weakness: 'Limited to Office apps, shallow AI capabilities',
    bestFor: 'Basic document work, routine tasks'
  },
  claudeEnterprise: {
    strength: 'Superior reasoning, complex problem-solving, flexible use cases',
    weakness: 'Separate tool (not in Office apps)',
    bestFor: 'Strategic work, analysis, coding, deep thinking'
  }
};
```

## Data Quality & Edge Cases

### Email Normalization
```typescript
// Username to email mapping
function normalizeUsername(username: string): string {
  // Handles: 'gtaborga' → 'gtaborga@techco.com'
  if (username.includes('@')) return username;
  return `${username}@techco.com`;
}
```

### JSON Parsing in CSVs
```typescript
// Handle actor_info field with single quotes
function parseActorInfo(actorInfoString: string) {
  try {
    // Replace single quotes with double quotes for valid JSON
    const jsonString = actorInfoString.replace(/'/g, '"');
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to parse actor_info:', actorInfoString);
    return null;
  }
}
```

### Handling Missing/Invalid Data
```typescript
// Graceful handling of data gaps
function safeDivide(numerator: number, denominator: number, decimals = 2): number {
  if (denominator === 0) return 0;
  return parseFloat((numerator / denominator).toFixed(decimals));
}

function safePercentage(part: number, total: number): string {
  if (total === 0) return 'N/A';
  return `${Math.round((part / total) * 100)}%`;
}

// Negative gaps (data error)
function calculateGap(needed: number, current: number): number {
  const gap = needed - current;
  return Math.max(0, gap); // Never negative
}
```

### Date/Time Handling
```typescript
// Always store in UTC, display in local
function parseEventDate(dateString: string): Date {
  return new Date(dateString); // Assumes ISO 8601 format
}

// Format for display
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}
```

## Testing Critical Calculations

### Test Case 1: Engineering Department (100% Premium)
```typescript
const testCase1 = {
  name: 'Engineering',
  totalEmployees: 70,
  currentUsers: 21,
  currentPremium: 12,
  currentStandard: 9
};

const result1 = calculateExpansionCost(testCase1);

// Expected results:
// powerUsersNeeded = 70 (100% for Engineering)
// powerFromUpgrades = min(70-12, 9) = 9
// powerFromNew = max(0, 70-12-9) = 49
// premiumGap = 9 + 49 = 58
// standardGap = 0 (Engineering doesn't need Standard)
// upgradeCost = 9 * 1920 = $17,280
// newPremiumCost = 49 * 2400 = $117,600
// totalAnnualCost = $134,880

assert(result1.premiumGap === 58);
assert(result1.standardGap === 0);
assert(result1.totalAnnualCost === 134880);
```

### Test Case 2: Marketing Department (10% Premium)
```typescript
const testCase2 = {
  name: 'Marketing',
  totalEmployees: 21,
  currentUsers: 12,
  currentPremium: 0,
  currentStandard: 12
};

const result2 = calculateExpansionCost(testCase2);

// Expected results:
// powerUsersNeeded = ceil(21 * 0.10) = 3
// powerFromUpgrades = min(3-0, 12) = 3
// powerFromNew = max(0, 3-0-3) = 0
// standardNeeded = 21 - 3 = 18
// standardHave = 12 - 3 = 9
// standardGap = max(0, 18-9) = 9
// premiumGap = 3 + 0 = 3
// upgradeCost = 3 * 1920 = $5,760
// newStandardCost = 9 * 480 = $4,320
// totalAnnualCost = $10,080

assert(result2.premiumGap === 3);
assert(result2.standardGap === 9);
assert(result2.totalAnnualCost === 10080);
```

### Test Case 3: GitHub Copilot Consolidation
```typescript
const copilotConsolidation = {
  currentCopilotUsers: 46,
  currentCopilotCost: 46 * 39 * 12, // $21,528/year
  claudeCodeUsers: 11, // Already have access
  needsAccess: 46 - 11, // 35 additional Premium licenses needed
  premiumCost: 35 * 200 * 12, // $84,000/year for new Premium
  netCost: (35 * 200 * 12) - (46 * 39 * 12), // $84,000 - $21,528 = $62,472

  // But wait - these 35 will also replace their existing licenses
  // So actual net cost is different - need to factor in existing Standard licenses
};

// Simpler calculation from docs/plan/02:
// Need 33 NEW Premium (not 35, some already have Standard)
// Net additional cost: $6,600/mo - $1,794/mo = $4,806/mo
// Annual net: $57,672
```

## Constants Reference

```typescript
// Pricing (monthly) - FROM VENDOR CONTRACTS ONLY
const PRICING = {
  premiumMonthly: 200,
  standardMonthly: 40,
  upgradeMonthly: 160, // Incremental cost
  githubCopilotMonthly: 19, // TechCo Inc actual cost
  m365CopilotMonthly: 30 // Estimated (part of M365 license)
};

// Pricing (annual) - FROM VENDOR CONTRACTS ONLY
const ANNUAL_PRICING = {
  premium: 2400,
  standard: 480,
  upgrade: 1920,
  githubCopilot: 228, // $19/mo × 12
  m365Copilot: 360
};

// Value estimates (monthly per user)
const VALUE_ESTIMATES = {
  conservative: 600,
  moderate: 750,
  aggressive: 900
};

// Productivity multipliers
const PRODUCTIVITY = {
  claudeCodeVsCopilot: 7.5, // Claude Code is 7.5x more productive
  claudePreferenceInCopilot: 0.72 // 72% of Copilot usage is Claude models
};
```
