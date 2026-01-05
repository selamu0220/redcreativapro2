'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function MagneticCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const cursorDotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cursor = cursorRef.current
    const cursorDot = cursorDotRef.current
    if (!cursor || !cursorDot) return

    let mouseX = 0
    let mouseY = 0
    let cursorX = 0
    let cursorY = 0

    // Smooth cursor follow with GSAP
    const moveCursor = () => {
      const distX = mouseX - cursorX
      const distY = mouseY - cursorY
      
      cursorX += distX * 0.1
      cursorY += distY * 0.1
      
      gsap.set(cursor, {
        x: cursorX,
        y: cursorY,
      })
      
      gsap.set(cursorDot, {
        x: mouseX,
        y: mouseY,
      })
      
      requestAnimationFrame(moveCursor)
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const handleMouseEnter = () => {
      gsap.to(cursor, {
        scale: 2,
        mixBlendMode: 'difference',
        duration: 0.3,
        ease: 'power2.out'
      })
    }

    const handleMouseLeave = () => {
      gsap.to(cursor, {
        scale: 1,
        mixBlendMode: 'normal',
        duration: 0.3,
        ease: 'power2.out'
      })
    }

    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove)
    
    // Add hover effects to interactive elements
    const interactiveElements = document.querySelectorAll('a, button, [role="button"]')
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter)
      el.addEventListener('mouseleave', handleMouseLeave)
    })

    moveCursor()

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter)
        el.removeEventListener('mouseleave', handleMouseLeave)
      })
    }
  }, [])

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] mix-blend-difference"
        style={{
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="w-full h-full rounded-full border-2 border-white" />
      </div>
      <div
        ref={cursorDotRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 pointer-events-none z-[9999] bg-white rounded-full"
        style={{
          transform: 'translate(-50%, -50%)',
        }}
      />
    </>
  )
}
