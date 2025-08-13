'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import ProtectedRoute from '../components/ProtectedRoute'
import VideoModal from '../components/VideoModal'
import MobileLayout, { MobileContainer } from '../components/MobileLayout'
import { useAuth } from '../hooks/useAuth';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';
import { usePrompts, Prompt, PromptGroup, PromptChain, ChainExecutionResult } from '../hooks/usePrompts'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

type ActiveTab = 'chat' | 'prompts' | 'groups' | 'chains'
type ModalType = 'prompt' | 'group' | 'chain' | null

function ChatIAPage() {
  const { user, logout } = useAuth()
  const { post } = useAuthenticatedFetch()
  const {
    prompts,
    groups,
    chains,
    loading,
    createPrompt,
    updatePrompt,
    deletePrompt,
    createGroup,
    updateGroup,
    deleteGroup,
    createChain,
    updateChain,
    deleteChain,
    executeChain
  } = usePrompts()

  // Estados existentes
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Nuevos estados para gestión de prompts
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat')
  const [modalType, setModalType] = useState<ModalType>(null)
  const [executingChain, setExecutingChain] = useState<string | null>(null)
  const [chainResults, setChainResults] = useState<{[key: string]: ChainExecutionResult[]}>({})

  // Estados para formularios
  const [promptForm, setPromptForm] = useState({ name: '', category: '', content: '' })
  const [groupForm, setGroupForm] = useState({ name: '', description: '', promptIds: [] as string[] })
  const [chainForm, setChainForm] = useState({ name: '', description: '', promptIds: [] as string[] })

  // Estados para edición
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
  const [editingGroup, setEditingGroup] = useState<PromptGroup | null>(null)
  const [editingChain, setEditingChain] = useState<PromptChain | null>(null)
  const [showVideoModal, setShowVideoModal] = useState(false)

  const predefinedPrompts = [
    {
      category: "Escritura Creativa",
      prompts: [
        "Escribe un cuento corto sobre...",
        "Crea un poema que exprese...",
        "Desarrolla un diálogo entre..."
      ]
    },
    {
      category: "Marketing",
      prompts: [
        "Crea un copy persuasivo para...",
        "Desarrolla una estrategia de contenido para...",
        "Escribe un email de marketing que..."
      ]
    },
    {
      category: "Análisis",
      prompts: [
        "Analiza las ventajas y desventajas de...",
        "Compara y contrasta...",
        "Evalúa el impacto de..."
      ]
    },
    {
      category: "Productividad",
      prompts: [
        "Crea una lista de tareas para...",
        "Planifica un cronograma para...",
        "Organiza las ideas sobre..."
      ]
    }
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleCreatePrompt = async () => {
    try {
      if (editingPrompt) {
        await updatePrompt(editingPrompt.id, promptForm)
        setEditingPrompt(null)
      } else {
        await createPrompt(promptForm)
      }
      setPromptForm({ name: '', category: '', content: '' })
      setModalType(null)
    } catch (error) {
      console.error('Error creating/updating prompt:', error)
    }
  }

  const handleCreateGroup = async () => {
    try {
      if (editingGroup) {
        await updateGroup(editingGroup.id, groupForm)
        setEditingGroup(null)
      } else {
        await createGroup({ ...groupForm, prompts: groupForm.promptIds })
      }
      setGroupForm({ name: '', description: '', promptIds: [] })
      setModalType(null)
    } catch (error) {
      console.error('Error creating/updating group:', error)
    }
  }

  const handleCreateChain = async () => {
    try {
      if (editingChain) {
        await updateChain(editingChain.id, chainForm)
        setEditingChain(null)
      } else {
        await createChain({ 
          ...chainForm, 
          steps: chainForm.promptIds.map((promptId, index) => ({
            id: `step-${index}`,
            promptId,
            order: index,
            waitForResponse: true
          }))
        })
      }
      setChainForm({ name: '', description: '', promptIds: [] })
      setModalType(null)
    } catch (error) {
      console.error('Error creating/updating chain:', error)
    }
  }

  const handleExecuteChain = async (chainId: string) => {
    try {
      setExecutingChain(chainId)
      
      const defaultApiKey = 'AIzaSyALwXOW_onexmTnq6RXNipyWCqVUVXjwqw'
      const savedApiKey = localStorage.getItem('gemini_api_key')
      const hasCustomApiKey = localStorage.getItem('has_custom_api_key') === 'true'
      
      let finalApiKey = defaultApiKey
      if (hasCustomApiKey && savedApiKey) {
        finalApiKey = savedApiKey
      }
      
      const model = localStorage.getItem('gemini_model') || 'gemini-1.5-flash'
      const temperature = localStorage.getItem('gemini_temperature') || '0.7'
      const maxTokens = localStorage.getItem('gemini_max_tokens') || '2000'
      
      const result = await executeChain(chainId, finalApiKey, {
        model,
        temperature,
        maxTokens
      })
      
      setChainResults(prev => ({ ...prev, [chainId]: result.executionResults }))
      
      const chainMessage: Message = {
        id: Date.now().toString(),
        content: `🔗 Cadena ejecutada: ${result.chainName}\n\n${result.executionResults.map((r, i) => 
          `**Paso ${i + 1}:** ${r.promptContent}\n**Resultado:** ${r.response}\n`
        ).join('\n')}`,
        isUser: false,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, chainMessage])
    } catch (error) {
      console.error('Error executing chain:', error)
    } finally {
      setExecutingChain(null)
    }
  }

  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || input
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const defaultApiKey = 'AIzaSyALwXOW_onexmTnq6RXNipyWCqVUVXjwqw'
      const savedApiKey = localStorage.getItem('gemini_api_key')
      const hasCustomApiKey = localStorage.getItem('has_custom_api_key') === 'true'
      
      let finalApiKey = defaultApiKey
      if (hasCustomApiKey && savedApiKey) {
        finalApiKey = savedApiKey
      }
      
      const customHeaders = {
        'x-api-key': finalApiKey,
        'x-model': localStorage.getItem('gemini_model') || 'gemini-1.5-flash',
        'x-temperature': localStorage.getItem('gemini_temperature') || '0.7',
        'x-max-tokens': localStorage.getItem('gemini_max_tokens') || '2000'
      };
      const data = await post('/api/chat', {
        message: content,
        conversationHistory: messages.slice(-10)
      }, customHeaders)
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
        content: 'Lo siento, hubo un error al procesar tu mensaje.',
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
      setSelectedPrompts([...selectedPrompts, prompt])
    }
  }

  const removePromptFromSelection = (prompt: string) => {
    setSelectedPrompts(selectedPrompts.filter(p => p !== prompt))
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
      <MobileLayout>
        <MobileContainer>
          <div className="min-h-screen bg-background text-foreground">
        <header className="bg-background shadow-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-xl font-bold text-foreground">
                  Red Creativa Pro
                </Link>
                <span className="text-muted-foreground">|</span>
                <h1 className="text-lg font-semibold text-foreground">Gestión de Prompts IA</h1>
                
                {/* Botón de Tutorial de YouTube */}
                <button
                  onClick={() => setShowVideoModal(true)}
                  className="flex items-center gap-2 text-xs text-red-600 hover:text-red-700 transition-colors duration-200 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg border border-red-200 hover:border-red-300"
                  title="Ver tutorial de cómo usar Prompts IA"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span className="font-medium">📺 Tutorial</span>
                </button>
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

            <div className="flex space-x-1 mt-4">
              {(['chat', 'prompts', 'groups', 'chains'] as ActiveTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === tab
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {tab === 'chat' && 'Chat'}
                  {tab === 'prompts' && 'Mis Prompts'}
                  {tab === 'groups' && 'Grupos'}
                  {tab === 'chains' && 'Cadenas'}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'chat' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-card rounded-lg shadow-sm border border-border p-6">
                  {selectedPrompts.length > 0 && (
                    <div className="mb-4 p-3 bg-muted rounded-lg">
                      <h3 className="text-sm font-medium mb-2">Prompts Seleccionados:</h3>
                      {selectedPrompts.map((prompt, index) => (
                        <div key={index} className="flex items-center justify-between text-sm mb-1">
                          <span className="truncate">{prompt}</span>
                          <button
                            onClick={() => removePromptFromSelection(prompt)}
                            className="text-destructive hover:text-destructive/80 ml-2"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={combineSelectedPrompts}
                          className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded"
                        >
                          Combinar
                        </button>
                        <button
                          onClick={() => setSelectedPrompts([])}
                          className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded"
                        >
                          Limpiar
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="h-96 overflow-y-auto mb-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <p>¡Hola! Soy tu asistente de IA para gestión de prompts.</p>
                        <p>Puedes crear, organizar y ejecutar cadenas de prompts personalizados.</p>
                        <p>Selecciona prompts de la barra lateral o escribe tu mensaje.</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-3xl px-4 py-2 rounded-lg ${
                              message.isUser
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            <div className="whitespace-pre-wrap">{message.content}</div>
                            <div
                              className={`text-xs mt-1 ${
                                message.isUser ? 'text-primary-foreground/70' : 'text-muted-foreground/70'
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
                        <div className="bg-muted text-muted-foreground px-4 py-2 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            <span>Pensando...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="flex space-x-2">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Escribe tu mensaje aquí..."
                      className="flex-1 p-3 border border-border rounded-lg resize-none bg-background text-foreground"
                      rows={3}
                    />
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => sendMessage()}
                        disabled={!input.trim() || isLoading}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                      >
                        Enviar
                      </button>
                      <button
                        onClick={clearChat}
                        className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:bg-destructive/90"
                      >
                        Limpiar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-card rounded-lg shadow-sm border border-border p-6">
                  <h2 className="text-lg font-semibold mb-4">Prompts Predefinidos</h2>
                  {predefinedPrompts.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="mb-4">
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">{category.category}</h3>
                      {category.prompts.map((prompt, promptIndex) => (
                        <div key={promptIndex} className="flex items-center justify-between text-sm mb-2">
                          <span className="truncate flex-1">{prompt}</span>
                          <div className="flex space-x-1 ml-2">
                            <button
                              onClick={() => usePrompt(prompt)}
                              className="text-primary hover:text-primary/80 text-xs"
                            >
                              Usar
                            </button>
                            <button
                              onClick={() => addPromptToSelection(prompt)}
                              className="text-secondary hover:text-secondary/80 text-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {prompts.length > 0 && (
                  <div className="bg-card rounded-lg shadow-sm border border-border p-6">
                    <h2 className="text-lg font-semibold mb-4">Mis Prompts</h2>
                    {prompts.map((prompt) => (
                      <div key={prompt.id} className="flex items-center justify-between text-sm mb-2">
                        <span className="truncate flex-1">{prompt.name}</span>
                        <div className="flex space-x-1 ml-2">
                          <button
                            onClick={() => usePrompt(prompt.content)}
                            className="text-primary hover:text-primary/80 text-xs"
                          >
                            Usar
                          </button>
                          <button
                            onClick={() => addPromptToSelection(prompt.content)}
                            className="text-secondary hover:text-secondary/80 text-xs"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {chains.length > 0 && (
                  <div className="bg-card rounded-lg shadow-sm border border-border p-6">
                    <h2 className="text-lg font-semibold mb-4">Cadenas de Prompts</h2>
                    {chains.map((chain) => (
                      <div key={chain.id} className="mb-4 p-3 bg-muted rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{chain.name}</h3>
                          <button
                            onClick={() => handleExecuteChain(chain.id)}
                            disabled={executingChain === chain.id}
                            className="bg-primary text-primary-foreground px-3 py-1 rounded text-xs hover:bg-primary/90 disabled:opacity-50"
                          >
                            {executingChain === chain.id ? 'Ejecutando...' : 'Ejecutar'}
                          </button>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{chain.description}</p>
                        <div className="text-xs text-muted-foreground">
                          {chain.steps.length} prompts en la cadena
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'prompts' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Mis Prompts</h2>
                <button
                  onClick={() => {
                    setModalType('prompt')
                    setEditingPrompt(null)
                    setPromptForm({ name: '', category: '', content: '' })
                  }}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
                >
                  Crear Prompt
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {prompts.map((prompt) => (
                  <div key={prompt.id} className="bg-card rounded-lg shadow-sm border border-border p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{prompt.name}</h3>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => {
                            setEditingPrompt(prompt)
                            setPromptForm({ name: prompt.name, category: prompt.category, content: prompt.content })
                            setModalType('prompt')
                          }}
                          className="text-primary hover:text-primary/80 text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => deletePrompt(prompt.id)}
                          className="text-destructive hover:text-destructive/80 text-sm"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{prompt.category}</p>
                    <p className="text-sm">{prompt.content}</p>
                  </div>
                ))}
              </div>

              {prompts.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <p>No tienes prompts personalizados aún.</p>
                  <p>¡Crea tu primer prompt para comenzar!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'groups' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Grupos de Prompts</h2>
                <button
                  onClick={() => {
                    setModalType('group')
                    setEditingGroup(null)
                    setGroupForm({ name: '', description: '', promptIds: [] })
                  }}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
                >
                  Crear Grupo
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {groups.map((group) => (
                  <div key={group.id} className="bg-card rounded-lg shadow-sm border border-border p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{group.name}</h3>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => {
                            setEditingGroup(group)
                            setGroupForm({ name: group.name, description: group.description, promptIds: group.prompts })
                            setModalType('group')
                          }}
                          className="text-primary hover:text-primary/80 text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => deleteGroup(group.id)}
                          className="text-destructive hover:text-destructive/80 text-sm"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{group.description}</p>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Prompts ({group.prompts.length}):</h4>
                      {group.prompts.map((promptId) => {
                        const prompt = prompts.find(p => p.id === promptId)
                        return prompt ? (
                          <div key={promptId} className="text-sm text-muted-foreground">
                            • {prompt.name}
                          </div>
                        ) : null
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {groups.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <p>No tienes grupos de prompts aún.</p>
                  <p>¡Crea tu primer grupo para organizar tus prompts!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'chains' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Cadenas de Prompts</h2>
                <button
                  onClick={() => {
                    setModalType('chain')
                    setEditingChain(null)
                    setChainForm({ name: '', description: '', promptIds: [] })
                  }}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
                >
                  Crear Cadena
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {chains.map((chain) => (
                  <div key={chain.id} className="bg-card rounded-lg shadow-sm border border-border p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{chain.name}</h3>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleExecuteChain(chain.id)}
                          disabled={executingChain === chain.id}
                          className="bg-secondary text-secondary-foreground px-3 py-1 rounded text-sm hover:bg-secondary/90 disabled:opacity-50"
                        >
                          {executingChain === chain.id ? 'Ejecutando...' : 'Ejecutar'}
                        </button>
                        <button
                          onClick={() => {
                            setEditingChain(chain)
                            setChainForm({ name: chain.name, description: chain.description, promptIds: chain.steps.map(step => step.promptId) })
                            setModalType('chain')
                          }}
                          className="text-primary hover:text-primary/80 text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => deleteChain(chain.id)}
                          className="text-destructive hover:text-destructive/80 text-sm"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{chain.description}</p>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Secuencia de Prompts:</h4>
                      {chain.steps.map((step, index) => {
                        const prompt = prompts.find(p => p.id === step.promptId)
                        return prompt ? (
                          <div key={step.id} className="text-sm text-muted-foreground">
                            {index + 1}. {prompt.name}
                          </div>
                        ) : null
                      })}
                    </div>
                    {chainResults[chain.id] && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <h4 className="text-sm font-medium mb-2">Últimos Resultados:</h4>
                        <div className="text-xs text-muted-foreground max-h-32 overflow-y-auto">
                          {chainResults[chain.id].map((result, index) => (
                            <div key={index} className="mb-2">
                              <strong>Paso {index + 1}:</strong> {result.response.substring(0, 100)}...
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {chains.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <p>No tienes cadenas de prompts aún.</p>
                  <p>¡Crea tu primera cadena para automatizar secuencias de prompts!</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modales */}
        {modalType === 'prompt' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                {editingPrompt ? 'Editar Prompt' : 'Crear Nuevo Prompt'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre</label>
                  <input
                    type="text"
                    value={promptForm.name}
                    onChange={(e) => setPromptForm({ ...promptForm, name: e.target.value })}
                    className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Categoría</label>
                  <input
                    type="text"
                    value={promptForm.category}
                    onChange={(e) => setPromptForm({ ...promptForm, category: e.target.value })}
                    className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contenido</label>
                  <textarea
                    value={promptForm.content}
                    onChange={(e) => setPromptForm({ ...promptForm, content: e.target.value })}
                    className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                    rows={4}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => {
                    setModalType(null)
                    setEditingPrompt(null)
                    setPromptForm({ name: '', category: '', content: '' })
                  }}
                  className="px-4 py-2 text-muted-foreground hover:text-foreground"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreatePrompt}
                  disabled={!promptForm.name || !promptForm.content}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {editingPrompt ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </div>
        )}

        {modalType === 'group' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                {editingGroup ? 'Editar Grupo' : 'Crear Nuevo Grupo'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre</label>
                  <input
                    type="text"
                    value={groupForm.name}
                    onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                    className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <textarea
                    value={groupForm.description}
                    onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                    className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Seleccionar Prompts</label>
                  <div className="max-h-32 overflow-y-auto border border-border rounded-lg p-2">
                    {prompts.map((prompt) => (
                      <label key={prompt.id} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={groupForm.promptIds.includes(prompt.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setGroupForm({ ...groupForm, promptIds: [...groupForm.promptIds, prompt.id] })
                            } else {
                              setGroupForm({ ...groupForm, promptIds: groupForm.promptIds.filter(id => id !== prompt.id) })
                            }
                          }}
                        />
                        <span>{prompt.name}</span>
                      </label>
                    ))}
                    {prompts.length === 0 && (
                      <p className="text-sm text-muted-foreground">No hay prompts disponibles</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => {
                    setModalType(null)
                    setEditingGroup(null)
                    setGroupForm({ name: '', description: '', promptIds: [] })
                  }}
                  className="px-4 py-2 text-muted-foreground hover:text-foreground"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateGroup}
                  disabled={!groupForm.name || groupForm.promptIds.length === 0}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {editingGroup ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </div>
        )}

        {modalType === 'chain' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                {editingChain ? 'Editar Cadena' : 'Crear Nueva Cadena'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre</label>
                  <input
                    type="text"
                    value={chainForm.name}
                    onChange={(e) => setChainForm({ ...chainForm, name: e.target.value })}
                    className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <textarea
                    value={chainForm.description}
                    onChange={(e) => setChainForm({ ...chainForm, description: e.target.value })}
                    className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Secuencia de Prompts</label>
                  <div className="space-y-2">
                    {chainForm.promptIds.map((promptId, index) => {
                      const prompt = prompts.find(p => p.id === promptId)
                      return (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <span>{index + 1}.</span>
                          <span className="flex-1">{prompt?.name || 'Prompt no encontrado'}</span>
                          <button
                            onClick={() => {
                              setChainForm({
                                ...chainForm,
                                promptIds: chainForm.promptIds.filter((_, i) => i !== index)
                              })
                            }}
                            className="text-destructive hover:text-destructive/80"
                          >
                            ×
                          </button>
                        </div>
                      )
                    })}
                    <select
                      onChange={(e) => {
                        if (e.target.value && !chainForm.promptIds.includes(e.target.value)) {
                          setChainForm({
                            ...chainForm,
                            promptIds: [...chainForm.promptIds, e.target.value]
                          })
                        }
                      }}
                      className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                    >
                      <option value="">Agregar prompt...</option>
                      {prompts.filter(p => !chainForm.promptIds.includes(p.id)).map((prompt) => (
                        <option key={prompt.id} value={prompt.id}>{prompt.name}</option>
                      ))}
                    </select>
                    {prompts.length === 0 && (
                      <p className="text-sm text-muted-foreground">No hay prompts disponibles</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => {
                    setModalType(null)
                    setEditingChain(null)
                    setChainForm({ name: '', description: '', promptIds: [] })
                  }}
                  className="px-4 py-2 text-muted-foreground hover:text-foreground"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateChain}
                  disabled={!chainForm.name || chainForm.promptIds.length === 0}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {editingChain ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        <VideoModal
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          videoId="k5OYlxYdIuA"
          title="Introducción a Red Creativa Pro"
        />
          </div>
        </MobileContainer>
      </MobileLayout>
    </ProtectedRoute>
  )
}

export default ChatIAPage