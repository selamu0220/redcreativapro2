'use client';

/**
 * Error Boundary for GEO Optimization Components
 * 
 * Provides comprehensive error handling and fallback UI for GEO components
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class GEOErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to console and external service
    console.error('GEO Error Boundary caught an error:', error, errorInfo);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to structured logging system
    this.logError(error, errorInfo);
  }

  private logError(error: Error, errorInfo: ErrorInfo) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      level: 'error',
      component: 'GEOErrorBoundary',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      },
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown'
    };

    // In production, send to logging service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to logging service
      // logToService(errorLog);
    }

    // Store in localStorage for debugging
    try {
      const existingLogs = JSON.parse(localStorage.getItem('geo-error-logs') || '[]');
      existingLogs.push(errorLog);
      // Keep only last 10 errors
      const recentLogs = existingLogs.slice(-10);
      localStorage.setItem('geo-error-logs', JSON.stringify(recentLogs));
    } catch (storageError) {
      console.warn('Failed to store error log:', storageError);
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="geo-error-boundary bg-red-50 border border-red-200 rounded-lg p-6 m-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">
                GEO Component Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Something went wrong with the GEO optimization component.</p>
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-2">
                    <summary className="cursor-pointer font-medium">Error Details</summary>
                    <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                      {this.state.error.message}
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={this.handleRetry}
                  className="bg-red-100 text-red-800 px-3 py-2 text-sm font-medium rounded hover:bg-red-200"
                >
                  Try Again
                </button>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="bg-white text-red-800 px-3 py-2 text-sm font-medium border border-red-300 rounded hover:bg-red-50"
                >
                  Reload Page
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

/**
 * Higher-order component to wrap components with error boundary
 */
export function withGEOErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <GEOErrorBoundary fallback={fallback}>
      <Component {...props} />
    </GEOErrorBoundary>
  );

  WrappedComponent.displayName = `withGEOErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Hook for error reporting within components
 */
export function useGEOErrorReporting() {
  const reportError = React.useCallback((error: Error, context?: string) => {
    const errorLog = {
      timestamp: new Date().toISOString(),
      level: 'error',
      component: context || 'Unknown',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown'
    };

    console.error('GEO Error reported:', errorLog);

    // Store in localStorage for debugging
    try {
      const existingLogs = JSON.parse(localStorage.getItem('geo-error-logs') || '[]');
      existingLogs.push(errorLog);
      const recentLogs = existingLogs.slice(-10);
      localStorage.setItem('geo-error-logs', JSON.stringify(recentLogs));
    } catch (storageError) {
      console.warn('Failed to store error log:', storageError);
    }
  }, []);

  return { reportError };
}
