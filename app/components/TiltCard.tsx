'use client'

import { useRef, type ReactNode, type MouseEvent } from 'react'

interface TiltCardProps {
  children: ReactNode
  className?: string
}

export function TiltCard({ children, className = '' }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return

    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Set CSS variables for spotlight effect
    card.style.setProperty('--mouse-x', `${x}px`)
    card.style.setProperty('--mouse-y', `${y}px`)

    // Calculate tilt
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = (y - centerY) / 20
    const rotateY = (centerX - x) / 20

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
  }

  const handleMouseLeave = () => {
    const card = cardRef.current
    if (!card) return
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)'
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`tilt-card-3d ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        transition: 'transform 0.1s ease-out'
      }}
    >
      <div className="spotlight-border-effect" />
      <div style={{ transform: 'translateZ(20px)' }}>
        {children}
      </div>
      <style jsx>{`
        .tilt-card-3d {
          position: relative;
          background: #0d0d0d;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .tilt-card-3d::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(
            600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(59, 130, 246, 0.1),
            transparent 40%
          );
          opacity: 0;
          transition: opacity 0.5s;
          pointer-events: none;
          border-radius: inherit;
        }
        
        .tilt-card-3d:hover::after {
          opacity: 1;
        }
        
        .spotlight-border-effect {
          position: absolute;
          inset: -1px;
          background: radial-gradient(
            400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(59, 130, 246, 0.4),
            transparent 40%
          );
          z-index: -1;
          border-radius: inherit;
          opacity: 0;
          transition: opacity 0.5s;
        }
        
        .tilt-card-3d:hover .spotlight-border-effect {
          opacity: 1;
        }
      `}</style>
    </div>
  )
}
