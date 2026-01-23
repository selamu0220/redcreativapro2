import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Escritor IA Gratis en Español 2026 | Red Creativa Pro',
    description: '✍️ Escribe 3x más rápido con IA que aprende tu estilo. Corrector de textos, SEO automático y generador de contenido gratis. ¡Pruébalo ahora!',
    keywords: ['escritor ia', 'escritor inteligencia artificial', 'redactor ia gratis', 'generador de textos ia', 'escritor ia español'],
    openGraph: {
        title: 'Escritor IA Gratis 2026 - Escribe 3x Más Rápido',
        description: 'Herramienta de escritura con IA que aprende tu estilo. SEO automático y corrección de textos para periodistas y creadores.',
        type: 'website',
        images: [{ url: 'https://redcreativa.pro/og-escritor-ia.jpg', width: 1200, height: 630 }]
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Escritor IA Gratis - Escribe 3x Más Rápido',
        description: '✍️ IA que aprende tu estilo. SEO automático + corrector de textos gratis.'
    },
    alternates: {
        canonical: 'https://www.redcreativa.pro/escritor-ia'
    },
    robots: { index: true, follow: true }
}

export default function EscritorIALayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
