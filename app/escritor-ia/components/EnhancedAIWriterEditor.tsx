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

import { useEffect, useState, useRef } from "react";
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
  
  // Ref for the editor container (for keyboard shortcut scoping)
  const editorContainerRef = useRef<HTMLDivElement>(null);

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
    activationDelay: 3000,
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
        
        // TODO: Trigger comprehensive improvements when agent mode activates
        // For now, simulate some changes for demonstration
        simulateAgentModeChanges();
      }
    },
    onTypingChange: (isTyping) => {
      console.log(`Typing ${isTyping ? 'started' : 'stopped'}`);
    }
  });

  // Simulate agent mode changes (temporary - will be replaced with actual AI improvements)
  const simulateAgentModeChanges = () => {
    // This is a placeholder that will be replaced in Task 7
    console.log('Simulating agent mode changes...');
    
    // Add some example changes
    setTimeout(() => {
      addChange({
        type: 'grammar',
        before: 'example text',
        after: 'improved text',
        position: { start: 0, end: 12 },
        reason: 'Grammar improvement',
        confidence: 0.95,
        impact: 'minor'
      });

      addChange({
        type: 'stylistic',
        before: 'another example',
        after: 'better example',
        position: { start: 20, end: 34 },
        reason: 'Style enhancement',
        confidence: 0.88,
        impact: 'moderate'
      });

      // Complete the session
      completeSession(content);
    }, 1000);
  };

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

      {/* Base Editor with Change Highlights */}
      {showChangeHighlights && currentSession ? (
        <div className="p-6 bg-white">
          <AgentModeChangeHighlight
            content={content}
            changes={currentSession.changes}
            appliedChanges={currentSession.appliedChanges}
            revertedChanges={currentSession.revertedChanges}
            onChangeClick={(change) => {
              console.log('Change clicked:', change);
              // Could show a tooltip or detail view
            }}
          />
        </div>
      ) : (
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
