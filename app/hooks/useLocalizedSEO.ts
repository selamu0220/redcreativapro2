'use client';

import { useLocale } from 'next-intl';
import { useCallback, useMemo } from 'react';
import { SUPPORTED_LOCALES, type SupportedLocale } from '../lib/language/constants';

/**
 * Hook for generating SEO-optimized URLs with proper locale parameters
 */
export function useLocalizedSEO() {
  const currentLocale = useLocale() as SupportedLocale;

  /**
   * Generate a localized URL with proper locale parameter
   */
  const getLocalizedUrl = useCallback((path: string = '', locale?: SupportedLocale) => {
    const targetLocale = locale || currentLocale;
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    
    const url = new URL(path, baseUrl);
    url.searchParams.set('locale', targetLocale);
    
    return url.toString();
  }, [currentLocale]);

  /**
   * Generate hreflang URLs for all supported locales
   */
  const getHreflangUrls = useCallback((path: string = '') => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    
    const hreflangUrls = Object.keys(SUPPORTED_LOCALES).map(locale => ({
      locale: locale as SupportedLocale,
      url: getLocalizedUrl(path, locale as SupportedLocale),
      hreflang: locale,
      language: SUPPORTED_LOCALES[locale as SupportedLocale].nativeName
    }));

    // Add x-default
    hreflangUrls.push({
      locale: 'es' as SupportedLocale,
      url: getLocalizedUrl(path, 'es'),
      hreflang: 'x-default',
      language: 'Default' as any // Type assertion for x-default case
    });

    return hreflangUrls;
  }, [getLocalizedUrl]);

  /**
   * Generate canonical URL for current locale
   */
  const getCanonicalUrl = useCallback((path: string = '') => {
    return getLocalizedUrl(path, currentLocale);
  }, [getLocalizedUrl, currentLocale]);

  /**
   * Generate Open Graph URL for current locale
   */
  const getOpenGraphUrl = useCallback((path: string = '') => {
    return getLocalizedUrl(path, currentLocale);
  }, [getLocalizedUrl, currentLocale]);

  /**
   * Get language-specific meta tags
   */
  const getLanguageMetaTags = useMemo(() => {
    const currentLanguage = SUPPORTED_LOCALES[currentLocale];
    
    return {
      language: currentLocale,
      contentLanguage: currentLocale,
      ogLocale: currentLocale,
      alternateLocales: Object.keys(SUPPORTED_LOCALES).filter(l => l !== currentLocale),
      nativeName: currentLanguage.nativeName,
      englishName: currentLanguage.name
    };
  }, [currentLocale]);

  /**
   * Generate structured data for language support
   */
  const getLanguageStructuredData = useCallback((siteName: string = 'Red Creativa Pro') => {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      url: typeof window !== 'undefined' ? window.location.origin : '',
      inLanguage: Object.keys(SUPPORTED_LOCALES),
      availableLanguage: Object.entries(SUPPORTED_LOCALES).map(([code, lang]) => ({
        '@type': 'Language',
        name: lang.nativeName,
        alternateName: code
      }))
    };
  }, []);

  return {
    currentLocale,
    getLocalizedUrl,
    getHreflangUrls,
    getCanonicalUrl,
    getOpenGraphUrl,
    getLanguageMetaTags,
    getLanguageStructuredData
  };
}
