'use client'

import React, { useState, useMemo } from 'react'
import { X, Search, PenTool, Briefcase, Code, Megaphone, GraduationCap, BarChart3, Tag, Copy } from 'lucide-react'
import { templateCategories, promptTemplates, getTemplatesByCategory, searchTemplates, type PromptTemplate, type TemplateCategory } from '../data/promptTemplates'
import { useToast } from './ToastProvider'

interface TemplatesModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: PromptTemplate) => void
}

const categoryIcons = {
  PenTool,
  Briefcase,
  Code,
  Megaphone,
  GraduationCap,
  BarChart3
}

const categoryColors = {
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  green: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
  teal: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300'
}

const TemplatesModal: React.FC<TemplatesModalProps> = ({ isOpen, onClose, onSelectTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null)
  const { showToast } = useToast()

  const filteredTemplates = useMemo(() => {
    if (searchQuery) {
      return searchTemplates(searchQuery)
    }
    if (selectedCategory === 'all') {
      return promptTemplates
    }
    return getTemplatesByCategory(selectedCategory)
  }, [selectedCategory, searchQuery])

  const handleSelectTemplate = (template: PromptTemplate) => {
    onSelectTemplate(template)
    onClose()
  }

  const handleCopyTemplate = (template: PromptTemplate, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(template.content)
    showToast({ title: 'Template copiado al portapapeles', type: 'success' })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-6xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Templates de Prompts</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Selecciona un template predefinido para comenzar</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Categories */}
          <div className="w-64 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
            <div className="space-y-2">
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar templates..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setSelectedCategory('all')
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* All Templates */}
              <button
                onClick={() => {
                  setSelectedCategory('all')
                  setSearchQuery('')
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Tag className="w-4 h-4" />
                <div>
                  <div className="font-medium">Todos</div>
                  <div className="text-xs opacity-75">{promptTemplates.length} templates</div>
                </div>
              </button>

              {/* Categories */}
              {templateCategories.map((category) => {
                const IconComponent = categoryIcons[category.icon as keyof typeof categoryIcons]
                const templatesCount = getTemplatesByCategory(category.id).length
                
                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id)
                      setSearchQuery('')
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      selectedCategory === category.id
                        ? categoryColors[category.color as keyof typeof categoryColors]
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <div>
                      <div className="font-medium">{category.name}</div>
                      <div className="text-xs opacity-75">{templatesCount} templates</div>
                    </div>
                  </button>
                )
              })}            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex">
            {/* Templates List */}
            <div className="w-1/2 p-4 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
              <div className="space-y-3">
                {filteredTemplates.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No se encontraron templates</p>
                    <p className="text-sm mt-1">Intenta con otros términos de búsqueda</p>
                  </div>
                ) : (
                  filteredTemplates.map((template) => {
                    const category = templateCategories.find(cat => cat.id === template.category)
                    const IconComponent = category ? categoryIcons[category.icon as keyof typeof categoryIcons] : Tag
                    
                    return (
                      <div
                        key={template.id}
                        onClick={() => setSelectedTemplate(template)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          selectedTemplate?.id === template.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <IconComponent className="w-4 h-4 text-gray-500" />
                              <h3 className="font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{template.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {template.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            {template.variables && template.variables.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Variables:</p>
                                <div className="flex flex-wrap gap-1">
                                  {template.variables.map((variable) => (
                                    <code
                                      key={variable}
                                      className="px-1 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs rounded"
                                    >
                                      {`{{${variable}}}`}
                                    </code>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={(e) => handleCopyTemplate(template, e)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                            title="Copiar template"
                          >
                            <Copy className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Template Preview */}
            <div className="w-1/2 p-4 overflow-y-auto">
              {selectedTemplate ? (
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {selectedTemplate.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{selectedTemplate.description}</p>
                    
                    {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                      <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                          Variables a reemplazar:
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedTemplate.variables.map((variable) => (
                            <code
                              key={variable}
                              className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs rounded"
                            >
                              {`{{${variable}}}`}
                            </code>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vista previa:</h4>
                    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono">
                        {selectedTemplate.content}
                      </pre>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSelectTemplate(selectedTemplate)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                    >
                      Usar Template
                    </button>
                    <button
                      onClick={(e) => handleCopyTemplate(selectedTemplate, e)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copiar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <PenTool className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Selecciona un template para ver la vista previa</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TemplatesModal