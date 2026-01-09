'use client';

import { useLanguage } from '../lib/language/context';
import { usePathname } from 'next/navigation';
import LocalizedMetadata from './LocalizedMetadata';

/**
 * Wrapper component that provides current language and pathname to LocalizedMetadata
 * This component handles the integration with Next.js routing and language context for meta tags
 */
export default function LocalizedMetadataWrapper() {
  const { currentLanguage } = useLanguage();
  const pathname = usePathname();

  // Determine page key from pathname for SEO translations
  const getPageKey = (path: string): string => {
    // Remove language prefix and get clean path
    const cleanPath = path.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/';

    const pathMap: Record<string, string> = {
      '/': 'home',
      '/dashboard': 'dashboard',
      '/writer': 'writer',
      '/plantillas': 'templates',
      '/planes': 'plans',
      '/blog': 'blog',
      '/contacto': 'contact',
      '/centro-ayuda': 'help',
      '/auth': 'auth.login',
      '/auth/signup': 'auth.signup',
    };

    return pathMap[cleanPath] || 'home';
  };

  const pageKey = getPageKey(pathname);

  return (
    <LocalizedMetadata pageKey={pageKey} />
  );
}