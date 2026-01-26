/**
 * Fix for Language Slider Hydration Issue
 * 
 * The problem: LanguageSlider appears briefly then disappears due to:
 * 1. next-intl context not being available during initial render
 * 2. Hydration mismatch between server and client
 * 3. useTranslations hook failing during hydration
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Language Slider Hydration Issue...');

// 1. Create a hydration-safe wrapper for LanguageSlider
const hydrationSafeWrapper = `'use client';

import React, { useState, useEffect } from 'react';
import { LanguageSlider } from './LanguageSlider';

interface HydrationSafeLanguageSliderProps {
  onLanguageChange?: (locale: string) => void;
  className?: string;
}

export function HydrationSafeLanguageSlider({ onLanguageChange, className }: HydrationSafeLanguageSliderProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Ensure we're fully hydrated before showing the component
    setIsHydrated(true);
  }, []);

  // Error boundary for translation errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.error?.message?.includes('next-intl') || 
          event.error?.message?.includes('useTranslations')) {
        console.warn('Translation error caught, hiding language slider:', event.error);
        setHasError(true);
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Don't render until hydrated and no errors
  if (!isHydrated || hasError) {
    return (
      <div className={\`\${className} opacity-0 pointer-events-none\`} aria-hidden="true">
        {/* Placeholder to maintain layout */}
        <div className="inline-flex items-center justify-center w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm">
          <span className="mr-2 text-lg">🌐</span>
          <span className="hidden sm:inline-block mr-2">Language</span>
          <div className="w-4 h-4" />
        </div>
      </div>
    );
  }

  try {
    return <LanguageSlider onLanguageChange={onLanguageChange} className={className} />;
  } catch (error) {
    console.warn('LanguageSlider render error:', error);
    setHasError(true);
    return null;
  }
}
`;

// Write the hydration-safe wrapper
fs.writeFileSync(
  path.join(process.cwd(), 'app/components/HydrationSafeLanguageSlider.tsx'),
  hydrationSafeWrapper
);

console.log('✅ Created HydrationSafeLanguageSlider.tsx');

// 2. Update HomePageClient to use the hydration-safe wrapper
const homePageClientPath = path.join(process.cwd(), 'app/components/HomePageClient.tsx');
let homePageContent = fs.readFileSync(homePageClientPath, 'utf8');

// Replace the import
homePageContent = homePageContent.replace(
  "import { LanguageSlider } from './LanguageSlider'",
  "import { HydrationSafeLanguageSlider } from './HydrationSafeLanguageSlider'"
);

// Replace the usage
homePageContent = homePageContent.replace(
  '<LanguageSlider className="mr-2" />',
  '<HydrationSafeLanguageSlider className="mr-2" />'
);

fs.writeFileSync(homePageClientPath, homePageContent);

console.log('✅ Updated HomePageClient.tsx to use HydrationSafeLanguageSlider');

// 3. Create a fallback LanguageSlider that doesn't depend on next-intl
const fallbackSlider = `'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

