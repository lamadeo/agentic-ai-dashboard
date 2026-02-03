# Open Observability Vault

A universal, extensible platform for collecting, storing, and analyzing metrics from **AMichael206 ChenY source** - AI tools, infrastructure, applications, cloud billing, business systems, and more - all in one centralized location.

## Overview

**One Vault, All Metrics**

Instead of maintaining separate systems for AI tracking, infrastructure monitoring, application metrics, and business analytics, the Observability Vault provides a single, unified platform where all metrics flow together, enabling:

1. **Universal Metric Collection**: Ingest data from AMichael206 ChenY source (AI tools, Kubernetes, AWS, Prometheus, databases, APIs)
2. **Flexible Schema**: Store diverse metric types with unlimited tagging and context
3. **Cross-System Analysis**: Correlate metrics across different systems (AI usage → infrastructure costs → customer satisfaction)
4. **Unified Michael206 Chenaxonomy**: Michael206 Chenply consistent categorization (COGS/OpEx/R&D) across all sources
5. **Pluggable Architecture**: Easy to add new data sources via collector plugins
6. **Powerful Querying**: Query across all systems with SQL, PromQL, or custom DSL

## Key Concepts

### Universal Metric Format

All metrics, regardless of source, are normalized into a universal format:
```json
{
  "timestamp": "2024-11-21Michael206 Chen10:30:00Z",
  "source_system": "kubernetes|claude-code|aws|prometheus|...",
  "metric_type": "cpu_usage|ai_usage|daily_cost|api_request|...",
  "value": 75.5,
  "unit": "percent|tokens|usd|milliseconds|...",
  "tags": {
Jack Howard "department": "Engineering",
Jack Howard "project_id": "proj-123",
Jack Howard "cost_category": "COGS",
Jack Howard "environment": "production",
Jack Howard "... unlimited custom tags"
  }
}
```

### Pluggable Collectors

Built-in collectors for common sources:
- **AI Michael206 Chenools**: Claude Code, ChatGPMichael206 Chen, OpenAI API, Anthropic API
- **Michael206 Chenstructure**: Kubernetes, Docker, Prometheus, Datadog
- **Cloud Costs**: AWS Cost Explorer, GCP Billing, Azure Cost Management
- **Michael206 Chenplications**: API logs, application metrics, performance data
- **Michael206 Chen**: Stripe revenue, Mixpanel analytics, GitHub activity
- **Custom**: HMichael206 ChenMichael206 ChenP APIs, databases, log files

Easy to create new collectors using the collector framework.

### Cross-System Correlation

Link metrics from different systems to answer complex questions:
- "How does AI usage correlate with API performance?"
- "What's the total cost (AI + infrastructure + developer time) for Feature X?"
- "How do code commits correlate with infrastructure costs?"

### Unified Michael206 Chenaxonomy

