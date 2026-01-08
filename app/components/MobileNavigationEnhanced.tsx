'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useViewport } from '../hooks/useViewport'
import { useSwipeGesture } from './MobileOptimizations'
import { useSimpleTranslations } from '../lib/simple-translations'

// Interfaz para elementos de navegación
interface NavigationItem {
  id: string
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
  disabled?: boolean
}

// Navegación inferior mejorada para móvil
export function EnhancedMobileBottomNavigation({
  items,
  className = '',
  showLabels = true,
  hapticFeedback = true
}: {
  items: NavigationItem[]
  className?: string
  showLabels?: boolean
  hapticFeedback?: boolean
}) {
  const { isMobile } = useViewport()
  const pathname = usePathname()
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)
  const navRef = useRef<HTMLDivElement>(null)

  // Encontrar el índice activo basado en la ruta actual
  useEffect(() => {
    const currentIndex = items.findIndex(item => pathname.startsWith(item.href))
    if (currentIndex !== -1) {
      setActiveIndex(currentIndex)
    }
  }, [pathname, items])

  // Ocultar/mostrar navegación al hacer scroll
  useEffect(() => {
    if (!isMobile) return

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollingDown = currentScrollY > lastScrollY.current
      const scrollThreshold = 10

      if (Math.abs(currentScrollY - lastScrollY.current) > scrollThreshold) {
        setIsVisible(!scrollingDown || currentScrollY < 100)
        lastScrollY.current = currentScrollY
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isMobile])

  // Feedback háptico
  const triggerHapticFeedback = useCallback(() => {
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10)
    }
  }, [hapticFeedback])

  const handleItemClick = useCallback((item: NavigationItem, index: number) => {
    if (item.disabled) return
    
    triggerHapticFeedback()
    setActiveIndex(index)
    router.push(item.href)
  }, [router, triggerHapticFeedback])

  if (!isMobile) return null

  return (
    <nav 
      ref={navRef}
      className={`
        enhanced-mobile-bottom-nav
        fixed bottom-0 left-0 right-0 z-50
        bg-background/95 backdrop-blur-md
        border-t border-border/50
        transition-transform duration-300 ease-in-out
        ${isVisible ? 'translate-y-0' : 'translate-y-full'}
        ${className}
      `}
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        height: `calc(4rem + env(safe-area-inset-bottom))`
      }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item, index) => {
          const isActive = index === activeIndex
          
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item, index)}
              disabled={item.disabled}
              className={`
                enhanced-nav-item
                relative flex flex-col items-center justify-center
                min-w-0 flex-1 h-full
                transition-all duration-200 ease-out
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isActive ? 'text-primary' : 'text-muted-foreground'}
                hover:text-primary
                active:scale-95
              `}
            >
              {/* Indicador activo */}
              <div 
                className={`
                  absolute top-0 left-1/2 transform -translate-x-1/2
                  w-8 h-1 rounded-full bg-primary
                  transition-all duration-300 ease-out
                  ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
                `}
              />
              
              {/* Contenedor del icono */}
              <div 
                className={`
                  relative flex items-center justify-center
                  w-8 h-8 rounded-full
                  transition-all duration-200 ease-out
                  ${isActive ? 'bg-primary/10 scale-110' : 'scale-100'}
                `}
              >
                <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100'}`}>
                  {item.icon}
                </div>
                
                {/* Badge */}
                {item.badge && item.badge > 0 && (
                  <div className="
                    absolute -top-1 -right-1
                    min-w-[18px] h-[18px] px-1
                    bg-destructive text-destructive-foreground
                    text-xs font-medium
                    rounded-full flex items-center justify-center
                    animate-pulse
                  ">
                    {item.badge > 99 ? '99+' : item.badge}
                  </div>
                )}
              </div>
              
              {/* Label */}
              {showLabels && (
                <span 
                  className={`
                    text-xs font-medium mt-1 px-1
                    transition-all duration-200 ease-out
                    ${isActive ? 'opacity-100 scale-100' : 'opacity-70 scale-95'}
                    truncate max-w-full
                  `}
                >
                  {item.label}
                </span>
              )}
              
              {/* Ripple effect */}
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div className="ripple-effect" />
              </div>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

