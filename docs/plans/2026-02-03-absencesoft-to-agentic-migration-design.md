# Migration Design: TechCo Inc AI Dashboard → Agentic AI Dashboard

**Date**: February 3, 2026
**Author**: Luis F. Amadeo
**Status**: Approved - Ready for Implementation
**Estimated Time**: 8-10 hours

## Executive Summary

Migrate the TechCo Inc AI Dashboard to a generic, open-source "Agentic AI Dashboard" suitable for any organization. This migration includes:
- Fresh git history (squashed start)
- Complete data anonymization (TechCo Inc → TechCo Inc sample data)
- Genericized branding and visual identity
- Dark/light mode theming with neutral color palette
- Tiered environment variable configuration
- New GitHub repository and Vercel deployment
- Comprehensive documentation updates

## 1. Migration Overview & Repository Setup

### Approach
Squashed fresh start with genericized codebase - creates clean, professional open-source project history.

### Repository Setup

**New Repository**: `lamadeo/agentic-ai-dashboard`
- Visibility: Public
- License: MIT
- Default branch: `main`

### Git Migration Process

```bash
# Step 1: Merge feature branches locally
git checkout main
git merge docs/manual-data-preparation-workflows
git merge origin/fix/rename-expansion-roi-claude-enterprise

# Step 2: Create fresh history
git checkout --orphan fresh-start
git add .
git commit -m "Initial commit: Agentic AI Dashboard v1.0.0

Open-source AI tool adoption and ROI tracking dashboard built with Next.js.
Includes sample data from TechCo Inc demonstrating multi-tool tracking across
Claude Enterprise, Claude Code, M365 Copilot, and GitHub Copilot.

Features:
- 15 dashboard tabs with AI-powered insights
- Real-time sentiment analysis
- ROI calculations and expansion planning
- Dark/light mode theming
- Fully responsive design

MIT License - Ready to deploy and customize for your organization."

# Step 3: Point to new remote
git remote remove origin
git remote add origin https://github.com/lamadeo/agentic-ai-dashboard.git
git push -u origin fresh-start:main --force
```

### Why Squashed Fresh Start?
- Clean, professional open-source project history
- No TechCo Inc references in commit messages
- Preserves all current code state
- Simplest migration path
- Future commits build new history as "agentic-ai-dashboard" project

## 2. Data Anonymization Strategy

### Objective
Convert TechCo Inc data to TechCo Inc sample dataset while preserving all metrics, patterns, and functionality.

### Files Requiring Anonymization

#### 1. Org Chart Data
- `data/techco_org_chart.json` → `data/techco_org_chart.json`
- `data/org-chart-snapshots/*.json` → Update all snapshots

#### 2. Raw Usage Data (Critical - Contains Emails/Names)
- `data/claude-enterprise/` - Conversations, seats, license history
- `data/claude-code/` - Usage logs with user identifiers
- `data/m365-copilot/` - Activity reports with employee emails
- `data/github-copilot/` - Usage data with developer names/emails

#### 3. Aggregated Data
- `data/claude_enterprise_seats.json`
- `data/TechCo Inc_AI_Projects_2026.csv` → `data/TechCo_AI_Projects_2026.csv`
- All `/data/ai-projects/*.md` files

### Anonymization Implementation

#### Script 1: Generate Employee Mapping
**File**: `scripts/generate-employee-mapping.js`

**Purpose**: Create master mapping of real → fictional employees

**Process**:
1. Extract all unique email addresses from:
   - Org chart files
   - Claude Enterprise data
   - Claude Code usage
   - M365 Copilot reports
   - GitHub Copilot data
2. Generate fictional employee for each real employee:
   - Realistic first/last names (diverse, international)
   - Email format: `firstname.lastname@techco.com`
   - Maintain consistent mapping across entire dataset
3. Output: `scripts/employee-mapping.json` (add to `.gitignore`)

**Example Mapping**:
```json
{
  "john.doe@techco.com": {
    "email": "michael.chen@techco.com",
    "name": "Michael Chen",
    "firstName": "Michael",
    "lastName": "Chen"
  },
  "jane.smith@techco.com": {
    "email": "sarah.johnson@techco.com",
    "name": "Sarah Johnson",
    "firstName": "Sarah",
    "lastName": "Johnson"
  }
}
```

#### Script 2: Comprehensive Anonymization
**File**: `scripts/anonymize-all-data.js`

**Purpose**: Apply master mapping to all data files

**Process**:
1. Read `employee-mapping.json`
2. For each data directory (`claude-enterprise/`, `claude-code/`, etc.):
   - Find all JSON/CSV/MD files
   - Replace email addresses using mapping
   - Replace names using mapping
   - Replace "TechCo Inc" → "TechCo Inc"
   - Replace "techco" → "techco"
3. Preserve:
   - All metrics and usage patterns
   - All timestamps and dates
   - Department structure and hierarchies
   - All headcounts and statistics
4. Validate data integrity after transformation

### Department Structure (Preserve As-Is)
- Engineering, Product, Sales, Marketing, Customer Success
- Operations, Finance, HR, Legal, Executive
- Keep exact headcounts and hierarchies
- Only change employee names/emails

### Sample Employee Names (Diverse, Realistic)
- Michael Chen, Sarah Johnson, Aisha Patel, Robert Kim
- Maria Garcia, James Williams, Priya Sharma, David Lee
- Emma Brown, Carlos Rodriguez, Fatima Hassan, etc.

## 3. Branding & Visual Identity Updates

### Logo Replacement

**Remove**: `/public/assets/techco-logo.svg`

