"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface SearchFilters {
  category: string;
  subcategory: string;
  tags: string[];
  sortBy: 'date' | 'views' | 'likes' | 'readTime';
  sortOrder: 'asc' | 'desc';
}

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  placeholder?: string;
  totalResults?: number;
}

export default function SearchBar({ onSearch, placeholder = "Buscar artículos...", totalResults }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    subcategory: '',
    tags: [],
    sortBy: 'date',
    sortOrder: 'desc'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, filters);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value, filters);
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
    onSearch(query, newFilters);
  };

  return (
    <div className="space-y-4">
      {totalResults !== undefined && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {totalResults} resultado{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
        </div>
      )}
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="pl-10 pr-12 py-2 w-full border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2"
        >
          <Filter className="w-4 h-4" />
        </Button>
      </form>

      {showFilters && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Filtros de búsqueda</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              Limpiar
            </Button>
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