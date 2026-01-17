import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Preguntas Frecuentes - Red Creativa Pro',
    description: 'Encuentra respuestas a las preguntas más comunes sobre Red Creativa Pro, planes, funcionalidades y soporte técnico.',
    keywords: ['FAQ', 'preguntas frecuentes', 'ayuda', 'soporte', 'Red Creativa Pro'],
    authors: [{ name: 'Red Creativa Pro' }],
    openGraph: {
        title: 'Preguntas Frecuentes - Red Creativa Pro',
        description: 'Encuentra respuestas a las preguntas más comunes sobre Red Creativa Pro, planes, funcionalidades y soporte técnico.',
        type: 'website',
    },
}

export default function PreguntasFrecuentesLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
