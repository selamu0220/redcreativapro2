'use client'

import React, { memo, useEffect, useState } from 'react'
import { KindeProvider } from "@kinde-oss/kinde-auth-nextjs"
import ErrorBoundary from './ErrorBoundary'

// Provider con manejo de errores mejorado
export const SafeProviders = memo(function SafeProviders({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    try {
      console.log('🔵 SafeProviders: Mounting...')
      setMounted(true)
      console.log('✅ SafeProviders: Mounted successfully')
    } catch (err) {
      console.error('❌ SafeProviders: Error during mount:', err)
      setError(err as Error)
    }
  }, [])

  // Si hay un error crítico, mostrar fallback
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-lg p-6 text-center">
          <h1 className="text-xl font-bold mb-4">Error de Inicialización</h1>
          <p className="text-muted-foreground mb-4">
            Hubo un problema al cargar la aplicación. Por favor, recarga la página.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Recargar Página
          </button>
        </div>
      </div>
    )
  }

  // Mostrar loading mientras se monta
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-card border border-border rounded-lg p-6 text-center">
            <h1 className="text-xl font-bold mb-4">Error en la Aplicación</h1>
            <p className="text-muted-foreground mb-4">
              Algo salió mal. Intenta recargar la página.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Recargar Página
              </button>
              <a
                href="/"
                className="block w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
              >
                Ir al Inicio
              </a>
            </div>
          </div>
        </div>
      }
    >
      <KindeProvider>
        {children}
      </KindeProvider>
    </ErrorBoundary>
  )
})
