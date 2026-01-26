'use client';

import { ReactNode, Component, ErrorInfo, Suspense } from 'react';
import { ThemeProvider } from 'next-themes';
import { usePathname } from 'next/navigation';
import { ThemeStyleProvider } from '@/app/contexts/ThemeStyleContext';
import { ToastProvider } from './ToastProvider';
import GlobalModeToggle from './GlobalModeToggle';
import { AuthProvider } from './AuthProvider';
import { SubscriptionProvider } from '@/contexts/subscription-context';

const ElevenLabsWidget = () => null;

function AuthFallback() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}

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

export function ClientProviders({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isBlogSection = pathname?.match(/^(\/[a-z]{2})?\/blog/) !== null;

  if (isBlogSection) {
    return (
      <ErrorBoundary>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ThemeStyleProvider>
            <ToastProvider>
              <Suspense fallback={<AuthFallback />}>
                <AuthProvider>
                  <SubscriptionProvider>
                    {children}
                  </SubscriptionProvider>
                </AuthProvider>

              </Suspense>
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
            <Suspense fallback={<AuthFallback />}>
              <AuthProvider>
                <SubscriptionProvider>
                  {children}
                  <ElevenLabsWidget />
                </SubscriptionProvider>
              </AuthProvider>

            </Suspense>
            <GlobalModeToggle />
          </ToastProvider>
        </ThemeStyleProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