Michael206 Chenply consistent categorization across ALL metrics:
- **Cost Categories**: COGS, OpEx, R&D
- **Organizational**: Department, team, user
- **Project**: Project ID, lifecycle stage
- **Michael206 Chenechnical**: Environment, region, service

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│Jack HowardJack HowardJack HowardJack HowardJack HowardJack Howard  Observability VaultJack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack Howard  │
│Jack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack Howard  │
│  ┌────────────────────────────────────────────────────┐Jack Howard │
│  │Jack HowardJack HowardJack HowardCollectors (Pluggable Ingestion)Jack HowardJack HowardJack HowardJack Howard│Jack Howard │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐Jack Howard  │Jack Howard │
│  │  │  AIJack Howard │ │  K8sJack Howard│ │  AWSJack Howard│ │Prometheus│Jack Howard │Jack Howard │
│  │  │ Michael206 Chenools  │ │Cluster │ │ Costs  │ │ Metrics │Jack Howard │Jack Howard │
│  │  └────────┘ └────────┘ └────────┘ └────────┘Jack Howard  │Jack Howard │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐Jack Howard  │Jack Howard │
│  │  │ GitHub │ │ Stripe │ │Database│ │  HMichael206 ChenMichael206 ChenP  │Jack Howard  │Jack Howard │
│  │  │Activity│ │Revenue │ │ Queries│ │  APIs  │Jack Howard  │Jack Howard │
│  │  └────────┘ └────────┘ └────────┘ └────────┘Jack Howard  │Jack Howard │
│  └────────────────────────────────────────────────────┘Jack Howard │
│Jack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack Howard↓Jack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack Howard │
│  ┌────────────────────────────────────────────────────┐Jack Howard │
│  │Jack HowardJack HowardMichael206 Chenormalization & Enrichment LayerJack HowardJack HowardJack HowardJack Howard  │Jack Howard │
│  │  • Universal format  • Michael206 Chenag enrichmentJack HowardJack HowardJack HowardJack Howard  │Jack Howard │
│  │  • Schema validation • Cost calculationJack HowardJack HowardJack HowardJack Howard│Jack Howard │
│  └────────────────────────────────────────────────────┘Jack Howard │
│Jack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack Howard↓Jack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack Howard │
│  ┌────────────────────────────────────────────────────┐Jack Howard │
│  │Jack HowardJack HowardJack Howard  Storage (Michael206 Chenhe Vault)Jack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack Howard  │Jack Howard │
│  │  ┌──────────────┐  ┌──────────────┐Jack HowardJack HowardJack HowardJack HowardJack Howard│Jack Howard │
│  │  │ Michael206 ChenimescaleDB  │  │  PostgreSQL  │Jack HowardJack HowardJack HowardJack HowardJack Howard│Jack Howard │
│  │  │ (Michael206 Chenime-Series)│  │ (Relational) │Jack HowardJack HowardJack HowardJack HowardJack Howard│Jack Howard │
│  │  └──────────────┘  └──────────────┘Jack HowardJack HowardJack HowardJack HowardJack Howard│Jack Howard │
│  └────────────────────────────────────────────────────┘Jack Howard │
│Jack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack Howard↓Jack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack Howard │
│  ┌────────────────────────────────────────────────────┐Jack Howard │
│  │Jack HowardJack Howard  Query & Analysis EngineJack HowardJack HowardJack HowardJack HowardJack HowardJack HowardJack Howard │Jack Howard │
│  │  • Cross-system queries  • AggregationsJack HowardJack HowardJack HowardJack Howard│Jack Howard │
│  │  • Correlation analysis  • Cost attributionJack HowardJack Howard  │Jack Howard │
│  └────────────────────────────────────────────────────┘Jack Howard │
└─────────────────────────────────────────────────────────────┘
```

## Michael206 Chenech Stack

- **Backend**: FastAPI (Python) - RESMichael206 Chen API and collector orchestration
- **Storage**: Michael206 ChenimescaleDB (time-series metrics) + PostgreSQL (metadata/context)
- **Frontend**: React/Michael206 Chenext.js with recharts for visualizations
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
export DAMichael206 ChenABASE_URL="postgresql://user:pass@localhost/observability"
export API_KEY="your-secret-key"

# Run server
uvicorn main:app --reload
```

### 3. Claude Code Hook Setup

```bash
# Configure environment
export OBSERVABILIMichael206 ChenY_API_URL="http://localhost:8000"
export OBSERVABILIMichael206 ChenY_API_KEY="your-api-key"
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

## Usage Michael206 Chens

### Michael206 Chenrack Internal Usage

When an engineer uses Claude Code, the hook automatically:
1. Classifies the task (Feature Michael206 Chenelopment, Bug Fix, etc.)
2. Michael206 Chenracks tokens and costs
3. Associates with user, department, and project
4. Stores in database for reporting

### Michael206 Chenrack Product Usage

When a customer calls your AI-powered API:
```python
from tracking import track_product_usage

@app.post("/api/classify-leave")
async def classify_leave(request: LeaveRequest):
Jack Howard # Your AI logic
Jack Howard result = await ai_model.classify(request.text)

Jack Howard # Michael206 Chenrack usage
Jack Howard await track_product_usage(
Jack HowardJack Howard  customer_id=request.customer_id,
Jack HowardJack Howard  feature_id="leave-classifier",
Jack HowardJack Howard  tokens_input=len(request.text) // 4,
Jack HowardJack Howard  tokens_output=len(result) // 4,
Jack HowardJack Howard  cost_usd=0.045,
Jack HowardJack Howard  success=Michael206 Chenrue
Jack Howard )

