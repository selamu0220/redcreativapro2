import { LanguageCode, TranslationNamespace } from './config';

// Tipo para las traducciones cargadas
export type TranslationData = Record<string, any>;

// Tipo para el contexto de idioma
export interface LanguageContextType {
  currentLanguage: LanguageCode;
  translations: Record<TranslationNamespace, TranslationData>;
  isLoading: boolean;
  error: string | null;
  changeLanguage: (language: LanguageCode) => Promise<void>;
  t: (key: string, namespace?: TranslationNamespace, params?: Record<string, string | number>) => string;
}

// Tipo para el estado del reducer
export interface LanguageState {
  currentLanguage: LanguageCode;
  translations: Record<TranslationNamespace, TranslationData>;
  isLoading: boolean;
  error: string | null;
}

// Acciones del reducer
export type LanguageAction =
  | { type: 'SET_LANGUAGE'; payload: LanguageCode }
  | { type: 'SET_TRANSLATIONS'; payload: { namespace: TranslationNamespace; data: TranslationData } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_STATE' };

// Tipo para parámetros de interpolación
export type InterpolationParams = Record<string, string | number>;

// Tipo para opciones de traducción
export interface TranslationOptions {
  namespace?: TranslationNamespace;
  params?: InterpolationParams;
  fallback?: string;
}

// Tipo para respuesta de API de traducciones
export interface TranslationApiResponse {
  success: boolean;
  data?: TranslationData;
  error?: string;
  language?: string;
  namespace?: string;
  fallback?: boolean;
}