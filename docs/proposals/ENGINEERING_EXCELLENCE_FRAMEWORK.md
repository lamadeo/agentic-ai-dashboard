# Engineering Excellence Framework Proposal

**Status**: Proposed
**Created**: 2026-01-19
**Author**: Engineering Team + Claude Code
**Priority**: High

## Executive Summary

This proposal establishes automated engineering standards to enforce best practices across the codebase, including clean code principles, modular architecture, comprehensive testing, and standardized workflows. The framework prevents technical debt accumulation and ensures consistent code quality.

## Problem Statement

Current gaps in engineering discipline:
1. No automated enforcement of clean code principles
2. No pre-commit hooks to prevent broken commits
3. No linting or formatting standards
4. No branch workflow enforcement
5. No architecture validation (file size, complexity limits)
6. No test coverage requirements
7. Inconsistent commit messages
8. Direct commits to main possible
9. Documentation lacks mandatory workflow guidance

## Proposed Solution

### Phase 1: Core Tools Setup (30 minutes)

**Install Dependencies:**
```bash
npm install --save-dev \
  eslint \
  eslint-config-next \
  eslint-config-prettier \
  eslint-plugin-jest \
  eslint-plugin-sonarjs \
  prettier \
  husky \
  lint-staged \
  @commitlint/cli \
  @commitlint/config-conventional

npx husky install
npm pkg set scripts.prepare="husky install"
```

**Benefits:**
- Automatic code quality checks before every commit
- Consistent code formatting across team
- Enforced conventional commit messages

---

### Phase 2: Configuration Files (20 minutes)

#### .eslintrc.js
```javascript
module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:jest/recommended',
    'prettier'
  ],
  plugins: ['jest', 'sonarjs'],
  rules: {
    // Complexity & Size Limits
    'complexity': ['warn', 10],
    'max-depth': ['warn', 3],
    'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true, skipComments: true }],
    'max-lines': ['warn', { max: 500, skipBlankLines: true, skipComments: true }],

    // Clean Code (SonarJS)
    'sonarjs/cognitive-complexity': ['warn', 15],
    'sonarjs/no-duplicate-string': ['warn', 3],
    'sonarjs/no-identical-functions': 'error',
    'sonarjs/no-collapsible-if': 'warn',

    // Best Practices
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error'
  }
}
```

#### .prettierrc.json
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "avoid"
}
```

#### .husky/pre-commit
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# Run lint-staged (lints + formats only staged files)
npx lint-staged

# Run tests related to changed files
npm test -- --bail --findRelatedTests

echo "✅ Pre-commit checks passed!"
```

#### .husky/commit-msg
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Enforce conventional commits
npx --no -- commitlint --edit "$1"
```

#### commitlint.config.js
```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'refactor', // Code improvement
        'test',     // Test addition/update
        'docs',     // Documentation
        'style',    // Code style/formatting
        'chore',    // Maintenance
        'perf',     // Performance improvement
        'ci',       // CI/CD changes
        'build'     // Build system changes
      ]
    ],
    'subject-case': [2, 'always', 'sentence-case']
  }
};
```

#### .github/PULL_REQUEST_TEMPLATE.md
```markdown
## Description
Brief description of changes and motivation

## Type of Change
- [ ] Feature (new functionality)
- [ ] Fix (bug fix)
- [ ] Refactor (code improvement without behavior change)
- [ ] Test (test addition/improvement)
- [ ] Docs (documentation only)

## Pre-Merge Checklist
### Branch & Workflow
- [ ] Created feature branch from main (not committed directly to main)
- [ ] Branch follows naming convention: `feature/|fix/|refactor/|test/|docs/`
- [ ] Commits follow conventional commit format (feat:, fix:, etc.)

### Code Quality
- [ ] Linter passing (`npm run lint`)
- [ ] Types check passing (`npm run type-check`)
- [ ] Formatting consistent (`npm run format:check`)
- [ ] No functions >50 lines
- [ ] No files >500 lines (or justified)
- [ ] Follows modular architecture pattern

### Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated (if applicable)
- [ ] All tests passing locally (`npm test`)
- [ ] Test coverage >70% for new code

### Documentation
- [ ] Updated documentation (if needed)
- [ ] ADR created for architectural decisions (if applicable)
- [ ] Comments added for complex logic

## Architecture Impact
- [ ] No circular dependencies introduced
- [ ] Components remain single-responsibility
- [ ] Follows existing patterns from ADR-011

## Test Coverage
- New code coverage: __%
- Overall coverage: __%

## Manual Testing
- [ ] Tested locally in dev mode
- [ ] Verified on Preview deployment
- [ ] No console errors

## Related Issues
Closes #
Related to #
```

---

### Phase 3: Package.json Scripts (10 minutes)

**Add to package.json:**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "parse-projects": "node scripts/parse-project-details.js",
    "refresh": "./scripts/refresh-data.sh && npm run parse-projects",
    "refresh-annual-plan": "node --max-old-space-size=4096 scripts/generate-annual-plan.js",
    "hash-password": "node scripts/hash-password.js",

    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",

    "lint": "next lint --max-warnings 0",
    "lint:fix": "next lint --fix",
    "format": "prettier --write \"**/*.{js,jsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{js,jsx,json,md}\"",
    "type-check": "tsc --noEmit",

    "pre-commit": "lint-staged",
    "prepare": "husky install",
    "validate": "npm run lint && npm run type-check && npm run format:check && npm test"
  },
  "lint-staged": {
    "*.{js,jsx}": [
      "eslint --fix",
      "prettier --write",
      "jest --bail --findRelatedTests --passWithNoTests"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

---

### Phase 4: Documentation (30 minutes)

#### Update .claude/CLAUDE.md

Add after "🚨 ALWAYS READ FIRST 🚨" section:

```markdown
## 🚨 MANDATORY ENGINEERING WORKFLOWS 🚨

### Every Feature Implementation Must Follow:

#### 1. Branch Management
- **ALWAYS** create feature branch: `git checkout -b feature/description`
- **NEVER** commit directly to main
- Branch naming: `feature/|fix/|refactor/|test/|docs/`
- Examples: `feature/virtual-fte-metrics`, `fix/insights-rendering`

#### 2. Development Cycle (Test-Driven Development)
1. Write failing test first
2. Implement minimum code to pass test
3. Refactor while keeping tests green
4. Run full test suite: `npm test`
5. Run linter: `npm run lint`
6. Commit with conventional message: `feat: add feature description`

#### 3. Code Quality Standards
- **Max function size**: 50 lines (enforced by ESLint)
- **Max file size**: 500 lines (requires justification if exceeded)
- **Max complexity**: 10 cyclomatic complexity
- **Max nesting depth**: 3 levels
- **Modular architecture**: Follow ADR-011 patterns
- **No console.log**: Use console.error or console.warn
- **DRY principle**: No duplicate code blocks

#### 4. Testing Requirements
- **Unit tests** for all business logic
- **Integration tests** for component workflows
- **>70% code coverage** for all new code
- **Tests must pass** before every commit
- Tests run automatically in pre-commit hook

#### 5. Commit Process
- **Conventional commits** required: `type: description`
  - `feat:` New features
  - `fix:` Bug fixes
  - `refactor:` Code improvements
  - `test:` Test additions
  - `docs:` Documentation
- **Small, atomic commits**: One logical change per commit
- **Run checks before commit**:
  ```bash
  npm test              # All tests pass
  npm run lint          # No warnings
  npm run type-check    # No type errors
  ```

#### 6. Pull Request Process
1. Complete all changes on feature branch
2. Verify all quality gates pass:
   ```bash
   npm run validate  # Runs lint + type-check + format + test
   ```
3. Push branch: `git push -u origin feature/branch-name`
4. Create PR: `gh pr create --fill`
5. Fill PR template checklist
6. PR must pass CI/CD before merge
7. **No direct merges without CI passing**

### Pre-Commit Checklist

