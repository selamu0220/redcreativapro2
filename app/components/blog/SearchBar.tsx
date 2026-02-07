"use client";

import React, { useState, useCallback } from "react";
import { Search, Filter, X, Sparkles, Loader2 } from "lucide-react";
import { debounce } from "lodash";

export interface SearchFilters {
  category: string;
  subcategory: string;
  tags: string[];
  sortBy: 'date' | 'views' | 'likes' | 'readTime';
  sortOrder: 'asc' | 'desc';
}

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters, aiResults?: any[]) => void;
  placeholder?: string;
  totalResults?: number;
}

export default function SearchBar({ onSearch, placeholder = "Buscar artículos...", totalResults }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isAISearch, setIsAISearch] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPowered, setAiPowered] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    subcategory: '',
    tags: [],
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // Debounced AI search
  const performAISearch = useCallback(
    debounce(async (searchQuery: string, currentFilters: SearchFilters) => {
      if (!searchQuery.trim() || searchQuery.length < 3) {
        setAiLoading(false);
        setAiPowered(false);
        onSearch(searchQuery, currentFilters);
        return;
      }

      setAiLoading(true);
      try {
        const response = await fetch('/api/blog/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery })
        });

        if (response.ok) {
          const data = await response.json();
          setAiPowered(data.aiPowered);
          if (data.results && data.results.length > 0) {
            onSearch(searchQuery, currentFilters, data.results);
          } else {
            // Fallback to normal search if no AI results
            onSearch(searchQuery, currentFilters);
          }
        } else {
          onSearch(searchQuery, currentFilters);
        }
      } catch (error) {
        console.error('AI Search error:', error);
        onSearch(searchQuery, currentFilters);
      } finally {
        setAiLoading(false);
      }
    }, 500),
    [onSearch]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAISearch && query.length >= 3) {
      performAISearch(query, filters);
    } else {
      onSearch(query, filters);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (isAISearch && value.length >= 3) {
      performAISearch(value, filters);
    } else {
      setAiPowered(false);
      onSearch(value, filters);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch(query, newFilters);
  };

  const clearFilters = () => {
    const newFilters = {
      category: '',
      subcategory: '',
      tags: [],
      sortBy: 'date' as const,
      sortOrder: 'desc' as const
    };
    setFilters(newFilters);
    setQuery('');
    setAiPowered(false);
    onSearch('', newFilters);
  };

  const toggleAISearch = () => {
    setIsAISearch(!isAISearch);
    setAiPowered(false);
    if (!isAISearch && query.length >= 3) {
      performAISearch(query, filters);
    }
  };

  return (
    <div className="space-y-4">
      {totalResults !== undefined && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span>{totalResults} resultado{totalResults !== 1 ? 's' : ''}</span>
          {aiPowered && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-600 dark:text-violet-400 rounded-full text-xs font-medium border border-violet-500/30">
              <Sparkles className="w-3 h-3" />
              IA
            </span>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative">
        {aiLoading ? (
          <Loader2 size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-violet-500 animate-spin" />
        ) : (
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        )}
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={isAISearch ? "🔮 Buscar con IA..." : placeholder}
          className={`pl-10 pr-24 py-3 w-full border rounded-xl focus:ring-2 focus:border-transparent transition-all ${isAISearch
              ? 'border-violet-300 dark:border-violet-700 focus:ring-violet-500 bg-gradient-to-r from-violet-50/50 to-purple-50/50 dark:from-violet-950/30 dark:to-purple-950/30'
              : 'border-gray-200 dark:border-gray-700 focus:ring-orange-500'
            }`}
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          <button
            type="button"
            onClick={toggleAISearch}
            className={`p-2 rounded-lg transition-all ${isAISearch
                ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/25'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'
              }`}
            title={isAISearch ? 'Búsqueda con IA activada' : 'Activar búsqueda con IA'}
          >
            <Sparkles size={16} />
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <Filter size={16} />
          </button>
        </div>
      </form>

      {isAISearch && query.length > 0 && query.length < 3 && (
        <p className="text-xs text-violet-500 dark:text-violet-400">
          Escribe al menos 3 caracteres para búsqueda con IA
        </p>
      )}

      {showFilters && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Filtros de búsqueda</h3>
            <button
              onClick={clearFilters}
              className="text-xs px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-1"
            >
              <X size={12} />
              Limpiar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoría
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full text-sm px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Todas las categorías</option>
                <option value="estrategia">Estrategia</option>
                <option value="herramientas">Herramientas</option>
                <option value="tutoriales">Tutoriales</option>
                <option value="casos-de-exito">Casos de Éxito</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ordenar por
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full text-sm px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500"
              >
                <option value="date">Fecha</option>
                <option value="views">Vistas</option>
                <option value="likes">Me gusta</option>
                <option value="readTime">Tiempo de lectura</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
