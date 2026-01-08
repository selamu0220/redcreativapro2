import { SUPPORTED_LOCALES, type SupportedLocale, DEFAULT_LOCALE } from './constants';

/**
 * Detecta el idioma preferido del navegador
 */
export function detectBrowserLanguage(): SupportedLocale {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }

  // Obtener idiomas del navegador
  const browserLanguages = navigator.languages || [navigator.language];
  
  // Buscar el primer idioma soportado
  for (const lang of browserLanguages) {
    const langCode = lang.split('-')[0] as SupportedLocale;
    if (langCode in SUPPORTED_LOCALES) {
      return langCode;
    }
  }

  return DEFAULT_LOCALE;
}

/**
 * Obtiene el idioma actual desde cookie o detecta automáticamente
 */
export function getCurrentLanguage(): SupportedLocale {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }

  // Intentar obtener de cookie primero
  const cookies = document.cookie.split(';');
  const localeCookie = cookies.find(cookie => 
    cookie.trim().startsWith('locale=')
  );

  if (localeCookie) {
    const locale = localeCookie.split('=')[1] as SupportedLocale;
    if (locale in SUPPORTED_LOCALES) {
      return locale;
    }
  }

  // Si no hay cookie, detectar del navegador
  return detectBrowserLanguage();
}

/**
 * Guarda la preferencia de idioma
 */
export function saveLanguagePreference(locale: SupportedLocale): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Guardar en cookie con expiración de 1 año
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  
  document.cookie = `locale=${locale}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
}

/**
 * Resetea la preferencia de idioma
 */
export function resetLanguagePreference(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Eliminar cookie
  document.cookie = 'locale=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
}

/**
 * Inicializa la detección de idioma en el cliente
 */
export function initializeLanguageDetection(): SupportedLocale {
  const currentLang = getCurrentLanguage();
  
  // Si no hay preferencia guardada, guardar la detectada
  const cookies = document.cookie.split(';');
  const hasLocaleCookie = cookies.some(cookie => 
    cookie.trim().startsWith('locale=')
  );

  if (!hasLocaleCookie) {
    saveLanguagePreference(currentLang);
  }

  return currentLang;
}