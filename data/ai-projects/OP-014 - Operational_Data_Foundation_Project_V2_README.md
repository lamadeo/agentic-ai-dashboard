# Open Observability Vault

A universal, extensible platform for collecting, storing, and analyzing metrics from **ANY source** - AI tools, infrastructure, applications, cloud billing, business systems, and more - all in one centralized location.

## Overview

**One Vault, All Metrics**

Instead of maintaining separate systems for AI tracking, infrastructure monitoring, application metrics, and business analytics, the Observability Vault provides a single, unified platform where all metrics flow together, enabling:

1. **Universal Metric Collection**: Ingest data from ANY source (AI tools, Kubernetes, AWS, Prometheus, databases, APIs)
2. **Flexible Schema**: Store diverse metric types with unlimited tagging and context
3. **Cross-System Analysis**: Correlate metrics across different systems (AI usage → infrastructure costs → customer satisfaction)
4. **Unified Taxonomy**: Apply consistent categorization (COGS/OpEx/R&D) across all sources
5. **Pluggable Architecture**: Easy to add new data sources via collector plugins
6. **Powerful Querying**: Query across all systems with SQL, PromQL, or custom DSL

## Key Concepts

### Universal Metric Format

All metrics, regardless of source, are normalized into a universal format:
```json
{
  "timestamp": "2024-11-21T10:30:00Z",
  "source_system": "kubernetes|claude-code|aws|prometheus|...",
  "metric_type": "cpu_usage|ai_usage|daily_cost|api_request|...",
  "value": 75.5,
  "unit": "percent|tokens|usd|milliseconds|...",
  "tags": {
    "department": "Engineering",
    "project_id": "proj-123",
    "cost_category": "COGS",
    "environment": "production",
    "... unlimited custom tags"
  }
}
```

### Pluggable Collectors

Built-in collectors for common sources:
- **AI Tools**: Claude Code, ChatGPT, OpenAI API, Anthropic API
- **Infrastructure**: Kubernetes, Docker, Prometheus, Datadog
- **Cloud Costs**: AWS Cost Explorer, GCP Billing, Azure Cost Management
- **Applications**: API logs, application metrics, performance data
- **Business**: Stripe revenue, Mixpanel analytics, GitHub activity
- **Custom**: HTTP APIs, databases, log files

Easy to create new collectors using the collector framework.

### Cross-System Correlation

Link metrics from different systems to answer complex questions:
- "How does AI usage correlate with API performance?"
- "What's the total cost (AI + infrastructure + developer time) for Feature X?"
- "How do code commits correlate with infrastructure costs?"

### Unified Taxonomy

Apply consistent categorization across ALL metrics:
- **Cost Categories**: COGS, OpEx, R&D
- **Organizational**: Department, team, user
- **Project**: Project ID, lifecycle stage
- **Technical**: Environment, region, service

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Observability Vault                       │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Collectors (Pluggable Ingestion)            │    │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐     │    │
│  │  │  AI    │ │  K8s   │ │  AWS   │ │Prometheus│    │    │
│  │  │ Tools  │ │Cluster │ │ Costs  │ │ Metrics │    │    │
│  │  └────────┘ └────────┘ └────────┘ └────────┘     │    │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐     │    │
│  │  │ GitHub │ │ Stripe │ │Database│ │  HTTP  │     │    │
│  │  │Activity│ │Revenue │ │ Queries│ │  APIs  │     │    │
│  │  └────────┘ └────────┘ └────────┘ └────────┘     │    │
│  └────────────────────────────────────────────────────┘    │
│                           ↓                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │      Normalization & Enrichment Layer              │    │
│  │  • Universal format  • Tag enrichment              │    │
│  │  • Schema validation • Cost calculation            │    │
│  └────────────────────────────────────────────────────┘    │
│                           ↓                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │           Storage (The Vault)                       │    │
│  │  ┌──────────────┐  ┌──────────────┐               │    │
│  │  │ TimescaleDB  │  │  PostgreSQL  │               │    │
│  │  │ (Time-Series)│  │ (Relational) │               │    │
│  │  └──────────────┘  └──────────────┘               │    │
│  └────────────────────────────────────────────────────┘    │
│                           ↓                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │        Query & Analysis Engine                      │    │
│  │  • Cross-system queries  • Aggregations            │    │
│  │  • Correlation analysis  • Cost attribution        │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

- **Backend**: FastAPI (Python) - REST API and collector orchestration
- **Storage**: TimescaleDB (time-series metrics) + PostgreSQL (metadata/context)
- **Frontend**: React/Next.js with recharts for visualizations
- **Collectors**: Python SDK with built-in collectors for common sources
- **Deployment**: Docker + Kubernetes with horizontal scaling
- **Monitoring**: Self-monitoring with built-in health checks

## Quick Start

