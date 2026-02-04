'use client'

import { useEffect, useRef, useState } from 'react'

// Hook para animaciones de entrada
export function useIntersectionAnimation(threshold = 0.1) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return { ref, isVisible }
}

// Hook para animaciones de scroll
export function useScrollAnimation() {
  const [scrollY, setScrollY] = useState(0)
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down')
  const [isScrolling, setIsScrolling] = useState(false)

  useEffect(() => {
    let lastScrollY = window.scrollY
    let scrollTimeout: NodeJS.Timeout

    const updateScrollY = () => {
      const currentScrollY = window.scrollY
      setScrollY(currentScrollY)
      setScrollDirection(currentScrollY > lastScrollY ? 'down' : 'up')
      setIsScrolling(true)
      
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false)
      }, 150)
      
      lastScrollY = currentScrollY
    }

    window.addEventListener('scroll', updateScrollY, { passive: true })
    return () => {
      window.removeEventListener('scroll', updateScrollY)
      clearTimeout(scrollTimeout)
    }
  }, [])

  return { scrollY, scrollDirection, isScrolling }
}

// Hook para animaciones de hover
export function useHoverAnimation() {
  const [isHovered, setIsHovered] = useState(false)
  const ref = useRef<HTMLElement>(null)

  const handleMouseEnter = () => setIsHovered(true)
  const handleMouseLeave = () => setIsHovered(false)

  useEffect(() => {
    const element = ref.current
    if (element) {
      element.addEventListener('mouseenter', handleMouseEnter)
      element.addEventListener('mouseleave', handleMouseLeave)
      
      return () => {
        element.removeEventListener('mouseenter', handleMouseEnter)
        element.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [])

  return { ref, isHovered }
}

// Hook para animaciones de carga
export function useLoadingAnimation(isLoading: boolean) {
  const [showLoading, setShowLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)

  useEffect(() => {
    if (isLoading) {
      setShowLoading(true)
      setLoadingProgress(0)
      
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval)
            return 90
          }
          return prev + Math.random() * 10
        })
      }, 200)
      
      return () => clearInterval(interval)
    } else {
      setLoadingProgress(100)
      setTimeout(() => {
        setShowLoading(false)
        setLoadingProgress(0)
      }, 500)
    }
  }, [isLoading])

  return { showLoading, loadingProgress }
}

// Hook para animaciones de transición de página
export function usePageTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward')

  const startTransition = (direction: 'forward' | 'backward' = 'forward') => {
    setTransitionDirection(direction)
    setIsTransitioning(true)
    
    setTimeout(() => {
      setIsTransitioning(false)
    }, 300)
  }

  return {
    isTransitioning,
    transitionDirection,
    startTransition
  }
}

// Hook para animaciones de gestos táctiles
export function useTouchAnimations() {
  const [touchState, setTouchState] = useState({
    isPressed: false,
    scale: 1,
    x: 0,
    y: 0
  })
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleTouchStart = (e: TouchEvent) => {
      setTouchState(prev => ({ ...prev, isPressed: true, scale: 0.95 }))
    }

    const handleTouchEnd = () => {
      setTouchState(prev => ({ ...prev, isPressed: false, scale: 1, x: 0, y: 0 }))
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (touchState.isPressed) {
        const touch = e.touches[0]
        const rect = element.getBoundingClientRect()
        const x = touch.clientX - rect.left - rect.width / 2
        const y = touch.clientY - rect.top - rect.height / 2
        
        setTouchState(prev => ({ ...prev, x: x * 0.1, y: y * 0.1 }))
      }
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
      element.removeEventListener('touchmove', handleTouchMove)
    }
  }, [touchState.isPressed])

  return { ref, touchState }
}

// Utilidades de animación
export const animationUtils = {
  // Función para crear animaciones de entrada escalonadas
  staggeredAnimation: (index: number, delay = 100) => ({
    animationDelay: `${index * delay}ms`
  }),
  
  // Función para crear efectos de parallax
  parallaxTransform: (scrollY: number, speed = 0.5) => ({
    transform: `translateY(${scrollY * speed}px)`
  }),
  
  // Función para crear efectos de escala basados en scroll
  scaleOnScroll: (scrollY: number, maxScale = 1.2) => {
    const scale = Math.min(1 + (scrollY * 0.001), maxScale)
    return { transform: `scale(${scale})` }
  },
  
  // Función para crear efectos de fade basados en scroll
  fadeOnScroll: (scrollY: number, threshold = 200) => {
    const opacity = Math.max(0, 1 - (scrollY / threshold))
    return { opacity }
  }
}
