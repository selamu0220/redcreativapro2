import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="language" content="es" />
        <meta name="content-language" content="es" />
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
