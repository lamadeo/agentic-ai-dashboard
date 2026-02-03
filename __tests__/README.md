# Testing Guide

## Overview

This directory contains unit tests for the AI Analytics Dashboard components using Jest and React Testing Library.

## Test Structure

```
__tests__/
├── components/
│   ├── shared/          # Tests for reusable components
│   ├── layout/          # Tests for layout components
│   └── tabs/            # Tests for tab components
├── mocks/
│   └── mockAiToolsData.js   # Mock data for testing
└── utils/
    └── test-utils.jsx       # Custom render utilities
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- MetricCard

# Run tests for specific directory
npm test -- --testPathPatterns="shared"
```

## Writing Tests

### Basic Component Test Example

```javascript
import React from 'react'
import { render, screen } from '../../utils/test-utils'
import MyComponent from '../../../app/components/MyComponent'

describe('MyComponent', () => {
  it('renders without crashing', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('displays data correctly', () => {
    const props = { title: 'Test Title' }
    render(<MyComponent {...props} />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })
})
```

### Testing with Mock Data

```javascript
import { mockAiToolsData } from '../../mocks/mockAiToolsData'

it('renders with mock data', () => {
  render(<TabComponent aiToolsData={mockAiToolsData} />)
  // Assertions here
})
```

## Test Coverage Goals

### Priority 1: Shared Components
- [x] MetricCard - Displays KPI metrics correctly
- [x] MarkdownRenderer - Parses and renders markdown
- [ ] ClaudeCodePowerUsersTable
- [ ] ClaudeCodeKeyInsights
- [ ] ClaudeCodeLowEngagementUsers

### Priority 2: Layout Components
- [ ] DashboardLayout
- [ ] DashboardHeader
- [ ] SidebarNavigation

### Priority 3: Tab Components (Smoke Tests)
Focus on ensuring tabs render without crashing with proper props:
- [ ] OverviewHome
- [ ] ClaudeEnterprise
- [ ] ClaudeCode
- [ ] M365Copilot
- [ ] CodingToolsComparison
- [ ] ProductivityToolsComparison
- [ ] ExpansionROI
- [ ] PerceivedValue
- [ ] Portfolio
- [ ] BriefingLeadership
- [ ] BriefingOrg
- [ ] Enablement
- [ ] AnnualPlan

## Testing Best Practices

1. **Smoke Tests First**: Ensure components render without errors
2. **Test User Interactions**: Click handlers, form inputs, navigation
3. **Test Data Display**: Verify props are displayed correctly
4. **Test Edge Cases**: Empty data, missing props, error states
5. **Avoid Implementation Details**: Test behavior, not internal state
6. **Use Semantic Queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`

## Mock Data

The `mockAiToolsData.js` file contains a representative sample of the dashboard data structure. Update this file when:
- Adding new data fields to components
- Testing edge cases that require specific data
- Adding new data structures

## Common Testing Patterns

### Testing a Component with Charts (Recharts)

```javascript
it('renders chart component', () => {
  render(<ComponentWithChart data={mockData} />)
  // Recharts creates SVG elements
  const chart = container.querySelector('svg')
  expect(chart).toBeInTheDocument()
})
```

### Testing Components with Lucide Icons

```javascript
import { Users } from 'lucide-react'

it('renders with icon', () => {
  render(<Component icon={Users} />)
  // Icons render as SVG elements
  expect(container.querySelector('svg')).toBeInTheDocument()
})
```

### Testing Conditional Rendering

```javascript
it('shows content when data exists', () => {
  render(<Component data={mockData} />)
  expect(screen.getByText('Content')).toBeInTheDocument()
})

it('hides content when data is missing', () => {
  render(<Component data={null} />)
  expect(screen.queryByText('Content')).not.toBeInTheDocument()
})
```

## Continuous Improvement

Tests should evolve with the codebase:
- Add tests when fixing bugs
- Update tests when refactoring components
- Increase coverage for critical user flows
- Review test failures in CI/CD pipeline

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
