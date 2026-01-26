'use client';

import React from 'react';
import { useWriter } from '../context/WriterContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Progress } from "@/app/components/ui/progress";
import { Shield, Sparkles, Globe, MessageSquare } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import WriterChatPanel from './WriterChatPanel';

// ... imports
import { toast } from "sonner";

export default function AssistantPanel() {
    const { humanityScore, setHumanityScore, seoScore, content, setContent } = useWriter();
    const [isProcessing, setIsProcessing] = React.useState(false);

    const handleHumanize = async () => {
        if (!content) return toast.error("Escribe algo primero");
        setIsProcessing(true);
        toast.info("Humanizando texto...");
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                body: JSON.stringify({
                    message: `Humaniza el siguiente texto para que sea indetectable por IA. Mantén el tono original pero varía la estructura: "${content}"`,
                    history: []
                })
            });
            const data = await response.json();
            if (data.response) {
                setContent(data.response);
                setHumanityScore(98); // Mock success score
                toast.success("Texto humanizado aplicado");
            }
        } catch (e) {
            toast.error("Error al humanizar");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-background">
            <div className="p-2 border-b">
                <h3 className="font-semibold text-sm">Asistente IA</h3>
            </div>

            <Tabs defaultValue="chat" className="flex-1 flex flex-col overflow-hidden">
                <div className="px-2 pt-2">
                    <TabsList className="w-full grid grid-cols-4">
                        <TabsTrigger value="chat" className="text-xs px-1"><MessageSquare className="w-3 h-3 mr-1" /> Chat</TabsTrigger>
                        <TabsTrigger value="stealth" className="text-xs px-1">Stealth</TabsTrigger>
                        <TabsTrigger value="seo" className="text-xs px-1">SEO</TabsTrigger>
                        <TabsTrigger value="geo" className="text-xs px-1">GEO</TabsTrigger>
                    </TabsList>
                </div>

                {/* --- TAB: CHAT --- */}
                <TabsContent value="chat" className="flex-1 overflow-hidden mt-0 border-0 p-0">
                    <WriterChatPanel />
                </TabsContent>

                <TabsContent value="stealth" className="flex-1 p-3 space-y-4 overflow-y-auto">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted border-4 border-background shadow-sm relative">
                            <span className="text-2xl font-bold">{humanityScore}%</span>
                            <Shield className={`absolute -bottom-1 -right-1 w-6 h-6 ${humanityScore > 80 ? 'text-green-500 fill-green-100' : 'text-yellow-500'}`} />
                        </div>
                        <p className="text-xs font-medium text-muted-foreground">Puntuación Humana</p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span>Indetectabilidad</span>
                            <span>{humanityScore > 80 ? 'Alta' : 'Media'}</span>
                        </div>
                        <Progress value={humanityScore} className="h-2" />
                    </div>

                    <Button className="w-full text-xs" size="sm" onClick={handleHumanize} disabled={isProcessing}>
                        <Sparkles className={`w-3 h-3 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
                        {isProcessing ? 'Humanizando...' : 'Humanizar Texto'}
                    </Button>
                </TabsContent>

                <TabsContent value="seo" className="flex-1 p-3 space-y-4 overflow-y-auto">
                    {/* SEO Content (Mocked for now) */}
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted border-4 border-background shadow-sm relative">
                            <span className="text-2xl font-bold">{seoScore}</span>
                            <Globe className="absolute -bottom-1 -right-1 w-6 h-6 text-blue-500 fill-blue-100" />
                        </div>
                        <p className="text-xs font-medium text-muted-foreground">SEO Score</p>
                    </div>
                </TabsContent>

                {/* GEO Content */}
                <TabsContent value="geo" className="flex-1 p-3 overflow-y-auto">
                    <div className="text-sm text-muted-foreground text-center pt-8">
                        Optimización para Motores de IA (GEO) disponible próximamente.
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
