#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Homepage Language Slider Integration...\n');

// Test 1: Verify HomePageClient imports LanguageSlider
console.log('1. Checking HomePageClient imports...');
const homePagePath = path.join(__dirname, 'app/components/HomePageClient.tsx');

if (fs.existsSync(homePagePath)) {
  const content = fs.readFileSync(homePagePath, 'utf8');
  
  if (content.includes("import { LanguageSlider } from './LanguageSlider'")) {
    console.log('✅ LanguageSlider import found');
  } else {
    console.log('❌ LanguageSlider import missing');
  }
  
  if (content.includes('<LanguageSlider')) {
    console.log('✅ LanguageSlider component usage found');
  } else {
    console.log('❌ LanguageSlider component usage missing');
  }
  
  // Check positioning in header
  if (content.includes('className="mr-2"') && content.includes('<LanguageSlider')) {
    console.log('✅ LanguageSlider positioned correctly in header');
  } else {
    console.log('⚠️  LanguageSlider positioning may need adjustment');
  }
} else {
  console.log('❌ HomePageClient.tsx not found');
}

// Test 2: Verify LanguageSlider component exists
console.log('\n2. Checking LanguageSlider component...');
const sliderPath = path.join(__dirname, 'app/components/LanguageSlider.tsx');

if (fs.existsSync(sliderPath)) {
  console.log('✅ LanguageSlider component exists');
  
  const sliderContent = fs.readFileSync(sliderPath, 'utf8');
  if (sliderContent.includes('export function LanguageSlider')) {
    console.log('✅ LanguageSlider properly exported');
  } else {
    console.log('❌ LanguageSlider export issue');
  }
} else {
  console.log('❌ LanguageSlider.tsx not found');
}

// Test 3: Check for required dependencies
console.log('\n3. Checking dependencies...');
const requiredFiles = [
  'app/lib/language/constants.ts',
  'app/hooks/useLanguagePerformance.ts',
  'public/locales/es/slider.json',
  'public/locales/en/slider.json'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`⚠️  ${file} missing (may cause runtime issues)`);
  }
});

// Test 4: Check translation files
console.log('\n4. Checking translation files...');
const locales = ['es', 'en', 'fr', 'de', 'zh', 'pt'];
let translationIssues = 0;

locales.forEach(locale => {
  const sliderTransPath = path.join(__dirname, `public/locales/${locale}/slider.json`);
  if (fs.existsSync(sliderTransPath)) {
    try {
      const translations = JSON.parse(fs.readFileSync(sliderTransPath, 'utf8'));
      if (translations.selectLanguage && translations.switchTo) {
        console.log(`✅ ${locale}/slider.json has required translations`);
      } else {
        console.log(`⚠️  ${locale}/slider.json missing required keys`);
        translationIssues++;
      }
    } catch (e) {
      console.log(`❌ ${locale}/slider.json has JSON syntax errors`);
      translationIssues++;
    }
  } else {
    console.log(`⚠️  ${locale}/slider.json missing`);
    translationIssues++;
  }
});

// Summary
console.log('\n📊 Integration Summary:');
console.log('='.repeat(50));

if (fs.existsSync(homePagePath) && fs.existsSync(sliderPath)) {
  const homeContent = fs.readFileSync(homePagePath, 'utf8');
  const hasImport = homeContent.includes("import { LanguageSlider } from './LanguageSlider'");
  const hasUsage = homeContent.includes('<LanguageSlider');
  
  if (hasImport && hasUsage) {
    console.log('🎉 SUCCESS: LanguageSlider successfully integrated in homepage!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Visit http://localhost:3000');
    console.log('3. Look for the language slider in the top-right header');
    console.log('4. Test language switching functionality');
    
    if (translationIssues > 0) {
      console.log('');
      console.log(`⚠️  Note: ${translationIssues} translation file issues detected`);
      console.log('   Language switching may not work properly for all languages');
    }
  } else {
    console.log('❌ FAILED: Integration incomplete');
    console.log('   Check the import and usage of LanguageSlider in HomePageClient.tsx');
  }
} else {
  console.log('❌ FAILED: Required files missing');
}

console.log('');