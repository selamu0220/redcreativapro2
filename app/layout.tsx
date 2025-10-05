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
import { ErrorBoundary } from "./components/ErrorBoundary";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { UserProvider } from "./contexts/UserContext";
import dynamic from "next/dynamic";
import { Inter } from "next/font/google";
import WebVitalsReporter from "./components/WebVitalsReporter";

// Import components normally for server components
import ThemeProviderWrapper from "./components/ThemeProviderWrapper";

const MariaWidgetDynamic = dynamic(() => import("./components/MariaWidget"));

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
    default: "Red Creativa Pro Beta - Asistente de IA para Escritura Profesional",
    template: "%s | Red Creativa Pro Beta",
  },
  description:
    "Asistente de IA para escritura profesional, envío inteligente de correos y gestión de prompts. Chat IA avanzado para crear contenido optimizado. Prueba gratis.",
  keywords: [
    "escritor IA",
    "asistente inteligencia artificial",
    "chat IA profesional",
    "gestión de prompts",
    "envío inteligente correos",
    "IA escritura profesional",
    "contenido optimizado IA",
    "automatización inteligente",
    "prompts personalizados",
    "escritura asistida IA",
    "redacción automática",
    "generador de contenido",
    "herramientas de escritura",
    "productividad digital",
    "marketing de contenidos",
    "copywriting IA",
    "asistente virtual escritura",
    "optimización SEO",
    "contenido web",
    "redacción profesional",
  ],
  authors: [{ name: "Red Creativa Pro", url: "https://redcreativa.pro" }],
  creator: "Red Creativa Pro",
  publisher: "Red Creativa Pro",
  category: "Productivity",
  classification: "Business Software",
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
    title: "Red Creativa Pro Beta - Asistente de IA para Escritura Profesional",
    description:
      "Asistente de IA para escritura profesional, envío inteligente de correos y gestión de prompts avanzados. Mejora tu productividad con herramientas de IA.",
    siteName: "Red Creativa Pro Beta",
    images: [
      {
        url: "https://redcreativa.pro/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Red Creativa Pro - Asistente de IA para Escritura Profesional",
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
    title: "Red Creativa Pro Beta - Asistente de IA para Escritura Profesional",
    description:
      "Asistente de IA para escritura profesional y gestión inteligente de contenido. Mejora tu productividad con herramientas avanzadas de IA.",
    images: [
      {
        url: "https://redcreativa.pro/og-image.svg",
        alt: "Red Creativa Pro - Asistente de IA para Escritura Profesional",
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
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://redcreativa.pro" />
        <link rel="preconnect" href="https://vercel.live" />
        
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
                "Plataforma de inteligencia artificial que genera contenido, redacta emails profesionales y potencia tu creatividad",
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
              description: "Asistente de IA para escritura profesional, envío inteligente de correos y gestión de prompts avanzados.",
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
        <ThemeProviderWrapper
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
        >
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
                           {/* Maria (ElevenLabs ConvAI) */}
                           <script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async type="text/javascript"></script>
                           {/* Componente Maria minimizable */}
                           <MariaWidgetDynamic />
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
        <WebVitalsReporter />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
