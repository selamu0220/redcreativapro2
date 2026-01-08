'use client';

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

    // Update current locale immediately
    setCurrentLocale(locale);
    setIsOpen(false);

    // Save preference
    document.cookie = `locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    
    // Update HTML lang attribute
    document.documentElement.lang = locale;
    
    // Call callback if provided
    if (onLanguageChange) {
      onLanguageChange(locale);
    }
    
    // For now, reload to ensure all content updates
    // In the future, this could be replaced with dynamic content loading
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }, [currentLocale, onLanguageChange]);

  const currentLanguage = LANGUAGES[currentLocale as keyof typeof LANGUAGES] || LANGUAGES.es;

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
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
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
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
                className={`
                  group flex items-center w-full px-4 py-2 text-sm transition-colors duration-150 text-left
                  ${language.code === currentLocale 
                    ? 'bg-blue-50 text-blue-700 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                  focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500
                `}
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
