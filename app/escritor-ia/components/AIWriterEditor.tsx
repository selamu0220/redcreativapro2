"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import {
  Download,
  Upload,
  FileText,
  File as FileIcon,
  Type,
  Settings as SettingsIcon,
  Copy,
  Info,
  FileDown,
  Sparkles,
  Save
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "../../components/ui/dropdown-menu";
import { toast } from "sonner";
import { useOptimizedAutoImprovement, useAutoImprovementConfig } from "../../hooks/useOptimizedAutoImprovement";
import AutoModeToggle from "../../components/AutoModeToggle";
import AutoModeIndicator from "../../components/AutoModeIndicator";

interface AIWriterEditorProps {
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
  // Auto-improvement props
  autoModeEnabled?: boolean;
  onAutoModeToggle?: (enabled: boolean) => void;
  // Settings panel state
  isSettingsPanelOpen?: boolean;
}

// LocalStorage key for auto mode settings
const AUTO_MODE_STORAGE_KEY = 'redcreativa-auto-mode-settings';

// Auto mode configuration interface
interface AutoModeConfig {
  enabled: boolean;
  delay: number;
  minWords: number;
  maxRetries: number;
  debounceDelay: number;
}

// Auto mode storage interface
interface AutoModeStorage {
  enabled: boolean;
  config: AutoModeConfig;
  lastUsed: number;
}

// Default auto mode configuration
const DEFAULT_AUTO_MODE_CONFIG: AutoModeConfig = {
  enabled: false,
  delay: 2000,
  minWords: 5,
  maxRetries: 3,
  debounceDelay: 1000
};

/**
 * Modern AI Writer Editor Component
 * 
 * Professional editor with:
 * - Clean textarea for content
 * - Character and word count
 * - Modern action buttons
 * - Export and Import capabilities (PDF, DOCX, TXT)
 * - Auto-improvement mode with state management
 */
