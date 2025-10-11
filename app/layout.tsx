import { Inter } from 'next/font/google';
import './globals.css';
import { Metadata } from 'next';
import { seoConfig } from '../lib/seo-config';
import { AuthProvider } from './components/AuthProvider';
import { ToastProvider } from './components/ToastProvider';
import ClientProviders from './components/ClientProviders';
import Footer from './components/Footer';
import ScrollProgressBar from './components/ScrollProgressBar';
import WebVitalsReporter from './components/WebVitalsReporter';
import { ErrorBoundary } from './components/ErrorBoundary';
import { WebpackErrorHandler } from './components/WebpackErrorHandler';
import ThemeProviderWrapper from './components/ThemeProviderWrapper';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter'
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ]
}

export const metadata: Metadata = {
  metadataBase: new URL(seoConfig.site.url),
  title: {
    default: seoConfig.site.name,
    template: `%s | ${seoConfig.site.name}`
  },
  description: seoConfig.site.description,
  keywords: seoConfig.mainKeywords,
  authors: [{ name: 'Red Creativa Pro' }],
  creator: 'Red Creativa Pro',
  publisher: 'Red Creativa Pro',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: seoConfig.site.url,
    siteName: seoConfig.site.name,
    title: seoConfig.site.name,
    description: seoConfig.site.description,
    images: [{
      url: seoConfig.site.image,
      width: 1200,
      height: 630,
      alt: seoConfig.site.name
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: seoConfig.site.name,
    description: seoConfig.site.description,
    images: [seoConfig.site.image],
    creator: '@redcreativapro'
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
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  alternates: {
    canonical: seoConfig.site.url,
    languages: {
      'es-ES': seoConfig.site.url,
    }
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={inter.variable} suppressHydrationWarning={true}>
      <head>
        {/* Preconnect a dominios externos */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        
        {/* Stripe Buy Button Script */}
        <script async src="https://js.stripe.com/v3/buy-button.js"></script>
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                seoConfig.schema.organization,
                seoConfig.schema.website
              ]
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <div suppressHydrationWarning>
          <AuthProvider>
            <ToastProvider>
              <ClientProviders>
                <ThemeProviderWrapper>
                  <ErrorBoundary>
                    <WebpackErrorHandler />
                    {children}
                  </ErrorBoundary>
                </ThemeProviderWrapper>
              </ClientProviders>
            </ToastProvider>
          </AuthProvider>
          <Footer />
          <WebVitalsReporter />
        </div>
      </body>
    </html>
  )
}