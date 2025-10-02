'use client'

import { ThemeProvider } from 'next-themes'
import { ReactNode, useEffect, useState } from 'react'

interface ThemeProviderWrapperProps {
  children: ReactNode
  attribute?: 'class' | 'data-theme'
  defaultTheme?: string
  enableSystem?: boolean
}

// Wrapper component to handle React 19 compatibility issues with next-themes
export function ThemeProviderWrapper({
  children,
  attribute = 'class',
  defaultTheme = 'system',
  enableSystem = true,
}: ThemeProviderWrapperProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by not rendering ThemeProvider on server
  if (!mounted) {
    return <div suppressHydrationWarning>{children}</div>
  }

  try {
    return (
      <ThemeProvider
        attribute={attribute}
        defaultTheme={defaultTheme}
        enableSystem={enableSystem}
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    )
  } catch (error) {
    console.error('❌ Error in ThemeProvider:', error)
    // Fallback without theme provider
    return <div suppressHydrationWarning>{children}</div>
  }
}

export default ThemeProviderWrapper