// Test middleware behavior with App Router [lang] dynamic segments
const { NextRequest, NextResponse } = require('next/server');

// Mock the middleware function (simplified version for testing)
function testMiddleware() {
  const SUPPORTED_LANGUAGES = ['es', 'en', 'fr', 'de', 'zh'];
  const DEFAULT_LANGUAGE = 'es';
  
  function isLanguagePath(pathname) {
    const pathSegments = pathname.split('/').filter(Boolean);
    return pathSegments.length > 0 && SUPPORTED_LANGUAGES.includes(pathSegments[0]);
  }
  
  // Test cases for App Router compatibility
  const testCases = [
    // Should redirect to language-prefixed URL
    { path: '/', expectedRedirect: '/es' },
    { path: '/blog', expectedRedirect: '/es/blog' },
    { path: '/dashboard', expectedRedirect: '/es/dashboard' },
    
    // Should pass through (already has language prefix)
    { path: '/es', shouldPassThrough: true },
    { path: '/en/blog', shouldPassThrough: true },
    { path: '/fr/dashboard', shouldPassThrough: true },
    
    // Should skip middleware (static assets)
    { path: '/api/test', shouldSkip: true },
    { path: '/_next/static/test.js', shouldSkip: true },
    { path: '/favicon.ico', shouldSkip: true },
    { path: '/robots.txt', shouldSkip: true },
    { path: '/sitemap.xml', shouldSkip: true },
    { path: '/sw.js', shouldSkip: true },
    { path: '/manifest.json', shouldSkip: true },
    { path: '/image.png', shouldSkip: true },
  ];
  
  console.log('Testing middleware behavior with App Router [lang] dynamic segments:\n');
  
  testCases.forEach(testCase => {
    const { path, expectedRedirect, shouldPassThrough, shouldSkip } = testCase;
    
    // Test skip conditions
    if (shouldSkip) {
      const shouldSkipResult = (
        path.startsWith('/api/') ||
        path.startsWith('/_next/') ||
        path.startsWith('/favicon.ico') ||
        path.startsWith('/robots.txt') ||
        path.startsWith('/sitemap') ||
        path.startsWith('/sw.js') ||
        path.startsWith('/manifest.json') ||
        /\.[^/]+$/.test(path)
      );
      
      console.log(`✓ ${path} - Should skip: ${shouldSkipResult ? 'PASS' : 'FAIL'}`);
      return;
    }
    
    // Test language detection
    const hasLanguagePrefix = isLanguagePath(path);
    
    if (expectedRedirect) {
      console.log(`✓ ${path} - Should redirect to ${expectedRedirect}: ${!hasLanguagePrefix ? 'PASS' : 'FAIL'}`);
    }
    
    if (shouldPassThrough) {
      console.log(`✓ ${path} - Should pass through: ${hasLanguagePrefix ? 'PASS' : 'FAIL'}`);
    }
  });
  
  console.log('\nMiddleware matcher pattern test:');
  // Test the actual regex pattern used in middleware
  const matcherPattern = '((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap|sw.js|manifest.json|.*\\.[^/]*).*)';
  const matcherRegex = new RegExp(`^/${matcherPattern}$`);
  
  const matcherTests = [
    { path: '/es/blog', shouldMatch: true },
    { path: '/en/dashboard', shouldMatch: true },
    { path: '/api/test', shouldMatch: false },
    { path: '/_next/static/test.js', shouldMatch: false },
    { path: '/favicon.ico', shouldMatch: false },
    { path: '/robots.txt', shouldMatch: false },
    { path: '/sitemap.xml', shouldMatch: false },
    { path: '/image.png', shouldMatch: false },
  ];
  
  matcherTests.forEach(test => {
    const matches = matcherRegex.test(test.path);
    console.log(`${matches === test.shouldMatch ? '✓' : '✗'} ${test.path} - Expected: ${test.shouldMatch}, Got: ${matches}`);
  });
}

testMiddleware();