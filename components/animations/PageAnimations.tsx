'use client'

import React from 'react'

// Safe fallback components for PageAnimations

export const AnimatedHeroSection = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  return <div className={className}>{children}</div>
}

export const StaggeredSection = ({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => {
  return <div className={className}>{children}</div>
}

export const FeatureCard = ({ children, className = "", index = 0 }: { children: React.ReactNode, className?: string, index?: number }) => {
  return <div className={className}>{children}</div>
}

export const HeroTextAnimation = ({ phrases }: { phrases: string[] }) => {
  return <span>{phrases[0]}</span>
}