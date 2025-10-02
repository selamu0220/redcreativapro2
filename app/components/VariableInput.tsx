'use client'

import React, { useState, useEffect } from 'react'
import { X, Variable } from 'lucide-react'

interface Variable {
  name: string
  value: string
}

interface VariableInputProps {
  content: string
  onVariablesChange: (variables: Variable[]) => void
  className?: string
}

export default function VariableInput({ content, onVariablesChange, className = '' }: VariableInputProps) {
  const [variables, setVariables] = useState<Variable[]>([])

  // Extraer variables del contenido
  useEffect(() => {
    const variableRegex = /\{\{([^}]+)\}\}/g
    const matches = content.match(variableRegex)
    
    if (matches) {
      const uniqueVariables = [...new Set(matches.map(match => match.slice(2, -2).trim()))]
      const newVariables = uniqueVariables.map(name => {
        const existing = variables.find(v => v.name === name)
        return {
          name,
          value: existing?.value || ''
        }
      })
      
      setVariables(newVariables)
      onVariablesChange(newVariables)
    } else {
      setVariables([])
      onVariablesChange([])
    }
  }, [content])

  const updateVariable = (name: string, value: string) => {
    const updatedVariables = variables.map(v => 
      v.name === name ? { ...v, value } : v
    )
    setVariables(updatedVariables)
    onVariablesChange(updatedVariables)
  }

  if (variables.length === 0) {
    return null
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <Variable className="w-4 h-4" />
        <span>Variables del Prompt</span>
      </div>
      
      <div className="space-y-2">
        {variables.map((variable) => (
          <div key={variable.name} className="space-y-1">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
              {variable.name}
            </label>
            <input
              type="text"
              value={variable.value}
              onChange={(e) => updateVariable(variable.name, e.target.value)}
              placeholder={`Valor para {{${variable.name}}}`}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        ))}
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Las variables se reemplazarán automáticamente al ejecutar el prompt
      </div>
    </div>
  )
}

// Función utilitaria para reemplazar variables en el contenido
export function replaceVariables(content: string, variables: Variable[]): string {
  let result = content
  
  variables.forEach(variable => {
    const regex = new RegExp(`\\{\\{\\s*${variable.name}\\s*\\}\\}`, 'g')
    result = result.replace(regex, variable.value)
  })
  
  return result
}

// Función para validar que todas las variables tienen valores
export function validateVariables(variables: Variable[]): boolean {
  return variables.every(variable => variable.value.trim() !== '')
}