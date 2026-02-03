# Implementation Plan: AI Projects Portfolio Detail Views

## Overview
Add drilldown detail views for AI projects in the Portfolio tab. Users can click project names to see detailed information, then navigate back via breadcrumbs.

## User Requirements
- Detail view per project: goal summary, implementation phases, KPIs, value, risks
- Clickable project names in portfolio table (hyperlinks)
- Breadcrumb navigation: Home → ROI & Planning → AI Projects Portfolio → [Project Name]
- Keep it simple - slide-sized content per project

## User Preferences (from clarifying questions)
- ✅ Full automation: Build markdown parser script upfront
- ✅ All sections: Executive Summary, Goal, Phases, KPIs, Risks
- ✅ Start with 3-5 priority projects: OP-000, OP-001, OP-005, OP-011, OP-014

## Architecture Approach
**Pattern:** Extend existing client-side tab navigation with third level (Portfolio → Project Detail)
- Add `selectedProject` state (stores project ID like "OP-000" or null)
- When selectedProject is set, portfolio tab renders `<ProjectDetail>` instead of `<PortfolioTable>`
- Breadcrumbs handle back navigation by clearing selectedProject
- No URL routing changes needed - stays consistent with current architecture

---

## Implementation Steps

### Step 1: Create Data Extraction Script
**File:** `/scripts/parse-project-details.js` (NEW)

**Purpose:** Parse markdown files from `/data/ai-projects/` and generate structured JSON

**Parsing Strategy:**
- Use regex to extract sections by markdown headings
- Target sections: Executive Summary, Goal, Implementation Phases, KPIs, Risks
- Handle tables (extract metrics from markdown tables)
- Store structured data in `/app/ai-projects-details.json`

**Project Mapping (for 5 priority projects):**
```javascript
const PROJECT_MAPPINGS = {
  'OP-000': {
    name: 'Claude Enterprise & Code Expansion',
    files: ['OP-000 - AI Tools - Claude Enterprise Expansion Executive-leadership-summary.md']
  },
  'OP-001': {
    name: 'Sales Deal Agentic Intelligence',
    files: [
      'OP-001 - Executive_Summary_Unified_Deal_Intelligence_Platform.md',
      'OP-001 - Updated_Deal_Intelligence_Platform_Solution_Nov_2025.md'
    ]
  },
  'OP-005': {
    name: 'Lead Generation Agentic Intelligence',
    files: [
      'OP-005 - BDR_Intelligence_Platform_FINAL_Analysis.md',
      'OP-005 - BDR_Intelligence_Platform_Project_Summary.md'
    ]
  },
  'OP-011': {
    name: 'Claude Code Marketplace',
    files: [
      'OP-011 - Marketplace_AI_Project_Analysis.md',
      'OP-011 - MARKETPLACE_EXECUTIVE_SUMMARY.md'
    ]
  },
  'OP-014': {
    name: 'Business Operational Data Foundation',
    files: [] // Will need to identify the correct file
  }
};
```

**Output Structure:**
```json
{
  "OP-000": {
    "projectId": "OP-000",
    "projectName": "Claude Enterprise & Code Expansion",
    "executiveSummary": "...",
    "goal": "...",
    "phases": [
      {
        "name": "Phase 1: Foundation (0-30 days)",
        "description": "...",
        "timeline": "Q1 2026",
        "deliverables": ["..."]
      }
    ],
    "kpis": [
      {
        "metric": "Adoption",
        "description": "Active seat utilization",
        "baseline": "92 users",
        "target": "192 users",
        "targetFormatted": "92→192 seats"
      }
    ],
    "value": "$4.6M",
    "roi": "1,560%",
    "risks": [
      "Risk description with mitigation strategy"
    ],
    "tier": "TIER 0: FOUNDATION",
    "status": "Proposed"
  }
}
```

**Integration:** Add to npm scripts in `package.json`:
```json
"scripts": {
  "parse-projects": "node scripts/parse-project-details.js",
  "refresh": "node scripts/parse-hierarchy.js && node scripts/parse-copilot-data.js && node scripts/generate-insights.js && node scripts/parse-project-details.js"
}
```

---

### Step 2: Create ProjectDetail Component
**File:** `/app/components/ProjectDetail.jsx` (NEW)

**Purpose:** Reusable component to display project detail information

**Component Structure:**
```jsx
"use client";

import React from 'react';
import { Target, TrendingUp, AlertTriangle, CheckCircle, Clock, Layers } from 'lucide-react';

const ProjectDetail = ({ project }) => {
  return (
    <div className="space-y-6">
      {/* Header with project name and ID */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{project.projectName}</h2>
        <p className="text-sm text-gray-500">Project ID: {project.projectId}</p>
      </div>

      {/* Status & Metrics Cards (4-column grid) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Status card */}
        {/* Value card */}
        {/* ROI card */}
        {/* Tier card */}
      </div>

      {/* Executive Summary (blue background, prominent) */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          Executive Summary
        </h3>
        <div className="text-gray-700 prose prose-sm max-w-none">
          {project.executiveSummary}
        </div>
      </div>

      {/* Goal (white card with shadow) */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <Target className="h-5 w-5 mr-2 text-indigo-600" />
          Project Goal
        </h3>
        <p className="text-gray-700">{project.goal}</p>
      </div>

      {/* Implementation Phases (white card with timeline) */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Layers className="h-5 w-5 mr-2 text-indigo-600" />
          Implementation Phases
        </h3>
        <div className="space-y-4">
          {project.phases.map((phase, idx) => (
            <div key={idx} className="border-l-4 border-indigo-500 pl-4 py-2">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{phase.name}</h4>
                <span className="text-sm text-gray-500 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {phase.timeline}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-2">{phase.description}</p>
              {phase.deliverables && phase.deliverables.length > 0 && (
                <ul className="text-xs text-gray-600 space-y-1 ml-4">
                  {phase.deliverables.map((d, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-indigo-500 mr-2">▸</span>
                      {d}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* KPIs & Target Metrics (white card with grid) */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
          Key Performance Indicators
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {project.kpis.map((kpi, idx) => (
            <div key={idx} className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="text-xs font-medium text-green-700 mb-1">{kpi.metric}</div>
              <div className="text-2xl font-bold text-green-900">{kpi.targetFormatted}</div>
              {kpi.description && (
                <div className="text-xs text-gray-600 mt-1">{kpi.description}</div>
              )}
            </div>
          ))}
        </div>

        {/* Value & ROI Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-600">Annual Value: </span>
            <span className="text-xl font-bold text-green-600">{project.value}</span>
          </div>
          <div>
            <span className="text-sm text-gray-600">ROI: </span>
            <span className="text-xl font-bold text-green-600">{project.roi}</span>
          </div>
        </div>
      </div>

      {/* Risks (orange background, conditional rendering) */}
      {project.risks && project.risks.length > 0 && (
        <div className="bg-orange-50 border-l-4 border-orange-600 p-6 rounded-r-lg">
          <h3 className="text-lg font-semibold text-orange-900 mb-3 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Risks & Mitigation
          </h3>
          <ul className="space-y-3">
            {project.risks.map((risk, idx) => (
              <li key={idx} className="flex items-start text-sm text-gray-700">
                <AlertTriangle className="h-4 w-4 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
```

**Styling:** Uses existing Tailwind patterns from dashboard (gradients, shadows, borders, icons)

---

### Step 3: Update PortfolioTable Component
**File:** `/app/components/PortfolioTable.jsx`

**Changes:**
1. Add `onProjectClick` prop (optional function)
2. Make project name clickable when handler is provided
3. Maintain backward compatibility (AnnualPlanPresentation doesn't need clicks)

**Specific Edit at line 109-111:**
```jsx
// BEFORE:
<td className="px-2 py-2">
  <span className="font-semibold text-gray-900">{project.project}</span>
</td>

// AFTER:
<td className="px-2 py-2">
  {onProjectClick ? (
    <button
      onClick={() => onProjectClick(project.projectId)}
      className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors text-left w-full"
      title={`View details for ${project.project}`}
    >
      {project.project}
    </button>
  ) : (
    <span className="font-semibold text-gray-900">{project.project}</span>
  )}
</td>
```

**Update component signature (line 6):**
```jsx
// BEFORE:
const PortfolioTable = ({ projects, methodology, showMethodology = true, showLegend = true }) => {

// AFTER:
const PortfolioTable = ({ projects, methodology, showMethodology = true, showLegend = true, onProjectClick = null }) => {
```

---

### Step 4: Update page.jsx - State Management
**File:** `/app/page.jsx`

**Changes needed:**

**A) Add new state variable (around line 53-54):**
```jsx
const [activeTab, setActiveTab] = useState('overview-home');
const [openDropdown, setOpenDropdown] = useState(null);
const [selectedProject, setSelectedProject] = useState(null); // NEW
```

