'use client'

import { useState, useEffect, useCallback } from 'react'
import { ConsentState, ConsentStatus, CookieCategory, consentManagementService } from '@/app/lib/consent-management'
import { CountryCode, ConsentType } from '@/app/lib/legal-compliance'
import { useLocalization } from '@/app/contexts/LocalizationContext'

interface UseConsentManagementReturn {
  // Current consent state
  consentState: ConsentState | null
  isLoading: boolean
  error: string | null

  // Consent status checks
  hasRequiredConsents: boolean
  missingConsents: ConsentType[]

  // Cookie consent status
  cookieConsents: Record<CookieCategory, ConsentStatus>

  // Actions
  grantConsent: (consentType: ConsentType) => void
  revokeConsent: (consentType: ConsentType) => void
  grantCookieConsent: (category: CookieCategory) => void
  revokeCookieConsent: (category: CookieCategory) => void
  acceptAllConsents: () => void
  rejectAllConsents: () => void
  acceptEssentialOnly: () => void

  // Utility functions
  isConsentRequired: (consentType: ConsentType) => boolean
  doesCookieRequireConsent: (cookieName: string) => boolean
  shouldShowConsentBanner: boolean

  // Configuration
  consentBannerConfig: ReturnType<typeof consentManagementService.getConsentBannerConfig>
  cookieConfigs: ReturnType<typeof consentManagementService.getCookieConsentConfig>
}

/**
 * Hook for managing consent state and cookie preferences
 */
