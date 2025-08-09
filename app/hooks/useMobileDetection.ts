'use client'

import { useState, useEffect } from 'react'

interface MobileDetection {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isTouchDevice: boolean
  screenSize: 'mobile' | 'tablet' | 'desktop'
  orientation: 'portrait' | 'landscape'
  isIOS: boolean
  isAndroid: boolean
  deviceType: 'mobile' | 'tablet' | 'desktop'
}

export function useMobileDetection(): MobileDetection {
  const [detection, setDetection] = useState<MobileDetection>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouchDevice: false,
    screenSize: 'desktop',
    orientation: 'landscape',
    isIOS: false,
    isAndroid: false,
    deviceType: 'desktop'
  })
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const detectDevice = () => {
      if (typeof window === 'undefined') return

      const userAgent = navigator.userAgent.toLowerCase()
      const width = window.innerWidth
      const height = window.innerHeight
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      
      // Detectar sistema operativo
      const isIOS = /ipad|iphone|ipod/.test(userAgent)
      const isAndroid = /android/.test(userAgent)
      
      // Detectar tipo de dispositivo por tamaño de pantalla
      const isMobile = width < 768
      const isTablet = width >= 768 && width < 1024
      const isDesktop = width >= 1024
      
      // Detectar orientación
      const orientation = height > width ? 'portrait' : 'landscape'
      
      // Determinar tamaño de pantalla
      let screenSize: 'mobile' | 'tablet' | 'desktop' = 'desktop'
      if (isMobile) screenSize = 'mobile'
      else if (isTablet) screenSize = 'tablet'
      
      // Determinar tipo de dispositivo (más específico)
      let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop'
      if (isMobile || (isTouchDevice && width < 768)) {
        deviceType = 'mobile'
      } else if (isTablet || (isTouchDevice && width < 1024)) {
        deviceType = 'tablet'
      }
      
      setDetection({
        isMobile,
        isTablet,
        isDesktop,
        isTouchDevice,
        screenSize,
        orientation,
        isIOS,
        isAndroid,
        deviceType
      })
    }

    // Detectar al cargar
    detectDevice()

    // Detectar al cambiar tamaño de ventana
    window.addEventListener('resize', detectDevice)
    window.addEventListener('orientationchange', detectDevice)

    return () => {
      window.removeEventListener('resize', detectDevice)
      window.removeEventListener('orientationchange', detectDevice)
    }
  }, [isClient])

  return detection
}

// Hook adicional para gestos táctiles
export function useTouchGestures() {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distanceX = touchStart.x - touchEnd.x
    const distanceY = touchStart.y - touchEnd.y
    const isLeftSwipe = distanceX > 50
    const isRightSwipe = distanceX < -50
    const isUpSwipe = distanceY > 50
    const isDownSwipe = distanceY < -50

    return {
      isLeftSwipe,
      isRightSwipe,
      isUpSwipe,
      isDownSwipe,
      distanceX,
      distanceY
    }
  }

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  }
}