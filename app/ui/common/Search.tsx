'use client';

import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Filter, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
// Mock data for search results
const mockPosts = [
  { id: '1', title: 'Guía de IA para Escritura', description: 'Aprende a usar IA para mejorar tu escritura', category: 'Tutorial', url: '/blog/guia-ia-escritura' },
  { id: '2', title: 'Email Marketing con IA', description: 'Automatiza tus campañas de email', category: 'Marketing', url: '/blog/email-marketing-ia' }
];

const mockResources = [
  { id: '1', title: 'Plantillas de Email', description: 'Plantillas profesionales para tus campañas', category: 'Recursos', url: '/recursos/plantillas' },
  { id: '2', title: 'Guías de Redacción', description: 'Mejora tu escritura con nuestras guías', category: 'Recursos', url: '/recursos/guias' }
];

const mockScripts = [
  { id: '1', title: 'Script de Ventas', description: 'Script optimizado para conversiones', category: 'Scripts', url: '/scripts/ventas' },
  { id: '2', title: 'Script de Seguimiento', description: 'Mantén el contacto con tus clientes', category: 'Scripts', url: '/scripts/seguimiento' }
];

interface EventType {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  type: 'meeting' | 'call' | 'event' | 'reminder';
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'event' | 'blog' | 'resource' | 'script';
  url?: string;
  date?: string;
  category?: string;
}

interface SearchProps {
  onResultSelect?: (result: SearchResult) => void;
  placeholder?: string;
  showFilters?: boolean;
}

const Search: React.FC<SearchProps> = ({ 
  onResultSelect, 
  placeholder = "Buscar...", 
  showFilters = true 
}) => {
  const { isAuthenticated } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for search - convert to SearchResult format
  const searchData: SearchResult[] = [
    ...mockPosts.map(post => ({
      id: post.id,
      title: post.title,
      description: post.description,
      type: 'blog' as const,
      url: post.url,
      category: post.category
    })),
    ...mockResources.map(resource => ({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      type: 'resource' as const,
      url: resource.url,
      category: resource.category
    })),
    ...mockScripts.map(script => ({
      id: script.id,
      title: script.title,
      description: script.description,
      type: 'script' as const,
      url: script.url,
      category: script.category
    }))
  ];

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    try {
      const lowerQuery = searchQuery.toLowerCase();
      
      // Filter search data based on query and selected filter
      let filteredResults = searchData.filter(item => {
        const matchesQuery = (item.title || '').toLowerCase().includes(lowerQuery) ||
                           (item.description || '').toLowerCase().includes(lowerQuery);
        
        const matchesFilter = selectedFilter === 'all' || item.type === selectedFilter;
        
        // Check authentication for protected content
        const hasAccess = isAuthenticated || (item.type !== 'resource' && item.type !== 'script');
        
        return matchesQuery && matchesFilter && hasAccess;
      });
      
      setResults(filteredResults);

      setResults(filteredResults.slice(0, 10)); // Limit to 10 results
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, selectedFilter, isAuthenticated]);

  const handleResultClick = (result: SearchResult) => {
    if (onResultSelect) {
      onResultSelect(result);
    } else if (result.url) {
      window.open(result.url, '_blank');
    }
    setIsOpen(false);
    setQuery('');
  };

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'blog':
        return '📝';
      case 'resource':
        return '📚';
      case 'script':
        return '⚡';
      case 'event':
        return '📅';
      default:
        return '🔍';
    }
  };

  const getResultTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'blog':
        return 'Blog';
      case 'resource':
        return 'Recurso';
      case 'script':
        return 'Script';
      case 'event':
        return 'Evento';
      default:
        return 'Resultado';
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {showFilters && (
        <div className="flex gap-2 mt-3">
          {[
            { value: 'all', label: 'Todo' },
            { value: 'blog', label: 'Blog' },
            ...(isAuthenticated ? [
              { value: 'resource', label: 'Recursos' },
              { value: 'script', label: 'Scripts' }
            ] : [])
          ].map(filter => (
            <button
              key={filter.value}
              onClick={() => setSelectedFilter(filter.value)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedFilter === filter.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}

      {/* Results Dropdown */}
      {isOpen && (query || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-zinc-400">
              Buscando...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="w-full px-4 py-3 text-left hover:bg-zinc-700 transition-colors border-b border-zinc-700 last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{getResultIcon(result.type)}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white truncate">{result.title}</h4>
                      <p className="text-sm text-zinc-400 line-clamp-2 mt-1">{result.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          result.type === 'blog' ? 'bg-blue-600/20 text-blue-400' :
                          result.type === 'resource' ? 'bg-green-600/20 text-green-400' :
                          result.type === 'script' ? 'bg-purple-600/20 text-purple-400' :
                          'bg-zinc-600/20 text-zinc-400'
                        }`}>
                          {result.type === 'blog' ? 'Blog' : 
                           result.type === 'resource' ? 'Recurso' :
                           result.type === 'script' ? 'Script' : 'Evento'}
                        </span>
                        {result.category && (
                          <span className="text-xs text-zinc-500">{result.category}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : query ? (
            <div className="p-4 text-center text-zinc-400">
              No se encontraron resultados para "{query}"
            </div>
          ) : null}
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default Search;
