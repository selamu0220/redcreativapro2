'use client'

import React, { ReactNode } from 'react'

export const ExplodeIn = ({ children }: { children: ReactNode, delay?: number, duration?: number }) => <>{children}</>
export const BrutalSlide = ({ children }: { children: ReactNode, direction?: string, delay?: number, distance?: number, duration?: number }) => <>{children}</>
export const GlitchText = ({ children }: { children: ReactNode, intensity?: number }) => <>{children}</>
export const MagneticHover = ({ children }: { children: ReactNode, strength?: number }) => <>{children}</>
export const ScrollReveal = ({ children }: { children: ReactNode, direction?: string, delay?: number }) => <>{children}</>
export const ParticleExplosion = ({ trigger, particleCount }: { trigger: boolean, particleCount?: number }) => null
export const BrutalParallax = ({ children, speed }: { children: ReactNode, speed?: number }) => <>{children}</>
export const BrutalTypewriter = ({ text, speed }: { text: string, speed?: number }) => <span>{text}</span>
