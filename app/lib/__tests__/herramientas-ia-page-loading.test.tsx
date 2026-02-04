import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import { LanguageProvider } from '../language/context';
import { LanguageCode, SUPPORTED_LANGUAGES } from '../language/config';

// Mock Next.js components and hooks
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock the MainNavigation and Footer components
vi.mock('../../components/MainNavigation', () => ({
  MainNavigation: () => <nav data-testid="main-navigation">Navigation</nav>,
}));

vi.mock('../../components/Footer', () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

// Mock translation loading
vi.mock('../language/utils', () => ({
  getInitialLanguage: () => 'es' as LanguageCode,
  saveLanguageToStorage: vi.fn(),
  loadTranslations: vi.fn().mockResolvedValue({
    'navigation.aiWriter': 'Escritor IA',
    'navigation.aiEmails': 'Correos IA',
  }),
  getNestedTranslation: (translations: any, key: string) => translations[key],
  interpolateString: (str: string) => str,
  redetectBrowserLanguage: vi.fn(),
}));

// Import the component after mocking
const HerramientasIAPage = require('../../herramientas-ia-copywriting/page').default;

describe('Herramientas IA Page Loading Reliability', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Property 1: Page Loading Reliability
   * For any valid language-page combination, navigating to the internationalized URL 
   * should result in successful page loading without 500 errors
   * Validates: Requirements 1.1
   * Feature: herramientas-ia-500-error-fix, Property 1: Page Loading Reliability
   */
  it('should load successfully for any supported language without throwing errors', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...Object.keys(SUPPORTED_LANGUAGES) as LanguageCode[]),
        async (language: LanguageCode) => {
          // Arrange: Create a language provider with the given language
          const TestComponent = () => (
            <LanguageProvider initialLanguage={language}>
              <HerramientasIAPage />
            </LanguageProvider>
          );

          // Act & Assert: The page should render without throwing errors
          let renderResult;
          expect(() => {
            renderResult = render(<TestComponent />);
          }).not.toThrow();

          // Verify essential elements are present
          expect(screen.getByTestId('main-navigation')).toBeInTheDocument();
          expect(screen.getByTestId('footer')).toBeInTheDocument();
          
          // Verify the main heading is present
          expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
          
          // Verify that tool cards are rendered
          const toolLinks = screen.getAllByRole('link');
          expect(toolLinks.length).toBeGreaterThan(0);

          // Cleanup
          if (renderResult) {
            renderResult.unmount();
          }
        }
      ),
      { 
        numRuns: 100,
        verbose: true 
      }
    );
  });

  it('should handle translation loading failures gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...Object.keys(SUPPORTED_LANGUAGES) as LanguageCode[]),
        fc.boolean(), // Simulate translation loading failure
        async (language: LanguageCode, shouldFailTranslation: boolean) => {
          // Mock translation loading to potentially fail
          const mockLoadTranslations = vi.fn();
          if (shouldFailTranslation) {
            mockLoadTranslations.mockRejectedValue(new Error('Translation loading failed'));
          } else {
            mockLoadTranslations.mockResolvedValue({
              'navigation.aiWriter': 'Escritor IA',
              'navigation.aiEmails': 'Correos IA',
            });
          }

          vi.doMock('../language/utils', () => ({
            getInitialLanguage: () => language,
            saveLanguageToStorage: vi.fn(),
            loadTranslations: mockLoadTranslations,
            getNestedTranslation: (translations: any, key: string) => translations?.[key] || key,
            interpolateString: (str: string) => str,
            redetectBrowserLanguage: vi.fn(),
          }));

          const TestComponent = () => (
            <LanguageProvider initialLanguage={language}>
              <HerramientasIAPage />
            </LanguageProvider>
          );

          // The page should still render even if translations fail
          let renderResult;
          expect(() => {
            renderResult = render(<TestComponent />);
          }).not.toThrow();

          // Essential elements should still be present
          expect(screen.getByTestId('main-navigation')).toBeInTheDocument();
          expect(screen.getByTestId('footer')).toBeInTheDocument();

          // Cleanup
          if (renderResult) {
            renderResult.unmount();
          }
        }
      ),
      { 
        numRuns: 100,
        verbose: true 
      }
    );
  });

  it('should handle missing translation keys gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...Object.keys(SUPPORTED_LANGUAGES) as LanguageCode[]),
        fc.array(fc.string(), { minLength: 0, maxLength: 5 }), // Random missing keys
        async (language: LanguageCode, missingKeys: string[]) => {
          // Create incomplete translations
          const incompleteTranslations: Record<string, string> = {
            'navigation.aiWriter': 'Escritor IA',
            // Intentionally missing some keys
          };

          // Remove some keys to simulate missing translations
          missingKeys.forEach(key => {
            delete incompleteTranslations[key];
          });

          vi.doMock('../language/utils', () => ({
            getInitialLanguage: () => language,
            saveLanguageToStorage: vi.fn(),
            loadTranslations: vi.fn().mockResolvedValue(incompleteTranslations),
            getNestedTranslation: (translations: any, key: string) => translations?.[key] || key,
            interpolateString: (str: string) => str,
            redetectBrowserLanguage: vi.fn(),
          }));

          const TestComponent = () => (
            <LanguageProvider initialLanguage={language}>
              <HerramientasIAPage />
            </LanguageProvider>
          );

          // The page should render without errors even with missing translations
          let renderResult;
          expect(() => {
            renderResult = render(<TestComponent />);
          }).not.toThrow();

          // Verify page structure is intact
          expect(screen.getByTestId('main-navigation')).toBeInTheDocument();
          expect(screen.getByTestId('footer')).toBeInTheDocument();
          expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();

          // Cleanup
          if (renderResult) {
            renderResult.unmount();
          }
        }
      ),
      { 
        numRuns: 100,
        verbose: true 
      }
    );
  });
});
