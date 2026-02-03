import React from 'react'
import { render, screen } from '../../utils/test-utils'
import Portfolio from '../../../app/components/tabs/Portfolio'

// Mock react-markdown to avoid ESM issues
jest.mock('react-markdown', () => {
  return function MockReactMarkdown({ children }) {
    return <div data-testid="mock-markdown">{children}</div>
  }
})

const mockPortfolioData = {
  projects: [
    {
      id: 'proj-001',
      name: 'AI Assistant Integration',
      status: 'in-progress',
      priority: 'high'
    }
  ],
  methodology: {
    description: 'Hybrid scoring algorithm',
    formula: '(70% × Multi-Factor Score) + (30% × ROI Score)',
    components: ['Financial Impact', 'Strategic Alignment', 'Execution Feasibility']
  }
}

const mockProjectDetailsData = {
  'proj-001': {
    id: 'proj-001',
    name: 'AI Assistant Integration',
    description: 'Integrate AI capabilities',
    status: 'in-progress',
    phases: [
      { name: 'Phase 1', description: 'Planning', deliverables: ['Initial docs'] }
    ],
    kpis: [],
    resources: []
  }
}

describe('Portfolio', () => {
  it('renders portfolio table view without crashing', () => {
    const mockOnProjectSelect = jest.fn()
    const mockOnNavigateToAnnualPlan = jest.fn()

    render(
      <Portfolio
        portfolioData={mockPortfolioData}
        projectDetailsData={mockProjectDetailsData}
        selectedProject={null}
        onProjectSelect={mockOnProjectSelect}
        onNavigateToAnnualPlan={mockOnNavigateToAnnualPlan}
      />
    )

    expect(screen.getByText('AI Projects Portfolio - Priority & Scoring')).toBeInTheDocument()
  })

  it('displays portfolio summary description', () => {
    const mockOnProjectSelect = jest.fn()
    const mockOnNavigateToAnnualPlan = jest.fn()

    render(
      <Portfolio
        portfolioData={mockPortfolioData}
        projectDetailsData={mockProjectDetailsData}
        selectedProject={null}
        onProjectSelect={mockOnProjectSelect}
        onNavigateToAnnualPlan={mockOnNavigateToAnnualPlan}
      />
    )

    expect(screen.getByText(/11 AI projects ranked by hybrid scoring algorithm/)).toBeInTheDocument()
  })

  it('renders project detail view when project is selected', () => {
    const mockOnProjectSelect = jest.fn()
    const mockOnNavigateToAnnualPlan = jest.fn()

    render(
      <Portfolio
        portfolioData={mockPortfolioData}
        projectDetailsData={mockProjectDetailsData}
        selectedProject="proj-001"
        onProjectSelect={mockOnProjectSelect}
        onNavigateToAnnualPlan={mockOnNavigateToAnnualPlan}
      />
    )

    // ProjectDetail component should be rendered (we'll test it separately)
    // Just verify the portfolio table is NOT rendered
    expect(screen.queryByText('AI Projects Portfolio - Priority & Scoring')).not.toBeInTheDocument()
  })
})
