'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, CheckCircle2, AlertTriangle, BarChart3, ListChecks } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface GeoOptimizerPanelProps {
    geoScore: number;
    verdict: string;
    strengths: string[];
    suggestions: string[];
    isAnalyzing: boolean;
    onReanalyze: () => void;
}

export default function GeoOptimizerPanel({
    geoScore,
    verdict,
    strengths,
    suggestions,
    isAnalyzing,
    onReanalyze
}: GeoOptimizerPanelProps) {
    const hasResults = geoScore > 0;

    return (
        <div className="space-y-6 p-4 border rounded-xl bg-card">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Bot className="w-6 h-6 text-purple-600" />
                    GEO Optimization (LLM Visibility)
                </h3>
                <Button
                    onClick={onReanalyze}
                    disabled={isAnalyzing}
                    className="bg-purple-600 hover:bg-purple-700"
                >
                    {isAnalyzing ? 'Analizando...' : 'Analizar para LLMs'}
                </Button>
            </div>

            {!hasResults && (
                <div className="text-muted-foreground text-sm">
                    Descubre si tu contenido está optimizado para ser citado por ChatGPT, Gemini y Perplexity.
                </div>
            )}

            {hasResults && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    {/* Score Card */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="p-4 flex flex-col items-center justify-center bg-muted/50">
                            <span className="text-sm font-medium mb-2">GEO Score (Citabilidad)</span>
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                <div className="text-4xl font-bold text-purple-600">{geoScore}</div>
                            </div>
                            <span className={`text-sm font-bold ${geoScore > 80 ? 'text-green-600' : 'text-amber-600'
                                }`}>
                                {verdict}
                            </span>
                        </Card>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span>Data Density (Datos/100 palabras)</span>
                                <span className="font-bold">Calculado</span>
                            </div>
                            <Progress value={Math.min(geoScore, 100)} className="h-2" />

                            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-sm">
                                <p className="font-medium flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                    <BarChart3 className="w-4 h-4" />
                                    ¿Por qué importa?
                                </p>
                                <p className="text-muted-foreground mt-1 text-xs">
                                    Los LLMs prefieren contenido con alta densidad de datos únicos para reducir alucinaciones.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Strengths */}
                    {strengths.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm flex items-center gap-2 text-green-600">
                                <CheckCircle2 className="w-4 h-4" />
                                Puntos Fuertes
                            </h4>
                            <ul className="space-y-1">
                                {strengths.map((s, i) => (
                                    <li key={i} className="text-sm pl-6 relative">
                                        <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-green-500" />
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm flex items-center gap-2 text-amber-600">
                                <AlertTriangle className="w-4 h-4" />
                                Sugerencias de Optimización
                            </h4>
                            <ul className="space-y-2">
                                {suggestions.map((s, i) => (
                                    <li key={i} className="text-sm p-2 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-100 dark:border-amber-900/50">
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
