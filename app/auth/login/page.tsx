'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginRedirectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // Obtener el parámetro redirect de la URL
    const redirectUrl = searchParams.get('redirect')
    
    // Construir la URL de destino preservando el parámetro redirect
    const targetUrl = redirectUrl ? `/auth?redirect=${encodeURIComponent(redirectUrl)}` : '/auth'
    
    // Redirigir a la página de auth principal
    router.replace(targetUrl)
  }, [router, searchParams])
  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-zinc-400">Redirigiendo al login...</p>
      </div>
    </div>
  )
}