import React from 'react'
import { render, screen } from '../../utils/test-utils'
import MarkdownRenderer from '../../../app/components/shared/MarkdownRenderer'

describe('MarkdownRenderer', () => {
  it('renders plain text correctly', () => {
    const text = 'This is plain text'
    render(<MarkdownRenderer text={text} />)
    expect(screen.getByText('This is plain text')).toBeInTheDocument()
  })

  it('renders bold text with HTML', () => {
    const text = 'This is **bold text** in a sentence'
    const { container } = render(<MarkdownRenderer text={text} />)
    const boldElement = container.querySelector('strong')
    expect(boldElement).toBeInTheDocument()
    expect(boldElement).toHaveTextContent('bold text')
  })

  it('handles multiple bold sections', () => {
    const text = '**First** regular **second** more text'
    const { container } = render(<MarkdownRenderer text={text} />)
    const boldElements = container.querySelectorAll('strong')
    expect(boldElements).toHaveLength(2)
    expect(boldElements[0]).toHaveTextContent('First')
    expect(boldElements[1]).toHaveTextContent('second')
  })

  it('renders empty string without errors', () => {
    render(<MarkdownRenderer text="" />)
    // Should not throw error
  })

  it('renders text without markdown as-is', () => {
    const text = 'No markdown here at all'
    render(<MarkdownRenderer text={text} />)
    expect(screen.getByText('No markdown here at all')).toBeInTheDocument()
  })
})