Before EVERY commit, verify:
- [ ] Tests written and passing (`npm test`)
- [ ] Linter passing (`npm run lint`)
- [ ] Types valid (`npm run type-check`)
- [ ] Code follows modular pattern (files <500 lines, functions <50 lines)
- [ ] Conventional commit message prepared

**Note**: Pre-commit hook automatically runs tests and linter, but manual verification is good practice.

### Claude Code Session Behavior

When I (Claude Code) work on features, I MUST:
1. **START** by creating feature branch
2. **CREATE** todo list with modular tasks
3. **WRITE** tests before implementation (TDD)
4. **IMPLEMENT** in small increments (<50 lines per function)
5. **RUN** tests after each increment
6. **COMMIT** frequently with clear conventional messages
7. **CREATE** PR and push when complete
8. **NEVER** skip quality checks

### Quality Gate Enforcement

The following are enforced automatically:
- **Pre-commit hook**: Runs lint + tests on staged files
- **CI/CD**: Runs full test suite + build on every PR
- **ESLint**: Warns on complexity >10, file size >500 lines
- **Jest**: Fails if coverage drops below 70%
- **Conventional Commits**: Rejects non-standard commit messages
```

#### Create CONTRIBUTING.md

```markdown
# Contributing to TechCo Inc AI Dashboard

## Getting Started

### Prerequisites
- Node.js 18.x or 20.x
- npm 9.x or higher
- Git

### Initial Setup
```bash
git clone <repo-url>
cd as-ai-dashboard
npm install
npm test  # Verify setup
```

## Development Workflow

### 1. Start New Feature

```bash
# Ensure you're on main and up-to-date
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Examples:
git checkout -b feature/add-cost-analysis
git checkout -b fix/insights-rendering
git checkout -b refactor/metrics-card-component
```

### 2. Development Cycle (TDD Approach)

```bash
# Step 1: Write failing test
npm test -- --watch

# Step 2: Implement minimum code to pass test

# Step 3: Refactor while keeping tests green

# Step 4: Verify quality
npm run lint              # Check code quality
npm run type-check        # Check TypeScript types
npm test                  # Run full test suite

# Step 5: Commit
git add .
git commit -m "feat: specific change description"
# Pre-commit hook automatically runs lint + tests
```

### 3. Small, Frequent Commits

Good commit practices:
```bash
# Good: Small, focused commits
git commit -m "feat: add Agentic FTE metric card component"
git commit -m "test: add tests for Agentic FTE calculations"
git commit -m "refactor: extract metric formatting to utility"

# Bad: Large, unfocused commits
git commit -m "fix stuff"
git commit -m "wip"
git commit -m "update dashboard (includes 15 different changes)"
```

### 4. Complete Feature

```bash
# Final verification before PR
npm run validate  # Runs: lint + type-check + format + test

# Push branch
git push -u origin feature/your-feature-name

# Create PR
gh pr create --fill  # Or use GitHub web UI

# Fill out PR template checklist
```

## Code Quality Standards

### File Organization
```
app/components/
  ├── layout/       # Layout components (header, sidebar, etc.)
  ├── shared/       # Reusable components (MetricCard, MarkdownRenderer, etc.)
  └── tabs/         # Tab-specific components (modular, <500 lines each)

scripts/modules/
  ├── aggregators/  # Data aggregation logic
  ├── generators/   # Output generation (insights, presentations)
  └── processors/   # Data processing and transformation

__tests__/
  ├── components/   # Component tests
  ├── scripts/      # Script tests
  ├── mocks/        # Mock data
  └── utils/        # Test utilities
```

### Clean Code Checklist

Before committing, ensure:
- [ ] Function does ONE thing (Single Responsibility Principle)
- [ ] Max 50 lines per function
- [ ] Max 3 levels of nesting
- [ ] Descriptive names (no abbreviations like `usr`, `tmp`, `calc`)
- [ ] No magic numbers (use named constants)
- [ ] No duplicate code (DRY principle)
- [ ] Comments only for complex logic (code should be self-documenting)

### Modular Architecture Guidelines

