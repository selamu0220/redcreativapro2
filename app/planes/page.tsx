'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '../hooks/useAuth'
import { useOptimizedAuth } from '../hooks/useOptimizedAuth'
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch'
import { useAnalytics } from '../hooks/useAnalytics'
import { usePageEngagement } from '@/app/hooks/usePageEngagement'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import { Zap, Star, Crown, Check, X } from 'lucide-react'

interface SubscriptionStatus {
  hasSubscription: boolean
  isPremium: boolean
  subscriptionPlan: 'monthly' | 'yearly' | 'lifetime' | null
  subscriptionActive: boolean
}

interface StripeProduct {
  id: string
  name: string
  price: string
  priceId: string
  interval: string
  features: string[]
  popular?: boolean
  badge?: string
}

const PlanesPage = () => {
  const { user } = useAuth()
  const { get, post } = useAuthenticatedFetch()
  const analytics = useAnalytics()
  const { trackFeatureInteraction } = usePageEngagement({
    pageName: 'Planes de Suscripción',
    trackScrollDepth: true,
    trackTimeOnPage: true,
    scrollThresholds: [25, 50, 75, 100],
    timeThresholds: [10, 30, 60, 120, 300]
  })
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    hasSubscription: false,
    isPremium: false,
    subscriptionPlan: null,
    subscriptionActive: false
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingCheckout, setIsCreatingCheckout] = useState<string | null>(null)
  const [showVideoModal, setShowVideoModal] = useState(false)

  // Stripe Products Configuration
  const stripeProducts: StripeProduct[] = [
    {
      id: 'monthly',
      name: 'Red Creativa Pro',
      price: '€4.99',
      priceId: 'price_1RnMKwAZjhZ6eQncM71bv8Zh',
      interval: 'Mensual',
      popular: true,
      badge: 'Más Popular',
      features: [
        'Mejoras ilimitadas de texto',
        'Todas las herramientas de IA',
        'Envío de emails masivos',
        'Generación de contenido',
        'Acceso privado al creador',
        'Feedback directo por Instagram',
        'Reuniones para mejoras',
        'Soporte prioritario',
        'Sin anuncios'
      ]
    },
    {
      id: 'yearly',
      name: 'Red Creativa Pro',
      price: '€142.80',
      priceId: 'price_1RmjCxAZjhZ6eQncq2G4QoCu',
      interval: 'Anual',
      badge: 'Plan Anual',
      features: [
        'Todo lo del plan mensual',
        'Acceso privado al creador',
        'Feedback directo por Instagram',
        'Reuniones para mejoras',
        'Facturación anual',
        'Acceso prioritario a beta',
        'Consultas ilimitadas',
        'Soporte VIP'
      ]
    },
    {
      id: 'lifetime',
      name: 'Red Creativa Pro (DE POR VIDA)',
      price: '€429.00',
      priceId: 'price_1RmjF1AZjhZ6eQncFe2Rft19',
      interval: 'Pago único',
      badge: 'Pago Único',
      features: [
        'Acceso de por vida',
        'Todas las funciones premium',
        'Acceso privado al creador',
        'Feedback directo por Instagram',
        'Reuniones para mejoras',
        'Sin pagos recurrentes',
        'Actualizaciones gratuitas',
        'Soporte premium de por vida'
      ]
    }
  ]

  useEffect(() => {
    if (user?.email) {
      checkSubscriptionStatus()
    } else {
      setIsLoading(false)
    }
    
    // Track page view and pricing view
    analytics.trackPageView('/planes', 'Planes de Suscripción')
    analytics.trackPricingView(document.referrer ? 'referrer' : 'direct')
  }, [user, analytics])

  const checkSubscriptionStatus = async () => {
    try {
      if (!user?.email) {
        setIsLoading(false)
        return
      }
      const data = await get(`/api/subscription/status?email=${encodeURIComponent(user.email)}`)
      setSubscriptionStatus(data)
    } catch (error) {
      console.error('Error checking subscription status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createCheckoutSession = async (priceId: string, productName: string) => {
    if (!user?.email) {
      alert('Debes estar logueado para suscribirte')
      return
    }

    // Determine plan type and value for analytics
    const planType = priceId.includes('monthly') ? 'monthly' : 
                    priceId.includes('yearly') ? 'yearly' : 'lifetime'
    const planValue = planType === 'monthly' ? 4.99 : 
                     planType === 'yearly' ? 142.80 : 429.00

    // Track begin checkout event
    const analyticsType = planType === 'yearly' ? 'discounted' : planType as 'monthly' | 'lifetime'
    analytics.trackBeginCheckout(analyticsType, planValue)

    setIsCreatingCheckout(priceId)
    try {
      const data = await post('/api/subscription/create', {
        priceId,
        userEmail: user.email,
        successUrl: `${window.location.origin}/planes?success=true`,
        cancelUrl: `${window.location.origin}/planes?canceled=true`
      })
      
      if (data.url) {
        // Track checkout progress
        analytics.trackCheckoutProgress('payment_method', planType, planValue)
        window.location.href = data.url
      } else {
        console.error('Error creating checkout session:', data.error)
        alert('Error al crear la sesión de pago. Inténtalo de nuevo.')
      }
    } catch (error) {
      console.error('Error:', error)
      
      // Manejo mejorado de errores
      let errorMessage = 'Error de conexión. Inténtalo de nuevo.'
      
      if (error instanceof Error) {
        console.log('Error details:', {
          message: error.message,
          status: (error as any).status,
          statusText: (error as any).statusText,
          details: (error as any).details
        })
        
        // Verificar si el error contiene el código STRIPE_NOT_CONFIGURED
        if (error.message.includes('STRIPE_NOT_CONFIGURED') || 
            error.message.includes('Invalid API Key') ||
            error.message.includes('No API key provided') ||
            error.message.includes('Servicio de pago no configurado')) {
          errorMessage = '⚠️ El sistema de pago no está configurado. Contacta al administrador o intenta más tarde.'
        } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
          errorMessage = '❌ Error de conexión con el servidor. Verifica tu conexión a internet.'
        } else if ((error as any).status === 503) {
          errorMessage = '⚠️ El servicio de pago no está disponible. Contacta al administrador.'
        } else {
          errorMessage = `❌ Error: ${error.message}`
        }
      } else if (typeof error === 'object' && error !== null) {
        // Si el error es un objeto, verificar propiedades comunes
        const errorObj = error as any
        if (errorObj.code === 'STRIPE_NOT_CONFIGURED' || 
            errorObj.message?.includes('Invalid API Key') ||
            errorObj.message?.includes('Servicio de pago no configurado')) {
          errorMessage = '⚠️ El sistema de pago no está configurado. Contacta al administrador o intenta más tarde.'
        } else if (errorObj.message) {
          errorMessage = `❌ ${errorObj.message}`
        }
      }
      
      // Track checkout abandonment
      analytics.trackAbandonCheckout('payment_method', planType, 'checkout_error')
      
      alert(errorMessage)
    } finally {
      setIsCreatingCheckout(null)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground">
        {/* Header Navigation */}
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 max-w-screen-2xl items-center">
            <div className="mr-4 hidden md:flex">
              <Link className="mr-6 flex items-center space-x-2" href="/">
                <div className="h-6 w-6 rounded-sm bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xs">RC</span>
                </div>
                <span className="hidden font-bold sm:inline-block">Red Creativa Pro</span>
              </Link>
            </div>
            <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
              <nav className="flex items-center space-x-6">
                {/* Botón de Tutorial de YouTube */}
                <button
                  onClick={() => setShowVideoModal(true)}
                  className="flex items-center gap-2 text-xs text-red-600 hover:text-red-700 transition-colors duration-200 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg border border-red-200 hover:border-red-300"
                  title="Ver tutorial de cómo pagar"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span className="font-medium">📺 Tutorial Pago</span>
                </button>
                
                <Link href="/escritor-ia" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                  Escritor IA
                </Link>
                <Link href="/planes" className="text-sm font-medium text-primary">
                  Planes
                </Link>
              </nav>
              <Link 
                href="/escritor-ia" 
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
              >
                Volver
              </Link>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Elige tu Plan</h1>
            <p className="text-xl text-muted-foreground mb-2">Acceso completo a todas las herramientas de IA</p>
            <p className="text-lg text-primary font-semibold">Planes flexibles para cada necesidad</p>
          </div>

          {/* Planes */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {stripeProducts.map((product) => (
              <div key={product.id} className={`bg-card rounded-lg border shadow-sm p-8 relative hover:scale-105 transition-all duration-300 ${
                product.popular ? 'border-2 border-primary shadow-lg transform scale-105' : 'border-border'
              }`}>
                {product.badge && (
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm ${
                    product.popular ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                  }`}>
                    {product.badge}
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-card-foreground mb-2">{product.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-primary">{product.price}</span>
                    <span className="text-muted-foreground">/{product.interval}</span>
                  </div>
                  <ul className="space-y-3 mb-8 text-left">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-card-foreground">
                        <svg className="w-5 h-5 text-primary mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {subscriptionStatus.hasSubscription && subscriptionStatus.isPremium ? (
                    <button 
                      disabled
                      className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg font-semibold cursor-not-allowed opacity-60"
                    >
                      Plan Actual
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        // Track pricing engagement
                        const planType = product.id as 'monthly' | 'yearly' | 'lifetime'
                        const analyticsType = planType === 'yearly' ? 'discounted' : planType as 'monthly' | 'lifetime'
                        analytics.trackPricingEngagement(analyticsType, 'click')
                        analytics.trackButtonClick('Suscribirse', `plan-${product.id}`)
                        trackFeatureInteraction('pricing_plan', 'subscribe_click')
                        createCheckoutSession(product.priceId, product.name)
                      }}
                      onMouseEnter={() => {
                        // Track hover engagement
                        const planType = product.id as 'monthly' | 'yearly' | 'lifetime'
                        const analyticsType = planType === 'yearly' ? 'discounted' : planType as 'monthly' | 'lifetime'
                        analytics.trackPricingEngagement(analyticsType, 'hover')
                        trackFeatureInteraction('pricing_plan', 'hover')
                      }}
                      disabled={isCreatingCheckout === product.priceId}
                      className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                        product.popular
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isCreatingCheckout === product.priceId ? 'Procesando...' : 'Suscribirse'}
                    </button>
                  )}
                </div>
              </div>
            ))}

          </div>

          {/* Plan Actual */}
          <div className="mt-12 bg-card rounded-lg border border-border shadow-sm p-8">
            <h2 className="text-2xl font-bold text-card-foreground mb-6 text-center">Plan Actual</h2>
            <div className="bg-muted rounded-lg p-6 max-w-md mx-auto">
              <div className="flex justify-between items-center mb-4">
                <span className="text-muted-foreground">Plan:</span>
                <span className="font-semibold text-card-foreground">
                  {subscriptionStatus.hasSubscription 
                    ? (subscriptionStatus.subscriptionPlan === 'monthly' ? 'Pro Mensual' :
                       subscriptionStatus.subscriptionPlan === 'yearly' ? 'Pro Anual' :
                       subscriptionStatus.subscriptionPlan === 'lifetime' ? 'Pro De por Vida' : 'Pro')
                    : 'Gratuito'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-muted-foreground">Estado:</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  subscriptionStatus.hasSubscription && subscriptionStatus.subscriptionActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {subscriptionStatus.hasSubscription && subscriptionStatus.subscriptionActive ? 'Activo' : 'Gratuito'}
                </span>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {subscriptionStatus.hasSubscription && subscriptionStatus.subscriptionActive
                    ? 'Tienes acceso completo a todas las funciones premium'
                    : 'Acceso limitado a funciones básicas'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Botón Volver */}
          <div className="mt-8 text-center">
            <Link 
              href="/escritor-ia" 
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg transition-colors hover:bg-primary/90"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al Escritor
            </Link>
          </div>
        </div>
        
        {/* Video Modal */}
        {showVideoModal && (
          <VideoModal 
            onClose={() => setShowVideoModal(false)}
            videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
          />
        )}
      </div>
    </ProtectedRoute>
  )
}

// VideoModal Component
interface VideoModalProps {
  onClose: () => void
  videoUrl: string
}

function VideoModal({ onClose, videoUrl }: VideoModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Introducción a Red Creativa Pro</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="aspect-video">
          <iframe
            src={videoUrl}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  )
}

export default PlanesPage