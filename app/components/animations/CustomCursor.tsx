'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const springConfig = { damping: 25, stiffness: 700 }
  const cursorX = useSpring(mouseX, springConfig)
  const cursorY = useSpring(mouseY, springConfig)

  const cursorScale = useSpring(1, springConfig)
  const ringScale = useSpring(1, springConfig)

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseX.set(e.clientX)
    mouseY.set(e.clientY)
    if (!isVisible) setIsVisible(true)
  }, [mouseX, mouseY, isVisible])

  const handleMouseEnter = useCallback(() => setIsVisible(true), [])
  const handleMouseLeave = useCallback(() => setIsVisible(false), [])
  
  const handleMouseDown = useCallback(() => {
    setIsClicking(true)
    cursorScale.set(0.8)
    ringScale.set(0.6)
  }, [cursorScale, ringScale])
  
  const handleMouseUp = useCallback(() => {
    setIsClicking(false)
    cursorScale.set(1)
    ringScale.set(1)
  }, [cursorScale, ringScale])

  const handleMouseOver = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement
    const isInteractive = 
      target.tagName === 'A' || 
      target.tagName === 'BUTTON' ||
      target.closest('a') || 
      target.closest('button') ||
      target.classList.contains('cursor-hover') ||
      target.closest('.cursor-hover')
    
    if (isInteractive) {
      setIsHovering(true)
      cursorScale.set(1.5)
      ringScale.set(2)
    } else {
      setIsHovering(false)
      cursorScale.set(1)
      ringScale.set(1)
    }
  }, [cursorScale, ringScale])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseenter', handleMouseEnter)
    window.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mouseover', handleMouseOver)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseenter', handleMouseEnter)
      window.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mouseover', handleMouseOver)
    }
  }, [handleMouseMove, handleMouseEnter, handleMouseLeave, handleMouseDown, handleMouseUp, handleMouseOver])

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null
  }

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{
          translateX: cursorX,
          translateY: cursorY,
          scale: cursorScale,
        }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.1 }}
      >
        <div className="relative -translate-x-1/2 -translate-y-1/2">
          <div 
            className={`w-4 h-4 rounded-full ${
              isClicking ? 'bg-white scale-75' : 'bg-white'
            }`}
          />
          {isHovering && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-white"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
          )}
        </div>
      </motion.div>
      
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998]"
        style={{
          translateX: cursorX,
          translateY: cursorY,
          scale: ringScale,
        }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <div 
          className="relative -translate-x-1/2 -translate-y-1/2"
          style={{ 
            width: 48, 
            height: 48,
          }}
        >
          <div className="absolute inset-0 rounded-full border border-white/30" />
        </div>
      </motion.div>
    </>
  )
}

export function withCustomCursor<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithCursorComponent(props: P) {
    return (
      <>
        <CustomCursor />
        <WrappedComponent {...props} />
      </>
    )
  }
}
