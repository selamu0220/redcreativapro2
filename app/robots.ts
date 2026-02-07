import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
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
          '/dashboard',
          '/ajustes/',
          '/suscripcion/',
          '/subscription/',
          '/historial/',
          '/fix-user-registration/',
          '/importar-exportar/',
          '/check-user-registration/',
          '/test-*',
          '/debug-*',
          '/*.json$',
          '/*?*',
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
        disallow: ['/api/', '/admin/', '/dashboard', '/auth/']
      },
      {
        userAgent: 'Claude-Web',
        allow: '/',
        disallow: ['/api/', '/admin/', '/dashboard', '/auth/']
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/dashboard', '/auth/']
      },
      {
        userAgent: 'Amazonbot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/dashboard', '/auth/']
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: ['/api/', '/admin/', '/dashboard', '/auth/']
      },
      {
        userAgent: 'OAI-SearchBot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/dashboard', '/auth/']
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: ['/api/', '/admin/', '/dashboard', '/auth/']
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
