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
                color: 'text-zinc-400',
                bgColor: 'bg-zinc-100 dark:bg-zinc-800',
                borderColor: 'border-zinc-200 dark:border-zinc-700',
                label: 'Analizando...',
                description: 'Evaluando patrones de IA'
            };
        }

        if (riskLevel === null) {
            return {
                icon: Shield,
                color: 'text-zinc-400',
                bgColor: 'bg-zinc-50 dark:bg-zinc-900',
                borderColor: 'border-zinc-200 dark:border-zinc-800',
                label: 'StealthWrite™',
                description: 'Escribe para analizar'
            };
        }

        switch (riskLevel) {
            case 'low':
                return {
                    icon: ShieldCheck,
                    color: 'text-emerald-600 dark:text-emerald-400',
                    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
                    borderColor: 'border-emerald-200 dark:border-emerald-800',
                    label: `${score}% Humano`,
                    description: 'Texto indetectable ✓'
                };
            case 'medium':
                return {
                    icon: ShieldAlert,
                    color: 'text-amber-600 dark:text-amber-400',
                    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
                    borderColor: 'border-amber-200 dark:border-amber-800',
                    label: `${score}% Humano`,
                    description: 'Requiere ajustes'
                };
            case 'high':
                return {
                    icon: ShieldX,
                    color: 'text-red-600 dark:text-red-400',
                    bgColor: 'bg-red-50 dark:bg-red-950/30',
                    borderColor: 'border-red-200 dark:border-red-800',
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
                        <p className="text-xs text-zinc-400 mt-1">
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
        if (isAnalyzing || riskLevel === null) return 'bg-zinc-200 dark:bg-zinc-700';
        if (riskLevel === 'low') return 'bg-emerald-500';
        if (riskLevel === 'medium') return 'bg-amber-500';
        return 'bg-red-500';
    };

    return (
        <div className={cn('flex items-center gap-1.5', className)}>
            <div className={cn(
                'w-2 h-2 rounded-full',
                getColor(),
                isAnalyzing && 'animate-pulse'
            )} />
            <span className="text-xs font-mono text-zinc-500">
                {isAnalyzing ? '...' : riskLevel ? `${score}%` : '—'}
            </span>
        </div>
    );
}
