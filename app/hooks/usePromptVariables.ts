'use client'

import { useState, useCallback, useMemo } from 'react'

export interface PromptVariable {
  name: string
  value: string
  description?: string
  type: 'text' | 'number' | 'select' | 'textarea'
  options?: string[] // Para tipo 'select'
  required?: boolean
}

export interface ParsedPrompt {
  content: string
  variables: PromptVariable[]
}

/**
 * Hook para manejar variables en prompts
 * Detecta variables en formato {{variable}} y permite su gestión
 */
export const usePromptVariables = (initialContent: string = '') => {
  const [content, setContent] = useState(initialContent)
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})
  const [variableDefinitions, setVariableDefinitions] = useState<Record<string, PromptVariable>>({})

  // Extraer variables del contenido del prompt
  const extractVariables = useCallback((text: string): string[] => {
    const regex = /\{\{([^}]+)\}\}/g
    const matches = []
    let match
    
    while ((match = regex.exec(text)) !== null) {
      matches.push(match[1].trim())
    }
    
    return [...new Set(matches)] // Eliminar duplicados
  }, [])

  // Variables detectadas en el contenido actual
  const detectedVariables = useMemo(() => {
    return extractVariables(content)
  }, [content, extractVariables])

  // Procesar el prompt reemplazando variables con sus valores
  const processedContent = useMemo(() => {
    let processed = content
    
    detectedVariables.forEach(varName => {
      const value = variableValues[varName] || `{{${varName}}}`
      const regex = new RegExp(`\\{\\{\\s*${varName}\\s*\\}\\}`, 'g')
      processed = processed.replace(regex, value)
    })
    
    return processed
  }, [content, detectedVariables, variableValues])

  // Actualizar valor de una variable
  const updateVariableValue = useCallback((name: string, value: string) => {
    setVariableValues(prev => ({
      ...prev,
      [name]: value
    }))
  }, [])

  // Definir propiedades de una variable
  const defineVariable = useCallback((name: string, definition: Partial<PromptVariable>) => {
    setVariableDefinitions(prev => ({
      ...prev,
      [name]: {
        name,
        value: variableValues[name] || '',
        type: 'text',
        required: false,
        ...definition
      }
    }))
  }, [variableValues])

  // Eliminar una variable
  const removeVariable = useCallback((name: string) => {
    setVariableValues(prev => {
      const newValues = { ...prev }
      delete newValues[name]
      return newValues
    })
    
    setVariableDefinitions(prev => {
      const newDefs = { ...prev }
      delete newDefs[name]
      return newDefs
    })
  }, [])

  // Validar que todas las variables requeridas tengan valores
  const validateVariables = useCallback((): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    detectedVariables.forEach(varName => {
      const definition = variableDefinitions[varName]
      const value = variableValues[varName]
      
      if (definition?.required && (!value || value.trim() === '')) {
        errors.push(`La variable "${varName}" es requerida`)
      }
    })
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }, [detectedVariables, variableDefinitions, variableValues])

  // Obtener variables con sus definiciones completas
  const getVariablesWithDefinitions = useCallback((): PromptVariable[] => {
    return detectedVariables.map(varName => {
      const definition = variableDefinitions[varName]
      return {
        name: varName, // Ensure name is always the detected variable name
        value: variableValues[varName] || '',
        type: definition?.type || 'text',
        required: definition?.required || false,
        description: definition?.description,
        options: definition?.options
      }
    })
  }, [detectedVariables, variableDefinitions, variableValues])

  // Exportar configuración de variables
  const exportVariableConfig = useCallback(() => {
    return {
      definitions: variableDefinitions,
      values: variableValues
    }
  }, [variableDefinitions, variableValues])

  // Importar configuración de variables
  const importVariableConfig = useCallback((config: {
    definitions?: Record<string, PromptVariable>
    values?: Record<string, string>
  }) => {
    if (config.definitions) {
      setVariableDefinitions(config.definitions)
    }
    if (config.values) {
      setVariableValues(config.values)
    }
  }, [])

  // Generar prompt de ejemplo con variables
  const generateExample = useCallback(() => {
    const examples = {
      'nombre': 'Juan Pérez',
      'empresa': 'TechCorp',
      'producto': 'Software de gestión',
      'fecha': new Date().toLocaleDateString(),
      'tema': 'Inteligencia Artificial',
      'idioma': 'español',
      'tono': 'profesional',
      'audiencia': 'desarrolladores'
    }
    
    const newValues: Record<string, string> = {}
    detectedVariables.forEach(varName => {
      const lowerName = varName.toLowerCase()
      newValues[varName] = examples[lowerName as keyof typeof examples] || `Ejemplo ${varName}`
    })
    
    setVariableValues(prev => ({ ...prev, ...newValues }))
  }, [detectedVariables])

  return {
    content,
    setContent,
    processedContent,
    detectedVariables,
    variableValues,
    variableDefinitions,
    // Aliases for backward compatibility
    variables: detectedVariables,
    definitions: variableDefinitions,
    updateDefinitions: setVariableDefinitions,
    updateVariableValue,
    defineVariable,
    removeVariable,
    validateVariables,
    getVariablesWithDefinitions,
    exportVariableConfig,
    importVariableConfig,
    generateExample
  }
}

export default usePromptVariables