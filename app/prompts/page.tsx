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
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="bg-background shadow-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-xl font-bold text-foreground">
                  Red Creativa Pro
                </Link>
                <span className="text-muted-foreground">|</span>
                <h1 className="text-lg font-semibold text-foreground">Chat IA con Prompts</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">
                  {user?.email}
                </span>
                <button
                  onClick={logout}
                  className="text-sm text-destructive hover:text-destructive/80"
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
              <div className="bg-card border border-border rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold mb-4 text-card-foreground">Prompts Predefinidos</h3>
                
                {selectedPrompts.length > 0 && (
                  <div className="mb-4 p-3 bg-secondary border border-border rounded-lg">
                    <div className="text-sm font-medium text-secondary-foreground mb-2">
                      Prompts Seleccionados ({selectedPrompts.length})
                    </div>
                    <div className="space-y-1">
                      {selectedPrompts.map((prompt, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <span className="text-secondary-foreground truncate">{prompt}</span>
                          <button
                            onClick={() => removePromptFromSelection(prompt)}
                            className="text-destructive hover:text-destructive/80 ml-1"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={combineSelectedPrompts}
                      className="w-full mt-2 bg-primary text-primary-foreground py-1 px-2 rounded text-xs hover:bg-primary/90"
                    >
                      Combinar Prompts
                    </button>
                  </div>
                )}

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {predefinedPrompts.map((category, categoryIndex) => (
                    <div key={categoryIndex}>
                      <h4 className="text-sm font-medium text-card-foreground mb-2">
                        {category.category}
                      </h4>
                      <div className="space-y-1">
                        {category.prompts.map((prompt, promptIndex) => (
                          <div key={promptIndex} className="flex items-center space-x-1">
                            <button
                              onClick={() => usePrompt(prompt)}
                              className="flex-1 text-left text-xs text-muted-foreground hover:text-foreground hover:bg-accent p-2 rounded transition duration-200"
                            >
                              {prompt}
                            </button>
                            <button
                              onClick={() => addPromptToSelection(prompt)}
                              className="text-primary hover:text-primary/80 p-1"
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
              <div className="bg-card rounded-lg shadow h-[600px] flex flex-col">
                {/* Área de mensajes */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground mt-20">
                      <div className="text-4xl mb-4">🤖</div>
                      <h3 className="text-lg font-medium mb-2 text-card-foreground">¡Hola! Soy tu asistente de IA</h3>
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
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-secondary-foreground'
                          }`}
                        >
                          <div className="whitespace-pre-wrap">{message.content}</div>
                          <div
                            className={`text-xs mt-1 ${
                              message.isUser ? 'text-primary-foreground/70' : 'text-secondary-foreground/70'
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
                      <div className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          <span>Pensando...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Área de entrada */}
                <div className="border-t border-border p-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1">
                      <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Escribe tu mensaje aquí... (Shift+Enter para nueva línea)"
                        className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent resize-none bg-input text-foreground placeholder-muted-foreground"
                        rows={2}
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => sendMessage()}
                        disabled={!input.trim() || isLoading}
                        className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed transition duration-200"
                      >
                        Enviar
                      </button>
                      <button
                        onClick={clearChat}
                        className="bg-secondary text-secondary-foreground px-6 py-1 rounded-lg hover:bg-secondary/80 transition duration-200 text-sm"
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