"use client";

import { useRef, useState } from "react";
import {
  Download,
  Upload,
  FileText,
  File as FileIcon,
  Type,
  Settings as SettingsIcon,
  Copy,
  Info,
  Zap,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Trash2,
  FileDown,
  Sparkles,
  Save,
  Maximize2,
  Minimize2,
  Clock,
  Loader2,
  Check,
  History,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSimpleTranslations } from "@/app/lib/simple-translations";
import TiptapEditor from "../../components/TiptapEditor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "../../components/ui/dropdown-menu";
import { toast } from "sonner";
import { useWriter } from "../context/WriterContext";
import { VersionHistoryDialog } from "./VersionHistoryDialog"; // Import Dialog
import { EditorErrorBoundary } from "./EditorErrorBoundary";
import { ClientOnly } from "../../components/ClientOnly";

interface AIWriterEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  onImprove: () => void;
  onAIAction?: (action: string, text: string, onStream?: (chunk: string) => void) => Promise<string | null>;
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
}

/**
 * Modern AI Writer Editor Component
 * 
 * Professional editor with:
 * - Rich Text Tiptap Editor
 * - Zen Mode (Focus)
 * - Character and word count
 * - Modern action buttons
 * - Export and Import capabilities (PDF, DOCX, TXT)
 */
