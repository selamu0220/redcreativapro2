import { CountryCode, CurrencyCode } from '../app/lib/geo-detection'
import { storageManager } from '@/app/lib/storage-manager'

// Exchange rate data structure
export interface ExchangeRate {
  from: CurrencyCode
  to: CurrencyCode
  rate: number
  timestamp: number
  source: 'api' | 'cache' | 'fallback'
}

// Currency formatting configuration
export interface CurrencyFormat {
  currency: CurrencyCode
  symbol: string
  symbolPosition: 'before' | 'after'
  decimalPlaces: number
  thousandsSeparator: string
  decimalSeparator: string
  locale: string
}

// Price rounding rules per country
export interface PriceRoundingRule {
  country: CountryCode
  currency: CurrencyCode
  roundingMethod: 'up' | 'down' | 'nearest'
  roundingUnit: number // e.g., 0.01 for cents, 1 for whole units, 10 for tens
  minimumPrice: number
}

// Cache entry for exchange rates
interface ExchangeRateCache {
  rates: Map<string, ExchangeRate>
  lastUpdate: number
  ttl: number
}

// Currency service configuration
interface CurrencyServiceConfig {
  apiKey?: string
  baseCurrency: CurrencyCode
  cacheTTL: number
  fallbackRates: Record<string, number>
  retryAttempts: number
  retryDelay: number
}

// Performance metrics
interface CurrencyMetrics {
  totalConversions: number
  cacheHits: number
  cacheMisses: number
  apiCalls: number
  errors: number
  averageResponseTime: number
}

// Currency formatting configurations for each supported currency
const CURRENCY_FORMATS: Record<CurrencyCode, CurrencyFormat> = {
  USD: {
    currency: 'USD',
    symbol: '$',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    locale: 'en-US'
  },
  MXN: {
    currency: 'MXN',
    symbol: '$',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    locale: 'es-MX'
  },
  COP: {
    currency: 'COP',
    symbol: '$',
    symbolPosition: 'before',
    decimalPlaces: 0, // Colombian pesos typically don't use decimals
    thousandsSeparator: '.',
    decimalSeparator: ',',
    locale: 'es-CO'
  },
  ARS: {
    currency: 'ARS',
    symbol: '$',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandsSeparator: '.',
    decimalSeparator: ',',
    locale: 'es-AR'
  },
  CLP: {
    currency: 'CLP',
    symbol: '$',
    symbolPosition: 'before',
    decimalPlaces: 0, // Chilean pesos don't use decimals
    thousandsSeparator: '.',
    decimalSeparator: ',',
    locale: 'es-CL'
  },
  PEN: {
    currency: 'PEN',
    symbol: 'S/',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.',
    locale: 'es-PE'
  },
  BRL: {
    currency: 'BRL',
    symbol: 'R$',
    symbolPosition: 'before',
    decimalPlaces: 2,
    thousandsSeparator: '.',
    decimalSeparator: ',',
    locale: 'pt-BR'
  }
}

// Price rounding rules for each country
const PRICE_ROUNDING_RULES: Record<CountryCode, PriceRoundingRule> = {
  MX: {
    country: 'MX',
    currency: 'MXN',
    roundingMethod: 'nearest',
    roundingUnit: 0.01,
    minimumPrice: 1
  },
  CO: {
    country: 'CO',
    currency: 'COP',
    roundingMethod: 'up',
    roundingUnit: 100, // Round to nearest 100 pesos
    minimumPrice: 1000
  },
  AR: {
    country: 'AR',
    currency: 'ARS',
    roundingMethod: 'nearest',
    roundingUnit: 0.01,
    minimumPrice: 10
  },
  CL: {
    country: 'CL',
    currency: 'CLP',
    roundingMethod: 'up',
    roundingUnit: 10, // Round to nearest 10 pesos
    minimumPrice: 100
  },
  PE: {
    country: 'PE',
    currency: 'PEN',
    roundingMethod: 'nearest',
    roundingUnit: 0.01,
    minimumPrice: 1
  },
  EC: {
    country: 'EC',
    currency: 'USD',
    roundingMethod: 'nearest',
    roundingUnit: 0.01,
    minimumPrice: 1
  },
  BR: {
    country: 'BR',
    currency: 'BRL',
    roundingMethod: 'nearest',
    roundingUnit: 0.01,
    minimumPrice: 1
  },
  US: {
    country: 'US',
    currency: 'USD',
    roundingMethod: 'nearest',
    roundingUnit: 0.01,
    minimumPrice: 1
  },
  UNKNOWN: {
    country: 'UNKNOWN',
    currency: 'USD',
    roundingMethod: 'nearest',
    roundingUnit: 0.01,
    minimumPrice: 1
  }
}

