"use client";

import { useRef } from "react";
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
}

/**
 * Modern AI Writer Editor Component
 * 
 * Professional editor with:
 * - Clean textarea for content
 * - Character and word count
 * - Modern action buttons
 * - Export and Import capabilities (PDF, DOCX, TXT)
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
  usageInfo
}: AIWriterEditorProps) {
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      } 
      else if (fileType === 'pdf') {
        const pdfjsLib = await import("pdfjs-dist");
        const pdfVersion = "5.4.449";
        const workerUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfVersion}/build/pdf.worker.min.mjs`;
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
        
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ 
          data: arrayBuffer,
          workerSrc: workerUrl,
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
      <div className="bg-muted/50 px-6 py-4 border-b flex items-center justify-between">
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
        </div>
        
        <div className="flex items-center gap-2">
          {/* Import Button */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".txt,.pdf,.docx" 
            className="hidden" 
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

      {/* Textarea */}
      <div className="relative">
        <textarea
          id="content"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="Escribe o pega tu texto aquí para mejorarlo con IA, o importa un archivo..."
          className="w-full h-[500px] p-8 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed font-sans text-lg leading-relaxed"
          disabled={isProcessing || disabled}
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
            <span>El contenido se guarda en Supabase</span>
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
            onClick={onImprove}
            disabled={isProcessing || !content.trim() || disabled}
            className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform active:scale-95"
          >
            {isProcessing ? (
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
