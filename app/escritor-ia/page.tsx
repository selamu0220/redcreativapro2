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
                <h1 className="text-lg font-semibold text-gray-900">Escritor IA</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  <div>{user?.email}</div>
                  <div className="text-xs">
                    Plan: {userData?.subscriptionStatus === 'free' ? 'Gratuito' : userData?.subscriptionStatus === 'trial' ? 'Prueba' : userData?.subscriptionStatus === 'pro' ? 'Pro' : 'Premium'}
                     {userData?.subscriptionStatus === 'free' && (
                       <span className="ml-2 text-blue-600">
                         ({getRemainingImprovements()} mejoras restantes)
                       </span>
                     )}
                     {userData?.subscriptionStatus === 'trial' && (
                       <span className="ml-2 text-green-600">
                         (Prueba: {getTrialDaysRemaining()} días restantes)
                       </span>
                     )}
                  </div>
                </div>
                {(userData?.subscriptionStatus === 'free' || userData?.subscriptionStatus === 'trial') && (
                  <Link 
                    href="/planes" 
                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Actualizar
                  </Link>
                )}
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
          <div className="grid grid-cols-1 gap-8">
            {/* Panel de entrada */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Contenido Original</h2>
                    {selectedText && (
                      <div className="text-sm text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                        📝 {selectedText.length} caracteres seleccionados
                      </div>
                    )}
                  </div>
                  {!content && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700">
                        💡 <strong>Nuevas funciones:</strong>
                      </p>
                      <ul className="text-xs text-blue-600 mt-1 space-y-1">
                        <li>• Los cambios automáticos solo ocurren 1 segundo después de dejar de escribir</li>
                        <li>• Presiona espacio para activar mejoras instantáneas</li>
                        <li>• Selecciona texto para mejorarlo específicamente con ✨</li>
                        <li>• Disfruta de la animación de humo en los cambios</li>
                      </ul>
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
                    className={`w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-300 ${
                      showSmokeAnimation ? 'opacity-70 blur-sm' : ''
                    }`}
                  />
                  {showSmokeAnimation && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="smoke-animation"></div>
                    </div>
                  )}
                  {selectedText && (
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={improveSelectedText}
                        disabled={isImproving}
                        className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg"
                      >
                        ✨ Mejorar Selección
                      </button>
                    </div>
                  )}
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div className="flex space-x-4">
                      <span>{content.length} caracteres</span>
                      <span>{wordCount} palabras</span>
                      <span>{readingTime} min lectura</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={copyToClipboard}
                        disabled={!content.trim()}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        📋 Copiar
                      </button>
                      <button
                        onClick={downloadAsText}
                        disabled={!content.trim()}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        💾 Descargar
                      </button>
                      <button
                        onClick={clearContent}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        🗑️ Limpiar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prompts */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Instrucciones de Mejora</h3>
                
                {/* Prompts predefinidos */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prompts Predefinidos
                  </label>
                  <select
                    value={selectedPrompt}
                    onChange={(e) => setSelectedPrompt(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecciona un prompt...</option>
                    {predefinedPrompts.map((prompt, index) => (
                      <option key={index} value={prompt}>{prompt}</option>
                    ))}
                  </select>
                </div>

                {/* Configuraciones Avanzadas */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-md font-semibold mb-4 text-gray-800">🛠️ Herramientas de Configuración</h4>
                  
                  {/* Nivel de Transformación */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nivel de Transformación: {transformationLevel}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={transformationLevel}
                      onChange={(e) => setTransformationLevel(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Mínimo</span>
                      <span>Moderado</span>
                      <span>Máximo</span>
                    </div>
                  </div>

                  {/* Creatividad */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Creatividad: {creativity}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={creativity}
                      onChange={(e) => setCreativity(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Conservador</span>
                      <span>Balanceado</span>
                      <span>Creativo</span>
                    </div>
                  </div>

                  {/* Tono */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tono
                    </label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estilo
                    </label>
                    <select
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitud Objetivo
                    </label>
                    <select
                      value={targetLength}
                      onChange={(e) => setTargetLength(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="shorter">Más Corto</option>
                      <option value="same">Mantener Longitud</option>
                      <option value="longer">Más Largo</option>
                    </select>
                  </div>

                  {/* Complejidad */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Complejidad del Lenguaje
                    </label>
                    <select
                      value={complexity}
                      onChange={(e) => setComplexity(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="simple">Simple</option>
                      <option value="medium">Medio</option>
                      <option value="complex">Complejo</option>
                    </select>
                  </div>

                  {/* Mejora automática */}
                  <div className="mb-4 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Mejora Automática
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoImprove}
                        onChange={(e) => setAutoImprove(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {autoImprove && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Velocidad de mejora automática
                      </label>
                      <select
                        value={delay / 1000}
                        onChange={(e) => setDelay(Number(e.target.value) * 1000)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
                    <label className="text-sm font-medium text-gray-700">
                      Preservar Formato Original
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preserveFormatting}
                        onChange={(e) => setPreserveFormatting(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                {/* Prompt personalizado */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prompt Personalizado
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Escribe tu instrucción personalizada..."
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={savePrompt}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Guardar
                    </button>
                  </div>
                </div>

                {/* Prompts guardados */}
                {savedPrompts.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prompts Guardados
                    </label>
                    <div className="space-y-2">
                      {savedPrompts.map((prompt, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <button
                            onClick={() => setSelectedPrompt(prompt)}
                            className="flex-1 text-left text-sm text-gray-700 hover:text-blue-600"
                          >
                            {prompt}
                          </button>
                          <button
                            onClick={() => deletePrompt(prompt)}
                            className="text-red-500 hover:text-red-700 ml-2"
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
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
                >
                  {isImproving ? 'Mejorando...' : 'Mejorar Contenido'}
                </button>
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
    </ProtectedRoute>
  )
}

export default EscritorIAPage