'use client'

import { useCallback } from 'react'

// Hook para feedback háptico en dispositivos móviles
export function useButtonHaptics() {
  const onPress = useCallback(() => {
    // Verificar si el dispositivo soporta vibración
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        // Vibración suave para botones (10ms)
        navigator.vibrate(10)
      } catch (error) {
        // Silenciar errores de vibración
        console.debug('Haptic feedback not available')
      }
    }
  }, [])

  const onRelease = useCallback(() => {
    // Feedback al soltar el botón (opcional)
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        // Vibración muy suave al soltar (5ms)
        navigator.vibrate(5)
      } catch (error) {
        console.debug('Haptic feedback not available')
      }
    }
  }, [])

  const onSuccess = useCallback(() => {
    // Feedback para acciones exitosas
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        // Patrón de vibración para éxito: corto-pausa-corto
        navigator.vibrate([50, 50, 50])
      } catch (error) {
        console.debug('Haptic feedback not available')
      }
    }
  }, [])

  const onError = useCallback(() => {
    // Feedback para errores
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        // Vibración más larga para errores
        navigator.vibrate(200)
      } catch (error) {
        console.debug('Haptic feedback not available')
      }
    }
  }, [])

  return {
    onPress,
    onRelease,
    onSuccess,
    onError
  }
}

// Hook para feedback háptico en formularios
export function useFormHaptics() {
  const onFocus = useCallback(() => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(8)
      } catch (error) {
        console.debug('Haptic feedback not available')
      }
    }
  }, [])

  const onValidationError = useCallback(() => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        // Patrón para error de validación: corto-pausa-corto-pausa-corto
        navigator.vibrate([30, 30, 30, 30, 30])
      } catch (error) {
        console.debug('Haptic feedback not available')
      }
    }
  }, [])

  const onSubmitSuccess = useCallback(() => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        // Patrón para envío exitoso
        navigator.vibrate([100, 50, 100])
      } catch (error) {
        console.debug('Haptic feedback not available')
      }
    }
  }, [])

  return {
    onFocus,
    onValidationError,
    onSubmitSuccess
  }
}

// Hook para feedback háptico en navegación
export function useNavigationHaptics() {
  const onPageChange = useCallback(() => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15)
      } catch (error) {
        console.debug('Haptic feedback not available')
      }
    }
  }, [])

  const onSwipeGesture = useCallback(() => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(12)
      } catch (error) {
        console.debug('Haptic feedback not available')
      }
    }
  }, [])

  return {
    onPageChange,
    onSwipeGesture
  }
}