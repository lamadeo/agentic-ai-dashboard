# Development Conventions & Best Practices

## File Organization

### Directory Structure
```
as-ai-dashboard/
├── .claude/                    # Context for Claude Code sessions
│   ├── claude.md              # Primary context file (read first)
│   ├── PROJECT.md             # Strategic goals
│   ├── ARCHITECTURE.md        # Technical decisions
│   ├── CALCULATIONS.md        # Business logic (CRITICAL)
│   ├── ROADMAP.md             # Implementation phases
│   ├── DATA-SOURCES.md        # Data schemas
│   └── CONVENTIONS.md         # This file
├── app/
│   ├── page.jsx               # Main dashboard (current: 68KB monolith)
│   ├── layout.jsx
│   ├── globals.css
│   └── api/                   # Future: API routes
│       ├── upload/
│       ├── metrics/
│       ├── departments/
│       └── cron/
├── components/                 # Future: Reusable UI components
│   ├── tabs/                  # One component per dashboard tab
│   ├── charts/                # Reusable chart components
│   └── shared/                # Shared components (MetricCard, etc.)
├── lib/                       # Future: Business logic & utilities
│   ├── calculations/          # Pure calculation functions
│   ├── data-ingestion/        # CSV/PDF/NDJSON parsers
│   ├── db.ts                  # Database client
│   └── utils/                 # Helper functions
├── docs/
│   ├── data/                  # Raw data files (CSVs, PDFs, NDJSONs)
│   ├── designs/               # Design iterations
│   └── plan/                  # Planning documents
├── public/
├── prisma/                    # Future: Database schema
└── package.json
```

---

## Naming Conventions

### Files & Directories
- **Components**: PascalCase - `MetricCard.tsx`, `DailyActiveChart.tsx`
- **API routes**: lowercase with hyphens - `/api/daily-active/route.ts`
- **Utilities**: camelCase - `dateHelpers.ts`, `formatters.ts`
- **Database tables**: snake_case - `audit_events`, `code_usage`
- **Directories**: lowercase - `components/`, `lib/`, `app/`

### Variables & Functions
- **Functions**: camelCase - `calculateExpansionCost()`, `parseCSV()`
- **Constants**: UPPER_SNAKE_CASE - `PRICING`, `CLAUDE_CODE_LINES_PER_USER`
- **Components**: PascalCase - `<MetricCard />`, `<OverviewTab />`
- **Props**: camelCase - `activeTab`, `setActiveTab`, `summaryMetrics`
- **Database fields**: snake_case - `user_email`, `event_date`, `lines_of_code`

### Example
```typescript
// ✅ Good
const PREMIUM_MONTHLY_COST = 200;
function calculateExpansionCost(dept: Department) { }
const MetricCard = ({ title, value }: Props) => { };

// ❌ Bad
const premium_cost = 200;
function CalculateExpansionCost(dept: Department) { }
const metric_card = ({ Title, Value }: Props) => { };
```

---

## Code Style

### TypeScript Usage
- **Always use TypeScript** for type safety (except existing JSX files)
- Define interfaces for data structures
- Use strict typing (avoid `any`)
- Export types for reusability

```typescript
// ✅ Good
interface Department {
  name: string;
  totalEmployees: number;
  currentUsers: number;
  currentPremium: number;
  currentStandard: number;
}

function calculateExpansionCost(dept: Department): ExpansionResult {
  // ...
}

// ❌ Bad
function calculateExpansionCost(dept: any): any {
  // ...
}
```

### Pure Functions for Calculations
- Calculations should be **pure functions** (no side effects)
- Take inputs as parameters, return outputs
- Testable in isolation
- No database calls inside calculation functions

```typescript
// ✅ Good - Pure function
export function calculateROI(investment: number, value: number): ROIResult {
  const netBenefit = value - investment;
  const roi = value / investment;
  return { investment, value, netBenefit, roi };
}

// ❌ Bad - Side effects
export function calculateROI(deptId: string): ROIResult {
  const dept = fetchDeptFromDB(deptId); // Database call
  // ... calculation
}
```

