'use client'

import { useState, useMemo } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  MessageSquare, 
  Users, 
  Link, 
  Search, 
  Star, 
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Filter,
  Tag,
  Clock,
  Heart,
  Download,
  Upload,
  FileText,
  Save,
  Variable,
  Sparkles,
  Zap,
  Layers,
  Grid3X3
} from 'lucide-react'
import DarkModeToggle from './DarkModeToggle'
import Tooltip from './Tooltip'
import { useToast } from './ToastProvider'
import { DraggablePromptList } from './DraggablePromptList'
import TagFilter from './TagFilter'

interface SidebarItem {
  id: string
  title: string
  type: 'prompt' | 'group' | 'chain'
  isFavorite?: boolean
  lastUsed?: Date
  groupId?: string
}

interface ChatGPTSidebarProps {
  isCollapsed: boolean
  onToggle: () => void
  items: SidebarItem[]
  selectedItem?: string
  onSelectItem: (id: string) => void
  onNewPrompt: () => void
  onNewGroup: () => void
  onNewChain: () => void
  onEditItem: (id: string) => void
  onDeleteItem: (id: string) => void
  onDuplicateItem: (id: string) => void
  onToggleFavorite: (id: string) => void
  onExportImport?: () => void
  onShowTemplates?: () => void
  onShowDrafts?: () => void
  onShowVariables?: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
  availableTags?: string[]
  selectedTags?: string[]
  onTagsChange?: (tags: string[]) => void
}

