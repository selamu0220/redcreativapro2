'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  LanguageCode,
  DEFAULT_LANGUAGE,
  TRANSLATION_NAMESPACES,
  TranslationNamespace
} from './config';
import {
  LanguageContextType,
  LanguageState,
  LanguageAction,
  TranslationData,
  InterpolationParams,
  RecoveryStrategy
} from './types';
import {
  getInitialLanguage,
  saveLanguageToStorage,
  loadTranslations,
  getNestedTranslation,
  interpolateString,
  redetectBrowserLanguage
} from './utils';
import { ErrorRecoveryManager } from './ErrorRecoveryManager';
import { FallbackTranslationSystem } from './FallbackTranslationSystem';

// Estado inicial mejorado
const initialState: LanguageState = {
  currentLanguage: DEFAULT_LANGUAGE,
  translations: {} as Record<TranslationNamespace, TranslationData>,
  isLoading: true,
  error: null,
  isReady: false,
  fallbackMode: false,
  loadingNamespaces: new Set(),
  failedNamespaces: new Set(),
  retryCount: 0,
  lastErrorTimestamp: 0
};

// Reducer mejorado para manejar el estado del idioma
function languageReducer(state: LanguageState, action: LanguageAction): LanguageState {
  switch (action.type) {
    case 'SET_LANGUAGE':
      return {
        ...state,
        currentLanguage: action.payload,
        isLoading: true,
        error: null,
        isReady: false
      };

    case 'SET_TRANSLATIONS':
      const newTranslations = {
        ...state.translations,
        [action.payload.namespace]: action.payload.data
      };
      
      // Remove from loading namespaces
      const newLoadingNamespaces = new Set(state.loadingNamespaces);
      newLoadingNamespaces.delete(action.payload.namespace);
      
      // Check if all namespaces are loaded
      const allLoaded = TRANSLATION_NAMESPACES.every(ns => newTranslations[ns]);
      
      return {
        ...state,
        translations: newTranslations,
        loadingNamespaces: newLoadingNamespaces,
        isLoading: newLoadingNamespaces.size > 0,
        isReady: allLoaded || state.fallbackMode
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        lastErrorTimestamp: action.payload ? Date.now() : state.lastErrorTimestamp
      };

    case 'SET_READY':
      return {
        ...state,
        isReady: action.payload
      };

    case 'SET_FALLBACK_MODE':
      return {
        ...state,
        fallbackMode: action.payload,
        isReady: action.payload // If in fallback mode, consider ready
      };

    case 'ADD_LOADING_NAMESPACE':
      const addLoadingNamespaces = new Set(state.loadingNamespaces);
      addLoadingNamespaces.add(action.payload);
      return {
        ...state,
        loadingNamespaces: addLoadingNamespaces,
        isLoading: true
      };

    case 'REMOVE_LOADING_NAMESPACE':
      const removeLoadingNamespaces = new Set(state.loadingNamespaces);
      removeLoadingNamespaces.delete(action.payload);
      return {
        ...state,
        loadingNamespaces: removeLoadingNamespaces,
        isLoading: removeLoadingNamespaces.size > 0
      };

    case 'ADD_FAILED_NAMESPACE':
      const newFailedNamespaces = new Set(state.failedNamespaces);
      newFailedNamespaces.add(action.payload);
      return {
        ...state,
        failedNamespaces: newFailedNamespaces
      };

    case 'INCREMENT_RETRY_COUNT':
      return {
        ...state,
        retryCount: state.retryCount + 1
      };

    case 'RESET_RETRY_COUNT':
      return {
        ...state,
        retryCount: 0
      };

    case 'SET_LAST_ERROR_TIMESTAMP':
      return {
        ...state,
        lastErrorTimestamp: action.payload
      };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
}

// Crear el contexto
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Props del proveedor
interface LanguageProviderProps {
  children: React.ReactNode;
  initialLanguage?: LanguageCode;
}

// Proveedor del contexto mejorado
export function LanguageProvider({ children, initialLanguage }: LanguageProviderProps) {
  const [state, dispatch] = useReducer(languageReducer, initialState);
  const router = useRouter();
  const errorRecoveryManager = ErrorRecoveryManager.getInstance();
  const fallbackSystem = FallbackTranslationSystem.getInstance();

  // Función mejorada para traducir textos con manejo de errores
  const t = useCallback((
    key: string,
    namespace: TranslationNamespace = 'common',
    params?: InterpolationParams
  ): string => {
    try {
      const namespaceTranslations = state.translations[namespace];

      if (!namespaceTranslations) {
        console.warn(`Namespace '${namespace}' no encontrado, usando fallback`);
        
        // Try to get fallback translation
        const fallbackTranslation = fallbackSystem.getFallbackTranslation(key, namespace, state.currentLanguage);
        if (fallbackTranslation !== key) {
          return fallbackTranslation;
        }
        
        return key;
      }

      const translation = getNestedTranslation(namespaceTranslations, key);

      if (translation === undefined) {
        console.warn(`Traducción no encontrada: ${namespace}.${key}, usando fallback`);
        
        // Try fallback system
        const fallbackTranslation = fallbackSystem.getFallbackTranslation(key, namespace, state.currentLanguage);
        if (fallbackTranslation !== key) {
          return fallbackTranslation;
        }
        
        return key;
      }

      if (typeof translation !== 'string') {
        console.warn(`Traducción no es string: ${namespace}.${key}`);
        return key;
      }

      return interpolateString(translation, params);
    } catch (error) {
      console.error('Error en función de traducción:', error);
      
      // Log error and return key as fallback
      errorRecoveryManager.logError(error as Error, {
        component: 'LanguageProvider',
        action: 'translate',
        language: state.currentLanguage,
        namespace,
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
        timestamp: Date.now()
      });
      
      return key;
    }
  }, [state.translations, state.currentLanguage, fallbackSystem, errorRecoveryManager]);

  // Función mejorada para cargar traducciones con manejo de errores
  const loadTranslationsWithErrorHandling = useCallback(async (
    language: LanguageCode, 
    namespace: TranslationNamespace
  ): Promise<void> => {
    dispatch({ type: 'ADD_LOADING_NAMESPACE', payload: namespace });

    try {
      // Try to load from fallback system first (includes caching and retry logic)
      const data = await fallbackSystem.loadFallbackTranslations(language, namespace, {
        retryCount: 3,
        timeout: 5000,
        fallbackToDefault: true,
        useCache: true
      });

      dispatch({
        type: 'SET_TRANSLATIONS',
        payload: { namespace, data }
      });

      dispatch({ type: 'REMOVE_LOADING_NAMESPACE', payload: namespace });
    } catch (error) {
      console.error(`Error cargando ${namespace} para ${language}:`, error);
      
      // Handle error with recovery manager
      const recoveryStrategy = errorRecoveryManager.handleTranslationError(
        error as Error, 
        namespace, 
        language
      );

      dispatch({ type: 'ADD_FAILED_NAMESPACE', payload: namespace });
      dispatch({ type: 'REMOVE_LOADING_NAMESPACE', payload: namespace });

      // Apply recovery strategy
      await applyRecoveryStrategy(recoveryStrategy, language, namespace);
    }
  }, [fallbackSystem, errorRecoveryManager]);

  // Función para aplicar estrategias de recuperación
  const applyRecoveryStrategy = useCallback(async (
    strategy: RecoveryStrategy,
    language: LanguageCode,
    namespace: TranslationNamespace
  ): Promise<void> => {
    switch (strategy) {
      case RecoveryStrategy.USE_FALLBACK_TRANSLATIONS:
        // Use minimal fallback translations
        const minimalTranslations = fallbackSystem.getMinimalFallbackTranslations(namespace);
        dispatch({
          type: 'SET_TRANSLATIONS',
          payload: { namespace, data: minimalTranslations }
        });
        break;

      case RecoveryStrategy.USE_DEFAULT_LANGUAGE:
        if (language !== DEFAULT_LANGUAGE) {
          try {
            await loadTranslationsWithErrorHandling(DEFAULT_LANGUAGE, namespace);
          } catch (defaultError) {
            // If default language also fails, enable fallback mode
            dispatch({ type: 'SET_FALLBACK_MODE', payload: true });
          }
        }
        break;

      case RecoveryStrategy.ENABLE_FALLBACK_MODE:
        dispatch({ type: 'SET_FALLBACK_MODE', payload: true });
        // Load minimal translations for all namespaces
        TRANSLATION_NAMESPACES.forEach(ns => {
          const minimal = fallbackSystem.getMinimalFallbackTranslations(ns);
          dispatch({
            type: 'SET_TRANSLATIONS',
            payload: { namespace: ns, data: minimal }
          });
        });
        break;

      case RecoveryStrategy.RETRY_WITH_BACKOFF:
        // Implement retry with exponential backoff
        dispatch({ type: 'INCREMENT_RETRY_COUNT' });
        if (state.retryCount < 3) {
          const delay = Math.pow(2, state.retryCount) * 1000;
          setTimeout(() => {
            loadTranslationsWithErrorHandling(language, namespace);
          }, delay);
        } else {
          // Max retries reached, enable fallback mode
          dispatch({ type: 'SET_FALLBACK_MODE', payload: true });
        }
        break;
    }
  }, [fallbackSystem, state.retryCount, loadTranslationsWithErrorHandling]);
  // Función mejorada para cambiar idioma con manejo de errores
  const changeLanguage = useCallback(async (language: LanguageCode) => {
    try {
      console.log(`🔄 Cambiando idioma a: ${language}`);
      dispatch({ type: 'SET_LANGUAGE', payload: language });
      dispatch({ type: 'RESET_RETRY_COUNT' });
      dispatch({ type: 'SET_FALLBACK_MODE', payload: false });

      // Cargar todas las traducciones para el nuevo idioma con manejo de errores
      const translationPromises = TRANSLATION_NAMESPACES.map(namespace => 
        loadTranslationsWithErrorHandling(language, namespace)
      );

      await Promise.allSettled(translationPromises);

      // Guardar en localStorage
      try {
        saveLanguageToStorage(language);
      } catch (storageError) {
        console.warn('Error guardando idioma en localStorage:', storageError);
        // Non-critical error, continue
      }

      // Cambiar URL para reflejar el nuevo idioma usando App Router
      if (typeof window !== 'undefined') {
        try {
          const { removeLanguageFromPath } = await import('./routing');
          const currentPath = removeLanguageFromPath(window.location.pathname);
          const newPath = `/${language}${currentPath === '/' ? '' : currentPath}${window.location.search}`;

          // Only push if the path actually changes
          if (window.location.pathname !== newPath) {
            router.push(newPath);
          }
        } catch (routingError) {
          console.error('Error actualizando URL:', routingError);
          errorRecoveryManager.logError(routingError as Error, {
            component: 'LanguageProvider',
            action: 'changeLanguage',
            language,
            url: window.location.href,
            userAgent: window.navigator.userAgent,
            timestamp: Date.now()
          });
        }
      }

      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_READY', payload: true });
      
      console.log(`✅ Idioma cambiado exitosamente a: ${language}`);
    } catch (error) {
      console.error('❌ Error cambiando idioma:', error);
      
      const recoveryStrategy = errorRecoveryManager.handleContextInitializationError(error as Error);
      await applyRecoveryStrategy(recoveryStrategy, language, 'common');
      
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Error desconocido cambiando idioma'
      });
    }
  }, [router, loadTranslationsWithErrorHandling, errorRecoveryManager, applyRecoveryStrategy]);

  // Inicializar idioma al montar el componente con manejo de errores mejorado
  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        console.log('🌐 Inicializando sistema de idiomas con manejo de errores...');

        // Use initialLanguage from App Router params if provided, otherwise detect from URL/browser
        let detectedLanguage = initialLanguage;

        if (!detectedLanguage) {
          console.log('📍 Idiomas del navegador:', navigator.languages);
          console.log('🗣️ Idioma principal del navegador:', navigator.language);

          if (typeof window !== 'undefined') {
            try {
              const { getCurrentLanguageFromURL } = await import('./routing');
              const urlLanguage = getCurrentLanguageFromURL();

              if (urlLanguage) {
                console.log('🔗 Idioma detectado desde URL:', urlLanguage);
                detectedLanguage = urlLanguage;
              } else {
                // Si no hay idioma en URL, usar detección tradicional
                detectedLanguage = getInitialLanguage();
                console.log('✅ Idioma inicial detectado:', detectedLanguage);
              }
            } catch (routingError) {
              console.warn('Error detectando idioma desde URL, usando detección por defecto:', routingError);
              detectedLanguage = getInitialLanguage();
            }
          } else {
            detectedLanguage = DEFAULT_LANGUAGE;
          }
        } else {
          console.log('🎯 Usando idioma desde App Router params:', detectedLanguage);
        }

        // Set the language without changing URL (App Router handles this)
        dispatch({ type: 'SET_LANGUAGE', payload: detectedLanguage });
        dispatch({ type: 'RESET_RETRY_COUNT' });

        // Cargar traducciones con manejo de errores mejorado
        const translationPromises = TRANSLATION_NAMESPACES.map(namespace => 
          loadTranslationsWithErrorHandling(detectedLanguage, namespace)
        );

        const results = await Promise.allSettled(translationPromises);
        
        // Check if any translations failed to load
        const failedCount = results.filter(result => result.status === 'rejected').length;
        
        if (failedCount > 0) {
          console.warn(`⚠️ ${failedCount} namespaces fallaron al cargar, habilitando modo fallback`);
          dispatch({ type: 'SET_FALLBACK_MODE', payload: true });
        }

        // Guardar en localStorage
        try {
          saveLanguageToStorage(detectedLanguage);
        } catch (storageError) {
          console.warn('Error guardando idioma en localStorage:', storageError);
          // Non-critical error, continue
        }

        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({ type: 'SET_READY', payload: true });
        
        console.log('✅ Sistema de idiomas inicializado correctamente');
      } catch (error) {
        console.error('❌ Error crítico inicializando idioma:', error);
        
        // Handle critical initialization error
        const recoveryStrategy = errorRecoveryManager.handleContextInitializationError(error as Error);
        
        // Apply emergency fallback
        dispatch({ type: 'SET_FALLBACK_MODE', payload: true });
        dispatch({ type: 'SET_LANGUAGE', payload: DEFAULT_LANGUAGE });
        
        // Load minimal translations for all namespaces
        TRANSLATION_NAMESPACES.forEach(namespace => {
          const minimal = fallbackSystem.getMinimalFallbackTranslations(namespace);
          dispatch({
            type: 'SET_TRANSLATIONS',
            payload: { namespace, data: minimal }
          });
        });
        
        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({ type: 'SET_READY', payload: true });
        dispatch({
          type: 'SET_ERROR',
          payload: 'Error inicializando sistema de idiomas - usando modo fallback'
        });
        
        console.log('🚨 Sistema inicializado en modo fallback debido a errores críticos');
      }
    };

    initializeLanguage();
  }, [initialLanguage, loadTranslationsWithErrorHandling, errorRecoveryManager, fallbackSystem]);

  // Detectar cambios de idioma del navegador (VPN, cambio de ubicación) - DESACTIVADO TEMPORALMENTE PARA EVITAR BUCLES
  /*
  useEffect(() => {
    const checkLanguageChange = () => {
      console.log('🔍 Verificando cambios de idioma...');
      // ... (code omitted for brevity)
    };

    // Verificar cambios cada 30 segundos
    const interval = setInterval(checkLanguageChange, 30000);

    // También verificar cuando la ventana recupera el foco
    const handleFocus = () => {
      console.log('👁️ Ventana recuperó el foco, verificando idioma...');
      setTimeout(checkLanguageChange, 1000); // Pequeño delay para asegurar que el navegador se actualice
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [changeLanguage, state.currentLanguage]);
  */

  const contextValue: LanguageContextType = {
    currentLanguage: state.currentLanguage,
    translations: state.translations,
    isLoading: state.isLoading,
    error: state.error,
    changeLanguage,
    t,
    isReady: state.isReady,
    fallbackMode: state.fallbackMode
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook mejorado para usar el contexto de idioma
export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);

  if (context === undefined) {
    // Enhanced error message with recovery suggestions
    const error = new Error(
      'useLanguage debe ser usado dentro de un LanguageProvider. ' +
      'Asegúrate de que el componente esté envuelto en <LanguageProvider>.'
    );
    
    // Log error for debugging
    console.error('❌ Error de contexto de idioma:', error.message);
    
    // In development, provide more helpful error information
    if (process.env.NODE_ENV === 'development') {
      console.error('🔧 Sugerencias de solución:');
      console.error('1. Verifica que <LanguageProvider> esté en el componente padre');
      console.error('2. Asegúrate de que no estés usando useLanguage en un componente servidor');
      console.error('3. Verifica que el componente tenga la directiva "use client" si es necesario');
    }
    
    throw error;
  }

  return context;
}

// Hook específico mejorado para traducciones
export function useTranslation(namespace: TranslationNamespace = 'common') {
  const { t, currentLanguage, isLoading, isReady, fallbackMode, error } = useLanguage();

  const translate = useCallback((key: string, params?: InterpolationParams) => {
    try {
      return t(key, namespace, params);
    } catch (translationError) {
      console.error(`Error en traducción para ${namespace}.${key}:`, translationError);
      return key; // Return key as fallback
    }
  }, [t, namespace]);

  return {
    t: translate,
    currentLanguage,
    isLoading,
    isReady,
    fallbackMode,
    error
  };
}