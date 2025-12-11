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
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('hydration-complete');
      console.log('✅ WorkingClientLayout: Hidratación completada');
    }
  }, []);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-sm">Inicializando aplicación...</div>
      </div>
    );
  }

  return (
    <WorkingAuthProvider>
      <SimpleLanguageProvider>
        <ToastProvider>
          <div className="min-h-screen hydration-complete">
            {children}
          </div>
        </ToastProvider>
      </SimpleLanguageProvider>
    </WorkingAuthProvider>
  );
}