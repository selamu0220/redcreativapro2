'use client';

import React from 'react';
import { WorkingAuthProvider } from './WorkingAuthProvider';
import { ToastProvider } from './ToastProvider';
import SimpleLanguageProvider from './SimpleLanguageProvider';

interface GlobalProvidersProps {
  children: React.ReactNode;
}

export default function GlobalProviders({ children }: GlobalProvidersProps) {
  return (
    <SimpleLanguageProvider>
      <WorkingAuthProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </WorkingAuthProvider>
    </SimpleLanguageProvider>
  );
}