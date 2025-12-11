/**
 * Test script for language routing functionality
 */

// Mock Next.js request and response for testing
class MockNextRequest {
  constructor(url, headers = {}, cookies = {}) {
    this.nextUrl = new URL(url);
    this.headers = new Map(Object.entries(headers));
    this.cookies = new Map(Object.entries(cookies));
  }
  
  get(name) {
    return this.cookies.get(name);
  }
}

class MockNextResponse {
  constructor() {
    this.headers = new Map();
    this.cookies = new Map();
    this.status = 200;
    this.redirectUrl = null;
    this.rewriteUrl = null;
  }
  
  static next() {
    return new MockNextResponse();
  }
  
  static redirect(url, status = 302) {
    const response = new MockNextResponse();
    response.redirectUrl = url.toString();
    response.status = status;
    return response;
  }
  
  static rewrite(url) {
    const response = new MockNextResponse();
    response.rewriteUrl = url.toString();
    return response;
  }
  
  set(name, value) {
    this.headers.set(name, value);
    return this;
  }
}

// Mock the middleware dependencies
const mockAiCrawlerMiddleware = {
  processRequest: () => ({ response: null })
};

// Test cases
const testCases = [
  {
    name: 'Root path without language - should redirect to detected language',
    url: 'https://example.com/',
    headers: { 'accept-language': 'en-US,en;q=0.9' },
    cookies: {},
    expectedRedirect: 'https://example.com/en'
  },
  {
    name: 'Root path with Spanish preference - should redirect to Spanish',
    url: 'https://example.com/',
    headers: { 'accept-language': 'es-ES,es;q=0.9' },
    cookies: {},
    expectedRedirect: 'https://example.com/es'
  },
  {
    name: 'Path with language prefix - should rewrite',
    url: 'https://example.com/en/dashboard',
    headers: {},
    cookies: {},
    expectedRewrite: 'https://example.com/dashboard'
  },
  {
    name: 'Path with cookie preference - should use cookie language',
    url: 'https://example.com/',
    headers: { 'accept-language': 'en-US,en;q=0.9' },
    cookies: { 'redcreativa-language': 'fr' },
    expectedRedirect: 'https://example.com/fr'
  },
  {
    name: 'API route - should pass through',
    url: 'https://example.com/api/test',
    headers: {},
    cookies: {},
    expectedPassThrough: true
  },
  {
    name: 'Static file - should pass through',
    url: 'https://example.com/favicon.ico',
    headers: {},
    cookies: {},
    expectedPassThrough: true
  }
];

// Simple middleware logic for testing (extracted from middleware.ts)
function testMiddleware(request) {
  const SUPPORTED_LANGUAGES = ['es', 'en', 'fr', 'de', 'zh'];
  const DEFAULT_LANGUAGE = 'es';
  const LANGUAGE_COOKIE_NAME = 'redcreativa-language';
  
  const BROWSER_LANGUAGE_MAP = {
    'es': 'es', 'es-ES': 'es', 'es-MX': 'es', 'es-AR': 'es',
    'en': 'en', 'en-US': 'en', 'en-GB': 'en',
    'de': 'de', 'de-DE': 'de', 'de-AT': 'de',
    'fr': 'fr', 'fr-FR': 'fr', 'fr-CA': 'fr',
    'zh': 'zh', 'zh-CN': 'zh', 'zh-TW': 'zh'
  };
  
  function detectLanguageFromRequest(request) {
    // Priority 1: URL path segment
    const pathname = request.nextUrl.pathname;
    const pathSegments = pathname.split('/').filter(Boolean);
    
    if (pathSegments.length > 0) {
      const firstSegment = pathSegments[0];
      if (SUPPORTED_LANGUAGES.includes(firstSegment)) {
        return firstSegment;
      }
    }
    
    // Priority 2: Cookie
    const cookieLanguage = request.cookies.get(LANGUAGE_COOKIE_NAME);
    if (cookieLanguage && SUPPORTED_LANGUAGES.includes(cookieLanguage)) {
      return cookieLanguage;
    }
    
    // Priority 3: Accept-Language header
    const acceptLanguage = request.headers.get('accept-language');
    if (acceptLanguage) {
      const languages = acceptLanguage
        .split(',')
        .map(lang => lang.split(';')[0].trim())
        .map(lang => lang.toLowerCase());
      
      for (const browserLang of languages) {
        const mappedLang = BROWSER_LANGUAGE_MAP[browserLang];
        if (mappedLang) {
          return mappedLang;
        }
        
        const shortLang = browserLang.split('-')[0];
        const mappedShortLang = BROWSER_LANGUAGE_MAP[shortLang];
        if (mappedShortLang) {
          return mappedShortLang;
        }
      }
    }
    
    return DEFAULT_LANGUAGE;
  }
  
  function isLanguagePath(pathname) {
    const pathSegments = pathname.split('/').filter(Boolean);
    return pathSegments.length > 0 && SUPPORTED_LANGUAGES.includes(pathSegments[0]);
  }
  
  function removeLanguageFromPath(pathname) {
    const pathSegments = pathname.split('/').filter(Boolean);
    if (pathSegments.length > 0 && SUPPORTED_LANGUAGES.includes(pathSegments[0])) {
      return '/' + pathSegments.slice(1).join('/');
    }
    return pathname;
  }
  
  const url = new URL(request.nextUrl);
  const pathname = url.pathname;
  
  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return { type: 'passthrough' };
  }

  const detectedLanguage = detectLanguageFromRequest(request);
  const hasLanguagePrefix = isLanguagePath(pathname);
  
  if (!hasLanguagePrefix) {
    url.pathname = `/${detectedLanguage}${pathname === '/' ? '' : pathname}`;
    return { type: 'redirect', url: url.toString(), language: detectedLanguage };
  }
  
  const pathSegments = pathname.split('/').filter(Boolean);
  const urlLanguage = pathSegments[0];
  const pathWithoutLanguage = removeLanguageFromPath(pathname);
  
  url.pathname = pathWithoutLanguage || '/';
  
  return { 
    type: 'rewrite', 
    url: url.toString(), 
    language: urlLanguage,
    originalPath: pathWithoutLanguage
  };
}

// Run tests
console.log('🧪 Testing Language Routing Middleware\n');

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.name}`);
  
  const request = new MockNextRequest(testCase.url, testCase.headers, testCase.cookies);
  const result = testMiddleware(request);
  
  let passed = false;
  let message = '';
  
  if (testCase.expectedPassThrough && result.type === 'passthrough') {
    passed = true;
    message = '✅ Correctly passed through';
  } else if (testCase.expectedRedirect && result.type === 'redirect') {
    if (result.url === testCase.expectedRedirect) {
      passed = true;
      message = `✅ Correctly redirected to ${result.url}`;
    } else {
      message = `❌ Expected redirect to ${testCase.expectedRedirect}, got ${result.url}`;
    }
  } else if (testCase.expectedRewrite && result.type === 'rewrite') {
    if (result.url === testCase.expectedRewrite) {
      passed = true;
      message = `✅ Correctly rewrote to ${result.url}`;
    } else {
      message = `❌ Expected rewrite to ${testCase.expectedRewrite}, got ${result.url}`;
    }
  } else {
    message = `❌ Unexpected result type: ${result.type}`;
  }
  
  console.log(`   ${message}`);
  if (result.language) {
    console.log(`   Language: ${result.language}`);
  }
  console.log('');
});

console.log('🏁 Language routing tests completed!');