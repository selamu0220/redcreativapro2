const fs = require('fs');
const path = require('path');

// Función para optimizar next.config.js
function optimizeNextConfig() {
  const nextConfigPath = path.join(__dirname, 'next.config.js');
  
  const optimizedNextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimizaciones de rendimiento
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  
  // Compresión y optimización de imágenes
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 año
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Headers de seguridad y rendimiento
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      },
      {
        source: '/blog/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  },
  
  // Compresión
  compress: true,
  
  // Optimización de bundle
  webpack: (config, { dev, isServer }) => {
    // Optimizaciones de producción
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\\\/]node_modules[\\\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      };
    }
    
    return config;
  },
  
  // Redirects para SEO
  async redirects() {
    return [
      {
        source: '/blog/:slug*',
        has: [
          {
            type: 'query',
            key: 'utm_source'
          }
        ],
        destination: '/blog/:slug*',
        permanent: false,
      }
    ]
  },
  
  // Rewrites para mejor estructura de URLs
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap'
      },
      {
        source: '/robots.txt',
        destination: '/api/robots'
      }
    ]
  }
}

module.exports = nextConfig`;

  fs.writeFileSync(nextConfigPath, optimizedNextConfig, 'utf8');
  console.log('✅ Next.config.js optimizado para rendimiento');
}

// Función para crear componente de optimización de Core Web Vitals
function createWebVitalsComponent() {
  const webVitalsPath = path.join(__dirname, 'components', 'WebVitals.tsx');
  
  const webVitalsContent = `'use client'

import { useEffect } from 'react'
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

// Función para enviar métricas a analytics
function sendToAnalytics(metric: any) {
  // Enviar a Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    })
  }
  
  // Log para desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vital:', metric)
  }
}

export default function WebVitals() {
  useEffect(() => {
    // Medir Core Web Vitals
    getCLS(sendToAnalytics)
    getFID(sendToAnalytics)
    getFCP(sendToAnalytics)
    getLCP(sendToAnalytics)
    getTTFB(sendToAnalytics)
  }, [])

  return null
}

// Hook personalizado para optimizaciones
export function usePerformanceOptimizations() {
  useEffect(() => {
    // Precargar recursos críticos
    const preloadCriticalResources = () => {
      const criticalResources = [
        '/fonts/inter-var.woff2',
        '/images/logo.webp'
      ]
      
      criticalResources.forEach(resource => {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.href = resource
        link.as = resource.includes('.woff2') ? 'font' : 'image'
        if (resource.includes('.woff2')) {
          link.type = 'font/woff2'
          link.crossOrigin = 'anonymous'
        }
        document.head.appendChild(link)
      })
    }
    
    // Optimizar imágenes lazy loading
    const optimizeLazyLoading = () => {
      const images = document.querySelectorAll('img[loading="lazy"]')
      
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement
              if (img.dataset.src) {
                img.src = img.dataset.src
                img.removeAttribute('data-src')
                imageObserver.unobserve(img)
              }
            }
          })
        }, {
          rootMargin: '50px 0px'
        })
        
        images.forEach(img => imageObserver.observe(img))
      }
    }
    
    // Ejecutar optimizaciones
    preloadCriticalResources()
    optimizeLazyLoading()
    
    // Optimizar scroll performance
    let ticking = false
    const optimizeScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Lógica de scroll optimizada aquí
          ticking = false
        })
        ticking = true
      }
    }
    
    window.addEventListener('scroll', optimizeScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', optimizeScroll)
    }
  }, [])
}`;

  // Crear directorio components si no existe
  const componentsDir = path.join(__dirname, 'components');
  if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
  }
  
  fs.writeFileSync(webVitalsPath, webVitalsContent, 'utf8');
  console.log('✅ Componente WebVitals creado para monitoreo de rendimiento');
}

// Función para crear middleware de SEO
function createSEOMiddleware() {
  const middlewarePath = path.join(__dirname, 'middleware.ts');
  
  const middlewareContent = `import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Headers de seguridad y SEO
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // Canonical URL enforcement
  const url = request.nextUrl.clone()
  
  // Remover trailing slash excepto para la raíz
  if (url.pathname !== '/' && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.slice(0, -1)
    return NextResponse.redirect(url, 301)
  }
  
  // Forzar HTTPS en producción
  if (process.env.NODE_ENV === 'production' && url.protocol === 'http:') {
    url.protocol = 'https:'
    return NextResponse.redirect(url, 301)
  }
  
  // Redirecciones SEO específicas
  if (url.pathname.startsWith('/blog/')) {
    // Asegurar que las URLs del blog estén en minúsculas
    const lowercasePath = url.pathname.toLowerCase()
    if (url.pathname !== lowercasePath) {
      url.pathname = lowercasePath
      return NextResponse.redirect(url, 301)
    }
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}`;

  fs.writeFileSync(middlewarePath, middlewareContent, 'utf8');
  console.log('✅ Middleware SEO creado para optimizaciones automáticas');
}

// Función para optimizar el layout principal
function optimizeRootLayout() {
  const layoutPath = path.join(__dirname, 'app', 'layout.tsx');
  
  // Leer el layout actual
  let layoutContent = '';
  if (fs.existsSync(layoutPath)) {
    layoutContent = fs.readFileSync(layoutPath, 'utf8');
  }
  
  // Si el layout no existe o necesita optimización, crear uno optimizado
  const optimizedLayoutContent = `import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import WebVitals from '@/components/WebVitals'
