import React from 'react'
import { render, screen } from '../../utils/test-utils'
import AnnualPlan from '../../../app/components/tabs/AnnualPlan'
import { mockAiToolsData } from '../../mocks/mockAiToolsData'

// Mock the AnnualPlanPresentation component since it's complex
jest.mock('../../../app/components/AnnualPlanPresentation', () => {
  return function MockAnnualPlanPresentation({ aiToolsData }) {
    return (
      <div data-testid="mock-annual-plan-presentation">
        <p>Annual Plan Presentation</p>
        <p>Has Data: {aiToolsData ? 'Yes' : 'No'}</p>
      </div>
    )
  }
})

describe('AnnualPlan', () => {
  it('renders without crashing', () => {
    render(<AnnualPlan aiToolsData={mockAiToolsData} />)
    expect(screen.getByTestId('mock-annual-plan-presentation')).toBeInTheDocument()
  })

  it('passes aiToolsData to AnnualPlanPresentation', () => {
    render(<AnnualPlan aiToolsData={mockAiToolsData} />)
    expect(screen.getByText('Has Data: Yes')).toBeInTheDocument()
  })

  it('renders wrapper with proper height class', () => {
    const { container } = render(<AnnualPlan aiToolsData={mockAiToolsData} />)
    const wrapper = container.querySelector('.h-\\[calc\\(100vh-12rem\\)\\]')
    expect(wrapper).toBeInTheDocument()
  })
})
