'use client'
import React from 'react'
import { motion, useInView } from 'framer-motion'
import { useEffect, useState, useRef, ReactNode } from 'react'
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization'
// Componente para animar párrafos mientras se leen
export const AnimatedParagraph = ({ 
  children, 
  delay = 0 
}: { 
  children: ReactNode
  delay?: number
}) => {
  const settings = usePerformanceOptimization()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { 
    amount: 0.3,
    margin: "0px 0px -100px 0px"
  })
  if (settings.reduceMotion) {
    return <div ref={ref} className="mb-6">{children}</div>
  }
  return (
    <motion.div
      ref={ref}
      className="mb-6 relative"
      initial={{ 
        opacity: 0, 
        y: 30,
        scale: 0.98
      }}
      animate={isInView ? { 
        opacity: 1, 
        y: 0,
        scale: 1
      } : {}}
      transition={{ 
        duration: 0.8 * settings.animationDuration, 
        delay,
        ease: "easeOut"
      }}
      whileHover={settings.enableComplexAnimations ? {
        scale: 1.02,
        transition: { duration: 0.3 }
      } : {}}
    >
      {/* Efecto de brillo sutil al aparecer */}
      <motion.div
        className="absolute -inset-2 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent rounded-lg"
        initial={{ opacity: 0 }}
        animate={isInView ? { 
          opacity: [0, 0.5, 0],
          scale: [0.98, 1.02, 1]
        } : {}}
        transition={{
          duration: 2,
          ease: "easeInOut"
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}
// Componente para animar títulos de sección
export const AnimatedHeading = ({ 
  children, 
  level = 2,
  delay = 0 
}: { 
  children: ReactNode
  level?: 1 | 2 | 3 | 4 | 5 | 6
  delay?: number
}) => {
  const settings = usePerformanceOptimization()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { 
    amount: 0.5,
    margin: "0px 0px -50px 0px"
  })
  if (settings.reduceMotion) {
    const HeadingComponent = level === 1 ? 'h1' : 
                           level === 2 ? 'h2' : 
                           level === 3 ? 'h3' : 
                           level === 4 ? 'h4' : 
                           level === 5 ? 'h5' : 'h6'
    
    return React.createElement(HeadingComponent, {
      className: "mb-4"
    }, children)
  }
  return (
    <motion.div ref={ref} className="mb-4 relative">
      {/* Línea animada debajo del título */}
      <motion.div
        className="absolute -bottom-2 left-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
        initial={{ width: 0, opacity: 0 }}
        animate={isInView ? { 
          width: "100%", 
          opacity: 1 
        } : {}}
        transition={{ 
          duration: 1.2 * settings.animationDuration, 
          delay: delay + 0.3,
          ease: "easeOut"
        }}
      />
      
      <motion.div
        initial={{ 
          opacity: 0, 
          x: -50,
          rotateX: 15
        }}
        animate={isInView ? { 
          opacity: 1, 
          x: 0,
          rotateX: 0
        } : {}}
        transition={{ 
          duration: 0.8 * settings.animationDuration, 
          delay,
          ease: "easeOut"
        }}
        whileHover={settings.enableComplexAnimations ? {
          scale: 1.05,
          textShadow: "0 0 20px rgba(59, 130, 246, 0.3)",
          transition: { duration: 0.3 }
        } : {}}
      >
        {React.createElement(`h${level}`, { className: "relative z-10" }, children)}
      </motion.div>
    </motion.div>
  )
}
// Componente para animar listas
export const AnimatedList = ({ 
  children, 
  delay = 0 
}: { 
  children: ReactNode
  delay?: number
}) => {
  const settings = usePerformanceOptimization()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { 
    amount: 0.2,
    margin: "0px 0px -80px 0px"
  })
  if (settings.reduceMotion) {
    return <div ref={ref} className="mb-6">{children}</div>
  }
  return (
    <motion.div
      ref={ref}
      className="mb-6"
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.5 * settings.animationDuration, delay }}
    >
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1 * settings.animationDuration,
              delayChildren: delay
            }
          }
        }}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
