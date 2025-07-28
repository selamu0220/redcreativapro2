'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import ProtectedRoute from '../components/ProtectedRoute'
import { useAuth } from '../hooks/useAuth'

function EscritorIAPage() {
  const { user, logout } = useAuth();
  const [content, setContent] = useState('')
  
  const [isImproving, setIsImproving] = useState(false)
  const [savedPrompts, setSavedPrompts] = useState<string[]>([])
  const [customPrompt, setCustomPrompt] = useState('')
  const [selectedPrompt, setSelectedPrompt] = useState('')
  const [delay, setDelay] = useState(1000)
  const timerRef = useRef(null)

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

  const handleContentChange = (e) => {
    setContent(e.target.value)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    timerRef.current = setTimeout(() => {
      if (selectedPrompt && content.trim()) {
        improveContent()
      }
    }, delay)
  }

  const handleKeyDown = (e) => {
    if (e.key === ' ' && selectedPrompt && content.trim()) {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      improveContent()
    }
  }

  const improveContent = async (isAuto = false) => {
    if (!content.trim()) return

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
      const prompt = selectedPrompt || customPrompt || 'Mejora este texto'
      const response = await fetch('/api/improve-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'x-model': model,
          'x-temperature': temperature,
          'x-max-tokens': maxTokens
        },
        body: JSON.stringify({
          content,
          prompt
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
      alert(`Error: ${error.message}`)
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
          <div className="grid grid-cols-1 gap-8">
            {/* Panel de entrada */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Contenido Original</h2>
                <textarea
                  value={content}
                  onChange={handleContentChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe o pega aquí el texto que quieres mejorar..."
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {content.length} caracteres
                  </span>
                  <button
                    onClick={() => setContent('')}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Limpiar
                  </button>
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

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Velocidad de mejora automática (segundos)
                  </label>
                  <select
                    value={delay / 1000}
                    onChange={(e) => setDelay(Number(e.target.value) * 1000)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>1 segundo</option>
                    <option value={2}>2 segundos</option>
                    <option value={3}>3 segundos</option>
                  </select>
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
                  onClick={improveContent}
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
    </ProtectedRoute>
  )
}

export default EscritorIAPage