'use client'

export const dynamic = 'force-dynamic';

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
import { SimpleMainNavigation } from '../components/SimpleMainNavigation'
import Footer from '../components/Footer'

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
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-grow flex items-center justify-center px-4 py-24">
        <Card className="max-w-md w-full shadow-lg border-zinc-200 dark:border-zinc-800">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
              <Lock className="h-8 w-8 text-foreground" />
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
                className="w-full bg-zinc-900 text-white dark:bg-white dark:text-black"
                size="lg"
                onClick={() => window.location.href = 'https://accounts.redcreativa.pro/sign-in?redirect_url=https://redcreativa.pro/dashboard'}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Iniciar Sesión
              </Button>

              <Button
                variant="outline"
                className="w-full border-zinc-200 dark:border-zinc-800"
                size="lg"
                onClick={() => window.location.href = 'https://accounts.redcreativa.pro/sign-up?redirect_url=https://redcreativa.pro/dashboard'}
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
      <Footer />
    </div>
  )
}

export default function DashboardPage() {
  const { isLoaded, isSignedIn } = useUser()
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (isLoaded) {
      setShowContent(true)
    } else {
      // Timeout de seguridad: si Clerk no carga en 2 segundos, mostrar contenido/login de todas formas
      const timer = setTimeout(() => setShowContent(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [isLoaded])

  // Mostrar loading sol si no hemos superado el timeout o cargado
  if (!showContent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground">Verificando acceso...</p>
          </div>

          {/* Show help option if it takes too long */}
          <div className="opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-[3000ms] fill-mode-forwards">
            <p className="text-xs text-muted-foreground mb-3">¿Tarda demasiado?</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = 'https://accounts.redcreativa.pro/sign-in?redirect_url=https://redcreativa.pro/dashboard'}
            >
              Reintentar Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Si no está autenticado, redirigir automáticamente al login
  useEffect(() => {
    if (showContent && !isSignedIn) {
      window.location.href = 'https://accounts.redcreativa.pro/sign-in?redirect_url=https://redcreativa.pro/dashboard';
    }
  }, [showContent, isSignedIn]);

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Redirigiendo al login...</p>
        </div>
      </div>
    );
  }

  // Si está autenticado, mostrar el dashboard
  return (
    <WorkingClientLayout>
      <LanguageProvider initialLanguage={DEFAULT_LANGUAGE}>
        <div className="min-h-screen flex flex-col bg-background">
          <main className="flex-grow">
            <HydrationGate>
              <DashboardPageClient initialLang={DEFAULT_LANGUAGE} />
            </HydrationGate>
          </main>
          <Footer />
        </div>
      </LanguageProvider>
    </WorkingClientLayout>
  )
}
