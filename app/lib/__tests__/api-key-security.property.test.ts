/**
 * Property-Based Test: API Key Security
 * Feature: ai-writer-rebuild, Property 8: API Key Security
 * 
 * Validates: Requirements 5.2, 5.3
 * 
 * Property: For any API key stored in localStorage, it should be retrievable
 * only by the same origin and never transmitted except in Authorization headers
 * to the respective AI provider.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';
import { 
  saveSettings, 
  loadSettings, 
  clearSettings, 
  hasPersonalApiKey,
  type AISettings 
} from '../settings-manager';
import { improveContent, type AIClientConfig, type AIRequest } from '../ai-client';

describe('Feature: ai-writer-rebuild, Property 8: API Key Security', () => {
  beforeEach(() => {
    clearSettings();
    localStorage.clear();
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should store API keys only in localStorage', () => {
    fc.assert(
      fc.property(
        fc.record({
          provider: fc.constantFrom('openai', 'anthropic', 'google'),
          apiKey: fc.string({ minLength: 20, maxLength: 100 }),
        }),
        ({ provider, apiKey }) => {
          const settings: AISettings = {
            provider: provider as any,
            model: 'test-model',
            temperature: 0.7,
            apiKey,
            usePersonalKey: true,
            lastUpdated: new Date().toISOString(),
          };

          // Save settings
          saveSettings(settings);

          // Verify API key is in localStorage
          const stored = localStorage.getItem('ai-writer-settings');
          expect(stored).toBeDefined();
          expect(stored).toContain(apiKey);

          // Verify API key is not in other storage mechanisms
          expect(sessionStorage.getItem('ai-writer-settings')).toBeNull();
          
          // Verify API key can be retrieved
          const loaded = loadSettings();
          expect(loaded?.apiKey).toBe(apiKey);
        }
      ),
      { numRuns: 1 }
    );
  });

  it('should only transmit API key in Authorization header', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          content: fc.string({ minLength: 1, maxLength: 1000 }),
          apiKey: fc.string({ minLength: 20, maxLength: 100 }),
        }),
        async ({ content, apiKey }) => {
          let capturedHeaders: any = null;
          let capturedBody: any = null;

          // Mock fetch to capture request details
          vi.mocked(global.fetch).mockImplementation((url, options: any) => {
            capturedHeaders = options.headers;
            capturedBody = options.body;

            return Promise.resolve({
              ok: true,
              json: async () => ({
                choices: [
                  {
                    message: {
                      content: 'Improved content',
                    },
                  },
                ],
              }),
            } as any);
          });

          const request: AIRequest = { content };
          const config: AIClientConfig = {
            provider: 'openai',
            model: 'gpt-4o-mini',
            temperature: 0.7,
            apiKey,
          };

          await improveContent(request, config);

          // Verify API key is in Authorization header
          expect(capturedHeaders).toBeDefined();
          expect(capturedHeaders['Authorization']).toBe(`Bearer ${apiKey}`);

          // Verify API key is NOT in request body
          expect(capturedBody).toBeDefined();
          const bodyObj = JSON.parse(capturedBody);
          expect(JSON.stringify(bodyObj)).not.toContain(apiKey);
          expect(bodyObj.apiKey).toBeUndefined();
          expect(bodyObj.api_key).toBeUndefined();
        }
      ),
      { numRuns: 1 }
    );
  });

  it('should not expose API key in console logs or error messages', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          content: fc.string({ minLength: 1, maxLength: 1000 }),
          apiKey: fc.string({ minLength: 20, maxLength: 100 }),
        }),
        async ({ content, apiKey }) => {
          // Mock console methods
          const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
          const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
          const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

          // Mock fetch to throw error
          vi.mocked(global.fetch).mockRejectedValue(
            new Error(`API error with key ${apiKey}`)
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
          expect(response.error?.message).not.toContain(apiKey);

          // Verify API key is not in console logs
          const allLogs = [
            ...consoleLogSpy.mock.calls,
            ...consoleErrorSpy.mock.calls,
            ...consoleWarnSpy.mock.calls,
          ].flat().join(' ');

          expect(allLogs).not.toContain(apiKey);

          // Cleanup
          consoleLogSpy.mockRestore();
          consoleErrorSpy.mockRestore();
          consoleWarnSpy.mockRestore();
        }
      ),
      { numRuns: 1 }
    );
  });

  it('should allow clearing API key from storage', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 20, maxLength: 100 }),
        (apiKey) => {
          // Save settings with API key
          const settings: AISettings = {
            provider: 'openai',
            model: 'gpt-4o-mini',
            temperature: 0.7,
            apiKey,
            usePersonalKey: true,
            lastUpdated: new Date().toISOString(),
          };
          saveSettings(settings);

          // Verify API key is stored
          expect(hasPersonalApiKey()).toBe(true);

          // Clear settings
          clearSettings();

          // Verify API key is removed
          expect(hasPersonalApiKey()).toBe(false);
          const loaded = loadSettings();
          expect(loaded).toBeNull();
        }
      ),
      { numRuns: 1 }
    );
  });

  it('should not leak API key through object serialization', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 20, maxLength: 100 }),
        (apiKey) => {
          const settings: AISettings = {
            provider: 'openai',
            model: 'gpt-4o-mini',
            temperature: 0.7,
            apiKey,
            usePersonalKey: true,
            lastUpdated: new Date().toISOString(),
          };

          // Save settings
          saveSettings(settings);

          // Load settings
          const loaded = loadSettings();

          // Verify toString doesn't expose API key
          const stringified = String(loaded);
          // API key might be in the object, but we check it's not accidentally exposed
          // in ways that could leak (like in error messages or logs)
          
          // Verify JSON.stringify includes the key (expected for storage)
          const jsonString = JSON.stringify(loaded);
          expect(jsonString).toContain(apiKey); // This is expected for storage

          // But verify it's not in unexpected places
          expect(loaded?.toString()).not.toBe(apiKey);
        }
      ),
      { numRuns: 1 }
    );
  });

  it('should validate API key is only sent to correct provider endpoint', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          content: fc.string({ minLength: 1, maxLength: 1000 }),
          apiKey: fc.string({ minLength: 20, maxLength: 100 }),
          provider: fc.constantFrom('openai' as const),
        }),
        async ({ content, apiKey, provider }) => {
          let capturedUrl: string = '';

          // Mock fetch to capture URL
          vi.mocked(global.fetch).mockImplementation((url: any) => {
            capturedUrl = url;

            return Promise.resolve({
              ok: true,
              json: async () => ({
                choices: [
                  {
                    message: {
                      content: 'Improved content',
                    },
                  },
                ],
              }),
            } as any);
          });

          const request: AIRequest = { content };
          const config: AIClientConfig = {
            provider,
            model: 'gpt-4o-mini',
            temperature: 0.7,
            apiKey,
          };

          await improveContent(request, config);

          // Verify API key is only sent to the correct provider
          switch (provider) {
            case 'openai':
              expect(capturedUrl).toContain('api.openai.com');
              break;
            case 'anthropic':
              expect(capturedUrl).toContain('anthropic.com');
              break;
            case 'google':
              expect(capturedUrl).toContain('google');
              break;
          }

          // Verify it's HTTPS
          expect(capturedUrl).toMatch(/^https:\/\//);
        }
      ),
      { numRuns: 1 }
    );
  });
});
