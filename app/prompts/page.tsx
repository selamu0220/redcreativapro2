'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import ProtectedRoute from '../components/ProtectedRoute'
import { useAuth } from '../hooks/useAuth'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

function ChatIAPage() {
  const { user, logout } = useAuth();
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const predefinedPrompts = [
    {
      category: 'Escritura Creativa',
      prompts: [
        'Ayúdame a escribir una historia corta sobre...',
        'Crea un poema sobre...',
        'Desarrolla un personaje para mi novela',
        'Sugiere ideas para un blog post sobre...'
      ]
    },
    {
      category: 'Marketing',
      prompts: [
        'Crea un copy persuasivo para...',
        'Desarrolla una estrategia de contenido para...',
        'Escribe un email de marketing para...',
        'Genera ideas para una campaña publicitaria'
      ]
    },
    {
      category: 'Análisis',
      prompts: [
        'Analiza las ventajas y desventajas de...',
        'Compara estos dos conceptos...',
        'Explica de manera simple...',
        'Resume los puntos clave de...'
      ]
    },
    {
      category: 'Productividad',
      prompts: [
        'Ayúdame a planificar...',
        'Crea una lista de tareas para...',
        'Organiza esta información...',
        'Sugiere mejoras para este proceso...'
      ]
    }
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || input
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          history: messages.slice(-10) // Enviar últimos 10 mensajes para contexto
        }),
      })

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor')
      }

      const data = await response.json()
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Lo siento, hubo un error al procesar tu mensaje. Verifica tu configuración de API.',
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const usePrompt = (prompt: string) => {
    setInput(prompt)
  }

  const addPromptToSelection = (prompt: string) => {
    if (!selectedPrompts.includes(prompt)) {
      setSelectedPrompts(prev => [...prev, prompt])
    }
  }

  const removePromptFromSelection = (prompt: string) => {
    setSelectedPrompts(prev => prev.filter(p => p !== prompt))
  }

  const combineSelectedPrompts = () => {
    const combined = selectedPrompts.join(' + ')
    setInput(combined)
    setSelectedPrompts([])
  }

  const clearChat = () => {
    setMessages([])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-xl font-bold text-blue-600">
                  Red Creativa Pro
                </Link>
                <span className="text-gray-300">|</span>
                <h1 className="text-lg font-semibold text-gray-900">Chat IA con Prompts</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {user?.email}
                </span>
                <button
                  onClick={logout}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Panel de prompts */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold mb-4">Prompts Predefinidos</h3>
                
                {selectedPrompts.length > 0 && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-800 mb-2">
                      Prompts Seleccionados ({selectedPrompts.length})
                    </div>
                    <div className="space-y-1">
                      {selectedPrompts.map((prompt, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <span className="text-blue-700 truncate">{prompt}</span>
                          <button
                            onClick={() => removePromptFromSelection(prompt)}
                            className="text-red-500 hover:text-red-700 ml-1"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={combineSelectedPrompts}
                      className="w-full mt-2 bg-blue-600 text-white py-1 px-2 rounded text-xs hover:bg-blue-700"
                    >
                      Combinar Prompts
                    </button>
                  </div>
                )}

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {predefinedPrompts.map((category, categoryIndex) => (
                    <div key={categoryIndex}>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        {category.category}
                      </h4>
                      <div className="space-y-1">
                        {category.prompts.map((prompt, promptIndex) => (
                          <div key={promptIndex} className="flex items-center space-x-1">
                            <button
                              onClick={() => usePrompt(prompt)}
                              className="flex-1 text-left text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded transition duration-200"
                            >
                              {prompt}
                            </button>
                            <button
                              onClick={() => addPromptToSelection(prompt)}
                              className="text-green-600 hover:text-green-800 p-1"
                              title="Agregar a selección"
                            >
                              +
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Panel de chat */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow h-[600px] flex flex-col">
                {/* Área de mensajes */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-20">
                      <div className="text-4xl mb-4">🤖</div>
                      <h3 className="text-lg font-medium mb-2">¡Hola! Soy tu asistente de IA</h3>
                      <p className="text-sm">Selecciona un prompt predefinido o escribe tu propia pregunta para comenzar.</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-3xl px-4 py-2 rounded-lg ${
                            message.isUser
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <div className="whitespace-pre-wrap">{message.content}</div>
                          <div
                            className={`text-xs mt-1 ${
                              message.isUser ? 'text-blue-100' : 'text-gray-500'
                            }`}
                          >
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                          <span>Pensando...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Área de entrada */}
                <div className="border-t p-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1">
                      <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Escribe tu mensaje aquí... (Shift+Enter para nueva línea)"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={2}
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => sendMessage()}
                        disabled={!input.trim() || isLoading}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
                      >
                        Enviar
                      </button>
                      <button
                        onClick={clearChat}
                        className="bg-gray-500 text-white px-6 py-1 rounded-lg hover:bg-gray-600 transition duration-200 text-sm"
                      >
                        Limpiar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default ChatIAPage