'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function BlogError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Blog error:', error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-background">
            <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-full mb-6">
                <AlertCircle className="w-12 h-12 text-red-500" />
            </div>

            <h2 className="text-3xl font-bold tracking-tight mb-3">
                Error en el Blog
            </h2>

            <p className="text-muted-foreground max-w-md mb-8">
                Lo sentimos, hubo un problema al cargar el contenido del blog.
                Puede ser un problema temporal de conexión.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={() => reset()} variant="default" className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Intentar de nuevo
                </Button>

                <Link href="/blog">
                    <Button variant="outline" className="gap-2 w-full">
                        <ArrowLeft className="w-4 h-4" />
                        Volver al Blog
                    </Button>
                </Link>
            </div>

            {/* Dev Info ALWAYS VISIBLE FOR DEBUGGING */}
            <div className="mt-12 p-4 bg-muted rounded-lg text-left max-w-2xl w-full overflow-hidden">
                <p className="font-mono text-xs text-red-500 mb-2">DEBUG MODE ACTIVATED</p>
                <p className="font-mono text-xs text-red-500 mb-2">{error.message}</p>
                <div className="text-[10px] text-muted-foreground overflow-auto max-h-40 whitespace-pre-wrap">
                    {error.stack || JSON.stringify(error, null, 2)}
                </div>
            </div>
        </div>
    );
}
