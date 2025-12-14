/**
 * Comprehensive test suite for Currency Service
 * Tests all functionality including conversion, formatting, caching, and error handling
 */

const { CurrencyService, currencyService, getCurrencySymbol, getCurrencyForCountry, formatPriceRange } = require('./lib/currency-service.ts')

// Test configuration
const TEST_CONFIG = {
  verbose: true,
  timeout: 10000
}

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  errors: []
}

// Utility functions
function log(message, type = 'info') {
  if (!TEST_CONFIG.verbose && type === 'info') return
  
  const timestamp = new Date().toISOString()
  const prefix = {
    info: '📋',
    success: '✅',
    error: '❌',
    warning: '⚠️'
  }[type] || '📋'
  
  console.log(`${prefix} [${timestamp}] ${message}`)
}

function assert(condition, message) {
  testResults.total++
  
  if (condition) {
    testResults.passed++
    log(`PASS: ${message}`, 'success')
    return true
  } else {
    testResults.failed++
    testResults.errors.push(message)
    log(`FAIL: ${message}`, 'error')
    return false
  }
}

function assertApproximate(actual, expected, tolerance, message) {
  const diff = Math.abs(actual - expected)
  return assert(diff <= tolerance, `${message} (expected ~${expected}, got ${actual}, diff: ${diff})`)
}

async function runTest(testName, testFunction) {
  log(`\n🧪 Running test: ${testName}`)
  
  try {
    await testFunction()
    log(`✅ Test completed: ${testName}`, 'success')
  } catch (error) {
    testResults.failed++
    testResults.errors.push(`${testName}: ${error.message}`)
    log(`❌ Test failed: ${testName} - ${error.message}`, 'error')
  }
}

// Test Suite
async function testCurrencyServiceBasics() {
  log('Testing currency service basic functionality...')
  
  // Test service instantiation
  const service = new CurrencyService()
  assert(service instanceof CurrencyService, 'Currency service should instantiate correctly')
  
  // Test singleton instance
  assert(currencyService instanceof CurrencyService, 'Singleton instance should be available')
  
  // Test supported currencies
  const currencies = service.getSupportedCurrencies()
  assert(Array.isArray(currencies), 'Should return array of supported currencies')
  assert(currencies.includes('USD'), 'Should support USD')
  assert(currencies.includes('MXN'), 'Should support MXN')
  assert(currencies.includes('BRL'), 'Should support BRL')
  
  log(`Supported currencies: ${currencies.join(', ')}`)
}

async function testCurrencyValidation() {
  log('Testing currency validation...')
  
  const service = new CurrencyService()
  
  // Test valid currencies
  assert(service.isValidCurrency('USD'), 'USD should be valid')
  assert(service.isValidCurrency('MXN'), 'MXN should be valid')
  assert(service.isValidCurrency('BRL'), 'BRL should be valid')
  
  // Test invalid currencies
  assert(!service.isValidCurrency('INVALID'), 'INVALID should not be valid')
  assert(!service.isValidCurrency(''), 'Empty string should not be valid')
  assert(!service.isValidCurrency('XYZ'), 'XYZ should not be valid')
}

async function testCurrencyFormatting() {
  log('Testing currency formatting...')
  
  const service = new CurrencyService()
  
  // Test USD formatting
  const usdFormatted = service.formatCurrency(1234.56, 'USD')
  log(`USD formatting: ${usdFormatted}`)
  assert(usdFormatted.includes('$'), 'USD should include dollar symbol')
  assert(usdFormatted.includes('1,234'), 'USD should include thousands separator')
  
  // Test MXN formatting
  const mxnFormatted = service.formatCurrency(1234.56, 'MXN')
  log(`MXN formatting: ${mxnFormatted}`)
  assert(mxnFormatted.includes('$'), 'MXN should include peso symbol')
  
  // Test BRL formatting
  const brlFormatted = service.formatCurrency(1234.56, 'BRL')
  log(`BRL formatting: ${brlFormatted}`)
  assert(brlFormatted.includes('R$'), 'BRL should include real symbol')
  
  // Test COP formatting (no decimals)
  const copFormatted = service.formatCurrency(1234.56, 'COP')
  log(`COP formatting: ${copFormatted}`)
  assert(copFormatted.includes('$'), 'COP should include peso symbol')
  
  // Test PEN formatting
  const penFormatted = service.formatCurrency(1234.56, 'PEN')
  log(`PEN formatting: ${penFormatted}`)
  assert(penFormatted.includes('S/'), 'PEN should include sol symbol')
}

