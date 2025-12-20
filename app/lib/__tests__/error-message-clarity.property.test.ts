/**
 * Property-Based Test: Error Message Clarity
 * Feature: ai-writer-rebuild, Property 5: Error Message Clarity
 * 
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4
 * 
 * Property: For any error condition (network, authentication, validation),
 * the system should display a user-friendly error message that explains
 * the problem without exposing technical details.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';
import { improveContent, type AIClientConfig, type AIRequest } from '../ai-client';

describe('Feature: ai-writer-rebuild, Property 5: Error Message Clarity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should return user-friendly messages for HTTP error codes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          content: fc.string({ minLength: 1, maxLength: 1000 }),
          apiKey: fc.string({ minLength: 10, maxLength: 100 }),
          statusCode: fc.constantFrom(401, 429, 500, 502, 503),
        }),
        async ({ content, apiKey, statusCode }) => {
          // Mock fetch to return error status
          vi.mocked(global.fetch).mockResolvedValue({
            ok: false,
            status: statusCode,
            text: async () => `HTTP ${statusCode} Error`,
          } as any);

          const request: AIRequest = { content };
          const config: AIClientConfig = {
            provider: 'openai',
            model: 'gpt-4o-mini',
            temperature: 0.7,
            apiKey,
          };

          const response = await improveContent(request, config);

          // Verify error response
          expect(response.success).toBe(false);
          expect(response.error).toBeDefined();
          expect(response.error?.userMessage).toBeDefined();

          // Verify message is in Spanish
          expect(response.error?.userMessage).toMatch(/[áéíóúñ]|Por favor|intenta|de nuevo/i);

          // Verify message doesn't contain technical details
          expect(response.error?.userMessage).not.toContain('HTTP');
          expect(response.error?.userMessage).not.toContain('fetch');
          expect(response.error?.userMessage).not.toContain('Error:');
          expect(response.error?.userMessage).not.toContain('stack');

          // Verify specific error messages
          switch (statusCode) {
            case 401:
              expect(response.error?.code).toBe('UNAUTHORIZED');
              expect(response.error?.userMessage).toContain('API key');
              break;
            case 429:
              expect(response.error?.code).toBe('RATE_LIMIT');
              expect(response.error?.userMessage).toContain('Límite');
              break;
            case 500:
            case 502:
            case 503:
              expect(response.error?.code).toBe('SERVER_ERROR');
              expect(response.error?.userMessage).toContain('temporalmente');
              break;
          }
        }
      ),
      { numRuns: 1 }
    );
  });

  it('should return clear validation error for empty content', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('', '   ', '\t', '\n', '  \n  \t  '),
        fc.string({ minLength: 10, maxLength: 100 }),
        async (emptyContent, apiKey) => {
          const request: AIRequest = { content: emptyContent };
          const config: AIClientConfig = {
            provider: 'openai',
            model: 'gpt-4o-mini',
            temperature: 0.7,
            apiKey,
          };

          const response = await improveContent(request, config);

          // Verify error response
          expect(response.success).toBe(false);
          expect(response.error).toBeDefined();
          expect(response.error?.code).toBe('EMPTY_CONTENT');
          expect(response.error?.userMessage).toContain('texto');
          expect(response.error?.userMessage).not.toContain('undefined');
          expect(response.error?.userMessage).not.toContain('null');
        }
      ),
      { numRuns: 1 }
    );
  });

  it('should return clear error for missing API key', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 1000 }),
        async (content) => {
          const request: AIRequest = { content };
          const config: AIClientConfig = {
            provider: 'openai',
            model: 'gpt-4o-mini',
            temperature: 0.7,
            apiKey: '', // Empty API key
          };

          const response = await improveContent(request, config);

          // Verify error response
          expect(response.success).toBe(false);
          expect(response.error).toBeDefined();
          expect(response.error?.code).toBe('MISSING_API_KEY');
          expect(response.error?.userMessage).toContain('API key');
          expect(response.error?.userMessage).toContain('configuración');
          expect(response.error?.userMessage).not.toContain('undefined');
          expect(response.error?.userMessage).not.toContain('null');
        }
      ),
      { numRuns: 1 }
    );
  });

  it('should provide actionable guidance in error messages', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          content: fc.string({ minLength: 1, maxLength: 1000 }),
          apiKey: fc.string({ minLength: 10, maxLength: 100 }),
          errorType: fc.constantFrom('network', 'auth', 'rate-limit', 'server'),
        }),
        async ({ content, apiKey, errorType }) => {
          // Mock different error types
          switch (errorType) {
            case 'network':
              vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));
              break;
            case 'auth':
              vi.mocked(global.fetch).mockResolvedValue({
                ok: false,
                status: 401,
                text: async () => 'Unauthorized',
              } as any);
              break;
            case 'rate-limit':
              vi.mocked(global.fetch).mockResolvedValue({
                ok: false,
                status: 429,
                text: async () => 'Rate limit exceeded',
              } as any);
              break;
            case 'server':
              vi.mocked(global.fetch).mockResolvedValue({
                ok: false,
                status: 500,
                text: async () => 'Internal server error',
              } as any);
              break;
          }

          const request: AIRequest = { content };
          const config: AIClientConfig = {
            provider: 'openai',
            model: 'gpt-4o-mini',
            temperature: 0.7,
            apiKey,
          };

          const response = await improveContent(request, config);

          // Verify error response has actionable guidance
          expect(response.success).toBe(false);
          expect(response.error).toBeDefined();
          expect(response.error?.userMessage).toBeDefined();

          // Check for actionable words
          const actionableWords = [
            'verifica',
            'intenta',
            'configura',
            'espera',
            'Por favor',
          ];

          const hasActionableGuidance = actionableWords.some((word) =>
            response.error?.userMessage.toLowerCase().includes(word.toLowerCase())
          );

          expect(hasActionableGuidance).toBe(true);
        }
      ),
      { numRuns: 1 }
    );
  });

  it('should never expose API keys or sensitive data in error messages', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          content: fc.string({ minLength: 1, maxLength: 1000 }),
          apiKey: fc.string({ minLength: 20, maxLength: 100 }),
        }),
        async ({ content, apiKey }) => {
          // Mock various error scenarios
          vi.mocked(global.fetch).mockRejectedValue(
            new Error(`API call failed with key: ${apiKey}`)
          );

          const request: AIRequest = { content };
          const config: AIClientConfig = {
            provider: 'openai',
            model: 'gpt-4o-mini',
            temperature: 0.7,
            apiKey,
          };

          const response = await improveContent(request, config);

          // Verify API key is not in error message
          expect(response.error?.userMessage).not.toContain(apiKey);
          expect(response.error?.userMessage).not.toContain(apiKey.substring(0, 10));

          // Verify no sensitive patterns
          expect(response.error?.userMessage).not.toMatch(/sk-[a-zA-Z0-9]+/);
          expect(response.error?.userMessage).not.toMatch(/Bearer [a-zA-Z0-9]+/);
        }
      ),
      { numRuns: 1 }
    );
  });
});
