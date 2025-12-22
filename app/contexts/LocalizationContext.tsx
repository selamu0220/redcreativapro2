import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback, useMemo } from 'react'
import { CountryCode, LocalizationConfig, CurrencyCode, LanguageCode } from '@/app/lib/geo-detection'
import { useGeoDetection } from '@/app/hooks/useGeoDetection'
import { currencyService } from '@/lib/currency-service'
import { DateFormatter } from '@/app/lib/date-formatter'

interface LocalizationContextType {
  // Current localization state
  country: CountryCode
  currency: CurrencyCode
  language: LanguageCode
  locale: string
  timezone: string
  config: LocalizationConfig

  // Loading and error states
  isLoading: boolean
  error: string | null

  // Detection metadata
  confidence: number
  source: string | null

  // Actions
  setManualCountry: (country: CountryCode) => void
  refreshLocation: () => Promise<void>

  // Utility functions
  isLatinAmerica: boolean
  formatCurrency: (amount: number) => string
  getPaymentMethods: () => string[]
  getLegalRequirements: () => string[]

  // Date formatting
  formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string
  formatTime: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string
  formatDateTime: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string
  formatRelativeTime: (date: Date | string | number) => string
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined)

interface LocalizationProviderProps {
  children: ReactNode
  fallbackCountry?: CountryCode
  autoDetect?: boolean
}

/**
 * Localization Provider Component
 * Manages geo-detection and localization state for the entire application
 */
export function LocalizationProvider({
  children,
  fallbackCountry = 'MX',
  autoDetect = true
}: LocalizationProviderProps) {
  const {
    country,
    config,
    isLoading,
    error,
    confidence,
    source,
    detectLocation,
    setManualCountry
  } = useGeoDetection({ autoDetect, fallbackCountry })

  // Date formatter instance
  const [dateFormatter, setDateFormatter] = useState<DateFormatter | null>(null)

  // Default configuration for when geo-detection is loading
  const defaultConfig: LocalizationConfig = {
    country: fallbackCountry,
    currency: 'MXN',
    language: 'es',
    locale: 'es-MX',
    timezone: 'America/Mexico_City',
    taxRate: 0.16, // IVA 16%
    paymentMethods: ['oxxo', 'spei', 'card'],
    legalRequirements: ['lfpdppp']
  }

  // Use detected config or fallback
  const currentConfig = config || defaultConfig
  const currentCountry = country || fallbackCountry

  // Initialize date formatter when config changes
  useEffect(() => {
    const formatter = new DateFormatter({
      locale: currentConfig.locale,
      timezone: currentConfig.timezone
    })
    setDateFormatter(formatter)
  }, [currentConfig.locale, currentConfig.timezone])

  // Derived values
  const isLatinAmerica = ['MX', 'CO', 'AR', 'CL', 'PE', 'EC', 'BR'].includes(currentCountry)

  /**
   * Format currency according to locale using currency service
   */
  const formatCurrency = useCallback((amount: number): string => {
    try {
      // Use the currency service for proper formatting
      return currencyService.formatCurrency(amount, currentConfig.currency, currentConfig.locale)
    } catch (error) {
      // Fallback to Intl.NumberFormat
      try {
        return new Intl.NumberFormat(currentConfig.locale, {
          style: 'currency',
          currency: currentConfig.currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }).format(amount)
      } catch (intlError) {
        // Final fallback formatting with proper currency symbols
        const symbols: Record<CurrencyCode, string> = {
          MXN: '$',
          COP: '$',
          ARS: '$',
          CLP: '$',
          PEN: 'S/',
          USD: '$',
          BRL: 'R$',
          EUR: '€'
        }

        const symbol = symbols[currentConfig.currency] || '$'
        return `${symbol}${amount.toLocaleString()}`
      }
    }
  }, [currentConfig.currency, currentConfig.locale])

  /**
   * Date formatting wrappers
   */
  const formatDate = useCallback((date: Date | string | number, options?: Intl.DateTimeFormatOptions): string => {
    if (!dateFormatter) return new Date(date).toLocaleDateString()
    return dateFormatter.formatDate(date, options)
  }, [dateFormatter])

  const formatTime = useCallback((date: Date | string | number, options?: Intl.DateTimeFormatOptions): string => {
    if (!dateFormatter) return new Date(date).toLocaleTimeString()
    return dateFormatter.formatTime(date, options)
  }, [dateFormatter])

  const formatDateTime = useCallback((date: Date | string | number, options?: Intl.DateTimeFormatOptions): string => {
    if (!dateFormatter) return new Date(date).toLocaleString()
    return dateFormatter.formatDateTime(date, options)
  }, [dateFormatter])

  const formatRelativeTime = useCallback((date: Date | string | number): string => {
    if (!dateFormatter) return ''
    return dateFormatter.formatRelative(date)
  }, [dateFormatter])

  /**
   * Get available payment methods for current country
   */
  const getPaymentMethods = useCallback((): string[] => {
    return currentConfig.paymentMethods || []
  }, [currentConfig.paymentMethods])

  /**
   * Get legal requirements for current country
   */
  const getLegalRequirements = useCallback((): string[] => {
    return currentConfig.legalRequirements || []
  }, [currentConfig.legalRequirements])

  /**
   * Refresh location detection
   */
  const refreshLocation = useCallback(async (): Promise<void> => {
    await detectLocation()
  }, [detectLocation])

  // Context value
  const contextValue: LocalizationContextType = useMemo(() => ({
    // Current state
    country: currentCountry,
    currency: currentConfig.currency,
    language: currentConfig.language,
    locale: currentConfig.locale,
    timezone: currentConfig.timezone,
    config: currentConfig,

    // Loading and error states
    isLoading,
    error,

    // Detection metadata
    confidence,
    source,

    // Actions
    setManualCountry,
    refreshLocation,

    // Utility functions
    isLatinAmerica,
    formatCurrency,
    getPaymentMethods,
    getLegalRequirements,

    // Date formatting
    formatDate,
    formatTime,
    formatDateTime,
    formatRelativeTime
  }), [
    currentCountry,
    currentConfig,
    isLoading,
    error,
    confidence,
    source,
    setManualCountry,
    refreshLocation,
    isLatinAmerica,
    formatCurrency,
    getPaymentMethods,
    getLegalRequirements,
    formatDate,
    formatTime,
    formatDateTime,
    formatRelativeTime
  ])

  return (
    <LocalizationContext.Provider value={contextValue}>
      {children}
    </LocalizationContext.Provider>
  )
}

