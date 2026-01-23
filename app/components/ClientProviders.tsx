'use client';

import { ReactNode, Component, ErrorInfo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { ThemeStyleProvider } from '@/app/contexts/ThemeStyleContext';
import { ToastProvider } from './ToastProvider';
import GlobalModeToggle from './GlobalModeToggle';

// Dynamically import KindeProvider to handle SSR and missing config gracefully
const KindeProvider = dynamic(
  () => import('@kinde-oss/kinde-auth-nextjs').then(mod => mod.KindeProvider).catch((err) => {
    console.warn('[ClientProviders] KindeProvider failed to load:', err.message);
    // Return a passthrough component if Kinde fails to load
    return ({ children }: { children: ReactNode }) => <>{children}</>;
  }),
  {
    ssr: false,
    loading: () => null
  }
);

// Error Boundary to catch render errors
class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      console.warn("ClientProviders ErrorBoundary triggered. Rendering in Safe Mode.");
      return (
        <ThemeStyleProvider>
          <ToastProvider>
            <div data-safe-mode="true">
              {this.props.children}
            </div>
            <GlobalModeToggle />
          </ToastProvider>
        </ThemeStyleProvider>
      );
    }
    return this.props.children;
  }
}

// Fallback wrapper for when Kinde provider isn't ready
function AuthFallback({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

import { ThemeProvider } from 'next-themes';
import { usePathname } from 'next/navigation';

// ... (existing imports)

export function ClientProviders({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isBlogSection = pathname?.match(/^(\/[a-z]{2})?\/blog/) !== null;

  if (isBlogSection) {
    return (
      <ErrorBoundary>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ThemeStyleProvider>
            <ToastProvider>
              {children}
              <GlobalModeToggle />
            </ToastProvider>
          </ThemeStyleProvider>
        </ThemeProvider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ThemeStyleProvider>
          <ToastProvider>
            <Suspense fallback={<AuthFallback>{children}</AuthFallback>}>
              <KindeProvider>
                {children}
              </KindeProvider>
            </Suspense>
            <GlobalModeToggle />
          </ToastProvider>
        </ThemeStyleProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
