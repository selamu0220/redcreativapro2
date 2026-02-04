import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { useAuthenticatedFetch } from './useAuthenticatedFetch'
import { Prompt, PromptGroup, PromptChain } from '../types/prompts'

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
  const { get, post, put, del } = useAuthenticatedFetch()
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
      
      const data = await get(`/api/prompts?userId=${user.uid}&type=prompts`)
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
      
      const data = await get(`/api/prompts?userId=${user.uid}&type=groups`)
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
      
      const data = await get(`/api/prompts?userId=${user.uid}&type=chains`)
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
      
      const data = await post('/api/prompts', {
        type: 'prompt',
        data: { ...promptData, userId: user.uid }
      })
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
      
      const data = await post('/api/prompts', {
        type: 'group',
        data: { ...groupData, userId: user.uid }
      })
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
      
      const data = await post('/api/prompts', {
        type: 'chain',
        data: { ...chainData, userId: user.uid }
      })
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
      
      const data = await put('/api/prompts', {
        type: 'prompt',
        id,
        data: { ...updates, userId: user.uid }
      })
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
      
      await del(`/api/prompts?type=prompt&id=${id}&userId=${user.uid}`)
      setPrompts(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting prompt')
      throw err
    } finally {
      setLoading(false)
    }
  }, [user?.uid])

  // Actualizar grupo
  const updateGroup = useCallback(async (id: string, updates: Partial<PromptGroup>) => {
    if (!user?.uid) throw new Error('User not authenticated')
    
    try {
      setLoading(true)
      setError(null)
      
      const data = await put('/api/prompts', {
        type: 'group',
        id,
        data: { ...updates, userId: user.uid }
      })
      setGroups(prev => prev.map(g => g.id === id ? data.group : g))
      return data.group
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating group')
      throw err
    } finally {
      setLoading(false)
    }
  }, [user?.uid])

  // Eliminar grupo
  const deleteGroup = useCallback(async (id: string) => {
    if (!user?.uid) throw new Error('User not authenticated')
    
    try {
      setLoading(true)
      setError(null)
      
      await del(`/api/prompts?type=group&id=${id}&userId=${user.uid}`)
      setGroups(prev => prev.filter(g => g.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting group')
      throw err
    } finally {
      setLoading(false)
    }
  }, [user?.uid])

  // Actualizar cadena
  const updateChain = useCallback(async (id: string, updates: Partial<PromptChain>) => {
    if (!user?.uid) throw new Error('User not authenticated')
    
    try {
      setLoading(true)
      setError(null)
      
      const data = await put('/api/prompts', {
        type: 'chain',
        id,
        data: { ...updates, userId: user.uid }
      })
      setChains(prev => prev.map(c => c.id === id ? data.chain : c))
      return data.chain
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating chain')
      throw err
    } finally {
      setLoading(false)
    }
  }, [user?.uid])

  // Eliminar cadena
  const deleteChain = useCallback(async (id: string) => {
    if (!user?.uid) throw new Error('User not authenticated')
    
    try {
      setLoading(true)
      setError(null)
      
      await del(`/api/prompts?type=chain&id=${id}&userId=${user.uid}`)
      setChains(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting chain')
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
      
      const data = await post('/api/execute-chain', {
        chainId,
        userId: user.uid,
        apiKey,
        model: options?.model || 'gemini-2.0-flash-lite',
        temperature: options?.temperature || '0.7',
        maxTokens: options?.maxTokens || '2000',
        initialContext: options?.initialContext || ''
      })
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
    updateGroup,
    updateChain,
    deletePrompt,
    deleteGroup,
    deleteChain,
    
    // Funciones de ejecución
    executeChain,
    
    // Utilidades
    clearError: () => setError(null)
  }
}
