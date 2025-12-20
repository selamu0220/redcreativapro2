/**
 * Property-Based Test: Button State Consistency
 * Feature: ai-writer-rebuild, Property 6: Button State Consistency
 * 
 * Validates: Requirements 3.4, 3.5
 * 
 * Property: For any AI improvement operation in progress, the "Improve with AI"
 * button should be disabled and show a loading indicator until the operation
 * completes or fails.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import fc from 'fast-check';
import AIWriterEditor from '../components/AIWriterEditor';

describe('Feature: ai-writer-rebuild, Property 6: Button State Consistency', () => {
  beforeEach(() => {
    // No setup needed
  });

  it('should disable improve button when processing is true', () => {
    fc.assert(
      fc.property(
        fc.record({
          content: fc.string({ minLength: 1, maxLength: 1000 }),
          isProcessing: fc.constant(true),
        }),
        ({ content, isProcessing }) => {
          const mockOnContentChange = vi.fn();
          const mockOnImprove = vi.fn();
          const mockOnCopy = vi.fn();
          const mockOnOpenSettings = vi.fn();

          render(
            <AIWriterEditor
              content={content}
              onContentChange={mockOnContentChange}
              onImprove={mockOnImprove}
              onCopy={mockOnCopy}
              onOpenSettings={mockOnOpenSettings}
              isProcessing={isProcessing}
            />
          );

          // Find the improve button
          const improveButton = screen.getByText(/Procesando/i).closest('button');

          // Verify button is disabled
          expect(improveButton).toBeDisabled();
        }
      ),
      { numRuns: 1 }
    );
  });

  it('should show loading indicator when processing', () => {
    fc.assert(
      fc.property(
        fc.record({
          content: fc.string({ minLength: 1, maxLength: 1000 }),
          isProcessing: fc.constant(true),
        }),
        ({ content, isProcessing }) => {
          const mockOnContentChange = vi.fn();
          const mockOnImprove = vi.fn();
          const mockOnCopy = vi.fn();
          const mockOnOpenSettings = vi.fn();

          render(
            <AIWriterEditor
              content={content}
              onContentChange={mockOnContentChange}
              onImprove={mockOnImprove}
              onCopy={mockOnCopy}
              onOpenSettings={mockOnOpenSettings}
              isProcessing={isProcessing}
            />
          );

          // Verify loading text is shown
          expect(screen.getByText(/Procesando/i)).toBeInTheDocument();

          // Verify loading spinner is present (check for SVG with animation)
          const spinner = screen.getByText(/Procesando/i).closest('button')?.querySelector('svg.animate-spin');
          expect(spinner).toBeInTheDocument();
        }
      ),
      { numRuns: 1 }
    );
  });

  it('should enable improve button when not processing and content exists', () => {
    fc.assert(
      fc.property(
        fc.record({
          content: fc.string({ minLength: 1, maxLength: 1000 }),
          isProcessing: fc.constant(false),
        }),
        ({ content, isProcessing }) => {
          const mockOnContentChange = vi.fn();
          const mockOnImprove = vi.fn();
          const mockOnCopy = vi.fn();
          const mockOnOpenSettings = vi.fn();

          render(
            <AIWriterEditor
              content={content}
              onContentChange={mockOnContentChange}
              onImprove={mockOnImprove}
              onCopy={mockOnCopy}
              onOpenSettings={mockOnOpenSettings}
              isProcessing={isProcessing}
            />
          );

          // Find the improve button
          const improveButton = screen.getByText(/Mejorar con IA/i).closest('button');

          // Verify button is enabled
          expect(improveButton).not.toBeDisabled();

          // Verify no loading indicator
          expect(screen.queryByText(/Procesando/i)).not.toBeInTheDocument();
        }
      ),
      { numRuns: 1 }
    );
  });

  it('should disable improve button when content is empty regardless of processing state', () => {
    fc.assert(
      fc.property(
        fc.record({
          content: fc.constantFrom('', '   ', '\t', '\n'),
          isProcessing: fc.boolean(),
        }),
        ({ content, isProcessing }) => {
          const mockOnContentChange = vi.fn();
          const mockOnImprove = vi.fn();
          const mockOnCopy = vi.fn();
          const mockOnOpenSettings = vi.fn();

          render(
            <AIWriterEditor
              content={content}
              onContentChange={mockOnContentChange}
              onImprove={mockOnImprove}
              onCopy={mockOnCopy}
              onOpenSettings={mockOnOpenSettings}
              isProcessing={isProcessing}
            />
          );

          // Find the improve button (text depends on processing state)
          const buttonText = isProcessing ? /Procesando/i : /Mejorar con IA/i;
          const improveButton = screen.getByText(buttonText).closest('button');

          // Verify button is disabled
          expect(improveButton).toBeDisabled();
        }
      ),
      { numRuns: 1 }
    );
  });

  it('should disable all action buttons when disabled prop is true', () => {
    fc.assert(
      fc.property(
        fc.record({
          content: fc.string({ minLength: 1, maxLength: 1000 }),
          isProcessing: fc.boolean(),
          disabled: fc.constant(true),
        }),
        ({ content, isProcessing, disabled }) => {
          const mockOnContentChange = vi.fn();
          const mockOnImprove = vi.fn();
          const mockOnCopy = vi.fn();
          const mockOnOpenSettings = vi.fn();

          render(
            <AIWriterEditor
              content={content}
              onContentChange={mockOnContentChange}
              onImprove={mockOnImprove}
              onCopy={mockOnCopy}
              onOpenSettings={mockOnOpenSettings}
              isProcessing={isProcessing}
              disabled={disabled}
            />
          );

          // Get all buttons
          const buttons = screen.getAllByRole('button');

          // Verify all buttons are disabled
          buttons.forEach((button) => {
            expect(button).toBeDisabled();
          });

          // Verify textarea is also disabled
          const textarea = screen.getByPlaceholderText(/Escribe o pega tu texto aquí/i);
          expect(textarea).toBeDisabled();
        }
      ),
      { numRuns: 1 }
    );
  });

  it('should maintain consistent button state across re-renders', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            content: fc.string({ minLength: 0, maxLength: 1000 }),
            isProcessing: fc.boolean(),
          }),
          { minLength: 2, maxLength: 10 }
        ),
        (stateSequence) => {
          const mockOnContentChange = vi.fn();
          const mockOnImprove = vi.fn();
          const mockOnCopy = vi.fn();
          const mockOnOpenSettings = vi.fn();

          const { rerender } = render(
            <AIWriterEditor
              content={stateSequence[0].content}
              onContentChange={mockOnContentChange}
              onImprove={mockOnImprove}
              onCopy={mockOnCopy}
              onOpenSettings={mockOnOpenSettings}
              isProcessing={stateSequence[0].isProcessing}
            />
          );

          // Test each state in sequence
          for (const state of stateSequence) {
            rerender(
              <AIWriterEditor
                content={state.content}
                onContentChange={mockOnContentChange}
                onImprove={mockOnImprove}
                onCopy={mockOnCopy}
                onOpenSettings={mockOnOpenSettings}
                isProcessing={state.isProcessing}
              />
            );

            // Determine expected button state
            const shouldBeDisabled = state.isProcessing || !state.content.trim();

            // Find the improve button
            const buttonText = state.isProcessing ? /Procesando/i : /Mejorar con IA/i;
            const improveButton = screen.getByText(buttonText).closest('button');

            // Verify button state matches expectation
            if (shouldBeDisabled) {
              expect(improveButton).toBeDisabled();
            } else {
              expect(improveButton).not.toBeDisabled();
            }
          }
        }
      ),
      { numRuns: 1 }
    );
  });
});
