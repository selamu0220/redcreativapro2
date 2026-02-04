'use client';

import React from 'react';
import { useWriter } from '../context/WriterContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { MessageSquare, ScanEye, Globe, Zap } from "lucide-react";
import WriterChatPanel from './WriterChatPanel';
import { toast } from "sonner";
import { useDebounce } from '@/app/hooks/useDebounce';
import { useSimpleTranslations } from '@/app/lib/simple-translations';

// BRUTAL COMPONENTS (Phase 1 Integration)
import { StealthWritePanel } from '@/app/components/stealth-write/StealthWritePanel';
import GeoOptimizerPanel from '@/app/components/geo/GeoOptimizerPanel';

export default function AssistantPanel() {
    const { t } = useSimpleTranslations();
    const { content, setContent } = useWriter();

    // TAB STATE
    const [activeTab, setActiveTab] = React.useState('chat');

    // STEALTH STATE
    const [stealthData, setStealthData] = React.useState<any>(null);
    const [isStealthAnalyzing, setIsStealthAnalyzing] = React.useState(false);
    const [isHumanizing, setIsHumanizing] = React.useState(false);

    // GEO STATE
    const [geoData, setGeoData] = React.useState<any>(null);
    const [isGeoAnalyzing, setIsGeoAnalyzing] = React.useState(false);

    // REAL-TIME INTELLIGENCE
    const debouncedContent = useDebounce(content, 2000);

    // Auto-analyze when tab is active and content changes
    React.useEffect(() => {
        if (!debouncedContent || debouncedContent.length < 50) return;

        if (activeTab === 'stealth') {
            handleAnalyzeStealth(true);
        } else if (activeTab === 'geo') {
            handleAnalyzeGeo(true);
        }
    }, [debouncedContent, activeTab]);


    // --- STEALTH HANDLERS ---
    const handleAnalyzeStealth = async (silent = false) => {
        if (!content) return;
        if (!silent) setIsStealthAnalyzing(true);

        try {
            const res = await fetch('/api/stealth-analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: content })
            });
            const data = await res.json();

            if (data.success) {
                setStealthData(data);
                if (!silent) toast.success(t('assistant_stealth_complete'), {
                    description: `Score: ${data.score}/100`
                });
            } else {
                if (!silent && data.error) toast.warning(data.error);
                // Keep old data if possible instead of clearing?
                // Or just don't update state.
            }
        } catch (e) {
            console.error(e);
            if (!silent) toast.error(t('assistant_stealth_error'));
        } finally {
            if (!silent) setIsStealthAnalyzing(false);
        }
    };

    const handleHumanize = async () => {
        if (!content) return;
        setIsHumanizing(true);
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `MODO HUMAIZER EXTREMO: Reescribe este texto para eliminar todos los patrones de IA detectados. Varía la longitud de las frases, usa sinónimos inusuales, añade imperfecciones humanas y rompe estructuras repetitivas. Texto: "${content}"`,
                    history: []
                })
            });
            const textResponse = await res.text();

            // Handle :::UPDATE_DOCUMENT::: protocol if present, else use raw response
            let newText = textResponse;
            const match = newText.match(/:::\s*UPDATE[-_ ]?DOCUMENT\s*:::([\s\S]*?):::\s*UPDATE[-_ ]?DOCUMENT\s*:::/i);
            if (match) newText = match[1].trim();

            setContent(newText);
            toast.success(t('assistant_humanize_complete'));

            // Re-analyze immediately
            setTimeout(() => handleAnalyzeStealth(true), 500);

        } catch (e) {
            toast.error(t('assistant_humanize_error'));
        } finally {
            setIsHumanizing(false);
        }
    };

    // --- GEO HANDLERS ---
    const handleAnalyzeGeo = async (silent = false) => {
        if (!content) return;
        if (!silent) setIsGeoAnalyzing(true);

        try {
            const res = await fetch('/api/geo-optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: content })
            });
            const data = await res.json();
            if (data.success) {
                setGeoData(data);
                if (!silent) toast.success(t('assistant_geo_updated'));
            }
        } catch (e) {
            console.error(e);
        } finally {
            if (!silent) setIsGeoAnalyzing(false);
        }
    };

    const handleGeoBoost = async () => {
        if (!content) return;
        setIsGeoAnalyzing(true);
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `MODO GEO OPTIMIZER: Analiza el siguiente texto y optimízalo para Google SGE (Generative Engine).
                    
                    TASKS:
                    1. Identifica listas y conviértelas en TABLAS Markdown si es apropiado para aumentar la densidad de datos.
                    2. Asegúrate de que el PRIMER párrafo contenga una definición directa del tema principal (Targeting Position 0).
                    3. Si no hay listas, añade una tabla de "Key Takeaways" al final.
                    
                    PROTOCOLO DE SALIDA:
                    Devuelve el documento completo optimizado dentro de las etiquetas :::UPDATE_DOCUMENT:::.
                    
                    Texto para analizar: "${content}"`,
                    history: []
                })
            });
            const textResponse = await res.text();

            let newText = textResponse;
            const match = newText.match(/:::\s*UPDATE[-_ ]?DOCUMENT\s*:::([\s\S]*?):::\s*UPDATE[-_ ]?DOCUMENT\s*:::/i);
            if (match) newText = match[1].trim();

            setContent(newText);
            toast.success(t('assistant_geo_injected'));

            // Re-analyze
            setTimeout(() => handleAnalyzeGeo(true), 1000);

        } catch (e) {
            toast.error(t('assistant_geo_error'));
        } finally {
            setIsGeoAnalyzing(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-black/95 border-l border-zinc-800 shadow-2xl overflow-hidden">
            {/* TABS HEADER */}
            <div className="p-1 bg-zinc-900 border-b border-zinc-800">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full grid grid-cols-3 bg-transparent h-10 gap-1">
                        <TabsTrigger
                            value="chat"
                            className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-500 text-xs uppercase tracking-wider font-bold"
                        >
                            <MessageSquare className="w-3 h-3 mr-2" /> {t('assistant_tab_chat')}
                        </TabsTrigger>
                        <TabsTrigger
                            value="stealth"
                            className="data-[state=active]:bg-zinc-800 data-[state=active]:text-indigo-400 text-zinc-500 text-xs uppercase tracking-wider font-bold"
                        >
                            <ScanEye className="w-3 h-3 mr-2" /> {t('assistant_tab_stealth')}
                        </TabsTrigger>
                        <TabsTrigger
                            value="geo"
                            className="data-[state=active]:bg-zinc-800 data-[state=active]:text-purple-400 text-zinc-500 text-xs uppercase tracking-wider font-bold"
                        >
                            <Globe className="w-3 h-3 mr-2" /> {t('assistant_tab_geo')}
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* TAB CONTENT */}
            <div className="flex-1 overflow-hidden relative">
                {activeTab === 'chat' && (
                    <div className="h-full mt-0">
                        <WriterChatPanel />
                    </div>
                )}

                {activeTab === 'stealth' && (
                    <div className="h-full overflow-y-auto p-4 custom-scrollbar">
                        <StealthWritePanel
                            score={stealthData?.score || 0}
                            verdict={stealthData?.verdict || 'Pendiente'}
                            perplexity={stealthData?.perplexity || 0}
                            issues={stealthData?.issues || []}
                            stats={stealthData?.stats || { sentences: 0, avgSentenceLength: 0, variance: 0 }}
                            isAnalyzing={isStealthAnalyzing}
                            onHumanize={handleHumanize}
                            isHumanizing={isHumanizing}
                        />
                    </div>
                )}

                {activeTab === 'geo' && (
                    <div className="h-full overflow-y-auto p-4 custom-scrollbar">
                        <GeoOptimizerPanel
                            geoScore={geoData?.score || 0}
                            dataDensity={geoData?.dataDensity || "0.0"}
                            metrics={geoData?.metrics || { entities: 0, citations: false, structure: false }}
                            insights={geoData?.insights || []}
                            isAnalyzing={isGeoAnalyzing}
                            onReanalyze={() => handleAnalyzeGeo(false)}
                            onBoost={handleGeoBoost}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
