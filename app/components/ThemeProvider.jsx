'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({ children }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"          // Dark mode as default
      enableSystem={true}           // Respect system preference
      disableTransitionOnChange    // Prevent flash
    >
      {children}
    </NextThemesProvider>
  )
}
