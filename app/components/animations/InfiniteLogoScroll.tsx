'use client'

import { type ReactNode } from 'react'
import { motion } from 'framer-motion'

interface LogoItem {
  icon: ReactNode
  name: string
}

interface InfiniteLogoScrollProps {
  logos: LogoItem[]
  direction?: 'left' | 'right'
  speed?: number
  className?: string
  grayscale?: boolean
  opacity?: number
}

export function InfiniteLogoScroll({
  logos,
  direction = 'left',
  speed = 30,
  className = '',
  grayscale = true,
  opacity = 0.5,
}: InfiniteLogoScrollProps) {
  const duplicatedLogos = [...logos, ...logos, ...logos]

  return (
    <div className={`relative overflow-hidden py-8 ${className}`}>
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
      
      <motion.div
        className="flex gap-12 w-max"
        animate={{
          x: direction === 'left' ? [0, -50 * logos.length] : [0, 50 * logos.length],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: speed,
            ease: 'linear',
          },
        }}
      >
        {duplicatedLogos.map((logo, index) => (
          <div
            key={index}
            className={`flex items-center gap-3 text-2xl font-bold tracking-tighter whitespace-nowrap ${
              grayscale ? 'grayscale opacity-50' : ''
            }`}
            style={{ opacity }}
          >
            {logo.icon}
            <span>{logo.name}</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

interface MarqueeTextProps {
  texts: string[]
  direction?: 'left' | 'right'
  speed?: number
  className?: string
  textClassName?: string
}

export function MarqueeText({
  texts,
  direction = 'left',
  speed = 20,
  className = '',
  textClassName = '',
}: MarqueeTextProps) {
  const duplicatedTexts = [...texts, ...texts, ...texts]

  return (
    <div className={`relative overflow-hidden py-4 ${className}`}>
      <motion.div
        className="flex gap-8 w-max"
        animate={{
          x: direction === 'left' ? [0, -50 * texts.length] : [0, 50 * texts.length],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: speed,
            ease: 'linear',
          },
        }}
      >
        {duplicatedTexts.map((text, index) => (
          <span
            key={index}
            className={`text-lg font-medium whitespace-nowrap ${textClassName}`}
          >
            {text}
          </span>
        ))}
      </motion.div>
    </div>
  )
}
