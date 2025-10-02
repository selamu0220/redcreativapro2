'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '../lib/supabase'
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

      // Save to Supabase drafts table
      const { error } = await supabase
        .from('drafts')
        .upsert({
          id: draftKey,
          user_id: user.id,
          type: draftData.type,
          data: draftPayload,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.warn('Failed to save draft to Supabase, using localStorage only:', error)
      }

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
      
      // Try to load from Supabase first
      const { data: supabaseDraft, error } = await supabase
        .from('drafts')
        .select('data')
        .eq('id', draftKey)
        .single()

      if (!error && supabaseDraft?.data) {
        return supabaseDraft.data as AutoSaveData
      }

      // Fallback to localStorage
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
      
      // Clear from Supabase
      await supabase
        .from('drafts')
        .delete()
        .eq('id', draftKey)

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