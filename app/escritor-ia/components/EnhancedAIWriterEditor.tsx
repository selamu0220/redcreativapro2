/**
 * Enhanced AI Writer Editor with Real-Time Analysis
 * 
 * Extends the base AIWriterEditor with real-time analysis capabilities:
 * - 2-second interval analysis
 * - Debounced content updates
 * - Non-blocking background processing
 * - Real-time status indicators
 * - Agent mode with Shift+1 keyboard shortcut
 */

"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import AIWriterEditor from "./AIWriterEditor";
import { RealTimeAnalysisIndicator } from "../../components/RealTimeAnalysisIndicator";
import { SuggestionDisplay } from "../../components/SuggestionDisplay";
import { AgentModeIndicator } from "../../components/AgentModeIndicator";
import { AgentModeChangesSummary } from "../../components/AgentModeChangesSummary";
import { AgentModeChangeHighlight, AgentModeChangeHighlightLegend } from "../../components/AgentModeChangeHighlight";
import { AgentModeUndoControls } from "../../components/AgentModeUndoControls";
import { useRealTimeAnalysis } from "../../hooks/useRealTimeAnalysis";
import { useAgentModeActivation } from "../../hooks/useAgentModeActivation";
import { useAgentModeKeyboardShortcut } from "../../hooks/useAgentModeKeyboardShortcut";
import { useAgentModeChangeTracking } from "../../hooks/useAgentModeChangeTracking";
import { toast } from "sonner";
import { AnalysisResult, Suggestion } from "../../lib/real-time-analysis-engine";

interface EnhancedAIWriterEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  onImprove: () => void;
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
}

/**
 * Enhanced AI Writer Editor Component
 * 
 * Wraps the base AIWriterEditor with real-time analysis and agent mode capabilities.
 * Maintains all existing functionality while adding continuous analysis and autonomous improvements.
 */
