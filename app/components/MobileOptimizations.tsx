'use client'

import { useEffect, useState, useCallback } from 'react'
import { useViewport } from '../hooks/useViewport'

// Componente para optimizaciones móviles globales
export default function MobileOptimizations() {
  const { isMobile, isTablet, orientation } = useViewport()
  const [mounted, setMounted] = useState(false)
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
  const [initialViewportHeight, setInitialViewportHeight] = useState(0)

  // Ensure component is mounted before running effects
  useEffect(() => {
    setMounted(true)
  }, [])

  // Detectar teclado virtual en móvil
  useEffect(() => {
    if (!mounted || !isMobile) return

    const handleResize = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight
      
      if (initialViewportHeight === 0) {
        setInitialViewportHeight(currentHeight)
        return
      }

      const heightDifference = initialViewportHeight - currentHeight
      const isKeyboardVisible = heightDifference > 150 // Umbral para detectar teclado
      
      setIsKeyboardOpen(isKeyboardVisible)
      
      // Ajustar viewport height para teclado virtual
      document.documentElement.style.setProperty(
        '--mobile-vh', 
        `${currentHeight * 0.01}px`
      )
    }

    // Configurar viewport height inicial
    const initialHeight = window.visualViewport?.height || window.innerHeight
    setInitialViewportHeight(initialHeight)
    document.documentElement.style.setProperty('--mobile-vh', `${initialHeight * 0.01}px`)

    // Escuchar cambios de viewport
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
      return () => window.visualViewport?.removeEventListener('resize', handleResize)
    } else {
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [isMobile, initialViewportHeight])

  // Aplicar clases CSS según el estado del dispositivo
  useEffect(() => {
    if (!mounted) return
    
    const body = document.body
    const html = document.documentElement

    // Limpiar clases previas
    body.classList.remove('mobile', 'tablet', 'desktop', 'keyboard-open', 'ios', 'android')
    html.classList.remove('mobile', 'tablet', 'desktop')

    // Aplicar clases según dispositivo
    if (isMobile) {
      body.classList.add('mobile')
      html.classList.add('mobile')
    } else if (isTablet) {
      body.classList.add('tablet')
      html.classList.add('tablet')
    } else {
      body.classList.add('desktop')
      html.classList.add('desktop')
    }

    // Detectar SO móvil
    const userAgent = navigator.userAgent
    if (/iPad|iPhone|iPod/.test(userAgent)) {
      body.classList.add('ios')
    } else if (/Android/.test(userAgent)) {
      body.classList.add('android')
    }

    // Estado del teclado
    if (isKeyboardOpen) {
      body.classList.add('keyboard-open')
    }

    // Orientación
    body.setAttribute('data-orientation', orientation)
  }, [mounted, isMobile, isTablet, isKeyboardOpen, orientation])

  // Prevenir zoom en inputs en iOS
  useEffect(() => {
    if (!mounted || !isMobile) return

    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault()
      }
    }

    const preventDoubleTapZoom = (e: TouchEvent) => {
      const now = Date.now()
      const lastTouch = (e.target as any).lastTouch || 0
      const delta = now - lastTouch
      
      if (delta < 300 && delta > 0) {
        e.preventDefault()
      }
      
      ;(e.target as any).lastTouch = now
    }

    document.addEventListener('touchstart', preventZoom, { passive: false })
    document.addEventListener('touchend', preventDoubleTapZoom, { passive: false })

    return () => {
      document.removeEventListener('touchstart', preventZoom)
      document.removeEventListener('touchend', preventDoubleTapZoom)
    }
  }, [mounted, isMobile])

  return null
}

