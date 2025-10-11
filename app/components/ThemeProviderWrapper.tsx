'use client'

import { ReactNode, useEffect, useState } from 'react'

interface ThemeProviderWrapperProps {
  children: ReactNode
  attribute?: 'class' | 'data-theme'
  defaultTheme?: string
  enableSystem?: boolean
}

// Simple theme provider wrapper that doesn't depend on next-themes
function ThemeProviderWrapper({
  children,
  attribute = 'class',
  defaultTheme = 'system',
  enableSystem = true,
}: ThemeProviderWrapperProps) {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<string>(defaultTheme)

  useEffect(() => {
    setMounted(true)
    
    // Check for saved theme preference or default to system
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setTheme(savedTheme)
      applyTheme(savedTheme)
    } else if (enableSystem) {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      setTheme(systemTheme)
      applyTheme(systemTheme)
    }
  }, [defaultTheme, enableSystem])

  const applyTheme = (newTheme: string) => {
    if (attribute === 'class') {
      document.documentElement.classList.remove('light', 'dark')
      if (newTheme !== 'system') {
        document.documentElement.classList.add(newTheme)
      } else {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        document.documentElement.classList.add(systemTheme)
      }
    } else if (attribute === 'data-theme') {
      document.documentElement.setAttribute('data-theme', newTheme)
    }
  }

  // Prevent hydration mismatch by not rendering theme logic on server
  if (!mounted) {
    return <div suppressHydrationWarning>{children}</div>
  }

  return <div suppressHydrationWarning>{children}</div>
}

export default ThemeProviderWrapper;