'use client';

import React from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Bot,
    Sparkles,
    Target,
    TrendingUp,
    CheckCircle2,
    BookOpen,
    Lightbulb,
    MessageSquare,
    Search,
    ExternalLink,
    Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useAuth } from '@/app/hooks/useAuth';

const GUIDE_SECTIONS = [
    {
        id: 'intro',
        title: '¿Por Qué Posicionarte en IAs?',
        icon: Lightbulb,
        content: `
      Las IAs conversacionales como ChatGPT y Gemini están cambiando cómo las personas buscan información.
      Ya no solo dependen de Google - ahora preguntan directamente a las IAs.
      
      **La oportunidad:**
      - ChatGPT tiene +200 millones de usuarios activos
      - Gemini está integrado en todo el ecosistema Google
      - Las IAs citan fuentes, enviando tráfico directo a tu web
      
      **El problema:**
      - Si no optimizas tu contenido para IAs, otros lo harán
      - Las IAs priorizan contenido estructurado y de autoridad
      - Los primeros en optimizar tendrán ventaja competitiva
    `
    },
    {
        id: 'como-funcionan',
        title: 'Cómo "Razonan" las IAs',
        icon: Bot,
        content: `
      Entender cómo procesan información las IAs es clave para aparecer en sus respuestas.
      
      **ChatGPT (OpenAI):**
      - Entrenado con datos hasta cierta fecha (knowledge cutoff)
      - Puede navegar la web en tiempo real (GPT-4 con browsing)
      - Prioriza fuentes con alta autoridad de dominio
      - Le gustan las respuestas estructuradas y directas
      
      **Gemini (Google):**
      - Acceso en tiempo real al índice de Google
      - Favorece contenido que ya rankea bien en búsquedas
      - Integrado con Search, Maps, YouTube
      - Cita fuentes con enlaces directos
      
      **Perplexity:**
      - Diseñado para citar fuentes siempre
      - Combina múltiples resultados de búsqueda
      - Ideal para contenido técnico y de investigación
    `
    },
    {
        id: 'estrategias',
        title: 'Estrategias de Optimización',
        icon: Target,
        content: `
      Optimiza tu contenido para que las IAs te citen como fuente.
      
      **1. Respuestas Directas (Zero-Click Content)**
      - Responde preguntas en las primeras 2-3 oraciones
      - Usa el formato: "X es [definición directa]"
      - Incluye datos específicos, números, estadísticas
      
      **2. Estructura Clara**
      - Usa H2/H3 con preguntas exactas que la gente hace
      - Listas y tablas comparativas
      - Schema markup (FAQ, HowTo, Article)
      
      **3. Autoridad y Confianza**
      - Cita fuentes autorizadas
      - Incluye autor con bio y credenciales
      - Actualiza contenido regularmente (fecha visible)
      
      **4. Contenido Único**
      - Datos propios y estudios originales
      - Casos de uso específicos de tu industria
      - Perspectivas contraintuitivas bien argumentadas
    `
    },
    {
        id: 'seo-para-ia',
        title: 'SEO Tradicional vs SEO para IA',
        icon: Search,
        content: `
      Las IAs utilizan el índice de búsqueda, pero priorizan diferente.
      
      | SEO Tradicional | SEO para IA |
      |-----------------|-------------|
      | Keywords exactas | Lenguaje natural |
      | Densidad de keyword | Contexto semántico |
      | Backlinks cantidad | Autoridad de citas |
      | Meta description | Respuesta directa |
      | Posición #1 | Ser LA fuente citada |
      
      **Lo que las IAs valoran:**
      - Frescura: Contenido actualizado recientemente
      - Profundidad: Cobertura exhaustiva del tema
      - Claridad: Respuestas concisas y bien estructuradas
      - Verificabilidad: Datos que pueden contrastar
    `
    },
    {
        id: 'prompts-optimizacion',
        title: 'Prompts para Auto-Optimizar',
        icon: MessageSquare,
        content: `
      Usa estas instrucciones al generar contenido con IA:
      
      **Para Artículos:**
      "Escribe un artículo sobre [TEMA] optimizado para ser citado por IAs conversacionales.
      Incluye:
      - Respuesta directa en el primer párrafo
      - Estructura con H2 en formato pregunta
      - Datos específicos y verificables
      - Sección de FAQ con 5 preguntas comunes"
      
      **Para Páginas de Producto/Servicio:**
      "Describe [PRODUCTO] de forma que una IA pueda recomendarlo.
      Incluye:
      - Definición clara en una oración
      - 3-5 casos de uso específicos
      - Comparación objetiva con alternativas
      - Datos de rendimiento si existen"
      
      **Para Contenido Técnico:**
      "Explica [CONCEPTO] para que sea citado como fuente autorizada.
      Incluye:
      - Definición técnica precisa
      - Ejemplo práctico paso a paso
      - Errores comunes a evitar
      - Recursos adicionales verificables"
    `
    },
    {
        id: 'metricas',
        title: 'Métricas y Seguimiento',
        icon: TrendingUp,
        content: `
      ¿Cómo saber si las IAs te están citando?
      
      **Herramientas de Monitoreo:**
      - Busca tu marca en ChatGPT/Gemini periódicamente
      - Configura alertas de Google para menciones
      - Usa Perplexity y revisa si apareces en fuentes
      
      **Indicadores Indirectos:**
      - Tráfico de referral inusual
      - Aumento en búsquedas de marca
      - Enlaces desde dominios de IA (bing.com, perplexity.ai)
      
      **Experimento Práctico:**
      1. Elige 5 preguntas de tu industria
      2. Pregunta a ChatGPT, Gemini y Perplexity
      3. Anota qué fuentes citan
      4. Analiza qué tienen en común
      5. Aplica esos patrones a tu contenido
    `
    }
];

