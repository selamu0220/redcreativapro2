/**
 * Payment Authentication Guard Component
 * 
 * Provides authentication protection for payment flows
 * Implements requirements 1.1, 1.2, 1.3, 1.4, 1.5 from secure-payment-flow spec
 */

'use client'

import React, { useEffect, useState } from 'react'
import { usePaymentAuthentication } from '../hooks/useAuthenticationGuard'
import { Loader2, AlertCircle, Shield, Clock } from 'lucide-react'

interface PaymentAuthGuardProps {
  children: React.ReactNode
  requirePaymentAuth?: boolean
  showUserIdentity?: boolean
  onAuthenticationFailed?: (error: string) => void
  onSessionExpiring?: (timeLeft: number) => void
}

export function PaymentAuthGuard({ 
  children, 
  requirePaymentAuth = true,
  showUserIdentity = true,
  onAuthenticationFailed,
  onSessionExpiring
}: PaymentAuthGuardProps) {
  const {
    isAuthenticated,
    user,
    isLoading,
    isPaymentReady,
    paymentError,
    isSessionValid,
    timeUntilExpiry,
    redirectToLogin,
    refreshSession,
    handleSessionExpiry
  } = usePaymentAuthentication()

  const [showSessionWarning, setShowSessionWarning] = useState(false)

  // Handle authentication failures
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const error = 'Authentication required for payment operations'
      onAuthenticationFailed?.(error)
      
      // Redirect to login after a short delay to show the error
      const timer = setTimeout(() => {
        redirectToLogin()
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [isLoading, isAuthenticated, onAuthenticationFailed, redirectToLogin])

  // Handle payment authentication failures
  useEffect(() => {
    if (!isLoading && isAuthenticated && !isPaymentReady && paymentError) {
      onAuthenticationFailed?.(paymentError)
      
      // If session expired, handle it
      if (paymentError.includes('expired')) {
        handleSessionExpiry()
      }
    }
  }, [isLoading, isAuthenticated, isPaymentReady, paymentError, onAuthenticationFailed, handleSessionExpiry])

  // Handle session expiry warnings
  useEffect(() => {
    if (timeUntilExpiry && timeUntilExpiry <= 300000) { // 5 minutes
      setShowSessionWarning(true)
      onSessionExpiring?.(timeUntilExpiry)
    } else {
      setShowSessionWarning(false)
    }
  }, [timeUntilExpiry, onSessionExpiring])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">Verificando autenticación</h2>
            <p className="text-sm text-muted-foreground">Validando tu sesión para proceder con el pago...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show authentication required state
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="space-y-4">
            <Shield className="h-12 w-12 mx-auto text-red-500" />
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Autenticación Requerida</h2>
              <p className="text-sm text-muted-foreground">
                Debes iniciar sesión para acceder a las opciones de pago
              </p>
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-800">
                Por seguridad, todas las transacciones requieren autenticación
              </p>
            </div>
          </div>
          
          <button
            onClick={() => redirectToLogin()}
            className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md font-medium hover:bg-primary/90 transition-colors"
          >
            Iniciar Sesión
          </button>
          
          <p className="text-xs text-muted-foreground">
            Serás redirigido de vuelta a esta página después de iniciar sesión
          </p>
        </div>
      </div>
    )
  }

  // Show payment authentication failure
  if (requirePaymentAuth && !isPaymentReady && paymentError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="space-y-4">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Error de Autenticación</h2>
              <p className="text-sm text-muted-foreground">
                No se pudo validar tu sesión para proceder con el pago
              </p>
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{paymentError}</p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => refreshSession()}
              className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              Renovar Sesión
            </button>
            
            <button
              onClick={() => redirectToLogin()}
              className="w-full bg-secondary text-secondary-foreground py-2 px-4 rounded-md font-medium hover:bg-secondary/90 transition-colors"
            >
              Iniciar Sesión Nuevamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render children with optional user identity display and session warning
  return (
    <div className="min-h-screen bg-background">
      {/* Session Warning Banner (espacio reservado para evitar CLS) */}
      <div className="min-h-[48px]">
        {showSessionWarning && (
          <div className="bg-yellow-50 border-b border-yellow-200 p-3">
            <div className="container mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  Tu sesión expirará pronto. 
                  {timeUntilExpiry && (
                    <span className="font-medium">
                      {' '}({Math.ceil(timeUntilExpiry / 60000)} minutos restantes)
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => refreshSession()}
                className="text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition-colors"
              >
                Renovar Sesión
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Identity Display */}
      {showUserIdentity && user && (
        <div className="bg-green-50 border-b border-green-200 p-3">
          <div className="container mx-auto flex items-center space-x-2">
            <Shield className="h-4 w-4 text-green-600" />
            <p className="text-sm text-green-800">
              <span className="font-medium">Sesión segura:</span> {user.email}
              {!isSessionValid && (
                <span className="ml-2 text-red-600 font-medium">(Sesión inválida)</span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Protected Content */}
      {children}
    </div>
  )
}

/**
 * Higher-order component for wrapping payment pages with authentication
 */
export function withPaymentAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requirePaymentAuth?: boolean
    showUserIdentity?: boolean
  }
) {
  const WrappedComponent = (props: P) => {
    return (
      <PaymentAuthGuard 
        requirePaymentAuth={options?.requirePaymentAuth}
        showUserIdentity={options?.showUserIdentity}
      >
        <Component {...props} />
      </PaymentAuthGuard>
    )
  }

  WrappedComponent.displayName = `withPaymentAuth(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

export default PaymentAuthGuard
