'use client'

import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useRef, ReactNode } from 'react'
import { usePerformanceOptimization, useAnimationLazyLoad, getOptimizedAnimationProps, getOptimizedParticleCount } from '@/hooks/usePerformanceOptimization'

// Componente ExplodeIn optimizado para rendimiento
export const ExplodeIn = ({ 
  children, 
  delay = 0, 
  duration = 0.6 
}: { 
  children: ReactNode
  delay?: number
  duration?: number
}) => {
  const settings = usePerformanceOptimization()
  const { isVisible, ref } = useAnimationLazyLoad()

  if (settings.reduceMotion) {
    return <div ref={ref}>{children}</div>
  }

  return (
    <motion.div
      ref={ref}
      initial={{ 
        scale: 0.8, 
        opacity: 0
      }}
      animate={isVisible ? { 
        scale: 1, 
        opacity: 1
      } : {}}
      transition={{ 
        duration: duration * settings.animationDuration, 
        delay,
        type: "tween",
        ease: "easeOut"
      }}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  )
}

// Componente BrutalSlide optimizado
export const BrutalSlide = ({ 
  children, 
  direction = 'left', 
  delay = 0, 
  distance = 50,
  duration = 0.6 
}: { 
  children: ReactNode
  direction?: 'left' | 'right' | 'up' | 'down'
  delay?: number
  distance?: number
  duration?: number
}) => {
  const settings = usePerformanceOptimization()
  const { isVisible, ref } = useAnimationLazyLoad()

  if (settings.reduceMotion) {
    return <div ref={ref}>{children}</div>
  }

  const getInitialPosition = () => {
    const actualDistance = settings.isMobile ? distance * 0.5 : distance
    switch (direction) {
      case 'left': return { x: -actualDistance, skewX: -5 }
      case 'right': return { x: actualDistance, skewX: 5 }
      case 'up': return { y: -actualDistance, skewY: -2 }
      case 'down': return { y: actualDistance, skewY: 2 }
      default: return { x: -actualDistance, skewX: -5 }
    }
  }

  return (
    <motion.div
      ref={ref}
      initial={{ 
        ...getInitialPosition(), 
        opacity: 0,
        filter: settings.enableComplexAnimations ? "blur(5px)" : "none"
      }}
      animate={isVisible ? { 
        x: 0, 
        y: 0, 
        skewX: 0, 
        skewY: 0, 
        opacity: 1,
        filter: "blur(0px)"
      } : {}}
      transition={{ 
        duration: duration * settings.animationDuration, 
        delay,
        type: settings.enableComplexAnimations ? "spring" : "tween",
        stiffness: settings.enableComplexAnimations ? 150 : 100
      }}
    >
      {children}
    </motion.div>
  )
}

// Componente GlitchText optimizado
export const GlitchText = ({ 
  children, 
  intensity = 1 
}: { 
  children: ReactNode
  intensity?: number
}) => {
  const settings = usePerformanceOptimization()
  const [isGlitching, setIsGlitching] = useState(false)

  if (settings.reduceMotion || !settings.enableComplexAnimations) {
    return <>{children}</>
  }

  const triggerGlitch = () => {
    if (!isGlitching) {
      setIsGlitching(true)
      setTimeout(() => setIsGlitching(false), 200)
    }
  }

  return (
    <motion.div
      onHoverStart={triggerGlitch}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      <AnimatePresence>
        {isGlitching && (
          <>
            <motion.div
              className="absolute inset-0 text-red-500"
              initial={{ x: 0 }}
              animate={{ x: [-2, 2, -1, 1, 0] }}
              exit={{ x: 0 }}
              transition={{ duration: 0.2, times: [0, 0.25, 0.5, 0.75, 1] }}
              style={{ clipPath: 'inset(0 0 50% 0)' }}
            >
              {children}
            </motion.div>
            <motion.div
              className="absolute inset-0 text-blue-500"
              initial={{ x: 0 }}
              animate={{ x: [2, -2, 1, -1, 0] }}
              exit={{ x: 0 }}
              transition={{ duration: 0.2, times: [0, 0.25, 0.5, 0.75, 1] }}
              style={{ clipPath: 'inset(50% 0 0 0)' }}
            >
              {children}
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {children}
    </motion.div>
  )
}

// Componente BrutalParallax optimizado
export const BrutalParallax = ({ 
  children, 
  speed = 0.5 
}: { 
  children: ReactNode
  speed?: number
}) => {
  const settings = usePerformanceOptimization()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  if (settings.reduceMotion || settings.isLowEndDevice) {
    return <div ref={ref}>{children}</div>
  }

  const y = useTransform(scrollYProgress, [0, 1], [0, speed * (settings.isMobile ? 50 : 100)])
  const rotate = useTransform(scrollYProgress, [0, 1], [0, speed * (settings.isMobile ? 2 : 5)])

  return (
    <motion.div
      ref={ref}
      style={{ 
        y: settings.enableComplexAnimations ? y : 0, 
        rotate: settings.enableComplexAnimations ? rotate : 0 
      }}
    >
      {children}
    </motion.div>
  )
}

// Componente MagneticHover optimizado
export const MagneticHover = ({ 
  children, 
  strength = 0.3 
}: { 
  children: ReactNode
  strength?: number
}) => {
  const settings = usePerformanceOptimization()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  if (settings.reduceMotion || settings.isMobile) {
    return <>{children}</>
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    setMousePosition({
      x: (e.clientX - centerX) * strength,
      y: (e.clientY - centerY) * strength
    })
  }

  const springConfig = { damping: 25, stiffness: 200 }
  const x = useSpring(isHovered ? mousePosition.x : 0, springConfig)
  const y = useSpring(isHovered ? mousePosition.y : 0, springConfig)

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setMousePosition({ x: 0, y: 0 })
      }}
    >
      {children}
    </motion.div>
  )
}

