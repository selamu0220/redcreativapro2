import { getLocale } from 'next-intl/server';
import { cookies } from 'next/headers';
import { locales, defaultLocale, type Locale } from '../../../i18n/request';

/**
 * Get the current locale from cookies or default
 */
export async function getCurrentLocale(): Promise<Locale> {
  try {
    const cookieStore = await cookies();
    const locale = cookieStore.get('locale')?.value as Locale;
    
    if (locale && locales.includes(locale)) {
      return locale;
    }
    
    return defaultLocale;
  } catch {
    return defaultLocale;
  }
}

/**
 * Generate hreflang links for all supported locales
 */
export function generateHreflangLinks(baseUrl: string, pathname: string = '') {
  const hreflangLinks = locales.map(locale => ({
    rel: 'alternate',
    hrefLang: locale,
    href: `${baseUrl}${pathname}?locale=${locale}`
  }));

  // Add x-default for the default locale
  hreflangLinks.push({
    rel: 'alternate',
    hrefLang: 'x-default',
    href: `${baseUrl}${pathname}?locale=${defaultLocale}`
  });

  return hreflangLinks;
}

/**
 * Get language-specific metadata
 */
export function getLanguageMetadata(locale: Locale) {
  const languageNames: Record<Locale, string> = {
    es: 'Español',
    en: 'English',
    fr: 'Français',
    de: 'Deutsch',
    zh: '中文',
    pt: 'Português'
  };

  const descriptions: Record<Locale, string> = {
    es: 'Plataforma de IA para copywriting y generación de contenido profesional',
    en: 'AI platform for copywriting and professional content generation',
    fr: 'Plateforme IA pour la rédaction et la génération de contenu professionnel',
    de: 'KI-Plattform für Copywriting und professionelle Content-Erstellung',
    zh: '专业文案写作和内容生成的AI平台',
    pt: 'Plataforma de IA para copywriting e geração de conteúdo profissional'
  };

  const titles: Record<Locale, string> = {
    es: 'Red Creativa Pro - IA para Copywriting',
    en: 'Red Creativa Pro - AI for Copywriting',
    fr: 'Red Creativa Pro - IA pour la Rédaction',
    de: 'Red Creativa Pro - KI für Copywriting',
    zh: 'Red Creativa Pro - 文案写作AI',
    pt: 'Red Creativa Pro - IA para Copywriting'
  };

  return {
    title: titles[locale] || titles[defaultLocale],
    description: descriptions[locale] || descriptions[defaultLocale],
    language: languageNames[locale] || languageNames[defaultLocale],
    locale
  };
}

/**
 * Generate Open Graph metadata for language
 */
export function generateOpenGraphMetadata(locale: Locale, baseUrl: string) {
  const { title, description } = getLanguageMetadata(locale);
  
  return {
    title,
    description,
    locale,
    alternateLocale: locales.filter(l => l !== locale),
    url: `${baseUrl}?locale=${locale}`,
    siteName: 'Red Creativa Pro',
    type: 'website' as const
  };
}

/**
 * Generate structured data for language support
 */
export function generateLanguageStructuredData(baseUrl: string, pathname: string = '') {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Red Creativa Pro',
    url: baseUrl,
    inLanguage: locales,
    availableLanguage: locales.map(locale => ({
      '@type': 'Language',
      name: getLanguageMetadata(locale).language,
      alternateName: locale
    })),
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}&locale={locale}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
}