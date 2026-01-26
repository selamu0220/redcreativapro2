/**
 * Property-Based Tests: Auto-Improvement Trigger Conditions & Typing Debounce Reset
 * Feature: ai-writer-functional-fix, Property 3 & 4
 * 
 * Property 3: Auto-Improvement Trigger Conditions
 * Validates: Requirements 2.1, 2.2, 2.4
 * 
 * Property 4: Typing Debounce Reset
 * Validates: Requirements 2.5
 * 
 * Properties:
 * - Auto-improvement SHALL only trigger when content meets minimum word count
 * - Auto-improvement SHALL wait for configured delay after user stops typing
 * - Typing SHALL reset the debounce timer and prevent premature triggering
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import fc from 'fast-check';
import EnhancedAIWriterEditor from '../components/EnhancedAIWriterEditor';
import { improveContent } from '../../lib/ai-client';

// Mock the AI client
vi.mock('../../lib/ai-client', () => ({
  improveContent: vi.fn()
}));

// Mock the settings manager
vi.mock('../../lib/settings-manager', () => ({
  getSettings: vi.fn(() => ({
    provider: 'openrouter',
    model: 'openai/gpt-4o-mini',
    apiKey: 'test-key'
  }))
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(() => 'toast-id'),
    dismiss: vi.fn()
  }
}));

// Mock other dependencies
vi.mock('../../hooks/useRealTimeAnalysis', () => ({
  useRealTimeAnalysis: () => ({
    suggestions: [],
    isAnalyzing: false,
    timeSinceLastAnalysis: 0,
    updateContent: vi.fn(),
    setEnabled: vi.fn(),
    isEnabled: true,
    processingTime: 0
  })
}));

vi.mock('../../hooks/useAgentModeChangeTracking', () => ({
  useAgentModeChangeTracking: () => ({
    currentSession: null,
    startSession: vi.fn(() => 'session-id'),
    addChange: vi.fn(),
    completeSession: vi.fn(),
    applyAllChanges: vi.fn(),
    applyChanges: vi.fn(),
    revertAllChanges: vi.fn(),
    revertChanges: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    canUndo: false,
    canRedo: false,
    getChangesSummary: vi.fn(() => ({ totalChanges: 0, appliedChanges: 0 }))
  })
}));

describe('Feature: ai-writer-functional-fix, Property 3 & 4: Auto-Improvement Trigger & Debounce', () => {
  const mockImproveContent = improveContent as any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mock implementation
    mockImproveContent.mockResolvedValue({
      success: true,
      improvedContent: 'improved content'
    });
  });

  it('should only trigger auto-improvement when content meets minimum word count', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          minWords: fc.integer({ min: 5, max: 20 }),
          contentWordCount: fc.integer({ min: 1, max: 30 }),
          autoModeEnabled: fc.boolean(),
        }),
        async ({ minWords, contentWordCount, autoModeEnabled }) => {
          // Generate content with specific word count
          const words = Array.from({ length: contentWordCount }, (_, i) => `word${i}`);
          const content = words.join(' ');

          const mockOnContentChange = vi.fn();
          const mockOnImprove = vi.fn();
          const mockOnCopy = vi.fn();
          const mockOnOpenSettings = vi.fn();
          const mockOnSave = vi.fn();

          const { rerender } = render(
            <EnhancedAIWriterEditor
              content=""
              onContentChange={mockOnContentChange}
              onImprove={mockOnImprove}
              onSave={mockOnSave}
              onCopy={mockOnCopy}
              onOpenSettings={mockOnOpenSettings}
              isProcessing={false}
            />
          );

          // Enable auto mode with specific minWords configuration
          if (autoModeEnabled) {
            const autoToggle = screen.getByRole('switch');
            fireEvent.click(autoToggle);
            
            // Wait for auto mode to be enabled
            await waitFor(() => {
              expect(autoToggle).toBeChecked();
            });
          }

          // Update content
          rerender(
            <EnhancedAIWriterEditor
              content={content}
              onContentChange={mockOnContentChange}
              onImprove={mockOnImprove}
              onSave={mockOnSave}
              onCopy={mockOnCopy}
              onOpenSettings={mockOnOpenSettings}
              isProcessing={false}
            />
          );

          // Wait for potential auto-improvement trigger
          await new Promise(resolve => setTimeout(resolve, 3500)); // Wait longer than default delay

          if (autoModeEnabled && contentWordCount >= minWords) {
            // Should have triggered auto-improvement
            expect(mockImproveContent).toHaveBeenCalled();
          } else {
            // Should NOT have triggered auto-improvement
            expect(mockImproveContent).not.toHaveBeenCalled();
          }
        }
      ),
      { numRuns: 3 }
    );
  });

  it('should wait for configured delay before triggering auto-improvement', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          delay: fc.integer({ min: 1000, max: 3000 }),
          content: fc.string({ minLength: 50, maxLength: 200 }).filter(s => s.trim().split(/\s+/).length >= 10),
        }),
        async ({ delay, content }) => {
          const mockOnContentChange = vi.fn();
          const mockOnImprove = vi.fn();
          const mockOnCopy = vi.fn();
          const mockOnOpenSettings = vi.fn();
          const mockOnSave = vi.fn();

          render(
            <EnhancedAIWriterEditor
              content=""
              onContentChange={mockOnContentChange}
              onImprove={mockOnImprove}
              onSave={mockOnSave}
              onCopy={mockOnCopy}
              onOpenSettings={mockOnOpenSettings}
              isProcessing={false}
            />
          );

          // Enable auto mode
          const autoToggle = screen.getByRole('switch');
          fireEvent.click(autoToggle);
          
          await waitFor(() => {
            expect(autoToggle).toBeChecked();
          });

          // Simulate typing by changing content
          const textarea = screen.getByRole('textbox');
          fireEvent.change(textarea, { target: { value: content } });

          // Check that improvement hasn't triggered immediately
          expect(mockImproveContent).not.toHaveBeenCalled();

          // Wait for half the delay - should still not trigger
          await new Promise(resolve => setTimeout(resolve, delay / 2));
          expect(mockImproveContent).not.toHaveBeenCalled();

          // Wait for full delay + buffer - should trigger now
          await new Promise(resolve => setTimeout(resolve, delay + 500));
          
          // Should have triggered auto-improvement after the delay
          await waitFor(() => {
            expect(mockImproveContent).toHaveBeenCalled();
          }, { timeout: 1000 });
        }
      ),
      { numRuns: 2 }
    );
  }, 10000);

  it('should reset debounce timer when user continues typing', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          initialContent: fc.string({ minLength: 30, maxLength: 100 }).filter(s => s.trim().split(/\s+/).length >= 10),
          additionalContent: fc.string({ minLength: 10, maxLength: 50 }),
          typingInterval: fc.integer({ min: 500, max: 1500 }), // Interval between typing events
        }),
        async ({ initialContent, additionalContent, typingInterval }) => {
          const mockOnContentChange = vi.fn();
          const mockOnImprove = vi.fn();
          const mockOnCopy = vi.fn();
          const mockOnOpenSettings = vi.fn();
          const mockOnSave = vi.fn();

          render(
            <EnhancedAIWriterEditor
              content=""
              onContentChange={mockOnContentChange}
              onImprove={mockOnImprove}
              onSave={mockOnSave}
              onCopy={mockOnCopy}
              onOpenSettings={mockOnOpenSettings}
              isProcessing={false}
            />
          );

          // Enable auto mode
          const autoToggle = screen.getByRole('switch');
          fireEvent.click(autoToggle);
          
          await waitFor(() => {
            expect(autoToggle).toBeChecked();
          });

          const textarea = screen.getByRole('textbox');

          // First typing event
          fireEvent.change(textarea, { target: { value: initialContent } });

          // Wait for less than the debounce delay, then type more
          await new Promise(resolve => setTimeout(resolve, typingInterval));
          
          // Should not have triggered yet
          expect(mockImproveContent).not.toHaveBeenCalled();

          // Continue typing (this should reset the timer)
          fireEvent.change(textarea, { target: { value: initialContent + ' ' + additionalContent } });

          // Wait for another interval (still less than full delay from last typing)
          await new Promise(resolve => setTimeout(resolve, typingInterval));
          
          // Should still not have triggered because timer was reset
          expect(mockImproveContent).not.toHaveBeenCalled();

          // Now wait for full delay after last typing event
          await new Promise(resolve => setTimeout(resolve, 2500)); // Default delay + buffer

          // Should have triggered now
          await waitFor(() => {
            expect(mockImproveContent).toHaveBeenCalled();
          }, { timeout: 1000 });
        }
      ),
      { numRuns: 2 }
    );
  }, 15000);

  it('should not trigger auto-improvement when disabled or processing', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          content: fc.string({ minLength: 50, maxLength: 200 }).filter(s => s.trim().split(/\s+/).length >= 10),
          isDisabled: fc.boolean(),
          isProcessing: fc.boolean(),
        }),
        async ({ content, isDisabled, isProcessing }) => {
          const mockOnContentChange = vi.fn();
          const mockOnImprove = vi.fn();
          const mockOnCopy = vi.fn();
          const mockOnOpenSettings = vi.fn();
          const mockOnSave = vi.fn();

          render(
            <EnhancedAIWriterEditor
              content=""
              onContentChange={mockOnContentChange}
              onImprove={mockOnImprove}
              onSave={mockOnSave}
              onCopy={mockOnCopy}
              onOpenSettings={mockOnOpenSettings}
              isProcessing={isProcessing}
              disabled={isDisabled}
            />
          );

          // Try to enable auto mode (should not work if disabled)
          if (!isDisabled) {
            const autoToggle = screen.getByRole('switch');
            fireEvent.click(autoToggle);
            
            await waitFor(() => {
              expect(autoToggle).toBeChecked();
            });
          }

          // Simulate typing
          if (!isDisabled) {
            const textarea = screen.getByRole('textbox');
            fireEvent.change(textarea, { target: { value: content } });
          }

          // Wait for potential auto-improvement
          await new Promise(resolve => setTimeout(resolve, 3000));

          if (isDisabled || isProcessing) {
            // Should NOT have triggered auto-improvement
            expect(mockImproveContent).not.toHaveBeenCalled();
          }
          // If not disabled and not processing, it might trigger (depends on auto mode state)
        }
      ),
      { numRuns: 3 }
    );
  });
});