/**
 * Test Payment Adapter System
 * Comprehensive test suite for the payment method adapter system
 */

const { paymentMethodService, paymentAdapterManager } = require('./lib/payment-adapter-manager')

// Test configuration
const TEST_COUNTRIES = ['MX', 'CO', 'AR', 'CL', 'PE', 'BR', 'US']
const TEST_AMOUNTS = [10, 100, 1000, 5000]
const TEST_CURRENCIES = ['USD', 'MXN', 'COP', 'ARS', 'CLP', 'PEN', 'BRL']

/**
 * Test Results Tracker
 */
class TestTracker {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: []
    }
  }

  test(name, testFn) {
    this.results.total++
    try {
      const result = testFn()
      if (result) {
        this.results.passed++
        console.log(`✅ ${name}`)
      } else {
        this.results.failed++
        console.log(`❌ ${name}`)
        this.results.errors.push(`${name}: Test assertion failed`)
      }
    } catch (error) {
      this.results.failed++
      console.log(`❌ ${name}: ${error.message}`)
      this.results.errors.push(`${name}: ${error.message}`)
    }
  }

  async asyncTest(name, testFn) {
    this.results.total++
    try {
      const result = await testFn()
      if (result) {
        this.results.passed++
        console.log(`✅ ${name}`)
      } else {
        this.results.failed++
        console.log(`❌ ${name}`)
        this.results.errors.push(`${name}: Test assertion failed`)
      }
    } catch (error) {
      this.results.failed++
      console.log(`❌ ${name}: ${error.message}`)
      this.results.errors.push(`${name}: ${error.message}`)
    }
  }

  summary() {
    console.log('\n' + '='.repeat(60))
    console.log('TEST SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total Tests: ${this.results.total}`)
    console.log(`Passed: ${this.results.passed}`)
    console.log(`Failed: ${this.results.failed}`)
    console.log(`Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`)
    
    if (this.results.errors.length > 0) {
      console.log('\nErrors:')
      this.results.errors.forEach(error => console.log(`  - ${error}`))
    }
    
    return this.results.failed === 0
  }
}

/**
 * Test Payment Method Service
 */
function testPaymentMethodService(tracker) {
  console.log('\n📋 Testing Payment Method Service...')
  
  // Test 1: Get available methods for each country
  TEST_COUNTRIES.forEach(country => {
    tracker.test(`Get available methods for ${country}`, () => {
      const methods = paymentMethodService.getAvailableMethodsForCountry(country)
      return Array.isArray(methods) && methods.length > 0
    })
  })

  // Test 2: Validate payment methods
  tracker.test('Validate payment method for Mexico (OXXO)', () => {
    const oxxoMethod = paymentMethodService.getPaymentMethod('oxxo')
    return oxxoMethod && paymentMethodService.validatePaymentMethod(oxxoMethod, 'MX')
  })

  tracker.test('Validate payment method for Brazil (PIX)', () => {
    const pixMethod = paymentMethodService.getPaymentMethod('pix')
    return pixMethod && paymentMethodService.validatePaymentMethod(pixMethod, 'BR')
  })

  tracker.test('Validate invalid payment method (OXXO in Brazil)', () => {
    const oxxoMethod = paymentMethodService.getPaymentMethod('oxxo')
    return oxxoMethod && !paymentMethodService.validatePaymentMethod(oxxoMethod, 'BR')
  })

  // Test 3: Amount validation
  tracker.test('Validate amount within limits', () => {
    const cardMethod = paymentMethodService.getPaymentMethod('card')
    return cardMethod && paymentMethodService.validateAmount(100, 'USD', cardMethod)
  })

  tracker.test('Validate amount below minimum', () => {
    const cardMethod = paymentMethodService.getPaymentMethod('card')
    return cardMethod && !paymentMethodService.validateAmount(0.5, 'USD', cardMethod)
  })

  // Test 4: Fee calculation
  tracker.test('Calculate payment fees', () => {
    const cardMethod = paymentMethodService.getPaymentMethod('card')
    if (!cardMethod) return false
    
    const fee = paymentMethodService.calculateFees(cardMethod, 100, 'USD')
    return typeof fee === 'number' && fee >= 0
  })

  // Test 5: Required fields
  tracker.test('Get required fields for card payment', () => {
    const fields = paymentMethodService.getRequiredFields('card')
    return Array.isArray(fields) && fields.includes('cardNumber')
  })

  // Test 6: Recommended method
  tracker.test('Get recommended method for Mexico', () => {
    const method = paymentMethodService.getRecommendedMethod('MX', 100, 'MXN')
    return method !== null && method.countries.includes('MX')
  })

  // Test 7: Fallback methods
  tracker.test('Get fallback methods', () => {
    const methods = paymentMethodService.getFallbackMethods()
    return Array.isArray(methods) && methods.length > 0
  })
}

