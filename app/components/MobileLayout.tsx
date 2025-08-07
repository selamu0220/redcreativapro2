'use client'

import { useEffect, useState } from 'react'
import { useMobileDetection, useTouchGestures } from '../hooks/useMobileDetection'
import MobileNavigation, { MobileBottomNavigation } from './MobileNavigation'
import { usePathname } from 'next/navigation'

interface MobileLayoutProps {
  children: React.ReactNode
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const { isMobile, isTablet, deviceType, orientation, isIOS, isAndroid } = useMobileDetection()
  const pathname = usePathname()
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
  const [viewportHeight, setViewportHeight] = useState(0)
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useTouchGestures()

  // Detectar teclado virtual en móvil
  useEffect(() => {
    if (!isMobile) return

    const handleResize = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight
      const fullHeight = window.screen.height
      
      setViewportHeight(currentHeight)
      setIsKeyboardOpen(currentHeight < fullHeight * 0.75)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    window.visualViewport?.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.visualViewport?.removeEventListener('resize', handleResize)
    }
  }, [isMobile])

  // Prevenir zoom en inputs en iOS
  useEffect(() => {
    if (isIOS) {
      const meta = document.querySelector('meta[name="viewport"]')
      if (meta) {
        meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
      }
    }
  }, [isIOS])

  // Agregar clases CSS específicas para móvil
  useEffect(() => {
    const body = document.body
    const html = document.documentElement

    // Limpiar clases previas
    body.classList.remove('mobile', 'tablet', 'desktop', 'ios', 'android', 'portrait', 'landscape', 'keyboard-open')
    html.classList.remove('mobile', 'tablet', 'desktop', 'ios', 'android', 'portrait', 'landscape')

    // Agregar clases según el dispositivo
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

    if (isIOS) {
      body.classList.add('ios')
      html.classList.add('ios')
    } else if (isAndroid) {
      body.classList.add('android')
      html.classList.add('android')
    }

    body.classList.add(orientation)
    html.classList.add(orientation)

    if (isKeyboardOpen) {
      body.classList.add('keyboard-open')
    }

    return () => {
      body.classList.remove('mobile', 'tablet', 'desktop', 'ios', 'android', 'portrait', 'landscape', 'keyboard-open')
      html.classList.remove('mobile', 'tablet', 'desktop', 'ios', 'android', 'portrait', 'landscape')
    }
  }, [isMobile, isTablet, isIOS, isAndroid, orientation, isKeyboardOpen])

  // Configurar altura de viewport para móvil
  useEffect(() => {
    if (isMobile && viewportHeight > 0) {
      document.documentElement.style.setProperty('--vh', `${viewportHeight * 0.01}px`)
      document.documentElement.style.setProperty('--mobile-vh', `${viewportHeight}px`)
    }
  }, [isMobile, viewportHeight])

  if (!isMobile && !isTablet) {
    // Renderizado normal para desktop
    return <>{children}</>
  }

  return (
    <div 
      className={`mobile-layout ${deviceType} ${orientation} ${isKeyboardOpen ? 'keyboard-open' : ''}`}
      style={{
        minHeight: isMobile ? 'calc(var(--mobile-vh, 100vh))' : '100vh',
        paddingBottom: isMobile && !isKeyboardOpen ? '80px' : '0' // Espacio para navegación inferior
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Navegación móvil superior */}
      <MobileNavigation currentPath={pathname} />
      
      {/* Contenido principal */}
      <main className={`mobile-main ${isKeyboardOpen ? 'keyboard-open' : ''}`}>
        {children}
      </main>
      
      {/* Navegación móvil inferior */}
      {!isKeyboardOpen && <MobileBottomNavigation currentPath={pathname} />}
      
      {/* Indicador de carga para transiciones */}
      <div className="mobile-transition-indicator" />
    </div>
  )
}

// Componente para contenedores optimizados para móvil
export function MobileContainer({ 
  children, 
  className = '', 
  padding = true,
  fullHeight = false 
}: { 
  children: React.ReactNode
  className?: string
  padding?: boolean
  fullHeight?: boolean
}) {
  const { isMobile, isTablet, deviceType } = useMobileDetection()
  
  const containerClasses = [
    // Clases base
    'w-full max-w-full',
    
    // Clases específicas por dispositivo
    isMobile && [
      'mobile-container',
      padding && 'px-4 py-2',
      'text-sm leading-relaxed'
    ],
    
    isTablet && [
      'tablet-container', 
      padding && 'px-6 py-4',
      'text-base'
    ],
    
    !isMobile && !isTablet && [
      'desktop-container',
      padding && 'px-8 py-6'
    ],
    
    // Altura completa si se requiere
    fullHeight && 'min-h-screen',
    
    // Clases adicionales
    className
  ].filter(Boolean).flat().join(' ')
  
  return (
    <div 
      className={containerClasses}
      data-device={deviceType}
      style={{
        // Variables CSS específicas para móvil
        ...(isMobile && {
          '--container-padding': '1rem',
          '--text-scale': '0.9'
        })
      }}
    >
      {children}
    </div>
  )
}

// Componente para botones optimizados para móvil
export function MobileButton({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled = false,
  ...props 
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  className?: string
  disabled?: boolean
  [key: string]: any
}) {
  const { isMobile } = useMobileDetection()

  const baseClasses = 'mobile-button transition-all duration-200 font-medium rounded-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground',
    ghost: 'text-primary hover:bg-primary/10'
  }
  
  const sizeClasses = {
    sm: isMobile ? 'px-4 py-2 text-sm min-h-[40px]' : 'px-3 py-1.5 text-sm',
    md: isMobile ? 'px-6 py-3 text-base min-h-[48px]' : 'px-4 py-2 text-base',
    lg: isMobile ? 'px-8 py-4 text-lg min-h-[56px]' : 'px-6 py-3 text-lg'
  }

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${isMobile ? 'touch-manipulation' : ''}
        ${className}
      `}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

// Componente para inputs optimizados para móvil
export function MobileInput({ 
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  fullWidth = true,
  ...props 
}: {
  type?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
  fullWidth?: boolean
  [key: string]: any
}) {
  const { isMobile, isIOS } = useMobileDetection()

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`
        mobile-input
        ${isMobile ? 'min-h-[48px] text-base' : 'min-h-[40px] text-sm'}
        ${fullWidth ? 'w-full' : ''}
        px-4 py-3 rounded-lg border border-border bg-background text-foreground
        focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
        transition-all duration-200
        ${isIOS ? 'transform-none' : ''}
        ${className}
      `}
      style={{
        fontSize: isMobile && isIOS ? '16px' : undefined // Prevenir zoom en iOS
      }}
      {...props}
    />
  )
}