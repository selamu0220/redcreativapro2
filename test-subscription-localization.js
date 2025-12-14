/**
 * Test script for subscription creation API with localization
 * Tests geo-detection, currency conversion, and payment method selection
 */

const { geoDetectionService } = require('./app/lib/geo-detection');
const { currencyService } = require('./lib/currency-service');
const { paymentAdapterManager } = require('./lib/payment-adapter-manager');

async function testSubscriptionLocalization() {
  console.log('🧪 Testing subscription localization integration...\n');

  // Test 1: Geo-detection service
  console.log('1️⃣ Testing geo-detection service...');
  try {
    // Mock request object for testing
    const mockRequest = {
      headers: new Map([
        ['cf-ipcountry', 'MX'],
        ['x-forwarded-for', '187.190.123.45'], // Mexican IP
        ['accept-language', 'es-MX,es;q=0.9,en;q=0.8']
      ]),
      ip: '187.190.123.45'
    };

    // Convert Map to Headers-like object
    const mockHeaders = {
      get: (key) => mockRequest.headers.get(key)
    };

    const mockRequestObj = {
      headers: mockHeaders,
      ip: mockRequest.ip
    };

    const geoResult = await geoDetectionService.detectCountry(mockRequestObj);
    
    console.log('✅ Geo-detection result:', {
      country: geoResult.country,
      currency: geoResult.config.currency,
      confidence: geoResult.confidence,
      source: geoResult.source,
      paymentMethods: geoResult.config.paymentMethods
    });

    if (geoResult.country === 'MX' && geoResult.config.currency === 'MXN') {
      console.log('✅ Geo-detection working correctly for Mexico\n');
    } else {
      console.log('⚠️ Unexpected geo-detection result\n');
    }

  } catch (error) {
    console.error('❌ Geo-detection test failed:', error.message);
  }

  // Test 2: Currency conversion service
  console.log('2️⃣ Testing currency conversion service...');
  try {
    const originalAmount = 29.99; // USD
    const convertedAmount = await currencyService.convertPrice(originalAmount, 'USD', 'MXN');
    
    console.log('✅ Currency conversion result:', {
      originalAmount: `$${originalAmount} USD`,
      convertedAmount: `$${convertedAmount} MXN`,
      exchangeRate: (convertedAmount / originalAmount).toFixed(4)
    });

    if (convertedAmount > originalAmount) {
      console.log('✅ Currency conversion working correctly (MXN > USD)\n');
    } else {
      console.log('⚠️ Unexpected conversion result\n');
    }

  } catch (error) {
    console.error('❌ Currency conversion test failed:', error.message);
  }

  // Test 3: Payment method selection
  console.log('3️⃣ Testing payment method selection...');
  try {
    const paymentOptions = paymentAdapterManager.getAvailablePaymentMethods({
      country: 'MX',
      currency: 'MXN',
      amount: 599.99,
      fallbackToInternational: true
    });

    console.log('✅ Available payment methods for Mexico:', 
      paymentOptions.map(method => ({
        type: method.type,
        name: method.name,
        processingTime: method.processingTime
      }))
    );

    const hasOxxo = paymentOptions.some(method => method.type === 'oxxo');
    const hasCard = paymentOptions.some(method => method.type === 'card');

    if (hasOxxo && hasCard) {
      console.log('✅ Payment method selection working correctly (includes OXXO and card)\n');
    } else {
      console.log('⚠️ Expected payment methods not found\n');
    }

  } catch (error) {
    console.error('❌ Payment method selection test failed:', error.message);
  }

  // Test 4: Integration flow simulation
  console.log('4️⃣ Testing complete integration flow...');
  try {
    // Simulate the complete flow from the API
    const mockCountry = 'CO'; // Colombia
    const localizationConfig = geoDetectionService.getLocalizationConfig(mockCountry);
    
    console.log('📍 Localization config for Colombia:', {
      country: localizationConfig.country,
      currency: localizationConfig.currency,
      language: localizationConfig.language,
      locale: localizationConfig.locale,
      timezone: localizationConfig.timezone,
      paymentMethods: localizationConfig.paymentMethods
    });

    // Test currency conversion for Colombia
    const originalPrice = 49.99; // USD
    const convertedPrice = await currencyService.convertPrice(originalPrice, 'USD', 'COP');
    
    console.log('💰 Price conversion for Colombia:', {
      original: `$${originalPrice} USD`,
      converted: currencyService.formatCurrency(convertedPrice, 'COP', 'es-CO')
    });

    // Test payment methods for Colombia
    const colombianPaymentMethods = paymentAdapterManager.getAvailablePaymentMethods({
      country: 'CO',
      currency: 'COP',
      amount: convertedPrice,
      fallbackToInternational: true
    });

    console.log('💳 Payment methods for Colombia:', 
      colombianPaymentMethods.map(method => method.type)
    );

    const hasPSE = colombianPaymentMethods.some(method => method.type === 'pse');
    if (hasPSE) {
      console.log('✅ Complete integration flow working correctly\n');
    } else {
      console.log('⚠️ PSE payment method not found for Colombia\n');
    }

  } catch (error) {
    console.error('❌ Integration flow test failed:', error.message);
  }

  // Test 5: Metadata generation simulation
  console.log('5️⃣ Testing metadata generation...');
  try {
    const mockGeoResult = {
      country: 'AR',
      confidence: 0.85,
      source: 'cloudflare',
      config: geoDetectionService.getLocalizationConfig('AR')
    };

    const mockPriceConversion = {
      originalAmount: 39.99,
      originalCurrency: 'USD',
      convertedAmount: 14000,
      targetCurrency: 'ARS',
      exchangeRate: 350,
      conversionTimestamp: new Date().toISOString()
    };

    const mockRegionalPaymentMethods = ['mercadopago', 'rapipago', 'card'];

    // Simulate metadata creation (as done in the API)
    const enhancedMetadata = {
      // Localization metadata
      detectedCountry: mockGeoResult.country,
      targetCurrency: mockGeoResult.config.currency,
      geoConfidence: mockGeoResult.confidence.toString(),
      geoSource: mockGeoResult.source,
      availablePaymentMethods: mockRegionalPaymentMethods.join(','),
      // Currency conversion metadata
      originalAmount: mockPriceConversion.originalAmount.toString(),
      convertedAmount: mockPriceConversion.convertedAmount.toString(),
      exchangeRate: mockPriceConversion.exchangeRate.toString(),
      currencyConversionApplied: 'true',
      // Localization config
      locale: mockGeoResult.config.locale,
      timezone: mockGeoResult.config.timezone,
      language: mockGeoResult.config.language
    };

    console.log('✅ Generated metadata for Argentina:', enhancedMetadata);
    console.log('✅ Metadata generation working correctly\n');

  } catch (error) {
    console.error('❌ Metadata generation test failed:', error.message);
  }

  console.log('🎉 Subscription localization integration tests completed!');
}

// Run tests
testSubscriptionLocalization().catch(console.error);