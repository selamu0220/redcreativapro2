import { 
  LanguageCode, 
  SUPPORTED_LANGUAGES, 
  DEFAULT_LANGUAGE, 
  BROWSER_LANGUAGE_MAP, 
  LANGUAGE_STORAGE_KEY,
  TranslationNamespace 
} from './config';
import { TranslationData, InterpolationParams } from './types';

/**
 * Detecta el idioma preferido del navegador
 */
export function detectBrowserLanguage(): LanguageCode {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;

  const browserLanguages = navigator.languages || [navigator.language];
  
  for (const browserLang of browserLanguages) {
    const mappedLang = BROWSER_LANGUAGE_MAP[browserLang];
    if (mappedLang && SUPPORTED_LANGUAGES[mappedLang]) {
      return mappedLang;
    }
    
    // Intentar con solo el código de idioma (ej: 'en' de 'en-US')
    const shortLang = browserLang.split('-')[0];
    const mappedShortLang = BROWSER_LANGUAGE_MAP[shortLang];
    if (mappedShortLang && SUPPORTED_LANGUAGES[mappedShortLang]) {
      return mappedShortLang;
    }
  }
  
  return DEFAULT_LANGUAGE;
}

/**
 * Guarda el idioma en localStorage
 */
export function saveLanguageToStorage(language: LanguageCode): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    console.warn('No se pudo guardar el idioma en localStorage:', error);
  }
}

/**
 * Obtiene el idioma guardado en localStorage
 */
export function getLanguageFromStorage(): LanguageCode | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && isValidLanguage(stored as LanguageCode)) {
      return stored as LanguageCode;
    }
  } catch (error) {
    console.warn('No se pudo leer el idioma de localStorage:', error);
  }
  
  return null;
}

/**
 * Verifica si un código de idioma es válido
 */
export function isValidLanguage(language: string): language is LanguageCode {
  return language in SUPPORTED_LANGUAGES;
}

/**
 * Obtiene la información de un idioma
 */
export function getLanguageInfo(language: LanguageCode) {
  return SUPPORTED_LANGUAGES[language];
}

/**
 * Interpola parámetros en una cadena de traducción
 */
export function interpolateString(text: string, params?: InterpolationParams): string {
  if (!params) return text;
  
  return Object.entries(params).reduce((result, [key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    return result.replace(regex, String(value));
  }, text);
}

/**
 * Obtiene una traducción anidada usando notación de puntos
 */
export function getNestedTranslation(obj: TranslationData, path: string): string | undefined {
  return path.split('.').reduce((current: any, key) => {
    return current && typeof current === 'object' ? current[key] : undefined;
  }, obj as any);
}

/**
 * Determina el idioma inicial basado en preferencias
 */
export function getInitialLanguage(): LanguageCode {
  // 1. Verificar localStorage
  const storedLanguage = getLanguageFromStorage();
  if (storedLanguage) {
    return storedLanguage;
  }
  
  // 2. Detectar idioma del navegador
  const browserLanguage = detectBrowserLanguage();
  
  // 3. Guardar la detección automática
  saveLanguageToStorage(browserLanguage);
  
  return browserLanguage;
}

/**
 * Carga las traducciones de un namespace específico
 */
export async function loadTranslations(
  language: LanguageCode, 
  namespace: TranslationNamespace
): Promise<TranslationData> {
  try {
    const response = await fetch(`/api/locales/${language}/${namespace}`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error cargando traducciones ${language}/${namespace}:`, error);
    
    // Fallback: intentar cargar el idioma por defecto
    if (language !== DEFAULT_LANGUAGE) {
      try {
        const fallbackResponse = await fetch(`/api/locales/${DEFAULT_LANGUAGE}/${namespace}`);
        if (fallbackResponse.ok) {
          return await fallbackResponse.json();
        }
      } catch (fallbackError) {
        console.error('Error cargando traducciones de fallback:', fallbackError);
      }
    }
    
    return {};
  }
}

/**
 * Genera meta tags para SEO multiidioma
 */
export function generateLanguageMetaTags(currentLanguage: LanguageCode, currentPath: string) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  
  const metaTags = [
    { property: 'og:locale', content: currentLanguage },
    { name: 'language', content: currentLanguage },
    { httpEquiv: 'content-language', content: currentLanguage }
  ];
  
  // Agregar enlaces alternativos para otros idiomas
  Object.keys(SUPPORTED_LANGUAGES).forEach((lang) => {
    if (lang !== currentLanguage) {
      metaTags.push({
        rel: 'alternate',
        hrefLang: lang,
        href: `${baseUrl}${currentPath}`
      } as any);
    }
  });
  
  return metaTags;
}