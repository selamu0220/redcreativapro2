"use client";

interface AIWriterEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  onImprove: () => void;
  onCopy: () => void;
  onOpenSettings: () => void;
  isProcessing: boolean;
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
 * - Integrated with site design system
 */
export default function AIWriterEditor({
  content,
  onContentChange,
  onImprove,
  onCopy,
  onOpenSettings,
  isProcessing,
  disabled = false,
  usageInfo
}: AIWriterEditorProps) {
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-0">
      {/* Editor Header */}
      <div className="bg-muted/50 px-6 py-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm font-medium text-muted-foreground">Editor de Texto</span>
          </div>
          <div className="h-4 w-px bg-border"></div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{content.length} caracteres</span>
            <span>•</span>
            <span>{wordCount} palabras</span>
          </div>
        </div>
        
        <button
          type="button"
          onClick={onOpenSettings}
          disabled={disabled}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Configuración
        </button>
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          id="content"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="Escribe o pega tu texto aquí para mejorarlo con IA..."
          className="w-full h-96 p-6 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed font-sans text-base leading-relaxed"
          disabled={isProcessing || disabled}
        />
        
        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
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
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>El contenido no se guarda automáticamente</span>
          </div>

          {usageInfo && !usageInfo.isPremium && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
              <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Uso Libre:</span>
              <span className={`text-xs font-medium ${usageInfo.usage >= usageInfo.limit ? 'text-red-500' : 'text-primary'}`}>
                {usageInfo.usage} / {usageInfo.limit}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCopy}
            disabled={!content.trim() || disabled}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-background border hover:bg-muted rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copiar
          </button>

          <button
            type="button"
            onClick={onImprove}
            disabled={isProcessing || !content.trim() || disabled}
            className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                    fill="none"
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Procesando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Mejorar con IA
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
