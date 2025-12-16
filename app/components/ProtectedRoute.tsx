'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../hooks/useAuth'
import { SubscriptionGuard } from './SubscriptionGuard'

import { useLocalization } from '@/app/contexts/LocalizationContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth()
  const { language } = useLocalization()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      // Preservar la URL actual como parámetro de redirección
      const currentPath = window.location.pathname + window.location.search
      const redirectUrl = encodeURIComponent(currentPath)
      
      // Asegurar redirección localizada si estamos en una ruta localizada
      const langPrefix = language && language !== 'es' ? `/${language}` : ''
      router.push(`${langPrefix}/auth?redirect=${redirectUrl}`)
    }
  }, [user, loading, router, language])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <SubscriptionGuard>
      {children}
    </SubscriptionGuard>
  )
}

export default ProtectedRoute