'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useRef, useEffect, useState } from 'react'

// Componente para parallax scroll optimizado
export function ParallaxSection({ 
  children, 
  speed = 0.3,
  className = ''
}: {
  children: React.ReactNode
  speed?: number
  className?: string
}) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })
  
  const y = useTransform(scrollYProgress, [0, 1], [0, speed * 50])

  return (
    <motion.div
      ref={ref}
      style={{ y, willChange: 'transform' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Componente para reveal en scroll optimizado
export function ScrollReveal({ 
  children, 
  direction = 'up',
  delay = 0,
  className = ''
}: {
  children: React.ReactNode
  direction?: 'up' | 'down' | 'left' | 'right'
  delay?: number
  className?: string
}) {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
    rootMargin: '50px'
  })

  const directions = {
    up: { y: 30, x: 0 },
    down: { y: -30, x: 0 },
    left: { y: 0, x: 30 },
    right: { y: 0, x: -30 }
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ 
        opacity: 0, 
        ...directions[direction]
      }}
      animate={inView ? { 
        opacity: 1, 
        y: 0, 
        x: 0 
      } : { 
        opacity: 0, 
        ...directions[direction]
      }}
      transition={{ 
        duration: 0.4, 
        delay,
        ease: "easeOut"
      }}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  )
}

// Componente para contador animado optimizado
export function AnimatedCounter({ 
  end, 
  duration = 1.5,
  suffix = '',
  prefix = '',
  className = ''
}: {
  end: number
  duration?: number
  suffix?: string
  prefix?: string
  className?: string
}) {
  const [ref, inView] = useInView({
    threshold: 0.5,
    triggerOnce: true
  })
  
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (inView) {
      let startTime: number
      let animationFrame: number

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
        
        setCount(Math.floor(progress * end))
        
        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate)
        }
      }

      animationFrame = requestAnimationFrame(animate)
      
      return () => cancelAnimationFrame(animationFrame)
    }
  }, [inView, end, duration])

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {prefix}{count}{suffix}
    </motion.span>
  )
}

// Componente para barra de progreso animada
export function AnimatedProgressBar({ 
  progress, 
  label,
  color = 'blue',
  className = ''
}: {
  progress: number
  label?: string
  color?: 'blue' | 'green' | 'purple' | 'yellow'
  className?: string
}) {
  const [ref, inView] = useInView({
    threshold: 0.5,
    triggerOnce: true
  })

  const colors = {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    purple: 'from-purple-500 to-pink-500',
    yellow: 'from-yellow-500 to-orange-500'
  }

  return (
    <div ref={ref} className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-zinc-300">{label}</span>
          <span className="text-sm text-zinc-400">{progress}%</span>
        </div>
      )}
      
      <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${colors[color]} rounded-full relative`}
          initial={{ width: 0 }}
          animate={inView ? { width: `${progress}%` } : { width: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          {/* Efecto de brillo */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </motion.div>
      </div>
    </div>
  )
}

// Componente para texto que se escribe
export function TypewriterEffect({ 
  text, 
  speed = 50,
  className = ''
}: {
  text: string
  speed?: number
  className?: string
}) {
  const [ref, inView] = useInView({
    threshold: 0.5,
    triggerOnce: true
  })
  
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (inView && currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)

      return () => clearTimeout(timeout)
    }
  }, [inView, currentIndex, text, speed])

  return (
    <span ref={ref} className={className}>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="inline-block w-0.5 h-5 bg-blue-400 ml-1"
      />
    </span>
  )
}

// Componente para efecto de morphing
export function MorphingShape({ 
  className = ''
}: {
  className?: string
}) {
  return (
    <motion.div
      className={`w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 ${className}`}
      animate={{
        borderRadius: [
          "20% 80% 80% 20% / 20% 20% 80% 80%",
          "80% 20% 20% 80% / 80% 80% 20% 20%",
          "20% 80% 80% 20% / 20% 20% 80% 80%"
        ],
        rotate: [0, 180, 360],
        scale: [1, 1.1, 1]
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  )
}

// Componente para ondas de fondo
export function WaveBackground({ 
  className = ''
}: {
  className?: string
}) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0 opacity-10"
        style={{
          background: `
            radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)
          `
        }}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* Ondas animadas */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          style={{
            background: `linear-gradient(${45 + i * 60}deg, 
              rgba(59, 130, 246, 0.1) 0%, 
              transparent 50%, 
              rgba(147, 51, 234, 0.1) 100%)`
          }}
          animate={{
            x: ['-100%', '100%'],
            opacity: [0, 0.5, 0]
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "linear",
            delay: i * 2
          }}
        />
      ))}
    </div>
  )
}