// Componente ScrollReveal optimizado
export const ScrollReveal = ({ 
  children, 
  direction = 'up', 
  delay = 0 
}: { 
  children: ReactNode
  direction?: 'up' | 'down' | 'left' | 'right'
  delay?: number
}) => {
  const settings = usePerformanceOptimization()
  const { isVisible, ref } = useAnimationLazyLoad(0.1)

  const getInitialPosition = () => {
    const distance = settings.isMobile ? 30 : 50
    switch (direction) {
      case 'up': return { y: distance }
      case 'down': return { y: -distance }
      case 'left': return { x: distance }
      case 'right': return { x: -distance }
      default: return { y: distance }
    }
  }

  return (
    <motion.div
      ref={ref}
      initial={{ 
        ...getInitialPosition(), 
        opacity: 0,
        scale: settings.enableComplexAnimations ? 0.95 : 1
      }}
      animate={isVisible ? { 
        x: 0, 
        y: 0, 
        opacity: 1, 
        scale: 1 
      } : {}}
      transition={{ 
        duration: 0.6 * settings.animationDuration, 
        delay,
        ease: settings.enableComplexAnimations ? "easeOut" : "linear"
      }}
    >
      {children}
    </motion.div>
  )
}

// Componente ParticleExplosion optimizado
export const ParticleExplosion = ({ 
  trigger, 
  particleCount = 15 
}: { 
  trigger: boolean
  particleCount?: number
}) => {
  const settings = usePerformanceOptimization()
  const optimizedCount = getOptimizedParticleCount(settings, particleCount)

  if (settings.reduceMotion || optimizedCount === 0) {
    return null
  }

  return (
    <AnimatePresence>
      {trigger && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(optimizedCount)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
              style={{
                left: '50%',
                top: '50%',
              }}
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1, 0],
                x: (Math.random() - 0.5) * (settings.isMobile ? 100 : 200),
                y: (Math.random() - 0.5) * (settings.isMobile ? 100 : 200),
                opacity: [1, 1, 0]
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1 * settings.animationDuration,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}

// Componente BrutalTypewriter optimizado
export const BrutalTypewriter = ({ 
  text, 
  speed = 50 
}: { 
  text: string
  speed?: number
}) => {
  const settings = usePerformanceOptimization()
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const { isVisible, ref } = useAnimationLazyLoad()

  useEffect(() => {
    if (!isVisible || settings.reduceMotion) {
      setDisplayText(text)
      return
    }

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(text.slice(0, currentIndex + 1))
        setCurrentIndex(currentIndex + 1)
      }, speed * (settings.isLowEndDevice ? 0.5 : 1))

      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text, speed, isVisible, settings])

  return (
    <span ref={ref} className="relative">
      {displayText}
      {!settings.reduceMotion && currentIndex < text.length && (
        <motion.span
          className="inline-block w-0.5 h-5 bg-blue-400 ml-1"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </span>
  )
}