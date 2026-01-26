/**
 * Enhanced AI Writer Editor with Real-Time Analysis
 * 
 * Extends the base AIWriterEditor with real-time analysis capabilities:
 * - 2-second interval analysis
 * - Debounced content updates
 * - Non-blocking background processing
 * - Real-time status indicators
 * - Auto-Improvement Mode (formerly Agent Mode)
 */

"use client";

// Global timeout declaration
declare global {
  interface Window {
    autoImprovementTimeout?: NodeJS.Timeout;
  }
}

import { useEffect, useState, useRef } from "react";
import AIWriterEditor from "./AIWriterEditor";
import { RealTimeAnalysisIndicator } from "../../components/RealTimeAnalysisIndicator";
import { AgentModeChangesSummary } from "../../components/AgentModeChangesSummary";
import { AgentModeChangeHighlight, AgentModeChangeHighlightLegend } from "../../components/AgentModeChangeHighlight";
import { AgentModeUndoControls } from "../../components/AgentModeUndoControls";
import { useRealTimeAnalysis } from "../../hooks/useRealTimeAnalysis";
import { useAgentModeChangeTracking } from "../../hooks/useAgentModeChangeTracking";
import { useSimpleAutoImprovement, type AutoImprovementConfig } from "../../hooks/useSimpleAutoImprovement";
import { AutoModeToggle } from "../../components/AutoModeToggle";
import { AutoModeSettings } from "../../components/AutoModeSettings";
import { AutoModeIndicator } from "../../components/AutoModeIndicator";
import { toast } from "sonner";
import { AnalysisResult } from "../../lib/real-time-analysis-engine";
import { improveContent } from "../../lib/ai-client"; // Updated client with queue
import { getSettings } from "../../lib/settings-manager";

interface EnhancedAIWriterEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  onImprove: () => void; // Legacy manual trigger from parent (optional usage)
  onSave: () => void;
  onCopy: () => void;
  onOpenSettings: () => void;
  isProcessing: boolean;
  isSaving?: boolean;
  disabled?: boolean;
  usageInfo?: {
    usage: number;
    limit: number;
    isPremium: boolean;
  } | null;
  enableRealTimeAnalysis?: boolean;
  enableAgentMode?: boolean;
  onAnalysisComplete?: (result: AnalysisResult) => void;
  onAgentModeChange?: (isActive: boolean) => void;
  isSettingsPanelOpen?: boolean;
}

/**
 * Enhanced AI Writer Editor Component
 * 
 * Wraps the base AIWriterEditor with real-time analysis and autonomous improvement capabilities.
 */
