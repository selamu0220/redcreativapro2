'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuthContext } from '../contexts/AuthContext'
import { supabase, getAuthHeaders } from '../lib/supabase'
import MobileLayout, { MobileContainer } from '../components/MobileLayout'
import ProtectedRoute from '../components/ProtectedRoute'
import VideoModal from '../components/VideoModal'
import ChatGPTSidebar from '../components/ChatGPTSidebar'
import ChatGPTInterface from '../components/ChatGPTInterface'
import KeyboardShortcuts from '../components/KeyboardShortcuts'
import HelpModal from '../components/HelpModal'
import ExportImportModal from '../components/ExportImportModal'
import TemplatesModal from '../components/TemplatesModal'
import { useToast } from '../components/ToastProvider'
import TagInput from '../components/TagInput'
import TagFilter from '../components/TagFilter'
import AdvancedSearch, { SearchFilters } from '../components/AdvancedSearch'
import useAdvancedSearch from '../hooks/useAdvancedSearch'
import FavoritesPanel from '../components/FavoritesPanel'
import HistoryPanel from '../components/HistoryPanel'
import { useHistory } from '../hooks/useHistory'
// Removed NotificationProvider and useNotificationHelpers - using useToast instead
import { LoadingButton, LoadingState, useLoadingState } from '../components/LoadingStates'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import ShortcutsHelp from '../components/ShortcutsHelp'
import { useAutoSave } from '../hooks/useAutoSave'
import { usePromptVariables } from '../hooks/usePromptVariables'
import PromptVariables from '../components/PromptVariables'
import DraftManager from '../components/DraftManager'
import StatisticsPanel from '../components/StatisticsPanel'
import ExportImportPanel from '../components/ExportImportPanel'
import TemplatesPanel from '../components/TemplatesPanel'
import ThemeToggle from '../components/ThemeToggle'
import { DraggablePromptList } from '../components/DraggablePromptList'
import { useStatistics } from '../hooks/useStatistics'
import { useTemplates } from '../hooks/useTemplates'
import { useDragAndDrop } from '../hooks/useDragAndDrop'
import { useOpenRouterSync } from '../hooks/useOpenRouterSync'
import { useConversations } from '../hooks/useConversations'
import { Prompt } from '../types/prompts'
import { Trash2, Edit, Play, Plus, Users, Link, Search, Star, Download, Upload, Copy, Settings, HelpCircle, Save, BarChart3, FileText, Palette, Sparkles, History } from 'lucide-react'



interface Group {
  id: string
  name: string
  description: string
  prompts: string[]
  userId: string
  createdAt: string
  updatedAt: string
  isFavorite?: boolean
}

interface Chain {
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
  isFavorite?: boolean
}



