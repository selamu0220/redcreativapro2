'use client';

import { useTranslations } from 'next-intl';
import { useCallback } from 'react';

/**
 * Hook que proporciona traducciones con manejo seguro de errores
 */
export function useSafeTranslations(namespace?: string) {
  const t = useTranslations(namespace);

  const safeT = useCallback((key: string, values?: Record<string, any>, fallback?: string) => {
    try {
      return t(key, values);
    } catch (error) {
      console.warn(`Translation missing for key: ${namespace ? `${namespace}.` : ''}${key}`, error);
      
      // Retornar fallback o la clave como último recurso
      return fallback || key.split('.').pop() || key;
    }
  }, [t, namespace]);

  const hasTranslation = useCallback((key: string) => {
    try {
      const translation = t(key);
      return translation !== key;
    } catch {
      return false;
    }
  }, [t]);

  return {
    t: safeT,
    hasTranslation,
    raw: t // Acceso directo al hook original si es necesario
  };
}

/**
 * Hook para traducciones con múltiples fallbacks
 */
export function useTranslationWithFallbacks(
  keys: string[],
  namespace?: string,
  defaultText?: string
) {
  const { t, hasTranslation } = useSafeTranslations(namespace);

  const getTranslation = useCallback((values?: Record<string, any>) => {
    // Intentar cada clave en orden
    for (const key of keys) {
      if (hasTranslation(key)) {
        return t(key, values);
      }
    }

    // Si ninguna clave funciona, usar el texto por defecto
    return defaultText || keys[0]?.split('.').pop() || 'Translation missing';
  }, [keys, hasTranslation, t, defaultText]);

  return getTranslation;
}
