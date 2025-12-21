'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../hooks/useAuth'
import { SubscriptionGuard } from './SubscriptionGuard'
import { useLocalization } from '@/app/contexts/LocalizationContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Lock, LogIn, UserPlus } from 'lucide-react'
import Link from 'next/link'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth()
  const { language } = useLocalization()
  const router = useRouter()
  const [showAuthMessage, setShowAuthMessage] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      // Mostrar mensaje de autenticación requerida
      setShowAuthMessage(true)
      
      // Esperar un momento antes de redirigir para que el usuario vea el mensaje
      const timer = setTimeout(() => {
        // Preservar la URL actual como parámetro de redirección
        const currentPath = window.location.pathname + window.location.search
        const redirectUrl = encodeURIComponent(currentPath)
        
        // Asegurar redirección localizada si estamos en una ruta localizada
        const langPrefix = language && language !== 'es' ? `/${language}` : ''
        router.push(`${langPrefix}/auth?redirect=${redirectUrl}`)
      }, 2000) // Esperar 2 segundos antes de redirigir
      
      return () => clearTimeout(timer)
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

  if (!user && showAuthMessage) {
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
                onClick={() => router.push('/sign-in')}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Iniciar Sesión
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full" 
                size="lg"
                onClick={() => router.push('/sign-up')}
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