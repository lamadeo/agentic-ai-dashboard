# Refactoring Plan: Component Reuse for Claude Code Sections

**Date**: January 2, 2026
**Goal**: Extract Claude Code sections into reusable components that can be displayed in BOTH Claude Enterprise and Claude Code tabs

## 🎯 Strategy

**Approach**: Extract into reusable React components
- Keep sections in Claude Enterprise tab (Premium users can use Claude Code)
- Also display in Claude Code tab (dedicated view)
- Single source of truth (DRY principle)
- No code duplication

**Why both tabs?** Claude Enterprise Premium seats include Claude Code access, so these sections are relevant to both audiences.

---

## Components to Extract

### Component 1: ClaudeCodePowerUsersTable
**Current Location**: Claude Enterprise tab, lines 997-1030 (SECTION 13)
**Data Required**: `aiToolsData.claudeCode.powerUsers`

**Props Interface**:
```typescript
interface ClaudeCodePowerUsersTableProps {
  powerUsers: Array<{
    email: string;
    name: string;
    department: string;
    linesGenerated: number;
    sessions: number;
    linesPerSession: number;
  }>;
}
```

**Component Code Structure**:
```jsx
const ClaudeCodePowerUsersTable = ({ powerUsers }) => (
  <div>
    <h3 className="text-xl font-semibold text-gray-900 mb-4">
      Claude Code - Power User Champions (Top 12)
    </h3>
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Table content */}
        </table>
      </div>
    </div>
  </div>
);
```

---

### Component 2: ClaudeCodeKeyInsights
**Current Location**: Claude Enterprise tab, lines 1032-1104 (SECTION 14)
**Data Required**:
- `aiToolsData.insights.claudeCodeDepartmentPerformance`
- `aiToolsData.claudeCode.departmentBreakdown`
- `aiToolsData.claudeCode.powerUsers`

**Props Interface**:
```typescript
interface ClaudeCodeKeyInsightsProps {
  departmentInsight: string;
  departmentBreakdown: Array<{
    department: string;
    users: number;
    totalLines: number;
    linesPerUser: number;
    topUser?: {
      username: string;
      lines: number;
    };
  }>;
  topThreeUsers: Array<{
    email: string;
    name: string;
    department: string;
    linesGenerated: number;
    linesPerSession: number;
  }>;
}
```

**Component Code Structure**:
```jsx
const ClaudeCodeKeyInsights = ({ departmentInsight, departmentBreakdown, topThreeUsers }) => (
  <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
    <h3 className="text-xl font-semibold text-gray-900 mb-4">
      Key Insights: Claude Code Performance
    </h3>

    {/* AI-Generated Department Performance Insight */}
    {departmentInsight && (
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-4 rounded-lg border border-violet-200 mb-6">
        <p className="text-sm text-gray-900">
          <strong>Department Performance:</strong> {departmentInsight}
        </p>
      </div>
    )}

    {/* Department Breakdown Table */}
    {/* ... */}

    {/* Top Individual Contributors */}
    {/* ... */}
  </div>
);
```

---

### Component 3: ClaudeCodeLowEngagementUsers
**Current Location**: Claude Enterprise tab, lines 1106-1133 (SECTION 15)
**Data Required**: `aiToolsData.claudeCode.lowEngagementUsers`

**Props Interface**:
```typescript
interface ClaudeCodeLowEngagementUsersProps {
  lowEngagementUsers: Array<{
    email: string;
    name: string;
    department: string;
    linesGenerated: number;
    sessions: number;
  }>;
}
```

**Component Code Structure**:
```jsx
const ClaudeCodeLowEngagementUsers = ({ lowEngagementUsers }) => (
  <div>
    <h3 className="text-xl font-semibold text-gray-900 mb-4">
      Claude Code - Low Engagement Users (Enablement Targets)
    </h3>
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Table content */}
        </table>
      </div>
    </div>
  </div>
);
```

---

### Component 4: Remove Duplicate Section
**Current Location**: Claude Enterprise tab, lines 1135-1179 (SECTION 16)
**Action**: DELETE - This is a duplicate of Component 2 (SECTION 14)

---

## Implementation Strategy: Inline Function Components

**Recommended Approach**: Define components inline within page.jsx

**Pros**:
- Simple, no new files needed
- All data already in scope
- Easy to implement and test
- No import/export complexity

