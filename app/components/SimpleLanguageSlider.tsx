'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { Link, usePathname } from '@/lib/i18n';
import { languageTag } from '@/paraglide/runtime';

// Supported locales config with flags
const SUPPORTED_LOCALES = {
  es: { name: 'Español', flag: '🇪🇸' },
  en: { name: 'English', flag: '🇺🇸' },
  fr: { name: 'Français', flag: '🇫🇷' },
  pt: { name: 'Português', flag: '🇵🇹' },
  it: { name: 'Italiano', flag: '🇮🇹' },
  de: { name: 'Deutsch', flag: '🇩🇪' }
} as const;

type SupportedLocale = keyof typeof SUPPORTED_LOCALES;

interface SimpleLanguageSliderProps {
  className?: string;
  currentLocale?: SupportedLocale;
}

export function SimpleLanguageSlider({
  className = '',
  currentLocale: propCurrentLocale
}: SimpleLanguageSliderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Use prop or detect from Paraglide
  const currentLang = (propCurrentLocale || languageTag()) as SupportedLocale;

  // Fallback if currentLang isn't in supported list (e.g. if we add more langs later)
  const currentLanguage = SUPPORTED_LOCALES[currentLang] || SUPPORTED_LOCALES['es'];

  // Identify available languages based on config
  // We filter to ensure we only show langs defined in SUPPORTED_LOCALES
  const availableLocales = Object.keys(SUPPORTED_LOCALES) as SupportedLocale[];

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
            {availableLocales.map((locale) => (
              <Link
                key={locale}
                href={pathname}
                locale={locale}
                onClick={() => setIsOpen(false)}
                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 ${locale === currentLang
                    ? 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    : 'text-gray-700 dark:text-gray-300'
                  }`}
                role="menuitem"
              >
                <span className="text-base">{SUPPORTED_LOCALES[locale].flag}</span>
                <span>{SUPPORTED_LOCALES[locale].name}</span>
                {locale === currentLang && (
                  <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">✓</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