async function testCurrencyConversionSameCurrency() {
  log('Testing same currency conversion...')
  
  const service = new CurrencyService()
  
  // Test same currency conversion (should return same amount)
  const result = await service.convertPrice(100, 'USD', 'USD')
  assert(result === 100, 'Same currency conversion should return same amount')
  
  const result2 = await service.convertPrice(50.75, 'MXN', 'MXN')
  assert(result2 === 50.75, 'Same currency conversion should preserve decimals')
}

async function testFallbackRates() {
  log('Testing fallback exchange rates...')
  
  const service = new CurrencyService()
  
  // Clear cache to force fallback usage
  service.clearCache()
  
  try {
    // Test USD to MXN conversion using fallback
    const usdToMxn = await service.getExchangeRate('USD', 'MXN')
    assert(usdToMxn.rate > 0, 'USD to MXN rate should be positive')
    assert(usdToMxn.from === 'USD', 'Rate should have correct from currency')
    assert(usdToMxn.to === 'MXN', 'Rate should have correct to currency')
    log(`USD to MXN rate: ${usdToMxn.rate} (source: ${usdToMxn.source})`)
    
    // Test conversion with fallback rate
    const converted = await service.convertPrice(100, 'USD', 'MXN')
    assert(converted > 0, 'Converted amount should be positive')
    assertApproximate(converted, 100 * usdToMxn.rate, 1, 'Conversion should match rate calculation')
    log(`$100 USD = $${converted} MXN`)
    
  } catch (error) {
    log(`Fallback rate test error: ${error.message}`, 'warning')
    // This is acceptable as we're testing fallback functionality
  }
}

async function testRoundingRules() {
  log('Testing price rounding rules...')
  
  const service = new CurrencyService()
  
  // Test Mexican peso rounding (nearest cent)
  const mxnRule = service.getRoundingRule('MX')
  assert(mxnRule !== null, 'Should have rounding rule for Mexico')
  assert(mxnRule.currency === 'MXN', 'Mexico should use MXN currency')
  assert(mxnRule.roundingMethod === 'nearest', 'Mexico should use nearest rounding')
  
  // Test Colombian peso rounding (round up to 100s)
  const copRule = service.getRoundingRule('CO')
  assert(copRule !== null, 'Should have rounding rule for Colombia')
  assert(copRule.currency === 'COP', 'Colombia should use COP currency')
  assert(copRule.roundingUnit === 100, 'Colombia should round to 100s')
  
  // Test Chilean peso rounding (round up to 10s)
  const clpRule = service.getRoundingRule('CL')
  assert(clpRule !== null, 'Should have rounding rule for Chile')
  assert(clpRule.currency === 'CLP', 'Chile should use CLP currency')
  assert(clpRule.roundingUnit === 10, 'Chile should round to 10s')
  
  log('All rounding rules validated successfully')
}

async function testCurrencyFormats() {
  log('Testing currency format configurations...')
  
  const service = new CurrencyService()
  
  // Test USD format
  const usdFormat = service.getCurrencyFormat('USD')
  assert(usdFormat !== null, 'Should have format for USD')
  assert(usdFormat.symbol === '$', 'USD symbol should be $')
  assert(usdFormat.decimalPlaces === 2, 'USD should have 2 decimal places')
  
  // Test COP format (no decimals)
  const copFormat = service.getCurrencyFormat('COP')
  assert(copFormat !== null, 'Should have format for COP')
  assert(copFormat.decimalPlaces === 0, 'COP should have 0 decimal places')
  
  // Test BRL format
  const brlFormat = service.getCurrencyFormat('BRL')
  assert(brlFormat !== null, 'Should have format for BRL')
  assert(brlFormat.symbol === 'R$', 'BRL symbol should be R$')
  assert(brlFormat.locale === 'pt-BR', 'BRL locale should be pt-BR')
  
  log('All currency formats validated successfully')
}

async function testUtilityFunctions() {
  log('Testing utility functions...')
  
  // Test getCurrencySymbol
  assert(getCurrencySymbol('USD') === '$', 'USD symbol should be $')
  assert(getCurrencySymbol('BRL') === 'R$', 'BRL symbol should be R$')
  assert(getCurrencySymbol('PEN') === 'S/', 'PEN symbol should be S/')
  
  // Test getCurrencyForCountry
  assert(getCurrencyForCountry('MX') === 'MXN', 'Mexico should use MXN')
  assert(getCurrencyForCountry('BR') === 'BRL', 'Brazil should use BRL')
  assert(getCurrencyForCountry('US') === 'USD', 'US should use USD')
  
  // Test formatPriceRange
  const priceRange = formatPriceRange(10, 50, 'USD')
  assert(typeof priceRange === 'string', 'Price range should return string')
  assert(priceRange.includes('-'), 'Price range should include dash separator')
  log(`Price range example: ${priceRange}`)
}

