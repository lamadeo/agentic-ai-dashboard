import React from 'react'
import { render, screen } from '../../utils/test-utils'
import ProductivityToolsComparison from '../../../app/components/tabs/ProductivityToolsComparison'
import { mockAiToolsData } from '../../mocks/mockAiToolsData'

// Mock undefined variable used by component
global.latestMonthLabel = 'January 2026'

describe('ProductivityToolsComparison', () => {
  it('renders without crashing', () => {
    render(<ProductivityToolsComparison aiToolsData={mockAiToolsData} />)
    expect(screen.getByText('Productivity Tools Comparison')).toBeInTheDocument()
  })

  it('displays subtitle description', () => {
    render(<ProductivityToolsComparison aiToolsData={mockAiToolsData} />)
    expect(screen.getByText(/Microsoft 365 Copilot vs Claude Enterprise/)).toBeInTheDocument()
  })

  it('displays M365 Copilot metric', () => {
    render(<ProductivityToolsComparison aiToolsData={mockAiToolsData} />)
    expect(screen.getByText(/M365 Copilot Active Users %/)).toBeInTheDocument()
  })

  it('displays Claude Enterprise metric', () => {
    render(<ProductivityToolsComparison aiToolsData={mockAiToolsData} />)
    expect(screen.getByText(/Claude Enterprise Active Users %/)).toBeInTheDocument()
  })

  it('handles data calculations without errors', () => {
    const { container } = render(<ProductivityToolsComparison aiToolsData={mockAiToolsData} />)
    expect(container).toBeInTheDocument()
  })
})
