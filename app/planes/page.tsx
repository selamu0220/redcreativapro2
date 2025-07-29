'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ProtectedRoute } from '../components/ProtectedRoute'

interface PlanInfo {
  name: string
  description: string
  status: 'loading' | 'free' | 'trial' | 'pro' | 'premium'
}

const PlanesPage = () => {
  const [currentPlan, setCurrentPlan] = useState<PlanInfo>({
    name: 'Cargando...',
    description: 'Obteniendo información del plan actual',
    status: 'loading'
  })

  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false)

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
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planType }),
      })

      const data = await response.json()
      
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
        {/* Header Navigation */}
        <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-700 animate-fade-in-up">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2 hover:scale-105 transition-transform duration-200">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center hover:rotate-12 transition-transform duration-200">
                  <span className="text-white font-bold text-sm">RC</span>
                </div>
                <span className="text-xl font-bold text-white hover:text-blue-400 transition-colors duration-200">Red Creativa Pro</span>
              </Link>
              
              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/escritor-ia" className="text-gray-300 hover:text-blue-400 hover:scale-105 transition-all duration-200">Escritor IA</Link>
                <Link href="/planes" className="text-blue-400 font-medium hover:scale-105 transition-all duration-200">Planes</Link>
              </nav>
              
              <Link 
                href="/escritor-ia" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg hover:scale-105 hover:shadow-lg transition-all duration-200"
              >
                Volver
              </Link>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12 animate-fade-in-up">
            <h1 className="text-4xl font-bold text-white mb-4">Asegurar tu Plaza</h1>
            <p className="text-xl text-gray-300 mb-2">Solo 300 usuarios tendrán acceso</p>
            <p className="text-lg text-red-400 font-semibold">¡Plazas limitadas disponibles!</p>
          </div>

          {/* Planes */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Plan Básico - No Disponible */}
            <div className="bg-gray-800 rounded-2xl shadow-lg p-8 relative opacity-60">
              <div className="absolute top-4 right-4 bg-gray-500 text-white px-3 py-1 rounded-full text-sm">
                No Disponible
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">Básico</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-400">2€</span>
                  <span className="text-gray-400">/mes</span>
                </div>
                <ul className="space-y-3 mb-8 text-left">
                  <li className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 text-gray-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    3 mejoras de texto al día
                  </li>
                  <li className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 text-gray-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Funciones básicas
                  </li>
                  <li className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 text-gray-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Soporte por email
                  </li>
                </ul>
                <button 
                  disabled
                  className="w-full bg-gray-300 text-gray-500 py-3 px-6 rounded-lg font-semibold cursor-not-allowed"
                >
                  Próximamente
                </button>
              </div>
            </div>

            {/* Plan Pro - Principal */}
            <div className="bg-white rounded-2xl shadow-xl p-8 relative border-2 border-blue-500 transform scale-105 animate-fade-in-up hover:scale-110 hover:shadow-2xl transition-all duration-300 group">
              <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                Recomendado
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors duration-200">Pro</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-blue-600">4,99€</span>
                  <span className="text-gray-600">/mes</span>
                </div>
                <ul className="space-y-3 mb-8 text-left">
                  <li className="flex items-center text-gray-300 hover:text-blue-400 transition-colors duration-200">
                    <svg className="w-5 h-5 text-green-400 mr-3 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Mejoras ilimitadas
                  </li>
                  <li className="flex items-center text-gray-300 hover:text-blue-400 transition-colors duration-200">
                    <svg className="w-5 h-5 text-green-400 mr-3 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Todas las herramientas
                  </li>
                  <li className="flex items-center text-gray-300 hover:text-blue-400 transition-colors duration-200">
                    <svg className="w-5 h-5 text-green-400 mr-3 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Envío de emails
                  </li>
                  <li className="flex items-center text-gray-300 hover:text-blue-400 transition-colors duration-200">
                    <svg className="w-5 h-5 text-green-400 mr-3 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Soporte prioritario
                  </li>
                  <li className="flex items-center text-gray-300 hover:text-blue-400 transition-colors duration-200">
                    <svg className="w-5 h-5 text-green-400 mr-3 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Sin anuncios
                  </li>
                </ul>
                {currentPlan.status === 'pro' ? (
                  <button 
                    disabled
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold cursor-not-allowed"
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
                          class="w-full hover:scale-105 transition-transform duration-200"
                        ></stripe-buy-button>`
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Plan Premium */}
            <div className="bg-gray-800 rounded-2xl shadow-lg p-8 relative animate-fade-in-up hover:scale-105 hover:shadow-xl transition-all duration-300 group" style={{animationDelay: '0.2s'}}>
              <div className="absolute top-4 right-4 bg-purple-500 text-white px-3 py-1 rounded-full text-sm">
                Próximamente
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors duration-200">Premium</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-purple-600 animate-gradient-x">30€</span>
                  <span className="text-gray-600">/mes</span>
                </div>
                <ul className="space-y-3 mb-8 text-left">
                  <li className="flex items-center text-gray-300 hover:text-purple-400 transition-colors duration-200">
                    <svg className="w-5 h-5 text-purple-500 mr-3 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    100,000 mejoras al día
                  </li>
                  <li className="flex items-center text-gray-300 hover:text-purple-400 transition-colors duration-200">
                    <svg className="w-5 h-5 text-purple-500 mr-3 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Soporte 24/7
                  </li>
                  <li className="flex items-center text-gray-300 hover:text-purple-400 transition-colors duration-200">
                    <svg className="w-5 h-5 text-purple-500 mr-3 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    API personalizada
                  </li>
                  <li className="flex items-center text-gray-300 hover:text-purple-400 transition-colors duration-200">
                    <svg className="w-5 h-5 text-purple-500 mr-3 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Funciones exclusivas
                  </li>
                  <li className="flex items-center text-gray-300 hover:text-purple-400 transition-colors duration-200">
                    <svg className="w-5 h-5 text-purple-500 mr-3 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Consultor dedicado
                  </li>
                  <li className="flex items-center text-gray-300 hover:text-purple-400 transition-colors duration-200">
                    <svg className="w-5 h-5 text-purple-500 mr-3 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Integraciones avanzadas
                  </li>
                </ul>
                <button 
                  disabled
                  className="w-full bg-gray-300 text-gray-500 py-3 px-6 rounded-lg font-semibold cursor-not-allowed hover:scale-105 transition-transform duration-200"
                >
                  Próximamente
                </button>
              </div>
            </div>
          </div>

          {/* Plan Actual */}
          <div className="mt-12 bg-gray-800 rounded-xl p-8 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Plan Actual</h2>
            <div className="bg-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200 max-w-md mx-auto">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-300">Plan:</span>
                <span className="font-semibold text-white">{currentPlan.name}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-300">Estado:</span>
                {currentPlan.status !== 'loading' && (
                  <span className={`px-3 py-1 rounded-full text-sm transition-all duration-200 hover:scale-105 ${
                    currentPlan.status === 'pro' ? 'bg-blue-100 text-blue-800' :
                    currentPlan.status === 'trial' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {currentPlan.status === 'pro' ? 'Pro' :
                     currentPlan.status === 'trial' ? 'Prueba' : 'Gratuito'}
                  </span>
                )}
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-300">
                  {currentPlan.description}
                </p>
              </div>
            </div>
          </div>

          {/* Botón Volver */}
          <div className="mt-8 text-center animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <Link 
              href="/escritor-ia" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              <svg className="w-5 h-5 mr-2 transition-transform duration-200 hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al Escritor
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default PlanesPage