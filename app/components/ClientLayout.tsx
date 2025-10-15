'use client';

import React, { Suspense, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AuthProvider } from './AuthProvider';
import { ToastProvider } from './ToastProvider';

// Dynamically import heavy components to reduce initial bundle size
const ThemeProviderWrapper = dynamic(() => import('./ThemeProviderWrapper'), {
  ssr: false,
  loading: () => <div suppressHydrationWarning />
});

const ErrorBoundary = dynamic(() => import('./ErrorBoundary').then(mod => ({ default: mod.ErrorBoundary })), {
  ssr: false,
  loading: () => <div suppressHydrationWarning />
});

const WebVitalsReporter = dynamic(() => import('./WebVitalsReporter'), {
  ssr: false
});

const Footer = dynamic(() => import('./Footer'), {
  ssr: false,
  loading: () => <div suppressHydrationWarning />
});

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  // Initialize chunk error handling directly without dynamic import
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Simple chunk error handler to prevent the loading issues
      const handleChunkError = (event: ErrorEvent) => {
        if (event.message?.includes('Loading chunk') || event.message?.includes('ChunkLoadError')) {
          console.warn('Chunk loading error detected, reloading page:', event.message);
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      };

      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        if (event.reason?.message?.includes('Loading chunk') || event.reason?.name === 'ChunkLoadError') {
          console.warn('Unhandled chunk loading rejection, reloading page:', event.reason);
          event.preventDefault();
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      };

      window.addEventListener('error', handleChunkError);
      window.addEventListener('unhandledrejection', handleUnhandledRejection);

      return () => {
        window.removeEventListener('error', handleChunkError);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    }
  }, []);

  return (
    <AuthProvider>
      <ToastProvider>
        <Suspense fallback={<div suppressHydrationWarning />}>
          <ThemeProviderWrapper>
            <ErrorBoundary>
              <WebVitalsReporter />
              {children}
            </ErrorBoundary>
            <Footer />
          </ThemeProviderWrapper>
        </Suspense>
      </ToastProvider>
    </AuthProvider>
  );
}


