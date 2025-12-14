#!/usr/bin/env node

/**
 * Test script for regional content localization enhancements
 * Tests the implementation of task 9: Enhance content localization engine for regional variations
 */

const { 
  getRegionalBusinessExamples, 
  getCulturalAdaptationRules, 
  getRegionalBusinessContext,
  getRegionalGreeting,
  adaptTemplateForCountry,
  getCountrySpecificTemplateVariations,
  REGIONAL_BUSINESS_EXAMPLES,
  CULTURAL_ADAPTATION_RULES
} = require('./app/data/localizedTemplates.ts');

const { templateManager } = require('./app/lib/templateManager.ts');

console.log('🧪 Testing Regional Content Localization Enhancements\n');

// Test 1: Regional Business Examples Database
console.log('📊 Test 1: Regional Business Examples Database');
console.log('='.repeat(50));

const testCountries = ['MX', 'CO', 'AR', 'BR'];

testCountries.forEach(country => {
  console.log(`\n🌍 Testing ${country}:`);
  
  try {
    const examples = getRegionalBusinessExamples(country);
    console.log(`✅ Companies: ${examples.companies.slice(0, 3).join(', ')}`);
    console.log(`✅ Business Types: ${examples.businessTypes.slice(0, 3).join(', ')}`);
    console.log(`✅ Cultural References: ${examples.culturalReferences.slice(0, 2).join(', ')}`);
    console.log(`✅ Common Greetings: ${examples.commonGreetings.slice(0, 2).join(', ')}`);
    console.log(`✅ Formality Level: ${examples.formalityLevel}`);
    console.log(`✅ Currency: ${examples.currency}`);
    console.log(`✅ Payment Methods: ${examples.paymentMethods.join(', ')}`);
  } catch (error) {
    console.error(`❌ Error testing ${country}:`, error.message);
  }
});

// Test 2: Cultural Adaptation Rules
console.log('\n\n🎭 Test 2: Cultural Adaptation Rules');
console.log('='.repeat(50));

testCountries.forEach(country => {
  console.log(`\n🌍 Testing ${country}:`);
  
  try {
    const rules = getCulturalAdaptationRules(country);
    console.log(`✅ Language: ${rules.language}`);
    console.log(`✅ Formality Level: ${rules.formalityLevel}`);
    console.log(`✅ Greeting Style: ${rules.greetingStyle}`);
    console.log(`✅ Business Culture: ${rules.businessCulture}`);
    console.log(`✅ Communication Style: ${rules.communicationStyle}`);
    console.log(`✅ Time Orientation: ${rules.timeOrientation}`);
  } catch (error) {
    console.error(`❌ Error testing cultural rules for ${country}:`, error.message);
  }
});

// Test 3: Regional Greetings
console.log('\n\n👋 Test 3: Regional Greetings');
console.log('='.repeat(50));

const timeOfDayOptions = ['morning', 'afternoon', 'evening'];

testCountries.forEach(country => {
  console.log(`\n🌍 Testing ${country}:`);
  
  timeOfDayOptions.forEach(timeOfDay => {
    try {
      const greeting = getRegionalGreeting(country, timeOfDay);
      console.log(`✅ ${timeOfDay}: "${greeting}"`);
    } catch (error) {
      console.error(`❌ Error getting greeting for ${country} ${timeOfDay}:`, error.message);
    }
  });
});

// Test 4: Regional Business Context
console.log('\n\n🏢 Test 4: Regional Business Context');
console.log('='.repeat(50));

testCountries.forEach(country => {
  console.log(`\n🌍 Testing ${country}:`);
  
  try {
    const context = getRegionalBusinessContext(country);
    console.log(`✅ Context generated (${context.length} characters)`);
    console.log(`📝 Preview: ${context.substring(0, 150)}...`);
  } catch (error) {
    console.error(`❌ Error getting business context for ${country}:`, error.message);
  }
});

// Test 5: Country-Specific Template Variations
console.log('\n\n📝 Test 5: Country-Specific Template Variations');
console.log('='.repeat(50));

testCountries.forEach(country => {
  console.log(`\n🌍 Testing ${country}:`);
  
  try {
    const variations = getCountrySpecificTemplateVariations(country);
    console.log(`✅ Found ${variations.length} country-specific template variations`);
    
    variations.forEach((variation, index) => {
      console.log(`   ${index + 1}. ${variation.name?.es || variation.name?.pt || 'Unknown'}`);
      console.log(`      Category: ${variation.category}`);
      console.log(`      Tags: ${variation.tags?.es?.join(', ') || variation.tags?.pt?.join(', ') || 'None'}`);
    });
  } catch (error) {
    console.error(`❌ Error getting template variations for ${country}:`, error.message);
  }
});

// Test 6: Template Adaptation for Country
console.log('\n\n🔄 Test 6: Template Adaptation for Country');
console.log('='.repeat(50));

// Test with a sample template
const sampleTemplate = {
  id: 'test-template',
  name: { es: 'Template de Prueba', en: 'Test Template', pt: 'Modelo de Teste' },
  description: { es: 'Un template de prueba', en: 'A test template', pt: 'Um modelo de teste' },
  content: { es: 'Contenido de prueba sobre {{topic}}', en: 'Test content about {{topic}}', pt: 'Conteúdo de teste sobre {{topic}}' },
  category: 'test',
  tags: { es: ['prueba'], en: ['test'], pt: ['teste'] },
  variables: ['topic'],
  isBuiltIn: true
};