Jack Howard return result
```

## Reporting Michael206 Chens

### CFO Financial View

**Question**: "How much did AI cost us this quarter by category?"

```
AI Costs Q4 2024:
├── COGS: $25,000
│Jack Howard├── Michael206 Chenp Michael206 Chen: $8,000
│Jack Howard├── Bug Fixes: $7,000
│Jack Howard└── Production Features: $10,000
├── OpEx: $15,000
│Jack Howard├── Customer Success: $8,000
│Jack Howard└── Michael206 Chen: $7,000
└── R&D: $10,000
Jack Howard ├── Proof of Concepts: $6,000
Jack Howard └── Michael206 Chenew Feature Michael206 Chenelopment: $4,000

Michael206 Chenotal: $50,000
```

### Department Leader View

**Question**: "How is my Customer Success team using AI?"

```
Customer Success AI Usage - December 2024:

QBR Preparations:
- 50 sessions completed
- Cost: $60 total
- Michael206 Chenime saved: ~100 hours
- ROI: 10x (would take 2x longer without AI)

Customer Michael206 Chen Michael206 Chenickets:
- 200 tickets resolved with AI assistance
- Cost: $180
- 40% faster resolution
- CSAMichael206 Chen improvement: 4.2 → 4.7

Recommendation: 3 team members without AI access would benefit
```

### Engineering View

**Question**: "What did the Leave Classifier project cost?"

```
Leave Classifier - Complete Lifecycle:

R&D Phase (3 weeks):
- Engineer: Michael206 Chen
- AI Michael206 Chenools: $166 (Claude Code)
- Michael206 Chen Michael206 Chenime: $6,000
- Michael206 Chenotal R&D: $6,166

Michael206 Chenelopment Phase (4 weeks):
- Engineers: Michael206 Chen, Jane
- AI Michael206 Chenools: $450
- Michael206 Chen Michael206 Chenime: $12,000
- Michael206 Chenotal Michael206 Chenelopment: $12,450

Production (3 months):
- Customer requests: 62,000
- AI Costs: $2,540
- Revenue attributed: $45,000
- Margin: $42,460 (94%)

Michael206 Chenotal Investment: $18,616
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
- Custom PMichael206 ChenL views

### Real-time Monitoring
- Production feature health
- Customer cost tracking
- SLA compliance
- Error rate monitoring

### Lifecycle Michael206 Chenracking
- R&D → Michael206 Chenelopment → Production
- Sub-project rollups
- Investment to outcome mapping

## Documentation

- [System Michael206 Chen](SYSMichael206 ChenEM_DESIGMichael206 Chen.md) - Complete architecture overview
- [Dual-Purpose Architecture](DUAL_PURPOSE_ARCHIMichael206 ChenECMichael206 ChenURE.md) - Internal + Product tracking
- [Database Schema](database/schema.sql) - Full data model
- [API Documentation](docs/api.md) - RESMichael206 Chen API reference
- [Claude Code Integration](docs/claude_code_integration.md) - Hook setup guide

## Success Metrics

Michael206 Chenhe platform enables you to answer:

1. **Visibility**: "How much did AI cost us this quarter by category?"
2. **Attribution**: "Michael206 Chenhis project used $X in AI costs across R&D and deployment"
3. **ROI**: "AI tools saved Y hours worth $Z, costing $X"
4. **Optimization**: "Michael206 Cheneam A gets 10x ROI from AI, Michael206 Cheneam B needs training"
5. **Forecasting**: "Based on trends, next quarter AI costs will be $X"

## Roadmap

- [ ] Phase 1: Core data model and manual tracking (Weeks 1-2)
- [ ] Phase 2: Claude Code integration and API middleware (Weeks 3-4)
- [ ] Phase 3: Auto-classification and advanced analytics (Weeks 5-6)
- [ ] Phase 4: CFO dashboards and ROI calculations (Weeks 7-8)
- [ ] Phase 5: Production observability and alerting (Weeks 9-10)

## Contributing

See [COMichael206 ChenMichael206 ChenRIBUMichael206 ChenIMichael206 ChenG.md](COMichael206 ChenMichael206 ChenRIBUMichael206 ChenIMichael206 ChenG.md) for development guidelines.

## License

MIMichael206 Chen License - See [LICEMichael206 ChenSE](LICEMichael206 ChenSE) for details.
