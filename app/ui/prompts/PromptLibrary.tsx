'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Copy, Download, Upload, Tag, Star } from 'lucide-react';
import { Button } from '../../components/ui/button';

interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  usage: number;
}

interface UseLocalStorageReturn<T> {
  data: T[];
  setData: (data: T[]) => void;
  hasChanges: boolean;
  importFromCSV: (event: React.ChangeEvent<HTMLInputElement>) => void;
  exportToCSV: () => void;
}

const mockPrompts: Prompt[] = [
  {
    id: '1',
    title: 'Escritura Profesional',
    content: 'Escribe un texto profesional sobre [TEMA] dirigido a [AUDIENCIA]. El tono debe ser [TONO] y la longitud aproximada de [LONGITUD] palabras.',
    category: 'Escritura',
    tags: ['profesional', 'negocio', 'formal'],
    isFavorite: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
    usage: 25
  },
  {
    id: '2',
    title: 'Email Marketing',
    content: 'Crea un email de marketing para [PRODUCTO/SERVICIO] que incluya: asunto atractivo, saludo personalizado, beneficios clave, llamada a la acción clara.',
    category: 'Marketing',
    tags: ['email', 'marketing', 'ventas'],
    isFavorite: false,
    createdAt: '2024-01-14',
    updatedAt: '2024-01-14',
    usage: 18
  }
];

