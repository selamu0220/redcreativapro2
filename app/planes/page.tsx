'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ProtectedRoute } from '../components/ProtectedRoute'
import VideoModal from '../components/VideoModal'
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch'

interface PlanInfo {
  name: string
  description: string
  status: 'loading' | 'free' | 'trial' | 'pro' | 'premium'
}

const PlanesPage = () => {
  const { post } = useAuthenticatedFetch()
  const [currentPlan, setCurrentPlan] = useState<PlanInfo>({
    name: 'Cargando...',
    description: 'Obteniendo información del plan actual',
    status: 'loading'
  })

  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)

  useEffect(() => {
    // Simular carga del plan actual
    const timer = setTimeout(() => {
      setCurrentPlan({
        name: 'Plan Gratuito',
        description: 'Acceso limitado a las funciones básicas',
        status: 'free'
      })
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const createCheckoutSession = async (planType: 'pro' | 'premium') => {
    setIsCreatingCheckout(true)
    try {
      const data = await post('/api/stripe/create-checkout', { planType });
      
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('Error creating checkout session:', data.error)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsCreatingCheckout(false)
    }
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
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span className="font-medium">📺 Tutorial Pago</span>
                </button>
                
                <Link href="/escritor-ia" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                  Escritor IA
                </Link>
                <Link href="/planes" className="text-sm font-medium text-primary">
                  Planes
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
            <h1 className="text-4xl font-bold text-foreground mb-4">Elige tu Plan</h1>
            <p className="text-xl text-muted-foreground mb-2">Acceso completo a todas las herramientas de IA</p>
            <p className="text-lg text-primary font-semibold">Planes flexibles para cada necesidad</p>
          </div>

          {/* Planes */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Plan Básico - No Disponible */}
            <div className="bg-card rounded-lg border border-border shadow-sm p-8 relative opacity-60">
              <div className="absolute top-4 right-4 bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm">
                No Disponible
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-card-foreground mb-2">Básico</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-muted-foreground">Básico</span>
                  <span className="text-muted-foreground">Limitado</span>
                </div>
                <ul className="space-y-3 mb-8 text-left">
                  <li className="flex items-center text-muted-foreground">
                    <svg className="w-5 h-5 text-muted-foreground mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    3 mejoras de texto al día
                  </li>
                  <li className="flex items-center text-muted-foreground">
                    <svg className="w-5 h-5 text-muted-foreground mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Funciones básicas
                  </li>
                  <li className="flex items-center text-muted-foreground">
                    <svg className="w-5 h-5 text-muted-foreground mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Soporte por email
                  </li>
                </ul>
                <button 
                  disabled
                  className="w-full bg-muted text-muted-foreground py-3 px-6 rounded-lg font-semibold cursor-not-allowed"
                >
                  Próximamente
                </button>
              </div>
            </div>

            {/* Plan Pro - Principal */}
            <div className="bg-card rounded-lg border-2 border-primary shadow-lg p-8 relative transform scale-105 hover:scale-110 transition-all duration-300">
              <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm">
                Recomendado
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-card-foreground mb-2">Pro</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-primary">Pro</span>
                  <span className="text-muted-foreground">Completo</span>
                </div>
                <ul className="space-y-3 mb-8 text-left">
                  <li className="flex items-center text-card-foreground">
                    <svg className="w-5 h-5 text-primary mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Mejoras ilimitadas
                  </li>
                  <li className="flex items-center text-card-foreground">
                    <svg className="w-5 h-5 text-primary mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Todas las herramientas
                  </li>
                  <li className="flex items-center text-card-foreground">
                    <svg className="w-5 h-5 text-primary mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Envío de emails
                  </li>
                  <li className="flex items-center text-card-foreground">
                    <svg className="w-5 h-5 text-primary mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Soporte prioritario
                  </li>
                  <li className="flex items-center text-card-foreground">
                    <svg className="w-5 h-5 text-primary mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Sin anuncios
                  </li>
                </ul>
                {currentPlan.status === 'pro' ? (
                  <button 
                    disabled
                    className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg font-semibold cursor-not-allowed opacity-60"
                  >
                    Plan Actual
                  </button>
                ) : (
                  <div className="w-full">
                    <script async src="https://js.stripe.com/v3/buy-button.js"></script>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: `<stripe-buy-button
                          buy-button-id="buy_btn_1RnNaVAZjhZ6eQncLN2Sm6p4"
                          publishable-key="pk_live_51QqKjAAZjhZ6eQnc3VxhPbGCPmbOiQJulQnUvifQlSKyV3w5Nd7A3Le2i9X116F5T61i2WRuU4dH9qU8e234fQhV004RXAMtdw"
                          class="w-full"
                        ></stripe-buy-button>`
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Plan Premium */}
            <div className="bg-card rounded-lg border border-border shadow-sm p-8 relative hover:scale-105 transition-all duration-300">
              <div className="absolute top-4 right-4 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">
                Próximamente
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-card-foreground mb-2">Premium</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-primary">Premium</span>
                  <span className="text-muted-foreground">Empresarial</span>
                </div>
                <ul className="space-y-3 mb-8 text-left">
                  <li className="flex items-center text-card-foreground">
                    <svg className="w-5 h-5 text-primary mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    100,000 mejoras al día
                  </li>
                  <li className="flex items-center text-card-foreground">
                    <svg className="w-5 h-5 text-primary mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Soporte 24/7
                  </li>
                  <li className="flex items-center text-card-foreground">
                    <svg className="w-5 h-5 text-primary mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    API personalizada
                  </li>
                  <li className="flex items-center text-card-foreground">
                    <svg className="w-5 h-5 text-primary mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Funciones exclusivas
                  </li>
                  <li className="flex items-center text-card-foreground">
                    <svg className="w-5 h-5 text-primary mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Consultor dedicado
                  </li>
                  <li className="flex items-center text-card-foreground">
                    <svg className="w-5 h-5 text-primary mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Integraciones avanzadas
                  </li>
                </ul>
                <button 
                  disabled
                  className="w-full bg-muted text-muted-foreground py-3 px-6 rounded-lg font-semibold cursor-not-allowed"
                >
                  Próximamente
                </button>
              </div>
            </div>
          </div>

          {/* Plan Actual */}
          <div className="mt-12 bg-card rounded-lg border border-border shadow-sm p-8">
            <h2 className="text-2xl font-bold text-card-foreground mb-6 text-center">Plan Actual</h2>
            <div className="bg-muted rounded-lg p-6 max-w-md mx-auto">
              <div className="flex justify-between items-center mb-4">
                <span className="text-muted-foreground">Plan:</span>
                <span className="font-semibold text-card-foreground">{currentPlan.name}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-muted-foreground">Estado:</span>
                {currentPlan.status !== 'loading' && (
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    currentPlan.status === 'pro' ? 'bg-primary text-primary-foreground' :
                    currentPlan.status === 'trial' ? 'bg-secondary text-secondary-foreground' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {currentPlan.status === 'pro' ? 'Pro' :
                     currentPlan.status === 'trial' ? 'Prueba' : 'Gratuito'}
                  </span>
                )}
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {currentPlan.description}
                </p>
              </div>
            </div>
          </div>

          {/* Botón Volver */}
          <div className="mt-8 text-center">
            <Link 
              href="/escritor-ia" 
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg transition-colors hover:bg-primary/90"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al Escritor
            </Link>
          </div>
        </div>
        
        <VideoModal
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          videoId="k5OYlxYdIuA"
          title="Introducción a Red Creativa Pro"
        />
      </div>
    </ProtectedRoute>
  )
}

export default PlanesPage