// Hook para gestos táctiles
export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50
}: {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
}) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
  }, [])

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return

    const distanceX = touchStart.x - touchEnd.x
    const distanceY = touchStart.y - touchEnd.y
    const isLeftSwipe = distanceX > threshold
    const isRightSwipe = distanceX < -threshold
    const isUpSwipe = distanceY > threshold
    const isDownSwipe = distanceY < -threshold

    // Determinar si es un swipe horizontal o vertical
    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      // Swipe horizontal
      if (isLeftSwipe && onSwipeLeft) {
        onSwipeLeft()
      } else if (isRightSwipe && onSwipeRight) {
        onSwipeRight()
      }
    } else {
      // Swipe vertical
      if (isUpSwipe && onSwipeUp) {
        onSwipeUp()
      } else if (isDownSwipe && onSwipeDown) {
        onSwipeDown()
      }
    }
  }, [touchStart, touchEnd, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown])

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  }
}

// Componente para botones optimizados para móvil
export function MobileOptimizedButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  hapticFeedback = true,
  className = '',
  ...props
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  disabled?: boolean
  loading?: boolean
  hapticFeedback?: boolean
  className?: string
  [key: string]: any
}) {
  const { isMobile, hasTouch } = useViewport()
  const [mounted, setMounted] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (disabled || loading) return

    // Feedback háptico en dispositivos compatibles
    if (mounted && hapticFeedback && 'vibrate' in navigator && isMobile) {
      navigator.vibrate(10)
    }

    onClick?.()
  }, [mounted, disabled, loading, hapticFeedback, isMobile, onClick])

  const handleTouchStart = useCallback(() => {
    if (!disabled && !loading) {
      setIsPressed(true)
    }
  }, [disabled, loading])

  const handleTouchEnd = useCallback(() => {
    setIsPressed(false)
  }, [])

  const baseClasses = [
    'relative overflow-hidden font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'transform-gpu will-change-transform',
    mounted && isMobile && 'active:scale-95',
    mounted && isPressed && 'scale-95'
  ].filter(Boolean).join(' ')

  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground focus:ring-primary',
    ghost: 'hover:bg-accent hover:text-accent-foreground focus:ring-primary',
    danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive'
  }

  const sizeClasses = {
    sm: mounted && isMobile ? 'h-10 px-3 text-sm rounded-lg' : 'h-8 px-3 text-sm rounded-md',
    md: mounted && isMobile ? 'h-12 px-4 text-base rounded-lg' : 'h-10 px-4 text-sm rounded-md',
    lg: mounted && isMobile ? 'h-14 px-6 text-lg rounded-xl' : 'h-12 px-6 text-base rounded-lg'
  }

  const finalClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && 'w-full',
    className
  ].filter(Boolean).join(' ')

  return (
    <button
      className={finalClasses}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      disabled={disabled || loading}
      {...props}
    >
      {/* Efecto ripple */}
      <span className="absolute inset-0 overflow-hidden rounded-inherit">
        <span 
          className={`absolute inset-0 bg-white/20 rounded-full transform scale-0 transition-transform duration-300 ${
            isPressed ? 'scale-150' : ''
          }`}
        />
      </span>
      
      {/* Contenido del botón */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </span>
    </button>
  )
}

// Componente para inputs optimizados para móvil
export function MobileOptimizedInput({
  type = 'text',
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  error = false,
  className = '',
  ...props
}: {
  type?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onFocus?: () => void
  onBlur?: () => void
  disabled?: boolean
  error?: boolean
  className?: string
  [key: string]: any
}) {
  const { isMobile } = useViewport()
  const [mounted, setMounted] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleFocus = useCallback(() => {
    setIsFocused(true)
    onFocus?.()
  }, [onFocus])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
    onBlur?.()
  }, [onBlur])

  const baseClasses = [
    'w-full transition-all duration-200',
    'border rounded-lg bg-background',
    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    mounted && isMobile ? 'h-12 px-4 text-base' : 'h-10 px-3 text-sm',
    error ? 'border-destructive focus:ring-destructive' : 'border-input',
    isFocused && !error && 'ring-2 ring-primary border-transparent'
  ].filter(Boolean).join(' ')

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      disabled={disabled}
      className={`${baseClasses} ${className}`}
      // Prevenir zoom en iOS
      style={mounted && isMobile ? { fontSize: '16px' } : undefined}
      {...props}
    />
  )
}