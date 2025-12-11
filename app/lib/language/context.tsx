'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
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
  InterpolationParams 
} from './types';
import { 
  getInitialLanguage, 
  saveLanguageToStorage, 
  loadTranslations, 
  getNestedTranslation, 
  interpolateString,
  redetectBrowserLanguage 
} from './utils';

// Estado inicial
const initialState: LanguageState = {
  currentLanguage: DEFAULT_LANGUAGE,
  translations: {} as Record<TranslationNamespace, TranslationData>,
  isLoading: true,
  error: null
};

// Reducer para manejar el estado del idioma
function languageReducer(state: LanguageState, action: LanguageAction): LanguageState {
  switch (action.type) {
    case 'SET_LANGUAGE':
      return {
        ...state,
        currentLanguage: action.payload,
        isLoading: true,
        error: null
      };
    
    case 'SET_TRANSLATIONS':
      return {
        ...state,
        translations: {
          ...state.translations,
          [action.payload.namespace]: action.payload.data
        }
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
        isLoading: false
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

// Proveedor del contexto
export function LanguageProvider({ children, initialLanguage }: LanguageProviderProps) {
  const [state, dispatch] = useReducer(languageReducer, initialState);

  // Función para traducir textos
  const t = useCallback((
    key: string, 
    namespace: TranslationNamespace = 'common', 
    params?: InterpolationParams
  ): string => {
    const namespaceTranslations = state.translations[namespace];
    
    if (!namespaceTranslations) {
      console.warn(`Namespace '${namespace}' no encontrado`);
      return key;
    }

    const translation = getNestedTranslation(namespaceTranslations, key);
    
    if (translation === undefined) {
      console.warn(`Traducción no encontrada: ${namespace}.${key}`);
      return key;
    }

    if (typeof translation !== 'string') {
      console.warn(`Traducción no es string: ${namespace}.${key}`);
      return key;
    }

    return interpolateString(translation, params);
  }, [state.translations]);

  // Función para cambiar idioma
  const changeLanguage = useCallback(async (language: LanguageCode) => {
    try {
      dispatch({ type: 'SET_LANGUAGE', payload: language });
      
      // Cargar todas las traducciones para el nuevo idioma
      const translationPromises = TRANSLATION_NAMESPACES.map(async (namespace) => {
        try {
          const data = await loadTranslations(language, namespace);
          dispatch({ 
            type: 'SET_TRANSLATIONS', 
            payload: { namespace, data } 
          });
        } catch (error) {
          console.error(`Error cargando ${namespace} para ${language}:`, error);
        }
      });

      await Promise.all(translationPromises);
      
      // Guardar en localStorage
      saveLanguageToStorage(language);
      
      // Cambiar URL para reflejar el nuevo idioma usando App Router
      if (typeof window !== 'undefined') {
        const { useRouter } = await import('next/navigation');
        const { removeLanguageFromPath } = await import('./routing');
        
        // Get current path without language prefix
        const currentPath = removeLanguageFromPath(window.location.pathname);
        const newPath = `/${language}${currentPath === '/' ? '' : currentPath}`;
        
        // Use Next.js router for navigation to maintain App Router compatibility
        window.location.href = newPath;
      }
      
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      console.error('Error cambiando idioma:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Error desconocido' 
      });
    }
  }, []);

  // Inicializar idioma al montar el componente
  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        console.log('🌐 Inicializando sistema de idiomas...');
        
        // Use initialLanguage from App Router params if provided, otherwise detect from URL/browser
        let detectedLanguage = initialLanguage;
        
        if (!detectedLanguage) {
          console.log('📍 Idiomas del navegador:', navigator.languages);
          console.log('🗣️ Idioma principal del navegador:', navigator.language);
          
          if (typeof window !== 'undefined') {
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
          } else {
            detectedLanguage = DEFAULT_LANGUAGE;
          }
        } else {
          console.log('🎯 Usando idioma desde App Router params:', detectedLanguage);
        }
        
        // Set the language without changing URL (App Router handles this)
        dispatch({ type: 'SET_LANGUAGE', payload: detectedLanguage });
        
        const translationPromises = TRANSLATION_NAMESPACES.map(async (namespace) => {
          try {
            const data = await loadTranslations(detectedLanguage, namespace);
            dispatch({ 
              type: 'SET_TRANSLATIONS', 
              payload: { namespace, data } 
            });
          } catch (error) {
            console.error(`Error cargando ${namespace} para ${detectedLanguage}:`, error);
          }
        });

        await Promise.all(translationPromises);
        
        // Guardar en localStorage
        saveLanguageToStorage(detectedLanguage);
        
        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error) {
        console.error('❌ Error inicializando idioma:', error);
        dispatch({ 
          type: 'SET_ERROR', 
          payload: 'Error inicializando sistema de idiomas' 
        });
      }
    };

    initializeLanguage();
  }, [initialLanguage]);

  // Detectar cambios de idioma del navegador (VPN, cambio de ubicación)
  useEffect(() => {
    const checkLanguageChange = () => {
      console.log('🔍 Verificando cambios de idioma...');
      console.log('📍 Idiomas actuales del navegador:', navigator.languages);
      console.log('🗣️ Idioma principal actual:', navigator.language);
      console.log('🏷️ Idioma actual de la app:', state.currentLanguage);
      
      const newLanguage = redetectBrowserLanguage();
      console.log('🔄 Idioma re-detectado:', newLanguage);
      
      if (newLanguage && newLanguage !== state.currentLanguage) {
        console.log('🚀 Cambio de idioma detectado, actualizando automáticamente de', state.currentLanguage, 'a', newLanguage);
        changeLanguage(newLanguage);
      } else {
        console.log('⏸️ No hay cambios de idioma detectados');
      }
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

  const contextValue: LanguageContextType = {
    currentLanguage: state.currentLanguage,
    translations: state.translations,
    isLoading: state.isLoading,
    error: state.error,
    changeLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook para usar el contexto de idioma
export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    throw new Error('useLanguage debe ser usado dentro de un LanguageProvider');
  }
  
  return context;
}

// Hook específico para traducciones
export function useTranslation(namespace: TranslationNamespace = 'common') {
  const { t, currentLanguage, isLoading } = useLanguage();
  
  const translate = useCallback((key: string, params?: InterpolationParams) => {
    return t(key, namespace, params);
  }, [t, namespace]);

  return {
    t: translate,
    currentLanguage,
    isLoading
  };
}