'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import WorkingClientLayout from '../components/WorkingClientLayout'
import DashboardPageClient from '../components/DashboardPageClient'
import { LanguageProvider } from '../lib/language/context'
import { DEFAULT_LANGUAGE } from '../lib/language/config'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { LogIn, UserPlus, Lock } from 'lucide-react'
import Link from 'next/link'

function HydrationGate({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false)
  useEffect(() => setIsHydrated(true), [])
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    )
  }
  return <>{children}</>
}

function UnauthenticatedView() {
  const router = useRouter()
  
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
              Necesitas iniciar sesión para acceder al dashboard
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
          
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center">
              ¿Necesitas ayuda?{' '}
              <Link href="/contacto" className="text-primary hover:underline">
                Contáctanos
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DashboardPage() {
  const { isLoaded, isSignedIn } = useUser()
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (isLoaded) {
      setShowContent(true)
    }
  }, [isLoaded])

  // Mostrar loading mientras Clerk se inicializa
  if (!isLoaded || !showContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado, mostrar mensaje de registro
  if (!isSignedIn) {
    return <UnauthenticatedView />
  }

  // Si está autenticado, mostrar el dashboard
  return (
    <WorkingClientLayout>
      <LanguageProvider initialLanguage={DEFAULT_LANGUAGE}>
        <HydrationGate>
          <DashboardPageClient initialLang={DEFAULT_LANGUAGE} />
        </HydrationGate>
      </LanguageProvider>
    </WorkingClientLayout>
  )
}