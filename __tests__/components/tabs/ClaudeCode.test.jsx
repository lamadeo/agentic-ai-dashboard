import React from 'react'
import { render, screen } from '../../utils/test-utils'
import ClaudeCode from '../../../app/components/tabs/ClaudeCode'
import { mockAiToolsData } from '../../mocks/mockAiToolsData'

// Mock the sub-components to avoid deep dependency issues
jest.mock('../../../app/components/shared/ClaudeCodePowerUsersTable', () => {
  return function MockPowerUsersTable() {
    return <div data-testid="mock-power-users-table">Power Users Table</div>
  }
})

jest.mock('../../../app/components/shared/ClaudeCodeKeyInsights', () => {
  return function MockKeyInsights() {
    return <div data-testid="mock-key-insights">Key Insights</div>
  }
})

jest.mock('../../../app/components/shared/ClaudeCodeLowEngagementUsers', () => {
  return function MockLowEngagementUsers() {
    return <div data-testid="mock-low-engagement-users">Low Engagement Users</div>
  }
})

describe('ClaudeCode', () => {
  it('renders without crashing', () => {
    render(<ClaudeCode aiToolsData={mockAiToolsData} />)
    expect(screen.getByText('Claude Code Developer Impact')).toBeInTheDocument()
  })

  it('displays total lines generated', () => {
    render(<ClaudeCode aiToolsData={mockAiToolsData} />)
    expect(screen.getByText('Total Lines Generated')).toBeInTheDocument()
    expect(screen.getByText(/763K/)).toBeInTheDocument()
  })

  it('displays adoption metrics', () => {
    render(<ClaudeCode aiToolsData={mockAiToolsData} />)
    expect(screen.getByText('Adoption Rate')).toBeInTheDocument()
  })

  it('displays licensed users', () => {
    render(<ClaudeCode aiToolsData={mockAiToolsData} />)
    expect(screen.getByText('Licensed Users')).toBeInTheDocument()
  })

  it('displays active users', () => {
    render(<ClaudeCode aiToolsData={mockAiToolsData} />)
    expect(screen.getByText('Active Users')).toBeInTheDocument()
  })

  it('displays average lines per developer', () => {
    render(<ClaudeCode aiToolsData={mockAiToolsData} />)
    expect(screen.getByText('Avg Lines/Developer')).toBeInTheDocument()
  })

  it('handles missing data gracefully', () => {
    const incompleteData = {
      claudeCode: {
        totalLines: 0,
        licensedUsers: 1,
        monthlyTrend: [],
        linesPerUser: 0,
        powerUsers: [],
        departmentBreakdown: []
      },
      insights: {}
    }
    const { container } = render(<ClaudeCode aiToolsData={incompleteData} />)
    expect(container).toBeInTheDocument()
  })
})
