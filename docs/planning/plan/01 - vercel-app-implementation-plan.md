# Claude Analytics Dashboard - Vercel App Implementation Plan

## Executive Summary

Transform the current React artifact dashboard into a production Vercel application with real-time data sources, automated updates, and scalable architecture. The app will consume data from multiple sources (CSVs, PDFs, APIs, MCP connectors) to generate executive analytics on Claude Enterprise & Claude Code adoption, ROI, and expansion opportunities.

## Project Context

**Current State:** React artifact (67KB) with hardcoded data arrays  
**Target State:** Production Next.js app on Vercel with live data integration  
**Primary Users:** Executive leadership, enablement team, department heads  
**Update Frequency:** Daily automated updates + on-demand refresh

---

## Architecture Overview

### Tech Stack
```
Frontend: Next.js 14 (App Router)
UI: React + Tailwind CSS + Recharts
Deployment: Vercel
Backend: Next.js API routes + Server Actions
Data Storage: Vercel Postgres (or Supabase)
File Processing: Server-side (CSV, PDF parsing)
Authentication: Vercel Auth (or Clerk)
Data Refresh: Vercel Cron Jobs + manual triggers
```

### Data Flow Architecture
```
Data Sources → Data Ingestion Layer → Database → API Layer → Frontend Dashboard
     ↓
1. Manual uploads (CSV/PDF)
2. API integrations (future)
3. MCP connectors (future)
4. Scheduled fetches
```

---

## Phase 1: Core Application (Week 1-2)

### 1.1 Project Setup
```bash
# Initialize Next.js project
npx create-next-app@latest claude-analytics --typescript --tailwind --app
cd claude-analytics

# Install dependencies
npm install recharts papaparse pdf-parse lodash
npm install @vercel/postgres  # or prisma
npm install lucide-react date-fns

# Setup environment
# .env.local
DATABASE_URL=
ANTHROPIC_API_KEY=  # for future API integration
```

### 1.2 Database Schema

**Primary Tables:**

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

-- Audit events table
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
```

### 1.3 Data Ingestion Services

**File: `/lib/data-ingestion/audit-logs.ts`**
```typescript
import Papa from 'papaparse';
import { db } from '@/lib/db';

export async function ingestAuditLogCSV(fileContent: string) {
  const result = Papa.parse(fileContent, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: 'greedy'
  });

  const events = result.data.map(row => {
    // Parse actor_info JSON (handle single quotes)
    const actorInfo = typeof row.actor_info === 'string' 
      ? JSON.parse(row.actor_info.replace(/'/g, '"'))
      : row.actor_info;
    
    return {
      user_email: actorInfo?.metadata?.email_address,
      event_type: row.event,
      event_date: new Date(row.created_at),
      conversation_id: row.conversation_id,
      project_id: row.project_id,
      metadata: actorInfo
    };
  });

  // Batch insert to database
  await db.auditEvents.createMany(events);
  
  // Update users table (last_seen dates)
  await updateUserActivity(events);
  
  return { imported: events.length };
}
```

**File: `/lib/data-ingestion/code-usage.ts`**
```typescript
import pdf from 'pdf-parse';

export async function ingestCodeUsagePDF(pdfBuffer: Buffer) {
  const data = await pdf(pdfBuffer);
  const text = data.text;
  
  // Parse the leaderboard table
  // Example line: "1. gtaborga 52,347 lines"
  const regex = /(\d+)\.\s+(\w+)\s+([\d,]+)\s+lines/g;
  const matches = [...text.matchAll(regex)];
  
  const usageData = matches.map(match => ({
    rank: parseInt(match[1]),
    username: match[2],
    lines_of_code: parseInt(match[3].replace(/,/g, ''))
  }));
  
  // Determine period from PDF filename or content
  const period = extractPeriodFromPDF(text); // e.g., "2025-11"
  
  // Insert to database
  await db.codeUsage.createMany(usageData.map(u => ({
    user_email: `${u.username}@techco.com`, // map username to email
    period_start: new Date(period + '-01'),
    period_end: new Date(period + '-30'),
    lines_of_code: u.lines_of_code,
    rank: u.rank
  })));
  
  return { imported: usageData.length };
}
```

**File: `/lib/data-ingestion/licenses.ts`**
```typescript
export async function ingestLicenseList(licenses: Array<{
  email: string;
  name: string;
  seat_tier: 'Premium' | 'Standard';
  status: 'Active' | 'Pending';
}>) {
  // Upsert to users table
  for (const license of licenses) {
    await db.users.upsert({
      where: { email: license.email },
      update: {
        seat_tier: license.seat_tier,
        status: license.status,
        updated_at: new Date()
      },
      create: {
        email: license.email,
        name: license.name,
        seat_tier: license.seat_tier,
        status: license.status
      }
    });
  }
  
  return { imported: licenses.length };
}
```

### 1.4 Calculation Engine

**File: `/lib/calculations/metrics.ts`**
```typescript
export async function calculateSummaryMetrics() {
  // Total licenses
  const totalLicenses = await db.users.count();
  const activatedUsers = await db.users.count({ where: { status: 'Active' }});
  const premiumUsers = await db.users.count({ where: { seat_tier: 'Premium', status: 'Active' }});
  
  // Conversations (30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const conversations = await db.auditEvents.count({
    where: {
      event_type: 'conversation_created',
      event_date: { gte: thirtyDaysAgo }
    }
  });
  
  // Users with usage in last 30 days
  const usersWithUsage = await db.auditEvents.findMany({
    where: { event_date: { gte: thirtyDaysAgo }},
    distinct: ['user_email']
  });
  
  // Daily active (calculate average over last 14 days)
  const dailyActive = await calculateDailyActiveAverage(14);
  
  return {
    totalLicenses,
    activatedUsers,
    premiumUsers,
    standardUsers: activatedUsers - premiumUsers,
    usersWithUsage: usersWithUsage.length,
    conversations,
    adoptionRate: Math.round((usersWithUsage.length / activatedUsers) * 100),
    activationRate: Math.round((activatedUsers / totalLicenses) * 100),
    dailyActiveRate: Math.round((dailyActive / activatedUsers) * 100),
    avgDailyActive: dailyActive
  };
}

