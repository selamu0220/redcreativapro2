'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Download,
    Lock,
    Zap,
    Clock,
    CheckCircle2,
    Play,
    ExternalLink,
    Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

interface Blueprint {
    id: string;
    name: string;
    description: string;
    category: 'contenido' | 'seo' | 'social' | 'email' | 'analytics';
    difficulty: 'básico' | 'intermedio' | 'avanzado';
    timeSaved: string;
    steps: number;
    tools: string[];
    isPro: boolean;
    videoUrl?: string;
    downloadUrl?: string;
}

const BLUEPRINTS: Blueprint[] = [
    {
        id: 'blog-autopilot',
        name: 'Blog en Autopiloto',
        description: 'Genera, optimiza y publica artículos de blog automáticamente cada semana usando IA + Make.com + WordPress.',
        category: 'contenido',
        difficulty: 'intermedio',
        timeSaved: '10+ horas/semana',
        steps: 8,
        tools: ['Make.com', 'OpenAI', 'WordPress', 'Airtable'],
        isPro: true
    },
    {
        id: 'seo-monitoring',
        name: 'Monitor SEO Automatizado',
        description: 'Recibe alertas cuando tus keywords suben o bajan de posición. Incluye reporte semanal.',
        category: 'seo',
        difficulty: 'básico',
        timeSaved: '3 horas/semana',
        steps: 5,
        tools: ['Make.com', 'Google Search Console', 'Slack', 'Google Sheets'],
        isPro: false
    },
    {
        id: 'social-repurpose',
        name: 'Repurpose Social Automático',
        description: 'Convierte cada artículo de blog en 10+ posts para redes sociales automáticamente.',
        category: 'social',
        difficulty: 'intermedio',
        timeSaved: '8 horas/semana',
        steps: 12,
        tools: ['Make.com', 'OpenAI', 'Buffer', 'Canva'],
        isPro: true
    },
    {
        id: 'lead-nurture',
        name: 'Nurturing de Leads IA',
        description: 'Emails personalizados con IA basados en comportamiento del usuario. Aumenta conversión 40%.',
        category: 'email',
        difficulty: 'avanzado',
        timeSaved: '15+ horas/semana',
        steps: 15,
        tools: ['Make.com', 'OpenAI', 'ConvertKit', 'Segment'],
        isPro: true
    },
    {
        id: 'content-calendar',
        name: 'Calendario de Contenido IA',
        description: 'Genera un mes completo de ideas de contenido optimizadas para SEO automáticamente.',
        category: 'contenido',
        difficulty: 'básico',
        timeSaved: '5 horas/mes',
        steps: 4,
        tools: ['Make.com', 'OpenAI', 'Notion', 'Google Trends'],
        isPro: false
    },
    {
        id: 'competitor-spy',
        name: 'Espía de Competidores',
        description: 'Monitorea nuevos contenidos y backlinks de tu competencia. Recibe alertas instantáneas.',
        category: 'seo',
        difficulty: 'intermedio',
        timeSaved: '6 horas/semana',
        steps: 7,
        tools: ['Make.com', 'Ahrefs API', 'Telegram', 'Google Sheets'],
        isPro: true
    },
    {
        id: 'review-response',
        name: 'Respuestas a Reseñas IA',
        description: 'Responde automáticamente a reseñas de Google My Business con IA personalizada.',
        category: 'social',
        difficulty: 'básico',
        timeSaved: '4 horas/semana',
        steps: 5,
        tools: ['Make.com', 'OpenAI', 'Google Business'],
        isPro: true
    },
    {
        id: 'traffic-report',
        name: 'Reporte de Tráfico Semanal',
        description: 'PDF automático con métricas de tráfico, conversiones y recomendaciones IA.',
        category: 'analytics',
        difficulty: 'intermedio',
        timeSaved: '3 horas/semana',
        steps: 9,
        tools: ['Make.com', 'Google Analytics', 'OpenAI', 'PDF.co'],
        isPro: true
    }
];

const CATEGORIES = {
    contenido: { label: 'Contenido', color: 'bg-blue-500' },
    seo: { label: 'SEO', color: 'bg-green-500' },
    social: { label: 'Social', color: 'bg-pink-500' },
    email: { label: 'Email', color: 'bg-purple-500' },
    analytics: { label: 'Analytics', color: 'bg-amber-500' }
};

