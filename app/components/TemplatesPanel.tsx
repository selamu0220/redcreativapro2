'use client'

import React, { useState } from 'react'
import { Search, Plus, Edit, Trash2, Copy, Play, Filter, Grid, List, Star } from 'lucide-react'
import { Button } from './ui/button'
import { useTemplates } from '../hooks/useTemplates'
import { usePrompts } from '../hooks/usePrompts'
import { useToast } from './ToastProvider'

interface TemplatesPanelProps {
  onSelectTemplate?: (templateId: string, variables: Record<string, string>) => void
}

type ViewMode = 'grid' | 'list'
type SortBy = 'name' | 'category' | 'usage' | 'recent'
type FilterBy = 'all' | 'coding' | 'writing' | 'analysis' | 'creative' | 'business' | 'education' | 'custom'

const TemplatesPanel: React.FC<TemplatesPanelProps> = ({ onSelectTemplate }) => {
  const { templates, getTemplatesByCategory, createPromptFromTemplate, deleteTemplate, incrementUsage } = useTemplates()
  const { createPrompt } = usePrompts()
  const { showToast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortBy>('category')
  const [filterBy, setFilterBy] = useState<FilterBy>('all')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({})
  const [showVariableModal, setShowVariableModal] = useState(false)

  // Filter and sort templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = (template.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (template.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (template.category || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterBy === 'all' || 
                         (filterBy === 'custom' && !template.isBuiltIn) ||
                         (filterBy !== 'custom' && template.category === filterBy)
    
    return matchesSearch && matchesFilter
  }).sort((a, b) => {
    try {
      switch (sortBy) {
        case 'name':
          const nameA = a.name || '';
          const nameB = b.name || '';
          console.log('🔍 TemplatesPanel sorting by name:', { nameA, nameB, typeA: typeof nameA, typeB: typeof nameB });
          return nameA.localeCompare(nameB)
        case 'category':
          const categoryA = a.category || '';
          const categoryB = b.category || '';
          console.log('🔍 TemplatesPanel sorting by category:', { categoryA, categoryB, typeA: typeof categoryA, typeB: typeof categoryB });
          return categoryA.localeCompare(categoryB) || (a.name || '').localeCompare(b.name || '')
        case 'usage':
          return (b.usageCount || 0) - (a.usageCount || 0)
        case 'recent':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        default:
          return 0
      }
    } catch (error) {
      console.error('❌ Error in TemplatesPanel sorting:', error);
      console.error('Template A:', a);
      console.error('Template B:', b);
      console.error('Sort by:', sortBy);
      return 0;
    }
  })

  const handleUseTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (!template) return

    if (template.variables && template.variables.length > 0) {
      // Show variable input modal
      setSelectedTemplate(templateId)
      setTemplateVariables({})
      setShowVariableModal(true)
    } else {
      // Create prompt directly
      const promptData = createPromptFromTemplate(templateId, {})
      if (promptData) {
        createPrompt(promptData)
        showToast({ title: `Prompt creado desde plantilla: ${template.name}`, type: 'success' })
        if (onSelectTemplate) {
          onSelectTemplate(templateId, {})
        }
      }
    }
  }

  const handleCreateFromTemplate = () => {
    if (!selectedTemplate) return

    const template = templates.find(t => t.id === selectedTemplate)
    if (!template) return

    const promptData = createPromptFromTemplate(selectedTemplate, templateVariables)
    if (promptData) {
      createPrompt(promptData)
      showToast({ title: `Prompt creado desde plantilla: ${template.name}`, type: 'success' })
      setShowVariableModal(false)
      setSelectedTemplate(null)
      setTemplateVariables({})
      
      if (onSelectTemplate) {
        onSelectTemplate(selectedTemplate, templateVariables)
      }
    }
  }

  const handleDeleteTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (!template) return

    if (template.isBuiltIn) {
      showToast({ title: 'No se pueden eliminar plantillas integradas', type: 'error' })
      return
    }

    if (confirm(`¿Estás seguro de que quieres eliminar la plantilla "${template.name}"?`)) {
      deleteTemplate(templateId)
      showToast({ title: 'Plantilla eliminada exitosamente', type: 'success' })
    }
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      coding: '💻',
      writing: '✍️',
      analysis: '📊',
      creative: '💡',
      business: '📈',
      education: '🎓'
    }
    return icons[category as keyof typeof icons] || '📝'
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      coding: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      writing: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      analysis: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      creative: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      business: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      education: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
  }

  const selectedTemplateData = selectedTemplate ? templates.find(t => t.id === selectedTemplate) : null

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Prompt Templates
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 text-sm">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="category">Sort by Category</option>
            <option value="name">Sort by Name</option>
            <option value="usage">Sort by Usage</option>
            <option value="recent">Sort by Recent</option>
          </select>
          
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as FilterBy)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Categories</option>
            <option value="coding">💻 Coding</option>
            <option value="writing">✍️ Writing</option>
            <option value="analysis">📊 Analysis</option>
            <option value="creative">💡 Creative</option>
            <option value="business">📈 Business</option>
            <option value="education">🎓 Education</option>
            <option value="custom">🔧 Custom</option>
          </select>
        </div>
      </div>

      {/* Templates List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {searchTerm ? 'No templates match your search.' : 'No templates available.'}
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow ${
                  viewMode === 'list' ? 'flex items-center gap-4' : ''
                }`}
              >
                <div className={`flex-1 ${viewMode === 'list' ? 'flex items-center gap-4' : ''}`}>
                  <div className={viewMode === 'list' ? 'flex-1' : ''}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{template.icon}</span>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {template.name}
                          </h3>
                          {template.isBuiltIn && (
                            <span className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                              <Star className="w-3 h-3" />
                              Built-in
                            </span>
                          )}
                        </div>
                      </div>
                      {viewMode === 'grid' && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleUseTemplate(template.id)}
                            className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Use template"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                          {!template.isBuiltIn && (
                            <button
                              onClick={() => handleDeleteTemplate(template.id)}
                              className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete template"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {template.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                          {getCategoryIcon(template.category)} {template.category}
                        </span>
                        {(template.usageCount || 0) > 0 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Used {template.usageCount || 0} times
                          </span>
                        )}
                      </div>
                      
                      {template.variables && template.variables.length > 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {template.variables.length} variables
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {viewMode === 'list' && (
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleUseTemplate(template.id)}
                        className="text-sm flex items-center gap-1"
                        size="sm"
                      >
                        <Play className="w-3 h-3" />
                        Use
                      </Button>
                      {!template.isBuiltIn && (
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete template"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Variable Input Modal */}
      {showVariableModal && selectedTemplateData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Configure Template: {selectedTemplateData.name}
              </h3>
              <button
                onClick={() => setShowVariableModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedTemplateData.description}
              </p>
              
              {selectedTemplateData.variables?.map((variable: string) => (
                <div key={variable}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {variable.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </label>
                  <input
                    type="text"
                    value={templateVariables[variable] || ''}
                    onChange={(e) => setTemplateVariables(prev => ({
                      ...prev,
                      [variable]: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={`Enter ${variable.replace(/_/g, ' ')}`}
                  />
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowVariableModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <Button
                onClick={handleCreateFromTemplate}
              >
                Create Prompt
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TemplatesPanel
