'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useAuth } from './useAuth'
import { useToast } from '../components/ToastProvider'

interface AutoSaveData {
  id?: string
  name: string
  content: string
  category: string
  tags: string[]
  type: 'prompt' | 'group' | 'chain'
  lastSaved?: string
  variables?: Record<string, string>
  variableDefinitions?: Record<string, any>
}

interface UseAutoSaveOptions {
  delay?: number // milliseconds
  enabled?: boolean
}

export const useAutoSave = (data: AutoSaveData, options: UseAutoSaveOptions = {}) => {
  const { delay = 2000, enabled = true } = options
  const { user } = useAuth()
  const { showToast } = useToast()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedRef = useRef<string>('')
  const isSavingRef = useRef(false)

  const saveDraft = useCallback(async (draftData: AutoSaveData) => {
    if (!user || !enabled || isSavingRef.current) return

    // Don't save if data hasn't changed
    const currentDataString = JSON.stringify({
      name: draftData.name || '',
      content: draftData.content || '',
      category: draftData.category || '',
      tags: draftData.tags || [],
      variables: draftData.variables,
      variableDefinitions: draftData.variableDefinitions
    })
    
    if (currentDataString === lastSavedRef.current) return

    // Don't save empty drafts
    if (!(draftData.name || '').trim() && !(draftData.content || '').trim()) return

    isSavingRef.current = true

    try {
      const draftKey = `draft_${draftData.type}_${user.id}`
      const draftPayload = {
        ...draftData,
        lastSaved: new Date().toISOString(),
        userId: user.id
      }

      // Save to localStorage as backup
      localStorage.setItem(draftKey, JSON.stringify(draftPayload))

      // TODO: Implementar guardado en Vercel KV o Clerk metadata
      console.log('Draft saved to localStorage:', draftKey)

      lastSavedRef.current = currentDataString
      
      // Show subtle notification only occasionally to avoid spam
      const now = Date.now()
      const lastNotification = parseInt(localStorage.getItem('lastAutoSaveNotification') || '0')
      if (now - lastNotification > 30000) { // Show notification max once every 30 seconds
        showToast({ title: 'Borrador guardado automáticamente', type: 'info', duration: 1500 })
        localStorage.setItem('lastAutoSaveNotification', now.toString())
      }
    } catch (error) {
      console.error('Auto-save error:', error)
    } finally {
      isSavingRef.current = false
    }
  }, [user, enabled, showToast])

  const debouncedSave = useCallback((draftData: AutoSaveData) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      saveDraft(draftData)
    }, delay)
  }, [saveDraft, delay])

  const loadDraft = useCallback(async (type: 'prompt' | 'group' | 'chain'): Promise<AutoSaveData | null> => {
    if (!user) return null

    try {
      const draftKey = `draft_${type}_${user.id}`
      
      // Load from localStorage
      const localDraft = localStorage.getItem(draftKey)
      if (localDraft) {
        return JSON.parse(localDraft) as AutoSaveData
      }

      return null
    } catch (error) {
      console.error('Error loading draft:', error)
      return null
    }
  }, [user])

  const clearDraft = useCallback(async (type: 'prompt' | 'group' | 'chain') => {
    if (!user) return

    try {
      const draftKey = `draft_${type}_${user.id}`
      
      // Clear from localStorage
      localStorage.removeItem(draftKey)
      
      lastSavedRef.current = ''
    } catch (error) {
      console.error('Error clearing draft:', error)
    }
  }, [user])

  // Auto-save effect
  useEffect(() => {
    if (enabled && data.name && data.content) {
      debouncedSave(data)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, debouncedSave, enabled])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    saveDraft: debouncedSave,
    loadDraft,
    clearDraft,
    isSaving: isSavingRef.current
  }
}

export default useAutoSave