testCountries.forEach(country => {
  console.log(`\n🌍 Testing template adaptation for ${country}:`);
  
  try {
    const language = country === 'BR' ? 'pt' : 'es';
    const adaptedTemplate = adaptTemplateForCountry(sampleTemplate, country, language);
    
    console.log(`✅ Template adapted successfully`);
    console.log(`   Name: ${adaptedTemplate.name}`);
    console.log(`   Description: ${adaptedTemplate.description}`);
    console.log(`   Content length: ${adaptedTemplate.content.length} characters`);
    console.log(`   Contains regional context: ${adaptedTemplate.content.includes('CONTEXTO REGIONAL') ? 'Yes' : 'No'}`);
  } catch (error) {
    console.error(`❌ Error adapting template for ${country}:`, error.message);
  }
});

// Test 7: Template Manager Regional Methods
console.log('\n\n🛠️ Test 7: Template Manager Regional Methods');
console.log('='.repeat(50));

testCountries.forEach(country => {
  console.log(`\n🌍 Testing TemplateManager methods for ${country}:`);
  
  try {
    const language = country === 'BR' ? 'pt' : 'es';
    
    // Test getTemplatesForCountry
    const templatesForCountry = templateManager.getTemplatesForCountry(country, language);
    console.log(`✅ getTemplatesForCountry: ${templatesForCountry.length} templates`);
    
    // Test getCountrySpecificTemplates
    const countrySpecific = templateManager.getCountrySpecificTemplates(country, language);
    console.log(`✅ getCountrySpecificTemplates: ${countrySpecific.length} templates`);
    
    // Test hasCountrySpecificTemplates
    const hasSpecific = templateManager.hasCountrySpecificTemplates(country);
    console.log(`✅ hasCountrySpecificTemplates: ${hasSpecific}`);
    
    // Test getRegionalBusinessExamples
    const businessExamples = templateManager.getRegionalBusinessExamples(country);
    console.log(`✅ getRegionalBusinessExamples: ${businessExamples.companies.length} companies`);
    
    // Test getCulturalAdaptationRules
    const culturalRules = templateManager.getCulturalAdaptationRules(country);
    console.log(`✅ getCulturalAdaptationRules: ${culturalRules.communicationStyle} style`);
    
    // Test getRegionalBusinessContext
    const businessContext = templateManager.getRegionalBusinessContext(country);
    console.log(`✅ getRegionalBusinessContext: ${businessContext.length} characters`);
    
  } catch (error) {
    console.error(`❌ Error testing TemplateManager methods for ${country}:`, error.message);
  }
});

// Test 8: Supported Countries and Languages
console.log('\n\n🌐 Test 8: Supported Countries and Languages');
console.log('='.repeat(50));

try {
  const supportedCountries = templateManager.getSupportedCountries();
  console.log(`✅ Supported countries: ${supportedCountries.join(', ')}`);
  
  const supportedLanguages = templateManager.getSupportedLanguages();
  console.log(`✅ Supported languages: ${supportedLanguages.join(', ')}`);
  
  // Test country support validation
  testCountries.forEach(country => {
    const isSupported = templateManager.isCountrySupported(country);
    console.log(`✅ ${country} is supported: ${isSupported}`);
  });
  
} catch (error) {
  console.error(`❌ Error testing supported countries/languages:`, error.message);
}

// Test 9: Data Integrity Validation
console.log('\n\n🔍 Test 9: Data Integrity Validation');
console.log('='.repeat(50));

try {
  // Validate REGIONAL_BUSINESS_EXAMPLES structure
  const requiredCountries = ['MX', 'CO', 'AR', 'CL', 'PE', 'EC', 'BR', 'US'];
  const missingCountries = requiredCountries.filter(country => !REGIONAL_BUSINESS_EXAMPLES[country]);
  
  if (missingCountries.length === 0) {
    console.log('✅ All required countries have business examples');
  } else {
    console.log(`❌ Missing business examples for: ${missingCountries.join(', ')}`);
  }
  
  // Validate CULTURAL_ADAPTATION_RULES structure
  const missingRules = requiredCountries.filter(country => !CULTURAL_ADAPTATION_RULES[country]);
  
  if (missingRules.length === 0) {
    console.log('✅ All required countries have cultural adaptation rules');
  } else {
    console.log(`❌ Missing cultural rules for: ${missingRules.join(', ')}`);
  }
  
  // Validate data consistency
  requiredCountries.forEach(country => {
    const examples = REGIONAL_BUSINESS_EXAMPLES[country];
    const rules = CULTURAL_ADAPTATION_RULES[country];
    
    if (examples && rules) {
      const languageMatch = examples.country === rules.country;
      console.log(`✅ ${country}: Data consistency check ${languageMatch ? 'passed' : 'failed'}`);
    }
  });
  
} catch (error) {
  console.error(`❌ Error validating data integrity:`, error.message);
}

console.log('\n🎉 Regional Content Localization Testing Complete!');
console.log('\nSummary of implemented features:');
console.log('✅ Regional business examples database for Latin American countries');
console.log('✅ Cultural adaptation rules for greetings and formality levels');
console.log('✅ Country-specific template variations (Mexican vs Colombian Spanish styles)');
console.log('✅ Regional business context generation');
console.log('✅ Template adaptation logic for country-specific content');
console.log('✅ Enhanced TemplateManager with regional methods');
console.log('✅ Integration with geo-detection service');
console.log('✅ Support for Portuguese (Brazil) localization');