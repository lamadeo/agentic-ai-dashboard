# Agentic AI Dashboard

> Track AI tool adoption, measure ROI, and optimize your AI tool portfolio

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/lamadeo/agentic-ai-dashboard)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Live Demo**: [agentic-ai-dashboard.vercel.app](https://agentic-ai-dashboard.vercel.app) (TechCo Inc sample data)

## What is This?

An **open-source executive dashboard** for organizations using multiple AI tools. Track adoption, analyze sentiment, calculate ROI, and make data-driven decisions about your AI investments.

**Perfect for:**
- CIOs and CTOs optimizing AI tool spend
- Operations teams tracking AI adoption across departments
- Finance teams calculating AI ROI and justifying budgets
- Engineering leaders comparing coding assistants
- Product teams measuring AI tool effectiveness

**Sample Data**: Includes TechCo Inc dataset demonstrating 250+ users across 4 AI tools with 6 months of usage history.

## ✨ Features

- 📊 **15 Dashboard Tabs** - Overview, briefings, tool deep dives, comparisons, ROI planning, enablement, annual strategy
- 🤖 **AI-Powered Insights** - Claude analyzes your data and generates optimization recommendations automatically
- 💬 **Sentiment Analysis** - Track user feedback from Slack channels (optional Tier 2)
- 💰 **ROI Calculations** - Expansion planning, cost optimization, value tracking, and budget forecasting
- 📈 **Interactive Charts** - Adoption trends, department heatmaps, comparison visualizations, project tracking
- 🌓 **Dark/Light Mode** - Modern, responsive design with theme toggle (dark mode default)
- 🏗️ **Modular Architecture** - Clean component structure, easy to customize and extend
- 🔒 **Secure** - Environment-based configuration, authentication ready
- 🚀 **Production Ready** - Full CI/CD pipeline with automated testing (76 tests)
- 📦 **Easy Setup** - Three-tier configuration (Core → Enhanced → Full)

## 🎯 Supported AI Tools

- **Claude Enterprise** - Chat, projects, artifacts, integrations tracking (14 MCP connectors, 182 projects)
- **Claude Code** - Terminal-based coding assistant usage analytics
- **M365 Copilot** - Word, Excel, Teams, PowerPoint integration metrics
- **GitHub Copilot** - IDE-integrated coding assistant tracking
- **ChatGPT** - Shadow IT tracking via ZScaler (roadmap)

## 🚀 Quick Start

### Option 1: Deploy to Vercel (Recommended)

1. Click the "Deploy with Vercel" button above
2. Connect your GitHub account
3. Add environment variable: `ANTHROPIC_API_KEY` (get from [console.anthropic.com](https://console.anthropic.com/))
4. Deploy!

Your dashboard will be live in ~2 minutes.

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

See [.env.example](.env.example) for full configuration options.

## 📊 Dashboard Tabs

1. **Overview Home** - Executive summary with key metrics and AI recommendations
2. **Claude Enterprise** - Usage trends, projects, integrations tracking
3. **Claude Code** - Power users, engagement levels, coding productivity metrics
4. **M365 Copilot** - Adoption rates, active users, department breakdown
5. **Productivity Tools Comparison** - Claude Enterprise vs M365 Copilot analysis
6. **Coding Tools Comparison** - Claude Code vs GitHub Copilot comparison
7. **Claude Enterprise Expansion ROI** - Cost optimization and expansion planning
8. **Perceived Value** - Sentiment analysis and user feedback tracking
9. **Portfolio** - AI projects and initiatives tracking with detail views
10. **Integrations** - MCP connector usage and analytics (14 integrations, 3,876 calls)
11. **Projects** - Claude project sophistication scoring (182 projects, 46 creators)
12. **Briefing (Org)** - Organization-wide AI adoption overview
13. **Briefing (Leadership)** - Executive-level insights and recommendations
14. **Enablement** - Training metrics and onboarding tracking
15. **Annual Plan** - 2026 AI strategy presentation (9 slides, dynamic)

## 🔄 Data Refresh

The dashboard uses a batch data pipeline. To refresh with latest data:

```bash
npm run refresh
```

This will:
1. Parse organizational hierarchy from `/data/techco_org_chart.json`
2. Process usage data from all AI tools
3. Generate AI-powered insights using Claude API
4. Update dashboard JSON files

**Future**: Real-time data pipeline using official APIs (see [FUTURE_ROADMAP.md](docs/FUTURE_ROADMAP.md))

## 🧪 Testing

```bash
# Run all tests (76 tests)
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Build production bundle
npm run build
```

## 📖 Documentation

- **[Configuration Guide](.env.example)** - Environment setup (inline comments)
- **[Data Refresh Guide](docs/guides/DATA_REFRESH.md)** - Updating dashboard data
- **[Deployment Guide](DEPLOYMENT.md)** - CI/CD and production deployment
- **[Architecture Decision Records](docs/architecture/)** - Technical decisions (6 ADRs)
- **[Future Roadmap](docs/FUTURE_ROADMAP.md)** - Planned improvements
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute

## 🛣️ Roadmap

### Near-term
- [ ] Vercel authentication services (replace temporary password)
- [ ] Database persistence layer (PostgreSQL/Supabase)
- [ ] Full dark mode support for all components

### Mid-term
- [ ] Near-real-time data pipeline with official APIs:
  - Claude Enterprise API
  - Claude Code Compliance API
  - M365 Copilot API
  - GitHub Copilot API
- [ ] ZScaler integration for shadow IT tracking
- [ ] Customizable dashboard layouts

### Long-term
- [ ] Multi-tenant support
- [ ] Mobile app (React Native)
- [ ] Advanced analytics (ML-powered predictions)

See [FUTURE_ROADMAP.md](docs/FUTURE_ROADMAP.md) for complete roadmap.

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Development Workflow:**
1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit (`git commit -m 'feat: Add amazing feature'`)
6. Push to your fork (`git push origin feat/amazing-feature`)
7. Open a Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

## 💡 Sample Data

This repository includes sample data from a fictional company "TechCo Inc" with:
- 250+ employees across 10 departments
- 115 Claude Enterprise licenses (41 Premium, 74 Standard)
- 238 M365 Copilot users (95% adoption rate)
- 46 GitHub Copilot developers
- 6 months of usage history (Sept 2025 - Jan 2026)

All employee names and data are fictional. Metrics and patterns are representative of real-world enterprise AI tool usage.

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Recharts](https://recharts.org/) - Data visualization
- [Anthropic Claude API](https://www.anthropic.com/) - AI insights generation
- [next-themes](https://github.com/pacocoursey/next-themes) - Theme switching
- [Lucide React](https://lucide.dev/) - Icon library

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/lamadeo/agentic-ai-dashboard/issues)
- **Discussions**: [GitHub Discussions](https://github.com/lamadeo/agentic-ai-dashboard/discussions)
- **Email**: luis.amadeo@gmail.com

---

**Star this repo** ⭐ if you find it useful! Help others discover this open-source AI analytics dashboard.


<!-- CI/CD Pipeline Test - 2026-02-03 15:50:49 -->


<!-- Trigger preview with Vercel env vars configured -->


<!-- Redeploy with Vercel auth disabled -->