**Create**: `/public/assets/agentic-ai-dashboard-logo.svg`
- Use existing AI icon (`/public/assets/ai-icon.png`) as base
- Add "Agentic AI Dashboard" text
- Simple, clean design in SVG format
- Variants for dark and light modes

**Also Update**:
- `public/favicon.ico` - Generate new favicon from AI icon
- All logo alt text in components

### Code References to Update

**Primary Files**:
- `app/components/layout/DashboardHeader.jsx` - Logo import and rendering
- `app/layout.jsx` - Metadata (title, description, OpenGraph)
- Any component with hardcoded "TechCo Inc" text

**Metadata Example**:
```javascript
// app/layout.jsx
export const metadata = {
  title: 'Agentic AI Dashboard',
  description: 'Track AI tool adoption and ROI across your organization',
  openGraph: {
    title: 'Agentic AI Dashboard',
    description: 'Open-source AI tool tracking and optimization',
  }
}
```

### Global Search & Replace

**Pattern 1**: "TechCo Inc" → "TechCo Inc"
- Scope: All displayed text, documentation, data files
- Case-sensitive replacement

**Pattern 2**: "techco" → "techco"
- Scope: Code, filenames, URLs, config
- Lowercase replacement

### Neutral Color Palette

**Design Principles**:
- Professional and modern
- Works well in both dark and light modes
- Suitable for any company/industry
- High contrast for accessibility
- Based on blue/gray foundation (universally professional)

## 4. Dark/Light Mode Implementation

### Package Installation
```bash
npm install next-themes
```

### Color Palette - Neutral Professional Theme

**File**: `tailwind.config.js`

```css
:root {
  /* Light mode (secondary default) */
  --background: 0 0% 100%;           /* Pure white */
  --foreground: 222 47% 11%;         /* Deep blue-gray */
  --primary: 221 83% 53%;            /* Professional blue */
  --primary-foreground: 0 0% 100%;   /* White text on blue */
  --secondary: 210 40% 96%;          /* Light gray */
  --secondary-foreground: 222 47% 11%;
  --accent: 210 40% 96%;             /* Light accent */
  --accent-foreground: 222 47% 11%;
  --muted: 210 40% 96%;              /* Muted background */
  --muted-foreground: 215 16% 47%;   /* Muted text */
  --border: 214 32% 91%;             /* Subtle borders */
  --card: 0 0% 100%;                 /* White cards */
  --card-foreground: 222 47% 11%;
  --chart-1: 221 83% 53%;            /* Blue */
  --chart-2: 142 76% 36%;            /* Green */
  --chart-3: 346 84% 61%;            /* Red */
  --chart-4: 45 93% 47%;             /* Orange */
  --chart-5: 271 81% 56%;            /* Purple */
}

.dark {
  /* Dark mode (primary default) */
  --background: 222 47% 11%;         /* Deep blue-gray */
  --foreground: 210 40% 98%;         /* Off-white */
  --primary: 217 91% 60%;            /* Bright blue */
  --primary-foreground: 222 47% 11%; /* Dark text on blue */
  --secondary: 217 33% 17%;          /* Dark blue-gray */
  --secondary-foreground: 210 40% 98%;
  --accent: 217 33% 17%;             /* Dark accent */
  --accent-foreground: 210 40% 98%;
  --muted: 217 33% 17%;              /* Muted dark background */
  --muted-foreground: 215 20% 65%;   /* Muted light text */
  --border: 217 33% 17%;             /* Subtle dark borders */
  --card: 222 47% 11%;               /* Dark cards */
  --card-foreground: 210 40% 98%;
  --chart-1: 217 91% 60%;            /* Brighter blue */
  --chart-2: 142 71% 45%;            /* Adjusted green */
  --chart-3: 346 84% 61%;            /* Red (same) */
  --chart-4: 45 93% 47%;             /* Orange (same) */
  --chart-5: 271 81% 56%;            /* Purple (same) */
}
```

### Theme Provider Component

**File**: `app/components/ThemeProvider.jsx`

```javascript
'use client'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({ children }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"        // Dark mode as default
      enableSystem={true}         // Respect system preference
      disableTransitionOnChange  // Prevent flash
    >
      {children}
    </NextThemesProvider>
  )
}
```

### Theme Toggle Component

**File**: `app/components/ThemeToggle.jsx`

```javascript
'use client'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg bg-secondary hover:bg-accent transition-colors"
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 dark:hidden" />
      <Moon className="h-5 w-5 hidden dark:block" />
    </button>
  )
}
```

### Integration Points

**Update `app/layout.jsx`**:
```javascript
import { ThemeProvider } from './components/ThemeProvider'

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**Update `app/components/layout/DashboardHeader.jsx`**:
- Add `<ThemeToggle />` component to header
- Position near GitHub link

### Component Updates

**Global Changes Needed**:
- Replace all hardcoded colors with CSS variable classes
- Use `bg-background`, `text-foreground`, `bg-card`, etc.
- Update chart colors to use `--chart-1` through `--chart-5`
- Test all 15 tabs in both dark and light modes
- Ensure all text has sufficient contrast (WCAG AA compliance)

## 5. Environment Variables Restructuring

### Required Configuration

```bash
# REQUIRED - Dashboard will not function without this
# Generate new key at: https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Optional - Sentiment Analysis Pipeline

