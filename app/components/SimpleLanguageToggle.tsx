'use client';

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { SupportedLanguage } from '../lib/simple-translations';

const languages = [
  { code: 'es' as SupportedLanguage, name: 'Español', flag: '🇪🇸' },
  { code: 'en' as SupportedLanguage, name: 'English', flag: '🇺🇸' },
  { code: 'fr' as SupportedLanguage, name: 'Français', flag: '🇫🇷' },
  { code: 'pt' as SupportedLanguage, name: 'Português', flag: '🇵🇹' },
  { code: 'it' as SupportedLanguage, name: 'Italiano', flag: '🇮🇹' },
  { code: 'de' as SupportedLanguage, name: 'Deutsch', flag: '🇩🇪' },
];

export default function SimpleLanguageToggle() {
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('es');
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // 1. Determine language from URL first (Truth)
    const path = window.location.pathname;
    const supportedLangs = ['en', 'fr', 'de', 'it', 'pt'];
    let urlLang: SupportedLanguage = 'es';

    for (const lang of supportedLangs) {
      if (path.startsWith(`/${lang}/`) || path === `/${lang}`) {
        urlLang = lang as SupportedLanguage;
        break;
      }
    }

    setCurrentLang(urlLang);
    localStorage.setItem('simple-language', urlLang);

    // Listen for language changes from other components (if needed)
    const handleLanguageChange = (event: CustomEvent) => {
      if (event.detail) {
        setCurrentLang(event.detail);
      }
    };

    window.addEventListener('languageChanged', handleLanguageChange as EventListener);

    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
    };
  }, []);

  const changeLanguage = (newLang: SupportedLanguage) => {
    // 1. Save preference
    localStorage.setItem('simple-language', newLang);

    // 2. Calculate new path
    const w = window;
    const currentPath = w.location.pathname;

    // Remove existing language prefix if present
    let pathWithoutLang = currentPath;
    const supportedLangs = ['en', 'fr', 'de', 'it', 'pt']; // 'es' is default (no prefix)

    for (const lang of supportedLangs) {
      if (pathWithoutLang.startsWith(`/${lang}/`) || pathWithoutLang === `/${lang}`) {
        pathWithoutLang = pathWithoutLang.replace(`/${lang}`, '') || '/';
        break;
      }
    }

    // Construct new URL
    let newPath = pathWithoutLang;
    if (newLang !== 'es') {
      // If root '/', pathWithoutLang is '/', so we get ///en... need to fix
      if (pathWithoutLang === '/') {
        newPath = `/${newLang}`;
      } else {
        newPath = `/${newLang}${pathWithoutLang.startsWith('/') ? '' : '/'}${pathWithoutLang}`;
      }
    } else {
      // If switching to Spanish (default), just use pathWithoutLang
      // Ensure we don't end up with empty string
      if (!newPath) newPath = '/';
    }

    // Clean up double slashes if any
    newPath = newPath.replace(/\/\//g, '/');

    console.log('Navigating to:', newPath);

    // 3. Navigate
    w.location.href = newPath;
  };

  if (!isClient) {
    return null; // Don't render on server
  }

  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-black text-white hover:bg-gray-800 transition-colors duration-200 px-4 py-3 rounded-lg shadow-lg border border-gray-700 hover:border-gray-600 flex items-center gap-2 text-sm font-medium min-w-[120px]"
          title="Cambiar idioma / Change language"
        >
          <span className="flex items-center gap-2">
            <span className="text-lg">{currentLanguage.flag}</span>
            <span className="font-bold">{currentLanguage.code.toUpperCase()}</span>
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 bg-black border border-gray-700 rounded-lg shadow-xl overflow-hidden min-w-[160px] z-50">
            {languages.map((language) => (
              <button
                key={language.code}
                type="button"
                onClick={() => changeLanguage(language.code)}
                className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-800 transition-colors duration-200 flex items-center gap-3 ${currentLang === language.code ? 'bg-gray-800 text-white border-l-2 border-blue-500' : 'text-gray-300'
                  }`}
              >
                <span className="text-lg">{language.flag}</span>
                <span className="font-medium">{language.name}</span>
                {currentLang === language.code && (
                  <span className="ml-auto text-blue-400">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}