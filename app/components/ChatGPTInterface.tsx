'use client'

import React, { useState, useRef, useEffect, lazy, Suspense, memo, useCallback, useMemo } from 'react'
import { Send, Copy, ThumbsUp, ThumbsDown, RotateCcw, User, Bot, Loader2, Sparkles, Plus, Save, BookOpen, Zap, Star, Settings, X, Eye, EyeOff, Check, MessageSquare } from 'lucide-react'
import { Button } from './ui/button'
import { toast } from 'sonner'
import VariableInput, { replaceVariables, validateVariables } from './VariableInput'
import { useToast } from './ToastProvider'
import { useConversations } from '../hooks/useConversations'
import { useAuth } from '../hooks/useAuth'
// import { useNotificationHelpers } from './NotificationSystem' // Temporalmente deshabilitado
import { useOpenRouterSync } from '../hooks/useOpenRouterSync'
import { ConversationMessage } from '../hooks/useConversations'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

// Lazy load SyntaxHighlighter for better performance
const SyntaxHighlighter = lazy(() => 
  import('react-syntax-highlighter/dist/esm/languages/prism/javascript').then(() =>
    import('react-syntax-highlighter').then(module => ({
      default: module.Prism
    }))
  ).catch(() => ({
    default: ({ children }: { children: string }) => <pre><code>{children}</code></pre>
  }))
)


// Function to extract first two syllables from email
function getFirstTwoSyllables(email: string): string {
  if (!email) return 'Usuario'
  
  const localPart = email.split('@')[0]
  const vowels = 'aeiouAEIOU'
  let syllables = []
  let currentSyllable = ''
  
  for (let i = 0; i < localPart.length; i++) {
    const char = localPart[i]
    currentSyllable += char
    
    // If we hit a vowel, we might have a syllable
    if (vowels.includes(char)) {
      // Look ahead to see if there's a consonant cluster
      let j = i + 1
      while (j < localPart.length && !vowels.includes(localPart[j])) {
        j++
      }
      
      // Add consonants to current syllable (but not all if there's a cluster)
      if (j > i + 1) {
        currentSyllable += localPart.substring(i + 1, j - 1)
        i = j - 2 // Will be incremented by the loop
      }
      
      syllables.push(currentSyllable)
      currentSyllable = ''
      
      if (syllables.length >= 2) break
    }
  }
  
  // If we didn't get enough syllables, add remaining characters
  if (currentSyllable && syllables.length < 2) {
    syllables.push(currentSyllable)
  }
  
  // If still not enough, just take first few characters
  if (syllables.length === 0) {
    return localPart.substring(0, Math.min(4, localPart.length))
  }
  
  return syllables.slice(0, 2).join('').toLowerCase()
}

interface ChatGPTInterfaceProps {
  onSendMessage: (message: string, conversationId?: string) => void
  isLoading?: boolean
  selectedItemId?: string
  selectedItemType?: 'prompt' | 'group' | 'chain'
  isTyping?: boolean
  selectedPromptContent?: string
  onCreatePrompt?: () => void
  onSavePrompt?: (content: string) => void
  onCreateGroup?: () => void
  onCreateChain?: () => void
  conversationId?: string
  messages?: ConversationMessage[]
  addMessage?: (conversationId: string, content: string, senderType: 'user' | 'assistant') => Promise<any>
  aiName?: string
  onAiNameChange?: (name: string) => void
}

// Format timestamp function
const formatTimestamp = (date: Date | string | null | undefined): string => {
  if (!date) return 'Ahora';
  
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(parsedDate.getTime())) {
    return 'Ahora';
  }
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - parsedDate.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Ahora';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `Hace ${minutes} min`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `Hace ${hours}h`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `Hace ${days}d`;
  } else {
    return parsedDate.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
};

// Enhanced typing indicator component
const TypingIndicator = () => (
  <div className="flex items-center space-x-2 p-4 animate-fade-in">
    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
      <Bot className="w-4 h-4 text-white" />
    </div>
    <div className="flex items-center space-x-2">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <span className="text-sm text-muted-foreground ml-2">IA escribiendo...</span>
    </div>
  </div>
)

// Loading state component
const LoadingIndicator = () => (
  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
    <Loader2 size={16} className="animate-spin" />
    <span>Procesando...</span>
  </div>
)