const ChatGPTSidebar = ({
  isCollapsed,
  onToggle,
  items,
  selectedItem,
  onSelectItem,
  onNewPrompt,
  onNewGroup,
  onNewChain,
  onEditItem,
  onDeleteItem,
  onDuplicateItem,
  onToggleFavorite,
  onExportImport,
  onShowTemplates,
  onShowDrafts,
  onShowVariables,
  searchQuery,
  onSearchChange,
  availableTags = [],
  selectedTags = [],
  onTagsChange
}: ChatGPTSidebarProps) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [showCreateMenu, setShowCreateMenu] = useState(false)
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites' | 'recent'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const { showToast } = useToast()

  const getIcon = (type: string) => {
    switch (type) {
      case 'prompt':
        return <MessageSquare className="w-4 h-4" />
      case 'group':
        return <Users className="w-4 h-4" />
      case 'chain':
        return <Link className="w-4 h-4" />
      default:
        return <MessageSquare className="w-4 h-4" />
    }
  }

  // Filtrar y buscar elementos
  const filteredPrompts = useMemo(() => {
    let filtered = items.filter(item => item.type === 'prompt')
    
    // Aplicar búsqueda
    if (searchQuery) {
      filtered = filtered.filter(item => 
        (item.title || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Aplicar filtros
    switch (activeFilter) {
      case 'favorites':
        filtered = filtered.filter(item => item.isFavorite)
        break
      case 'recent':
        filtered = filtered.sort((a, b) => (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0)).slice(0, 10)
        break
      default:
        break
    }
    
    return filtered
  }, [items, searchQuery, activeFilter])

  const filteredGroups = useMemo(() => {
    let filtered = items.filter(item => item.type === 'group')
    
    if (searchQuery) {
      filtered = filtered.filter(item => 
        (item.title || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    if (activeFilter === 'favorites') {
      filtered = filtered.filter(item => item.isFavorite)
    }
    
    return filtered
  }, [items, searchQuery, activeFilter])

  const filteredChains = useMemo(() => {
    let filtered = items.filter(item => item.type === 'chain')
    
    if (searchQuery) {
      filtered = filtered.filter(item => 
        (item.title || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    if (activeFilter === 'favorites') {
      filtered = filtered.filter(item => item.isFavorite)
    }
    
    return filtered
  }, [items, searchQuery, activeFilter])

  const filteredItems = items.filter(item => 
    (item.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const favoriteItems = filteredItems.filter(item => item.isFavorite)
  const recentItems = filteredItems
    .filter(item => !item.isFavorite)
    .sort((a, b) => (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0))
    .slice(0, 10)
  const otherItems = filteredItems.filter(item => 
    !item.isFavorite && !recentItems.includes(item)
  )

  const ItemComponent = ({ item }: { item: SidebarItem }) => {
    const iconElement = getIcon(item.type)
    const isActive = selectedItem === item.id
    const isDropdownOpen = activeDropdown === item.id

    return (
      <div className="group relative">
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 border ${
            isActive 
              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50 border-blue-300 dark:border-blue-600 shadow-md transform scale-[1.02]' 
              : 'hover:bg-white dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600'
          }`}
          onClick={() => onSelectItem(item.id)}
        >
          <div className={`flex-shrink-0 p-2 rounded-lg ${
            isActive
              ? 'bg-blue-100 dark:bg-blue-800'
              : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
          } transition-colors duration-200`}>
            {iconElement}
          </div>
          {!isCollapsed && (
            <>
              <span className={`flex-1 truncate text-sm font-semibold transition-colors duration-200 ${
                isActive
                  ? 'text-blue-900 dark:text-blue-100'
                  : 'text-gray-900 dark:text-gray-100'
              }`}>
                {item.title || 'Sin título'}
              </span>
              {item.isFavorite && (
                <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
              )}
              <button
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-all"
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveDropdown(isDropdownOpen ? null : item.id)
                }}
              >
                <MoreHorizontal className="w-3 h-3" />
              </button>
            </>
          )}
        </div>

        {/* Dropdown Menu */}
        {isDropdownOpen && !isCollapsed && (
          <div className="absolute right-0 top-8 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 backdrop-blur-sm">
            <button
              className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 flex items-center space-x-3 transition-all duration-200 rounded-lg mx-2"
              onClick={() => {
                onEditItem(item.id)
                setActiveDropdown(null)
              }}
            >
              <Edit className="w-4 h-4" />
              <span className="font-medium">Editar</span>
            </button>
            <button
              className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 flex items-center space-x-3 transition-all duration-200 rounded-lg mx-2"
              onClick={() => {
                onDuplicateItem(item.id)
                setActiveDropdown(null)
              }}
            >
              <Copy className="w-4 h-4" />
              <span className="font-medium">Duplicar</span>
            </button>
            <button
              className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-600 dark:hover:text-yellow-400 flex items-center space-x-3 transition-all duration-200 rounded-lg mx-2"
              onClick={() => {
                onToggleFavorite(item.id)
                setActiveDropdown(null)
              }}
            >
              <Star className={`w-4 h-4 ${item.isFavorite ? 'text-yellow-500 fill-current' : ''}`} />
              <span className="font-medium">{item.isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}</span>
            </button>
            <div className="border-t border-gray-200 dark:border-gray-700 my-2 mx-2" />
            <button
              className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 flex items-center space-x-3 transition-all duration-200 rounded-lg mx-2"
              onClick={() => {
                onDeleteItem(item.id)
                setActiveDropdown(null)
              }}
            >
              <Trash2 className="w-4 h-4" />
              <span className="font-medium">Eliminar</span>
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:relative top-0 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50
        transition-all duration-300 ease-in-out flex flex-col
        ${isCollapsed ? 'w-16' : 'w-80'}
        ${!isCollapsed ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="relative p-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-700 dark:via-purple-700 dark:to-indigo-700">
          <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
          <div className="relative flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">
                    Prompts IA
                  </h1>
                  <p className="text-xs text-white/80">
                    Gestiona tus prompts inteligentes
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-2">
              {!isCollapsed && (
                <Tooltip content="Cambiar tema" position="bottom">
                  <div className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm">
                    <DarkModeToggle />
                  </div>
                </Tooltip>
              )}
              <Tooltip content={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"} position="bottom">
                <button
                  onClick={onToggle}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-white" />
                  ) : (
                    <ChevronLeft className="w-4 h-4 text-white" />
                  )}
                </button>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Search Bar and Filters */}
        {!isCollapsed && (
          <div className="p-4 space-y-4 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar prompts, grupos, cadenas..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent shadow-sm transition-all duration-200"
              />
            </div>
            
            {/* Tag Filter */}
            {onTagsChange && (
              <TagFilter
                availableTags={availableTags}
                selectedTags={selectedTags}
                onTagsChange={onTagsChange}
              />
            )}
            
            {/* Filter Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Tooltip content="Mostrar todos los elementos" position="top">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-4 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                      activeFilter === 'all' 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md transform scale-105' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Grid3X3 className="w-3 h-3 inline mr-1" />
                    Todos
                  </button>
                </Tooltip>
                <Tooltip content="Mostrar solo favoritos" position="top">
                  <button
                    onClick={() => setActiveFilter('favorites')}
                    className={`px-4 py-2 text-xs font-medium rounded-lg transition-all duration-200 flex items-center space-x-1 ${
                      activeFilter === 'favorites' 
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md transform scale-105' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Star className="w-3 h-3" />
                    <span>Favoritos</span>
                  </button>
                </Tooltip>
                <Tooltip content="Mostrar elementos recientes" position="top">
                  <button
                    onClick={() => setActiveFilter('recent')}
                    className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors duration-200 flex items-center space-x-1 ${
                      activeFilter === 'recent' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground border border-border'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>Recientes</span>
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        )}

        {/* New Item Buttons */}
        <div className="px-4 pb-4 space-y-2">
          <Tooltip content="Crear nuevo prompt (Ctrl+N)" position="right">
            <button
              onClick={() => {
                onNewPrompt()
                showToast({ title: 'Creando nuevo prompt...', type: 'info' })
              }}
              className="w-full flex items-center gap-3 px-3 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-colors duration-200 text-sm font-medium"
            >
              <Sparkles className="w-4 h-4" />
              {!isCollapsed && 'Nuevo Prompt'}
            </button>
          </Tooltip>
          {!isCollapsed && (
            <div className="space-y-4 border-t border-border pt-4 bg-muted/30 rounded-lg">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Crear Nuevo
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Tooltip content="Crear nuevo grupo (Ctrl+G)" position="top">
                  <button
                    onClick={() => {
                      onNewGroup()
                      showToast({ title: 'Creando nuevo grupo...', type: 'info' })
                    }}
                    className="flex items-center justify-center space-x-2 px-3 py-3 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl transition-colors duration-200 text-sm font-medium"
                  >
                    <Layers className="w-4 h-4" />
                    <span>Grupo</span>
                  </button>
                </Tooltip>
                <Tooltip content="Crear nueva cadena (Ctrl+C)" position="top">
                  <button
                    onClick={() => {
                      onNewChain()
                      showToast({ title: 'Creando nueva cadena...', type: 'info' })
                    }}
                    className="flex items-center justify-center space-x-2 px-3 py-3 bg-accent text-accent-foreground hover:bg-accent/80 rounded-xl transition-colors duration-200 text-sm font-medium"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Cadena</span>
                  </button>
                </Tooltip>
              </div>
              
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 mt-6">
                Herramientas
              </div>
              <div className="grid grid-cols-2 gap-3">
                {onExportImport && (
                  <Tooltip content="Exportar/Importar prompts" position="top">
                    <button
                      onClick={() => {
                        onExportImport()
                        showToast({ title: 'Abriendo Export/Import...', type: 'info' })
                      }}
                      className="flex items-center justify-center space-x-2 px-3 py-3 bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground rounded-xl transition-colors duration-200 text-sm font-medium"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </button>
                  </Tooltip>
                )}
                {onShowTemplates && (
                  <Tooltip content="Ver plantillas" position="top">
                    <button
                      onClick={() => {
                        onShowTemplates()
                        showToast({ title: 'Abriendo templates...', type: 'info' })
                      }}
                      className="flex items-center justify-center space-x-2 px-3 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-colors duration-200 text-sm font-medium"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Templates</span>
                    </button>
                  </Tooltip>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {onShowDrafts && (
                  <Tooltip content="Gestionar borradores (Ctrl+D)" position="top">
                    <button
                      onClick={() => {
                        onShowDrafts()
                        showToast({ title: 'Abriendo borradores...', type: 'info' })
                      }}
                      className="flex items-center justify-center space-x-2 px-3 py-3 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl transition-colors duration-200 text-sm font-medium"
                    >
                      <Save className="w-4 h-4" />
                      <span>Drafts</span>
                    </button>
                  </Tooltip>
                )}
                {onShowVariables && (
                  <Tooltip content="Variables de prompts" position="top">
                    <button
                      onClick={() => {
                        onShowVariables()
                        showToast({ title: 'Abriendo variables...', type: 'info' })
                      }}
                      className="flex items-center justify-center space-x-2 px-3 py-3 bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground rounded-xl transition-colors duration-200 text-sm font-medium"
                    >
                      <Variable className="w-4 h-4" />
                      <span>Variables</span>
                    </button>
                  </Tooltip>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
          {(filteredPrompts.length + filteredGroups.length + filteredChains.length) === 0 ? (
            <div className="p-8 text-center">
              <div className="bg-muted/30 rounded-2xl p-8 border border-border">
                <div className="text-gray-400 dark:text-gray-500 mb-6">
                  {searchQuery ? (
                    <>
                      <Search className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                      <h3 className="text-lg font-semibold mb-2 text-gray-600 dark:text-gray-400">No se encontraron resultados</h3>
                      <p className="text-sm mb-4">
                        No hay elementos que coincidan con &quot;{searchQuery}&quot;
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Intenta con otros términos de búsqueda o crea un nuevo elemento.
                      </p>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                      <h3 className="text-lg font-semibold mb-2 text-gray-600 dark:text-gray-400">¡Comienza a crear!</h3>
                      <p className="text-sm mb-4">
                        No tienes prompts, grupos o cadenas aún.
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Haz clic en &quot;Nuevo Prompt&quot; para empezar a organizar tus ideas.
                      </p>
                    </>
                  )}
                </div>
                {!searchQuery && (
                  <button
                    onClick={onNewPrompt}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-colors duration-200 font-medium"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Crear mi primer prompt</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Prompts */}
              {filteredPrompts.length > 0 && (
                <div>
                  {!isCollapsed && (
                    <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center space-x-2 bg-muted/30 px-3 py-2 rounded-lg">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      <span>Prompts ({filteredPrompts.length})</span>
                    </h3>
                  )}
                  <DraggablePromptList
                    prompts={filteredPrompts.map(item => ({
                      id: item.id,
                      title: item.title,
                      description: '',
                      content: '',
                      category: 'general' as const,
                      tags: [],
                      variables: [],
                      isPublic: false,
                      isFavorite: item.isFavorite || false,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      userId: ''
                    }))}
                    onReorder={(reorderedPrompts) => {
                      // Handle reordering logic here
                      console.log('Prompts reordered:', reorderedPrompts)
                    }}
                    onEdit={(prompt) => onEditItem && onEditItem(prompt.id)}
                    onDelete={(id) => onDeleteItem && onDeleteItem(id)}
                    onDuplicate={(prompt) => onDuplicateItem && onDuplicateItem(prompt.id)}
                    onUse={(prompt) => onSelectItem(prompt.id)}
                  />
                </div>
              )}

              {/* Groups */}
              {filteredGroups.length > 0 && (
                <div>
                  {!isCollapsed && (
                    <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center space-x-2 bg-muted/30 px-3 py-2 rounded-lg">
                      <Layers className="w-4 h-4 text-primary" />
                      <span>Grupos ({filteredGroups.length})</span>
                    </h3>
                  )}
                  <div className="space-y-3">
                    {filteredGroups.map(item => (
                      <ItemComponent key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              )}

              {/* Chains */}
              {filteredChains.length > 0 && (
                <div>
                  {!isCollapsed && (
                    <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center space-x-2 bg-muted/30 px-3 py-2 rounded-lg">
                      <Zap className="w-4 h-4 text-primary" />
                      <span>Cadenas ({filteredChains.length})</span>
                    </h3>
                  )}
                  <div className="space-y-3">
                    {filteredChains.map(item => (
                      <ItemComponent key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {activeDropdown && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </>
  )
}

export default ChatGPTSidebar