**B) Import new dependencies (around line 1-15):**
```jsx
import projectDetailsData from './ai-projects-details.json'; // NEW
import ProjectDetail from './components/ProjectDetail'; // NEW
```

**C) Add projectId field to portfolioData.projects (around lines 407-590):**
```jsx
// Example for first project (line 414):
{
  rank: 1,
  projectId: "OP-000", // NEW - extract prefix before colon
  project: "OP-000: Claude Enterprise & Code Expansion",
  score: "95.6",
  // ... rest unchanged
}

// Repeat for all 11 projects (OP-000 through OP-011)
```

**D) Update getBreadcrumbs function (around lines 656-691):**
```jsx
const getBreadcrumbs = (tab, projectId = null) => {
  const crumbs = [{ label: 'Home', tab: null }];

  // ... existing logic for regular tabs ...

  // NEW: Handle project detail breadcrumbs
  if (projectId && tab === 'portfolio') {
    // Build path: Home > ROI & Planning > AI Projects Portfolio > Project Name
    for (const navItem of navigationStructure) {
      if (navItem.hasDropdown && navItem.items) {
        for (const item of navItem.items) {
          if (item.tab === 'portfolio') {
            crumbs.push({ label: navItem.label, tab: null });
            crumbs.push({
              label: item.label,
              tab: 'portfolio',
              onClick: () => setSelectedProject(null) // Clear selection on back
            });
            const project = projectDetailsData[projectId];
            crumbs.push({
              label: project?.projectName || projectId,
              tab: null
            });
            return crumbs;
          }
        }
      }
    }
  }

  return crumbs;
};
```

**E) Update breadcrumb call site (around line 809):**
```jsx
// BEFORE:
const breadcrumbs = getBreadcrumbs(activeTab);

// AFTER:
const breadcrumbs = getBreadcrumbs(activeTab, selectedProject);
```

**F) Update breadcrumb rendering to handle onClick (around lines 810-828):**
```jsx
{breadcrumbs.map((crumb, index) => (
  <div key={index} className="flex items-center">
    {index > 0 && (
      <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
    )}
    {crumb.tab || crumb.onClick ? ( // CHANGED: check onClick too
      <button
        onClick={() => crumb.onClick ? crumb.onClick() : setActiveTab(crumb.tab)}
        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
      >
        {crumb.label}
      </button>
    ) : (
      <span className={index === breadcrumbs.length - 1 ? 'text-gray-900 font-medium' : 'text-gray-500'}>
        {crumb.label}
      </span>
    )}
  </div>
))}
```

**G) Update portfolio tab rendering (around lines 5924-6038):**
```jsx
{activeTab === 'portfolio' && (
  <div className="space-y-6">
    {selectedProject ? (
      // RENDER PROJECT DETAIL VIEW
      <ProjectDetail project={projectDetailsData[selectedProject]} />
    ) : (
      // RENDER PORTFOLIO TABLE (existing content)
      <>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            AI Projects Portfolio - Priority & Scoring
          </h2>
          <p className="text-gray-600 mb-6">
            11 AI projects ranked by hybrid scoring algorithm (70% Multi-Factor + 30% ROI).
            Data-driven prioritization based on financial impact, strategic alignment,
            execution feasibility, and time to value.
          </p>
        </div>

        {/* Portfolio Summary Cards - existing code unchanged */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* ... existing 4 cards ... */}
        </div>

        {/* Portfolio Table with click handler */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200" style={{height: '600px'}}>
          <div className="p-6 h-full">
            <PortfolioTable
              projects={portfolioData.projects}
              methodology={portfolioData.methodology}
              showMethodology={true}
              showLegend={true}
              onProjectClick={(projectId) => setSelectedProject(projectId)} // NEW
            />
          </div>
        </div>

        {/* Strategic Context - existing code unchanged */}
        {/* ... rest of portfolio tab content ... */}
      </>
    )}
  </div>
)}
```

