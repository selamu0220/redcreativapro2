'use client';

import React from 'react';
import {
    ShieldCheck,
    ShieldAlert,
    ShieldX,
    Activity,
    Fingerprint,
    Cpu,
    Zap,
    TerminalSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PerplexityDNA } from './PerplexityDNA';
import { useSimpleTranslations } from '@/app/lib/simple-translations';

interface Issue {
    type: string;
    name: string;
    count: number;
    severity: 'low' | 'medium' | 'high';
    suggestion: string;
}

interface StealthWritePanelProps {
    score: number;
    verdict: string;
    perplexity: number;
    issues: Issue[];
    stats: {
        sentences: number;
        avgSentenceLength: number;
        variance: number;
    };
    isAnalyzing: boolean;
    onHumanize?: () => void;
    isHumanizing?: boolean;
    className?: string;
}

export function StealthWritePanel({
    score,
    verdict,
    perplexity,
    issues,
    stats,
    isAnalyzing,
    onHumanize,
    isHumanizing,
    className
}: StealthWritePanelProps) {
    const { t } = useSimpleTranslations();

    const getVerdictColor = () => {
        if (score === 0 && !isAnalyzing && issues.length === 0) return 'text-muted-foreground'; // Empty/Ready State
        if (score >= 75) return 'text-green-500'; // Success/Safe
        if (score >= 50) return 'text-yellow-500'; // Warning
        return 'text-destructive'; // Danger
    };

    return (
        <Card className={cn("w-full border-border bg-card text-card-foreground font-mono shadow-xl", className)}>
            <CardHeader className="border-b border-border pb-4">
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground">
                        <Fingerprint className="w-5 h-5 text-primary" />
                        {t('stealth_engine_version')}
                    </div>
                    <Badge variant="outline" className={cn("text-xs font-bold px-3 py-1 bg-muted border-border", getVerdictColor())}>
                        {score === 0 && !isAnalyzing ? t('stealth_status_ready') : verdict.toUpperCase()}
                    </Badge>
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
                {/* HEADS UP DISPLAY */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-xs text-muted-foreground uppercase">{t('stealth_humanity_score')}</span>
                        <div className={cn("text-4xl font-bold tracking-tighter", getVerdictColor())}>
                            {isAnalyzing ? <span className="animate-pulse">--</span> : score}
                            <span className="text-sm text-muted-foreground ml-1">/100</span>
                        </div>
                    </div>

                    <div className="space-y-2 p-4 rounded-lg bg-muted/50 border border-border relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                            <Activity className="w-3 h-3" /> {t('stealth_perplexity')}
                        </span>
                        <div className="text-4xl font-bold tracking-tighter text-primary">
                            {isAnalyzing ? <span className="animate-pulse">--</span> : perplexity}
                            <span className="text-sm text-muted-foreground ml-1">%</span>
                        </div>
                    </div>
                </div>

                {/* VISUALIZER (Real-Time DNA) */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                        <span className="flex items-center gap-2"><Activity className="w-3 h-3" /> {t('stealth_linguistic_matrix')}</span>
                        <span className={isAnalyzing ? "animate-pulse" : ""}>{stats.variance.toFixed(1)} {t('stealth_burstiness')}</span>
                    </div>

                    {/* DNA WAVEFORM */}
                    <div className="bg-background rounded-lg p-2 border border-border shadow-inner">
                        <PerplexityDNA score={score} isAnalyzing={isAnalyzing} />
                    </div>
                </div>

                {/* TERMINAL LOG */}
                <div className="rounded-lg border border-border bg-muted/30 overflow-hidden">
                    <div className="px-3 py-1 border-b border-border bg-muted/50 flex items-center gap-2">
                        <TerminalSquare className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] uppercase text-muted-foreground">{t('stealth_system_log')}</span>
                    </div>
                    <ScrollArea className="h-40 px-4 py-2">
                        <div className="space-y-3 font-mono text-xs">
                            {issues.length === 0 && !isAnalyzing && score > 0 && (
                                <div className="text-green-500 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4" />
                                    <span>{t('stealth_log_secure')}</span>
                                </div>
                            )}

                            {issues.length === 0 && !isAnalyzing && score === 0 && (
                                <div className="text-muted-foreground flex items-center gap-2">
                                    <Activity className="w-4 h-4" />
                                    <span>{t('stealth_log_ready')}</span>
                                </div>
                            )}

                            {issues.map((issue, i) => (
                                <div key={i} className="group flex flex-col gap-1 border-l-2 border-destructive/50 pl-3">
                                    <span className="text-destructive font-bold uppercase tracking-wide flex items-center gap-2">
                                        [{issue.name}]
                                        <span className="text-muted-foreground text-[10px] font-normal px-1.5 py-0.5 rounded bg-muted">x{issue.count}</span>
                                    </span>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {issue.suggestion}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* CONTROLS */}
                {onHumanize && (
                    <Button
                        onClick={onHumanize}
                        disabled={isHumanizing || isAnalyzing}
                        className="w-full h-12 font-bold tracking-wide uppercase"
                    >
                        {isHumanizing ? (
                            <span className="flex items-center gap-2">
                                <Cpu className="w-4 h-4 animate-spin" /> {t('stealth_humanizing')}
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Zap className="w-4 h-4 fill-current" /> {t('stealth_init')}
                            </span>
                        )}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
