'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { EmailCollectionPageData } from '../../lib/database'
import QualificationFormConfig from '../../components/QualificationFormConfig'
import { Plus, Edit3, Trash2, ExternalLink, Settings, Users, BarChart3, Copy, Check } from 'lucide-react'

export default function EmailPagesPage() {
  const { user } = useAuth()
  const [pages, setPages] = useState<EmailCollectionPageData[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPage, setEditingPage] = useState<EmailCollectionPageData | null>(null)
  const [showNewPageForm, setShowNewPageForm] = useState(false)
  const [configuringQualification, setConfiguringQualification] = useState<string | null>(null)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  
  const [newPageData, setNewPageData] = useState({
    title: '',
    description: '',
    buttonText: 'Suscribirse',
    successMessage: '¡Gracias por suscribirte!',
    collectName: true,
    customFields: [] as any[]
  })

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    if (!user?.email) return
    
    try {
      const response = await fetch('/api/email-pages', {
        headers: {
          'x-user-email': user.email
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setPages(data.pages || [])
      }
    } catch (error) {
      console.error('Error fetching pages:', error)
    } finally {
      setLoading(false)
    }
  }

  const createPage = async () => {
    if (!user?.email) return
    
    try {
      const response = await fetch('/api/email-pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email
        },
        body: JSON.stringify(newPageData)
      })
      
      if (response.ok) {
        await fetchPages()
        setShowNewPageForm(false)
        setNewPageData({
          title: '',
          description: '',
          buttonText: 'Suscribirse',
          successMessage: '¡Gracias por suscribirte!',
          collectName: true,
          customFields: []
        })
      }
    } catch (error) {
      console.error('Error creating page:', error)
    }
  }

  const updatePage = async (pageData: Partial<EmailCollectionPageData>) => {
    if (!user?.email || !editingPage) return
    
    try {
      const response = await fetch('/api/email-pages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email
        },
        body: JSON.stringify({ ...editingPage, ...pageData })
      })
      
      if (response.ok) {
        await fetchPages()
        setEditingPage(null)
      }
    } catch (error) {
      console.error('Error updating page:', error)
    }
  }

  const deletePage = async (pageId: string) => {
    if (!user?.email) return
    
    if (!confirm('¿Estás seguro de que quieres eliminar esta página?')) return
    
    try {
      const response = await fetch('/api/email-pages', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email
        },
        body: JSON.stringify({ id: pageId })
      })
      
      if (response.ok) {
        await fetchPages()
      }
    } catch (error) {
      console.error('Error deleting page:', error)
    }
  }

  const copyPageUrl = async (pageId: string) => {
    const url = `${window.location.origin}/collect/${pageId}`
    try {
      await navigator.clipboard.writeText(url)
      setCopiedUrl(pageId)
      setTimeout(() => setCopiedUrl(null), 2000)
    } catch (error) {
      console.error('Error copying URL:', error)
    }
  }

  const handleQualificationSave = async (pageId: string, config: any) => {
    const page = pages.find(p => p.id === pageId)
    if (!page) return
    
    await updatePage({ qualificationForm: config })
    setConfiguringQualification(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-800 rounded w-1/3"></div>
            <div className="h-4 bg-gray-800 rounded w-2/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-gray-800 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Páginas de Captura</h1>
            <p className="text-gray-400">Gestiona tus formularios de suscripción y cuestionarios de cualificación</p>
          </div>
          <button
            onClick={() => setShowNewPageForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus size={20} />
            <span>Nueva Página</span>
          </button>
        </div>

        {/* Configuración de cuestionario */}
        {configuringQualification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Configurar Cuestionario de Cualificación</h2>
                <button
                  onClick={() => setConfiguringQualification(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <QualificationFormConfig
                pageId={configuringQualification}
                initialConfig={pages.find(p => p.id === configuringQualification)?.qualificationForm}
                onSave={(config) => handleQualificationSave(configuringQualification, config)}
              />
            </div>
          </div>
        )}

        {/* Formulario nueva página */}
        {showNewPageForm && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Crear Nueva Página</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Título</label>
                <input
                  type="text"
                  value={newPageData.title}
                  onChange={(e) => setNewPageData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  placeholder="Título de la página"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Texto del botón</label>
                <input
                  type="text"
                  value={newPageData.buttonText}
                  onChange={(e) => setNewPageData(prev => ({ ...prev, buttonText: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  placeholder="Suscribirse"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
                <textarea
                  value={newPageData.description}
                  onChange={(e) => setNewPageData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  rows={3}
                  placeholder="Descripción de la página"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Mensaje de éxito</label>
                <input
                  type="text"
                  value={newPageData.successMessage}
                  onChange={(e) => setNewPageData(prev => ({ ...prev, successMessage: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  placeholder="¡Gracias por suscribirte!"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewPageForm(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={createPage}
                disabled={!newPageData.title || !newPageData.description}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded transition-colors"
              >
                Crear Página
              </button>
            </div>
          </div>
        )}

        {/* Lista de páginas */}
        {pages.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No tienes páginas de captura</h3>
            <p className="text-gray-500 mb-6">Crea tu primera página para empezar a capturar leads</p>
            <button
              onClick={() => setShowNewPageForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
            >
              <Plus size={20} />
              <span>Crear Primera Página</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((page) => (
              <div key={page.id} className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{page.title}</h3>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{page.description}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className={`px-2 py-1 rounded ${
                        page.isActive ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                      }`}>
                        {page.isActive ? 'Activa' : 'Inactiva'}
                      </span>
                      
                      {page.qualificationForm?.enabled && (
                        <span className="px-2 py-1 bg-blue-900 text-blue-300 rounded">
                          Cuestionario: {page.qualificationForm.questions.length} preguntas
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-1">
                    <button
                      onClick={() => copyPageUrl(page.id)}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                      title="Copiar URL"
                    >
                      {copiedUrl === page.id ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                    <button
                      onClick={() => setEditingPage(page)}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                      title="Editar"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => deletePage(page.id)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <a
                    href={`/collect/${page.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm flex items-center justify-center space-x-2 transition-colors"
                  >
                    <ExternalLink size={16} />
                    <span>Ver Página</span>
                  </a>
                  
                  <button
                    onClick={() => setConfiguringQualification(page.id)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Settings size={16} />
                    <span>Configurar Cuestionario</span>
                  </button>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Creada: {new Date(page.createdAt).toLocaleDateString()}</span>
                    <span>ID: {page.id.slice(0, 8)}...</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de edición */}
        {editingPage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full">
              <h2 className="text-xl font-semibold text-white mb-4">Editar Página</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Título</label>
                  <input
                    type="text"
                    value={editingPage.title}
                    onChange={(e) => setEditingPage(prev => prev ? { ...prev, title: e.target.value } : null)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
                  <textarea
                    value={editingPage.description}
                    onChange={(e) => setEditingPage(prev => prev ? { ...prev, description: e.target.value } : null)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Texto del botón</label>
                    <input
                      type="text"
                      value={editingPage.buttonText}
                      onChange={(e) => setEditingPage(prev => prev ? { ...prev, buttonText: e.target.value } : null)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Mensaje de éxito</label>
                    <input
                      type="text"
                      value={editingPage.successMessage}
                      onChange={(e) => setEditingPage(prev => prev ? { ...prev, successMessage: e.target.value } : null)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editingPage.isActive}
                      onChange={(e) => setEditingPage(prev => prev ? { ...prev, isActive: e.target.checked } : null)}
                      className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300">Página activa</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editingPage.collectName}
                      onChange={(e) => setEditingPage(prev => prev ? { ...prev, collectName: e.target.checked } : null)}
                      className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300">Recopilar nombre</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setEditingPage(null)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => updatePage(editingPage)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}