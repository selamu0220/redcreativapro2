'use client'

import React, { useEffect, useState } from 'react'

export default function ScrollProgressBar() {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const updateProgress = () => {
      const scrolled = window.scrollY
      const threshold = 100 // Show after scrolling 100px
      const maxHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = Math.min((scrolled / maxHeight) * 100, 100)
      
      setIsVisible(scrolled > threshold)
      setScrollProgress(progress)
    }

    // Check if we're in the browser environment
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', updateProgress)
      updateProgress() // Check initial state
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', updateProgress)
      }
    }
  }, [])

  // Don't render on server side
  if (typeof window === 'undefined') {
    return null
  }

  return (
    <>
      {/* Fixed progress bar at top */}
      <div
        className={`fixed top-0 left-0 right-0 h-1 bg-red-500 origin-left z-50 shadow-sm transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ 
          width: `${scrollProgress}%`,
          transformOrigin: 'left'
        }}
      />
      
      {/* Optional: Subtle glow effect */}
      <div
        className={`fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 to-red-600 origin-left z-40 blur-sm transition-opacity duration-300 ${
          isVisible ? 'opacity-50' : 'opacity-0'
        }`}
        style={{ 
          width: `${scrollProgress}%`,
          transformOrigin: 'left'
        }}
      />
    </>
  )
}