'use client';

import React from 'react';
import { AuthProvider } from './AuthProvider';
import { ToastProvider } from './ToastProvider';
import ThemeProviderWrapper from './ThemeProviderWrapper';
import { ErrorBoundary } from './ErrorBoundary';
import { ChunkErrorHandler } from './ChunkErrorHandler';
import WebVitalsReporter from './WebVitalsReporter';
import Footer from './Footer';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <AuthProvider>
      <ToastProvider>
        <ThemeProviderWrapper>
          <ErrorBoundary>
            <ChunkErrorHandler />
            <WebVitalsReporter />
            {children}
          </ErrorBoundary>
          <Footer />
        </ThemeProviderWrapper>
      </ToastProvider>
    </AuthProvider>
  );
}


