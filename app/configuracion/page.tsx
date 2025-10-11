'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ConfiguracionPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir automáticamente a la página de ajustes
    router.replace('/ajustes')
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirigiendo a configuración...</p>
      </div>
    </div>
  )
}