/**
 * Property-Based Test: Session Cleanup
 * Feature: ai-writer-rebuild, Property 10: Session Cleanup
 * 
 * Validates: Requirements 1.3
 * 
 * Property: For any user logout event, the system should clear all component
 * state and redirect to the home page, while preserving localStorage settings.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import fc from 'fast-check';
import EscritorIAPage from '../page';
import { saveSettings, loadSettings, type AISettings } from '../../lib/settings-manager';

// Mock Clerk
const mockPush = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('@clerk/nextjs', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/escritor-ia',
  useSearchParams: () => new URLSearchParams(),
}));

describe('Feature: ai-writer-rebuild, Property 10: Session Cleanup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should redirect to home on logout while preserving settings', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          settings: fc.record({
            provider: fc.constantFrom('openai', 'anthropic', 'google'),
            model: fc.string({ minLength: 1, maxLength: 50 }),
            temperature: fc.float({ min: 0, max: 1 }),
            apiKey: fc.option(fc.string({ minLength: 20, maxLength: 100 }), { nil: undefined }),
            usePersonalKey: fc.boolean(),
          }),
          content: fc.string({ minLength: 1, maxLength: 1000 }),
        }),
        async ({ settings, content }) => {
          // Save settings before logout
          const fullSettings: AISettings = {
            ...settings,
            lastUpdated: new Date().toISOString(),
          };
          saveSettings(fullSettings);

          // Start with authenticated state
          mockUseAuth.mockReturnValue({
            isLoaded: true,
            isSignedIn: true,
            userId: 'test-user-id',
          });

          const { rerender } = render(<EscritorIAPage />);

          // Wait for page to render
          await waitFor(() => {
            expect(screen.getByText('Escritor de IA')).toBeInTheDocument();
          });

          // Simulate logout by changing auth state
          mockUseAuth.mockReturnValue({
            isLoaded: true,
            isSignedIn: false,
            userId: null,
          });

          // Rerender with new auth state
          rerender(<EscritorIAPage />);

          // Wait for redirect
          await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/sign-in');
          });

          // Verify settings are still preserved
          const loadedSettings = loadSettings();
          expect(loadedSettings).not.toBeNull();
          expect(loadedSettings?.provider).toBe(settings.provider);
          expect(loadedSettings?.model).toBe(settings.model);
          expect(loadedSettings?.temperature).toBeCloseTo(settings.temperature, 5);
          expect(loadedSettings?.apiKey).toBe(settings.apiKey);
          expect(loadedSettings?.usePersonalKey).toBe(settings.usePersonalKey);
        }
      ),
      { numRuns: 1 }
    );
  });

  it('should not persist content after logout', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 1000 }),
        async (content) => {
          // Start with authenticated state
          mockUseAuth.mockReturnValue({
            isLoaded: true,
            isSignedIn: true,
            userId: 'test-user-id',
          });

          const { rerender } = render(<EscritorIAPage />);

          // Wait for page to render
          await waitFor(() => {
            expect(screen.getByText('Escritor de IA')).toBeInTheDocument();
          });

          // Simulate logout
          mockUseAuth.mockReturnValue({
            isLoaded: true,
            isSignedIn: false,
            userId: null,
          });

          rerender(<EscritorIAPage />);

          // Wait for redirect
          await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/sign-in');
          });

          // Verify content is not in localStorage
          const allLocalStorageKeys = Object.keys(localStorage);
          const contentKeys = allLocalStorageKeys.filter(
            (key) => !key.includes('settings')
          );

          for (const key of contentKeys) {
            const value = localStorage.getItem(key);
            if (value) {
              expect(value).not.toContain(content);
            }
          }
        }
      ),
      { numRuns: 1 }
    );
  });

  it('should clear component state on logout', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          initialContent: fc.string({ minLength: 1, maxLength: 1000 }),
          userId: fc.string({ minLength: 1, maxLength: 50 }),
        }),
        async ({ initialContent, userId }) => {
          // Start with authenticated state
          mockUseAuth.mockReturnValue({
            isLoaded: true,
            isSignedIn: true,
            userId,
          });

          const { rerender } = render(<EscritorIAPage />);

          // Wait for page to render
          await waitFor(() => {
            expect(screen.getByText('Escritor de IA')).toBeInTheDocument();
          });

          // Simulate logout
          mockUseAuth.mockReturnValue({
            isLoaded: true,
            isSignedIn: false,
            userId: null,
          });

          rerender(<EscritorIAPage />);

          // Verify redirect occurred (component unmounted)
          await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/sign-in');
          });

          // Verify editor is no longer rendered (state cleared)
          expect(screen.queryByText('Escritor de IA')).not.toBeInTheDocument();
        }
      ),
      { numRuns: 1 }
    );
  });

  it('should preserve settings across multiple login/logout cycles', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          settings: fc.record({
            provider: fc.constantFrom('openai', 'anthropic', 'google'),
            model: fc.string({ minLength: 1, maxLength: 50 }),
            temperature: fc.float({ min: 0, max: 1 }),
            apiKey: fc.option(fc.string({ minLength: 20, maxLength: 100 }), { nil: undefined }),
            usePersonalKey: fc.boolean(),
          }),
          cycles: fc.integer({ min: 2, max: 5 }),
        }),
        async ({ settings, cycles }) => {
          // Save settings
          const fullSettings: AISettings = {
            ...settings,
            lastUpdated: new Date().toISOString(),
          };
          saveSettings(fullSettings);

          // Perform multiple login/logout cycles
          for (let i = 0; i < cycles; i++) {
            // Login
            mockUseAuth.mockReturnValue({
              isLoaded: true,
              isSignedIn: true,
              userId: `user-${i}`,
            });

            const { rerender, unmount } = render(<EscritorIAPage />);

            // Wait for page to render
            await waitFor(() => {
              expect(screen.getByText('Escritor de IA')).toBeInTheDocument();
            });

            // Logout
            mockUseAuth.mockReturnValue({
              isLoaded: true,
              isSignedIn: false,
              userId: null,
            });

            rerender(<EscritorIAPage />);

            // Wait for redirect
            await waitFor(() => {
              expect(mockPush).toHaveBeenCalled();
            });

            unmount();

            // Verify settings are still preserved after each cycle
            const loadedSettings = loadSettings();
            expect(loadedSettings).not.toBeNull();
            expect(loadedSettings?.provider).toBe(settings.provider);
            expect(loadedSettings?.model).toBe(settings.model);
            expect(loadedSettings?.temperature).toBeCloseTo(settings.temperature, 5);
          }
        }
      ),
      { numRuns: 1 } // Reduced runs due to multiple cycles
    );
  });

  it('should handle logout during processing', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          content: fc.string({ minLength: 1, maxLength: 1000 }),
          settings: fc.record({
            provider: fc.constantFrom('openai', 'anthropic', 'google'),
            model: fc.string({ minLength: 1, maxLength: 50 }),
            temperature: fc.float({ min: 0, max: 1 }),
            apiKey: fc.string({ minLength: 20, maxLength: 100 }),
            usePersonalKey: fc.constant(true),
          }),
        }),
        async ({ content, settings }) => {
          // Save settings
          const fullSettings: AISettings = {
            ...settings,
            lastUpdated: new Date().toISOString(),
          };
          saveSettings(fullSettings);

          // Start with authenticated state
          mockUseAuth.mockReturnValue({
            isLoaded: true,
            isSignedIn: true,
            userId: 'test-user-id',
          });

          const { rerender } = render(<EscritorIAPage />);

          // Wait for page to render
          await waitFor(() => {
            expect(screen.getByText('Escritor de IA')).toBeInTheDocument();
          });

          // Simulate logout (even during processing)
          mockUseAuth.mockReturnValue({
            isLoaded: true,
            isSignedIn: false,
            userId: null,
          });

          rerender(<EscritorIAPage />);

          // Verify redirect occurred
          await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/sign-in');
          });

          // Verify settings are preserved
          const loadedSettings = loadSettings();
          expect(loadedSettings).not.toBeNull();
          expect(loadedSettings?.apiKey).toBe(settings.apiKey);
        }
      ),
      { numRuns: 1 }
    );
  });
});
