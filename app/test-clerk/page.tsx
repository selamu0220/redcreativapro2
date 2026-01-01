'use client'

import { useUser, useAuth } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

export default function TestClerkPage() {
  const { user, isLoaded, isSignedIn } = useUser()
  const { userId } = useAuth()
  const [envVars, setEnvVars] = useState<Record<string, string>>({})

  useEffect(() => {
    // Verificar variables de entorno del cliente
    setEnvVars({
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 20) + '...' || 'NO CONFIGURADA',
      NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || 'NO CONFIGURADA',
      NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || 'NO CONFIGURADA',
      NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || 'NO CONFIGURADA',
      NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || 'NO CONFIGURADA',
    })
  }, [])

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <h1 className="text-2xl font-bold text-foreground mb-4">🔍 Diagnóstico de Clerk</h1>
          
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Estado de Carga</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${isLoaded ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></span>
                  <span className="text-muted-foreground">isLoaded: {isLoaded ? '✅ Sí' : '⏳ Cargando...'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${isSignedIn ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                  <span className="text-muted-foreground">isSignedIn: {isSignedIn ? '✅ Sí' : '❌ No'}</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Información del Usuario</h2>
              {isLoaded ? (
                isSignedIn && user ? (
                  <div className="bg-background border border-border rounded p-4 space-y-2">
                    <p className="text-sm"><strong>ID:</strong> {user.id}</p>
                    <p className="text-sm"><strong>Email:</strong> {user.primaryEmailAddress?.emailAddress}</p>
                    <p className="text-sm"><strong>Nombre:</strong> {user.fullName || 'No configurado'}</p>
                    <p className="text-sm"><strong>Creado:</strong> {user.createdAt?.toLocaleString()}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No hay usuario autenticado</p>
                )
              ) : (
                <p className="text-muted-foreground">Esperando carga de Clerk...</p>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Variables de Entorno</h2>
              <div className="bg-background border border-border rounded p-4 space-y-2">
                {Object.entries(envVars).map(([key, value]) => (
                  <div key={key} className="flex items-start gap-2">
                    <span className={`w-3 h-3 rounded-full mt-1 ${value !== 'NO CONFIGURADA' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <div className="flex-1">
                      <p className="text-sm font-mono text-foreground">{key}</p>
                      <p className="text-xs text-muted-foreground">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Acciones</h2>
              <div className="flex gap-4">
                <a 
                  href="/auth" 
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Ir a Login
                </a>
                <a 
                  href="/dashboard" 
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
                >
                  Ir a Dashboard
                </a>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Diagnóstico</h2>
              <div className="bg-background border border-border rounded p-4 space-y-2">
                {!isLoaded && (
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-500">⚠️</span>
                    <p className="text-sm text-muted-foreground">
                      Clerk está cargando. Si esto toma más de 3 segundos, verifica:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Que NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY esté configurada</li>
                        <li>Que CLERK_SECRET_KEY esté configurada en el servidor</li>
                        <li>Que las claves sean válidas y del entorno correcto (live/test)</li>
                      </ul>
                    </p>
                  </div>
                )}
                {isLoaded && !isSignedIn && (
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500">ℹ️</span>
                    <p className="text-sm text-muted-foreground">
                      No hay usuario autenticado. Esto es normal si no has iniciado sesión.
                    </p>
                  </div>
                )}
                {isLoaded && isSignedIn && (
                  <div className="flex items-start gap-2">
                    <span className="text-green-500">✅</span>
                    <p className="text-sm text-muted-foreground">
                      ¡Todo funciona correctamente! Clerk está cargado y hay un usuario autenticado.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
