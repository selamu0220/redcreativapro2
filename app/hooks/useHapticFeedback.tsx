'use client'

import React, { useCallback } from 'react'
import { useMobileDetection } from './useMobileDetection'

// Tipos de feedback háptico
type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'impact' | 'notification'

// Interface para el feedback háptico
interface HapticFeedback {
  vibrate: (pattern?: number | number[]) => void
  impact: (intensity?: 'light' | 'medium' | 'heavy') => void
  selection: () => void
  notification: (type?: 'success' | 'warning' | 'error') => void
  isSupported: boolean
}

export function useHapticFeedback(): HapticFeedback {
  const { isMobile, isIOS } = useMobileDetection()

  // Verificar si el dispositivo soporta vibración
  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator

  // Función básica de vibración
  const vibrate = useCallback((pattern: number | number[] = 50) => {
    if (!isSupported || !isMobile) return
    
    try {
      navigator.vibrate(pattern)
    } catch (error) {
      console.warn('Haptic feedback not supported:', error)
    }
  }, [isSupported, isMobile])

  // Feedback de impacto (iOS tiene API específica)
  const impact = useCallback((intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (!isMobile) return

    // Para iOS, intentar usar la API específica si está disponible
    if (isIOS && 'DeviceMotionEvent' in window) {
      try {
        // @ts-expect-error - API experimental de iOS
        if (window.DeviceMotionEvent?.requestPermission) {
          const patterns = {
            light: [10],
            medium: [20],
            heavy: [30]
          }
          vibrate(patterns[intensity])
        }
      } catch (error) {
        // Fallback a vibración estándar
        const patterns = {
          light: [10],
          medium: [25],
          heavy: [50]
        }
        vibrate(patterns[intensity])
      }
    } else {
      // Para Android y otros dispositivos
      const patterns = {
        light: [10],
        medium: [25],
        heavy: [50]
      }
      vibrate(patterns[intensity])
    }
  }, [isMobile, isIOS, vibrate])

  // Feedback de selección
  const selection = useCallback(() => {
    if (!isMobile) return
    vibrate([5, 5, 5]) // Patrón corto para selección
  }, [isMobile, vibrate])

  // Feedback de notificación
  const notification = useCallback((type: 'success' | 'warning' | 'error' = 'success') => {
    if (!isMobile) return

    const patterns = {
      success: [10, 50, 10], // Dos pulsos cortos
      warning: [25, 100, 25], // Pulso medio
      error: [50, 100, 50, 100, 50] // Tres pulsos largos
    }
    
    vibrate(patterns[type])
  }, [isMobile, vibrate])

  return {
    vibrate,
    impact,
    selection,
    notification,
    isSupported
  }
}

// Hook para feedback háptico en botones
export function useButtonHaptics() {
  const { impact, selection } = useHapticFeedback()

  const onPress = useCallback(() => {
    impact('light')
  }, [impact])

  const onRelease = useCallback(() => {
    selection()
  }, [selection])

  const onLongPress = useCallback(() => {
    impact('medium')
  }, [impact])

  return { onPress, onRelease, onLongPress }
}

// Hook para feedback háptico en formularios
export function useFormHaptics() {
  const { impact, notification } = useHapticFeedback()

  const onFocus = useCallback(() => {
    impact('light')
  }, [impact])

  const onSuccess = useCallback(() => {
    notification('success')
  }, [notification])

  const onError = useCallback(() => {
    notification('error')
  }, [notification])

  const onValidation = useCallback((isValid: boolean) => {
    if (isValid) {
      impact('light')
    } else {
      notification('warning')
    }
  }, [impact, notification])

  return { onFocus, onSuccess, onError, onValidation }
}

// Hook para feedback háptico en navegación
export function useNavigationHaptics() {
  const { impact, selection } = useHapticFeedback()

  const onNavigate = useCallback(() => {
    selection()
  }, [selection])

  const onSwipe = useCallback(() => {
    impact('light')
  }, [impact])

  const onPullToRefresh = useCallback(() => {
    impact('medium')
  }, [impact])

  return { onNavigate, onSwipe, onPullToRefresh }
}

// Componente HOC para agregar feedback háptico automáticamente
export function withHapticFeedback<T extends object>(
  Component: React.ComponentType<T>,
  hapticType: HapticType = 'light'
) {
  return function HapticComponent(props: T) {
    const { impact, selection, notification } = useHapticFeedback()

    const handleInteraction = useCallback(() => {
      switch (hapticType) {
        case 'light':
        case 'medium':
        case 'heavy':
          impact(hapticType)
          break
        case 'selection':
          selection()
          break
        case 'notification':
          notification('success')
          break
        default:
          impact('light')
      }
    }, [impact, selection, notification])

    return (
      <Component {...props} />
    )
  }
}