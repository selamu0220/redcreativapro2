'use client'

import React, { useRef } from 'react'
import { useUmamiAnalytics } from '@/app/hooks/useUmamiAnalytics'

/**
 * Demo component showcasing interaction tracking capabilities
 */
export const InteractionTrackingDemo: React.FC = () => {
  const {
    trackButtonClick,
    trackFormSubmission,
    trackElementInteraction,
    trackConversionEvent,
    isInitialized,
    lastError
  } = useUmamiAnalytics({
    enableCustomEvents: true,
    debug: true
  })

  const formRef = useRef<HTMLFormElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleButtonClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget
    await trackButtonClick(button, {
      pageSection: 'demo',
      userType: 'authenticated'
    })
  }

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    await trackFormSubmission(form, {
      pageSection: 'demo',
      userType: 'authenticated'
    })
  }

  const handleCustomInteraction = async (type: 'focus' | 'hover') => {
    if (buttonRef.current) {
      await trackElementInteraction(type, buttonRef.current, {
        pageSection: 'demo'
      })
    }
  }

  const handleConversionEvent = async () => {
    await trackConversionEvent('feature_use', {
      feature_name: 'interaction_demo',
      user_id: 'demo_user_123',
      value: 1,
      properties: {
        demo_type: 'interaction_tracking',
        timestamp: Date.now()
      }
    })
  }

  if (!isInitialized) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Inicializando sistema de seguimiento...</p>
      </div>
    )
  }

  if (lastError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Error: {lastError}</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Demo de Seguimiento de Interacciones
        </h2>
        <p className="text-gray-600 mb-6">
          Este componente demuestra las capacidades de seguimiento de interacciones de usuario
          con datos contextuales y categorización automática.
        </p>

        {/* Button Click Tracking */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            Seguimiento de Clics en Botones
          </h3>
          <div className="space-x-3">
            <button
              type="button"
              ref={buttonRef}
              onClick={handleButtonClick}
              onFocus={() => handleCustomInteraction('focus')}
              onMouseEnter={() => handleCustomInteraction('hover')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Botón Principal
            </button>
            <button
              type="button"
              onClick={handleButtonClick}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              Botón Secundario
            </button>
            <button
              type="button"
              onClick={handleConversionEvent}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
            >
              Evento de Conversión
            </button>
          </div>
        </div>

        {/* Form Submission Tracking */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            Seguimiento de Formularios
          </h3>
          <form
            ref={formRef}
            onSubmit={handleFormSubmit}
            className="space-y-4 p-4 bg-gray-50 rounded-md"
          >
            <div>
              <label htmlFor="demo-name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                id="demo-name"
                name="name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label htmlFor="demo-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="demo-email"
                name="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label htmlFor="demo-message" className="block text-sm font-medium text-gray-700 mb-1">
                Mensaje
              </label>
              <textarea
                id="demo-message"
                name="message"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tu mensaje..."
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Enviar Formulario
            </button>
          </form>
        </div>

        {/* Navigation Links */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            Enlaces de Navegación
          </h3>
          <div className="space-x-4">
            <a
              href="#section1"
              className="text-blue-600 hover:text-blue-800 underline"
              onClick={(e) => {
                e.preventDefault()
                trackElementInteraction('click', e.currentTarget, {
                  pageSection: 'navigation'
                })
              }}
            >
              Sección 1
            </a>
            <a
              href="#section2"
              className="text-blue-600 hover:text-blue-800 underline"
              onClick={(e) => {
                e.preventDefault()
                trackElementInteraction('click', e.currentTarget, {
                  pageSection: 'navigation'
                })
              }}
            >
              Sección 2
            </a>
            <a
              href="/external"
              className="text-green-600 hover:text-green-800 underline"
              onClick={(e) => {
                e.preventDefault()
                trackElementInteraction('click', e.currentTarget, {
                  pageSection: 'navigation'
                })
              }}
            >
              Enlace Externo
            </a>
          </div>
        </div>

        {/* Interactive Elements */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            Elementos Interactivos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className="p-4 bg-blue-50 border border-blue-200 rounded-md cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={(e) => trackElementInteraction('click', e.currentTarget, {
                pageSection: 'interactive'
              })}
            >
              <h4 className="font-medium text-blue-900">Tarjeta Interactiva 1</h4>
              <p className="text-blue-700 text-sm">Haz clic para rastrear interacción</p>
            </div>
            <div
              className="p-4 bg-green-50 border border-green-200 rounded-md cursor-pointer hover:bg-green-100 transition-colors"
              onClick={(e) => trackElementInteraction('click', e.currentTarget, {
                pageSection: 'interactive'
              })}
            >
              <h4 className="font-medium text-green-900">Tarjeta Interactiva 2</h4>
              <p className="text-green-700 text-sm">Haz clic para rastrear interacción</p>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">
          Instrucciones
        </h3>
        <ul className="space-y-2 text-gray-600">
          <li>• Abre las herramientas de desarrollador (F12) para ver los logs de seguimiento</li>
          <li>• Interactúa con los elementos para generar eventos de seguimiento</li>
          <li>• Los eventos se envían automáticamente a Umami con datos contextuales</li>
          <li>• Cada tipo de interacción incluye categorización e importancia automática</li>
        </ul>
      </div>
    </div>
  )
}

export default InteractionTrackingDemo