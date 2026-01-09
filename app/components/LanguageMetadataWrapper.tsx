'use client';

import { useLanguage } from '../lib/language/context';
import { usePathname } from 'next/navigation';
import LanguageMetadata from './LanguageMetadata';

/**
 * Wrapper component that provides current language and pathname to LanguageMetadata
 * This component handles the integration with Next.js routing and language context
 */
export default function LanguageMetadataWrapper() {
  const { currentLanguage } = useLanguage();
  const pathname = usePathname();

  return (
    <LanguageMetadata
      currentLanguage={currentLanguage as any}
      pathname={pathname}
    />
  );
}