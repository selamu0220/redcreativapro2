import React from 'react';
import { Lightbulb } from 'lucide-react';

interface KeyTakeawaysProps {
    title?: string;
    points: string[];
}

export function KeyTakeaways({ title = "Conclusiones Clave", points }: KeyTakeawaysProps) {
    return (
        <div className="my-8 p-1 rounded-xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-blue-600 dark:text-blue-400">
                    <Lightbulb className="w-5 h-5 fill-current" />
                    <h3 className="font-bold text-lg">{title}</h3>
                </div>
                <ul className="space-y-3">
                    {points.map((point, i) => (
                        <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                            <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />
                            <span>{point}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
