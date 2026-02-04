'use client'

import React, { ReactNode, useEffect, useState } from 'react'
import { useOptimizedAuth } from '../hooks/useOptimizedAuth'
import { Loader2, Shield, CheckCircle, AlertCircle, Clock } from 'lucide-react'

interface AuthLoadingWrapperProps {
  children: ReactNode
  fallback?: ReactNode
  showPerformanceMetrics?: boolean
  enableSkeletonMode?: boolean
  className?: string
}

// Componente de skeleton para carga no bloqueante
function AuthSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-6">
      <div className="flex items-center space-x-4">
        <div className="rounded-full bg-gray-300 h-12 w-12"></div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-300 rounded"></div>
        <div className="h-4 bg-gray-300 rounded w-5/6"></div>
        <div className="h-4 bg-gray-300 rounded w-4/6"></div>
      </div>
    </div>
  )
}

// Componente de métricas de rendimiento
function PerformanceMetrics({ metrics }: { metrics: any }) {
  const [isVisible, setIsVisible] = useState(false)
  
  if (process.env.NODE_ENV !== 'development') return null
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors"
        title="Métricas de rendimiento"
      >
        <Clock className="w-4 h-4" />
      </button>
      
      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-black/90 text-white p-4 rounded-lg shadow-xl min-w-[300px] text-sm">
          <h3 className="font-semibold mb-2 flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Auth Performance
          </h3>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Subscription Check:</span>
              <span className={metrics.subscriptionCheckTime < 500 ? 'text-green-400' : 'text-yellow-400'}>
                {metrics.subscriptionCheckTime.toFixed(1)}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span>Cache Hits:</span>
              <span className="text-green-400">{metrics.cacheHits}</span>
            </div>
            <div className="flex justify-between">
              <span>Cache Misses:</span>
              <span className="text-yellow-400">{metrics.cacheMisses}</span>
            </div>
            <div className="flex justify-between">
              <span>Errors:</span>
              <span className={metrics.errors > 0 ? 'text-red-400' : 'text-green-400'}>
                {metrics.errors}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Hit Rate:</span>
              <span className="text-blue-400">
                {metrics.cacheHits + metrics.cacheMisses > 0 
                  ? ((metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Estados de carga con diferentes niveles de información
function LoadingState({ 
  stage, 
  message, 
  showProgress = false, 
  progress = 0 
}: { 
  stage: 'auth' | 'subscription' | 'complete'
  message: string
  showProgress?: boolean
  progress?: number
}) {
  const getIcon = () => {
    switch (stage) {
      case 'auth':
        return <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      case 'subscription':
        return <Shield className="w-6 h-6 text-yellow-500 animate-pulse" />
      case 'complete':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      default:
        return <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md w-full">
        <div className="mb-6 flex justify-center">
          {getIcon()}
        </div>
        
        <h2 className="text-xl font-semibold text-white mb-2">
          {stage === 'auth' && 'Inicializando autenticación'}
          {stage === 'subscription' && 'Verificando suscripción'}
          {stage === 'complete' && 'Listo'}
        </h2>
        
        <p className="text-gray-400 mb-4">{message}</p>
        
        {showProgress && (
          <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        
        <div className="flex justify-center space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-gray-600 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Error state component
function ErrorState({ 
  error, 
  onRetry, 
  canRetry = true 
}: { 
  error: string
  onRetry?: () => void
  canRetry?: boolean
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900/20 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md w-full">
        <div className="mb-6 flex justify-center">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        
        <h2 className="text-xl font-semibold text-white mb-2">
          Error de Autenticación
        </h2>
        
        <p className="text-gray-400 mb-6">{error}</p>
        
        {canRetry && onRetry && (
          <button
            onClick={onRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
          >
            <Loader2 className="w-4 h-4 mr-2" />
            Reintentar
          </button>
        )}
      </div>
    </div>
  )
}

export default function AuthLoadingWrapper({
  children,
  fallback,
  showPerformanceMetrics = false,
  enableSkeletonMode = false,
  className = ''
}: AuthLoadingWrapperProps) {
  const auth = useOptimizedAuth()
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [currentStage, setCurrentStage] = useState<'auth' | 'subscription' | 'complete'>('auth')
  
  // Simular progreso de carga para mejor UX
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (auth.isInitializing || auth.loading || auth.subscriptionLoading) {
      interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) return prev
          return prev + Math.random() * 10
        })
      }, 200)
    } else {
      setLoadingProgress(100)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [auth.isInitializing, auth.loading, auth.subscriptionLoading])
  
  // Actualizar etapa actual
  useEffect(() => {
    if (auth.isInitializing || auth.loading) {
      setCurrentStage('auth')
    } else if (auth.subscriptionLoading) {
      setCurrentStage('subscription')
    } else {
      setCurrentStage('complete')
    }
  }, [auth.isInitializing, auth.loading, auth.subscriptionLoading])
  
  // Manejar errores
  if (auth.error || auth.subscriptionError) {
    const error = auth.error || auth.subscriptionError || 'Error desconocido'
    return (
      <ErrorState 
        error={error}
        onRetry={() => {
          if (auth.error) {
            window.location.reload()
          } else {
            auth.refreshSubscription()
          }
        }}
      />
    )
  }
  
  // Estado de inicialización de autenticación
  if (auth.isInitializing) {
    if (enableSkeletonMode && fallback) {
      return <div className={className}>{fallback}</div>
    }
    
    return (
      <LoadingState
        stage="auth"
        message="Configurando conexión segura..."
        showProgress
        progress={loadingProgress}
      />
    )
  }
  
  // Estado de carga de autenticación
  if (auth.loading) {
    if (enableSkeletonMode) {
      return (
        <div className={className}>
          <AuthSkeleton />
        </div>
      )
    }
    
    return (
      <LoadingState
        stage="auth"
        message="Verificando credenciales..."
        showProgress
        progress={loadingProgress}
      />
    )
  }
  
  // Estado de carga de suscripción (no bloqueante)
  const isSubscriptionLoading = auth.subscriptionLoading && !auth.subscriptionStatus
  
  if (isSubscriptionLoading && !enableSkeletonMode) {
    return (
      <LoadingState
        stage="subscription"
        message="Verificando plan de suscripción..."
        showProgress
        progress={loadingProgress}
      />
    )
  }
  
  // Renderizar contenido principal
  return (
    <div className={className}>
      {/* Indicador sutil de carga de suscripción */}
      {isSubscriptionLoading && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-black/80 text-white px-3 py-2 rounded-lg shadow-lg flex items-center text-sm">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Verificando suscripción...
          </div>
        </div>
      )}
      
      {children}
      
      {/* Métricas de rendimiento */}
      {showPerformanceMetrics && (
        <PerformanceMetrics metrics={auth.performanceMetrics} />
      )}
    </div>
  )
}
