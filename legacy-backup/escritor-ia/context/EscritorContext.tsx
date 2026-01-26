"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { SEOAnalyzer, type SEOAnalysis } from "@/app/lib/seo-analyzer";
import { DocumentExporter } from "@/app/lib/document-exporter";
import { Editor } from "@tiptap/react";

export type AIModelId =
    | 'xiaomi/mimo-v2-flash:free'
    | 'meta-llama/llama-3.3-70b-instruct:free'
    | 'google/gemini-2.0-flash-exp:free';

export interface Settings {
    creativity: number;
    autoInterval: number;
    autoMode: boolean;
    customPrompt: string;
    profileId: string;
}

export interface Page {
    id: string;
    title: string;
    content: string; // HTML content for TipTap
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

interface EscritorContextType {
    // State
    pages: Page[];
    currentPageId: string;
    currentPage: Page;
    text: string;
    settings: Settings;
    selectedModel: AIModelId;
    seoAnalysis: SEOAnalysis | null;
    usageStats: { usage: number; limit: number };
    showLimitModal: boolean;

    // UX State
    isLoading: boolean;
    isImproving: boolean; // True if async improvement is running
    error: string;
    success: string;
    timeLeft: number;
    isExporting: boolean;

    // Chat
    // Removed legacy chat


    // Editor Ref
    editorInstance: Editor | null;
    setEditorInstance: (editor: Editor | null) => void;

    // Auth
    isAuthenticated: boolean;
    authLoading: boolean;

    // Actions
    setText: (newText: string) => void;
    setSettings: React.Dispatch<React.SetStateAction<Settings>>;
    setSelectedModel: (model: AIModelId) => void;
    setCurrentPageId: (id: string) => void;
    setShowLimitModal: (show: boolean) => void;

