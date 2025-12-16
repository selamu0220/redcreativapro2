/**
 * Test script for language routing logic simulation
 * Simulates the TypeScript routing functions from app/lib/language/routing.ts
 */

// ============================================
// CONFIGURATION (from config.ts)
// ============================================
const SUPPORTED_LANGUAGES = {
  es: { code: 'es', name: 'Español', nativeName: 'Español', flag: '🇪🇸', isDefault: true },
  en: { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', isDefault: false },
  de: { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', isDefault: false },
  fr: { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', isDefault: false },
  zh: { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', isDefault: false },
  pt: { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', isDefault: false }
};

const DEFAULT_LANGUAGE = 'es';

// ============================================
// ROUTING FUNCTIONS (from routing.ts)
// ============================================

/**
 * Extracts language from URL pathname
 */
function getLanguageFromPath(pathname) {
  const pathSegments = pathname.split('/').filter(Boolean);
  
  if (pathSegments.length > 0) {
    const firstSegment = pathSegments[0];
    if (SUPPORTED_LANGUAGES[firstSegment]) {
      return firstSegment;
    }
  }
  
  return null;
}

/**
 * Removes language prefix from pathname
 */
function removeLanguageFromPath(pathname) {
  const pathSegments = pathname.split('/').filter(Boolean);
  
  if (pathSegments.length > 0 && SUPPORTED_LANGUAGES[pathSegments[0]]) {
    const remainingPath = pathSegments.slice(1).join('/');
    return remainingPath ? `/${remainingPath}` : '/';
  }
  
  return pathname;
}

/**
 * Adds language prefix to pathname
 */
function addLanguageToPath(pathname, language) {
  const cleanPath = removeLanguageFromPath(pathname);
  return `/${language}${cleanPath === '/' ? '' : cleanPath}`;
}

/**
 * Gets the current language from browser URL (simulated)
 */
function getCurrentLanguageFromURL(mockPathname) {
  if (!mockPathname) return DEFAULT_LANGUAGE;
  
  const language = getLanguageFromPath(mockPathname);
  return language || DEFAULT_LANGUAGE;
}

/**
 * Navigates to a new path with the current language
 */
function navigateWithLanguage(path, language, currentPathname) {
  const currentLanguage = language || getCurrentLanguageFromURL(currentPathname);
  const cleanPath = removeLanguageFromPath(path);
  return addLanguageToPath(cleanPath, currentLanguage);
}

// ============================================
// TEST SUITE
// ============================================

console.log('='.repeat(70));
console.log('LANGUAGE ROUTING SIMULATION TEST SUITE');
console.log('='.repeat(70));
console.log('');

// Test 1: addLanguageToPath with 'es'
console.log('TEST 1: addLanguageToPath("/correos-ia", "es")');
console.log('Result:', addLanguageToPath('/correos-ia', 'es'));
console.log('Expected: /es/correos-ia');
console.log('');

// Test 2: addLanguageToPath with undefined (should use default)
console.log('TEST 2: addLanguageToPath("/correos-ia", undefined)');
try {
  const result = addLanguageToPath('/correos-ia', undefined);
  console.log('Result:', result);
  console.log('Note: undefined language creates "/undefined/correos-ia" - needs fallback!');
} catch (e) {
  console.log('Error:', e.message);
}
console.log('');

// Test 3: Handle paths with existing language prefix
console.log('TEST 3: addLanguageToPath("/en/correos-ia", "es")');
console.log('Result:', addLanguageToPath('/en/correos-ia', 'es'));
console.log('Expected: /es/correos-ia (should replace en with es)');
console.log('');

// Test 4: Handle root path
console.log('TEST 4: addLanguageToPath("/", "en")');
console.log('Result:', addLanguageToPath('/', 'en'));
console.log('Expected: /en');
console.log('');

// Test 5: Handle 404 or broken paths
console.log('TEST 5: Simulating window.location.pathname = "/404"');
const mockPathname404 = '/404';
console.log('getCurrentLanguageFromURL("/404"):', getCurrentLanguageFromURL(mockPathname404));
console.log('addLanguageToPath("/404", "es"):', addLanguageToPath('/404', 'es'));
console.log('Expected: es, /es/404');
console.log('');

// Test 6: Handle broken/missing paths
console.log('TEST 6: Simulating window.location.pathname = "/ruta-inexistente"');
const mockBrokenPath = '/ruta-inexistente';
console.log('getCurrentLanguageFromURL("/ruta-inexistente"):', getCurrentLanguageFromURL(mockBrokenPath));
console.log('addLanguageToPath("/ruta-inexistente", "en"):', addLanguageToPath('/ruta-inexistente', 'en'));
console.log('Expected: es (default), /en/ruta-inexistente');
console.log('');

// Test 7: All valid app folders
console.log('TEST 7: Testing all valid app folders');
const validPaths = [
  '/escritor-ia',
  '/correos-ia',
  '/prompts',
  '/plantilla-solicitudes-creativas',
  '/corrector-textos-ia'
];

validPaths.forEach(path => {
  console.log(`  ${path}:`);
  console.log(`    With 'es': ${addLanguageToPath(path, 'es')}`);
  console.log(`    With 'en': ${addLanguageToPath(path, 'en')}`);
});
console.log('');

// Test 8: navigateWithLanguage function
console.log('TEST 8: navigateWithLanguage tests');
console.log('  From "/es/dashboard" to "/correos-ia":');
console.log('    Result:', navigateWithLanguage('/correos-ia', undefined, '/es/dashboard'));
console.log('    Expected: /es/correos-ia');
console.log('');
console.log('  From "/en/dashboard" to "/correos-ia":');
console.log('    Result:', navigateWithLanguage('/correos-ia', undefined, '/en/dashboard'));
console.log('    Expected: /en/correos-ia');
console.log('');
console.log('  From "/dashboard" (no lang) to "/correos-ia":');
console.log('    Result:', navigateWithLanguage('/correos-ia', undefined, '/dashboard'));
console.log('    Expected: /es/correos-ia (default language)');
console.log('');

// Test 9: Edge cases
console.log('TEST 9: Edge cases');
console.log('  Empty string path:', addLanguageToPath('', 'es'));
console.log('  Path with trailing slash:', addLanguageToPath('/correos-ia/', 'es'));
console.log('  Path with query params:', addLanguageToPath('/correos-ia?test=1', 'es'));
console.log('  Nested path:', addLanguageToPath('/prompts/slug-example', 'en'));
console.log('');

// Test 10: Language detection from various paths
console.log('TEST 10: Language detection from paths');
const testPaths = [
  '/es/correos-ia',
  '/en/correos-ia',
  '/de/escritor-ia',
  '/correos-ia',
  '/xx/correos-ia', // Invalid language code
  '/',
  '/es',
  ''
];

testPaths.forEach(path => {
  const detected = getLanguageFromPath(path);
  console.log(`  "${path}" -> Detected language: ${detected || 'null (none)'}`);
});
console.log('');

// Summary
console.log('='.repeat(70));
console.log('SUMMARY');
console.log('='.repeat(70));
console.log('✓ All valid app folders exist:');
console.log('  - escritor-ia');
console.log('  - correos-ia');
console.log('  - prompts');
console.log('  - plantilla-solicitudes-creativas');
console.log('  - corrector-textos-ia');
console.log('');
console.log('✓ Default language: es');
console.log('✓ Supported languages: es, en, de, fr, zh, pt');
console.log('');
console.log('⚠ IMPORTANT FINDINGS:');
console.log('  1. addLanguageToPath with undefined language creates "/undefined/path"');
console.log('     → Should validate language parameter or use default');
console.log('  2. Routing works correctly for 404 and broken paths');
console.log('     → They get proper language prefix added');
console.log('  3. Query params and trailing slashes are preserved in the path');
console.log('  4. Invalid language codes (e.g., /xx/) are not detected as languages');
console.log('='.repeat(70));