```bash
# Only required if running sentiment analysis pipeline
# Create Slack App with scopes: channels:history, channels:read, users:read, users:read.email
# Get token from: https://api.slack.com/apps
SLACK_BOT_TOKEN=xoxb-xxxxxxxxxxxxx-xxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx

# Slack Channel IDs (find via right-click > Copy Link in Slack)
SLACK_CHANNEL_COMPANY_GENERAL=C01234567      # Your main company channel
SLACK_CHANNEL_AI_DISCUSSION=C01234568        # AI-focused discussion channel
SLACK_CHANNEL_ENGINEERING=C01234569          # Engineering team channel
SLACK_CHANNEL_TECH_TALK=C0123456A            # Technology discussion channel
SLACK_DAYS_BACK=30                           # Days of history to fetch

# Confluence API (optional)
# Documentation: https://developer.atlassian.com/cloud/confluence/rest/v1/
CONFLUENCE_BASE_URL=https://yourcompany.atlassian.net
CONFLUENCE_USERNAME=your-email@company.com
CONFLUENCE_API_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CONFLUENCE_DAYS_BACK=90
```

### Temporary Authentication

```bash
# Generate new hash with: npm run hash-password
# TODO: Replace with Vercel authentication services
TEMP_PWD_HASH=$2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Setup Actions

1. **Generate New Anthropic API Key**:
   - Go to https://console.anthropic.com/
   - Create new key (separate from TechCo Inc key)
   - Set usage limits if desired

2. **Generate New Password Hash**:
   ```bash
   npm run hash-password
   # Enter new password when prompted
   # Copy hash to TEMP_PWD_HASH
   ```

3. **Document in README**:
   - "Authentication currently uses simple password protection"
   - "Vercel authentication integration planned for future release"

### Updated `.env.example` Structure

```bash
# ==============================================
# Agentic AI Dashboard - Environment Configuration
# ==============================================

# TIER 1: CORE FUNCTIONALITY (Required)
# ----------------------------------------------
# The dashboard requires an Anthropic API key to generate AI-powered insights
# Sign up at: https://console.anthropic.com/

ANTHROPIC_API_KEY=sk-ant-api03-your-api-key-here

# Optional: AI model configuration (defaults shown)
AI_INSIGHTS_MODEL=claude-sonnet-4-20250514
AI_INSIGHTS_MAX_TOKENS=500
AI_INSIGHTS_TEMPERATURE=0.3


# TIER 2: SENTIMENT ANALYSIS (Optional)
# ----------------------------------------------
# Enable real-time sentiment tracking from Slack channels
# Only configure if you want the Perceived Value tab with live sentiment

SLACK_BOT_TOKEN=xoxb-xxxxxxxxxxxxx-xxxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx
SLACK_CHANNEL_COMPANY_GENERAL=C01234567
SLACK_CHANNEL_AI_DISCUSSION=C01234568
SLACK_CHANNEL_ENGINEERING=C01234569
SLACK_CHANNEL_TECH_TALK=C0123456A
SLACK_DAYS_BACK=30


# TIER 3: FULL INTEGRATION (Optional)
# ----------------------------------------------
# Enable Confluence documentation tracking

CONFLUENCE_BASE_URL=https://yourcompany.atlassian.net
CONFLUENCE_USERNAME=your-email@company.com
CONFLUENCE_API_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CONFLUENCE_DAYS_BACK=90


# AUTHENTICATION (Production Deployments)
# ----------------------------------------------
# Temporary password protection (generate with: npm run hash-password)
# TODO: Migrate to Vercel authentication services

TEMP_PWD_HASH=$2b$10$your-hashed-password-here
```

### Code Updates for Graceful Degradation

**Update Scripts**:
- `scripts/parse-copilot-data.js` - Handle missing ANTHROPIC_API_KEY (error)
- `scripts/parse-slack-sentiment.js` - Skip if SLACK_BOT_TOKEN missing (warning)
- `scripts/generate-insights.js` - Require ANTHROPIC_API_KEY (error if missing)

**Console Warnings**:
```javascript
if (!process.env.SLACK_BOT_TOKEN) {
  console.warn('⚠️  Tier 2 not configured - Sentiment analysis disabled')
  console.warn('   Set SLACK_BOT_TOKEN to enable real-time sentiment tracking')
}
```

### Future Improvements (Document in ROADMAP)

- [ ] **Vercel Authentication** - Replace TEMP_PWD_HASH with Vercel auth services
- [ ] **Database Persistence** - PostgreSQL or Supabase for data storage
- [ ] **Near-Real-Time Data Pipeline** - Replace batch processing with live APIs:
  - Claude Enterprise API
  - Claude Code Compliance API
  - M365 Copilot API
  - GitHub Copilot API
  - ZScaler API (for shadow IT tracking)
- [ ] **ZScaler Integration** - Add shadow IT tracking views
- [ ] **Multi-tenant Support** - Support multiple organizations in one deployment

## 6. CI/CD & Deployment Configuration

### Vercel Project Setup

**New Project**: `agentic-ai-dashboard`
- Framework: Next.js
- Build command: `npm run build`
- Output directory: `.next`
- Install command: `npm install`

**GitHub Integration**:
- Repository: `lamadeo/agentic-ai-dashboard`
- Automatic deployments enabled:
  - **Preview**: All pull requests → unique preview URL
  - **Production**: Merges to `main` → production URL

### GitHub Secrets Configuration

**Repository Settings → Secrets and Variables → Actions**

Add the following secrets:

1. **VERCEL_TOKEN** - Vercel API token
   - Get from: https://vercel.com/account/tokens
   - Create new token with full access

2. **VERCEL_ORG_ID** - Vercel organization ID
   - Get from: Vercel dashboard → Settings → General
   - Or from `.vercel/project.json` after first deployment

3. **VERCEL_PROJECT_ID** - Vercel project ID
   - Get from: Vercel project → Settings → General
   - Or from `.vercel/project.json` after first deployment

4. **ANTHROPIC_API_KEY** - New Anthropic API key
   - Generate new key for this project at console.anthropic.com
   - Different from TechCo Inc key

5. **SLACK_BOT_TOKEN** - Optional (if running sentiment analysis)
   - Only needed if Tier 2 configured

### Existing CI/CD Workflows (Update References)

**File**: `.github/workflows/ci.yml`
- Test matrix: Node 18.x and 20.x
- Runs 76 tests
- Build verification
- **Update**: Any hardcoded repo references

**File**: `.github/workflows/ci-cd.yml`
- Preview deployments for PRs
- Production deployments for main
- Integration tests on deployed previews
- **Update**:
  - Vercel project name references
  - GitHub repo URLs
  - Any TechCo Inc-specific checks

### Vercel Configuration

**File**: `vercel.json`

```json
{
  "github": {
    "enabled": false
  },
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "installCommand": "npm install"
}
```

**Why `github.enabled: false`?**
- Let GitHub Actions handle deployments for full CI/CD control
- Run tests before deployment
- More control over deployment conditions

### Deployment Flow

```
Pull Request Created
      ↓