// Fallback exchange rates (updated periodically)
const FALLBACK_RATES: Record<string, number> = {
  'USD-MXN': 20.5,
  'USD-COP': 4200,
  'USD-ARS': 350,
  'USD-CLP': 900,
  'USD-PEN': 3.8,
  'USD-BRL': 5.2,
  'MXN-USD': 0.049,
  'COP-USD': 0.00024,
  'ARS-USD': 0.0029,
  'CLP-USD': 0.0011,
  'PEN-USD': 0.26,
  'BRL-USD': 0.19
}

/**
 * Currency Management Service
 * Handles real-time currency conversion, formatting, and caching
 */
export class CurrencyService {
  private cache: ExchangeRateCache
  private config: CurrencyServiceConfig
  private metrics: CurrencyMetrics

  constructor(config: Partial<CurrencyServiceConfig> = {}) {
    this.config = {
      baseCurrency: 'USD',
      cacheTTL: 24 * 60 * 60 * 1000, // 24 hours
      fallbackRates: FALLBACK_RATES,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config
    }

    this.cache = {
      rates: new Map(),
      lastUpdate: 0,
      ttl: this.config.cacheTTL
    }

    this.metrics = {
      totalConversions: 0,
      cacheHits: 0,
      cacheMisses: 0,
      apiCalls: 0,
      errors: 0,
      averageResponseTime: 0
    }
  }

  /**
   * Convert price from one currency to another
   */
  async convertPrice(
    amount: number,
    fromCurrency: CurrencyCode,
    toCurrency: CurrencyCode
  ): Promise<number> {
    const startTime = Date.now()
    this.metrics.totalConversions++

    try {
      // Same currency, no conversion needed
      if (fromCurrency === toCurrency) {
        this.updateMetrics(startTime)
        return amount
      }

      // Get exchange rate
      const rate = await this.getExchangeRate(fromCurrency, toCurrency)

      // Convert amount
      const convertedAmount = amount * rate.rate

      // Apply rounding rules for target currency
      const roundedAmount = this.applyRoundingRules(convertedAmount, toCurrency)

      this.updateMetrics(startTime)
      return roundedAmount

    } catch (error) {
      this.metrics.errors++
      console.error('Currency conversion error:', error)

      // Return original amount as fallback
      this.updateMetrics(startTime)
      return amount
    }
  }

  /**
   * Get exchange rate between two currencies
   */
  async getExchangeRate(
    fromCurrency: CurrencyCode,
    toCurrency: CurrencyCode
  ): Promise<ExchangeRate> {
    const cacheKey = `${fromCurrency}-${toCurrency}`

    // Check cache first
    const cachedRate = this.getCachedRate(cacheKey)
    if (cachedRate) {
      this.metrics.cacheHits++
      return cachedRate
    }

    this.metrics.cacheMisses++

    try {
      // Try to fetch from API
      const rate = await this.fetchExchangeRateFromAPI(fromCurrency, toCurrency)

      // Cache the result
      this.cacheRate(cacheKey, rate)
      this.metrics.apiCalls++

      return rate

    } catch (error) {
      console.warn('API fetch failed, using fallback rate:', error)

      // Use fallback rate
      const fallbackRate = this.getFallbackRate(fromCurrency, toCurrency)
      this.cacheRate(cacheKey, fallbackRate)

      return fallbackRate
    }
  }

