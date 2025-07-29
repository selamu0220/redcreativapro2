'use client'

import { useState, useEffect } from 'react'
import { useTrialMode } from '../hooks/useTrialMode'

interface TrialInterfaceProps {
  toolName: string
  onClose: () => void
}

export default function TrialInterface({ toolName, onClose }: TrialInterfaceProps) {
  const { trialDaysLeft, startTrial, isTrialExpired, stopTrial } = useTrialMode()
  const [timeLeft, setTimeLeft] = useState(trialDaysLeft)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    if (trialDaysLeft <= 0) {
      onClose()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(trialDaysLeft)
      
      if (trialDaysLeft <= 0) {
        onClose()
      }
    }, 100)

    return () => clearInterval(timer)
  }, [trialDaysLeft, onClose])

  const handleStopTrial = () => {
    stopTrial()
    onClose()
  }

  const renderToolContent = () => {
    switch (toolName) {
      case 'Chat IA':
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">💬 Prueba el Chat IA:</p>
              <textarea 
                className="w-full p-3 border rounded-lg resize-none transition-all duration-200 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 hover:shadow-md"
                rows={3}
                placeholder="Escribe tu pregunta aquí... Por ejemplo: 'Ayúdame a escribir un email profesional para solicitar una reunión'"
              />
              <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 hover:shadow-lg">
                Enviar mensaje
              </button>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                🤖 <strong>IA:</strong> ¡Hola! Estoy aquí para ayudarte. Durante estos 7 días de prueba Pro puedes usar todas las funciones sin límites. ¿En qué puedo ayudarte?
              </p>
            </div>
          </div>
        )
      case 'Envío de Emails':
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-3">📧 Prueba el Envío de Emails:</p>
              <div className="space-y-2">
                <input 
                  type="email" 
                  className="w-full p-2 border rounded transition-all duration-200 hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 hover:shadow-md"
                  placeholder="Para: ejemplo@email.com"
                />
                <input 
                  type="text" 
                  className="w-full p-2 border rounded transition-all duration-200 hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 hover:shadow-md"
                  placeholder="Asunto: Tu asunto aquí"
                />
                <textarea 
                  className="w-full p-2 border rounded resize-none transition-all duration-200 hover:border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 hover:shadow-md"
                  rows={3}
                  placeholder="Escribe tu mensaje aquí..."
                />
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transform hover:scale-105 transition-all duration-200 hover:shadow-lg">
                  Enviar Email
                </button>
              </div>
            </div>
          </div>
        )
      case 'Escritor IA':
        return (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-3">🤖 Prueba el Escritor IA Controlado:</p>
              <div className="space-y-2">
                <textarea 
                  className="w-full p-3 border rounded-lg resize-none transition-all duration-200 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 hover:shadow-md bg-background text-foreground placeholder:text-muted-foreground"
                  rows={2}
                  placeholder="Escribe tu texto aquí... Por ejemplo: 'Necesito escribir un post para LinkedIn sobre productividad'"
                />
                <input 
                  type="text" 
                  className="w-full p-2 border rounded transition-all duration-200 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 hover:shadow-md bg-background text-foreground placeholder:text-muted-foreground"
                  placeholder="Tu instrucción: 'Hazlo más profesional y añade emojis'"
                />
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transform hover:scale-105 transition-all duration-200 hover:shadow-lg">
                  Mejorar Texto
                </button>
              </div>
            </div>
            <div className="bg-secondary p-4 rounded-lg">
              <p className="text-sm text-secondary-foreground">
                ✨ <strong>Resultado mejorado:</strong> Aquí aparecería tu texto mejorado según tus instrucciones específicas, manteniendo tu estilo personal.
              </p>
            </div>
          </div>
        )
      default:
        return <p>Herramienta no encontrada</p>
    }
  }

  return (
    <div className={`fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-background rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                🚀 Probando: {toolName}
              </h2>
              <p className="text-sm text-muted-foreground">
                Prueba Pro restante: <span className="font-bold text-primary">{trialDaysLeft} días</span>
              </p>
            </div>
            <button
              onClick={handleStopTrial}
              className="text-muted-foreground hover:text-foreground text-2xl transform hover:scale-110 transition-all duration-200 hover:rotate-90"
            >
              ×
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-100"
                style={{ width: `${(trialDaysLeft / 7) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">✨ Acceso completo a todas las funciones premium</p>
          </div>

          {/* Tool Content */}
          {renderToolContent()}

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                ¿Te gusta lo que ves? 
              </p>
              <div className="space-x-2">
                <button
                  onClick={handleStopTrial}
                  className="px-4 py-2 text-muted-foreground border border-border rounded-lg hover:bg-muted transform hover:scale-105 transition-all duration-200"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => window.location.href = '/auth'}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transform hover:scale-105 transition-all duration-200 hover:shadow-lg"
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