export default function BovedaAutomatizacionPage() {
    const { isAuthenticated, user } = useKindeBrowserClient();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // TODO: Replace with actual subscription check
    const isPro = isAuthenticated; // Placeholder - should check actual subscription

    const filteredBlueprints = selectedCategory
        ? BLUEPRINTS.filter(b => b.category === selectedCategory)
        : BLUEPRINTS;

    const handleDownload = (blueprint: Blueprint) => {
        if (blueprint.isPro && !isPro) {
            // Redirect to pricing
            window.location.href = '/planes';
            return;
        }
        // TODO: Implement actual download
        alert(`Descargando: ${blueprint.name}`);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold flex items-center gap-2">
                                <Zap className="h-5 w-5 text-amber-500" />
                                Bóveda de Automatización
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Blueprints de Make.com listos para usar
                            </p>
                        </div>
                    </div>
                    {!isPro && (
                        <Link href="/planes">
                            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                                <Sparkles className="h-4 w-4 mr-2" />
                                Desbloquear Todo
                            </Button>
                        </Link>
                    )}
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {/* Intro */}
                <div className="max-w-3xl mb-8">
                    <h2 className="text-2xl font-bold mb-2">
                        Automatiza tu Marketing con IA
                    </h2>
                    <p className="text-muted-foreground">
                        Descarga blueprints de Make.com pre-configurados para automatizar tareas repetitivas.
                        Cada automatización incluye instrucciones paso a paso y video tutorial.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
                        <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {BLUEPRINTS.length}
                            </div>
                            <div className="text-sm text-blue-700 dark:text-blue-300">Blueprints</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
                        <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                50+
                            </div>
                            <div className="text-sm text-green-700 dark:text-green-300">Horas ahorradas/mes</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
                        <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                15+
                            </div>
                            <div className="text-sm text-purple-700 dark:text-purple-300">Herramientas integradas</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800">
                        <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                                100%
                            </div>
                            <div className="text-sm text-amber-700 dark:text-amber-300">Plug & Play</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 mb-6">
                    <Button
                        variant={selectedCategory === null ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(null)}
                    >
                        Todos
                    </Button>
                    {Object.entries(CATEGORIES).map(([key, { label }]) => (
                        <Button
                            key={key}
                            variant={selectedCategory === key ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedCategory(key)}
                        >
                            {label}
                        </Button>
                    ))}
                </div>

                {/* Blueprints Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBlueprints.map((blueprint) => {
                        const category = CATEGORIES[blueprint.category];
                        const isLocked = blueprint.isPro && !isPro;

                        return (
                            <Card
                                key={blueprint.id}
                                className={cn(
                                    "relative overflow-hidden transition-all hover:shadow-lg",
                                    isLocked && "opacity-80"
                                )}
                            >
                                {blueprint.isPro && (
                                    <div className="absolute top-3 right-3">
                                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                                            PRO
                                        </Badge>
                                    </div>
                                )}

                                <CardHeader>
                                    <div className="flex items-start gap-3">
                                        <div className={cn(
                                            "w-10 h-10 rounded-lg flex items-center justify-center text-white",
                                            category.color
                                        )}>
                                            <Zap className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-lg">{blueprint.name}</CardTitle>
                                            <Badge variant="outline" className="mt-1 text-xs">
                                                {category.label}
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardDescription className="mt-2">
                                        {blueprint.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Stats */}
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            <span>{blueprint.timeSaved}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <CheckCircle2 className="h-4 w-4" />
                                            <span>{blueprint.steps} pasos</span>
                                        </div>
                                    </div>

                                    {/* Tools */}
                                    <div className="flex flex-wrap gap-1">
                                        {blueprint.tools.map((tool) => (
                                            <Badge key={tool} variant="secondary" className="text-xs">
                                                {tool}
                                            </Badge>
                                        ))}
                                    </div>

                                    {/* Difficulty */}
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline" className={cn(
                                            "text-xs",
                                            blueprint.difficulty === 'básico' && "border-green-500 text-green-600",
                                            blueprint.difficulty === 'intermedio' && "border-amber-500 text-amber-600",
                                            blueprint.difficulty === 'avanzado' && "border-red-500 text-red-600"
                                        )}>
                                            {blueprint.difficulty}
                                        </Badge>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            disabled={isLocked}
                                        >
                                            <Play className="h-4 w-4 mr-1" />
                                            Ver Tutorial
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleDownload(blueprint)}
                                        >
                                            {isLocked ? (
                                                <>
                                                    <Lock className="h-4 w-4 mr-1" />
                                                    Desbloquear
                                                </>
                                            ) : (
                                                <>
                                                    <Download className="h-4 w-4 mr-1" />
                                                    Descargar
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* CTA for non-Pro */}
                {!isPro && (
                    <Card className="mt-12 bg-gradient-to-r from-zinc-900 to-zinc-800 text-white border-0">
                        <CardContent className="p-8 text-center">
                            <h3 className="text-2xl font-bold mb-2">
                                Desbloquea Todas las Automatizaciones
                            </h3>
                            <p className="text-zinc-300 mb-6 max-w-xl mx-auto">
                                Con el plan Pro obtienes acceso a todos los blueprints, updates mensuales,
                                y soporte prioritario para implementar tus automatizaciones.
                            </p>
                            <Link href="/planes">
                                <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600">
                                    <Sparkles className="h-5 w-5 mr-2" />
                                    Ver Planes Pro
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
}
