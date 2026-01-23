import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: '50+ Prompts IA para Copywriting 2026 [Gratis] | Red Creativa Pro',
    description: '🎯 Biblioteca de prompts IA probados para escribir textos que venden. Plantillas para emails, redes sociales, SEO y más. Descarga gratis.',
    keywords: ['prompts ia', 'prompts copywriting', 'plantillas chatgpt', 'prompts para escribir', 'prompts marketing'],
    openGraph: {
        title: '50+ Prompts IA para Copywriting 2026 [Gratis]',
        description: 'Biblioteca de prompts probados para escribir textos que venden. Emails, redes sociales, SEO y más.',
        type: 'website',
        images: [{ url: 'https://redcreativa.pro/og-prompts.jpg', width: 1200, height: 630 }]
    },
    twitter: {
        card: 'summary_large_image',
        title: '50+ Prompts IA para Copywriting [Gratis]',
        description: '🎯 Plantillas probadas para ChatGPT, Claude y más. Descarga gratis.'
    },
    alternates: {
        canonical: 'https://www.redcreativa.pro/prompts'
    },
    robots: { index: true, follow: true }
}

export default function PromptsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
