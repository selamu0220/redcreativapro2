import { NextRequest, NextResponse } from 'next/server'
import { geoDetectionService, GeoDetectionResult, CountryCode } from '@/app/lib/geo-detection'

import fs from 'fs'
import path from 'path'

// Path to configuration file (shared with admin config)
const CONFIG_FILE_PATH = path.join(process.cwd(), 'localization.config.json')

/**
 * Helper to read persistent config
 */
function readPersistentConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const data = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading config file:', error)
  }
  return null
}

/**
 * GET /api/geo-detect
 * Detect user's country and return localization configuration
 */
export async function GET(request: NextRequest) {
  try {
    // Perform geo-detection
    const result: GeoDetectionResult = await geoDetectionService.detectCountry(request)

    // Check for persistent overrides
    const configOverrides = readPersistentConfig()
    if (configOverrides?.taxRates && result.country && configOverrides.taxRates[result.country]) {
      // Apply tax rate override
      result.config.taxRate = configOverrides.taxRates[result.country]
    }

    // Add debug information in development
    const debugInfo = process.env.NODE_ENV === 'development' ? {
      ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown',
      headers: {
        'cf-ipcountry': request.headers.get('cf-ipcountry'),
        'cf-connecting-ip': request.headers.get('cf-connecting-ip'),
        'x-forwarded-for': request.headers.get('x-forwarded-for'),
        'accept-language': request.headers.get('accept-language'),
        'user-agent': request.headers.get('user-agent')
      },
      cacheStats: geoDetectionService.getCacheStats(),
      performanceMetrics: geoDetectionService.getPerformanceMetrics(),
      overridesApplied: !!configOverrides
    } : undefined

    return NextResponse.json({
      ...result,
      debug: debugInfo
    })

  } catch (error) {
    console.error('Geo-detection API error:', error)

    // Return fallback result
    const fallbackResult: GeoDetectionResult = {
      country: 'MX',
      confidence: 0.1,
      source: 'ip',
      config: geoDetectionService.getLocalizationConfig('MX')
    }

    return NextResponse.json(fallbackResult, { status: 200 })
  }
}

/**
 * POST /api/geo-detect
 * Manual country override
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { country } = body as { country: string }

    if (!country || typeof country !== 'string') {
      return NextResponse.json(
        { error: 'Country code is required' },
        { status: 400 }
      )
    }

    // Validate country is supported
    if (!geoDetectionService.validateCountrySupport(country)) {
      return NextResponse.json(
        { error: 'Country not supported' },
        { status: 400 }
      )
    }

    // Get configuration for the country
    const config = geoDetectionService.getLocalizationConfig(country)

    const result: GeoDetectionResult = {
      country,
      confidence: 1.0,
      source: 'manual',
      config
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Manual country selection error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
