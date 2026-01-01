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
import Footer from '../components/Footer'

function LoadingView({ message = 'Cargando...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)

  // Prevenir hidratación mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Redirigir si no está autenticado (solo después de montar)
  useEffect(() => {
    if (!isMounted) return

    if (isLoaded && !isSignedIn) {
      // Redirigir al login de Clerk
      window.location.href = '/auth'
    }
  }, [isLoaded, isSignedIn, isMounted])

  // No renderizar nada hasta que esté montado (prevenir hidratación)
  if (!isMounted) {
    return null
  }

  // Mostrar loading mientras Clerk carga
  if (!isLoaded) {
    return <LoadingView message="Verificando acceso..." />
  }

  // Mostrar loading mientras redirige
  if (!isSignedIn) {
    return <LoadingView message="Redirigiendo al login..." />
  }

  // Usuario autenticado - mostrar dashboard
  return (
    <WorkingClientLayout>
      <LanguageProvider initialLanguage={DEFAULT_LANGUAGE}>
        <div className="min-h-screen flex flex-col bg-background">
          <main className="flex-grow">
            <DashboardPageClient initialLang={DEFAULT_LANGUAGE} />
          </main>
          <Footer />
        </div>
      </LanguageProvider>
    </WorkingClientLayout>
  )
}