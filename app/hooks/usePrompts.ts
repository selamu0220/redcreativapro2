import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'

export interface Prompt {
  id: string
  name: string
  content: string
  category: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface PromptGroup {
  id: string
  name: string
  description: string
  prompts: string[] // Array de IDs de prompts
  userId: string
  createdAt: string
  updatedAt: string
}

export interface PromptChain {
  id: string
  name: string
  description: string
  steps: {
    id: string
    promptId: string
    order: number
    waitForResponse: boolean
    condition?: string
  }[]
  userId: string
  createdAt: string
  updatedAt: string
}

export interface ChainExecutionResult {
  stepId: string
  promptId: string
  promptContent: string
  response: string
  order: number
  timestamp: string
}

export interface ChainExecutionResponse {
  success: boolean
  chainId: string
  chainName: string
  executionResults: ChainExecutionResult[]
  totalSteps: number
  completedSteps: number
  finalContext: string
}

export function usePrompts() {
  const { user } = useAuth()
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [groups, setGroups] = useState<PromptGroup[]>([])
  const [chains, setChains] = useState<PromptChain[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar prompts del usuario
  const loadPrompts = useCallback(async () => {
    if (!user?.uid) return
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/prompts?userId=${user.uid}&type=prompts`)
      if (!response.ok) throw new Error('Error loading prompts')
      
      const data = await response.json()
      setPrompts(data.prompts || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading prompts')
    } finally {
      setLoading(false)
    }
  }, [user?.uid])

  // Cargar grupos del usuario
  const loadGroups = useCallback(async () => {
    if (!user?.uid) return
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/prompts?userId=${user.uid}&type=groups`)
      if (!response.ok) throw new Error('Error loading groups')
      
      const data = await response.json()
      setGroups(data.groups || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading groups')
    } finally {
      setLoading(false)
    }
  }, [user?.uid])

  // Cargar cadenas del usuario
  const loadChains = useCallback(async () => {
    if (!user?.uid) return
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/prompts?userId=${user.uid}&type=chains`)
      if (!response.ok) throw new Error('Error loading chains')
      
      const data = await response.json()
      setChains(data.chains || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading chains')
    } finally {
      setLoading(false)
    }
  }, [user?.uid])

  // Crear nuevo prompt
  const createPrompt = useCallback(async (promptData: Omit<Prompt, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.uid) throw new Error('User not authenticated')
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'prompt',
          data: { ...promptData, userId: user.uid }
        })
      })
      
      if (!response.ok) throw new Error('Error creating prompt')
      
      const data = await response.json()
      setPrompts(prev => [...prev, data.prompt])
      return data.prompt
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating prompt')
      throw err
    } finally {
      setLoading(false)
    }
  }, [user?.uid])

  // Crear nuevo grupo
  const createGroup = useCallback(async (groupData: Omit<PromptGroup, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.uid) throw new Error('User not authenticated')
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'group',
          data: { ...groupData, userId: user.uid }
        })
      })
      
      if (!response.ok) throw new Error('Error creating group')
      
      const data = await response.json()
      setGroups(prev => [...prev, data.group])
      return data.group
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating group')
      throw err
    } finally {
      setLoading(false)
    }
  }, [user?.uid])

  // Crear nueva cadena
  const createChain = useCallback(async (chainData: Omit<PromptChain, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.uid) throw new Error('User not authenticated')
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'chain',
          data: { ...chainData, userId: user.uid }
        })
      })
      
      if (!response.ok) throw new Error('Error creating chain')
      
      const data = await response.json()
      setChains(prev => [...prev, data.chain])
      return data.chain
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating chain')
      throw err
    } finally {
      setLoading(false)
    }
  }, [user?.uid])

  // Actualizar prompt
  const updatePrompt = useCallback(async (id: string, updates: Partial<Prompt>) => {
    if (!user?.uid) throw new Error('User not authenticated')
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/prompts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'prompt',
          id,
          data: { ...updates, userId: user.uid }
        })
      })
      
      if (!response.ok) throw new Error('Error updating prompt')
      
      const data = await response.json()
      setPrompts(prev => prev.map(p => p.id === id ? data.prompt : p))
      return data.prompt
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating prompt')
      throw err
    } finally {
      setLoading(false)
    }
  }, [user?.uid])

  // Eliminar prompt
  const deletePrompt = useCallback(async (id: string) => {
    if (!user?.uid) throw new Error('User not authenticated')
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/prompts?type=prompt&id=${id}&userId=${user.uid}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Error deleting prompt')
      
      setPrompts(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting prompt')
      throw err
    } finally {
      setLoading(false)
    }
  }, [user?.uid])

  // Ejecutar cadena de prompts
  const executeChain = useCallback(async (
    chainId: string, 
    apiKey: string, 
    options?: {
      model?: string
      temperature?: string
      maxTokens?: string
      initialContext?: string
    }
  ): Promise<ChainExecutionResponse> => {
    if (!user?.uid) throw new Error('User not authenticated')
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/execute-chain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chainId,
          userId: user.uid,
          apiKey,
          model: options?.model || 'gemini-1.5-flash',
          temperature: options?.temperature || '0.7',
          maxTokens: options?.maxTokens || '2000',
          initialContext: options?.initialContext || ''
        })
      })
      
      if (!response.ok) throw new Error('Error executing chain')
      
      const data = await response.json()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error executing chain')
      throw err
    } finally {
      setLoading(false)
    }
  }, [user?.uid])

  // Cargar todos los datos al montar el componente
  useEffect(() => {
    if (user?.uid) {
      loadPrompts()
      loadGroups()
      loadChains()
    }
  }, [user?.uid, loadPrompts, loadGroups, loadChains])

  return {
    // Estado
    prompts,
    groups,
    chains,
    loading,
    error,
    
    // Funciones de carga
    loadPrompts,
    loadGroups,
    loadChains,
    
    // Funciones CRUD
    createPrompt,
    createGroup,
    createChain,
    updatePrompt,
    deletePrompt,
    
    // Funciones de ejecución
    executeChain,
    
    // Utilidades
    clearError: () => setError(null)
  }
}