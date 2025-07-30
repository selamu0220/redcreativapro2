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
    <div className="min-h-screen bg-background">
      {/* Fixed Header with Trial Info */}
      <div className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-3">
            {/* Header with Timer */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">🚀 Prueba Gratuita - {toolName}</h2>
                  <p className="text-xs text-muted-foreground">Sin registro • 3 minutos por semana</p>
                </div>
                
                {/* Timer Display */}
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg border transition-all duration-300 ${
                  showWarning 
                    ? 'bg-destructive/10 border-destructive/30 animate-pulse' 
                    : 'bg-primary/10 border-primary/30'
                }`}>
                  <span className={`text-lg font-mono font-bold ${
                    showWarning ? 'text-destructive' : 'text-primary'
                  }`}>
                    {timeRemaining.formatted}
                  </span>
                  <div className="text-xs text-muted-foreground">
                    <div>restantes</div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleStopTrial}
                className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-lg"
                title="Cerrar prueba"
              >
                ✕
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mt-2">
              <div className="w-full bg-muted rounded-full h-1">
                <div
                  className={`h-1 rounded-full transition-all duration-1000 ${
                    showWarning 
                      ? 'bg-destructive animate-pulse' 
                      : 'bg-primary'
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
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 animate-fade-in-up shadow-lg backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <span className="text-destructive animate-bounce">⚠️</span>
              <span className="text-sm font-medium text-destructive">
                ¡Quedan menos de 30 segundos!
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Regístrate gratis para obtener 7 días completos de prueba
            </p>
          </div>
        </div>
      )}

      {isTrialExpired && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-border rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-destructive">⏰</span>
              <span className="font-medium text-destructive">Tiempo agotado</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Has usado tus 3 minutos gratuitos de esta semana. ¡Regístrate para continuar!
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => window.location.href = '/auth'}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 text-sm flex-1"
              >
                Registrarse Gratis
              </button>
              <button
                onClick={handleStopTrial}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm"
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
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-2">
            <div className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground">
                <p>💡 Con una cuenta gratuita obtienes 7 días completos de prueba</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleStopTrial}
                  className="px-3 py-1 text-muted-foreground border border-border rounded-lg hover:bg-muted transition-all duration-200 text-xs"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => window.location.href = '/auth'}
                  className="px-3 py-1 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 text-xs hover:scale-105 hover:shadow-lg"
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