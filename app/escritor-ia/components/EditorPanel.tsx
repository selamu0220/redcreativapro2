'use client';

import React, { useRef } from 'react';
import { useWriter } from '../context/WriterContext';
import dynamic from 'next/dynamic';
import { Input } from "@/app/components/ui/input";

const TiptapEditor = dynamic(() => import('@/app/components/TiptapEditor'), {
    ssr: false,
    loading: () => <div className="h-full flex items-center justify-center text-muted-foreground animate-pulse">Cargando editor...</div>
});
import { Button } from "@/app/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/app/components/ui/dropdown-menu";
import {
    Save,
    Upload,
    Download,
    Globe,
    FileText,
    FileType,
    MoreVertical
} from "lucide-react";
import { toast } from "sonner";
import { exportDocument, importDocument } from '@/app/lib/document-utils';

export default function EditorPanel() {
    const { content, setContent, docTitle, setDocTitle, isProcessing, docId, setDocId, notifySaved, sessionId } = useWriter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // AI Actions handler
    const handleAIAction = async (action: string, selectedText: string): Promise<string | null> => {
        try {
            toast.info(`Inteligencia Artificial trabajando: ${action}...`);

            const prompt = `Actúa como un editor experto.
            Tarea: ${action}
            Texto original: "${selectedText}"
            
            Devuelve SOLAMENTE el texto mejorado/reescrito. Sin explicaciones ni etiquetas.`;

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: prompt, history: [] }) // Stateless for specific actions
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            toast.success("Texto mejorado aplicado");
            return data.response; // TiptapEditor consumes this

        } catch (error) {
            console.error("AI Action Error:", error);
            toast.error("Error al mejorar texto con IA");
            return null;
        }
    };

    const [editorVersion, setEditorVersion] = React.useState(0);

    // Force remount when docId changes or explicit refresh needed (Import/New Session)
    const editorKey = `${docId || 'new'}-${sessionId}-${editorVersion}`;

    // Actions
    const handleSave = async () => {
        if (!docTitle) return toast.error("Añade un título antes de guardar");

        const loader = toast.loading("Guardando en la nube...");
        try {
            // Local Backup
            if (typeof window !== 'undefined') {
                localStorage.setItem(`doc-${docTitle}`, content);
            }

            // Cloud Save
            // API handles both Insert and Update via POST based on 'id' presence
            const response = await fetch('/api/documents/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: docId,
                    title: docTitle,
                    content: content,
                    type: 'document'
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Save Server Error:", data);
                throw new Error(data.error || data.details || 'Error desconocido del servidor');
            }

            if (data.id) setDocId(data.id);
            notifySaved(); // Refresh sidebar immediately
            toast.dismiss(loader);
            toast.success("Guardado en Supabase correctamente");

        } catch (e: any) {
            console.error("Save Error:", e);
            toast.dismiss(loader);
            toast.error(`Error al guardar: ${e.message}`);
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            toast.loading("Importando...", { id: 'import-toast' });
            const html = await importDocument(file);
            setContent(html);
            if (!docTitle) setDocTitle(file.name.replace(/\.[^/.]+$/, ""));
            setEditorVersion(v => v + 1); // Force remount to show new content
            toast.success("Documento importado correctamente", { id: 'import-toast' });
        } catch (err: any) {
            console.error("Import Error Full:", err);
            toast.error(`Error al importar: ${err.message || 'Desconocido'}`, { id: 'import-toast' });
        }

        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleExport = async (format: 'pdf' | 'docx' | 'md') => {
        try {
            toast.loading(`Exportando ${format}...`, { id: 'export-toast' });
            await exportDocument(content, docTitle, format);
            toast.success("Descarga iniciada", { id: 'export-toast' });
        } catch (err: any) {
            console.error("Export Error Full:", err);
            toast.error(`Error al exportar: ${err.message}`, { id: 'export-toast' });
        }
    };

    // Listen for Editor Shortcuts
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Save: Ctrl + S (Global Trigger handled via event, but we can double check here if focused?)
            // No, relying on global event is safer to avoid duplicates.

            // Import: Alt + I
            if (e.altKey && e.key === 'i') {
                e.preventDefault();
                handleImportClick();
            }

            // Export: Alt + E (Default to PDF)
            if (e.altKey && e.key === 'e') {
                e.preventDefault();
                handleExport('pdf');
            }

            // Copy: Alt + C
            if (e.altKey && e.key === 'c') {
                e.preventDefault();
                navigator.clipboard.writeText(content);
                toast.success("Contenido copiado al portapapeles");
            }

            // Publish: Alt + P
            if (e.altKey && e.key === 'p') {
                e.preventDefault();
                handlePublish();
            }
        };

        const onSaveTrigger = () => {
            // Only save if there is content or title
            if (content && docTitle) {
                handleSave();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('trigger-save-document', onSaveTrigger);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('trigger-save-document', onSaveTrigger);
        };
    }, [handleSave, handleImportClick, handleExport, handlePublish, content, docTitle]);

    const handlePublish = async () => {
        if (!content || !docTitle) return toast.error("Documento vacío o sin título");

        const loader = toast.loading("Publicando en el Blog...");
        try {
            const response = await fetch('/api/blog/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: docTitle,
                    content_html: content, // Tiptap produces HTML
                    excerpt: content.substring(0, 150) + "...",
                    status: 'published'
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Publish Server Error:", data);
                throw new Error(data.error || data.details || 'Error al publicar');
            }

            toast.dismiss(loader);
            toast.success("¡Publicado en el Blog exitosamente!");

        } catch (e: any) {
            console.error("Publish Error:", e);
            toast.dismiss(loader);
            toast.error(`Error al publicar: ${e.message}`);
        }
    };

    return (
        <div className="h-full flex flex-col bg-transparent">
            {/* Header / Toolbar - Glassy feel handled by parent container, we just need clean layout */}
            <div className="px-6 py-4 flex items-center justify-between gap-6">
                <Input
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="Documento sin título..."
                    className="border-none shadow-none text-2xl font-bold p-0 h-auto bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground/40 text-foreground tracking-tight w-full max-w-md truncate font-sans"
                />

                <div className="flex items-center gap-1 bg-muted/50 dark:bg-muted/20 p-1 rounded-full border border-black/5 dark:border-white/5 backdrop-blur-sm">
                    {/* Save */}
                    <Button variant="ghost" size="icon" onClick={handleSave} title="Guardar" className="rounded-full w-8 h-8 hover:bg-white dark:hover:bg-white/10 hover:shadow-sm transition-all">
                        <Save className="w-4 h-4 text-muted-foreground/80" />
                    </Button>

                    {/* Import */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".txt,.md,.docx"
                        onChange={handleFileChange}
                    />
                    <Button variant="ghost" size="icon" onClick={handleImportClick} title="Importar" className="rounded-full w-8 h-8 hover:bg-white dark:hover:bg-white/10 hover:shadow-sm transition-all">
                        <Upload className="w-4 h-4 text-muted-foreground/80" />
                    </Button>

                    {/* Export Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" title="Exportar" className="rounded-full w-8 h-8 hover:bg-white dark:hover:bg-white/10 hover:shadow-sm transition-all">
                                <Download className="w-4 h-4 text-muted-foreground/80" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border border-border shadow-xl bg-popover text-popover-foreground z-50 min-w-[150px]">
                            <DropdownMenuItem onClick={() => handleExport('pdf')} className="rounded-lg cursor-pointer hover:bg-accent hover:text-accent-foreground py-2">
                                <FileType className="w-4 h-4 mr-2 opacity-70" /> PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport('docx')} className="rounded-lg cursor-pointer hover:bg-accent hover:text-accent-foreground py-2">
                                <FileText className="w-4 h-4 mr-2 opacity-70" /> Word (.docx)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport('md')} className="rounded-lg cursor-pointer hover:bg-accent hover:text-accent-foreground py-2">
                                <FileText className="w-4 h-4 mr-2 opacity-70" /> Markdown
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="w-[1px] h-4 bg-black/10 dark:bg-white/10 mx-1" />

                    {/* Publish */}
                    <Button
                        variant="default"
                        size="sm"
                        onClick={handlePublish}
                        className="rounded-full px-4 h-8 gap-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white border-0 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all active:scale-95"
                    >
                        <Globe className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline font-medium text-xs tracking-wide">Publicar</span>
                    </Button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-hidden relative">
                <div className="absolute inset-0 px-8 py-2 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                    <TiptapEditor
                        key={editorKey}
                        content={content}
                        onChange={setContent}
                        onAIAction={handleAIAction}
                        isProcessing={isProcessing}
                    />
                </div>
            </div>
        </div>
    );
}
