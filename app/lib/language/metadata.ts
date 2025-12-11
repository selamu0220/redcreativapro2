import { Metadata } from 'next';
import { LanguageCode, SUPPORTED_LANGUAGES } from './config';
import { addLanguageToPath, removeLanguageFromPath } from './routing';

// Type definitions for SEO data structure
interface SEOTranslation {
  meta: {
    defaultTitle: string;
    defaultDescription: string;
    keywords: string;
  };
  pages: {
    [key: string]: {
      title: string;
      description: string;
      keywords: string;
    } | {
      [subKey: string]: {
        title: string;
        description: string;
        keywords: string;
      };
    };
  };
  openGraph: {
    siteName: string;
    type: string;
    locale: string;
    images: {
      [key: string]: string;
    };
  };
  twitter: {
    card: string;
    site: string;
    creator: string;
  };
  structuredData: {
    organization: {
      name: string;
      description: string;
      url: string;
      logo: string;
      sameAs: string[];
    };
    website: {
      name: string;
      description: string;
      url: string;
    };
  };
}

/**
 * Loads SEO translations for a specific language
 */
async function loadSEOTranslations(language: LanguageCode): Promise<SEOTranslation | null> {
  try {
    const seoData = await import(`../../../public/locales/${language}/seo.json`);
    return seoData.default;
  } catch (error) {
    console.warn(`Failed to load SEO translations for ${language}:`, error);
    return null;
  }
}

/**
 * Gets the page key from pathname for SEO translations
 */
function getPageKeyFromPath(pathname: string): string {
  const cleanPath = removeLanguageFromPath(pathname);
  
  // Map paths to page keys in SEO translations
  const pathMap: Record<string, string> = {
    '/': 'home',
    '/dashboard': 'dashboard',
    '/escritor-ia': 'writer',
    '/correos-ia': 'emailGenerator',
    '/plantillas': 'templates',
    '/planes': 'plans',
    '/blog': 'blog',
    '/contacto': 'contact',
    '/centro-ayuda': 'help',
    '/auth': 'auth.login',
    '/auth/signup': 'auth.signup',
  };

  return pathMap[cleanPath] || 'home';
}

/**
 * Gets nested translation value from page data
 */
function getNestedPageData(pages: any, key: string): any {
  const keys = key.split('.');
  let current = pages;
  
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      return null;
    }
  }
  
  return current;
}

/**
 * Generates hreflang alternates for all supported languages
 */
function generateHreflangAlternates(pathname: string, baseURL: string): Record<string, string> {
  const cleanPath = removeLanguageFromPath(pathname);
  const alternates: Record<string, string> = {};

  // Add alternates for all supported languages
  Object.keys(SUPPORTED_LANGUAGES).forEach(langCode => {
    const language = langCode as LanguageCode;
    const localizedPath = addLanguageToPath(cleanPath, language);
    const hrefLangCode = getHrefLangCode(language);
    alternates[hrefLangCode] = `${baseURL}${localizedPath}`;
  });

  // Add x-default pointing to Spanish version
  const defaultPath = addLanguageToPath(cleanPath, 'es');
  alternates['x-default'] = `${baseURL}${defaultPath}`;

  return alternates;
}

/**
 * Maps language codes to proper hreflang codes
 */
function getHrefLangCode(language: LanguageCode): string {
  const hrefLangMap: Record<LanguageCode, string> = {
    es: 'es-ES',
    en: 'en-US',
    de: 'de-DE',
    fr: 'fr-FR',
    zh: 'zh-CN'
  };

  return hrefLangMap[language] || language;
}

/**
 * Generates localized metadata for a specific page and language
 */
export async function generateLocalizedMetadata(
  language: LanguageCode,
  pathname: string,
  baseURL: string = 'https://redcreativa.pro'
): Promise<Metadata> {
  // Load SEO translations for the language
  const seoData = await loadSEOTranslations(language);
  
  if (!seoData) {
    // Fallback to Spanish if translations not found
    const fallbackData = await loadSEOTranslations('es');
    if (!fallbackData) {
      throw new Error('No SEO translations found');
    }
    return generateFallbackMetadata(fallbackData, pathname, baseURL, language);
  }

  // Get page-specific data
  const pageKey = getPageKeyFromPath(pathname);
  const pageData = getNestedPageData(seoData.pages, pageKey);
  
  // Use page-specific data or fall back to defaults
  const title = pageData?.title || seoData.meta.defaultTitle;
  const description = pageData?.description || seoData.meta.defaultDescription;
  const keywords = pageData?.keywords || seoData.meta.keywords;

  // Generate current page URL
  const cleanPath = removeLanguageFromPath(pathname);
  const localizedPath = addLanguageToPath(cleanPath, language);
  const currentURL = `${baseURL}${localizedPath}`;

  // Generate hreflang alternates
  const alternates = generateHreflangAlternates(pathname, baseURL);

  // Select appropriate Open Graph image
  const ogImageKey = pageKey.includes('.') ? pageKey.split('.')[0] : pageKey;
  const ogImage = seoData.openGraph.images[ogImageKey] || seoData.openGraph.images.default;

  return {
    title,
    description,
    keywords: keywords.split(', '),
    
    // Open Graph
    openGraph: {
      title,
      description,
      url: currentURL,
      siteName: seoData.openGraph.siteName,
      locale: seoData.openGraph.locale,
      type: 'website',
      images: [{
        url: `${baseURL}${ogImage}`,
        width: 1200,
        height: 630,
        alt: title
      }]
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: seoData.twitter.site,
      creator: seoData.twitter.creator,
      images: [`${baseURL}${ogImage}`]
    },

    // Canonical and alternates
    alternates: {
      canonical: currentURL,
      languages: alternates
    },

    // Additional metadata
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Language and locale
    other: {
      'language': language,
      'content-language': language,
    }
  };
}

