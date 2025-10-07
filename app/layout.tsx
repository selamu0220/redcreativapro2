import "./globals.css";
import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import Footer from "./components/Footer";
import MobileLayout from "./components/MobileLayout";
import MobileOptimizations from "./components/MobileOptimizations";
import PWAInstaller from "./components/PWAInstaller";
import { AuthProvider } from "./components/AuthProvider";
import { ToastProvider } from "./components/ToastProvider";
import { NotificationProvider } from "./components/NotificationSystem";
import { VoiceGuideProvider } from "./components/voice-guide/VoiceGuideProvider";
import GlobalVoiceGuide from "./components/voice-guide/GlobalVoiceGuide";
import FloatingVoiceButton from "./components/voice-guide/FloatingVoiceButton";
import ErrorBoundary from "./components/ErrorBoundary";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { UserProvider } from "./contexts/UserContext";
import { LanguageProvider } from "./lib/language";
import SimpleLanguageToggle from "./components/SimpleLanguageToggle";

import { Inter } from "next/font/google";

// Import components normally for server components
import ThemeProviderWrapper from "./components/ThemeProviderWrapper";
import GoogleAnalytics from "./components/GoogleAnalytics";
import dynamic from "next/dynamic";
// import WebVitalsReporter from "./components/WebVitalsReporter";

// Remove problematic dynamic import for now

// Optimized font loading
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
  fallback: ["system-ui", "arial"],
});

