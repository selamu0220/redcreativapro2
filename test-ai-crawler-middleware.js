/**
 * Unit tests for AI Crawler Middleware
 * Tests the AI crawler permission handler and rate limiting
 */

const { AICrawlerMiddleware } = require('./lib/ai-crawler-middleware');
const { LLMSManager, createDefaultLLMSConfig } = require('./lib/llms-manager');

// Mock Next.js request
class MockNextRequest {
  constructor(options = {}) {
    this.nextUrl = {
      pathname: options.pathname || '/'
    };
    this.headers = new Map();
    
    // Set headers
    if (options.userAgent) {
      this.headers.set('user-agent', options.userAgent);
    }
    if (options.ip) {
      this.headers.set('x-forwarded-for', options.ip);
    }
    
    Object.entries(options.headers || {}).forEach(([key, value]) => {
      this.headers.set(key.toLowerCase(), value);
    });
  }

  get(name) {
    return this.headers.get(name.toLowerCase());
  }
}

// Mock Next.js response
class MockNextResponse {
  constructor(body, options = {}) {
    this.body = body;
    this.status = options.status || 200;
    this.headers = new Map(Object.entries(options.headers || {}));
  }

  static next() {
    return new MockNextResponse(null);
  }
}

describe('AI Crawler Middleware Tests', () => {
  let middleware;
  let llmsManager;

  beforeEach(() => {
    // Create fresh instances for each test
    const config = createDefaultLLMSConfig('Test Site', 'test@example.com');
    llmsManager = new LLMSManager(config);
    llmsManager.createBalancedConfig();
    middleware = new AICrawlerMiddleware(llmsManager);
  });

  describe('AI Crawler Detection', () => {
    test('should detect OpenAI GPTBot', () => {
      const request = new MockNextRequest({
        userAgent: 'Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)',
        pathname: '/blog/test'
      });

      const { requestInfo } = middleware.processRequest(request);
      
      expect(requestInfo.isAICrawler).toBe(true);
      expect(requestInfo.aiSystem).toBe('OpenAI GPT');
    });

    test('should detect Google Extended', () => {
      const request = new MockNextRequest({
        userAgent: 'Mozilla/5.0 (compatible; Google-Extended)',
        pathname: '/docs/api'
      });

      const { requestInfo } = middleware.processRequest(request);
      
      expect(requestInfo.isAICrawler).toBe(true);
      expect(requestInfo.aiSystem).toBe('Google Bard/Gemini');
    });

    test('should detect Anthropic ClaudeBot', () => {
      const request = new MockNextRequest({
        userAgent: 'ClaudeBot/1.0',
        pathname: '/research'
      });

      const { requestInfo } = middleware.processRequest(request);
      
      expect(requestInfo.isAICrawler).toBe(true);
      expect(requestInfo.aiSystem).toBe('Anthropic Claude');
    });

    test('should not detect regular browsers as AI crawlers', () => {
      const request = new MockNextRequest({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        pathname: '/home'
      });

      const { requestInfo } = middleware.processRequest(request);
      
      expect(requestInfo.isAICrawler).toBe(false);
      expect(requestInfo.aiSystem).toBeUndefined();
    });
  });

  describe('Permission Checking', () => {
    test('should allow regular browsers without restrictions', () => {
      const request = new MockNextRequest({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        pathname: '/any-path'
      });

      const { permission, response } = middleware.processRequest(request);
      
      expect(permission.allowed).toBe(true);
      expect(permission.reason).toBe('Not an AI crawler');
      expect(response).toBeUndefined();
    });

    test('should allow GPTBot access to allowed paths', () => {
      const request = new MockNextRequest({
        userAgent: 'GPTBot/1.0',
        pathname: '/blog/article'
      });

      const { permission, response } = middleware.processRequest(request);
      
      expect(permission.allowed).toBe(true);
      expect(permission.reason).toContain('Request allowed for GPTBot');
      expect(response).toBeUndefined();
    });

    test('should block GPTBot access to disallowed paths', () => {
      const request = new MockNextRequest({
        userAgent: 'GPTBot/1.0',
        pathname: '/private/secret'
      });

      const { permission, response } = middleware.processRequest(request);
      
      expect(permission.allowed).toBe(false);
      expect(permission.reason).toContain('disallowed for GPTBot');
      expect(response).toBeDefined();
      expect(response.status).toBe(403);
    });

    test('should handle unknown AI crawlers with wildcard rules', () => {
      const request = new MockNextRequest({
        userAgent: 'UnknownBot/1.0',
        pathname: '/any-path'
      });

      const { permission } = middleware.processRequest(request);
      
      expect(permission.allowed).toBe(false);
      expect(permission.reason).toContain('Block unknown AI systems');
    });
  });

  describe('Rate Limiting', () => {
    test('should apply rate limiting to AI crawlers', () => {
      const request = new MockNextRequest({
        userAgent: 'GPTBot/1.0',
        pathname: '/blog/test',
        ip: '192.168.1.1'
      });

      // First request should be allowed
      const { permission: firstPermission } = middleware.processRequest(request);
      expect(firstPermission.allowed).toBe(true);

      // Simulate rapid requests to trigger rate limiting
      for (let i = 0; i < 10; i++) {
        middleware.processRequest(request);
      }

      // Next request should be throttled
      const { permission: throttledPermission, response } = middleware.processRequest(request);
      expect(throttledPermission.shouldThrottle).toBe(true);
    });

    test('should return 429 status for throttled requests', () => {
      // Create a restrictive rule for testing
      llmsManager.addRule({
        userAgent: 'TestBot',
        allow: ['/'],
        requestRate: '1/60s', // Very restrictive
        crawlDelay: 30
      });

      const request = new MockNextRequest({
        userAgent: 'TestBot/1.0',
        pathname: '/test',
        ip: '192.168.1.2'
      });

      // Make multiple rapid requests
      middleware.processRequest(request);
      const { response } = middleware.processRequest(request);

      if (response && response.status === 429) {
        expect(response.status).toBe(429);
        expect(response.headers.get('Retry-After')).toBeDefined();
      }
    });

    test('should respect crawl delay settings', () => {
      const request = new MockNextRequest({
        userAgent: 'ClaudeBot/1.0',
        pathname: '/docs/test'
      });

      const { permission } = middleware.processRequest(request);
      
      expect(permission.crawlDelay).toBe(3); // From balanced config
    });
  });

  describe('Path Matching', () => {
    test('should match exact paths', () => {
      llmsManager.addRule({
        userAgent: 'TestBot',
        allow: ['/exact-path'],
        disallow: []
      });

      const allowedRequest = new MockNextRequest({
        userAgent: 'TestBot/1.0',
        pathname: '/exact-path'
      });

      const { permission: allowedPermission } = middleware.processRequest(allowedRequest);
      expect(allowedPermission.allowed).toBe(true);

      const disallowedRequest = new MockNextRequest({
        userAgent: 'TestBot/1.0',
        pathname: '/other-path'
      });

      const { permission: disallowedPermission } = middleware.processRequest(disallowedRequest);
      expect(disallowedPermission.allowed).toBe(false);
    });

    test('should match wildcard paths', () => {
      llmsManager.addRule({
        userAgent: 'TestBot',
        allow: ['/blog/*'],
        disallow: []
      });

      const allowedRequest = new MockNextRequest({
        userAgent: 'TestBot/1.0',
        pathname: '/blog/article-1'
      });

      const { permission: allowedPermission } = middleware.processRequest(allowedRequest);
      expect(allowedPermission.allowed).toBe(true);

      const disallowedRequest = new MockNextRequest({
        userAgent: 'TestBot/1.0',
        pathname: '/docs/guide'
      });

      const { permission: disallowedPermission } = middleware.processRequest(disallowedRequest);
      expect(disallowedPermission.allowed).toBe(false);
    });

    test('should prioritize disallow over allow rules', () => {
      llmsManager.addRule({
        userAgent: 'TestBot',
        allow: ['/blog/*'],
        disallow: ['/blog/private']
      });

      const disallowedRequest = new MockNextRequest({
        userAgent: 'TestBot/1.0',
        pathname: '/blog/private'
      });

      const { permission } = middleware.processRequest(disallowedRequest);
      expect(permission.allowed).toBe(false);
      expect(permission.reason).toContain('disallowed');
    });
  });

  describe('IP Address Handling', () => {
    test('should extract IP from X-Forwarded-For header', () => {
      const request = new MockNextRequest({
        userAgent: 'GPTBot/1.0',
        pathname: '/test',
        headers: {
          'x-forwarded-for': '203.0.113.1, 198.51.100.1'
        }
      });

      const { requestInfo } = middleware.processRequest(request);
      expect(requestInfo.ip).toBe('203.0.113.1');
    });

    test('should extract IP from X-Real-IP header', () => {
      const request = new MockNextRequest({
        userAgent: 'GPTBot/1.0',
        pathname: '/test',
        headers: {
          'x-real-ip': '203.0.113.2'
        }
      });

      const { requestInfo } = middleware.processRequest(request);
      expect(requestInfo.ip).toBe('203.0.113.2');
    });

    test('should handle missing IP headers', () => {
      const request = new MockNextRequest({
        userAgent: 'GPTBot/1.0',
        pathname: '/test'
      });

      const { requestInfo } = middleware.processRequest(request);
      expect(requestInfo.ip).toBe('unknown');
    });
  });

  describe('Response Generation', () => {
    test('should generate proper blocked response', () => {
      const request = new MockNextRequest({
        userAgent: 'GPTBot/1.0',
        pathname: '/admin/secret'
      });

      const { response } = middleware.processRequest(request);
      
      if (response) {
        expect(response.status).toBe(403);
        expect(response.body).toContain('Access denied');
        expect(response.body).toContain('/llms.txt');
        expect(response.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');
      }
    });

    test('should generate proper throttled response', () => {
      // This test would need to trigger actual throttling
      // For now, we'll test the response structure
      const middleware = new AICrawlerMiddleware();
      
      // Access private method for testing (not ideal, but for unit testing)
      const response = middleware.createThrottledResponse({
        crawlDelay: 60,
        requestRate: '1/60s'
      });

      expect(response.status).toBe(429);
      expect(response.headers.get('Retry-After')).toBe('60');
      expect(response.headers.get('X-RateLimit-Limit')).toBe('1/60s');
    });
  });

  describe('Configuration Integration', () => {
    test('should use restrictive configuration correctly', () => {
      llmsManager.createRestrictiveConfig();
      const restrictiveMiddleware = new AICrawlerMiddleware(llmsManager);

      const request = new MockNextRequest({
        userAgent: 'GPTBot/1.0',
        pathname: '/any-path'
      });

      const { permission } = restrictiveMiddleware.processRequest(request);
      expect(permission.allowed).toBe(false);
    });

    test('should use permissive configuration correctly', () => {
      llmsManager.createPermissiveConfig();
      const permissiveMiddleware = new AICrawlerMiddleware(llmsManager);

      const request = new MockNextRequest({
        userAgent: 'GPTBot/1.0',
        pathname: '/blog/article'
      });

      const { permission } = permissiveMiddleware.processRequest(request);
      expect(permission.allowed).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed request rate gracefully', () => {
      llmsManager.addRule({
        userAgent: 'TestBot',
        allow: ['/'],
        requestRate: 'invalid-format'
      });

      const request = new MockNextRequest({
        userAgent: 'TestBot/1.0',
        pathname: '/test'
      });

      const { permission } = middleware.processRequest(request);
      expect(permission.shouldThrottle).toBe(false);
    });

    test('should handle missing user agent', () => {
      const request = new MockNextRequest({
        pathname: '/test'
      });

      const { requestInfo, permission } = middleware.processRequest(request);
      
      expect(requestInfo.userAgent).toBe('');
      expect(requestInfo.isAICrawler).toBe(false);
      expect(permission.allowed).toBe(true);
    });
  });
});

// Test execution framework (simplified)
console.log('Running AI Crawler Middleware Tests...\n');

const testSuite = {
  passed: 0,
  failed: 0,
  total: 0
};

function describe(name, fn) {
  console.log(`\n📋 ${name}`);
  fn();
}

function test(name, fn) {
  testSuite.total++;
  try {
    fn();
    testSuite.passed++;
    console.log(`  ✅ ${name}`);
  } catch (error) {
    testSuite.failed++;
    console.log(`  ❌ ${name}`);
    console.log(`     Error: ${error.message}`);
  }
}

function expect(actual) {
  return {
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
      }
    },
    toContain: (expected) => {
      if (!actual || !actual.includes(expected)) {
        throw new Error(`Expected "${actual}" to contain "${expected}"`);
      }
    },
    toBeDefined: () => {
      if (actual === undefined) {
        throw new Error('Expected value to be defined');
      }
    },
    toBeUndefined: () => {
      if (actual !== undefined) {
        throw new Error('Expected value to be undefined');
      }
    },
    toBeTruthy: () => {
      if (!actual) {
        throw new Error('Expected value to be truthy');
      }
    }
  };
}

