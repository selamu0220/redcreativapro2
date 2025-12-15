'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth, useClerk } from '@clerk/nextjs'
import ProtectedRoute from '@/app/components/ProtectedRoute'
import SimpleLanguageToggle from '@/app/components/SimpleLanguageToggle'
import { useSimpleTranslations } from '@/app/lib/simple-translations'
import { Zap, Star, Crown, Check, X } from 'lucide-react'

// Clerk Billing Portal Integration
const PlanesPage = () => {
  const { isSignedIn, isLoaded } = useAuth()
  const { openUserProfile } = useClerk()
  const { t } = useSimpleTranslations()
  const [showVideoModal, setShowVideoModal] = useState(false)

  const handleManageSubscription = () => {
    // Open Clerk User Profile directly to the billing section (if supported) or general profile
    openUserProfile({
      // @ts-ignore - Some versions support initialPage
      initialPage: 'account'
    })
  }

  const plans = [
    {
      name: 'Red Creativa Pro',
      price: '€4.99',
      interval: 'Mensual',
      popular: true,
      features: [
        'Mejoras ilimitadas de texto',
        'Todas las herramientas de IA',
        'Envío de emails masivos',
        'Generación de contenido',
        'Acceso privado al creador',
        'Soporte prioritario'
      ]
    },
    {
      name: 'Red Creativa Pro',
      price: '€142.80',
      interval: 'Anual',
      features: [
        'Todo lo del plan mensual',
        'Acceso privado al creador',
        'Facturación anual',
        'Consultas ilimitadas',
        'Soporte VIP'
      ]
    },
    {
      name: 'Red Creativa Pro (DE POR VIDA)',
      price: '€429.00',
      interval: 'Pago único',
      features: [
        'Acceso de por vida',
        'Todas las funciones premium',
        'Sin pagos recurrentes',
        'Soporte premium de por vida'
      ]
    }
  ]

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground">
        {/* Header Navigation */}
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 max-w-screen-2xl items-center">
            <div className="mr-4 hidden md:flex">
              <Link className="mr-6 flex items-center space-x-2" href="/">
                <div className="h-6 w-6 rounded-sm bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xs">RC</span>
                </div>
                <span className="hidden font-bold sm:inline-block">Red Creativa Pro</span>
              </Link>
            </div>
            <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
              <nav className="flex items-center space-x-6">
                {/* Botón de Tutorial de YouTube */}
                <button
                  onClick={() => setShowVideoModal(true)}
                  className="flex items-center gap-2 text-xs text-red-600 hover:text-red-700 transition-colors duration-200 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg border border-red-200 hover:border-red-300"
                  title="Ver tutorial de cómo pagar"
                >
                  <span className="font-medium">📺 Tutorial Pago</span>
                </button>
                <Link href="/escritor-ia" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                  Escritor IA
                </Link>
              </nav>
              <Link
                href="/escritor-ia"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
              >
                Volver
              </Link>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Planes y Suscripción</h1>
            <p className="text-xl text-muted-foreground mb-2">Gestiona tu acceso a Red Creativa Pro</p>

            <div className="mt-8 p-6 bg-muted/50 rounded-lg max-w-2xl mx-auto border border-border">
              <h3 className="text-lg font-semibold mb-2">Gestión de Cuenta</h3>
              <p className="text-muted-foreground mb-4">
                Utilizamos el sistema seguro de Clerk para gestionar pagos y suscripciones.
                Haz clic abajo para ver tus opciones, actualizar tu plan o gestionar tu facturación.
              </p>
              <button
                onClick={handleManageSubscription}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-lg font-bold text-lg shadow-lg transition-all transform hover:scale-105"
              >
                Gestionar Suscripción / Ver Planes
              </button>
            </div>
          </div>

          {/* Planes Display (Informational) */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto opacity-80 hover:opacity-100 transition-opacity">
            {plans.map((plan, index) => (
              <div key={index} className={`bg-card rounded-lg border shadow-sm p-8 relative ${plan.popular ? 'border-primary shadow-md' : 'border-border'}`}>
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 rounded-bl-lg rounded-tr-lg text-xs font-bold">
                    Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-card-foreground mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold text-primary mb-1">{plan.price}</div>
                <div className="text-sm text-muted-foreground mb-6">/{plan.interval}</div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>Al hacer clic en "Gestionar Suscripción", se abrirá el portal seguro de pagos.</p>
          </div>
        </div>

        {/* Video Modal */}
        {showVideoModal && (
          <VideoModal
            onClose={() => setShowVideoModal(false)}
            videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
          />
        )}
      </div>
    </ProtectedRoute>
  )
}

// VideoModal Component
interface VideoModalProps {
  onClose: () => void
  videoUrl: string
}

function VideoModal({ onClose, videoUrl }: VideoModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Introducción a Red Creativa Pro</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Cerrar modal de video"
            title="Cerrar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="aspect-video">
          <iframe
            src={videoUrl}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Video de introducción a Red Creativa Pro"
          />
        </div>
      </div>
    </div>
  )
}

export default PlanesPage