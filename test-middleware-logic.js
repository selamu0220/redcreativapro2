// Test script to simulate middleware logic
const SUPPORTED = new Set(['es', 'en', 'de', 'fr', 'zh', 'pt']);

function testMiddlewareLogic(url) {
  console.log('\n========================================');
  console.log('Testing URL:', url);
  console.log('========================================');
  
  // Extract pathname from URL
  const pathname = url.startsWith('/') ? url : '/' + url;
  console.log('1. Pathname:', pathname);
  
  // Split by '/'
  const pathParts = pathname.split('/');
  console.log('2. Path parts:', pathParts);
  console.log('   - pathParts[0]:', JSON.stringify(pathParts[0]));
  console.log('   - pathParts[1]:', JSON.stringify(pathParts[1]));
  console.log('   - pathParts[2]:', JSON.stringify(pathParts[2]));
  
  // Get potential language
  const potentialLang = pathParts[1];
  console.log('3. Potential language:', JSON.stringify(potentialLang));
  
  // Check if it's a supported language
  const isLangSupported = SUPPORTED.has(potentialLang);
  console.log('4. Is supported language?', isLangSupported);
  
  if (isLangSupported) {
    console.log('5. Language prefix detected!');
    
    // Remove the language prefix for internal routing
    const slicedParts = pathParts.slice(2);
    console.log('6. Sliced parts (slice(2)):', slicedParts);
    
    const joinedPath = slicedParts.join('/');
    console.log('7. Joined path:', JSON.stringify(joinedPath));
    
    const newPathname = '/' + joinedPath || '/';
    console.log('8. New pathname:', JSON.stringify(newPathname));
    
    console.log('\n✅ RESULT:');
    console.log('   Original URL:', url);
    console.log('   Detected language:', potentialLang);
    console.log('   Rewrite to:', newPathname);
  } else {
    console.log('5. No language prefix detected');
    console.log('\n✅ RESULT:');
    console.log('   Original URL:', url);
    console.log('   No rewrite needed');
  }
}

// Test cases
console.log('\n🧪 MIDDLEWARE LOGIC SIMULATION TEST');
console.log('=====================================\n');

// Test case 1: /es/escritor-ia
testMiddlewareLogic('/es/escritor-ia');

// Test case 2: /en/escritor-ia
testMiddlewareLogic('/en/escritor-ia');

// Test case 3: /escritor-ia (no language prefix)
testMiddlewareLogic('/escritor-ia');

// Test case 4: /es/ (root with language)
testMiddlewareLogic('/es/');

// Test case 5: /es (language only, no trailing slash)
testMiddlewareLogic('/es');

// Test case 6: / (root)
testMiddlewareLogic('/');

// Test case 7: /es/dashboard/settings
testMiddlewareLogic('/es/dashboard/settings');

console.log('\n========================================');
console.log('🎯 KEY FINDINGS:');
console.log('========================================');
console.log('- pathParts[0] is always empty string (before first /)');
console.log('- pathParts[1] is the first segment (potential language)');
console.log('- pathParts.slice(2) removes ["", "es"] and keeps the rest');
console.log('- "/" + "".join("/") = "/" (handles empty array correctly)');
console.log('========================================\n');
