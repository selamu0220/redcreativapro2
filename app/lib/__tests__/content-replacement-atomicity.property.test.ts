/**
 * Property-Based Test: Content Replacement Atomicity
 * Feature: ai-writer-rebuild, Property 9: Content Replacement Atomicity
 * 
 * Validates: Requirements 3.2
 * 
 * Property: For any successful AI improvement response, the editor content
 * should be replaced entirely with the improved version in a single operation
 * (no partial updates).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';
import { improveContent, type AIClientConfig, type AIRequest } from '../ai-client';

describe('Feature: ai-writer-rebuild, Property 9: Content Replacement Atomicity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should replace content atomically on successful response', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          originalContent: fc.string({ minLength: 1, maxLength: 1000 }),
          improvedContent: fc.string({ minLength: 1, maxLength: 1000 }),
          apiKey: fc.string({ minLength: 20, maxLength: 100 }),
        }),
        async ({ originalContent, improvedContent, apiKey }) => {
          // Mock fetch to return improved content
          vi.mocked(global.fetch).mockResolvedValue({
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

          const request: AIRequest = { content: originalContent };
          const config: AIClientConfig = {
            provider: 'openai',
            model: 'gpt-4o-mini',
            temperature: 0.7,
            apiKey,
          };

          const response = await improveContent(request, config);

          // Verify response is successful
          expect(response.success).toBe(true);
          expect(response.improvedContent).toBeDefined();

          // Verify content is exactly the improved content (atomic replacement)
          expect(response.improvedContent).toBe(improvedContent);

          // Verify no partial content (not a mix of original and improved)
          if (originalContent !== improvedContent) {
            expect(response.improvedContent).not.toContain(originalContent);
          }
        }
      ),
      { numRuns: 1 }
    );
  });

  it('should not return partial content on incomplete response', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          originalContent: fc.string({ minLength: 1, maxLength: 1000 }),
          apiKey: fc.string({ minLength: 20, maxLength: 100 }),
        }),
        async ({ originalContent, apiKey }) => {
          // Mock fetch to return incomplete/invalid response
          vi.mocked(global.fetch).mockResolvedValue({
            ok: true,
            json: async () => ({
              choices: [], // Empty choices array
            }),
          } as any);

          const request: AIRequest = { content: originalContent };
          const config: AIClientConfig = {
            provider: 'openai',
            model: 'gpt-4o-mini',
            temperature: 0.7,
            apiKey,
          };

          const response = await improveContent(request, config);

          // Verify response indicates failure
          expect(response.success).toBe(false);
          expect(response.improvedContent).toBeUndefined();

          // Verify no partial content is returned
          expect(response.error).toBeDefined();
        }
      ),
      { numRuns: 1 }
    );
  });

  it('should trim whitespace from improved content atomically', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          originalContent: fc.string({ minLength: 1, maxLength: 1000 }),
          improvedContent: fc.string({ minLength: 1, maxLength: 1000 }),
          leadingWhitespace: fc.constantFrom('', ' ', '  ', '\n', '\t', '  \n  '),
          trailingWhitespace: fc.constantFrom('', ' ', '  ', '\n', '\t', '  \n  '),
          apiKey: fc.string({ minLength: 20, maxLength: 100 }),
        }),
        async ({ originalContent, improvedContent, leadingWhitespace, trailingWhitespace, apiKey }) => {
          const contentWithWhitespace = leadingWhitespace + improvedContent + trailingWhitespace;

          // Mock fetch to return content with whitespace
          vi.mocked(global.fetch).mockResolvedValue({
            ok: true,
            json: async () => ({
              choices: [
                {
                  message: {
                    content: contentWithWhitespace,
                  },
                },
              ],
            }),
          } as any);

          const request: AIRequest = { content: originalContent };
          const config: AIClientConfig = {
            provider: 'openai',
            model: 'gpt-4o-mini',
            temperature: 0.7,
            apiKey,
          };

          const response = await improveContent(request, config);

          // Verify response is successful
          expect(response.success).toBe(true);

          // Verify whitespace is trimmed atomically
          expect(response.improvedContent).toBe(improvedContent);
          expect(response.improvedContent).not.toContain(leadingWhitespace);
          expect(response.improvedContent).not.toContain(trailingWhitespace);
        }
      ),
      { numRuns: 1 }
    );
  });

  it('should handle content replacement for various content types', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          originalContent: fc.oneof(
            fc.string({ minLength: 1, maxLength: 100 }),
            fc.lorem({ maxCount: 10 }),
            fc.constant('Hello\nWorld\n\nMultiline'),
            fc.constant('Special chars: áéíóú ñ ¿?'),
          ),
          improvedContent: fc.oneof(
            fc.string({ minLength: 1, maxLength: 100 }),
            fc.lorem({ maxCount: 10 }),
            fc.constant('Improved\nContent\n\nMultiline'),
            fc.constant('Improved: áéíóú ñ ¡!'),
          ),
          apiKey: fc.string({ minLength: 20, maxLength: 100 }),
        }),
        async ({ originalContent, improvedContent, apiKey }) => {
          // Mock fetch
          vi.mocked(global.fetch).mockResolvedValue({
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

          const request: AIRequest = { content: originalContent };
          const config: AIClientConfig = {
            provider: 'openai',
            model: 'gpt-4o-mini',
            temperature: 0.7,
            apiKey,
          };

          const response = await improveContent(request, config);

          // Verify atomic replacement for all content types
          expect(response.success).toBe(true);
          expect(response.improvedContent).toBe(improvedContent);
        }
      ),
      { numRuns: 1 }
    );
  });

  it('should not modify content on error', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          originalContent: fc.string({ minLength: 1, maxLength: 1000 }),
          apiKey: fc.string({ minLength: 20, maxLength: 100 }),
          errorStatus: fc.constantFrom(401, 429, 500, 502, 503),
        }),
        async ({ originalContent, apiKey, errorStatus }) => {
          // Mock fetch to return error
          vi.mocked(global.fetch).mockResolvedValue({
            ok: false,
            status: errorStatus,
            text: async () => `Error ${errorStatus}`,
          } as any);

          const request: AIRequest = { content: originalContent };
          const config: AIClientConfig = {
            provider: 'openai',
            model: 'gpt-4o-mini',
            temperature: 0.7,
            apiKey,
          };

          const response = await improveContent(request, config);

          // Verify no content is returned on error
          expect(response.success).toBe(false);
          expect(response.improvedContent).toBeUndefined();

          // Verify error is provided instead
          expect(response.error).toBeDefined();
        }
      ),
      { numRuns: 1 }
    );
  });

  it('should handle empty improved content atomically', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          originalContent: fc.string({ minLength: 1, maxLength: 1000 }),
          apiKey: fc.string({ minLength: 20, maxLength: 100 }),
        }),
        async ({ originalContent, apiKey }) => {
          // Mock fetch to return empty content
          vi.mocked(global.fetch).mockResolvedValue({
            ok: true,
            json: async () => ({
              choices: [
                {
                  message: {
                    content: '',
                  },
                },
              ],
            }),
          } as any);

          const request: AIRequest = { content: originalContent };
          const config: AIClientConfig = {
            provider: 'openai',
            model: 'gpt-4o-mini',
            temperature: 0.7,
            apiKey,
          };

          const response = await improveContent(request, config);

          // Verify response handles empty content
          expect(response.success).toBe(true);
          expect(response.improvedContent).toBe('');
        }
      ),
      { numRuns: 1 }
    );
  });
});