export default function EnhancedAIWriterEditor({
  content,
  onContentChange,
  onImprove: _parentOnImprove,
  onSave,
  onCopy,
  onOpenSettings,
  isProcessing: parentIsProcessing,
  isSaving = false,
  disabled = false,
  usageInfo: _usageInfo,
  enableRealTimeAnalysis = true,
  enableAgentMode = true,
  onAnalysisComplete,
  onAgentModeChange: _onAgentModeChange,
  isSettingsPanelOpen: _isSettingsPanelOpen = false
}: EnhancedAIWriterEditorProps) {
  // UI state for change tracking
  const [showChangesSummary, setShowChangesSummary] = useState(false);
  const [showChangeHighlights, setShowChangeHighlights] = useState(false);

  // Auto Improvement Configuration State
  const [autoConfig, setAutoConfig] = useState<AutoImprovementConfig>({
    enabled: true, // Habilitado por defecto para mejoramiento automático
    delay: 2000, // 2 segundos después de dejar de escribir (Requerimiento estricto)
    minWords: 5, // Mínimo 5 palabras para activar
    improvementLevel: 'balanced'
  });

  const [showAutoSettings, setShowAutoSettings] = useState(false);

  // Unified Processing State Management
  const [internalProcessingState, setInternalProcessingState] = useState<{
    isProcessing: boolean;
    source: 'manual' | 'auto' | null;
    startTime: number | null;
  }>({
    isProcessing: false,
    source: null,
    startTime: null
  });

  // Computed unified processing state
  const unifiedProcessingState = {
    isProcessing: parentIsProcessing || internalProcessingState.isProcessing,
    source: parentIsProcessing ? 'manual' : internalProcessingState.source,
    startTime: internalProcessingState.startTime
  };

  // DEBUG: Trace props and unified state
  useEffect(() => {
    console.log('[EnhancedAIWriterEditor] Props and State:', {
      parentIsProcessing,
      internalProcessing: internalProcessingState.isProcessing,
      unifiedProcessing: unifiedProcessingState.isProcessing,
      processingSource: unifiedProcessingState.source,
      disabled,
      enableAgentMode,
      contentLength: content?.length,
      showChangeHighlights
    });
  }, [parentIsProcessing, internalProcessingState, unifiedProcessingState, disabled, enableAgentMode, content, showChangeHighlights]);

  // Ref for the editor container
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef(content);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  // Initialize change tracking (History Management)
  const {
    currentSession,
    startSession,
    addChange,
    completeSession: _completeSession,
    applyAllChanges,
    applyChanges,
    revertAllChanges,
    revertChanges,
    undo,
    redo,
    canUndo,
    canRedo,
    getChangesSummary
  } = useAgentModeChangeTracking({
    onSessionChange: (session) => {
      // Show changes summary when session completes if changes exist
      if (session.status === 'complete' && session.changes.length > 0) {
        setShowChangesSummary(true);
        setShowChangeHighlights(true);
      }
    }
  });

  // Handle Manual Improvement (Button Click)
  const handleManualImprove = async () => {
    // DEBUG: Log entry point
    console.log('[EnhancedAIWriterEditor] handleManualImprove called');
    console.log('[EnhancedAIWriterEditor] Current content length:', content?.length);
    console.log('[EnhancedAIWriterEditor] Content preview:', content?.substring(0, 100));

    if (!content.trim()) {
      console.log('[EnhancedAIWriterEditor] Content is empty, showing error');
      toast.error("Escribe algo antes de mejorar.");
      return;
    }

    // Check if already processing
    if (unifiedProcessingState.isProcessing) {
      console.log('[EnhancedAIWriterEditor] Already processing, ignoring manual improve request');
      return;
    }

    // Set processing state for manual improvement
    setInternalProcessingState({
      isProcessing: true,
      source: 'manual',
      startTime: Date.now()
    });

    // Start session if not exists
    const sessionId = startSession(content);
    console.log('[EnhancedAIWriterEditor] Started session:', sessionId);

    try {
      // Trigger improvement logic using the current content from ref for freshness
      const currentContent = contentRef.current;
      console.log('[EnhancedAIWriterEditor] Using content from ref, length:', currentContent?.length);

      await performImprovement(currentContent, false);
      console.log('[EnhancedAIWriterEditor] performImprovement completed');
    } finally {
      // Clear processing state
      setInternalProcessingState({
        isProcessing: false,
        source: null,
        startTime: null
      });
    }
  };

  // Core Improvement Logic
  const performImprovement = async (textToImprove: string, isAuto: boolean) => {
    console.log('[EnhancedAIWriterEditor] performImprovement called');
    console.log('[EnhancedAIWriterEditor] isAuto:', isAuto);
    console.log('[EnhancedAIWriterEditor] textToImprove length:', textToImprove?.length);
    console.log('[EnhancedAIWriterEditor] Original text:', textToImprove);

    // Set processing state for auto improvement if not already set
    if (isAuto && !unifiedProcessingState.isProcessing) {
      setInternalProcessingState({
        isProcessing: true,
        source: 'auto',
        startTime: Date.now()
      });
    }

    const toastId = isAuto ? undefined : toast.loading("Mejorando texto...");

    try {
      // Get settings for API configuration
      const settings = getSettings();
      console.log('[EnhancedAIWriterEditor] Settings loaded:', {
        provider: settings?.provider,
        model: settings?.model,
        hasApiKey: !!settings?.apiKey
      });

      // Determine what to improve
      // For auto mode, we might want to improve just the last segment to be less intrusive
      // But for now let's stick to the full text or segment logic

      let textSegment = textToImprove;
      let segmentStartIndex = 0;

      if (isAuto) {
        // Logic to pick last segment similar to previous implementation
        const trimmed = textToImprove.trimEnd();
        const lastPunctuationIndex = Math.max(
          trimmed.lastIndexOf('.'),
          trimmed.lastIndexOf('!'),
          trimmed.lastIndexOf('?'),
          trimmed.lastIndexOf('\n')
        );

        if (lastPunctuationIndex !== -1) {
          segmentStartIndex = lastPunctuationIndex + 1;
          textSegment = trimmed.substring(segmentStartIndex).trim();
        } else {
          // If text is short, take it all
          textSegment = trimmed;
          segmentStartIndex = 0;
        }

        if (textSegment.length < 5) {
          console.log('[EnhancedAIWriterEditor] Text segment too short, skipping');
          return;
        }
      }

      console.log('[EnhancedAIWriterEditor] Text segment to improve:', textSegment);
      console.log('[EnhancedAIWriterEditor] Segment start index:', segmentStartIndex);

      // Determine instructions based on improvement level
      let instruction = "Mejora gramática, fluidez y tono profesional. Mantén idioma original.";

      // Apply improvement level if configured, regardless of mode (auto vs manual)
      if (autoConfig.improvementLevel) {
        switch (autoConfig.improvementLevel) {
          case 'conservative':
            instruction = "Corrige solo errores gramaticales y ortográficos evidentes. Mantén el estilo original estrictamente.";
            break;
          case 'creative':
            instruction = "Mejora el estilo para que sea más creativo y atractivo, manteniendo el mensaje principal.";
            break;
          case 'balanced':
          default:
            instruction = "Mejora la fluidez y el tono profesional. Mantén el idioma original.";
            break;
        }
      }

      console.log('[EnhancedAIWriterEditor] Calling improveContent API...');

      const response = await improveContent({
        content: textSegment,
        instruction: instruction,
        language: 'es' // Default to Spanish since settings doesn't have language
      }, {
        provider: settings?.provider || 'openrouter',
        model: settings?.model || 'openai/gpt-4o-mini',
        temperature: 0.7,
        apiKey: settings?.apiKey
      });

      console.log('[EnhancedAIWriterEditor] API response received:', {
        success: response.success,
        hasImprovedContent: !!response.improvedContent,
        improvedContentLength: response.improvedContent?.length,
        error: response.error
      });

      if (response.success && response.improvedContent) {
        // CRITICAL: Verify the text actually changed
        const originalText = textSegment.trim().toLowerCase();
        const improvedText = response.improvedContent.trim().toLowerCase();

        console.log('[EnhancedAIWriterEditor] Comparing texts:');
        console.log('Original:', originalText);
        console.log('Improved:', improvedText);
        console.log('Are different:', originalText !== improvedText);

        if (originalText === improvedText) {
          // Text didn't change - this is a failure
          const errorMsg = "El texto no necesita mejoras o la IA no pudo mejorarlo";
          console.warn('[EnhancedAIWriterEditor] Text unchanged:', errorMsg);

          if (!isAuto) {
            toast.dismiss(toastId);
            toast.warning(errorMsg);
          }

          // Don't update the content or show success
          return;
        }

        // Calculate diff/change for history
        addChange({
          type: 'stylistic',
          before: textSegment,
          after: response.improvedContent,
          position: {
            start: segmentStartIndex,
            end: segmentStartIndex + textSegment.length
          },
          reason: isAuto ? 'Mejora automática' : 'Mejora manual',
          confidence: 0.9,
          impact: 'minor'
        });

        // Apply change using fresh content from ref
        const freshContent = contentRef.current;
        console.log('[EnhancedAIWriterEditor] Fresh content from ref, length:', freshContent?.length);

        const newContent = freshContent.substring(0, segmentStartIndex) + response.improvedContent + freshContent.substring(segmentStartIndex + textSegment.length);

        console.log('[EnhancedAIWriterEditor] New content constructed, length:', newContent?.length);
        console.log('[EnhancedAIWriterEditor] Calling onContentChange...');

        onContentChange(newContent);

        console.log('[EnhancedAIWriterEditor] onContentChange called successfully');

        if (!isAuto) {
          toast.dismiss(toastId);
          toast.success("Texto mejorado exitosamente");
        } else {
          toast.success("Mejora automática aplicada", { duration: 2000 });
        }
      } else {
        console.error('[EnhancedAIWriterEditor] API returned error or no content:', response.error);
        if (!isAuto) {
          toast.dismiss(toastId);
          toast.error(response.error?.userMessage || "Error al mejorar texto");
        }
      }

    } catch (error) {
      console.error('[EnhancedAIWriterEditor] Improvement error:', error);
      if (!isAuto) {
        toast.dismiss(toastId);
        toast.error("Error inesperado");
      }
    } finally {
      // Clear processing state for auto improvement
      if (isAuto) {
        setInternalProcessingState({
          isProcessing: false,
          source: null,
          startTime: null
        });
      }
    }
  };

  // Hook for Auto Improvement
  const { state: autoState, handleTyping, clearError } = useSimpleAutoImprovement({
    config: autoConfig,
    enabled: enableAgentMode && !disabled,
    getCurrentContent: () => contentRef.current,
    onImprove: async (text, isAuto) => {
      await performImprovement(text, isAuto);
    }
  });

  // Initialize real-time analysis (Suggestions/Underlines)
  const {
    suggestions,
    isAnalyzing,
    timeSinceLastAnalysis,
    updateContent,
    setEnabled: setAnalysisEnabled,
    isEnabled: isAnalysisEnabled,
    processingTime
  } = useRealTimeAnalysis({
    enabled: enableRealTimeAnalysis,
    interval: 2000,
    debounceDelay: 300,
    minContentLength: 10,
    onAnalysisComplete: (result) => {
      if (onAnalysisComplete) onAnalysisComplete(result);
    }
  });

  // Update analysis when content changes
  useEffect(() => {
    if (isAnalysisEnabled && !disabled) {
      updateContent(content);
    }
  }, [content, isAnalysisEnabled, disabled, updateContent]);

  // Handle content change with typing detection for auto-improvement
  const handleContentChange = (newContent: string) => {
    onContentChange(newContent);

    // Trigger typing detection for auto-improvement hook
    // El hook gestiona internamente el mutex y estado, siempre lo llamamos
    if (autoConfig.enabled && enableAgentMode && !disabled) {
      console.log('[EnhancedEditor] 📝 Contenido cambió, llamando handleTyping');
      handleTyping();
    }

    // Analysis update is handled by effect
  };


  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
      } else if (((e.ctrlKey && e.key === 'y') || (e.metaKey && e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        if (canRedo) redo();
      }
    };

    const container = editorContainerRef.current;
    if (container) {
      container.addEventListener('keydown', handleKeyDown);
      return () => container.removeEventListener('keydown', handleKeyDown);
    }
  }, [canUndo, canRedo, undo, redo]);

  // Cleanup timeout on unmount



  return (
    <div className="space-y-0" ref={editorContainerRef}>

      {/* Top Toolbar / Status Bar */}
      <div className="bg-background border-b px-4 py-2 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-4">
          {/* Auto Mode Controls */}
          <div className="flex items-center space-x-2">
            <AutoModeToggle
              enabled={autoConfig.enabled}
              onToggle={(val) => setAutoConfig(prev => ({ ...prev, enabled: val }))}
              isProcessing={unifiedProcessingState.isProcessing}
              disabled={!enableAgentMode} // Solo desactivar si enableAgentMode es false
            />
            <AutoModeIndicator
              state={autoState}
              config={autoConfig}
              currentWordCount={content.split(/\s+/).length}
            />
            <button
              onClick={() => setShowAutoSettings(!showAutoSettings)}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
              title="Configuración Automática"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Manual Improve Button */}
          <button
            onClick={handleManualImprove}
            disabled={unifiedProcessingState.isProcessing || disabled}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {unifiedProcessingState.isProcessing ? (
              <>
                <span className="animate-spin">⏳</span>
                {unifiedProcessingState.source === 'manual' ? 'Procesando...' : 'Mejorando automáticamente...'}
              </>
            ) : (
              <>
                <span>✨</span> Mejorar con IA
              </>
            )}
          </button>
        </div>
      </div>

      {/* Auto Mode Settings Panel */}
      {showAutoSettings && (
        <div className="border-b bg-muted/20 p-4">
          <AutoModeSettings
            config={autoConfig}
            onChange={(newConfig) => setAutoConfig(prev => ({ ...prev, ...newConfig }))}
            onReset={() => setAutoConfig({
              enabled: true,
              delay: 2000,
              minWords: 5,
              improvementLevel: 'balanced'
            })}
          />
        </div>
      )}

      {/* Error Display for Auto Improvement */}
      {autoState.lastError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mx-4 my-2">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Problema con mejoramiento automático
              </h3>
              <p className="mt-1 text-sm text-red-700">
                {autoState.lastError}
              </p>
              {autoState.errorCount > 1 && (
                <p className="mt-1 text-xs text-red-600">
                  Errores consecutivos: {autoState.errorCount}
                </p>
              )}
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => setShowAutoSettings(true)}
                  className="text-xs text-red-600 hover:text-red-800 underline"
                >
                  Abrir configuración
                </button>
                <button
                  onClick={clearError}
                  className="text-xs text-red-600 hover:text-red-800 underline"
                >
                  Cerrar error
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real-Time Analysis Status Bar (Optional) */}
      {enableRealTimeAnalysis && (
        <div className="bg-muted/30 px-6 py-2 border-b text-xs text-muted-foreground flex justify-between">
          <RealTimeAnalysisIndicator
            isAnalyzing={isAnalyzing}
            timeSinceLastAnalysis={timeSinceLastAnalysis}
            processingTime={processingTime}
            isEnabled={isAnalysisEnabled}
            onToggle={setAnalysisEnabled}
            suggestionsCount={suggestions.length}
          />
        </div>
      )}

      {/* Undo/Redo Controls */}
      {(canUndo || canRedo) && (
        <div className="bg-gray-50 px-6 py-2 border-b">
          <AgentModeUndoControls
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={() => { undo(); onContentChange(contentRef.current); }} // Sync content
            onRedo={() => { redo(); onContentChange(contentRef.current); }}
            showClearHistory={false}
          />
        </div>
      )}

      {/* Changes Summary Modal */}
      {showChangesSummary && currentSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-hidden bg-background rounded-lg shadow-xl">
            <AgentModeChangesSummary
              session={currentSession}
              summary={getChangesSummary(currentSession.sessionId)}
              onApplyAll={() => {
                const res = applyAllChanges(currentSession.sessionId, content);
                onContentChange(res);
                setShowChangesSummary(false);
                setShowChangeHighlights(false);
              }}
              onRevertAll={() => {
                const res = revertAllChanges(currentSession.sessionId, content);
                onContentChange(res);
                setShowChangesSummary(false);
                setShowChangeHighlights(false);
              }}
              onApplySelected={(ids) => {
                const res = applyChanges(currentSession.sessionId, ids, content);
                onContentChange(res);
              }}
              onRevertSelected={(ids) => {
                const res = revertChanges(currentSession.sessionId, ids, content);
                onContentChange(res);
              }}
            />
            <div className="p-4 border-t flex justify-end">
              <button
                type="button"
                onClick={() => setShowChangesSummary(false)}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Highlights Toggle */}
      {currentSession && currentSession.changes.length > 0 && (
        <div className="bg-yellow-50 px-6 py-2 border-b flex justify-between items-center">
          <span className="text-xs text-yellow-800">
            {currentSession.changes.length} cambios pendientes de revisión
          </span>
          <button
            type="button"
            onClick={() => setShowChangeHighlights(!showChangeHighlights)}
            className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors"
          >
            {showChangeHighlights ? 'Ocultar cambios' : 'Ver cambios'}
          </button>
        </div>
      )}

      {/* Editor Area */}
      <div className="relative min-h-[500px]">
        <AIWriterEditor
          content={content}
          onContentChange={handleContentChange}
          onImprove={handleManualImprove}
          onSave={onSave}
          onCopy={onCopy}
          onOpenSettings={onOpenSettings}
          isProcessing={parentIsProcessing}
          isSaving={isSaving}
          disabled={disabled}
          autoModeEnabled={false} // Disable internal auto mode to prevent conflict with Enhanced mode
        />

        {/* Highlight Overlay */}
        {showChangeHighlights && currentSession && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <AgentModeChangeHighlight
              content={content}
              changes={currentSession.changes}
              appliedChanges={new Set()}
              revertedChanges={new Set()}
              onChangeClick={() => { }} // Could open details
            />
          </div>
        )}
      </div>

      {/* Footer Legend */}
      {showChangeHighlights && (
        <div className="border-t p-2 bg-background">
          <AgentModeChangeHighlightLegend />
        </div>
      )}
    </div>
  );
}
