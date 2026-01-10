'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const [isPointer, setIsPointer] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    let mouseX = -100
    let mouseY = -100
    let cursorX = -100
    let cursorY = -100
    let idleTimeout: NodeJS.Timeout | null = null
    let animationId: number | null = null
    let isIdle = false

    const moveCursor = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      if (!isVisible) setIsVisible(true)

      // Clear idle timeout and restart animation if idle
      if (idleTimeout) clearTimeout(idleTimeout)
      if (isIdle && animationId === null) {
        isIdle = false
        animationId = requestAnimationFrame(animate)
      }

      // Set new idle timeout (pause after 100ms of no movement)
      idleTimeout = setTimeout(() => {
        isIdle = true
        if (animationId !== null) {
          cancelAnimationFrame(animationId)
          animationId = null
        }
      }, 100)
    }

    window.addEventListener('mousemove', moveCursor)

    const animate = () => {
      if (isIdle) return

      const dist = 0.15 // Inertia factor (lower = slower/smoother)

      // Linear interpolation (lerp)
      cursorX += (mouseX - cursorX) * dist
      cursorY += (mouseY - cursorY) * dist

      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    // Hover effects logic
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // Check if target is clickable (a, button, or has role='button')
      const isClickable =
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') ||
        target.closest('button') ||
        target.getAttribute('role') === 'button' ||
        target.classList.contains('cursor-pointer')

      setIsPointer(!!isClickable)
    }

    window.addEventListener('mouseover', handleMouseOver)

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      window.removeEventListener('mouseover', handleMouseOver)
      if (animationId !== null) cancelAnimationFrame(animationId)
      if (idleTimeout) clearTimeout(idleTimeout)
    }
  }, [pathname, isVisible])

  // Hide cursor on touch devices
  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    if (isTouch) setIsVisible(false)
  }, [])

  if (!isVisible) return null

  return (
    <div
      ref={cursorRef}
      className={cn(
        "fixed top-0 left-0 w-6 h-6 rounded-full pointer-events-none z-[9999] transition-all duration-300 ease-out mix-blend-difference hidden md:block",
        "bg-white border border-white/20",
        isPointer ? "w-12 h-12 bg-white/10 backdrop-blur-[1px] scale-110" : "scale-100"
      )}
    />
  )
}
