'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useSimpleTranslations } from '@/app/lib/simple-translations';

const SimpleMainNavigation = dynamic(() => import('@/app/components/SimpleMainNavigation').then(mod => mod.SimpleMainNavigation), {
  ssr: true,
  loading: () => <div className="h-16 w-full border-b bg-background/95 backdrop-blur flex items-center px-4"><div className="h-8 w-8 bg-muted rounded animate-pulse" /></div>
});

import AIWriterErrorBoundary from '@/app/components/error-boundaries/AIWriterErrorBoundary';

const AdvancedDockLayout = dynamic(() => import('./components/AdvancedDockLayoutV4'), {
  ssr: false,
  loading: () => <LoadingWithTranslation />
});

const DynamicWriterProvider = dynamic(() => import('./components/DynamicWriterProvider'), {
  ssr: false
});

function LoadingWithTranslation() {
  const { t } = useSimpleTranslations();
  // Minimal localized loader that is safe to use
  return (
    <div className="h-full w-full flex items-center justify-center bg-muted/5 animate-pulse text-muted-foreground text-sm">
      {t('writer_loading_full')}
    </div>
  )
}

export default function EscritorIAPage() {
  return (
    <DynamicWriterProvider>
      <div className="h-screen flex flex-col overflow-hidden bg-background">
        <SimpleMainNavigation />
        {/* Main Content Area with Advanced Dock Layout */}
        <div className="flex-1 relative overflow-hidden bg-[#fcfcfc] dark:bg-[#0a0a0a]">
          {/* Background Grid Pattern (maintained for aesthetics) */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          {/* The Dock Layout Component handles all panels (Editor, Docs, Assistant, Settings) */}
          <AIWriterErrorBoundary>
            <AdvancedDockLayout />
          </AIWriterErrorBoundary>
        </div>
      </div>
    </DynamicWriterProvider>
  );
}