export async function calculateDailyActiveAverage(days: number) {
  const dates = Array.from({length: days}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  });
  
  const dailyCounts = await Promise.all(
    dates.map(async date => {
      const count = await db.auditEvents.findMany({
        where: {
          event_date: {
            gte: new Date(date + 'T00:00:00'),
            lt: new Date(date + 'T23:59:59')
          }
        },
        distinct: ['user_email']
      });
      return count.length;
    })
  );
  
  return Math.round(dailyCounts.reduce((sum, c) => sum + c, 0) / days);
}
```

**File: `/lib/calculations/expansion.ts`**
```typescript
interface Department {
  name: string;
  totalEmployees: number;
  currentUsers: number;
  currentPremium: number;
  currentStandard: number;
}

export function calculateExpansionCost(dept: Department) {
  const isEngineering = dept.name.includes('Engineering');
  
  // Power users: 100% for Engineering, 10% for others
  const powerUsersNeeded = isEngineering 
    ? dept.totalEmployees 
    : Math.ceil(dept.totalEmployees * 0.10);
  
  // Calculate gaps
  const totalGap = dept.totalEmployees - dept.currentUsers;
  
  // Upgrades: how many current Standard users need to become Premium
  const powerFromUpgrades = Math.min(powerUsersNeeded - dept.currentPremium, dept.currentStandard);
  const powerFromNew = Math.max(0, powerUsersNeeded - dept.currentPremium - powerFromUpgrades);
  
  // Standard gap
  const standardNeeded = dept.totalEmployees - powerUsersNeeded;
  const standardHave = dept.currentStandard - powerFromUpgrades;
  const standardGap = Math.max(0, standardNeeded - standardHave);
  
  // Costs (ANNUAL)
  const upgradeCost = powerFromUpgrades * 1920; // $160/mo × 12
  const newPremiumCost = powerFromNew * 2400; // $200/mo × 12
  const newStandardCost = standardGap * 480; // $40/mo × 12
  
  const totalAnnualCost = upgradeCost + newPremiumCost + newStandardCost;
  
  // Value (estimate $500-750/mo per user)
  const monthlyValue = totalGap * 600; // Conservative $600/mo
  const annualValue = monthlyValue * 12;
  
  return {
    standardGap,
    premiumGap: powerFromUpgrades + powerFromNew,
    totalAnnualCost,
    monthlyEquivalent: totalAnnualCost / 12,
    annualValue,
    netBenefit: annualValue - totalAnnualCost,
    roi: annualValue / totalAnnualCost,
    detail: `${standardGap} new Std + ${powerFromUpgrades} upgrades + ${powerFromNew} new Prem`
  };
}

export function calculateProRated2026Cost(annualCost: number, quarter: 'Q1' | 'Q2' | 'Q3') {
  // Assume mid-quarter deployment
  const monthsRemaining = {
    'Q1': 10.5, // Mid-Feb through Dec
    'Q2': 7.5,  // Mid-May through Dec
    'Q3': 4.5   // Mid-Aug through Dec
  };
  
  return (annualCost / 12) * monthsRemaining[quarter];
}
```

---

## Phase 2: Data Integration Layer (Week 3-4)

### 2.1 File Upload Interface

**File: `/app/api/upload/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { ingestAuditLogCSV } from '@/lib/data-ingestion/audit-logs';
import { ingestCodeUsagePDF } from '@/lib/data-ingestion/code-usage';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const fileType = formData.get('type') as string;
  
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }
  
  try {
    if (fileType === 'audit-logs') {
      const content = await file.text();
      const result = await ingestAuditLogCSV(content);
      return NextResponse.json({ success: true, ...result });
    }
    
    if (fileType === 'code-usage') {
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await ingestCodeUsagePDF(buffer);
      return NextResponse.json({ success: true, ...result });
    }
    
    return NextResponse.json({ error: 'Unknown file type' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

**File: `/components/DataUpload.tsx`**
```typescript
'use client';

import { useState } from 'react';

export function DataUpload() {
  const [uploading, setUploading] = useState(false);
  
  const handleUpload = async (file: File, type: string) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    setUploading(false);
    
    if (result.success) {
      // Trigger dashboard refresh
      window.location.reload();
    }
  };
  
  return (
    <div className="grid grid-cols-3 gap-4 p-6">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Audit Logs CSV</h3>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'audit-logs')}
          disabled={uploading}
        />
      </div>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Code Usage PDF</h3>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'code-usage')}
          disabled={uploading}
        />
      </div>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <h3 className="font-semibold mb-2">License List</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded">
          Sync from API
        </button>
      </div>
    </div>
  );
}
```

### 2.2 API Routes for Dashboard Data

**File: `/app/api/metrics/summary/route.ts`**
```typescript
import { NextResponse } from 'next/server';
import { calculateSummaryMetrics } from '@/lib/calculations/metrics';

export async function GET() {
  try {
    const metrics = await calculateSummaryMetrics();
    return NextResponse.json(metrics);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Enable ISR (Incremental Static Regeneration)
export const revalidate = 3600; // Revalidate every hour
```

**File: `/app/api/metrics/daily-active/route.ts`**
```typescript
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '30');
  
  // Calculate daily active users for last N days
  const dailyData = await calculateDailyActiveForPeriod(days);
  
  return NextResponse.json(dailyData);
}

async function calculateDailyActiveForPeriod(days: number) {
  // SQL query to get daily unique users
  const result = await db.$queryRaw`
    SELECT 
      DATE(event_date) as date,
      COUNT(DISTINCT user_email) as active_users,
      COUNT(*) FILTER (WHERE event_type = 'conversation_created') as conversations
    FROM audit_events
    WHERE event_date >= NOW() - INTERVAL '${days} days'
    GROUP BY DATE(event_date)
    ORDER BY date ASC
  `;
  
  return result;
}
```

**File: `/app/api/departments/route.ts`**
```typescript
import { NextResponse } from 'next/server';
import { calculateDepartmentMetrics } from '@/lib/calculations/departments';

export async function GET() {
  const metrics = await calculateDepartmentMetrics();
  return NextResponse.json(metrics);
}

async function calculateDepartmentMetrics() {
  // Join users with their usage data
  const departments = await db.departments.findMany();
  
  const departmentMetrics = await Promise.all(
    departments.map(async (dept) => {
      const users = await db.users.findMany({
        where: { department: dept.name, status: 'Active' }
      });
      
      const conversations = await db.auditEvents.count({
        where: {
          user_email: { in: users.map(u => u.email) },
          event_type: 'conversation_created'
        }
      });
      
      const premium = users.filter(u => u.seat_tier === 'Premium').length;
      const standard = users.filter(u => u.seat_tier === 'Standard').length;
      
      return {
        name: dept.name,
        totalEmployees: dept.total_employees,
        users: users.length,
        premium,
        standard,
        conversations,
        coverage: Math.round((users.length / dept.total_employees) * 100)
      };
    })
  );
  
  return departmentMetrics;
}
```

### 2.3 Frontend Dashboard Component

**File: `/app/dashboard/page.tsx`**
```typescript
'use client';

import { useState, useEffect } from 'react';
import { DashboardTabs } from '@/components/DashboardTabs';
import { OverviewTab } from '@/components/tabs/OverviewTab';
import { AdoptionTab } from '@/components/tabs/AdoptionTab';
// ... other tabs

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadData() {
      const [summary, daily, departments, expansion] = await Promise.all([
        fetch('/api/metrics/summary').then(r => r.json()),
        fetch('/api/metrics/daily-active?days=30').then(r => r.json()),
        fetch('/api/departments').then(r => r.json()),
        fetch('/api/expansion').then(r => r.json())
      ]);
      
      setMetrics({ summary, daily, departments, expansion });
      setLoading(false);
    }
    
    loadData();
  }, []);
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <DashboardTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {activeTab === 'overview' && <OverviewTab data={metrics} />}
      {activeTab === 'adoption' && <AdoptionTab data={metrics} />}
      {/* ... other tabs */}
    </div>
  );
}
```

---

## Phase 3: Advanced Features (Week 5-6)

### 3.1 Automated Data Refresh

**File: `/app/api/cron/daily-refresh/route.ts`**
```typescript
// Vercel Cron Job - runs daily
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  try {
    // Future: Fetch from Anthropic API
    // await fetchLatestAuditLogs();
    
    // Recalculate cached metrics
    await recalculateAllMetrics();
    
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

**Vercel Configuration (`vercel.json`):**
```json
{
  "crons": [{
    "path": "/api/cron/daily-refresh",
    "schedule": "0 6 * * *"
  }]
}
```

### 3.2 MCP Connector Integration (Future)

**File: `/lib/connectors/rippling.ts`**
```typescript
// Example: Fetch org chart from Rippling API
export async function fetchOrgChartFromRippling() {
  const response = await fetch('https://api.rippling.com/v1/employees', {
    headers: {
      'Authorization': `Bearer ${process.env.RIPPLING_API_KEY}`
    }
  });
  
  const employees = await response.json();
  
  // Update departments table
  const deptMap = groupByDepartment(employees);
  
  for (const [deptName, employeeList] of Object.entries(deptMap)) {
    await db.departments.upsert({
      where: { name: deptName },
      update: { 
        total_employees: employeeList.length,
        updated_at: new Date()
      },
      create: {
        name: deptName,
        total_employees: employeeList.length
      }
    });
  }
}
```

### 3.3 Real-time Updates (Optional)

**Using Vercel KV for real-time metrics:**
```typescript
import { kv } from '@vercel/kv';

// Cache frequently accessed metrics
export async function getCachedMetrics() {
  const cached = await kv.get('dashboard:summary');
  if (cached) return cached;
  
  const fresh = await calculateSummaryMetrics();
  await kv.set('dashboard:summary', fresh, { ex: 3600 }); // 1 hour cache
  
  return fresh;
}
```

---

## Phase 4: Production Deployment (Week 7-8)

### 4.1 Environment Configuration

**File: `.env.local` (development)**
```
DATABASE_URL=postgresql://user:pass@localhost:5432/claude_analytics
ANTHROPIC_API_KEY=sk-ant-...
CRON_SECRET=your-secret-here
RIPPLING_API_KEY=  # future
SALESFORCE_API_KEY=  # future
```

### 4.2 Deployment Checklist

1. **Database Setup**
   - [ ] Provision Vercel Postgres
   - [ ] Run migrations
   - [ ] Seed initial data (upload CSVs)

2. **Environment Variables**
   - [ ] Set in Vercel dashboard
   - [ ] Configure cron secret

3. **Initial Data Load**
   - [ ] Upload audit_logs.csv
   - [ ] Upload November & December code usage PDFs
   - [ ] Import license list (85 users)
   - [ ] Import department org chart data

4. **Vercel Deployment**
   ```bash
   vercel --prod
   ```

5. **Post-Deployment**
   - [ ] Verify all tabs render
   - [ ] Test data upload flow
   - [ ] Verify cron job runs
   - [ ] Share dashboard URL with stakeholders

---

## File Structure

```
claude-analytics/
├── app/
│   ├── dashboard/
│   │   └── page.tsx                 # Main dashboard page
│   ├── api/
│   │   ├── upload/route.ts          # File upload endpoint
│   │   ├── metrics/
│   │   │   ├── summary/route.ts     # Summary metrics
│   │   │   ├── daily-active/route.ts
│   │   │   └── monthly/route.ts
│   │   ├── departments/route.ts
│   │   ├── expansion/route.ts
│   │   └── cron/
│   │       └── daily-refresh/route.ts
│   └── layout.tsx
├── components/
│   ├── DashboardTabs.tsx
│   ├── DataUpload.tsx
│   ├── MetricCard.tsx
│   ├── tabs/
│   │   ├── OverviewTab.tsx
│   │   ├── AdoptionTab.tsx
│   │   ├── ProductivityTab.tsx
│   │   ├── DepartmentsTab.tsx
│   │   ├── CodeTab.tsx
│   │   ├── EnablementTab.tsx
│   │   └── ExpansionTab.tsx
│   └── charts/
│       ├── DailyActiveChart.tsx
│       ├── DepartmentPieChart.tsx
│       └── ExpansionBarChart.tsx
├── lib/
│   ├── db.ts                        # Database client
│   ├── data-ingestion/
│   │   ├── audit-logs.ts
│   │   ├── code-usage.ts
│   │   ├── licenses.ts
│   │   └── org-chart.ts
│   ├── calculations/
│   │   ├── metrics.ts               # Core metric calculations
│   │   ├── expansion.ts             # Expansion cost logic
│   │   ├── roi.ts                   # ROI calculations
│   │   └── departments.ts
│   └── utils/
│       ├── date-helpers.ts
│       └── formatters.ts
├── prisma/
│   └── schema.prisma                # Database schema
├── public/
│   └── data/                        # Fallback CSV/PDF storage
└── vercel.json                      # Cron configuration
```

---

## Critical Implementation Details

### Data Reconciliation Logic
Based on our iterations, the app MUST handle:

1. **Email normalization** - usernames vs emails (e.g., `gtaborga` → `gtaborga@techco.com`)
2. **JSON parsing in CSVs** - actor_info field with single quotes needs cleaning
3. **Department mapping** - manual mapping table for edge cases
4. **Multiple data source reconciliation**:
   - License list (85 users) vs usage reports (78 users) vs audit logs
   - Track "activated but not using" (4 users)
   - Track "pending invites" (3 users)

### Expansion Cost Calculation Rules
```typescript
// CRITICAL: These rules took multiple iterations to get right

1. Engineering gets 100% Premium (not 10%)
2. Other departments: 10% Premium (power users), 90% Standard
3. Upgrade cost: $160/mo incremental ($1,920/year)
4. New Premium: $200/mo ($2,400/year)
5. New Standard: $40/mo ($480/year)
6. Power users come from EXISTING Standard first, then new Premium
7. Product already has 1 Premium power user (Laura) - don't double count
```

### Pro-ration Assumptions
```typescript
// Mid-quarter deployments for 2026 budget
Q1 2026 (Phase 2 - Engineering): Feb 15 deploy = 10.5 months
Q2 2026 (Phase 3 - Service/GTM): May 15 deploy = 7.5 months
Q3 2026 (Phase 4 - Complete): Aug 15 deploy = 4.5 months

2026 cost = (Annual run rate / 12) × months remaining in 2026
```

---

## Data Source Integration Roadmap

### Phase 1: Manual Uploads (MVP)
- CSV upload for audit logs
- PDF upload for code usage reports
- Manual license list entry/upload

### Phase 2: Anthropic API Integration
```typescript
// Future: Direct API integration
import Anthropic from '@anthropic-ai/sdk';

async function fetchAuditLogs(orgId: string) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  
  // Hypothetical API endpoint (not yet available)
  const logs = await client.organizations.auditLogs.list({
    organization_id: orgId,
    limit: 1000
  });
  
  return logs;
}
```

### Phase 3: MCP Connector Integration
```typescript
// Vercel MCP connector for employee data
import { McpClient } from '@modelcontextprotocol/sdk/client';

async function fetchEmployeeData() {
  const mcp = new McpClient();
  await mcp.connect('vercel-mcp');
  
  const employees = await mcp.call('employee_search', {
    limit: 500
  });
  
  return employees;
}
```

### Phase 4: Rippling Integration
```typescript
// Fetch live org chart
async function syncOrgChart() {
  const orgChart = await fetch('https://api.rippling.com/v1/org-chart');
  // Update departments table with live headcount
}
```

---

## Key Learnings to Apply

### 1. Data Quality Issues We Encountered
- **Always validate email formats** - some users have inconsistent emails
- **Handle missing data gracefully** - not all users in audit logs appear in license list
- **Cross-reference multiple sources** - usage reports vs license list vs audit logs
- **Track data freshness** - show "Last updated: X" on dashboards

### 2. Calculation Edge Cases
- **Zero division errors** - departments with 0 users
- **Negative gaps** - when current > total (data errors)
- **Rounding** - always round up for power users (ceiling function)
- **Date timezone handling** - ensure consistent UTC/local time

### 3. Performance Considerations
- **Cache expensive calculations** - daily aggregations
- **Paginate large tables** - expansion opportunities table
- **Lazy load charts** - only render active tab
- **Debounce data refreshes** - don't hammer APIs

### 4. UI/UX Patterns That Worked
- **Metric cards at top** - immediate context
- **Tab navigation** - organize complex data
- **Color coding** - phase status, ROI tiers
- **Sortable tables** - let users explore
- **Tooltips on charts** - detailed hover info
- **Summary callouts** - key insights highlighted

---

## Testing Strategy

### Unit Tests
```typescript
// lib/calculations/__tests__/expansion.test.ts
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
  });
});
```

### Integration Tests
- Test CSV upload → database → API → frontend flow
- Test metric calculations with known data sets
- Test date range filtering
- Test department aggregations

### Data Validation
```typescript
// Validate uploaded data before inserting
function validateAuditLog(row: any) {
  if (!row.created_at || !row.event || !row.actor_info) {
    throw new Error('Missing required fields');
  }
  
  // Validate date format
  if (isNaN(Date.parse(row.created_at))) {
    throw new Error('Invalid date format');
  }
  
  return true;
}
```

---

## Migration Path from Artifact to Production

### Step 1: Extract Current Dashboard Component
```bash
# Copy the working React component as starting point
cp claude-dashboard-final-v3.jsx /app/components/DashboardContent.tsx
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

