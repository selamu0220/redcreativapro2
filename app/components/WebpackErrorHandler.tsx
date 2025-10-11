'use client';

import { useEffect, useState } from 'react';

export function WebpackErrorHandler() {
  const [errorDetected, setErrorDetected] = useState(false);

  useEffect(() => {
    let errorCount = 0;
    const maxRetries = 3;

    // More aggressive error detection
    const handleWebpackError = (error: any, source?: string) => {
      const errorMessage = error?.message || error?.toString() || '';
      const errorStack = error?.stack || '';
      
      const isWebpackError = 
        errorMessage.includes('Cannot read properties of undefined') ||
        errorStack.includes('webpack.js') ||
        errorStack.includes('react-server-dom-webpack') ||
        source?.includes('webpack') ||
        source?.includes('react-server-dom');

      if (isWebpackError) {
        errorCount++;
        console.warn(`🔧 Webpack error detected (${errorCount}/${maxRetries}):`, error);
        
        if (errorCount <= maxRetries) {
          setErrorDetected(true);
          
          // Clear all possible caches
          try {
            // Clear webpack cache
            if ((window as any).__webpack_require__?.cache) {
              Object.keys((window as any).__webpack_require__.cache).forEach(key => {
                delete (window as any).__webpack_require__.cache[key];
              });
            }
            
            // Clear module cache
            if ((window as any).__webpack_module_cache__) {
              (window as any).__webpack_module_cache__ = {};
            }
            
            // Clear any React cache
            if ((window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
              (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot = null;
            }
          } catch (e) {
            console.warn('Cache clearing failed:', e);
          }
          
          // Force reload with cache busting
          setTimeout(() => {
            const url = new URL(window.location.href);
            url.searchParams.set('_t', Date.now().toString());
            window.location.href = url.toString();
          }, 500);
          
          return true;
        }
      }
      return false;
    };

    // Override error handlers
    const originalError = window.onerror;
    const originalUnhandledRejection = window.onunhandledrejection;
    const originalConsoleError = console.error;

    window.onerror = (message, source, lineno, colno, error) => {
      if (handleWebpackError(error || message, source)) {
        return true;
      }
      return originalError ? originalError(message, source, lineno, colno, error) : false;
    };

    window.onunhandledrejection = (event) => {
      if (handleWebpackError(event.reason)) {
        event.preventDefault();
        return;
      }
      return originalUnhandledRejection ? originalUnhandledRejection(event) : undefined;
    };

    // Also catch console errors
    console.error = (...args) => {
      const errorArg = args.find(arg => 
        typeof arg === 'object' && 
        (arg?.message?.includes('Cannot read properties of undefined') || 
         arg?.stack?.includes('webpack'))
      );
      
      if (errorArg && handleWebpackError(errorArg)) {
        return;
      }
      
      return originalConsoleError.apply(console, args);
    };

    // Cleanup
    return () => {
      window.onerror = originalError;
      window.onunhandledrejection = originalUnhandledRejection;
      console.error = originalConsoleError;
    };
  }, []);

  if (errorDetected) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
          <h3 className="text-lg font-semibold mb-2">Recuperando aplicación...</h3>
          <p className="text-gray-600 mb-4">
            Se detectó un error de webpack. Recargando la página para solucionarlo.
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return null;
}