'use client'

import { useState, useEffect, useCallback } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface UseThemeReturn {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  systemTheme: 'light' | 'dark'
}

const THEME_STORAGE_KEY = 'ai-prompt-theme'

export const useTheme = (): UseThemeReturn => {
  const [theme, setThemeState] = useState<Theme>('system')
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  // Get system theme preference
  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }, [])

  // Apply theme to document
  const applyTheme = useCallback((resolvedTheme: 'light' | 'dark') => {
    if (typeof document === 'undefined') return
    
    const root = document.documentElement
    
    if (resolvedTheme === 'dark') {
      root.classList.add('dark')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.remove('dark')
      root.style.colorScheme = 'light'
    }
  }, [])

  // Get resolved theme (actual theme being used)
  const getResolvedTheme = useCallback((currentTheme: Theme): 'light' | 'dark' => {
    if (currentTheme === 'system') {
      return systemTheme
    }
    return currentTheme
  }, [systemTheme])

  // Set theme and persist to localStorage
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, newTheme)
      } catch (error) {
        console.warn('Failed to save theme preference:', error)
      }
    }
    
    const resolved = getResolvedTheme(newTheme)
    applyTheme(resolved)
  }, [getResolvedTheme, applyTheme])

  // Toggle between light and dark (skip system)
  const toggleTheme = useCallback(() => {
    const resolved = getResolvedTheme(theme)
    const newTheme = resolved === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }, [theme, getResolvedTheme, setTheme])

  // Initialize theme on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Get initial system theme
    const initialSystemTheme = getSystemTheme()
    setSystemTheme(initialSystemTheme)

    // Get saved theme preference
    let savedTheme: Theme = 'system'
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY)
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        savedTheme = stored as Theme
      }
    } catch (error) {
      console.warn('Failed to load theme preference:', error)
    }

    setThemeState(savedTheme)
    
    // Apply initial theme
    const resolved = savedTheme === 'system' ? initialSystemTheme : savedTheme
    applyTheme(resolved)
    
    setMounted(true)
  }, [getSystemTheme, applyTheme])

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      const newSystemTheme = e.matches ? 'dark' : 'light'
      setSystemTheme(newSystemTheme)
      
      // If current theme is system, apply the new system theme
      if (theme === 'system') {
        applyTheme(newSystemTheme)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, applyTheme])

  // Update resolved theme when theme or systemTheme changes
  useEffect(() => {
    if (!mounted) return
    
    const resolved = getResolvedTheme(theme)
    applyTheme(resolved)
  }, [theme, systemTheme, mounted, getResolvedTheme, applyTheme])

  const resolvedTheme = getResolvedTheme(theme)

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    systemTheme
  }
}

// Hook for theme-aware components
export const useThemeAware = () => {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Return system theme during SSR to avoid hydration mismatch
  if (!mounted) {
    return 'light'
  }

  return resolvedTheme
}

// Utility function to get theme-specific classes
export const getThemeClasses = (lightClass: string, darkClass: string, theme?: 'light' | 'dark') => {
  if (typeof window === 'undefined') return lightClass
  
  const currentTheme = theme || (document.documentElement.classList.contains('dark') ? 'dark' : 'light')
  return currentTheme === 'dark' ? darkClass : lightClass
}

// Utility function to check if dark mode is active
export const isDarkMode = (): boolean => {
  if (typeof window === 'undefined') return false
  return document.documentElement.classList.contains('dark')
}

// Theme transition utility
export const enableThemeTransition = () => {
  if (typeof document === 'undefined') return
  
  const css = document.createElement('style')
  css.appendChild(
    document.createTextNode(
      `* {
        transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease !important;
      }`
    )
  )
  document.head.appendChild(css)
  
  // Remove transition after animation completes
  setTimeout(() => {
    document.head.removeChild(css)
  }, 300)
}