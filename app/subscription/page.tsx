'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useSubscription, usePremiumTheme } from '../hooks/useSubscription'
import { useAnalytics } from '../hooks/useAnalytics'
// import { useLocalization, useCurrency, usePaymentMethods } from '../contexts/LocalizationContext'
import PremiumBadge, { PremiumCrownBadge } from '../components/PremiumBadge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import CustomerPortalButton from '../components/CustomerPortalButton'
import {
  Crown,
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  ExternalLink,
  ArrowLeft,
  Zap,
  Star,
  Gift
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface BillingHistory {
  id: string
  date: string
  amount: string
  status: 'paid' | 'pending' | 'failed'
  description: string
  invoiceUrl?: string
}

export default function SubscriptionPage() {
  const { user } = useAuth()
  const { subscriptionData, loading, cancelSubscription, createCheckoutSession } = useSubscription()
  const { isPremium, getThemeClasses, premiumBgClass, premiumTextClass, premiumBorderClass, premiumButtonClass } = usePremiumTheme()
  const analytics = useAnalytics()

// Localization hooks (temporarily disabled)
  // const { country, currency, formatCurrency, isLatinAmerica, isLoading: localizationLoading, error: localizationError } = useLocalization()
  // const { format } = useCurrency()
  // const { paymentMethods, hasOxxo, hasPix, hasMercadoPago, hasPse } = usePaymentMethods()

  const [isCancelling, setIsCancelling] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  
  // Temporary localization placeholders (temporarily disabled)
  const localizationLoading = false
  const localizationError = null
  const country = 'US'
  const currency = 'USD'
  const isLatinAmerica = false
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`
  const format = (amount: number) => `$${amount.toFixed(2)}`
  
  const [billingHistory] = useState<BillingHistory[]>([
    {
      id: '1',
      date: '2024-01-15',
      amount: formatCurrency(4.99),
      status: 'paid',
      description: 'Red Creativa Pro - Mensual',
      invoiceUrl: '#'
    },
    {
      id: '2',
      date: '2023-12-15',
      amount: formatCurrency(4.99),
      status: 'paid',
      description: 'Red Creativa Pro - Mensual',
      invoiceUrl: '#'
    }
  ])

  const handleCancelSubscription = async () => {
    if (!user?.email) return

    setIsCancelling(true)
    try {
      // Track subscription cancellation with enhanced analytics
      analytics.trackButtonClick('Cancelar Suscripción', '/subscription')

      // Track business event for conversion tracking
      analytics.trackBusinessEvent('subscription', {
        plan_type: subscriptionData.subscriptionPlan || 'unknown',
        user_type: user ? 'authenticated' : 'anonymous',
        properties: {
          action: 'cancel_initiated',
          cancel_at_period_end: true
        }
      })

      await cancelSubscription() // Cancel at period end

      // Track successful cancellation
      analytics.trackEvent('subscription_cancelled', {
        plan_type: subscriptionData.subscriptionPlan || 'unknown',
        cancel_at_period_end: true,
        user_type: user ? 'authenticated' : 'anonymous'
      })

      toast.success('Suscripción cancelada. Tendrás acceso hasta el final del período actual.')
      setShowCancelConfirm(false)
    } catch (error) {
      // Track cancellation error
      analytics.trackEvent('subscription_cancel_error', {
        error_message: error instanceof Error ? error.message : 'Unknown error',
        plan_type: subscriptionData.subscriptionPlan || 'unknown'
      })

      toast.error('Error al cancelar la suscripción')
    } finally {
      setIsCancelling(false)
    }
  }

  const handleUpgrade = async (priceId: string) => {
    if (!user?.email) return

    try {
      await createCheckoutSession()
    } catch (error) {
      toast.error('Error al procesar la actualización')
    }
  }

  if (loading || localizationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <div className="space-y-2">
            <p className="text-lg font-medium">Cargando información de suscripción...</p>
            {localizationLoading && (
              <p className="text-sm text-gray-600">Detectando ubicación y configuración regional...</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  const getStatusBadge = () => {
    if (!subscriptionData?.isActive) {
      return <Badge variant="secondary">Gratuito</Badge>
    }

    if (subscriptionData.subscriptionPlan === 'lifetime') {
      return <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black">De por vida</Badge>
    }

    // Check if subscription is being cancelled
    const isCancelling = false; // Placeholder since property doesn't exist
    if (isCancelling) {
      return <Badge variant="destructive">Cancelando</Badge>
    }

    return <Badge className="bg-gradient-to-r from-green-400 to-green-600 text-white">Activo</Badge>
  }

  const getPlanIcon = () => {
    if (subscriptionData?.subscriptionPlan === 'lifetime') return <Gift className="h-5 w-5" />
    if (subscriptionData?.isActive) return <Crown className="h-5 w-5" />
    return <Star className="h-5 w-5" />
  }

  return (
    <div className={`min-h-screen ${isPremium ? premiumBgClass : 'bg-gray-50'} transition-all duration-300`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/writer">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Editor
              </Button>
            </Link>
            <div>
              <h1 className={`text-3xl font-bold ${isPremium ? premiumTextClass : 'text-gray-900'}`}>
                Gestión de Suscripción
              </h1>
              <p className="text-gray-600 mt-1">Administra tu plan y facturación</p>
              {/* Localization Status */}
              {isLatinAmerica && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {country} • {currency}
                  </Badge>
                  {localizationError && (
                    <Badge variant="destructive" className="text-xs">
                      Error de localización
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
          {isPremium && <PremiumCrownBadge />}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Current Plan */}
          <Card className={isPremium ? premiumBorderClass : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getPlanIcon()}
                Plan Actual
              </CardTitle>
              <CardDescription>
                Detalles de tu suscripción actual
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Estado:</span>
                {getStatusBadge()}
              </div>

              {subscriptionData?.isActive ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Plan:</span>
                    <span className="capitalize">
                      {subscriptionData.subscriptionPlan === 'lifetime' ? 'De por vida' :
                        subscriptionData.subscriptionPlan === 'monthly' ? 'Mensual' :
                          subscriptionData.subscriptionPlan === 'yearly' ? 'Anual' : 'Premium'}
                    </span>
                  </div>

                  {subscriptionData.subscriptionPlan !== 'lifetime' && subscriptionData.nextBillingDate && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Próximo pago:</span>
                      <span>{new Date(subscriptionData.nextBillingDate).toLocaleDateString('es-ES')}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Estás usando la versión gratuita. Actualiza para acceder a todas las funciones premium.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className={isPremium ? premiumBorderClass : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Acciones Rápidas
              </CardTitle>
              <CardDescription>
                Gestiona tu suscripción
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {!subscriptionData?.isActive ? (
                <>
                  <Button
                    onClick={() => handleUpgrade('price_monthly')}
                    className={isPremium ? premiumButtonClass : ''}
                    size="sm"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Actualizar a Premium
                  </Button>
                  <Link href="/planes">
                    <Button variant="outline" size="sm" className="w-full">
                      Ver todos los planes
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  {/* Stripe Customer Portal Button */}
                  {subscriptionData.customerId && (
                    <CustomerPortalButton
                      customerId={subscriptionData.customerId}
                      returnUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/subscription`}
                      variant="default"
                      size="sm"
                      className="w-full"
                    />
                  )}

                  {subscriptionData.subscriptionPlan !== 'lifetime' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowCancelConfirm(true)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancelar Suscripción
                    </Button>
                  )}

                  {subscriptionData.subscriptionPlan === 'monthly' && (
                    <Button
                      onClick={() => handleUpgrade('price_yearly')}
                      variant="outline"
                      size="sm"
                    >
                      Cambiar a Plan Anual
                    </Button>
                  )}

                  {subscriptionData.subscriptionPlan !== 'lifetime' && (
                    <Button
                      onClick={() => handleUpgrade('price_lifetime')}
                      className={isPremium ? premiumButtonClass : ''}
                      size="sm"
                    >
                      <Gift className="h-4 w-4 mr-2" />
                      Actualizar a De por vida
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Payment Methods */}
        {isLatinAmerica && (
          <Card className={`mt-6 ${isPremium ? premiumBorderClass : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Métodos de Pago Disponibles
              </CardTitle>
              <CardDescription>
                Opciones de pago optimizadas para tu región ({country})
              </CardDescription>
            </CardHeader>
            <CardContent>
              
              {localizationError && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Error al detectar métodos de pago regionales. Se mostrarán opciones internacionales.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Billing History */}
        <Card className={`mt-6 ${isPremium ? premiumBorderClass : ''}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Historial de Facturación
            </CardTitle>
            <CardDescription>
              Tus pagos y facturas recientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {billingHistory.length > 0 ? (
              <div className="space-y-3">
                {billingHistory.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {item.status === 'paid' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : item.status === 'pending' ? (
                        <Calendar className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-gray-600">{item.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{item.amount}</span>
                      {item.invoiceUrl && (
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">
                No hay historial de facturación disponible
              </p>
            )}
          </CardContent>
        </Card>

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>¿Cancelar Suscripción?</CardTitle>
                <CardDescription>
                  Tu suscripción se cancelará al final del período actual. Mantendrás acceso a las funciones premium hasta entonces.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button
                    variant="destructive"
                    onClick={handleCancelSubscription}
                    disabled={isCancelling}
                    className="flex-1"
                  >
                    {isCancelling ? 'Cancelando...' : 'Sí, cancelar'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCancelConfirm(false)}
                    className="flex-1"
                  >
                    No, mantener
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