// Navegación lateral deslizable
export function EnhancedMobileSideNavigation({
  items,
  isOpen,
  onClose,
  title,
  className = ''
}: {
  items: NavigationItem[]
  isOpen: boolean
  onClose: () => void
  title?: string
  className?: string
}) {
  const { isMobile } = useViewport()
  const pathname = usePathname()
  const router = useRouter()
  const overlayRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const { t } = useSimpleTranslations()
  
  // Use translation for default title if not provided
  const displayTitle = title || t('navigation.navigation')

  // Configurar gestos de deslizamiento
  const swipeHandlers = useSwipeGesture({
    onSwipeLeft: () => {
      if (isOpen) onClose()
    },
    threshold: 50
  })

  // Cerrar al hacer clic en el overlay
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose()
    }
  }, [onClose])

  // Manejar navegación
  const handleItemClick = useCallback((item: NavigationItem) => {
    if (item.disabled) return
    
    router.push(item.href)
    onClose()
  }, [router, onClose])

  // Prevenir scroll del body cuando está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isMobile) return null

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className={`
          fixed inset-0 z-50 bg-black/50 backdrop-blur-sm
          transition-opacity duration-300 ease-out
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={handleOverlayClick}
        {...swipeHandlers}
      >
        {/* Sidebar */}
        <div
          ref={sidebarRef}
          className={`
            enhanced-mobile-side-nav
            fixed left-0 top-0 bottom-0
            w-80 max-w-[85vw] bg-background
            border-r border-border
            transition-transform duration-300 ease-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            ${className}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold">{displayTitle}</h2>
            <button
              onClick={onClose}
              className="
                p-2 rounded-full
                text-muted-foreground hover:text-foreground
                hover:bg-muted transition-colors
                active:scale-95
              "
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto py-4">
            {items.map((item) => {
              const isActive = pathname.startsWith(item.href)
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3
                    text-left transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${isActive 
                      ? 'bg-primary/10 text-primary border-r-2 border-primary' 
                      : 'text-foreground hover:bg-muted'
                    }
                    active:scale-[0.98]
                  `}
                >
                  <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100'}`}>
                    {item.icon}
                  </div>
                  
                  <span className="flex-1 font-medium">{item.label}</span>
                  
                  {item.badge && item.badge > 0 && (
                    <div className="
                      min-w-[20px] h-5 px-2
                      bg-destructive text-destructive-foreground
                      text-xs font-medium
                      rounded-full flex items-center justify-center
                    ">
                      {item.badge > 99 ? '99+' : item.badge}
                    </div>
                  )}
                  
                  {isActive && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="text-xs text-muted-foreground text-center">
              {t('navigation.swipeLeftToClose')}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Hook para manejar la navegación móvil
export function useMobileNavigation() {
  const [isSideNavOpen, setIsSideNavOpen] = useState(false)
  const { isMobile } = useViewport()

  const openSideNav = useCallback(() => {
    setIsSideNavOpen(true)
  }, [])

  const closeSideNav = useCallback(() => {
    setIsSideNavOpen(false)
  }, [])

  const toggleSideNav = useCallback(() => {
    setIsSideNavOpen(prev => !prev)
  }, [])

  return {
    isMobile,
    isSideNavOpen,
    openSideNav,
    closeSideNav,
    toggleSideNav
  }
}

// Componente de botón de menú hamburguesa
export function MobileMenuButton({
  onClick,
  isOpen = false,
  className = ''
}: {
  onClick: () => void
  isOpen?: boolean
  className?: string
}) {
  const { isMobile } = useViewport()
  const { t } = useSimpleTranslations()

  if (!isMobile) return null

  return (
    <button
      onClick={onClick}
      className={`
        mobile-menu-button
        p-2 rounded-lg
        text-foreground hover:bg-muted
        transition-all duration-200
        active:scale-95
        ${className}
      `}
      aria-label={isOpen ? t('navigation.closeMenu') : t('navigation.openMenu')}
    >
      <div className="w-6 h-6 flex flex-col justify-center items-center">
        <span 
          className={`
            block w-5 h-0.5 bg-current transition-all duration-300
            ${isOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}
          `}
        />
        <span 
          className={`
            block w-5 h-0.5 bg-current transition-all duration-300
            ${isOpen ? 'opacity-0' : 'opacity-100'}
          `}
        />
        <span 
          className={`
            block w-5 h-0.5 bg-current transition-all duration-300
            ${isOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}
          `}
        />
      </div>
    </button>
  )
}