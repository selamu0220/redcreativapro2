
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import EnhancedAIWriterEditor from '../EnhancedAIWriterEditor';
import { improveContent } from '../../../lib/ai-client';

// Mock dependencies
vi.mock('../../../lib/ai-client', () => ({
  improveContent: vi.fn().mockResolvedValue({
    success: true,
    improvedContent: 'Texto mejorado de prueba'
  })
}));

vi.mock('../../../lib/settings-manager', () => ({
  getSettings: vi.fn().mockReturnValue({
    provider: 'openrouter',
    model: 'openai/gpt-4o-mini',
    apiKey: 'test-key'
  }),
  saveSettings: vi.fn(),
  loadSettings: vi.fn()
}));

// Mock hooks to avoid complexity
vi.mock('../../../hooks/useRealTimeAnalysis', () => ({
  useRealTimeAnalysis: vi.fn(() => ({
    suggestions: [],
    isAnalyzing: false,
    updateContent: vi.fn(),
    setEnabled: vi.fn(),
    isEnabled: false,
    processingTime: 0
  }))
}));

vi.mock('../../../hooks/useAgentModeChangeTracking', () => ({
  useAgentModeChangeTracking: vi.fn(() => ({
    startSession: vi.fn(),
    addChange: vi.fn(),
    completeSession: vi.fn(),
    canUndo: false,
    canRedo: false,
    currentSession: { status: 'idle', changes: [] }
  }))
}));

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('EnhancedAIWriterEditor - Manual Improvement Level', () => {
  const mockProps = {
    content: 'Texto original para mejorar.',
    onContentChange: vi.fn(),
    onImprove: vi.fn(),
    onSave: vi.fn(),
    onCopy: vi.fn(),
    onOpenSettings: vi.fn(),
    isProcessing: false,
    enableRealTimeAnalysis: false,
    enableAgentMode: true
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should use configured improvement level instruction in manual mode', async () => {
    render(<EnhancedAIWriterEditor {...mockProps} />);

    // 1. Open Auto Settings
    const settingsButton = screen.getByTitle('Configuración Automática');
    fireEvent.click(settingsButton);

    // 2. Enable Auto Mode to see settings
    // The toggle input has id="auto-mode-enabled"
    const enableToggle = screen.getByLabelText('Activar Modo Automático');
    fireEvent.click(enableToggle);

    // 3. Select "Creative" level
    // The button has text "Creativo" (from getLevelLabel logic likely, need to check label text)
    // In AutoModeSettings: getLevelLabel('creative') -> 'Creativo'
    // Let's assume the button contains "Creativo"
    const creativeButton = screen.getByText('Creativo');
    fireEvent.click(creativeButton);

    // 4. (Optional) Disable Auto Mode - logic should persist improvementLevel
    // fireEvent.click(enableToggle); 

    // 5. Trigger Manual Improvement
    // The button "Mejorar con IA" might be present in both EnhancedAIWriterEditor toolbar and inner AIWriterEditor
    const manualImproveButtons = screen.getAllByRole('button', { name: /Mejorar con IA/i });
    const manualImproveButton = manualImproveButtons[0];
    fireEvent.click(manualImproveButton);

    // 6. Verify improveContent was called with Creative instruction
    await waitFor(() => {
      expect(improveContent).toHaveBeenCalledWith(
        expect.objectContaining({
          instruction: expect.stringContaining('creativo')
        }),
        expect.anything()
      );
    });
  });

  it('should use default instruction when no level is selected (or default)', async () => {
    render(<EnhancedAIWriterEditor {...mockProps} />);

    // Directly click manual improve without changing settings (default level should be used)
    const manualImproveButtons = screen.getAllByRole('button', { name: /Mejorar con IA/i });
    const manualImproveButton = manualImproveButtons[0];
    fireEvent.click(manualImproveButton);

    await waitFor(() => {
      expect(improveContent).toHaveBeenCalledWith(
        expect.objectContaining({
          // Default instruction check
          instruction: expect.stringContaining('Mejora gramática, fluidez y tono profesional')
        }),
        expect.anything()
      );
    });
  });
});
