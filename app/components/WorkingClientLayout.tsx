'use client';

import React, { useEffect, useState } from 'react';
import { WorkingAuthProvider } from './WorkingAuthProvider';
import { ToastProvider } from './ToastProvider';
import SimpleLanguageProvider from './SimpleLanguageProvider';

interface WorkingClientLayoutProps {
  children: React.ReactNode;
}

export default function WorkingClientLayout({ children }: WorkingClientLayoutProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // No mostrar nada hasta que esté hidratado para evitar conflictos
  if (!isHydrated) {
    return null;
  }

  return (
    <WorkingAuthProvider>
      <SimpleLanguageProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </SimpleLanguageProvider>
    </WorkingAuthProvider>
  );
}