  /**
   * Format currency amount according to local conventions
   */
  formatCurrency(
    amount: number,
    currency: CurrencyCode,
    locale?: string
  ): string {
    const format = CURRENCY_FORMATS[currency]
    if (!format) {
      return `${amount} ${currency}`
    }

    try {
      // Use Intl.NumberFormat for proper localization
      const formatter = new Intl.NumberFormat(locale || format.locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: format.decimalPlaces,
        maximumFractionDigits: format.decimalPlaces
      })

      return formatter.format(amount)

    } catch (error) {
      console.warn('Currency formatting error, using fallback:', error)

      // Fallback to manual formatting
      return this.formatCurrencyManual(amount, format)
    }
  }

  /**
   * Get currency format configuration
   */
  getCurrencyFormat(currency: CurrencyCode): CurrencyFormat | null {
    return CURRENCY_FORMATS[currency] || null
  }

  /**
   * Get price rounding rule for country
   */
  getRoundingRule(country: CountryCode): PriceRoundingRule | null {
    return PRICE_ROUNDING_RULES[country] || null
  }

  /**
   * Apply rounding rules to converted price
   */
  private applyRoundingRules(amount: number, currency: CurrencyCode): number {
    // Find the country that uses this currency
    const country = Object.keys(PRICE_ROUNDING_RULES).find(
      key => PRICE_ROUNDING_RULES[key as CountryCode].currency === currency
    ) as CountryCode

    if (!country) {
      return Math.round(amount * 100) / 100 // Default to 2 decimal places
    }

    const rule = PRICE_ROUNDING_RULES[country]

    // Ensure minimum price
    if (amount < rule.minimumPrice) {
      return rule.minimumPrice
    }

    // Apply rounding method
    switch (rule.roundingMethod) {
      case 'up':
        return Math.ceil(amount / rule.roundingUnit) * rule.roundingUnit
      case 'down':
        return Math.floor(amount / rule.roundingUnit) * rule.roundingUnit
      case 'nearest':
      default:
        return Math.round(amount / rule.roundingUnit) * rule.roundingUnit
    }
  }

  /**
   * Fetch exchange rate from external API
   */
  private async fetchExchangeRateFromAPI(
    fromCurrency: CurrencyCode,
    toCurrency: CurrencyCode
  ): Promise<ExchangeRate> {
    // Try multiple API providers with fallback
    const providers = [
      () => this.fetchFromExchangeRateAPI(fromCurrency, toCurrency),
      () => this.fetchFromFixer(fromCurrency, toCurrency),
      () => this.fetchFromCurrencyAPI(fromCurrency, toCurrency)
    ]

    let lastError: Error | null = null

    for (const provider of providers) {
      try {
        const rate = await provider()
        if (rate.rate > 0) {
          return rate
        }
      } catch (error) {
        lastError = error as Error
        console.warn('Currency API provider failed, trying next:', error)
        continue
      }
    }

    throw lastError || new Error('All currency API providers failed')
  }

  /**
   * Fetch from exchangerate-api.com (primary provider)
   */
  private async fetchFromExchangeRateAPI(
    fromCurrency: CurrencyCode,
    toCurrency: CurrencyCode
  ): Promise<ExchangeRate> {
    const url = `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RedCreativa-CurrencyService/1.0'
      },
      signal: AbortSignal.timeout(5000)
    })

    if (!response.ok) {
      throw new Error(`ExchangeRate API HTTP ${response.status}`)
    }

    const data = await response.json()

    if (!data.rates || !data.rates[toCurrency]) {
      throw new Error(`Rate not found for ${fromCurrency} to ${toCurrency}`)
    }

    return {
      from: fromCurrency,
      to: toCurrency,
      rate: data.rates[toCurrency],
      timestamp: Date.now(),
      source: 'api'
    }
  }

  /**
   * Fetch from fixer.io (fallback provider)
   */
  private async fetchFromFixer(
    fromCurrency: CurrencyCode,
    toCurrency: CurrencyCode
  ): Promise<ExchangeRate> {
    // Note: Fixer.io requires API key for production use
    const apiKey = this.config.apiKey || 'demo'
    const url = `https://api.fixer.io/latest?access_key=${apiKey}&base=${fromCurrency}&symbols=${toCurrency}`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RedCreativa-CurrencyService/1.0'
      },
      signal: AbortSignal.timeout(5000)
    })

    if (!response.ok) {
      throw new Error(`Fixer API HTTP ${response.status}`)
    }

    const data = await response.json()

    if (!data.success || !data.rates || !data.rates[toCurrency]) {
      throw new Error(data.error?.info || `Rate not found for ${fromCurrency} to ${toCurrency}`)
    }

    return {
      from: fromCurrency,
      to: toCurrency,
      rate: data.rates[toCurrency],
      timestamp: Date.now(),
      source: 'api'
    }
  }

  /**
   * Fetch from currencyapi.com (secondary fallback)
   */
  private async fetchFromCurrencyAPI(
    fromCurrency: CurrencyCode,
    toCurrency: CurrencyCode
  ): Promise<ExchangeRate> {
    const url = `https://api.currencyapi.com/v3/latest?apikey=${this.config.apiKey || 'demo'}&base_currency=${fromCurrency}&currencies=${toCurrency}`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RedCreativa-CurrencyService/1.0'
      },
      signal: AbortSignal.timeout(5000)
    })

    if (!response.ok) {
      throw new Error(`CurrencyAPI HTTP ${response.status}`)
    }

    const data = await response.json()

    if (!data.data || !data.data[toCurrency]) {
      throw new Error(`Rate not found for ${fromCurrency} to ${toCurrency}`)
    }

    return {
      from: fromCurrency,
      to: toCurrency,
      rate: data.data[toCurrency].value,
      timestamp: Date.now(),
      source: 'api'
    }
  }

  /**
   * Get fallback exchange rate from stored rates
   */
  private getFallbackRate(
    fromCurrency: CurrencyCode,
    toCurrency: CurrencyCode
  ): ExchangeRate {
    const cacheKey = `${fromCurrency}-${toCurrency}`
    const reverseKey = `${toCurrency}-${fromCurrency}`

    let rate = this.config.fallbackRates[cacheKey]

    if (!rate && this.config.fallbackRates[reverseKey]) {
      // Use inverse rate if direct rate not available
      rate = 1 / this.config.fallbackRates[reverseKey]
    }

    if (!rate) {
      // Default fallback rate (should not happen in production)
      rate = 1
      console.warn(`No fallback rate found for ${fromCurrency} to ${toCurrency}, using 1:1`)
    }

    return {
      from: fromCurrency,
      to: toCurrency,
      rate,
      timestamp: Date.now(),
      source: 'fallback'
    }
  }

  /**
   * Get cached exchange rate
   */
  /**
   * Get cached exchange rate
   */
  private getCachedRate(cacheKey: string): ExchangeRate | null {
    const rate = this.cache.rates.get(cacheKey)

    // Check memory cache
    if (rate) {
      if (Date.now() - rate.timestamp <= this.cache.ttl) {
        return { ...rate, source: 'cache' }
      }
      this.cache.rates.delete(cacheKey)
    }

    // Check persistent storage (client-side only)
    if (typeof window !== 'undefined') {
      const persistedRate = storageManager.get<ExchangeRate>(`rate_${cacheKey}`)
      if (persistedRate) {
        // Hydrate memory cache
        this.cache.rates.set(cacheKey, persistedRate)
        return { ...persistedRate, source: 'cache' }
      }
    }

    return null
  }

  /**
   * Cache exchange rate
   */
  private cacheRate(cacheKey: string, rate: ExchangeRate): void {
    // Save to memory cache
    this.cache.rates.set(cacheKey, rate)
    this.cache.lastUpdate = Date.now()

    // Save to persistent storage (client-side only)
    if (typeof window !== 'undefined') {
      storageManager.set(`rate_${cacheKey}`, rate, this.cache.ttl)
    }

    // Clean up old cache entries periodically
    if (this.cache.rates.size > 100) {
      this.cleanupCache()
    }
  }

  /**
   * Manual currency formatting fallback
   */
  private formatCurrencyManual(amount: number, format: CurrencyFormat): string {
    // Round to specified decimal places
    const rounded = Math.round(amount * Math.pow(10, format.decimalPlaces)) / Math.pow(10, format.decimalPlaces)

    // Split into integer and decimal parts
    const parts = rounded.toFixed(format.decimalPlaces).split('.')
    const integerPart = parts[0]
    const decimalPart = parts[1] || ''

    // Add thousands separators
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, format.thousandsSeparator)

    // Combine parts
    let formattedAmount = formattedInteger
    if (format.decimalPlaces > 0 && decimalPart) {
      formattedAmount += format.decimalSeparator + decimalPart
    }

    // Add currency symbol
    if (format.symbolPosition === 'before') {
      return `${format.symbol}${formattedAmount}`
    } else {
      return `${formattedAmount} ${format.symbol}`
    }
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now()

    for (const [key, rate] of this.cache.rates.entries()) {
      if (now - rate.timestamp > this.cache.ttl) {
        this.cache.rates.delete(key)
      }
    }
  }

  /**
   * Clear all cached rates (useful for testing)
   */
  clearCache(): void {
    this.cache.rates.clear()
    this.cache.lastUpdate = 0
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(startTime: number): void {
    const responseTime = Date.now() - startTime

    // Calculate running average response time
    if (this.metrics.totalConversions === 1) {
      this.metrics.averageResponseTime = responseTime
    } else {
      this.metrics.averageResponseTime = (
        (this.metrics.averageResponseTime * (this.metrics.totalConversions - 1) + responseTime) /
        this.metrics.totalConversions
      )
    }
  }

  /**
   * Get performance metrics for monitoring
   */
  getMetrics(): CurrencyMetrics {
    return { ...this.metrics }
  }

  /**
   * Reset performance metrics
   */
  resetMetrics(): void {
    Object.assign(this.metrics, {
      totalConversions: 0,
      cacheHits: 0,
      cacheMisses: 0,
      apiCalls: 0,
      errors: 0,
      averageResponseTime: 0
    })
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; lastUpdate: number; entries: string[] } {
    return {
      size: this.cache.rates.size,
      lastUpdate: this.cache.lastUpdate,
      entries: Array.from(this.cache.rates.keys())
    }
  }

  /**
   * Update fallback rates (for admin configuration)
   */
  updateFallbackRates(rates: Record<string, number>): void {
    this.config.fallbackRates = { ...this.config.fallbackRates, ...rates }
  }

  /**
   * Get all supported currencies
   */
  getSupportedCurrencies(): CurrencyCode[] {
    return Object.keys(CURRENCY_FORMATS) as CurrencyCode[]
  }

  /**
   * Validate currency code
   */
  isValidCurrency(currency: string): currency is CurrencyCode {
    return currency in CURRENCY_FORMATS
  }
}

// Export singleton instance
export const currencyService = new CurrencyService()

// Export utility functions
export function getCurrencySymbol(currency: CurrencyCode): string {
  return CURRENCY_FORMATS[currency]?.symbol || currency
}

export function getCurrencyForCountry(country: CountryCode): CurrencyCode {
  return PRICE_ROUNDING_RULES[country]?.currency || 'USD'
}

export function formatPriceRange(
  minPrice: number,
  maxPrice: number,
  currency: CurrencyCode,
  locale?: string
): string {
  const service = new CurrencyService()
  const formattedMin = service.formatCurrency(minPrice, currency, locale)
  const formattedMax = service.formatCurrency(maxPrice, currency, locale)

  return `${formattedMin} - ${formattedMax}`
}