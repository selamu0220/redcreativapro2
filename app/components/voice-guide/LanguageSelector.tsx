'use client';

import React, { useState } from 'react';
import { SupportedLanguage } from '../../types/voice-guide';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface LanguageSelectorProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
  disabled?: boolean;
}

const LANGUAGES = [
  { code: 'en' as SupportedLanguage, name: 'English', flag: '🇺🇸' },
  { code: 'es' as SupportedLanguage, name: 'Español', flag: '🇪🇸' },
  { code: 'fr' as SupportedLanguage, name: 'Français', flag: '🇫🇷' },
  { code: 'de' as SupportedLanguage, name: 'Deutsch', flag: '🇩🇪' }
];

export function LanguageSelector({
  currentLanguage,
  onLanguageChange,
  disabled = false
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = LANGUAGES.find(lang => lang.code === currentLanguage) || LANGUAGES[0];

  const getLabels = () => {
    switch (currentLanguage) {
      case 'es':
        return {
          selectLanguage: 'Seleccionar idioma',
          language: 'Idioma'
        };
      case 'fr':
        return {
          selectLanguage: 'Sélectionner la langue',
          language: 'Langue'
        };
      case 'de':
        return {
          selectLanguage: 'Sprache auswählen',
          language: 'Sprache'
        };
      default:
        return {
          selectLanguage: 'Select language',
          language: 'Language'
        };
    }
  };

  const labels = getLabels();

  const handleLanguageSelect = (language: SupportedLanguage) => {
    onLanguageChange(language);
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-language-selector]')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" data-language-selector>
      <button
        onClick={handleToggle}
        disabled={disabled}
        className={`flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm transition-all duration-200 ${
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:border-gray-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
        }`}
        title={labels.selectLanguage}
      >
        <Globe className="w-4 h-4 text-gray-600" />
        <span className="text-lg">{currentLang.flag}</span>
        <span className="text-sm font-medium text-gray-700">
          {currentLang.name}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="py-1">
            {LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors duration-150 ${
                  language.code === currentLanguage
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{language.flag}</span>
                  <span className="text-sm font-medium">{language.name}</span>
                </div>
                
                {language.code === currentLanguage && (
                  <Check className="w-4 h-4 text-purple-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for smaller spaces
interface CompactLanguageSelectorProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
  disabled?: boolean;
}

export function CompactLanguageSelector({
  currentLanguage,
  onLanguageChange,
  disabled = false
}: CompactLanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentLang = LANGUAGES.find(lang => lang.code === currentLanguage) || LANGUAGES[0];

  const handleLanguageSelect = (language: SupportedLanguage) => {
    onLanguageChange(language);
    setIsOpen(false);
  };

  return (
    <div className="relative" data-language-selector>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center space-x-1 px-2 py-1 bg-white border border-gray-300 rounded-md text-sm transition-all duration-200 ${
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500'
        }`}
      >
        <span className="text-sm">{currentLang.flag}</span>
        <span className="text-xs font-medium text-gray-600">
          {currentLang.code.toUpperCase()}
        </span>
        <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden min-w-[120px]">
          <div className="py-1">
            {LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                className={`w-full flex items-center space-x-2 px-3 py-1.5 text-left text-sm transition-colors duration-150 ${
                  language.code === currentLanguage
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-sm">{language.flag}</span>
                <span className="text-xs font-medium">{language.name}</span>
                {language.code === currentLanguage && (
                  <Check className="w-3 h-3 text-purple-600 ml-auto" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}