import { NextRequest } from 'next/server'

// Supported country codes for Latin America localization
export type CountryCode =
  | 'MX' // Mexico
  | 'CO' // Colombia  
  | 'AR' // Argentina
  | 'CL' // Chile
  | 'PE' // Peru
  | 'EC' // Ecuador
  | 'BR' // Brazil
  | 'US' // United States (fallback)
  | 'UNKNOWN'

// Currency codes for supported countries
export type CurrencyCode =
  | 'MXN' // Mexican Peso
  | 'COP' // Colombian Peso
  | 'ARS' // Argentine Peso
  | 'CLP' // Chilean Peso
  | 'PEN' // Peruvian Sol
  | 'USD' // US Dollar
  | 'BRL' // Brazilian Real

// Language codes
export type LanguageCode = 'es' | 'pt' | 'en'

// Localization configuration for each country
export interface LocalizationConfig {
  country: CountryCode
  currency: CurrencyCode
  language: LanguageCode
  locale: string
  timezone: string
  taxRate: number
  paymentMethods: string[]
  legalRequirements: string[]
}

// Geo-detection result
export interface GeoDetectionResult {
  country: CountryCode
  confidence: number
  source: 'ip' | 'cloudflare' | 'browser' | 'manual' | 'cache'
  config: LocalizationConfig
}

// Cache entry for geo-detection results
interface CacheEntry {
  result: GeoDetectionResult
  timestamp: number
  ttl: number
}

// Country configuration mapping
const COUNTRY_CONFIGS: Record<CountryCode, LocalizationConfig> = {
  MX: {
    country: 'MX',
    currency: 'MXN',
    language: 'es',
    locale: 'es-MX',
    timezone: 'America/Mexico_City',
    taxRate: 0.16,
    paymentMethods: ['oxxo', 'spei', 'card'],
    legalRequirements: ['lfpdppp']
  },
  CO: {
    country: 'CO',
    currency: 'COP',
    language: 'es',
    locale: 'es-CO',
    timezone: 'America/Bogota',
    taxRate: 0.19,
    paymentMethods: ['pse', 'efecty', 'card'],
    legalRequirements: ['law1581']
  },
  AR: {
    country: 'AR',
    currency: 'ARS',
    language: 'es',
    locale: 'es-AR',
    timezone: 'America/Argentina/Buenos_Aires',
    taxRate: 0.21,
    paymentMethods: ['mercadopago', 'rapipago', 'card'],
    legalRequirements: ['pdpa']
  },
  CL: {
    country: 'CL',
    currency: 'CLP',
    language: 'es',
    locale: 'es-CL',
    timezone: 'America/Santiago',
    taxRate: 0.19,
    paymentMethods: ['webpay', 'card'],
    legalRequirements: ['ley19628']
  },
  PE: {
    country: 'PE',
    currency: 'PEN',
    language: 'es',
    locale: 'es-PE',
    timezone: 'America/Lima',
    taxRate: 0.18,
    paymentMethods: ['pagoefectivo', 'card'],
    legalRequirements: ['ley29733']
  },
  EC: {
    country: 'EC',
    currency: 'USD',
    language: 'es',
    locale: 'es-EC',
    timezone: 'America/Guayaquil',
    taxRate: 0.12,
    paymentMethods: ['card'],
    legalRequirements: ['lopd']
  },
  BR: {
    country: 'BR',
    currency: 'BRL',
    language: 'pt',
    locale: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    taxRate: 0.17,
    paymentMethods: ['pix', 'boleto', 'card'],
    legalRequirements: ['lgpd']
  },
  US: {
    country: 'US',
    currency: 'USD',
    language: 'en',
    locale: 'en-US',
    timezone: 'America/New_York',
    taxRate: 0.08,
    paymentMethods: ['card', 'paypal'],
    legalRequirements: ['ccpa']
  },
  UNKNOWN: {
    country: 'UNKNOWN',
    currency: 'USD',
    language: 'es',
    locale: 'es',
    timezone: 'UTC',
    taxRate: 0,
    paymentMethods: ['card'],
    legalRequirements: []
  }
}

// In-memory cache for geo-detection results
const geoCache = new Map<string, CacheEntry>()

// Cache TTL in milliseconds (1 hour)
const CACHE_TTL = 60 * 60 * 1000

// Performance metrics for monitoring
interface PerformanceMetrics {
  totalRequests: number
  cacheHits: number
  cacheMisses: number
  cloudflareDetections: number
  ipDetections: number
  browserDetections: number
  errors: number
  averageResponseTime: number
}

