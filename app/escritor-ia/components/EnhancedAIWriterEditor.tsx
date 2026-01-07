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

import { useEffect, useState, useRef, useCallback } from "react";
import AIWriterEditor from "./AIWriterEditor";
import { RealTimeAnalysisIndicator } from "../../components/RealTimeAnalysisIndicator";
import { SuggestionDisplay } from "../../components/SuggestionDisplay";
import { AgentModeChangesSummary } from "../../components/AgentModeChangesSummary";
import { AgentModeChangeHighlight, AgentModeChangeHighlightLegend } from "../../components/AgentModeChangeHighlight";
import { AgentModeUndoControls } from "../../components/AgentModeUndoControls";
import { useRealTimeAnalysis } from "../../hooks/useRealTimeAnalysis";
import { useAgentModeChangeTracking } from "../../hooks/useAgentModeChangeTracking";
import { useOptimizedAutoImprovement, type AutoImprovementConfig } from "../../hooks/useOptimizedAutoImprovement";
import { AutoModeToggle } from "../../components/AutoModeToggle";
import { AutoModeSettings } from "../../components/AutoModeSettings";
import { AutoModeIndicator } from "../../components/AutoModeIndicator";
import { toast } from "sonner";
import { AnalysisResult, Suggestion } from "../../lib/real-time-analysis-engine";
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
  onImprove: parentOnImprove,
  onSave,
  onCopy,
  onOpenSettings,
  isProcessing: parentIsProcessing,
  isSaving = false,
  disabled = false,
  usageInfo,
  enableRealTimeAnalysis = true,
  enableAgentMode = true,
  onAnalysisComplete,
  onAgentModeChange,
  isSettingsPanelOpen = false
}: EnhancedAIWriterEditorProps) {
  // Track accepted and rejected suggestions for learning
  const [acceptedSuggestions, setAcceptedSuggestions] = useState<Suggestion[]>([]);
  const [rejectedSuggestions, setRejectedSuggestions] = useState<Suggestion[]>([]);

  // UI state for change tracking
  const [showChangesSummary, setShowChangesSummary] = useState(false);
  const [showChangeHighlights, setShowChangeHighlights] = useState(false);
  
  // Auto Improvement Configuration State
  const [autoConfig, setAutoConfig] = useState<AutoImprovementConfig>({
    enabled: false, // Default off per requirements
    delay: 2000,
    minWords: 10,
    maxRetries: 3,
    debounceDelay: 1000
  });

  const [showAutoSettings, setShowAutoSettings] = useState(false);

  // DEBUG: Trace props
  useEffect(() => {
    console.log('[EnhancedAIWriterEditor] Props:', {
      isProcessing: parentIsProcessing,
      disabled,
      enableAgentMode,
      contentLength: content?.length,
      showChangeHighlights
    });
  }, [parentIsProcessing, disabled, enableAgentMode, content, showChangeHighlights]);

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
    completeSession,
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
    if (!content.trim()) {
      toast.error("Escribe algo antes de mejorar.");
      return;
    }
    
    // Start session if not exists
    const sessionId = startSession(content);
    
    // Trigger improvement logic
    await performImprovement(content, false);
  };

  // Core Improvement Logic
  const performImprovement = async (textToImprove: string, isAuto: boolean) => {
    const toastId = isAuto ? undefined : toast.loading("Mejorando texto...");
    
    try {
      // Get settings for API configuration
      const settings = getSettings();
      
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
         
         if (textSegment.length < 5) return; // Too short
      }

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

      const response = await improveContent({
        content: textSegment,
        instruction: instruction,
        language: settings?.language || 'es'
      }, {
        provider: settings?.provider || 'openrouter',
        model: settings?.model || 'openai/gpt-4o-mini',
        temperature: 0.7,
        apiKey: settings?.apiKey
      });

      if (response.success && response.improvedContent) {
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

        // Apply change
        const freshContent = contentRef.current;
        const newContent = freshContent.substring(0, segmentStartIndex) + response.improvedContent + freshContent.substring(segmentStartIndex + textSegment.length);
        
        onContentChange(newContent);
        
        if (!isAuto) {
          toast.dismiss(toastId);
          toast.success("Texto mejorado exitosamente");
        } else {
          toast.success("Mejora automática aplicada", { duration: 2000 });
        }
      } else {
        if (!isAuto) {
          toast.dismiss(toastId);
          toast.error(response.error?.userMessage || "Error al mejorar texto");
        }
      }

    } catch (error) {
      console.error('Improvement error:', error);
      if (!isAuto) {
        toast.dismiss(toastId);
        toast.error("Error inesperado");
      }
    }
  };

  // Hook for Auto Improvement
  const { state: autoState } = useOptimizedAutoImprovement({
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

  // Handle content change
  const handleContentChange = (newContent: string) => {
    onContentChange(newContent);
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
              isProcessing={autoState.isImproving}
              disabled={disabled}
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
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
           {/* Manual Improve Button */}
           <button
            onClick={handleManualImprove}
            disabled={parentIsProcessing || autoState.isImproving || disabled}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {parentIsProcessing || autoState.isImproving ? (
              <>
                <span className="animate-spin">⏳</span> Procesando...
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
              enabled: false,
              delay: 2000,
              minWords: 10,
              maxRetries: 3,
              debounceDelay: 1000
            })}
          />
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
          onChange={handleContentChange}
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
             {currentSession.changes.map(change => (
               <AgentModeChangeHighlight
                 key={change.id}
                 change={change}
                 content={content}
                 onClick={() => {}} // Could open details
               />
             ))}
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
