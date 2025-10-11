'use client'

import React from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

interface ScrollAnimationProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade'
}

export function ScrollRevealAnimation({ 
  children, 
  className = '', 
  delay = 0, 
  duration = 0.6,
  direction = 'up' 
}: ScrollAnimationProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 50 : direction === 'down' ? -50 : 0,
      x: direction === 'left' ? 50 : direction === 'right' ? -50 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
    }
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      transition={{ 
        duration, 
        delay,
        ease: [0.25, 0.25, 0, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggeredAnimation({ 
  children, 
  className = '',
  staggerDelay = 0.1 
}: {
  children: React.ReactNode[]
  className?: string
  staggerDelay?: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <div ref={ref} className={className}>
      {React.Children.map(children, (child, index) => (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ 
            duration: 0.5, 
            delay: index * staggerDelay,
            ease: [0.25, 0.25, 0, 1]
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  )
}

export function ParallaxText({ 
  children, 
  className = '',
  speed = 0.5 
}: {
  children: React.ReactNode
  className?: string
  speed?: number
}) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  return (
    <motion.div
      ref={ref}
      style={{
        y: useTransform(scrollYProgress, [0, 1], [0, speed * 100])
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function ScaleOnScroll({ 
  children, 
  className = '' 
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
      transition={{ 
        duration: 0.6,
        ease: [0.25, 0.25, 0, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}