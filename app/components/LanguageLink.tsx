'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { LanguageCode } from '@/app/lib/language/config';
import { getCurrentLanguageFromURL, addLanguageToPath, removeLanguageFromPath } from '@/app/lib/language/routing';

interface LanguageLinkProps {
  href: string;
  children: ReactNode;
  language?: LanguageCode;
  className?: string;
  [key: string]: any;
}

/**
 * Language-aware Link component that automatically adds language prefix to URLs
 */
export function LanguageLink({ href, children, language, ...props }: LanguageLinkProps) {
  const pathname = usePathname();
  
  // Get current language from URL or use provided language
  const currentLanguage = language || getCurrentLanguageFromURL();
  
  // Create language-prefixed URL
  const localizedHref = addLanguageToPath(href, currentLanguage);
  
  return (
    <Link href={localizedHref} {...props}>
      {children}
    </Link>
  );
}

/**
 * Hook to get language-aware navigation functions
 */
export function useLanguageNavigation() {
  const pathname = usePathname();
  const currentLanguage = getCurrentLanguageFromURL();
  
  const navigate = (href: string, language?: LanguageCode) => {
    const targetLanguage = language || currentLanguage;
    return addLanguageToPath(href, targetLanguage);
  };
  
  const getCurrentPath = () => {
    return removeLanguageFromPath(pathname);
  };
  
  const getLanguageAlternatives = () => {
    const cleanPath = removeLanguageFromPath(pathname);
    const baseURL = typeof window !== 'undefined' ? window.location.origin : '';
    
    return Object.keys(require('@/app/lib/language/config').SUPPORTED_LANGUAGES).map(lang => ({
      language: lang as LanguageCode,
      url: `${baseURL}${addLanguageToPath(cleanPath, lang as LanguageCode)}`
    }));
  };
  
  return {
    navigate,
    getCurrentPath,
    getLanguageAlternatives,
    currentLanguage
  };
}