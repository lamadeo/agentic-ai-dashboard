import './globals.css'
import { ThemeProvider } from './components/ThemeProvider'

export const metadata = {
  title: 'Agentic AI Dashboard',
  description: 'Track AI tool adoption and ROI across your organization',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
