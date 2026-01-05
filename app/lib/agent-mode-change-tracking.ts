/**
 * Agent Mode Change Tracking System
 * 
 * Tracks all changes made by agent mode for review, undo, and partial acceptance.
 * Provides granular control over autonomous AI improvements.
 * 
 * Requirements: 2.3, 2.4
 */

export interface TextChange {
  id: string;
  type: 'structural' | 'stylistic' | 'seo' | 'clarity' | 'grammar';
  position: {
    start: number;
    end: number;
  };
  before: string;
  after: string;
  reason: string;
  impact: 'minor' | 'moderate' | 'major';
  confidence: number; // 0-1
  timestamp: number;
}

export interface AgentModeSession {
  sessionId: string;
  startTime: number;
  endTime: number | null;
  originalContent: string;
  modifiedContent: string;
  changes: TextChange[];
  status: 'processing' | 'complete' | 'applied' | 'reverted';
  appliedChanges: Set<string>; // IDs of changes that have been applied
  revertedChanges: Set<string>; // IDs of changes that have been reverted
}

export interface ChangesSummary {
  totalChanges: number;
  byType: Record<string, number>;
  byImpact: Record<string, number>;
  estimatedImpact: string;
  appliedCount: number;
  revertedCount: number;
  pendingCount: number;
}

export interface UndoStackEntry {
  timestamp: number;
  content: string;
  sessionId: string;
  changeIds: string[];
  action: 'apply' | 'revert' | 'apply_partial';
}

/**
 * Agent Mode Change Tracker
 * 
 * Manages tracking of all changes made during agent mode sessions,
 * provides undo/redo functionality, and supports partial acceptance.
 */
export class AgentModeChangeTracker {
  private sessions: Map<string, AgentModeSession> = new Map();
  private currentSessionId: string | null = null;
  private undoStack: UndoStackEntry[] = [];
  private redoStack: UndoStackEntry[] = [];
  private maxUndoStackSize: number = 50;
  private changeListeners: Set<(session: AgentModeSession) => void> = new Set();

  /**
   * Start a new agent mode session
   * 
   * @param originalContent - The content before agent mode improvements
   * @returns Session ID
   */
  startSession(originalContent: string): string {
    const sessionId = this.generateSessionId();
    
    const session: AgentModeSession = {
      sessionId,
      startTime: Date.now(),
      endTime: null,
      originalContent,
      modifiedContent: originalContent,
      changes: [],
      status: 'processing',
      appliedChanges: new Set(),
      revertedChanges: new Set()
    };

    this.sessions.set(sessionId, session);
    this.currentSessionId = sessionId;

    console.log('Agent mode session started:', sessionId);

    return sessionId;
  }

  /**
   * Add a change to the current session
   * 
   * @param change - The change to add
   */
  addChange(change: Omit<TextChange, 'id' | 'timestamp'>): void {
    if (!this.currentSessionId) {
      throw new Error('No active agent mode session');
    }

    const session = this.sessions.get(this.currentSessionId);
    if (!session) {
      throw new Error('Current session not found');
    }

    const fullChange: TextChange = {
      ...change,
      id: this.generateChangeId(),
      timestamp: Date.now()
    };

    session.changes.push(fullChange);
    this.notifyListeners(session);

    console.log('Change added to session:', {
      sessionId: this.currentSessionId,
      changeId: fullChange.id,
      type: fullChange.type
    });
  }

  /**
   * Complete the current session
   * 
   * @param modifiedContent - The final modified content
   */
  completeSession(modifiedContent: string): void {
    if (!this.currentSessionId) {
      throw new Error('No active agent mode session');
    }

    const session = this.sessions.get(this.currentSessionId);
    if (!session) {
      throw new Error('Current session not found');
    }

    session.endTime = Date.now();
    session.modifiedContent = modifiedContent;
    session.status = 'complete';

    this.notifyListeners(session);

    console.log('Agent mode session completed:', {
      sessionId: this.currentSessionId,
      changesCount: session.changes.length,
      duration: session.endTime - session.startTime
    });
  }

