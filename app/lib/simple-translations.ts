import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import es from '../../messages/es.json';
import en from '../../messages/en.json';
import fr from '../../messages/fr.json';
import pt from '../../messages/pt.json';
import it from '../../messages/it.json';
import de from '../../messages/de.json';

// Multi-language translation system
export type SupportedLanguage = 'es' | 'en' | 'fr' | 'pt' | 'it' | 'de';

const translations = {
  es,
  en,
  fr,
  pt,
  it,
  de
} as const;

export function getSimpleTranslation(key: keyof typeof translations.es, lang: SupportedLanguage = 'es') {
  const customTranslations = translations as any;
  // Fallback chain: specific lang -> es -> key itself
  return customTranslations[lang]?.[key] || translations.es[key] || key;
}

export function useSimpleTranslations(initialLang?: SupportedLanguage) {
  const pathname = usePathname();
  // Initialize with server-provided language if available, otherwise default to 'en'
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>(() => {
    if (initialLang && translations[initialLang]) return initialLang;
    return 'en';
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    if (!pathname) return;

    // Logic to detect language from Pathname or Cookie
    const detectLanguage = () => {
      // Priority 1: Detect from URL path (e.g., /es/blog)
      const locales = ['es', 'fr', 'de', 'it', 'pt'];

      const pathSegments = pathname.split('/').filter(Boolean);
      const firstSegment = pathSegments[0] as SupportedLanguage;

      if (locales.includes(firstSegment) && firstSegment in translations) {
        return firstSegment;
      }

      // Determine if we are in 'en' (default) or reading from cookie
      if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';');
        const localeCookie = cookies.find(c => c.trim().startsWith('NEXT_LOCALE='));
        if (localeCookie) {
          const cookieLang = localeCookie.split('=')[1]?.trim() as SupportedLanguage;
          if (cookieLang && cookieLang in translations) {
            return cookieLang;
          }
        }
      }

      return 'en';
    };

    const detected = detectLanguage();
    // Only update if different from initial to avoid unnecessary re-renders
    if (detected !== currentLang) {
      setCurrentLang(detected);
    }

  }, [pathname]); // Re-run whenever pathname changes!

  const t = (key: keyof typeof translations.es) => {
    try {
      return getSimpleTranslation(key, currentLang);
    } catch (error) {
      console.warn('Translation error for key:', key, error);
      return translations.es[key] || key;
    }
  };

  return { t, currentLang, isClient };
}
