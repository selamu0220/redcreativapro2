'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('[Blog Error Boundary]', error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-red-50 dark:bg-red-950/30 p-6 rounded-full mb-6">
                <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>

            <h2 className="text-3xl font-black mb-3">Algo salió mal</h2>
            <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
                No pudimos cargar este artículo debido a un error inesperado. Hemos notificado al equipo técnico.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Button
                    onClick={() => reset()}
                    className="font-bold shadow-lg shadow-primary/20"
                >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Intentar de nuevo
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/blog">
                        <Home className="w-4 h-4 mr-2" />
                        Volver al Blog
                    </Link>
                </Button>
            </div>

            {(process.env.NODE_ENV === 'development' || true) && (
                <div className="mt-12 p-4 bg-muted/50 rounded-xl text-left max-w-lg w-full overflow-hidden border border-border/50">
                    <p className="font-mono text-xs text-muted-foreground mb-2 font-bold uppercase tracking-wider">Detalles del Error (Debug):</p>
                    <pre className="text-xs font-mono text-red-500 whitespace-pre-wrap break-all">
                        {error.message || 'Error desconocido'}
                        {error.digest && `\nDigest: ${error.digest}`}
                    </pre>
                </div>
            )}
        </div>
    );
}
