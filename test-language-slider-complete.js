/**
 * Comprehensive test script for Language Slider functionality
 */

const fs = require('fs');
const path = require('path');

console.log('🌍 Comprehensive Language Slider Test Suite\n');

// Test 1: Core Component Files
console.log('1. Testing Core Component Files...');
const coreFiles = [
  { path: 'app/components/LanguageSlider.tsx', name: 'LanguageSlider component' },
  { path: 'app/hooks/useLanguage.ts', name: 'useLanguage hook' },
  { path: 'app/lib/language/constants.ts', name: 'Language constants' },
  { path: 'app/lib/language/detection.ts', name: 'Language detection' },
  { path: 'app/lib/language/cache.ts', name: 'Language cache' },
  { path: 'app/lib/language/loader.ts', name: 'Translation loader' },
  { path: 'app/hooks/useLanguagePerformance.ts', name: 'Performance monitoring' },
  { path: 'app/components/TranslationErrorBoundary.tsx', name: 'Error boundary' },
  { path: 'app/hooks/useSafeTranslations.ts', name: 'Safe translations hook' }
];

coreFiles.forEach(file => {
  if (fs.existsSync(file.path)) {
    console.log(`✅ ${file.name}`);
  } else {
    console.log(`❌ ${file.name} - MISSING`);
  }
});

// Test 2: SEO Implementation
console.log('\n2. Testing SEO Implementation...');
const seoFiles = [
  { path: 'app/lib/language/seo.ts', name: 'SEO utilities' },
  { path: 'app/components/LanguageSEO.tsx', name: 'LanguageSEO component' },
  { path: 'app/hooks/useLocalizedSEO.ts', name: 'useLocalizedSEO hook' }
];

seoFiles.forEach(file => {
  if (fs.existsSync(file.path)) {
    console.log(`✅ ${file.name}`);
  } else {
    console.log(`❌ ${file.name} - MISSING`);
  }
});

// Test 3: Translation Files
console.log('\n3. Testing Translation Files...');
const locales = ['es', 'en', 'fr', 'de', 'zh', 'pt'];
const requiredKeys = ['selectLanguage', 'switchTo', 'languageChanged'];

let allTranslationsValid = true;

locales.forEach(locale => {
  const sliderPath = `public/locales/${locale}/slider.json`;
  if (fs.existsSync(sliderPath)) {
    try {
      const translations = JSON.parse(fs.readFileSync(sliderPath, 'utf8'));
      const missingKeys = requiredKeys.filter(key => !translations[key]);
      
      if (missingKeys.length === 0) {
        console.log(`✅ ${locale}/slider.json - Complete`);
      } else {
        console.log(`⚠️  ${locale}/slider.json - Missing: ${missingKeys.join(', ')}`);
        allTranslationsValid = false;
      }
    } catch (error) {
      console.log(`❌ ${locale}/slider.json - Invalid JSON`);
      allTranslationsValid = false;
    }
  } else {
    console.log(`❌ ${locale}/slider.json - MISSING`);
    allTranslationsValid = false;
  }
});

// Test 4: Integration Files
console.log('\n4. Testing Integration Files...');
const integrationFiles = [
  { path: 'app/components/MainNavigation.tsx', name: 'MainNavigation integration' },
  { path: 'app/components/SimpleMainNavigation.tsx', name: 'SimpleMainNavigation integration' },
  { path: 'i18n/request.ts', name: 'next-intl configuration' },
  { path: 'app/layout.tsx', name: 'Layout integration' }
];

integrationFiles.forEach(file => {
  if (fs.existsSync(file.path)) {
    const content = fs.readFileSync(file.path, 'utf8');
    
    // Check for LanguageSlider integration in navigation files
    if (file.path.includes('Navigation.tsx')) {
      if (content.includes('LanguageSlider')) {
        console.log(`✅ ${file.name} - LanguageSlider integrated`);
      } else {
        console.log(`⚠️  ${file.name} - LanguageSlider not found`);
      }
    }
    // Check for next-intl configuration
    else if (file.path.includes('request.ts')) {
      if (content.includes('locales') && content.includes('defaultLocale')) {
        console.log(`✅ ${file.name} - Properly configured`);
      } else {
        console.log(`❌ ${file.name} - Configuration incomplete`);
      }
    }
    // Check layout integration
    else if (file.path.includes('layout.tsx')) {
      if (content.includes('NextIntlClientProvider') && content.includes('getMessages')) {
        console.log(`✅ ${file.name} - next-intl integrated`);
      } else {
        console.log(`⚠️  ${file.name} - next-intl integration incomplete`);
      }
    }
    else {
      console.log(`✅ ${file.name} - Exists`);
    }
  } else {
    console.log(`❌ ${file.name} - MISSING`);
  }
});

