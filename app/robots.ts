import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/data/',
          '/debug/',
          '/test/',
          '/auth-debug/',
          '/debug-auth/',
          '/debug-minimal/',
          '/test-*',
          '/*.json$',
          '/private/',
          '/temp/',
        ],
        crawlDelay: 1,
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/data/',
          '/debug/',
          '/test/',
        ],
        crawlDelay: 0.5,
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/data/',
          '/debug/',
          '/test/',
        ],
        crawlDelay: 1,
      }
    ],
    sitemap: [
      'https://redcreativa.pro/sitemap.xml',
      'https://redcreativa.pro/blog/sitemap.xml',
    ],
    host: 'https://redcreativa.pro',
  }
}