### Async/Await for Database Operations
```typescript
// ✅ Good
async function getDepartmentMetrics() {
  const departments = await db.departments.findMany();
  const metrics = await Promise.all(
    departments.map(async dept => await calculateDeptMetric(dept))
  );
  return metrics;
}

// ❌ Bad - Callback hell
function getDepartmentMetrics(callback) {
  db.departments.findMany((err, departments) => {
    // ...
  });
}
```

### Error Handling
```typescript
// ✅ Good - Try/catch with specific errors
async function ingestCSV(fileContent: string): Promise<IngestResult> {
  try {
    const data = parseCSV(fileContent);
    validateData(data);
    await db.auditEvents.createMany(data);
    return { success: true, imported: data.length };
  } catch (error) {
    if (error instanceof ValidationError) {
      return { success: false, error: 'Invalid data format' };
    }
    throw error; // Re-throw unexpected errors
  }
}

// ❌ Bad - Swallow all errors
async function ingestCSV(fileContent: string) {
  try {
    // ...
  } catch (error) {
    console.log(error); // Silent failure
  }
}
```

---

## Component Patterns

### Metric Cards
```tsx
// Reusable MetricCard component
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'indigo';
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  color = 'blue'
}: MetricCardProps) {
  // ... implementation
}
```

### Tab Components
```tsx
// Each tab is a separate component
interface OverviewTabProps {
  summaryMetrics: SummaryMetrics;
  dailyActiveData: DailyActiveData[];
  loading?: boolean;
}

export function OverviewTab({
  summaryMetrics,
  dailyActiveData,
  loading = false
}: OverviewTabProps) {
  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Tab content */}
    </div>
  );
}
```

### Chart Components
```tsx
// Reusable chart wrapper
interface ChartProps {
  data: any[];
  title: string;
  description?: string;
}

export function DailyActiveChart({ data, title, description }: ChartProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-4">{description}</p>}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          {/* Chart config */}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

---

## Data Flow Patterns

### Static Dashboard (Current)
```tsx
// Data hardcoded in component
const summaryMetrics = {
  claudeUsers: 78,
  conversations: 2377,
  // ...
};

return <OverviewTab summaryMetrics={summaryMetrics} />;
```

### Dynamic Dashboard (Phase 1 Target)
```tsx
// Data fetched from API
const [summaryMetrics, setSummaryMetrics] = useState<SummaryMetrics | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function loadData() {
    try {
      const data = await fetch('/api/metrics/summary').then(r => r.json());
      setSummaryMetrics(data);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  }

  loadData();
}, []);

if (loading) return <LoadingSpinner />;
if (!summaryMetrics) return <ErrorMessage />;

