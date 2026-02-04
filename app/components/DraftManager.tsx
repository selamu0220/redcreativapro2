'use client'

import React, { useState, useEffect } from 'react'
import { X, Save, Clock, Trash2, Check, AlertCircle, FileText, MessageSquare, Link } from 'lucide-react'
import { useAutoSave } from '../hooks/useAutoSave'
import { useAuth } from '../hooks/useAuth'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from './ui/button'

interface Draft {
  id: string
  name: string
  content: string
  type: 'prompt' | 'group' | 'chain'
  category?: string
  tags?: string[]
  variables?: Record<string, string>
  lastSaved: string
  userId?: string
}

interface DraftManagerProps {
  isOpen: boolean
  onClose: () => void
  onLoadDraft: (draft: Draft) => void
}

const DraftManager: React.FC<DraftManagerProps> = ({ isOpen, onClose, onLoadDraft }) => {
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [selectedDraft, setSelectedDraft] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'prompt' | 'group' | 'chain'>('all')
  const { user } = useAuth()

  // Cargar borradores desde localStorage
  const loadDrafts = () => {
    try {
      const savedDrafts = localStorage.getItem('ai_prompts_drafts')
      if (savedDrafts) {
        const parsedDrafts = JSON.parse(savedDrafts)
        setDrafts(parsedDrafts.filter((draft: Draft) => 
          !user || draft.userId === user.id
        ))
      }
    } catch (error) {
      console.error('Error loading drafts:', error)
    }
  }

  // Eliminar borrador
  const handleDeleteDraft = (draft: Draft) => {
    if (confirm(`¿Estás seguro de que quieres eliminar el borrador "${draft.name || 'Sin título'}"?`)) {
      try {
        const savedDrafts = localStorage.getItem('ai_prompts_drafts')
        if (savedDrafts) {
          const parsedDrafts = JSON.parse(savedDrafts)
          const updatedDrafts = parsedDrafts.filter((d: Draft) => d.id !== draft.id)
          localStorage.setItem('ai_prompts_drafts', JSON.stringify(updatedDrafts))
          loadDrafts()
          if (selectedDraft === draft.id) {
            setSelectedDraft(null)
          }
        }
      } catch (error) {
        console.error('Error deleting draft:', error)
      }
    }
  }

  // Cargar borrador seleccionado
  const handleLoadDraft = (draft: Draft) => {
    onLoadDraft(draft)
    onClose()
  }

  // Filtrar borradores
  const filteredDrafts = drafts.filter(draft => {
    const matchesSearch = !searchTerm || 
      (draft.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (draft.content || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (draft.category && draft.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (draft.tags && draft.tags.some(tag => (tag || '').toLowerCase().includes(searchTerm.toLowerCase())))
    
    const matchesType = filterType === 'all' || draft.type === filterType
    
    return matchesSearch && matchesType
  })

  // Obtener color según el tipo
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'prompt': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
      case 'group': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
      case 'chain': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
      default: return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300'
    }
  }

  // Obtener icono según el tipo
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'prompt': return <FileText className="w-3 h-3" />
      case 'group': return <MessageSquare className="w-3 h-3" />
      case 'chain': return <Link className="w-3 h-3" />
      default: return <FileText className="w-3 h-3" />
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadDrafts()
    }
  }, [isOpen, user])

  if (!isOpen) return null

  const renderDraftPreview = () => {
    if (!selectedDraft) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Selecciona un borrador para ver su vista previa
            </p>
          </div>
        </div>
      )
    }

    const draft = drafts.find(d => d.id === selectedDraft)
    if (!draft) return null

    return (
      <div className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Vista Previa
            </h3>
            <Button
              onClick={() => handleLoadDraft(draft)}
              className="flex items-center space-x-2"
            >
              <Check className="w-4 h-4" />
              <span>Cargar Borrador</span>
            </Button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre
              </label>
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border text-sm">
                {draft.name || 'Sin título'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo
              </label>
              <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-sm ${getTypeColor(draft.type)}`}>
                {getTypeIcon(draft.type)}
                <span className="capitalize">{draft.type}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contenido
              </label>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border text-sm max-h-40 overflow-y-auto whitespace-pre-wrap">
                {draft.content || 'Sin contenido'}
              </div>
            </div>

            {draft.variables && Object.keys(draft.variables).length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Variables ({Object.keys(draft.variables).length})
                </label>
                <div className="space-y-2">
                  {Object.entries(draft.variables).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2 text-sm">
                      <code className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                        {`{${key}}`}
                      </code>
                      <span className="text-gray-600 dark:text-gray-400">=</span>
                      <span className="text-gray-900 dark:text-white">
                        {value || 'Sin valor'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {draft.tags && draft.tags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Etiquetas
                </label>
                <div className="flex flex-wrap gap-1">
                  {draft.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="w-3 h-3" />
                <span>
                  Guardado {draft.lastSaved 
                    ? formatDistanceToNow(new Date(draft.lastSaved), { 
                        addSuffix: true, 
                        locale: es 
                      })
                    : 'en fecha desconocida'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-6xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Save className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Gestor de Borradores
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Administra y carga tus borradores guardados
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Lista de borradores */}
          <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Filtros */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
              <input
                type="text"
                placeholder="Buscar borradores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <div className="flex space-x-2">
                {(['all', 'prompt', 'group', 'chain'] as const).map((type) => (
                  <Button
                    key={type}
                    onClick={() => setFilterType(type)}
                    variant={filterType === type ? 'default' : 'outline'}
                    size="sm"
                  >
                    {type === 'all' ? 'Todos' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto">
              {filteredDrafts.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Save className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {drafts.length === 0 ? 'No hay borradores guardados' : 'No se encontraron borradores'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 space-y-2">
                  {filteredDrafts.map((draft) => (
                    <div
                      key={draft.id}
                      onClick={() => setSelectedDraft(draft.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        selectedDraft === draft.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <div className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs ${getTypeColor(draft.type)}`}>
                              {getTypeIcon(draft.type)}
                              <span className="capitalize">{draft.type}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {draft.name || 'Sin título'}
                            </span>
                          </div>
                          
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                            {draft.content ? draft.content.substring(0, 100) : 'Sin contenido disponible'}...
                          </p>
                          
                          <div className="flex items-center space-x-3 text-xs text-gray-400 dark:text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>
                                {draft.lastSaved 
                                  ? formatDistanceToNow(new Date(draft.lastSaved), { 
                                      addSuffix: true, 
                                      locale: es 
                                    })
                                  : 'Fecha desconocida'
                                }
                              </span>
                            </div>
                            
                            {draft.category && (
                              <span className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                                {draft.category}
                              </span>
                            )}
                            
                            {draft.variables && Object.keys(draft.variables).length > 0 && (
                              <span className="text-purple-600 dark:text-purple-400">
                                {Object.keys(draft.variables).length} variables
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteDraft(draft)
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Vista previa del borrador seleccionado */}
          <div className="w-1/2 overflow-y-auto">
            {renderDraftPreview()}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <Save className="w-3 h-3" />
              <span>Los borradores se guardan automáticamente cada 2 segundos</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>{drafts.length} borradores disponibles</span>
              <Button
                onClick={loadDrafts}
                variant="ghost"
                size="sm"
              >
                Actualizar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DraftManager
