'use client'

import { useState } from 'react'
import { Settings, Plus, Trash2, Eye, EyeOff, Wand2, Copy, Check } from 'lucide-react'
import { PromptVariable, usePromptVariables } from '../hooks/usePromptVariables'

interface PromptVariablesProps {
  content: string
  onContentChange: (content: string) => void
  onVariablesChange?: (variables: Record<string, string>) => void
}

const PromptVariables = ({ content, onContentChange, onVariablesChange }: PromptVariablesProps) => {
  const {
    processedContent,
    detectedVariables,
    variableValues,
    variableDefinitions,
    updateVariableValue,
    defineVariable,
    removeVariable,
    validateVariables,
    getVariablesWithDefinitions,
    generateExample
  } = usePromptVariables(content)

  const [showVariables, setShowVariables] = useState(false)
  const [showProcessed, setShowProcessed] = useState(false)
  const [editingVariable, setEditingVariable] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Actualizar contenido cuando cambie
  const handleContentChange = (newContent: string) => {
    onContentChange(newContent)
  }

  // Notificar cambios en variables
  const handleVariableChange = (name: string, value: string) => {
    updateVariableValue(name, value)
    onVariablesChange?.({
      ...variableValues,
      [name]: value
    })
  }

  // Copiar contenido procesado
  const copyProcessedContent = async () => {
    try {
      await navigator.clipboard.writeText(processedContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error al copiar:', error)
    }
  }

  // Insertar variable en el cursor
  const insertVariable = (variableName: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newContent = content.substring(0, start) + `{{${variableName}}}` + content.substring(end)
      handleContentChange(newContent)
      
      // Restaurar posición del cursor
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + variableName.length + 4, start + variableName.length + 4)
      }, 0)
    }
  }

  const validation = validateVariables()

  return (
    <div className="space-y-4">
      {/* Header con controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Variables ({detectedVariables.length})
          </span>
          {detectedVariables.length > 0 && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              validation.isValid 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {validation.isValid ? 'Válidas' : `${validation.errors.length} errores`}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {detectedVariables.length > 0 && (
            <>
              <button
                onClick={generateExample}
                className="flex items-center space-x-1 px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
              >
                <Wand2 className="w-3 h-3" />
                <span>Ejemplo</span>
              </button>
              
              <button
                onClick={() => setShowProcessed(!showProcessed)}
                className={`flex items-center space-x-1 px-2 py-1 text-xs rounded transition-colors ${
                  showProcessed
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {showProcessed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>Vista previa</span>
              </button>
            </>
          )}
          
          <button
            onClick={() => setShowVariables(!showVariables)}
            className={`flex items-center space-x-1 px-2 py-1 text-xs rounded transition-colors ${
              showVariables
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Settings className="w-3 h-3" />
            <span>Configurar</span>
          </button>
        </div>
      </div>

      {/* Lista de variables detectadas */}
      {detectedVariables.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {detectedVariables.map((varName) => {
              const definition = variableDefinitions[varName]
              const value = variableValues[varName] || ''
              
              return (
                <div key={varName} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      &#123;&#123;{varName}&#125;&#125;
                      {definition?.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    <button
                      onClick={() => setEditingVariable(editingVariable === varName ? null : varName)}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      <Settings className="w-3 h-3" />
                    </button>
                  </div>
                  
                  {definition?.type === 'textarea' ? (
                    <textarea
                      value={value}
                      onChange={(e) => handleVariableChange(varName, e.target.value)}
                      placeholder={definition?.description || `Valor para ${varName}`}
                      className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      rows={2}
                    />
                  ) : definition?.type === 'select' ? (
                    <select
                      value={value}
                      onChange={(e) => handleVariableChange(varName, e.target.value)}
                      className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Seleccionar...</option>
                      {definition.options?.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={definition?.type === 'number' ? 'number' : 'text'}
                      value={value}
                      onChange={(e) => handleVariableChange(varName, e.target.value)}
                      placeholder={definition?.description || `Valor para ${varName}`}
                      className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  )}
                  
                  {definition?.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {definition.description}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Configuración avanzada de variables */}
      {showVariables && detectedVariables.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Configuración de Variables
          </h4>
          
          <div className="space-y-4">
            {detectedVariables.map((varName) => {
              const definition = variableDefinitions[varName] || { name: varName, value: '', type: 'text' as const }
              
              return (
                <div key={varName} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      &#123;&#123;{varName}&#125;&#125;
                    </span>
                    <button
                      onClick={() => removeVariable(varName)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tipo
                      </label>
                      <select
                        value={definition.type}
                        onChange={(e) => defineVariable(varName, { 
                          ...definition, 
                          type: e.target.value as PromptVariable['type'] 
                        })}
                        className="w-full p-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="text">Texto</option>
                        <option value="textarea">Texto largo</option>
                        <option value="number">Número</option>
                        <option value="select">Selección</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="flex items-center space-x-2 text-xs">
                        <input
                          type="checkbox"
                          checked={definition.required || false}
                          onChange={(e) => defineVariable(varName, { 
                            ...definition, 
                            required: e.target.checked 
                          })}
                          className="rounded"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Requerido</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Descripción
                    </label>
                    <input
                      type="text"
                      value={definition.description || ''}
                      onChange={(e) => defineVariable(varName, { 
                        ...definition, 
                        description: e.target.value 
                      })}
                      placeholder="Descripción de la variable"
                      className="w-full p-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  
                  {definition.type === 'select' && (
                    <div className="mt-2">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Opciones (separadas por coma)
                      </label>
                      <input
                        type="text"
                        value={definition.options?.join(', ') || ''}
                        onChange={(e) => defineVariable(varName, { 
                          ...definition, 
                          options: e.target.value.split(',').map(opt => opt.trim()).filter(Boolean)
                        })}
                        placeholder="Opción 1, Opción 2, Opción 3"
                        className="w-full p-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Vista previa del contenido procesado */}
      {showProcessed && detectedVariables.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              Vista Previa (con variables reemplazadas)
            </h4>
            <button
              onClick={copyProcessedContent}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded p-3 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
            {processedContent || 'El contenido aparecerá aquí cuando definas variables...'}
          </div>
          
          {!validation.isValid && (
            <div className="mt-2 text-xs text-red-600 dark:text-red-400">
              <strong>Errores:</strong>
              <ul className="list-disc list-inside mt-1">
                {validation.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Ayuda para usar variables */}
      {detectedVariables.length === 0 && (
        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            💡 Cómo usar variables
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Usa variables en tu prompt con la sintaxis <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">&#123;&#123;nombre_variable&#125;&#125;</code>
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <strong>Ejemplos:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li><code>Hola &#123;&#123;nombre&#125;&#125;, bienvenido a &#123;&#123;empresa&#125;&#125;</code></li>
              <li><code>Escribe un artículo sobre &#123;&#123;tema&#125;&#125; en &#123;&#123;idioma&#125;&#125;</code></li>
              <li><code>Genera código &#123;&#123;lenguaje&#125;&#125; para &#123;&#123;funcionalidad&#125;&#125;</code></li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default PromptVariables