export default function GuiaGeminiChatGPTPage() {
    const { isAuthenticated } = useAuth();

    // TODO: Replace with actual subscription check
    const isPro = isAuthenticated;

    if (!isPro) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardHeader className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock className="h-8 w-8 text-white" />
                        </div>
                        <CardTitle>Contenido Exclusivo Pro</CardTitle>
                        <CardDescription>
                            Esta guía está disponible solo para miembros Pro
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                Estrategias de posicionamiento en IAs
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                Prompts de optimización listos para usar
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                Métricas y seguimiento de citas
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                Actualizaciones mensuales
                            </li>
                        </ul>
                        <Link href="/planes" className="block">
                            <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
                                <Sparkles className="h-4 w-4 mr-2" />
                                Desbloquear con Pro
                            </Button>
                        </Link>
                        <Link href="/" className="block">
                            <Button variant="outline" className="w-full">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver al inicio
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <Bot className="h-5 w-5 text-purple-500" />
                            Guía: Posicionamiento en Gemini y ChatGPT
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Cómo aparecer citado en las respuestas de IAs conversacionales
                        </p>
                    </div>
                    <Badge className="ml-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                        PRO
                    </Badge>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Intro Card */}
                    <Card className="mb-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shrink-0">
                                    <BookOpen className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold mb-2">
                                        El Futuro del SEO está en las IAs
                                    </h2>
                                    <p className="text-muted-foreground">
                                        Esta guía te enseña a optimizar tu contenido para que ChatGPT, Gemini y otras IAs
                                        te citen como fuente autorizada. Incluye estrategias prácticas, prompts listos para usar,
                                        y métricas para medir tu progreso.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Table of Contents */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="text-lg">Contenido de la Guía</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <nav className="space-y-1">
                                {GUIDE_SECTIONS.map((section, index) => {
                                    const Icon = section.icon;
                                    return (
                                        <a
                                            key={section.id}
                                            href={`#${section.id}`}
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                                        >
                                            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                                                {index + 1}
                                            </span>
                                            <Icon className="h-4 w-4 text-muted-foreground" />
                                            <span>{section.title}</span>
                                        </a>
                                    );
                                })}
                            </nav>
                        </CardContent>
                    </Card>

                    {/* Sections */}
                    <div className="space-y-8">
                        {GUIDE_SECTIONS.map((section, index) => {
                            const Icon = section.icon;
                            return (
                                <section key={section.id} id={section.id} className="scroll-mt-20">
                                    <Card>
                                        <CardHeader>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <Icon className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <Badge variant="outline" className="mb-1">
                                                        Sección {index + 1}
                                                    </Badge>
                                                    <CardTitle>{section.title}</CardTitle>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="prose prose-zinc dark:prose-invert max-w-none">
                                                {section.content.split('\n').map((line, i) => {
                                                    const trimmed = line.trim();
                                                    if (!trimmed) return null;

                                                    if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                                                        return (
                                                            <h4 key={i} className="font-semibold mt-4 mb-2">
                                                                {trimmed.replace(/\*\*/g, '')}
                                                            </h4>
                                                        );
                                                    }
                                                    if (trimmed.startsWith('- ')) {
                                                        return (
                                                            <li key={i} className="ml-4">
                                                                {trimmed.substring(2)}
                                                            </li>
                                                        );
                                                    }
                                                    if (trimmed.startsWith('|')) {
                                                        // Skip table rows for now - could be enhanced
                                                        return null;
                                                    }
                                                    return <p key={i} className="my-2">{trimmed}</p>;
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </section>
                            );
                        })}
                    </div>

                    {/* Resources */}
                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ExternalLink className="h-5 w-5" />
                                Recursos Adicionales
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <a
                                    href="https://chat.openai.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-4 border rounded-lg hover:bg-muted transition-colors flex items-center gap-3"
                                >
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                                        <Bot className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <div className="font-medium">ChatGPT</div>
                                        <div className="text-sm text-muted-foreground">Probar respuestas</div>
                                    </div>
                                </a>
                                <a
                                    href="https://gemini.google.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-4 border rounded-lg hover:bg-muted transition-colors flex items-center gap-3"
                                >
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                        <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <div className="font-medium">Google Gemini</div>
                                        <div className="text-sm text-muted-foreground">Probar respuestas</div>
                                    </div>
                                </a>
                                <a
                                    href="https://perplexity.ai"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-4 border rounded-lg hover:bg-muted transition-colors flex items-center gap-3"
                                >
                                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                        <Search className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <div className="font-medium">Perplexity</div>
                                        <div className="text-sm text-muted-foreground">Ver fuentes citadas</div>
                                    </div>
                                </a>
                                <Link
                                    href="/escritor-ia"
                                    className="p-4 border rounded-lg hover:bg-muted transition-colors flex items-center gap-3"
                                >
                                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                                        <Target className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div>
                                        <div className="font-medium">Escritor IA</div>
                                        <div className="text-sm text-muted-foreground">Crear contenido optimizado</div>
                                    </div>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
