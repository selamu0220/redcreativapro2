import React from 'react';
import { cn } from '@/lib/utils';
import { Lightbulb, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface AlertBlockProps {
    variant: 'tip' | 'warning' | 'success' | 'info';
    title?: string;
    content: string;
}

const styles = {
    tip: {
        container: 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800',
        icon: 'text-purple-600 dark:text-purple-400',
        Icon: Lightbulb,
        defaultTitle: 'Consejo Pro'
    },
    warning: {
        container: 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800',
        icon: 'text-yellow-600 dark:text-yellow-400',
        Icon: AlertTriangle,
        defaultTitle: 'Advertencia'
    },
    success: {
        container: 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800',
        icon: 'text-green-600 dark:text-green-400',
        Icon: CheckCircle,
        defaultTitle: 'Correcto'
    },
    info: {
        container: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800',
        icon: 'text-blue-600 dark:text-blue-400',
        Icon: Info,
        defaultTitle: 'Nota'
    }
};

export function AlertBlock({ variant, title, content }: AlertBlockProps) {
    const style = styles[variant];
    const Icon = style.Icon;

    return (
        <div className={cn("my-6 p-4 rounded-lg border flex gap-4", style.container)}>
            <div className="flex-shrink-0 mt-1">
                <Icon className={cn("w-5 h-5", style.icon)} />
            </div>
            <div>
                <h4 className={cn("font-bold text-sm mb-1", style.icon)}>
                    {title || style.defaultTitle}
                </h4>
                <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {content}
                </div>
            </div>
        </div>
    );
}
