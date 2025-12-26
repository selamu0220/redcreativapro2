'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch'
function UnsubscribeContent() {
  const { post } = useAuthenticatedFetch()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid' | 'form'>('loading')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!token) {
      setStatus('form')
      return
    }

    const unsubscribe = async () => {
      try {
        const data = await post('/api/unsubscribe', { token });
        setStatus('success')
        setMessage('Te has desuscrito exitosamente de nuestros emails.')
      } catch (error) {
        console.error('Error:', error)
        setStatus('error')
        setMessage(error instanceof Error ? error.message : 'Error al desuscribirse')
      }
    }

    unsubscribe()
  }, [token])

  const handleEmailUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const data = await post('/api/unsubscribe', { email });
      setStatus('success')
      setMessage('Te has desuscrito exitosamente de nuestros emails.')
    } catch (error) {
      console.error('Error:', error)
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Error al desuscribirse')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-lg">RC</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-6">Desuscribirse</h1>

          {status === 'loading' && (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
              <p className="text-zinc-400">Procesando...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-400 font-medium">Desuscripción exitosa</p>
              <p className="text-zinc-300 text-sm">{message}</p>
              <p className="text-zinc-400 text-xs mt-4">
                No recibirás más emails de nosotros
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-red-400 font-medium">Error al desuscribirse</p>
              <p className="text-zinc-300 text-sm">{message}</p>
            </div>
          )}

          {status === 'form' && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-zinc-300 mb-6">
                  Ingresa tu email para desuscribirte
                </p>
              </div>
              
              <form onSubmit={handleEmailUnsubscribe} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-colors"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-md font-medium hover:bg-red-700 disabled:bg-zinc-700 disabled:text-zinc-400 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Procesando...' : 'Cancelar Suscripción'}
                </button>
              </form>
            </div>
          )}

          {status === 'invalid' && (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-yellow-400 font-medium">Enlace inválido</p>
              <p className="text-zinc-300 text-sm">{message}</p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-zinc-800">
            <Link 
              href="/"
              className="text-zinc-400 hover:text-white text-sm transition-colors"
            >
              Volver al inicio
            </Link>
          </div>
        </div>

        {/* Additional information */}
        <div className="mt-6 text-center">
          <p className="text-zinc-500 text-xs">
            ¿Necesitas ayuda? Contacta a{' '}
            <a href="mailto:contacto@redcreativapro.com" className="text-zinc-400 hover:text-white transition-colors">
              contacto@redcreativapro.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  )
}