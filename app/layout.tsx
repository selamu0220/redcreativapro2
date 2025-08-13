import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import Footer from "./components/Footer";
import MobileLayout from "./components/MobileLayout";
import MobileOptimizations from "./components/MobileOptimizations";
import ErrorBoundary from "./components/ErrorBoundary";
import PWAInstaller from "./components/PWAInstaller";
import ChunkErrorHandler from "./components/ChunkErrorHandler";

export const metadata: Metadata = {
  title: {
    default: "Red Creativa Pro - Asistente de IA para Escritura Profesional",
    template: "%s | Red Creativa Pro",
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
  ],
  authors: [{ name: "Red Creativa Pro" }],
  creator: "Red Creativa Pro",
  publisher: "Red Creativa Pro",
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
    },
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://redcreativa.pro",
    title: "Red Creativa Pro - Asistente de IA para Escritura Profesional",
    description:
      "Asistente de IA para escritura profesional, envío inteligente de correos y gestión de prompts avanzados.",
    siteName: "Red Creativa Pro",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Red Creativa Pro - Asistente de IA para Escritura Profesional",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Red Creativa Pro - Asistente de IA para Escritura Profesional",
    description:
      "Asistente de IA para escritura profesional y gestión inteligente de contenido.",
    images: ["/og-image.svg"],
    creator: "@redcreativapro",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
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
      },
    ],
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  other: {
    "msapplication-TileColor": "#f97316",
    "msapplication-TileImage": "/icon-192x192.png",
    "msapplication-config": "/browserconfig.xml",
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
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />

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
              },
              featureList: [
                "Escritor IA - Generación de contenido inteligente",
                "Correos IA - Redacción automática de emails",
                "Chat con Prompts - Conversación con IA personalizada",
              ],
            }),
          }}
        />
      </head>
      <body className="antialiased transition-all duration-300 ease-in-out">
        <ErrorBoundary>
          <ChunkErrorHandler />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem={true}
          >
            <MobileOptimizations />
            <MobileLayout>
              <div className="min-h-screen transition-all duration-300 flex flex-col">
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </MobileLayout>
            <PWAInstaller />
          </ThemeProvider>
          <SpeedInsights />
          <Analytics />
        </ErrorBoundary>
      </body>
    </html>
  );
}
