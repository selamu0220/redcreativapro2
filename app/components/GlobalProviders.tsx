'use client';

import React from 'react';
import { WorkingAuthProvider } from './WorkingAuthProvider';
import { ToastProvider } from './ToastProvider';

interface GlobalProvidersProps {
  children: React.ReactNode;
}

export default function GlobalProviders({ children }: GlobalProvidersProps) {
  return (
    <WorkingAuthProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </WorkingAuthProvider>
  );
}