// Global metrics instance
const metrics: PerformanceMetrics = {
  totalRequests: 0,
  cacheHits: 0,
  cacheMisses: 0,
  cloudflareDetections: 0,
  ipDetections: 0,
  browserDetections: 0,
  errors: 0,
  averageResponseTime: 0
}

/**
 * Geo-Detection Service
 * Provides comprehensive location detection with multiple fallback strategies
 */
export class GeoDetectionService {

  /**
   * Main method to detect user country from request
   */
  async detectCountry(request: NextRequest): Promise<GeoDetectionResult> {
    const startTime = Date.now()
    metrics.totalRequests++

    try {
      const clientIP = this.getClientIP(request)

      // Check cache first
      const cached = this.getCachedResult(clientIP)
      if (cached) {
        metrics.cacheHits++
        this.updateMetrics(startTime)
        return cached
      }

      metrics.cacheMisses++

      // Try CloudFlare headers first (most accurate)
      const cloudflareResult = this.detectFromCloudflare(request)
      if (cloudflareResult.confidence > 0.8) {
        metrics.cloudflareDetections++
        this.cacheResult(clientIP, cloudflareResult)
        this.updateMetrics(startTime)
        return cloudflareResult
      }

      // Try IP-based detection
      const ipResult = await this.detectFromIP(clientIP)
      if (ipResult.confidence > 0.7) {
        metrics.ipDetections++
        this.cacheResult(clientIP, ipResult)
        this.updateMetrics(startTime)
        return ipResult
      }

      // Fallback to browser locale detection
      const browserResult = this.detectFromBrowser(request)
      metrics.browserDetections++
      this.cacheResult(clientIP, browserResult)
      this.updateMetrics(startTime)
      return browserResult

    } catch (error) {
      metrics.errors++
      console.error('Geo-detection service error:', error)

      // Return fallback result on any error
      const fallbackResult: GeoDetectionResult = {
        country: 'MX',
        confidence: 0.1,
        source: 'browser',
        config: this.getLocalizationConfig('MX')
      }

      this.updateMetrics(startTime)
      return fallbackResult
    }
  }

  /**
   * Get localization configuration for a country
   */
  getLocalizationConfig(country: CountryCode): LocalizationConfig {
    return COUNTRY_CONFIGS[country] || COUNTRY_CONFIGS.UNKNOWN
  }

  /**
   * Validate if country is supported for localization
   */
  validateCountrySupport(country: string): country is CountryCode {
    return country !== 'UNKNOWN' && country in COUNTRY_CONFIGS
  }

  /**
   * Extract client IP from request headers
   */
  private getClientIP(request: NextRequest): string {
    // Try various headers in order of preference
    const headers = [
      'cf-connecting-ip', // CloudFlare
      'x-forwarded-for',
      'x-real-ip',
      'x-client-ip',
      'x-forwarded',
      'x-cluster-client-ip',
      'forwarded-for',
      'forwarded'
    ]

    for (const header of headers) {
      const value = request.headers.get(header)
      if (value) {
        // Handle comma-separated IPs (take first one)
        const ip = value.split(',')[0].trim()
        if (this.isValidIP(ip)) {
          return ip
        }
      }
    }

    // Fallback to connection remote address - NextRequest doesn't have ip property
    // Use x-forwarded-for as final fallback or return unknown
    const forwardedFor = request.headers.get('x-forwarded-for')
    if (forwardedFor) {
      const ip = forwardedFor.split(',')[0].trim()
      if (this.isValidIP(ip)) {
        return ip
      }
    }

    return 'unknown'
  }

  /**
   * Detect country from CloudFlare headers
   */
  private detectFromCloudflare(request: NextRequest): GeoDetectionResult {
    const cfCountry = request.headers.get('cf-ipcountry')

    if (cfCountry && cfCountry !== 'XX') {
      const country = this.mapToSupportedCountry(cfCountry)
      return {
        country,
        confidence: 0.9,
        source: 'cloudflare',
        config: this.getLocalizationConfig(country)
      }
    }

    return this.createUnknownResult('cloudflare')
  }

  /**
   * Detect country from IP address using external service with fallback providers
   */
  private async detectFromIP(ip: string): Promise<GeoDetectionResult> {
    if (!this.isValidIP(ip) || ip === 'unknown') {
      return this.createUnknownResult('ip')
    }

    // Try multiple providers in order of preference
    const providers = [
      () => this.detectFromIPAPI(ip),
      () => this.detectFromMaxMind(ip),
      () => this.detectFromIPInfo(ip),
      () => this.detectFromFreeGeoIP(ip)
    ]

    for (const provider of providers) {
      try {
        const result = await provider()
        if (result.confidence > 0.5) {
          return result
        }
      } catch (error) {
        console.warn('IP provider failed, trying next:', error)
        continue
      }
    }

    return this.createUnknownResult('ip')
  }

