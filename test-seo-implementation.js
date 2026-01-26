/**
 * Test script to verify SEO implementation for language slider
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing SEO Implementation for Language Slider...\n');

// Test 1: Verify SEO utilities exist
console.log('1. Checking SEO utility files...');
const seoUtilsPath = path.join(__dirname, 'app/lib/language/seo.ts');
const languageSEOPath = path.join(__dirname, 'app/components/LanguageSEO.tsx');
const useLocalizedSEOPath = path.join(__dirname, 'app/hooks/useLocalizedSEO.ts');

const files = [
  { path: seoUtilsPath, name: 'SEO utilities' },
  { path: languageSEOPath, name: 'LanguageSEO component' },
  { path: useLocalizedSEOPath, name: 'useLocalizedSEO hook' }
];

files.forEach(file => {
  if (fs.existsSync(file.path)) {
    console.log(`✅ ${file.name} exists`);
  } else {
    console.log(`❌ ${file.name} missing`);
  }
});

// Test 2: Verify layout.tsx has SEO integration
console.log('\n2. Checking layout.tsx SEO integration...');
const layoutPath = path.join(__dirname, 'app/layout.tsx');
if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  
  const seoFeatures = [
    { check: 'generateHreflangLinks', name: 'Hreflang links generation' },
    { check: 'generateOpenGraphMetadata', name: 'Open Graph metadata' },
    { check: 'generateLanguageStructuredData', name: 'Structured data' },
    { check: 'getCurrentLocale', name: 'Current locale detection' },
    { check: 'alternates:', name: 'Alternates metadata' }
  ];
  
  seoFeatures.forEach(feature => {
    if (layoutContent.includes(feature.check)) {
      console.log(`✅ ${feature.name} implemented`);
    } else {
      console.log(`❌ ${feature.name} missing`);
    }
  });
} else {
  console.log('❌ layout.tsx not found');
}

// Test 3: Verify translation files have required keys
console.log('\n3. Checking translation files for SEO-related keys...');
const locales = ['es', 'en', 'fr', 'de', 'zh', 'pt'];
const requiredKeys = ['selectLanguage', 'switchTo', 'languageChanged'];

locales.forEach(locale => {
  const sliderPath = path.join(__dirname, `public/locales/${locale}/slider.json`);
  if (fs.existsSync(sliderPath)) {
    try {
      const translations = JSON.parse(fs.readFileSync(sliderPath, 'utf8'));
      const missingKeys = requiredKeys.filter(key => !translations[key]);
      
      if (missingKeys.length === 0) {
        console.log(`✅ ${locale}/slider.json has all required keys`);
      } else {
        console.log(`⚠️  ${locale}/slider.json missing keys: ${missingKeys.join(', ')}`);
      }
    } catch (error) {
      console.log(`❌ ${locale}/slider.json has invalid JSON`);
    }
  } else {
    console.log(`❌ ${locale}/slider.json not found`);
  }
});

// Test 4: Check for SEO constants
console.log('\n4. Checking language constants...');
const constantsPath = path.join(__dirname, 'app/lib/language/constants.ts');
if (fs.existsSync(constantsPath)) {
  const constantsContent = fs.readFileSync(constantsPath, 'utf8');
  
  const requiredConstants = [
    'SUPPORTED_LOCALES',
    'DEFAULT_LOCALE',
    'SupportedLocale'
  ];
  
  requiredConstants.forEach(constant => {
    if (constantsContent.includes(constant)) {
      console.log(`✅ ${constant} defined`);
    } else {
      console.log(`❌ ${constant} missing`);
    }
  });
} else {
  console.log('❌ Language constants file not found');
}

// Test 5: Verify next-intl configuration
console.log('\n5. Checking next-intl configuration...');
const i18nRequestPath = path.join(__dirname, 'i18n/request.ts');
if (fs.existsSync(i18nRequestPath)) {
  const i18nContent = fs.readFileSync(i18nRequestPath, 'utf8');
  
  if (i18nContent.includes('locales') && i18nContent.includes('defaultLocale')) {
    console.log('✅ next-intl configuration exists');
  } else {
    console.log('❌ next-intl configuration incomplete');
  }
} else {
  console.log('❌ i18n/request.ts not found');
}

// Test 6: Check next.config.js for next-intl plugin
console.log('\n6. Checking next.config.js...');
const nextConfigPath = path.join(__dirname, 'next.config.js');
if (fs.existsSync(nextConfigPath)) {
  const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');
  
  if (nextConfigContent.includes('next-intl') || nextConfigContent.includes('createNextIntlPlugin')) {
    console.log('✅ next-intl plugin configured');
  } else {
    console.log('⚠️  next-intl plugin may not be configured');
  }
} else {
  console.log('❌ next.config.js not found');
}

console.log('\n🎯 SEO Implementation Test Complete!');
console.log('\nNext steps:');
console.log('1. Test hreflang links in browser dev tools');
console.log('2. Verify Open Graph metadata with social media debuggers');
console.log('3. Test structured data with Google Rich Results Test');
console.log('4. Validate language switching updates meta tags correctly');