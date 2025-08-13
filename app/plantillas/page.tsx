"use client";

import { useAuth } from "../hooks/useAuth";
import Link from "next/link";
import ProtectedRoute from "../components/ProtectedRoute";

export default function PlantillasRedirectPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Sistema Simplificado
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              La gestión de plantillas se ha simplificado. Ahora puedes crear emails directamente con IA sin necesidad de plantillas predefinidas.
            </p>
            
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Nuevas funcionalidades:
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Generación de emails con IA</li>
                  <li>• Página personalizada de recopilación</li>
                  <li>• Exportación e importación de contactos</li>
                  <li>• Sistema simplificado y más eficiente</li>
                </ul>
              </div>
              
              <div className="flex flex-col space-y-2">
                <Link
                  href="/correos-ia"
                  className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Generar Emails con IA
                </Link>
                {user && (
                  <Link
                    href={`/correosia/${encodeURIComponent(user.email || '')}/admin`}
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Mi página de recopilación
                  </Link>
                )}
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/dashboard"
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
              >
                ← Volver al Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}