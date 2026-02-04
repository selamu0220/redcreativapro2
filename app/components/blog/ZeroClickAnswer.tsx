import React from 'react';
import { Sparkles } from 'lucide-react';

interface ZeroClickAnswerProps {
    answer: string;
}

export function ZeroClickAnswer({ answer }: ZeroClickAnswerProps) {
    return (
        <div className="my-6 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-wide">
                <Sparkles className="w-4 h-4" />
                <span>Respuesta Rápida</span>
            </div>
            <p className="text-lg md:text-xl font-medium text-gray-800 dark:text-gray-100 leading-relaxed">
                {answer}
            </p>
        </div>
    );
}
