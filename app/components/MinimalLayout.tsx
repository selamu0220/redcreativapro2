'use client';

import React from 'react';

interface MinimalLayoutProps {
  children: React.ReactNode;
}

export default function MinimalLayout({ children }: MinimalLayoutProps) {
  console.log('🚀 MinimalLayout: Renderizado ultra-simple');

  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}