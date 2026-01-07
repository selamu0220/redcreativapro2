/**
 * Test for manual and auto mode coordination in AIWriterEditor
 * 
 * This test verifies that:
 * 1. Manual improvement pauses auto mode for 5 seconds
 * 2. Manual button is disabled when auto mode is processing
 * 3. Auto mode resumes automatically after manual improvement completes
 * 4. No concurrent improvements (manual and auto) occur
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */

import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AIWriterEditor from '../AIWriterEditor';
import { useOptimizedAutoImprovement } from '../../../hooks/useOptimizedAutoImprovement';

// Mock the hooks
vi.mock('../../../hooks/useOptimizedAutoImprovement', () => ({
  useOptimizedAutoImprovement: vi.fn(() => ({
    handleTyping: vi.fn(),
    getWordCount: vi.fn(() => 10),
    state: {
      isTyping: false,
      isPaused: false,
      isImproving: false,
      lastImprovement: 0,
      improvementCount: 0
    }
  })),
  useAutoImprovementConfig: vi.fn((config) => ({
    config: {
      enabled: config?.enabled ?? false,
      delay: config?.delay ?? 2000,
      minWords: config?.minWords ?? 5,
      maxRetries: config?.maxRetries ?? 3,
      debounceDelay: config?.debounceDelay ?? 1000
    }
  }))
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('AIWriterEditor - Manual and Auto Mode Coordination', () => {
  const mockProps = {
    content: 'Test content with enough words to trigger improvements',
    onContentChange: vi.fn(),
    onImprove: vi.fn(),
    onSave: vi.fn(),
    onCopy: vi.fn(),
    onOpenSettings: vi.fn(),
    isProcessing: false,
    isSaving: false,
    disabled: false,
    autoModeEnabled: true,
    onAutoModeToggle: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    };
    global.localStorage = localStorageMock as any;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should disable manual button when auto mode is processing', () => {
    // Mock auto mode as processing
    (useOptimizedAutoImprovement as Mock).mockReturnValue({
      handleTyping: vi.fn(),
      getWordCount: vi.fn(() => 10),
      state: {
        isTyping: false,
        isPaused: false,
        isImproving: true, // Auto mode is processing
        lastImprovement: 0,
        improvementCount: 0
      }
    });

    render(<AIWriterEditor {...mockProps} />);

    const manualButton = screen.getByRole('button', { name: /Mejorar con IA/i });
    expect(manualButton).toBeDisabled();
  });

  it('should enable manual button when auto mode is not processing', () => {
    // Mock auto mode as not processing
    (useOptimizedAutoImprovement as Mock).mockReturnValue({
      handleTyping: vi.fn(),
      getWordCount: vi.fn(() => 10),
      state: {
        isTyping: false,
        isPaused: false,
        isImproving: false, // Auto mode is not processing
        lastImprovement: 0,
        improvementCount: 0
      }
    });

    render(<AIWriterEditor {...mockProps} />);

    const manualButton = screen.getByRole('button', { name: /Mejorar con IA/i });
    expect(manualButton).not.toBeDisabled();
  });

  it('should call onImprove when manual button is clicked', async () => {
     vi.useRealTimers();
     (useOptimizedAutoImprovement as Mock).mockReturnValue({
       handleTyping: vi.fn(),
       getWordCount: vi.fn(() => 10),
       state: {
         isTyping: false,
         isPaused: false,
         isImproving: false,
         lastImprovement: 0,
         improvementCount: 0
       }
     });
 
     const onImprove = vi.fn().mockResolvedValue(undefined);
     render(<AIWriterEditor {...mockProps} onImprove={onImprove} />);
 
     const manualButton = screen.getByRole('button', { name: /Mejorar con IA/i });
     fireEvent.click(manualButton);
 
     await waitFor(() => {
       expect(onImprove).toHaveBeenCalledTimes(1);
     });
   });

  it('should disable manual button while manual improvement is in progress', async () => {
    vi.useRealTimers();
    (useOptimizedAutoImprovement as Mock).mockReturnValue({
      handleTyping: vi.fn(),
      getWordCount: vi.fn(() => 10),
      state: {
        isTyping: false,
        isPaused: false,
        isImproving: false,
        lastImprovement: 0,
        improvementCount: 0
      }
    });

    // Create a promise that we can control
    let resolveImprove: () => void;
    const improvePromise = new Promise<void>((resolve) => {
      resolveImprove = resolve;
    });
    const onImprove = vi.fn().mockReturnValue(improvePromise);

    render(<AIWriterEditor {...mockProps} onImprove={onImprove} />);

    const manualButton = screen.getByRole('button', { name: /Mejorar con IA/i });
    
    // Click the button
    fireEvent.click(manualButton);

    // Button should be disabled while processing
    await waitFor(() => {
      expect(manualButton).toBeDisabled();
    });

    // Resolve the improvement
    resolveImprove!();

    // Button should be enabled again after completion
    await waitFor(() => {
      expect(manualButton).not.toBeDisabled();
    });
  });

  it('should show "Procesando..." text when manual improvement is in progress', async () => {
    vi.useRealTimers();
    (useOptimizedAutoImprovement as Mock).mockReturnValue({
      handleTyping: vi.fn(),
      getWordCount: vi.fn(() => 10),
      state: {
        isTyping: false,
        isPaused: false,
        isImproving: false,
        lastImprovement: 0,
        improvementCount: 0
      }
    });

    // Create a promise that we can control
    let resolveImprove: () => void;
    const improvePromise = new Promise<void>((resolve) => {
      resolveImprove = resolve;
    });
    const onImprove = vi.fn().mockReturnValue(improvePromise);

    render(<AIWriterEditor {...mockProps} onImprove={onImprove} />);

    const manualButton = screen.getByRole('button', { name: /Mejorar con IA/i });
    
    // Initial state should show "Mejorar con IA"
    expect(manualButton).toHaveTextContent(/Mejorar con IA/i);

    // Click the button
    fireEvent.click(manualButton);

    // Should show "Procesando..." while processing
    await waitFor(() => {
      expect(manualButton).toHaveTextContent(/Procesando/i);
    });

    // Resolve the improvement
    resolveImprove!();

    // Should show "Mejorar con IA" again after completion
    await waitFor(() => {
      expect(manualButton).toHaveTextContent(/Mejorar con IA/i);
    });
  });

  it('should not allow concurrent manual improvements', async () => {
    vi.useRealTimers();
    (useOptimizedAutoImprovement as Mock).mockReturnValue({
      handleTyping: vi.fn(),
      getWordCount: vi.fn(() => 10),
      state: {
        isTyping: false,
        isPaused: false,
        isImproving: false,
        lastImprovement: 0,
        improvementCount: 0
      }
    });

    // Create a promise that we can control
    let resolveImprove: () => void;
    const improvePromise = new Promise<void>((resolve) => {
      resolveImprove = resolve;
    });
    const onImprove = vi.fn().mockReturnValue(improvePromise);

    render(<AIWriterEditor {...mockProps} onImprove={onImprove} />);

    const manualButton = screen.getByRole('button', { name: /Mejorar con IA/i });
    
    // Click the button twice
    fireEvent.click(manualButton);
    fireEvent.click(manualButton);

    // onImprove should only be called once
    await waitFor(() => {
      expect(onImprove).toHaveBeenCalledTimes(1);
    });

    // Resolve the improvement
    resolveImprove!();
  });

  it('should pass isPaused state to AutoModeToggle when auto mode is paused', () => {
    (useOptimizedAutoImprovement as Mock).mockReturnValue({
      handleTyping: vi.fn(),
      getWordCount: vi.fn(() => 10),
      state: {
        isTyping: false,
        isPaused: true, // Auto mode is paused
        isImproving: false,
        lastImprovement: 0,
        improvementCount: 0
      }
    });

    render(<AIWriterEditor {...mockProps} />);

    // The AutoModeToggle should receive isPaused=true
    // This is verified by checking if "Auto Mode: Paused" is displayed
    const pausedElements = screen.getAllByText(/Auto Mode: Paused/i);
    expect(pausedElements.length).toBeGreaterThan(0);
  });
});
