'use client';

import { useEffect } from 'react';
// import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            ¡Oops! Algo salió mal
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Ha ocurrido un error inesperado. No te preocupes, puedes intentar solucionarlo.
          </p>
        </div>

        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-left">
          <h3 className="text-sm font-semibold text-red-800 dark:text-red-400 mb-2">
            Error Diagnostics (DEBUG MODE):
          </h3>
          <p className="text-xs text-red-700 dark:text-red-300 font-mono break-all mb-2">
            {error.message || 'No error message available'}
          </p>
          {error.digest && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              Error ID: {error.digest}
            </p>
          )}
          <details className="mt-2">
            <summary className="text-xs text-red-500 cursor-pointer">Ver Stack Trace</summary>
            <pre className="text-[10px] text-red-600 dark:text-red-300 overflow-auto max-h-40 mt-1">
              {error.stack}
            </pre>
          </details>
        </div>

        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md px-4 py-2 text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Intentar de nuevo
          </button>

          <button
            onClick={handleRefresh}
            className="w-full inline-flex items-center justify-center gap-2 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground rounded-md px-4 py-2 text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Recargar página
          </button>

          <button
            onClick={handleGoHome}
            className="w-full inline-flex items-center justify-center gap-2 bg-transparent hover:bg-accent hover:text-accent-foreground rounded-md px-4 py-2 text-sm font-medium"
          >
            <Home className="w-4 h-4" />
            Ir al inicio
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Si el problema persiste, por favor contacta al soporte técnico.
          </p>
        </div>
      </div>
    </div>
  );
}
