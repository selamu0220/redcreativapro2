"use client";

import { useEscritor } from "../../context/EscritorContext";
import { useSimpleTranslations } from "@/app/lib/simple-translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Copy, ArrowLeftToLine, Bot, User, RefreshCw } from "lucide-react";
import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useNexusChat } from "@/app/nexus-ai/hooks/useNexusChat";
import { NexusStatusIndicator } from "../NexusStatusIndicator";

export function ChatPanel() {
    const { editorInstance } = useEscritor();
    // const { t } = useSimpleTranslations(); // Not used currently, keeping for consistency if needed later

    const scrollRef = useRef<HTMLDivElement>(null);

    // Integrated NexusAI Hook
    const {
        messages,
        input,
        handleInputChange,
        handleSubmit,
        isLoading,
        isNexusActive,
        systemStatus,
        stop,
        setMessages
    } = useNexusChat();

    // Auto-scroll on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleInsert = (content: string) => {
        if (editorInstance) {
            editorInstance.chain().focus().insertContent(content).run();
        }
    };

    const handleCopy = (content: string) => {
        navigator.clipboard.writeText(content);
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-background relative">
            {/* Status Indicator Overlay */}
            <div className="absolute top-2 right-4 z-10 pointer-events-none opacity-90">
                <NexusStatusIndicator status={systemStatus} isActive={isNexusActive} />
            </div>

            <div className="flex-1 min-h-0 relative">
                <div ref={scrollRef} className="absolute inset-0 overflow-y-auto p-4 space-y-4 pb-20">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center opacity-50">
                            <Bot className="h-12 w-12 mb-2" />
                            <p className="text-sm">Pregúntame o pídeme que idee algo...</p>
                            <p className="text-xs mt-2">Powered by NexusAI</p>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <div key={msg.id} className={cn(
                            "flex gap-2 max-w-[90%] text-sm",
                            msg.role === 'user' ? "ml-auto" : "mr-auto"
                        )}>
                            {msg.role === 'assistant' && (
                                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                                    <Bot className="h-3 w-3 text-primary" />
                                </div>
                            )}

                            <div className={cn(
                                "p-3 rounded-2xl relative group",
                                msg.role === 'user'
                                    ? "bg-primary text-primary-foreground rounded-tr-none"
                                    : "bg-muted rounded-tl-none border"
                            )}>
                                <p className="whitespace-pre-wrap">{msg.content}</p>

                                {msg.role === 'assistant' && (
                                    <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border/50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => handleCopy(msg.content)}
                                            title="Copiar"
                                            type="button"
                                        >
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => handleInsert(msg.content)}
                                            title="Insertar en editor"
                                            type="button"
                                        >
                                            <ArrowLeftToLine className="h-3 w-3" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {msg.role === 'user' && (
                                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary flex items-center justify-center mt-1">
                                    <User className="h-3 w-3 text-primary-foreground" />
                                </div>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-2 mr-auto max-w-[90%]">
                            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                                <Bot className="h-3 w-3 text-primary" />
                            </div>
                            <div className="bg-muted p-3 rounded-2xl rounded-tl-none border">
                                <div className="flex gap-1 items-center">
                                    <span className="animate-bounce">.</span>
                                    <span className="animate-bounce delay-100">.</span>
                                    <span className="animate-bounce delay-200">.</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-4 w-4 ml-2 hover:bg-destructive/20"
                                        onClick={() => stop()}
                                        title="Detener generación"
                                    >
                                        <div className="h-2 w-2 bg-destructive rounded-sm" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-3 bg-background border-t z-20">
                <form
                    onSubmit={handleSubmit}
                    className="flex items-center gap-2"
                >
                    <Input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Escribe tu mensaje..."
                        className="flex-1"
                        disabled={isLoading && !isNexusActive}
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                        {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </form>
            </div>
        </div>
    );
}
