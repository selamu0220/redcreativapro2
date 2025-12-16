'use client'

import React, { useState } from 'react'
import { useConsentManagement } from '@/app/hooks/useConsentManagement'
import { CookieCategory } from '@/app/lib/consent-management'

interface ConsentBannerProps {
  className?: string
  position?: 'bottom' | 'top'
  showOnlyIfRequired?: boolean
}

/**
 * Consent Banner Component
 * Displays cookie consent banner according to country-specific requirements
 */
export function ConsentBanner({ 
  className = '', 
  position = 'bottom',
  showOnlyIfRequired = true 
}: ConsentBannerProps) {
  const {
    shouldShowConsentBanner,
    consentBannerConfig,
    cookieConfigs,
    cookieConsents,
    acceptAllConsents,
    rejectAllConsents,
    acceptEssentialOnly,
    grantCookieConsent,
    revokeCookieConsent,
    isLoading
  } = useConsentManagement()

  const [showDetails, setShowDetails] = useState(false)

  // Don't render if not needed
  if (isLoading || (showOnlyIfRequired && !shouldShowConsentBanner)) {
    return null
  }

  const positionClasses = position === 'bottom' 
    ? 'bottom-0 left-0 right-0' 
    : 'top-0 left-0 right-0'

  return (
    <div className={`fixed ${positionClasses} z-50 bg-background border-t border-border shadow-lg ${className}`}>
      <div className="max-w-7xl mx-auto p-4">
        {!showDetails ? (
          // Simple banner view
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {consentBannerConfig.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {consentBannerConfig.description}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 min-w-fit">
              <button
                type="button"
                onClick={acceptEssentialOnly}
                className="px-4 py-2 text-sm border border-input bg-background text-foreground rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {consentBannerConfig.essentialOnlyText}
              </button>
              
              <button
                type="button"
                onClick={() => setShowDetails(true)}
                className="px-4 py-2 text-sm border border-input bg-background text-foreground rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {consentBannerConfig.customizeText}
              </button>
              
              <button
                type="button"
                onClick={acceptAllConsents}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                {consentBannerConfig.acceptAllText}
              </button>
            </div>
          </div>
        ) : (
          // Detailed consent management view
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                {consentBannerConfig.title}
              </h3>
              <button
                type="button"
                onClick={() => setShowDetails(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Cerrar detalles"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              {consentBannerConfig.description}
            </p>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {cookieConfigs.map((config) => (
                <CookieConsentItem
                  key={config.category}
                  config={config}
                  isGranted={cookieConsents[config.category] === 'granted'}
                  onToggle={(granted) => {
                    if (granted) {
                      grantCookieConsent(config.category)
                    } else {
                      revokeCookieConsent(config.category)
                    }
                  }}
                />
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-border">
              <button
                type="button"
                onClick={rejectAllConsents}
                className="px-4 py-2 text-sm border border-input bg-background text-foreground rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {consentBannerConfig.rejectAllText}
              </button>
              
              <button
                type="button"
                onClick={acceptEssentialOnly}
                className="px-4 py-2 text-sm border border-input bg-background text-foreground rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {consentBannerConfig.essentialOnlyText}
              </button>
              
              <button
                type="button"
                onClick={acceptAllConsents}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors ml-auto"
              >
                {consentBannerConfig.acceptAllText}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface CookieConsentItemProps {
  config: {
    category: CookieCategory
    required: boolean
    description: string
    purpose: string
    retentionPeriod: string
    cookies: string[]
  }
  isGranted: boolean
  onToggle: (granted: boolean) => void
}

/**
 * Individual cookie consent item component
 */
function CookieConsentItem({ config, isGranted, onToggle }: CookieConsentItemProps) {
  const [showDetails, setShowDetails] = useState(false)

  const categoryLabels = {
    essential: 'Esenciales',
    analytics: 'Análisis',
    marketing: 'Marketing',
    functional: 'Funcionales',
    advertising: 'Publicidad'
  }

  return (
    <div className="border border-border rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-foreground">
              {categoryLabels[config.category]}
            </h4>
            {config.required && (
              <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                Requerido
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {config.description}
          </p>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-primary hover:text-primary/80"
          >
            {showDetails ? 'Ocultar' : 'Detalles'}
          </button>
          
          <label className="relative inline-flex items-center cursor-pointer">
            <span className="sr-only">
              {config.required ? 'Cookie requerido' : `Activar cookies de ${categoryLabels[config.category]}`}
            </span>
            <input
              type="checkbox"
              checked={isGranted}
              onChange={(e) => onToggle(e.target.checked)}
              disabled={config.required}
              className="sr-only peer"
              aria-label={config.required ? 'Cookie requerido' : `Activar cookies de ${categoryLabels[config.category]}`}
            />
            <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </div>

      {showDetails && (
        <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground space-y-2">
          <div>
            <strong>Propósito:</strong> {config.purpose}
          </div>
          <div>
            <strong>Retención:</strong> {config.retentionPeriod}
          </div>
          <div>
            <strong>Cookies:</strong> {config.cookies.join(', ')}
          </div>
        </div>
      )}
    </div>
  )
}

export default ConsentBanner