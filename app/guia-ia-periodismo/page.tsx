import { Metadata } from 'next'
import Link from 'next/link'
import { SchemaJSONLD } from '@/lib/seo/SchemaJSONLD'
import { Article, BreadcrumbList, WithContext } from 'schema-dts'
import { FAQSection } from '@/app/components/seo/FAQSection'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle2, Mic, PenTool, Search } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Guía Definitiva de IA para Periodistas (2025) | Red Creativa Pro',
    description: 'Descubre las mejores herramientas de IA para periodistas: Transcripción, Verificación de Datos, Redacción Asistida y SEO. Guía completa y actualizada.',
    alternates: {
        canonical: 'https://redcreativa.pro/guia-ia-periodismo',
    },
    openGraph: {
        title: 'Guía Definitiva de IA para Periodistas (2025)',
        description: 'Manual completo: herramientas, ética y trucos para usar IA en redacciones.',
        type: 'article',
        url: 'https://redcreativa.pro/guia-ia-periodismo',
        images: [{ url: 'https://redcreativa.pro/api/og?title=Guia%20IA%20Periodistas%202025', width: 1200, height: 630 }],
    }
}

export default function GuidePage() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://redcreativa.pro'

    const articleSchema: WithContext<Article> = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Guía Definitiva de Inteligencia Artificial para Periodistas en 2025',
        description: 'Las mejores herramientas y estrategias para integrar la IA en el flujo de trabajo periodístico sin perder la ética profesional.',
        image: [`${baseUrl}/api/og?title=Guia%20IA%20Periodistas%202025`],
        datePublished: new Date().toISOString(),
        author: {
            '@type': 'Organization',
            name: 'Red Creativa Pro Editorial Team',
            url: baseUrl
        },
        publisher: {
            '@type': 'Organization',
            name: 'Red Creativa Pro',
            logo: {
                '@type': 'ImageObject',
                url: `${baseUrl}/icon.png`
            }
        }
    }

    const breadcrumbSchema: WithContext<BreadcrumbList> = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Inicio',
                item: baseUrl
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Guía IA Periodismo',
                item: `${baseUrl}/guia-ia-periodismo`
            }
        ]
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <SchemaJSONLD json={articleSchema} />
            <SchemaJSONLD json={breadcrumbSchema} />

            {/* Hero Section */}
            <section className="relative py-20 px-4 md:px-6 lg:py-32 overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-background to-background" />
                <div className="container mx-auto max-w-4xl text-center">
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 mb-6">
                        Actualizado 2025
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                        Inteligencia Artificial para Periodistas: <br /> La Guía Definitiva
                    </h1>
                    <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                        Aprende a usar la IA para investigar más profundo, escribir más rápido y verificar datos con precisión quirúrgica. Sin perder tu voz humana.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/dashboard">
                            <Button size="lg" className="rounded-full text-lg h-12 px-8">
                                Probar Herramientas IA Gratis <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="container mx-auto max-w-3xl px-4 py-12 prose prose-lg dark:prose-invert">
                <h2>¿Por qué la IA es esencial en el periodismo moderno?</h2>
                <p>
                    El periodismo de datos y la investigación a gran escala requieren herramientas que procesen información a velocidades inhumanas. La IA no viene a reemplazar al periodista, sino a liberarlo de la transcripción manual y el SEO técnico para que pueda dedicarse a lo que importa: <strong>buscar la verdad</strong>.
                </p>

                <div className="grid md:grid-cols-2 gap-6 not-prose my-12">
                    <div className="p-6 rounded-2xl bg-card border shadow-sm">
                        <Mic className="h-8 w-8 text-primary mb-4" />
                        <h3 className="text-xl font-bold mb-2">Transcripción Automática</h3>
                        <p className="text-muted-foreground">Convierte horas de entrevistas en texto editable en minutos. Ideal para reportajes de investigación.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-card border shadow-sm">
                        <Search className="h-8 w-8 text-primary mb-4" />
                        <h3 className="text-xl font-bold mb-2">Verificación de Datos (Fact-Checking)</h3>
                        <p className="text-muted-foreground">Cruza referencias y detecta inconsistencias en discursos públicos al instante.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-card border shadow-sm">
                        <PenTool className="h-8 w-8 text-primary mb-4" />
                        <h3 className="text-xl font-bold mb-2">Redacción Asistida & SEO</h3>
                        <p className="text-muted-foreground">Optimiza titulares y meta descripciones para Google Discover sin clickbait sucio.</p>
                    </div>
                </div>

                <h2>Herramientas Recomendadas para 2025</h2>
                <ul>
                    <li><strong>Red Creativa Pro:</strong> Nuestra suite "todo en uno" para redacción ética, SEO y corrección de estilo.</li>
                    <li><strong>Perplexity AI:</strong> Para búsqueda semántica y contextualización de noticias.</li>
                    <li><strong>Trint:</strong> Específica para transcripción segura de entrevistas.</li>
                </ul>

                <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 my-12 not-prose">
                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <CheckCircle2 className="text-primary" />
                        La Ética ante todo
                    </h3>
                    <p className="mb-4">
                        Al usar IA, la transparencia es clave. Nunca publiques contenido generado por IA sin verificación humana (Editor-in-Loop). Usa herramientas como nuestro <strong>Stealth Mode</strong> no para engañar, sino para asegurar que el tono final sea indistinguible de tu mejor escritura manual.
                    </p>
                    <Link href="/politica-privacidad">
                        <Button variant="outline">Consultar nuestra Política de IA Ética</Button>
                    </Link>
                </div>
            </div>

            <FAQSection
                title="Preguntas de Periodistas sobre la IA"
                items={[
                    {
                        question: "¿Google penaliza el contenido de IA?",
                        answer: "Google penaliza el contenido de baja calidad y spam. El contenido útil, original y bien verificado posiciona bien, independientemente de si se usó IA para asistir en su creación."
                    },
                    {
                        question: "¿Cómo cito que usé IA en mi reportaje?",
                        answer: "Depende del medio. Generalmente, se recomienda una nota al pie: 'Este artículo utilizó herramientas de IA para el análisis de datos/transcripción, con verificación y edición final por [Tu Nombre]'.'"
                    },
                    {
                        question: "¿Puede la IA reemplazar a los editores?",
                        answer: "No. El criterio editorial, la línea política y la sensibilidad humana ante tragedias o temas delicados son capacidades puramente humanas."
                    }
                ]}
            />
        </div>
    )
}
