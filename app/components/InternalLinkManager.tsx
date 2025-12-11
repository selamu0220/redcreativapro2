'use client'

import React, { useState, useEffect } from 'react'
import { InternalLinkingService, LinkSuggestion, PageLinkProfile } from '@/lib/internal-linking'
import { blogPosts } from '@/lib/blog-data'

interface InternalLinkManagerProps {
  pageId: string
  content: string
  onLinksUpdate?: (links: Array<{
    position: number
    anchorText: string
    targetUrl: string
    targetTitle: string
  }>) => void
}

export default function InternalLinkManager({ 
  pageId, 
  content, 
  onLinksUpdate 
}: InternalLinkManagerProps) {
  const [linkingService] = useState(() => new InternalLinkingService(blogPosts))
  const [suggestions, setSuggestions] = useState<LinkSuggestion[]>([])
  const [automatedLinks, setAutomatedLinks] = useState<Array<{
    position: number
    anchorText: string
    targetUrl: string
    targetTitle: string
  }>>([])
  const [pageProfile, setPageProfile] = useState<PageLinkProfile | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (content && pageId) {
      analyzePage()
    }
  }, [pageId, content])

  const analyzePage = async () => {
    setIsAnalyzing(true)
    
    try {
      // Generate link suggestions
      const newSuggestions = linkingService.generateLinkSuggestions(pageId, content, 8)
      setSuggestions(newSuggestions)

      // Generate automated links
      const autoLinks = linkingService.generateAutomatedLinks(pageId, content, 3)
      setAutomatedLinks(autoLinks)

      // Analyze page profile (mock existing links for demo)
      const mockExistingLinks: any[] = []
      const profile = linkingService.analyzePageLinkProfile(pageId, mockExistingLinks)
      setPageProfile(profile)

      // Notify parent component
      if (onLinksUpdate) {
        onLinksUpdate(autoLinks)
      }
    } catch (error) {
      console.error('Error analyzing page:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const toggleSuggestion = (suggestionId: string) => {
    const newSelected = new Set(selectedSuggestions)
    if (newSelected.has(suggestionId)) {
      newSelected.delete(suggestionId)
    } else {
      newSelected.add(suggestionId)
    }
    setSelectedSuggestions(newSelected)
  }

  const applySelectedSuggestions = () => {
    const selectedSuggestionObjects = suggestions.filter(s => 
      selectedSuggestions.has(s.targetPageId)
    )

    // Convert suggestions to automated links format
    const newLinks = selectedSuggestionObjects.map((suggestion, index) => ({
      position: index * 100, // Distribute evenly
      anchorText: suggestion.anchorText,
      targetUrl: suggestion.targetUrl,
      targetTitle: suggestion.targetTitle
    }))

    setAutomatedLinks(prev => [...prev, ...newLinks])
    
    if (onLinksUpdate) {
      onLinksUpdate([...automatedLinks, ...newLinks])
    }

    setSelectedSuggestions(new Set())
  }

  const removeAutomatedLink = (index: number) => {
    const newLinks = automatedLinks.filter((_, i) => i !== index)
    setAutomatedLinks(newLinks)
    
    if (onLinksUpdate) {
      onLinksUpdate(newLinks)
    }
  }

  const getRelevanceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50'
    if (score >= 0.6) return 'text-blue-600 bg-blue-50'
    if (score >= 0.4) return 'text-yellow-600 bg-yellow-50'
    return 'text-gray-600 bg-gray-50'
  }

  const getRelevanceLabel = (score: number) => {
    if (score >= 0.8) return 'Alta'
    if (score >= 0.6) return 'Media'
    if (score >= 0.4) return 'Baja'
    return 'Mínima'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Gestor de Enlaces Internos
        </h3>
        <button
          onClick={analyzePage}
          disabled={isAnalyzing}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? 'Analizando...' : 'Reanalizar'}
        </button>
      </div>

      {/* Page Profile */}
      {pageProfile && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Perfil de Enlaces</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Enlaces salientes:</span>
              <span className="ml-2 font-medium">{pageProfile.internalLinksOut}</span>
            </div>
            <div>
              <span className="text-gray-600">Enlaces entrantes:</span>
              <span className="ml-2 font-medium">{pageProfile.internalLinksIn}</span>
            </div>
            <div>
              <span className="text-gray-600">Densidad:</span>
              <span className="ml-2 font-medium">{pageProfile.linkDensity.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-600">Hub Score:</span>
              <span className="ml-2 font-medium">{pageProfile.hubScore.toFixed(2)}</span>
            </div>
          </div>
          {pageProfile.orphanStatus && (
            <div className="mt-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded">
              ⚠️ Página huérfana: No tiene enlaces entrantes
            </div>
          )}
        </div>
      )}

      {/* Automated Links */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">
          Enlaces Automáticos Aplicados ({automatedLinks.length})
        </h4>
        {automatedLinks.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay enlaces automáticos aplicados</p>
        ) : (
          <div className="space-y-2">
            {automatedLinks.map((link, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex-1">
                  <div className="font-medium text-green-800">
                    {link.anchorText}
                  </div>
                  <div className="text-sm text-green-600">
                    → {link.targetTitle}
                  </div>
                  <div className="text-xs text-green-500">
                    Posición: palabra {link.position}
                  </div>
                </div>
                <button
                  onClick={() => removeAutomatedLink(index)}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Eliminar enlace"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Link Suggestions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">
            Sugerencias de Enlaces ({suggestions.length})
          </h4>
          {selectedSuggestions.size > 0 && (
            <button
              onClick={applySelectedSuggestions}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
            >
              Aplicar Seleccionados ({selectedSuggestions.size})
            </button>
          )}
        </div>

        {suggestions.length === 0 ? (
          <p className="text-gray-500 text-sm">
            {isAnalyzing ? 'Generando sugerencias...' : 'No hay sugerencias disponibles'}
          </p>
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.targetPageId}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedSuggestions.has(suggestion.targetPageId)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleSuggestion(suggestion.targetPageId)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={selectedSuggestions.has(suggestion.targetPageId)}
                        onChange={() => toggleSuggestion(suggestion.targetPageId)}
                        className="rounded border-gray-300"
                      />
                      <span className="font-medium text-gray-900">
                        {suggestion.anchorText}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getRelevanceColor(suggestion.relevanceScore)}`}>
                        {getRelevanceLabel(suggestion.relevanceScore)} ({(suggestion.relevanceScore * 100).toFixed(0)}%)
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      → {suggestion.targetTitle}
                    </div>
                    
                    <div className="text-xs text-gray-500 mb-2">
                      {suggestion.reason}
                    </div>
                    
                    {suggestion.contextMatch && (
                      <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded">
                        Contexto: "{suggestion.contextMatch}"
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}