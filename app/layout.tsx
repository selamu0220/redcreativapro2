import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { headers } from 'next/headers'
import Script from 'next/script'
import './globals.css'
import './blog/blog-styles.css'
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, LanguageCode } from './lib/language/config'
import { ThemeProvider } from '@/app/components/theme-provider'
import { SimpleMainNavigation } from '@/app/components/SimpleMainNavigation'
import { ConvexClientProvider } from '@/app/components/ConvexClientProvider'
import { UserSync } from '@/app/components/UserSync'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap'
})

const metadataBase = new URL('https://redcreativa.pro')

const languageAlternates: Record<string, string> = Object.fromEntries(
  Object.keys(SUPPORTED_LANGUAGES).map(code => [code, `https://redcreativa.pro/${code}`])
)

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: 'Red Creativa Pro | Herramientas de IA para Copywriting',
    template: '%s | Red Creativa Pro'
  },
  description: 'Plataforma hispana de marketing con IA: escritura, campañas y automatización.',
  alternates: {
    canonical: metadataBase,
    languages: languageAlternates
  },
  openGraph: {
    type: 'website',
    url: 'https://redcreativa.pro',
    title: 'Red Creativa Pro | Herramientas de IA para Copywriting',
    description: 'Crea contenido y automatiza tu marketing con IA para el mercado hispano.',
    images: [{ url: 'https://redcreativa.pro/og-default.jpg', width: 1200, height: 630 }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Red Creativa Pro | IA para Copywriting',
    description: 'Herramientas de IA para redacción profesional y marketing.',
    images: ['https://redcreativa.pro/og-default.jpg']
  },
  robots: {
    index: true,
    follow: true
  }
}


export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  
  const headersList = await headers()
  // Extract language from URL via cookie set by middleware or default
  const cookieLang = headersList.get('cookie')?.match(/redcreativa-language=([a-z]{2})/)?.[1]
  const currentLang = cookieLang && SUPPORTED_LANGUAGES[cookieLang as LanguageCode] 
    ? cookieLang 
    : DEFAULT_LANGUAGE

  const enableGA = (!!gaId && process.env.NODE_ENV === 'production') || process.env.NEXT_PUBLIC_ENABLE_GA === 'true'
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Red Creativa Pro',
    url: 'https://redcreativa.pro',
    logo: 'https://redcreativa.pro/logo.png',
    sameAs: [
      'https://www.linkedin.com/company/redcreativapro',
      'https://twitter.com/redcreativapro',
      'https://github.com/redcreativapro'
    ],
    contactPoint: [{ '@type': 'ContactPoint', email: 'hola@redcreativa.pro', contactType: 'customer support' }]
  }
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: 'https://redcreativa.pro',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://redcreativa.pro/buscar?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  }

  return (
    <ClerkProvider
      appearance={{ cssLayerName: 'clerk' }}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      <html lang={currentLang} suppressHydrationWarning={true}>
        <head>
          <link rel="alternate" type="application/rss+xml" href="https://redcreativa.pro/rss.xml" />
          {gaId && (
            <>
              <script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} async></script>
              <script
                dangerouslySetInnerHTML={{
                  __html: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${gaId}');`
                }}
              />
            </>
          )}
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
          </head>
          <body className={inter.className}>
            {/* Chatbase Script Integration */}
            <Script id="chatbase-config" strategy="afterInteractive">
              {`
                window.embeddedChatbotConfig = {
                  chatbotId: "${process.env.NEXT_PUBLIC_CHATBOT_ID || ''}",
                  domain: "${process.env.NEXT_PUBLIC_CHATBASE_HOST || 'www.chatbase.co'}"
                };
              `}
            </Script>
              <Script
                src={`https://${process.env.NEXT_PUBLIC_CHATBASE_HOST || 'www.chatbase.co'}/embed.min.js`}
                data-chatbot-id={process.env.NEXT_PUBLIC_CHATBOT_ID || ''}
                data-domain={process.env.NEXT_PUBLIC_CHATBASE_HOST || 'www.chatbase.co'}
                strategy="afterInteractive"
                defer
              />
            <ThemeProvider
                  attribute="class"
                  defaultTheme="system"
                  enableSystem
                  disableTransitionOnChange
                >
                  <UserSync />
                  <ConvexClientProvider>

                  <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
                    <SimpleMainNavigation />
                    {children}
                  </div>
                </ConvexClientProvider>
              </ThemeProvider>
            </body>


      </html>
    </ClerkProvider>
  )
}