**Implementation Pattern**:
```jsx
'use client';
import { useState, useMemo } from 'react';
// ... other imports

// ============================================================
// CLAUDE CODE REUSABLE COMPONENTS
// These components are used in BOTH Claude Enterprise and Claude Code tabs
// ============================================================

const ClaudeCodePowerUsersTable = ({ powerUsers }) => {
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};

const ClaudeCodeKeyInsights = ({ departmentInsight, departmentBreakdown, topThreeUsers }) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
      {/* Component JSX */}
    </div>
  );
};

const ClaudeCodeLowEngagementUsers = ({ lowEngagementUsers }) => {
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};

// ============================================================
// MAIN DASHBOARD COMPONENT
// ============================================================

export default function Dashboard() {
  // ... existing code

  return (
    <div>
      {/* Claude Enterprise Tab */}
      {activeTab === 'claude-enterprise' && (
        <div className="space-y-6">
          {/* ... other sections ... */}

          {/* Claude Code sections (Premium users) */}
          <ClaudeCodePowerUsersTable powerUsers={aiToolsData.claudeCode.powerUsers} />
          <ClaudeCodeKeyInsights
            departmentInsight={aiToolsData.insights?.claudeCodeDepartmentPerformance}
            departmentBreakdown={aiToolsData.claudeCode.departmentBreakdown}
            topThreeUsers={aiToolsData.claudeCode.powerUsers.slice(0, 3)}
          />
          <ClaudeCodeLowEngagementUsers lowEngagementUsers={aiToolsData.claudeCode.lowEngagementUsers} />
        </div>
      )}

      {/* Claude Code Tab */}
      {activeTab === 'claude-code' && (
        <div className="space-y-6">
          {/* ... existing sections ... */}

          {/* Reuse same components */}
          <ClaudeCodePowerUsersTable powerUsers={aiToolsData.claudeCode.powerUsers} />
          <ClaudeCodeKeyInsights
            departmentInsight={aiToolsData.insights?.claudeCodeDepartmentPerformance}
            departmentBreakdown={aiToolsData.claudeCode.departmentBreakdown}
            topThreeUsers={aiToolsData.claudeCode.powerUsers.slice(0, 3)}
          />
          <ClaudeCodeLowEngagementUsers lowEngagementUsers={aiToolsData.claudeCode.lowEngagementUsers} />
        </div>
      )}
    </div>
  );
}
```

---

## Baby Step Implementation Plan

### Phase 1: Extract Component 1 (Safest - Simple Table)

**Step 1.1**: Define ClaudeCodePowerUsersTable inline component
- Extract JSX from lines 997-1030
- Define component function above main return
- Add props interface as JSDoc comment
- **Test**: No changes to UI yet (component defined but not used)

**Step 1.2**: Replace original usage in Claude Enterprise tab
- Replace lines 997-1030 with component call: `<ClaudeCodePowerUsersTable powerUsers={aiToolsData.claudeCode.powerUsers} />`
- **Test**: Claude Enterprise tab renders same as before
- **Commit**: "refactor: Extract ClaudeCodePowerUsersTable component"

**Step 1.3**: Add component to Claude Code tab
- Add component call after line 1509 (after Code Generation Trends chart)
- Pass same prop: `<ClaudeCodePowerUsersTable powerUsers={aiToolsData.claudeCode.powerUsers} />`
- **Test**: Both tabs show same Power Users table
- **Commit**: "feat: Add Power Users table to Claude Code tab"

---

### Phase 2: Extract Component 2 (Medium Complexity - Multiple Props)

**Step 2.1**: Define ClaudeCodeKeyInsights inline component
- Extract JSX from lines 1032-1104
- Define component function with 3 props (departmentInsight, departmentBreakdown, topThreeUsers)
- Add props interface as JSDoc comment
- **Test**: Component defined but not used yet

**Step 2.2**: Replace original usage in Claude Enterprise tab
- Replace lines 1032-1104 with component call
- Pass all required props:
  ```jsx
  <ClaudeCodeKeyInsights
    departmentInsight={aiToolsData.insights?.claudeCodeDepartmentPerformance}
    departmentBreakdown={aiToolsData.claudeCode.departmentBreakdown}
    topThreeUsers={aiToolsData.claudeCode.powerUsers.slice(0, 3)}
  />
  ```
- **Test**: Claude Enterprise tab renders same as before
- **Commit**: "refactor: Extract ClaudeCodeKeyInsights component"

**Step 2.3**: Add component to Claude Code tab
- Add component call after Power Users table
- Pass same props
- **Test**: Both tabs show same Key Insights section
- **Commit**: "feat: Add Key Insights section to Claude Code tab"

---

### Phase 3: Extract Component 3 (Simple Table)

**Step 3.1**: Define ClaudeCodeLowEngagementUsers inline component
- Extract JSX from lines 1106-1133
- Define component function
- Add props interface as JSDoc comment
- **Test**: Component defined but not used yet

