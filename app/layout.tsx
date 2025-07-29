import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Red Creativa Pro - Plataforma de IA para Creativos',
    template: '%s | Red Creativa Pro'
  },
  description: 'Plataforma de inteligencia artificial que genera contenido, redacta emails profesionales y potencia tu creatividad. Escritor IA, Correos IA y Chat con Prompts en un solo lugar.',
  keywords: [
    'inteligencia artificial',
    'generador de contenido',
    'escritor IA',
    'correos automáticos',
    'prompts IA',
    'creatividad',
    'redacción automática',
    'herramientas IA',
    'contenido digital',
    'marketing digital'
  ],
  authors: [{ name: 'Red Creativa Pro' }],
  creator: 'Red Creativa Pro',
  publisher: 'Red Creativa Pro',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://redcreativapro.com'),
  alternates: {
    canonical: '/',
    languages: {
      'es-ES': '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://redcreativapro.com',
    title: 'Red Creativa Pro - Plataforma de IA para Creativos',
    description: 'Mantente al día de todo con Red Creativa Pro. Genera contenido inteligente, gestiona tus comunicaciones y crea con IA en un solo lugar.',
    siteName: 'Red Creativa Pro',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Red Creativa Pro - Plataforma de IA para Creativos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Red Creativa Pro - Plataforma de IA para Creativos',
    description: 'Mantente al día de todo con Red Creativa Pro. Genera contenido inteligente, gestiona tus comunicaciones y crea con IA.',
    images: ['/og-image.jpg'],
    creator: '@redcreativapro',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/site.webmanifest',
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  category: 'technology',
  classification: 'AI Platform',
  referrer: 'origin-when-cross-origin',
  colorScheme: 'dark light',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f97316' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Red Creativa Pro',
  },
  applicationName: 'Red Creativa Pro',
  appLinks: {
    web: {
      url: 'https://redcreativapro.com',
      should_fallback: true,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Red Creativa Pro",
              "description": "Plataforma de inteligencia artificial que genera contenido, redacta emails profesionales y potencia tu creatividad",
              "url": "https://redcreativapro.com",
              "applicationCategory": "ProductivityApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "4.99",
                "priceCurrency": "EUR",
                "priceValidUntil": "2025-12-31"
              },
              "creator": {
                "@type": "Organization",
                "name": "Red Creativa Pro"
              },
              "featureList": [
                "Escritor IA - Generación de contenido inteligente",
                "Correos IA - Redacción automática de emails",
                "Chat con Prompts - Conversación con IA personalizada"
              ]
            })
          }}
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}