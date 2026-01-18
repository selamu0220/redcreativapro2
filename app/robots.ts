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
          '/auth-debug/',
          '/debug-auth/',
          '/test/',
          '/test-*',
          '/_next/',
          '/static/',
          '/*.json$',
          '/success',
          '/cancel',
          '/auth/signup',
          '/dashboard',
          '/analytics1234'
        ]
      },
      {
        userAgent: 'GPTBot',
        disallow: ['/api/', '/admin/']
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }

}
