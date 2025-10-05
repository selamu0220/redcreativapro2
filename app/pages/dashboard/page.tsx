'use client';

import React from 'react';
import { useUser } from '@/app/contexts/UserContext';
import { SubscriptionProvider } from '@/app/contexts/SubscriptionContext';
import SubscriptionDashboard from '@/app/components/SubscriptionDashboard';
import AccessBlocker from '@/app/components/AccessBlocker';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { User, Settings, BarChart3 } from 'lucide-react';

function DashboardContent() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Acceso Requerido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Debes iniciar sesión para acceder al dashboard.
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Iniciar Sesión
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard de Suscripción
        </h1>
        <p className="text-gray-600">
          Bienvenido, {user.email}. Gestiona tu suscripción y acceso a herramientas.
        </p>
      </div>

      {/* User Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información de Usuario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">ID de Usuario</p>
              <p className="font-mono text-xs">{user.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Fecha de Registro</p>
              <p className="text-sm">{new Date(user.created_at).toLocaleDateString('es-ES')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Dashboard */}
      <SubscriptionDashboard />

      {/* Quick Actions */}
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Herramientas Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Accede a todas las herramientas de Red Creativa Pro
            </p>
            <button
              onClick={() => window.location.href = '/tools'}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ver Herramientas
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuración
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Personaliza tu experiencia y configuración de cuenta
            </p>
            <button
              onClick={() => window.location.href = '/settings'}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Ir a Configuración
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Access Blocker - Shows blocking message if needed */}
      <div className="mt-8">
        <AccessBlocker userId={user?.id || ''}>
          <div></div>
        </AccessBlocker>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <SubscriptionProvider>
      <DashboardContent />
    </SubscriptionProvider>
  );
}