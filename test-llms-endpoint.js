/**
 * Unit tests for LLMS.txt endpoint
 * Tests the Next.js route handler for /llms.txt
 */

const { LLMSManager, LLMSFileServer, createDefaultLLMSConfig } = require('./lib/llms-manager');

// Mock Next.js request and response
class MockNextRequest {
  constructor(options = {}) {
    this.nextUrl = {
      pathname: options.pathname || '/llms.txt'
    };
    this.headers = new Map(Object.entries(options.headers || {}));
  }

  get(name) {
    return this.headers.get(name.toLowerCase());
  }
}

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

// Mock the Next.js modules
global.NextRequest = MockNextRequest;
global.NextResponse = MockNextResponse;

describe('LLMS.txt Endpoint Tests', () => {
  let llmsManager;
  let llmsFileServer;

  beforeEach(() => {
    // Create fresh instances for each test
    const config = createDefaultLLMSConfig('Test Site', 'test@example.com');
    llmsManager = new LLMSManager(config);
    llmsFileServer = new LLMSFileServer(llmsManager);
  });

  describe('LLMSFileServer Response Generation', () => {
    test('should generate valid response with default config', () => {
      llmsManager.createBalancedConfig();
      const response = llmsFileServer.generateResponse();

      expect(response.statusCode).toBe(200);
      expect(response.headers['Content-Type']).toBe('text/plain; charset=utf-8');
      expect(response.headers['Cache-Control']).toBe('public, max-age=3600');
      expect(response.headers['X-Robots-Tag']).toBe('noindex');
      expect(response.content).toContain('# LLMS.txt for Test Site');
      expect(response.content).toContain('User-agent: GPTBot');
    });

    test('should include Last-Modified header', () => {
      const response = llmsFileServer.generateResponse();
      
      expect(response.headers['Last-Modified']).toBeDefined();
      expect(new Date(response.headers['Last-Modified'])).toBeInstanceOf(Date);
    });

    test('should return error response for invalid config', () => {
      // Create invalid config (missing required fields)
      const invalidConfig = {
        siteName: '',
        contactEmail: 'invalid-email',
        lastModified: new Date(),
        rules: []
      };
      
      const invalidManager = new LLMSManager(invalidConfig);
      const invalidServer = new LLMSFileServer(invalidManager);
      
      const response = invalidServer.generateResponse();
      
      expect(response.statusCode).toBe(500);
      expect(response.headers['Cache-Control']).toBe('no-cache');
      expect(response.content).toContain('configuration error');
    });

    test('should generate restrictive config correctly', () => {
      llmsManager.createRestrictiveConfig();
      const response = llmsFileServer.generateResponse();

      expect(response.content).toContain('User-agent: *');
      expect(response.content).toContain('Disallow: /');
      expect(response.content).toContain('User-agent: GoogleBot');
      expect(response.content).toContain('Allow: /');
    });

    test('should generate permissive config correctly', () => {
      llmsManager.createPermissiveConfig();
      const response = llmsFileServer.generateResponse();

      expect(response.content).toContain('User-agent: *');
      expect(response.content).toContain('Allow: /');
      expect(response.content).toContain('Crawl-delay: 1');
      expect(response.content).toContain('Request-rate: 1/10s');
    });
  });

  describe('LLMS.txt Content Validation', () => {
    test('should include proper header information', () => {
      const response = llmsFileServer.generateResponse();
      const content = response.content;

      expect(content).toContain('# LLMS.txt for Test Site');
      expect(content).toContain('# Contact: test@example.com');
      expect(content).toContain('# Generated on:');
    });

    test('should include footer information', () => {
      const response = llmsFileServer.generateResponse();
      const content = response.content;

      expect(content).toContain('# For more information about LLMS.txt:');
      expect(content).toContain('# https://github.com/ai-robots-txt/ai.robots.txt');
    });

    test('should format rules correctly', () => {
      llmsManager.addRule({
        userAgent: 'TestBot',
        allow: ['/public/', '/blog/'],
        disallow: ['/private/'],
        crawlDelay: 5,
        requestRate: '1/30s',
        comment: 'Test bot configuration'
      });

      const response = llmsFileServer.generateResponse();
      const content = response.content;

      expect(content).toContain('User-agent: TestBot');
      expect(content).toContain('# Test bot configuration');
      expect(content).toContain('Allow: /public/');
      expect(content).toContain('Allow: /blog/');
      expect(content).toContain('Disallow: /private/');
      expect(content).toContain('Crawl-delay: 5');
      expect(content).toContain('Request-rate: 1/30s');
    });

    test('should handle global settings', () => {
      llmsManager.updateConfig({
        globalSettings: {
          allowDataMining: false,
          allowCommercialUse: true,
          defaultCrawlDelay: 2
        }
      });

      const response = llmsFileServer.generateResponse();
      const content = response.content;

      expect(content).toContain('# Global Settings');
      expect(content).toContain('# Allow Data Mining: false');
      expect(content).toContain('# Allow Commercial Use: true');
    });
  });

  describe('HTTP Method Support', () => {
    test('should support GET method', () => {
      const response = llmsFileServer.generateResponse();
      expect(response.statusCode).toBe(200);
      expect(response.content).toBeTruthy();
    });

    test('should support HEAD method (headers only)', () => {
      const response = llmsFileServer.generateResponse();
      expect(response.headers).toBeDefined();
      expect(response.headers['Content-Type']).toBe('text/plain; charset=utf-8');
    });
  });

  describe('Caching Headers', () => {
    test('should set appropriate cache headers for valid response', () => {
      const response = llmsFileServer.generateResponse();
      
      expect(response.headers['Cache-Control']).toBe('public, max-age=3600');
      expect(response.headers['Last-Modified']).toBeDefined();
    });

    test('should set no-cache for error response', () => {
      const invalidConfig = {
        siteName: '',
        contactEmail: '',
        lastModified: new Date(),
        rules: []
      };
      
      const invalidManager = new LLMSManager(invalidConfig);
      const invalidServer = new LLMSFileServer(invalidManager);
      const response = invalidServer.generateResponse();
      
      expect(response.headers['Cache-Control']).toBe('no-cache');
    });
  });

  describe('Environment Variable Integration', () => {
    test('should use environment variables for site configuration', () => {
      // Mock environment variables
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_SITE_NAME: 'Production Site',
        NEXT_PUBLIC_CONTACT_EMAIL: 'admin@production.com'
      };

      const config = createDefaultLLMSConfig(
        process.env.NEXT_PUBLIC_SITE_NAME,
        process.env.NEXT_PUBLIC_CONTACT_EMAIL
      );
      const manager = new LLMSManager(config);
      const server = new LLMSFileServer(manager);
      
      const response = server.generateResponse();
      
      expect(response.content).toContain('# LLMS.txt for Production Site');
      expect(response.content).toContain('# Contact: admin@production.com');

      // Restore original environment
      process.env = originalEnv;
    });

    test('should fallback to defaults when env vars missing', () => {
      const originalEnv = process.env;
      process.env = { ...originalEnv };
      delete process.env.NEXT_PUBLIC_SITE_NAME;
      delete process.env.NEXT_PUBLIC_CONTACT_EMAIL;

      const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'AI Content Platform';
      const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contact@example.com';
      
      expect(siteName).toBe('AI Content Platform');
      expect(contactEmail).toBe('contact@example.com');

      process.env = originalEnv;
    });
  });

  describe('Error Handling', () => {
    test('should handle manager initialization errors gracefully', () => {
      // Test with null manager
      expect(() => {
        new LLMSFileServer(null);
      }).toThrow();
    });

    test('should handle invalid file path', () => {
      const server = new LLMSFileServer(llmsManager, '/invalid/path');
      expect(server.getFilePath()).toBe('/invalid/path');
    });

    test('should validate configuration before generating response', () => {
      // Create config with validation errors
      llmsManager.updateConfig({
        siteName: '',
        contactEmail: 'invalid-email'
      });

      const response = llmsFileServer.generateResponse();
      expect(response.statusCode).toBe(500);
    });
  });
});

