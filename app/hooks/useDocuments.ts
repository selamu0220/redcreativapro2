import { useState, useEffect } from 'react';
import { useAuthenticatedFetch } from './useAuthenticatedFetch';

export interface DocumentData {
  id: string;
  title: string;
  content: string;
  user_id: string;
  category?: string;
  tags?: string[];
  is_public?: boolean;
  created_at: string;
  updated_at: string;
  type?: 'escritor-ia' | 'correos-ia' | 'prompts' | 'other';
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
  
  const { get, post, put, del } = useAuthenticatedFetch();

  // Cargar documentos
  const loadDocuments = async (category?: string) => {
    if (!userEmail || userEmail.trim() === '') return;
    
    setLoading(true);
    setError(null);
    
    try {
      const url = category 
        ? `/api/documents?category=${encodeURIComponent(category)}`
        : '/api/documents';
        
      const data = await get(url);
      setDocuments(data.documents || []);
    } catch (err) {
      console.error('❌ [DEBUG] useDocuments.loadDocuments - Error:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Cargar carpetas
  const loadFolders = async (parentFolderId?: string) => {
    if (!userEmail || userEmail.trim() === '') return;
    
    setLoading(true);
    setError(null);
    
    try {
      const url = parentFolderId 
        ? `/api/folders?parentFolderId=${encodeURIComponent(parentFolderId)}&userEmail=${encodeURIComponent(userEmail)}`
        : `/api/folders?userEmail=${encodeURIComponent(userEmail)}`;
        
      const data = await get(url);
      setFolders(data.folders || []);
    } catch (err) {
      console.error('❌ [DEBUG] useDocuments.loadFolders - Error:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Cargar estructura de categorías y documentos
  const loadFolderStructure = async (category?: string) => {
    if (!userEmail || userEmail.trim() === '') return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Cargar documentos y carpetas
      await Promise.all([
        loadDocuments(category),
        loadFolders(category)
      ]);
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
    category?: string;
    tags?: string[];
    is_public?: boolean;
  }) => {
    if (!userEmail || userEmail.trim() === '') return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const payload = {
        ...documentData,
        category: documentData.category || currentFolderId
      };
      
      // Logs de depuración
      console.log('🔍 [DEBUG] useDocuments.createDocument - Enviando datos:');
      console.log('- Payload completo:', payload);
      console.log('- Contenido (longitud):', payload.content?.length || 0);
      console.log('- Contenido (preview):', payload.content?.substring(0, 100) || 'VACÍO');
      
      const data = await post('/api/documents', payload);
      console.log('✅ [DEBUG] useDocuments.createDocument - Respuesta del servidor:', data);
      
      const newDocument = data.document;
      
      // Actualizar lista local
      setDocuments(prev => [...prev, newDocument]);
      
      return newDocument;
    } catch (err) {
      console.error('❌ [DEBUG] useDocuments.createDocument - Error:', err);
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
    category?: string;
    tags?: string[];
    is_public?: boolean;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      // Logs de depuración
      console.log('🔍 [DEBUG] useDocuments.updateDocument - Actualizando documento:');
      console.log('- ID:', id);
      console.log('- Updates completo:', updates);
      console.log('- Contenido (longitud):', updates.content?.length || 0);
      console.log('- Contenido (preview):', updates.content?.substring(0, 100) || 'VACÍO');
      
      const data = await put(`/api/documents/${id}`, updates);
      console.log('✅ [DEBUG] useDocuments.updateDocument - Respuesta del servidor:', data);
      
      const updatedDocument = data.document;
      
      // Actualizar lista local
      setDocuments(prev => 
        prev.map(doc => doc.id === id ? updatedDocument : doc)
      );
      
      return updatedDocument;
    } catch (err) {
      console.error('❌ [DEBUG] useDocuments.updateDocument - Error:', err);
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
      await del(`/api/documents/${id}`);
      
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
    if (!userEmail || userEmail.trim() === '') return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await post('/api/folders', {
        ...folderData,
        userEmail,
        parentFolderId: folderData.parentFolderId || currentFolderId
      });
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
      const data = await put('/api/folders', { id, userEmail, ...updates });
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
      await del(`/api/folders?id=${id}&userEmail=${encodeURIComponent(userEmail)}`);
      
      // Actualizar listas locales
      setFolders(prev => prev.filter(folder => folder.id !== id));
      setDocuments(prev => prev.filter(doc => doc.category !== id));
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Navegar a una categoría
  const navigateToFolder = (category?: string) => {
    setCurrentFolderId(category);
    loadFolderStructure(category);
  };

  // Cargar datos iniciales - only when userEmail is valid
  useEffect(() => {
    if (userEmail && userEmail.trim() !== '') {
      loadFolderStructure(currentFolderId);
    } else {
      // Clear documents when user is not authenticated
      setDocuments([]);
      setFolders([]);
      setError(null);
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
