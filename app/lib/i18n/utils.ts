import { LocaleCode, SUPPORTED_LOCALES, DEFAULT_LOCALE, BROWSER_LANGUAGE_MAP, LOCALE_STORAGE_KEY } from './config';
import { InterpolationParams } from './types';

/**
 * Detecta el idioma preferido del navegador
 */
export function detectBrowserLanguage(): LocaleCode {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }

  const browserLang = navigator.language || navigator.languages?.[0];
  
  if (!browserLang) {
    return DEFAULT_LOCALE;
  }

  // Buscar coincidencia exacta
  if (BROWSER_LANGUAGE_MAP[browserLang]) {
    return BROWSER_LANGUAGE_MAP[browserLang];
  }

  // Buscar coincidencia por código de idioma base (ej: 'en' de 'en-US')
  const baseLang = browserLang.split('-')[0];
  if (BROWSER_LANGUAGE_MAP[baseLang]) {
    return BROWSER_LANGUAGE_MAP[baseLang];
  }

  return DEFAULT_LOCALE;
}

/**
 * Guarda el idioma seleccionado en localStorage
 */
export function saveLocaleToStorage(locale: LocaleCode): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch (error) {
    console.warn('No se pudo guardar el idioma en localStorage:', error);
  }
}

/**
 * Obtiene el idioma guardado en localStorage
 */
export function getLocaleFromStorage(): LocaleCode | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && isValidLocale(stored)) {
      return stored as LocaleCode;
    }
  } catch (error) {
    console.warn('No se pudo leer el idioma de localStorage:', error);
  }
  
  return null;
}

/**
 * Valida si un código de idioma es soportado
 */
export function isValidLocale(locale: string): locale is LocaleCode {
  return locale in SUPPORTED_LOCALES;
}

/**
 * Obtiene la información completa de un idioma
 */
export function getLocaleInfo(locale: LocaleCode) {
  return SUPPORTED_LOCALES[locale];
}

/**
 * Interpola parámetros en una cadena de traducción
 */
export function interpolateString(
  template: string,
  params?: InterpolationParams
): string {
  if (!params) return template;

  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = params[key];
    return value !== undefined ? String(value) : match;
  });
}

/**
 * Obtiene una traducción anidada usando notación de punto
 */
export function getNestedTranslation(
  translations: Record<string, any>,
  key: string
): string | undefined {
  const keys = key.split('.');
  let current = translations;

  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
}

/**
 * Determina el idioma inicial basado en preferencias del usuario
 */
export function getInitialLocale(): LocaleCode {
  // 1. Verificar localStorage
  const storedLocale = getLocaleFromStorage();
  if (storedLocale) {
    return storedLocale;
  }

  // 2. Detectar idioma del navegador
  const browserLocale = detectBrowserLanguage();
  
  // 3. Guardar la detección automática
  saveLocaleToStorage(browserLocale);
  
  return browserLocale;
}

/**
 * Carga las traducciones de un namespace específico
 */
export async function loadTranslations(
  locale: LocaleCode,
  namespace: string
): Promise<Record<string, string> | null> {
  try {
    const response = await fetch(`/locales/${locale}/${namespace}.json`);
    
    if (!response.ok) {
      console.warn(`No se pudieron cargar las traducciones para ${locale}/${namespace}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error cargando traducciones ${locale}/${namespace}:`, error);
    return null;
  }
}

/**
 * Genera meta tags para SEO multiidioma
 */
export function generateI18nMetaTags(locale: LocaleCode, alternateUrls: Record<LocaleCode, string>) {
  const localeInfo = getLocaleInfo(locale);
  
  return {
    htmlLang: locale,
    alternates: Object.entries(alternateUrls).map(([lang, url]) => ({
      hrefLang: lang,
      href: url
    })),
    openGraph: {
      locale: locale === 'zh' ? 'zh_CN' : locale.replace('-', '_')
    }
  };
}
