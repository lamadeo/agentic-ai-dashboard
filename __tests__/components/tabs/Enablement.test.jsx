import React from 'react'
import { render, screen } from '../../utils/test-utils'
import Enablement from '../../../app/components/tabs/Enablement'
import { mockEnablementPlan } from '../../mocks/mockAiToolsData'

describe('Enablement', () => {
  it('renders without crashing', () => {
    render(<Enablement enablementPlan={mockEnablementPlan} />)
    expect(screen.getByText(mockEnablementPlan.programTitle)).toBeInTheDocument()
  })

  it('displays program title', () => {
    render(<Enablement enablementPlan={mockEnablementPlan} />)
    expect(screen.getByText('AI Enablement Program - $375K Annual Investment')).toBeInTheDocument()
  })

  it('renders budget breakdown items', () => {
    render(<Enablement enablementPlan={mockEnablementPlan} />)
    expect(screen.getByText('Enablement Lead')).toBeInTheDocument()
    expect(screen.getByText('Integration Engineer')).toBeInTheDocument()
    expect(screen.getByText('Training Budget')).toBeInTheDocument()
  })

  it('displays key deliverables', () => {
    render(<Enablement enablementPlan={mockEnablementPlan} />)
    expect(screen.getByText('Key Deliverables')).toBeInTheDocument()
    expect(screen.getByText(/Train 170\+ new users/)).toBeInTheDocument()
  })

  it('shows expected impact metrics', () => {
    render(<Enablement enablementPlan={mockEnablementPlan} />)
    expect(screen.getByText('Expected Impact')).toBeInTheDocument()
    expect(screen.getByText('Daily Active Rate')).toBeInTheDocument()
    expect(screen.getByText('53% → 75%')).toBeInTheDocument()
  })

  it('displays foundation note', () => {
    render(<Enablement enablementPlan={mockEnablementPlan} />)
    expect(screen.getByText(/Built on existing marketplace/)).toBeInTheDocument()
  })
})
