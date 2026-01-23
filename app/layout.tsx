import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import { ClientProviders } from './components/ClientProviders'
import CustomCursor from './components/CustomCursor'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.redcreativa.pro'),
  alternates: {
    canonical: './',
  },
  title: 'Red Creativa Pro | IA de Escritura para Periodistas',
  description: 'Escribe 3x más rápido con IA que aprende tu estilo. SEO automático y detección reducida. Asistente de escritura para periodistas que saben escribir.',
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: '/icon.png',
  },
  openGraph: {
    title: 'Red Creativa Pro | IA Para Periodistas que Saben Escribir',
    description: 'Escribe más rápido sin perder tu voz. IA que asiste, no reemplaza.',
    type: 'website',
    images: [{ url: 'https://redcreativa.pro/og-default.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  other: {
    'google-site-verification': process.env.GOOGLE_SITE_VERIFICATION || '',
  }
}

import { getServerLanguage } from './lib/language/server'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getServerLanguage()

  // Safe Mode Layout Wrapper
  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="language" content={lang} />
        <meta name="content-language" content={lang} />

        {/* Alternate links / Hreflang would go here dynamically based on current path */}
        <link rel="alternate" hrefLang="es" href="https://www.redcreativa.pro/" />
        <link rel="alternate" hrefLang="en" href="https://www.redcreativa.pro/en/" />

        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Red Creativa Pro",
              "url": "https://www.redcreativa.pro",
              "logo": "https://www.redcreativa.pro/icon.png",
              "description": "Plataforma de escritura con IA para periodistas y creadores de contenido en español",
              "sameAs": [
                "https://github.com/selamu0220/redcreativapro2",
                "https://instagram.com/sela_gb",
                "https://es.trustpilot.com/review/redcreativa.pro"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "availableLanguage": ["Spanish", "English"]
              }
            })
          }}
        />

        {/* Structured Data - SoftwareApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Red Creativa Pro",
              "applicationCategory": "ProductivityApplication",
              "operatingSystem": "Web",
              "description": "Herramienta de escritura con IA que aprende tu estilo. SEO automático, corrección de textos y generación de contenido optimizado para Google.",
              "url": "https://www.redcreativa.pro",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "EUR",
                "description": "Plan gratuito disponible"
              },
              "featureList": [
                "Escritor con IA",
                "SEO automático",
                "Corrector de textos",
                "Generador de contenido",
                "Control por voz",
                "Email marketing con IA"
              ],
              "screenshot": "https://www.redcreativa.pro/og-default.jpg",
              "author": {
                "@type": "Organization",
                "name": "Red Creativa Pro"
              }
            })
          }}
        />

        {/* Google Analytics & Ads */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17079639721"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            
            gtag('config', 'AW-17079639721');
            gtag('config', 'G-HQT95MVX91');
          `}
        </Script>
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {/* <CustomCursor /> */}
        <ClientProviders>
          {children}
        </ClientProviders>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
