import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  // IMPORTANTE: Este dominio debe coincidir con tu configuración en Vercel
  // Si en Vercel configuraste www como principal, usa 'https://www.redcreativa.pro'
  // Si configuraste sin www como principal, usa 'https://redcreativa.pro'
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://redcreativa.pro'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/']
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