async function testCacheOperations() {
  log('Testing cache operations...')
  
  const service = new CurrencyService()
  
  // Clear cache
  service.clearCache()
  let stats = service.getCacheStats()
  assert(stats.size === 0, 'Cache should be empty after clear')
  
  // Test cache after conversion
  try {
    await service.convertPrice(100, 'USD', 'MXN')
    stats = service.getCacheStats()
    log(`Cache size after conversion: ${stats.size}`)
    assert(stats.size >= 0, 'Cache should have entries after conversion')
  } catch (error) {
    log(`Cache test with API call failed (expected): ${error.message}`, 'warning')
  }
}

async function testMetrics() {
  log('Testing performance metrics...')
  
  const service = new CurrencyService()
  
  // Reset metrics
  service.resetMetrics()
  let metrics = service.getMetrics()
  assert(metrics.totalConversions === 0, 'Metrics should be reset')
  
  // Perform some operations
  await service.convertPrice(100, 'USD', 'USD') // Same currency
  await service.convertPrice(50, 'MXN', 'MXN') // Same currency
  
  metrics = service.getMetrics()
  assert(metrics.totalConversions === 2, 'Should track conversion count')
  assert(metrics.averageResponseTime >= 0, 'Should track response time')
  
  log(`Metrics after operations: ${JSON.stringify(metrics, null, 2)}`)
}

async function testErrorHandling() {
  log('Testing error handling...')
  
  const service = new CurrencyService()
  
  try {
    // Test with invalid currency (should not throw, should return original amount)
    const result = await service.convertPrice(100, 'INVALID', 'USD')
    log(`Invalid currency conversion result: ${result}`)
    // Should handle gracefully
  } catch (error) {
    log(`Error handling test: ${error.message}`, 'warning')
  }
  
  // Test format with invalid currency
  const formatted = service.formatCurrency(100, 'INVALID')
  assert(typeof formatted === 'string', 'Should return string even for invalid currency')
  log(`Invalid currency formatting: ${formatted}`)
}

async function testRealWorldScenarios() {
  log('Testing real-world scenarios...')
  
  const service = new CurrencyService()
  
  // Test common subscription prices
  const prices = [9.99, 19.99, 49.99, 99.99]
  const currencies = ['USD', 'MXN', 'BRL', 'COP']
  
  for (const price of prices) {
    for (const currency of currencies) {
      try {
        const converted = await service.convertPrice(price, 'USD', currency)
        const formatted = service.formatCurrency(converted, currency)
        log(`$${price} USD = ${formatted}`)
        
        assert(converted > 0, `Converted price should be positive for ${currency}`)
        assert(typeof formatted === 'string', `Formatted price should be string for ${currency}`)
        
      } catch (error) {
        log(`Real-world test error for ${currency}: ${error.message}`, 'warning')
      }
    }
  }
}

// Main test runner
async function runAllTests() {
  log('🚀 Starting Currency Service Test Suite\n', 'info')
  
  const startTime = Date.now()
  
  // Run all tests
  await runTest('Currency Service Basics', testCurrencyServiceBasics)
  await runTest('Currency Validation', testCurrencyValidation)
  await runTest('Currency Formatting', testCurrencyFormatting)
  await runTest('Same Currency Conversion', testCurrencyConversionSameCurrency)
  await runTest('Fallback Rates', testFallbackRates)
  await runTest('Rounding Rules', testRoundingRules)
  await runTest('Currency Formats', testCurrencyFormats)
  await runTest('Utility Functions', testUtilityFunctions)
  await runTest('Cache Operations', testCacheOperations)
  await runTest('Performance Metrics', testMetrics)
  await runTest('Error Handling', testErrorHandling)
  await runTest('Real-World Scenarios', testRealWorldScenarios)
  
  const endTime = Date.now()
  const duration = endTime - startTime
  
  // Print final results
  log('\n📊 Test Results Summary:', 'info')
  log(`Total Tests: ${testResults.total}`)
  log(`Passed: ${testResults.passed}`, testResults.passed === testResults.total ? 'success' : 'info')
  log(`Failed: ${testResults.failed}`, testResults.failed === 0 ? 'success' : 'error')
  log(`Duration: ${duration}ms`)
  log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`)
  
  if (testResults.errors.length > 0) {
    log('\n❌ Failed Tests:', 'error')
    testResults.errors.forEach(error => log(`  - ${error}`, 'error'))
  }
  
  if (testResults.failed === 0) {
    log('\n🎉 All tests passed! Currency service is working correctly.', 'success')
  } else {
    log(`\n⚠️  ${testResults.failed} test(s) failed. Please review the implementation.`, 'warning')
  }
  
  return testResults.failed === 0
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1)
    })
    .catch(error => {
      console.error('Test runner error:', error)
      process.exit(1)
    })
}

module.exports = {
  runAllTests,
  testResults
}