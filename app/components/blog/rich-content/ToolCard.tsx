import React from 'react';
import { ExternalLink, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ToolCardProps {
    name: string;
    description: string;
    price: string;
    rating: number;
    href: string;
}

export function ToolCard({ name, description, price, rating, href }: ToolCardProps) {
    return (
        <div className="my-8 flex flex-col md:flex-row items-center gap-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {name}
                    </h3>
                    <div className="flex items-center bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded text-xs font-bold">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        {rating}/5
                    </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                    {description}
                </p>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Precio: {price}
                </p>
            </div>

            <div className="flex-shrink-0">
                <a href={href} target="_blank" rel="noopener noreferrer">
                    <Button variant="default" size="lg" className="gap-2">
                        Probar Herramienta
                        <ExternalLink className="w-4 h-4" />
                    </Button>
                </a>
            </div>
        </div>
    );
}
