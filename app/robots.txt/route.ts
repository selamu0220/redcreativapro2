export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /

# Blog specific rules
Allow: /blog
Allow: /blog/*

# Sitemap
Sitemap: https://redcreativa.pro/sitemap.xml
Sitemap: https://redcreativa.pro/blog/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Disallow admin and private areas
Disallow: /admin
Disallow: /api/private
Disallow: /_next/
Disallow: /static/

# Allow important resources
Allow: /api/og
Allow: /_next/static/
Allow: /_next/image/`

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}