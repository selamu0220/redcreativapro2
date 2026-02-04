'use client';

import React, { createContext, useContext, useState } from 'react';

interface SimpleLanguageContextType {
  currentLanguage: string;
  changeLanguage: (lang: string) => void;
  t: (key: string, params?: any) => string;
  isLoading: boolean;
}

const SimpleLanguageContext = createContext<SimpleLanguageContextType | undefined>(undefined);

export function useLanguage(): SimpleLanguageContextType {
  const context = useContext(SimpleLanguageContext);
  
  if (context === undefined) {
    throw new Error('useLanguage debe ser usado dentro de un LanguageProvider');
  }
  
  return context;
}

export function useTranslation(namespace: string = 'common') {
  const { t, currentLanguage, isLoading } = useLanguage();
  
  return {
    t,
    currentLanguage,
    isLoading
  };
}

interface SimpleLanguageProviderProps {
  children: React.ReactNode;
}

export default function SimpleLanguageProvider({ children }: SimpleLanguageProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState('es');
  const [isLoading, setIsLoading] = useState(false);

  const changeLanguage = (lang: string) => {
    setCurrentLanguage(lang);
  };

  const t = (key: string, params?: any) => {
    // Simple fallback - return the key if no translation found
    return key;
  };

  const value: SimpleLanguageContextType = {
    currentLanguage,
    changeLanguage,
    t,
    isLoading
  };

  return (
    <SimpleLanguageContext.Provider value={value}>
      {children}
    </SimpleLanguageContext.Provider>
  );
}
