/**
 * Property-Based Test for Language Context Initialization
 * Feature: herramientas-ia-500-error-fix, Property 2: Language Context Initialization
 * 
 * This test validates that for any supported language, the language context 
 * should initialize properly and provide valid translation functions.
 * 
 * **Validates: Requirements 1.2, 2.1, 2.3**
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import * as fc from 'fast-check';
import React from 'react';

import { LanguageProvider, useLanguage } from '../language/context';
import { SUPPORTED_LANGUAGES, TRANSLATION_NAMESPACES, DEFAULT_LANGUAGE } from '../language/config';
import type { LanguageCode, TranslationNamespace } from '../language/config';
import { ErrorRecoveryManager } from '../language/ErrorRecoveryManager';
import { FallbackTranslationSystem } from '../language/FallbackTranslationSystem';

// Mock Next.js router
const mockPush = vi.fn();
const mockRouter = {
  push: mockPush,
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
  route: '/',
  events: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
};

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

// Mock the routing utilities
vi.mock('../language/routing', () => ({
  getCurrentLanguageFromURL: vi.fn(() => null),
  removeLanguageFromPath: vi.fn((path: string) => path.replace(/^\/[a-z]{2}/, '') || '/'),
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock fetch for translation loading
global.fetch = vi.fn();

// Test component that uses the language context
const TestComponent: React.FC<{ testId?: string }> = ({ testId = 'test-component' }) => {
  const { currentLanguage, isLoading, isReady, error, t, fallbackMode } = useLanguage();
  
  return (
    <div data-testid={testId}>
      <div data-testid="current-language">{currentLanguage}</div>
      <div data-testid="is-loading">{isLoading.toString()}</div>
      <div data-testid="is-ready">{isReady.toString()}</div>
      <div data-testid="fallback-mode">{fallbackMode.toString()}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <div data-testid="translation-test">{t('test.key', 'common')}</div>
    </div>
  );
};

describe('Language Context Initialization Property Tests', () => {
  let errorRecoveryManager: ErrorRecoveryManager;
  let fallbackSystem: FallbackTranslationSystem;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    
    // Reset singletons
    errorRecoveryManager = ErrorRecoveryManager.getInstance();
    fallbackSystem = FallbackTranslationSystem.getInstance();
    
    // Mock successful translation loading by default
    (global.fetch as any).mockImplementation((url: string) => {
      const mockTranslations = {
        'test.key': 'Test Value',
        'loading': 'Loading...',
        'error': 'Error occurred',
        'common.title': 'Common Title',
      };
      
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTranslations),
      });
    });

    // Mock fallback system methods
    vi.spyOn(fallbackSystem, 'getFallbackTranslation').mockImplementation(
      (key: string, namespace: string, language: string) => key
    );
    
    vi.spyOn(fallbackSystem, 'getMinimalFallbackTranslations').mockImplementation(
      (namespace: string) => ({
        'loading': 'Loading...',
        'error': 'Error occurred',
        'test.key': 'Fallback Value',
      })
    );

    vi.spyOn(fallbackSystem, 'loadFallbackTranslations').mockImplementation(
      (language: string, namespace?: string, options?: any) => {
        return Promise.resolve({
          'test.key': `Test Value for ${language}`,
          'loading': 'Loading...',
          'error': 'Error occurred',
        });
      }
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Property 2: Language Context Initialization
   * For any supported language, the language context should initialize properly 
   * and provide valid translation functions
   */
  it('should initialize properly for any supported language', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...Object.keys(SUPPORTED_LANGUAGES) as LanguageCode[]),
        async (language: LanguageCode) => {
          // Arrange: Set up the test environment for the given language
          const { unmount } = render(
            <LanguageProvider initialLanguage={language}>
              <TestComponent testId={`test-${language}`} />
            </LanguageProvider>
          );

          try {
            // Act & Assert: Wait for initialization to complete
            await waitFor(
              () => {
                const currentLang = screen.getByTestId('current-language');
                const isReady = screen.getByTestId('is-ready');
                const error = screen.getByTestId('error');
                
                // The context should initialize with the correct language
                expect(currentLang.textContent).toBe(language);
                
                // The context should eventually become ready (either normally or in fallback mode)
                expect(isReady.textContent).toBe('true');
                
                // There should be no critical errors that prevent initialization
                expect(error.textContent).not.toContain('Critical initialization error');
              },
              { timeout: 5000 }
            );

            // Verify that translation function works
            const translationTest = screen.getByTestId('translation-test');
            expect(translationTest.textContent).toBeTruthy();
            expect(translationTest.textContent).not.toBe('');

            // Verify that the context provides a valid translation function
            const translationElement = screen.getByTestId('translation-test');
            expect(typeof translationElement.textContent).toBe('string');

          } finally {
            unmount();
          }
        }
      ),
      { 
        numRuns: 100, // Test with 100 different language combinations
        timeout: 10000,
        verbose: true
      }
    );
  });

  /**
   * Property: Context provides valid translation functions for any namespace
   * For any supported language and namespace combination, the translation function
   * should return a valid string value
   */
  it('should provide valid translation functions for any language-namespace combination', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...Object.keys(SUPPORTED_LANGUAGES) as LanguageCode[]),
        fc.constantFrom(...TRANSLATION_NAMESPACES),
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-zA-Z][a-zA-Z0-9._-]*$/.test(s)),
        async (language: LanguageCode, namespace: TranslationNamespace, translationKey: string) => {
          // Create a test component that uses the specific namespace and key
          const NamespaceTestComponent = () => {
            const { t, isReady, currentLanguage } = useLanguage();
            
            if (!isReady) {
              return <div data-testid="loading">Loading...</div>;
            }
            
            const translatedValue = t(translationKey, namespace);
            
            return (
              <div>
                <div data-testid="language">{currentLanguage}</div>
                <div data-testid="namespace">{namespace}</div>
                <div data-testid="key">{translationKey}</div>
                <div data-testid="translation">{translatedValue}</div>
              </div>
            );
          };

          const { unmount } = render(
            <LanguageProvider initialLanguage={language}>
              <NamespaceTestComponent />
            </LanguageProvider>
          );

          try {
            await waitFor(
              () => {
                const languageElement = screen.getByTestId('language');
                const translationElement = screen.getByTestId('translation');
                
                // Verify the language is set correctly
                expect(languageElement.textContent).toBe(language);
                
                // Verify the translation function returns a string
                expect(typeof translationElement.textContent).toBe('string');
                
                // Verify the translation is not empty (should at least return the key as fallback)
                expect(translationElement.textContent).toBeTruthy();
                
                // Verify the translation function doesn't throw errors (implicit by reaching this point)
                expect(translationElement.textContent.length).toBeGreaterThan(0);
              },
              { timeout: 5000 }
            );
          } finally {
            unmount();
          }
        }
      ),
      { 
        numRuns: 50, // Test with 50 different combinations
        timeout: 15000,
        verbose: true
      }
    );
  });

  /**
   * Property: Context handles initialization errors gracefully
   * For any supported language, if translation loading fails, the context should
   * still initialize in fallback mode and provide working translation functions
   */
  it('should handle initialization errors gracefully for any language', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...Object.keys(SUPPORTED_LANGUAGES) as LanguageCode[]),
        fc.boolean(), // Whether to simulate network error
        fc.boolean(), // Whether to simulate malformed response
        async (language: LanguageCode, simulateNetworkError: boolean, simulateMalformedResponse: boolean) => {
          // Mock fetch to simulate different error conditions
          if (simulateNetworkError) {
            (global.fetch as any).mockRejectedValue(new Error('Network error'));
          } else if (simulateMalformedResponse) {
            (global.fetch as any).mockResolvedValue({
              ok: false,
              status: 500,
              json: () => Promise.reject(new Error('Invalid JSON')),
            });
          }

          const ErrorTestComponent = () => {
            const { currentLanguage, isReady, fallbackMode, t, error } = useLanguage();
            
            return (
              <div>
                <div data-testid="current-language">{currentLanguage}</div>
                <div data-testid="is-ready">{isReady.toString()}</div>
                <div data-testid="fallback-mode">{fallbackMode.toString()}</div>
                <div data-testid="error-state">{error || 'no-error'}</div>
                <div data-testid="translation-works">{t('test.key', 'common')}</div>
              </div>
            );
          };

          const { unmount } = render(
            <LanguageProvider initialLanguage={language}>
              <ErrorTestComponent />
            </LanguageProvider>
          );

          try {
            await waitFor(
              () => {
                const currentLang = screen.getByTestId('current-language');
                const isReady = screen.getByTestId('is-ready');
                const translationWorks = screen.getByTestId('translation-works');
                
                // Even with errors, the context should eventually become ready
                expect(isReady.textContent).toBe('true');
                
                // The language should be set (might fallback to default)
                expect(currentLang.textContent).toBeTruthy();
                expect(Object.keys(SUPPORTED_LANGUAGES)).toContain(currentLang.textContent);
                
                // Translation function should still work (return key or fallback)
                expect(translationWorks.textContent).toBeTruthy();
                expect(typeof translationWorks.textContent).toBe('string');
                
                // Should not crash or throw unhandled errors
                expect(translationWorks.textContent.length).toBeGreaterThan(0);
              },
              { timeout: 8000 }
            );
          } finally {
            unmount();
          }
        }
      ),
      { 
        numRuns: 30, // Test with 30 different error scenarios
        timeout: 20000,
        verbose: true
      }
    );
  });

  /**
   * Property: Context initialization is deterministic for the same inputs
   * For any given language, multiple initializations should produce consistent results
   */
  it('should produce consistent initialization results for the same language', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...Object.keys(SUPPORTED_LANGUAGES) as LanguageCode[]),
        async (language: LanguageCode) => {
          const results: Array<{
            currentLanguage: string;
            isReady: boolean;
            translationWorks: boolean;
          }> = [];

          // Initialize the context multiple times with the same language
          for (let i = 0; i < 3; i++) {
            const TestComponent = () => {
              const { currentLanguage, isReady, t } = useLanguage();
              
              return (
                <div>
                  <div data-testid={`language-${i}`}>{currentLanguage}</div>
                  <div data-testid={`ready-${i}`}>{isReady.toString()}</div>
                  <div data-testid={`translation-${i}`}>{t('test.key', 'common')}</div>
                </div>
              );
            };

            const { unmount } = render(
              <LanguageProvider initialLanguage={language}>
                <TestComponent />
              </LanguageProvider>
            );

            try {
              await waitFor(
                () => {
                  const langElement = screen.getByTestId(`language-${i}`);
                  const readyElement = screen.getByTestId(`ready-${i}`);
                  const translationElement = screen.getByTestId(`translation-${i}`);
                  
                  expect(readyElement.textContent).toBe('true');
                  
                  results.push({
                    currentLanguage: langElement.textContent || '',
                    isReady: readyElement.textContent === 'true',
                    translationWorks: Boolean(translationElement.textContent),
                  });
                },
                { timeout: 5000 }
              );
            } finally {
              unmount();
            }
          }

          // All results should be consistent
          const firstResult = results[0];
          results.forEach((result, index) => {
            expect(result.currentLanguage).toBe(firstResult.currentLanguage);
            expect(result.isReady).toBe(firstResult.isReady);
            expect(result.translationWorks).toBe(firstResult.translationWorks);
          });
        }
      ),
      { 
        numRuns: 20, // Test consistency across 20 different languages
        timeout: 30000,
        verbose: true
      }
    );
  });
});
