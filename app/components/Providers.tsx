'use client'

import React, { memo } from 'react'
import { KindeProvider } from "@kinde-oss/kinde-auth-nextjs"
import ErrorBoundary from './ErrorBoundary'

// Memoizar el provider para evitar re-renders innecesarios
const MemoizedErrorBoundary = memo(ErrorBoundary)

export const Providers = memo(function Providers({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  // Verificar que estamos en el cliente
  if (typeof window === 'undefined') {
    return <>{children}</>
  }

  return (
    <KindeProvider>
      <MemoizedErrorBoundary>
        {children}
      </MemoizedErrorBoundary>
    </KindeProvider>
  )
})