import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
export const locales = ['es', 'en', 'fr', 'de', 'zh', 'pt'] as const;

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: {
      ...(await import(`../public/locales/${locale}/common.json`)).default,
      homepage: (await import(`../public/locales/${locale}/homepage.json`)).default
    }
  };
});