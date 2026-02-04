import React from 'react';
import { Quote } from 'lucide-react';
import { OptimizedImage } from '@/app/components/OptimizedImage';

interface ExpertQuoteProps {
    quote: string;
    author: string;
    role: string;
    avatar: string;
}

export function ExpertQuote({ quote, author, role, avatar }: ExpertQuoteProps) {
    return (
        <div className="my-10 relative">
            <div className="absolute -top-4 -left-2 text-blue-100 dark:text-blue-900/30">
                <Quote className="w-16 h-16 transform -scale-x-100" />
            </div>

            <div className="relative bg-white dark:bg-gray-900 rounded-xl p-8 shadow-sm border-l-4 border-blue-500 z-10">
                <blockquote className="text-xl font-medium text-gray-800 dark:text-gray-200 italic mb-6 leading-relaxed">
                    "{quote}"
                </blockquote>

                <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-gray-800 shadow-sm">
                        <OptimizedImage
                            src={avatar}
                            alt={author}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div>
                        <div className="font-bold text-gray-900 dark:text-white">
                            {author}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {role}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
