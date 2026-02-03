import React from 'react'
import { render, screen } from '../../utils/test-utils'
import BriefingLeadership from '../../../app/components/tabs/BriefingLeadership'
import { mockAiToolsData } from '../../mocks/mockAiToolsData'

// Mock react-markdown to avoid ESM issues
jest.mock('react-markdown', () => {
  return function MockReactMarkdown({ children }) {
    return <div data-testid="mock-markdown">{children}</div>
  }
})

describe('BriefingLeadership', () => {
  it('renders without crashing', () => {
    render(<BriefingLeadership insights={mockAiToolsData.insights} />)
    expect(screen.getByText('Executive Leadership Summary')).toBeInTheDocument()
  })

  it('displays subtitle for target audience', () => {
    render(<BriefingLeadership insights={mockAiToolsData.insights} />)
    expect(screen.getByText('For Executive Leadership Team & Board of Directors')).toBeInTheDocument()
  })

  it('renders download button when executiveSummary exists', () => {
    render(<BriefingLeadership insights={mockAiToolsData.insights} />)
    expect(screen.getByText('Download as Markdown')).toBeInTheDocument()
  })

  it('renders executive summary content', () => {
    render(<BriefingLeadership insights={mockAiToolsData.insights} />)
    // Check that the mock markdown is rendered
    expect(screen.getByTestId('mock-markdown')).toBeInTheDocument()
    // Check that the content is passed to ReactMarkdown
    expect(screen.getByTestId('mock-markdown')).toHaveTextContent(/Strong adoption at 97%/)
  })

  it('shows placeholder when no executive summary', () => {
    render(<BriefingLeadership insights={{}} />)
    expect(screen.getByText(/Executive summary will be generated when data is parsed/)).toBeInTheDocument()
  })

  it('hides download button when no executive summary', () => {
    render(<BriefingLeadership insights={{}} />)
    expect(screen.queryByText('Download as Markdown')).not.toBeInTheDocument()
  })
})
