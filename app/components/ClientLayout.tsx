'use client';

import { useEffect, useState } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { LanguageProvider } from '../lib/language/context';
import { FastAuthProvider } from './FastAuthProvider';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('hydration-complete');
      
      // Simple chunk error handler without complex retry logic
      window.addEventListener('unhandledrejection', (event) => {
        if (event.reason?.message?.includes('Loading chunk')) {
          console.warn('Chunk loading error detected, reloading page...');
          setTimeout(() => window.location.reload(), 1000);
        }
      });
    }
  }, []);

  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log error for monitoring/analytics
    console.error('Application Error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown'
    });
  };

  if (!isHydrated) {
    return (
      <ErrorBoundary>
        <LanguageProvider>
          <FastAuthProvider>
            <div className="min-h-screen">{children}</div>
          </FastAuthProvider>
        </LanguageProvider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <FastAuthProvider>
          <div className="min-h-screen hydration-complete">
            {children}
          </div>
        </FastAuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

