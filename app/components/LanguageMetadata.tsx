'use client';

import { useEffect } from 'react';
import { SUPPORTED_LANGUAGES, LanguageCode } from '../lib/language/config';
import { removeLanguageFromPath, addLanguageToPath } from '../lib/language/routing';

interface LanguageMetadataProps {
  currentLanguage: LanguageCode;
  pathname: string;
}

/**
 * Component that generates hreflang tags for SEO multi-language support
 * Automatically creates alternate language links for all supported languages
 */
export default function LanguageMetadata({ currentLanguage, pathname }: LanguageMetadataProps) {
  useEffect(() => {
    // Remove any existing hreflang tags to avoid duplicates
    const existingHreflangs = document.querySelectorAll('link[hreflang]');
    existingHreflangs.forEach(link => link.remove());

    // Get the clean pathname without language prefix
    const cleanPath = removeLanguageFromPath(pathname);
    const baseURL = window.location.origin;

    // Create hreflang tags for all supported languages
    Object.entries(SUPPORTED_LANGUAGES).forEach(([langCode, langInfo]) => {
      const language = langCode as LanguageCode;
      const languageURL = `${baseURL}${addLanguageToPath(cleanPath, language)}`;
      
      // Create hreflang link element
      const hrefLangLink = document.createElement('link');
      hrefLangLink.rel = 'alternate';
      hrefLangLink.hreflang = getHrefLangCode(language);
      hrefLangLink.href = languageURL;
      
      // Add to document head
      document.head.appendChild(hrefLangLink);
    });

    // Add x-default hreflang pointing to Spanish version (default)
    const defaultURL = `${baseURL}${addLanguageToPath(cleanPath, 'es')}`;
    const defaultHrefLangLink = document.createElement('link');
    defaultHrefLangLink.rel = 'alternate';
    defaultHrefLangLink.hreflang = 'x-default';
    defaultHrefLangLink.href = defaultURL;
    document.head.appendChild(defaultHrefLangLink);

    // Cleanup function to remove hreflang tags when component unmounts
    return () => {
      const hreflangs = document.querySelectorAll('link[hreflang]');
      hreflangs.forEach(link => link.remove());
    };
  }, [currentLanguage, pathname]);

  // This component doesn't render anything visible
  return null;
}

/**
 * Maps our language codes to proper hreflang codes with region
 * Following ISO 639-1 (language) and ISO 3166-1 (country) standards
 */
function getHrefLangCode(language: LanguageCode): string {
  const hrefLangMap: Record<LanguageCode, string> = {
    es: 'es-ES', // Spanish (Spain)
    en: 'en-US', // English (United States)
    de: 'de-DE', // German (Germany)
    fr: 'fr-FR', // French (France)
    zh: 'zh-CN',  // Chinese (China, Simplified)
    pt: 'pt-BR'  // Portuguese (Brazil)
  };

  return hrefLangMap[language] || language;
}

/**
 * Server-side function to generate hreflang links for SSR
 * Used in layout.tsx or page components for initial page load
 */
export function generateHrefLangLinks(pathname: string, baseURL: string): Array<{ hrefLang: string; href: string }> {
  const cleanPath = removeLanguageFromPath(pathname);
  const hrefLangLinks: Array<{ hrefLang: string; href: string }> = [];

  // Generate hreflang links for all supported languages
  Object.keys(SUPPORTED_LANGUAGES).forEach(langCode => {
    const language = langCode as LanguageCode;
    const languageURL = `${baseURL}${addLanguageToPath(cleanPath, language)}`;
    
    hrefLangLinks.push({
      hrefLang: getHrefLangCode(language),
      href: languageURL
    });
  });

  // Add x-default pointing to Spanish version
  const defaultURL = `${baseURL}${addLanguageToPath(cleanPath, 'es')}`;
  hrefLangLinks.push({
    hrefLang: 'x-default',
    href: defaultURL
  });

  return hrefLangLinks;
}

/**
 * Hook to get current page hreflang alternatives
 * Useful for generating language switcher with proper URLs
 */
export function useHrefLangAlternatives(): Array<{ language: LanguageCode; hrefLang: string; url: string; name: string }> {
  if (typeof window === 'undefined') return [];

  const pathname = window.location.pathname;
  const cleanPath = removeLanguageFromPath(pathname);
  const baseURL = window.location.origin;

  return Object.entries(SUPPORTED_LANGUAGES).map(([langCode, langInfo]) => {
    const language = langCode as LanguageCode;
    const languageURL = `${baseURL}${addLanguageToPath(cleanPath, language)}`;
    
    return {
      language,
      hrefLang: getHrefLangCode(language),
      url: languageURL,
      name: langInfo.nativeName
    };
  });
}