### 1. Database Setup

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Run migrations
psql -U postgres -d observability -f database/schema.sql
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://user:pass@localhost/observability"
export API_KEY="your-secret-key"

# Run server
uvicorn main:app --reload
```

### 3. Claude Code Hook Setup

```bash
# Configure environment
export OBSERVABILITY_API_URL="http://localhost:8000"
export OBSERVABILITY_API_KEY="your-api-key"
export USER_EMAIL="your.email@company.com"

# Make hook executable
chmod +x scripts/claude_code_hook.py

# Configure in Claude Code settings
# See docs/claude_code_integration.md for details
```

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Usage Examples

### Track Internal Usage

When an engineer uses Claude Code, the hook automatically:
1. Classifies the task (Feature Development, Bug Fix, etc.)
2. Tracks tokens and costs
3. Associates with user, department, and project
4. Stores in database for reporting

### Track Product Usage

When a customer calls your AI-powered API:
```python
from tracking import track_product_usage

@app.post("/api/classify-leave")
async def classify_leave(request: LeaveRequest):
    # Your AI logic
    result = await ai_model.classify(request.text)

    # Track usage
    await track_product_usage(
        customer_id=request.customer_id,
        feature_id="leave-classifier",
        tokens_input=len(request.text) // 4,
        tokens_output=len(result) // 4,
        cost_usd=0.045,
        success=True
    )

    return result
```

## Reporting Examples

### CFO Financial View

**Question**: "How much did AI cost us this quarter by category?"

```
AI Costs Q4 2024:
├── COGS: $25,000
│   ├── App Support: $8,000
│   ├── Bug Fixes: $7,000
│   └── Production Features: $10,000
├── OpEx: $15,000
│   ├── Customer Success: $8,000
│   └── Sales: $7,000
└── R&D: $10,000
    ├── Proof of Concepts: $6,000
    └── New Feature Development: $4,000

Total: $50,000
```

### Department Leader View

**Question**: "How is my Customer Success team using AI?"

```
Customer Success AI Usage - December 2024:

QBR Preparations:
- 50 sessions completed
- Cost: $60 total
- Time saved: ~100 hours
- ROI: 10x (would take 2x longer without AI)

Customer Support Tickets:
- 200 tickets resolved with AI assistance
- Cost: $180
- 40% faster resolution
- CSAT improvement: 4.2 → 4.7

Recommendation: 3 team members without AI access would benefit
```

### Engineering View

**Question**: "What did the Leave Classifier project cost?"

```
Leave Classifier - Complete Lifecycle:

R&D Phase (3 weeks):
- Engineer: John Doe
- AI Tools: $166 (Claude Code)
- Dev Time: $6,000
- Total R&D: $6,166

Development Phase (4 weeks):
- Engineers: John, Jane
- AI Tools: $450
- Dev Time: $12,000
- Total Development: $12,450

Production (3 months):
- Customer requests: 62,000
- AI Costs: $2,540
- Revenue attributed: $45,000
- Margin: $42,460 (94%)

Total Investment: $18,616
Payback Period: 2.1 months
Current ROI: 228%
```

## Key Features

### Automatic Classification
- Hook-based job classification
- Keyword detection from prompts
- File path analysis
- Manual override available

### Flexible Cost Attribution
- By department
- By project
- By customer
- By feature
- Custom PNL views

### Real-time Monitoring
- Production feature health
- Customer cost tracking
- SLA compliance
- Error rate monitoring

### Lifecycle Tracking
- R&D → Development → Production
- Sub-project rollups
- Investment to outcome mapping

## Documentation

- [System Design](SYSTEM_DESIGN.md) - Complete architecture overview
- [Dual-Purpose Architecture](DUAL_PURPOSE_ARCHITECTURE.md) - Internal + Product tracking
- [Database Schema](database/schema.sql) - Full data model
- [API Documentation](docs/api.md) - REST API reference
- [Claude Code Integration](docs/claude_code_integration.md) - Hook setup guide

## Success Metrics

The platform enables you to answer:

1. **Visibility**: "How much did AI cost us this quarter by category?"
2. **Attribution**: "This project used $X in AI costs across R&D and deployment"
3. **ROI**: "AI tools saved Y hours worth $Z, costing $X"
4. **Optimization**: "Team A gets 10x ROI from AI, Team B needs training"
5. **Forecasting**: "Based on trends, next quarter AI costs will be $X"

## Roadmap

- [ ] Phase 1: Core data model and manual tracking (Weeks 1-2)
- [ ] Phase 2: Claude Code integration and API middleware (Weeks 3-4)
- [ ] Phase 3: Auto-classification and advanced analytics (Weeks 5-6)
- [ ] Phase 4: CFO dashboards and ROI calculations (Weeks 7-8)
- [ ] Phase 5: Production observability and alerting (Weeks 9-10)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## License

MIT License - See [LICENSE](LICENSE) for details.
