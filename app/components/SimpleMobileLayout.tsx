'use client'

import { useEffect, useState } from 'react'
import { useMobileDetection } from '../hooks/useMobileDetection'

interface SimpleMobileLayoutProps {
  children: React.ReactNode
}

export default function SimpleMobileLayout({ children }: SimpleMobileLayoutProps) {
  const { isMobile, isTablet, deviceType } = useMobileDetection()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isMobile ? 'mobile-layout' : ''}`}>
      {children}
    </div>
  )
}

// Componente para contenedores móviles simplificado
export function SimpleMobileContainer({ 
  children, 
  className = '' 
}: {
  children: React.ReactNode
  className?: string
}) {
  const { isMobile, isTablet } = useMobileDetection()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={`container mx-auto px-4 ${className}`}>
        {children}
      </div>
    )
  }

  const containerClass = isMobile 
    ? 'mobile-container px-4 max-w-full'
    : isTablet 
    ? 'tablet-container px-6 max-w-4xl mx-auto'
    : 'desktop-container px-8 max-w-6xl mx-auto'

  return (
    <div className={`${containerClass} ${className}`}>
      {children}
    </div>
  )
}

// Botón móvil simplificado
export function SimpleMobileButton({ 
  children, 
  onClick, 
  className = '',
  disabled = false,
  ...props 
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
  [key: string]: any
}) {
  const { isMobile } = useMobileDetection()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const mobileClasses = mounted && isMobile ? 'min-h-[44px] px-6 py-3 text-base touch-manipulation' : 'px-4 py-2 text-sm'

  return (
    <button
      className={`${baseClasses} ${mobileClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