GitHub Actions CI
├── Run Tests (Node 18.x & 20.x) - 76 tests
├── Build Next.js app
└── Tests Pass? ✅
      ↓
Deploy Preview to Vercel
├── Unique URL per PR
├── Integration tests on deployed preview
└── GitHub bot comments with preview URL
      ↓
PR Merged to Main
      ↓
GitHub Actions CI (on main)
├── Run Tests
├── Build Next.js app
└── Tests Pass? ✅
      ↓
Deploy Production to Vercel
└── URL: agentic-ai-dashboard.vercel.app
```

### Deployment URLs

**Production**:
- `https://agentic-ai-dashboard.vercel.app`

**Preview** (per PR):
- `https://agentic-ai-dashboard-<hash>-lamadeo.vercel.app`
- Unique URL for each PR
- Updated automatically on new commits

### DEPLOYMENT.md Updates

**Changes Needed**:
- Replace all `techco/as-ai-dashboard` → `lamadeo/agentic-ai-dashboard`
- Update Vercel project name: `as-ai-dashboard` → `agentic-ai-dashboard`
- Update production URL
- Keep same CI/CD flow diagrams (just update names)
- Update GitHub Actions URL in monitoring section

## 7. Documentation & README Updates

### New README.md Structure

```markdown
# Agentic AI Dashboard

> Track AI tool adoption, measure ROI, and optimize your AI tool portfolio

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/lamadeo/agentic-ai-dashboard)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests](https://github.com/lamadeo/agentic-ai-dashboard/workflows/CI/badge.svg)](https://github.com/lamadeo/agentic-ai-dashboard/actions)

![Dashboard Preview](docs/assets/dashboard-preview.png)

## What is This?

An **open-source executive dashboard** for organizations using multiple AI tools. Track adoption, analyze sentiment, calculate ROI, and make data-driven decisions about your AI investments.

**Perfect for**:
- CIOs and CTOs optimizing AI tool spend
- Operations teams tracking AI adoption
- Finance teams calculating AI ROI
- Engineering leaders comparing coding assistants

**Live Demo**: [agentic-ai-dashboard.vercel.app](https://agentic-ai-dashboard.vercel.app)
**Sample Data**: Includes TechCo Inc dataset with 250+ users across 4 AI tools

## ✨ Features

- 📊 **15 Dashboard Tabs** - Overview, briefings, tool deep dives, comparisons, ROI planning, enablement
- 🤖 **AI-Powered Insights** - Claude analyzes your data and generates optimization recommendations
- 💬 **Sentiment Analysis** - Track user feedback from Slack channels (optional)
- 💰 **ROI Calculations** - Expansion planning, cost optimization, and value tracking
- 📈 **Interactive Charts** - Adoption trends, department heatmaps, comparison visualizations
- 🌓 **Dark/Light Mode** - Modern, responsive design with theme toggle
- 🔒 **Secure** - Authentication ready, environment-based configuration
- 🚀 **Production Ready** - Full CI/CD pipeline with automated testing

## 🎯 Supported AI Tools

- **Claude Enterprise** - Chat, projects, artifacts, integrations tracking
- **Claude Code** - Terminal-based coding assistant usage
- **M365 Copilot** - Word, Excel, Teams, PowerPoint integration
- **GitHub Copilot** - IDE-integrated coding assistant
- **ChatGPT** - Shadow IT tracking via ZScaler (roadmap)

## 🚀 Quick Start

### Option 1: Deploy to Vercel (Recommended)

1. Click the "Deploy with Vercel" button above
2. Connect your GitHub account
3. Configure environment variables (see Configuration section)
4. Deploy!

### Option 2: Run Locally

```bash
# Clone the repository
git clone https://github.com/lamadeo/agentic-ai-dashboard.git
cd agentic-ai-dashboard

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Run development server
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) to view the dashboard.

## ⚙️ Configuration

The dashboard uses **tiered configuration** for progressive feature enablement:

### Tier 1: Core (Required)

```bash
ANTHROPIC_API_KEY=sk-ant-api03-...  # Get from console.anthropic.com
```

**Enables**: AI-powered insights on all dashboard tabs

### Tier 2: Enhanced (Optional)

```bash
SLACK_BOT_TOKEN=xoxb-...
SLACK_CHANNEL_COMPANY_GENERAL=C01234567
SLACK_CHANNEL_AI_DISCUSSION=C01234568
# ... more Slack channels
```

