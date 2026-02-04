'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Radar,
    Database,
    Share2,
    Search,
    BrainCircuit,
    CheckCircle2,
    AlertOctagon
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { KnowledgeGraphViz } from './KnowledgeGraphViz';
import { useSimpleTranslations } from '@/app/lib/simple-translations';

interface GeoOptimizerPanelProps {
    geoScore: number;
    dataDensity: string;
    metrics: {
        entities: number;
        citations: boolean;
        structure: boolean;
    };
    insights: Array<{ type: string; msg: string }>;
    isAnalyzing: boolean;
    onReanalyze: () => void;
    onBoost?: () => void;
}

export default function GeoOptimizerPanel({
    geoScore,
    dataDensity,
    metrics,
    insights,
    isAnalyzing,
    onReanalyze,
    onBoost
}: GeoOptimizerPanelProps) {
    const { t } = useSimpleTranslations();
    const hasResults = geoScore > 0;

    return (
        <Card className="w-full border-zinc-800 bg-black/90 text-zinc-100 font-mono shadow-2xl p-0 overflow-hidden">
            {/* HEADER */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/30">
                <div className="flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-purple-500" />
                    <span className="text-sm font-bold uppercase tracking-wider text-purple-100">
                        {t('geo_engine_version')}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span className={isAnalyzing ? "animate-pulse text-purple-400" : ""}>
                        {isAnalyzing ? t('geo_status_scanning') : t('geo_status_ready')}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${isAnalyzing ? "bg-purple-500" : "bg-emerald-500"}`} />
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* 0. KNOWLEDGE GRAPH VIZ (Hero) */}
                <KnowledgeGraphViz entityCount={metrics?.entities || 0} isAnalyzing={isAnalyzing} />

                {/* 1. KEY METRICS GRID */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800 flex flex-col items-center justify-center gap-1 group hover:border-purple-500/50 transition-colors">
                        <Radar className="w-5 h-5 text-purple-500 mb-1 group-hover:scale-110 transition-transform" />
                        <span className="text-2xl font-bold text-white">{geoScore}</span>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wide">{t('geo_cite_score')}</span>
                    </div>

                    <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800 flex flex-col items-center justify-center gap-1 group hover:border-blue-500/50 transition-colors">
                        <Database className="w-5 h-5 text-blue-500 mb-1 group-hover:scale-110 transition-transform" />
                        <span className="text-2xl font-bold text-white">{dataDensity}</span>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wide">{t('geo_data_density')}</span>
                    </div>

                    <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800 flex flex-col items-center justify-center gap-1 group hover:border-emerald-500/50 transition-colors">
                        <Share2 className="w-5 h-5 text-emerald-500 mb-1 group-hover:scale-110 transition-transform" />
                        <span className="text-2xl font-bold text-white">{metrics?.entities || 0}</span>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wide">{t('geo_entities')}</span>
                    </div>
                </div>

                {/* 2. SNIPPET PREVIEW (The "Hologram") */}
                <div className="relative">
                    <span className="absolute -top-3 left-4 px-2 bg-black text-xs text-zinc-500 uppercase">
                        {t('geo_vision_preview')}
                    </span>
                    <div className="rounded border border-dashed border-zinc-700 p-4 pt-6 bg-zinc-950/50">
                        <div className="flex gap-3 items-start opacity-70">
                            <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center shrink-0">
                                <Search className="w-4 h-4 text-zinc-400" />
                            </div>
                            <div className="space-y-2 w-full">
                                <div className="h-2 w-1/3 bg-zinc-800 rounded animate-pulse" />
                                <div className="h-2 w-full bg-zinc-800 rounded animate-pulse delay-75" />
                                <div className="h-2 w-5/6 bg-zinc-800 rounded animate-pulse delay-150" />

                                {metrics?.structure && (
                                    <div className="mt-2 pl-4 border-l-2 border-purple-500/30">
                                        <div className="h-1.5 w-1/2 bg-purple-900/30 rounded mb-1" />
                                        <div className="h-1.5 w-1/2 bg-purple-900/30 rounded" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. DIAGNOSTICS LOG */}
                <div className="space-y-2">
                    <h4 className="text-xs uppercase text-zinc-500 font-bold tracking-widest flex items-center gap-2">
                        <AlertOctagon className="w-3 h-3" /> {t('geo_diagnostics')}
                    </h4>

                    <div className="space-y-1">
                        {insights?.map((insight, i) => (
                            <div key={i} className="flex items-start gap-3 p-2 rounded hover:bg-zinc-900/50 transition-colors text-xs">
                                {insight.type === 'success' ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                ) : (
                                    <AlertOctagon className={`w-4 h-4 mt-0.5 shrink-0 ${insight.type === 'critical' ? 'text-red-500' : 'text-amber-500'
                                        }`} />
                                )}
                                <span className="text-zinc-300 leading-relaxed font-light">
                                    {insight.msg}
                                </span>
                            </div>
                        ))}

                        {(!insights || insights.length === 0) && (
                            <div className="text-center py-4 text-zinc-600 text-xs italic">
                                {t('geo_waiting_stream')}
                            </div>
                        )}
                    </div>
                </div>

                <Button
                    onClick={onReanalyze}
                    disabled={isAnalyzing}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold tracking-widest uppercase h-10 text-xs"
                >
                    {isAnalyzing ? t('geo_processing') : t('geo_btn_run')}
                </Button>

                {onBoost && (
                    <Button
                        onClick={onBoost}
                        disabled={isAnalyzing}
                        variant="outline"
                        className="w-full border-purple-500/30 hover:bg-purple-500/10 text-purple-300 font-mono text-[10px] uppercase tracking-wider h-8 mt-2"
                    >
                        {t('geo_btn_inject')}
                    </Button>
                )}
            </div>
        </Card>
    );
}

