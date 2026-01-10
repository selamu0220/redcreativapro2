"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { SEOAnalyzer, type SEOAnalysis } from "@/app/lib/seo-analyzer";
import { DocumentExporter } from "@/app/lib/document-exporter";
import { Editor } from "@tiptap/react";

export type AIModelId =
    | 'gemini-2.5-flash'
    | 'gemini-1.5-pro'
    | 'gemini-1.5-flash'
    | 'minimax-m2.1';

export interface Settings {
    creativity: number;
    autoInterval: number;
    autoMode: boolean;
    customPrompt: string;
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
    chatHistory: ChatMessage[];

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
    sendChatMessage: (message: string) => Promise<void>;
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

    const [selectedModel, setSelectedModel] = useState<AIModelId>('gemini-2.5-flash');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [editorInstance, setEditorInstance] = useState<Editor | null>(null);

    const [settings, setSettings] = useState<Settings>({
        creativity: 0.3,
        autoInterval: 2,
        autoMode: false,
        customPrompt: "Mejora este texto corrigiendo gramática, ortografía y fluidez. Mantén el idioma original y el tono."
    });

    const [timeLeft, setTimeLeft] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);
    const lastTypingRef = useRef<number>(0);
    const restartTimerDebounceRef = useRef<NodeJS.Timeout | null>(null);

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

    // Auto Mode logic - SIMPLIFIED VERSION with extreme logging
    useEffect(() => {
        console.log('🔄 [AutoMode useEffect] Triggered', {
            autoMode: settings.autoMode,
            interval: settings.autoInterval,
            hasEditor: !!editorInstance,
            pageId: currentPageId
        });

        // Cleanup function
        const cleanup = () => {
            console.log('🧹 [AutoMode] Cleaning up timers');
            if (countdownRef.current) {
                clearInterval(countdownRef.current);
                countdownRef.current = null;
            }
            if (restartTimerDebounceRef.current) {
                clearTimeout(restartTimerDebounceRef.current);
                restartTimerDebounceRef.current = null;
            }
            setTimeLeft(0);
        };

        // If auto mode is OFF, cleanup and return
        if (!settings.autoMode) {
            console.log('⏸️ [AutoMode] Auto mode is OFF');
            cleanup();
            return cleanup;
        }

        // Check if we have enough content
        const wordCount = editorInstance ? editorInstance.getText().trim().split(/\s+/).filter(w => w.length > 0).length : 0;
        console.log('📊 [AutoMode] Word count:', wordCount);

        if (wordCount < 5) {
            console.log('⚠️ [AutoMode] Not enough content (need 5+ words)');
            cleanup();
            return cleanup;
        }

        // Start the timer
        console.log(`▶️ [AutoMode] Starting timer: ${settings.autoInterval}s`);
        setTimeLeft(settings.autoInterval);

        let currentTime = settings.autoInterval;

        countdownRef.current = setInterval(() => {
            currentTime--;
            console.log(`⏱️ [AutoMode] Countdown: ${currentTime}s`);
            setTimeLeft(currentTime);

            if (currentTime <= 0) {
                console.log('🎯 [AutoMode] Timer reached 0! Triggering improvement...');

                // Call improve with auto mode flag
                improveText(true).then(() => {
                    console.log('✅ [AutoMode] Improvement completed');
                }).catch(err => {
                    console.error('❌ [AutoMode] Improvement failed:', err);
                });

                // Reset timer
                currentTime = settings.autoInterval;
                setTimeLeft(currentTime);
            }
        }, 1000);

        // Cleanup on unmount or settings change
        return cleanup;
    }, [settings.autoMode, settings.autoInterval, currentPageId, editorInstance]);
    // Note: We include editorInstance to re-trigger when editor becomes available

    // Separate effect: Debounce timer restart when user types
    useEffect(() => {
        if (!settings.autoMode) return;
        if (!editorInstance) return;

        const wordCount = editorInstance.getText().trim().split(/\s+/).filter(w => w.length > 0).length;
        if (wordCount < 5) return;

        console.log('⌨️ [AutoMode] User typing detected, will restart timer in 1s...');

        // Clear existing debounce
        if (restartTimerDebounceRef.current) {
            clearTimeout(restartTimerDebounceRef.current);
        }

        // Restart timer after 1 second of no typing
        restartTimerDebounceRef.current = setTimeout(() => {
            console.log('🔄 [AutoMode] User stopped typing, restarting by toggling auto mode');
            // Force restart by toggling settings (triggering the main useEffect)
            setSettings(prev => ({ ...prev, autoMode: false }));
            setTimeout(() => {
                setSettings(prev => ({ ...prev, autoMode: true }));
            }, 50);
        }, 1000);

    }, [text, settings.autoMode, editorInstance]);

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

        // If specific text is provided, we use that. Otherwise we use editor content.
        const contentToImprove = specificText || (editorInstance ? editorInstance.getText() : "");
        if (!contentToImprove.trim()) return;

        // Don't show global loading for auto mode or async background tasks
        if (!isAutoMode) setIsLoading(true);

        // We set a specific "improving" flag for UI feedback
        setIsImproving(true);
        setError("");

        if (!isAutoMode) setSuccess("");

        try {
            // Determinar endpoint según el modelo seleccionado
            const endpoint = selectedModel === 'minimax-m2.1'
                ? '/api/improve-text-openrouter'
                : '/api/improve-text-ai-sdk';

            console.log(`🔄 [EscritorContext] Routing to ${endpoint} for model ${selectedModel}`);

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: contentToImprove,
                    creativity: settings.creativity,
                    customPrompt: settings.customPrompt,
                    model: selectedModel
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error en la API');
            }

            // Verify improvedContent exists before trying to use it
            if (!data.improvedContent || typeof data.improvedContent !== 'string') {
                throw new Error('El API no devolvió contenido mejorado');
            }

            if (text.trim().toLowerCase() === data.improvedContent.trim().toLowerCase()) {
                // No change
                return;
            }

            // Update text in editor (both manual and auto mode)
            if (!specificText) {
                // Full text replacement
                setText(`<p>${data.improvedContent}</p>`);

                if (!isAutoMode) {
                    setSuccess("✨ Texto mejorado exitosamente");
                    setTimeout(() => setSuccess(""), 3000);
                } else {
                    console.log('✨ [AutoMode] Text improved automatically');
                }
            }

            return data.improvedContent;

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            if (!isAutoMode) setError(errorMessage);
        } finally {
            setIsLoading(false);
            setIsImproving(false);
        }
    };

    const sendChatMessage = async (message: string) => {
        // Implementation for chat
        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: message,
            timestamp: Date.now()
        };
        setChatHistory(prev => [...prev, newMessage]);

        try {
            setIsLoading(true);
            // Mocking response for now or calling a new endpoint
            // We can reuse the improve-text endpoint with a specific prompt or create a new chat endpoint.
            // For simplicity let's assume we create a generic 'chat' endpoint later.

            // TODO: Implement actual chat API call
            const response = await fetch('/api/improve-text-ai-sdk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: message,
                    creativity: 0.7,
                    customPrompt: "Eres un asistente de redacción útil. Responde a la pregunta del usuario.",
                    model: selectedModel
                })
            });
            const data = await response.json();

            const botMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.improvedContent || "No pude generar una respuesta.",
                timestamp: Date.now()
            };
            setChatHistory(prev => [...prev, botMessage]);

        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

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
            isExporting, isAuthenticated, authLoading, selectedModel, chatHistory,
            isImproving, editorInstance,
            setText, setSettings, setCurrentPageId, setShowLimitModal,
            improveText, addPage, removePage, updatePageTitle, handleExport,
            setSelectedModel, sendChatMessage, setEditorInstance
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
