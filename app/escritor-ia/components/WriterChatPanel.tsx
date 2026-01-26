'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useWriter } from '../context/WriterContext';
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Send, Bot, User, Sparkles, FileText, CheckCircle2 } from "lucide-react";
import { Switch } from "@/app/components/ui/switch";
import { Label } from "@/app/components/ui/label";

type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    isPlan?: boolean; // If true, this is a plan proposal
};

export default function WriterChatPanel() {
    const { content, setContent } = useWriter();
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: 'Hola. Soy tu copiloto de escritura. Puedo leer tu documento y ayudarte a editarlo, reescribirlo o planificar cambios.' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isPlanMode, setIsPlanMode] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsProcessing(true);

        try {
            // Prepare history for context
            const history = messages.map(m => ({
                id: m.id,
                content: m.content,
                isUser: m.role === 'user',
                timestamp: new Date()
            }));

            // Call API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMsg.content,
                    history: history,
                    documentContent: content // Send current doc context
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error en la respuesta de la IA');
            }

            // Handle Response
            let aiResponse = data.response;

            // Check for UPDATE protocol
            const updateMatch = aiResponse.match(/:::UPDATE_DOCUMENT:::([\s\S]*?):::UPDATE_DOCUMENT:::/);
            if (updateMatch) {
                const newContent = updateMatch[1].trim();
                setContent(newContent); // Update Editor!

                // Clean response for chat display
                aiResponse = aiResponse.replace(/:::UPDATE_DOCUMENT:::[\s\S]*?:::UPDATE_DOCUMENT:::/, '').trim();
                if (!aiResponse) aiResponse = "He actualizado el documento con tus cambios.";

                // Optional: Notify user
                // toast.success("Documento actualizado por IA"); (Need to import toast)
            }

            // Check for special command triggers in response (basic implementation)
            // Ideally backend handles this, but we'll keep it simple for now.
            if (isPlanMode) {
                aiResponse = `**Plan sugerido:**\n${aiResponse}\n\n(Puedes copiar este plan manualmente por ahora)`;
            }

            setMessages(prev => [...prev, {
                id: 'ai-' + Date.now(),
                role: 'assistant',
                content: aiResponse,
                isPlan: isPlanMode
            }]);

        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, {
                id: 'error-' + Date.now(),
                role: 'assistant',
                content: "Lo siento, hubo un error al conectar con el cerebro de la IA. Por favor intenta de nuevo."
            }]);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Toolbar */}
            <div className="p-3 border-b flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-sm">Writer Agent</span>
                </div>
                <div className="flex items-center gap-2">
                    <Switch id="plan-mode" checked={isPlanMode} onCheckedChange={setIsPlanMode} className="scale-75" />
                    <Label htmlFor="plan-mode" className="text-xs cursor-pointer">Plan Mode</Label>
                </div>
            </div>

            {/* Analysis Status */}
            <div className="px-3 py-1 bg-blue-50 dark:bg-blue-950/30 border-b border-blue-100 dark:border-blue-900 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-blue-700 dark:text-blue-300">
                    Leyendo documento ({content.length} chars)
                </span>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4" ref={scrollRef as any}>
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            </div>
                            <div className={`rounded-lg p-3 text-sm max-w-[85%] ${msg.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted border border-border'
                                }`}>
                                {msg.isPlan && (
                                    <div className="flex items-center gap-1 mb-2 text-xs font-bold uppercase tracking-wider text-blue-500">
                                        <FileText className="w-3 h-3" /> Plan Mode
                                    </div>
                                )}
                                <div className="whitespace-pre-wrap">{msg.content}</div>
                            </div>
                        </div>
                    ))}
                    {isProcessing && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <Bot className="w-4 h-4" />
                            </div>
                            <div className="rounded-lg p-3 bg-muted text-sm flex items-center gap-2">
                                <Sparkles className="w-3 h-3 animate-spin" />
                                Pensando...
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-3 border-t bg-background">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                    }}
                    className="relative"
                >
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={isPlanMode ? "Describe el cambio que quieres planear..." : "Pregunta sobre el documento o pide cambios..."}
                        className="pr-10 text-sm"
                        disabled={isProcessing}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        variant="ghost"
                        className="absolute right-1 top-1 h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                        disabled={!inputValue.trim() || isProcessing}
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