**Enables**: Real-time sentiment analysis from your Slack workspace

### Tier 3: Full (Optional)

```bash
CONFLUENCE_BASE_URL=https://yourcompany.atlassian.net
CONFLUENCE_USERNAME=your-email@company.com
CONFLUENCE_API_TOKEN=...
```

**Enables**: Documentation tracking and Confluence integration

See [Configuration Guide](docs/guides/CONFIGURATION.md) for detailed setup instructions.

## 📊 Dashboard Tabs

1. **Overview Home** - Executive summary with key metrics
2. **Claude Enterprise** - Usage, projects, integrations tracking
3. **Claude Code** - Power users, engagement, coding productivity
4. **M365 Copilot** - Adoption, active users, department breakdown
5. **Productivity Tools Comparison** - Claude Enterprise vs M365 Copilot
6. **Coding Tools Comparison** - Claude Code vs GitHub Copilot
7. **Expansion ROI** - Cost optimization and expansion planning
8. **Perceived Value** - Sentiment analysis and user feedback
9. **Portfolio** - AI projects and initiatives tracking
10. **Integrations** - MCP connector usage and analytics
11. **Projects** - Claude project sophistication scoring
12. **Briefing (Org)** - Organization-wide AI adoption overview
13. **Briefing (Leadership)** - Executive-level insights
14. **Enablement** - Training and onboarding metrics
15. **Annual Plan** - 2026 AI strategy presentation

## 🔄 Data Refresh

The dashboard uses a batch data pipeline. To refresh with latest data:

```bash
npm run refresh
```

This will:
1. Parse organizational hierarchy
2. Process usage data from all AI tools
3. Generate AI-powered insights
4. Update dashboard JSON files

**Future**: Real-time data pipeline using official APIs (see [Roadmap](docs/FUTURE_ROADMAP.md))

## 🧪 Testing

```bash
# Run all tests (76 tests)
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📖 Documentation

- [Configuration Guide](docs/guides/CONFIGURATION.md) - Environment setup
- [Data Refresh Guide](docs/guides/DATA_REFRESH.md) - Updating dashboard data
- [Deployment Guide](DEPLOYMENT.md) - CI/CD and production deployment
- [Architecture Decision Records](docs/architecture/) - Technical decisions
- [Future Roadmap](docs/FUTURE_ROADMAP.md) - Planned improvements
- [Contributing Guide](CONTRIBUTING.md) - How to contribute

## 🛣️ Roadmap

- [ ] Vercel authentication services (replace temporary password)
- [ ] Database persistence layer (PostgreSQL/Supabase)
- [ ] Near-real-time data pipeline with official APIs
- [ ] ZScaler integration for shadow IT tracking
- [ ] Multi-tenant support
- [ ] Customizable dashboard layouts

See [FUTURE_ROADMAP.md](docs/FUTURE_ROADMAP.md) for full roadmap.

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

## 💡 Sample Data

This repository includes sample data from a fictional company "TechCo Inc" with:
- 250+ employees across 10 departments
- 115 Claude Enterprise licenses
- 238 M365 Copilot users
- 46 GitHub Copilot developers
- 6 months of usage history

All employee names and data are fictional. Metrics and patterns are representative of real-world usage.

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Recharts](https://recharts.org/) - Data visualization
- [Anthropic Claude API](https://www.anthropic.com/) - AI insights
- [next-themes](https://github.com/pacocoursey/next-themes) - Theme switching

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/lamadeo/agentic-ai-dashboard/issues)
- **Discussions**: [GitHub Discussions](https://github.com/lamadeo/agentic-ai-dashboard/discussions)
- **Email**: luis.amadeo@gmail.com

---

**Star this repo** ⭐ if you find it useful!
```

### Documentation Files to Update

**Update with TechCo Inc Examples**:
- `CONTRIBUTING.md` - Update repo URLs
- `DEPLOYMENT.md` - Update all references (repo, Vercel project, URLs)
- `docs/guides/DATA_REFRESH.md` - TechCo Inc examples
- `docs/guides/DATA_SOURCES_SETUP.md` - Generic company references
- `docs/guides/CLAUDE_SEATS_UPDATE_PROCESS.md` - TechCo Inc examples
- `docs/guides/CI_CD_SETUP.md` - Update repo references
- `docs/guides/CI_CD_VERCEL_SETUP.md` - Update all references

**Update ADRs** (Add Note at Top):
```markdown
> **Note**: This ADR references TechCo Inc as sample implementation.
> All architectural decisions apply to any organization using this dashboard.
```

### New Documentation Files to Create

**1. `docs/FUTURE_ROADMAP.md`**
```markdown
# Future Roadmap

## Planned Improvements

### Authentication & Security
- [ ] Implement Vercel authentication services
- [ ] Replace TEMP_PWD_HASH with proper auth
- [ ] Add SSO integration options (SAML, OAuth)
- [ ] Role-based access control (RBAC)

### Data Pipeline
- [ ] Database persistence layer (PostgreSQL/Supabase)
- [ ] Near-real-time data sync with official APIs:
  - [ ] Claude Enterprise API
  - [ ] Claude Code Compliance API
  - [ ] M365 Copilot API
  - [ ] GitHub Copilot API
  - [ ] ZScaler API
- [ ] Incremental data updates (vs full refresh)
- [ ] Data retention policies

### New Features
- [ ] ZScaler integration for shadow IT tracking
- [ ] ChatGPT usage tracking
- [ ] Customizable dashboard layouts
- [ ] Export to PDF/PowerPoint
- [ ] Email reports and alerts
- [ ] Budget forecasting module
- [ ] AI tool recommendation engine

### Multi-Tenancy
- [ ] Support multiple organizations in one deployment
- [ ] Organization-specific theming
- [ ] Data isolation and security
- [ ] Multi-org admin panel

### Developer Experience
- [ ] TypeScript migration
- [ ] Storybook component library
- [ ] E2E testing with Playwright
- [ ] Performance monitoring
- [ ] Error tracking (Sentry integration)

### Integrations
- [ ] Jira integration for project tracking
- [ ] Microsoft Teams notifications
- [ ] Slack app for dashboard access
- [ ] API for custom integrations
```

