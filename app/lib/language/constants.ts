export const SUPPORTED_LOCALES = {
  es: {
    code: 'es',
    name: 'Español',
    nativeName: 'Español',
    flag: '🇪🇸'
  },
  en: {
    code: 'en', 
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
  fr: {
    code: 'fr',
    name: 'Français', 
    nativeName: 'Français',
    flag: '🇫🇷'
  },
  de: {
    code: 'de',
    name: 'Deutsch',
    nativeName: 'Deutsch', 
    flag: '🇩🇪'
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳'
  },
  pt: {
    code: 'pt',
    name: 'Português',
    nativeName: 'Português',
    flag: '🇵🇹'
  }
} as const;

export type SupportedLocale = keyof typeof SUPPORTED_LOCALES;

export const DEFAULT_LOCALE: SupportedLocale = 'es';

export const LOCALE_NAMES = Object.values(SUPPORTED_LOCALES);

export function isValidLocale(locale: string): locale is SupportedLocale {
  return locale in SUPPORTED_LOCALES;
}
