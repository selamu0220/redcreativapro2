'use client'

import { useState } from 'react'
import Link from 'next/link'
import ProtectedRoute from '../components/ProtectedRoute'
import { useAuth } from '../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'

function PlanesPage() {
  const { user } = useAuth()
  const { userData, usageLimits, createCheckoutSession, getTrialDaysRemaining } = useSubscription()
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePurchase = async (planType: string) => {
    setIsProcessing(true)
    try {
      const checkoutUrl = await createCheckoutSession(planType)
      if (checkoutUrl) {
        window.location.href = checkoutUrl
      } else {
        alert('Error al crear la sesión de pago. Inténtalo de nuevo.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al procesar el pago. Inténtalo de nuevo.')
    } finally {
      setIsProcessing(false)
    }
  }

  const getCurrentPlanDisplay = () => {
    if (!userData) return { name: 'Cargando...', description: '', status: 'loading' }
    
    switch (userData.subscriptionStatus) {
      case 'trial':
        return {
          name: 'Prueba Gratuita',
          description: `${getTrialDaysRemaining()} días restantes de prueba Pro`,
          status: 'trial'
        }
      case 'pro':
        return {
          name: 'Plan Pro',
          description: 'Mejoras ilimitadas y todas las funciones',
          status: 'pro'
        }
      case 'free':
      default:
        return {
          name: 'Plan Gratuito',
          description: '2 usos por día para cada herramienta',
          status: 'free'
        }
    }
  }

  const currentPlan = getCurrentPlanDisplay()

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Elige tu Plan
            </h1>
            <p className="text-xl text-gray-600">
              Desbloquea todo el potencial de Escritor IA
            </p>
          </div>

          {/* Planes */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Plan Básico - No Disponible */}
            <div className="bg-white rounded-2xl shadow-lg p-8 relative opacity-60">
              <div className="absolute top-4 right-4 bg-gray-500 text-white px-3 py-1 rounded-full text-sm">
                No Disponible
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Básico</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-500">2€</span>
                  <span className="text-gray-500">/mes</span>
                </div>
                <ul className="space-y-3 mb-8 text-left">
                  <li className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    3 mejoras de texto al día
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Funciones básicas
                  </li>
                  <li className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
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
            <div className="bg-white rounded-2xl shadow-xl p-8 relative border-2 border-blue-500 transform scale-105">
              <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                Recomendado
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-blue-600">4,99€</span>
                  <span className="text-gray-600">/mes</span>
                </div>
                <ul className="space-y-3 mb-8 text-left">
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Mejoras ilimitadas
                  </li>
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Todas las herramientas
                  </li>
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Envío de emails
                  </li>
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Soporte prioritario
                  </li>
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Sin anuncios
                  </li>
                </ul>
                {userData?.subscriptionStatus === 'pro' ? (
                  <button 
                    disabled
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold cursor-not-allowed"
                  >
                    Plan Actual
                  </button>
                ) : (
                  <button 
                    onClick={() => handlePurchase('pro')}
                    disabled={isProcessing}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? 'Procesando...' : 'Comprar Ahora'}
                  </button>
                )}
              </div>
            </div>

            {/* Plan Premium */}
            <div className="bg-white rounded-2xl shadow-lg p-8 relative">
              <div className="absolute top-4 right-4 bg-purple-500 text-white px-3 py-1 rounded-full text-sm">
                Próximamente
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-purple-600">30€</span>
                  <span className="text-gray-600">/mes</span>
                </div>
                <ul className="space-y-3 mb-8 text-left">
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-purple-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    100,000 mejoras al día
                  </li>
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-purple-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Soporte 24/7
                  </li>
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-purple-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    API personalizada
                  </li>
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-purple-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Funciones exclusivas
                  </li>
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-purple-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Consultor dedicado
                  </li>
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-purple-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Integraciones avanzadas
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
          </div>

          {/* Plan Actual */}
          <div className="mt-12 text-center">
            <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Plan Actual</h3>
              <p className="text-gray-600 mb-4">{currentPlan.name}</p>
              <p className="text-sm text-gray-500">
                {currentPlan.description}
              </p>
              {currentPlan.status !== 'loading' && (
                <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium mt-2 ${
                  currentPlan.status === 'pro' ? 'bg-blue-100 text-blue-800' :
                  currentPlan.status === 'trial' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {currentPlan.status === 'pro' ? 'Pro' :
                   currentPlan.status === 'trial' ? 'Prueba' : 'Gratuito'}
                </span>
              )}
            </div>
          </div>

          {/* Botón Volver */}
          <div className="mt-8 text-center">
            <Link 
              href="/escritor-ia" 
              className="inline-flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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