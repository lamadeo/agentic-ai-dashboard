import React from 'react'
import { render, screen } from '../../utils/test-utils'
import BriefingOrg from '../../../app/components/tabs/BriefingOrg'

const mockInsights = {
  allHandsMessage: 'SLIDE 1: Overview\n\nKey metrics for the month\n\nSLIDE 2: Adoption\n\nStrong adoption across teams'
}

describe('BriefingOrg', () => {
  it('renders without crashing', () => {
    render(<BriefingOrg insights={mockInsights} />)
    expect(screen.getByText('Company-wide Summary')).toBeInTheDocument()
  })

  it('displays subtitle for target audience', () => {
    render(<BriefingOrg insights={mockInsights} />)
    expect(screen.getByText(/For Monthly All Hands Meetings/)).toBeInTheDocument()
  })

  it('renders download button when allHandsMessage exists', () => {
    render(<BriefingOrg insights={mockInsights} />)
    expect(screen.getByText('Download as Markdown')).toBeInTheDocument()
  })

  it('renders slides content', () => {
    render(<BriefingOrg insights={mockInsights} />)
    // Check that the content is rendered
    expect(screen.getByText(/SLIDE 1:/)).toBeInTheDocument()
  })

  it('shows placeholder when no allHandsMessage', () => {
    render(<BriefingOrg insights={{}} />)
    expect(screen.getByText(/All Hands message will be generated when data is parsed/)).toBeInTheDocument()
  })

  it('hides download button when no allHandsMessage', () => {
    render(<BriefingOrg insights={{}} />)
    expect(screen.queryByText('Download as Markdown')).not.toBeInTheDocument()
  })
})
