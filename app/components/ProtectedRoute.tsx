'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../hooks/useAuth'
import { SubscriptionGuard } from './SubscriptionGuard'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      // Preservar la URL actual como parámetro de redirección
      const currentPath = window.location.pathname + window.location.search
      const redirectUrl = encodeURIComponent(currentPath)
      router.push(`/auth?redirect=${redirectUrl}`)
    }
  }, [user, loading, router])

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