'use client'
import { useState, useEffect } from 'react'

export interface PerformanceSettings {
  reduceMotion: boolean
  isMobile: boolean
  isLowEndDevice: boolean
  particleCount: number
  animationDuration: number
  enableComplexAnimations: boolean
}

export const usePerformanceOptimization = (): PerformanceSettings => {
  const [settings, setSettings] = useState<PerformanceSettings>({
    reduceMotion: false,
    isMobile: false,
    isLowEndDevice: false,
    particleCount: 15,
    animationDuration: 1,
    enableComplexAnimations: true
  })

  useEffect(() => {
    // Detectar preferencias de movimiento reducido
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Detectar dispositivos móviles
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth < 768

    // Detectar dispositivos de bajo rendimiento
    const isLowEnd = (() => {
      // @ts-ignore - navigator.hardwareConcurrency puede no estar disponible
      const cores = navigator.hardwareConcurrency || 4
      // @ts-ignore - navigator.deviceMemory puede no estar disponible  
      const memory = navigator.deviceMemory || 4

      return cores <= 2 || memory <= 2
    })()

    // Configurar ajustes basados en el dispositivo
    const optimizedSettings: PerformanceSettings = {
      reduceMotion: prefersReducedMotion,
      isMobile: isMobileDevice,
      isLowEndDevice: isLowEnd,
      particleCount: prefersReducedMotion ? 0 : isLowEnd ? 5 : isMobileDevice ? 8 : 15,
      animationDuration: prefersReducedMotion ? 0.3 : isLowEnd ? 0.5 : 1,
      enableComplexAnimations: !prefersReducedMotion && !isLowEnd
    }

    setSettings(optimizedSettings)

    // Listener para cambios en las preferencias de movimiento
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (e: MediaQueryListEvent) => {
      setSettings(prev => ({
        ...prev,
        reduceMotion: e.matches,
        particleCount: e.matches ? 0 : prev.particleCount,
        enableComplexAnimations: !e.matches && !prev.isLowEndDevice
      }))
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return settings
}

// Hook para lazy loading de animaciones
export const useAnimationLazyLoad = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false)
  const [ref, setRef] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (!ref) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(ref)
        }
      },
      { threshold }
    )

    observer.observe(ref)
    return () => observer.disconnect()
  }, [ref, threshold])

  return { isVisible, ref: setRef }
}

// Utilidades para animaciones optimizadas
export const getOptimizedAnimationProps = (settings: PerformanceSettings) => ({
  initial: settings.reduceMotion ? {} : { opacity: 0, y: 20 },
  animate: settings.reduceMotion ? {} : { opacity: 1, y: 0 },
  transition: {
    duration: settings.animationDuration,
    ease: settings.enableComplexAnimations ? "easeOut" : "linear"
  }
})

export const getOptimizedParticleCount = (settings: PerformanceSettings, baseCount: number) => {
  if (settings.reduceMotion) return 0
  if (settings.isLowEndDevice) return Math.min(3, baseCount)
  if (settings.isMobile) return Math.min(8, baseCount)
  return baseCount
}