  /**
   * Apply all changes from a session
   * 
   * @param sessionId - The session ID
   * @param currentContent - The current content to apply changes to
   * @returns The content with all changes applied
   */
  applyAllChanges(sessionId: string, currentContent: string): string {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Add to undo stack
    this.pushToUndoStack({
      timestamp: Date.now(),
      content: currentContent,
      sessionId,
      changeIds: session.changes.map(c => c.id),
      action: 'apply'
    });

    // Mark all changes as applied
    session.changes.forEach(change => {
      session.appliedChanges.add(change.id);
      session.revertedChanges.delete(change.id);
    });

    session.status = 'applied';
    this.notifyListeners(session);

    console.log('All changes applied:', {
      sessionId,
      changesCount: session.changes.length
    });

    return session.modifiedContent;
  }

  /**
   * Apply specific changes from a session (partial acceptance)
   * 
   * @param sessionId - The session ID
   * @param changeIds - Array of change IDs to apply
   * @param currentContent - The current content
   * @returns The content with selected changes applied
   */
  applyChanges(sessionId: string, changeIds: string[], currentContent: string): string {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Add to undo stack
    this.pushToUndoStack({
      timestamp: Date.now(),
      content: currentContent,
      sessionId,
      changeIds,
      action: 'apply_partial'
    });

    // Get changes to apply
    const changesToApply = session.changes.filter(c => changeIds.includes(c.id));

    // Sort changes by position (apply from end to start to maintain positions)
    changesToApply.sort((a, b) => b.position.start - a.position.start);

    // Apply changes
    let modifiedContent = currentContent;
    for (const change of changesToApply) {
      const before = modifiedContent.substring(0, change.position.start);
      const after = modifiedContent.substring(change.position.end);
      modifiedContent = before + change.after + after;

      // Mark as applied
      session.appliedChanges.add(change.id);
      session.revertedChanges.delete(change.id);
    }

    // Update session status
    if (session.appliedChanges.size === session.changes.length) {
      session.status = 'applied';
    }

    this.notifyListeners(session);

    console.log('Partial changes applied:', {
      sessionId,
      appliedCount: changeIds.length,
      totalCount: session.changes.length
    });

    return modifiedContent;
  }

  /**
   * Revert all changes from a session
   * 
   * @param sessionId - The session ID
   * @param currentContent - The current content
   * @returns The original content before changes
   */
  revertAllChanges(sessionId: string, currentContent: string): string {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Add to undo stack
    this.pushToUndoStack({
      timestamp: Date.now(),
      content: currentContent,
      sessionId,
      changeIds: session.changes.map(c => c.id),
      action: 'revert'
    });

    // Mark all changes as reverted
    session.changes.forEach(change => {
      session.revertedChanges.add(change.id);
      session.appliedChanges.delete(change.id);
    });

    session.status = 'reverted';
    this.notifyListeners(session);

    console.log('All changes reverted:', {
      sessionId,
      changesCount: session.changes.length
    });

    return session.originalContent;
  }

  /**
   * Revert specific changes from a session
   * 
   * @param sessionId - The session ID
   * @param changeIds - Array of change IDs to revert
   * @param currentContent - The current content
   * @returns The content with selected changes reverted
   */
  revertChanges(sessionId: string, changeIds: string[], currentContent: string): string {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Add to undo stack
    this.pushToUndoStack({
      timestamp: Date.now(),
      content: currentContent,
      sessionId,
      changeIds,
      action: 'revert'
    });

    // Get changes to revert
    const changesToRevert = session.changes.filter(c => changeIds.includes(c.id));

    // Sort changes by position (revert from end to start to maintain positions)
    changesToRevert.sort((a, b) => b.position.start - a.position.start);

    // Revert changes
    let modifiedContent = currentContent;
    for (const change of changesToRevert) {
      const before = modifiedContent.substring(0, change.position.start);
      const after = modifiedContent.substring(change.position.end);
      modifiedContent = before + change.before + after;

      // Mark as reverted
      session.revertedChanges.add(change.id);
      session.appliedChanges.delete(change.id);
    }

    this.notifyListeners(session);

    console.log('Partial changes reverted:', {
      sessionId,
      revertedCount: changeIds.length,
      totalCount: session.changes.length
    });

    return modifiedContent;
  }

  /**
   * Undo the last action
   * 
   * @returns The content before the last action, or null if nothing to undo
   */
  undo(): string | null {
    if (this.undoStack.length === 0) {
      console.warn('Nothing to undo');
      return null;
    }

    const entry = this.undoStack.pop()!;
    this.redoStack.push(entry);

    console.log('Undo action:', {
      action: entry.action,
      sessionId: entry.sessionId,
      changesCount: entry.changeIds.length
    });

    return entry.content;
  }

