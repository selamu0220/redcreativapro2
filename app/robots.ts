import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  // IMPORTANTE: Este dominio debe coincidir con tu configuración en Vercel
  // Usamos sin www como canónico (SEO best practice 2025)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://redcreativa.pro'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/auth/',
          '/debug/',
          '/test/',
          '/_next/',
          '/static/',
          '/*.json$',
          '/dashboard',
          '/ajustes/',
          '/suscripcion/',
          '/subscription/',
          '/historial/',
          '/escritor-ia/',
          '/fix-user-registration/',
          '/importar-exportar/',
        ]
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
        disallow: []
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/dashboard']
      },
      {
        userAgent: 'Claude-Web',
        allow: '/',
        disallow: ['/api/', '/admin/', '/dashboard']
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/dashboard']
      },
      {
        userAgent: 'Amazonbot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/dashboard']
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }

}
