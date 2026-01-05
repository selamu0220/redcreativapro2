/**
 * Unit Tests for Agent Mode Change Tracking
 * 
 * Tests the core functionality of the change tracking system:
 * - Session management
 * - Change tracking
 * - Apply/revert operations
 * - Undo/redo functionality
 * - Partial acceptance
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  AgentModeChangeTracker,
  TextChange
} from '../agent-mode-change-tracking';

describe('AgentModeChangeTracker', () => {
  let tracker: AgentModeChangeTracker;

  beforeEach(() => {
    tracker = new AgentModeChangeTracker();
  });

  describe('Session Management', () => {
    it('should start a new session', () => {
      const originalContent = 'Test content';
      const sessionId = tracker.startSession(originalContent);

      expect(sessionId).toBeDefined();
      expect(sessionId).toMatch(/^session_/);

      const session = tracker.getSession(sessionId);
      expect(session).toBeDefined();
      expect(session?.originalContent).toBe(originalContent);
      expect(session?.status).toBe('processing');
    });

    it('should complete a session', () => {
      const originalContent = 'Test content';
      const modifiedContent = 'Modified content';
      
      const sessionId = tracker.startSession(originalContent);
      tracker.completeSession(modifiedContent);

      const session = tracker.getSession(sessionId);
      expect(session?.status).toBe('complete');
      expect(session?.modifiedContent).toBe(modifiedContent);
      expect(session?.endTime).toBeDefined();
    });

    it('should get current session', () => {
      const originalContent = 'Test content';
      tracker.startSession(originalContent);

      const currentSession = tracker.getCurrentSession();
      expect(currentSession).toBeDefined();
      expect(currentSession?.originalContent).toBe(originalContent);
    });
  });

  describe('Change Tracking', () => {
    it('should add changes to current session', () => {
      const originalContent = 'Test content';
      tracker.startSession(originalContent);

      const change: Omit<TextChange, 'id' | 'timestamp'> = {
        type: 'grammar',
        position: { start: 0, end: 4 },
        before: 'Test',
        after: 'Best',
        reason: 'Improve word choice',
        impact: 'minor',
        confidence: 0.9
      };

      tracker.addChange(change);

      const session = tracker.getCurrentSession();
      expect(session?.changes).toHaveLength(1);
      expect(session?.changes[0].type).toBe('grammar');
      expect(session?.changes[0].before).toBe('Test');
      expect(session?.changes[0].after).toBe('Best');
    });

    it('should throw error when adding change without active session', () => {
      const change: Omit<TextChange, 'id' | 'timestamp'> = {
        type: 'grammar',
        position: { start: 0, end: 4 },
        before: 'Test',
        after: 'Best',
        reason: 'Improve word choice',
        impact: 'minor',
        confidence: 0.9
      };

      expect(() => tracker.addChange(change)).toThrow('No active agent mode session');
    });

    it('should generate unique change IDs', () => {
      const originalContent = 'Test content';
      tracker.startSession(originalContent);

      const change1: Omit<TextChange, 'id' | 'timestamp'> = {
        type: 'grammar',
        position: { start: 0, end: 4 },
        before: 'Test',
        after: 'Best',
        reason: 'Change 1',
        impact: 'minor',
        confidence: 0.9
      };

      const change2: Omit<TextChange, 'id' | 'timestamp'> = {
        type: 'clarity',
        position: { start: 5, end: 12 },
        before: 'content',
        after: 'material',
        reason: 'Change 2',
        impact: 'minor',
        confidence: 0.8
      };

      tracker.addChange(change1);
      tracker.addChange(change2);

      const session = tracker.getCurrentSession();
      expect(session?.changes[0].id).not.toBe(session?.changes[1].id);
    });
  });

  describe('Apply Changes', () => {
    it('should apply all changes', () => {
      const originalContent = 'Test content here';
      const sessionId = tracker.startSession(originalContent);

      tracker.addChange({
        type: 'grammar',
        position: { start: 0, end: 4 },
        before: 'Test',
        after: 'Best',
        reason: 'Improve',
        impact: 'minor',
        confidence: 0.9
      });

      tracker.addChange({
        type: 'clarity',
        position: { start: 5, end: 12 },
        before: 'content',
        after: 'material',
        reason: 'Clarify',
        impact: 'minor',
        confidence: 0.8
      });

      const modifiedContent = 'Best material here';
      tracker.completeSession(modifiedContent);

      const result = tracker.applyAllChanges(sessionId, originalContent);
      expect(result).toBe(modifiedContent);

      const session = tracker.getSession(sessionId);
      expect(session?.status).toBe('applied');
      expect(session?.appliedChanges.size).toBe(2);
    });

    it('should apply selected changes (partial acceptance)', () => {
      const originalContent = 'Test content here';
      const sessionId = tracker.startSession(originalContent);

      tracker.addChange({
        type: 'grammar',
        position: { start: 0, end: 4 },
        before: 'Test',
        after: 'Best',
        reason: 'Improve',
        impact: 'minor',
        confidence: 0.9
      });

      tracker.addChange({
        type: 'clarity',
        position: { start: 5, end: 12 },
        before: 'content',
        after: 'material',
        reason: 'Clarify',
        impact: 'minor',
        confidence: 0.8
      });

      tracker.completeSession('Best material here');

      const session = tracker.getCurrentSession();
      const firstChangeId = session!.changes[0].id;

      // Apply only the first change
      const result = tracker.applyChanges(sessionId, [firstChangeId], originalContent);
      
      expect(result).toBe('Best content here');
      expect(session?.appliedChanges.size).toBe(1);
      expect(session?.appliedChanges.has(firstChangeId)).toBe(true);
    });
  });

  describe('Revert Changes', () => {
    it('should revert all changes', () => {
      const originalContent = 'Test content';
      const sessionId = tracker.startSession(originalContent);

      tracker.addChange({
        type: 'grammar',
        position: { start: 0, end: 4 },
        before: 'Test',
        after: 'Best',
        reason: 'Improve',
        impact: 'minor',
        confidence: 0.9
      });

      tracker.completeSession('Best content');

      const result = tracker.revertAllChanges(sessionId, 'Best content');
      expect(result).toBe(originalContent);

      const session = tracker.getSession(sessionId);
      expect(session?.status).toBe('reverted');
      expect(session?.revertedChanges.size).toBe(1);
    });

    it('should revert selected changes', () => {
      const originalContent = 'Test content here';
      const sessionId = tracker.startSession(originalContent);

      tracker.addChange({
        type: 'grammar',
        position: { start: 0, end: 4 },
        before: 'Test',
        after: 'Best',
        reason: 'Improve',
        impact: 'minor',
        confidence: 0.9
      });

      tracker.addChange({
        type: 'clarity',
        position: { start: 5, end: 12 },
        before: 'content',
        after: 'material',
        reason: 'Clarify',
        impact: 'minor',
        confidence: 0.8
      });

      tracker.completeSession('Best material here');

      // Apply all changes first
      tracker.applyAllChanges(sessionId, originalContent);

      const session = tracker.getCurrentSession();
      const firstChangeId = session!.changes[0].id;

      // Revert only the first change
      const result = tracker.revertChanges(sessionId, [firstChangeId], 'Best material here');
      
      expect(result).toBe('Test material here');
      expect(session?.revertedChanges.size).toBe(1);
      expect(session?.revertedChanges.has(firstChangeId)).toBe(true);
    });
  });

  describe('Undo/Redo', () => {
    it('should undo last action', () => {
      const originalContent = 'Test content';
      const sessionId = tracker.startSession(originalContent);

      tracker.addChange({
        type: 'grammar',
        position: { start: 0, end: 4 },
        before: 'Test',
        after: 'Best',
        reason: 'Improve',
        impact: 'minor',
        confidence: 0.9
      });

      tracker.completeSession('Best content');
      tracker.applyAllChanges(sessionId, originalContent);

      expect(tracker.canUndo()).toBe(true);
      const undoneContent = tracker.undo();
      expect(undoneContent).toBe(originalContent);
    });

    it('should redo last undone action', () => {
      const originalContent = 'Test content';
      const sessionId = tracker.startSession(originalContent);

      tracker.addChange({
        type: 'grammar',
        position: { start: 0, end: 4 },
        before: 'Test',
        after: 'Best',
        reason: 'Improve',
        impact: 'minor',
        confidence: 0.9
      });

      const modifiedContent = 'Best content';
      tracker.completeSession(modifiedContent);
      tracker.applyAllChanges(sessionId, originalContent);
      tracker.undo();

      expect(tracker.canRedo()).toBe(true);
      const redoneContent = tracker.redo();
      expect(redoneContent).toBe(modifiedContent);
    });

    it('should return null when nothing to undo', () => {
      expect(tracker.canUndo()).toBe(false);
      const result = tracker.undo();
      expect(result).toBeNull();
    });

    it('should return null when nothing to redo', () => {
      expect(tracker.canRedo()).toBe(false);
      const result = tracker.redo();
      expect(result).toBeNull();
    });
  });

  describe('Changes Summary', () => {
    it('should generate changes summary', () => {
      const originalContent = 'Test content';
      const sessionId = tracker.startSession(originalContent);

      tracker.addChange({
        type: 'grammar',
        position: { start: 0, end: 4 },
        before: 'Test',
        after: 'Best',
        reason: 'Improve',
        impact: 'minor',
        confidence: 0.9
      });

      tracker.addChange({
        type: 'grammar',
        position: { start: 5, end: 12 },
        before: 'content',
        after: 'material',
        reason: 'Improve',
        impact: 'moderate',
        confidence: 0.8
      });

      tracker.addChange({
        type: 'seo',
        position: { start: 12, end: 12 },
        before: '',
        after: ' for SEO',
        reason: 'Add keywords',
        impact: 'major',
        confidence: 0.95
      });

      tracker.completeSession('Best material for SEO');

      const summary = tracker.getChangesSummary(sessionId);

      expect(summary.totalChanges).toBe(3);
      expect(summary.byType['grammar']).toBe(2);
      expect(summary.byType['seo']).toBe(1);
      expect(summary.byImpact['minor']).toBe(1);
      expect(summary.byImpact['moderate']).toBe(1);
      expect(summary.byImpact['major']).toBe(1);
      expect(summary.estimatedImpact).toBe('major');
      expect(summary.appliedCount).toBe(0);
      expect(summary.pendingCount).toBe(3);
    });
  });

  describe('Clear', () => {
    it('should clear all sessions and history', () => {
      const originalContent = 'Test content';
      tracker.startSession(originalContent);

      tracker.addChange({
        type: 'grammar',
        position: { start: 0, end: 4 },
        before: 'Test',
        after: 'Best',
        reason: 'Improve',
        impact: 'minor',
        confidence: 0.9
      });

      tracker.clear();

      expect(tracker.getCurrentSession()).toBeUndefined();
      expect(tracker.canUndo()).toBe(false);
      expect(tracker.canRedo()).toBe(false);
    });
  });
});
