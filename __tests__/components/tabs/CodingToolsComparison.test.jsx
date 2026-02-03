import React from 'react'
import { render, screen } from '../../utils/test-utils'
import CodingToolsComparison from '../../../app/components/tabs/CodingToolsComparison'
import { mockAiToolsData } from '../../mocks/mockAiToolsData'

// Enhance mock data with codingProductivityMultiplier
const mockData = {
  ...mockAiToolsData,
  codingProductivityMultiplier: 14.1
}

describe('CodingToolsComparison', () => {
  it('renders without crashing', () => {
    render(<CodingToolsComparison aiToolsData={mockData} />)
    expect(screen.getByText('Coding Tools Comparison')).toBeInTheDocument()
  })

  it('displays subtitle description', () => {
    render(<CodingToolsComparison aiToolsData={mockData} />)
    expect(screen.getByText(/GitHub Copilot vs Claude Code/)).toBeInTheDocument()
  })

  it('displays GitHub Copilot users metric', () => {
    render(<CodingToolsComparison aiToolsData={mockData} />)
    expect(screen.getByText('GitHub Copilot Users')).toBeInTheDocument()
  })

  it('displays Claude Code users metric', () => {
    render(<CodingToolsComparison aiToolsData={mockData} />)
    expect(screen.getByText('Claude Code Users')).toBeInTheDocument()
  })

  it('displays productivity advantage', () => {
    render(<CodingToolsComparison aiToolsData={mockData} />)
    expect(screen.getByText('Productivity Advantage')).toBeInTheDocument()
    expect(screen.getByText('14.1x')).toBeInTheDocument()
  })

  it('displays engineering organization adoption section', () => {
    render(<CodingToolsComparison aiToolsData={mockData} />)
    expect(screen.getByText('Engineering Organization Adoption')).toBeInTheDocument()
  })
})
