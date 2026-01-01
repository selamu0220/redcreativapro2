'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { Crown, Lock, Star, Zap, ArrowRight } from 'lucide-react'
import { usePremiumTheme } from '@/app/hooks/useSubscription'
import { usePremiumAccess } from '@/app/hooks/usePremiumAccess'
import PremiumBadge from './PremiumBadge'

interface PremiumGateProps {
  children: ReactNode
  fallback?: ReactNode
  feature?: string
  showUpgradePrompt?: boolean
  className?: string
}

export default function PremiumGate({ 
  children, 
  fallback,
  feature = 'esta función',
  showUpgradePrompt = true,
  className = ''
}: PremiumGateProps) {
  const { hasAccess, loading } = usePremiumAccess()
  const { isPremium, getThemeClasses } = usePremiumTheme()
  
  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded-lg p-4 ${className}`}>
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>
    )
  }
  
  if (hasAccess) {
    return <>{children}</>
  }
  
  if (fallback) {
    return <>{fallback}</>
  }
  
  if (!showUpgradePrompt) {
    return null
  }
  
  return (
    <div className={getThemeClasses(
      'bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-6 text-center',
      'premium-card premium-glow'
    )}>
      <div className="flex justify-center mb-4">
        <div className={getThemeClasses(
          'w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center',
          'premium-bg-light'
        )}>
          <Lock className={getThemeClasses(
            'w-8 h-8 text-gray-500',
            'premium-icon'
          )} />
        </div>
      </div>
      
      <h3 className={getThemeClasses(
        'text-xl font-bold text-gray-900 mb-2',
        'premium-text'
      )}>
        Función Premium
      </h3>
      
      <p className={getThemeClasses(
        'text-gray-600 mb-4',
        'text-amber-800'
      )}>
        Necesitas una suscripción premium para acceder a {feature}.
      </p>
      
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        <div className="flex items-center text-sm text-gray-600">
          <Zap className="w-4 h-4 mr-1 text-blue-500" />
          Mejoras ilimitadas
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Star className="w-4 h-4 mr-1 text-yellow-500" />
          Todas las herramientas
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Crown className="w-4 h-4 mr-1 text-purple-500" />
          Soporte prioritario
        </div>
      </div>
      
      <div className="space-y-3">
        <Link 
          href="/planes"
          className={getThemeClasses(
            'inline-flex items-center justify-center w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors',
            'premium-button'
          )}
        >
          <Crown className="w-5 h-5 mr-2" />
          Actualizar a Premium
          <ArrowRight className="w-5 h-5 ml-2" />
        </Link>
        
        <p className="text-xs text-gray-500">
          Desde €4.99/mes • Cancela cuando quieras
        </p>
      </div>
    </div>
  )
}

// Specialized premium gates for different use cases
export function PremiumFeatureGate({ 
  children, 
  featureName,
  className = ''
}: { 
  children: ReactNode
  featureName: string
  className?: string 
}) {
  return (
    <PremiumGate 
      feature={featureName}
      className={className}
    >
      {children}
    </PremiumGate>
  )
}

export function PremiumToolGate({ 
  children, 
  toolName,
  className = ''
}: { 
  children: ReactNode
  toolName: string
  className?: string 
}) {
  return (
    <PremiumGate 
      feature={`la herramienta ${toolName}`}
      className={className}
    >
      {children}
    </PremiumGate>
  )
}

export function PremiumContentGate({ 
  children, 
  contentType = 'contenido premium',
  className = ''
}: { 
  children: ReactNode
  contentType?: string
  className?: string 
}) {
  return (
    <PremiumGate 
      feature={contentType}
      className={className}
    >
      {children}
    </PremiumGate>
  )
}

// Inline premium prompt for smaller spaces
export function InlinePremiumPrompt({ 
  feature = 'esta función',
  className = ''
}: { 
  feature?: string
  className?: string 
}) {
  const { isPremium } = usePremiumTheme()
  
  if (isPremium) return null
  
  return (
    <div className={`flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg ${className}`}>
      <div className="flex items-center">
        <Lock className="w-4 h-4 text-amber-600 mr-2" />
        <span className="text-sm text-amber-800">
          Premium requerido para {feature}
        </span>
      </div>
      <Link 
        href="/planes"
        className="text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center"
      >
        Actualizar
        <ArrowRight className="w-3 h-3 ml-1" />
      </Link>
    </div>
  )
}