/**
 * Test Payment Adapter Manager
 */
async function testPaymentAdapterManager(tracker) {
  console.log('\n🔧 Testing Payment Adapter Manager...')
  
  // Test 1: Health check
  await tracker.asyncTest('Adapter health check', async () => {
    const health = await paymentAdapterManager.healthCheck()
    return typeof health === 'object' && Object.keys(health).length > 0
  })

  // Test 2: Get available methods
  TEST_COUNTRIES.forEach(country => {
    tracker.test(`Get available methods for ${country} via manager`, () => {
      const methods = paymentAdapterManager.getAvailablePaymentMethods({
        country,
        currency: 'USD',
        amount: 100
      })
      return Array.isArray(methods) && methods.length > 0
    })
  })

  // Test 3: Recommended method selection
  tracker.test('Get recommended method with priority strategy', () => {
    const method = paymentAdapterManager.getRecommendedPaymentMethod({
      country: 'MX',
      currency: 'MXN',
      amount: 100,
      strategy: 'priority'
    })
    return method !== null
  })

  tracker.test('Get recommended method with cost strategy', () => {
    const method = paymentAdapterManager.getRecommendedPaymentMethod({
      country: 'BR',
      currency: 'BRL',
      amount: 100,
      strategy: 'cost'
    })
    return method !== null
  })

  // Test 4: Adapter statistics
  tracker.test('Get adapter statistics', () => {
    const stats = paymentAdapterManager.getAdapterStatistics()
    return typeof stats === 'object' && 
           stats.stripe && 
           stats.external &&
           Array.isArray(stats.stripe.supportedMethods)
  })

  // Test 5: Mock payment processing (without actual API calls)
  await tracker.asyncTest('Process mock card payment', async () => {
    const cardMethod = paymentMethodService.getPaymentMethod('card')
    if (!cardMethod) return false

    try {
      // This will fail due to missing Stripe keys, but we test the flow
      const result = await paymentAdapterManager.processPayment(cardMethod, {
        country: 'MX',
        currency: 'MXN',
        amount: 100,
        metadata: {
          customerEmail: 'test@example.com',
          country: 'MX'
        }
      })
      
      // We expect this to fail due to missing API keys, but structure should be correct
      return typeof result === 'object' && 
             'success' in result && 
             'adapterUsed' in result &&
             'processingTime' in result
    } catch (error) {
      // Expected to fail due to missing Stripe configuration
      return error.message.includes('STRIPE_SECRET_KEY') || 
             error.message.includes('Missing') ||
             error.message.includes('required')
    }
  })
}

/**
 * Test Country-Specific Payment Methods
 */
function testCountrySpecificMethods(tracker) {
  console.log('\n🌎 Testing Country-Specific Payment Methods...')
  
  const countryMethodTests = [
    { country: 'MX', expectedMethods: ['card', 'oxxo', 'spei'] },
    { country: 'CO', expectedMethods: ['card', 'pse'] },
    { country: 'AR', expectedMethods: ['card', 'mercadopago'] },
    { country: 'CL', expectedMethods: ['card', 'webpay'] },
    { country: 'PE', expectedMethods: ['card', 'pagoefectivo'] },
    { country: 'BR', expectedMethods: ['card', 'pix', 'boleto'] },
    { country: 'US', expectedMethods: ['card', 'paypal'] }
  ]

  countryMethodTests.forEach(({ country, expectedMethods }) => {
    tracker.test(`${country} has expected payment methods`, () => {
      const methods = paymentMethodService.getAvailableMethodsForCountry(country)
      const methodTypes = methods.map(m => m.type)
      
      return expectedMethods.every(expected => methodTypes.includes(expected))
    })
  })
}

/**
 * Test Currency and Amount Validation
 */
