import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Conoce al Creador de Red Creativa Pro | Sela García',
    description: 'Conoce a Sela, el estudiante de Humanidades detrás de Red Creativa Pro. Una historia de emprendimiento, IA y pasión por ayudar a otros a ser más productivos.',
    keywords: [
        'creador Red Creativa Pro',
        'Sela García',
        'fundador herramienta IA',
        'historia emprendedor',
        'startup IA España'
    ],
    authors: [{ name: 'Sela García', url: 'https://redcreativa.pro/creador' }],
    alternates: {
        canonical: 'https://redcreativa.pro/creador'
    },
    openGraph: {
        title: 'Conoce al Creador de Red Creativa Pro | Sela García',
        description: 'Una historia de emprendimiento, IA y pasión por ayudar a otros a ser más productivos.',
        type: 'profile',
        url: 'https://redcreativa.pro/creador',
        siteName: 'Red Creativa Pro',
        images: [
            {
                url: 'https://i.ibb.co/bfb1ncN/image.png',
                width: 400,
                height: 400,
                alt: 'Sela García - Creador de Red Creativa Pro'
            }
        ]
    },
    twitter: {
        card: 'summary',
        title: 'Conoce al Creador de Red Creativa Pro',
        description: 'Historia de Sela, el estudiante que creó Red Creativa Pro'
    }
}

export default function CreadorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
