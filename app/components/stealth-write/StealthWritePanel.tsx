'use client';

import React from 'react';
import {
    ShieldCheck,
    ShieldAlert,
    ShieldX,
    Sparkles,
    AlertTriangle,
    CheckCircle2,
    Loader2,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';

export interface Issue {
    type: string;
    matches: string[];
    suggestion: string;
    severity: number;
}

interface StealthWritePanelProps {
    humanityScore: number;
    riskLevel: 'low' | 'medium' | 'high' | null;
    issues: Issue[];
    recommendations: string[];
    isAnalyzing: boolean;
    onHumanize?: () => void;
    isHumanizing?: boolean;
    className?: string;
}

const ISSUE_LABELS: Record<string, string> = {
    transitions: 'Transiciones genéricas',
    fillers: 'Frases de relleno',
    formal: 'Vocabulario formal',
    starters: 'Inicios repetitivos',
    generic: 'Frases cliché',
    sentenceLength: 'Ritmo uniforme',
    personalVoice: 'Falta voz personal'
};

export function StealthWritePanel({
    humanityScore,
    riskLevel,
    issues,
    recommendations,
    isAnalyzing,
    onHumanize,
    isHumanizing,
    className
}: StealthWritePanelProps) {
    const [expandedIssue, setExpandedIssue] = React.useState<string | null>(null);

    const getScoreColor = () => {
        if (riskLevel === 'low') return 'text-emerald-600 dark:text-emerald-400';
        if (riskLevel === 'medium') return 'text-amber-600 dark:text-amber-400';
        if (riskLevel === 'high') return 'text-red-600 dark:text-red-400';
        return 'text-zinc-400';
    };

    const getProgressColor = () => {
        if (riskLevel === 'low') return 'bg-emerald-500';
        if (riskLevel === 'medium') return 'bg-amber-500';
        if (riskLevel === 'high') return 'bg-red-500';
        return 'bg-zinc-300';
    };

    const getRiskIcon = () => {
        if (riskLevel === 'low') return ShieldCheck;
        if (riskLevel === 'medium') return ShieldAlert;
        if (riskLevel === 'high') return ShieldX;
        return ShieldCheck;
    };

    const RiskIcon = getRiskIcon();

    return (
        <Card className={cn('w-full', className)}>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-zinc-500" />
                        <span>StealthWrite™</span>
                    </div>
                    {riskLevel && (
                        <Badge
                            variant="outline"
                            className={cn(
                                'text-xs',
                                riskLevel === 'low' && 'border-emerald-500 text-emerald-600',
                                riskLevel === 'medium' && 'border-amber-500 text-amber-600',
                                riskLevel === 'high' && 'border-red-500 text-red-600'
                            )}
                        >
                            {riskLevel === 'low' && 'Indetectable'}
                            {riskLevel === 'medium' && 'Revisar'}
                            {riskLevel === 'high' && 'Riesgo Alto'}
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Score Display */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-500">Puntuación Humana</span>
                        <span className={cn('text-2xl font-bold tabular-nums', getScoreColor())}>
                            {isAnalyzing ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                                `${humanityScore}%`
                            )}
                        </span>
                    </div>
                    <div className="relative h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                'absolute inset-y-0 left-0 transition-all duration-500',
                                getProgressColor(),
                                isAnalyzing && 'animate-pulse'
                            )}
                            style={{ width: `${humanityScore}%` }}
                        />
                    </div>
                </div>

                {/* Issues List */}
                {issues.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                            Patrones detectados
                        </h4>
                        <div className="space-y-1">
                            {issues.map((issue) => (
                                <Collapsible
                                    key={issue.type}
                                    open={expandedIssue === issue.type}
                                    onOpenChange={(open) => setExpandedIssue(open ? issue.type : null)}
                                >
                                    <CollapsibleTrigger className="w-full">
                                        <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    'w-1.5 h-1.5 rounded-full',
                                                    issue.severity >= 15 ? 'bg-red-500' :
                                                        issue.severity >= 10 ? 'bg-amber-500' : 'bg-yellow-500'
                                                )} />
                                                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                                                    {ISSUE_LABELS[issue.type] || issue.type}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {issue.matches.length > 0 && (
                                                    <span className="text-xs text-zinc-400">
                                                        {issue.matches.length}
                                                    </span>
                                                )}
                                                {expandedIssue === issue.type ? (
                                                    <ChevronUp className="h-3.5 w-3.5 text-zinc-400" />
                                                ) : (
                                                    <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
                                                )}
                                            </div>
                                        </div>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <div className="px-2 py-2 space-y-2">
                                            {issue.matches.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {issue.matches.slice(0, 5).map((match, i) => (
                                                        <code
                                                            key={i}
                                                            className="text-xs px-1.5 py-0.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded"
                                                        >
                                                            {match}
                                                        </code>
                                                    ))}
                                                    {issue.matches.length > 5 && (
                                                        <span className="text-xs text-zinc-400">
                                                            +{issue.matches.length - 5} más
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                💡 {issue.suggestion}
                                            </p>
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recommendations */}
                {recommendations.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            Recomendaciones
                        </h4>
                        <ul className="space-y-1">
                            {recommendations.map((rec, i) => (
                                <li
                                    key={i}
                                    className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-1.5"
                                >
                                    <span className="text-emerald-500 mt-0.5">→</span>
                                    {rec}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Success State */}
                {riskLevel === 'low' && issues.length === 0 && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300">
                        <ShieldCheck className="h-5 w-5" />
                        <div>
                            <p className="text-sm font-medium">¡Texto indetectable!</p>
                            <p className="text-xs opacity-80">No se detectaron patrones de IA</p>
                        </div>
                    </div>
                )}

                {/* Humanize Button */}
                {riskLevel && riskLevel !== 'low' && onHumanize && (
                    <Button
                        onClick={onHumanize}
                        disabled={isHumanizing}
                        className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-900"
                    >
                        {isHumanizing ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Humanizando...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Aplicar StealthWrite™
                            </>
                        )}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
