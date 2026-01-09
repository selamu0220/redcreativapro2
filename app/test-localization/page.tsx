'use client'

import React from 'react'
import { LocalizationStatus } from '../components/LocalizationStatus'
import { CountrySelector } from '../components/CountrySelector'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

/**
 * Test page to verify localization integration
 * This page demonstrates all localization features working together
 */
export default function TestLocalizationPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Test de Localización
            </h1>
            <p className="text-gray-600 mt-1">
              Verificación de la integración del sistema de localización
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Localization Status */}
          <LocalizationStatus showDetails={true} />

          {/* Country Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Selector de País</CardTitle>
              <CardDescription className="text-xs">
                Cambiar país manualmente para probar diferentes configuraciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CountrySelector
                onCountryChange={(country) => {
                  console.log('Country changed to:', country)
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Integration Status */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Estado de Integración</CardTitle>
            <CardDescription>
              Verificación de que todos los componentes están usando el contexto de localización
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">✅ Integrado</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• LocalizationProvider en layout principal</li>
                    <li>• Página de planes (/planes)</li>

                    <li>• Página de suscripción (/subscription)</li>
                    <li>• Componentes de dashboard</li>
                    <li>• Componentes legales</li>
                    <li>• Sistema de consentimiento</li>
                  </ul>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">🔧 Características</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Detección automática de país</li>
                    <li>• Conversión de moneda en tiempo real</li>
                    <li>• Métodos de pago regionales</li>
                    <li>• Cumplimiento legal por país</li>
                    <li>• Manejo de errores y fallbacks</li>
                    <li>• Caché de configuración</li>
                    <li>• Selección manual de país</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">📋 Próximos Pasos</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Integrar con API de creación de checkout de Stripe</li>
                  <li>• Añadir plantillas de email localizadas</li>
                  <li>• Implementar contenido regionalizado</li>
                  <li>• Optimizar rendimiento para conexiones lentas</li>
                  <li>• Añadir más métodos de pago regionales</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Links */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Enlaces de Prueba</CardTitle>
            <CardDescription>
              Navega a diferentes páginas para verificar la integración
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/planes">
                <Button variant="outline" size="sm" className="w-full">
                  Planes
                </Button>
              </Link>
              <Link href="/subscription">
                <Button variant="outline" size="sm" className="w-full">
                  Suscripción
                </Button>
              </Link>

              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="w-full">
                  Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}