export const metadata: Metadata = {
  title: {
    default: "Red Creativa Pro - Blog de Escritura Profesional con IA",
    template: "%s | Red Creativa Pro",
  },
  description:
    "Blog profesional sobre escritura con inteligencia artificial, copywriting, marketing de contenidos y herramientas de productividad. Consejos expertos y tutoriales avanzados.",
  keywords: [
    "blog escritura IA",
    "inteligencia artificial escritura",
    "copywriting profesional",
    "marketing de contenidos",
    "herramientas escritura",
    "productividad digital",
    "redacción automática",
    "contenido optimizado",
    "SEO copywriting",
    "escritura asistida",
    "prompts efectivos",
    "automatización contenido",
    "estrategias escritura",
    "técnicas copywriting",
    "herramientas IA",
    "generación contenido",
    "optimización textos",
    "escritura profesional",
    "content marketing",
    "redacción digital",
  ],
  authors: [{ name: "Red Creativa Pro", url: "https://redcreativa.pro" }],
  creator: "Red Creativa Pro",
  publisher: "Red Creativa Pro",
  category: "Education",
  classification: "Blog",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://redcreativa.pro"),
  alternates: {
    canonical: "/",
    languages: {
      "es-ES": "/",
      "es": "/es",
    },
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://redcreativa.pro",
    title: "Red Creativa Pro - Blog de Escritura Profesional con IA",
    description:
      "Descubre las mejores técnicas de escritura con inteligencia artificial, copywriting profesional y estrategias de marketing de contenidos. Tutoriales expertos y consejos avanzados.",
    siteName: "Red Creativa Pro",
    images: [
      {
        url: "https://redcreativa.pro/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Red Creativa Pro - Blog de Escritura Profesional con IA",
        type: "image/svg+xml",
      },
      {
        url: "https://redcreativa.pro/logo.svg",
        width: 512,
        height: 512,
        alt: "Red Creativa Pro Logo",
        type: "image/svg+xml",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@redcreativapro",
    creator: "@redcreativapro",
    title: "Red Creativa Pro - Blog de Escritura Profesional con IA",
    description:
      "Blog profesional sobre escritura con IA, copywriting y marketing de contenidos. Consejos expertos y tutoriales avanzados para profesionales.",
    images: [
      {
        url: "https://redcreativa.pro/og-image.svg",
        alt: "Red Creativa Pro - Blog de Escritura Profesional con IA",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/logo.svg", sizes: "any", type: "image/svg+xml" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "icon",
        url: "/favicon.ico",
        sizes: "32x32",
      },
      {
        rel: "icon",
        url: "/logo.svg",
        type: "image/svg+xml",
      },
      {
        rel: "mask-icon",
        url: "/logo.svg",
        color: "#f97316",
      },
    ],
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
    other: {
      "msvalidate.01": "your-bing-verification-code",
    },
  },
  other: {
    "msapplication-TileColor": "#f97316",
    "msapplication-TileImage": "/icon-192x192.png",
    "msapplication-config": "/browserconfig.xml",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Red Creativa Pro",
    "mobile-web-app-capable": "yes",
    "theme-color": "#f97316",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f97316" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning className={inter.variable}>
      <head>
        {/* Critical Resource Hints */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://api.redcreativa.pro" />
        <link rel="dns-prefetch" href="https://vercel.com" />
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/logo.svg" as="image" type="image/svg+xml" />
        <link rel="preload" href="/og-image.svg" as="image" type="image/svg+xml" />
        <meta name="theme-color" content="#f97316" />
        <meta name="msapplication-TileColor" content="#f97316" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Red Creativa Pro" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
        <meta name="color-scheme" content="dark light" />
        <meta name="supported-color-schemes" content="dark light" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="referrer" content="origin-when-cross-origin" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="bingbot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="author" content="Red Creativa Pro" />
        <meta name="creator" content="Red Creativa Pro" />
        <meta name="publisher" content="Red Creativa Pro" />
        <meta name="copyright" content="© 2024 Red Creativa Pro. Todos los derechos reservados." />
        <meta name="language" content="es-ES" />
        <meta name="geo.region" content="ES" />
        <meta name="geo.country" content="Spain" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        <meta name="revisit-after" content="1 days" />
        <meta name="expires" content="never" />
        <meta name="cache-control" content="public, max-age=31536000" />
        <meta name="pragma" content="cache" />
        <meta name="vary" content="Accept-Encoding" />
        <meta name="x-frame-options" content="SAMEORIGIN" />
        <meta name="x-content-type-options" content="nosniff" />
        <meta name="x-xss-protection" content="1; mode=block" />
        <meta name="content-security-policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.redcreativa.pro https://vercel.live wss://ws-us3.pusher.com; frame-src 'self' https://www.youtube.com https://player.vimeo.com;" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta name="cross-origin-embedder-policy" content="unsafe-none" />
        <meta name="cross-origin-opener-policy" content="same-origin-allow-popups" />
        <meta name="cross-origin-resource-policy" content="cross-origin" />
        <meta name="permissions-policy" content="camera=(), microphone=(), geolocation=(), interest-cohort=()" />
        <meta name="feature-policy" content="camera 'none'; microphone 'none'; geolocation 'none'" />
        
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
        <link rel="canonical" href="https://redcreativa.pro" />
        <link rel="alternate" hrefLang="es" href="https://redcreativa.pro" />
        <link rel="alternate" hrefLang="es-ES" href="https://redcreativa.pro" />
        <link rel="alternate" hrefLang="x-default" href="https://redcreativa.pro" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <link rel="alternate" type="application/rss+xml" title="Red Creativa Pro RSS Feed" href="/rss.xml" />
        <link rel="alternate" type="application/atom+xml" title="Red Creativa Pro Atom Feed" href="/atom.xml" />
        <link rel="alternate" type="application/json" title="Red Creativa Pro JSON Feed" href="/feed.json" />
        <link rel="search" type="application/opensearchdescription+xml" title="Red Creativa Pro" href="/opensearch.xml" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="mask-icon" href="/logo.svg" color="#f97316" />
        <meta name="msapplication-TileImage" content="/icon-192x192.png" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Red Creativa Pro",
              "alternateName": "Red Creativa Pro Blog",
              "url": "https://redcreativa.pro",
              "description": "Blog profesional sobre escritura con inteligencia artificial, copywriting, marketing de contenidos y herramientas de productividad.",
              "inLanguage": "es-ES",
              "isAccessibleForFree": true,
              "publisher": {
                "@type": "Organization",
                "name": "Red Creativa Pro",
                "url": "https://redcreativa.pro",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://redcreativa.pro/logo.svg",
                  "width": 512,
                  "height": 512
                },
                "sameAs": [
                  "https://twitter.com/redcreativapro",
                  "https://linkedin.com/company/redcreativapro",
                  "https://instagram.com/redcreativapro"
                ]
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://redcreativa.pro/blog?search={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        
        {/* Performance Optimization */}
        <meta httpEquiv="x-dns-prefetch-control" content="on" />
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
        
        {/* Security Headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Red Creativa Pro",
              description:
                "Blog profesional sobre escritura con inteligencia artificial, copywriting, marketing de contenidos y herramientas de productividad",
              url: "https://redcreativa.pro",
              logo: "https://redcreativa.pro/logo.svg",
              image: "https://redcreativa.pro/og-image.svg",
              applicationCategory: "ProductivityApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                availability: "https://schema.org/InStock",
                category: "Professional Tools",
              },
              creator: {
                "@type": "Organization",
                name: "Red Creativa Pro",
                logo: "https://redcreativa.pro/logo.svg",
                url: "https://redcreativa.pro",
              },
              featureList: [
                "Escritor IA - Generación de contenido inteligente",
                "Correos IA - Redacción automática de emails",
                "Chat con Prompts - Conversación con IA personalizada",
              ],
            }),
          }}
        />
        
        {/* Organization Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Red Creativa Pro",
              url: "https://redcreativa.pro",
              logo: "https://redcreativa.pro/logo.svg",
              image: "https://redcreativa.pro/og-image.svg",
              description: "Blog profesional sobre escritura con inteligencia artificial, copywriting, marketing de contenidos y herramientas de productividad. Consejos expertos y tutoriales avanzados.",
              sameAs: [
                "https://twitter.com/redcreativapro"
              ],
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer service",
                url: "https://redcreativa.pro/contacto"
              }
            }),
          }}
        />
      </head>
      <body className={`${inter.className} antialiased transition-all duration-300 ease-in-out font-sans`}>
        <LanguageProvider>
          <ThemeProviderWrapper
            attribute="class"
            defaultTheme="system"
            enableSystem={true}
          >
            {/* ClientErrorHandler removed temporarily */}
            <MobileOptimizations />
            <MobileLayout>
              <AuthProvider>
                <UserProvider>
                  <SubscriptionProvider>
                    <VoiceGuideProvider>
                      <ToastProvider>
                        <NotificationProvider>
                          <ErrorBoundary>
                            <div className="min-h-screen transition-all duration-300 flex flex-col">
                               <main className="flex-1">{children}</main>
                               <Footer />
                             </div>
                             <GlobalVoiceGuide />
                             <FloatingVoiceButton />
                             <SimpleLanguageToggle />
                             {/* Maria (ElevenLabs ConvAI) */}
                             <script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async type="text/javascript"></script>
                             {/* Componente Maria minimizable - temporarily commented out */}
                             {/* <MariaWidgetDynamic /> */}
                          </ErrorBoundary>
                        </NotificationProvider>
                      </ToastProvider>
                    </VoiceGuideProvider>
                  </SubscriptionProvider>
                </UserProvider>
              </AuthProvider>
            </MobileLayout>
            <PWAInstaller />
          </ThemeProviderWrapper>
        </LanguageProvider>
        {/* <WebVitalsReporter /> */}
        <SpeedInsights />
        <Analytics />
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  );
}
