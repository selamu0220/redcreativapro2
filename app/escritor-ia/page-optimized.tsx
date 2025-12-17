"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import dynamic from 'next/dynamic';
import { useAuth } from '../hooks/useAuth';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';
import { useDocuments, DocumentData } from "../hooks/useDocuments";
import { useViewport } from "../hooks/useViewport";
import useErrorMonitoring from '../hooks/useErrorMonitoring';
import { MobileOptimizedLoader, MobileErrorState } from "../components/MobileLoadingStates";
import EscritorIALayout from './components/EscritorIALayout';
import EscritorIAEditor from './components/EscritorIAEditor';
import ProtectedRoute from "../components/ProtectedRoute";

// Dynamic imports to reduce initial bundle size
const ErrorNotificationSystem = dynamic(
  () => import('../components/error-display/ErrorNotificationSystem'),
  { ssr: false }
);

interface DocumentPage {
  id: string;
  content: string;
  title: string;
}

function EscritorIAPageOptimized() {
  const { user } = useAuth();
  const { post } = useAuthenticatedFetch();
  const { isMobile } = useViewport();
  
  // Error monitoring
  const {
    logError,
    logAIError,
    retryOperation,
    safeAsyncOperation,
    isOnline
  } = useErrorMonitoring({
    enableAutoRecovery: true,
    enablePerformanceMonitoring: true,
    enableNetworkMonitoring: true,
    maxRetries: 3,
    userId: user?.email
  });

  // Document management
  const {
    documents,
    loading: documentsLoading,
    error: documentsError,
    loadDocuments,
    createDocument,
    updateDocument
  } = useDocuments(user?.email || '');
  
  // Component state
  const [mounted, setMounted] = useState(false);
  const [pages, setPages] = useState<DocumentPage[]>([
    { id: "1", content: "", title: "Documento sin título" }
  ]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [documentTitle, setDocumentTitle] = useState("Documento sin título");
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null);
  const [isImproving, setIsImproving] = useState(false);
  const [aiModel, setAiModel] = useState('openai/gpt-4o');
  const [lastError, setLastError] = useState<{
    message: string;
    type?: string;
    retryable?: boolean;
    timestamp: number;
  } | null>(null);

  // Handle mounting to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load documents on mount
  useEffect(() => {
    if (mounted && user?.email) {
      safeAsyncOperation(
        () => loadDocuments(),
        'Load documents on mount'
      );
    }
  }, [mounted, user?.email, loadDocuments, safeAsyncOperation]);

  // Load configuration from localStorage
  useEffect(() => {
    if (!mounted) return;
    
    const savedModel = localStorage.getItem('openrouter_model');
    if (savedModel) {
      setAiModel(savedModel);
    }
  }, [mounted]);

  // Save configuration to localStorage
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('openrouter_model', aiModel);
  }, [aiModel, mounted]);

  // Update page content
  const updatePageContent = useCallback((content: string) => {
    setPages(prev => prev.map((page, index) => 
      index === currentPageIndex ? { ...page, content } : page
    ));
  }, [currentPageIndex]);

  // Handle content change
  const handleContentChange = useCallback((content: string) => {
    updatePageContent(content);
  }, [updatePageContent]);

  // Improve content with AI
  const improveContent = useCallback(async () => {
    if (isImproving) return;
    
    const currentContent = pages[currentPageIndex]?.content || '';
    if (!currentContent.trim()) {
      logError({
        type: 'validation',
        severity: 'low',
        message: 'Empty content provided for improvement',
        userMessage: 'Por favor, escribe algo de contenido antes de mejorarlo.',
        recoverable: true,
        retryable: false,
        context: { contentLength: currentContent.length }
      });
      return;
    }
    
    setIsImproving(true);
    setLastError(null);
    
    try {
      const result = await retryOperation(async () => {
        if (!isOnline) {
          throw new Error('No hay conexión a internet disponible');
        }

        const data = await post('/api/improve-content', {
          content: currentContent,
          prompt: 'Mejora este texto manteniendo su significado original y haciéndolo más claro y profesional.',
          model: aiModel,
          temperature: 0.3,
          maxTokens: 2000
        });
        
        if (!data.success) {
          throw new Error(data.error || 'Error al mejorar el contenido');
        }
        
        if (!data.improvedContent) {
          throw new Error('No se recibió contenido mejorado del servicio de IA');
        }

        return data;
      }, 'AI Content Improvement');

      updatePageContent(result.improvedContent);
      
    } catch (error) {
      console.error('Content improvement failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setLastError({
        message: errorMessage,
        type: 'AI_ERROR',
        retryable: true,
        timestamp: Date.now()
      });

      logAIError(errorMessage, {
        operation: 'improveContent',
        model: aiModel,
        contentLength: currentContent.length
      });
    } finally {
      setIsImproving(false);
    }
  }, [isImproving, pages, currentPageIndex, aiModel, post, retryOperation, isOnline, updatePageContent, logError, logAIError]);

  // Save document
  const saveDocument = useCallback(async () => {
    if (!user?.email) {
      logError({
        type: 'auth',
        severity: 'medium',
        message: 'User not authenticated for document save',
        userMessage: 'Debes iniciar sesión para guardar documentos.',
        recoverable: true,
        retryable: false,
        context: { hasUser: !!user, userEmail: user?.email }
      });
      return;
    }
    
    const content = pages.map(page => page.content).join('\n\n--- Nueva Página ---\n\n');
    
    if (!documentTitle.trim()) {
      logError({
        type: 'validation',
        severity: 'low',
        message: 'Document title is empty',
        userMessage: 'Por favor, proporciona un título para el documento.',
        recoverable: true,
        retryable: false,
        context: { title: documentTitle }
      });
      return;
    }
    
    try {
      await retryOperation(async () => {
        if (currentDocumentId) {
          await updateDocument(currentDocumentId, {
            title: documentTitle,
            content,
            category: null
          });
        } else {
          const newDoc = await createDocument({
            title: documentTitle,
            content,
            category: null
          });
          setCurrentDocumentId(newDoc.id);
        }
      }, 'Document Save Operation');

      await safeAsyncOperation(
        () => loadDocuments(),
        'Reload documents after save'
      );
      
    } catch (error) {
      console.error('Document save failed:', error);
      
      // Try to save to localStorage as backup
      try {
        const backup = {
          title: documentTitle,
          content,
          timestamp: new Date().toISOString(),
          pages: pages.length
        };
        localStorage.setItem(`document_backup_${Date.now()}`, JSON.stringify(backup));
      } catch (backupError) {
        console.error('Failed to create local backup:', backupError);
      }
    }
  }, [user, pages, documentTitle, currentDocumentId, updateDocument, createDocument, loadDocuments, retryOperation, safeAsyncOperation, logError]);

  // Loading state
  if (!mounted) {
    return (
      <EscritorIALayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <MobileOptimizedLoader 
            size="lg" 
            text="Inicializando Editor de IA..." 
            variant="spinner"
          />
        </div>
      </EscritorIALayout>
    );
  }

  // Error state
  if (documentsError) {
    return (
      <EscritorIALayout>
        <MobileErrorState
          title="Error al cargar documentos"
          description="No se pudieron cargar tus documentos. Verifica tu conexión e inténtalo de nuevo."
          onRetry={() => loadDocuments()}
          error={documentsError}
          showDetails={true}
        />
      </EscritorIALayout>
    );
  }

  return (
    <ProtectedRoute>
      <EscritorIALayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className={`
              font-bold text-foreground
              ${isMobile ? 'text-2xl' : 'text-3xl'}
            `}>
              Editor de IA
            </h1>
            <p className="text-muted-foreground text-sm">
              Mejora tu contenido con inteligencia artificial
            </p>
          </div>

          {/* Main Editor */}
          <EscritorIAEditor
            pages={pages}
            currentPageIndex={currentPageIndex}
            isImproving={isImproving}
            onContentChange={handleContentChange}
            onImproveContent={improveContent}
            onSaveDocument={saveDocument}
          />

          {/* Error Notifications */}
          {lastError && (
            <Suspense fallback={null}>
              <ErrorNotificationSystem />
            </Suspense>
          )}
        </div>
      </EscritorIALayout>
    </ProtectedRoute>
  );
}

export default EscritorIAPageOptimized;