export function useConsentManagement(): UseConsentManagementReturn {
  const { country: rawCountry } = useLocalization()
  const country = rawCountry as CountryCode
  const [consentState, setConsentState] = useState<ConsentState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize consent state
  useEffect(() => {
    const initializeConsent = async () => {
      try {
        setIsLoading(true)

        // Try to load existing consent from localStorage
        const storedConsent = localStorage.getItem('user_consent')
        if (storedConsent) {
          const parsed = JSON.parse(storedConsent) as ConsentState
          // Validate that stored consent is for current country
          if (parsed.country === country) {
            setConsentState(parsed)
            setIsLoading(false)
            return
          }
        }

        // Create new consent state for current country
        const requirements = consentManagementService.getConsentRequirements(country)
        const cookieConfigs = consentManagementService.getCookieConsentConfig(country)

        const initialConsents: Record<ConsentType, ConsentStatus> = {} as Record<ConsentType, ConsentStatus>
        requirements.forEach(req => {
          initialConsents[req.type] = 'pending'
        })

        const initialCookieConsents: Record<CookieCategory, ConsentStatus> = {} as Record<CookieCategory, ConsentStatus>
        cookieConfigs.forEach(config => {
          initialCookieConsents[config.category] = config.required ? 'granted' : 'pending'
        })

        const newConsentState: ConsentState = {
          country,
          consents: initialConsents,
          cookieConsents: initialCookieConsents,
          timestamp: new Date(),
          version: '1.0',
          ipAddress: await getClientIP(),
          userAgent: navigator.userAgent
        }

        setConsentState(newConsentState)

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize consent')
      } finally {
        setIsLoading(false)
      }
    }

    initializeConsent()
  }, [country])

  // Save consent state to localStorage whenever it changes
  useEffect(() => {
    if (consentState) {
      localStorage.setItem('user_consent', JSON.stringify(consentState))
      consentManagementService.recordConsent(consentState)
    }
  }, [consentState])

  // Helper function to get client IP (simplified)
  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('/api/geo-detect')
      const data = await response.json()
      return data.ip || 'unknown'
    } catch {
      return 'unknown'
    }
  }

  // Update consent state helper
  const updateConsentState = useCallback((updater: (prev: ConsentState) => ConsentState) => {
    setConsentState(prev => {
      if (!prev) return null
      const updated = updater(prev)
      return {
        ...updated,
        timestamp: new Date()
      }
    })
  }, [])

  // Grant specific consent
  const grantConsent = useCallback((consentType: ConsentType) => {
    updateConsentState(prev => ({
      ...prev,
      consents: {
        ...prev.consents,
        [consentType]: 'granted'
      }
    }))
  }, [updateConsentState])

  // Revoke specific consent
  const revokeConsent = useCallback((consentType: ConsentType) => {
    updateConsentState(prev => ({
      ...prev,
      consents: {
        ...prev.consents,
        [consentType]: 'denied'
      }
    }))
  }, [updateConsentState])

  // Grant cookie consent for specific category
  const grantCookieConsent = useCallback((category: CookieCategory) => {
    updateConsentState(prev => ({
      ...prev,
      cookieConsents: {
        ...prev.cookieConsents,
        [category]: 'granted'
      }
    }))
  }, [updateConsentState])

  // Revoke cookie consent for specific category
  const revokeCookieConsent = useCallback((category: CookieCategory) => {
    updateConsentState(prev => ({
      ...prev,
      cookieConsents: {
        ...prev.cookieConsents,
        [category]: 'denied'
      }
    }))
  }, [updateConsentState])

  // Accept all consents
  const acceptAllConsents = useCallback(() => {
    updateConsentState(prev => {
      const allConsents: Record<ConsentType, ConsentStatus> = {} as Record<ConsentType, ConsentStatus>
      Object.keys(prev.consents).forEach(key => {
        allConsents[key as ConsentType] = 'granted'
      })

      const allCookieConsents: Record<CookieCategory, ConsentStatus> = {} as Record<CookieCategory, ConsentStatus>
      Object.keys(prev.cookieConsents).forEach(key => {
        allCookieConsents[key as CookieCategory] = 'granted'
      })

      return {
        ...prev,
        consents: allConsents,
        cookieConsents: allCookieConsents
      }
    })
  }, [updateConsentState])

  // Reject all non-essential consents
  const rejectAllConsents = useCallback(() => {
    updateConsentState(prev => {
      const requirements = consentManagementService.getConsentRequirements(country)
      const cookieConfigs = consentManagementService.getCookieConsentConfig(country)

      const updatedConsents: Record<ConsentType, ConsentStatus> = {} as Record<ConsentType, ConsentStatus>
      requirements.forEach(req => {
        updatedConsents[req.type] = req.required ? 'granted' : 'denied'
      })

      const updatedCookieConsents: Record<CookieCategory, ConsentStatus> = {} as Record<CookieCategory, ConsentStatus>
      cookieConfigs.forEach(config => {
        updatedCookieConsents[config.category] = config.required ? 'granted' : 'denied'
      })

      return {
        ...prev,
        consents: updatedConsents,
        cookieConsents: updatedCookieConsents
      }
    })
  }, [updateConsentState, country])

  // Accept only essential consents
  const acceptEssentialOnly = useCallback(() => {
    updateConsentState(prev => {
      const requirements = consentManagementService.getConsentRequirements(country)
      const cookieConfigs = consentManagementService.getCookieConsentConfig(country)

      const essentialConsents: Record<ConsentType, ConsentStatus> = {} as Record<ConsentType, ConsentStatus>
      requirements.forEach(req => {
        essentialConsents[req.type] = req.required ? 'granted' : 'denied'
      })

      const essentialCookieConsents: Record<CookieCategory, ConsentStatus> = {} as Record<CookieCategory, ConsentStatus>
      cookieConfigs.forEach(config => {
        essentialCookieConsents[config.category] = config.required ? 'granted' : 'denied'
      })

      return {
        ...prev,
        consents: essentialConsents,
        cookieConsents: essentialCookieConsents
      }
    })
  }, [updateConsentState, country])

  // Check if consent is required for specific type
  const isConsentRequired = useCallback((consentType: ConsentType): boolean => {
    return consentManagementService.isConsentRequired(country, consentType)
  }, [country])

  // Check if cookie requires consent
  const doesCookieRequireConsent = useCallback((cookieName: string): boolean => {
    return consentManagementService.doesCookieRequireConsent(country, cookieName)
  }, [country])

  // Validate current consent state
  const validation = consentState ? consentManagementService.validateConsent(consentState) : { valid: false, missing: [] }
  const hasRequiredConsents = validation.valid
  const missingConsents = validation.missing

  // Determine if consent banner should be shown
  const shouldShowConsentBanner = !hasRequiredConsents ||
    (consentState && Object.values(consentState.cookieConsents).some(status => status === 'pending'))

  // Get current cookie consents
  const cookieConsents = consentState?.cookieConsents || {} as Record<CookieCategory, ConsentStatus>

  // Get configuration objects
  const consentBannerConfig = consentManagementService.getConsentBannerConfig(country)
  const cookieConfigs = consentManagementService.getCookieConsentConfig(country)

  return {
    // State
    consentState,
    isLoading,
    error,

    // Validation
    hasRequiredConsents,
    missingConsents,

    // Cookie consents
    cookieConsents,

    // Actions
    grantConsent,
    revokeConsent,
    grantCookieConsent,
    revokeCookieConsent,
    acceptAllConsents,
    rejectAllConsents,
    acceptEssentialOnly,

    // Utilities
    isConsentRequired,
    doesCookieRequireConsent,
    shouldShowConsentBanner,

    // Configuration
    consentBannerConfig,
    cookieConfigs
  }
}

/**
 * Hook for cookie consent management specifically
 */
export function useCookieConsent() {
  const {
    cookieConsents,
    grantCookieConsent,
    revokeCookieConsent,
    acceptAllConsents,
    acceptEssentialOnly,
    doesCookieRequireConsent,
    cookieConfigs
  } = useConsentManagement()

  return {
    cookieConsents,
    grantCookieConsent,
    revokeCookieConsent,
    acceptAllConsents,
    acceptEssentialOnly,
    doesCookieRequireConsent,
    cookieConfigs,

    // Convenience methods
    hasAnalyticsConsent: cookieConsents.analytics === 'granted',
    hasMarketingConsent: cookieConsents.marketing === 'granted',
    hasFunctionalConsent: cookieConsents.functional === 'granted',

    // Cookie category checks
    canUseAnalytics: () => cookieConsents.analytics === 'granted',
    canUseMarketing: () => cookieConsents.marketing === 'granted',
    canUseFunctional: () => cookieConsents.functional === 'granted'
  }
}
