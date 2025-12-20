/**
 * Property-Based Test: API Call Timeout
 * Feature: ai-writer-rebuild, Property 4: API Call Timeout
 * 
 * Validates: Requirements 9.3
 * 
 * Property: For any AI improvement request, if the API does not respond within
 * 30 seconds, the system should abort the request and display a timeout error message.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';
import { improveContent, type AIClientConfig, type AIRequest } from '../ai-client';

describe('Feature: ai-writer-rebuild, Property 4: API Call Timeout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should timeout after 30 seconds for any request', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          content: fc.string({ minLength: 1, maxLength: 1000 }),
          provider: fc.constantFrom('openai' as const),
          model: fc.string({ minLength: 1, maxLength: 50 }),
          temperature: fc.float({ min: 0, max: 1 }),
          apiKey: fc.string({ minLength: 10, maxLength: 100 }),
        }),
        async ({ content, provider, model, temperature, apiKey }) => {
          // Mock fetch to simulate a slow response (never resolves)
          const slowPromise = new Promise(() => {
            // Never resolves - simulates hanging request
          });

          vi.mocked(global.fetch).mockReturnValue(slowPromise as any);

          const request: AIRequest = { content };
          const config: AIClientConfig = { provider, model, temperature, apiKey };

          // Start timer
          const startTime = Date.now();

          // Call improveContent
          const response = await improveContent(request, config);

          // Calculate elapsed time
          const elapsedTime = Date.now() - startTime;

          // Verify timeout occurred (should be around 30 seconds, allow some margin)
          expect(elapsedTime).toBeGreaterThanOrEqual(29000);
          expect(elapsedTime).toBeLessThan(32000);

          // Verify error response
          expect(response.success).toBe(false);
          expect(response.error).toBeDefined();
          expect(response.error?.code).toBe('TIMEOUT');
          expect(response.error?.userMessage).toContain('tardó demasiado');
        }
      ),
      { numRuns: 1 } // Reduced runs due to 30-second timeout per test
    );
  }, 120000); // 120 second timeout for the test itself (3 runs * 30 seconds + buffer)

  it('should abort the request when timeout occurs', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          content: fc.string({ minLength: 1, maxLength: 1000 }),
          apiKey: fc.string({ minLength: 10, maxLength: 100 }),
        }),
        async ({ content, apiKey }) => {
          let abortCalled = false;

          // Mock fetch to track abort signal
          vi.mocked(global.fetch).mockImplementation((url, options: any) => {
            // Check if abort signal is provided
            expect(options.signal).toBeDefined();

            // Listen for abort event
            options.signal.addEventListener('abort', () => {
              abortCalled = true;
            });

            // Return a promise that never resolves
            return new Promise(() => {}) as any;
          });

          const request: AIRequest = { content };
          const config: AIClientConfig = {
            provider: 'openai',
            model: 'gpt-4o-mini',
            temperature: 0.7,
            apiKey,
          };

          // Call improveContent
          await improveContent(request, config);

          // Verify abort was called
          expect(abortCalled).toBe(true);
        }
      ),
      { numRuns: 1 } // Reduced runs due to timeout
    );
  }, 120000);

  it('should complete successfully if response arrives before timeout', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          content: fc.string({ minLength: 1, maxLength: 1000 }),
          improvedContent: fc.string({ minLength: 1, maxLength: 1000 }),
          apiKey: fc.string({ minLength: 10, maxLength: 100 }),
          responseDelay: fc.integer({ min: 100, max: 5000 }), // 0.1 to 5 seconds
        }),
        async ({ content, improvedContent, apiKey, responseDelay }) => {
          // Mock fetch to return after a delay (but before timeout)
          vi.mocked(global.fetch).mockImplementation(() => {
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve({
                  ok: true,
                  json: async () => ({
                    choices: [
                      {
                        message: {
                          content: improvedContent,
                        },
                      },
                    ],
                  }),
                } as any);
              }, responseDelay);
            });
          });

          const request: AIRequest = { content };
          const config: AIClientConfig = {
            provider: 'openai',
            model: 'gpt-4o-mini',
            temperature: 0.7,
            apiKey,
          };

          const startTime = Date.now();
          const response = await improveContent(request, config);
          const elapsedTime = Date.now() - startTime;

          // Verify success
          expect(response.success).toBe(true);
          expect(response.improvedContent).toBe(improvedContent);

          // Verify it completed before timeout
          expect(elapsedTime).toBeLessThan(30000);
        }
      ),
      { numRuns: 1 }
    );
  });
});