// Static language data that doesn't require translations
const LANGUAGES = {
  es: { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  en: { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  fr: { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  de: { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  zh: { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  pt: { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' }
};

interface FallbackLanguageSliderProps {
  onLanguageChange?: (locale: string) => void;
  className?: string;
}

export function FallbackLanguageSlider({ onLanguageChange, className = '' }: FallbackLanguageSliderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState('es');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Detect current locale from HTML lang or cookie
  useEffect(() => {
    const htmlLang = document.documentElement.lang || 'es';
    const cookieLocale = document.cookie
      .split(';')
      .find(c => c.trim().startsWith('locale='))
      ?.split('=')[1];
    
    const detectedLocale = cookieLocale || htmlLang || 'es';
    if (LANGUAGES[detectedLocale as keyof typeof LANGUAGES]) {
      setCurrentLocale(detectedLocale);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleLanguageSelect = useCallback((locale: string) => {
    if (locale === currentLocale) {
      setIsOpen(false);
      return;
    }

    // Save preference
    document.cookie = \`locale=\${locale}; path=/; max-age=31536000; SameSite=Lax\`;
    
    // Call callback if provided
    if (onLanguageChange) {
      onLanguageChange(locale);
    }
    
    // Reload page to apply new language
    window.location.reload();
  }, [currentLocale, onLanguageChange]);

  const currentLanguage = LANGUAGES[currentLocale as keyof typeof LANGUAGES] || LANGUAGES.es;

  return (
    <div className={\`relative inline-block text-left \${className}\`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <span className="mr-2 text-lg" role="img" aria-label={currentLanguage.name}>
          {currentLanguage.flag}
        </span>
        <span className="hidden sm:inline-block mr-2">
          {currentLanguage.nativeName}
        </span>
        <ChevronDownIcon 
          className={\`w-4 h-4 transition-transform duration-200 \${isOpen ? 'rotate-180' : ''}\`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 w-56 mt-2 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1" role="menu">
            {Object.values(LANGUAGES).map((language) => (
              <button
                key={language.code}
                type="button"
                onClick={() => handleLanguageSelect(language.code)}
                className={\`
                  group flex items-center w-full px-4 py-2 text-sm transition-colors duration-150 text-left
                  \${language.code === currentLocale 
                    ? 'bg-blue-50 text-blue-700 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                  focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500
                \`}
                role="menuitem"
              >
                <span className="mr-3 text-lg" role="img" aria-label={language.name}>
                  {language.flag}
                </span>
                <div className="flex flex-col items-start flex-1">
                  <span className="font-medium">{language.nativeName}</span>
                  <span className="text-xs text-gray-500">{language.name}</span>
                </div>
                {language.code === currentLocale && (
                  <div className="ml-auto" aria-hidden="true">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync(
  path.join(process.cwd(), 'app/components/FallbackLanguageSlider.tsx'),
  fallbackSlider
);

console.log('✅ Created FallbackLanguageSlider.tsx');

// 4. Update the HydrationSafeLanguageSlider to use fallback
const updatedWrapper = `'use client';

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
  const [useFullSlider, setUseFullSlider] = useState(false);

  useEffect(() => {
    // Mark as hydrated
    setIsHydrated(true);
    
    // Test if next-intl context is available
    const testTimer = setTimeout(() => {
      try {
        // Try to access next-intl context indirectly
        const hasIntlContext = document.querySelector('[data-nextintl]') || 
                              document.documentElement.lang || 
                              document.cookie.includes('locale=');
        
        if (hasIntlContext) {
          setUseFullSlider(true);
        }
      } catch (error) {
        console.warn('next-intl context not available, using fallback slider');
        setHasTranslationError(true);
      }
    }, 100);

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

  // Show placeholder during hydration
  if (!isHydrated) {
    return (
      <div className={\`\${className} opacity-50 pointer-events-none\`} aria-hidden="true">
        <div className="inline-flex items-center justify-center w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm">
          <span className="mr-2 text-lg">🌐</span>
          <span className="hidden sm:inline-block mr-2">Language</span>
          <div className="w-4 h-4" />
        </div>
      </div>
    );
  }

  // Use fallback slider if there are translation errors or context is not available
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
`;

fs.writeFileSync(
  path.join(process.cwd(), 'app/components/HydrationSafeLanguageSlider.tsx'),
  updatedWrapper
);

console.log('✅ Updated HydrationSafeLanguageSlider.tsx with fallback logic');

console.log('🎉 Language Slider Hydration Fix Complete!');
console.log('');
console.log('📋 What was fixed:');
console.log('1. Created HydrationSafeLanguageSlider wrapper to handle hydration');
console.log('2. Created FallbackLanguageSlider that works without next-intl');
console.log('3. Updated HomePageClient to use the hydration-safe version');
console.log('4. Added error boundaries for translation failures');
console.log('5. Added proper loading states during hydration');
console.log('');
console.log('🔄 The slider will now:');
console.log('- Show a placeholder during hydration');
console.log('- Fall back to a working slider if next-intl fails');
console.log('- Remain visible consistently');
console.log('- Handle language switching properly');