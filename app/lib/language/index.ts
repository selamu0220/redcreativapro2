// Exportaciones principales del sistema de idiomas
export { LanguageProvider, useLanguage, useTranslation } from './context';
export { 
  SUPPORTED_LANGUAGES, 
  DEFAULT_LANGUAGE, 
  LANGUAGE_STORAGE_KEY,
  TRANSLATION_NAMESPACES 
} from './config';
export type { 
  LanguageCode, 
  LanguageInfo, 
  TranslationNamespace
} from './config';
export type {
  LanguageContextType,
  TranslationData,
  InterpolationParams 
} from './types';
export { 
  detectBrowserLanguage, 
  getLanguageInfo, 
  isValidLanguage,
  generateLanguageMetaTags 
} from './utils';