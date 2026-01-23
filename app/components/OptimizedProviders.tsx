'use client'

import React, { memo } from 'react'
import ErrorBoundary from './ErrorBoundary'

// Memoizar el provider para evitar re-renders innecesarios
const MemoizedErrorBoundary = memo(ErrorBoundary)

export const OptimizedProviders = memo(function OptimizedProviders({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <MemoizedErrorBoundary>
      {children}
    </MemoizedErrorBoundary>
  )
})
