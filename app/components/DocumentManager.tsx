'use client';

import React, { useState } from 'react';
import { useDocuments, DocumentData, FolderData } from '../hooks/useDocuments';

interface DocumentManagerProps {
  userEmail: string;
}

export default function DocumentManager({ userEmail }: DocumentManagerProps) {
  const {
    documents,
    folders,
    currentFolderId,
    loading,
    error,
    createDocument,
    updateDocument,
    deleteDocument,
    createFolder,
    updateFolder,
    deleteFolder,
    navigateToFolder,
    refresh
  } = useDocuments(userEmail);

  const [showCreateDocument, setShowCreateDocument] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [editingDocument, setEditingDocument] = useState<DocumentData | null>(null);
  const [editingFolder, setEditingFolder] = useState<FolderData | null>(null);

  // Formulario para crear/editar documento
  const DocumentForm = ({ document, onSave, onCancel }: {
    document?: DocumentData;
    onSave: (data: any) => void;
    onCancel: () => void;
  }) => {
    const [title, setTitle] = useState(document?.title || '');
    const [content, setContent] = useState(document?.content || '');
    const [type, setType] = useState<DocumentData['type']>(document?.type || 'other');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave({ title, content, type });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">
            {document ? 'Editar Documento' : 'Crear Nuevo Documento'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as DocumentData['type'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="escritor-ia">Escritor IA</option>
                <option value="correos-ia">Correos IA</option>
                <option value="prompts">Prompts</option>
                <option value="other">Otro</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contenido
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {document ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Formulario para crear/editar carpeta
  const FolderForm = ({ folder, onSave, onCancel }: {
    folder?: FolderData;
    onSave: (data: any) => void;
    onCancel: () => void;
  }) => {
    const [name, setName] = useState(folder?.name || '');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave({ name });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">
            {folder ? 'Editar Carpeta' : 'Crear Nueva Carpeta'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {folder ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Manejar creación de documento
  const handleCreateDocument = async (data: any) => {
    const result = await createDocument(data);
    if (result) {
      setShowCreateDocument(false);
    }
  };

  // Manejar edición de documento
  const handleUpdateDocument = async (data: any) => {
    if (editingDocument) {
      const result = await updateDocument(editingDocument.id, data);
      if (result) {
        setEditingDocument(null);
      }
    }
  };

  // Manejar creación de carpeta
  const handleCreateFolder = async (data: any) => {
    const result = await createFolder(data);
    if (result) {
      setShowCreateFolder(false);
    }
  };

  // Manejar edición de carpeta
  const handleUpdateFolder = async (data: any) => {
    if (editingFolder) {
      const result = await updateFolder(editingFolder.id, data);
      if (result) {
        setEditingFolder(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Mis Documentos
          {currentFolderId && (
            <button
              onClick={() => navigateToFolder(undefined)}
              className="ml-2 text-sm text-blue-600 hover:text-blue-800"
            >
              ← Volver a raíz
            </button>
          )}
        </h2>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowCreateFolder(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            + Nueva Carpeta
          </button>
          <button
            onClick={() => setShowCreateDocument(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + Nuevo Documento
          </button>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Carpetas */}
      {folders.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">📁 Carpetas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => navigateToFolder(folder.id)}
                  >
                    <h4 className="font-medium text-gray-900 hover:text-blue-600">
                      📁 {folder.name}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Creada: {new Date(folder.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setEditingFolder(folder)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('¿Estás seguro de eliminar esta carpeta y todo su contenido?')) {
                          deleteFolder(folder.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documentos */}
      <div>
        <h3 className="text-lg font-semibold mb-3">📄 Documentos</h3>
        {documents.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No hay documentos en esta ubicación.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((document) => (
              <div
                key={document.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{document.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Tipo: {document.type}
                    </p>
                    <p className="text-sm text-gray-500">
                      Actualizado: {new Date(document.updatedAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                      {document.content.substring(0, 100)}...
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setEditingDocument(document)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('¿Estás seguro de eliminar este documento?')) {
                          deleteDocument(document.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modales */}
      {showCreateDocument && (
        <DocumentForm
          onSave={handleCreateDocument}
          onCancel={() => setShowCreateDocument(false)}
        />
      )}

      {editingDocument && (
        <DocumentForm
          document={editingDocument}
          onSave={handleUpdateDocument}
          onCancel={() => setEditingDocument(null)}
        />
      )}

      {showCreateFolder && (
        <FolderForm
          onSave={handleCreateFolder}
          onCancel={() => setShowCreateFolder(false)}
        />
      )}

      {editingFolder && (
        <FolderForm
          folder={editingFolder}
          onSave={handleUpdateFolder}
          onCancel={() => setEditingFolder(null)}
        />
      )}
    </div>
  );
}