// Optimized code block component with lazy loading
const CodeBlock = memo(({ language, code, index }: { language: string; code: string; index: number }) => {
  return (
    <Suspense fallback={
      <div className="bg-gray-800 rounded-lg p-4 my-2">
        <div className="flex items-center space-x-2 text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Cargando código...</span>
        </div>
      </div>
    }>
      <SyntaxHighlighter
        key={index}
        language={language}
        style={oneDark}
        className="rounded-lg my-2"
        customStyle={{
          margin: '8px 0',
          borderRadius: '8px',
          fontSize: '14px'
        }}
      >
        {code}
      </SyntaxHighlighter>
    </Suspense>
  )
})

CodeBlock.displayName = 'CodeBlock'

// Optimized function to render message content with syntax highlighting
const renderMessageContent = (content: string) => {
  try {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push(
          <span key={lastIndex} className="whitespace-pre-wrap">
            {content.slice(lastIndex, match.index)}
          </span>
        )
      }

      // Add code block with lazy loading
      const language = match[1] || 'text'
      const code = match[2]
      parts.push(
        <CodeBlock
          key={match.index}
          language={language}
          code={code}
          index={match.index}
        />
      )

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(
        <span key={lastIndex} className="whitespace-pre-wrap">
          {content.slice(lastIndex)}
        </span>
      )
    }

    return parts.length > 0 ? parts : <span className="whitespace-pre-wrap">{content}</span>
  } catch (error) {
    console.error('Error rendering message content:', error)
    return <span className="whitespace-pre-wrap">{content}</span>
  }
}

