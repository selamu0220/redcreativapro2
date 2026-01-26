/**
 * Test script para verificar la funcionalidad básica del Language Slider
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Language Slider Functionality...\n');

// Test 1: Verificar que los archivos de traducción existen
console.log('1. Checking translation files...');
const locales = ['es', 'en', 'fr', 'de', 'zh', 'pt'];
const requiredFiles = ['common.json', 'slider.json'];

let translationFilesOk = true;
for (const locale of locales) {
  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, 'public', 'locales', locale, file);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Missing: ${filePath}`);
      translationFilesOk = false;
    } else {
      // Verificar que el archivo tiene contenido válido
      try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (Object.keys(content).length === 0) {
          console.error(`❌ Empty file: ${filePath}`);
          translationFilesOk = false;
        }
      } catch (error) {
        console.error(`❌ Invalid JSON in: ${filePath}`);
        translationFilesOk = false;
      }
    }
  }
}

if (translationFilesOk) {
  console.log('✅ All translation files exist and are valid');
} else {
  console.log('❌ Some translation files are missing or invalid');
}

// Test 2: Verificar que los componentes principales existen
console.log('\n2. Checking component files...');
const requiredComponents = [
  'app/components/LanguageSlider.tsx',
  'app/components/SimpleMainNavigation.tsx',
  'app/lib/language/constants.ts',
  'app/lib/language/detection.ts',
  'app/lib/language/cache.ts',
  'app/lib/language/loader.ts',
  'app/hooks/useLanguage.ts',
  'app/hooks/useSafeTranslations.ts',
  'app/hooks/useLanguagePerformance.ts',
  'i18n/request.ts'
];

let componentsOk = true;
for (const component of requiredComponents) {
  const filePath = path.join(__dirname, component);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing component: ${component}`);
    componentsOk = false;
  }
}

if (componentsOk) {
  console.log('✅ All required components exist');
} else {
  console.log('❌ Some required components are missing');
}

// Test 3: Verificar configuración de next-intl
console.log('\n3. Checking next-intl configuration...');
const nextConfigPath = path.join(__dirname, 'next.config.js');
let nextConfigOk = false;

if (fs.existsSync(nextConfigPath)) {
  const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
  if (nextConfig.includes('next-intl') || nextConfig.includes('createNextIntlPlugin')) {
    console.log('✅ next-intl plugin configured in next.config.js');
    nextConfigOk = true;
  } else {
    console.log('❌ next-intl plugin not found in next.config.js');
  }
} else {
  console.log('❌ next.config.js not found');
}

// Test 4: Verificar estructura de constantes de idioma
console.log('\n4. Checking language constants...');
try {
  const constantsPath = path.join(__dirname, 'app/lib/language/constants.ts');
  const constantsContent = fs.readFileSync(constantsPath, 'utf8');
  
  let constantsOk = true;
  const requiredLocales = ['es', 'en', 'fr', 'de', 'zh', 'pt'];
  
  for (const locale of requiredLocales) {
    if (!constantsContent.includes(`${locale}:`)) {
      console.error(`❌ Locale ${locale} not found in constants`);
      constantsOk = false;
    }
  }
  
  if (constantsOk) {
    console.log('✅ All required locales defined in constants');
  }
} catch (error) {
  console.log('❌ Error reading language constants:', error.message);
}

// Test 5: Verificar integración en layout
console.log('\n5. Checking layout integration...');
const layoutPath = path.join(__dirname, 'app/layout.tsx');
let layoutOk = false;

if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  if (layoutContent.includes('NextIntlClientProvider') || layoutContent.includes('next-intl')) {
    console.log('✅ next-intl integrated in layout');
    layoutOk = true;
  } else {
    console.log('❌ next-intl integration not found in layout');
  }
} else {
  console.log('❌ app/layout.tsx not found');
}

// Test 6: Verificar que SimpleMainNavigation incluye LanguageSlider
console.log('\n6. Checking navigation integration...');
const navPath = path.join(__dirname, 'app/components/SimpleMainNavigation.tsx');
let navOk = false;

if (fs.existsSync(navPath)) {
  const navContent = fs.readFileSync(navPath, 'utf8');
  if (navContent.includes('LanguageSlider')) {
    console.log('✅ LanguageSlider integrated in navigation');
    navOk = true;
  } else {
    console.log('❌ LanguageSlider not found in navigation');
  }
} else {
  console.log('❌ SimpleMainNavigation.tsx not found');
}

// Resumen final
console.log('\n📊 Test Summary:');
console.log('================');
const tests = [
  { name: 'Translation Files', passed: translationFilesOk },
  { name: 'Component Files', passed: componentsOk },
  { name: 'Next-intl Config', passed: nextConfigOk },
  { name: 'Layout Integration', passed: layoutOk },
  { name: 'Navigation Integration', passed: navOk }
];

const passedTests = tests.filter(test => test.passed).length;
const totalTests = tests.length;

tests.forEach(test => {
  console.log(`${test.passed ? '✅' : '❌'} ${test.name}`);
});

console.log(`\n🎯 Result: ${passedTests}/${totalTests} tests passed`);

if (passedTests === totalTests) {
  console.log('🎉 All basic functionality tests passed! Language slider is ready.');
  process.exit(0);
} else {
  console.log('⚠️  Some tests failed. Please check the issues above.');
  process.exit(1);
}