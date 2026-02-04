'use client';

import { useLocale } from 'next-intl';
import { useCallback, useEffect } from 'react';
import { SUPPORTED_LOCALES, type SupportedLocale, isValidLocale } from '../lib/language/constants';
import { 
  detectBrowserLanguage, 
  saveLanguagePreference, 
  initializeLanguageDetection 
} from '../lib/language/detection';

export function useLanguage() {
  const currentLocale = useLocale() as SupportedLocale;

  // Inicializar detección de idioma al montar el componente
  useEffect(() => {
    initializeLanguageDetection();
  }, []);

  const changeLanguage = useCallback(async (newLocale: SupportedLocale) => {
    if (!isValidLocale(newLocale)) {
      console.error(`Invalid locale: ${newLocale}`);
      return;
    }

    if (newLocale === currentLocale) {
      return;
    }

    try {
      // Guardar preferencia
      saveLanguagePreference(newLocale);
      
      // Recargar página para aplicar el nuevo idioma
      window.location.reload();
    } catch (error) {
      console.error('Error changing language:', error);
      throw error;
    }
  }, [currentLocale]);

  const getCurrentLanguage = useCallback(() => {
    return SUPPORTED_LOCALES[currentLocale];
  }, [currentLocale]);

  const getAvailableLanguages = useCallback(() => {
    return Object.values(SUPPORTED_LOCALES);
  }, []);

  return {
    currentLocale,
    currentLanguage: getCurrentLanguage(),
    availableLanguages: getAvailableLanguages(),
    changeLanguage,
    detectBrowserLanguage,
    isValidLocale
  };
}
