/**
 * Property-Based Test: Content State Isolation
 * Feature: ai-writer-rebuild, Property 2: Content State Isolation
 * 
 * Validates: Requirements 8.1, 8.2, 8.3
 * 
 * Property: For any editor session, content should exist only in component state
 * and never be persisted to any storage mechanism (localStorage, database, or API).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import fc from 'fast-check';
import AIWriterEditor from '../components/AIWriterEditor';

describe('Feature: ai-writer-rebuild, Property 2: Content State Isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.spyOn(Storage.prototype, 'setItem');
    vi.spyOn(Storage.prototype, 'getItem');
  });

  it('should never persist content to localStorage', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 1000 }),
        async (content) => {
          const mockOnContentChange = vi.fn();
          const mockOnImprove = vi.fn();
          const mockOnCopy = vi.fn();
          const mockOnOpenSettings = vi.fn();

          // Render editor
          render(
            <AIWriterEditor
              content=""
              onContentChange={mockOnContentChange}
              onImprove={mockOnImprove}
              onCopy={mockOnCopy}
              onOpenSettings={mockOnOpenSettings}
              isProcessing={false}
            />
          );

          // Get textarea and type content
          const textarea = screen.getByPlaceholderText(/Escribe o pega tu texto aquí/i);
          fireEvent.change(textarea, { target: { value: content } });

          // Verify content change callback was called
          expect(mockOnContentChange).toHaveBeenCalledWith(content);

          // Verify localStorage.setItem was NOT called with content
          const setItemCalls = vi.mocked(localStorage.setItem).mock.calls;
          const contentStoredInLocalStorage = setItemCalls.some(
            ([key, value]) => {
              try {
                // Check if the value contains our content
                return value.includes(content);
              } catch {
                return false;
              }
            }
          );

          expect(contentStoredInLocalStorage).toBe(false);
        }
      ),
      { numRuns: 1 }
    );
  });

  it('should not load content from localStorage on mount', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 1000 }),
        async (storedContent) => {
          // Pre-populate localStorage with content
          localStorage.setItem('editor-content', storedContent);
          localStorage.setItem('ai-writer-content', storedContent);

          const mockOnContentChange = vi.fn();
          const mockOnImprove = vi.fn();
          const mockOnCopy = vi.fn();
          const mockOnOpenSettings = vi.fn();

          // Render editor with empty content
          render(
            <AIWriterEditor
              content=""
              onContentChange={mockOnContentChange}
              onImprove={mockOnImprove}
              onCopy={mockOnCopy}
              onOpenSettings={mockOnOpenSettings}
              isProcessing={false}
            />
          );

          // Verify textarea is empty (not loaded from localStorage)
          const textarea = screen.getByPlaceholderText(/Escribe o pega tu texto aquí/i) as HTMLTextAreaElement;
          expect(textarea.value).toBe('');

          // Verify onContentChange was not called with stored content
          expect(mockOnContentChange).not.toHaveBeenCalledWith(storedContent);
        }
      ),
      { numRuns: 1 }
    );
  });

  it('should maintain content only in React state', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 2, maxLength: 10 }),
        async (contentSequence) => {
          const mockOnContentChange = vi.fn();
          const mockOnImprove = vi.fn();
          const mockOnCopy = vi.fn();
          const mockOnOpenSettings = vi.fn();

          let currentContent = '';

          const { rerender } = render(
            <AIWriterEditor
              content={currentContent}
              onContentChange={mockOnContentChange}
              onImprove={mockOnImprove}
              onCopy={mockOnCopy}
              onOpenSettings={mockOnOpenSettings}
              isProcessing={false}
            />
          );

          // Simulate multiple content changes
          for (const newContent of contentSequence) {
            currentContent = newContent;
            
            rerender(
              <AIWriterEditor
                content={currentContent}
                onContentChange={mockOnContentChange}
                onImprove={mockOnImprove}
                onCopy={mockOnCopy}
                onOpenSettings={mockOnOpenSettings}
                isProcessing={false}
              />
            );

            // Verify content is displayed correctly
            const textarea = screen.getByPlaceholderText(/Escribe o pega tu texto aquí/i) as HTMLTextAreaElement;
            expect(textarea.value).toBe(currentContent);

            // Verify no persistence occurred
            const setItemCalls = vi.mocked(localStorage.setItem).mock.calls;
            const contentPersisted = setItemCalls.some(
              ([key, value]) => {
                try {
                  return value.includes(currentContent) && !key.includes('settings');
                } catch {
                  return false;
                }
              }
            );
            expect(contentPersisted).toBe(false);
          }
        }
      ),
      { numRuns: 1 }
    );
  });
});
