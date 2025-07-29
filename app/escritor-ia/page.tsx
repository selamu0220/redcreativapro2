'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import ProtectedRoute from '../components/ProtectedRoute'
import { useAuth } from '../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'

function EscritorIAPage() {
  const { user, logout } = useAuth();
  const { 
    userData, 
    usageLimits, 
    canImproveText, 
    getRemainingImprovements, 
    getUsagePercentage, 
    trackUsage, 
    getTrialDaysRemaining 
  } = useSubscription();
  const [content, setContent] = useState('')
  
  const [isImproving, setIsImproving] = useState(false)
  const [savedPrompts, setSavedPrompts] = useState<string[]>([])  
  const [customPrompt, setCustomPrompt] = useState('')
  const [selectedPrompt, setSelectedPrompt] = useState('')
  const [delay, setDelay] = useState(1000)
  const [wordCount, setWordCount] = useState(0)
  const [readingTime, setReadingTime] = useState(0)
  const [autoImprove, setAutoImprove] = useState(true)
  const [preserveFormatting, setPreserveFormatting] = useState(true)
  const [transformationLevel, setTransformationLevel] = useState(50) // 0-100
  const [tone, setTone] = useState('neutral')
  const [style, setStyle] = useState('standard')
  const [targetLength, setTargetLength] = useState('same')
  const [complexity, setComplexity] = useState('medium')
  const [creativity, setCreativity] = useState(50) // 0-100
  const [isTyping, setIsTyping] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [selectionStart, setSelectionStart] = useState(0)
  const [selectionEnd, setSelectionEnd] = useState(0)
  const [showSmokeAnimation, setShowSmokeAnimation] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const predefinedPrompts = [
    'Mejora la redacción y gramática de este texto',
    'Haz este texto más profesional y formal',
    'Simplifica este texto para que sea más fácil de entender',
    'Añade más detalles y ejemplos a este contenido',
    'Convierte este texto en un formato más persuasivo',
    'Adapta este contenido para redes sociales',
    'Crea un resumen ejecutivo de este texto',
    'Transforma este contenido en un formato de blog'
  ]

  useEffect(() => {
    const saved = localStorage.getItem('savedPrompts')
    if (saved) {
      setSavedPrompts(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0).length
    setWordCount(words)
    setReadingTime(Math.ceil(words / 200)) // Promedio de 200 palabras por minuto
  }, [content])

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    setIsTyping(true)
    
    // Clear existing timers
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current)
    }
    
    // Set typing to false after 1 second of no typing
    typingTimerRef.current = setTimeout(() => {
      setIsTyping(false)
      
      // Only auto-improve if not typing and conditions are met
      if (autoImprove && (selectedPrompt || customPrompt) && e.target.value.trim()) {
        timerRef.current = setTimeout(() => {
          improveContent(true)
        }, 1000) // 1 second delay after stopping typing
      }
    }, 1000)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (autoImprove && e.key === ' ' && (selectedPrompt || customPrompt) && content.trim() && !isTyping) {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      // Small delay to avoid interrupting typing flow
      setTimeout(() => {
        if (!isTyping) {
          improveContent(true)
        }
      }, 500)
    }
  }

  const handleTextSelection = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart
      const end = textareaRef.current.selectionEnd
      const selected = content.substring(start, end)
      
      if (selected.length > 0) {
        setSelectedText(selected)
        setSelectionStart(start)
        setSelectionEnd(end)
      } else {
        setSelectedText('')
      }
    }
  }

  const improveSelectedText = async () => {
    if (!selectedText.trim() || !textareaRef.current) return
    
    if (!selectedPrompt && !customPrompt) {
      alert('Por favor, selecciona o escribe un prompt')
      return
    }

    // Check and track usage
    const canProceed = await trackUsage('escritorIA');
    if (!canProceed) {
      return;
    }

    setIsImproving(true)
    setShowSmokeAnimation(true)
    
    try {
      const apiKey = localStorage.getItem('gemini_api_key')
      let model = 'gemini-1.5-flash'
      const temperature = localStorage.getItem('gemini_temperature') || '0.7'
      const maxTokens = localStorage.getItem('gemini_max_tokens') || '1000'

      if (!apiKey) {
        alert('Por favor configura tu API Key de Gemini en la página de Ajustes.')
        return
      }

      let basePrompt = selectedPrompt || customPrompt || 'Mejora este texto'
      const enhancedPrompt = getTransformationPrompt(basePrompt, transformationLevel)
      
      const toneInstruction = tone !== 'neutral' ? ` Usa un tono ${tone}.` : ''
      const styleInstruction = style !== 'standard' ? ` Aplica un estilo ${style}.` : ''
      const lengthInstruction = targetLength === 'shorter' ? ' Hazlo más conciso.' :
                               targetLength === 'longer' ? ' Expande el contenido con más detalles.' : ''
      const complexityInstruction = complexity === 'simple' ? ' Usa lenguaje simple y claro.' :
                                   complexity === 'complex' ? ' Usa vocabulario avanzado y estructuras complejas.' : ''
      
      const finalPrompt = `${enhancedPrompt}${toneInstruction}${styleInstruction}${lengthInstruction}${complexityInstruction} Devuelve SOLO el texto mejorado, sin explicaciones.`
      
      const response = await fetch('/api/improve-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'x-model': model,
          'x-temperature': (creativity / 100).toString(),
          'x-max-tokens': maxTokens
        },
        body: JSON.stringify({
          content: selectedText,
          prompt: finalPrompt
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al mejorar el contenido')
      }

      const data = await response.json()
      
      // Replace selected text with improved version
      const newContent = content.substring(0, selectionStart) + data.improvedContent + content.substring(selectionEnd)
      
      // Animate the change
      setTimeout(() => {
        setContent(newContent)
        setShowSmokeAnimation(false)
        setSelectedText('')
      }, 1000)
      
    } catch (error) {
      console.error('Error:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setShowSmokeAnimation(false)
    } finally {
      setIsImproving(false)
    }
  }

  const getTransformationPrompt = (basePrompt: string, level: number) => {
    const intensityMap = {
      1: 'Haz cambios muy sutiles y mínimos',
      2: 'Haz cambios ligeros',
      3: 'Haz cambios moderados',
      4: 'Haz cambios considerables',
      5: 'Haz cambios equilibrados',
      6: 'Haz cambios significativos',
      7: 'Haz cambios sustanciales',
      8: 'Haz cambios extensos',
      9: 'Haz cambios profundos',
      10: 'Transforma completamente el texto'
    }
    
    const transformationLevel = Math.ceil(level / 10)
    const formatInstruction = preserveFormatting ? ' Mantén el formato original del texto.' : ' Puedes cambiar el formato si es necesario.'
    
    return `${intensityMap[transformationLevel as keyof typeof intensityMap]}. ${basePrompt}${formatInstruction}`
  }

  const improveContent = async (isAuto = false) => {
    if (!content.trim()) return
    
    if (!selectedPrompt && !customPrompt) {
      alert('Por favor, selecciona o escribe un prompt')
      return
    }

    // Check and track usage
    const canProceed = await trackUsage('escritorIA');
    if (!canProceed) {
      return;
    }

    // Obtener configuración de API del localStorage
    const apiKey = localStorage.getItem('gemini_api_key')
    let model;
    if (delay === 1000) {
      model = 'gemini-1.5-flash';
    } else if (delay === 2000) {
      model = 'gemini-pro';
    } else {
      model = 'gemini-1.5-pro';
    }
    const temperature = localStorage.getItem('gemini_temperature') || '0.7'
    const maxTokens = localStorage.getItem('gemini_max_tokens') || '1000'

    if (!apiKey) {
      alert('Por favor configura tu API Key de Gemini en la página de Ajustes.')
      return
    }

    setIsImproving(true)
    try {
      // Construir prompt avanzado basado en configuraciones
      let basePrompt = selectedPrompt || customPrompt || 'Mejora este texto'
      
      // Usar el nuevo sistema de transformación
      const enhancedPrompt = getTransformationPrompt(basePrompt, transformationLevel)
      
      // Agregar configuraciones adicionales al prompt
      const toneInstruction = tone !== 'neutral' ? ` Usa un tono ${tone}.` : ''
      const styleInstruction = style !== 'standard' ? ` Aplica un estilo ${style}.` : ''
      const lengthInstruction = targetLength === 'shorter' ? ' Hazlo más conciso.' :
                               targetLength === 'longer' ? ' Expande el contenido con más detalles.' : ''
      const complexityInstruction = complexity === 'simple' ? ' Usa lenguaje simple y claro.' :
                                   complexity === 'complex' ? ' Usa vocabulario avanzado y estructuras complejas.' : ''
      
      const finalPrompt = `${enhancedPrompt}${toneInstruction}${styleInstruction}${lengthInstruction}${complexityInstruction} Devuelve SOLO el texto mejorado, sin explicaciones.`
      
      const response = await fetch('/api/improve-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'x-model': model,
          'x-temperature': (creativity / 100).toString(),
          'x-max-tokens': maxTokens
        },
        body: JSON.stringify({
          content,
          prompt: finalPrompt
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al mejorar el contenido')
      }

      const data = await response.json()
      setContent(data.improvedContent)
    } catch (error) {
      console.error('Error:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsImproving(false)
    }
  }

  const savePrompt = () => {
    if (customPrompt.trim() && !savedPrompts.includes(customPrompt)) {
      const newSavedPrompts = [...savedPrompts, customPrompt]
      setSavedPrompts(newSavedPrompts)
      localStorage.setItem('savedPrompts', JSON.stringify(newSavedPrompts))
      setCustomPrompt('')
    }
  }

  const deletePrompt = (promptToDelete: string) => {
    const newSavedPrompts = savedPrompts.filter(prompt => prompt !== promptToDelete)
    setSavedPrompts(newSavedPrompts)
    localStorage.setItem('savedPrompts', JSON.stringify(newSavedPrompts))
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content)
      alert('Texto copiado al portapapeles')
    } catch (error) {
      console.error('Error al copiar:', error)
      alert('Error al copiar el texto')
    }
  }

  const downloadAsText = () => {
    const element = document.createElement('a')
    const file = new Blob([content], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = 'texto-mejorado.txt'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const clearContent = () => {
    if (content.length > 0 && !confirm('¿Estás seguro de que quieres limpiar todo el contenido?')) {
      return
    }
    setContent('')
  }

  

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
          <div className="container mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Link href="/" className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center shadow-sm">
                    <span className="text-white font-bold text-sm">RC</span>
                  </div>
                  <span className="text-lg font-semibold text-slate-900">Red Creativa Pro</span>
                </Link>
                <div className="h-5 w-px bg-slate-300"></div>
                <h1 className="text-lg font-medium text-slate-600">Escritor IA</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-slate-600">
                  <div className="font-medium">{user?.email}</div>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      {userData?.subscriptionStatus === 'free' ? 'Gratuito' : userData?.subscriptionStatus === 'trial' ? 'Prueba' : userData?.subscriptionStatus === 'pro' ? 'Pro' : 'Premium'}
                    </span>
                     {userData?.subscriptionStatus === 'free' && (
                       <span className="text-blue-600 font-medium">
                         {getRemainingImprovements()} restantes
                       </span>
                     )}
                     {userData?.subscriptionStatus === 'trial' && (
                       <span className="text-emerald-600 font-medium">
                         {getTrialDaysRemaining()} días
                       </span>
                     )}
                  </div>
                </div>
                {(userData?.subscriptionStatus === 'free' || userData?.subscriptionStatus === 'trial') && (
                  <Link 
                    href="/planes" 
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    Actualizar Plan
                  </Link>
                )}
                <button
                  type="button"
                  onClick={logout}
                  className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Salir
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Panel Principal */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="text-xl font-semibold text-slate-900">Editor de Contenido</h2>
                        <p className="text-sm text-slate-500 mt-1">Escribe o pega tu texto para mejorarlo con IA</p>
                      </div>
                      {selectedText && (
                        <div className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                          {selectedText.length} caracteres seleccionados
                        </div>
                      )}
                    </div>
                    {!content && (
                      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs">💡</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-blue-900 mb-2">Funciones Inteligentes</p>
                            <ul className="text-sm text-blue-700 space-y-1">
                              <li className="flex items-center space-x-2">
                                <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                                <span>Mejoras automáticas tras 1 segundo de inactividad</span>
                              </li>
                              <li className="flex items-center space-x-2">
                                <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                                <span>Presiona espacio para mejoras instantáneas</span>
                              </li>
                              <li className="flex items-center space-x-2">
                                <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                                <span>Selecciona texto para mejoras específicas</span>
                              </li>
                              <li className="flex items-center space-x-2">
                                <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                                <span>Animaciones suaves en cada cambio</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="relative">
                      <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={handleContentChange}
                        onKeyDown={handleKeyDown}
                        onSelect={handleTextSelection}
                        onMouseUp={handleTextSelection}
                        placeholder="Escribe o pega aquí el texto que quieres mejorar..."
                        className={`w-full h-80 p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none transition-all duration-300 text-base leading-relaxed ${
                          showSmokeAnimation ? 'opacity-70 blur-sm' : ''
                        }`}
                      />
                      {showSmokeAnimation && (
                        <div className="absolute inset-0 pointer-events-none rounded-lg overflow-hidden">
                          <div className="smoke-animation"></div>
                        </div>
                      )}
                      {selectedText && (
                        <div className="absolute top-3 right-3">
                          <button
                            type="button"
                            onClick={improveSelectedText}
                            disabled={isImproving}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors shadow-sm"
                          >
                            <span className="mr-1">✨</span>
                            Mejorar Selección
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-200">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-6 text-sm text-slate-500">
                          <div className="flex items-center space-x-1">
                            <span className="font-medium">{content.length.toLocaleString()}</span>
                            <span>caracteres</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="font-medium">{wordCount.toLocaleString()}</span>
                            <span>palabras</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="font-medium">{readingTime}</span>
                            <span>min lectura</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={copyToClipboard}
                            disabled={!content.trim()}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                          >
                            <span className="mr-1">📋</span>
                            Copiar
                          </button>
                          <button
                            type="button"
                            onClick={downloadAsText}
                            disabled={!content.trim()}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                          >
                            <span className="mr-1">💾</span>
                            Descargar
                          </button>
                          <button
                            type="button"
                            onClick={clearContent}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <span className="mr-1">🗑️</span>
                            Limpiar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel de Control */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Configuración de IA</h3>
                    
                    {/* Prompts predefinidos */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Instrucciones Predefinidas
                      </label>
                      <select
                        value={selectedPrompt}
                        onChange={(e) => setSelectedPrompt(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-colors"
                      >
                        <option value="" className="text-slate-400">Selecciona una instrucción...</option>
                        {predefinedPrompts.map((prompt, index) => (
                          <option key={index} value={prompt} className="text-slate-900">{prompt}</option>
                        ))}
                      </select>
                    </div>

                {/* Configuraciones Avanzadas */}
                <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <h4 className="text-sm font-semibold mb-4 text-slate-900">🛠️ Herramientas de Configuración</h4>
                  
                  {/* Nivel de Transformación */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nivel de Transformación: {transformationLevel}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={transformationLevel}
                      onChange={(e) => setTransformationLevel(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>Mínimo</span>
                      <span>Moderado</span>
                      <span>Máximo</span>
                    </div>
                  </div>

                  {/* Creatividad */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Creatividad: {creativity}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={creativity}
                      onChange={(e) => setCreativity(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>Conservador</span>
                      <span>Balanceado</span>
                      <span>Creativo</span>
                    </div>
                  </div>

                  {/* Tono */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tono
                    </label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white text-slate-900"
                    >
                      <option value="neutral">Neutral</option>
                      <option value="formal">Formal</option>
                      <option value="informal">Informal</option>
                      <option value="profesional">Profesional</option>
                      <option value="amigable">Amigable</option>
                      <option value="persuasivo">Persuasivo</option>
                      <option value="académico">Académico</option>
                      <option value="conversacional">Conversacional</option>
                    </select>
                  </div>

                  {/* Estilo */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Estilo
                    </label>
                    <select
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white text-slate-900"
                    >
                      <option value="standard">Estándar</option>
                      <option value="narrativo">Narrativo</option>
                      <option value="descriptivo">Descriptivo</option>
                      <option value="argumentativo">Argumentativo</option>
                      <option value="expositivo">Expositivo</option>
                      <option value="periodístico">Periodístico</option>
                      <option value="literario">Literario</option>
                      <option value="técnico">Técnico</option>
                    </select>
                  </div>

                  {/* Longitud Objetivo */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Longitud Objetivo
                    </label>
                    <select
                      value={targetLength}
                      onChange={(e) => setTargetLength(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white text-slate-900"
                    >
                      <option value="shorter">Más Corto</option>
                      <option value="same">Mantener Longitud</option>
                      <option value="longer">Más Largo</option>
                    </select>
                  </div>

                  {/* Complejidad */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Complejidad del Lenguaje
                    </label>
                    <select
                      value={complexity}
                      onChange={(e) => setComplexity(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white text-slate-900"
                    >
                      <option value="simple">Simple</option>
                      <option value="medium">Medio</option>
                      <option value="complex">Complejo</option>
                    </select>
                  </div>

                  {/* Mejora automática */}
                  <div className="mb-4 flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700">
                      Mejora Automática
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoImprove}
                        onChange={(e) => setAutoImprove(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                    </label>
                  </div>

                  {autoImprove && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Velocidad de mejora automática
                      </label>
                      <select
                        value={delay / 1000}
                        onChange={(e) => setDelay(Number(e.target.value) * 1000)}
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white text-slate-900"
                      >
                        <option value={1}>1 segundo (Rápido)</option>
                        <option value={2}>2 segundos (Medio)</option>
                        <option value={3}>3 segundos (Detallado)</option>
                        <option value={5}>5 segundos (Muy detallado)</option>
                      </select>
                    </div>
                  )}

                  {/* Preservar formato */}
                  <div className="mb-4 flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700">
                      Preservar Formato Original
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preserveFormatting}
                        onChange={(e) => setPreserveFormatting(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                    </label>
                  </div>
                </div>

                {/* Prompt personalizado */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Instrucciones Personalizadas
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Escribe tu instrucción personalizada..."
                      className="flex-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white text-slate-900 placeholder-slate-400"
                    />
                    <button
                      onClick={savePrompt}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors"
                    >
                      Guardar
                    </button>
                  </div>
                </div>

                {/* Prompts guardados */}
                {savedPrompts.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Instrucciones Guardadas
                    </label>
                    <div className="space-y-2">
                      {savedPrompts.map((prompt, index) => (
                        <div key={index} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <button
                            onClick={() => setSelectedPrompt(prompt)}
                            className="flex-1 text-left text-sm text-slate-700 hover:text-slate-900 font-medium transition-colors"
                          >
                            {prompt}
                          </button>
                          <button
                            onClick={() => deletePrompt(prompt)}
                            className="text-red-500 hover:text-red-700 ml-2 p-1 rounded transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => improveContent()}
                  disabled={!content.trim() || isImproving}
                  className="w-full bg-slate-900 text-white py-3 px-4 rounded-lg hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
                >
                  {isImproving ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></div>
                      <span>Mejorando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>✨</span>
                      <span>Mejorar Contenido</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Estilos CSS para la animación de humo */}
      <style jsx>{`
        .smoke-animation {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            45deg,
            rgba(255, 255, 255, 0.1) 0%,
            rgba(200, 200, 255, 0.3) 25%,
            rgba(150, 150, 255, 0.4) 50%,
            rgba(200, 200, 255, 0.3) 75%,
            rgba(255, 255, 255, 0.1) 100%
          );
          background-size: 200% 200%;
          animation: smokeReveal 2s ease-in-out;
          border-radius: 8px;
          pointer-events: none;
        }
        
        @keyframes smokeReveal {
          0% {
            background-position: 0% 0%;
            opacity: 0;
          }
          25% {
            background-position: 100% 100%;
            opacity: 0.8;
          }
          50% {
            background-position: 200% 0%;
            opacity: 1;
          }
          75% {
            background-position: 100% 200%;
            opacity: 0.6;
          }
          100% {
            background-position: 0% 100%;
            opacity: 0;
          }
        }
        
        .smoke-animation::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(
            circle at 30% 30%,
            rgba(255, 255, 255, 0.4) 0%,
            transparent 50%
          ),
          radial-gradient(
            circle at 70% 70%,
            rgba(200, 200, 255, 0.3) 0%,
            transparent 50%
          ),
          radial-gradient(
            circle at 50% 20%,
            rgba(150, 150, 255, 0.2) 0%,
            transparent 40%
          );
          animation: smokeParticles 2s ease-in-out;
          border-radius: 8px;
        }
        
        @keyframes smokeParticles {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          25% {
            transform: scale(0.5) rotate(90deg);
            opacity: 0.6;
          }
          50% {
            transform: scale(1) rotate(180deg);
            opacity: 1;
          }
          75% {
            transform: scale(1.2) rotate(270deg);
            opacity: 0.4;
          }
          100% {
            transform: scale(0.8) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
      </div>
    </ProtectedRoute>
  )
}

export default EscritorIAPage