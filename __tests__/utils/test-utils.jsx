import React from 'react'
import { render } from '@testing-library/react'

/**
 * Custom render function that wraps components with necessary providers
 * Currently just uses default render, but can be extended with providers as needed
 */
export function renderWithProviders(ui, options = {}) {
  return render(ui, { ...options })
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { renderWithProviders as render }