  /**
   * Detect using ipapi.co (primary provider)
   */
  private async detectFromIPAPI(ip: string): Promise<GeoDetectionResult> {
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: {
        'User-Agent': 'RedCreativa-GeoDetection/1.0'
      },
      signal: AbortSignal.timeout(5000)
    })

    if (!response.ok) {
      throw new Error(`IPAPI HTTP ${response.status}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(data.reason || 'IPAPI Error')
    }

    const country = this.mapToSupportedCountry(data.country_code)

    return {
      country,
      confidence: 0.8,
      source: 'ip',
      config: this.getLocalizationConfig(country)
    }
  }

  /**
   * Detect using ipinfo.io (fallback provider)
   */
  private async detectFromIPInfo(ip: string): Promise<GeoDetectionResult> {
    const response = await fetch(`https://ipinfo.io/${ip}/json`, {
      headers: {
        'User-Agent': 'RedCreativa-GeoDetection/1.0'
      },
      signal: AbortSignal.timeout(5000)
    })

    if (!response.ok) {
      throw new Error(`IPInfo HTTP ${response.status}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error.message || 'IPInfo Error')
    }

    const country = this.mapToSupportedCountry(data.country)

    return {
      country,
      confidence: 0.7,
      source: 'ip',
      config: this.getLocalizationConfig(country)
    }
  }

  /**
   * Detect using MaxMind GeoLite2 (via geojs.io - free MaxMind-based service)
   */
  private async detectFromMaxMind(ip: string): Promise<GeoDetectionResult> {
    const response = await fetch(`https://get.geojs.io/v1/ip/geo/${ip}.json`, {
      headers: {
        'User-Agent': 'RedCreativa-GeoDetection/1.0'
      },
      signal: AbortSignal.timeout(5000)
    })

    if (!response.ok) {
      throw new Error(`MaxMind HTTP ${response.status}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error || 'MaxMind Error')
    }

    const country = this.mapToSupportedCountry(data.country_code)

    return {
      country,
      confidence: 0.75,
      source: 'ip',
      config: this.getLocalizationConfig(country)
    }
  }

  /**
   * Detect using freegeoip.app (secondary fallback)
   */
  private async detectFromFreeGeoIP(ip: string): Promise<GeoDetectionResult> {
    const response = await fetch(`https://freegeoip.app/json/${ip}`, {
      headers: {
        'User-Agent': 'RedCreativa-GeoDetection/1.0'
      },
      signal: AbortSignal.timeout(5000)
    })

    if (!response.ok) {
      throw new Error(`FreeGeoIP HTTP ${response.status}`)
    }

    const data = await response.json()

    const country = this.mapToSupportedCountry(data.country_code)

    return {
      country,
      confidence: 0.6,
      source: 'ip',
      config: this.getLocalizationConfig(country)
    }
  }

  /**
   * Detect country from browser locale and timezone
   */
  private detectFromBrowser(request: NextRequest): GeoDetectionResult {
    const acceptLanguage = request.headers.get('accept-language') || ''
    const timezone = request.headers.get('x-timezone') || ''

    // Parse accept-language header
    const languages = acceptLanguage
      .split(',')
      .map(lang => lang.trim().split(';')[0])
      .map(lang => lang.split('-'))

    // Try to match language-country combinations
    for (const [lang, region] of languages) {
      if (region) {
        const country = this.mapToSupportedCountry(region.toUpperCase())
        if (country !== 'UNKNOWN') {
          return {
            country,
            confidence: 0.6,
            source: 'browser',
            config: this.getLocalizationConfig(country)
          }
        }
      }
    }

    // Try timezone-based detection
    if (timezone) {
      const country = this.detectCountryFromTimezone(timezone)
      if (country !== 'UNKNOWN') {
        return {
          country,
          confidence: 0.5,
          source: 'browser',
          config: this.getLocalizationConfig(country)
        }
      }
    }

    // Default to Spanish-speaking region
    return {
      country: 'MX', // Default to Mexico as largest Spanish market
      confidence: 0.3,
      source: 'browser',
      config: this.getLocalizationConfig('MX')
    }
  }

  /**
   * Map ISO country code to supported country
   */
  private mapToSupportedCountry(countryCode: string): CountryCode {
    const code = countryCode.toUpperCase() as CountryCode
    return code in COUNTRY_CONFIGS ? code : 'UNKNOWN'
  }

  /**
   * Detect country from timezone
   */
  private detectCountryFromTimezone(timezone: string): CountryCode {
    const timezoneMap: Record<string, CountryCode> = {
      'America/Mexico_City': 'MX',
      'America/Cancun': 'MX',
      'America/Tijuana': 'MX',
      'America/Bogota': 'CO',
      'America/Argentina/Buenos_Aires': 'AR',
      'America/Santiago': 'CL',
      'America/Lima': 'PE',
      'America/Guayaquil': 'EC',
      'America/Sao_Paulo': 'BR',
      'America/Recife': 'BR',
      'America/Manaus': 'BR'
    }

    return timezoneMap[timezone] || 'UNKNOWN'
  }

  /**
   * Validate IP address format
   */
  private isValidIP(ip: string): boolean {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/

    return ipv4Regex.test(ip) || ipv6Regex.test(ip)
  }

  /**
   * Create unknown result with specified source
   */
  private createUnknownResult(source: GeoDetectionResult['source']): GeoDetectionResult {
    return {
      country: 'UNKNOWN',
      confidence: 0,
      source,
      config: this.getLocalizationConfig('UNKNOWN')
    }
  }

  /**
   * Get cached geo-detection result
   */
  private getCachedResult(key: string): GeoDetectionResult | null {
    const entry = geoCache.get(key)

    if (!entry) {
      return null
    }

    // Check if cache entry is still valid
    if (Date.now() - entry.timestamp > entry.ttl) {
      geoCache.delete(key)
      return null
    }

    // Update source to indicate cached result
    return {
      ...entry.result,
      source: 'cache'
    }
  }

  /**
   * Cache geo-detection result
   */
  private cacheResult(key: string, result: GeoDetectionResult): void {
    const entry: CacheEntry = {
      result,
      timestamp: Date.now(),
      ttl: CACHE_TTL
    }

    geoCache.set(key, entry)

    // Clean up old cache entries periodically
    if (geoCache.size > 1000) {
      this.cleanupCache()
    }
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now()

    // Convert entries to array to avoid iterator issues
    const entries = Array.from(geoCache.entries())
    for (const [key, entry] of entries) {
      if (now - entry.timestamp > entry.ttl) {
        geoCache.delete(key)
      }
    }
  }

  /**
   * Clear all cached results (useful for testing)
   */
  clearCache(): void {
    geoCache.clear()
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: geoCache.size,
      entries: Array.from(geoCache.keys())
    }
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(startTime: number): void {
    const responseTime = Date.now() - startTime

    // Calculate running average response time
    if (metrics.totalRequests === 1) {
      metrics.averageResponseTime = responseTime
    } else {
      metrics.averageResponseTime = (
        (metrics.averageResponseTime * (metrics.totalRequests - 1) + responseTime) /
        metrics.totalRequests
      )
    }
  }

  /**
   * Get performance metrics for monitoring
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...metrics }
  }

  /**
   * Reset performance metrics
   */
  resetMetrics(): void {
    Object.assign(metrics, {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      cloudflareDetections: 0,
      ipDetections: 0,
      browserDetections: 0,
      errors: 0,
      averageResponseTime: 0
    })
  }
}

