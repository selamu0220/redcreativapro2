"use client";

import { useEscritor } from "../../context/EscritorContext";
import { useSimpleTranslations } from "@/app/lib/simple-translations";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Copy, ArrowLeftToLine, Bot, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export function ChatPanel() {
    const { chatHistory, sendChatMessage, isLoading, editorInstance } = useEscritor();
    const { t } = useSimpleTranslations();
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const msg = input;
        setInput("");
        await sendChatMessage(msg);
    };

    const handleInsert = (content: string) => {
        if (editorInstance) {
            editorInstance.chain().focus().insertContent(content).run();
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-background">
            <div className="flex-1 min-h-0 relative">
                <div ref={scrollRef} className="absolute inset-0 overflow-y-auto p-4 space-y-4">
                    {chatHistory.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center opacity-50">
                            <Bot className="h-12 w-12 mb-2" />
                            <p className="text-sm">Pregúntame o pídeme que idee algo...</p>
                        </div>
                    )}

                    {chatHistory.map((msg) => (
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
                                "p-3 rounded-2xl",
                                msg.role === 'user'
                                    ? "bg-primary text-primary-foreground rounded-tr-none"
                                    : "bg-muted rounded-tl-none border"
                            )}>
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                {msg.role === 'assistant' && (
                                    <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border/50">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => navigator.clipboard.writeText(msg.content)}
                                            title="Copiar"
                                        >
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => handleInsert(msg.content)}
                                            title="Insertar en editor"
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
                                <div className="flex gap-1">
                                    <span className="animate-bounce">.</span>
                                    <span className="animate-bounce delay-100">.</span>
                                    <span className="animate-bounce delay-200">.</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-3 bg-background border-t">
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex items-center gap-2"
                >
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Escribe tu mensaje..."
                        className="flex-1"
                        disabled={isLoading}
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
