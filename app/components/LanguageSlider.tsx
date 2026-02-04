'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useRouter, usePathname } from 'next/navigation';

// Standalone configuration - No external deps
const SUPPORTED_LOCALES = {
  es: { name: 'Español', flag: '🇪🇸' },
  en: { name: 'English', flag: '🇺🇸' },
  fr: { name: 'Français', flag: '🇫🇷' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  zh: { name: '中文', flag: '🇨🇳' },
  pt: { name: 'Português', flag: '🇧🇷' }
} as const;

type SupportedLocale = keyof typeof SUPPORTED_LOCALES;

interface LanguageSliderProps {
  className?: string;
  onLanguageSelect?: (locale: SupportedLocale) => void;
}

export function LanguageSlider({ className = '', onLanguageSelect }: LanguageSliderProps) {
  const [isOpen, setIsOpen] = useState(false);
  // Default to ES to prevent crash. We hydrate from cookie in useEffect if needed.
  const [currentLocale, setCurrentLocale] = useState<SupportedLocale>('es');

  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Safe hydration of locale preference
  useEffect(() => {
    try {
      // Simple cookie parser
      const match = document.cookie.match(new RegExp('(^| )locale=([^;]+)'));
      const cookieLocale = match ? match[2] : 'es';

      if (cookieLocale && cookieLocale in SUPPORTED_LOCALES) {
        setCurrentLocale(cookieLocale as SupportedLocale);
      }
    } catch (e) {
      console.error(e)
    }
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = useCallback((locale: SupportedLocale) => {
    setIsOpen(false);
    setCurrentLocale(locale);

    // Save language preference in cookie
    document.cookie = `locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;

    if (onLanguageSelect) {
      onLanguageSelect(locale);
    } else {
      // Default: Navigate safely
      // Note: This logic assumes i18n routing. If plain routing, just refresh or context update.
      // For now, we just refresh to be safe if router.push complicates things
      window.location.reload();
    }
  }, [onLanguageSelect]);

  // Safe lookup
  const currentLanguage = SUPPORTED_LOCALES[currentLocale] || SUPPORTED_LOCALES['es'];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors duration-200"
        aria-label="Cambiar idioma"
        aria-expanded={isOpen ? 'true' : 'false'}
        aria-haspopup="true"
      >
        <span className="text-base">{currentLanguage.flag}</span>
        <span className="hidden sm:inline">{currentLanguage.name}</span>
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu">
            {Object.entries(SUPPORTED_LOCALES).map(([locale, config]) => (
              <button
                key={locale}
                type="button"
                onClick={() => handleLanguageChange(locale as SupportedLocale)}
                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 ${locale === currentLocale
                  ? 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  : 'text-gray-700 dark:text-gray-300'
                  }`}
                role="menuitem"
              >
                <span className="text-base">{config.flag}</span>
                <span>{config.name}</span>
                {locale === currentLocale && (
                  <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
