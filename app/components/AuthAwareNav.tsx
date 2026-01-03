'use client'

import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'
import { useEffect, useState } from 'react'

// Componente de skeleton consistente
function LoadingSkeleton() {
  return (
    <div className="flex items-center space-x-2">
      <div className="h-9 w-16 bg-muted rounded-md animate-pulse"></div>
      <div className="h-9 w-20 bg-muted rounded-md animate-pulse"></div>
    </div>
  )
}

export function AuthAwareNav() {
  const { isAuthenticated, isLoading, user } = useKindeBrowserClient()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Siempre renderizar skeleton hasta que esté montado
  if (!mounted) {
    return <LoadingSkeleton />
  }

  // Mostrar skeleton mientras carga
  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (isAuthenticated && user) {
    const displayName = user.given_name || user.family_name || user.email?.split('@')[0] || 'Usuario'
    const initials = displayName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

    return (
      <div className="flex items-center space-x-2">
        <a 
          href="/dashboard" 
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
        >
          Dashboard
        </a>
        <div className="relative group">
          <button 
            type="button"
            className="inline-flex items-center justify-center rounded-full h-8 w-8 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {initials}
          </button>
          <div className="absolute right-0 mt-2 w-56 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md hidden group-hover:block z-50">
            <div className="px-2 py-1.5 text-sm">
              <div className="font-medium">{displayName}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
            <div className="h-px bg-border my-1"></div>
            <a href="/ajustes" className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
              Configuración
            </a>
            <a href="/planes" className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
              Suscripción
            </a>
            <div className="h-px bg-border my-1"></div>
            <a href="/api/auth/logout" className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-destructive hover:text-destructive-foreground text-destructive">
              Cerrar Sesión
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <a 
        href="/api/auth/login" 
        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
      >
        Iniciar Sesión
      </a>
      <a 
        href="/api/auth/register" 
        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
      >
        Registrarse
      </a>
    </div>
  )
}
