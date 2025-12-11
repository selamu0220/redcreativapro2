// Language types
export const SUPPORTED_LANGUAGES = ['es', 'en', 'fr', 'de', 'zh'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];