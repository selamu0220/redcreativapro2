'use client'

import { useState, useEffect } from 'react'
import { useGuestTrial } from '../hooks/useGuestTrial'

interface GuestTrialInterfaceProps {
  toolName: string
  onClose: () => void
  children: React.ReactNode
}

export default function GuestTrialInterface({ toolName, onClose, children }: GuestTrialInterfaceProps) {
  const { 
    timeRemainingSeconds, 
    isTrialActive, 
    isTrialExpired, 
    stopGuestTrial, 
    getTimeRemaining 
  } = useGuestTrial()
  const [isVisible, setIsVisible] = useState(false)
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    // Show warning when 30 seconds left
    if (timeRemainingSeconds <= 30 && timeRemainingSeconds > 0) {
      setShowWarning(true)
    } else {
      setShowWarning(false)
    }

    // Auto close when time expires
    if (isTrialExpired) {
      const timer = setTimeout(() => {
        handleStopTrial()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [timeRemainingSeconds, isTrialExpired])

  const handleStopTrial = () => {
    stopGuestTrial()
    onClose()
  }

  const timeRemaining = getTimeRemaining()

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Header with Trial Info */}
      <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-3">
            {/* Header with Timer */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div>
                  <h2 className="text-lg font-bold text-black">🚀 Prueba Gratuita - {toolName}</h2>
                  <p className="text-xs text-gray-600">Sin registro • 3 minutos por semana</p>
                </div>
                
                {/* Timer Display */}
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg border transition-all duration-300 ${
                  showWarning 
                    ? 'bg-red-50 border-red-300 animate-pulse' 
                    : 'bg-blue-50 border-blue-300'
                }`}>
                  <span className={`text-lg font-mono font-bold ${
                    showWarning ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {timeRemaining.formatted}
                  </span>
                  <div className="text-xs text-gray-600">
                    <div>restantes</div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleStopTrial}
                className="text-gray-600 hover:text-black transition-colors p-2 hover:bg-gray-100 rounded-lg"
                title="Cerrar prueba"
              >
                ✕
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div
                  className={`h-1 rounded-full transition-all duration-1000 ${
                    showWarning 
                      ? 'bg-red-500 animate-pulse' 
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${(timeRemainingSeconds / 180) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Messages */}
      {showWarning && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 max-w-md w-full mx-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 shadow-lg backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <span className="text-red-600 animate-bounce">⚠️</span>
              <span className="text-sm font-medium text-red-600">
                ¡Quedan menos de 30 segundos!
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Regístrate gratis para obtener 7 días completos de prueba
            </p>
          </div>
        </div>
      )}

      {isTrialExpired && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-red-600">⏰</span>
              <span className="font-medium text-red-600">Tiempo agotado</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Has usado tus 3 minutos gratuitos de esta semana. ¡Regístrate para continuar!
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => window.location.href = '/auth'}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm flex-1"
              >
                Registrarse Gratis
              </button>
              <button
                onClick={handleStopTrial}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tool Content */}
      {!isTrialExpired && (
        <div className="pt-20">
          {children}
        </div>
      )}

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-2">
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-600">
                <p>💡 Con una cuenta gratuita obtienes 7 días completos de prueba</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleStopTrial}
                  className="px-3 py-1 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-all duration-200 text-xs"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => window.location.href = '/auth'}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-xs hover:scale-105 hover:shadow-lg"
                >
                  Registrarse Gratis
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
