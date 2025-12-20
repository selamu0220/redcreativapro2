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
  isReady: boolean; // New: indicates if context is fully initialized
  fallbackMode: boolean; // New: indicates if running in fallback mode
}

// Tipo para el estado del reducer
export interface LanguageState {
  currentLanguage: LanguageCode;
  translations: Record<TranslationNamespace, TranslationData>;
  isLoading: boolean;
  error: string | null;
  isReady: boolean;
  fallbackMode: boolean;
  loadingNamespaces: Set<TranslationNamespace>;
  failedNamespaces: Set<TranslationNamespace>;
  retryCount: number;
  lastErrorTimestamp: number;
}

// Acciones del reducer
export type LanguageAction =
  | { type: 'SET_LANGUAGE'; payload: LanguageCode }
  | { type: 'SET_TRANSLATIONS'; payload: { namespace: TranslationNamespace; data: TranslationData } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_READY'; payload: boolean }
  | { type: 'SET_FALLBACK_MODE'; payload: boolean }
  | { type: 'ADD_LOADING_NAMESPACE'; payload: TranslationNamespace }
  | { type: 'REMOVE_LOADING_NAMESPACE'; payload: TranslationNamespace }
  | { type: 'ADD_FAILED_NAMESPACE'; payload: TranslationNamespace }
  | { type: 'INCREMENT_RETRY_COUNT' }
  | { type: 'RESET_RETRY_COUNT' }
  | { type: 'SET_LAST_ERROR_TIMESTAMP'; payload: number }
  | { type: 'RESET_STATE' };

// Tipo para parámetros de interpolación
export type InterpolationParams = Record<string, string | number>;

// Tipo para opciones de carga de traducciones
export interface TranslationLoadingOptions {
  retryCount?: number;
  timeout?: number;
  fallbackToDefault?: boolean;
  useCache?: boolean;
}

// Tipo para contexto de error
export interface ErrorContext {
  component: string;
  action: string;
  language: string;
  namespace?: string;
  url: string;
  userAgent: string;
  timestamp: number;
  stackTrace?: string;
}

// Tipo para estrategias de recuperación de errores
export enum ErrorType {
  TRANSLATION_LOADING_FAILED = 'translation_loading_failed',
  CONTEXT_INITIALIZATION_FAILED = 'context_initialization_failed',
  SSR_HYDRATION_MISMATCH = 'ssr_hydration_mismatch',
  ROUTING_ERROR = 'routing_error'
}

export enum RecoveryStrategy {
  USE_FALLBACK_TRANSLATIONS = 'use_fallback_translations',
  RETRY_WITH_BACKOFF = 'retry_with_backoff',
  USE_DEFAULT_LANGUAGE = 'use_default_language',
  ENABLE_FALLBACK_MODE = 'enable_fallback_mode'
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