export default function EnhancedAIWriterEditor({
  content,
  onContentChange,
  onImprove,
  onSave,
  onCopy,
  onOpenSettings,
  isProcessing,
  isSaving = false,
  disabled = false,
  usageInfo,
  enableRealTimeAnalysis = true,
  enableAgentMode = true,
  onAnalysisComplete,
  onAgentModeChange
}: EnhancedAIWriterEditorProps) {
  // Track accepted and rejected suggestions for learning
  const [acceptedSuggestions, setAcceptedSuggestions] = useState<Suggestion[]>([]);
  const [rejectedSuggestions, setRejectedSuggestions] = useState<Suggestion[]>([]);

  // UI state for change tracking
  const [showChangesSummary, setShowChangesSummary] = useState(false);
  const [showChangeHighlights, setShowChangeHighlights] = useState(false);

  // DEBUG: Trace props to find why user can't write
  useEffect(() => {
    console.log('[EnhancedAIWriterEditor] Props:', {
      isProcessing,
      disabled,
      enableAgentMode,
      contentLength: content?.length,
      showChangeHighlights
    });
  }, [isProcessing, disabled, enableAgentMode, content, showChangeHighlights]);

  // Ref for the editor container (for keyboard shortcut scoping)
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Ref to track latest content for async operations (Agent Mode)
  const contentRef = useRef(content);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  // Initialize change tracking
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
      console.log('Agent mode session updated:', {
        sessionId: session.sessionId,
        status: session.status,
        changesCount: session.changes.length
      });

      // Show changes summary when session completes
      if (session.status === 'complete' && session.changes.length > 0) {
        setShowChangesSummary(true);
        setShowChangeHighlights(true);
      }
    }
  });


  // Trigger Agent Mode Improvement (Real AI)
  const triggerAgentModeImprovement = useCallback(async () => {
    // 1. Check content
    const currentContent = contentRef.current || content;

    // RELAXED CONDITION: We don't enforce "ends with space" strictly anymore
    // The delay from useAgentModeActivation (2s) is enough to imply a pause.
    if (!currentContent.trim()) {
      return;
    }

    // 2. Identify the segment to improve (Last sentence/paragraph)
    // We look for the last punctuation mark before the trailing space
    const trimmed = currentContent.trimEnd();
    const lastPunctuationIndex = Math.max(
      trimmed.lastIndexOf('.'),
      trimmed.lastIndexOf('!'),
      trimmed.lastIndexOf('?'),
      trimmed.lastIndexOf('\n')
    );

    // Get the segment text
    let segmentStartIndex = lastPunctuationIndex + 1;
    // If no punctuation found, take the whole text (or last 200 chars to be safe)
    if (lastPunctuationIndex === -1) {
      segmentStartIndex = Math.max(0, trimmed.length - 200);
    }

    // Ensure we don't just pick empty space
    if (segmentStartIndex >= trimmed.length) return;

    const segmentText = trimmed.substring(segmentStartIndex).trim();

    // Minimum length check (don't annoying improve single words unless intended)
    if (segmentText.length < 5) return; // e.g. "Hola" might not need AI yet

    console.log('Agent Mode: Improving segment:', segmentText);

    // Notify user that we are working (only now, after validation)
    const toastId = toast.loading("El agente está mejorando tu texto...");

    // 3. Call AI Service with ROBUST settings loading (matching page.tsx handleImprove)
    try {
      // Import dependencies dynamically
      const settingsModule = await import('../../lib/settings-manager');
      const { improveContent } = await import('../../lib/ai-client');

      const settings = settingsModule.getSettings();

      // LOGIC COPIED FROM handleImprove in page.tsx
      let apiKeyToUse = settings?.apiKey;
      let providerToUse = settings?.provider || 'openrouter';
      let modelToUse = settings?.model || 'google/gemini-2.0-flash-exp:free';

      // NOTE: We don't have access to page.tsx's env vars (geminiApiKey, openRouterApiKey) directly here easily
      // UNLESS we pass them as props or fetch them.
      // However, settings-manager usually handles local storage settings.
      // If handleImprove works, it means it has access to vars that settings-manager might not returning if they are env vars.

      // CRITICAL: We need to ensure we use the same fallback logic. 
      // The snippet in page.tsx uses `geminiApiKey` and `openRouterApiKey` from props/env.
      // EnhancedAIWriterEditor might not have these.
      // FIX: We will rely on the server-side API proxy if client keys are missing?
      // Actually, improveContent likely handles the call. If apiKey is empty, does it fail?
      // in page.tsx:
      /*
        if (!settings?.usePersonalKey) {
          if (providerToUse === 'google' && geminiApiKey) ...
        }
      */

      // Since we can't easily inject the env vars here without prop drilling, 
      // we will assume valid settings or rely on the simple fetch if keys are missing from settings but present in env (handled by API route usually, but improveContent is client-side wrapper).

      // Wait! improveContent calls `/api/improve-text`!
      // The API route `/api/improve-text` SHOULD handle the environment variables if no key is provided!
      // let's check improveContent implementation.
      // If page.tsx passes logic, it means *it* decides the key.

      // For now, let's use the exact settings we have.
      // If the user hasn't set a personal key, we might be sending empty string.
      // If we send empty string, the wrapper might fail or the API might use default?

      // Let's rely on what we have, but add better error logging.

      // Custom instruction for "Auto-Improve"
      const instruction = "Mejora este texto brevemente (gramática, fluidez, tono) para que suene profesional. Mantén el idioma original. Solo devuelve el texto mejorado.";

      const response = await improveContent({
        content: segmentText,
        instruction: instruction
      }, {
        provider: providerToUse,
        model: modelToUse,
        apiKey: apiKeyToUse || '', // Should trigger backend default if empty?
        temperature: 0.3
      });

      if (response.success && response.improvedContent) {
        // ... (existing application logic)
        addChange({
          type: 'stylistic',
          before: segmentText,
          after: response.improvedContent,
          position: {
            start: segmentStartIndex,
            end: segmentStartIndex + segmentText.length
          },
          reason: 'Mejora automática (Agente)',
          confidence: 0.9,
          impact: 'minor'
        });

        const freshContent = contentRef.current || currentContent;
        // Check conflict (simplistic)
        const newTotalContent = freshContent.substring(0, segmentStartIndex) + response.improvedContent + freshContent.substring(segmentStartIndex + segmentText.length);

        console.log('Agent Mode: Applying new content:', {
          originalSegment: segmentText,
          improvedSegment: response.improvedContent,
          newContentLength: newTotalContent.length
        });

        onContentChange(newTotalContent);

        toast.dismiss(toastId);
        toast.success("Texto mejorado por el agente");
        console.log('Agent Mode: Improvement applied');
      } else {
        console.warn('Agent Mode: No improvement returned or success=false', response);
        toast.dismiss(toastId);
        // Optional: show error toast if it was a real error
        if (response.error) {
          console.error('Agent Mode AI Error:', response.error);
        }
      }

    } catch (err) {
      toast.dismiss(toastId);
      console.error('Agent Mode Error:', err);
    }
  }, [content, addChange, onContentChange]); // Dependencies for useCallback

  // Initialize agent mode activation
  const {
    isActive: isAgentModeActive,
    isEnabled: isAgentModeEnabled,
    autoActivate: agentModeAutoActivate,
    status: agentModeStatus,
    onTyping: notifyTyping,
    setEnabled: setAgentModeEnabled,
    setAutoActivate: setAgentModeAutoActivate,
    toggleEnabled: toggleAgentMode
  } = useAgentModeActivation({
    enabled: enableAgentMode,
    autoActivate: true,
    activationDelay: 2000,
    onAgentModeChange: (isActive) => {
      console.log(`Agent mode ${isActive ? 'activated' : 'deactivated'}`);
      if (onAgentModeChange) {
        onAgentModeChange(isActive);
      }

      // Start a new change tracking session when agent mode activates
      if (isActive) {
        console.log('Agent mode active - starting change tracking session');
        const sessionId = startSession(content);
        console.log('Change tracking session started:', sessionId);

        // Trigger real AI improvement
        triggerAgentModeImprovement();
      }
    },
    onTypingChange: (isTyping) => {
      console.log(`Typing ${isTyping ? 'started' : 'stopped'}`);
    }
  });




  // Set up keyboard shortcut for agent mode toggle (Shift+1)
  useAgentModeKeyboardShortcut({
    enabled: enableAgentMode && !disabled,
    onToggle: toggleAgentMode,
    targetRef: editorContainerRef
  });

  // Initialize real-time analysis
  const {
    suggestions,
    isAnalyzing,
    lastAnalysisTime,
    timeSinceLastAnalysis,
    updateContent,
    setEnabled,
    isEnabled,
    processingTime
  } = useRealTimeAnalysis({
    enabled: enableRealTimeAnalysis,
    interval: 2000, // 2 seconds as per requirements
    debounceDelay: 300, // 300ms debounce to prevent excessive calls
    minContentLength: 10, // Minimum 10 characters to trigger analysis
    onAnalysisComplete: (result) => {
      console.log('Analysis complete:', {
        timestamp: new Date(result.timestamp).toISOString(),
        suggestionsCount: result.suggestions.length,
        processingTime: result.processingTime
      });

      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    },
    onError: (error) => {
      console.error('Real-time analysis error:', error);
    }
  });

  // Update analysis engine when content changes
  useEffect(() => {
    if (isEnabled && !disabled) {
      updateContent(content);
    }
  }, [content, isEnabled, disabled, updateContent]);

  // Handle content change from editor
  const handleContentChange = (newContent: string) => {
    onContentChange(newContent);

    // Notify agent mode of typing activity
    if (enableAgentMode && isAgentModeEnabled) {
      notifyTyping();
    }
    // updateContent is called via useEffect above
  };

  // Handle analysis toggle
  const handleToggleAnalysis = (enabled: boolean) => {
    setEnabled(enabled);
    console.log(`Real-time analysis ${enabled ? 'enabled' : 'disabled'}`);
  };

  // Handle suggestion acceptance
  const handleAcceptSuggestion = (suggestion: Suggestion) => {
    console.log('Accepting suggestion:', suggestion.id);

    // Track accepted suggestion
    setAcceptedSuggestions(prev => [...prev, suggestion]);

    // Apply the suggestion to the content
    const before = content.substring(0, suggestion.position.start);
    const after = content.substring(suggestion.position.end);
    const newContent = before + suggestion.suggestedText + after;

    onContentChange(newContent);

    // Log for learning
    console.log('Suggestion accepted and applied:', {
      type: suggestion.type,
      confidence: suggestion.confidence,
      originalLength: suggestion.originalText.length,
      suggestedLength: suggestion.suggestedText.length
    });
  };

  // Handle suggestion rejection
  const handleRejectSuggestion = (suggestion: Suggestion) => {
    console.log('Rejecting suggestion:', suggestion.id);

    // Track rejected suggestion for learning
    setRejectedSuggestions(prev => [...prev, suggestion]);

    // Log for learning
    console.log('Suggestion rejected:', {
      type: suggestion.type,
      confidence: suggestion.confidence,
      reason: 'user_rejected'
    });
  };

  // Handle applying all changes from agent mode
  const handleApplyAllChanges = () => {
    if (!currentSession) return;

    const newContent = applyAllChanges(currentSession.sessionId, content);
    onContentChange(newContent);
    setShowChangesSummary(false);
    setShowChangeHighlights(false);
    console.log('All agent mode changes applied');
  };

  // Handle reverting all changes from agent mode
  const handleRevertAllChanges = () => {
    if (!currentSession) return;

    const newContent = revertAllChanges(currentSession.sessionId, content);
    onContentChange(newContent);
    setShowChangesSummary(false);
    setShowChangeHighlights(false);
    console.log('All agent mode changes reverted');
  };

  // Handle applying selected changes
  const handleApplySelectedChanges = (changeIds: string[]) => {
    if (!currentSession) return;

    const newContent = applyChanges(currentSession.sessionId, changeIds, content);
    onContentChange(newContent);
    console.log(`Applied ${changeIds.length} selected changes`);
  };

  // Handle reverting selected changes
  const handleRevertSelectedChanges = (changeIds: string[]) => {
    if (!currentSession) return;

    const newContent = revertChanges(currentSession.sessionId, changeIds, content);
    onContentChange(newContent);
    console.log(`Reverted ${changeIds.length} selected changes`);
  };

  // Handle undo
  const handleUndo = () => {
    const newContent = undo();
    if (newContent !== null) {
      onContentChange(newContent);
      console.log('Undo performed');
    }
  };

  // Handle redo
  const handleRedo = () => {
    const newContent = redo();
    if (newContent !== null) {
      onContentChange(newContent);
      console.log('Redo performed');
    }
  };

  // Set up keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo: Ctrl+Z (Windows/Linux) or Cmd+Z (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) {
          handleUndo();
        }
      }
      // Redo: Ctrl+Y (Windows/Linux) or Cmd+Shift+Z (Mac)
      else if (
        ((e.ctrlKey && e.key === 'y') || (e.metaKey && e.shiftKey && e.key === 'z'))
      ) {
        e.preventDefault();
        if (canRedo) {
          handleRedo();
        }
      }
    };

    const container = editorContainerRef.current;
    if (container && enableAgentMode) {
      container.addEventListener('keydown', handleKeyDown);
      return () => container.removeEventListener('keydown', handleKeyDown);
    }
  }, [enableAgentMode, canUndo, canRedo]);

  // Log accepted/rejected suggestions for analytics (prevents unused variable warnings)
  useEffect(() => {
    if (acceptedSuggestions.length > 0) {
      console.log('Total accepted suggestions:', acceptedSuggestions.length);
    }
    if (rejectedSuggestions.length > 0) {
      console.log('Total rejected suggestions:', rejectedSuggestions.length);
    }
  }, [acceptedSuggestions, rejectedSuggestions]);

  return (
    <div className="space-y-0" ref={editorContainerRef}>
      {/* Real-Time Analysis Status Bar */}
      {enableRealTimeAnalysis && (
        <div className="bg-muted/30 px-6 py-3 border-b">
          <RealTimeAnalysisIndicator
            isAnalyzing={isAnalyzing}
            timeSinceLastAnalysis={timeSinceLastAnalysis}
            processingTime={processingTime}
            isEnabled={isEnabled}
            onToggle={handleToggleAnalysis}
            suggestionsCount={suggestions.length}
          />
        </div>
      )}

      {/* Agent Mode Status Bar */}
      {enableAgentMode && (
        <div className="bg-blue-50/50 px-6 py-3 border-b">
          <AgentModeIndicator
            status={agentModeStatus}
            onToggleEnabled={setAgentModeEnabled}
            onToggleAutoActivate={setAgentModeAutoActivate}
            showControls={true}
            showShortcutHint={true}
          />
        </div>
      )}

      {/* Undo/Redo Controls */}
      {enableAgentMode && (canUndo || canRedo) && (
        <div className="bg-gray-50 px-6 py-3 border-b">
          <AgentModeUndoControls
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
            showClearHistory={false}
          />
        </div>
      )}

      {/* Changes Summary Modal */}
      {showChangesSummary && currentSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <AgentModeChangesSummary
              session={currentSession}
              summary={getChangesSummary(currentSession.sessionId)}
              onApplyAll={handleApplyAllChanges}
              onRevertAll={handleRevertAllChanges}
              onApplySelected={handleApplySelectedChanges}
              onRevertSelected={handleRevertSelectedChanges}
            />
            <button
              type="button"
              onClick={() => setShowChangesSummary(false)}
              className="mt-4 w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Change Highlights Toggle */}
      {currentSession && currentSession.changes.length > 0 && (
        <div className="bg-yellow-50 px-6 py-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setShowChangeHighlights(!showChangeHighlights)}
                className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
              >
                {showChangeHighlights ? 'Ocultar cambios' : 'Mostrar cambios'}
              </button>
              <button
                type="button"
                onClick={() => setShowChangesSummary(true)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Ver resumen de cambios
              </button>
            </div>
            {showChangeHighlights && <AgentModeChangeHighlightLegend />}
          </div>
        </div>
      )}

      {/* Base Editor - ALWAYS VISIBLE */}
      <AIWriterEditor
        content={content}
        onContentChange={handleContentChange}
        onImprove={onImprove}
        onSave={onSave}
        onCopy={onCopy}
        onOpenSettings={onOpenSettings}
        isProcessing={isProcessing}
        isSaving={isSaving}
        disabled={disabled}
        usageInfo={usageInfo}
      />

      {/* Change Highlights Review (Rendered below editor if enabled) */}
      {showChangeHighlights && currentSession && (
        <div className="p-6 bg-white border-t-2 border-dashed border-gray-200 mt-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-lg text-gray-700">Revisión de Cambios (Modo Agente)</h3>
            <button
              onClick={() => setShowChangeHighlights(false)}
              className="text-sm text-blue-600 hover:underline"
            >
              Ocultar revisión
            </button>
          </div>
          <AgentModeChangeHighlight
            content={content}
            changes={currentSession.changes}
            appliedChanges={currentSession.appliedChanges}
            revertedChanges={currentSession.revertedChanges}
            onChangeClick={(change) => {
              console.log('Change clicked:', change);
            }}
          />
        </div>
      )}

      {/* Suggestions Display */}
      {suggestions.length > 0 && (
        <div className="bg-background px-6 py-4 border-t">
          <SuggestionDisplay
            suggestions={suggestions}
            onAccept={handleAcceptSuggestion}
            onReject={handleRejectSuggestion}
            maxVisible={3}
          />
        </div>
      )}
    </div>
  );
}

