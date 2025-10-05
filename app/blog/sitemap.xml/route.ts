import { MetadataRoute } from 'next'
import { blogPosts, categories } from '@/lib/blog-data'

export async function GET(): Promise<Response> {
  const baseUrl = 'https://redcreativa.pro'
  
  // Generate sitemap entries for blog posts
  const blogEntries = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.id}`,
    lastModified: new Date(post.date).toISOString(),
    changeFrequency: 'weekly' as const,
    priority: post.featured ? 0.9 : 0.8,
  }))

  // Generate sitemap entries for categories
  const categoryEntries = categories.map((category) => ({
    url: `${baseUrl}/blog?category=${category.id}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Main blog page
  const mainBlogEntry = {
    url: `${baseUrl}/blog`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: 1.0,
  }

  const allEntries = [mainBlogEntry, ...blogEntries, ...categoryEntries]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allEntries
  .map(
    (entry) => `
  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join('')}
</urlset>`

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}