return <OverviewTab summaryMetrics={summaryMetrics} />;
```

---

## Testing Strategy

### Unit Tests for Calculations
```typescript
// Test critical business logic
describe('calculateExpansionCost', () => {
  it('calculates Engineering as 100% Premium', () => {
    const dept = {
      name: 'Engineering',
      totalEmployees: 70,
      currentUsers: 21,
      currentPremium: 12,
      currentStandard: 9
    };

    const result = calculateExpansionCost(dept);

    expect(result.premiumGap).toBe(58); // 70 - 12
    expect(result.standardGap).toBe(0);
    expect(result.totalAnnualCost).toBe(134880);
  });

  it('calculates other departments as 10% Premium', () => {
    const dept = {
      name: 'Marketing',
      totalEmployees: 21,
      currentUsers: 12,
      currentPremium: 0,
      currentStandard: 12
    };

    const result = calculateExpansionCost(dept);

    expect(result.premiumGap).toBe(3); // ceiling(21 * 0.10) = 3
    expect(result.standardGap).toBe(9);
  });
});
```

### Integration Tests for Data Ingestion
```typescript
describe('ingestAuditLogCSV', () => {
  it('parses real CSV file correctly', async () => {
    const csvContent = fs.readFileSync('/data/Claude Usage - audit_logs Nov_1_to_Dec_9.csv', 'utf-8');

    const result = await ingestAuditLogCSV(csvContent);

    expect(result.imported).toBeGreaterThan(0);
    expect(result.errors).toHaveLength(0);
  });

  it('handles malformed actor_info gracefully', async () => {
    const malformedCSV = `event,created_at,actor_info
conversation_created,2025-11-01T10:00:00Z,"{'invalid json"`;

    const result = await ingestAuditLogCSV(malformedCSV);

    expect(result.errors).toContain('Failed to parse actor_info');
  });
});
```

### Validation Tests
```typescript
// Test against known results from static dashboard
describe('Dashboard metrics validation', () => {
  it('matches static dashboard calculations', async () => {
    // Known values from current static dashboard
    const EXPECTED_CLAUDE_USERS = 78;
    const EXPECTED_CONVERSATIONS = 2377;

    const result = await calculateSummaryMetrics();

    expect(result.claudeUsers).toBe(EXPECTED_CLAUDE_USERS);
    expect(result.conversations).toBe(EXPECTED_CONVERSATIONS);
  });
});
```

---

## Database Patterns

### Using Prisma ORM
```typescript
// Query with relationships
const usersWithUsage = await prisma.claudeUsers.findMany({
  where: {
    status: 'Active',
    auditEvents: {
      some: {
        eventDate: {
          gte: thirtyDaysAgo
        }
      }
    }
  },
  include: {
    auditEvents: {
      where: {
        eventDate: {
          gte: thirtyDaysAgo
        }
      }
    }
  }
});
```

### Upsert Pattern
```typescript
// Update if exists, create if not
await prisma.claudeUsers.upsert({
  where: { email: 'user@techco.com' },
  update: {
    lastSeen: new Date(),
    updatedAt: new Date()
  },
  create: {
    email: 'user@techco.com',
    name: 'User Name',
    status: 'Active'
  }
});
```

### Batch Operations
```typescript
// Insert many records at once
await prisma.auditEvents.createMany({
  data: events,
  skipDuplicates: true // Avoid errors on unique constraint violations
});
```

---

## Performance Best Practices

### Caching Expensive Calculations
```typescript
// Cache in database
async function getCachedMetric(metricType: string, metricDate: Date) {
  const cached = await prisma.metricsCache.findUnique({
    where: {
      metricDate_metricType: {
        metricDate,
        metricType
      }
    }
  });

  if (cached && isRecent(cached.calculatedAt)) {
    return cached.value;
  }

  // Recalculate
  const value = await calculateMetric(metricType, metricDate);

  // Update cache
  await prisma.metricsCache.upsert({
    where: {
      metricDate_metricType: { metricDate, metricType }
    },
    update: { value, calculatedAt: new Date() },
    create: { metricDate, metricType, value, calculatedAt: new Date() }
  });

  return value;
}
```

### Lazy Loading Charts
```tsx
// Only render chart for active tab
{activeTab === 'adoption' && (
  <DailyActiveChart data={dailyActiveData} />
)}
```

### Debouncing Data Refreshes
```typescript
// Prevent multiple rapid refreshes
const debouncedRefresh = useMemo(
  () => debounce(() => loadData(), 1000),
  []
);
```

---

## Security Best Practices

### Data Validation
```typescript
// Validate before inserting
function validateAuditLog(row: any): boolean {
  if (!row.created_at || !row.event || !row.actor_info) {
    throw new ValidationError('Missing required fields');
  }

  if (isNaN(Date.parse(row.created_at))) {
    throw new ValidationError('Invalid date format');
  }

  return true;
}
```

### Authentication for Uploads
```typescript
// Protect upload endpoints
export async function POST(request: NextRequest) {
  const session = await getSession(request);

  if (!session || !session.user.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Process upload
}
```

### Cron Secret Verification
```typescript
// Verify cron job authentication
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Execute cron job
}
```

---

## Git Workflow

### Commit Messages
```
feat: Add GitHub Copilot comparison tab
fix: Correct expansion cost calculation for Engineering
docs: Update ROADMAP with M365 Copilot comparison
refactor: Break dashboard into modular components
test: Add unit tests for expansion calculations
chore: Update dependencies
```

### Branch Strategy
- `main` - Production code (deployed to Vercel)
- `develop` - Integration branch
- `feature/copilot-comparison` - Feature branches
- `fix/calculation-bug` - Bug fix branches

---

## Documentation Requirements

### Function Documentation
```typescript
/**
 * Calculates expansion cost and ROI for a department
 *
 * CRITICAL RULES:
 * - Engineering departments get 100% Premium (not 10%)
 * - Other departments get 10% Premium, 90% Standard
 * - Power users come from existing Standard seats first
 *
 * @param dept - Department with current license allocation
 * @returns Expansion cost, ROI, and detailed breakdown
 */
