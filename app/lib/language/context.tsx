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
  interpolateString 
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
}

// Proveedor del contexto
export function LanguageProvider({ children }: LanguageProviderProps) {
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
        const initialLanguage = getInitialLanguage();
        await changeLanguage(initialLanguage);
      } catch (error) {
        console.error('Error inicializando idioma:', error);
        dispatch({ 
          type: 'SET_ERROR', 
          payload: 'Error inicializando sistema de idiomas' 
        });
      }
    };

    initializeLanguage();
  }, [changeLanguage]);

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