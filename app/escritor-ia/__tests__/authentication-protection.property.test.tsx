/**
 * Property-Based Test: Authentication Protection
 * Feature: ai-writer-rebuild, Property 1: Authentication Protection
 * 
 * Validates: Requirements 1.1, 1.2
 * 
 * Property: For any unauthenticated user attempting to access /escritor-ia,
 * the system should redirect to the Clerk sign-in page and prevent access
 * to the editor interface.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import fc from 'fast-check';
import EscritorIAPage from '../page';

// Mock Clerk
const mockPush = vi.fn();
vi.mock('@clerk/nextjs', () => ({
  useAuth: vi.fn(),
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

describe('Feature: ai-writer-rebuild, Property 1: Authentication Protection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
  });

  it('should redirect unauthenticated users to sign-in page', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          isLoaded: fc.constant(true),
          isSignedIn: fc.constant(false),
          userId: fc.option(fc.string(), { nil: null }),
        }),
        async (authState) => {
          // Mock useAuth to return unauthenticated state
          const { useAuth } = await import('@clerk/nextjs');
          vi.mocked(useAuth).mockReturnValue(authState as any);

          // Render the page
          render(<EscritorIAPage />);

          // Wait for redirect
          await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/sign-in');
          });

          // Verify editor is not rendered
          expect(screen.queryByText('Escritor de IA')).not.toBeInTheDocument();
        }
      ),
      { numRuns: 1 }
    );
  });

  it('should allow authenticated users to access the editor', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          isLoaded: fc.constant(true),
          isSignedIn: fc.constant(true),
          userId: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        }),
        async (authState) => {
          // Mock useAuth to return authenticated state
          const { useAuth } = await import('@clerk/nextjs');
          vi.mocked(useAuth).mockReturnValue(authState as any);

          // Render the page
          const { container } = render(<EscritorIAPage />);

          // Wait for editor to render (use getAllByText since there might be multiple renders)
          await waitFor(() => {
            const elements = screen.getAllByText('Escritor de IA');
            expect(elements.length).toBeGreaterThan(0);
          });

          // Verify no redirect occurred
          expect(mockPush).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 1 }
    );
  });

  it('should show loading state while authentication is being checked', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          isLoaded: fc.constant(false),
          isSignedIn: fc.boolean(),
          userId: fc.option(fc.string(), { nil: null }),
        }),
        async (authState) => {
          // Mock useAuth to return loading state
          const { useAuth } = await import('@clerk/nextjs');
          vi.mocked(useAuth).mockReturnValue(authState as any);

          // Render the page
          render(<EscritorIAPage />);

          // Verify loading indicator is shown (use getAllByText since there might be multiple)
          const loadingElements = screen.getAllByText('Cargando...');
          expect(loadingElements.length).toBeGreaterThan(0);

          // Verify editor is not rendered
          expect(screen.queryByText('Escritor de IA')).not.toBeInTheDocument();

          // Verify no redirect occurred during loading
          expect(mockPush).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 1 }
    );
  });
});
