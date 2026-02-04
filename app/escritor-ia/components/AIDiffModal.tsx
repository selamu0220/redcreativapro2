"use client";

import React, { useEffect, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { ScrollArea } from "@/app/components/ui/scroll-area"; // Ensure this exists or use div overflow
import { ArrowRight, Check, X, Sparkles, Loader2 } from "lucide-react";

interface AIDiffModalProps {
    isOpen: boolean;
    onClose: () => void;
    originalContent: string;
    streamingContent: string;
    isStreaming: boolean;
    onAccept: () => void;
}

export function AIDiffModal({
    isOpen,
    onClose,
    originalContent,
    streamingContent,
    isStreaming,
    onAccept,
}: AIDiffModalProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom as text streams in
    useEffect(() => {
        if (isStreaming && bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [streamingContent, isStreaming]);

    // Strip HTML for safer/cleaner comparison if needed, but for now showing raw (or HTML)
    // Ideally, we render HTML. Tiptap content is HTML.

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden bg-background/95 backdrop-blur-xl border-white/20">

                {/* Header */}
                <div className="p-6 border-b border-border/40 shrink-0">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Sparkles className="w-5 h-5 text-indigo-400" />
                            Revisión de Mejoras IA
                        </DialogTitle>
                        <DialogDescription>
                            La IA está reescribiendo tu documento. Revisa los cambios antes de aceptar.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* Content Comparison Area */}
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">

                    {/* ORIGINAL */}
                    <div className="flex-1 flex flex-col border-r border-border/40 bg-muted/10">
                        <div className="p-3 bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/40 text-center sticky top-0 z-10 backdrop-blur">
                            Original
                        </div>
                        <div className="flex-1 overflow-auto p-6 font-mono text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap select-text">
                            {/* Render simplistic HTML strip or raw html if debugging */}
                            {/* Using a div with standard formatting for readable preview */}
                            <div dangerouslySetInnerHTML={{ __html: originalContent }} className="prose prose-sm dark:prose-invert max-w-none opacity-60 pointer-events-none grayscale" />
                        </div>
                    </div>

                    {/* STREAMING / NEW */}
                    <div className="flex-1 flex flex-col bg-background relative">
                        <div className="p-3 bg-indigo-500/10 text-xs font-semibold text-indigo-400 uppercase tracking-wider border-b border-indigo-500/20 text-center sticky top-0 z-10 backdrop-blur">
                            {isStreaming ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-3 h-3 animate-spin" /> Generando...
                                </span>
                            ) : "Propuesta Mejorada"}
                        </div>
                        <div className="flex-1 overflow-auto p-6 font-sans text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                {/* We render the streamed HTML safely */}
                                <div dangerouslySetInnerHTML={{ __html: streamingContent }} />
                            </div>
                            <div ref={bottomRef} />
                        </div>

                        {/* Visual Flair for Streaming */}
                        {isStreaming && (
                            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                        )}
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-border/40 bg-muted/5 shrink-0 flex justify-end gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isStreaming} // Optional: allow cancel?
                        className="hover:bg-red-500/10 hover:text-red-400"
                    >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                    </Button>

                    <Button
                        onClick={onAccept}
                        disabled={isStreaming || !streamingContent}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                    >
                        {isStreaming ? (
                            <>Espere...</>
                        ) : (
                            <>
                                <Check className="w-4 h-4 mr-2" />
                                Aplicar Cambios
                            </>
                        )}
                    </Button>
                </div>

            </DialogContent>
        </Dialog>
    );
}
