'use client'

import { useState, useEffect } from 'react'

export interface ViewportState {
  width: number
  height: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  orientation: 'portrait' | 'landscape'
  hasTouch: boolean
}

export interface ResponsiveConfig {
  breakpoints: {
    mobile: number
    tablet: number
    desktop: number
  }
  touchTargetSize: number
}

export const RESPONSIVE_CONFIG: ResponsiveConfig = {
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1200
  },
  touchTargetSize: 44
}

export function useViewport(): ViewportState {
  const [viewport, setViewport] = useState<ViewportState>({
    width: 0,
    height: 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    orientation: 'portrait',
    hasTouch: false
  })

  useEffect(() => {
    const updateViewport = () => {
      if (typeof window === 'undefined') return

      const width = window.innerWidth
      const height = window.innerHeight
      const isMobile = width < RESPONSIVE_CONFIG.breakpoints.mobile
      const isTablet = width >= RESPONSIVE_CONFIG.breakpoints.mobile && width < RESPONSIVE_CONFIG.breakpoints.desktop
      const isDesktop = width >= RESPONSIVE_CONFIG.breakpoints.desktop
      const orientation = width > height ? 'landscape' : 'portrait'
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0

      setViewport({
        width,
        height,
        isMobile,
        isTablet,
        isDesktop,
        orientation,
        hasTouch
      })
    }

    // Initial update
    updateViewport()

    // Add event listener with debounce
    let timeoutId: NodeJS.Timeout
    const debouncedUpdate = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(updateViewport, 100)
    }

    window.addEventListener('resize', debouncedUpdate)
    window.addEventListener('orientationchange', debouncedUpdate)

    return () => {
      window.removeEventListener('resize', debouncedUpdate)
      window.removeEventListener('orientationchange', debouncedUpdate)
      clearTimeout(timeoutId)
    }
  }, [])

  return viewport
}