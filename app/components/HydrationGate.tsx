"use client"

import { useEffect, useState } from 'react'

export default function HydrationGate({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto mb-3"></div>
          <p className="text-zinc-400">Cargando...</p>
        </div>
      </div>
    )
  }
  return <>{children}</>
}