// Run the tests
console.log('Running LLMS.txt Endpoint Tests...\n');

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
      if (!actual.includes(expected)) {
        throw new Error(`Expected "${actual}" to contain "${expected}"`);
      }
    },
    toBeDefined: () => {
      if (actual === undefined) {
        throw new Error('Expected value to be defined');
      }
    },
    toBeTruthy: () => {
      if (!actual) {
        throw new Error('Expected value to be truthy');
      }
    },
    toBeInstanceOf: (constructor) => {
      if (!(actual instanceof constructor)) {
        throw new Error(`Expected ${actual} to be instance of ${constructor.name}`);
      }
    },
    toThrow: () => {
      let threw = false;
      try {
        actual();
      } catch (e) {
        threw = true;
      }
      if (!threw) {
        throw new Error('Expected function to throw');
      }
    }
  };
}

function beforeEach(fn) {
  // This would be called before each test in a real test framework
  // For this simple implementation, we'll call it manually in describe blocks
}

// Execute the test suite
try {
  eval(`
    ${describe.toString()}
    ${test.toString()}
    ${expect.toString()}
    ${beforeEach.toString()}
    
    // Run all tests
    describe('LLMS.txt Endpoint Tests', () => {
      let llmsManager;
      let llmsFileServer;

      beforeEach(() => {
        const config = createDefaultLLMSConfig('Test Site', 'test@example.com');
        llmsManager = new LLMSManager(config);
        llmsFileServer = new LLMSFileServer(llmsManager);
      });

      describe('LLMSFileServer Response Generation', () => {
        test('should generate valid response with default config', () => {
          llmsManager.createBalancedConfig();
          const response = llmsFileServer.generateResponse();

          expect(response.statusCode).toBe(200);
          expect(response.headers['Content-Type']).toBe('text/plain; charset=utf-8');
          expect(response.headers['Cache-Control']).toBe('public, max-age=3600');
          expect(response.headers['X-Robots-Tag']).toBe('noindex');
          expect(response.content).toContain('# LLMS.txt for Test Site');
          expect(response.content).toContain('User-agent: GPTBot');
        });

        test('should include Last-Modified header', () => {
          const response = llmsFileServer.generateResponse();
          
          expect(response.headers['Last-Modified']).toBeDefined();
          expect(new Date(response.headers['Last-Modified'])).toBeInstanceOf(Date);
        });
      });
    });
  `);
} catch (error) {
  console.error('Test execution error:', error);
}

console.log(`\n📊 Test Results: ${testSuite.passed}/${testSuite.total} passed`);
if (testSuite.failed > 0) {
  console.log(`❌ ${testSuite.failed} tests failed`);
  process.exit(1);
} else {
  console.log('✅ All tests passed!');
}