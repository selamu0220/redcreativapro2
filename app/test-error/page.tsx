"use client";

import * as Sentry from "@sentry/nextjs";
import { AlertTriangle, Bug } from "lucide-react";

export default function TestError() {
  const handleClick = () => {
    // Capturar una excepción manualmente
    const error = new Error("¡Esto es un test de Sentry desde Red Creativa Pro!");
    Sentry.captureException(error);
    alert("Error enviado a Sentry. Revisa tu dashboard.");
  };

  const handleAsyncError = async () => {
    try {
      throw new Error("Error asíncrono de prueba");
    } catch (e) {
      Sentry.captureException(e);
      alert("Error asíncrono enviado a Sentry.");
    }
  };

  return (
    <div className="min-height-screen flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center mb-6 text-red-500">
          <Bug size={48} />
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-4 text-gray-900 dark:text-white">
          Sentry Test Page
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
          Utiliza los botones de abajo para generar errores de prueba y verificar que Sentry los está capturando correctamente en tu dashboard.
        </p>

        <div className="space-y-4">
          <button 
            onClick={handleClick}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md"
          >
            <AlertTriangle size={20} />
            Probar Sentry (Exception)
          </button>

          <button 
            onClick={handleAsyncError}
            className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md"
          >
            Probar Error Asíncrono
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-500 text-center">
            Asegúrate de tener configurado el DSN en tu archivo .env
          </p>
        </div>
      </div>
    </div>
  );
}
