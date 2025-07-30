'use client';

import React from 'react';
import Link from 'next/link';
import ProtectedRoute from '../components/ProtectedRoute';
import DocumentManager from '../components/DocumentManager';
import { useAuth } from '../hooks/useAuth';

export default function DocumentosPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-2xl font-bold text-blue-600">
                  Escritor IA
                </Link>
                <span className="text-gray-300">|</span>
                <h1 className="text-xl font-semibold text-gray-900">
                  Mis Documentos
                </h1>
              </div>
              
              <nav className="flex items-center space-x-4">
                <Link 
                  href="/escritor-ia" 
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Escritor IA
                </Link>
                <Link 
                  href="/correos-ia" 
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Correos IA
                </Link>
                <Link 
                  href="/prompts" 
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Prompts
                </Link>
                <Link 
                  href="/estadisticas" 
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Estadísticas
                </Link>
                <div className="text-sm text-gray-500">
                  {user?.email}
                </div>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link 
                  href="/" 
                  className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  <svg className="w-3 h-3 mr-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
                  </svg>
                  Inicio
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                    Documentos
                  </span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-4.5A1.125 1.125 0 0110.5 9.75v-1.5m0 0V6.375c0-1.5 1.232-2.625 2.625-2.625h5.25c1.397 0 2.625 1.128 2.625 2.625v1.5M10.5 8.25h.008v.008H10.5V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-blue-900">
                  Gestiona tus documentos de IA
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Aquí puedes organizar todos los textos, correos y contenido generado por IA. 
                    Crea carpetas para mantener todo organizado y accede fácilmente a tus trabajos anteriores.
                  </p>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>Organiza documentos en carpetas</li>
                    <li>Edita y actualiza contenido</li>
                    <li>Busca y filtra por tipo de documento</li>
                    <li>Guarda automáticamente desde las herramientas de IA</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Document Manager */}
          <div className="bg-white rounded-lg shadow-sm border">
            {user?.email && <DocumentManager userEmail={user.email} />}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                © 2024 Escritor IA. Todos los derechos reservados.
              </div>
              <div className="flex space-x-6">
                <Link href="/politica-privacidad" className="text-sm text-gray-500 hover:text-gray-700">
                  Política de Privacidad
                </Link>
                <Link href="/terminos-servicio" className="text-sm text-gray-500 hover:text-gray-700">
                  Términos de Servicio
                </Link>
                <Link href="/contacto" className="text-sm text-gray-500 hover:text-gray-700">
                  Contacto
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
}