// Componente para animar elementos de lista individual
export const AnimatedListItem = ({ 
  children 
}: { 
  children: ReactNode
}) => {
  const settings = usePerformanceOptimization()
  if (settings.reduceMotion) {
    return <li>{children}</li>
  }
  return (
    <motion.li
      variants={{
        hidden: { 
          opacity: 0, 
          x: -30,
          scale: 0.95
        },
        visible: { 
          opacity: 1, 
          x: 0,
          scale: 1
        }
      }}
      whileHover={settings.enableComplexAnimations ? {
        x: 10,
        scale: 1.02,
        transition: { duration: 0.2 }
      } : {}}
      className="relative"
    >
      {/* Punto animado para listas */}
      <motion.div
        className="absolute -left-4 top-2 w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
        initial={{ scale: 0, rotate: 0 }}
        whileInView={{ 
          scale: 1, 
          rotate: 360 
        }}
        transition={{ 
          duration: 0.5 * settings.animationDuration,
          delay: 0.2
        }}
      />
      <div className="pl-2">
        {children}
      </div>
    </motion.li>
  )
}
// Componente para animar imágenes
export const AnimatedImage = ({ 
  children, 
  delay = 0 
}: { 
  children: ReactNode
  delay?: number
}) => {
  const settings = usePerformanceOptimization()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { 
    amount: 0.3,
    margin: "0px 0px -100px 0px"
  })
  if (settings.reduceMotion) {
    return <div ref={ref} className="mb-8">{children}</div>
  }
  return (
    <motion.div
      ref={ref}
      className="mb-8 relative overflow-hidden rounded-xl"
      initial={{ 
        opacity: 0, 
        scale: 0.9,
        rotateX: 10
      }}
      animate={isInView ? { 
        opacity: 1, 
        scale: 1,
        rotateX: 0
      } : {}}
      transition={{ 
        duration: 1 * settings.animationDuration, 
        delay,
        ease: "easeOut"
      }}
      whileHover={settings.enableComplexAnimations ? {
        scale: 1.05,
        rotateY: 2,
        transition: { duration: 0.4 }
      } : {}}
    >
      {/* Efecto de brillo en hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-transparent to-purple-500/20 opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Marco con brillo animado */}
      <motion.div
        className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl opacity-0"
        animate={isInView ? {
          opacity: [0, 0.3, 0],
          scale: [0.98, 1.02, 1]
        } : {}}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}
// Componente para animar bloques de código
export const AnimatedCodeBlock = ({ 
  children, 
  delay = 0 
}: { 
  children: ReactNode
  delay?: number
}) => {
  const settings = usePerformanceOptimization()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { 
    amount: 0.2,
    margin: "0px 0px -100px 0px"
  })
  if (settings.reduceMotion) {
    return <div ref={ref} className="mb-6">{children}</div>
  }
  return (
    <motion.div
      ref={ref}
      className="mb-6 relative"
      initial={{ 
        opacity: 0, 
        y: 40,
        rotateX: 5
      }}
      animate={isInView ? { 
        opacity: 1, 
        y: 0,
        rotateX: 0
      } : {}}
      transition={{ 
        duration: 0.8 * settings.animationDuration, 
        delay,
        ease: "easeOut"
      }}
    >
      {/* Efecto de terminal con líneas animadas */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-r from-zinc-800 to-zinc-700 rounded-t-lg flex items-center px-4 space-x-2"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: delay + 0.2 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: i === 0 ? '#ef4444' : i === 1 ? '#f59e0b' : '#10b981'
            }}
            animate={isInView ? {
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7]
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </motion.div>
      
      {/* Borde animado */}
      <motion.div
        className="absolute inset-0 rounded-lg border-2 border-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-0.5"
        initial={{ opacity: 0 }}
        animate={isInView ? { 
          opacity: [0, 0.5, 0] 
        } : {}}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-full h-full bg-zinc-900 rounded-lg" />
      </motion.div>
      
      <div className="relative z-10 pt-8">
        {children}
      </div>
    </motion.div>
  )
}
// Componente para animar citas/blockquotes
export const AnimatedQuote = ({ 
  children, 
  delay = 0 
}: { 
  children: ReactNode
  delay?: number
}) => {
  const settings = usePerformanceOptimization()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { 
    amount: 0.4,
    margin: "0px 0px -80px 0px"
  })
  if (settings.reduceMotion) {
    return <div ref={ref} className="mb-8">{children}</div>
  }
  return (
    <motion.div
      ref={ref}
      className="mb-8 relative"
      initial={{ 
        opacity: 0, 
        scale: 0.95,
        rotateY: -5
      }}
      animate={isInView ? { 
        opacity: 1, 
        scale: 1,
        rotateY: 0
      } : {}}
      transition={{ 
        duration: 1 * settings.animationDuration, 
        delay,
        ease: "easeOut"
      }}
    >
      {/* Comillas animadas */}
      <motion.div
        className="absolute -top-4 -left-4 text-6xl text-blue-500/30 font-serif"
        initial={{ scale: 0, rotate: -45 }}
        animate={isInView ? { 
          scale: 1, 
          rotate: 0 
        } : {}}
        transition={{ 
          duration: 0.8 * settings.animationDuration, 
          delay: delay + 0.3,
          type: "spring",
          stiffness: 200
        }}
      >
        "
      </motion.div>
      
      {/* Borde lateral animado */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"
        initial={{ height: 0 }}
        animate={isInView ? { height: "100%" } : {}}
        transition={{ 
          duration: 1.2 * settings.animationDuration, 
          delay: delay + 0.2,
          ease: "easeOut"
        }}
      />
      
      <div className="pl-8 relative z-10">
        {children}
      </div>
    </motion.div>
  )
}