export default function AIWriterEditor({
  content,
  onContentChange,
  onImprove,
  onAIAction,
  onSave,
  onCopy,
  onOpenSettings,
  isProcessing,
  isSaving = false,
  disabled = false,
  usageInfo
}: AIWriterEditorProps) {
  const { zenMode, setZenMode, focusMode, docId, docTitle, emailModeEnabled, emailRecipient, emailSubject } = useWriter();
  const { t } = useSimpleTranslations(); // Added translation hook
  const [showHistory, setShowHistory] = useState(false); // Add State
  const [mode, setMode] = useState<'focus' | 'normal'>('normal'); // Added for new mode toggle
  const [editorKey, setEditorKey] = useState(0);

  const handleEditorReset = () => {
    setEditorKey(prev => prev + 1);
    toast.info(t('editor_reloaded_success'));
  };

  // Helper to strip HTML for stats and export
  const stripHtml = (html: string) => {
    if (!html) return "";
    if (typeof document === 'undefined') return html; // SSR safety
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const plainText = typeof window !== 'undefined' ? stripHtml(content) : content;
  const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Export Functions ---

  const exportToTxt = () => {
    const text = stripHtml(content);
    if (!text.trim()) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `redcreativa-ia-${new Date().getTime()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(t('export_txt_success'));
  };

  const exportToPdf = async () => {
    const text = stripHtml(content);
    if (!text.trim()) return;
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

      const splitText = doc.splitTextToSize(text, maxWidth);
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
      toast.success(t('export_pdf_success'));
    } catch (err) {
      console.error("PDF export error:", err);
      toast.error(t('export_pdf_error'));
    }
  };

  const exportToDocx = async () => {
    const text = stripHtml(content);
    if (!text.trim()) return;
    try {
      const { Document, Packer, Paragraph, TextRun } = await import("docx");

      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: text,
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
      toast.success(t('export_docx_success'));
    } catch (err) {
      console.error("DOCX export error:", err);
      toast.error(t('export_docx_error'));
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
            toast.success(t('import_txt_success'));
          }
        };
        reader.readAsText(file);
      }
      else if (fileType === 'docx') {
        const mammoth = await import("mammoth");
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        onContentChange(result.value);
        toast.success(t('import_docx_success'));
      }
      else if (fileType === 'pdf') {
        const pdfjsLib = await import("pdfjs-dist");
        // Use GlobalWorkerOptions if previously set, or set it here if needed
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
        toast.success(t('import_pdf_success'));
      }
      else {
        toast.error(t('import_unsupported_format'));
      }
    } catch (err) {
      console.error("Import error:", err);
      toast.error(t('import_error'));
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Dummy AI Action for Tiptap to prevent errors
  const handleAIAction = async (action: string, text: string, onStream?: (chunk: string) => void) => {
    console.log("Internal AI Action triggered:", action, text);
    // If a parent handler is provided, use it
    if (onAIAction) {
      return await onAIAction(action, text, onStream);
    }
    return null;
  };

  const handleRestoreVersion = (newContent: string) => {
    onContentChange(newContent);
    // Trigger auto-save?
  };

  // Placeholder for handleImport and handleExport, assuming they will be defined elsewhere or adapted
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Existing handleFileChange logic
    await handleFileChange(e);
  };

  const handleExport = (format: string) => {
    if (format === 'txt') exportToTxt();
    else if (format === 'pdf') exportToPdf();
    else if (format === 'docx') exportToDocx();
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent(emailSubject || "Borrador de Red Creativa");
    // Ensure properly encoded body including newlines
    const body = encodeURIComponent(stripHtml(content));
    const recipient = emailRecipient || "";

    window.open(`mailto:${recipient}?subject=${subject}&body=${body}`, '_blank');
    toast.success(t('email_opening_client'));
  };

  return (
    <div className={`flex flex-col h-full bg-background/50 backdrop-blur-sm shadow-sm rounded-xl border border-border/50 overflow-hidden transition-all duration-500 ${zenMode ? 'border-none rounded-none shadow-none' : ''}`}>
      {/* Editor Header */}
      <div className={`bg-muted/30 px-6 py-3 border-b flex items-center justify-between backdrop-blur-md transition-all duration-500 ${zenMode ? 'opacity-0 hover:opacity-100 absolute top-0 left-0 right-0 z-50 bg-background/80 border-b-border/20' : ''}`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-foreground/80">{t('editor_smart_title')}</span>
          </div>
          <div className="h-4 w-px bg-border/60"></div>
          <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
            <div className="flex items-center gap-4">
              <span>{plainText.length} {t('chars')}</span> {/* Using plainText.length for chars */}
              <span>{wordCount} {t('words')}</span> {/* Using wordCount for words */}
            </div>
            <div className="flex items-center gap-4">
              {/* Add real reading time if available, otherwise just placeholder logic or remove */}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Mode */}
          <div className="flex items-center mr-2 bg-muted/50 p-1 rounded-lg border border-border/50">
            <Button
              variant={mode === 'focus' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setMode('focus')}
              className="h-7 px-2 text-xs"
              title={t('zen_mode')}
            >
              <Maximize2 className="w-3.5 h-3.5 mr-1" />
              <span className="hidden sm:inline">{t('focus_mode')}</span>
            </Button>
            <Button
              variant={mode === 'normal' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setMode('normal')}
              className="h-7 px-2 text-xs"
              title={t('normal_mode')}
            >
              <Minimize2 className="w-3.5 h-3.5 mr-1" />
              <span className="hidden sm:inline">{t('normal_mode')}</span>
            </Button>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setShowHistory(true)}>
                  <History className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('history')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={onOpenSettings}>
                  <SettingsIcon className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('settings')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="h-4 w-px bg-border/50 mx-1" />

          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-2 hidden sm:flex"
            onClick={() => document.getElementById('import-file')?.click()}
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="text-xs">{t('import_action')}</span>
          </Button>
          <input
            type="file"
            id="import-file"
            className="hidden"
            accept=".txt,.pdf,.docx" // Changed to match existing accept types
            onChange={handleImport}
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm" className="h-8 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                <Download className="w-3.5 h-3.5" />
                <span className="text-xs hidden sm:inline">{t('export_action')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>{t('export_target')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport('txt')}>
                <Type className="w-4 h-4 mr-2" /> {/* Changed to Type icon for TXT */}
                {t('export_txt_option')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileIcon className="w-4 h-4 mr-2" /> {/* Changed to FileIcon for PDF */}
                {t('export_pdf_option')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('docx')}>
                <FileDown className="w-4 h-4 mr-2" /> {/* Changed to FileDown for DOCX */}
                {t('export_docx_option')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tiptap Editor Area */}

      {/* Tiptap Editor Area */}
      <div className="flex-1 overflow-hidden relative group">
        <ClientOnly fallback={
          <div className="flex items-center justify-center h-full bg-muted/5">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
              <p className="text-sm text-muted-foreground/80">{t('editor_loading_secure')}</p>
            </div>
          </div>
        }>
          <EditorErrorBoundary componentName="TiptapEditor" onReset={handleEditorReset}>
            <TiptapEditor
              key={`editor-${editorKey}`}
              content={content}
              onChange={onContentChange}
              editable={!isProcessing && !disabled}
              isProcessing={isProcessing}
              onAIAction={onAIAction ? handleAIAction : undefined}
              focusMode={focusMode}
              docId={docId || ""}
              title={docTitle || ""}
            />
          </EditorErrorBoundary>
        </ClientOnly>


        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center z-20">
            <div className="text-center space-y-4 p-8 rounded-2xl bg-background/80 shadow-2xl border border-primary/10 animate-in fade-in zoom-in-95 duration-300">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
                <div className="relative bg-background p-3 rounded-full border border-primary/20 shadow-sm">
                  <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold text-foreground">{t('processing_content')}</p>
                <p className="text-xs text-muted-foreground">{t('ai_working_magic')}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className={`bg-muted/30 px-6 py-4 border-t flex items-center justify-between gap-4 backdrop-blur-md transition-all duration-500 ${zenMode ? 'transform translate-y-full opacity-0 absolute bottom-0 left-0 right-0 z-40 hover:translate-y-0 hover:opacity-100' : ''}`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
            {isSaving ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>{t('auto_save')}...</span>
              </>
            ) : (
              <>
                <Check className="w-3 h-3" />
                <span>{t('save')}</span>
              </>
            )}
          </div>

          {usageInfo && !usageInfo.isPremium && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-background border border-border shadow-sm">
              <Zap className="w-3 h-3 text-orange-500" />
              <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{t('usage')}:</span>
              <span className={`text-xs font-medium ${usageInfo.usage >= usageInfo.limit ? 'text-red-500 font-bold' : 'text-primary'}`}>
                {usageInfo.usage} / {usageInfo.limit}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* HISTORY BUTTON - Removed as it's now in the header */}

          {/* <div className="h-4 w-px bg-border/40 mx-1"></div> */} {/* Removed separator */}

          <button
            type="button"
            onClick={onSave}
            disabled={isSaving || !stripHtml(content).trim() || disabled}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-background border hover:bg-muted/50 rounded-lg transition-all disabled:opacity-50 shadow-sm hover:shadow-md active:scale-95"
          >
            {isSaving ? (
              <div className="animate-spin h-4 w-4 border-2 border-primary/30 border-t-white rounded-full" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {t('save')}
          </button>

          {/* EMAIL MODE BUTTON */}
          {emailModeEnabled && (
            <Button
              variant="outline"
              onClick={handleSendEmail}
              disabled={!stripHtml(content).trim()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-all shadow-sm"
              title={`Enviar a ${emailRecipient || 'destinatario'}`}
            >
              <Mail className="w-4 h-4" />
              {t('email_send_button')}
            </Button>
          )}

          {/* Export Dropdown - Removed as it's now in the header */}

          <Button
            variant="default" // changed type="button" to Button component
            onClick={onCopy}
            disabled={!stripHtml(content).trim() || disabled}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-background border hover:bg-muted/50 rounded-lg transition-all disabled:opacity-50 shadow-sm hover:shadow-md active:scale-95"
          >
            <Copy className="w-4 h-4" />
            {t('copy')}
          </Button>

          <Button
            variant="default" // changed type="button" to Button component to match style
            onClick={onImprove}
            disabled={isProcessing || !stripHtml(content).trim() || disabled}
            className="hidden sm:flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-lg transition-all disabled:opacity-50 shadow-lg hover:shadow-indigo-500/25 active:scale-95"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                {t('processing_ai')}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {t('writer_improve_global')}
              </>
            )}
          </Button>
        </div>
      </div>

      <VersionHistoryDialog
        docId={docId || ""}
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onRestore={handleRestoreVersion}
      />
    </div>
  );
}
