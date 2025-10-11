'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    console.error('Error stack:', error.stack);
    console.error('Component stack:', errorInfo.componentStack);
    
    // Enhanced logging for chunk loading errors
    if (error.message && (error.message.includes('Loading chunk') || error.message.includes('ChunkLoadError'))) {
      console.error('🔍 CHUNK LOAD ERROR DETECTED:');
      console.error('Error message:', error.message);
      console.error('Full stack trace:', error.stack);
      console.error('Component stack trace:', errorInfo.componentStack);
      
      // Clear caches and reload for chunk errors
      console.warn('Chunk load error detected, clearing caches and reloading...');
      
      // Clear caches
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => caches.delete(cacheName));
        });
      }
      
      setTimeout(() => {
        const url = new URL(window.location.href);
        url.searchParams.set('_t', Date.now().toString());
        window.location.href = url.toString();
      }, 1500);
    }
    
    // Enhanced logging for webpack factory errors
    if (error.message && error.message.includes('Cannot read properties of undefined')) {
      console.error('🔍 WEBPACK FACTORY ERROR DETECTED:');
      console.error('Error message:', error.message);
      console.error('Full stack trace:', error.stack);
      console.error('Component stack trace:', errorInfo.componentStack);
      
      // Auto-reload for webpack factory errors
      console.warn('Webpack factory error detected, reloading page in 2 seconds...');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
    
    // Enhanced logging for localeCompare errors
    if (error.message && error.message.includes('localeCompare')) {
      console.error('🔍 LOCALE_COMPARE ERROR DETECTED:');
      console.error('Error message:', error.message);
      console.error('Full stack trace:', error.stack);
      console.error('Component stack trace:', errorInfo.componentStack);
      
      // Try to identify which component caused the error
      const componentMatch = errorInfo.componentStack?.match(/at (\w+)/g);
      if (componentMatch) {
        console.error('Components in stack:', componentMatch);
      }
      
      // Log current URL and timestamp
      console.error('Current URL:', window.location.href);
      console.error('Timestamp:', new Date().toISOString());
      
      // Check localStorage for potential corrupted data
      try {
        const templates = localStorage.getItem('promptTemplates');
        const conversations = localStorage.getItem('conversations');
        console.error('Templates in localStorage:', templates ? JSON.parse(templates).length : 'null');
        console.error('Conversations in localStorage:', conversations ? JSON.parse(conversations).length : 'null');
      } catch (e) {
        console.error('Error reading localStorage:', e);
      }
    }
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full mx-auto p-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                ¡Oops! Algo salió mal
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Ha ocurrido un error inesperado. No te preocupes, puedes intentar solucionarlo.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                    Error Details (Development):
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300 font-mono">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              

              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={this.handleRetry}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Intentar de nuevo
                </button>
                <button
                  onClick={this.handleReload}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Recargar página
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Ir al inicio
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;