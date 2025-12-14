// Language types
export const SUPPORTED_LANGUAGES = ['es', 'en', 'fr', 'de', 'zh', 'pt'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];