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
  console.log('🔍 Detectando idioma del navegador...');
  console.log('📋 Lista completa de idiomas del navegador:', browserLanguages);
  console.log('🗺️ Mapa de idiomas soportados:', BROWSER_LANGUAGE_MAP);
  
  for (const browserLang of browserLanguages) {
    console.log(`🔎 Verificando idioma: ${browserLang}`);
    
    const mappedLang = BROWSER_LANGUAGE_MAP[browserLang];
    if (mappedLang && SUPPORTED_LANGUAGES[mappedLang]) {
      console.log(`✅ Idioma exacto encontrado: ${browserLang} → ${mappedLang}`);
      return mappedLang;
    }
    
    // Intentar con solo el código de idioma (ej: 'en' de 'en-US')
    const shortLang = browserLang.split('-')[0];
    console.log(`🔎 Verificando código corto: ${shortLang}`);
    
    const mappedShortLang = BROWSER_LANGUAGE_MAP[shortLang];
    if (mappedShortLang && SUPPORTED_LANGUAGES[mappedShortLang]) {
      console.log(`✅ Código corto encontrado: ${shortLang} → ${mappedShortLang}`);
      return mappedShortLang;
    }
    
    console.log(`❌ No se encontró mapeo para: ${browserLang} (${shortLang})`);
  }
  
  console.log(`🔄 Usando idioma por defecto: ${DEFAULT_LANGUAGE}`);
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
  console.log('🚀 Obteniendo idioma inicial...');
  
  // 1. Verificar localStorage
  const storedLanguage = getLanguageFromStorage();
  if (storedLanguage) {
    console.log('💾 Idioma encontrado en localStorage:', storedLanguage);
    return storedLanguage;
  }
  
  console.log('💾 No hay idioma guardado en localStorage');
  
  // 2. Detectar idioma del navegador
  const browserLanguage = detectBrowserLanguage();
  console.log('🌐 Idioma detectado del navegador:', browserLanguage);
  
  // 3. Guardar la detección automática
  saveLanguageToStorage(browserLanguage);
  console.log('💾 Idioma guardado en localStorage:', browserLanguage);
  
  return browserLanguage;
}

/**
 * Re-detecta el idioma del navegador y actualiza si es diferente al actual
 * Útil para cuando el usuario cambia de ubicación (VPN, viajes, etc.)
 */
export function redetectBrowserLanguage(): LanguageCode | null {
  if (typeof window === 'undefined') return null;
  
  console.log('🔄 Re-detectando idioma del navegador...');
  
  const currentStored = getLanguageFromStorage();
  console.log('💾 Idioma actual guardado:', currentStored);
  
  const currentBrowser = detectBrowserLanguage();
  console.log('🌐 Idioma actual del navegador:', currentBrowser);
  
  // Si el idioma detectado es diferente al guardado, actualizar
  if (currentBrowser !== currentStored) {
    console.log(`🔄 Idioma detectado cambió de ${currentStored} a ${currentBrowser}`);
    saveLanguageToStorage(currentBrowser);
    return currentBrowser;
  }
  
  console.log('⏸️ No hay cambios en el idioma detectado');
  return null;
}

/**
 * Fuerza la re-detección del idioma ignorando localStorage
 * Útil para botón "Detectar automáticamente" 
 */
export function forceLanguageDetection(): LanguageCode {
  console.log('🔧 Forzando detección de idioma...');
  
  const browserLanguage = detectBrowserLanguage();
  console.log('🌐 Idioma forzado detectado:', browserLanguage);
  
  saveLanguageToStorage(browserLanguage);
  console.log('💾 Idioma forzado guardado:', browserLanguage);
  
  return browserLanguage;
}

/**
 * Fuerza la detección híbrida (geolocalización + navegador)
 * Útil para casos de VPN donde la ubicación es más relevante
 */
export async function forceHybridLanguageDetection(): Promise<LanguageCode> {
  console.log('🔧 Forzando detección híbrida de idioma...');
  
  try {
    const { detectLanguageHybrid } = await import('./geolocation');
    const hybridLanguage = await detectLanguageHybrid();
    
    console.log('🌍 Idioma híbrido detectado:', hybridLanguage);
    saveLanguageToStorage(hybridLanguage);
    console.log('💾 Idioma híbrido guardado:', hybridLanguage);
    
    return hybridLanguage;
  } catch (error) {
    console.error('❌ Error en detección híbrida, fallback a navegador:', error);
    return forceLanguageDetection();
  }
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