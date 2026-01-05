'use client'

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react'
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'
import WorkingClientLayout from '../components/WorkingClientLayout'
import DashboardPageClient from '../components/DashboardPageClient'
import { LanguageProvider } from '../lib/language/context'
import { DEFAULT_LANGUAGE } from '../lib/language/config'
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
  const { isLoading, isAuthenticated } = useKindeBrowserClient()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Don't render anything until mounted (avoid hydration issues)
  if (!isMounted) {
    return null
  }

  // Show loading while checking auth
  if (isLoading) {
    return <LoadingView message="Cargando dashboard..." />
  }

  // If not authenticated, middleware will handle redirect
  // Just show loading state briefly
  if (!isAuthenticated) {
    return <LoadingView message="Verificando acceso..." />
  }

  // User is authenticated, show dashboard
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
