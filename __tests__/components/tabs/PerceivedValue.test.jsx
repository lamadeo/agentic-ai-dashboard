import React from 'react'
import { render, screen } from '../../utils/test-utils'
import PerceivedValue from '../../../app/components/tabs/PerceivedValue'

const mockPerceivedValueData = {
  perceivedValue: {
    'Claude Enterprise': {
      score: 87,
      totalFeedback: 45,
      sentimentBreakdown: {
        positive: 38,
        neutral: 5,
        negative: 2
      },
      themes: ['Efficiency', 'Quality'],
      topImpacts: [],
      quotes: []
    },
    'Claude Code': {
      score: 92,
      totalFeedback: 22,
      sentimentBreakdown: {
        positive: 20,
        neutral: 1,
        negative: 1
      },
      themes: ['Productivity', 'Speed'],
      topImpacts: [],
      quotes: []
    }
  },
  summary: {
    totalResponses: 67,
    overallSentiment: 'positive',
    uniqueMessages: 67,
    sourceBreakdown: {
      slack: 45,
      confluence: 12,
      surveys: 10
    }
  },
  lastUpdated: '2026-01-08T00:00:00Z'
}

describe('PerceivedValue', () => {
  it('renders without crashing', () => {
    render(<PerceivedValue perceivedValueData={mockPerceivedValueData} />)
    expect(screen.getByText('Perceived Value & Sentiment Analysis')).toBeInTheDocument()
  })

  it('displays subtitle description', () => {
    render(<PerceivedValue perceivedValueData={mockPerceivedValueData} />)
    expect(screen.getByText(/Employee feedback from Slack, Confluence, surveys, and interviews/)).toBeInTheDocument()
  })

  it('renders tool cards with scores', () => {
    render(<PerceivedValue perceivedValueData={mockPerceivedValueData} />)
    expect(screen.getByText('Claude Enterprise')).toBeInTheDocument()
    expect(screen.getByText('Claude Code')).toBeInTheDocument()
    expect(screen.getByText('87')).toBeInTheDocument()
    expect(screen.getByText('92')).toBeInTheDocument()
  })

  it('displays feedback counts', () => {
    render(<PerceivedValue perceivedValueData={mockPerceivedValueData} />)
    expect(screen.getByText('45 responses')).toBeInTheDocument()
    expect(screen.getByText('22 responses')).toBeInTheDocument()
  })

  it('handles empty data gracefully', () => {
    const emptyData = {
      perceivedValue: {},
      summary: {
        totalResponses: 0,
        overallSentiment: 'neutral',
        uniqueMessages: 0,
        sourceBreakdown: {
          slack: 0,
          confluence: 0,
          surveys: 0
        }
      },
      lastUpdated: '2026-01-08T00:00:00Z'
    }
    const { container } = render(<PerceivedValue perceivedValueData={emptyData} />)
    expect(container).toBeInTheDocument()
  })
})
