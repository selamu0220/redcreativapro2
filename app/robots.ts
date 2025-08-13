import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/_next/', '/data/'],
    },
    sitemap: 'https://redcreativa.pro/sitemap.xml',
  }
}