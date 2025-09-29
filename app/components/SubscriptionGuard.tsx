'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch'
import { Button } from '../../src/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../src/components/ui/card'
import { AlertTriangle, CreditCard, Clock } from 'lucide-react'

interface SubscriptionGuardProps {
  children: React.ReactNode
}

export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth()
  const { subscriptionData, loading: subscriptionLoading, createCheckoutSession, getTrialDaysRemaining } = useSubscription()
  const { get } = useAuthenticatedFetch()
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  // Verificar si el usuario es administrador
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user?.email) {
        console.log('Checking admin status for email:', user.email)
        try {
          const data = await get(`/api/users/check-admin?email=${encodeURIComponent(user.email || '')}`)
          console.log('Admin check response data:', data)
          setIsAdmin(data.isAdmin)
        } catch (error) {
          console.error('Error checking admin status:', error)
          setIsAdmin(false)
        }
      }
    }
    
    checkAdminStatus()
  }, [user?.email])

  const isLoading = authLoading || subscriptionLoading
  const trialDaysRemaining = getTrialDaysRemaining()
  const isTrialExpired = subscriptionData?.subscriptionStatus === 'trial' && trialDaysRemaining <= 0
  const isFreeUser = subscriptionData?.subscriptionStatus === 'free'
  const isPaidUser = subscriptionData?.subscriptionStatus === 'pro' || subscriptionData?.subscriptionStatus === 'premium'

  // ACCESO LIBRE PARA TODOS - Bloqueo desactivado temporalmente
  const shouldBlockAccess = false // (isTrialExpired || isFreeUser) && !isPaidUser && !isAdmin
  
  // Debug logs
  console.log('SubscriptionGuard Debug:', {
    userEmail: user?.email,
    isAdmin,
    isTrialExpired,
    isFreeUser,
    isPaidUser,
    shouldBlockAccess,
    subscriptionStatus: subscriptionData?.subscriptionStatus
  })

  const handleUpgrade = async () => {
    if (!user?.email) return
    
    setIsUpgrading(true)
    try {
      // Redirigir directamente al enlace de Stripe
      const stripeUrl = 'https://buy.stripe.com/14AcN43PBc857IK6TO8og0c?locale=es&__embed_source=buy_btn_1RnNaVAZjhZ6eQncLN2Sm6p4'
      window.location.href = stripeUrl
    } catch (error) {
      console.error('Error al redirigir a Stripe:', error)
      alert('Error al acceder al sistema de pago. Si el problema persiste, contacta a sela_gb por DM.')
    } finally {
      setIsUpgrading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando suscripción...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Si el acceso debe ser bloqueado, mostrar pantalla de suscripción
  if (shouldBlockAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-600">
              {isTrialExpired ? 'Período de prueba expirado' : 'Acceso restringido'}
            </CardTitle>
            <CardDescription className="text-center">
              {isTrialExpired 
                ? 'Tu período de prueba de 7 días ha terminado. Suscríbete para continuar usando todas las funciones.'
                : 'Necesitas una suscripción activa para acceder a la aplicación.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Plan Pro</h3>
              </div>
              <p className="text-blue-800 text-sm mb-3">
                Acceso completo a todas las funciones de IA
              </p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-900">5€</span>
                <span className="text-blue-700 text-sm">/mes</span>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Escritor IA ilimitado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Correos IA ilimitados</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Prompts ilimitados</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Soporte prioritario</span>
              </div>
            </div>

            <Button 
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="w-full"
              size="lg"
            >
              {isUpgrading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Suscribirse por 5€/mes
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Pago seguro procesado por Stripe. Cancela en cualquier momento.<br/>
              <span className="text-blue-600">¿Problemas con el pago? Contacta a sela_gb por DM</span>
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Si el usuario tiene acceso, mostrar el contenido
  return <>{children}</>
}

export default SubscriptionGuard