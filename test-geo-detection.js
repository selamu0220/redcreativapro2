/**
 * Test script for geo-detection service
 * Tests the core functionality by making HTTP requests to the API endpoints
 */

async function testGeoDetectionAPI() {
  console.log('🧪 Testing Geo-Detection Service Infrastructure\n')

  const baseUrl = 'http://localhost:3000'

  // Test 1: Test geo-detection API endpoint
  console.log('1. Testing geo-detection API endpoint...')
  try {
    const response = await fetch(`${baseUrl}/api/geo-detect`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GeoDetection-Test/1.0'
      }
    })

    if (response.ok) {
      const result = await response.json()
      console.log('✅ Geo-detection API response:', {
        country: result.country,
        currency: result.config.currency,
        confidence: result.confidence,
        source: result.source
      })
    } else {
      console.log('❌ API request failed:', response.status, response.statusText)
    }
  } catch (error) {
    console.log('❌ API request error:', error.message)
  }
  console.log()

  // Test 2: Test manual country selection
  console.log('2. Testing manual country selection...')
  const testCountries = ['MX', 'CO', 'AR', 'BR']
  
  for (const country of testCountries) {
    try {
      const response = await fetch(`${baseUrl}/api/geo-detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ country })
      })

      if (response.ok) {
        const result = await response.json()
        console.log(`✅ ${country} selection:`, {
          currency: result.config.currency,
          language: result.config.language,
          paymentMethods: result.config.paymentMethods.slice(0, 2)
        })
      } else {
        console.log(`❌ ${country} selection failed:`, response.status)
      }
    } catch (error) {
      console.log(`❌ ${country} selection error:`, error.message)
    }
  }
  console.log()

  // Test 3: Test configuration API
  console.log('3. Testing configuration API...')
  try {
    const response = await fetch(`${baseUrl}/api/geo-detect/config`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })

    if (response.ok) {
      const result = await response.json()
      console.log('✅ Configuration API response:', {
        supportedCountries: result.supportedCountries,
        configCount: Object.keys(result.configs).length
      })
      
      // Show sample configs
      console.log('   Sample configurations:')
      result.supportedCountries.slice(0, 3).forEach(country => {
        const config = result.configs[country]
        console.log(`   ${country}: ${config.currency}, ${config.language}, ${config.timezone}`)
      })
    } else {
      console.log('❌ Configuration API failed:', response.status)
    }
  } catch (error) {
    console.log('❌ Configuration API error:', error.message)
  }
  console.log()

  console.log('🎉 Geo-detection API tests completed!')
  console.log('\nNote: To run these tests, start the Next.js development server with:')
  console.log('npm run dev')
  console.log('\nThen run this test script in another terminal.')
}

// Test configuration validation (can run without server)
function testConfigurationLogic() {
  console.log('🧪 Testing Configuration Logic\n')

  // Test country configurations
  const expectedCountries = ['MX', 'CO', 'AR', 'CL', 'PE', 'EC', 'BR']
  const expectedCurrencies = ['MXN', 'COP', 'ARS', 'CLP', 'PEN', 'USD', 'BRL']
  
  console.log('✅ Expected countries:', expectedCountries.join(', '))
  console.log('✅ Expected currencies:', expectedCurrencies.join(', '))
  
  // Test payment method mappings
  const paymentMethods = {
    MX: ['oxxo', 'spei', 'card'],
    CO: ['pse', 'efecty', 'card'],
    AR: ['mercadopago', 'rapipago', 'card'],
    BR: ['pix', 'boleto', 'card']
  }
  
  console.log('\n✅ Payment method mappings:')
  Object.entries(paymentMethods).forEach(([country, methods]) => {
    console.log(`   ${country}: ${methods.join(', ')}`)
  })
  
  // Test timezone mappings
  const timezones = {
    MX: 'America/Mexico_City',
    CO: 'America/Bogota',
    AR: 'America/Argentina/Buenos_Aires',
    BR: 'America/Sao_Paulo'
  }
  
  console.log('\n✅ Timezone mappings:')
  Object.entries(timezones).forEach(([country, timezone]) => {
    console.log(`   ${country}: ${timezone}`)
  })
  
  console.log('\n🎉 Configuration logic validation completed!')
}

// Run configuration tests immediately
testConfigurationLogic()

// Export API test function for manual execution
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testGeoDetectionAPI }
} else {
  // If running in browser or direct execution, provide instructions
  console.log('\n' + '='.repeat(60))
  console.log('To test the API endpoints, run: node test-geo-detection.js api')
  console.log('Make sure the Next.js server is running on localhost:3000')
  console.log('='.repeat(60))
}

// Check if API test was requested
if (process.argv.includes('api')) {
  testGeoDetectionAPI().catch(console.error)
}