**Components** (200 lines max preferred):
```javascript
// Good: Single responsibility, small, testable
const MetricCard = ({ title, value, subtitle, icon: Icon }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm">
    <p className="text-sm text-gray-600">{title}</p>
    <p className="text-3xl font-bold">{value}</p>
    <p className="text-xs text-gray-500">{subtitle}</p>
  </div>
);
```

**Functions** (50 lines max):
```javascript
// Good: Small, focused, testable
function calculateAdoptionRate(activeUsers, licensedUsers) {
  if (licensedUsers === 0) return 0;
  return Math.round((activeUsers / licensedUsers) * 100);
}

// Bad: Too large, multiple responsibilities
function processAllDashboardData() {
  // 200 lines of mixed logic...
}
```

### Testing Strategy

**Unit Tests** - Test individual functions/components:
```javascript
describe('calculateAdoptionRate', () => {
  it('calculates percentage correctly', () => {
    expect(calculateAdoptionRate(43, 100)).toBe(43);
  });

  it('handles zero licensed users', () => {
    expect(calculateAdoptionRate(10, 0)).toBe(0);
  });
});
```

**Integration Tests** - Test component interactions:
```javascript
describe('ClaudeCode Tab', () => {
  it('displays all 6 metric cards', () => {
    render(<ClaudeCode aiToolsData={mockData} />);
    expect(screen.getByText('Licensed Users')).toBeInTheDocument();
    expect(screen.getByText('Active Users')).toBeInTheDocument();
    // ... test all 6 cards
  });
});
```

**Coverage Requirements**:
- New code: >70% coverage required
- Overall: Maintain or improve existing coverage
- Run: `npm run test:coverage`

## Conventional Commits

All commits must follow this format:

```
<type>: <description>

[optional body]

[optional footer]
```

### Types:
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code improvement (no behavior change)
- `test:` Test addition/update
- `docs:` Documentation only
- `style:` Code style/formatting
- `chore:` Maintenance tasks
- `perf:` Performance improvement
- `ci:` CI/CD changes
- `build:` Build system changes

### Examples:
```bash
feat: add Agentic FTE metric cards to Claude Code view
fix: resolve key insights rendering in M365 Copilot tab
refactor: extract metric card to shared component
test: add coverage for ClaudeCode component
docs: update SESSION_RESUME with Agentic FTE implementation
```

## Architecture Decision Records (ADRs)

When making architectural decisions:

1. Create ADR in `/docs/architecture/ADR-XXX-title.md`
2. Follow template:
   ```markdown
   # ADR-XXX: Title

   ## Status
   Proposed | Accepted | Deprecated

   ## Context
   What is the issue we're addressing?

   ## Decision
   What did we decide to do?

   ## Consequences
   What are the trade-offs?
   ```
3. Reference ADR in PR description
4. Update `.claude/CLAUDE.md` to reference new ADR

## Git Workflow Summary

```bash
# 1. Start feature
git checkout -b feature/name

# 2. Develop (TDD cycle)
# Write test → Implement → Refactor → Commit
git commit -m "feat: description"

# 3. Continue iterating
git commit -m "test: add edge case tests"
git commit -m "refactor: simplify calculation logic"

# 4. Complete feature
npm run validate
git push -u origin feature/name
gh pr create --fill

# 5. After PR approved & CI passes
# Merge via GitHub (squash or merge commit)
```

## Troubleshooting

### Pre-commit hook fails
```bash
# Check what failed
npm test               # Run tests manually
npm run lint           # Check lint errors
npm run type-check     # Check type errors

# Fix issues, then commit again
git add .
git commit -m "fix: resolve linting issues"
```

### Coverage below threshold
```bash
# Check coverage report
npm run test:coverage

# Open HTML report
open coverage/lcov-report/index.html

# Add tests for uncovered lines
```

### ESLint complexity warnings
```bash
# Refactor complex function into smaller functions
# Example: Break 80-line function into 4x 20-line functions

# Or add eslint-disable comment with justification (rare)
// eslint-disable-next-line complexity
function complexLegacyLogic() {
  // Justification: Legacy algorithm, refactor planned in #123
}
```

## Resources

