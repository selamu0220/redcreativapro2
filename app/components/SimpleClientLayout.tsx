'use client';

import React, { useEffect, useState } from 'react';
import { UltraSimpleAuthProvider } from './UltraSimpleAuthProvider';

interface SimpleClientLayoutProps {
  children: React.ReactNode;
}

export default function SimpleClientLayout({ children }: SimpleClientLayoutProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('hydration-complete');
    }
  }, []);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  return (
    <UltraSimpleAuthProvider>
      <div className="min-h-screen hydration-complete">
        {children}
      </div>
    </UltraSimpleAuthProvider>
  );
}