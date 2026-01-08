// Simple test to verify translations are working
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing translation system...\n');

// Check if translation files exist
const locales = ['es', 'en', 'de', 'fr', 'pt', 'zh'];
const files = ['common.json', 'homepage.json'];

let allFilesExist = true;

locales.forEach(locale => {
  files.forEach(file => {
    const filePath = path.join('public', 'locales', locale, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${locale}/${file} exists`);
    } else {
      console.log(`❌ ${locale}/${file} missing`);
      allFilesExist = false;
    }
  });
});

console.log('\n📋 Translation file status:', allFilesExist ? '✅ All files present' : '❌ Some files missing');

// Test loading a translation file
try {
  const esHomepage = JSON.parse(fs.readFileSync('public/locales/es/homepage.json', 'utf8'));
  const enHomepage = JSON.parse(fs.readFileSync('public/locales/en/homepage.json', 'utf8'));
  
  console.log('\n🔤 Sample translations:');
  console.log('ES title:', esHomepage.hero.title);
  console.log('EN title:', enHomepage.hero.title);
  console.log('ES subtitle:', esHomepage.hero.subtitle);
  console.log('EN subtitle:', enHomepage.hero.subtitle);
  
  console.log('\n✅ Translation system appears to be working correctly!');
  console.log('\n🌐 Available languages:');
  locales.forEach(locale => {
    console.log(`  - ${locale.toUpperCase()}`);
  });
  
  console.log('\n🚀 You can now test the website at http://localhost:3000');
  console.log('   Try changing the language using the language selector in the top right!');
  
} catch (error) {
  console.error('\n❌ Error loading translation files:', error.message);
}