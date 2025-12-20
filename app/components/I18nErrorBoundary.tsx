'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorRecoveryManager } from '../lib/language/ErrorRecoveryManager';
import { ErrorContext } from '../lib/language/types';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

export class I18nErrorBoundary extends Component<Props, State> {
  private errorRecoveryManager: ErrorRecoveryManager;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
    this.errorRecoveryManager = ErrorRecoveryManager.getInstance();
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error with context
    const context: ErrorContext = {
      component: 'I18nErrorBoundary',
      action: 'componentDidCatch',
      language: 'unknown', // Will be filled by error recovery manager
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
      timestamp: Date.now(),
      stackTrace: error.stack
    };

    this.errorRecoveryManager.logError(error, context);

    // Update state with error info
    this.setState({
      errorInfo,
      error
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    console.error('🚨 I18n Error Boundary caught an error:', error);
    console.error('Error Info:', errorInfo);
  }

  handleRetry = () => {
    if (this.state.retryCount < 3) {
      console.log(`🔄 Intentando recuperación (intento ${this.state.retryCount + 1}/3)`);
      
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));
    } else {
      console.log('❌ Máximo número de reintentos alcanzado');
    }
  };

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-red-500">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Error de Internacionalización
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Ha ocurrido un error en el sistema de idiomas. Estamos trabajando para solucionarlo.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-left">
                  <h3 className="text-sm font-medium text-red-800 mb-2">
                    Información de Error (Solo en Desarrollo):
                  </h3>
                  <p className="text-xs text-red-700 font-mono break-all">
                    {this.state.error.message}
                  </p>
                  {this.state.errorInfo?.componentStack && (
                    <details className="mt-2">
                      <summary className="text-xs text-red-700 cursor-pointer">
                        Component Stack
                      </summary>
                      <pre className="text-xs text-red-600 mt-1 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex flex-col space-y-3">
              {this.state.retryCount < 3 && (
                <button
                  onClick={this.handleRetry}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  🔄 Reintentar ({3 - this.state.retryCount} intentos restantes)
                </button>
              )}
              
              <button
                onClick={this.handleReload}
                className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                🔄 Recargar Página
              </button>
              
              <button
                onClick={() => {
                  // Try to navigate to home page
                  if (typeof window !== 'undefined') {
                    window.location.href = '/';
                  }
                }}
                className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                🏠 Ir al Inicio
              </button>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Error ID: {Date.now().toString(36)}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}