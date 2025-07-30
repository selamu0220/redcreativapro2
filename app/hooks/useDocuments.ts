import { useState, useEffect } from 'react';

export interface DocumentData {
  id: string;
  title: string;
  content: string;
  userEmail: string;
  folderId?: string;
  createdAt: string;
  updatedAt: string;
  type: 'escritor-ia' | 'correos-ia' | 'prompts' | 'other';
}

export interface FolderData {
  id: string;
  name: string;
  userEmail: string;
  parentFolderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FolderStructure {
  folders: FolderData[];
  documents: DocumentData[];
}

export function useDocuments(userEmail: string) {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar documentos
  const loadDocuments = async (folderId?: string) => {
    if (!userEmail) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({ email: userEmail });
      if (folderId) params.append('folderId', folderId);
      
      const response = await fetch(`/api/documents?${params}`);
      if (!response.ok) throw new Error('Error al cargar documentos');
      
      const data = await response.json();
      setDocuments(data.documents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Cargar carpetas
  const loadFolders = async (parentFolderId?: string) => {
    if (!userEmail) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({ email: userEmail });
      if (parentFolderId) params.append('parentFolderId', parentFolderId);
      
      const response = await fetch(`/api/folders?${params}`);
      if (!response.ok) throw new Error('Error al cargar carpetas');
      
      const data = await response.json();
      setFolders(data.folders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Cargar estructura completa (carpetas + documentos)
  const loadFolderStructure = async (parentFolderId?: string) => {
    if (!userEmail) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({ 
        email: userEmail,
        includeStructure: 'true'
      });
      if (parentFolderId) params.append('parentFolderId', parentFolderId);
      
      const response = await fetch(`/api/folders?${params}`);
      if (!response.ok) throw new Error('Error al cargar estructura');
      
      const data: FolderStructure = await response.json();
      setFolders(data.folders);
      setDocuments(data.documents);
      setCurrentFolderId(parentFolderId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Crear documento
  const createDocument = async (documentData: {
    title: string;
    content: string;
    type: DocumentData['type'];
    folderId?: string;
  }) => {
    if (!userEmail) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...documentData,
          userEmail,
          folderId: documentData.folderId || currentFolderId
        })
      });
      
      if (!response.ok) throw new Error('Error al crear documento');
      
      const data = await response.json();
      const newDocument = data.document;
      
      // Actualizar lista local
      setDocuments(prev => [...prev, newDocument]);
      
      return newDocument;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar documento
  const updateDocument = async (id: string, updates: {
    title?: string;
    content?: string;
    folderId?: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/documents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });
      
      if (!response.ok) throw new Error('Error al actualizar documento');
      
      const data = await response.json();
      const updatedDocument = data.document;
      
      // Actualizar lista local
      setDocuments(prev => 
        prev.map(doc => doc.id === id ? updatedDocument : doc)
      );
      
      return updatedDocument;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar documento
  const deleteDocument = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/documents?id=${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Error al eliminar documento');
      
      // Actualizar lista local
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Crear carpeta
  const createFolder = async (folderData: {
    name: string;
    parentFolderId?: string;
  }) => {
    if (!userEmail) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...folderData,
          userEmail,
          parentFolderId: folderData.parentFolderId || currentFolderId
        })
      });
      
      if (!response.ok) throw new Error('Error al crear carpeta');
      
      const data = await response.json();
      const newFolder = data.folder;
      
      // Actualizar lista local
      setFolders(prev => [...prev, newFolder]);
      
      return newFolder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar carpeta
  const updateFolder = async (id: string, updates: {
    name?: string;
    parentFolderId?: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/folders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });
      
      if (!response.ok) throw new Error('Error al actualizar carpeta');
      
      const data = await response.json();
      const updatedFolder = data.folder;
      
      // Actualizar lista local
      setFolders(prev => 
        prev.map(folder => folder.id === id ? updatedFolder : folder)
      );
      
      return updatedFolder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar carpeta
  const deleteFolder = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/folders?id=${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Error al eliminar carpeta');
      
      // Actualizar listas locales
      setFolders(prev => prev.filter(folder => folder.id !== id));
      setDocuments(prev => prev.filter(doc => doc.folderId !== id));
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Navegar a una carpeta
  const navigateToFolder = (folderId?: string) => {
    setCurrentFolderId(folderId);
    loadFolderStructure(folderId);
  };

  // Cargar datos iniciales
  useEffect(() => {
    if (userEmail) {
      loadFolderStructure(currentFolderId);
    }
  }, [userEmail]);

  return {
    // Estado
    documents,
    folders,
    currentFolderId,
    loading,
    error,
    
    // Funciones de carga
    loadDocuments,
    loadFolders,
    loadFolderStructure,
    
    // Funciones de documentos
    createDocument,
    updateDocument,
    deleteDocument,
    
    // Funciones de carpetas
    createFolder,
    updateFolder,
    deleteFolder,
    
    // Navegación
    navigateToFolder,
    
    // Utilidades
    refresh: () => loadFolderStructure(currentFolderId)
  };
}