---

## Success Criteria

### Functional Requirements
- [ ] Dashboard displays all 7 tabs correctly
- [ ] All metrics match current artifact calculations
- [ ] CSV/PDF uploads work and update dashboard
- [ ] Data persists between sessions
- [ ] Dashboard refreshes daily automatically

### Performance Requirements
- [ ] Page load < 2 seconds
- [ ] API responses < 500ms
- [ ] Charts render smoothly
- [ ] Handles 1000+ audit log entries

### Data Quality Requirements
- [ ] 100% accuracy on metric calculations
- [ ] Proper handling of missing/invalid data
- [ ] Clear error messages on data issues
- [ ] Data freshness indicators visible

---

## Estimated Development Timeline

**Total: 6-8 weeks with Claude Code**

- **Week 1-2:** Core app setup, database, basic UI
- **Week 3-4:** Data ingestion, calculation engine, API routes
- **Week 5-6:** Advanced features, testing, refinement
- **Week 7-8:** Production deployment, documentation, handoff

---

## Next Steps for Claude Code

1. **Initialize project:** Create Next.js app with Vercel preset
2. **Set up database:** Define Prisma schema based on tables above
3. **Build data ingestion:** Start with CSV audit log parser
4. **Implement calculations:** Port expansion cost logic first (most complex)
5. **Create API routes:** Build metrics endpoints
6. **Port UI components:** Start with OverviewTab, add others incrementally
7. **Test with real data:** Use the actual CSVs/PDFs from this project
8. **Deploy to Vercel:** Get production URL
9. **Add upload interface:** Enable manual data updates
10. **Document:** API docs, data schemas, calculation formulas

The artifact we built is the spec. The implementation is translating it to production architecture.
