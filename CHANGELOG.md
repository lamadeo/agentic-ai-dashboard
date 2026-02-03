# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-03

### Added
- Initial release of Agentic AI Dashboard
- 15 comprehensive dashboard tabs for AI tool tracking and optimization
- AI-powered insights using Claude API (15-24 insights per data refresh)
- Dark/light mode theming with next-themes (dark mode default)
- Tiered environment configuration (Core → Enhanced → Full)
- Full CI/CD pipeline with GitHub Actions and Vercel
- Comprehensive test suite (76 tests) with Jest and React Testing Library
- Sample data from TechCo Inc (fictional company with 250+ users)
- Modular component architecture (15 tab components, layout system, shared components)

### Features

#### AI Tool Tracking
- **Claude Enterprise**: Usage trends, project tracking (182 projects), integrations analytics (14 connectors, 3,876 calls)
- **Claude Code**: Power user identification, engagement metrics, coding productivity analytics
- **M365 Copilot**: Adoption rates (95% adoption), active users (238), department breakdown
- **GitHub Copilot**: Developer tracking (46 engineers), IDE integration metrics

#### Analytics & Insights
- Multi-tool sentiment analysis with context-aware attribution
- ROI calculations and expansion planning
- Hybrid Premium seat allocation (behavioral + department baselines)
- Portfolio management with project sophistication scoring
- Interactive charts with Recharts (adoption trends, heatmaps, comparisons)

#### Dashboard Features
- Collapsible sidebar navigation with submenu support
- Breadcrumb navigation with detail views
- 2026 Annual Plan presentation (9 slides, dynamic)
- Phase 2 rollout tracker for Engineering department
- Email alias resolution (21+ mappings)
- Department mapping from org chart (16 departments, 258 employees)

#### Developer Experience
- Modular architecture: 15 tabs extracted, main page reduced 86% (6,248 → 836 lines)
- Component-based structure (`/app/components/` with layout, shared, and tab subdirectories)
- Architecture Decision Records (6 ADRs documenting all major decisions)
- Comprehensive documentation (guides, architecture docs, contributing guidelines)

### Technical Stack
- **Framework**: Next.js 14.2.35
- **Styling**: Tailwind CSS 3.4.1 with CSS variables for theming
- **Data Visualization**: Recharts 2.12.0
- **AI Integration**: Anthropic SDK 0.71.2
- **Theme Management**: next-themes 0.2.1
- **Icons**: Lucide React 0.263.1
- **Testing**: Jest 30.2.0, React Testing Library 16.3.1

### Data Pipeline
- Batch-processed data pipeline with automated refresh scripts
- Auto-discovery of data files by pattern (Claude Enterprise ZIPs, M365 CSVs, etc.)
- Extraction of Connectors/Integrations data from conversations.json via jq streaming
- Project data processing with sophistication scoring and categorization
- Unified `app/ai-tools-data.json` generation - all 15 tabs update automatically

### Authentication & Security
- Temporary password protection with bcrypt hashing
- Environment-based configuration with tiered access
- Git-ignored sensitive data files
- Graceful degradation for missing optional environment variables

### Documentation
- Comprehensive README with quick start guide
- Environment configuration guide with three tiers (Core/Enhanced/Full)
- Data refresh process documentation
- CI/CD deployment guide with GitHub Actions and Vercel
- Architecture Decision Records (ADRs) documenting all major decisions
- Contributing guidelines with development workflow
- Future roadmap with near/mid/long-term goals

### Sample Data
Includes fictional "TechCo Inc" dataset demonstrating:
- 250+ employees across 10 departments
- 115 Claude Enterprise licenses (41 Premium, 74 Standard)
- 238 M365 Copilot users (95% adoption rate)
- 46 GitHub Copilot developers
- 6 months of usage history (Sept 2025 - Jan 2026)

All employee names, emails, and company data anonymized for privacy.

### Known Limitations
- Dark mode CSS variables defined but not fully applied to all components (progressive enhancement planned)
- Batch data pipeline (near-real-time pipeline with official APIs planned for future release)
- Temporary password authentication (Vercel auth services planned for future release)
- No database persistence layer (PostgreSQL/Supabase planned for future release)

### Migration Notes
This is the first public release of the Agentic AI Dashboard as an open-source project:
- Migrated from private TechCo Inc internal dashboard
- All AbsenceSoft references genericized to TechCo Inc sample data
- Employee data anonymized (1,663 email addresses, 362K+ name replacements)
- Fresh git history created for clean open-source start
- MIT License applied

[1.0.0]: https://github.com/lamadeo/agentic-ai-dashboard/releases/tag/v1.0.0
