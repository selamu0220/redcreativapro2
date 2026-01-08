'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

// Configuración simple de idiomas
const SUPPORTED_LOCALES = {
  es: { name: 'Español', flag: '🇪🇸' },
  en: { name: 'English', flag: '🇺🇸' }
} as const;

type SupportedLocale = keyof typeof SUPPORTED_LOCALES;

interface SimpleLanguageSliderProps {
  className?: string;
  onLanguageChange?: (locale: SupportedLocale) => void;
  currentLocale?: SupportedLocale;
}

export function SimpleLanguageSlider({
  className = '',
  onLanguageChange,
  currentLocale: propCurrentLocale
}: SimpleLanguageSliderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalLocale, setInternalLocale] = useState<SupportedLocale>('es');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLocale = propCurrentLocale || internalLocale;

  // Detectar idioma actual del navegador
  useEffect(() => {
    if (!propCurrentLocale) {
      const browserLang = navigator.language.split('-')[0] as SupportedLocale;
      if (SUPPORTED_LOCALES[browserLang]) {
        setInternalLocale(browserLang);
      }
    }
  }, [propCurrentLocale]);

  // Cerrar dropdown al hacer clic fuera
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
    setInternalLocale(locale);
    setIsOpen(false);

    if (onLanguageChange) {
      onLanguageChange(locale);
    } else {
      // Use localStorage and custom event (same as simple-translations system)
      if (typeof window !== 'undefined') {
        try {
          // 1. Save to localStorage
          localStorage.setItem('simple-language', locale);

          // 2. Dispatch custom event to update all components
          const event = new CustomEvent('languageChanged', { detail: locale });
          window.dispatchEvent(event);
        } catch (error) {
          console.error('Error changing language:', error);
        }
      }
    }
  }, [onLanguageChange]);

  const currentLanguage = SUPPORTED_LOCALES[currentLocale];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors duration-200"
        aria-label="Cambiar idioma"
        aria-expanded={isOpen}
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