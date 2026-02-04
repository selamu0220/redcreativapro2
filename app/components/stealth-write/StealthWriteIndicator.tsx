'use client';

import React from 'react';
import { Shield, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface StealthWriteIndicatorProps {
    score: number;
    riskLevel: 'low' | 'medium' | 'high' | null;
    isAnalyzing?: boolean;
    onClick?: () => void;
    className?: string;
}

export function StealthWriteIndicator({
    score,
    riskLevel,
    isAnalyzing = false,
    onClick,
    className
}: StealthWriteIndicatorProps) {
    const getStatusConfig = () => {
        if (isAnalyzing) {
            return {
                icon: Shield,
                color: 'text-muted-foreground',
                bgColor: 'bg-muted',
                borderColor: 'border-border',
                label: 'Analizando...',
                description: 'Evaluando patrones de IA'
            };
        }

        if (riskLevel === null) {
            return {
                icon: Shield,
                color: 'text-muted-foreground',
                bgColor: 'bg-muted/50',
                borderColor: 'border-border',
                label: 'StealthWrite™',
                description: 'Escribe para analizar'
            };
        }

        switch (riskLevel) {
            case 'low':
                return {
                    icon: ShieldCheck,
                    color: 'text-green-600 dark:text-green-400',
                    bgColor: 'bg-green-50 dark:bg-green-950/30',
                    borderColor: 'border-green-200 dark:border-green-800',
                    label: `${score}% Humano`,
                    description: 'Texto indetectable ✓'
                };
            case 'medium':
                return {
                    icon: ShieldAlert,
                    color: 'text-yellow-600 dark:text-yellow-400',
                    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
                    borderColor: 'border-yellow-200 dark:border-yellow-800',
                    label: `${score}% Humano`,
                    description: 'Requiere ajustes'
                };
            case 'high':
                return {
                    icon: ShieldX,
                    color: 'text-destructive',
                    bgColor: 'bg-destructive/10',
                    borderColor: 'border-destructive/30',
                    label: `${score}% Humano`,
                    description: 'Alto riesgo de detección'
                };
        }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={onClick}
                        className={cn(
                            'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-all',
                            config.bgColor,
                            config.borderColor,
                            'hover:opacity-80 cursor-pointer',
                            isAnalyzing && 'animate-pulse',
                            className
                        )}
                    >
                        <Icon className={cn('h-4 w-4', config.color)} />
                        <span className={config.color}>{config.label}</span>
                    </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                    <p className="font-medium">{config.description}</p>
                    {riskLevel && riskLevel !== 'low' && (
                        <p className="text-xs text-muted-foreground mt-1">
                            Click para ver sugerencias
                        </p>
                    )}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

// Compact version for toolbar
export function StealthWriteBadge({
    score,
    riskLevel,
    isAnalyzing,
    className
}: Omit<StealthWriteIndicatorProps, 'onClick'>) {
    const getColor = () => {
        if (isAnalyzing || riskLevel === null) return 'bg-muted';
        if (riskLevel === 'low') return 'bg-green-500';
        if (riskLevel === 'medium') return 'bg-yellow-500';
        return 'bg-destructive';
    };

    return (
        <div className={cn('flex items-center gap-1.5', className)}>
            <div className={cn(
                'w-2 h-2 rounded-full',
                getColor(),
                isAnalyzing && 'animate-pulse'
            )} />
            <span className="text-xs font-mono text-muted-foreground">
                {isAnalyzing ? '...' : riskLevel ? `${score}%` : '—'}
            </span>
        </div>
    );
}
