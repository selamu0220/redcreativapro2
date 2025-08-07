'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Force dynamic rendering to avoid prerendering issues
export const dynamic = 'force-dynamic'

export default function SignupPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir a la página de auth principal
    router.replace('/auth')
  }, [router])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-zinc-400">Redirigiendo...</p>
      </div>
    </div>
  )
}