'use client'

import { useEffect, useState } from 'react'
import AuthPageClient from '../components/AuthPageClient'
import { DEFAULT_LANGUAGE } from '../lib/language/config'

function HydrationGate({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false)
  useEffect(() => setIsHydrated(true), [])
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-zinc-400">Cargando...</p>
        </div>
      </div>
    )
  }
  return <>{children}</>
}

export default function AuthPage() {
  return (
    <HydrationGate>
      <AuthPageClient initialLang={DEFAULT_LANGUAGE} />
    </HydrationGate>
  )
}
