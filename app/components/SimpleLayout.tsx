'use client';

import React, { useEffect, useState } from 'react';
import { WorkingAuthProvider } from './WorkingAuthProvider';
import { ToastProvider } from './ToastProvider';

interface SimpleLayoutProps {
  children: React.ReactNode;
}

export default function SimpleLayout({ children }: SimpleLayoutProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mostrar loading hasta que el componente esté montado
  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-sm">Cargando...</div>
      </div>
    );
  }

  return (
    <WorkingAuthProvider>
      <ToastProvider>
        <div className="min-h-screen bg-black text-white">
          {children}
        </div>
      </ToastProvider>
    </WorkingAuthProvider>
  );
}