/**
 * Generates fallback metadata when translations are not available
 */
function generateFallbackMetadata(
  fallbackData: SEOTranslation,
  pathname: string,
  baseURL: string,
  language: LanguageCode
): Metadata {
  const pageKey = getPageKeyFromPath(pathname);
  const pageData = getNestedPageData(fallbackData.pages, pageKey);
  
  const title = pageData?.title || fallbackData.meta.defaultTitle;
  const description = pageData?.description || fallbackData.meta.defaultDescription;
  const keywords = pageData?.keywords || fallbackData.meta.keywords;

  const cleanPath = removeLanguageFromPath(pathname);
  const localizedPath = addLanguageToPath(cleanPath, language);
  const currentURL = `${baseURL}${localizedPath}`;

  return {
    title: `${title} (${SUPPORTED_LANGUAGES[language].nativeName})`,
    description,
    keywords: keywords.split(', '),
    
    openGraph: {
      title,
      description,
      url: currentURL,
      siteName: fallbackData.openGraph.siteName,
      locale: getHrefLangCode(language).replace('-', '_'),
      type: 'website',
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },

    alternates: {
      canonical: currentURL,
      languages: generateHreflangAlternates(pathname, baseURL)
    },

    other: {
      'language': language,
      'content-language': language,
    }
  };
}

/**
 * Generates structured data for a specific language
 */
export async function generateLocalizedStructuredData(
  language: LanguageCode,
  pathname: string,
  baseURL: string = 'https://redcreativa.pro'
): Promise<object> {
  const seoData = await loadSEOTranslations(language);
  
  if (!seoData) {
    return {};
  }

  const cleanPath = removeLanguageFromPath(pathname);
  const localizedPath = addLanguageToPath(cleanPath, language);
  const currentURL = `${baseURL}${localizedPath}`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${baseURL}/#organization`,
        name: seoData.structuredData.organization.name,
        description: seoData.structuredData.organization.description,
        url: baseURL,
        logo: {
          '@type': 'ImageObject',
          url: seoData.structuredData.organization.logo
        },
        sameAs: seoData.structuredData.organization.sameAs
      },
      {
        '@type': 'WebSite',
        '@id': `${baseURL}/#website`,
        url: baseURL,
        name: seoData.structuredData.website.name,
        description: seoData.structuredData.website.description,
        publisher: {
          '@id': `${baseURL}/#organization`
        },
        inLanguage: language
      },
      {
        '@type': 'WebPage',
        '@id': `${currentURL}/#webpage`,
        url: currentURL,
        name: seoData.pages[getPageKeyFromPath(pathname)]?.title || seoData.meta.defaultTitle,
        isPartOf: {
          '@id': `${baseURL}/#website`
        },
        inLanguage: language
      }
    ]
  };
}

/**
 * Server-side function to detect language from headers
 */
export function detectLanguageFromHeaders(headers: Headers): LanguageCode {
  // Try to get language from custom header (set by middleware)
  const headerLanguage = headers.get('x-language');
  if (headerLanguage && SUPPORTED_LANGUAGES[headerLanguage as LanguageCode]) {
    return headerLanguage as LanguageCode;
  }

  // Try to get from pathname
  const pathname = headers.get('x-pathname') || '/';
  const pathLanguage = pathname.split('/')[1];
  if (pathLanguage && SUPPORTED_LANGUAGES[pathLanguage as LanguageCode]) {
    return pathLanguage as LanguageCode;
  }

  // Default to Spanish
  return 'es';
}

/**
 * Server-side function to get pathname from headers
 */
export function getPathnameFromHeaders(headers: Headers): string {
  return headers.get('x-pathname') || '/';
}