- [Architecture Decision Records](/docs/architecture/)
- [Data Refresh Guide](/docs/guides/DATA_REFRESH.md)
- [Session Resume](/docs/SESSION_RESUME.md)
- [Roadmap](/.claude/ROADMAP.md)
- [Clean Code Principles](https://github.com/ryanmcdermott/clean-code-javascript)
- [Conventional Commits](https://www.conventionalcommits.org/)
```

---

### Phase 5: GitHub Actions Update (15 minutes)

**Update `.github/workflows/ci-cd.yml` lines 373-394:**

```yaml
  lint-check:
    name: Lint & Type Check
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js 20.x
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run TypeScript check
        run: npm run type-check

      - name: Check code formatting
        run: npm run format:check
```

---

### Phase 6: Jest Coverage Thresholds (5 minutes)

**Update `jest.config.js`:**

```javascript
const customJestConfig = {
  // ... existing config ...

  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },

  // ... rest of config ...
}
```

---

## Implementation Timeline

| Phase | Duration | Effort | Priority |
|-------|----------|--------|----------|
| 1. Core Tools Setup | 30 min | Low | High |
| 2. Configuration Files | 20 min | Medium | High |
| 3. Package.json Scripts | 10 min | Low | High |
| 4. Documentation | 30 min | Medium | High |
| 5. GitHub Actions Update | 15 min | Low | Medium |
| 6. Jest Coverage | 5 min | Low | Medium |
| **Total** | **110 min** | **~2 hours** | - |

## Expected Outcomes

### Immediate Benefits
- ✅ Automatic pre-commit quality checks
- ✅ Consistent code formatting
- ✅ Enforced conventional commits
- ✅ Prevention of broken commits
- ✅ CI/CD enforces all quality gates

### Long-term Benefits
- ✅ Reduced technical debt
- ✅ Easier code reviews
- ✅ Faster onboarding for new developers
- ✅ Claude Code follows workflows automatically
- ✅ Improved code maintainability
- ✅ Higher test coverage
- ✅ Fewer production bugs

## Success Metrics

Track these metrics after implementation:

1. **Code Quality**
   - Average function size <50 lines
   - Average file size <300 lines
   - Cyclomatic complexity <10
   - Zero ESLint errors

2. **Testing**
   - Test coverage >70%
   - All PRs have passing tests
   - Test count increases with features

3. **Process**
   - 100% conventional commits
   - Zero direct commits to main
   - All PRs pass CI before merge
   - Average PR review time

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Pre-commit hooks slow down commits | Medium | Only run tests on changed files |
| ESLint rules too strict | Low | Start with warnings, gradually enforce |
| Coverage threshold blocks PRs | Medium | Set threshold at 70%, not 80%+ |
| Team resistance to new rules | Medium | Document benefits, provide training |
| Legacy code fails new rules | High | Add eslint-disable with justification |

## Migration Strategy

### For Existing Code
- Run `npm run lint:fix` to auto-fix issues
- Run `npm run format` to format all files
- Add `eslint-disable` comments for legacy code with tracking issues
- Create backlog items to refactor flagged code

### For New Code
- All new code must pass quality gates
- No exceptions without explicit justification
- PRs without tests will be blocked

## Open Questions

1. Should we enforce TypeScript more strictly (`.ts`/`.tsx` instead of `.js`/`.jsx`)?
2. Do we want stricter complexity limits (e.g., max 8 instead of 10)?
3. Should we add visual regression testing with Percy or Chromatic?
4. Do we need commit message length limits?
5. Should we add spell-checking to pre-commit hooks?

## Next Steps

1. Review and approve this proposal
2. Schedule 2-hour implementation session
3. Implement Phases 1-6
4. Update team on new workflows
5. Monitor metrics for 2 weeks
6. Iterate on rules based on feedback

## References

- [ADR-011: Monolith Breakup Strategy](/docs/architecture/ADR-011-monolith-breakup.md)
- [ESLint Rules Documentation](https://eslint.org/docs/rules/)
- [SonarJS Rules](https://github.com/SonarSource/eslint-plugin-sonarjs)
- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)