// Componente interno que usa las notificaciones
const ChatIAPageContent: React.FC = () => {
  const { user } = useAuthContext()
  const { showToast } = useToast()

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNewPrompt: () => {
      setEditingPrompt(null)
      setModalType('prompt')
    },
    onSavePrompt: () => {
      if (modalType === 'prompt') {
        handleCreatePrompt()
      }
    },
    onSearch: () => {
      // Focus search input
      const searchInput = document.querySelector('input[placeholder*="Buscar"]') as HTMLInputElement
      if (searchInput) {
        searchInput.focus()
      }
    },
    onHelp: () => setShowShortcutsHelp(true),
    onNavigateToPanel: (panelIndex: number) => {
      const panels = ['prompts', 'favorites', 'history', 'statistics', 'templates'] as const
      if (panels[panelIndex]) {
        setActivePanel(panels[panelIndex])
      }
    }
  })
  
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [chains, setChains] = useState<Chain[]>([])

  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [modalType, setModalType] = useState<'prompt' | 'group' | 'chain' | null>(null)
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [editingChain, setEditingChain] = useState<Chain | null>(null)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false)
  const [showDraftManager, setShowDraftManager] = useState(false)
  const [showVariables, setShowVariables] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<string>('')
  const [showExportImport, setShowExportImport] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showFavorites, setShowFavorites] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [activePanel, setActivePanel] = useState<'prompts' | 'favorites' | 'history' | 'statistics' | 'templates'>('prompts')
  const [showStatistics, setShowStatistics] = useState(false)
  const [showExportImportPanel, setShowExportImportPanel] = useState(false)
  const [showTemplatesPanel, setShowTemplatesPanel] = useState(false)
  const [enableDragAndDrop, setEnableDragAndDrop] = useState(false)
  const [aiName, setAiName] = useState('Asistente IA')
  const [showAiNameConfig, setShowAiNameConfig] = useState(false)
  
  // History and favorites management
  const {
    historyItems,
    addToHistory,
    removeFromHistory,
    clearHistory,
    toggleHistoryFavorite,
    removeFavorite,
    getFavorites,
    getRecentItems,
    getMostUsedItems,
    exportHistory,
    importHistory,
    getHistoryStats
  } = useHistory()

  // Statistics management
  const {
    statistics,
    recordUsage,
    exportStatistics,
    clearStatistics
  } = useStatistics()

  // Templates management
  const {
    templates,
    getTemplatesByCategory,
    createPromptFromTemplate,
    addCustomTemplate,
    deleteTemplate,
    exportTemplates,
    importTemplates
  } = useTemplates()

  // Drag and drop for reordering
  const {
    draggedItem,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    isDragging,
    isDragOver
  } = useDragAndDrop({
    onReorder: (fromIndex: number, toIndex: number) => {
      const newPrompts = [...prompts]
      const [movedItem] = newPrompts.splice(fromIndex, 1)
      newPrompts.splice(toIndex, 0, movedItem)
      setPrompts(newPrompts)
    },
    itemType: 'prompt'
  })

  // OpenRouter configuration
  const {
    openRouterApiKey,
    openRouterModel
  } = useOpenRouterSync()

  // Conversations management
  const {
    conversations,
    currentConversation,
    messages,
    isLoading: conversationsLoading,
    createConversation,
    selectConversation,
    addMessage,
    deleteConversation,
    renameConversation
  } = useConversations()

  // Form states - declared first to avoid initialization errors
  const [promptForm, setPromptForm] = useState({
    title: '',
    content: '',
    category: '',
    tags: [] as string[],
    isFavorite: false
  })

  // Loading states
  const promptsLoading = useLoadingState()
  const groupsLoading = useLoadingState()
  const chainsLoading = useLoadingState()
  const saveLoading = useLoadingState()

  // Auto-save y variables
  const autoSave = useAutoSave({
    content: promptForm.content,
    name: promptForm.title,
    category: promptForm.category,
    tags: promptForm.tags,
    type: 'prompt',
    variables: {},
    variableDefinitions: {}
  })

  const promptVariables = usePromptVariables(promptForm.content)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)

  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    prompts: [] as string[]
  })

  const [chainForm, setChainForm] = useState({
    name: '',
    description: '',
    steps: [] as any[]
  })

  const categories = ['all', 'general', 'coding', 'writing', 'analysis', 'creative']

  // Auto-save for prompt drafts
  const { loadDraft, clearDraft } = useAutoSave(
    {
      name: promptForm.title,
      content: promptForm.content,
      category: promptForm.category,
      tags: promptForm.tags,
      type: 'prompt'
    },
    {
      enabled: modalType === 'prompt' && !editingPrompt // Only auto-save for new prompts
    }
  )

  // Load draft when opening new prompt modal
  useEffect(() => {
    if (modalType === 'prompt' && !editingPrompt) {
      loadDraft('prompt').then(draft => {
        if (draft) {
          setPromptForm({
            title: draft.name || '',
            content: draft.content || '',
            category: draft.category || '',
            tags: draft.tags || [],
            isFavorite: false
          })
          showToast({ title: 'Borrador cargado automáticamente', type: 'info', duration: 2000 })
        }
      })
    }
  }, [modalType, editingPrompt, loadDraft, showToast])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault()
            setModalType('prompt')
            break
          case 'g':
            e.preventDefault()
            setModalType('group')
            break
          case 'c':
            e.preventDefault()
            setModalType('chain')
            break
          case 'Enter':
            e.preventDefault()
            // Execution is now handled by ChatGPTInterface
            break
          case '/':
            e.preventDefault()
            setShowShortcutsHelp(true)
            break
        }
      } else if (e.key === 'Escape') {
        setModalType(null)
        setShowShortcutsHelp(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Load data
  useEffect(() => {
    if (user) {
      loadPrompts()
      loadGroups()
      loadChains()
    }
  }, [user])

  const loadPrompts = async () => {
    if (!user?.id) return
    try {
      const headers = await getAuthHeaders()
      const response = await fetch('/api/prompts?type=prompts', {
        headers
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch prompts: ${response.status} ${errorText}`)
      }
      const data = await response.json()
      setPrompts(data.prompts || [])
    } catch (error) {
      console.error('Error loading prompts:', error)
      showToast({ title: 'Error al cargar los prompts', type: 'error' })
    }
  }

  const loadGroups = async () => {
    if (!user?.id) return
    try {
      const headers = await getAuthHeaders()
      const response = await fetch('/api/prompts?type=groups', {
        headers
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch groups: ${response.status} ${errorText}`)
      }
      const data = await response.json()
      setGroups(data.groups || [])
    } catch (error) {
      console.error('Error loading groups:', error)
      showToast({ title: 'Error al cargar los grupos', type: 'error' })
    }
  }

  const loadChains = async () => {
    if (!user?.id) return
    try {
      const headers = await getAuthHeaders()
      const response = await fetch('/api/prompts?type=chains', {
        headers
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch chains: ${response.status} ${errorText}`)
      }
      const data = await response.json()
      setChains(data.chains || [])
    } catch (error) {
      console.error('Error loading chains:', error)
      showToast({ title: 'Error al cargar las cadenas', type: 'error' })
    }
  }



  const handleCreatePrompt = async () => {
    if (!promptForm.title || !promptForm.content) {
      showToast({ title: 'Por favor completa todos los campos requeridos', type: 'error' })
      return
    }

    saveLoading.startLoading()
    
    try {
      const promptData = {
        title: promptForm.title,
        content: promptForm.content,
        category: promptForm.category || 'general',
        tags: promptForm.tags,
        is_favorite: promptForm.isFavorite,
        user_id: user?.id
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      const headers = await getAuthHeaders()
      
      if (editingPrompt) {
        const response = await fetch('/api/prompts', {
          method: 'PUT',
          headers,
          body: JSON.stringify({ type: 'prompt', id: editingPrompt.id, data: promptData })
        })
        if (!response.ok) throw new Error('Failed to update prompt')
        showToast({ title: 'Prompt actualizado correctamente', type: 'success' })
      } else {
        const response = await fetch('/api/prompts', {
          method: 'POST',
          headers,
          body: JSON.stringify({ type: 'prompt', data: promptData })
        })
        if (!response.ok) throw new Error('Failed to create prompt')
        showToast({ title: 'Nuevo prompt creado exitosamente', type: 'success' })
      }

      setModalType(null)
      setEditingPrompt(null)
      setPromptForm({ title: '', content: '', category: '', tags: [], isFavorite: false })
      
      // Clear draft after successful creation
      if (!editingPrompt) {
        clearDraft('prompt')
      }
      
      loadPrompts()
      saveLoading.stopLoading()
    } catch (error) {
        console.error('Error saving prompt:', error)
        showToast({ title: 'Error al guardar el prompt', type: 'error' })
        saveLoading.setLoadingError('Error al guardar el prompt')
      }
  }

  const handleCreateGroup = async () => {
    if (!groupForm.name || groupForm.prompts.length === 0) {
      showToast({ title: 'Por favor completa todos los campos requeridos', type: 'error' })
      return
    }

    try {
      const groupData = {
        name: groupForm.name,
        description: groupForm.description,
        prompt_ids: groupForm.prompts,
        user_id: user?.id
      }

      const headers = await getAuthHeaders()

      if (editingGroup) {
        const response = await fetch('/api/prompts', {
          method: 'PUT',
          headers,
          body: JSON.stringify({ type: 'group', id: editingGroup.id, data: groupData })
        })
        if (!response.ok) throw new Error('Failed to update group')
        showToast({ title: 'Grupo actualizado correctamente', type: 'success' })
      } else {
        const response = await fetch('/api/prompts', {
          method: 'POST',
          headers,
          body: JSON.stringify({ type: 'group', data: groupData })
        })
        if (!response.ok) throw new Error('Failed to create group')
        showToast({ title: 'Grupo creado correctamente', type: 'success' })
      }

      setModalType(null)
      setEditingGroup(null)
      setGroupForm({ name: '', description: '', prompts: [] })
      loadGroups()
    } catch (error) {
      console.error('Error saving group:', error)
      showToast({ title: 'Error al guardar el grupo', type: 'error' })
    }
  }

  const handleCreateChain = async () => {
    if (!chainForm.name || chainForm.steps.length === 0) {
      showToast({ title: 'Por favor completa todos los campos requeridos', type: 'error' })
      return
    }

    try {
      const chainData = {
        name: chainForm.name,
        description: chainForm.description,
        prompt_ids: chainForm.steps.map(step => step.promptId),
        user_id: user?.id
      }

      const headers = await getAuthHeaders()

      if (editingChain) {
        const response = await fetch('/api/prompts', {
          method: 'PUT',
          headers,
          body: JSON.stringify({ type: 'chain', id: editingChain.id, data: chainData })
        })
        if (!response.ok) throw new Error('Failed to update chain')
        showToast({ title: 'Cadena actualizada correctamente', type: 'success' })
      } else {
        const response = await fetch('/api/prompts', {
          method: 'POST',
          headers,
          body: JSON.stringify({ type: 'chain', data: chainData })
        })
        if (!response.ok) throw new Error('Failed to create chain')
        showToast({ title: 'Cadena creada correctamente', type: 'success' })
      }

      setModalType(null)
      setEditingChain(null)
      setChainForm({ name: '', description: '', steps: [] })
      loadChains()
    } catch (error) {
      console.error('Error saving chain:', error)
      showToast({ title: 'Error al guardar la cadena', type: 'error' })
    }
  }

  const handleSendMessage = async (message: string, conversationId?: string) => {
    setExecuting(true)
    setIsTyping(true)

    try {
      // Create conversation if it doesn't exist
      let activeConversationId = conversationId || currentConversation?.id
      if (!activeConversationId) {
        const newConversation = await createConversation('Chat de Prompts')
        if (!newConversation) {
          throw new Error('No se pudo crear la conversación')
        }
        activeConversationId = newConversation.id
      }

      // Add user message to conversation
      const userMessage = await addMessage(activeConversationId, message, 'user')
      if (!userMessage) {
        throw new Error('No se pudo agregar el mensaje del usuario')
      }

      // Prepare the request payload without history to avoid duplication
      const payload = {
        message,
        selectedPrompt: selectedPrompt ? {
          title: selectedPrompt.title,
          content: selectedPrompt.content
        } : null
      }

      // Call the OpenRouter API
      const response = await fetch('/api/chat-prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-openrouter-api-key': openRouterApiKey || '',
          'x-openrouter-model': openRouterModel || 'meta-llama/llama-3.1-8b-instruct:free',
          'x-openrouter-temperature': '0.7',
          'x-openrouter-max-tokens': '1000'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const aiResponse = data.response
        
      // Add AI response to conversation
      if (aiResponse) {
        const assistantMessage = await addMessage(activeConversationId, aiResponse, 'assistant')
        if (!assistantMessage) {
          throw new Error('No se pudo agregar la respuesta de la IA')
        }
      }
        
      setIsTyping(false)
      setExecuting(false)
      showToast({ title: 'Respuesta generada correctamente', type: 'success' })
    } catch (error) {
      console.error('Error sending message:', error)
      showToast({ 
        title: 'Error al enviar mensaje', 
        description: error instanceof Error ? error.message : 'No se pudo procesar tu solicitud. Verifica tu configuración de OpenRouter.',
        type: 'error' 
      })
      setExecuting(false)
      setIsTyping(false)
    }
  }

  const handleDeletePrompt = async (promptId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este prompt?')) return

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const response = await fetch(`/api/prompts?type=prompt&id=${promptId}`, {
        method: 'DELETE',
        headers: {
          'x-user-uid': user?.id || ''
        }
      })
      if (!response.ok) throw new Error('Failed to delete prompt')
      
      showToast({ title: 'El prompt ha sido eliminado correctamente', type: 'success' })
      loadPrompts()
    } catch (error) {
      console.error('Error deleting prompt:', error)
      showToast({ title: 'No se pudo eliminar el prompt', type: 'error' })
    }
  }

  const handleToggleFavorite = async (promptId: string, isFavorite: boolean) => {
    try {
      const response = await fetch('/api/prompts', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-uid': user?.id || ''
        },
        body: JSON.stringify({ type: 'prompt', id: promptId, data: { isFavorite: !isFavorite } })
      })
      if (!response.ok) throw new Error('Failed to toggle favorite')
      loadPrompts()
      showToast({ title: isFavorite ? 'Removido de favoritos' : 'Agregado a favoritos', type: 'success' })
    } catch (error) {
      console.error('Error toggling favorite:', error)
      showToast({ title: 'Error al actualizar favorito', type: 'error' })
    }
  }

  const handleDuplicatePrompt = async (prompt: Prompt) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-uid': user?.id || ''
        },
        body: JSON.stringify({
          type: 'prompt',
          data: {
            title: `${prompt.title} (Copia)`,
            content: prompt.content,
            category: prompt.category,
            tags: prompt.tags || []
          }
        })
      })
      if (!response.ok) throw new Error('Failed to duplicate prompt')
      
      showToast({ title: 'Se ha creado una copia del prompt', type: 'success' })
      loadPrompts()
    } catch (error) {
      console.error('Error duplicating prompt:', error)
      showToast({ title: 'No se pudo duplicar el prompt', type: 'error' })
    }
  }

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este grupo?')) return

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const response = await fetch(`/api/prompts?type=group&id=${groupId}`, {
        method: 'DELETE',
        headers: {
          'x-user-uid': user?.id || ''
        }
      })
      if (!response.ok) throw new Error('Failed to delete group')
      
      showToast({ title: 'El grupo ha sido eliminado correctamente', type: 'success' })
      loadGroups()
    } catch (error) {
      console.error('Error deleting group:', error)
      showToast({ title: 'No se pudo eliminar el grupo', type: 'error' })
    }
  }

  const handleDeleteChain = async (chainId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta cadena?')) return

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const response = await fetch(`/api/prompts?type=chain&id=${chainId}`, {
        method: 'DELETE',
        headers: {
          'x-user-uid': user?.id || ''
        }
      })
      if (!response.ok) throw new Error('Failed to delete chain')
      
      showToast({ title: 'La cadena ha sido eliminada correctamente', type: 'success' })
      loadChains()
    } catch (error) {
      console.error('Error deleting chain:', error)
      showToast({ title: 'No se pudo eliminar la cadena', type: 'error' })
    }
  }

  const handleDuplicateGroup = async (group: Group) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-uid': user?.id || ''
        },
        body: JSON.stringify({
          type: 'group',
          data: {
            name: `${group.name} (Copia)`,
            description: group.description,
            prompts: group.prompts || []
          }
        })
      })
      if (!response.ok) throw new Error('Failed to duplicate group')
      
      showToast({ title: 'Se ha creado una copia del grupo', type: 'success' })
      loadGroups()
    } catch (error) {
      console.error('Error duplicating group:', error)
      showToast({ title: 'No se pudo duplicar el grupo', type: 'error' })
    }
  }

  const handleDuplicateChain = async (chain: Chain) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-uid': user?.id || ''
        },
        body: JSON.stringify({
          type: 'chain',
          data: {
            name: `${chain.name} (Copia)`,
            description: chain.description,
            prompt_ids: chain.steps.map(step => step.promptId) || []
          }
        })
      })
      if (!response.ok) throw new Error('Failed to duplicate chain')
      
      showToast({ title: 'Se ha creado una copia de la cadena', type: 'success' })
      loadChains()
    } catch (error) {
      console.error('Error duplicating chain:', error)
      showToast({ title: 'No se pudo duplicar la cadena', type: 'error' })
    }
  }

  const handleSelectTemplate = (template: any) => {
    // Create a prompt-like object for recording usage
    const templateAsPrompt = {
      id: template.id,
      title: template.name,
      content: template.content,
      description: template.description || '',
      category: template.category || 'general',
      tags: template.tags || [],
      variables: template.variables || [],
      isFavorite: false,
      isPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: user?.id || ''
    }
    
    // Record template usage
    recordUsage(templateAsPrompt)
    
    // Create prompt from template with variable replacement if needed
    const promptContent = createPromptFromTemplate(template.id, {})
    
    setPromptForm({
      title: template.name,
      content: promptContent || template.content,
      category: template.category || 'general',
      tags: template.tags || [],
      isFavorite: false
    })
    setModalType('prompt')
    setShowTemplates(false)
    showToast({ title: `Template "${template.name}" cargado`, type: 'success' })
  }

  const handleUsePrompt = (prompt: Prompt) => {
    // Record prompt usage in statistics
    recordUsage(prompt)
    
    // Add to history
    addToHistory(prompt, 'prompt')
    
    setSelectedPrompt(prompt)
    setSelectedItemId(prompt.id)
  }

  // Available tags are now provided by useAdvancedSearch hook

  const handleSelectPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt)
    addToHistory(prompt, 'prompt')
  }

  const handleSelectGroup = (group: Group) => {
    setSelectedGroup(group)
    addToHistory(group, 'group')
  }

  const handleSelectChain = (chain: Chain) => {
    setSelectedChain(chain)
    addToHistory(chain, 'chain')
  }

  const handleSelectFromPanel = (id: string, type: 'prompt' | 'group' | 'chain') => {
    switch (type) {
      case 'prompt':
        const prompt = prompts.find(p => p.id === id)
        if (prompt) handleSelectPrompt(prompt)
        break
      case 'group':
        const group = groups.find(g => g.id === id)
        if (group) handleSelectGroup(group)
        break
      case 'chain':
        const chain = chains.find(c => c.id === id)
        if (chain) handleSelectChain(chain)
        break
    }
  }

  const handleToggleFavoriteItem = (id: string, type: 'prompt' | 'group' | 'chain') => {
    toggleHistoryFavorite(id, type)
    // Also update the original data if needed
    switch (type) {
      case 'prompt':
        setPrompts(prev => prev.map(p => 
          p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
        ))
        break
      case 'group':
        setGroups(prev => prev.map(g => 
          g.id === id ? { ...g, isFavorite: !g.isFavorite } : g
        ))
        break
      case 'chain':
        setChains(prev => prev.map(c => 
          c.id === id ? { ...c, isFavorite: !c.isFavorite } : c
        ))
        break
    }
  }

  // Advanced search integration
  const {
    filters: searchFilters,
    setFilters: setSearchFilters,
    filteredAndSortedItems: filteredPrompts,
    availableCategories,
    availableTags,
    searchStats,
    quickFilters,
    searchSuggestions
  } = useAdvancedSearch(prompts.map(prompt => ({
    ...prompt,
    usageCount: historyItems.filter(item => item.id === prompt.id && item.type === 'prompt').length
  })))

  // Legacy filter support for backward compatibility
  const showFavoritesOnly = searchFilters.showFavoritesOnly

  return (
    <ProtectedRoute>
      <MobileLayout>
        <MobileContainer>
          {/* Clean Header */}
          <div className="border-b bg-background">
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-lg border bg-muted flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-foreground">
                    Gestión de Prompts
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Organiza y gestiona tus prompts de manera eficiente
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <ThemeToggle />
              </div>
            </div>
            
            {/* Stats Bar - Improved Design */}
            <div className="px-6 pb-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-card border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-md">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-card-foreground">{prompts.length}</p>
                      <p className="text-sm text-muted-foreground">Prompts</p>
                    </div>
                  </div>
                </div>
                <div className="bg-card border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500/10 rounded-md">
                      <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-card-foreground">{groups.length}</p>
                      <p className="text-sm text-muted-foreground">Grupos</p>
                    </div>
                  </div>
                </div>
                <div className="bg-card border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-500/10 rounded-md">
                      <Link className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-card-foreground">{chains.length}</p>
                      <p className="text-sm text-muted-foreground">Cadenas</p>
                    </div>
                  </div>
                </div>
                <div className="bg-card border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-500/10 rounded-md">
                      <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-card-foreground">{getFavorites().length}</p>
                      <p className="text-sm text-muted-foreground">Favoritos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex h-[calc(100vh-73px)] bg-background">
            {/* Clean Sidebar */}
            <div className="flex flex-col w-80 border-r bg-background">
              {/* Navigation Tabs - Improved Design */}
              <div className="border-b border-border bg-background">
                <nav className="flex space-x-1 p-1" aria-label="Tabs">
                  <button
                    onClick={() => setActivePanel('prompts')}
                    className={`group relative min-w-0 flex-1 overflow-hidden rounded-md px-4 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      activePanel === 'prompts'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <FileText className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">Prompts</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActivePanel('favorites')}
                    className={`group relative min-w-0 flex-1 overflow-hidden rounded-md px-4 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      activePanel === 'favorites'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Star className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">Favoritos</span>
                      {getFavorites().length > 0 && (
                        <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          activePanel === 'favorites'
                            ? 'bg-primary-foreground/20 text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {getFavorites().length}
                        </span>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => setActivePanel('history')}
                    className={`group relative min-w-0 flex-1 overflow-hidden rounded-md px-4 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      activePanel === 'history'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <History className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">Historial</span>
                      {historyItems.length > 0 && (
                        <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          activePanel === 'history'
                            ? 'bg-primary-foreground/20 text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {historyItems.length}
                        </span>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => setActivePanel('statistics')}
                    className={`group relative min-w-0 flex-1 overflow-hidden rounded-md px-4 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      activePanel === 'statistics'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <BarChart3 className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">Stats</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActivePanel('templates')}
                    className={`group relative min-w-0 flex-1 overflow-hidden rounded-md px-4 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      activePanel === 'templates'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Sparkles className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">Templates</span>
                    </div>
                  </button>
                </nav>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-hidden bg-background">
                {activePanel === 'prompts' && (
                  <div className="flex flex-col h-full">
                    {/* Search Component */}
                    <div className="p-6 border-b bg-muted/30">
                      <AdvancedSearch
                        filters={searchFilters}
                        onFiltersChange={setSearchFilters}
                        availableCategories={availableCategories}
                        availableTags={availableTags}
                        searchStats={searchStats}
                        quickFilters={quickFilters}
                        searchSuggestions={searchSuggestions}
                      />
                    </div>
                    
                    {/* Drag and Drop Toggle */}
                    <div className="p-6 border-b bg-muted/20">
                      <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <span className="text-sm font-medium text-foreground">
                              Reordenar prompts
                            </span>
                          </div>
                          <button
                            onClick={() => setEnableDragAndDrop(!enableDragAndDrop)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                              enableDragAndDrop ? 'bg-primary' : 'bg-muted'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                                enableDragAndDrop ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                    </div>

                    {/* Draggable Prompt List */}
                    <div className="flex-1 overflow-hidden">
                      <DraggablePromptList
                        prompts={filteredPrompts}
                        groups={groups}
                        chains={chains}
                        selectedPrompt={selectedPrompt}
                        selectedGroup={selectedGroup}
                        selectedChain={selectedChain}
                        enableDragAndDrop={enableDragAndDrop}
                        onReorder={(reorderedPrompts: Prompt[]) => {
                          // Handle reordering logic here if needed
                        }}
                        onEdit={(prompt: Prompt) => {
                          setEditingPrompt(prompt)
                          setPromptForm({
                            title: prompt.title,
                            content: prompt.content,
                            category: prompt.category,
                            tags: prompt.tags,
                            isFavorite: prompt.isFavorite
                          })
                          setModalType('prompt')
                        }}
                        onDelete={handleDeletePrompt}
                        onDuplicate={handleDuplicatePrompt}
                        onUse={handleUsePrompt}
                        onEditGroup={(group: Group) => {
                          setEditingGroup(group)
                          setGroupForm({
                            name: group.name,
                            description: group.description,
                            prompts: group.prompts
                          })
                          setModalType('group')
                        }}
                        onEditChain={(chain: Chain) => {
                          setEditingChain(chain)
                          setChainForm({
                            name: chain.name,
                            description: chain.description,
                            steps: chain.steps
                          })
                          setModalType('chain')
                        }}
                        onDeletePrompt={handleDeletePrompt}
                        onDeleteGroup={handleDeleteGroup}
                        onDeleteChain={handleDeleteChain}
                        onDuplicatePrompt={handleDuplicatePrompt}
                        onDuplicateGroup={handleDuplicateGroup}
                        onDuplicateChain={handleDuplicateChain}
                        onToggleFavorite={handleToggleFavoriteItem}
                        showDrafts={() => setShowDraftManager(true)}
                        showVariables={() => setShowVariables(true)}
                        showExportImport={() => setShowExportImportPanel(true)}
                        showTemplates={() => setShowTemplatesPanel(true)}
                      />
                    </div>
                  </div>
                )}

                {activePanel === 'favorites' && (
                  <FavoritesPanel
                    favoriteItems={getFavorites()}
                    onSelectItem={handleSelectFromPanel}
                    onRemoveFromFavorites={removeFavorite}
                    onEditItem={(id: string, type: string) => {
                      // Same edit logic as above
                      if (type === 'prompt') {
                        const prompt = prompts.find(p => p.id === id)
                        if (prompt) {
                          setEditingPrompt(prompt)
                          setPromptForm({
                            title: prompt.title,
                            content: prompt.content,
                            category: prompt.category,
                            tags: prompt.tags,
                            isFavorite: prompt.isFavorite
                          })
                          setModalType('prompt')
                        }
                      }
                    }}
                    onDuplicateItem={(id: string, type: string) => {
                      if (type === 'prompt') {
                        const prompt = prompts.find(p => p.id === id)
                        if (prompt) {
                          handleDuplicatePrompt(prompt)
                        }
                      }
                    }}
                    className="h-full"
                  />
                )}

                {activePanel === 'history' && (
                  <HistoryPanel
                    historyItems={historyItems}
                    onSelectItem={handleSelectFromPanel}
                    onRemoveFromHistory={(id: string) => {
                      // Find the item in history to get its type
                      const historyItem = historyItems.find(item => item.id === id)
                      if (historyItem) {
                        removeFromHistory(id, historyItem.type)
                      }
                    }}
                    onClearHistory={clearHistory}
                    onToggleFavorite={handleToggleFavoriteItem}
                    className="h-full"
                  />
                )}

                {activePanel === 'statistics' && (
                  <StatisticsPanel
                    className="h-full"
                  />
                )}

                {activePanel === 'templates' && (
                  <TemplatesPanel
                    onSelectTemplate={handleSelectTemplate}
                  />
                )}
              </div>
            </div>



            {/* Main Chat Area */}
            <div className="flex-1 bg-background border rounded-lg">
              <ChatGPTInterface
                onSendMessage={handleSendMessage}
                isLoading={executing}
                conversationId={currentConversation?.id}
                messages={messages}
                addMessage={addMessage}
                selectedItemId={selectedPrompt?.id || selectedGroup?.id || selectedChain?.id}
                selectedItemType={selectedPrompt ? 'prompt' : selectedGroup ? 'group' : selectedChain ? 'chain' : undefined}
                selectedPromptContent={selectedPrompt?.content}
                aiName={aiName}
                onAiNameChange={(newName: string) => setAiName(newName)}
                onCreatePrompt={() => {
                  setEditingPrompt(null)
                  setPromptForm({
                    title: '',
                    content: '',
                    category: '',
                    tags: [],
                    isFavorite: false
                  })
                  setModalType('prompt')
                }}
                onSavePrompt={(content: string) => {
                  setEditingPrompt(null)
                  setPromptForm({
                    title: 'Nuevo Prompt',
                    content: content,
                    category: 'general',
                    tags: [],
                    isFavorite: false
                  })
                  setModalType('prompt')
                }}
                onCreateGroup={() => {
                  setEditingGroup(null)
                  setGroupForm({
                    name: '',
                    description: '',
                    prompts: []
                  })
                  setModalType('group')
                }}
                onCreateChain={() => {
                  setEditingChain(null)
                  setChainForm({
                    name: '',
                    description: '',
                    steps: []
                  })
                  setModalType('chain')
                }}
              />
            </div>
          </div>

          {/* Modals */}
          {modalType === 'prompt' && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <div className="bg-background border rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    {editingPrompt ? 'Editar Prompt' : 'Crear Nuevo Prompt'}
                  </h3>
                  {!editingPrompt && (promptForm.title || promptForm.content) && (
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Auto-guardado</span>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre</label>
                    <input
                      type="text"
                      value={promptForm.title}
                      onChange={(e) => setPromptForm({ ...promptForm, title: e.target.value })}
                      className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                      placeholder="Ej: Análisis de código"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Categoría</label>
                    <select
                      value={promptForm.category}
                      onChange={(e) => setPromptForm({ ...promptForm, category: e.target.value })}
                      className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                    >
                      <option value="">Seleccionar categoría</option>
                      {categories.slice(1).map(cat => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Contenido del Prompt</label>
                    <textarea
                      value={promptForm.content}
                      onChange={(e) => setPromptForm({ ...promptForm, content: e.target.value })}
                      className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                      rows={8}
                      placeholder="Escribe el contenido de tu prompt aquí..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Etiquetas</label>
                    <TagInput
                      tags={promptForm.tags}
                      onChange={(tags) => setPromptForm({ ...promptForm, tags })}
                      placeholder="Agregar etiquetas para organizar..."
                      maxTags={8}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium">Marcar como favorito</label>
                    <button
                      type="button"
                      onClick={() => setPromptForm({ ...promptForm, isFavorite: !promptForm.isFavorite })}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                        promptForm.isFavorite 
                          ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20' 
                          : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground border border-border'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${promptForm.isFavorite ? 'fill-current' : ''}`} />
                      <span>{promptForm.isFavorite ? 'Favorito' : 'Agregar a favoritos'}</span>
                    </button>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    onClick={() => {
                      setModalType(null)
                      setEditingPrompt(null)
                      setPromptForm({ title: '', content: '', category: '', tags: [], isFavorite: false })
                      
                      // Clear draft when canceling new prompt
                      if (!editingPrompt) {
                        clearDraft('prompt')
                      }
                    }}
                    className="px-4 py-2 text-muted-foreground hover:text-foreground"
                    disabled={saveLoading.loading}
                  >
                    Cancelar
                  </button>
                  <LoadingButton
                    onClick={handleCreatePrompt}
                    loading={saveLoading.loading}
                    disabled={!promptForm.title || !promptForm.content}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    {editingPrompt ? 'Actualizar' : 'Crear'}
                  </LoadingButton>
                </div>
              </div>
            </div>
          )}

          {modalType === 'group' && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <div className="bg-background border rounded-lg shadow-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">
                  {editingGroup ? 'Editar Grupo' : 'Crear Nuevo Grupo'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre</label>
                    <input
                      type="text"
                      value={groupForm.name}
                      onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                      className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Descripción</label>
                    <textarea
                      value={groupForm.description}
                      onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                      className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Seleccionar Prompts</label>
                    <div className="max-h-32 overflow-y-auto border border-border rounded-lg p-2">
                      {prompts.map((prompt) => (
                        <label key={prompt.id} className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={groupForm.prompts.includes(prompt.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setGroupForm({ ...groupForm, prompts: [...groupForm.prompts, prompt.id] })
                              } else {
                                setGroupForm({ ...groupForm, prompts: groupForm.prompts.filter((id: string) => id !== prompt.id) })
                              }
                            }}
                          />
                          <span>{prompt.title}</span>
                        </label>
                      ))}
                      {prompts.length === 0 && (
                        <p className="text-sm text-muted-foreground">No hay prompts disponibles</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    onClick={() => {
                      setModalType(null)
                      setEditingGroup(null)
                      setGroupForm({ name: '', description: '', prompts: [] })
                    }}
                    className="px-4 py-2 text-muted-foreground hover:text-foreground"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateGroup}
                    disabled={!groupForm.name || groupForm.prompts.length === 0}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    {editingGroup ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {modalType === 'chain' && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <div className="bg-background border rounded-lg shadow-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">
                  {editingChain ? 'Editar Cadena' : 'Crear Nueva Cadena'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre</label>
                    <input
                      type="text"
                      value={chainForm.name}
                      onChange={(e) => setChainForm({ ...chainForm, name: e.target.value })}
                      className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Descripción</label>
                    <textarea
                      value={chainForm.description}
                      onChange={(e) => setChainForm({ ...chainForm, description: e.target.value })}
                      className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Secuencia de Prompts</label>
                    <div className="space-y-2">
                      {chainForm.steps.map((promptId: string, index: number) => {
                        const prompt = prompts.find(p => p.id === promptId)
                        return (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <span>{index + 1}.</span>
                            <span className="flex-1">{prompt?.title || 'Prompt no encontrado'}</span>
                            <button
                              onClick={() => {
                                setChainForm({
                                  ...chainForm,
                                  steps: chainForm.steps.filter((_: string, i: number) => i !== index)
                                })
                              }}
                              className="text-destructive hover:text-destructive/80"
                            >
                              ×
                            </button>
                          </div>
                        )
                      })}
                      <select
                        onChange={(e) => {
                          if (e.target.value && !chainForm.steps.includes(e.target.value)) {
                            setChainForm({
                              ...chainForm,
                              steps: [...chainForm.steps, e.target.value]
                            })
                          }
                        }}
                        className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                      >
                        <option value="">Agregar prompt...</option>
                        {prompts.filter(p => !chainForm.steps.includes(p.id)).map((prompt) => (
                          <option key={prompt.id} value={prompt.id}>{prompt.title}</option>
                        ))}
                      </select>
                      {prompts.length === 0 && (
                        <p className="text-sm text-muted-foreground">No hay prompts disponibles</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    onClick={() => {
                      setModalType(null)
                      setEditingChain(null)
                      setChainForm({ name: '', description: '', steps: [] })
                    }}
                    className="px-4 py-2 text-muted-foreground hover:text-foreground"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateChain}
                    disabled={!chainForm.name || chainForm.steps.length === 0}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    {editingChain ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Export/Import Modal */}
          <ExportImportModal
            isOpen={showExportImport}
            onClose={() => setShowExportImport(false)}
            onImportComplete={() => {
              // Refresh data after import
              window.location.reload()
            }}
          />

          {/* Templates Modal */}
           <TemplatesModal
             isOpen={showTemplates}
             onClose={() => setShowTemplates(false)}
             onSelectTemplate={handleSelectTemplate}
           />

          {/* Draft Manager Modal */}
          <DraftManager
            isOpen={showDraftManager}
            onClose={() => setShowDraftManager(false)}
            onLoadDraft={(draft) => {
              setPromptForm({
                title: draft.name || '',
                content: draft.content || '',
                category: draft.category || '',
                tags: draft.tags || [],
                isFavorite: false
              })
              setModalType('prompt')
              setShowDraftManager(false)
              showToast({ title: 'Borrador cargado', type: 'success' })
            }}
          />

          {/* Prompt Variables - conditionally rendered */}
          {showVariables && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <div className="bg-background border rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Configurar Variables</h3>
                  <button
                    onClick={() => setShowVariables(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </button>
                </div>
                <PromptVariables
                  content={promptForm.content}
                  onContentChange={(content) => setPromptForm({ ...promptForm, content })}
                />
              </div>
            </div>
          )}

          {/* Keyboard Shortcuts */}
        <KeyboardShortcuts 
          onNewPrompt={() => setModalType('prompt')}
          onNewGroup={() => setModalType('group')}
          onNewChain={() => setModalType('chain')}
          onExecute={() => {
            // Keyboard shortcut execution is now handled by ChatGPTInterface
            showToast({ title: 'Usa Ctrl+Enter en el área de chat para ejecutar', type: 'info' })
          }}
          onShowHelp={() => setShowShortcutsHelp(true)}
          onCloseModal={() => {
            setModalType(null)
            setShowShortcutsHelp(false)
          }}
        />
        
        {/* Shortcuts Help Modal */}
        <ShortcutsHelp 
          isOpen={showShortcutsHelp} 
          onClose={() => setShowShortcutsHelp(false)} 
        />
          
          <VideoModal
            isOpen={showVideoModal}
            onClose={() => setShowVideoModal(false)}
            videoId="k5OYlxYdIuA"
            title="Introducción a Red Creativa Pro"
          />
        </MobileContainer>
      </MobileLayout>
    </ProtectedRoute>
  )
}

// Componente principal exportado - usando useToast en lugar de NotificationProvider
export default function ChatIAPage() {
  return <ChatIAPageContent />
}