'use client'

import { useRef, useState, ReactNode } from 'react'
import { gsap } from 'gsap'

interface TiltCardPremiumProps {
  children: ReactNode
  className?: string
}

export default function TiltCardPremium({ children, className = '' }: TiltCardPremiumProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !glowRef.current) return

    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    const rotateX = ((y - centerY) / centerY) * -10
    const rotateY = ((x - centerX) / centerX) * 10

    gsap.to(card, {
      rotateX,
      rotateY,
      transformPerspective: 1000,
      duration: 0.5,
      ease: 'power2.out'
    })

    // Update spotlight position
    gsap.to(glowRef.current, {
      background: `radial-gradient(circle at ${x}px ${y}px, rgba(147, 51, 234, 0.3), transparent 50%)`,
      duration: 0.3
    })
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (!glowRef.current) return
    gsap.to(glowRef.current, {
      opacity: 1,
      duration: 0.3
    })
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    if (!cardRef.current || !glowRef.current) return
    
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: 'power2.out'
    })

    gsap.to(glowRef.current, {
      opacity: 0,
      duration: 0.3
    })
  }

  return (
    <div
      ref={cardRef}
      className={`relative ${className}`}
      style={{
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Spotlight effect */}
      <div
        ref={glowRef}
        className="absolute inset-0 pointer-events-none opacity-0 rounded-lg"
        style={{ zIndex: 1 }}
      />
      
      {/* Glowing border */}
      {isHovered && (
        <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
          <div className="absolute inset-0 border-2 border-primary/50 rounded-lg animate-glow-border" />
        </div>
      )}
      
      {/* Content with 3D depth */}
      <div
        style={{
          transform: 'translateZ(20px)',
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </div>
    </div>
  )
}
