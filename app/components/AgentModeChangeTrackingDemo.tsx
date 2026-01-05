/**
 * Agent Mode Change Tracking Demo Component
 * 
 * Demonstrates and tests the agent mode change tracking system.
 * Shows all features: change tracking, undo/redo, partial acceptance, and highlighting.
 */

"use client";

import { useState } from 'react';
import { useAgentModeChangeTracking } from '../hooks/useAgentModeChangeTracking';
import { AgentModeChangesSummary } from './AgentModeChangesSummary';
import { AgentModeChangeHighlight, AgentModeChangeHighlightLegend } from './AgentModeChangeHighlight';
import { AgentModeUndoControls } from './AgentModeUndoControls';
import { TextChange } from '../lib/agent-mode-change-tracking';

export function AgentModeChangeTrackingDemo() {
  const [content, setContent] = useState(
    'Este es un texto de ejemplo. Tiene algunos errores y puede ser mejorado. ' +
    'El modo agente puede hacer cambios estructurales, de estilo, SEO y claridad.'
  );

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
    getChangesSummary,
    clear
  } = useAgentModeChangeTracking({
    onSessionChange: (session) => {
      console.log('Session changed:', session);
    }
  });

  // Simulate agent mode session
  const simulateAgentMode = () => {
    const sessionId = startSession(content);
    console.log('Started session:', sessionId);

    // Simulate various types of changes
    const changes: Omit<TextChange, 'id' | 'timestamp'>[] = [
      {
        type: 'grammar',
        position: { start: 0, end: 4 },
        before: 'Este',
        after: 'Éste',
        reason: 'Corrección ortográfica: agregar tilde',
        impact: 'minor',
        confidence: 0.95
      },
      {
        type: 'clarity',
        position: { start: 28, end: 42 },
        before: 'Tiene algunos',
        after: 'Contiene varios',
        reason: 'Mejorar claridad: usar vocabulario más preciso',
        impact: 'minor',
        confidence: 0.85
      },
      {
        type: 'stylistic',
        position: { start: 43, end: 50 },
        before: 'errores',
        after: 'problemas de redacción',
        reason: 'Mejorar estilo: ser más específico',
        impact: 'moderate',
        confidence: 0.80
      },
      {
        type: 'seo',
        position: { start: 82, end: 82 },
        before: '',
        after: ' para optimización de motores de búsqueda',
        reason: 'Agregar palabras clave relevantes para SEO',
        impact: 'major',
        confidence: 0.90
      },
      {
        type: 'structural',
        position: { start: 123, end: 123 },
        before: '',
        after: ' Además, puede reorganizar párrafos para mejor flujo.',
        reason: 'Agregar estructura: nueva oración para mejorar flujo',
        impact: 'moderate',
        confidence: 0.75
      }
    ];

    // Add all changes
    changes.forEach(change => addChange(change));

    // Complete the session with modified content
    let modifiedContent = content;
    changes.sort((a, b) => b.position.start - a.position.start);
    changes.forEach(change => {
      const before = modifiedContent.substring(0, change.position.start);
      const after = modifiedContent.substring(change.position.end);
      modifiedContent = before + change.after + after;
    });

    completeSession(modifiedContent);
  };

  // Handle apply all
  const handleApplyAll = () => {
    if (!currentSession) return;
    const newContent = applyAllChanges(currentSession.sessionId, content);
    setContent(newContent);
  };

  // Handle revert all
  const handleRevertAll = () => {
    if (!currentSession) return;
    const newContent = revertAllChanges(currentSession.sessionId, content);
    setContent(newContent);
  };

  // Handle apply selected
  const handleApplySelected = (changeIds: string[]) => {
    if (!currentSession) return;
    const newContent = applyChanges(currentSession.sessionId, changeIds, content);
    setContent(newContent);
  };

  // Handle revert selected
  const handleRevertSelected = (changeIds: string[]) => {
    if (!currentSession) return;
    const newContent = revertChanges(currentSession.sessionId, changeIds, content);
    setContent(newContent);
  };

  // Handle undo
  const handleUndo = () => {
    const previousContent = undo();
    if (previousContent !== null) {
      setContent(previousContent);
    }
  };

  // Handle redo
  const handleRedo = () => {
    const nextContent = redo();
    if (nextContent !== null) {
      setContent(nextContent);
    }
  };

  // Handle clear
  const handleClear = () => {
    clear();
    setContent(
      'Este es un texto de ejemplo. Tiene algunos errores y puede ser mejorado. ' +
      'El modo agente puede hacer cambios estructurales, de estilo, SEO y claridad.'
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Demo: Sistema de Seguimiento de Cambios del Modo Agente
        </h1>
        <p className="text-gray-600 mb-6">
          Esta demostración muestra todas las capacidades del sistema de seguimiento de cambios:
          resaltado de cambios, resumen de cambios, aceptación parcial, y deshacer/rehacer.
        </p>

        {/* Controls */}
        <div className="flex items-center space-x-3 mb-6">
          <button
            type="button"
            onClick={simulateAgentMode}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            disabled={currentSession !== null}
          >
            Simular Modo Agente
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Reiniciar Demo
          </button>

          {currentSession && (
            <div className="flex-1 flex justify-end">
              <AgentModeUndoControls
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={handleUndo}
                onRedo={handleRedo}
                onClearHistory={handleClear}
                showClearHistory={true}
              />
            </div>
          )}
        </div>

        {/* Current Content */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Contenido Actual:</h2>
          <div className="p-4 bg-gray-50 rounded border border-gray-200">
            {currentSession ? (
              <>
                <AgentModeChangeHighlight
                  content={content}
                  changes={currentSession.changes}
                  appliedChanges={currentSession.appliedChanges}
                  revertedChanges={currentSession.revertedChanges}
                  onChangeClick={(change) => {
                    console.log('Change clicked:', change);
                  }}
                />
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <AgentModeChangeHighlightLegend />
                </div>
              </>
            ) : (
              <p className="text-gray-700 font-mono text-sm whitespace-pre-wrap">{content}</p>
            )}
          </div>
        </div>

        {/* Changes Summary */}
        {currentSession && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Resumen de Cambios:</h2>
            <AgentModeChangesSummary
              session={currentSession}
              summary={getChangesSummary(currentSession.sessionId)}
              onApplyAll={handleApplyAll}
              onRevertAll={handleRevertAll}
              onApplySelected={handleApplySelected}
              onRevertSelected={handleRevertSelected}
            />
          </div>
        )}

        {/* Session Info */}
        {currentSession && (
          <div className="p-4 bg-blue-50 rounded border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Información de Sesión:</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-blue-700">ID de Sesión:</span>
                <span className="ml-2 text-blue-900 font-mono">{currentSession.sessionId}</span>
              </div>
              <div>
                <span className="text-blue-700">Estado:</span>
                <span className="ml-2 text-blue-900 font-semibold">{currentSession.status}</span>
              </div>
              <div>
                <span className="text-blue-700">Total de Cambios:</span>
                <span className="ml-2 text-blue-900 font-semibold">{currentSession.changes.length}</span>
              </div>
              <div>
                <span className="text-blue-700">Cambios Aplicados:</span>
                <span className="ml-2 text-blue-900 font-semibold">{currentSession.appliedChanges.size}</span>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!currentSession && (
          <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
            <h3 className="text-sm font-semibold text-yellow-900 mb-2">Instrucciones:</h3>
            <ol className="list-decimal list-inside text-sm text-yellow-800 space-y-1">
              <li>Haz clic en "Simular Modo Agente" para generar cambios de ejemplo</li>
              <li>Revisa los cambios resaltados en el contenido</li>
              <li>Usa el resumen de cambios para aceptar o rechazar cambios individuales o en grupo</li>
              <li>Prueba los controles de deshacer/rehacer</li>
              <li>Haz clic en "Reiniciar Demo" para empezar de nuevo</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
