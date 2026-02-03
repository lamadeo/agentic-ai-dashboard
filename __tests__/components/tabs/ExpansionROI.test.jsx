import React from 'react'
import { render, screen } from '../../utils/test-utils'
import ExpansionROI from '../../../app/components/tabs/ExpansionROI'
import { mockAiToolsData } from '../../mocks/mockAiToolsData'

describe('ExpansionROI', () => {
  it('renders without crashing', () => {
    render(<ExpansionROI aiToolsData={mockAiToolsData} />)
    expect(screen.getByText('Claude Ent Organization Coverage Analysis')).toBeInTheDocument()
  })

  it('displays organization coverage section', () => {
    render(<ExpansionROI aiToolsData={mockAiToolsData} />)
    expect(screen.getByText('Claude Ent Organization Coverage Analysis')).toBeInTheDocument()
  })

  it('displays total organization employees', () => {
    render(<ExpansionROI aiToolsData={mockAiToolsData} />)
    expect(screen.getByText('Total Organization')).toBeInTheDocument()
    expect(screen.getByText('251')).toBeInTheDocument()
  })

  it('displays current licensed metric', () => {
    render(<ExpansionROI aiToolsData={mockAiToolsData} />)
    expect(screen.getByText('Current Licensed')).toBeInTheDocument()
  })

  it('displays unlicensed opportunity', () => {
    render(<ExpansionROI aiToolsData={mockAiToolsData} />)
    expect(screen.getByText('Unlicensed')).toBeInTheDocument()
  })

  it('displays unrealized value metric', () => {
    render(<ExpansionROI aiToolsData={mockAiToolsData} />)
    expect(screen.getByText('Unrealized Value')).toBeInTheDocument()
  })
})
