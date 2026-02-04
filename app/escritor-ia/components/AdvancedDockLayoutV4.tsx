'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { Sheet, SheetContent, SheetTrigger } from "@/app/components/ui/sheet";
import { FolderOpen, Settings2, Menu } from "lucide-react";
// Removed legacy BrutalAnimations import as we use direct motion now

// IMPORT PANELS
const DocumentsPanel = dynamic(() => import('./DocumentsPanel'), { ssr: false });
const EditorPanel = dynamic(() => import('./EditorPanelV3'), { ssr: false });
const AssistantPanel = dynamic(() => import('./AssistantPanel'), { ssr: false });
const SettingsPanel = dynamic(() => import('./SettingsPanel'), { ssr: false });

import { useWriter } from '../context/WriterContext';
import { useSimpleTranslations } from '@/app/lib/simple-translations'; // Added hook

export default function AdvancedDockLayoutV4() {
    const [activeRightPanel, setActiveRightPanel] = useState<'assistant' | 'settings'>('assistant');
    const { zenMode } = useWriter();
    const { t } = useSimpleTranslations(); // Initialized hook

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

    const mouseX = useMotionValue(Infinity);
    const [isMobileLeftOpen, setIsMobileLeftOpen] = useState(false);
    const [isMobileRightOpen, setIsMobileRightOpen] = useState(false);

    return (
        <div className="h-full w-full bg-background text-foreground overflow-hidden relative group/layout flex flex-col">
            {/* MOBILE HEADER */}
            <div className="md:hidden h-14 border-b border-border/40 flex items-center justify-between px-4 bg-background/80 backdrop-blur-md sticky top-0 z-50">
                {/* Left Sheet: Documents */}
                <Sheet open={isMobileLeftOpen} onOpenChange={setIsMobileLeftOpen}>
                    <SheetTrigger asChild>
                        <button className="p-2 -ml-2 text-muted-foreground hover:text-foreground">
                            <FolderOpen className="w-5 h-5" />
                        </button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[85%] sm:w-[350px] p-0">
                        <div className="h-full flex flex-col">
                            <div className="h-14 flex items-center px-4 border-b font-semibold">{t('writer_dock_documents')}</div>
                            <div className="flex-1 overflow-hidden">
                                <DocumentsPanel />
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>

                <span className="font-semibold text-sm">{t('writer_dock_writer_title')}</span>

                {/* Right Sheet: Tools */}
                <Sheet open={isMobileRightOpen} onOpenChange={setIsMobileRightOpen}>
                    <SheetTrigger asChild>
                        <button className="p-2 -mr-2 text-muted-foreground hover:text-foreground">
                            <Settings2 className="w-5 h-5" />
                        </button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[85%] sm:w-[350px] p-0">
                        <div className="h-full flex flex-col">
                            <div className="h-14 flex items-center px-4 border-b font-semibold gap-4">
                                <button
                                    onClick={() => setRightPanel('assistant')}
                                    className={`text-sm ${activeRightPanel === 'assistant' ? 'text-primary' : 'text-muted-foreground'}`}
                                >
                                    {t('writer_dock_assistant')}
                                </button>
                                <button
                                    onClick={() => setRightPanel('settings')}
                                    className={`text-sm ${activeRightPanel === 'settings' ? 'text-primary' : 'text-muted-foreground'}`}
                                >
                                    {t('writer_dock_settings')}
                                </button>
                            </div>
                            <div className="flex-1 overflow-hidden bg-background">
                                {activeRightPanel === 'assistant' ? <AssistantPanel /> : <SettingsPanel />}
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            <ResizablePanelGroup direction="horizontal" className="flex-1 w-full relative">

                {/* LEFT PANEL: Documents */}
                <AnimatePresence mode="popLayout">
                    {!zenMode && (
                        <>
                            <ResizablePanel
                                defaultSize={20}
                                minSize={15}
                                maxSize={30}
                                className="hidden md:flex flex-col border-r border-border/40 group bg-background/50 backdrop-blur-sm z-10"
                            >
                                <motion.div
                                    className="flex flex-col h-full w-full"
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] } }}
                                    exit={{ opacity: 0, x: -50, transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] } }}
                                >
                                    <div className="h-10 px-4 flex items-center border-b border-border/40 bg-background/40 text-xs font-semibold text-muted-foreground shrink-0 backdrop-blur-md sticky top-0 z-10">
                                        <span className="opacity-70 group-hover:opacity-100 transition-opacity">{t('writer_dock_documents')}</span>
                                        <span className="ml-auto text-[10px] bg-primary/5 text-primary/60 px-1.5 py-0.5 rounded border border-primary/10">Alt+1</span>
                                    </div>
                                    <div className="flex-1 overflow-hidden h-full">
                                        <DocumentsPanel />
                                    </div>
                                </motion.div>
                            </ResizablePanel>
                            <ResizableHandle className="bg-border/20 hover:bg-primary/50 transition-all w-[1px] data-[resize-handle-active]:bg-primary" />
                        </>
                    )}
                </AnimatePresence>

                {/* MAIN PANEL: Editor */}
                <ResizablePanel defaultSize={zenMode ? 100 : 55} minSize={30} className="relative z-0 transition-all duration-500 ease-[0.32,0.72,0,1]">
                    <div className={`h-full flex flex-col relative transition-all duration-700 ease-in-out ${zenMode ? 'bg-background' : 'bg-[#fafafa] dark:bg-[#09090b]'}`}>

                        {/* Status Bar / Breadcrumb (Hidden in Zen) */}
                        <AnimatePresence>
                            {!zenMode && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="h-10 px-4 flex items-center justify-between border-b border-border/30 bg-background/60 backdrop-blur-xl text-xs font-medium text-muted-foreground sticky top-0 z-10 shrink-0"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-400/80 shadow-sm" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80 shadow-sm" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-400/80 shadow-sm" />
                                        </div>
                                        <div className="h-4 w-px bg-border/40 mx-1" />
                                        <span className="text-foreground/80">{t('writer_dock_untitled')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer border border-primary/10">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                            <span className="font-semibold text-primary/80">{t('writer_dock_ai_ready')}</span>
                                        </span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div
                            className={`flex-1 overflow-hidden relative ${zenMode ? 'mx-auto w-full max-w-5xl' : ''} transition-all duration-500 notranslate`}
                            translate="no"
                        >
                            <EditorPanel />
                        </div>

                        {/* FLOATING DOCK (Visible on Hover in Zen Mode, or Sticky at bottom) */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                            <motion.div
                                className="flex items-end gap-2 px-3 pb-2 pt-2 rounded-2xl bg-black/80 backdrop-blur-2xl border border-white/10 shadow-2xl pointer-events-auto origin-bottom"
                                initial={{ y: 100, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                onMouseMove={(e) => mouseX.set(e.pageX)}
                                onMouseLeave={() => mouseX.set(Infinity)}
                            >
                                {/* Dock Icons would go here with useTransform(mouseX, ...) magnification logic */}
                                {/* Placeholder for visual intent */}
                                <div className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 transition-all border border-white/5" />
                                <div className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 transition-all border border-white/5" />
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-purple-500/20 border border-white/20" /> {/* Active App */}
                                <div className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 transition-all border border-white/5" />
                            </motion.div>
                        </div>
                    </div>
                </ResizablePanel>

                {/* RIGHT PANEL: Tools */}
                <AnimatePresence mode="popLayout">
                    {!zenMode && (
                        <>
                            <ResizableHandle className="bg-border/20 hover:bg-primary/50 transition-all w-[1px] data-[resize-handle-active]:bg-primary" />
                            <ResizablePanel
                                defaultSize={25}
                                minSize={20}
                                maxSize={40}
                                className="hidden lg:flex flex-col border-l border-border/40 bg-background/50 backdrop-blur-sm z-10"
                            >
                                <motion.div
                                    className="flex flex-col h-full w-full"
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] } }}
                                    exit={{ opacity: 0, x: 50, transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] } }}
                                >
                                    <div className="h-10 flex items-center border-b border-border/40 bg-background/40 shrink-0 backdrop-blur-md px-1">
                                        <div className="flex p-1 bg-muted/30 rounded-lg mx-auto">
                                            <button
                                                onClick={() => setRightPanel('assistant')}
                                                className={`px-4 py-1 text-[11px] font-semibold rounded-md transition-all duration-300 ${activeRightPanel === 'assistant' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                            >
                                                {t('writer_dock_assistant')}
                                            </button>
                                            <button
                                                onClick={() => setRightPanel('settings')}
                                                className={`px-4 py-1 text-[11px] font-semibold rounded-md transition-all duration-300 ${activeRightPanel === 'settings' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                            >
                                                {t('writer_dock_settings')}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-hidden relative h-full">
                                        <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:linear-gradient(0deg,transparent,black)] dark:bg-grid-slate-800/20 pointer-events-none" />
                                        {activeRightPanel === 'assistant' ? <AssistantPanel /> : <SettingsPanel />}
                                    </div>
                                </motion.div>
                            </ResizablePanel>
                        </>
                    )}
                </AnimatePresence>

            </ResizablePanelGroup>
        </div>
    );
}
