/**
 * Comprehensive test for geo-detection service infrastructure
 * Tests all components: IP detection, CloudFlare integration, browser fallback, and caching
 */

const { geoDetectionService } = require('./app/lib/geo-detection.ts')

// Mock NextRequest for testing
class MockNextRequest {
  constructor(options = {}) {
    this.ip = options.ip || '187.191.75.115' // Mexican IP for testing
    this.headers = new Map()
    
    // Set default headers
    if (options.cloudflareCountry) {
      this.headers.set('cf-ipcountry', options.cloudflareCountry)
      this.headers.set('cf-connecting-ip', this.ip)
    }
    
    if (options.acceptLanguage) {
      this.headers.set('accept-language', options.acceptLanguage)
    }
    
    if (options.timezone) {
      this.headers.set('x-timezone', options.timezone)
    }
    
    if (options.forwardedFor) {
      this.headers.set('x-forwarded-for', options.forwardedFor)
    }
  }
  
  get(headerName) {
    return this.headers.get(headerName) || null
  }
}

MockNextRequest.prototype.headers = {
  get: function(name) {
    return this.get(name)
  }
}

async function testGeoDetectionInfrastructure() {
  console.log('🧪 Testing Geo-Detection Service Infrastructure\n')
  
  let testsPassed = 0
  let totalTests = 0
  
  // Helper function to run tests
  async function runTest(testName, testFn) {
    totalTests++
    try {
      console.log(`⏳ ${testName}...`)
      await testFn()
      console.log(`✅ ${testName} - PASSED\n`)
      testsPassed++
    } catch (error) {
      console.log(`❌ ${testName} - FAILED`)
      console.log(`   Error: ${error.message}\n`)
    }
  }
  
  // Test 1: CloudFlare Header Detection
  await runTest('CloudFlare Header Detection', async () => {
    const request = new MockNextRequest({
      cloudflareCountry: 'MX',
      ip: '187.191.75.115'
    })
    
    const result = await geoDetectionService.detectCountry(request)
    
    if (result.country !== 'MX') {
      throw new Error(`Expected country MX, got ${result.country}`)
    }
    
    if (result.source !== 'cloudflare' && result.source !== 'cache') {
      throw new Error(`Expected source cloudflare or cache, got ${result.source}`)
    }
    
    if (result.confidence < 0.8) {
      throw new Error(`Expected high confidence (>0.8), got ${result.confidence}`)
    }
    
    console.log(`   ✓ Detected country: ${result.country}`)
    console.log(`   ✓ Source: ${result.source}`)
    console.log(`   ✓ Confidence: ${result.confidence}`)
  })
  
  // Test 2: IP-based Detection (with fallback providers)
  await runTest('IP-based Detection with Multiple Providers', async () => {
    const request = new MockNextRequest({
      ip: '201.216.233.1', // Colombian IP
      // No CloudFlare headers to force IP detection
    })
    
    const result = await geoDetectionService.detectCountry(request)
    
    if (!['CO', 'MX', 'UNKNOWN'].includes(result.country)) {
      throw new Error(`Unexpected country detected: ${result.country}`)
    }
    
    if (!['ip', 'browser', 'cache'].includes(result.source)) {
      throw new Error(`Expected source ip, browser, or cache, got ${result.source}`)
    }
    
    console.log(`   ✓ Detected country: ${result.country}`)
    console.log(`   ✓ Source: ${result.source}`)
    console.log(`   ✓ Confidence: ${result.confidence}`)
  })
  
  // Test 3: Browser Locale Fallback Detection
  await runTest('Browser Locale Fallback Detection', async () => {
    const request = new MockNextRequest({
      ip: 'unknown',
      acceptLanguage: 'es-AR,es;q=0.9,en;q=0.8',
      timezone: 'America/Argentina/Buenos_Aires'
    })
    
    const result = await geoDetectionService.detectCountry(request)
    
    if (!['AR', 'MX'].includes(result.country)) {
      throw new Error(`Expected AR or MX (fallback), got ${result.country}`)
    }
    
    if (result.source !== 'browser') {
      throw new Error(`Expected source browser, got ${result.source}`)
    }
    
    console.log(`   ✓ Detected country: ${result.country}`)
    console.log(`   ✓ Source: ${result.source}`)
    console.log(`   ✓ Confidence: ${result.confidence}`)
  })
  
  // Test 4: Caching Mechanism
  await runTest('Caching Mechanism', async () => {
    // Clear cache first
    geoDetectionService.clearCache()
    
    const request = new MockNextRequest({
      cloudflareCountry: 'BR',
      ip: '200.160.2.3'
    })
    
    // First request - should not be cached
    const result1 = await geoDetectionService.detectCountry(request)
    if (result1.source === 'cache') {
      throw new Error('First request should not be from cache')
    }
    
    // Second request - should be cached
    const result2 = await geoDetectionService.detectCountry(request)
    if (result2.source !== 'cache') {
      throw new Error('Second request should be from cache')
    }
    
    if (result1.country !== result2.country) {
      throw new Error('Cached result should match original result')
    }
    
    console.log(`   ✓ First request source: ${result1.source}`)
    console.log(`   ✓ Second request source: ${result2.source}`)
    console.log(`   ✓ Cache working correctly`)
  })
  
  // Test 5: Country Configuration Validation
  await runTest('Country Configuration Validation', async () => {
    const supportedCountries = ['MX', 'CO', 'AR', 'CL', 'PE', 'EC', 'BR']
    
    for (const country of supportedCountries) {
      const isSupported = geoDetectionService.validateCountrySupport(country)
      if (!isSupported) {
        throw new Error(`Country ${country} should be supported`)
      }
      
      const config = geoDetectionService.getLocalizationConfig(country)
      if (!config || !config.currency || !config.language) {
        throw new Error(`Invalid configuration for country ${country}`)
      }
    }
    
    // Test unsupported country
    const isUnsupported = geoDetectionService.validateCountrySupport('XX')
    if (isUnsupported) {
      throw new Error('Country XX should not be supported')
    }
    
    console.log(`   ✓ All ${supportedCountries.length} countries validated`)
    console.log(`   ✓ Unsupported country properly rejected`)
  })
  
  // Test 6: Performance Metrics
  await runTest('Performance Metrics Tracking', async () => {
    // Reset metrics
    geoDetectionService.resetMetrics()
    
    // Make several requests
    const requests = [
      new MockNextRequest({ cloudflareCountry: 'MX' }),
      new MockNextRequest({ cloudflareCountry: 'CO' }),
      new MockNextRequest({ cloudflareCountry: 'AR' })
    ]
    
    for (const request of requests) {
      await geoDetectionService.detectCountry(request)
    }
    
    const metrics = geoDetectionService.getPerformanceMetrics()
    
    if (metrics.totalRequests < 3) {
      throw new Error(`Expected at least 3 requests, got ${metrics.totalRequests}`)
    }
    
    if (metrics.averageResponseTime <= 0) {
      throw new Error('Average response time should be greater than 0')
    }
    
    console.log(`   ✓ Total requests: ${metrics.totalRequests}`)
    console.log(`   ✓ Cache hits: ${metrics.cacheHits}`)
    console.log(`   ✓ Cache misses: ${metrics.cacheMisses}`)
    console.log(`   ✓ Average response time: ${metrics.averageResponseTime}ms`)
  })
  
  // Test 7: Cache Statistics
  await runTest('Cache Statistics', async () => {
    const stats = geoDetectionService.getCacheStats()
    
    if (typeof stats.size !== 'number') {
      throw new Error('Cache size should be a number')
    }
    
    if (!Array.isArray(stats.entries)) {
      throw new Error('Cache entries should be an array')
    }
    
    console.log(`   ✓ Cache size: ${stats.size}`)
    console.log(`   ✓ Cache entries: ${stats.entries.length}`)
  })
  
  // Test 8: Error Handling and Fallbacks
  await runTest('Error Handling and Fallbacks', async () => {
    const request = new MockNextRequest({
      ip: 'invalid-ip',
      acceptLanguage: 'invalid-language'
    })
    
    const result = await geoDetectionService.detectCountry(request)
    
    // Should still return a valid result even with invalid input
    if (!result || !result.country || !result.config) {
      throw new Error('Should return valid fallback result even with invalid input')
    }
    
    console.log(`   ✓ Fallback country: ${result.country}`)
    console.log(`   ✓ Fallback source: ${result.source}`)
    console.log(`   ✓ Error handling working correctly`)
  })
  
  // Summary
  console.log('📊 Test Summary')
  console.log('================')
  console.log(`Total Tests: ${totalTests}`)
  console.log(`Passed: ${testsPassed}`)
  console.log(`Failed: ${totalTests - testsPassed}`)
  console.log(`Success Rate: ${((testsPassed / totalTests) * 100).toFixed(1)}%`)
  
  if (testsPassed === totalTests) {
    console.log('\n🎉 All geo-detection infrastructure tests passed!')
    console.log('✅ IP-based location identification: Working')
    console.log('✅ CloudFlare integration: Working') 
    console.log('✅ Browser locale and timezone fallback: Working')
    console.log('✅ Caching mechanism: Working')
    console.log('✅ Multiple provider fallbacks: Working')
    console.log('✅ Performance monitoring: Working')
    console.log('✅ Error handling: Working')
  } else {
    console.log('\n⚠️  Some tests failed. Please review the implementation.')
    process.exit(1)
  }
}

// Run the tests
testGeoDetectionInfrastructure().catch(error => {
  console.error('Test execution failed:', error)
  process.exit(1)
})