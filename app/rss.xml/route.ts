import { NextResponse } from 'next/server'
import { blogPosts } from '@/lib/blog-data'

export async function GET() {
  const baseUrl = 'https://redcreativa.pro'
  const feedTitle = 'Red Creativa Pro — Blog'
  const feedDescription = 'Artículos, tutoriales y recursos sobre IA y creatividad digital.'
  const feedUrl = `${baseUrl}/rss.xml`

  const items = blogPosts.map(p => {
    const url = `${baseUrl}/blog/${p.id}`
    const pubDate = new Date(p.publishedAt).toUTCString()
    const description = p.excerpt || p.seoDescription || ''
    return `
      <item>
        <title><![CDATA[${p.title}]]></title>
        <link>${url}</link>
        <guid isPermaLink="true">${url}</guid>
        <pubDate>${pubDate}</pubDate>
        <description><![CDATA[${description}]]></description>
      </item>
    `.trim()
  }).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0">
    <channel>
      <title><![CDATA[${feedTitle}]]></title>
      <link>${baseUrl}</link>
      <description><![CDATA[${feedDescription}]]></description>
      <language>es-ES</language>
      <ttl>1800</ttl>
      <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" xmlns:atom="http://www.w3.org/2005/Atom" />
      ${items}
    </channel>
  </rss>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8'
    }
  })
}

