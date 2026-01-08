import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import './globals.css'
import { ClientProviders } from './components/ClientProviders'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Red Creativa Pro | IA de Escritura para Periodistas',
  description: 'Escribe 3x más rápido con IA que aprende tu estilo. SEO automático y detección reducida. Asistente de escritura para periodistas que saben escribir.',
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
        <meta name="language" content="es" />
        <meta name="content-language" content="es" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
