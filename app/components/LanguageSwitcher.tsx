'use client';

import { useState } from 'react';
import { useLanguage } from '@/app/lib/language/context';
import { SUPPORTED_LANGUAGES, LanguageCode } from '@/app/lib/language/config';
import { changeURLLanguage, getCurrentLanguageFromURL } from '@/app/lib/language/routing';

interface LanguageSwitcherProps {
  className?: string;
  showFlags?: boolean;
  showNames?: boolean;
  variant?: 'dropdown' | 'buttons' | 'minimal';
}

export function LanguageSwitcher({
  className = '',
  showFlags = true,
  showNames = true,
  variant = 'dropdown'
}: LanguageSwitcherProps) {
  const { currentLanguage, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = async (newLanguage: LanguageCode) => {
    if (newLanguage === (currentLanguage as any)) return;

    try {
      // Change URL immediately for better UX
      changeURLLanguage(newLanguage);
    } catch (error) {
      console.error('Error changing language:', error);
    }

    setIsOpen(false);
  };

  const languages = Object.values(SUPPORTED_LANGUAGES);
  const currentLangInfo = SUPPORTED_LANGUAGES[currentLanguage as any] || SUPPORTED_LANGUAGES['es'];

  if (variant === 'buttons') {
    return (
      <div className={`flex gap-2 ${className}`}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`
              px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${(currentLanguage as any) === lang.code
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {showFlags && <span className="mr-1">{lang.flag}</span>}
            {showNames && <span>{lang.nativeName}</span>}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          {showFlags && <span>{currentLangInfo.flag}</span>}
          <span>{currentLangInfo.code.toUpperCase()}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
            <div className="py-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`
                    w-full text-left px-4 py-2 text-sm transition-colors
                    ${(currentLanguage as any) === lang.code
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <span className="flex items-center gap-3">
                    {showFlags && <span>{lang.flag}</span>}
                    <span>{lang.nativeName}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {showFlags && <span>{currentLangInfo.flag}</span>}
        {showNames && <span>{currentLangInfo.nativeName}</span>}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
            <div className="py-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`
                    w-full text-left px-4 py-2 text-sm transition-colors
                    ${(currentLanguage as any) === lang.code
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-3">
                      {showFlags && <span>{lang.flag}</span>}
                      <span>{lang.nativeName}</span>
                    </span>
                    {(currentLanguage as any) === lang.code && (
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}