'use client'

import { useEffect, useState, useCallback } from 'react'
import { useViewport } from '../hooks/useViewport'

interface MobileLayoutProps {
  children: React.ReactNode
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Renderizar solo después de montar para evitar errores de hidratación
  if (!mounted) {
    return <>{children}</>
  }

  return <>{children}</>
}

// Componente para contenedores optimizados para móvil
export function MobileContainer({ 
  children, 
  className = '', 
  padding = true,
  fullHeight = false,
  maxWidth = true
}: { 
  children: React.ReactNode
  className?: string
  padding?: boolean
  fullHeight?: boolean
  maxWidth?: boolean
}) {
  const { isMobile, isTablet } = useViewport()
  
  const containerClasses = [
    'w-full',
    maxWidth && 'max-w-full overflow-x-hidden',
    isMobile && padding && 'px-3 py-2',
    isTablet && padding && 'px-6 py-4', 
    !isMobile && !isTablet && padding && 'px-8 py-6',
    fullHeight && 'min-h-screen',
    className
  ].filter(Boolean).join(' ')
  
  return (
    <div className={containerClasses}>
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
  const { isMobile, hasTouch } = useViewport()
  const [isPressed, setIsPressed] = useState(false)

  const handleTouchStart = useCallback(() => {
    if (!disabled) {
      setIsPressed(true)
    }
  }, [disabled])

  const handleTouchEnd = useCallback(() => {
    if (!disabled) {
      setIsPressed(false)
    }
  }, [disabled])

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!disabled && onClick) {
      onClick()
    }
  }, [disabled, onClick])

  const baseClasses = 'mobile-button transition-all duration-200 font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden'
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white',
    ghost: 'text-blue-500 hover:bg-blue-50'
  }
  
  const sizeClasses = {
    sm: isMobile ? 'px-4 py-2 text-sm min-h-[44px]' : 'px-3 py-1.5 text-sm',
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
        ${isPressed ? 'scale-95' : 'scale-100'}
        ${className}
      `}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
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
  const { isMobile } = useViewport()
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      if (typeof window !== 'undefined') {
        setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent))
      }
    }
    checkDevice()
  }, [])

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
        px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        transition-all duration-200
        ${className}
      `}
      style={{
        fontSize: isMobile && isIOS ? '16px' : undefined
      }}
      {...props}
    />
  )
}