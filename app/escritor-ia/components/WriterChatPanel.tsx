'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useWriter } from '../context/WriterContext';
import { toast } from "sonner";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Textarea } from "@/app/components/ui/textarea"; // Added Import
import { Send, Bot, User, Sparkles, FileText, CheckCircle2, PenTool } from "lucide-react";
import { Switch } from "@/app/components/ui/switch";
import { Label } from "@/app/components/ui/label";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { useSimpleTranslations } from "@/app/lib/simple-translations"; // Added hook

type Message = {
    id: string;
    role: 'user' | 'assistant' | 'system'; // Added system
    content: string;
    isPlan?: boolean;
};

export default function WriterChatPanel() {
    const { content, setContent, triggerUpdateAnimation } = useWriter();
    const { t } = useSimpleTranslations(); // Hook
    const PRE_PROMPTS = [
        { id: 'editor', label: t('preprompt_editor_label'), prompt: t('preprompt_editor_prompt') },
        { id: 'creative', label: t('preprompt_creative_label'), prompt: t('preprompt_creative_prompt') },
        { id: 'academic', label: t('preprompt_academic_label'), prompt: t('preprompt_academic_prompt') },
        { id: 'copywriter', label: t('preprompt_copywriter_label'), prompt: t('preprompt_copywriter_prompt') },
        { id: 'simplifier', label: t('preprompt_simplifier_label'), prompt: t('preprompt_simplifier_prompt') }
    ];

    // ... imports
    // Fixed variable names and removed duplicate lines

    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: t('chat_greeting') }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isPlanMode, setIsPlanMode] = useState(false);
    const [selectedPrompt, setSelectedPrompt] = useState('editor');
    const [isProcessing, setIsProcessing] = useState(false); // Used as "isSending"
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue(''); // Clear input
        setIsProcessing(true); // Start loading

        try {
            const history = messages.map(m => ({
                id: m.id,
                content: m.content,
                isUser: m.role === 'user',
                timestamp: new Date()
            }));

            // Get the full prompt text based on selection
            const activePrePrompt = PRE_PROMPTS.find(p => p.id === selectedPrompt)?.prompt;

            // Call API
            console.log('[WriterChatPanel] Sending request:', { message: userMsg.content, prePrompt: activePrePrompt, mode: isPlanMode ? 'plan' : 'edit' });
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMsg.content,
                    history: history,
                    documentContent: content.replace(/<[^>]*>/g, ' '),
                    mode: isPlanMode ? 'plan' : 'edit',
                    prePrompt: activePrePrompt // Pass to backend
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Error en la respuesta de la IA');
            }

            // Since /api/chat returns a text stream, we must read it as text.
            const aiResponseRaw = await response.text();

            let aiResponse = aiResponseRaw;

            // Check for UPDATE protocol (Robust Regex v3: Handles bold markers **, spaces, underscores)
            // Matches: :::UPDATE_DOCUMENT:::, **:::UPDATE_DOCUMENT:::**, etc.
            const updateRegex = /(?:\*\*?)?:::\s*UPDATE[-_ ]?DOCUMENT\s*:::(?:\*\*?)?([\s\S]*?)(?:\*\*?)?:::\s*UPDATE[-_ ]?DOCUMENT\s*:::(?:\*\*?)?/i;
            const updateMatch = aiResponse.match(updateRegex);

            if (updateMatch) {
                const newContent = updateMatch[1].trim();
                setContent(newContent);

                if (!response.ok) throw new Error("Failed to chat");

                const data = await response.json().catch(() => ({})); // Safety catch if not JSON

                // If it was an edit command, update editor
                // Note: logic here seems a bit mixed (text() vs json()). 
                // Previously it said await response.json() after response.text() which crashes. 
                // We typically get text OR json. 
                // Assuming the API returns text stream usually. 
                // Let's assume aiResponseRaw IS the content if no JSON logic intended.

                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: t('chat_response_updated') }]);

            } else {
                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: aiResponse }]);
            }

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'system', content: t('chat_error_generic') }]);
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePrePrompt = (prompt: string) => {
        setInputValue(prompt);
        // Optional: handleSend(); if we want auto-send
    };

    return (
        <div className="flex flex-col h-full bg-background border-l border-border/40">
            {/* Header */}
            <div className="h-14 flex items-center justify-between px-4 border-b border-border/40 bg-muted/20">
                <div className="flex items-center gap-2 font-medium text-sm">
                    <Bot className="w-4 h-4 text-primary" />
                    {t('writer_dock_assistant')}
                </div>
                <div className="flex bg-muted rounded-md p-0.5">
                    <button
                        onClick={() => setIsPlanMode(false)}
                        className={`px-2 py-1 text-[10px] rounded-sm transition-all ${!isPlanMode ? 'bg-background shadow text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        {t('chat_style_editor')}
                    </button>
                    <button
                        onClick={() => setIsPlanMode(true)}
                        className={`px-2 py-1 text-[10px] rounded-sm transition-all ${isPlanMode ? 'bg-background shadow text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        {t('chat_plan_mode')}
                    </button>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
                <div className="flex flex-col gap-4" ref={scrollRef}>
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            </div>
                            <div className={`rounded-xl p-3 text-sm max-w-[85%] ${msg.role === 'user'
                                ? 'bg-primary text-primary-foreground rounded-tr-none'
                                : msg.role === 'system'
                                    ? 'bg-red-50 text-red-600 border border-red-100'
                                    : 'bg-muted rounded-tl-none'
                                }`}>
                                {msg.content}
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
                                {t('chat_thinking')}
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-border/40 bg-background">
                {messages.length < 2 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                        {PRE_PROMPTS.map(p => (
                            <button
                                key={p.id}
                                onClick={() => handlePrePrompt(p.prompt)}
                                className="text-xs bg-muted/50 hover:bg-muted border border-border/50 px-2 py-1 rounded-full transition-colors"
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                )}

                <div className="relative">
                    <Textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={isPlanMode ? t('chat_plan_placeholder') : t('chat_placeholder_edit')}
                        className="min-h-[80px] pr-10 resize-none bg-muted/30 focus:bg-background transition-colors"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />
                    <Button
                        size="icon"
                        className="absolute bottom-2 right-2 h-8 w-8"
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isProcessing}
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
                {!isPlanMode && (
                    <div className="mt-2 flex justify-between items-center px-1">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <PenTool className="w-3 h-3" />
                            {t('chat_context_active')}
                        </span>
                        <span className="text-[10px] text-blue-700 dark:text-blue-300">
                            {t('writer_reading_chars').replace('{count}', content.length.toString())}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