**2. `docs/guides/CONFIGURATION.md`**
- Detailed setup guide for each tier
- Step-by-step instructions with screenshots
- Troubleshooting common issues
- Security best practices

**3. `CHANGELOG.md`**
```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-03

### Added
- Initial release of Agentic AI Dashboard
- 15 dashboard tabs for AI tool tracking
- AI-powered insights using Claude API
- Dark/light mode theming with next-themes
- Tiered environment configuration
- Full CI/CD pipeline with GitHub Actions and Vercel
- Comprehensive test suite (76 tests)
- Sample data from TechCo Inc (fictional company)

### Features
- Claude Enterprise tracking (chat, projects, integrations)
- Claude Code usage analytics
- M365 Copilot adoption metrics
- GitHub Copilot developer tracking
- Multi-tool sentiment analysis
- ROI calculations and expansion planning
- Interactive charts and visualizations
- Responsive design for all screen sizes

### Documentation
- Complete README with quick start guide
- Configuration guide for all tiers
- Data refresh process documentation
- CI/CD setup guide
- Architecture Decision Records (ADRs)
- Contributing guidelines
```

### Screenshot Requirements

**Create**: `docs/assets/dashboard-preview.png`
- Capture: Overview Home tab in dark mode
- Resolution: 1920x1080 or similar
- Show: Key metrics, charts, AI insights
- Professional screenshot for README

**Additional Screenshots** (optional):
- `docs/assets/light-mode-preview.png`
- `docs/assets/charts-preview.png`
- `docs/assets/mobile-preview.png`

## 8. Implementation Checklist

### Phase 1: Pre-Migration Setup (30 minutes)