const ChatGPTInterface = memo(function ChatGPTInterface({ 
  onSendMessage, 
  isLoading = false, 
  selectedItemId, 
  selectedItemType,
  isTyping = false,
  selectedPromptContent = '',
  onCreatePrompt,
  onSavePrompt,
  onCreateGroup,
  onCreateChain,
  conversationId,
  messages: propMessages,
  addMessage: propAddMessage,
  aiName = 'Asistente IA',
  onAiNameChange
}: ChatGPTInterfaceProps) {
  const { user } = useAuth()
  const { showToast } = useToast()
  // const { showSuccess, showError, showWarning, showInfo } = useNotificationHelpers() // Temporalmente deshabilitado
  const {
    conversations,
    currentConversation,
    messages: hookMessages,
    isLoading: conversationsLoading,
    createConversation: createAndSelectConversation,
    selectConversation,
    addMessage: hookAddMessage
  } = useConversations()
  
  // Use props if available, otherwise use hook values
  const messages = propMessages || hookMessages
  const addMessage = propAddMessage || hookAddMessage
  const {
    openRouterApiKey,
    openRouterModel,
    saveOpenRouterConfig,
    clearOpenRouterConfig
  } = useOpenRouterSync()
  const [inputValue, setInputValue] = useState('')
  const [messageLikes, setMessageLikes] = useState<Record<string, boolean>>({})
  const [messageDislikes, setMessageDislikes] = useState<Record<string, boolean>>({})
  const [variables, setVariables] = useState<{name: string, value: string}[]>([])
  const [showVariables, setShowVariables] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [showAiNameConfig, setShowAiNameConfig] = useState(false)
  const [tempAiName, setTempAiName] = useState(aiName)
  const [tempApiKey, setTempApiKey] = useState('')
  const [tempModel, setTempModel] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [isTestingApiKey, setIsTestingApiKey] = useState(false)
  const [apiKeyTestResult, setApiKeyTestResult] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  // Detectar variables en el prompt seleccionado
  useEffect(() => {
    if (selectedPromptContent) {
      const variableRegex = /\{\{([^}]+)\}\}/g
      const matches = selectedPromptContent.match(variableRegex)
      setShowVariables(!!matches && matches.length > 0)
      if (!matches) {
        setVariables([])
      }
    } else {
      setShowVariables(false)
      setVariables([])
    }
  }, [selectedPromptContent])

  // Inicializar valores temporales cuando se abre el modal
  useEffect(() => {
    if (showConfigModal) {
      setTempApiKey(openRouterApiKey)
      setTempModel(openRouterModel)
      setApiKeyTestResult(null)
    }
  }, [showConfigModal, openRouterApiKey, openRouterModel])

  // Funciones para manejar la configuración
  const handleOpenConfigModal = useCallback(() => {
    setShowConfigModal(true)
  }, [])

  const handleCloseConfigModal = useCallback(() => {
    setShowConfigModal(false)
    setShowApiKey(false)
    setApiKeyTestResult(null)
  }, [])

  const handleSaveConfig = useCallback(() => {
    if (!tempApiKey.trim()) {
      showToast({ title: 'API Key requerida', type: 'error' })
      return
    }
    saveOpenRouterConfig(tempApiKey, tempModel)
    showToast({ title: 'Configuración guardada exitosamente', type: 'success' })
    handleCloseConfigModal()
  }, [tempApiKey, tempModel, saveOpenRouterConfig, showToast, handleCloseConfigModal])

  const handleTestApiKey = async () => {
    if (!tempApiKey.trim()) {
      showToast({ title: 'API Key requerida', type: 'error' })
      return
    }

    setIsTestingApiKey(true)
    setApiKeyTestResult(null)

    try {
      const response = await fetch('/api/test-openrouter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: tempApiKey,
          model: tempModel
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setApiKeyTestResult('✅ API Key válida y funcionando correctamente')
      } else {
        setApiKeyTestResult(`❌ Error: ${data.error || 'API Key inválida'}`)
      }
    } catch (error) {
      console.error('Error testing OpenRouter API key:', error)
      setApiKeyTestResult('❌ Error de conexión al probar la API key')
    } finally {
      setIsTestingApiKey(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && !isLoading && !isTyping) {
      let messageToSend = inputValue.trim()
      
      try {
        // Si hay variables y un prompt seleccionado, reemplazar las variables
        if (showVariables && selectedPromptContent && variables.length > 0) {
          if (!validateVariables(variables)) {
            showToast({ title: 'Por favor completa todas las variables antes de enviar', type: 'error' })
            return
          }
          messageToSend = replaceVariables(selectedPromptContent, variables)
          showToast({ title: 'Variables reemplazadas correctamente', type: 'info' })
        }
        
        // Use conversationId from props or create new conversation
        let activeConversationId = conversationId || currentConversation?.id
        if (!activeConversationId && user) {
          showToast({ title: 'Iniciando nueva conversación...', type: 'info' })
          const newConversation = await createAndSelectConversation(
            messageToSend.length > 50 ? messageToSend.substring(0, 50) + '...' : messageToSend
          )
          activeConversationId = newConversation?.id
          if (activeConversationId) {
            showToast({ title: 'Nueva conversación iniciada exitosamente', type: 'success' })
          }
        }

        // Send message to parent component (handleSendMessage will add the user message)
        onSendMessage(messageToSend, activeConversationId)
        setInputValue('')
        setShowVariables(false)
        setVariables([])
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto'
        }
      } catch (error) {
        console.error('Error sending message:', error)
        showToast({ title: 'No se pudo enviar el mensaje', type: 'error' })
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      showToast({ title: 'Mensaje copiado al portapapeles', type: 'success' })
    } catch (err) {
      console.error('Error copying to clipboard:', err)
      showToast({ title: 'No se pudo copiar el mensaje', type: 'error' })
    }
  }, [showToast])

  const handleLike = useCallback((messageId: string) => {
    const wasLiked = messageLikes[messageId]
    setMessageLikes(prev => ({ ...prev, [messageId]: !prev[messageId] }))
    setMessageDislikes(prev => ({ ...prev, [messageId]: false }))
    
    if (!wasLiked) {
      showToast({ title: 'Tu feedback nos ayuda a mejorar', type: 'success' })
    }
  }, [messageLikes, showToast])

  const handleDislike = useCallback((messageId: string) => {
    const wasDisliked = messageDislikes[messageId]
    setMessageDislikes(prev => ({ ...prev, [messageId]: !prev[messageId] }))
    setMessageLikes(prev => ({ ...prev, [messageId]: false }))
    
    if (!wasDisliked) {
      showToast({ title: 'Trabajaremos en mejorar nuestras respuestas', type: 'warning' })
    }
  }, [messageDislikes, showToast])

  const handleRegenerate = useCallback(() => {
    if (messages.length > 0) {
      const lastUserMessage = [...messages].reverse().find(m => m.sender_type === 'user')
      if (lastUserMessage) {
        showToast({ title: 'Creando una nueva respuesta...', type: 'info' })
        onSendMessage(lastUserMessage.content)
      } else {
        showToast({ title: 'No hay mensajes para regenerar', type: 'warning' })
      }
    } else {
      showToast({ title: 'Envía un mensaje primero para poder regenerar', type: 'warning' })
    }
  }, [messages, showToast, onSendMessage])

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Chat con IA</h2>
            <p className="text-sm text-muted-foreground">Asistente inteligente para tus consultas</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAiNameConfig(true)}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors"
            title="Configurar nombre de la IA"
          >
            <MessageSquare size={16} />
            <span>IA</span>
          </button>
          
          <button
            onClick={handleOpenConfigModal}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors"
            title="Configurar OpenRouter"
          >
            <Settings size={16} />
            <span>Config</span>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles size={32} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">¡Hola! Soy tu asistente IA</h3>
              <p className="text-muted-foreground max-w-md">
                Estoy aquí para ayudarte con cualquier pregunta o tarea. ¿En qué puedo asistirte hoy?
              </p>
            </div>
            <div className="flex flex-wrap gap-2 max-w-md">
              <button className="px-3 py-2 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors">
                💡 Generar ideas
              </button>
              <button className="px-3 py-2 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors">
                📝 Escribir contenido
              </button>
              <button className="px-3 py-2 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors">
                🔍 Analizar datos
              </button>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const isUser = message.sender_type === 'user'
            const userName = 'Sela'
            const aiName = 'Chat'
            
            // Solo mostrar mensajes de la IA, ocultar mensajes del usuario
            if (isUser) {
              return null
            }
            
            return (
              <div key={message.id || index} className={`w-full mb-6 ${isUser ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block max-w-[75%] ${isUser ? 'ml-auto' : 'mr-auto'}`}>
                  <div className={`flex items-start ${isUser ? 'flex-row-reverse' : 'flex-row'} space-x-3`}>
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isUser 
                      ? 'bg-blue-500 text-white border-2 border-blue-600' 
                      : 'bg-gray-500 text-white border-2 border-gray-400'
                  }`}>
                    {isUser ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-white" />
                    )}
                  </div>
                  
                  {/* Message Content */}
                  <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    <div className={`rounded-2xl px-5 py-4 max-w-full shadow-md ${
                      isUser 
                        ? 'bg-primary text-primary-foreground border-2 border-primary/80' 
                        : 'bg-gray-700 text-white border-2 border-gray-600'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-xs font-semibold ${
                          isUser ? 'text-primary-foreground/80' : 'text-gray-300'
                        }`}>
                          {isUser ? userName : aiName}
                        </span>
                        <span className={`text-xs ${
                          isUser ? 'text-primary-foreground/60' : 'text-gray-400'
                        } ml-2`}>
                          {formatTimestamp(message.sent_at)}
                        </span>
                      </div>
                      <div className={`text-sm leading-relaxed ${
                        isUser ? 'text-white' : 'text-white'
                      }`}>
                        {renderMessageContent(message.content)}
                      </div>
                    </div>
                    
                    {/* Message Actions */}
                    {!isUser && (
                      <div className="flex items-center space-x-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => copyToClipboard(message.content)}
                          className="p-1 hover:bg-muted rounded transition-colors"
                          title="Copiar mensaje"
                        >
                          <Copy className="w-3 h-3 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleLike(message.id || index.toString())}
                          className={`p-1 hover:bg-muted rounded transition-colors ${
                            messageLikes[message.id || index.toString()] ? 'text-green-500' : 'text-muted-foreground'
                          }`}
                          title="Me gusta"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDislike(message.id || index.toString())}
                          className={`p-1 hover:bg-muted rounded transition-colors ${
                            messageDislikes[message.id || index.toString()] ? 'text-red-500' : 'text-muted-foreground'
                          }`}
                          title="No me gusta"
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
        
        {/* Typing Indicator */}
        {isTyping && <TypingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Variables Input */}
      {showVariables && (
        <div className="border-t border-border bg-card p-4">
          <VariableInput
            content={selectedPromptContent}
            onVariablesChange={setVariables}
            className="mb-0"
          />
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-border bg-card p-4">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                adjustTextareaHeight()
              }}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje aquí... (Ctrl+Enter para enviar)"
              className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-colors"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '200px' }}
              disabled={isLoading || isTyping}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={isLoading || isTyping}
                className="p-3 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Regenerar última respuesta"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            )}
            
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading || isTyping}
              className="p-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading || isTyping ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
        
        {/* Status */}
        {(isLoading || isTyping) && (
          <div className="mt-3 flex items-center justify-center">
            <LoadingIndicator />
          </div>
        )}
      </div>

      {/* Modal de Configuración */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-border rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Configuración OpenRouter</h3>
              <button
                onClick={handleCloseConfigModal}
                className="p-1 hover:bg-muted rounded-md transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* API Key */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  API Key de OpenRouter *
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder="sk-or-v1-..."
                    className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Obtén tu API key en{' '}
                  <a 
                    href="https://openrouter.ai/keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    OpenRouter Keys
                  </a>
                </p>
              </div>

              {/* Modelo */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Modelo de OpenRouter
                </label>
                <select
                  value={tempModel}
                  onChange={(e) => setTempModel(e.target.value)}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                >
                  <option value="openai/gpt-4o-mini">GPT-4o Mini (Rápido y Económico)</option>
                  <option value="openai/gpt-4o">GPT-4o (Avanzado)</option>
                  <option value="openai/gpt-3.5-turbo">GPT-3.5 Turbo (Estándar)</option>
                  <option value="anthropic/claude-3-haiku">Claude 3 Haiku (Rápido)</option>
                  <option value="anthropic/claude-3-sonnet">Claude 3 Sonnet (Balanceado)</option>
                  <option value="anthropic/claude-3-opus">Claude 3 Opus (Avanzado)</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  GPT-4o Mini es más económico, GPT-4o y Claude 3 Opus son más precisos
                </p>
              </div>

              {/* Resultado del test */}
              {apiKeyTestResult && (
                <div className={`p-3 rounded-md text-sm ${
                  apiKeyTestResult.includes('✅') 
                    ? 'bg-green-900/20 border border-green-800/50 text-green-300'
                    : 'bg-red-900/20 border border-red-800/50 text-red-300'
                }`}>
                  {apiKeyTestResult}
                </div>
              )}

              {/* Instrucciones */}
              <div className="bg-blue-900/20 border border-blue-800/50 rounded-md p-4">
                <h4 className="font-semibold text-blue-200 mb-2 text-sm">Instrucciones:</h4>
                <ol className="text-xs text-blue-300/80 space-y-1">
                  <li>1. Ve a OpenRouter.ai y crea una cuenta</li>
                  <li>2. Genera una nueva API key en la sección Keys</li>
                  <li>3. Copia la API key y pégala en el campo superior</li>
                  <li>4. Selecciona el modelo que prefieras usar</li>
                  <li>5. Prueba la configuración antes de guardar</li>
                </ol>
              </div>

              {/* Botones */}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  type="button"
                  onClick={handleTestApiKey}
                  disabled={isTestingApiKey || !tempApiKey.trim()}
                  className="flex items-center space-x-2"
                >
                  {isTestingApiKey ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Probando...</span>
                    </>
                  ) : (
                    <>
                      <span>🧪</span>
                      <span>Probar</span>
                    </>
                  )}
                </Button>
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  💾 Guardar
                </button>
                <button
                  type="button"
                  onClick={handleCloseConfigModal}
                  className="bg-muted border border-border text-muted-foreground px-4 py-2 rounded-md text-sm hover:bg-muted/80 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configuración del Nombre de la IA */}
      {showAiNameConfig && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-border rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Configurar Nombre de la IA</h3>
              <button
                onClick={() => setShowAiNameConfig(false)}
                className="p-1 hover:bg-muted rounded-md transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nombre personalizado para la IA
                </label>
                <input
                  type="text"
                  value={tempAiName}
                  onChange={(e) => setTempAiName(e.target.value)}
                  placeholder="Ej: Mi Asistente, ChatBot, etc."
                  className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  maxLength={20}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Este nombre aparecerá en los mensajes de la IA (máximo 20 caracteres)
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                   type="button"
                   onClick={() => {
                     if (onAiNameChange && tempAiName.trim()) {
                       onAiNameChange(tempAiName.trim())
                     }
                     setShowAiNameConfig(false)
                   }}
                   className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                 >
                   Guardar
                 </button>
                <button
                  type="button"
                  onClick={() => {
                    setTempAiName(aiName)
                    setShowAiNameConfig(false)
                  }}
                  className="bg-muted border border-border text-muted-foreground px-4 py-2 rounded-md text-sm hover:bg-muted/80 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

export default ChatGPTInterface;