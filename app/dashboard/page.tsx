'use client'

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    if (!isLoading && !isAuthenticated) {
      window.location.href = '/api/auth/login?post_login_redirect_url=/dashboard'
    }
  }, [isLoading, isAuthenticated, isMounted])

  if (!isMounted) {
    return null
  }

  if (isLoading) {
    return <LoadingView message="Verificando acceso..." />
  }

  if (!isAuthenticated) {
    return <LoadingView message="Redirigiendo al login..." />
  }

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