- [ ] **Create New GitHub Repository**
  - Go to https://github.com/new
  - Repository name: `agentic-ai-dashboard`
  - Visibility: Public
  - Initialize: No (we'll push existing code)
  - License: MIT (will update from existing)

- [ ] **Generate New Anthropic API Key**
  - Go to https://console.anthropic.com/
  - Create new API key for this project
  - Copy key to secure location
  - Set usage limits if desired

- [ ] **Generate New Password Hash**
  ```bash
  npm run hash-password
  # Enter new password when prompted
  # Copy bcrypt hash
  ```

- [ ] **Create New Vercel Project**
  - Go to https://vercel.com/new
  - Project name: `agentic-ai-dashboard`
  - Framework: Next.js (auto-detected)
  - Do NOT link to GitHub yet (will do in Phase 7)

- [ ] **Get Vercel Credentials**
  - Get Vercel token: https://vercel.com/account/tokens
  - Get Org ID: Vercel Settings → General
  - Get Project ID: Project Settings → General

### Phase 2: Data Anonymization (2-3 hours)

- [ ] **Create Employee Mapping Generator**
  - Create `scripts/generate-employee-mapping.js`
  - Scan all data directories for email addresses
  - Generate fictional names (diverse, realistic)
  - Create mapping: real email → fictional email
  - Output to `scripts/employee-mapping.json`
  - Add `employee-mapping.json` to `.gitignore`

- [ ] **Create Anonymization Script**
  - Create `scripts/anonymize-all-data.js`
  - Read employee mapping file
  - Process all data directories:
    - `data/claude-enterprise/`
    - `data/claude-code/`
    - `data/m365-copilot/`
    - `data/github-copilot/`
    - `data/techco_org_chart.json`
    - `data/org-chart-snapshots/`
    - `data/ai-projects/`
  - Replace emails, names, company references
  - Validate data integrity

- [ ] **Run Anonymization**
  ```bash
  node scripts/generate-employee-mapping.js
  node scripts/anonymize-all-data.js
  ```

- [ ] **Rename Data Files**
  - `data/techco_org_chart.json` → `data/techco_org_chart.json`
  - `data/org-chart-snapshots/techco_*.json` → `techco_*.json`
  - `data/TechCo Inc_AI_Projects_2026.csv` → `TechCo_AI_Projects_2026.csv`

- [ ] **Update File References in Code**
  - Search for old filenames in all scripts
  - Update import paths to new filenames
  - Update documentation examples

- [ ] **Verify Data Integrity**
  - Spot-check metrics are unchanged
  - Verify department headcounts match
  - Check JSON structure is valid
  - Ensure no real names/emails remain

### Phase 3: Code Updates (2-3 hours)

- [ ] **Install Dependencies**
  ```bash
  npm install next-themes
  ```

- [ ] **Create Theme System**
  - Update `tailwind.config.js` with neutral color palette
  - Create `app/components/ThemeProvider.jsx`
  - Create `app/components/ThemeToggle.jsx`
  - Update `app/layout.jsx` to use ThemeProvider

- [ ] **Update Components for Dark Mode**
  - Replace hardcoded colors with CSS variable classes
  - Update all 15 tab components
  - Update shared components
  - Update layout components
  - Test each component in both modes

- [ ] **Create New Logo**
  - Design `public/assets/agentic-ai-dashboard-logo.svg`
  - Use existing AI icon as base
  - Create dark and light mode variants
  - Generate new `public/favicon.ico`

- [ ] **Update Branding**
  - Update `app/components/layout/DashboardHeader.jsx` - new logo
  - Update `app/layout.jsx` - metadata
  - Add `<ThemeToggle />` to header

- [ ] **Global Find/Replace**
  - Find: "TechCo Inc" → Replace: "TechCo Inc" (124 files)
  - Find: "techco" → Replace: "techco" (code/filenames)
  - Review each replacement for context

- [ ] **Update License & Package**
  - Update `LICENSE` - Keep MIT, change to "Luis F. Amadeo" (remove title)
  - Update `package.json`:
    - `name`: "agentic-ai-dashboard"
    - `author`: "Luis F. Amadeo <luis.amadeo@gmail.com>"
  - Update `package.json` description

### Phase 4: Environment & Configuration (1 hour)

- [ ] **Update .env.example**
  - Restructure with tiered configuration
  - Add clear section headers
  - Update all variable names (remove TechCo Inc references)
  - Add helpful comments for each tier
  - Include setup links

- [ ] **Update Configuration Files**
  - Update `vercel.json` - verify settings
  - Verify `.gitignore` includes `employee-mapping.json`

- [ ] **Update GitHub Workflows**
  - `.github/workflows/ci.yml`:
    - Update any hardcoded repo references
    - Verify test commands
  - `.github/workflows/ci-cd.yml`:
    - Update Vercel project name references
    - Update repo URLs
    - Verify environment variable usage

- [ ] **Update Scripts for Graceful Degradation**
  - `scripts/generate-insights.js` - Require ANTHROPIC_API_KEY
  - `scripts/parse-slack-sentiment.js` - Handle missing SLACK_BOT_TOKEN
  - Add helpful console warnings for missing optional vars

### Phase 5: Documentation (2 hours)

- [ ] **Rewrite README.md**
  - Use template from Section 7
  - Open-source dashboard template positioning
  - Include all badges (license, tests, deploy)
  - Add feature list
  - Add configuration tiers
  - Add quick start guide
  - Add roadmap section

- [ ] **Update CONTRIBUTING.md**
  - Update all repo URLs: `lamadeo/agentic-ai-dashboard`
  - Update contributor workflow
  - Keep coding guidelines

- [ ] **Update DEPLOYMENT.md**
  - Replace: `techco/as-ai-dashboard` → `lamadeo/agentic-ai-dashboard`
  - Update Vercel project name: `agentic-ai-dashboard`
  - Update production URL
  - Update all example commands
  - Update monitoring URLs

- [ ] **Update Guides**
  - `docs/guides/DATA_REFRESH.md` - TechCo Inc examples
  - `docs/guides/DATA_SOURCES_SETUP.md` - Generic company
  - `docs/guides/CLAUDE_SEATS_UPDATE_PROCESS.md` - TechCo Inc examples
  - `docs/guides/CI_CD_SETUP.md` - Update repo references
  - `docs/guides/CI_CD_VERCEL_SETUP.md` - Update all references

- [ ] **Update ADRs**
  - Add note at top of each: "Sample implementation for TechCo Inc"
  - Keep all architectural decisions as-is

- [ ] **Create New Documentation**
  - Create `docs/FUTURE_ROADMAP.md`
  - Create `docs/guides/CONFIGURATION.md`
  - Create `CHANGELOG.md` with v1.0.0

- [ ] **Take Screenshots**
  - `docs/assets/dashboard-preview.png` - Overview Home (dark mode)
  - Optional: light mode, charts, mobile previews

### Phase 6: Git Migration (30 minutes)

- [ ] **Merge Feature Branches Locally**
  ```bash
  git checkout main
  git merge docs/manual-data-preparation-workflows
  git merge origin/fix/rename-expansion-roi-claude-enterprise
  # Resolve any conflicts
  git status  # Verify clean state
  ```

- [ ] **Create Fresh History**
  ```bash
  # Create orphan branch (no history)
  git checkout --orphan fresh-start

  # Stage all files
  git add .

  # Create initial commit
  git commit -m "Initial commit: Agentic AI Dashboard v1.0.0

Open-source AI tool adoption and ROI tracking dashboard built with Next.js.
Includes sample data from TechCo Inc demonstrating multi-tool tracking across
Claude Enterprise, Claude Code, M365 Copilot, and GitHub Copilot.

Features:
- 15 dashboard tabs with AI-powered insights
- Real-time sentiment analysis
- ROI calculations and expansion planning
- Dark/light mode theming
- Fully responsive design

MIT License - Ready to deploy and customize for your organization."
  ```

- [ ] **Point to New Remote**
  ```bash
  # Remove old remote
  git remote remove origin

  # Add new remote
  git remote add origin https://github.com/lamadeo/agentic-ai-dashboard.git

  # Verify
  git remote -v
  ```

- [ ] **Push to New Repository**
  ```bash
  # Force push fresh history
  git push -u origin fresh-start:main --force
  ```

- [ ] **Verify on GitHub**
  - Go to https://github.com/lamadeo/agentic-ai-dashboard
  - Verify single commit in history
  - Verify all files present
  - Check README renders correctly

### Phase 7: Vercel & CI/CD Setup (1 hour)

- [ ] **Link Vercel Project to GitHub**
  - Go to Vercel project settings
  - Connect to GitHub repository: `lamadeo/agentic-ai-dashboard`
  - Import from: `main` branch
  - Disable automatic deployments (GitHub Actions will handle)

- [ ] **Configure GitHub Secrets**
  - Go to GitHub repo → Settings → Secrets and Variables → Actions
  - Add secrets:
    - `VERCEL_TOKEN` - From Vercel account tokens
    - `VERCEL_ORG_ID` - From Vercel project settings
    - `VERCEL_PROJECT_ID` - From Vercel project settings
    - `ANTHROPIC_API_KEY` - New key generated in Phase 1
    - `SLACK_BOT_TOKEN` - Optional (if Tier 2 configured)

- [ ] **Update Vercel Project Settings**
  - Environment Variables:
    - `ANTHROPIC_API_KEY` (from GitHub secret)
    - `SLACK_BOT_TOKEN` (optional)
    - `TEMP_PWD_HASH` (new password hash)
  - Build settings:
    - Framework: Next.js
    - Build command: `npm run build`
    - Output directory: `.next`

- [ ] **Test PR Preview Deployment**
  - Create test branch: `git checkout -b test/ci-cd`
  - Make small change (e.g., README typo fix)
  - Push: `git push origin test/ci-cd`
  - Create PR on GitHub
  - Verify:
    - Tests run and pass
    - Preview deployment succeeds
    - Preview URL is posted as comment
    - Can access preview site
  - Close PR without merging

- [ ] **Test Production Deployment**
  - Make small change on main (e.g., update README badge)
  - Push to main
  - Verify:
    - Tests run and pass
    - Production deployment succeeds
    - Production URL updates
    - Can access production site

- [ ] **Verify Live Dashboard**
  - Open production URL
  - Test all 15 tabs load
  - Test dark/light mode toggle
  - Test authentication (if configured)
  - Check AI insights render

### Phase 8: Final Verification (30 minutes)

- [ ] **Run Full Test Suite**
  ```bash
  npm test
  # Verify all 76 tests pass
  ```

- [ ] **Build Verification**
  ```bash
  npm run build
  # Verify no build errors
  ```

- [ ] **Manual Testing Checklist**
  - [ ] All 15 tabs render correctly
  - [ ] Dark mode works on all tabs
  - [ ] Light mode works on all tabs
  - [ ] Theme toggle persists preference
  - [ ] Charts render in both modes
  - [ ] AI insights display correctly
  - [ ] Authentication works (if configured)
  - [ ] No TechCo Inc references visible in UI
  - [ ] TechCo Inc data displays correctly
  - [ ] Mobile responsive (test on phone/tablet)

- [ ] **Review Production Site**
  - Visit https://agentic-ai-dashboard.vercel.app
  - Navigate through all tabs
  - Check for any errors in browser console
  - Verify all images/assets load
  - Test on different browsers (Chrome, Firefox, Safari)

- [ ] **Verify Documentation**
  - README renders correctly on GitHub
  - All links work (internal and external)
  - Screenshots display properly
  - Badges show correct status

- [ ] **Clean Up**
  - Delete test PR/branch if created
  - Archive old repository (optional)
  - Update personal notes/bookmarks with new repo URL

- [ ] **Announce & Share** (Optional)
  - Tweet about the release
  - Share on LinkedIn
  - Post in relevant communities
  - Add to portfolio/resume

---

## Total Estimated Time: 8-10 hours

### Time Breakdown by Phase
1. Pre-Migration Setup: 30 minutes
2. Data Anonymization: 2-3 hours
3. Code Updates: 2-3 hours
4. Environment & Configuration: 1 hour
5. Documentation: 2 hours
6. Git Migration: 30 minutes
7. Vercel & CI/CD Setup: 1 hour
8. Final Verification: 30 minutes

## Success Criteria

✅ New GitHub repository created with fresh history
✅ All TechCo Inc references replaced with TechCo Inc
✅ All employee data anonymized (no real names/emails)
✅ Dark/light mode working on all tabs
✅ New logo and branding applied
✅ Tiered environment configuration implemented
✅ CI/CD pipeline working (PR previews + production deploys)
✅ All 76 tests passing
✅ Live production site accessible and functional
✅ Documentation complete and accurate
✅ MIT license properly attributed

## Rollback Plan

If issues arise during migration:

1. **Before Phase 6 (Git Migration)**:
   - Simply `git checkout main` to return to original state
   - All changes are local, no remote impact

2. **After Phase 6 (Git Migration)**:
   - Keep old repository as backup
   - Can re-clone from `techco/as-ai-dashboard` if needed
   - Restart migration process with lessons learned

3. **Production Issues**:
   - Revert to previous Vercel deployment via Vercel dashboard
   - Fix issues locally
   - Redeploy when ready

## Notes & Considerations

- **Backup**: The original `techco/as-ai-dashboard` repository will remain as backup
- **API Keys**: Generate NEW Anthropic API key for this project (separate from TechCo Inc)
- **Data Integrity**: Anonymization scripts preserve all metrics and patterns
- **Testing**: Run tests frequently during migration to catch issues early
- **Documentation**: Update documentation as you go, not at the end
- **Screenshots**: Take screenshots after dark mode is working
- **Time Buffer**: Budget extra time for unexpected issues (10-12 hours total)

## Next Steps After Migration

1. Monitor GitHub Issues for bug reports
2. Set up GitHub Discussions for community Q&A
3. Create project board for tracking future improvements
4. Consider creating video walkthrough/demo
5. Write blog post about the project
6. Submit to relevant showcases (Vercel, Next.js, etc.)
7. Implement items from FUTURE_ROADMAP.md

---

**Design Status**: ✅ Approved - Ready for Implementation
**Start Date**: February 3, 2026
**Target Completion**: February 4-5, 2026