// Export singleton instance
export const geoDetectionService = new GeoDetectionService()

// Export utility functions
export function isLatinAmericanCountry(country: CountryCode): boolean {
  return ['MX', 'CO', 'AR', 'CL', 'PE', 'EC', 'BR'].includes(country)
}

export function getCountryDisplayName(country: CountryCode, language: LanguageCode = 'es'): string {
  const names: Record<CountryCode, Record<LanguageCode, string>> = {
    MX: { es: 'México', pt: 'México', en: 'Mexico' },
    CO: { es: 'Colombia', pt: 'Colômbia', en: 'Colombia' },
    AR: { es: 'Argentina', pt: 'Argentina', en: 'Argentina' },
    CL: { es: 'Chile', pt: 'Chile', en: 'Chile' },
    PE: { es: 'Perú', pt: 'Peru', en: 'Peru' },
    EC: { es: 'Ecuador', pt: 'Equador', en: 'Ecuador' },
    BR: { es: 'Brasil', pt: 'Brasil', en: 'Brazil' },
    US: { es: 'Estados Unidos', pt: 'Estados Unidos', en: 'United States' },
    UNKNOWN: { es: 'Desconocido', pt: 'Desconhecido', en: 'Unknown' }
  }

  return names[country]?.[language] || names[country]?.['es'] || country
}