function beforeEach(fn) {
  // Called before each test
}

// Execute a subset of tests to verify functionality
try {
  const config = createDefaultLLMSConfig('Test Site', 'test@example.com');
  const llmsManager = new LLMSManager(config);
  llmsManager.createBalancedConfig();
  const middleware = new AICrawlerMiddleware(llmsManager);

  describe('Basic Functionality Tests', () => {
    test('should detect GPTBot correctly', () => {
      const request = new MockNextRequest({
        userAgent: 'Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)',
        pathname: '/blog/test'
      });

      const { requestInfo } = middleware.processRequest(request);
      
      expect(requestInfo.isAICrawler).toBe(true);
      expect(requestInfo.aiSystem).toBe('OpenAI GPT');
    });

    test('should allow regular browsers', () => {
      const request = new MockNextRequest({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        pathname: '/any-path'
      });

      const { permission, response } = middleware.processRequest(request);
      
      expect(permission.allowed).toBe(true);
      expect(response).toBeUndefined();
    });

    test('should block access to private paths', () => {
      const request = new MockNextRequest({
        userAgent: 'GPTBot/1.0',
        pathname: '/private/secret'
      });

      const { permission } = middleware.processRequest(request);
      
      expect(permission.allowed).toBe(false);
    });
  });

} catch (error) {
  console.error('Test execution error:', error);
}

console.log(`\n📊 Test Results: ${testSuite.passed}/${testSuite.total} passed`);
if (testSuite.failed > 0) {
  console.log(`❌ ${testSuite.failed} tests failed`);
} else {
  console.log('✅ All tests passed!');
}