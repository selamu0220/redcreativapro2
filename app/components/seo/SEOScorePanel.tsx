import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

export interface SEOCheck {
    id: string;
    label: string;
    status: 'pass' | 'fail' | 'warn';
    message?: string;
    details?: string;
}

interface SEOScorePanelProps {
    score: number;
    checks: SEOCheck[];
    keywords?: string[];
    className?: string;
    isAnalyzing?: boolean;
}

export function SEOScorePanel({
    score,
    checks,
    keywords = [],
    className,
    isAnalyzing = false
}: SEOScorePanelProps) {

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-emerald-500';
        if (score >= 70) return 'text-emerald-600';
        if (score >= 50) return 'text-amber-500';
        return 'text-red-500';
    };

    const getProgressColor = (score: number) => {
        if (score >= 90) return 'bg-emerald-500';
        if (score >= 70) return 'bg-emerald-600';
        if (score >= 50) return 'bg-amber-500';
        return 'bg-red-500';
    }

    const getIcon = (status: SEOCheck['status']) => {
        switch (status) {
            case 'pass': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'fail': return <XCircle className="w-4 h-4 text-red-500" />;
            case 'warn': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
        }
    };

    return (
        <Card className={cn("w-full border shadow-sm", className)}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">Puntuación SEO</CardTitle>
                    <div className={cn("text-2xl font-bold", getScoreColor(score))}>
                        {score}/100
                    </div>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                        className={cn("h-full transition-all duration-500 ease-out", getProgressColor(score))}
                        style={{ width: `${score}%` }}
                    />
                </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
                {keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                        <span className="text-xs text-muted-foreground mr-1">Keywords:</span>
                        {keywords.map(k => (
                            <span key={k} className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                {k}
                            </span>
                        ))}
                    </div>
                )}

                <div className="space-y-2">
                    {checks.map((check) => (
                        <div key={check.id} className="flex items-start gap-2 text-sm p-2 rounded hover:bg-muted/50 transition-colors">
                            <div className="mt-0.5">{getIcon(check.status)}</div>
                            <div className="flex-1">
                                <div className="flex items-center gap-1.5">
                                    <span className={cn("font-medium", check.status === 'pass' ? 'text-foreground' : 'text-muted-foreground')}>
                                        {check.label}
                                    </span>
                                    {check.details && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Info className="w-3 h-3 text-muted-foreground opacity-50 hover:opacity-100" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="max-w-[200px] text-xs">{check.details}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                </div>
                                {check.status !== 'pass' && check.message && (
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {check.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
