import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import Footer from './components/Footer'
import MobileLayout from './components/MobileLayout'

export const metadata: Metadata = {
  title: {
    default: 'Red Creativa Pro - IA para Email Marketing Profesional',
    template: '%s | Red Creativa Pro'
  },
  description: 'IA de Email Marketing para crear campañas automatizadas profesionales y mantener tu voz única. Importa contactos y envía emails efectivos. Prueba gratis.',
  keywords: [
    'email marketing IA',
    'campañas automatizadas',
    'email marketing profesional',
    'automatización de correos',
    'IA marketing digital',
    'campañas inteligentes',
    'email automation',
    'marketing automation',
    'efectividad de emails',
    'importar contactos email'
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
    title: 'Red Creativa Pro - IA para Email Marketing Profesional',
    description: 'IA de Email Marketing para crear campañas automatizadas profesionales. Importa contactos y envía emails efectivos.',
    siteName: 'Red Creativa Pro',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Red Creativa Pro - IA para Email Marketing Profesional',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Red Creativa Pro - IA para Email Marketing Profesional',
    description: 'IA de Email Marketing para campañas automatizadas profesionales.',
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
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: 'dark light',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f97316' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  viewportFit: 'cover',
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
              "availability": "https://schema.org/InStock",
              "category": "Professional Tools"
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
      <body className="antialiased transition-all duration-300 ease-in-out">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
          <MobileLayout>
            <div className="min-h-screen transition-all duration-300 flex flex-col">
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </MobileLayout>
        </ThemeProvider>
      </body>
    </html>
  )
}