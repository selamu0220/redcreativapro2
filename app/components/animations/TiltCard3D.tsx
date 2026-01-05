'use client'

import { useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { motion, useSpring } from 'framer-motion'

interface TiltCard3DProps {
  children: ReactNode
  className?: string
  intensity?: number
  perspective?: number
}

export function TiltCard3D({
  children,
  className = '',
  intensity = 15,
  perspective = 1000,
}: TiltCard3DProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const xSpring = useSpring(0, { damping: 30, stiffness: 300 })
  const ySpring = useSpring(0, { damping: 30, stiffness: 300 })
  const scaleSpring = useSpring(1, { damping: 25, stiffness: 400 })

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const x = e.clientX - centerX
    const y = e.clientY - centerY
    const rotateX = (y / rect.height) * -intensity
    const rotateY = (x / rect.width) * intensity

    setRotation({ x: rotateX, y: rotateY })
    xSpring.set(rotateX)
    ySpring.set(rotateY)
    scaleSpring.set(1.02)
  }

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 })
    xSpring.set(0)
    ySpring.set(0)
    scaleSpring.set(1)
    setIsHovered(false)
  }

  return (
    <div
      ref={ref}
      className={`relative preserve-3d ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
      style={{ perspective }}
    >
      <motion.div
        className="relative preserve-3d transition-transform will-change-transform"
        style={{
          rotateX: xSpring,
          rotateY: ySpring,
          scale: scaleSpring,
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </motion.div>
      <div
        className="absolute inset-0 -z-10 rounded-[inherit] pointer-events-none transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(600px circle at 50% 50%, rgba(59, 130, 246, 0.15), transparent 50%)`,
        }}
      />
    </div>
  )
}

interface SpotlightBorderProps {
  children: ReactNode
  className?: string
}

export function SpotlightBorder({ children, className = '' }: SpotlightBorderProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setPosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative z-10">{children}</div>
      <div
        className="absolute inset-0 -z-10 rounded-[inherit] transition-opacity duration-500 pointer-events-none"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(600px circle at ${position.x}% ${position.y}%, rgba(59, 130, 246, 0.12), transparent 40%)`,
        }}
      />
      <div
        className="absolute inset-0 -z-10 rounded-[inherit] pointer-events-none"
        style={{
          opacity: isHovered ? 1 : 0,
          padding: '1px',
          background: `radial-gradient(400px circle at ${position.x}% ${position.y}%, rgba(59, 130, 246, 0.5), transparent 40%)`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />
    </div>
  )
}

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function MagneticButton({ children, className = '', onClick }: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    setPosition({
      x: (e.clientX - centerX) * 0.3,
      y: (e.clientY - centerY) * 0.3,
    })
  }

  return (
    <motion.button
      ref={ref}
      className={`relative ${className}`}
      onClick={onClick}
      onMouseMove={handleMouseMove as any}
      onMouseLeave={() => {
        setPosition({ x: 0, y: 0 })
        setIsHovered(false)
      }}
      onMouseEnter={() => setIsHovered(true)}
      animate={{ x: position.x, y: position.y, scale: isHovered ? 1.05 : 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  )
}