import { seoConfig } from '@/lib/seo-config'

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
    template: \`%s | \${seoConfig.site.name}\`
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
    <html lang="es" className={inter.variable}>
      <head>
        {/* Preconnect a dominios externos */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        
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
        {children}
        <WebVitals />
      </body>
    </html>
  )
}`;

  fs.writeFileSync(layoutPath, optimizedLayoutContent, 'utf8');
  console.log('✅ Layout principal optimizado para SEO y rendimiento');
}

// Función para crear archivo de optimización de fuentes
function createFontOptimization() {
  const fontOptPath = path.join(__dirname, 'lib', 'font-optimization.ts');
  
  const fontOptContent = `// Optimización de carga de fuentes
export const fontOptimization = {
  // Preload de fuentes críticas
  preloadFonts: [
    {
      href: '/fonts/inter-var.woff2',
      type: 'font/woff2',
      crossOrigin: 'anonymous'
    }
  ],
  
  // Font display strategy
  fontDisplay: 'swap',
  
  // Font loading optimization
  optimizeLoading: () => {
    if (typeof window !== 'undefined') {
      // Font loading API si está disponible
      if ('fonts' in document) {
        // Precargar fuentes críticas
        const criticalFonts = [
          new FontFace('Inter', 'url(/fonts/inter-var.woff2)', {
            display: 'swap',
            weight: '100 900'
          })
        ]
        
        criticalFonts.forEach(font => {
          font.load().then(loadedFont => {
            document.fonts.add(loadedFont)
          }).catch(error => {
            console.warn('Error loading font:', error)
          })
        })
      }
      
      // Fallback para navegadores sin soporte
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = '/fonts/inter-var.woff2'
      link.as = 'font'
      link.type = 'font/woff2'
      link.crossOrigin = 'anonymous'
      document.head.appendChild(link)
    }
  }
}

// CSS crítico inline
export const criticalCSS = \`
  /* Critical CSS para Above the Fold */
  * {
    box-sizing: border-box;
  }
  
  body {
    margin: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }
  
  /* Optimización de CLS */
  img, video {
    max-width: 100%;
    height: auto;
  }
  
  /* Skeleton loading */
  .skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
  }
  
  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
\``;

  fs.writeFileSync(fontOptPath, fontOptContent, 'utf8');
  console.log('✅ Optimización de fuentes configurada');
}

// Ejecutar todas las optimizaciones técnicas
console.log('🚀 Iniciando optimizaciones técnicas de SEO...');

try {
  optimizeNextConfig();
  createWebVitalsComponent();
  createSEOMiddleware();
  optimizeRootLayout();
  createFontOptimization();
  
  console.log('\\n✅ OPTIMIZACIONES TÉCNICAS COMPLETADAS:');
  console.log('- Next.config.js optimizado para rendimiento');
  console.log('- Componente WebVitals para monitoreo Core Web Vitals');
  console.log('- Middleware SEO para optimizaciones automáticas');
  console.log('- Layout principal optimizado');
  console.log('- Optimización de carga de fuentes');
  console.log('- Headers de seguridad y rendimiento');
  console.log('- Compresión y cache optimizados');
  console.log('- Bundle splitting configurado');
  
} catch (error) {
  console.error('❌ Error durante las optimizaciones técnicas:', error);
}