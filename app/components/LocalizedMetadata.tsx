'use client';

import { useEffect } from 'react';
import { useLanguage } from '../lib/language/context';
import { usePathname } from 'next/navigation';
import { generateLocalizedStructuredData } from '../lib/language/metadata';

interface LocalizedMetadataProps {
  pageKey?: string;
  customTitle?: string;
  customDescription?: string;
  customKeywords?: string[];
}

/**
 * Client-side component that updates meta tags dynamically based on current language
 * This component handles meta tag updates after language changes on the client
 */
export default function LocalizedMetadata({
  pageKey,
  customTitle,
  customDescription,
  customKeywords
}: LocalizedMetadataProps) {
  const { currentLanguage, t } = useLanguage();
  const pathname = usePathname();

  useEffect(() => {
    const updateMetaTags = async () => {
      try {
        // Update document title
        if (customTitle) {
          document.title = customTitle;
        } else {
          // Try to get title from translations
          const titleKey = pageKey ? `pages.${pageKey}.title` : 'meta.defaultTitle';
          const translatedTitle = t(titleKey, 'seo');
          if (translatedTitle && translatedTitle !== titleKey) {
            document.title = translatedTitle;
          }
        }

        // Update meta description
        const descriptionMeta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
        if (descriptionMeta) {
          if (customDescription) {
            descriptionMeta.content = customDescription;
          } else {
            const descKey = pageKey ? `pages.${pageKey}.description` : 'meta.defaultDescription';
            const translatedDesc = t(descKey, 'seo');
            if (translatedDesc && translatedDesc !== descKey) {
              descriptionMeta.content = translatedDesc;
            }
          }
        }

        // Update meta keywords
        const keywordsMeta = document.querySelector('meta[name="keywords"]') as HTMLMetaElement;
        if (keywordsMeta) {
          if (customKeywords) {
            keywordsMeta.content = customKeywords.join(', ');
          } else {
            const keywordsKey = pageKey ? `pages.${pageKey}.keywords` : 'meta.keywords';
            const translatedKeywords = t(keywordsKey, 'seo');
            if (translatedKeywords && translatedKeywords !== keywordsKey) {
              keywordsMeta.content = translatedKeywords;
            }
          }
        }

        // Update Open Graph meta tags
        updateOpenGraphTags();

        // Update structured data
        await updateStructuredData();

        // Update language attributes
        updateLanguageAttributes();

      } catch (error) {
        console.error('Error updating meta tags:', error);
      }
    };

    updateMetaTags();
  }, [currentLanguage, pathname, pageKey, customTitle, customDescription, customKeywords, t]);

  const updateOpenGraphTags = () => {
    // Update og:title
    const ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement;
    if (ogTitle && customTitle) {
      ogTitle.content = customTitle;
    }

    // Update og:description
    const ogDescription = document.querySelector('meta[property="og:description"]') as HTMLMetaElement;
    if (ogDescription && customDescription) {
      ogDescription.content = customDescription;
    }

    // Update og:locale
    const ogLocale = document.querySelector('meta[property="og:locale"]') as HTMLMetaElement;
    if (ogLocale) {
      const localeMap: Record<string, string> = {
        es: 'es_ES',
        en: 'en_US',
        de: 'de_DE',
        fr: 'fr_FR',
        zh: 'zh_CN'
      };
      ogLocale.content = localeMap[currentLanguage] || 'es_ES';
    }

    // Update og:url
    const ogUrl = document.querySelector('meta[property="og:url"]') as HTMLMetaElement;
    if (ogUrl) {
      ogUrl.content = window.location.href;
    }
  };

  const updateStructuredData = async () => {
    try {
      // Remove existing structured data
      const existingStructuredData = document.querySelectorAll('script[type="application/ld+json"]');
      existingStructuredData.forEach(script => {
        if (script.textContent?.includes('@context')) {
          script.remove();
        }
      });

      // Generate new structured data
      const structuredData = await generateLocalizedStructuredData(
        currentLanguage,
        pathname,
        window.location.origin
      );

      // Add new structured data
      if (structuredData && Object.keys(structuredData).length > 0) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(structuredData);
        document.head.appendChild(script);
      }
    } catch (error) {
      console.error('Error updating structured data:', error);
    }
  };

  const updateLanguageAttributes = () => {
    // Update html lang attribute
    document.documentElement.lang = currentLanguage;

    // Update or add content-language meta tag
    let contentLanguageMeta = document.querySelector('meta[http-equiv="content-language"]') as HTMLMetaElement;
    if (!contentLanguageMeta) {
      contentLanguageMeta = document.createElement('meta');
      contentLanguageMeta.httpEquiv = 'content-language';
      document.head.appendChild(contentLanguageMeta);
    }
    contentLanguageMeta.content = currentLanguage;

    // Update or add language meta tag
    let languageMeta = document.querySelector('meta[name="language"]') as HTMLMetaElement;
    if (!languageMeta) {
      languageMeta = document.createElement('meta');
      languageMeta.name = 'language';
      document.head.appendChild(languageMeta);
    }
    languageMeta.content = currentLanguage;
  };

  // This component doesn't render anything visible
  return null;
}

/**
 * Hook to get localized meta data for the current page
 */
export function useLocalizedMeta(pageKey?: string) {
  const { currentLanguage, t } = useLanguage();

  const getTitle = (customTitle?: string) => {
    if (customTitle) return customTitle;
    const titleKey = pageKey ? `pages.${pageKey}.title` : 'meta.defaultTitle';
    return t(titleKey, 'seo');
  };

  const getDescription = (customDescription?: string) => {
    if (customDescription) return customDescription;
    const descKey = pageKey ? `pages.${pageKey}.description` : 'meta.defaultDescription';
    return t(descKey, 'seo');
  };

  const getKeywords = (customKeywords?: string[]) => {
    if (customKeywords) return customKeywords;
    const keywordsKey = pageKey ? `pages.${pageKey}.keywords` : 'meta.keywords';
    const keywords = t(keywordsKey, 'seo');
    return keywords ? keywords.split(', ') : [];
  };

  return {
    currentLanguage,
    getTitle,
    getDescription,
    getKeywords
  };
}