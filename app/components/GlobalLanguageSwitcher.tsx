'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { useLanguage } from '@/app/lib/language/context';
import { SUPPORTED_LANGUAGES, LanguageCode } from '@/app/lib/language/config';

export default function GlobalLanguageSwitcher() {
  const { currentLanguage, changeLanguage, isLoading } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = async (languageCode: LanguageCode) => {
    if (languageCode !== (currentLanguage as any)) {
      await changeLanguage(languageCode);
    }
    setIsOpen(false);
  };

  const currentLangInfo = SUPPORTED_LANGUAGES[currentLanguage as any] || SUPPORTED_LANGUAGES['es'];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Cambiar idioma"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{currentLangInfo.flag}</span>
        <span className="hidden md:inline">{currentLangInfo.nativeName}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="py-1">
            {Object.values(SUPPORTED_LANGUAGES).map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-3 ${(currentLanguage as any) === language.code
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700'
                  }`}
              >
                <span className="text-lg">{language.flag}</span>
                <div className="flex flex-col">
                  <span>{language.nativeName}</span>
                  <span className="text-xs text-gray-500">{language.name}</span>
                </div>
                {(currentLanguage as any) === language.code && (
                  <span className="ml-auto text-blue-600">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}