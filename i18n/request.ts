import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

// Idiomas soportados
export const locales = ['es', 'en', 'fr', 'de', 'zh', 'pt'] as const;
export type Locale = typeof locales[number];

// Idioma por defecto
export const defaultLocale: Locale = 'es';

// Función para detectar idioma del navegador
function detectBrowserLanguage(acceptLanguage: string): Locale {
  // Parsear el header Accept-Language
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [code, q = '1'] = lang.trim().split(';q=');
      return { code: code.split('-')[0], quality: parseFloat(q) };
    })
    .sort((a, b) => b.quality - a.quality);

  // Buscar el primer idioma soportado
  for (const { code } of languages) {
    if (locales.includes(code as Locale)) {
      return code as Locale;
    }
  }

  return defaultLocale;
}

// Función para cargar mensajes con fallback
async function loadMessages(locale: Locale) {
  try {
    // Intentar cargar los archivos de traducción
    const [commonMessages, sliderMessages] = await Promise.allSettled([
      import(`../public/locales/${locale}/common.json`),
      import(`../public/locales/${locale}/slider.json`)
    ]);

    const messages: Record<string, any> = {};

    // Cargar common.json
    if (commonMessages.status === 'fulfilled') {
      Object.assign(messages, commonMessages.value.default);
    } else {
      console.warn(`Failed to load common.json for locale ${locale}:`, commonMessages.reason);
      // Fallback al idioma por defecto si no es el mismo
      if (locale !== defaultLocale) {
        try {
          const fallbackCommon = await import(`../public/locales/${defaultLocale}/common.json`);
          Object.assign(messages, fallbackCommon.default);
        } catch (error) {
          console.error(`Failed to load fallback common.json:`, error);
        }
      }
    }

    // Cargar slider.json
    if (sliderMessages.status === 'fulfilled') {
      messages.slider = sliderMessages.value.default;
    } else {
      console.warn(`Failed to load slider.json for locale ${locale}:`, sliderMessages.reason);
      // Fallback al idioma por defecto
      if (locale !== defaultLocale) {
        try {
          const fallbackSlider = await import(`../public/locales/${defaultLocale}/slider.json`);
          messages.slider = fallbackSlider.default;
        } catch (error) {
          console.error(`Failed to load fallback slider.json:`, error);
          // Fallback mínimo para el slider
          messages.slider = {
            languages: {
              es: 'Español',
              en: 'English',
              fr: 'Français',
              de: 'Deutsch',
              zh: '中文',
              pt: 'Português'
            },
            selectLanguage: 'Select language',
            currentLanguage: 'Current language',
            switchTo: 'Switch to {{language}}'
          };
        }
      }
    }

    return messages;
  } catch (error) {
    console.error(`Error loading messages for locale ${locale}:`, error);
    
    // Fallback completo al idioma por defecto
    if (locale !== defaultLocale) {
      return loadMessages(defaultLocale);
    }
    
    // Si incluso el fallback falla, retornar mensajes mínimos
    return {
      navigation: {
        home: 'Home',
        dashboard: 'Dashboard',
        blog: 'Blog',
        plans: 'Plans',
        login: 'Login',
        signup: 'Sign Up',
        menu: 'Menu'
      },
      slider: {
        languages: {
          es: 'Español',
          en: 'English',
          fr: 'Français',
          de: 'Deutsch',
          zh: '中文',
          pt: 'Português'
        },
        selectLanguage: 'Select language'
      }
    };
  }
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headersList = await headers();
  
  // 1. Intentar obtener idioma de cookie (preferencia guardada)
  let locale = cookieStore.get('locale')?.value as Locale;
  
  // 2. Si no hay cookie, detectar del navegador
  if (!locale) {
    const acceptLanguage = headersList.get('accept-language') || '';
    locale = detectBrowserLanguage(acceptLanguage);
  }

  // 3. Validar que el idioma sea soportado, sino usar por defecto
  const validLocale = locales.includes(locale) ? locale : defaultLocale;

  // 4. Cargar mensajes con manejo de errores
  const messages = await loadMessages(validLocale);

  return {
    locale: validLocale,
    messages
  };
});