'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Copy, Wand2, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface PromptGeneratorProps {
    category?: 'blog' | 'social' | 'email' | 'ads';
}

const PROMPT_TEMPLATES = {
    blog: {
        label: 'Blog SEO',
        icon: '📝',
        templates: [
            {
                name: 'Artículo Pilar',
                prompt: `Escribe un artículo de 2500 palabras sobre [TEMA] para posicionar en Google. Incluye:
- Título SEO optimizado (máx 60 caracteres)
- Meta descripción (máx 155 caracteres)
- 5 H2 y 3 H3 por sección
- Una pregunta frecuente por sección
- Conclusión con CTA

Tono: Profesional pero accesible. Evita frases genéricas.`
            },
            {
                name: 'Listicle Viral',
                prompt: `Crea un listicle de "Top 10 [TEMA]" optimizado para SEO. Estructura:
- H1: Título con número + año actual
- Introducción de 100 palabras con la keyword principal
- Cada ítem: H2 con número, descripción de 150 palabras, pros/contras
- Sección de comparación en tabla
- Conclusión con recomendación personal`
            }
        ]
    },
    social: {
        label: 'Redes Sociales',
        icon: '📱',
        templates: [
            {
                name: 'Carrusel LinkedIn',
                prompt: `Diseña un carrusel de 10 slides sobre [TEMA] para LinkedIn:
- Slide 1: Hook que genere curiosidad (problema común)
- Slides 2-8: Un punto clave por slide, máximo 30 palabras
- Slide 9: Resumen visual o framework
- Slide 10: CTA + pregunta para comentarios

Incluye sugerencias de emojis y colores de fondo.`
            },
            {
                name: 'Thread Twitter/X',
                prompt: `Escribe un thread de 8-10 tweets sobre [TEMA]:
- Tweet 1: Hook polémico o contraintuitivo
- Tweets 2-7: Una idea por tweet, datos concretos
- Tweet 8: Resumen en bullets
- Tweet final: CTA y engagement question

Usa números, no bullets. Incluye [ESPACIO] para hilos visuales.`
            }
        ]
    },
    email: {
        label: 'Email Marketing',
        icon: '✉️',
        templates: [
            {
                name: 'Secuencia Welcome',
                prompt: `Crea una secuencia de 5 emails de bienvenida para [TIPO DE NEGOCIO]:
- Email 1 (Día 0): Bienvenida + entrega del lead magnet
- Email 2 (Día 2): Historia personal + problema resuelto
- Email 3 (Día 4): Caso de estudio + prueba social
- Email 4 (Día 6): Objeción principal + respuesta
- Email 5 (Día 7): Oferta + urgencia

Cada email: Subject line A/B, preview text, cuerpo, CTA.`
            }
        ]
    },
    ads: {
        label: 'Publicidad',
        icon: '🎯',
        templates: [
            {
                name: 'Google Ads Copy',
                prompt: `Genera 5 variaciones de anuncios de Google para [PRODUCTO/SERVICIO]:
Por cada anuncio:
- Headline 1 (30 chars): Beneficio principal
- Headline 2 (30 chars): Diferenciador
- Headline 3 (30 chars): CTA con urgencia
- Description 1 (90 chars): Propuesta de valor
- Description 2 (90 chars): Prueba social o garantía

Incluye extensiones sugeridas (sitelinks, callouts).`
            }
        ]
    }
};

export function PromptGenerator({ category = 'blog' }: PromptGeneratorProps) {
    const [selectedCategory, setSelectedCategory] = useState<keyof typeof PROMPT_TEMPLATES>(category);
    const [selectedTemplate, setSelectedTemplate] = useState(0);
    const [copied, setCopied] = useState(false);

    const currentCategory = PROMPT_TEMPLATES[selectedCategory];
    const currentPrompt = currentCategory.templates[selectedTemplate];

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(currentPrompt.prompt);
            setCopied(true);
            toast.success('¡Prompt copiado! Pégalo en el Escritor IA.');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Error al copiar');
        }
    }, [currentPrompt.prompt]);

    const handleRandomize = () => {
        const templates = currentCategory.templates;
        const nextIndex = (selectedTemplate + 1) % templates.length;
        setSelectedTemplate(nextIndex);
    };

    return (
        <Card className="relative overflow-hidden border-2 border-purple-500/30 bg-gradient-to-br from-purple-950/20 via-gray-900/50 to-gray-900/80 backdrop-blur-sm">
            {/* Decorative elements */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl" />

            <CardHeader className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                        Generador de Prompts
                    </Badge>
                </div>
                <CardTitle className="text-white text-xl">
                    Copia y pega en el Escritor IA
                </CardTitle>
                <CardDescription className="text-gray-400">
                    Prompts probados para generar contenido de alta conversión
                </CardDescription>
            </CardHeader>

            <CardContent className="relative z-10 space-y-4">
                {/* Category Selector */}
                <div className="flex flex-wrap gap-2">
                    {(Object.keys(PROMPT_TEMPLATES) as Array<keyof typeof PROMPT_TEMPLATES>).map((key) => (
                        <Button
                            key={key}
                            variant={selectedCategory === key ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                                setSelectedCategory(key);
                                setSelectedTemplate(0);
                            }}
                            className={selectedCategory === key
                                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                : 'border-gray-600 text-gray-300 hover:bg-gray-800'
                            }
                        >
                            <span className="mr-1">{PROMPT_TEMPLATES[key].icon}</span>
                            {PROMPT_TEMPLATES[key].label}
                        </Button>
                    ))}
                </div>

                {/* Template Name */}
                <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Wand2 className="w-4 h-4 text-purple-400" />
                        {currentPrompt.name}
                    </h4>
                    {currentCategory.templates.length > 1 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRandomize}
                            className="text-gray-400 hover:text-white hover:bg-gray-800"
                        >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Siguiente
                        </Button>
                    )}
                </div>

                {/* Prompt Display */}
                <div className="relative">
                    <pre className="bg-gray-950/80 border border-gray-700 rounded-lg p-4 text-sm text-gray-300 whitespace-pre-wrap font-mono overflow-x-auto max-h-64 overflow-y-auto">
                        {currentPrompt.prompt}
                    </pre>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <Button
                        onClick={handleCopy}
                        className={`flex-1 ${copied
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                            } text-white font-semibold`}
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4 mr-2" />
                                ¡Copiado!
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4 mr-2" />
                                Copiar Prompt
                            </>
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        asChild
                        className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                    >
                        <a href="/escritor-ia">
                            Abrir Escritor IA →
                        </a>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
