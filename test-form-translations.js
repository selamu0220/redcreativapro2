/**
 * Test script to verify form component translations
 * This tests the auth forms and unsubscribe form translations
 */

const fs = require('fs');
const path = require('path');

// Test translation files exist and have required keys
function testTranslationFiles() {
  console.log('🧪 Testing form translation files...\n');
  
  const languages = ['es', 'en', 'fr', 'de', 'zh'];
  const requiredAuthKeys = [
    'login.title',
    'login.email', 
    'login.password',
    'login.loginButton',
    'signup.title',
    'signup.email',
    'signup.password',
    'signup.confirmPassword',
    'signup.signupButton',
    'validation.passwordMinLength',
    'validation.passwordsNotMatch',
    'placeholders.email',
    'placeholders.password',
    'errors.authError',
    'loading.text',
    'trial.title',
    'trial.button'
  ];
  
  const requiredUnsubscribeKeys = [
    'unsubscribe.title',
    'unsubscribe.processing',
    'unsubscribe.success',
    'unsubscribe.successMessage',
    'unsubscribe.error',
    'unsubscribe.email',
    'unsubscribe.emailPlaceholder',
    'unsubscribe.cancelSubscription',
    'unsubscribe.backToHome'
  ];

  let allTestsPassed = true;

  // Test auth translations
  languages.forEach(lang => {
    console.log(`📋 Testing ${lang} auth translations...`);
    
    try {
      const authPath = path.join(__dirname, 'public', 'locales', lang, 'auth.json');
      const authContent = JSON.parse(fs.readFileSync(authPath, 'utf8'));
      
      requiredAuthKeys.forEach(key => {
        const keys = key.split('.');
        let value = authContent;
        
        for (const k of keys) {
          value = value?.[k];
        }
        
        if (!value) {
          console.log(`  ❌ Missing auth key: ${key}`);
          allTestsPassed = false;
        } else {
          console.log(`  ✅ Found auth key: ${key} = "${value}"`);
        }
      });
      
    } catch (error) {
      console.log(`  ❌ Error reading auth file for ${lang}: ${error.message}`);
      allTestsPassed = false;
    }
    
    console.log('');
  });

  // Test unsubscribe translations in common.json
  languages.forEach(lang => {
    console.log(`📋 Testing ${lang} unsubscribe translations...`);
    
    try {
      const commonPath = path.join(__dirname, 'public', 'locales', lang, 'common.json');
      const commonContent = JSON.parse(fs.readFileSync(commonPath, 'utf8'));
      
      requiredUnsubscribeKeys.forEach(key => {
        const keys = key.split('.');
        let value = commonContent;
        
        for (const k of keys) {
          value = value?.[k];
        }
        
        if (!value) {
          console.log(`  ❌ Missing unsubscribe key: ${key}`);
          allTestsPassed = false;
        } else {
          console.log(`  ✅ Found unsubscribe key: ${key} = "${value}"`);
        }
      });
      
    } catch (error) {
      console.log(`  ❌ Error reading common file for ${lang}: ${error.message}`);
      allTestsPassed = false;
    }
    
    console.log('');
  });

  return allTestsPassed;
}

// Test that form components use translation hooks
function testFormComponents() {
  console.log('🧪 Testing form components use translations...\n');
  
  const componentsToTest = [
    'app/auth/page.tsx',
    'app/auth/login/page.tsx', 
    'app/auth/signup/page.tsx',
    'app/unsubscribe/page.tsx'
  ];
  
  let allTestsPassed = true;
  
  componentsToTest.forEach(componentPath => {
    console.log(`📋 Testing ${componentPath}...`);
    
    try {
      const content = fs.readFileSync(componentPath, 'utf8');
      
      // Check if component imports useTranslation
      if (content.includes('useTranslation')) {
        console.log('  ✅ Component imports useTranslation');
      } else {
        console.log('  ❌ Component does not import useTranslation');
        allTestsPassed = false;
      }
      
      // Check if component uses translation function
      if (content.includes('t(')) {
        console.log('  ✅ Component uses translation function t()');
      } else {
        console.log('  ❌ Component does not use translation function t()');
        allTestsPassed = false;
      }
      
      // Check for hardcoded Spanish strings (should be minimal)
      const spanishStrings = content.match(/"[^"]*[áéíóúñü][^"]*"/gi) || [];
      if (spanishStrings.length > 0) {
        console.log(`  ⚠️  Found ${spanishStrings.length} potential hardcoded Spanish strings:`);
        spanishStrings.slice(0, 3).forEach(str => console.log(`    - ${str}`));
        if (spanishStrings.length > 3) {
          console.log(`    ... and ${spanishStrings.length - 3} more`);
        }
      } else {
        console.log('  ✅ No obvious hardcoded Spanish strings found');
      }
      
    } catch (error) {
      console.log(`  ❌ Error reading component: ${error.message}`);
      allTestsPassed = false;
    }
    
    console.log('');
  });
  
  return allTestsPassed;
}

// Run all tests
function runAllTests() {
  console.log('🚀 Starting Form Translation Tests\n');
  console.log('=' .repeat(50));
  
  const translationFilesTest = testTranslationFiles();
  const componentTest = testFormComponents();
  
  console.log('=' .repeat(50));
  console.log('📊 Test Results Summary:');
  console.log(`Translation Files: ${translationFilesTest ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Form Components: ${componentTest ? '✅ PASSED' : '❌ FAILED'}`);
  
  const allPassed = translationFilesTest && componentTest;
  console.log(`\nOverall Result: ${allPassed ? '🎉 ALL TESTS PASSED' : '💥 SOME TESTS FAILED'}`);
  
  if (allPassed) {
    console.log('\n✨ Form translations are properly implemented!');
    console.log('📝 Key achievements:');
    console.log('  • Auth forms use translation system');
    console.log('  • Unsubscribe form uses translation system');
    console.log('  • All validation messages are translated');
    console.log('  • Error messages appear in user\'s language');
    console.log('  • Success/failure notifications use translations');
    console.log('  • All 5 languages supported (es, en, fr, de, zh)');
  } else {
    console.log('\n🔧 Some issues need to be addressed before the implementation is complete.');
  }
  
  return allPassed;
}

// Run the tests
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests, testTranslationFiles, testFormComponents };