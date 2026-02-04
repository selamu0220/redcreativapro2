'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { DollarSign, Clock, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';

interface ROICalculatorProps {
    defaultArticleCount?: number;
    defaultCost?: number;
}

export function ROICalculator({ defaultArticleCount = 10, defaultCost = 50 }: ROICalculatorProps) {
    const [articlesPerMonth, setArticlesPerMonth] = useState(defaultArticleCount);
    const [costPerArticle, setCostPerArticle] = useState(defaultCost);

    // Constants
    const AI_WRITER_COST = 0.5; // Estimated cost per article with AI (subscription amortization)
    const HUMAN_TIME_HOURS = 4;
    const AI_TIME_HOURS = 0.2; // 12 mins

    // Derived metrics
    const monthlyCostHuman = articlesPerMonth * costPerArticle;
    const monthlyCostAI = (articlesPerMonth * AI_WRITER_COST) + 29; // Pro Plan base cost
    const savingsMoney = monthlyCostHuman - monthlyCostAI;

    const monthlyTimeHuman = articlesPerMonth * HUMAN_TIME_HOURS;
    const monthlyTimeAI = articlesPerMonth * AI_TIME_HOURS;
    const savingsTime = monthlyTimeHuman - monthlyTimeAI;

    const yearlySavings = savingsMoney * 12;

    return (
        <Card className="p-8 bg-zinc-900 border-zinc-800 shadow-2xl overflow-hidden relative group">
            {/* Background gradients */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] -z-10 group-hover:bg-purple-600/20 transition-colors" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -z-10 group-hover:bg-indigo-600/20 transition-colors" />

            <div className="grid md:grid-cols-2 gap-12">
                {/* Controls */}
                <div className="space-y-8">
                    <div>
                        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-white">
                            <DollarSign className="w-5 h-5 text-purple-400" />
                            Tus Variables
                        </h3>

                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Artículos por mes</span>
                                    <span className="text-white font-mono font-bold">{articlesPerMonth}</span>
                                </div>
                                <Slider
                                    value={[articlesPerMonth]}
                                    min={1}
                                    max={100}
                                    step={1}
                                    onValueChange={(v) => setArticlesPerMonth(v[0])}
                                    className="cursor-pointer"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Costo actual por artículo ($)</span>
                                    <span className="text-white font-mono font-bold">${costPerArticle}</span>
                                </div>
                                <Slider
                                    value={[costPerArticle]}
                                    min={10}
                                    max={200}
                                    step={5}
                                    onValueChange={(v) => setCostPerArticle(v[0])}
                                    className="cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-950/50 p-6 rounded-xl border border-zinc-800">
                        <h4 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">Desglose de Costos</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span>Método Tradicional:</span>
                                <span className="text-red-400 font-mono">${monthlyCostHuman.toLocaleString()} / mes</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span>Con Red Creativa Pro:</span>
                                <span className="text-green-400 font-mono">${Math.round(monthlyCostAI).toLocaleString()} / mes</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="flex flex-col justify-center space-y-6">
                    <div className="space-y-2">
                        <h3 className="text-sm uppercase tracking-wider text-zinc-500 font-medium">Ahorros Proyectados</h3>
                        <div className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                            ${yearlySavings.toLocaleString()}
                        </div>
                        <p className="text-sm text-green-500/80 font-medium">ahorrados anualmente</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50">
                            <Clock className="w-5 h-5 text-blue-400 mb-2" />
                            <div className="text-2xl font-bold text-white">{Math.round(savingsTime)}h</div>
                            <div className="text-xs text-zinc-400">Horas ahorradas/mes</div>
                        </div>
                        <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50">
                            <TrendingUp className="w-5 h-5 text-purple-400 mb-2" />
                            <div className="text-2xl font-bold text-white">{Math.round((savingsMoney / monthlyCostHuman) * 100)}%</div>
                            <div className="text-xs text-zinc-400">Margen de mejora</div>
                        </div>
                    </div>

                    <Button className="w-full text-lg h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-xl shadow-purple-900/20" asChild>
                        <Link href="/planes">
                            <Zap className="w-5 h-5 mr-2 fill-current" />
                            Empezar a Ahorrar Ahora
                        </Link>
                    </Button>
                </div>
            </div>
        </Card>
    );
}
