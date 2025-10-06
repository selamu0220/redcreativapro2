import { LocaleCode, TranslationNamespace } from './config';

// Tipos para el contexto de i18n
export interface I18nContextType {
  locale: LocaleCode;
  setLocale: (locale: LocaleCode) => void;
  t: TranslationFunction;
  isLoading: boolean;
}

// Tipo para la función de traducción
export type TranslationFunction = (
  key: string,
  namespace?: TranslationNamespace,
  params?: Record<string, string | number>
) => string;

// Tipo para las traducciones cargadas
export interface LoadedTranslations {
  [locale: string]: {
    [namespace: string]: {
      [key: string]: string;
    };
  };
}

// Tipo para el estado del contexto
export interface I18nState {
  locale: LocaleCode;
  translations: LoadedTranslations;
  isLoading: boolean;
}

// Acciones para el reducer
export type I18nAction =
  | { type: 'SET_LOCALE'; payload: LocaleCode }
  | { type: 'SET_TRANSLATIONS'; payload: { locale: LocaleCode; namespace: string; translations: Record<string, string> } }
  | { type: 'SET_LOADING'; payload: boolean };

// Tipo para los parámetros de interpolación
export interface InterpolationParams {
  [key: string]: string | number;
}

// Tipo para las opciones de la función de traducción
export interface TranslationOptions {
  namespace?: TranslationNamespace;
  params?: InterpolationParams;
  fallback?: string;
}

// Tipo para la respuesta de la API de traducciones
export interface TranslationApiResponse {
  locale: LocaleCode;
  translations: Record<string, Record<string, string>>;
}

// Tipo para la solicitud de traducción dinámica
export interface TranslateRequest {
  text: string;
  targetLang: LocaleCode;
  sourceLang?: LocaleCode;
}

// Tipo para la respuesta de traducción dinámica
export interface TranslateResponse {
  originalText: string;
  translatedText: string;
  sourceLang: LocaleCode;
  targetLang: LocaleCode;
}