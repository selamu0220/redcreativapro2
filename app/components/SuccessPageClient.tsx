'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../hooks/useAuth'
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch'
import { useAnalytics } from '../hooks/useAnalytics'
import { usePageEngagement } from '../hooks/usePageEngagement'
import { Button } from '../components/ui/button'

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { post } = useAuthenticatedFetch()
  const analytics = useAnalytics()
  const { trackFeatureInteraction } = usePageEngagement({
    pageName: 'Pago Exitoso',
    trackScrollDepth: true,
    trackTimeOnPage: true
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (!sessionId) {
      setError('No se encontró la sesión de pago')
      setLoading(false)
      return
    }

    const verifyPayment = async () => {
      try {
        const data = await post('/api/stripe/verify-session', { sessionId })
        if (data.success) {
          const planType = data.planType || 'monthly'
          const planValue = data.amount || (planType === 'monthly' ? 4.99 : planType === 'yearly' ? 142.8 : 429.0)
          const analyticsType = planType === 'yearly' ? 'discounted' : (planType as 'monthly' | 'lifetime')

          analytics.trackPurchase(sessionId, analyticsType, planValue, data.paymentMethod)
          analytics.trackSubscriptionSuccess(planType, planValue, user ? 'returning' : 'new')
          analytics.trackConversionEvent('purchase', {
            value: planValue,
            currency: 'EUR',
            plan_type: planType,
            user_id: user?.uid,
            properties: {
              transaction_id: sessionId,
              payment_method: data.paymentMethod || 'stripe',
              conversion_source: 'checkout_success',
              user_type: user ? 'returning' : 'new'
            }
          })
          analytics.trackPageView('/success', 'Pago Exitoso')
          trackFeatureInteraction('payment_success', 'conversion_completed')
          setLoading(false)
        } else {
          setError('Error al verificar el pago')
          setLoading(false)
        }
      } catch (error) {
        setError('Error al verificar el pago')
        setLoading(false)
      }
    }

    verifyPayment()
  }, [sessionId, analytics, user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Verificando tu pago...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error en el pago</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/planes">Intentar de nuevo</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">¡Pago exitoso!</h3>
          <p className="mt-1 text-sm text-gray-500">Tu suscripción Pro ha sido activada correctamente.</p>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-blue-900">Beneficios de tu Plan Pro:</h4>
            <ul className="mt-2 text-sm text-blue-700 space-y-1">
              <li>• Mejoras de texto ilimitadas</li>
              <li>• Acceso a todas las herramientas</li>
              <li>• Sin límites diarios</li>
              <li>• Soporte prioritario</li>
            </ul>
          </div>

          <div className="mt-6 space-y-3">
            <Button asChild className="w-full">
              <Link href="/escritor-ia">Comenzar a usar Pro</Link>
            </Button>
            <Link
              href="/planes"
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Ver mis planes
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function HydrationGate({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }
  return <>{children}</>
}

export default function SuccessPageClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <HydrationGate>
        <SuccessContent />
      </HydrationGate>
    </Suspense>
  )
}