**Step 3.2**: Replace original usage in Claude Enterprise tab
- Replace lines 1106-1133 with component call: `<ClaudeCodeLowEngagementUsers lowEngagementUsers={aiToolsData.claudeCode.lowEngagementUsers} />`
- **Test**: Claude Enterprise tab renders same as before
- **Commit**: "refactor: Extract ClaudeCodeLowEngagementUsers component"

**Step 3.3**: Add component to Claude Code tab
- Add component call after Key Insights
- Pass same prop: `<ClaudeCodeLowEngagementUsers lowEngagementUsers={aiToolsData.claudeCode.lowEngagementUsers} />`
- **Test**: Both tabs show same Low Engagement Users table
- **Commit**: "feat: Add Low Engagement Users to Claude Code tab"

---

### Phase 4: Remove Duplicate Section

**Step 4.1**: Delete SECTION 16 (lines 1135-1179)
- This is a duplicate of Component 2 (ClaudeCodeKeyInsights already extracted)
- Simply delete the entire section (45 lines)
- **Test**: Claude Enterprise tab still shows Key Insights (via component from Phase 2)
- **Commit**: "refactor: Remove duplicate Claude Code Department Insights section"

---

### Phase 5: Final Testing & Documentation

**Step 5.1**: Comprehensive testing checklist
- [ ] Claude Enterprise tab shows all Claude Code sections
- [ ] Claude Code tab shows all Claude Code sections
- [ ] Both tabs render identically for Claude Code sections
- [ ] No console errors or warnings
- [ ] Mobile responsive layout works
- [ ] All tables display correct data
- [ ] AI insights display correctly
- [ ] Navigation between tabs works smoothly

**Step 5.2**: Update documentation
- Update `/docs/SESSION_RESUME.md` with completion status
- Add JSDoc comments to component functions
- Note final line numbers and file size reduction

**Step 5.3**: Final commit
- **Commit**: "docs: Update SESSION_RESUME with component refactoring completion"

---

## Testing Checklist

After each component extraction:
- [ ] Component renders in Claude Enterprise tab (no visual change)
- [ ] Component renders in Claude Code tab (new addition)
- [ ] Data displays correctly in both tabs
- [ ] Tables show correct user counts and metrics
- [ ] No console errors or warnings
- [ ] Mobile responsive layout works
- [ ] No duplicate code remains

Final verification:
- [ ] SECTION 16 duplicate removed (45 lines)
- [ ] All 3 components defined once and used twice
- [ ] Both tabs show identical Claude Code sections
- [ ] Code follows DRY principle
- [ ] File size reduced due to duplicate removal

---

## Rollback Plan

If any step breaks the UI:
1. `git checkout app/page.jsx` - restore from git
2. Or: `cp app/page.jsx.backup app/page.jsx` - restore from backup
3. Review error in console
4. Adjust component implementation
5. Retry the failed step

---

## Success Criteria

✅ **Claude Enterprise tab** shows:
- All existing Claude Enterprise content
- Claude Code sections (for Premium users who can use Claude Code)
- Sections rendered via reusable components

✅ **Claude Code tab** shows:
- All existing Claude Code content
- Same Claude Code sections as Enterprise tab
- Sections rendered via same reusable components

✅ **Code Quality**:
- No duplicate JSX code
- Components defined once, used multiple times
- Props clearly defined with JSDoc comments
- Single source of truth for Claude Code sections

✅ **No data loss or visual regression**
✅ **All insights display correctly**
✅ **File size reduced (~45+ lines from duplicate removal)**

---

## Benefits of This Approach

1. **DRY Principle**: Single source of truth for Claude Code sections
2. **Consistency**: Both tabs always show identical Claude Code data
3. **Maintainability**: Update component once, changes reflect in both tabs
4. **Context Awareness**: Premium users see Claude Code data in Enterprise tab
5. **Dedicated View**: Claude Code tab provides focused view for that tool
6. **Type Safety**: Props can be documented with JSDoc for IDE support
7. **Testing**: Test component once, works in both places
8. **Future Proof**: Easy to add to other tabs if needed

---

## Lines of Code Impact

**Before**:
- Claude Enterprise tab: ~989 lines (includes duplicate sections)
- Claude Code tab: ~99 lines

**After**:
- Component definitions: ~200 lines (extracted, reusable)
- Claude Enterprise tab: ~800 lines (uses components)
- Claude Code tab: ~120 lines (uses same components)
- **Net reduction**: ~188 lines removed (duplicate SECTION 16 + consolidated patterns)

**Estimated total file size reduction**: 200+ lines
