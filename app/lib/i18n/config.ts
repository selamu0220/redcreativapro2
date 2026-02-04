// Configuración del sistema de internacionalización
export const SUPPORTED_LOCALES = {
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
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    isDefault: false
  }
} as const;

export const DEFAULT_LOCALE = 'es';
export const FALLBACK_LOCALE = 'es';

// Lista de códigos de idioma soportados
export const LOCALE_CODES = Object.keys(SUPPORTED_LOCALES) as LocaleCode[];

// Configuración de detección de idioma del navegador
export const BROWSER_LANGUAGE_MAP: Record<string, LocaleCode> = {
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
  'zh': 'zh',
  'zh-CN': 'zh',
  'zh-TW': 'zh'
};

// Configuración de localStorage
export const LOCALE_STORAGE_KEY = 'redcreativa-locale';

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
  'errors'
] as const;

// Tipos TypeScript
export type LocaleCode = keyof typeof SUPPORTED_LOCALES;
export type LocaleInfo = typeof SUPPORTED_LOCALES[LocaleCode];
export type TranslationNamespace = typeof TRANSLATION_NAMESPACES[number];

export interface TranslationFile {
  [key: string]: string | TranslationFile;
}

export interface I18nConfig {
  locale: LocaleCode;
  fallbackLocale: LocaleCode;
  translations: Record<TranslationNamespace, TranslationFile>;
}
