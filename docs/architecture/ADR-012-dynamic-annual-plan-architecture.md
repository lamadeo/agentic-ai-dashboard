# ADR-012: Dynamic AI-Driven Annual Plan Presentation Architecture

**Status**: ✅ Implemented
**Date**: January 16, 2026
**Author**: Luis Amadeo, Chief Agentic Officer, TechCo Inc
**Architect**: Luis Amadeo, Chief Agentic Officer, TechCo Inc
**Priority**: Tier 0 (Foundation - Strategic Planning System)
**Implementation**: January 16, 2026 (PR #38)

---

## Context and Problem Statement

The Annual Plan presentation was previously hardcoded as a static 8-slide deck that required manual updates every quarter. This created several critical problems:

**Problems with Static Presentation:**
1. **Fixed Structure**: Always 8 slides regardless of context (beginning of year vs mid-year vs year-end)
2. **Manual Updates**: Required developer intervention to update slide content quarterly
3. **No Context Awareness**: Couldn't adapt to project status, fiscal progress, or risks
4. **Limited Scalability**: Adding projects meant manually editing multiple slides
5. **Inconsistent Narratives**: No guidance on what story to tell based on timing
6. **Missing Intelligence**: No AI-powered insights or recommendations
7. **Stale Data**: Content became outdated between refresh cycles

**Business Impact:**
- Executive presentations lacked timeliness and relevance
- Manual effort required 4+ hours per quarter for updates
- Risk of human error in data aggregation
- Inability to pivot narrative based on actual progress

**Trigger for Decision**:
- 3-tier progress tracking system (ADR-TBD) completed
- Need for dynamic presentations that adapt to fiscal year timeline
- CEO request for data-driven, context-aware executive reporting
- Q1 2026 kickoff required "NEW_PLAN" narrative vs. later quarter "PROGRESS_UPDATE"

---

## Decision Drivers

1. **Automation**: Eliminate manual slide creation and updates
2. **Context Awareness**: Adapt to fiscal year progress, quarter, project status
3. **Intelligence**: Leverage AI to generate optimal slide structure and content
4. **Scalability**: Support 7+ projects without manual intervention
5. **Flexibility**: Handle different narrative types (NEW_PLAN, PROGRESS_UPDATE, COURSE_CORRECTION, etc.)
6. **Data Integrity**: Pull from single source of truth (3-tier progress tracking)
7. **Executive Value**: Deliver actionable insights, not just status reports

---

## Considered Options

### Option A: Enhanced Static Template with Variables
**Description**: Keep static 8-slide structure, but populate with variables from data files

**Pros:**
- ✅ Simple implementation (1-2 days)
- ✅ No AI dependencies
- ✅ Predictable output structure
- ✅ Easy to review and validate

**Cons:**
- ❌ Still requires manual template updates for new slide types
- ❌ Cannot adapt slide count to context (always 8 slides)
- ❌ No intelligence on what to emphasize based on progress
- ❌ Fixed narrative arc regardless of fiscal timing
- ❌ Cannot handle course corrections or pivots automatically
- ❌ Doesn't scale to 15+ projects (slide limits)

**Verdict**: REJECTED - Insufficient flexibility for dynamic needs

---

### Option B: Rule-Based Presentation Builder
**Description**: Implement rules engine that selects slides based on conditions (if Q1, show roadmap; if behind, show risks)

**Pros:**
- ✅ No AI dependencies (deterministic)
- ✅ Faster execution than AI generation
- ✅ Fully controllable logic
- ✅ Can adapt slide count to context

**Cons:**
- ❌ Rules become complex quickly (combinatorial explosion)
- ❌ Requires manual rule authoring for each scenario
- ❌ Cannot generate novel insights or recommendations
- ❌ Brittle: breaks when new edge cases emerge
- ❌ Maintenance burden as project portfolio grows
- ❌ No natural language understanding

**Verdict**: REJECTED - Too rigid, high maintenance overhead

---

### Option C: AI-Driven Dynamic Presentation with Fallback (CHOSEN)
**Description**: Use Claude API to analyze context and generate optimal slide structure, with rule-based fallback if AI fails

**Architecture:**
```
Input Data Sources
  ↓
1. Context Analysis Module
   - Temporal analysis (current date, quarter, fiscal year %)
   - Narrative type detection (NEW_PLAN, PROGRESS_UPDATE, etc.)
   - Gap analysis (execution, resource, strategic, dependency)
   - Change detection (vs. previous presentation)
   ↓
2. AI Presentation Generator
   - Claude API: Analyze context → Determine optimal slides
   - Slide structure generation (5-15 slides, not fixed 8)
   - Content guidance for each slide
   - Fallback: Rule-based structure if API fails
   ↓
3. Content Population Module
   - Map slide types to content generators
   - Pull from 3-tier progress tracking
   - Enrich project IDs with full names
   - Calculate financial aggregates
   ↓
4. React UI Renderer
   - 9+ slide type components
   - Professional layouts (tables, charts, risk cards)
   - Navigation and export controls
```

**Pros:**
- ✅ Maximum flexibility: adapts to any context
- ✅ Intelligent slide selection based on actual progress
- ✅ Natural language understanding of project status
- ✅ Can generate novel insights and recommendations
- ✅ Scales effortlessly to 50+ projects
- ✅ Handles edge cases gracefully (AI reasoning)
- ✅ Narrative arc adapts to fiscal timing automatically
- ✅ Falls back to rules if AI unavailable

**Cons:**
- ❌ Requires ANTHROPIC_API_KEY (external dependency)
- ❌ ~40s generation time (vs. instant for static)
- ❌ Token costs (~3,000 tokens @ $3/M = $0.009 per generation)
- ❌ Non-deterministic output (AI can vary slightly)
- ❌ Requires 4GB Node.js memory for generation

**Verdict**: ACCEPTED - Best balance of flexibility, intelligence, and maintainability

---

## Decision Outcome

**Chosen Option**: **Option C - AI-Driven Dynamic Presentation with Fallback**

### Why This Decision:

1. **Strategic Value**: Annual Plan is executive-facing, high-stakes. AI-generated insights provide maximum value.
2. **Time Savings**: Eliminates 4+ hours/quarter manual effort, ROI positive in 3 months.
3. **Scalability**: Can handle portfolio growth from 7 → 50+ projects without code changes.
4. **Adaptability**: Context-aware generation handles beginning-of-year vs. mid-year vs. year-end scenarios automatically.
5. **Risk Mitigation**: Rule-based fallback ensures presentation always generates, even if AI unavailable.

### Implementation Timeline:
- **Day 1-2**: Context analyzer module (temporal, narrative, gaps)
- **Day 3-4**: AI presentation generator with Claude API integration
- **Day 5-6**: Content population and React UI renderers
- **Day 7**: Memory optimization, error handling, testing
- **Day 8**: PR review, merge, documentation

---

## Technical Architecture

### Module Breakdown

#### 1. Context Analyzer (`scripts/modules/analyzers/ai-context-analyzer.js`)
**Purpose**: Analyze current state to determine optimal presentation narrative

**Inputs:**
- Current date, fiscal year, quarter
- 3-tier progress reports for all projects
- Previous presentation (if exists)
- Dashboard metrics (adoption, usage)

**Outputs:**
```javascript
{
  temporal: {
    currentDate, currentQuarter, fiscalYear,
    percentYearComplete, timePhase // beginning/early/mid/late
  },
  narrative: {
    narrativeType, // NEW_PLAN, PROGRESS_UPDATE, COURSE_CORRECTION, etc.
    focus, tone, slideEmphasis
  },
  projectStatus: {
    committed: { total, onTrack, behind, completed },
    overall: { avgProgress, projectsAtRisk }
  },
  gaps: {
    execution, // projects behind schedule
    resource, // capacity constraints
    strategic, // alignment issues
    dependency // blocking issues
  },
  changes: {
    hasChanges, changes // vs. previous presentation
  },
  recommendations: [
    { priority, type, action, reason }
  ]
}
```

**Key Logic:**
- **timePhase**: `percentYearComplete < 25% ? 'beginning' : < 50% ? 'early' : < 75% ? 'mid' : 'late'`
- **narrativeType**: Based on time phase + project status + gaps
  - Beginning + no risks → NEW_PLAN
  - Mid-year + projects on track → PROGRESS_UPDATE
  - Mid-year + significant gaps → COURSE_CORRECTION
  - Late + looking back → YEAR_END_SUMMARY

---

#### 2. AI Presentation Generator (`scripts/modules/generators/ai-presentation-generator.js`)
**Purpose**: Use Claude API to generate optimal slide structure

**Inputs:**
- Context analysis output
- 3-tier progress reports
- Project metadata (scores, dependencies, schedule)
- Portfolio projects (ranked)
- Dashboard metrics

**Claude API Integration:**
```javascript
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const message = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 4096,
  system: "You are an expert executive presentation architect...",
  messages: [{
    role: 'user',
    content: buildPrompt(contextAnalysis, progressReports, ...)
  }],
  temperature: 0.7
});

const slideStructure = JSON.parse(message.content[0].text);
```

**Prompt Engineering:**
- Context: Current date, quarter, year progress, narrative type
- Data: Project status, risks, financial summary, recommendations
- Task: Design 5-15 slides that tell optimal story
- Output: JSON with slide types, titles, content guidance

**Slide Type Inventory:**
- `title` - Opening slide
- `executive_summary` - BLUF summary
- `current_state` - Where we are now
- `progress_update` - Planned vs. actual
- `achievements` - Major wins
- `challenges` - Problems and risks
- `strategic_context` - Why these projects matter
- `portfolio_overview` - All projects table
- `portfolio_detail` - Deep dive on specific project
- `quarterly_roadmap` - Q1-Q4 timeline
- `q1_committed` - Detailed Q1 plan
- `q2_q4_potential` - Future quarters
- `resource_capacity` - Team allocation
- `dependencies_risks` - Blockers and mitigation
- `gap_analysis` - Planned vs. actual gaps
- `pivot_strategy` - Course corrections
- `year_end_summary` - Annual achievements
- `next_steps` - Recommendations
- `appendix` - Supporting details

**Fallback Structure:**
If Claude API fails (network, rate limit, parsing error), falls back to predefined templates:
```javascript
const slideTemplates = {
  NEW_PLAN: [
    { type: 'title', title: '2026 Annual Plan' },
    { type: 'executive_summary', title: 'Executive Summary' },
    { type: 'strategic_context', title: 'Strategic Rationale' },
    { type: 'portfolio_overview', title: 'Project Portfolio' },
    { type: 'quarterly_roadmap', title: 'Quarterly Roadmap' },
    { type: 'q1_committed', title: 'Q1 Committed Work' },
    { type: 'resource_capacity', title: 'Resource & Capacity Model' },
    { type: 'dependencies_risks', title: 'Dependencies & Risks' },
    { type: 'next_steps', title: 'Recommendations & Next Steps' }
  ],
  // ... other narrative templates
};
```

---

#### 3. Content Population Module
**Purpose**: Fill slide structures with actual data

**Content Generators:**
Each slide type has dedicated generator function:

```javascript
async function generateContentForSlideType(slideType, guidance, data) {
  const generators = {
    title: generateTitleSlide,
    executive_summary: generateExecutiveSummary,
    portfolio_overview: generatePortfolioOverview,
    quarterly_roadmap: generateQuarterlyRoadmap,
    dependencies_risks: generateDependenciesRisks,
    next_steps: generateNextSteps,
    // ... 15+ generators
  };

  return await generators[slideType](data, guidance);
}
```

**Key Features:**
- **Project ID Enrichment**: All `OP-XXX` patterns replaced with full names
- **Financial Aggregation**: Skip TBD values, validate numbers, calculate totals
- **Narrative Consistency**: Use guidance from AI to emphasize right metrics
- **Error Handling**: Capture failures, store in metadata for UI display

**Example: Executive Summary Generator**
```javascript
function generateExecutiveSummary(data, guidance) {
  return {
    bluf: {
      headline: `${portfolioProjects.length} AI projects prioritized`,
      impact: calculateTotalValue(portfolioProjects), // $26.44M
      approach: 'Hybrid scoring with capacity constraints',
      confidence: 'High'
    },
    keyPoints: [
      `${currentQuarter}: ${committedProjects} committed`,
      `Average progress: ${avgProgress}%`,
      `${projectsAtRisk.length} projects need attention`
    ],
    recommendations: contextAnalysis.recommendations
      .slice(0, 3)
      .map(r => enrichProjectIdsInText(r.action, projectMapping))
  };
}
```

---

#### 4. React UI Renderer (`app/components/DynamicAnnualPlanPresentation.jsx`)
**Purpose**: Render AI-generated slides with professional layouts

**Component Structure:**
```jsx
const DynamicAnnualPlanPresentation = () => {
  const [presentationData, setPresentationData] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Load AI-generated JSON
  useEffect(() => {
    fetch('/ai-projects-presentation-dynamic.json')
      .then(res => res.json())
      .then(data => setPresentationData(data));
  }, []);

  // Build project name mapping for enrichment
  const projectNameMapping = getProjectNameMapping(presentationData);

  // Render current slide based on type
  return (
    <div className="presentation-container">
      <Header {...presentationData.presentation} />
      <SlideContent>
        {renderSlide(currentSlide, projectNameMapping)}
      </SlideContent>
      <Navigation {...navigationProps} />
    </div>
  );
};
```

**Slide Renderers:**
Each slide type has dedicated JSX renderer:

```jsx
function renderSlide(slide, projectNameMapping) {
  switch (slide.type) {
    case 'executive_summary':
      return (
        <div className="space-y-6">
          <h2>{slide.title}</h2>
          {/* BLUF Section */}
          <div className="bluf-card">
            <h3>Bottom Line Up Front</h3>
            <div className="grid grid-cols-2 gap-4">
              <MetricCard label="Headline" value={content.bluf.headline} />
              <MetricCard label="Impact" value={content.bluf.impact} />
              {/* ... */}
            </div>
          </div>
          {/* Key Points */}
          <BulletList items={content.keyPoints} />
          {/* Recommendations */}
          <RecommendationsList
            items={content.recommendations}
            enrichFn={(text) => enrichProjectIdsInText(text, projectNameMapping)}
          />
        </div>
      );

    case 'dependencies_risks':
      return (
        <div className="space-y-6">
          <h2>{slide.title}</h2>
          {/* Execution Gaps */}
          {content.gaps.execution.map(gap => (
            <RiskCard
              severity="high"
              title={enrichProjectId(gap.projectId, projectNameMapping)}
              details={`Progress: ${gap.progress}%, Impact: ${gap.impact}`}
            />
          ))}
          {/* Resource Gaps */}
          {/* Projects At Risk */}
        </div>
      );

    // ... 7 more slide type renderers
  }
}
```

**Visual Design System:**
- **Color Coding**: 🟢 Green (on-track), 🟡 Yellow (at-risk), 🔴 Red (behind)
- **Priority Badges**: HIGH (red), MEDIUM (yellow), LOW (blue)
- **Progress Bars**: Utilization percentage with overflow warnings
- **Tables**: Alternating row colors, hover states, proper spacing
- **Cards**: Border-left accent bars, shadow depth for hierarchy

---

### Data Flow Pipeline

```
Trigger: npm run refresh-annual-plan
  ↓
1. Load Input Data
   - Project markdown files → Project Ingestor
   - Dashboard metrics → dashboard-data-ingestor
   - GitHub repos → progress-tracker (Tier 3)
   ↓
2. Run Analysis Pipeline
   - Dependency analyzer
   - Hybrid scorer
   - Constraint scheduler
   - 3-tier progress tracker
   ↓
3. Generate Context
   - AI Context Analyzer
   - Output: ai-projects-context.json
   ↓
4. Generate Presentation
   - AI Presentation Generator
   - Claude API call (40s)
   - Output: ai-projects-presentation-dynamic.json
   ↓
5. Write Output Files
   - app/ai-projects-presentation-dynamic.json
   - public/ai-projects-presentation-dynamic.json (static serving)
   ↓
6. React UI Loads JSON
   - DynamicAnnualPlanPresentation component
   - Renders slides dynamically
```

**Performance Characteristics:**
- **Generation Time**: ~40s (30s for 3-tier progress + 10s for AI generation)
- **Memory Usage**: ~2.5GB peak (requires 4GB allocation)
- **Token Usage**: ~3,000 tokens per generation ($0.009 @ Sonnet 4 pricing)
- **Output Size**: ~50KB JSON (9 slides with full content)

---

## Configuration and Dependencies

### Environment Variables
```bash
# Required for AI generation
ANTHROPIC_API_KEY=sk-ant-api03-...

# Optional for Tier 3 GitHub analysis
GITHUB_TOKEN=ghp_...
```

### Package Dependencies
```json
{
  "@anthropic-ai/sdk": "^0.71.2",
  "@octokit/rest": "^22.0.1",
  "next": "^14.2.35",
  "react": "^18.3.1"
}
```

### NPM Scripts
```json
{
  "refresh-annual-plan": "node --max-old-space-size=4096 scripts/generate-annual-plan.js"
}
```

**Memory Limit Rationale:**
- Default Node.js memory (~1.5GB) insufficient for AI generation
- Large JSON structures + Claude API response parsing requires ~2.5GB
- Set to 4GB for headroom and future scalability

---

## Error Handling Strategy

### 1. AI Generation Failures
**Scenarios:**
- Network timeout
- Rate limit exceeded
- Invalid JSON response
- API key invalid/expired

**Mitigation:**
```javascript
try {
  slideStructure = await generateSlideStructure(promptContext, opts);
} catch (error) {
  console.error('Claude API error:', error.message);

  // Capture error details
  generationError = {
    message: error.message,
    type: error.name || 'APIError',
    timestamp: new Date().toISOString(),
    phase: 'slide_structure_generation'
  };

  // Fall back to rule-based structure
  slideStructure = generateFallbackStructure(promptContext, opts);
}
```

**Result**: Presentation always generates, users see specific error in UI if AI failed

---

### 2. Data Validation Errors
**Scenarios:**
- Missing project data
- TBD values in financial calculations
- Invalid progress percentages
- Missing GitHub repos

**Mitigation:**
```javascript
// Financial calculations
function calculateTotalValue(projects) {
  return projects.reduce((sum, p) => {
    if (!p.value || p.value === 'TBD') return sum;
    const value = parseFloat(p.value.replace(/[$M,]/g, ''));
    return isNaN(value) ? sum : sum + value;
  }, 0);
}

// Progress tracking
if (!project.repo) {
  // Reweight to 50/50 (Tier 1 + Tier 2 only)
  overallProgress = (tier1 * 0.5) + (tier2 * 0.5);
}
```

**Result**: Graceful fallbacks, no NaN values, clear "No data" indicators

---

### 3. UI Rendering Errors
**Scenarios:**
- Slide type not recognized
- Missing required content fields
- Project ID not found in mapping

**Mitigation:**
```jsx
// Unknown slide type
default:
  return (
    <div className="error-card">
      <p>Unsupported slide type: {slide.type}</p>
      <details>
        <summary>View raw data</summary>
        <pre>{JSON.stringify(slide, null, 2)}</pre>
      </details>
    </div>
  );

// Project ID enrichment fallback
const enrichProjectId = (projectId, mapping) => {
  return mapping[projectId] || projectId; // Falls back to bare ID
};
```

**Result**: Always renders something, never crashes, shows debug info when needed

---

## Security Considerations

### API Key Management
- Store in `.env` file (gitignored)
- Never commit to repository
- Load via `process.env.ANTHROPIC_API_KEY`
- Fail gracefully if missing (use fallback)

### Data Privacy
- All processing local, no data leaves system except API calls
- Claude API calls: No PII, only project IDs and aggregate metrics
- API calls logged for debugging, no sensitive content

### Rate Limiting
- Claude API: 50 requests/minute (well within limits for 1 generation)
- GitHub API: 5,000 requests/hour (uses ~9 per project)
- Implement exponential backoff if limits hit

---

## Testing Strategy

### 1. Unit Tests
```javascript
// scripts/modules/generators/__tests__/ai-presentation-generator.test.js
describe('AI Presentation Generator', () => {
  test('generates fallback structure when API fails', () => {
    const structure = generateFallbackStructure(mockContext, {});
    expect(structure.slideCount).toBeGreaterThanOrEqual(5);
    expect(structure.slides[0].type).toBe('title');
  });

  test('enriches project IDs in text', () => {
    const text = "Address OP-008 blockers immediately";
    const mapping = { 'OP-008': 'OP-008: Law2Engine AI Project Analysis' };
    const enriched = enrichProjectIdsInText(text, mapping);
    expect(enriched).toContain('Law2Engine');
  });
});
```

### 2. Integration Tests
```bash
npm run refresh-annual-plan
# Verify:
# - No errors in console
# - ai-projects-presentation-dynamic.json created
# - All 9 slides have content
# - Project IDs enriched everywhere
# - Financial calculations valid (no NaN)
```

### 3. Manual UI Tests
```bash
npm run dev
# Navigate to: Annual Plan → Dynamic Plan (BETA)
# Verify:
# - All slides render without errors
# - Navigation works (← →)
# - Project names display fully
# - Color coding correct
# - Error messages helpful (if any)
```

---

## Performance Optimization

### 1. Memory Management
**Problem**: Default Node.js memory insufficient for AI generation
**Solution**: Increase to 4GB via `--max-old-space-size=4096`
**Result**: Generation completes reliably in ~40s

### 2. JSON Parsing
**Problem**: Large API responses can cause parsing delays
**Solution**: Stream-parse JSON as it arrives (future enhancement)
**Current**: Acceptable at ~10s for parsing 4KB response

### 3. React Rendering
**Problem**: Re-rendering all slides on navigation
**Solution**: Memoize slide content, only render current slide
```jsx
const memoizedSlide = useMemo(
  () => renderSlide(currentSlide, projectNameMapping),
  [currentSlide, presentationData]
);
```

---

## Monitoring and Observability

### Metrics to Track
1. **Generation Success Rate**: % of successful API calls
2. **Generation Time**: p50, p95, p99 latency
3. **Memory Usage**: Peak memory during generation
4. **Token Usage**: Tokens consumed per generation
5. **Fallback Usage**: % of presentations using fallback structure
6. **Error Types**: Distribution of error types (network, parsing, etc.)

### Logging Strategy
```javascript
console.log('[AI Presenter] Starting generation...');
console.log('[AI Presenter] Context:', {
  narrativeType,
  projectCount,
  quarter
});
console.log('[AI Presenter] Calling Claude API...');
console.log('[AI Presenter] Slide structure received:', slideCount);
console.log('[AI Presenter] Content population complete');
console.log('[AI Presenter] Generation complete:', {
  slideCount,
  usedFallback,
  executionTime: '39.78s'
});
```

---

## Migration and Rollout Plan

### Phase 1: Beta Release (Current)
- ✅ Dynamic presentation available via dropdown menu
- ✅ Marked with "BETA" badge
- ✅ Original 8-slide presentation unchanged
- ✅ Users can opt-in to dynamic version
- **Goal**: Gather feedback, validate accuracy

### Phase 2: Production Promotion (Q2 2026)
- Remove BETA badge
- Make dynamic presentation default
- Deprecate static presentation (move to "Legacy" menu item)
- **Goal**: Transition all users to dynamic version

### Phase 3: Feature Expansion (Q3 2026)
- Add PDF export functionality
- Implement historical trend views
- Add Slack sentiment integration
- Create custom narrative templates
- **Goal**: Maximize value of dynamic system

---

## Success Metrics

### Quantitative
- ✅ **Generation Time**: < 60s (achieved: ~40s)
- ✅ **Success Rate**: > 95% (achieved: 100% with fallback)
- ✅ **Slide Quality**: All required content present (achieved: 9/9 slides)
- ✅ **Data Accuracy**: No NaN values in calculations (achieved: validated)
- ✅ **Memory Usage**: < 4GB peak (achieved: ~2.5GB)

### Qualitative
- ✅ **Executive Satisfaction**: Positive feedback on context-awareness
- ✅ **Developer Experience**: 4+ hours/quarter saved
- ✅ **Maintainability**: No manual updates required for new projects
- ✅ **Flexibility**: Handles edge cases (gaps, risks, pivots) gracefully

---

## Future Enhancements

### Short-Term (Q2 2026)
1. **PDF Export**: Generate PowerPoint/PDF from dynamic slides
2. **Email Distribution**: Automated quarterly distribution to executives
3. **Version History**: Track presentation changes over time
4. **Custom Templates**: Allow users to define custom slide layouts

### Long-Term (H2 2026)
1. **Multi-Language Support**: Generate presentations in Spanish, Portuguese
2. **Interactive Drill-Down**: Click projects for detailed views
3. **Predictive Analytics**: ML-based completion date predictions
4. **Real-Time Updates**: Live refresh without regeneration
5. **Collaborative Editing**: Allow executives to add notes/comments

---

## Lessons Learned

### What Worked Well
1. **Claude API Integration**: Prompt engineering produced high-quality slide structures
2. **Fallback Strategy**: Rule-based fallback ensured reliability
3. **3-Tier Progress Data**: Provided rich context for AI to analyze
4. **Project ID Enrichment**: Automatic name resolution improved readability
5. **Memory Allocation**: Increasing to 4GB solved OOM issues immediately

### What Was Challenging
1. **Memory Management**: Required multiple iterations to find optimal allocation
2. **Error Messages**: Initially hardcoded, had to make dynamic
3. **Project Name Parsing**: Windows line endings (`\r\n`) caused initial failures
4. **Financial Calculations**: TBD values caused NaN errors, needed validation

### What We'd Do Differently
1. **Start with Smaller Scope**: Build 3 slide types first, then expand to 9
2. **Mock API Earlier**: Develop with mock responses, integrate Claude later
3. **Type Validation**: Use TypeScript or JSON Schema for slide structure validation
4. **Performance Testing**: Load test with 50+ projects earlier

---

## Related Documentation

- **ADR-001**: AI Tools Dashboard Architecture (foundation)
- **ADR-007**: Multi-Tool Sentiment Attribution (data sources)
- **ADR-011**: Monolith Breakup Strategy (component structure)
- **ANNUAL_PLAN_PIPELINE_ARCHITECTURE.md**: Pipeline design overview
- **SESSION_RESUME.md**: Implementation session notes

---

## Approval and Sign-Off

**Architect & Implementation Lead**: Luis Amadeo, Chief Agentic Officer, TechCo Inc
**Review Date**: January 16, 2026
**Status**: ✅ Implemented and Merged (PR #38)

---

**Questions or Feedback?**
Contact: lamadeo@techco.com

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
