import React from 'react'
import { render, screen } from '../../utils/test-utils'
import MetricCard from '../../../app/components/shared/MetricCard'
import { Users } from 'lucide-react'

describe('MetricCard', () => {
  const defaultProps = {
    title: 'Total Users',
    value: '1,234',
    icon: Users,
    color: 'blue'
  }

  it('renders without crashing', () => {
    render(<MetricCard {...defaultProps} />)
    expect(screen.getByText('Total Users')).toBeInTheDocument()
  })

  it('displays the title correctly', () => {
    render(<MetricCard {...defaultProps} />)
    expect(screen.getByText('Total Users')).toBeInTheDocument()
  })

  it('displays the value correctly', () => {
    render(<MetricCard {...defaultProps} />)
    expect(screen.getByText('1,234')).toBeInTheDocument()
  })

  it('renders with change information when provided', () => {
    const propsWithChange = {
      ...defaultProps,
      change: '+15%',
      changeLabel: 'vs last month'
    }
    render(<MetricCard {...propsWithChange} />)
    expect(screen.getByText('+15%')).toBeInTheDocument()
    expect(screen.getByText('vs last month')).toBeInTheDocument()
  })

  it('applies the correct color class', () => {
    const { container } = render(<MetricCard {...defaultProps} color="green" />)
    const coloredDiv = container.querySelector('.bg-green-50')
    expect(coloredDiv).toBeInTheDocument()
  })

  it('renders without change information when not provided', () => {
    render(<MetricCard {...defaultProps} />)
    expect(screen.queryByText('+15%')).not.toBeInTheDocument()
  })
})
