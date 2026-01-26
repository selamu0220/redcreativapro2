'use client'

import { useAuth } from '../hooks/useAuth'
import { useEffect, useState } from 'react'
import { useSimpleTranslations } from '../lib/simple-translations'

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
  const { isAuthenticated, isLoading, user, login, logout } = useAuth()
  const { t } = useSimpleTranslations()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Siempre renderizar skeleton hasta que esté montado
  if (!mounted) {
    return <LoadingSkeleton />
  }

  // Mostrar skeleton solo si está cargando
  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (isAuthenticated && user) {
    const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario'
    const initials = displayName
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

    return (
      <div className="flex items-center space-x-2">
        <a
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
        >
          {t('dashboard')}
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
              {t('settings')}
            </a>
            <a href="/planes" className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
              {t('subscription')}
            </a>
            <div className="h-px bg-border my-1"></div>
            <button
              onClick={() => logout()}
              className="w-full relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-destructive hover:text-destructive-foreground text-destructive"
            >
              {t('logout')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => login()}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
      >
        {t('login')}
      </button>
      <button
        onClick={() => login()} // Register does same thing with Google
        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
      >
        {t('register')}
      </button>
    </div>
  )
}
