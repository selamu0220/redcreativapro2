'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../hooks/useAuth'
import { SubscriptionGuard } from './SubscriptionGuard'
import { useLocalization } from '@/app/contexts/LocalizationContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Lock, LogIn, UserPlus } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, isInitializing } = useAuth()
  
  // Try to get localization, but don't fail if provider is missing (SSR/SSG)
  let language = 'es'
  try {
    const localization = useLocalization()
    language = localization.language
  } catch (error) {
    // Provider not available during SSR/SSG, use default
  }
  
  const router = useRouter()
  const [shouldRedirect, setShouldRedirect] = useState(false)

  useEffect(() => {
    // Solo redirigir si definitivamente no hay usuario y no estamos cargando
    if (!loading && !isInitializing && !user) {
      setShouldRedirect(true)
      
      // Redirigir después de mostrar el mensaje brevemente
      const redirectTimer = setTimeout(() => {
        const currentPath = window.location.pathname + window.location.search
        const redirectUrl = encodeURIComponent(currentPath)
        const langPrefix = language && language !== 'es' ? `/${language}` : ''
        router.push(`${langPrefix}/auth?redirect=${redirectUrl}`)
      }, 1500)
      
      return () => clearTimeout(redirectTimer)
    }
  }, [user, loading, isInitializing, router, language])

  // Mostrar loading mientras se verifica la autenticación
  if (loading || isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Mostrar mensaje de acceso restringido si no hay usuario
  if (!user && shouldRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 px-4">
        <Card className="max-w-md w-full shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl">Acceso Restringido</CardTitle>
              <CardDescription className="text-base">
                Esta herramienta requiere que inicies sesión
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => router.push('/auth')}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Iniciar Sesión
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full" 
                size="lg"
                onClick={() => router.push('/auth')}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Crear Cuenta Gratis
              </Button>
            </div>
            
            <div className="pt-4 border-t text-center">
              <p className="text-sm text-muted-foreground">
                Redirigiendo automáticamente...
              </p>
              <div className="mt-2 w-full bg-muted rounded-full h-1 overflow-hidden">
                <div className="bg-primary h-full animate-progress"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Si no hay usuario y no debemos redirigir aún, no mostrar nada
  if (!user) {
    return null
  }

  // Usuario autenticado, mostrar contenido protegido
  return (
    <SubscriptionGuard>
      {children}
    </SubscriptionGuard>
  )
}

export default ProtectedRoute