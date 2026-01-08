'use client';

import React from 'react';

interface TranslationErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface TranslationErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class TranslationErrorBoundary extends React.Component<
  TranslationErrorBoundaryProps,
  TranslationErrorBoundaryState
> {
  constructor(props: TranslationErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): TranslationErrorBoundaryState {
    // Actualizar el estado para mostrar la UI de fallback
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log del error para debugging
    console.error('Translation Error:', error, errorInfo);
    
    // Aquí podrías enviar el error a un servicio de logging
    // como Sentry, LogRocket, etc.
  }

  render() {
    if (this.state.hasError) {
      // UI de fallback personalizada
      return (
        this.props.fallback || (
          <div className="p-4 border border-red-200 rounded-md bg-red-50">
            <h3 className="text-red-800 font-medium">Error de traducción</h3>
            <p className="text-red-600 text-sm mt-1">
              Hubo un problema cargando las traducciones. Por favor, recarga la página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Recargar página
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// Hook para manejar errores de traducción de manera más granular
export function useTranslationFallback(key: string, fallbackText?: string) {
  return React.useCallback((error: Error) => {
    console.warn(`Translation missing for key: ${key}`, error);
    return fallbackText || key;
  }, [key, fallbackText]);
}