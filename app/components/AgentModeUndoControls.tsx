/**
 * Agent Mode Undo/Redo Controls Component
 * 
 * Provides undo and redo controls for agent mode changes.
 * Shows keyboard shortcuts and current undo/redo state.
 * 
 * Requirements: 2.4
 */

"use client";

import { Undo, Redo, RotateCcw } from 'lucide-react';

interface AgentModeUndoControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClearHistory?: () => void;
  showClearHistory?: boolean;
  className?: string;
}

/**
 * Agent Mode Undo/Redo Controls Component
 * 
 * Displays undo and redo buttons with keyboard shortcut hints.
 */
export function AgentModeUndoControls({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClearHistory,
  showClearHistory = false,
  className = ''
}: AgentModeUndoControlsProps) {
  // Detect platform for keyboard shortcut display
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform);
  const undoShortcut = isMac ? '⌘Z' : 'Ctrl+Z';
  const redoShortcut = isMac ? '⌘⇧Z' : 'Ctrl+Y';

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Undo Button */}
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        className={`flex items-center space-x-2 px-3 py-2 rounded transition-colors ${
          canUndo
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
        title={`Deshacer (${undoShortcut})`}
        aria-label={`Deshacer (${undoShortcut})`}
      >
        <Undo className="w-4 h-4" />
        <span className="text-sm">Deshacer</span>
        <span className="text-xs opacity-75">{undoShortcut}</span>
      </button>

      {/* Redo Button */}
      <button
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
        className={`flex items-center space-x-2 px-3 py-2 rounded transition-colors ${
          canRedo
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
        title={`Rehacer (${redoShortcut})`}
        aria-label={`Rehacer (${redoShortcut})`}
      >
        <Redo className="w-4 h-4" />
        <span className="text-sm">Rehacer</span>
        <span className="text-xs opacity-75">{redoShortcut}</span>
      </button>

      {/* Clear History Button */}
      {showClearHistory && onClearHistory && (
        <>
          <div className="w-px h-6 bg-gray-300" />
          <button
            type="button"
            onClick={onClearHistory}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            title="Limpiar historial"
            aria-label="Limpiar historial"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm">Limpiar historial</span>
          </button>
        </>
      )}
    </div>
  );
}

/**
 * Compact Undo/Redo Controls
 * 
 * A smaller version for use in toolbars
 */
export function AgentModeUndoControlsCompact({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  className = ''
}: Omit<AgentModeUndoControlsProps, 'onClearHistory' | 'showClearHistory'>) {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform);
  const undoShortcut = isMac ? '⌘Z' : 'Ctrl+Z';
  const redoShortcut = isMac ? '⌘⇧Z' : 'Ctrl+Y';

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        className={`p-2 rounded transition-colors ${
          canUndo
            ? 'text-blue-600 hover:bg-blue-50'
            : 'text-gray-400 cursor-not-allowed'
        }`}
        title={`Deshacer (${undoShortcut})`}
        aria-label={`Deshacer (${undoShortcut})`}
      >
        <Undo className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
        className={`p-2 rounded transition-colors ${
          canRedo
            ? 'text-blue-600 hover:bg-blue-50'
            : 'text-gray-400 cursor-not-allowed'
        }`}
        title={`Rehacer (${redoShortcut})`}
        aria-label={`Rehacer (${redoShortcut})`}
      >
        <Redo className="w-4 h-4" />
      </button>
    </div>
  );
}