---

### Step 5: Update Documentation
**File:** `/docs/DATA_REFRESH.md`

Add new section:
```markdown
### Project Details Data

**Script:** `/scripts/parse-project-details.js`

**Purpose:** Extracts structured project detail information from markdown files in `/data/ai-projects/`

**What it generates:**
- `/app/ai-projects-details.json` - Project details for drilldown views

**What it extracts:**
- Executive summaries
- Project goals and objectives
- Implementation phases with timelines
- KPIs and target metrics
- Risks and mitigation strategies

**When to run:** Part of `npm run refresh` pipeline, or manually via `npm run parse-projects`

**To update:** Edit markdown files in `/data/ai-projects/` and re-run the script
```

---

## Implementation Sequence

### Phase 1: Data Extraction Script (2-3 hours)
1. Create `/scripts/parse-project-details.js`
2. Implement markdown parsing for 5 priority projects
3. Generate `/app/ai-projects-details.json`
4. Test output structure

### Phase 2: Component Creation (1-2 hours)
1. Create `/app/components/ProjectDetail.jsx`
2. Style using existing Tailwind patterns
3. Test with sample data

### Phase 3: Integration (2-3 hours)
1. Update state management in `page.jsx`
2. Update `getBreadcrumbs()` function
3. Update breadcrumb rendering
4. Update portfolio tab conditional rendering
5. Add projectId to all 11 projects in portfolioData

### Phase 4: PortfolioTable Enhancement (30 mins)
1. Add `onProjectClick` prop
2. Make project names clickable
3. Verify backward compatibility

### Phase 5: Testing & Polish (1 hour)
1. Test 5 project detail views
2. Verify breadcrumb navigation
3. Test AnnualPlanPresentation (should be unaffected)
4. Check mobile responsiveness

### Phase 6: Documentation (30 mins)
1. Update DATA_REFRESH.md
2. Add inline code comments

**Total: 7-10 hours**

---

## Critical Files to Modify

1. `/scripts/parse-project-details.js` (NEW) - Data extraction
2. `/app/ai-projects-details.json` (GENERATED) - Project detail data
3. `/app/components/ProjectDetail.jsx` (NEW) - Detail view component
4. `/app/components/PortfolioTable.jsx` - Add click handler
5. `/app/page.jsx` - State management, breadcrumbs, conditional rendering
6. `/docs/DATA_REFRESH.md` - Documentation
7. `package.json` - Add npm script

---

## Data Flow

```
User clicks project name in PortfolioTable
  ↓
onProjectClick(projectId) callback fires
  ↓
page.jsx: setSelectedProject(projectId)
  ↓
React re-renders portfolio tab
  ↓
selectedProject !== null → render ProjectDetail
  ↓
User clicks breadcrumb "AI Projects Portfolio"
  ↓
onClick handler: setSelectedProject(null)
  ↓
React re-renders portfolio tab
  ↓
selectedProject === null → render PortfolioTable
```

---

## Testing Checklist

- [ ] Script generates valid JSON for 5 projects
- [ ] ProjectDetail renders all sections correctly
- [ ] Project names are clickable in portfolio table
- [ ] Clicking project navigates to detail view
- [ ] Breadcrumbs show correct path (Home > ROI & Planning > Portfolio > Project)
- [ ] Clicking portfolio breadcrumb navigates back
- [ ] AnnualPlanPresentation still works (no click handlers)
- [ ] Mobile responsive on all screen sizes
- [ ] No console errors
- [ ] All 5 projects have complete data

---

## Future Enhancements (Out of Scope)

- Add URL params for deep linking (shareable project links)
- Add search/filter to portfolio table
- Show project dependencies as clickable links
- Visual timeline/Gantt chart for phases
- Export project details to PDF/PowerPoint
- Expand to all 11 projects (6 additional)
