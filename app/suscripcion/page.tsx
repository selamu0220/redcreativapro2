'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { LogIn, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Dynamically import SubscriptionDashboard to prevent SSR issues
const SubscriptionDashboard = dynamic(
  () => import('../components/SubscriptionDashboard').then(mod => ({ default: mod.default })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }
);

export default function SubscriptionPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Suscripción</h1>
            <p className="text-gray-600 mt-2">Administra tu plan y configuración de facturación</p>
          </div>

          {/* Login Required */}
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <LogIn className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Inicia Sesión</CardTitle>
                <CardDescription>
                  Necesitas iniciar sesión para acceder a la gestión de tu suscripción.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => window.location.href = '/auth/login'}
                  className="w-full"
                >
                  Iniciar Sesión
                </Button>
                <Button 
                  onClick={() => window.location.href = '/auth/register'}
                  variant="outline"
                  className="w-full"
                >
                  Crear Cuenta
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Suscripción</h1>
              <p className="text-gray-600 mt-2">Administra tu plan y configuración de facturación</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link href="/planes">
                <Button variant="outline">
                  Ver Todos los Planes
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Dashboard */}
        <div className="max-w-4xl mx-auto">
          <SubscriptionDashboard />
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            ¿Necesitas ayuda? {' '}
            <a href="mailto:soporte@redcreativa.com" className="text-blue-600 hover:text-blue-700">
              Contacta con soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}