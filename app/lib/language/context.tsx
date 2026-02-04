'use client'

import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useSimpleTranslations, SupportedLanguage } from '../simple-translations'
import { setLanguageTag } from '@/src/paraglide/runtime'

// Define translation type
type TranslationFunction = (key: string, namespace?: string) => string

interface LanguageContextType {
  currentLocale: string;
  currentLanguage: { name: string; flag: string };
  availableLanguages: any[];
  changeLanguage: (newLang: SupportedLanguage) => Promise<void>;
  isLoading?: boolean;
  t: TranslationFunction;
}

const LanguageContext = createContext<LanguageContextType>({
  currentLocale: 'es',
  currentLanguage: { name: 'Español', flag: '🇪🇸' },
  availableLanguages: [],
  changeLanguage: async () => { },
  isLoading: false,
  t: ((key: string) => key) as TranslationFunction
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { t: simpleT, currentLang, isClient, forceUpdate: forceUpdateCounter } = useSimpleTranslations()
  const [, setForceUpdate] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()

  // CRITICAL: Synchronously detect locale from URL BEFORE any render
  // This ensures Paraglide m.*() functions get correct language on first render
  const syncDetectedLocale = (() => {
    if (typeof window === 'undefined') return currentLang; // SSR fallback

    const pathname = window.location.pathname;
    const locales = ['es', 'fr', 'de', 'it', 'pt'] as const;
    const localeMatch = pathname.match(new RegExp(`^/(${locales.join('|')})(/|$)`));

    if (localeMatch && localeMatch[1]) {
      return localeMatch[1] as SupportedLanguage;
    }
    // No locale prefix = English (default)
    return 'en' as SupportedLanguage;
  })();

  // Set Paraglide language tag synchronously with detected locale
  setLanguageTag(syncDetectedLocale as any)

  // Listen for path changes to update language (Client-side navigation)
  useEffect(() => {
    if (pathname && typeof window !== 'undefined') {
      const locales = ['es', 'fr', 'de', 'it', 'pt'] as const;
      const localeMatch = pathname.match(new RegExp(`^/(${locales.join('|')})(/|$)`));
      const detectedLang = (localeMatch && localeMatch[1] ? localeMatch[1] : 'en') as SupportedLanguage;

      if (detectedLang !== currentLang) {
        // Dispatch event to update useSimpleTranslations and other listeners
        const event = new CustomEvent('languageChanged', { detail: detectedLang })
        window.dispatchEvent(event)
        setLanguageTag(detectedLang as any)
        setForceUpdate(prev => prev + 1)
      }
    }
  }, [pathname, currentLang])

  const t: TranslationFunction = (key: string, namespace?: string) => {
    // Use the simple translations system
    return simpleT(key as any) || key
  }

  const languageNames = {
    es: { name: 'Español', flag: '🇪🇸' },
    en: { name: 'English', flag: '🇺🇸' },
    fr: { name: 'Français', flag: '🇫🇷' },
    pt: { name: 'Português', flag: '🇵🇹' },
    it: { name: 'Italiano', flag: '🇮🇹' },
    de: { name: 'Deutsch', flag: '🇩🇪' }
  }

  const currentLanguage = languageNames[currentLang] || languageNames.es

  const changeLanguage = async (newLang: SupportedLanguage) => {
    if (typeof window !== 'undefined' && newLang !== currentLang) {
      setIsLoading(true)

      try {
        // 1. Save to localStorage
        localStorage.setItem('simple-language', newLang)

        // 2. Dispatch custom event to update all components
        const event = new CustomEvent('languageChanged', { detail: newLang })
        window.dispatchEvent(event)

        // Sync Paraglide
        setLanguageTag(newLang as any)

        // 3. Force update by incrementing state
        setForceUpdate(prev => prev + 1)
      } catch (error) {
        console.error('Error changing language:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <LanguageContext.Provider value={{
      currentLocale: currentLang,
      currentLanguage,
      availableLanguages: [],
      changeLanguage,
      isLoading,
      t
    }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}

export function useTranslation(namespace?: string) {
  const context = useContext(LanguageContext)

  return {
    t: (key: string) => context.t(key, namespace),
    currentLanguage: context.currentLanguage,
    currentLocale: context.currentLocale
  }
}
