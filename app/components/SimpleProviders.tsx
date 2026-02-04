'use client'

import React from 'react'

interface SimpleProvidersProps {
  children: React.ReactNode
}

// Providers mínimos para evitar errores de webpack
export default function SimpleProviders({ children }: SimpleProvidersProps) {
  return (
    <div suppressHydrationWarning>
      {children}
    </div>
  )
}
