'use client';

import Link from 'next/link';

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Pago cancelado</h3>
          <p className="mt-1 text-sm text-gray-500">
            No se ha procesado ningún pago. Puedes intentar de nuevo cuando quieras.
          </p>
          
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-gray-900">¿Necesitas ayuda?</h4>
            <p className="mt-1 text-sm text-gray-600">
              Si tienes problemas con el proceso de pago, no dudes en contactarnos.
            </p>
          </div>
          
          <div className="mt-6 space-y-3">
            <Link
              href="/planes"
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Ver planes nuevamente
            </Link>
            <Link
              href="/escritor-ia"
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Continuar con plan gratuito
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}