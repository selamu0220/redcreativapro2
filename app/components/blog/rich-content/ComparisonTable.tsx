import React from 'react';
import { Check, X, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComparisonTableProps {
    title?: string;
    headers: string[];
    rows: string[][];
    verdict?: string;
}

export function ComparisonTable({ title, headers, rows, verdict }: ComparisonTableProps) {
    return (
        <div className="my-12">
            {title && (
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                    {title}
                </h3>
            )}

            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white">
                        <tr>
                            {headers.map((header, i) => (
                                <th
                                    key={i}
                                    className={cn(
                                        "px-6 py-4 font-bold uppercase tracking-wider text-xs",
                                        i === 0 ? "sticky left-0 bg-gray-50 dark:bg-gray-900 z-10" : ""
                                    )}
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                        {rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                {row.map((cell, cellIndex) => (
                                    <td
                                        key={cellIndex}
                                        className={cn(
                                            "px-6 py-4 whitespace-pre-wrap text-gray-600 dark:text-gray-300",
                                            cellIndex === 0 ? "sticky left-0 bg-white dark:bg-gray-900 font-medium text-gray-900 dark:text-white z-10" : ""
                                        )}
                                    >
                                        {renderCellContent(cell)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {verdict && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 rounded-lg text-sm border border-blue-100 dark:border-blue-800">
                    <strong>Veredicto:</strong> {verdict}
                </div>
            )}
        </div>
    );
}

function renderCellContent(text: string) {
    if (text.toLowerCase() === 'true' || text === '✅') {
        return <Check className="w-5 h-5 text-green-500" />;
    }
    if (text.toLowerCase() === 'false' || text === '❌') {
        return <X className="w-5 h-5 text-red-500" />;
    }
    if (text === '-') {
        return <Minus className="w-5 h-5 text-gray-400" />;
    }
    return text;
}
