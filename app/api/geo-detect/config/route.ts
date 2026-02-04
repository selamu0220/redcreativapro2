import { NextRequest, NextResponse } from 'next/server'
import { geoDetectionService, CountryCode } from '@/app/lib/geo-detection'

/**
 * POST /api/geo-detect/config
 * Get localization configuration for a specific country
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { country } = body

    if (!country || typeof country !== 'string') {
      return NextResponse.json(
        { error: 'Country code is required' },
        { status: 400 }
      )
    }

    // Validate country code
    const countryCode = country.toUpperCase() as CountryCode
    if (!geoDetectionService.validateCountrySupport(countryCode)) {
      return NextResponse.json(
        { error: 'Country not supported' },
        { status: 400 }
      )
    }

    // Get configuration
    const config = geoDetectionService.getLocalizationConfig(countryCode)

    return NextResponse.json(config)

  } catch (error) {
    console.error('Config API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/geo-detect/config
 * Get all supported countries and their configurations
 */
export async function GET() {
  try {
    const supportedCountries: CountryCode[] = ['MX', 'CO', 'AR', 'CL', 'PE', 'EC', 'BR']
    
    const configs = supportedCountries.reduce((acc, country) => {
      acc[country] = geoDetectionService.getLocalizationConfig(country)
      return acc
    }, {} as Record<CountryCode, any>)

    return NextResponse.json({
      supportedCountries,
      configs
    })

  } catch (error) {
    console.error('Config list API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