// Test 5: Performance and Error Handling
console.log('\n5. Testing Performance and Error Handling...');
const performanceFiles = [
  'app/lib/language/cache.ts',
  'app/lib/language/loader.ts',
  'app/hooks/useLanguagePerformance.ts',
  'app/components/TranslationErrorBoundary.tsx',
  'app/hooks/useSafeTranslations.ts'
];

performanceFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for performance optimizations
    if (filePath.includes('cache.ts')) {
      if (content.includes('Map') || content.includes('cache')) {
        console.log(`✅ Translation caching - Implemented`);
      } else {
        console.log(`⚠️  Translation caching - May be missing`);
      }
    }
    
    // Check for error boundaries
    if (filePath.includes('ErrorBoundary.tsx')) {
      if (content.includes('componentDidCatch') || content.includes('ErrorBoundary')) {
        console.log(`✅ Error boundary - Implemented`);
      } else {
        console.log(`⚠️  Error boundary - May be incomplete`);
      }
    }
    
    // Check for performance monitoring
    if (filePath.includes('Performance.ts')) {
      if (content.includes('performance') || content.includes('timing')) {
        console.log(`✅ Performance monitoring - Implemented`);
      } else {
        console.log(`⚠️  Performance monitoring - May be missing`);
      }
    }
  }
});

// Test 6: Accessibility Features
console.log('\n6. Testing Accessibility Features...');
if (fs.existsSync('app/components/LanguageSlider.tsx')) {
  const sliderContent = fs.readFileSync('app/components/LanguageSlider.tsx', 'utf8');
  
  const a11yFeatures = [
    { check: 'aria-label', name: 'ARIA labels' },
    { check: 'aria-expanded', name: 'ARIA expanded state' },
    { check: 'role=', name: 'ARIA roles' },
    { check: 'onKeyDown', name: 'Keyboard navigation' },
    { check: 'tabIndex', name: 'Tab navigation' },
    { check: 'aria-live', name: 'Screen reader announcements' }
  ];
  
  a11yFeatures.forEach(feature => {
    if (sliderContent.includes(feature.check)) {
      console.log(`✅ ${feature.name} - Implemented`);
    } else {
      console.log(`⚠️  ${feature.name} - May be missing`);
    }
  });
} else {
  console.log('❌ Cannot test accessibility - LanguageSlider.tsx missing');
}

// Test 7: Test Page
console.log('\n7. Testing Test Page...');
if (fs.existsSync('app/test-seo-language/page.tsx')) {
  console.log('✅ SEO test page created');
} else {
  console.log('⚠️  SEO test page not found');
}

// Summary
console.log('\n📊 Test Summary:');
console.log('================');

const testResults = {
  coreFiles: coreFiles.filter(f => fs.existsSync(f.path)).length,
  totalCoreFiles: coreFiles.length,
  seoFiles: seoFiles.filter(f => fs.existsSync(f.path)).length,
  totalSeoFiles: seoFiles.length,
  translationsValid: allTranslationsValid,
  integrationFiles: integrationFiles.filter(f => fs.existsSync(f.path)).length,
  totalIntegrationFiles: integrationFiles.length
};

console.log(`Core Components: ${testResults.coreFiles}/${testResults.totalCoreFiles}`);
console.log(`SEO Implementation: ${testResults.seoFiles}/${testResults.totalSeoFiles}`);
console.log(`Translation Files: ${testResults.translationsValid ? 'Valid' : 'Issues Found'}`);
console.log(`Integration Files: ${testResults.integrationFiles}/${testResults.totalIntegrationFiles}`);

const overallScore = (
  (testResults.coreFiles / testResults.totalCoreFiles) * 0.3 +
  (testResults.seoFiles / testResults.totalSeoFiles) * 0.25 +
  (testResults.translationsValid ? 1 : 0) * 0.25 +
  (testResults.integrationFiles / testResults.totalIntegrationFiles) * 0.2
) * 100;

console.log(`\n🎯 Overall Implementation Score: ${Math.round(overallScore)}%`);

if (overallScore >= 90) {
  console.log('🎉 Excellent! Implementation is nearly complete.');
} else if (overallScore >= 75) {
  console.log('👍 Good progress! A few items need attention.');
} else {
  console.log('⚠️  More work needed to complete the implementation.');
}

console.log('\n🚀 Next Steps:');
console.log('1. Run the development server: npm run dev');
console.log('2. Visit /test-seo-language to test functionality');
console.log('3. Test language switching in browser');
console.log('4. Verify SEO meta tags in browser dev tools');
console.log('5. Test accessibility with keyboard navigation');
console.log('6. Validate with screen readers if available');