/**
 * Hook to use localization context
 */
export function useLocalization(): LocalizationContextType {
  const context = useContext(LocalizationContext)

  if (context === undefined) {
    // Return default fallback for SSR/prerendering
    console.warn('useLocalization used outside LocalizationProvider - using defaults');
    return {
      country: 'ES' as CountryCode,
      currency: 'EUR' as CurrencyCode,
      language: 'es' as LanguageCode,
      locale: 'es-ES',
      timezone: 'Europe/Madrid',
      config: {
        country: 'ES' as CountryCode,
        currency: 'EUR' as CurrencyCode,
        language: 'es' as LanguageCode,
        locale: 'es-ES',
        timezone: 'Europe/Madrid',
        paymentMethods: ['card', 'paypal'],
        legalRequirements: [],
        taxRate: 0.21
      },
      isLoading: false,
      error: null,
      confidence: 0,
      source: 'fallback',
      setManualCountry: () => {},
      refreshLocation: async () => {},
      isLatinAmerica: false,
      formatCurrency: (amount: number) => `€${amount.toFixed(2)}`,
      getPaymentMethods: () => ['card', 'paypal'],
      getLegalRequirements: () => [],
      formatDate: (date: Date | string | number) => new Date(date).toLocaleDateString('es-ES'),
      formatTime: (date: Date | string | number) => new Date(date).toLocaleTimeString('es-ES'),
      formatDateTime: (date: Date | string | number) => new Date(date).toLocaleString('es-ES'),
      formatRelativeTime: (date: Date | string | number) => new Date(date).toLocaleDateString('es-ES')
    };
  }

  return context
}

/**
 * Hook for currency formatting
 */
export function useCurrency() {
  const { formatCurrency, currency } = useLocalization()

  return {
    formatCurrency,
    currency,
    format: formatCurrency // Alias for convenience
  }
}

/**
 * Hook for payment methods
 */
export function usePaymentMethods() {
  const { getPaymentMethods, country } = useLocalization()

  return {
    paymentMethods: getPaymentMethods(),
    country,
    hasOxxo: getPaymentMethods().includes('oxxo'),
    hasPix: getPaymentMethods().includes('pix'),
    hasMercadoPago: getPaymentMethods().includes('mercadopago'),
    hasPse: getPaymentMethods().includes('pse')
  }
}

/**
 * Hook for legal compliance
 */
export function useLegalCompliance() {
  const { getLegalRequirements, country } = useLocalization()

  const requirements = getLegalRequirements()

  return {
    requirements,
    country,
    needsLgpd: requirements.includes('lgpd'), // Brazil
    needsPdpa: requirements.includes('pdpa'), // Argentina
    needsLfpdppp: requirements.includes('lfpdppp'), // Mexico
    needsLaw1581: requirements.includes('law1581') // Colombia
  }
}

/**
 * Hook for date formatting
 */
export function useDateFormat() {
  const { formatDate, formatTime, formatDateTime, formatRelativeTime, timezone, locale } = useLocalization()

  return {
    formatDate,
    formatTime,
    formatDateTime,
    formatRelativeTime,
    timezone,
    locale
  }
}