'use client'

import { useEffect, useState } from 'react'
import WorkingClientLayout from '../components/WorkingClientLayout'
import DashboardPageClient from '../components/DashboardPageClient'
import { LanguageProvider } from '../lib/language/context'
import { DEFAULT_LANGUAGE } from '../lib/language/config'

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

export default function DashboardPage() {
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