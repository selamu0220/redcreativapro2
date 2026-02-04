"use client";

import { FileText, Save, Copy, Sparkles, Download, Settings as SettingsIcon } from "lucide-react";

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

    return (
        <div className="space-y-0">
            {/* Editor Header */}
            <div className="bg-muted/50 px-6 py-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Editor de Texto (Modo Seguro)</span>
                    </div>
                    <div className="h-4 w-px bg-border"></div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{content.length} caracteres</span>
                        <span>•</span>
                        <span>{wordCount} palabras</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
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
                    placeholder="Escribe o pega tu texto aquí..."
                    className="w-full h-[500px] p-8 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed font-sans text-lg leading-relaxed"
                    disabled={isProcessing || disabled}
                />

                {/* Processing Overlay */}
                {isProcessing && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
                        <div className="text-center space-y-3">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
                            <p className="text-sm font-medium text-foreground">Mejorando tu contenido...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Bar */}
            <div className="bg-muted/50 px-6 py-4 border-t flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {/* Usage Info */}
                    {usageInfo && !usageInfo.isPremium && (
                        <div className="text-xs text-muted-foreground">
                            Uso: {usageInfo.usage} / {usageInfo.limit}
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
                        <Save className="w-4 h-4" />
                        Guardar
                    </button>

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
                        <Sparkles className="w-4 h-4" />
                        Mejorar con IA
                    </button>
                </div>
            </div>
        </div>
    );
}
