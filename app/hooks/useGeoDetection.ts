'use client'

import { useState, useEffect, useCallback } from 'react'
import { CountryCode, LocalizationConfig, GeoDetectionResult } from '@/app/lib/geo-detection'
import { storageManager } from '@/app/lib/storage-manager'

interface UseGeoDetectionOptions {
  autoDetect?: boolean
  fallbackCountry?: CountryCode
}

interface UseGeoDetectionReturn {
  country: CountryCode | null
  config: LocalizationConfig | null
  isLoading: boolean
  error: string | null
  confidence: number
  source: string | null
  detectLocation: () => Promise<void>
  setManualCountry: (country: CountryCode) => void
}

/**
 * React hook for geo-detection functionality
 * Provides client-side access to user location and localization settings
 */
export function useGeoDetection(options: UseGeoDetectionOptions = {}): UseGeoDetectionReturn {
  const { autoDetect = true, fallbackCountry = 'MX' } = options

  const [country, setCountry] = useState<CountryCode | null>(null)
  const [config, setConfig] = useState<LocalizationConfig | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confidence, setConfidence] = useState(0)
  const [source, setSource] = useState<string | null>(null)

  /**
   * Detect user location using client-side API
   */
  const detectLocation = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Call our geo-detection API endpoint
      const response = await fetch('/api/geo-detect', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result: GeoDetectionResult = await response.json()

      setCountry(result.country)
      setConfig(result.config)
      setConfidence(result.confidence)
      setSource(result.source)

      // Store in storage for persistence (24 hours TTL)
      storageManager.set('geo_detection', result, 24 * 60 * 60 * 1000)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Geo-detection failed:', err)

      // Fallback to default country
      if (fallbackCountry) {
        setManualCountry(fallbackCountry)
      }
    } finally {
      setIsLoading(false)
    }
  }, [fallbackCountry])

  /**
   * Manually set country (user override)
   */
  const setManualCountry = useCallback((newCountry: CountryCode) => {
    // We'll need to fetch the config for the manual country
    fetch('/api/geo-detect/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ country: newCountry })
    })
      .then(response => response.json())
      .then((config: LocalizationConfig) => {
        setCountry(newCountry)
        setConfig(config)
        setConfidence(1.0) // Manual selection has highest confidence
        setSource('manual')
        setError(null)

        // Store manual selection
        localStorage.setItem('redcreativa-geo-detection', JSON.stringify({
          country: newCountry,
          config,
          timestamp: Date.now(),
          confidence: 1.0,
          source: 'manual'
        }))

        // Also store manual preference
        localStorage.setItem('redcreativa-manual-country', newCountry)
      })
      .catch(err => {
        console.error('Failed to set manual country:', err)
        setError('Failed to update country selection')
      })
  }, [])

  /**
   * Load cached geo-detection result from storage
   */
  const loadCachedResult = useCallback(() => {
    // Check for manual country preference first
    const manualCountry = storageManager.get<CountryCode>('manual_country')
    if (manualCountry) {
      setManualCountry(manualCountry)
      return true
    }

    // Load cached detection result
    const cached = storageManager.get<GeoDetectionResult>('geo_detection')
    if (cached) {
      setCountry(cached.country)
      setConfig(cached.config)
      setConfidence(cached.confidence)
      setSource(cached.source)
      return true
    }

    return false
  }, [setManualCountry])

  // Auto-detect on mount if enabled
  useEffect(() => {
    if (autoDetect) {
      // Try to load from cache first
      const hasCached = loadCachedResult()

      // If no valid cache, perform detection
      if (!hasCached) {
        detectLocation()
      }
    }
  }, [autoDetect, loadCachedResult, detectLocation])

  return {
    country,
    config,
    isLoading,
    error,
    confidence,
    source,
    detectLocation,
    setManualCountry
  }
}

/**
 * Hook for accessing current localization context
 * Simplified version that only returns the current state
 */
export function useLocalizationContext() {
  const { country, config, isLoading } = useGeoDetection({ autoDetect: true })

  return {
    country: country || 'MX', // Default to Mexico
    config: config || {
      country: 'MX' as CountryCode,
      currency: 'MXN' as const,
      language: 'es' as const,
      locale: 'es-MX',
      timezone: 'America/Mexico_City',
      paymentMethods: ['oxxo', 'spei', 'card'],
      legalRequirements: ['lfpdppp']
    },
    isLoading
  }
}
