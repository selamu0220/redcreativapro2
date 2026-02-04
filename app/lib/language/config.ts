// Configuración del sistema de idiomas personalizado
export const SUPPORTED_LANGUAGES = {
  es: {
    code: 'es',
    name: 'Español',
    nativeName: 'Español',
    flag: '🇪🇸',
    isDefault: true
  },
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    isDefault: false
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    isDefault: false
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    isDefault: false
  },
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    isDefault: false
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    isDefault: false
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇧🇷',
    isDefault: false
  }
} as const;

export const DEFAULT_LANGUAGE = 'en';
export const FALLBACK_LANGUAGE = 'en';
export const LANGUAGE_STORAGE_KEY = 'redcreativa-language';

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;
export type LanguageInfo = typeof SUPPORTED_LANGUAGES[LanguageCode];

// Mapeo de códigos de idioma del navegador a nuestros códigos
export const BROWSER_LANGUAGE_MAP: Record<string, LanguageCode> = {
  'es': 'es',
  'es-ES': 'es',
  'es-MX': 'es',
  'es-AR': 'es',
  'en': 'en',
  'en-US': 'en',
  'en-GB': 'en',
  'de': 'de',
  'de-DE': 'de',
  'de-AT': 'de',
  'fr': 'fr',
  'fr-FR': 'fr',
  'fr-CA': 'fr',
  'it': 'it',
  'it-IT': 'it',
  'it-CH': 'it',
  'zh': 'zh',
  'zh-CN': 'zh',
  'zh-TW': 'zh',
  'pt': 'pt',
  'pt-BR': 'pt',
  'pt-PT': 'pt'
};

// Namespaces de traducción disponibles
export const TRANSLATION_NAMESPACES = [
  'common',
  'auth',
  'dashboard',
  'writer',
  'templates',
  'plans',
  'blog',
  'contact',
  'help',
  'errors',
  'seo',
  'email-generator'
] as const;

export type TranslationNamespace = typeof TRANSLATION_NAMESPACES[number];