const usePromptsStorage = (initialData: Prompt[]): UseLocalStorageReturn<Prompt> => {
  const [data, setDataState] = useState<Prompt[]>(initialData);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('prompt-library');
    if (stored) {
      try {
        setDataState(JSON.parse(stored));
      } catch (error) {
        console.error('Error parsing stored prompts:', error);
        setDataState(initialData);
      }
    }
  }, []);

  const setData = (newData: Prompt[]) => {
    setDataState(newData);
    localStorage.setItem('prompt-library', JSON.stringify(newData));
    setHasChanges(true);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Título', 'Contenido', 'Categoría', 'Tags', 'Favorito', 'Creado', 'Actualizado', 'Uso'];
    const csvContent = [
      headers.join(','),
      ...data.map(prompt => [
        prompt.id,
        `"${prompt.title}"`,
        `"${prompt.content}"`,
        prompt.category,
        `"${prompt.tags.join(';')}"`,
        prompt.isFavorite,
        prompt.createdAt,
        prompt.updatedAt,
        prompt.usage
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prompts-library.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const importFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        
        const importedPrompts: Prompt[] = lines.slice(1)
          .filter(line => line.trim())
          .map((line, index) => {
            const values = line.split(',');
            return {
              id: values[0] || `imported-${Date.now()}-${index}`,
              title: values[1]?.replace(/"/g, '') || 'Prompt Importado',
              content: values[2]?.replace(/"/g, '') || '',
              category: values[3] || 'General',
              tags: values[4]?.replace(/"/g, '').split(';').filter(Boolean) || [],
              isFavorite: values[5] === 'true',
              createdAt: values[6] || new Date().toISOString().split('T')[0],
              updatedAt: values[7] || new Date().toISOString().split('T')[0],
              usage: parseInt(values[8]) || 0
            };
          });

        setData([...data, ...importedPrompts]);
      } catch (error) {
        console.error('Error importing CSV:', error);
        alert('Error al importar el archivo CSV');
      }
    };
    reader.readAsText(file);
  };

  return { data, setData, hasChanges, importFromCSV, exportToCSV };
};

const PromptLibrary: React.FC = () => {
  const { data: prompts, setData: setPrompts, hasChanges } = usePromptsStorage(mockPrompts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [newPrompt, setNewPrompt] = useState<Partial<Prompt>>({
    title: '',
    content: '',
    category: 'General',
    tags: [],
    isFavorite: false
  });

  const categories = ['all', ...Array.from(new Set(prompts.map(p => p.category || '')))];

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = (prompt.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (prompt.content || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (prompt.tags || []).some(tag => (tag || '').toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSavePrompt = () => {
    if (!newPrompt.title || !newPrompt.content) return;

    const promptToSave: Prompt = {
      id: editingPrompt?.id || Date.now().toString(),
      title: newPrompt.title!,
      content: newPrompt.content!,
      category: newPrompt.category || 'General',
      tags: newPrompt.tags || [],
      isFavorite: newPrompt.isFavorite || false,
      createdAt: editingPrompt?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      usage: editingPrompt?.usage || 0
    };

    if (editingPrompt) {
      setPrompts(prompts.map(p => p.id === editingPrompt.id ? promptToSave : p));
    } else {
      setPrompts([...prompts, promptToSave]);
    }

    setShowForm(false);
    setEditingPrompt(null);
    setNewPrompt({
      title: '',
      content: '',
      category: 'General',
      tags: [],
      isFavorite: false
    });
  };

  const handleEditPrompt = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setNewPrompt(prompt);
    setShowForm(true);
  };

  const handleDeletePrompt = (promptId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este prompt?')) {
      setPrompts(prompts.filter(p => p.id !== promptId));
    }
  };

  const handleToggleFavorite = (promptId: string) => {
    setPrompts(prompts.map(p => 
      p.id === promptId ? { ...p, isFavorite: !p.isFavorite } : p
    ));
  };

  const handleCopyPrompt = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      // You could add a toast notification here
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const handleUsePrompt = (promptId: string) => {
    setPrompts(prompts.map(p => 
      p.id === promptId ? { ...p, usage: p.usage + 1 } : p
    ));
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Título', 'Contenido', 'Categoría', 'Tags', 'Favorito', 'Creado', 'Actualizado', 'Uso'];
    const csvContent = [
      headers.join(','),
      ...prompts.map(prompt => [
        prompt.id,
        `"${prompt.title}"`,
        `"${prompt.content}"`,
        prompt.category,
        `"${prompt.tags.join(';')}"`,
        prompt.isFavorite,
        prompt.createdAt,
        prompt.updatedAt,
        prompt.usage
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prompts-library.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const importFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        
        const importedPrompts: Prompt[] = lines.slice(1)
          .filter(line => line.trim())
          .map((line, index) => {
            const values = line.split(',');
            return {
              id: values[0] || `imported-${Date.now()}-${index}`,
              title: values[1]?.replace(/"/g, '') || 'Prompt Importado',
              content: values[2]?.replace(/"/g, '') || '',
              category: values[3] || 'General',
              tags: values[4]?.replace(/"/g, '').split(';').filter(Boolean) || [],
              isFavorite: values[5] === 'true',
              createdAt: values[6] || new Date().toISOString().split('T')[0],
              updatedAt: values[7] || new Date().toISOString().split('T')[0],
              usage: parseInt(values[8]) || 0
            };
          });

        setPrompts([...prompts, ...importedPrompts]);
      } catch (error) {
        console.error('Error importing CSV:', error);
        alert('Error al importar el archivo CSV');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold">📚 Biblioteca de Prompts</h1>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg cursor-pointer transition-colors">
                <Upload size={20} />
                Importar CSV
                <input
                  type="file"
                  accept=".csv"
                  onChange={importFromCSV}
                  className="hidden"
                />
              </label>
              <Button
                onClick={exportToCSV}
                className="flex items-center gap-2"
              >
                <Download size={20} />
                Exportar CSV
              </Button>
              <Button
                onClick={() => setShowForm(true)}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <Plus size={20} />
                Nuevo Prompt
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 mb-8">
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar prompts..."
                  className="w-full pl-10 pr-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'Todas las categorías' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Prompts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrompts.map((prompt) => (
              <div key={prompt.id} className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold flex-1">{prompt.title}</h3>
                  <button
                    onClick={() => handleToggleFavorite(prompt.id)}
                    className={`p-1 rounded ${prompt.isFavorite ? 'text-yellow-400' : 'text-zinc-400 hover:text-yellow-400'}`}
                  >
                    <Star size={20} fill={prompt.isFavorite ? 'currentColor' : 'none'} />
                  </button>
                </div>
                
                <p className="text-zinc-300 text-sm mb-4 line-clamp-3">{prompt.content}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-xs">
                    {prompt.category}
                  </span>
                  {prompt.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-zinc-600/50 text-zinc-300 rounded text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-4">
                  <span>Usado {prompt.usage} veces</span>
                  <span>{prompt.updatedAt}</span>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      handleCopyPrompt(prompt.content);
                      handleUsePrompt(prompt.id);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 text-sm"
                    size="sm"
                  >
                    <Copy size={16} />
                    Copiar
                  </Button>
                  <button
                    onClick={() => handleEditPrompt(prompt)}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeletePrompt(prompt.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/20 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Prompt Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-zinc-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6">
                  {editingPrompt ? 'Editar Prompt' : 'Nuevo Prompt'}
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Título</label>
                    <input
                      type="text"
                      value={newPrompt.title || ''}
                      onChange={(e) => setNewPrompt({...newPrompt, title: e.target.value})}
                      className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Contenido</label>
                    <textarea
                      value={newPrompt.content || ''}
                      onChange={(e) => setNewPrompt({...newPrompt, content: e.target.value})}
                      rows={6}
                      className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Categoría</label>
                      <input
                        type="text"
                        value={newPrompt.category || ''}
                        onChange={(e) => setNewPrompt({...newPrompt, category: e.target.value})}
                        className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Tags (separados por coma)</label>
                      <input
                        type="text"
                        value={newPrompt.tags?.join(', ') || ''}
                        onChange={(e) => setNewPrompt({...newPrompt, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})}
                        className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="favorite"
                      checked={newPrompt.isFavorite || false}
                      onChange={(e) => setNewPrompt({...newPrompt, isFavorite: e.target.checked})}
                      className="rounded"
                    />
                    <label htmlFor="favorite" className="text-sm">Marcar como favorito</label>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={handleSavePrompt}
                    className="flex-1"
                  >
                    {editingPrompt ? 'Actualizar' : 'Guardar'}
                  </Button>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingPrompt(null);
                      setNewPrompt({
                        title: '',
                        content: '',
                        category: 'General',
                        tags: [],
                        isFavorite: false
                      });
                    }}
                    className="flex-1 px-4 py-2 bg-zinc-600 hover:bg-zinc-700 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptLibrary;