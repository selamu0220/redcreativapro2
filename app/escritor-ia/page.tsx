"use client";

import React, { useState, useEffect, useCallback, Suspense, useRef } from "react";
import dynamic from 'next/dynamic';
import { useAuth } from '../hooks/useAuth';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';
import { useDocuments, DocumentData } from "../hooks/useDocuments";
import { useViewport } from "../hooks/useViewport";
import useErrorMonitoring from '../hooks/useErrorMonitoring';
import { useAISettings } from '../hooks/useAISettings';
import { useOptimizedAutoImprovement, useAutoImprovementConfig } from '../hooks/useOptimizedAutoImprovement';
import { useMemoryManager } from '../lib/performance/MemoryManager';
import { useMemoryLeakDetector } from '../lib/performance/MemoryLeakDetector';
import { useAIBundleOptimizer } from '../lib/performance/AIBundleOptimizer';
import { MobileOptimizedLoader, MobileErrorState } from "../components/MobileLoadingStates";
import EscritorIALayout from './components/EscritorIALayout';
import EscritorIAEditor from './components/EscritorIAEditor';
import ProtectedRoute from "../components/ProtectedRoute";
import VideoModal from "../components/VideoModal";
import GuestTrialInterface from "../components/GuestTrialInterface";
import { useGuestTrial } from "../hooks/useGuestTrial";
import { usePremiumAccess, usePremiumTheme } from "../hooks/useSubscription";
import { Button } from "../components/ui/button";
import Link from "next/link";
import { useSimpleTranslations } from "@/app/lib/simple-translations";

// Dynamic imports to reduce initial bundle size
const ErrorNotificationSystem = dynamic(
  () => import('../components/error-display/ErrorNotificationSystem'),
  { ssr: false }
);

const PerformanceMonitor = dynamic(
  () => import('../components/PerformanceMonitor'),
  { ssr: false }
);

interface DocumentPage {
  id: string;
  content: string;
  title: string;
}

function EscritorIAPage() {
  const { t } = useSimpleTranslations();
  const { user } = useAuth();
  const { post } = useAuthenticatedFetch();
  const { isMobile } = useViewport();
  const { isTrialActive, canStartTrial, startGuestTrial, isTrialExpired } = useGuestTrial();
  const { isPremium } = usePremiumTheme();

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

  // Memory management
  const memoryManager = useMemoryManager();
  const memoryLeakDetector = useMemoryLeakDetector();
  const aiBundleOptimizer = useAIBundleOptimizer();

  // AI Settings integration
  const {
    settings: aiSettings,
    updateSettings: updateAISettings,
    isLoading: aiSettingsLoading
  } = useAISettings();

  // Auto-improvement configuration
  const { config: autoImprovementConfig, updateConfig: updateAutoImprovementConfig } = useAutoImprovementConfig({
    enabled: aiSettings?.autoImprove || false,
    delay: aiSettings?.autoImproveDelay || 2000,
    minWords: aiSettings?.minWordsForAutoImprove || 5,
    maxRetries: 3,
    debounceDelay: 1000
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
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);
  const [memoryAlerts, setMemoryAlerts] = useState<any[]>([]);

  // Feature specific state
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isStartingTrial, setIsStartingTrial] = useState(false);

  // Version History State
  const [contentVersions, setContentVersions] = useState<string[]>([]);
  const [currentVersionIndex, setCurrentVersionIndex] = useState(-1);
  const [isShowingVersions, setIsShowingVersions] = useState(false);
  const [isGeneratingVersions, setIsGeneratingVersions] = useState(false);

  // Guest Trial Auto-Start Logic
  useEffect(() => {
    if (mounted && !user && !isTrialActive && canStartTrial && !isStartingTrial && !isTrialExpired) {
      console.log('Auto-starting guest trial for Escritor IA');
      setIsStartingTrial(true);
      startGuestTrial();
      // Reset after a brief delay
      setTimeout(() => setIsStartingTrial(false), 1000);
    }
  }, [mounted, user, isTrialActive, canStartTrial, isStartingTrial, startGuestTrial, isTrialExpired]);

  // Handle mounting to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Memory leak detection and performance monitoring
  useEffect(() => {
    if (!mounted) return;

    // Start memory monitoring
    const monitoringInterval = setInterval(() => {
      // Audit auto-improvement features for memory leaks
      const auditResults = memoryLeakDetector.auditAutoImprovementFeatures();

      // Check for performance alerts
      const performanceAlerts = memoryManager.getPerformanceAlerts();
      const memoryMetrics = memoryManager.getMemoryMetrics();

      // Update alerts state
      if (performanceAlerts.length > 0) {
        setMemoryAlerts(prev => [...prev, ...performanceAlerts].slice(-10)); // Keep last 10 alerts
        memoryManager.clearPerformanceAlerts();
      }

      // Auto-fix memory leaks if detected
      if (auditResults.activeOperations > 5 || auditResults.pendingTimeouts > 10) {
        console.warn('High memory usage detected, attempting auto-fix...');
        const fixResults = memoryLeakDetector.fixAutoImprovementLeaks();

        if (fixResults.fixed > 0) {
          console.log(`Fixed ${fixResults.fixed} memory leaks:`, fixResults.details);
        }
      }

      // Log performance metrics for debugging
      if (memoryMetrics && memoryMetrics.memoryUsagePercentage > 0.8) {
        console.warn('High memory usage detected:', {
          usage: Math.round(memoryMetrics.memoryUsagePercentage * 100) + '%',
          usedHeap: Math.round(memoryMetrics.usedJSHeapSize / 1024 / 1024) + 'MB',
          totalHeap: Math.round(memoryMetrics.totalJSHeapSize / 1024 / 1024) + 'MB'
        });
      }
    }, 30000); // Check every 30 seconds

    // Cleanup on unmount
    return () => {
      clearInterval(monitoringInterval);
      memoryManager.cleanup();
      memoryLeakDetector.clearDetectedLeaks();
    };
  }, [mounted, memoryManager, memoryLeakDetector]);

  // Load documents on mount
  useEffect(() => {
    if (mounted && user?.email) {
      safeAsyncOperation(
        () => loadDocuments(),
        'Load documents on mount'
      );
    }
  }, [mounted, user?.email, loadDocuments, safeAsyncOperation]);

  // Intelligent preloading and bundle optimization
  useEffect(() => {
    if (!mounted) return;

    // Preload AI components based on user interaction patterns
    const preloadComponents = async () => {
      // Simulate usage patterns (in real app, this would come from analytics)
      const usagePatterns = {
        aiConfigUsage: 8, // High usage
        modelSelectorUsage: 10, // Very high usage
        progressIndicatorUsage: 9, // High usage
        errorSystemUsage: 3 // Low usage
      };

      // Optimize bundle based on usage patterns
      aiBundleOptimizer.optimizeBundleForUsage(usagePatterns);

      // Preload high-priority components
      await aiBundleOptimizer.preloadAIComponents('high');
    };

    // Delay preloading to not interfere with initial page load
    const preloadTimer = setTimeout(preloadComponents, 2000);

    return () => clearTimeout(preloadTimer);
  }, [mounted, aiBundleOptimizer]);

  // Configuration persistence is now handled by useAISettings hook

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

  // Handle AI settings changes
  const handleAISettingsChange = useCallback((newSettings: any) => {
    updateAISettings(newSettings);

    // Update local state for backward compatibility
    if (newSettings.aiModel !== undefined) {
      setAiModel(newSettings.aiModel);
    }
  }, [updateAISettings]);

  // Sync AI settings with local state
  useEffect(() => {
    if (!aiSettingsLoading && aiSettings) {
      setAiModel(aiSettings.aiModel);
    }
  }, [aiSettings, aiSettingsLoading]);

  // Optimized AI improvement function
  const improveContentOptimized = useCallback(async (content: string, isAuto: boolean = false) => {
    if (!content.trim()) {
      logError({
        type: 'validation',
        severity: 'low',
        message: 'Empty content provided for improvement',
        userMessage: 'Por favor, escribe algo de contenido antes de mejorarlo.',
        recoverable: true,
        retryable: false,
        context: { contentLength: content.length }
      });
      return;
    }

    setLastError(null);

    // Track AI operation for memory leak detection
    const operationId = `ai-improvement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const operationType = isAuto ? 'Auto Content Improvement' : 'Manual Content Improvement';

    memoryLeakDetector.trackAIOperation(operationId, operationType, () => {
      // Cleanup function for this AI operation
      console.log(`Cleaning up AI operation: ${operationId}`);
    });

    try {
      const result = await retryOperation(async () => {
        if (!isOnline) {
          throw new Error('No hay conexión a internet disponible');
        }

        // Build dynamic prompt based on AI settings
        let intensityInstruction = '';
        if (aiSettings.changeIntensity <= 25) {
          intensityInstruction = 'CONSERVA EXACTAMENTE el significado y contexto original. Solo corrige errores ortográficos o gramaticales evidentes sin cambiar palabras.';
        } else if (aiSettings.changeIntensity <= 50) {
          intensityInstruction = 'Mantén el significado original. Mejora solo gramática y claridad básica sin cambiar el estilo o tono.';
        } else if (aiSettings.changeIntensity <= 75) {
          intensityInstruction = 'Respeta el contexto original. Mejora estructura y vocabulario manteniendo la esencia del texto.';
        } else {
          intensityInstruction = 'Puedes hacer cambios más amplios pero siempre respetando el mensaje y contexto original.';
        }

        let expansionInstruction = '';
        if (aiSettings.textExpansion <= 25) {
          expansionInstruction = 'NO agregues contenido nuevo. MANTÉN exactamente la misma longitud y cantidad de información.';
        } else if (aiSettings.textExpansion <= 50) {
          expansionInstruction = 'Mantén longitud muy similar. Solo pequeños ajustes de palabras si es absolutamente necesario.';
        } else if (aiSettings.textExpansion <= 75) {
          expansionInstruction = 'Puedes expandir ligeramente con detalles que complementen el contenido original.';
        } else {
          expansionInstruction = 'Puedes expandir con ejemplos y detalles relevantes al contexto original.';
        }

        const prompt = aiSettings.customPrompt || `IMPORTANTE: ${intensityInstruction} ${expansionInstruction} Mejora el texto respetando su contexto, significado y propósito original con un tono ${aiSettings.aiTone} y estilo ${aiSettings.aiStyle}. NO cambies el tema ni el enfoque. NO inventes información nueva. NO añadas saludos, firmas o elementos externos. NO uses placeholders genéricos como Señor/Señora:, o/a, (nombre), (apellido), Sr./Sra., Estimado/a o similares. Creatividad: ${aiSettings.aiCreativity}%. Devuelve ÚNICAMENTE el texto mejorado.`;

        const data = await post('/api/improve-content', {
          content,
          prompt,
          model: aiSettings.aiModel,
          temperature: aiSettings.aiCreativity / 100,
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

      // Clean up AI operation on success
      memoryLeakDetector.cleanupAIOperation(operationId);

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
        model: aiSettings.aiModel,
        contentLength: content.length,
        isAutoImprovement: isAuto
      });

      // Clean up AI operation on error
      memoryLeakDetector.cleanupAIOperation(operationId);

      throw error; // Re-throw for auto-improvement system
    }
  }, [aiSettings, post, retryOperation, isOnline, updatePageContent, logError, logAIError, memoryLeakDetector]);

  // Manual improvement function for backward compatibility
  const improveContent = useCallback(async () => {
    if (isImproving) return;

    const currentContent = pages[currentPageIndex]?.content || '';
    setIsImproving(true);

    try {
      await improveContentOptimized(currentContent, false);
    } catch (error) {
      // Error already handled in improveContentOptimized
    } finally {
      setIsImproving(false);
    }
  }, [isImproving, pages, currentPageIndex, improveContentOptimized]);

  // Version Generation Function
  const generateNewVersion = useCallback(async (direction: 'up' | 'down') => {
    const currentContent = pages[currentPageIndex]?.content || '';
    if (isGeneratingVersions || !currentContent.trim()) return;

    setIsGeneratingVersions(true);

    try {
      const prompt = direction === 'up' ?
        'Mejora este texto haciéndolo más profesional y detallado:' :
        'Simplifica este texto haciéndolo más conciso y directo:';

      // We perform a simplified call here, or we could reuse improveContentOptimized logic if adaptable
      // For now, doing a direct call similar to legacy page but using our error wrapper
      const data = await retryOperation(async () => {
        return await post('/api/improve-content', {
          content: currentContent,
          prompt,
          model: aiModel
        });
      }, 'Generate Version');

      if (data.success) {
        const newVersion = data.improvedContent;

        // Add new version to history
        const updatedVersions = [...(contentVersions.length ? contentVersions : [currentContent]), newVersion];
        setContentVersions(updatedVersions);

        // Navigate to new version
        const newIndex = updatedVersions.length - 1;
        setCurrentVersionIndex(newIndex);
        updatePageContent(newVersion);

        if (!isShowingVersions) {
          setIsShowingVersions(true);
        }
      }
    } catch (error) {
      console.error('Error generando nueva versión:', error);
      logAIError('Failed to generate version', { error });
    } finally {
      setIsGeneratingVersions(false);
    }
  }, [isGeneratingVersions, pages, currentPageIndex, aiModel, post, retryOperation, contentVersions, isShowingVersions, updatePageContent, logAIError]);

  // Optimized auto-improvement system
  const autoImprovement = useOptimizedAutoImprovement({
    config: autoImprovementConfig,
    onImprove: improveContentOptimized,
    getCurrentContent: () => pages[currentPageIndex]?.content || '',
    enabled: !aiSettingsLoading && aiSettings?.autoImprove
  });

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

  const PageContent = (
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
        isImproving={isImproving || isGeneratingVersions}
        onContentChange={handleContentChange}
        onImproveContent={improveContent}
        onSaveDocument={saveDocument}
        onAISettingsChange={handleAISettingsChange}
        onGenerateVersion={generateNewVersion}
        onShowVideoModal={() => setShowVideoModal(true)}
        isPremium={isPremium}
      />

      {/* Performance Monitor (Development/Debug Mode) */}
      {process.env.NODE_ENV === 'development' && showPerformanceMonitor && (
        <Suspense fallback={<div className="text-sm text-muted-foreground">Cargando monitor de rendimiento...</div>}>
          <PerformanceMonitor />
        </Suspense>
      )}

      {/* Memory Alerts */}
      {memoryAlerts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 space-y-2">
          {memoryAlerts.slice(-3).map((alert, index) => (
            <div
              key={`${alert.timestamp}-${index}`}
              className={`
                p-3 rounded-lg shadow-lg max-w-sm text-sm
                ${alert.severity === 'critical' ? 'bg-red-100 border-red-500 text-red-800' :
                  alert.severity === 'high' ? 'bg-orange-100 border-orange-500 text-orange-800' :
                    alert.severity === 'medium' ? 'bg-yellow-100 border-yellow-500 text-yellow-800' :
                      'bg-blue-100 border-blue-500 text-blue-800'
                }
                border-l-4 animate-slide-in-right
              `}
            >
              <div className="font-medium">
                {alert.type === 'memory' ? '🧠' :
                  alert.type === 'timeout' ? '⏱️' :
                    alert.type === 'listener' ? '👂' : '📊'}
                Alerta de Rendimiento
              </div>
              <div className="mt-1">{alert.message}</div>
              <button
                onClick={() => setMemoryAlerts(prev => prev.filter((_, i) => i !== index))}
                className="mt-2 text-xs underline hover:no-underline"
              >
                Cerrar
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Performance Toggle (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => setShowPerformanceMonitor(!showPerformanceMonitor)}
          className="fixed bottom-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors"
          title="Toggle Performance Monitor"
        >
          📊
        </button>
      )}

      {/* Error Notifications */}
      {lastError && (
        <Suspense fallback={null}>
          <ErrorNotificationSystem />
        </Suspense>
      )}

      {/* Video Modal */}
      <VideoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        videoId="dQw4w9WgXcQ" // TODO: Add actual tutorial video ID
        title="Tutorial: Cómo usar el Escritor IA"
      />
    </div>
  );

  return (
    <>
      {!user && isTrialExpired ? (
        <div className="min-h-screen bg-white flex items-center justify-center flex-col p-4">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-black">Tiempo de prueba agotado</h2>
            <p className="text-gray-600 mb-6">
              Tu tiempo de prueba gratuita ha terminado. Regístrate para continuar usando el Escritor IA y desbloquear todo su potencial.
            </p>
            <Button asChild className="w-full mb-4">
              <Link href="/auth">Registrarse Gratis</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Volver al inicio</Link>
            </Button>
          </div>
        </div>
      ) : (
        <ProtectedRoute>
          <EscritorIALayout>
            {!user ? (
              <GuestTrialInterface
                toolName="Escritor IA"
                onClose={() => { }} // Handle close logic if needed, or pass empty since wrapper handles expiration
              >
                {PageContent}
              </GuestTrialInterface>
            ) : (
              PageContent
            )}
          </EscritorIALayout>
        </ProtectedRoute>
      )}
    </>
  );
}

export default EscritorIAPage;