export function calculateExpansionCost(dept: Department): ExpansionResult {
  // ...
}
```

### API Documentation
```typescript
/**
 * GET /api/metrics/summary
 *
 * Returns summary metrics for the Overview tab
 *
 * Response:
 * {
 *   claudeUsers: number,
 *   conversations: number,
 *   adoptionRate: number,
 *   // ...
 * }
 *
 * Caching: ISR with 1 hour revalidation
 */
export async function GET() {
  // ...
}
```

---

## Environment Variables

### Required Variables
```bash
# Database
DATABASE_URL=postgresql://...

# Authentication
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://...

# External APIs (future)
ANTHROPIC_API_KEY=sk-ant-...
RIPPLING_API_KEY=...
GITHUB_TOKEN=...

# Cron
CRON_SECRET=...

# App
NEXT_PUBLIC_APP_URL=https://...
```

### Loading Environment Variables
```typescript
// lib/env.ts
export const env = {
  databaseUrl: process.env.DATABASE_URL!,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  cronSecret: process.env.CRON_SECRET!
};

// Validate on startup
if (!env.databaseUrl) {
  throw new Error('DATABASE_URL is required');
}
```

---

## Common Pitfalls to Avoid

### ❌ Don't Hardcode Data in Components
```tsx
// Bad
const claudeUsers = 78; // What if this changes?

// Good
const [claudeUsers, setClaudeUsers] = useState<number | null>(null);
useEffect(() => {
  fetch('/api/metrics/summary')
    .then(r => r.json())
    .then(data => setClaudeUsers(data.claudeUsers));
}, []);
```

### ❌ Don't Mix Business Logic with UI
```tsx
// Bad - Calculation in component
function OverviewTab() {
  const roi = (value - cost) / cost; // Business logic in UI
  return <div>{roi}</div>;
}

// Good - Calculation in lib
import { calculateROI } from '@/lib/calculations/roi';

function OverviewTab({ investment, value }: Props) {
  const roi = calculateROI(investment, value);
  return <div>{roi.display}</div>;
}
```

### ❌ Don't Forget Edge Cases
```typescript
// Bad - Crashes on division by zero
const percentage = (part / total) * 100;

// Good - Handle edge cases
const percentage = total === 0 ? 0 : Math.round((part / total) * 100);
```

### ❌ Don't Skip Data Validation
```typescript
// Bad - Trust user input
await db.users.create({ email: userInput.email });

// Good - Validate first
if (!isValidEmail(userInput.email)) {
  throw new ValidationError('Invalid email');
}
await db.users.create({ email: userInput.email });
```

---

## Checklist for New Features

- [ ] TypeScript interfaces defined
- [ ] Business logic in `/lib/calculations/` (pure functions)
- [ ] Data parsing in `/lib/data-ingestion/`
- [ ] API route created (if needed)
- [ ] Component in `/components/`
- [ ] Unit tests written
- [ ] Integration test with real data
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Documentation added
- [ ] Reviewed against `.claude/CALCULATIONS.md` for business rules
- [ ] Tested with files from `/data/`
- [ ] Committed with descriptive message

---

## Resources

### Key Files to Reference
- `.claude/CALCULATIONS.md` - Business logic rules (CRITICAL)
- `.claude/DATA-SOURCES.md` - Data schemas and parsing
- `.claude/ARCHITECTURE.md` - Technical decisions
- `/docs/plan/01 - vercel-app-implementation-plan.md` - Implementation details

### External Documentation
- Next.js 14: https://nextjs.org/docs
- Recharts: https://recharts.org/
- Prisma: https://www.prisma.io/docs
- Tailwind CSS: https://tailwindcss.com/docs
- Vercel: https://vercel.com/docs