export default function AIWriterEditor({
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
  autoModeEnabled = false,
  onAutoModeToggle,
  isSettingsPanelOpen = false
}: AIWriterEditorProps) {
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // DEBUG: Log textarea state
  useEffect(() => {
    console.log('[AIWriterEditor] Textarea State:', {
      isProcessing,
      disabled,
      isSettingsPanelOpen,
      contentLength: content.length
    });
  }, [isProcessing, disabled, isSettingsPanelOpen, content.length]);

  // Auto mode state management
  const [internalAutoModeEnabled, setInternalAutoModeEnabled] = useState<boolean>(false);
  const [autoModeConfig, setAutoModeConfig] = useState<AutoModeConfig>(DEFAULT_AUTO_MODE_CONFIG);
  const [consecutiveErrors, setConsecutiveErrors] = useState<number>(0);
  const [lastErrorTime, setLastErrorTime] = useState<number>(0);
  const [isManualImproving, setIsManualImproving] = useState<boolean>(false);
  const [autoModePausedUntil, setAutoModePausedUntil] = useState<number>(0);
  const [errorCooldownActive, setErrorCooldownActive] = useState<boolean>(false);
  const [isTogglingAutoMode, setIsTogglingAutoMode] = useState<boolean>(false);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const errorCooldownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const errorHistoryRef = useRef<Array<{
    timestamp: number;
    error: Error;
    context: string;
  }>>([]);
  const autoStateRef = useRef<any>(null); // Ref to store autoState for error logging

  // Load auto mode settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTO_MODE_STORAGE_KEY);
      if (stored) {
        const parsed: AutoModeStorage = JSON.parse(stored);
        setInternalAutoModeEnabled(parsed.enabled);
        setAutoModeConfig(parsed.config);
        console.log('[AIWriterEditor] Loaded auto mode settings from localStorage:', parsed);
      } else {
        console.log('[AIWriterEditor] No stored auto mode settings, using defaults');
      }
    } catch (error) {
      console.error('[AIWriterEditor] Error loading auto mode settings:', error);
      // Reset to defaults on error
      setInternalAutoModeEnabled(false);
      setAutoModeConfig(DEFAULT_AUTO_MODE_CONFIG);
    }
  }, []);

  // Listen for localStorage changes from other components (e.g., SettingsPanel)
  // This ensures config stays synchronized across all components
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === AUTO_MODE_STORAGE_KEY && e.newValue) {
        try {
          const parsed: AutoModeStorage = JSON.parse(e.newValue);
          console.log('[AIWriterEditor] Detected localStorage change, syncing config:', parsed);
          setInternalAutoModeEnabled(parsed.enabled);
          setAutoModeConfig(parsed.config);
        } catch (error) {
          console.error('[AIWriterEditor] Error parsing storage change:', error);
        }
      }
    };

    // Listen for storage events (fired when localStorage changes in other tabs/windows)
    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom event for same-window updates
    const handleCustomStorageChange = ((e: CustomEvent) => {
      if (e.detail?.key === AUTO_MODE_STORAGE_KEY) {
        try {
          const stored = localStorage.getItem(AUTO_MODE_STORAGE_KEY);
          if (stored) {
            const parsed: AutoModeStorage = JSON.parse(stored);
            console.log('[AIWriterEditor] Detected custom storage change, syncing config:', parsed);
            setInternalAutoModeEnabled(parsed.enabled);
            setAutoModeConfig(parsed.config);
          }
        } catch (error) {
          console.error('[AIWriterEditor] Error parsing custom storage change:', error);
        }
      }
    }) as EventListener;

    window.addEventListener('localStorageChange', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleCustomStorageChange);
    };
  }, []);

  // Use internal state or prop for auto mode enabled
  const effectiveAutoModeEnabled = autoModeEnabled ?? internalAutoModeEnabled;

  // Check if auto mode is currently paused
  const isAutoModePaused = autoModePausedUntil > Date.now() || isSettingsPanelOpen;

  // Cleanup pause timeout on unmount
  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
      if (errorCooldownTimeoutRef.current) {
        clearTimeout(errorCooldownTimeoutRef.current);
      }
    };
  }, []);

  // Pause auto mode for a specified duration
  const pauseAutoMode = useCallback((durationMs: number) => {
    const pauseUntil = Date.now() + durationMs;
    setAutoModePausedUntil(pauseUntil);
    console.log('[AIWriterEditor] Auto mode paused for', durationMs, 'ms');

    // Clear any existing timeout
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }

    // Set timeout to clear pause
    pauseTimeoutRef.current = setTimeout(() => {
      setAutoModePausedUntil(0);
      console.log('[AIWriterEditor] Auto mode pause cleared');
    }, durationMs);
  }, []);

  // Handle manual improvement button click
  const handleManualImprove = useCallback(async () => {
    console.log('[AIWriterEditor] Manual improvement triggered');
    
    // Pause auto mode for 5 seconds
    if (effectiveAutoModeEnabled) {
      pauseAutoMode(5000);
    }

    // Set manual improving state
    setIsManualImproving(true);

    try {
      // Call the existing onImprove function
      await onImprove();
      console.log('[AIWriterEditor] Manual improvement completed successfully');
    } catch (error) {
      console.error('[AIWriterEditor] Manual improvement error:', error);
      toast.error('Error al mejorar el contenido');
    } finally {
      // Clear manual improving state
      setIsManualImproving(false);
      
      // Auto mode will resume automatically after 5 seconds (handled by pauseAutoMode)
      console.log('[AIWriterEditor] Manual improvement finished, auto mode will resume in 5 seconds');
    }
  }, [onImprove, effectiveAutoModeEnabled, pauseAutoMode]);

  // Handle auto mode toggle with atomic state synchronization
  const handleAutoModeToggle = useCallback((enabled: boolean) => {
    console.log('[AIWriterEditor] Auto mode toggle requested:', enabled);
    
    // Prevent concurrent toggles
    if (isTogglingAutoMode) {
      console.log('[AIWriterEditor] Toggle already in progress, ignoring');
      return;
    }
    
    // Set loading state
    setIsTogglingAutoMode(true);
    
    try {
      // Atomic state update: Update all states together in a single operation
      // This prevents race conditions and ensures consistency
      
      // 1. Update internal state
      setInternalAutoModeEnabled(enabled);
      
      // 2. Immediately persist to localStorage (synchronous)
      const storage: AutoModeStorage = {
        enabled,
        config: autoModeConfig,
        lastUsed: Date.now()
      };
      localStorage.setItem(AUTO_MODE_STORAGE_KEY, JSON.stringify(storage));
      
      // 3. Dispatch custom event for same-window synchronization
      window.dispatchEvent(new CustomEvent('localStorageChange', {
        detail: { key: AUTO_MODE_STORAGE_KEY, value: storage }
      }));
      
      console.log('[AIWriterEditor] Auto mode state synchronized:', {
        internalState: enabled,
        localStorage: enabled,
        timestamp: new Date().toISOString()
      });
      
      // 4. Notify parent component (if callback provided)
      onAutoModeToggle?.(enabled);
      
      // 5. Show user feedback
      if (enabled) {
        toast.success('Modo automático activado');
      } else {
        toast.info('Modo automático desactivado');
      }
      
      console.log('[AIWriterEditor] Auto mode toggle complete:', enabled);
    } catch (error) {
      console.error('[AIWriterEditor] Error during auto mode toggle:', error);
      // Rollback internal state on error
      setInternalAutoModeEnabled(!enabled);
      toast.error('Error al cambiar el modo automático');
    } finally {
      // Clear loading state
      setIsTogglingAutoMode(false);
    }
  }, [onAutoModeToggle, autoModeConfig, isTogglingAutoMode]);

  console.log('[AIWriterEditor] Render. isProcessing:', isProcessing, 'Disabled:', disabled, 'AutoMode:', effectiveAutoModeEnabled);

  // Initialize auto-improvement configuration
  const { config } = useAutoImprovementConfig({
    enabled: effectiveAutoModeEnabled,
    delay: autoModeConfig.delay,
    minWords: autoModeConfig.minWords,
    maxRetries: autoModeConfig.maxRetries,
    debounceDelay: autoModeConfig.debounceDelay
  });

  // Get current content callback for the hook
  const getCurrentContent = useCallback(() => content, [content]);

  // Handle auto-improvement callback
  const handleAutoImprove = useCallback(async (contentToImprove: string, isAuto: boolean) => {
    console.log('[AIWriterEditor] Auto-improvement triggered. isAuto:', isAuto);
    
    try {
      // Call the existing onImprove function
      await onImprove();
      
      // Reset consecutive errors on success
      setConsecutiveErrors(0);
      setLastErrorTime(0);
      
      console.log('[AIWriterEditor] Auto-improvement completed successfully');
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      const timestamp = Date.now();
      
      // Calculate word count
      const currentWordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
      
      // Comprehensive error logging with all required context
      console.error('═══════════════════════════════════════════════════════════');
      console.error('[AIWriterEditor] AUTO-IMPROVEMENT ERROR - COMPREHENSIVE LOG');
      console.error('═══════════════════════════════════════════════════════════');
      console.error('');
      console.error('📅 TIMESTAMP:', new Date(timestamp).toISOString());
      console.error('');
      console.error('❌ ERROR DETAILS:');
      console.error('  Message:', errorObj.message);
      console.error('  Name:', errorObj.name);
      console.error('  Stack Trace:');
      console.error(errorObj.stack || '  (No stack trace available)');
      console.error('');
      console.error('📝 EDITOR STATE AT TIME OF ERROR:');
      console.error('  Content Length:', content.length, 'characters');
      console.error('  Word Count:', currentWordCount, 'words');
      console.error('  Auto Mode Enabled:', effectiveAutoModeEnabled);
      console.error('  Auto Mode Paused:', isAutoModePaused);
      console.error('  Manual Improving:', isManualImproving);
      console.error('  Processing:', isProcessing);
      console.error('  Disabled:', disabled);
      console.error('  Settings Panel Open:', isSettingsPanelOpen);
      console.error('  Consecutive Errors:', consecutiveErrors);
      console.error('  Last Error Time:', lastErrorTime ? new Date(lastErrorTime).toISOString() : 'none');
      console.error('  Error Cooldown Active:', errorCooldownActive);
      console.error('');
      console.error('⚙️  AUTO MODE CONFIGURATION:');
      console.error('  Enabled:', autoModeConfig.enabled);
      console.error('  Delay:', autoModeConfig.delay, 'ms');
      console.error('  Min Words:', autoModeConfig.minWords);
      console.error('  Max Retries:', autoModeConfig.maxRetries);
      console.error('  Debounce Delay:', autoModeConfig.debounceDelay, 'ms');
      console.error('');
      console.error('📊 AUTO-IMPROVEMENT STATE:');
      console.error('  Is Typing:', autoStateRef.current?.isTyping ?? 'unknown');
      console.error('  Is Paused:', autoStateRef.current?.isPaused ?? 'unknown');
      console.error('  Is Improving:', autoStateRef.current?.isImproving ?? 'unknown');
      console.error('  Last Improvement:', autoStateRef.current?.lastImprovement ? new Date(autoStateRef.current.lastImprovement).toISOString() : 'never');
      console.error('  Improvement Count:', autoStateRef.current?.improvementCount ?? 0);
      console.error('');
      console.error('📜 RECENT IMPROVEMENT HISTORY (Last 5):');
      if (errorHistoryRef.current.length === 0) {
        console.error('  (No previous errors)');
      } else {
        const recentErrors = errorHistoryRef.current.slice(-5);
        recentErrors.forEach((err, index) => {
          console.error(`  ${index + 1}. ${new Date(err.timestamp).toISOString()}`);
          console.error(`     Error: ${err.error.message}`);
          console.error(`     Context: ${err.context}`);
        });
      }
      console.error('');
      console.error('💾 CONTENT PREVIEW (First 200 chars):');
      console.error('  "' + content.substring(0, 200) + (content.length > 200 ? '...' : '') + '"');
      console.error('');
      console.error('═══════════════════════════════════════════════════════════');
      
      // Add to error history with enhanced context
      errorHistoryRef.current.push({
        timestamp,
        error: errorObj,
        context: JSON.stringify({
          contentLength: content.length,
          wordCount: currentWordCount,
          autoModeEnabled: effectiveAutoModeEnabled,
          autoModePaused: isAutoModePaused,
          manualImproving: isManualImproving,
          consecutiveErrors: consecutiveErrors,
          config: autoModeConfig,
          autoState: {
            isTyping: autoStateRef.current?.isTyping ?? false,
            isPaused: autoStateRef.current?.isPaused ?? false,
            isImproving: autoStateRef.current?.isImproving ?? false,
            improvementCount: autoStateRef.current?.improvementCount ?? 0
          }
        })
      });
      
      // Keep only last 10 errors in history
      if (errorHistoryRef.current.length > 10) {
        errorHistoryRef.current = errorHistoryRef.current.slice(-10);
      }
      
      // Track consecutive errors
      const newErrorCount = consecutiveErrors + 1;
      setConsecutiveErrors(newErrorCount);
      setLastErrorTime(timestamp);
      
      // Handle error notifications and recovery based on error count
      if (newErrorCount === 1) {
        // First error: Show simple notification
        toast.error('Auto-improvement failed. Retrying...');
        console.log('[AIWriterEditor] First error - will retry');
      } else if (newErrorCount === 2) {
        // Second error: Show warning
        toast.error('Auto-improvement experiencing issues. Will retry.');
        console.warn('[AIWriterEditor] Second consecutive error - showing warning');
      } else if (newErrorCount >= 3) {
        // Third consecutive error: Disable auto mode temporarily
        toast.error('Auto-improvement disabled temporarily due to repeated errors. Will resume in 30 seconds.');
        
        // Disable auto mode
        setInternalAutoModeEnabled(false);
        setErrorCooldownActive(true);
        
        // Clear any existing cooldown timeout
        if (errorCooldownTimeoutRef.current) {
          clearTimeout(errorCooldownTimeoutRef.current);
        }
        
        // Re-enable after 30 seconds
        errorCooldownTimeoutRef.current = setTimeout(() => {
          setInternalAutoModeEnabled(true);
          setConsecutiveErrors(0);
          setLastErrorTime(0);
          setErrorCooldownActive(false);
          
          toast.success('Auto-improvement has been re-enabled.');
          console.log('[AIWriterEditor] Auto-improvement re-enabled after error cooldown');
        }, 30000);
        
        console.error('[AIWriterEditor] ⚠️  CRITICAL: Auto-improvement disabled for 30 seconds due to 3 consecutive errors');
        console.error('[AIWriterEditor] Error history:', errorHistoryRef.current.map(e => ({
          time: new Date(e.timestamp).toISOString(),
          message: e.error.message
        })));
      }
    }
  }, [onImprove, consecutiveErrors, lastErrorTime, content, effectiveAutoModeEnabled, autoModeConfig, isAutoModePaused, isManualImproving, isProcessing, disabled, isSettingsPanelOpen, errorCooldownActive]);

  // Initialize auto-improvement hook
  const {
    handleTyping,
    state: autoState,
    getWordCount
  } = useOptimizedAutoImprovement({
    config,
    onImprove: handleAutoImprove,
    getCurrentContent,
    enabled: false // Disabled to prevent conflicts with EnhancedAIWriterEditor auto-improvement
  });

  // Update autoState ref whenever autoState changes (for error logging)
  useEffect(() => {
    autoStateRef.current = autoState;
  }, [autoState]);

  // Get current word count for the indicator
  const currentWordCount = getWordCount();

  // Handle textarea typing events
  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    onContentChange(newContent);
    
    // Trigger typing detection for auto-improvement (only if not paused and not manually improving)
    if (effectiveAutoModeEnabled && !isAutoModePaused && !isManualImproving) {
      handleTyping();
    }
  }, [onContentChange, effectiveAutoModeEnabled, isAutoModePaused, isManualImproving, handleTyping]);

  // --- Export Functions ---

  const exportToTxt = () => {
    if (!content.trim()) return;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `redcreativa-ia-${new Date().getTime()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Archivo TXT exportado correctamente");
  };

  const exportToPdf = async () => {
    if (!content.trim()) return;
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      // Professional styling
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const maxWidth = pageWidth - (margin * 2);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Red Creativa Pro - IA", margin, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);

      const splitText = doc.splitTextToSize(content, maxWidth);
      let cursorY = 35;

      for (let i = 0; i < splitText.length; i++) {
        if (cursorY > pageHeight - margin) {
          doc.addPage();
          cursorY = margin;
        }
        doc.text(splitText[i], margin, cursorY);
        cursorY += 7; // Line height
      }

      doc.save(`redcreativa-ia-${new Date().getTime()}.pdf`);
      toast.success("Archivo PDF exportado correctamente");
    } catch (err) {
      console.error("PDF export error:", err);
      toast.error("Error al exportar PDF. Intenta de nuevo.");
    }
  };

  const exportToDocx = async () => {
    if (!content.trim()) return;
    try {
      const { Document, Packer, Paragraph, TextRun } = await import("docx");

      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: content,
                  size: 24,
                }),
              ],
            }),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `redcreativa-ia-${new Date().getTime()}.docx`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Archivo DOCX exportado correctamente");
    } catch (err) {
      console.error("DOCX export error:", err);
      toast.error("Error al exportar DOCX. Intenta de nuevo.");
    }
  };

  // --- Import Functions ---

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.name.split('.').pop()?.toLowerCase();

    try {
      if (fileType === 'txt') {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result;
          if (typeof result === 'string') {
            onContentChange(result);
            toast.success("Archivo TXT importado");
            
            // Pause auto mode for 5 seconds after successful import
            if (effectiveAutoModeEnabled) {
              pauseAutoMode(5000);
              console.log('[AIWriterEditor] Auto mode paused for 5 seconds after TXT import');
            }
          }
        };
        reader.readAsText(file);
      }
      else if (fileType === 'docx') {
        const mammoth = await import("mammoth");
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        onContentChange(result.value);
        toast.success("Archivo DOCX importado");
        
        // Pause auto mode for 5 seconds after successful import
        if (effectiveAutoModeEnabled) {
          pauseAutoMode(5000);
          console.log('[AIWriterEditor] Auto mode paused for 5 seconds after DOCX import');
        }
      }
      else if (fileType === 'pdf') {
        const pdfjsLib = await import("pdfjs-dist");
        const pdfVersion = "5.4.449";
        const workerUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfVersion}/build/pdf.worker.min.mjs`;
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
          useSystemFonts: true,
          isEvalSupported: false
        });

        const pdfDoc = await loadingTask.promise;
        let text = "";

        for (let i = 1; i <= pdfDoc.numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item: any) => item.str).join(" ") + "\n\n";
        }

        onContentChange(text.trim());
        toast.success("Archivo PDF importado correctamente");
        
        // Pause auto mode for 5 seconds after successful import
        if (effectiveAutoModeEnabled) {
          pauseAutoMode(5000);
          console.log('[AIWriterEditor] Auto mode paused for 5 seconds after PDF import');
        }
      }
      else {
        toast.error("Formato de archivo no soportado. Usa TXT, PDF o DOCX.");
      }
    } catch (err) {
      console.error("Import error:", err);
      toast.error("Error al importar el archivo");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-0">
      {/* Editor Header */}
      <div className="bg-muted/50 px-4 sm:px-6 py-3 sm:py-4 border-b">
        {/* Desktop Layout */}
        <div className="hidden lg:flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Editor de Texto</span>
            </div>
            <div className="h-4 w-px bg-border"></div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{content.length} caracteres</span>
              <span>•</span>
              <span>{wordCount} palabras</span>
            </div>
            
            {/* Auto Mode Controls */}
            <div className="h-4 w-px bg-border"></div>
            <div className="flex items-center gap-3">
              <AutoModeToggle
                enabled={effectiveAutoModeEnabled}
                onToggle={handleAutoModeToggle}
                disabled={disabled || isTogglingAutoMode}
                isProcessing={autoState.isImproving || isTogglingAutoMode}
                isPaused={autoState.isPaused || isAutoModePaused}
              />
              <AutoModeIndicator
                state={{
                  ...autoState,
                  isPaused: autoState.isPaused || isAutoModePaused
                }}
                config={config}
                currentWordCount={currentWordCount}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Import Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".txt,.pdf,.docx"
              className="hidden"
              aria-label="Importar archivo"
            />
            <button
              type="button"
              onClick={handleImportClick}
              disabled={disabled}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Importar archivo (PDF, DOCX, TXT)"
            >
              <Upload className="w-4 h-4" />
              Importar
            </button>

            <div className="h-4 w-px bg-border"></div>

            <button
              type="button"
              onClick={onOpenSettings}
              disabled={disabled}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SettingsIcon className="w-4 h-4" />
              Configuración
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="lg:hidden space-y-3">
          {/* Top Row: Title and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Editor</span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Import Button */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".txt,.pdf,.docx"
                className="hidden"
                aria-label="Importar archivo"
              />
              <button
                type="button"
                onClick={handleImportClick}
                disabled={disabled}
                className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Importar archivo"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Importar</span>
              </button>

              <button
                type="button"
                onClick={onOpenSettings}
                disabled={disabled}
                className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Configuración"
              >
                <SettingsIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Config</span>
              </button>
            </div>
          </div>

          {/* Bottom Row: Stats and Auto Mode */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{content.length} chars</span>
              <span>•</span>
              <span>{wordCount} words</span>
            </div>
            
            <div className="flex items-center gap-2">
              <AutoModeToggle
                enabled={effectiveAutoModeEnabled}
                onToggle={handleAutoModeToggle}
                disabled={disabled || isTogglingAutoMode}
                isProcessing={autoState.isImproving || isTogglingAutoMode}
                isPaused={autoState.isPaused || isAutoModePaused}
              />
            </div>
          </div>

          {/* Auto Mode Indicator - Full Width on Mobile */}
          {effectiveAutoModeEnabled && (
            <div className="flex justify-center">
              <AutoModeIndicator
                state={{
                  ...autoState,
                  isPaused: autoState.isPaused || isAutoModePaused
                }}
                config={config}
                currentWordCount={currentWordCount}
              />
            </div>
          )}
        </div>
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          id="content"
          value={content}
          onChange={handleTextareaChange}
          placeholder="Escribe o pega tu texto aquí para mejorarlo con IA, o importa un archivo..."
          className={`w-full h-[500px] p-8 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none resize-none font-sans text-lg leading-relaxed ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          } ${
            isProcessing ? 'pointer-events-none' : ''
          }`}
          disabled={disabled}
          aria-busy={isProcessing}
        />

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-center space-y-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm font-medium text-foreground">Mejorando tu contenido...</p>
              <p className="text-xs text-muted-foreground">Esto puede tomar unos segundos</p>
            </div>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="bg-muted/50 px-6 py-4 border-t flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="w-4 h-4" />
            <span>El contenido se guarda automáticamente</span>
          </div>

          {usageInfo && !usageInfo.isPremium && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm">
              <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Uso:</span>
              <span className={`text-xs font-medium ${usageInfo.usage >= usageInfo.limit ? 'text-red-500 font-bold' : 'text-primary'}`}>
                {usageInfo.usage} / {usageInfo.limit}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving || !content.trim() || disabled}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-background border hover:bg-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <div className="animate-spin h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Guardar
          </button>

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                disabled={!content.trim() || disabled}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-background border hover:bg-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Formato de exportación</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={exportToTxt} className="gap-2">
                <Type className="w-4 h-4" /> Texto (.txt)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToDocx} className="gap-2">
                <FileDown className="w-4 h-4" /> Documento (.docx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToPdf} className="gap-2">
                <FileIcon className="w-4 h-4" /> PDF (.pdf)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            type="button"
            onClick={onCopy}
            disabled={!content.trim() || disabled}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-background border hover:bg-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Copy className="w-4 h-4" />
            Copiar
          </button>

          <button
            type="button"
            onClick={handleManualImprove}
            disabled={isProcessing || isManualImproving || autoState.isImproving || !content.trim() || disabled}
            className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform active:scale-95"
          >
            {(isProcessing || isManualImproving) ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                Procesando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Mejorar con IA
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
