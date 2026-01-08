'use client';

import { useLocale } from 'next-intl';
import { useEffect } from 'react';
import { SUPPORTED_LOCALES, type SupportedLocale } from '../lib/language/constants';

interface LanguageSEOProps {
  pageTitle?: string;
  pageDescription?: string;
  canonicalUrl?: string;
}

/**
 * Client-side component to add language-specific SEO meta tags
 * This component updates meta tags dynamically when language changes
 */
export function LanguageSEO({ pageTitle, pageDescription, canonicalUrl }: LanguageSEOProps) {
  const locale = useLocale() as SupportedLocale;

  useEffect(() => {
    // Update document language
    document.documentElement.lang = locale;
    
    // Update or create meta tags
    const updateMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Update language-related meta tags
    updateMetaTag('language', locale);
    updateMetaTag('content-language', locale);
    
    // Update page title if provided
    if (pageTitle) {
      document.title = pageTitle;
    }
    
    // Update page description if provided
    if (pageDescription) {
      updateMetaTag('description', pageDescription);
    }

    // Update canonical URL with locale parameter
    if (canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      
      const url = new URL(canonicalUrl);
      url.searchParams.set('locale', locale);
      canonical.href = url.toString();
    }

    // Add or update hreflang links
    const baseUrl = window.location.origin;
    const pathname = window.location.pathname;
    
    // Remove existing hreflang links
    document.querySelectorAll('link[hreflang]').forEach(link => link.remove());
    
    // Add new hreflang links
    Object.keys(SUPPORTED_LOCALES).forEach(localeCode => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = localeCode;
      
      const url = new URL(pathname, baseUrl);
      url.searchParams.set('locale', localeCode);
      link.href = url.toString();
      
      document.head.appendChild(link);
    });

    // Add x-default hreflang
    const defaultLink = document.createElement('link');
    defaultLink.rel = 'alternate';
    defaultLink.hreflang = 'x-default';
    
    const defaultUrl = new URL(pathname, baseUrl);
    defaultUrl.searchParams.set('locale', 'es'); // Default to Spanish
    defaultLink.href = defaultUrl.toString();
    
    document.head.appendChild(defaultLink);

    // Update Open Graph locale
    const updateOGTag = (property: string, content: string) => {
      let og = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!og) {
        og = document.createElement('meta');
        og.setAttribute('property', property);
        document.head.appendChild(og);
      }
      og.content = content;
    };

    updateOGTag('og:locale', locale);
    
    // Add alternate locales
    const alternateLocales = Object.keys(SUPPORTED_LOCALES).filter(l => l !== locale);
    
    // Remove existing alternate locale tags
    document.querySelectorAll('meta[property="og:locale:alternate"]').forEach(meta => meta.remove());
    
    // Add new alternate locale tags
    alternateLocales.forEach(altLocale => {
      updateOGTag('og:locale:alternate', altLocale);
    });

  }, [locale, pageTitle, pageDescription, canonicalUrl]);

  return null; // This component doesn't render anything
}