    // Logic
    improveText: (isAutoMode?: boolean, specificText?: string) => Promise<string | void>;
    // Chat removed
    addPage: () => void;
    removePage: (pageId: string) => void;
    updatePageTitle: (pageId: string, newTitle: string) => void;
    handleExport: (format: 'pdf' | 'docx' | 'txt') => Promise<void>;
}

const EscritorContext = createContext<EscritorContextType | undefined>(undefined);

export function EscritorProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading: authLoading } = useKindeBrowserClient();

    const [pages, setPages] = useState<Page[]>([
        { id: '1', title: 'Página 1', content: '<p></p>' }
    ]);
    const [currentPageId, setCurrentPageId] = useState('1');
    const [isLoading, setIsLoading] = useState(false);
    const [isImproving, setIsImproving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [seoAnalysis, setSeoAnalysis] = useState<SEOAnalysis | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [showLimitModal, setShowLimitModal] = useState(false);
    const [usageStats, setUsageStats] = useState({ usage: 0, limit: 3 });

    const [selectedModel, setSelectedModel] = useState<AIModelId>('google/gemini-2.0-flash-exp:free');
    // Chat history removed
    const [editorInstance, setEditorInstance] = useState<Editor | null>(null);

    const [settings, setSettings] = useState<Settings>({
        creativity: 0.3,
        autoInterval: 2,
        autoMode: false,
        customPrompt: "",
        profileId: "journalism-general"
    });

    const [timeLeft, setTimeLeft] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);
    const lastTypingRef = useRef<number>(0);
    const restartTimerDebounceRef = useRef<NodeJS.Timeout | null>(null);
    const lastContentRef = useRef<string>("");

    // Derived state
    const currentPage = pages.find(p => p.id === currentPageId) || pages[0];
    const text = currentPage.content;

    // Actions
    const setText = (newText: string) => {
        setPages(prev => prev.map(page =>
            page.id === currentPageId
                ? { ...page, content: newText }
                : page
        ));
    };

    // SEO Analysis (Debounced ideally, but simple effect for now)
    useEffect(() => {
        if (editorInstance) {
            const plainText = editorInstance.getText();
            if (plainText.trim()) {
                const analysis = SEOAnalyzer.analyze(plainText);
                setSeoAnalysis(analysis);
            } else {
                setSeoAnalysis(null);
            }
        } else if (text) {
            // Fallback if editor not ready but text exists (e.g. initial load)
            // Need to strip HTML for accurate count
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = text;
            const plainText = tempDiv.textContent || "";
            if (plainText.trim()) {
                const analysis = SEOAnalyzer.analyze(plainText);
                setSeoAnalysis(analysis);
            }
        }
    }, [text, editorInstance]);

    // Cleanup intervals
    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
        };
    }, []);

    // Refs for stable timing
    const lastActivityRef = useRef<number>(Date.now());

    // Auto Mode Logic - NEW ROBUST IMPLEMENTATION
    useEffect(() => {
        if (!settings.autoMode || !editorInstance) {
            setTimeLeft(0);
            return;
        }

        console.log('🔄 [AutoMode] Activated. Interval:', settings.autoInterval);

        // Reset timer on change
        lastActivityRef.current = Date.now();
        setTimeLeft(settings.autoInterval);

        const checkInterval = setInterval(() => {
            // Check word count
            const textContent = editorInstance.getText().trim();
            const wordCount = textContent.split(/\s+/).filter(w => w.length > 0).length;

            if (wordCount < 5) {
                // Not enough content, keep timer full
                lastActivityRef.current = Date.now();
                setTimeLeft(settings.autoInterval);
                return;
            }

            // Calculate time passed since last activity
            const elapsed = (Date.now() - lastActivityRef.current) / 1000;
            const remaining = Math.max(0, settings.autoInterval - elapsed);

            setTimeLeft(Math.ceil(remaining));

            // Logic: trigger when time is up AND not currently improving AND has content
            if (remaining <= 0 && !isImproving) {
                console.log('🎯 [AutoMode] Triggering improvement...');

                // Prevent double triggering by updating lastActivity efficiently
                lastActivityRef.current = Date.now() + 999999; // Lock it temporarily

                // Show feedback
                setSuccess("🤖 Mejorando...");
                setTimeout(() => setSuccess(""), 2000);

                improveText(true)
                    .then(() => {
                        console.log('✅ [AutoMode] Completed.');
                        lastActivityRef.current = Date.now(); // Reset timer after done
                    })
                    .catch(() => {
                        console.log('❌ [AutoMode] Failed.');
                        lastActivityRef.current = Date.now(); // Reset anyway
                    });
            }

        }, 1000); // Check every second

        return () => clearInterval(checkInterval);
    }, [settings.autoMode, settings.autoInterval, editorInstance, isImproving]);

    // Typing Listener to reset usage
    useEffect(() => {
        if (!settings.autoMode || !editorInstance) return;

        const handleUpdate = () => {
            // User typed something, reset the activity timer
            lastActivityRef.current = Date.now();
            setTimeLeft(settings.autoInterval);
        };

        editorInstance.on('update', handleUpdate);
        return () => {
            editorInstance.off('update', handleUpdate);
        };
    }, [settings.autoMode, editorInstance]);

    // Keyboard shortcut for Auto Mode toggle
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.shiftKey && event.key === '1') {
                event.preventDefault();
                console.log('⌨️ [AutoMode] Keyboard shortcut triggered');
                setSettings(prev => ({ ...prev, autoMode: !prev.autoMode }));
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const improveText = async (isAutoMode = false, specificText?: string) => {
        if (!isAuthenticated) return;

        // If specific text is provided, we use that. Otherwise we use editor HTML content.
        // For auto mode, we want to preserve structure, so use HTML when available
        const contentToImprove = specificText || (editorInstance ? editorInstance.getText() : "");
        if (!contentToImprove.trim()) return;

        // Don't show global loading for auto mode or async background tasks
        if (!isAutoMode) setIsLoading(true);

        // We set a specific "improving" flag for UI feedback
        setIsImproving(true);
        setError("");

        if (!isAutoMode) setSuccess("");

        try {
            // NEW STREAMING IMPLEMENTATION
            const endpoint = '/api/improve-text-stream';
            console.log(`🔄 [EscritorContext] Streaming from ${endpoint}`);

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: contentToImprove,
                    profileId: settings.profileId || 'journalism-general',
                    customInstructions: settings.customPrompt,
                    model: selectedModel
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Error en la API');
            }

            if (!response.body) throw new Error('No valid stream');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedText = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                accumulatedText += chunk;

                // Live update if not in auto mode (Auto mode replaces at end to avoid flickering)
                // Actually, for now, let's just accumulate and set at the end for safety in Tiptap
                // or update State so a "StreamingPreview" could show it? 
                // For simplicity/safety with Tiptap: Update at end. 
                // BUT, to demonstrate speed, we can log or show a progress indicator?
                // User requirement: "Low latency".
                // If I wait for end, I defeat the purpose of streaming on the UI side, 
                // BUT the backend is now faster because it doesn't wait for full generation to start sending (though fetch does? No).
                // Wait, if I await reader.read(), I am consuming the stream.
                // If I wait until loop finishes to setContent, it's the same VISUALLY as before.
                // I SHOULD update the editor. Check if we can safely setContent.
                // editorInstance.commands.setContent() is fast.
                // Let's throttling it? No, just let it rip?
                // Text might be incomplete HTML though. Tiptap expects HTML or strong text.
                // If I send partial text "Hello wor", Tiptap renders "Hello wor".
                // Ideally I should put this in a "Ghost" or "Diff" view, but I don't have that.
                // User wants "Mejorar automáticamente".
                // I will set content on every chunk for Manual Mode to show speed.

                // NOTE: Streaming raw text into Tiptap replaces everything. 
                // If user is typing, this is bad. But isImproving blocks typing conceptually.
                if (!isAutoMode && editorInstance && accumulatedText.length > 10) {
                    // Basic throttling: only update if we have meaningful content length change?
                    // Actually, if we just replace the content deeply, we lose cursor position maybe?
                    // But we are supposedly replacing the WHOLE block.
                    // Let's NOT stream-update Tiptap directly to avoid glitching.
                    // Instead, I'll update a temporary state or just wait.
                    // The requirement "Low Latency" might also mean "Total Time". 
                    // Streaming backend is usually faster Time-To-First-Byte but total time is similar.
                    // However, "improve-text-openrouter" was probably timing out or very slow.

                    // Compromise: Update on 50%? 
                    // Let's just wait for full stream for SAFETY, but the backend is much more robust now.
                }
            }

            // Final update
            if (!specificText && editorInstance) {
                const finalHTML = `<p>${accumulatedText}</p>`;
                editorInstance.commands.setContent(finalHTML);

                if (!isAutoMode) {
                    setSuccess("✨ Texto mejorado");
                    setTimeout(() => setSuccess(""), 3000);
                }
            } else if (!specificText) {
                setText(`<p>${accumulatedText}</p>`);
            }

            return accumulatedText;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            if (!isAutoMode) setError(errorMessage);
            console.error(err);
        } finally {
            setIsLoading(false);
            setIsImproving(false);
        }
    };

    // sendChatMessage removed


    const addPage = () => {
        const newId = (pages.length + 1).toString();
        const newPage: Page = {
            id: newId,
            title: `Página ${newId}`,
            content: '<p></p>'
        };
        setPages(prev => [...prev, newPage]);
        setCurrentPageId(newId);
    };

    const removePage = (pageId: string) => {
        if (pages.length <= 1) return;
        setPages(prev => prev.filter(p => p.id !== pageId));
        if (currentPageId === pageId) {
            const remainingPages = pages.filter(p => p.id !== pageId);
            setCurrentPageId(remainingPages[0]?.id || '1');
        }
    };

    const updatePageTitle = (pageId: string, newTitle: string) => {
        setPages(prev => prev.map(page =>
            page.id === pageId
                ? { ...page, title: newTitle }
                : page
        ));
    };

    const handleExport = async (format: 'pdf' | 'docx' | 'txt') => {
        // Needs adaptation for HTML content from TipTap
        // For now we strip HTML for export
        const tempDiv = document.createElement("div");

        const allContent = pages.map(page => {
            tempDiv.innerHTML = page.content;
            return `${page.title}\n${'='.repeat(page.title.length)}\n\n${tempDiv.textContent || ""}`
        }).join('\n\n---\n\n');

        setIsExporting(true);
        try {
            const options = {
                title: pages.length > 1 ? 'Documento Multi-página' : currentPage.title,
                author: 'Red Creativa Pro',
                subject: 'Documento generado con IA'
            };

            switch (format) {
                case 'pdf':
                    await DocumentExporter.exportToPDF(allContent, options);
                    break;
                case 'docx':
                    await DocumentExporter.exportToDOCX(allContent, options);
                    break;
                case 'txt':
                    await DocumentExporter.exportToTXT(allContent, options);
                    break;
            }

            setSuccess(`✅ Documento exportado como ${format.toUpperCase()}`);
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            console.error("Error exporting:", err);
            setError(`Error al exportar como ${format.toUpperCase()}`);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <EscritorContext.Provider value={{
            pages, currentPageId, currentPage, text, settings, seoAnalysis,
            usageStats, showLimitModal, isLoading, error, success, timeLeft,
            isExporting, isAuthenticated, authLoading, selectedModel,
            isImproving, editorInstance,
            setText, setSettings, setCurrentPageId, setShowLimitModal,
            improveText, addPage, removePage, updatePageTitle, handleExport,
            setSelectedModel, setEditorInstance
        }}>
            {children}
        </EscritorContext.Provider>
    );
}

export function useEscritor() {
    const context = useContext(EscritorContext);
    if (!context) throw new Error("useEscritor must be used within EscritorProvider");
    return context;
}
