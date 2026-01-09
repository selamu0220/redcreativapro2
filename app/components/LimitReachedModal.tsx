'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Lock, Zap } from 'lucide-react';

interface LimitReachedModalProps {
    isOpen: boolean;
    onClose: () => void;
    usageCount: number;
    limit: number;
}

export default function LimitReachedModal({ isOpen, onClose, usageCount, limit }: LimitReachedModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            setTimeout(() => setIsVisible(false), 300); // Wait for animation
        }
    }, [isOpen]);

    if (!isOpen && !isVisible) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className={`relative bg-background border border-border rounded-xl max-w-md w-full p-6 shadow-2xl transform transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>

                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600 dark:text-amber-400">
                        <Lock className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                        Límite Diario Alcanzado
                    </h2>
                    <p className="text-muted-foreground">
                        Has usado tus {limit} mejoras gratuitas de hoy.
                    </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 mb-6 border border-border">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Uso hoy:</span>
                        <span className="text-sm font-bold text-destructive">{usageCount} / {limit}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-destructive h-2 rounded-full w-full"></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                        El contador se reinicia mañana.
                    </p>
                </div>

                <div className="space-y-3">
                    <Link
                        href="/planes"
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white py-3 px-4 rounded-lg font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                    >
                        <Zap className="h-4 w-4 fill-current" />
                        Actualizar a PRO (Ilimitado)
                    </Link>

                    <button
                        onClick={onClose}
                        className="w-full py-3 px-4 rounded-lg font-medium text-muted-foreground hover:bg-muted transition-colors"
                    >
                        Entendido, volveré mañana
                    </button>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-xs text-muted-foreground">
                        ¿Ya tienes Pro? <Link href="/api/auth/login" className="underline hover:text-primary">Inicia sesión</Link>
                    </p>
                </div>

            </div>
        </div>
    );
}
