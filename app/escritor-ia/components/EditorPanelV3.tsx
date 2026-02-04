'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useWriter } from '../context/WriterContext';
import { useAIStream } from '../hooks/useAIStream';
import dynamic from 'next/dynamic';
import { Input } from "@/app/components/ui/input";
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
    Maximize2,
    Minimize2
} from "lucide-react";
import { toast } from "sonner";
import { exportDocument, importDocument } from '@/app/lib/document-utils';
import { useSimpleTranslations } from '@/app/lib/simple-translations'; // Added import

import { EditorSkeleton } from "@/app/components/ui/custom-skeletons";
import { useShortcuts } from '@/app/hooks/useShortcuts';
import { ShortcutsDialog } from '@/app/components/ui/ShortcutsDialog';

// Import Enhanced Editor directly
const EnhancedAIWriterEditor = dynamic(() => import('./AIWriterEditor'), {
    ssr: false,
    loading: () => <EditorSkeleton />
});

import { motion, AnimatePresence } from "framer-motion";
import { PublishOptionsDialog, PublishMetadata } from './PublishOptionsDialog';
import { AIDiffModal } from './AIDiffModal';
import { TranslationErrorBoundary } from '@/app/components/TranslationErrorBoundary';

export default function EditorPanelV3() {
    const {
        content, setContent,
        docTitle, setDocTitle,
        isProcessing, setIsProcessing,
        setDocId, docId,
        notifySaved, sessionId,
        zenMode, setZenMode,
        dailyGoal, updateTrigger,
        emailModeEnabled,
        emailRecipient,
        emailSubject
    } = useWriter();
    const { t, currentLang } = useSimpleTranslations(); // Added hook
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [editorVersion, setEditorVersion] = useState(0);
    const [showSettings, setShowSettings] = useState(false); // Kept for future use or legacy
    const [showPublishDialog, setShowPublishDialog] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    // AI Diff / Streaming State
    const [showDiffModal, setShowDiffModal] = useState(false);
    const [streamedContent, setStreamedContent] = useState("");
    const [originalSnapshot, setOriginalSnapshot] = useState("");

    // Calc Words
    const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;
    const progress = Math.min((wordCount / (dailyGoal || 500)) * 100, 100);

    // AI IMPROVE HANDLER (Refactored with useAIStream)
    const { generate, isProcessing: isAIProcessing } = useAIStream();

    // Sync local processing state with global context
    useEffect(() => {
        setIsProcessing(isAIProcessing);
    }, [isAIProcessing, setIsProcessing]);

    const handleImprove = async (action: string, selectedText: string, onStream?: (chunk: string) => void): Promise<string | null> => {
        let instruction = "";
        let tone: 'professional' | 'casual' | 'persuasive' | 'academic' = 'professional';

        switch (action) {
            case 'fix': instruction = "Corige la gramática y ortografía."; break;
            case 'shorten': instruction = "Resume este texto (20-30% más corto)."; break;
            case 'expand': instruction = "Expande con más detalles."; break;
            case 'tone_professional':
                instruction = "Reescribe con tono profesional.";
                tone = 'professional';
                break;
            case 'tone_casual':
                instruction = "Reescribe con tono casual.";
                tone = 'casual';
                break;
            case 'tone_persuasive':
                instruction = "Reescribe con tono persuasivo.";
                tone = 'persuasive';
                break;
            case 'improve': default: instruction = "Mejora la fluidez y claridad."; break;
        }

        const targetText = selectedText || content;
        const isGlobal = !selectedText;

        // --- GLOBAL IMPROVE WITH DIFF MODAL ---
        if (isGlobal && !selectedText) {
            // 1. Capture State
            setOriginalSnapshot(content);
            setStreamedContent("");
            setShowDiffModal(true);

            // 2. Prepare Prompt (STRICT MODE)
            const finalInstruction = `${instruction} (Apply to the whole text). Maintain structure/markdown.`;
            const prompt = `
STRICT SYSTEM INSTRUCTION:
1. You are a direct text-processing engine, NOT a chat assistant.
2. Output ONLY the improved version of the text.
3. DO NOT include "Here is the text", "Updated:", or any conversational filler.
4. DO NOT use :::UPDATE_DOCUMENT::: tags. Just the raw text.
5. Maintain the original markdown structure/formatting perfectly.

TASK:
${finalInstruction}

INPUT TEXT:
"${targetText}"
`;
            const context = `Document Title: ${docTitle}. \nLength: ${targetText.length} chars.`;

            // 3. Generate with internal streaming handler for the modal
            // IMPORTANT: We do NOT await the result here for the caller to mistakenly use.
            // We let the modal handle the acceptance.

            // EMAIL MODE INJECTION (Global)
            let finalContext = context;
            if (emailModeEnabled) {
                finalContext += `\n\n[EMAIL MODE ACTIVE]\nTarget Recipient: ${emailRecipient || "(No specific recipient)"}\nSubject Line: ${emailSubject || "(No specific subject)"}\nFORMAT RULES: Start with 'Subject: ${emailSubject}' if not present. Use standard email greeting and sign-off.`;
            }

            generate(prompt, 'gpt-4o-mini', {
                context: finalContext,
                tone: tone,
                onStream: (chunk) => {
                    setStreamedContent(prev => prev + chunk);
                },
            });

            return null; // Return null to prevent immediate overwrite in parent
        }

        // --- SELECTION (INLINE) IMPROVE ---

        // Map lang code to name for AI
        const langMap: Record<string, string> = {
            'es': 'Spanish', 'en': 'English', 'fr': 'French',
            'de': 'German', 'it': 'Italian', 'pt': 'Portuguese'
        };
        const currentLangName = langMap[currentLang] || 'Spanish';

        // For inline, we trust the TiptapEditor's stream handling (passed via onStream)
        const prompt = `
STRICT SYSTEM INSTRUCTION:
1. Output ONLY the improved version of the text.
2. NO conversational filler.
3. NO :::UPDATE_DOCUMENT::: tags.
4. Output Language: ${currentLangName}
5. Maintain original language if it differs from requested, unless explicitly asked to translate.

TASK:
${instruction}

INPUT TEXT:
"${targetText}"
`;
        // EMAIL MODE INJECTION (Inline)
        let finalContext = `Document Title: ${docTitle}. \nLength: ${targetText.length} chars.`;
        if (emailModeEnabled) {
            finalContext += `\n\n[EMAIL MODE ACTIVE]\nrecipient: ${emailRecipient}\nsubject: ${emailSubject}\nINSTRUCTION: Draft or rewrite this as an email in ${currentLangName}.`;
        }

        return await generate(prompt, 'gpt-4o-mini', {
            context: finalContext,
            tone: tone,
            language: currentLangName,
            onStream: onStream
        });
    };

    // SAVE HANDLER
    const handleSave = useCallback(async () => {
        if (!docTitle) return toast.error(t('writer_error_no_title'));

        const loader = toast.loading(t('writer_saving'));
        try {
            // Local Backup
            if (typeof window !== 'undefined') {
                localStorage.setItem(`doc-${docTitle}`, content);
            }

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
                if (response.status === 401) {
                    toast.error("Sesión expirada");
                    return;
                }
                throw new Error(data.error || 'Error al guardar');
            }

            if (data.id) setDocId(data.id);
            notifySaved();
            toast.dismiss(loader);
            toast.success(t('writer_saved'));

        } catch (e: any) {
            console.error("Save Error:", e);
            toast.dismiss(loader);
            toast.error(`Error: ${e.message}`);
        }
    }, [docTitle, content, docId, setDocId, notifySaved]);

    // IMPORT/EXPORT HANDLERS
    const handleImportClick = () => fileInputRef.current?.click();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            toast.loading(t('writer_importing'));
            const html = await importDocument(file);
            setContent(html);
            if (!docTitle) setDocTitle(file.name.replace(/\.[^/.]+$/, ""));
            setEditorVersion(v => v + 1);
            toast.success(t('writer_imported_success'));
        } catch (err: any) {
            toast.error(t('writer_import_error'));
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleExport = async (format: 'pdf' | 'docx' | 'md') => {
        try {
            toast.loading(t('writer_exporting').replace('{format}', format));
            await exportDocument(content, docTitle, format);
            toast.success(t('writer_export_started'));
        } catch (err: any) {
            toast.error(t('writer_export_error'));
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        toast.success(t('writer_copied'));
    };

    const performPublish = async (metadata?: PublishMetadata) => {
        if (!docTitle) return toast.error(t('writer_publish_missing_title'));

        // If metadata is missing, open dialog instead of publishing immediately
        if (!metadata) {
            setShowPublishDialog(true);
            return;
        }

        if (isPublishing) return;

        setIsPublishing(true);
        setShowPublishDialog(false); // Close dialog

        const promise = (async () => {
            const payload = {
                title: docTitle,
                content_html: content,
                status: 'published',
                ...metadata // Spread metadata (slug, image, category, tags, excerpt)
            };

            const response = await fetch('/api/blog/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.error || 'Error al publicar');
            }

            return await response.json();
        })();

        toast.promise(promise, {
            loading: metadata.status === 'draft' ? t('writer_saving_draft') : t('writer_publishing'),
            success: (data: any) => {
                const action = metadata.status === 'draft' ? t('writer_success_saved') : t('writer_success_published');
                return action.replace('{title}', data.post.title);
            },
            error: (err: any) => `Error: ${err.message}`,
            action: {
                label: 'Ver',
                onClick: () => window.open('/blog', '_blank')
            }
        });

        promise.finally(() => setIsPublishing(false));
    };

    // REFS for Shortcuts (Avoid re-binding listener)
    const stateRef = useRef({ content, docTitle, docId });
    useEffect(() => {
        stateRef.current = { content, docTitle, docId };
    }, [content, docTitle, docId]);

    // KEYBOARD SHORTCUTS (Managed by Hook)
    useShortcuts({
        onSave: handleSave,
        onImport: handleImportClick,
        onExport: () => handleExport('pdf'),
        onCopy: () => {
            navigator.clipboard.writeText(content);
            toast.success(t('writer_copied'));
        },
        onPublish: () => performPublish(),
        onZenToggle: () => setZenMode(!zenMode)
    });

    return (
        <div className="h-full flex flex-col relative bg-background">
            {/* DIFF MODAL */}
            <AIDiffModal
                isOpen={showDiffModal}
                onClose={() => setShowDiffModal(false)}
                originalContent={originalSnapshot}
                streamingContent={streamedContent}
                isStreaming={isProcessing}
                onAccept={() => {
                    setContent(streamedContent);
                    setShowDiffModal(false);
                    toast.success(t('writer_improved_success'));
                }}
            />

            {/* Hidden Inputs */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".txt,.md,.json,.csv,.docx,.pdf"
            />

            {/* HEADER */}
            <header className="h-14 flex items-center justify-between px-4 border-b border-border/40 bg-background/60 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-3 flex-1">
                    <div className="hidden md:flex flex-col">
                        <Input
                            value={docTitle}
                            onChange={(e) => setDocTitle(e.target.value)}
                            placeholder={t('writer_dock_untitled')}
                            className="h-7 w-64 border-none shadow-none bg-transparent px-0 font-medium text-sm focus-visible:ring-0 placeholder:text-muted-foreground/50 truncate"
                        />
                        <div className="hidden md:flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span>{wordCount} {t('words')}</span>
                            <span>•</span>
                            <span className={sessionId ? "text-green-500" : ""}>{sessionId ? t('writer_saved') : t('writer_unsaved')}</span>
                        </div>
                    </div>
                </div>

                {/* TOOLBAR */}
                <div className="flex items-center gap-1.5">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted" onClick={handleSave}>
                        <Save className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                                <FileText className="w-4 h-4 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-background border-border">
                            <DropdownMenuItem onClick={handleImportClick}><Upload className="w-3.5 h-3.5 mr-2" /> {t('writer_import')}</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport('pdf')}><Download className="w-3.5 h-3.5 mr-2" /> PDF</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport('docx')}><FileType className="w-3.5 h-3.5 mr-2" /> DOCX</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport('md')}><FileText className="w-3.5 h-3.5 mr-2" /> Markdown</DropdownMenuItem>
                            <DropdownMenuItem onClick={handleCopy}><FileText className="w-3.5 h-3.5 mr-2" /> {t('writer_copy')}</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 gap-1.5 text-xs font-medium px-3 rounded-full transition-all ${zenMode ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
                        onClick={() => setZenMode(!zenMode)}
                    >
                        {zenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">{t('writer_zen_mode')}</span>
                    </Button>

                    <Button
                        size="sm"
                        className="h-8 gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm rounded-full px-4"
                        onClick={() => performPublish()} // Opens dialog if no metadata
                    >
                        <Globe className="w-3.5 h-3.5" />
                        {t('publish_now')}
                    </Button>
                </div>
            </header>


            {/* EDITOR AREA */}
            <div className="flex-1 relative overflow-hidden flex flex-col">
                {/* Progress Bar */}
                {dailyGoal > 0 && (
                    <div className="h-0.5 w-full bg-muted/30">
                        <div className="h-full bg-primary/50 transition-all duration-1000" style={{ width: `${progress}%` }} />
                    </div>
                )}

                {/* AI Update Flash Animation */}
                <AnimatePresence>
                    {updateTrigger > 0 && (
                        <motion.div
                            key={updateTrigger}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 0.4, 0] }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="absolute inset-0 pointer-events-none z-50 bg-green-500/20 mix-blend-overlay"
                        />
                    )}
                </AnimatePresence>

                <TranslationErrorBoundary>
                    <EnhancedAIWriterEditor
                        key={editorVersion}
                        // ...
                        content={content}
                        onContentChange={setContent}
                        onImprove={async () => {
                            const result = await handleImprove("improve", "");
                            if (result) {
                                // SAFETY CHECK: Prevent catastrophic overwrite
                                if (content.length > 100 && result.length < 50) {
                                    toast.error(t('writer_safety_error'));
                                    return;
                                }
                                setContent(result);
                                toast.success(t('writer_improved_success'));
                            }
                        }}
                        onAIAction={handleImprove}
                        onSave={handleSave}
                        onCopy={handleCopy}
                        onOpenSettings={() => setShowSettings(true)}
                        isProcessing={isProcessing}
                        isSaving={false}
                        disabled={false}
                        usageInfo={{
                            usage: content.length,
                            limit: 10000,
                            isPremium: true
                        }}
                    />
                </TranslationErrorBoundary>
            </div>

            {/* DIALOGS */}
            <PublishOptionsDialog
                isOpen={showPublishDialog}
                onOpenChange={setShowPublishDialog}
                onPublish={performPublish}
                isPublishing={isPublishing}
                docTitle={docTitle}
            />
            <ShortcutsDialog />
        </div>
    );
}
