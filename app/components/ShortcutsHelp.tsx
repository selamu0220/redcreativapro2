'use client'

import { useState } from 'react'
import { X, Keyboard, Search, Plus, Save, Play, Copy, Trash2, Eye, EyeOff } from 'lucide-react'


interface ShortcutsHelpProps {
  isOpen: boolean
  onClose: () => void
}

interface ShortcutCategory {
  title: string
  icon: React.ReactNode
  shortcuts: Array<{
    keys: string
    description: string
    example?: string
  }>
}

const ShortcutsHelp = ({ isOpen, onClose }: ShortcutsHelpProps) => {
  const [activeCategory, setActiveCategory] = useState(0)

  const categories: ShortcutCategory[] = [
    {
      title: 'Navegación',
      icon: <Search className="w-4 h-4" />,
      shortcuts: [
        {
          keys: 'Ctrl + K',
          description: 'Buscar prompts, grupos y cadenas',
          example: 'Abre la barra de búsqueda'
        },
        {
          keys: 'Ctrl + B',
          description: 'Mostrar/ocultar sidebar',
          example: 'Alterna la visibilidad del panel lateral'
        },
        {
          keys: 'Escape',
          description: 'Cerrar modales o cancelar acciones',
          example: 'Cierra cualquier modal abierto'
        },
        {
          keys: 'Ctrl + /',
          description: 'Mostrar esta ayuda',
          example: 'Abre el panel de ayuda de shortcuts'
        }
      ]
    },
    {
      title: 'Creación',
      icon: <Plus className="w-4 h-4" />,
      shortcuts: [
        {
          keys: 'Ctrl + N',
          description: 'Crear nuevo prompt',
          example: 'Abre el modal de creación de prompt'
        },
        {
          keys: 'Ctrl + G',
          description: 'Crear nuevo grupo',
          example: 'Abre el modal de creación de grupo'
        },
        {
          keys: 'Ctrl + H',
          description: 'Crear nueva cadena',
          example: 'Abre el modal de creación de cadena'
        }
      ]
    },
    {
      title: 'Edición',
      icon: <Save className="w-4 h-4" />,
      shortcuts: [
        {
          keys: 'Ctrl + S',
          description: 'Guardar prompt actual',
          example: 'Guarda los cambios del prompt en edición'
        },
        {
          keys: 'Ctrl + D',
          description: 'Duplicar prompt seleccionado',
          example: 'Crea una copia del prompt actual'
        },
        {
          keys: 'Delete',
          description: 'Eliminar prompt seleccionado',
          example: 'Elimina el prompt actualmente seleccionado'
        }
      ]
    },
    {
      title: 'Ejecución',
      icon: <Play className="w-4 h-4" />,
      shortcuts: [
        {
          keys: 'Ctrl + Enter',
          description: 'Ejecutar prompt en el chat',
          example: 'Envía el prompt al área de chat'
        },
        {
          keys: 'Alt + Enter',
          description: 'Ejecutar cadena de prompts',
          example: 'Ejecuta todos los prompts de una cadena'
        }
      ]
    }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Keyboard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Shortcuts de Teclado
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Acelera tu flujo de trabajo con estos atajos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex h-[500px]">
          {/* Categories Sidebar */}
          <div className="w-64 bg-gray-50 dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-700">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Categorías
              </h3>
              <div className="space-y-1">
                {categories.map((category, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveCategory(index)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeCategory === index
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {category.icon}
                    <span className="text-sm font-medium">{category.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Shortcuts Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-6">
                {categories[activeCategory].icon}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {categories[activeCategory].title}
                </h3>
              </div>

              <div className="space-y-3">
                {categories[activeCategory].shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex items-center space-x-1">
                          {shortcut.keys.split(' + ').map((key, keyIndex) => (
                            <div key={keyIndex} className="flex items-center">
                              {keyIndex > 0 && (
                                <span className="mx-1 text-gray-400 text-xs">+</span>
                              )}
                              <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono text-gray-700 dark:text-gray-300 shadow-sm">
                                {key}
                              </kbd>
                            </div>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        {shortcut.description}
                      </p>
                      {shortcut.example && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {shortcut.example}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <Keyboard className="w-3 h-3" />
              <span>Los shortcuts funcionan en toda la aplicación</span>
            </div>
            <div className="flex items-center space-x-2">
              <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono text-gray-700 dark:text-gray-300">
                Ctrl + /
              </kbd>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                para abrir esta ayuda
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShortcutsHelp
