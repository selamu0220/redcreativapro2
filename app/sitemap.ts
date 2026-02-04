import { generateValidatedSitemap } from '@/lib/sitemap/manager'
import { MetadataRoute } from 'next'

export const dynamic = 'force-static'
export const revalidate = 3600 // 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return generateValidatedSitemap()
}
