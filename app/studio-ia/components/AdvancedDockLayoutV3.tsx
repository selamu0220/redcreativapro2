'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import { Button } from "@/app/components/ui/button";
import {
    Layout,
    Maximize2,
    FileText,
    Bot,
    Settings,
    ChevronLeft,
    ChevronRight,
    PanelLeftClose,
    PanelLeftOpen,
    Menu,
    LogOut,
    UserCircle
} from "lucide-react";

// LAYOUT V3 ACTIVE - FULL UI RESTORED
const DocumentsPanel = dynamic(() => import('./DocumentsPanel'), { ssr: false, loading: () => <div className="p-4 text-xs text-muted-foreground">Cargando...</div> });
const EditorPanel = dynamic(() => import('./EditorPanelV2'), { ssr: false, loading: () => <div className="p-4 text-xs text-muted-foreground">Cargando Editor...</div> });
const AssistantPanel = dynamic(() => import('./AssistantPanel'), { ssr: false, loading: () => <div className="p-4 text-xs text-muted-foreground">Cargando Asistente...</div> });
const SettingsPanel = dynamic(() => import('./SettingsPanel'), { ssr: false, loading: () => <div className="p-4 text-xs text-muted-foreground">Cargando Ajustes...</div> });

export default function AdvancedDockLayout() {
    const { theme } = useTheme();
    const [activeRightPanel, setActiveRightPanel] = useState<'assistant' | 'settings'>('assistant');

    // Simple persistence for the right panel selection
    useEffect(() => {
        const saved = localStorage.getItem('workbench_right_panel');
        if (saved && (saved === 'assistant' || saved === 'settings')) {
            setActiveRightPanel(saved as any);
        }
    }, []);

    const setRightPanel = (panel: 'assistant' | 'settings') => {
        setActiveRightPanel(panel);
        localStorage.setItem('workbench_right_panel', panel);
    };

    // Global Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Save
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                window.dispatchEvent(new Event('trigger-save-document'));
            }
            // Toggle Panels
            if (e.altKey) {
                if (e.key === '2') {
                    e.preventDefault();
                    setRightPanel('assistant');
                }
                if (e.key === '3') {
                    e.preventDefault();
                    setRightPanel('settings');
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="h-full w-full flex flex-row overflow-hidden bg-background text-foreground">

            {/* LEFT PANEL: Documents (Fixed Width for now) */}
            <div className="w-64 border-r border-border/40 flex flex-col hidden md:flex shrink-0">
                <div className="h-9 px-3 flex items-center border-b bg-muted/40 text-xs font-medium text-muted-foreground">
                    Documentos (Alt+1)
                </div>
                <div className="flex-1 overflow-hidden">
                    <DocumentsPanel />
                </div>
            </div>

            {/* MAIN PANEL: Editor (Flexible) */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#fbfbfb] dark:bg-[#0c0c0c] relative transition-colors shadow-inner">
                <div className="h-9 px-3 flex items-center justify-between border-b bg-background/50 backdrop-blur text-xs font-medium text-muted-foreground sticky top-0 z-10">
                    <span>Editor Principal</span>
                    <span className="text-[10px] opacity-70">Ctrl+Enter para IA</span>
                </div>
                <div className="flex-1 overflow-hidden relative">
                    <EditorPanel />
                </div>
            </div>

            {/* RIGHT PANEL: Tools (Fixed Width) */}
            <div className="w-80 border-l border-border/40 flex flex-col shrink-0 hidden lg:flex bg-background">
                {/* Tabs for Right Panel */}
                <div className="h-9 flex items-center border-b bg-muted/20">
                    <button
                        onClick={() => setRightPanel('assistant')}
                        className={`flex-1 h-full text-xs font-medium transition-colors ${activeRightPanel === 'assistant' ? 'bg-background text-primary border-b-2 border-primary' : 'text-muted-foreground hover:bg-muted/40'}`}
                    >
                        Asistente (Alt+2)
                    </button>
                    <div className="w-[1px] h-4 bg-border/50" />
                    <button
                        onClick={() => setRightPanel('settings')}
                        className={`flex-1 h-full text-xs font-medium transition-colors ${activeRightPanel === 'settings' ? 'bg-background text-primary border-b-2 border-primary' : 'text-muted-foreground hover:bg-muted/40'}`}
                    >
                        Ajustes (Alt+3)
                    </button>
                </div>

                <div className="flex-1 overflow-hidden relative">
                    {activeRightPanel === 'assistant' ? <AssistantPanel /> : <SettingsPanel />}
                </div>
            </div>
        </div>
    );
}
