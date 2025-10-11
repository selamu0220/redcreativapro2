'use client'

import React from 'react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

// Hook para optimización de rendimiento
const usePerformanceOptimization = () => {
  return {
    reduceMotion: false,
    isMobile: false,
    isLowEndDevice: false,
    particleCount: 50,
    animationDuration: 0.6,
    enableComplexAnimations: true
  }
}

// Animaciones para la página principal (Home)
export const AnimatedHeroSection = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const { animationDuration } = usePerformanceOptimization()

  return (
    <motion.section
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: animationDuration, ease: "easeOut" }}
    >
      {children}
    </motion.section>
  )
}

export const AnimatedTitle = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const { animationDuration } = usePerformanceOptimization()

  return (
    <motion.h1
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.8, y: 30 }}
      animate={isInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 30 }}
      transition={{ 
        duration: animationDuration * 1.2, 
        ease: "easeOut",
        delay: 0.2
      }}
    >
      {children}
    </motion.h1>
  )
}

export const AnimatedSubtitle = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const { animationDuration } = usePerformanceOptimization()

  return (
    <motion.h2
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ 
        duration: animationDuration, 
        ease: "easeOut",
        delay: 0.4
      }}
    >
      {children}
    </motion.h2>
  )
}

export const AnimatedSectionTitle = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const { animationDuration } = usePerformanceOptimization()

  return (
    <motion.h2
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.8, y: 30 }}
      animate={isInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 30 }}
      transition={{ 
        duration: animationDuration * 1.2, 
        ease: "easeOut",
        delay: 0.2
      }}
    >
      {children}
    </motion.h2>
  )
}

export const AnimatedBadge = ({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const { animationDuration } = usePerformanceOptimization()

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={isInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
      transition={{ 
        duration: animationDuration * 0.8, 
        ease: "easeOut",
        delay: delay
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.div>
  )
}

export const AnimatedButton = ({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const { animationDuration } = usePerformanceOptimization()

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ 
        duration: animationDuration, 
        ease: "easeOut",
        delay: delay
      }}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.div>
  )
}

// Animaciones para el Dashboard
export const AnimatedDashboardCard = ({ children, className = "", index = 0 }: { children: React.ReactNode, className?: string, index?: number }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const { animationDuration } = usePerformanceOptimization()

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
      transition={{ 
        duration: animationDuration, 
        ease: "easeOut",
        delay: index * 0.1
      }}
      whileHover={{ 
        scale: 1.02, 
        y: -5,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  )
}

export const AnimatedGreeting = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const { animationDuration } = usePerformanceOptimization()

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, x: -30 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
      transition={{ 
        duration: animationDuration, 
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  )
}

// Animaciones para herramientas IA (Escritor IA y Correos IA)
export const AnimatedFormSection = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const { animationDuration } = usePerformanceOptimization()

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ 
        duration: animationDuration, 
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  )
}

export const AnimatedTextArea = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const { animationDuration } = usePerformanceOptimization()

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
      transition={{ 
        duration: animationDuration, 
        ease: "easeOut"
      }}
      whileFocus={{ scale: 1.02 }}
    >
      {children}
    </motion.div>
  )
}

export const AnimatedGenerateButton = ({ children, className = "", isGenerating = false }: { children: React.ReactNode, className?: string, isGenerating?: boolean }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const { animationDuration } = usePerformanceOptimization()

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? (isGenerating ? { 
        opacity: 1, 
        y: 0,
        scale: [1, 1.02, 1],
        transition: { 
          duration: 1.5, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }
      } : { opacity: 1, y: 0 }) : { opacity: 0, y: 20 }}
      transition={{ 
        duration: animationDuration, 
        ease: "easeOut"
      }}
      whileHover={!isGenerating ? { scale: 1.05, y: -2 } : {}}
      whileTap={!isGenerating ? { scale: 0.95 } : {}}
    >
      {children}
    </motion.div>
  )
}

export const AnimatedResult = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const { animationDuration } = usePerformanceOptimization()

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.95 }}
      transition={{ 
        duration: animationDuration * 1.2, 
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  )
}

// Animaciones para navegación y header
export const AnimatedNavItem = ({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => {
  const { animationDuration } = usePerformanceOptimization()

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: animationDuration * 0.8, 
        ease: "easeOut",
        delay: delay
      }}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.div>
  )
}

export const AnimatedLogo = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const { animationDuration } = usePerformanceOptimization()

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ 
        duration: animationDuration * 1.2, 
        ease: "easeOut"
      }}
      whileHover={{ 
        scale: 1.1, 
        rotate: 5,
        transition: { duration: 0.2 }
      }}
    >
      {children}
    </motion.div>
  )
}

// Animación de entrada para páginas completas
export const AnimatedPageWrapper = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const { animationDuration } = usePerformanceOptimization()

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ 
        duration: animationDuration * 0.8, 
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  )
}

// Animación de lista staggered
export const AnimatedList = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const { animationDuration } = usePerformanceOptimization()

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            duration: animationDuration
          }
        }
      }}
    >
      {children}
    </motion.div>
  )
}

export const AnimatedListItem = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const { animationDuration } = usePerformanceOptimization()

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { duration: animationDuration * 0.8, ease: "easeOut" }
        }
      }}
    >
      {children}
    </motion.div>
  )
}