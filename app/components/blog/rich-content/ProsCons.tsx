import React from 'react';
import { ThumbsUp, ThumbsDown, Check, X } from 'lucide-react';

interface ProsConsProps {
    pros: string[];
    cons: string[];
}

export function ProsCons({ pros, cons }: ProsConsProps) {
    return (
        <div className="my-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pros Column */}
            <div className="bg-green-50/50 dark:bg-green-900/10 rounded-xl p-6 border border-green-100 dark:border-green-900/30">
                <div className="flex items-center gap-2 mb-4 text-green-700 dark:text-green-400">
                    <ThumbsUp className="w-5 h-5" />
                    <h3 className="font-bold text-lg">Lo Bueno</h3>
                </div>
                <ul className="space-y-3">
                    {pros.map((pro, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300 text-sm">
                            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{pro}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Cons Column */}
            <div className="bg-red-50/50 dark:bg-red-900/10 rounded-xl p-6 border border-red-100 dark:border-red-900/30">
                <div className="flex items-center gap-2 mb-4 text-red-700 dark:text-red-400">
                    <ThumbsDown className="w-5 h-5" />
                    <h3 className="font-bold text-lg">Lo Malo</h3>
                </div>
                <ul className="space-y-3">
                    {cons.map((con, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300 text-sm">
                            <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <span>{con}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
