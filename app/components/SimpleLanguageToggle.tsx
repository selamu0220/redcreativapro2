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

  useEffect(() => {
    // Get language from localStorage on mount
    const savedLang = localStorage.getItem('simple-language') as SupportedLanguage | null;
    if (savedLang) {
      setCurrentLang(savedLang);
    }
  }, []);

  const changeLanguage = (newLang: SupportedLanguage) => {
    setCurrentLang(newLang);
    localStorage.setItem('simple-language', newLang);
    setIsOpen(false);
    
    // Trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: newLang }));
  };

  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-black text-white hover:bg-gray-800 transition-colors duration-200 px-3 py-2 rounded-lg shadow-lg border border-gray-700 hover:border-gray-600 flex items-center gap-2 text-sm font-medium"
          title="Cambiar idioma / Change language"
        >
          <span className="flex items-center gap-1">
            <span>{currentLanguage.flag}</span>
            <span>{currentLanguage.code.toUpperCase()}</span>
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 bg-black border border-gray-700 rounded-lg shadow-xl overflow-hidden min-w-[140px]">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => changeLanguage(language.code)}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-800 transition-colors duration-200 flex items-center gap-2 ${
                  currentLang === language.code ? 'bg-gray-800 text-white' : 'text-gray-300'
                }`}
              >
                <span>{language.flag}</span>
                <span>{language.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[-1]" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}