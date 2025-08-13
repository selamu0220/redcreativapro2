"use client";

import { useAuth } from "../../hooks/useAuth";
import Link from "next/link";
import ProtectedRoute from "../../components/ProtectedRoute";

export default function EmailPagesRedirectPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              ¡Sistema Mejorado!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Ya no necesitas crear múltiples páginas de recopilación. Ahora tienes automáticamente tu propia página personalizada.
            </p>
            
            {user && (
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-left">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    Tu página automática:
                  </h3>
                  <code className="text-xs bg-white dark:bg-gray-800 p-2 rounded block break-all">
                    {window.location.origin}/correosia/{encodeURIComponent(user.email || '')}
                  </code>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Esta página se creó automáticamente cuando te registraste y está lista para usar.
                  </p>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-left">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    Nuevas funcionalidades:
                  </h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Página completamente personalizable</li>
                    <li>• Exportación de emails recopilados</li>
                    <li>• Importación de contactos existentes</li>
                    <li>• Dashboard de administración completo</li>
                    <li>• Branding personalizado</li>
                  </ul>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Link
                    href={`/correosia/${encodeURIComponent(user.email || '')}/admin`}
                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Administrar mi página
                  </Link>
                  <Link
                    href={`/correosia/${encodeURIComponent(user.email || '')}`}
                    target="_blank"
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Ver página pública
                  </Link>
                </div>
              </div>
            )}
            
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