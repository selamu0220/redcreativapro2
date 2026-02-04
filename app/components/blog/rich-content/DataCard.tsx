import React from 'react';
import { TrendingUp, Info } from 'lucide-react';

interface DataCardProps {
    value: string;
    label: string;
    description: string;
    source?: string;
}

export function DataCard({ value, label, description, source }: DataCardProps) {
    return (
        <div className="my-8 mx-auto max-w-sm bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-800 text-center">
            <div className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {label}
            </div>
            <div className="text-4xl md:text-5xl font-black text-blue-600 dark:text-blue-400 mb-4 tracking-tight">
                {value}
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
                {description}
            </p>
            {source && (
                <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
                    <Info className="w-3 h-3" />
                    <span>Fuente: {source}</span>
                </div>
            )}
        </div>
    );
}
