import { Inter } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import { ClientProviders } from './components/ClientProviders'
import { getServerLanguage, generateCanonicalUrl, getServerPathname, generateHreflangLinks } from './lib/language/server'
import { Partytown } from '@builder.io/partytown/react'
import { SchemaRegistry } from './components/seo/SchemaRegistry'
import { setLanguageTag } from '@/src/paraglide/runtime'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})


export async function generateMetadata(): Promise<Metadata> {
  const lang = await getServerLanguage() || 'en';
  const pathname = await getServerPathname();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://redcreativa.pro';

  // Generate dynamic hreflang links based on current path
  const alternates = {
    canonical: generateCanonicalUrl(pathname, lang, baseUrl),
    languages: {} as Record<string, string>,
  };

  const hreflangLinks = generateHreflangLinks(pathname, baseUrl);
  hreflangLinks.forEach(link => {
    if (link.hrefLang !== 'x-default') {
      alternates.languages[link.hrefLang] = link.href;
    }
  });

  return {
    metadataBase: new URL(baseUrl),
    alternates: alternates,
    title: {
      default: 'Red Creativa Pro | IA de Escritura para Periodistas',
      template: '%s | Red Creativa Pro',
    },
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
      images: [{ url: '/og-default.jpg', width: 1200, height: 630 }],
      siteName: 'Red Creativa Pro',
      locale: `${lang}_${lang.toUpperCase()}`,
    },
    twitter: {
      card: 'summary_large_image',
      site: '@redcreativapro',
      creator: '@redcreativa_pro',
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
      }
    },
    other: {
      'google-site-verification': process.env.GOOGLE_SITE_VERIFICATION || '',
    }
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getServerLanguage() as any || 'en'
  setLanguageTag(lang)

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <meta name="language" content={lang} />
        <meta name="content-language" content={lang} />
        <Partytown debug={process.env.NODE_ENV === 'development'} forward={['dataLayer.push']} />

        {/* Structured Data */}
        <SchemaRegistry />

        {/* Google Analytics & Ads */}
        {/* Google Analytics & Ads via Partytown */}
        <script
          type="text/partytown"
          src="https://www.googletagmanager.com/gtag/js?id=AW-17079639721"
        />
        <script
          type="text/partytown"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              
              gtag('config', 'AW-17079639721', { 'anonymize_ip': true });
              gtag('config', 'G-HQT95MVX91', { 'anonymize_ip': true });
            `
          }}
        />
        {process.env.NEXT_PUBLIC_CLARITY_ID && (
          <script
            type="text/javascript"
            dangerouslySetInnerHTML={{
              __html: `
                (function(c,l,a,r,i,t,y){
                    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_ID}");
              `
            }}
          />
        )}
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ClientProviders>
          {children}
        </ClientProviders>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

