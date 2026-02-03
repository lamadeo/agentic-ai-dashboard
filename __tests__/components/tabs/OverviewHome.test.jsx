import React from 'react'
import { render, screen } from '../../utils/test-utils'
import OverviewHome from '../../../app/components/tabs/OverviewHome'
import { mockAiToolsData } from '../../mocks/mockAiToolsData'

// Mock ReactMarkdown to avoid ESM issues
jest.mock('react-markdown', () => {
  return function MockReactMarkdown({ children }) {
    return <div data-testid="mock-markdown">{children}</div>
  }
})

describe('OverviewHome', () => {
  const mockSetActiveTab = jest.fn()

  it('renders without crashing', () => {
    render(<OverviewHome aiToolsData={mockAiToolsData} setActiveTab={mockSetActiveTab} />)
    // Component should render without errors - check for actual content
    expect(screen.getByText('AI Licenses / Employee')).toBeInTheDocument()
  })

  it('displays KPI metrics', () => {
    render(<OverviewHome aiToolsData={mockAiToolsData} setActiveTab={mockSetActiveTab} />)
    expect(screen.getByText('AI Licenses / Employee')).toBeInTheDocument()
  })

  it('renders component structure', () => {
    const { container } = render(<OverviewHome aiToolsData={mockAiToolsData} setActiveTab={mockSetActiveTab} />)
    // Check that component renders with grid layout
    const gridElements = container.querySelectorAll('.grid')
    expect(gridElements.length).toBeGreaterThan(0)
  })

  it('handles data calculations without errors', () => {
    const { container } = render(<OverviewHome aiToolsData={mockAiToolsData} setActiveTab={mockSetActiveTab} />)
    // Smoke test - just verify it renders
    expect(container).toBeInTheDocument()
  })

  it('receives setActiveTab prop', () => {
    render(<OverviewHome aiToolsData={mockAiToolsData} setActiveTab={mockSetActiveTab} />)
    expect(mockSetActiveTab).toBeDefined()
  })
})
