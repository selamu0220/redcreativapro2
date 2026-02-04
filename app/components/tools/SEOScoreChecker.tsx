'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Search, CheckCircle2, AlertTriangle, XCircle, Loader2, Lock, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface SEOScoreCheckerProps {
    showEmailCapture?: boolean;
}

interface SEOResult {
    score: number;
    title: { status: 'good' | 'warning' | 'error'; message: string };
    meta: { status: 'good' | 'warning' | 'error'; message: string };
    h1: { status: 'good' | 'warning' | 'error'; message: string };
    images: { status: 'good' | 'warning' | 'error'; message: string };
    performance: { status: 'good' | 'warning' | 'error'; message: string };
}

const STATUS_ICONS = {
    good: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    warning: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
    error: <XCircle className="w-4 h-4 text-red-500" />
};

export function SEOScoreChecker({ showEmailCapture = true }: SEOScoreCheckerProps) {
    const [url, setUrl] = useState('');
    const [email, setEmail] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<SEOResult | null>(null);
    const [showResults, setShowResults] = useState(false);

    const simulateAnalysis = async () => {
        if (!url) {
            toast.error('Por favor, introduce una URL');
            return;
        }

        setIsAnalyzing(true);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2500));

        // Generate mock results based on URL
        const mockResult: SEOResult = {
            score: Math.floor(Math.random() * 30) + 55, // 55-85
            title: {
                status: Math.random() > 0.3 ? 'good' : 'warning',
                message: Math.random() > 0.3
                    ? 'Título optimizado (58 caracteres)'
                    : 'Título demasiado largo (72 caracteres)'
            },
            meta: {
                status: Math.random() > 0.5 ? 'good' : 'warning',
                message: Math.random() > 0.5
                    ? 'Meta descripción presente y optimizada'
                    : 'Meta descripción podría incluir más keywords'
            },
            h1: {
                status: Math.random() > 0.7 ? 'good' : 'error',
                message: Math.random() > 0.7
                    ? 'Un único H1 detectado'
                    : 'Múltiples H1 detectados (problema)'
            },
            images: {
                status: Math.random() > 0.4 ? 'warning' : 'good',
                message: Math.random() > 0.4
                    ? '3 imágenes sin atributo ALT'
                    : 'Todas las imágenes tienen ALT'
            },
            performance: {
                status: Math.random() > 0.5 ? 'warning' : 'good',
                message: Math.random() > 0.5
                    ? 'LCP: 3.2s (mejorable)'
                    : 'LCP: 1.8s (excelente)'
            }
        };

        setResult(mockResult);
        setIsAnalyzing(false);

        if (showEmailCapture) {
            setShowResults(false); // Need email first
        } else {
            setShowResults(true);
        }
    };

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !email.includes('@')) {
            toast.error('Por favor, introduce un email válido');
            return;
        }

        // In production, this would send to an email service
        toast.success('¡Análisis desbloqueado! Revisa los resultados.');
        setShowResults(true);
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getScoreGradient = (score: number) => {
        if (score >= 80) return 'from-green-500 to-emerald-500';
        if (score >= 60) return 'from-yellow-500 to-orange-500';
        return 'from-red-500 to-rose-500';
    };

    return (
        <Card className="relative overflow-hidden border-2 border-blue-500/30 bg-gradient-to-br from-blue-950/20 via-gray-900/50 to-gray-900/80 backdrop-blur-sm">
            {/* Decorative elements */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl" />

            <CardHeader className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <Search className="w-5 h-5 text-blue-400" />
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                        Auditoría SEO Gratis
                    </Badge>
                </div>
                <CardTitle className="text-white text-xl">
                    Analiza tu página en segundos
                </CardTitle>
                <CardDescription className="text-gray-400">
                    Descubre errores SEO críticos que están matando tu ranking
                </CardDescription>
            </CardHeader>

            <CardContent className="relative z-10 space-y-4">
                {/* URL Input */}
                <div className="flex gap-2">
                    <Input
                        type="url"
                        placeholder="https://tu-sitio.com/pagina"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                    />
                    <Button
                        onClick={simulateAnalysis}
                        disabled={isAnalyzing}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shrink-0"
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Analizando...
                            </>
                        ) : (
                            <>
                                <Search className="w-4 h-4 mr-2" />
                                Analizar
                            </>
                        )}
                    </Button>
                </div>

                {/* Results Section */}
                {result && !showResults && showEmailCapture && (
                    <div className="space-y-4 mt-6">
                        {/* Blurred Preview */}
                        <div className="relative">
                            <div className="blur-sm pointer-events-none opacity-60">
                                <div className="text-center mb-4">
                                    <span className={`text-5xl font-bold ${getScoreColor(result.score)}`}>
                                        {result.score}
                                    </span>
                                    <span className="text-gray-400">/100</span>
                                </div>
                                <Progress value={result.score} className="h-2" />
                            </div>

                            {/* Lock Overlay */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 rounded-lg">
                                <Lock className="w-8 h-8 text-blue-400 mb-2" />
                                <p className="text-white font-medium text-center">
                                    Desbloquea tu análisis completo
                                </p>
                            </div>
                        </div>

                        {/* Email Capture Form */}
                        <form onSubmit={handleEmailSubmit} className="space-y-3">
                            <Input
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                            />
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Ver Resultados Gratis
                            </Button>
                            <p className="text-xs text-gray-500 text-center">
                                Te enviaremos tips SEO personalizados. Sin spam.
                            </p>
                        </form>
                    </div>
                )}

                {/* Full Results */}
                {result && showResults && (
                    <div className="space-y-4 mt-6">
                        {/* Score Display */}
                        <div className="text-center mb-6">
                            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br ${getScoreGradient(result.score)} p-1`}>
                                <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                                    <span className={`text-3xl font-bold ${getScoreColor(result.score)}`}>
                                        {result.score}
                                    </span>
                                </div>
                            </div>
                            <p className="text-gray-400 mt-2">Puntuación SEO</p>
                        </div>

                        {/* Detailed Results */}
                        <div className="space-y-3">
                            {Object.entries({
                                'Título': result.title,
                                'Meta Descripción': result.meta,
                                'Estructura H1': result.h1,
                                'Imágenes': result.images,
                                'Performance': result.performance
                            }).map(([label, data]) => (
                                <div key={label} className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                                    {STATUS_ICONS[data.status]}
                                    <div>
                                        <p className="text-white font-medium text-sm">{label}</p>
                                        <p className="text-gray-400 text-xs">{data.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* CTA */}
                        <div className="pt-4">
                            <Button
                                asChild
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
                            >
                                <a href="/escritor-ia">
                                    Mejora tu contenido con IA →
                                </a>
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
