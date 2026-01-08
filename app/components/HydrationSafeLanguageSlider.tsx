'use client';

import React, { useState, useEffect } from 'react';
import { LanguageSlider } from './LanguageSlider';
import { FallbackLanguageSlider } from './FallbackLanguageSlider';

interface HydrationSafeLanguageSliderProps {
  onLanguageChange?: (locale: string) => void;
  className?: string;
}

export function HydrationSafeLanguageSlider({ onLanguageChange, className }: HydrationSafeLanguageSliderProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [hasTranslationError, setHasTranslationError] = useState(false);
  const [useFullSlider, setUseFullSlider] = useState(true);

  useEffect(() => {
    // Mark as hydrated immediately
    setIsHydrated(true);

    // Test if next-intl context is available - do this asynchronously
    // without blocking UI
    const testTimer = setTimeout(() => {
      try {
        // Try to access next-intl context indirectly
        const hasIntlContext = document.querySelector('[data-nextintl]') ||
          document.documentElement.lang ||
          document.cookie.includes('locale=');

        if (hasIntlContext) {
          setUseFullSlider(true);
        } else {
          // Even without explicit context, try the full slider first
          // Fallback will activate if there's an error
          setUseFullSlider(true);
        }
      } catch (error) {
        console.warn('next-intl context not available, using fallback slider');
        setHasTranslationError(true);
        setUseFullSlider(false);
      }
    }, 2000); // Delay check to 2 seconds to avoid blocking initial render

    return () => clearTimeout(testTimer);
  }, []);

  // Error boundary for translation errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.error?.message?.includes('next-intl') ||
        event.error?.message?.includes('useTranslations') ||
        event.error?.message?.includes('useLocale')) {
        console.warn('Translation error caught, switching to fallback slider:', event.error);
        setHasTranslationError(true);
        setUseFullSlider(false);
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Always render the full slider immediately after hydration
  // The error boundary will catch any issues
  if (!isHydrated) {
    // Show a simple loading state that doesn't block interaction
    return (
      <div className={`${className} inline-flex items-center justify-center`} aria-hidden="true">
        <div className="inline-flex items-center justify-center w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm">
          <span className="mr-2 text-lg">🌐</span>
          <span className="hidden sm:inline-block mr-2">...</span>
        </div>
      </div>
    );
  }

  // Use fallback slider only if there are translation errors
  if (hasTranslationError || !useFullSlider) {
    return <FallbackLanguageSlider onLanguageChange={onLanguageChange} className={className} />;
  }

  // Try to render the full slider with error boundary
  try {
    return <LanguageSlider onLanguageChange={onLanguageChange} className={className} />;
  } catch (error) {
    console.warn('LanguageSlider render error, falling back:', error);
    setHasTranslationError(true);
    return <FallbackLanguageSlider onLanguageChange={onLanguageChange} className={className} />;
  }
}
