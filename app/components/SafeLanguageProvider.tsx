'use client'

import { createContext, useContext, ReactNode } from 'react'

interface LanguageContextType {
  currentLocale: string
  currentLanguage: { name: string; flag: string }
  availableLanguages: Array<{ name: string; flag: string }>
  changeLanguage: (locale: string) => void
}

const LanguageContext = createContext<LanguageContextType>({
  currentLocale: 'es',
  currentLanguage: { name: 'Español', flag: '🇪🇸' },
  availableLanguages: [
    { name: 'Español', flag: '🇪🇸' },
    { name: 'English', flag: '🇺🇸' },
    { name: 'Français', flag: '🇫🇷' },
    { name: 'Deutsch', flag: '🇩🇪' },
    { name: '中文', flag: '🇨🇳' },
    { name: 'Português', flag: '🇧🇷' }
  ],
  changeLanguage: () => {}
})

export function SafeLanguageProvider({ children }: { children: ReactNode }) {
  const changeLanguage = (locale: string) => {
    console.log(`Language change requested: ${locale}`)
    // For now, just log - we'll implement this later
  }

  return (
    <LanguageContext.Provider value={{
      currentLocale: 'es',
      currentLanguage: { name: 'Español', flag: '🇪🇸' },
      availableLanguages: [
        { name: 'Español', flag: '🇪🇸' },
        { name: 'English', flag: '🇺🇸' },
        { name: 'Français', flag: '🇫🇷' },
        { name: 'Deutsch', flag: '🇩🇪' },
        { name: '中文', flag: '🇨🇳' },
        { name: 'Português', flag: '🇧🇷' }
      ],
      changeLanguage
    }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useSafeLanguage() {
  try {
    return useContext(LanguageContext)
  } catch (error) {
    console.warn('useLanguage used outside LanguageProvider - using defaults')
    return {
      currentLocale: 'es',
      currentLanguage: { name: 'Español', flag: '🇪🇸' },
      availableLanguages: [
        { name: 'Español', flag: '🇪🇸' },
        { name: 'English', flag: '🇺🇸' }
      ],
      changeLanguage: () => {}
    }
  }
}