  /**
   * Redo the last undone action
   * 
   * @returns The content after redoing, or null if nothing to redo
   */
  redo(): string | null {
    if (this.redoStack.length === 0) {
      console.warn('Nothing to redo');
      return null;
    }

    const entry = this.redoStack.pop()!;
    this.undoStack.push(entry);

    console.log('Redo action:', {
      action: entry.action,
      sessionId: entry.sessionId,
      changesCount: entry.changeIds.length
    });

    // Re-apply or re-revert the changes
    const session = this.sessions.get(entry.sessionId);
    if (!session) {
      console.error('Session not found for redo');
      return null;
    }

    if (entry.action === 'apply' || entry.action === 'apply_partial') {
      return this.applyChanges(entry.sessionId, entry.changeIds, entry.content);
    } else {
      return this.revertChanges(entry.sessionId, entry.changeIds, entry.content);
    }
  }

  /**
   * Get a session by ID
   * 
   * @param sessionId - The session ID
   * @returns The session, or undefined if not found
   */
  getSession(sessionId: string): AgentModeSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get the current active session
   * 
   * @returns The current session, or undefined if no active session
   */
  getCurrentSession(): AgentModeSession | undefined {
    if (!this.currentSessionId) return undefined;
    return this.sessions.get(this.currentSessionId);
  }

  /**
   * Get changes summary for a session
   * 
   * @param sessionId - The session ID
   * @returns Summary of changes
   */
  getChangesSummary(sessionId: string): ChangesSummary {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const byType: Record<string, number> = {};
    const byImpact: Record<string, number> = {};

    session.changes.forEach(change => {
      byType[change.type] = (byType[change.type] || 0) + 1;
      byImpact[change.impact] = (byImpact[change.impact] || 0) + 1;
    });

    const majorCount = byImpact['major'] || 0;
    const moderateCount = byImpact['moderate'] || 0;
    const minorCount = byImpact['minor'] || 0;

    let estimatedImpact = 'minor';
    if (majorCount > 0) {
      estimatedImpact = 'major';
    } else if (moderateCount > 0) {
      estimatedImpact = 'moderate';
    }

    return {
      totalChanges: session.changes.length,
      byType,
      byImpact,
      estimatedImpact,
      appliedCount: session.appliedChanges.size,
      revertedCount: session.revertedChanges.size,
      pendingCount: session.changes.length - session.appliedChanges.size - session.revertedChanges.size
    };
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * Clear all sessions and undo/redo stacks
   */
  clear(): void {
    this.sessions.clear();
    this.currentSessionId = null;
    this.undoStack = [];
    this.redoStack = [];
    console.log('Agent mode change tracker cleared');
  }

  /**
   * Add a listener for session changes
   * 
   * @param listener - Callback function
   */
  addChangeListener(listener: (session: AgentModeSession) => void): void {
    this.changeListeners.add(listener);
  }

  /**
   * Remove a change listener
   * 
   * @param listener - Callback function to remove
   */
  removeChangeListener(listener: (session: AgentModeSession) => void): void {
    this.changeListeners.delete(listener);
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a unique change ID
   */
  private generateChangeId(): string {
    return `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Push an entry to the undo stack
   */
  private pushToUndoStack(entry: UndoStackEntry): void {
    this.undoStack.push(entry);

    // Limit stack size
    if (this.undoStack.length > this.maxUndoStackSize) {
      this.undoStack.shift();
    }

    // Clear redo stack when new action is performed
    this.redoStack = [];
  }

  /**
   * Notify all listeners of session changes
   */
  private notifyListeners(session: AgentModeSession): void {
    this.changeListeners.forEach(listener => {
      try {
        listener(session);
      } catch (error) {
        console.error('Error in change listener:', error);
      }
    });
  }
}

/**
 * Create a singleton instance for global use
 */
let globalTracker: AgentModeChangeTracker | null = null;

/**
 * Get or create the global agent mode change tracker
 * 
 * @returns Global tracker instance
 */
export function getGlobalChangeTracker(): AgentModeChangeTracker {
  if (!globalTracker) {
    globalTracker = new AgentModeChangeTracker();
  }
  return globalTracker;
}

/**
 * Destroy the global agent mode change tracker
 */
export function destroyGlobalChangeTracker(): void {
  if (globalTracker) {
    globalTracker.clear();
    globalTracker = null;
  }
}
