import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  // IMPORTANTE: Este dominio debe coincidir con tu configuración en Vercel
  // Si en Vercel configuraste www como principal, usa 'https://www.redcreativa.pro'
  // Si configuraste sin www como principal, usa 'https://redcreativa.pro'
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.redcreativa.pro'

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
          '/dashboard'
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
