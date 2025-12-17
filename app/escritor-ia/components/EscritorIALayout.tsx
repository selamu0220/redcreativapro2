"use client";

import React, { Suspense } from 'react';
import { useViewport } from '../../hooks/useViewport';
import MobileLayout, { MobileContainer } from '../../components/MobileLayout';
import { MobileOptimizedLoader } from '../../components/MobileLoadingStates';
import AIWriterErrorBoundary from '../../components/error-boundaries/AIWriterErrorBoundary';

interface EscritorIALayoutProps {
  children: React.ReactNode;
}

export default function EscritorIALayout({ children }: EscritorIALayoutProps) {
  const { isMobile, isTablet } = useViewport();

  return (
    <AIWriterErrorBoundary>
      <MobileLayout>
        <MobileContainer 
          className="min-h-screen bg-background"
          padding={true}
          fullHeight={true}
          maxWidth={true}
        >
          <div className={`
            w-full max-w-none mx-auto
            ${isMobile ? 'px-2 py-4' : isTablet ? 'px-4 py-6' : 'px-6 py-8'}
          `}>
            <Suspense 
              fallback={
                <div className="flex items-center justify-center min-h-[400px]">
                  <MobileOptimizedLoader 
                    size="lg" 
                    text="Cargando Editor de IA..." 
                    variant="spinner"
                  />
                </div>
              }
            >
              {children}
            </Suspense>
          </div>
        </MobileContainer>
      </MobileLayout>
    </AIWriterErrorBoundary>
  );
}