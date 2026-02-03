import React from 'react'
import { render, screen } from '../../utils/test-utils'
import M365Copilot from '../../../app/components/tabs/M365Copilot'
import { mockAiToolsData } from '../../mocks/mockAiToolsData'

// Add m365CopilotDeepDive to mock data
const mockData = {
  ...mockAiToolsData,
  m365CopilotDeepDive: {
    summaryMetrics: {
      totalActiveUsers: 238,
      avgPromptsPerDay: 42.5,
      totalPrompts: 15384,
      avgDaysActivePerMonth: 18,
      mostUsedApp: 'Teams'
    },
    powerUsers: [
      {
        name: 'John Doe',
        email: 'jdoe@techco.com',
        totalPrompts: 1250,
        department: 'Product',
        activeDays: 45,
        promptsPerDay: 27.8,
        appsUsed: ['Teams', 'Outlook', 'Word']
      }
    ],
    appUsage: [
      { app: 'Teams', users: 215, prompts: 8500 },
      { app: 'Outlook', users: 180, prompts: 5200 }
    ],
    appAdoption: [
      { app: 'Teams', percent: 90 },
      { app: 'Outlook', percent: 75 }
    ],
    departmentPerformance: [
      {
        department: 'Product',
        userCount: 15,
        totalPrompts: 2500,
        avgPromptsPerUser: 166.7,
        avgPrompts: 166.7,
        avgPromptsPerDay: 8.3,
        rank: 1
      },
      {
        department: 'Engineering',
        userCount: 50,
        totalPrompts: 5000,
        avgPromptsPerUser: 100,
        avgPrompts: 100,
        avgPromptsPerDay: 5.0,
        rank: 2
      }
    ],
    userSegments: {
      powerUsers: {
        threshold: '≥100 prompts/month',
        count: 45
      },
      engagedUsers: {
        threshold: '50-99 prompts/month',
        count: 82
      },
      regularUsers: {
        threshold: '20-49 prompts/month',
        count: 65
      },
      lightUsers: {
        threshold: '<20 prompts/month',
        count: 46
      }
    },
    opportunities: {
      lowPowerPointUsage: {
        gapUsers: 25,
        currentUsers: 80,
        targetUsers: 105,
        potentialValue: '$12,500/month potential value'
      },
      inactiveUsers: {
        count: 13,
        potentialValue: '$3,250/month'
      },
      lowEngagement: {
        count: 46,
        potentialValue: '$5,750/month'
      },
      lowEngagementUsers: {
        count: 46,
        departments: ['Sales', 'Customer Success', 'Finance'],
        users: [
          {
            name: 'Jane Doe',
            email: 'jane@techco.com',
            department: 'Sales',
            totalPrompts: 8,
            activeDays: 5,
            promptsPerDay: 1.6
          },
          {
            name: 'Bob Smith',
            email: 'bob@techco.com',
            department: 'Finance',
            totalPrompts: 5,
            activeDays: 3,
            promptsPerDay: 1.7
          }
        ]
      }
    }
  }
}

describe('M365Copilot', () => {
  it('renders without crashing', () => {
    render(<M365Copilot aiToolsData={mockData} latestMonthLabel="January 2026" />)
    expect(screen.getByText(/M365 Copilot Usage Overview/)).toBeInTheDocument()
  })

  it('displays summary metrics', () => {
    render(<M365Copilot aiToolsData={mockData} latestMonthLabel="January 2026" />)
    expect(screen.getByText('Total Active Users')).toBeInTheDocument()
    expect(screen.getByText('Avg Prompts/Day')).toBeInTheDocument()
  })

  it('shows not available message when data is missing', () => {
    const incompleteData = {
      ...mockAiToolsData,
      m365CopilotDeepDive: null
    }
    render(<M365Copilot aiToolsData={incompleteData} latestMonthLabel="January 2026" />)
    expect(screen.getByText('M365 Copilot data not available')).toBeInTheDocument()
  })

  it('handles undefined m365CopilotDeepDive gracefully', () => {
    const dataWithoutDeepDive = {
      ...mockAiToolsData
    }
    delete dataWithoutDeepDive.m365CopilotDeepDive

    render(<M365Copilot aiToolsData={dataWithoutDeepDive} latestMonthLabel="January 2026" />)
    expect(screen.getByText('M365 Copilot data not available')).toBeInTheDocument()
  })
})