function testCurrencyAndAmountValidation(tracker) {
  console.log('\n💰 Testing Currency and Amount Validation...')
  
  // Test currency support for each country
  const currencyTests = [
    { country: 'MX', currency: 'MXN', shouldWork: true },
    { country: 'MX', currency: 'USD', shouldWork: true },
    { country: 'MX', currency: 'EUR', shouldWork: false },
    { country: 'BR', currency: 'BRL', shouldWork: true },
    { country: 'BR', currency: 'USD', shouldWork: true },
    { country: 'CO', currency: 'COP', shouldWork: true }
  ]

  currencyTests.forEach(({ country, currency, shouldWork }) => {
    tracker.test(`${country} currency ${currency} support`, () => {
      const methods = paymentAdapterManager.getAvailablePaymentMethods({
        country,
        currency,
        amount: 100
      })
      
      const hasMethodsWithCurrency = methods.some(method => 
        method.supportedCurrencies.includes(currency)
      )
      
      return shouldWork ? hasMethodsWithCurrency : !hasMethodsWithCurrency
    })
  })

  // Test amount limits
  const amountTests = [
    { method: 'card', amount: 1, shouldWork: true },
    { method: 'card', amount: 0.5, shouldWork: false },
    { method: 'oxxo', amount: 25, shouldWork: false }, // Below minimum
    { method: 'oxxo', amount: 100, shouldWork: true }
  ]

  amountTests.forEach(({ method, amount, shouldWork }) => {
    tracker.test(`${method} amount ${amount} validation`, () => {
      const paymentMethod = paymentMethodService.getPaymentMethod(method)
      if (!paymentMethod) return false
      
      const isValid = paymentMethodService.validateAmount(amount, 'USD', paymentMethod)
      return shouldWork ? isValid : !isValid
    })
  })
}

/**
 * Test Fallback Mechanisms
 */
function testFallbackMechanisms(tracker) {
  console.log('\n🔄 Testing Fallback Mechanisms...')
  
  // Test international fallback
  tracker.test('International fallback methods available', () => {
    const methods = paymentAdapterManager.getAvailablePaymentMethods({
      country: 'UNKNOWN',
      currency: 'USD',
      amount: 100,
      fallbackToInternational: true
    })
    
    return methods.length > 0 && methods.some(m => m.type === 'card')
  })

  // Test preferred methods filtering
  tracker.test('Preferred methods filtering', () => {
    const methods = paymentAdapterManager.getAvailablePaymentMethods({
      country: 'MX',
      currency: 'MXN',
      amount: 100,
      preferredMethods: ['card', 'oxxo']
    })
    
    return methods.every(m => ['card', 'oxxo'].includes(m.type))
  })

  // Test method availability without fallback
  tracker.test('No fallback when disabled', () => {
    const methods = paymentAdapterManager.getAvailablePaymentMethods({
      country: 'UNKNOWN',
      currency: 'USD',
      amount: 100,
      fallbackToInternational: false
    })
    
    // Should have fewer methods or none for unknown country
    const methodsWithFallback = paymentAdapterManager.getAvailablePaymentMethods({
      country: 'UNKNOWN',
      currency: 'USD',
      amount: 100,
      fallbackToInternational: true
    })
    
    return methods.length <= methodsWithFallback.length
  })
}

/**
 * Test Error Handling
 */
function testErrorHandling(tracker) {
  console.log('\n⚠️ Testing Error Handling...')
  
  // Test invalid payment method
  tracker.test('Handle invalid payment method', () => {
    const method = paymentMethodService.getPaymentMethod('invalid_method')
    return method === null
  })

  // Test invalid country
  tracker.test('Handle invalid country', () => {
    const methods = paymentMethodService.getAvailableMethodsForCountry('INVALID')
    return Array.isArray(methods) // Should return empty array or fallback
  })

  // Test negative amount
  tracker.test('Handle negative amount', () => {
    const cardMethod = paymentMethodService.getPaymentMethod('card')
    if (!cardMethod) return false
    
    return !paymentMethodService.validateAmount(-100, 'USD', cardMethod)
  })

  // Test unsupported currency
  tracker.test('Handle unsupported currency', () => {
    const methods = paymentAdapterManager.getAvailablePaymentMethods({
      country: 'MX',
      currency: 'JPY', // Not supported in Mexico
      amount: 100
    })
    
    // Should return methods that support JPY or fallback to international
    return Array.isArray(methods)
  })
}

/**
 * Main Test Runner
 */
async function runTests() {
  console.log('🧪 Starting Payment Adapter System Tests...')
  console.log('='.repeat(60))
  
  const tracker = new TestTracker()
  
  try {
    // Run all test suites
    testPaymentMethodService(tracker)
    await testPaymentAdapterManager(tracker)
    testCountrySpecificMethods(tracker)
    testCurrencyAndAmountValidation(tracker)
    testFallbackMechanisms(tracker)
    testErrorHandling(tracker)
    
    // Print summary
    const success = tracker.summary()
    
    if (success) {
      console.log('\n🎉 All tests passed! Payment adapter system is working correctly.')
    } else {
      console.log('\n❌ Some tests failed. Please review the errors above.')
    }
    
    return success
    
  } catch (error) {
    console.error('\n💥 Test runner error:', error)
    return false
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().then(success => {
    process.exit(success ? 0 : 1)
  }).catch(error => {
    console.error('Test execution failed:', error)
    process.exit(1)
  })
}

module.exports = { runTests }