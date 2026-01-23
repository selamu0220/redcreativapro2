import { MetadataRoute } from 'next'
import { blogPosts } from '@/lib/blog-data'
import { getAllPromptSlugs } from '@/lib/prompts-data'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.redcreativa.pro'
  const currentDate = new Date()

  // Define main page paths
  const mainPagePaths = [
    { path: '/', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/escritor-ia', priority: 0.95, changeFrequency: 'weekly' as const },
    { path: '/seo-dashboard', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/dashboard', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/planes', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/blog', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/prompts', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/corrector-textos-ia', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/herramientas-ia-copywriting', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/voice-guide', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/glosario', priority: 0.75, changeFrequency: 'weekly' as const },
    { path: '/contacto', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/centro-ayuda', priority: 0.75, changeFrequency: 'weekly' as const },
    { path: '/preguntas-frecuentes', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/plantillas', priority: 0.65, changeFrequency: 'weekly' as const },
    { path: '/calendario', priority: 0.6, changeFrequency: 'weekly' as const },
    { path: '/documentos', priority: 0.6, changeFrequency: 'weekly' as const },
    { path: '/aviso-legal', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/politica-privacidad', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/terminos-servicio', priority: 0.3, changeFrequency: 'yearly' as const },
  ];

  // List of all blog slugs from filesystem to ensure coverage
  // Now using all posts from data source to avoid indexation issues
  const allBlogSlugs = blogPosts.map(post => post.id);

  const entries: MetadataRoute.Sitemap = [];

  // 1. Static Pages

  mainPagePaths.forEach(({ path, priority, changeFrequency }) => {
    entries.push({
      url: `${baseUrl}${path}`,
      lastModified: currentDate,
      changeFrequency,
      priority,
    });
  });

  // 2. Blog Posts

  allBlogSlugs.forEach((slug) => {
    const post = blogPosts.find(p => p.id === slug);
    let basePriority = 0.65;
    let lastModified = currentDate;
    let changeFrequency: 'daily' | 'weekly' | 'monthly' = 'monthly';

    if (post) {
      if (post.featured || post.trending) basePriority = 0.8;
      if (post.views && post.views > 3000) basePriority = 0.85;
      lastModified = new Date(post.publishedAt);
      if (post.featured || post.trending) changeFrequency = 'weekly';
    }

    entries.push({
      url: `${baseUrl}/blog/${slug}`,
      lastModified,
      changeFrequency,
      priority: basePriority,
    });
  });

  // 3. Prompts

  const promptSlugs = getAllPromptSlugs();
  promptSlugs.forEach((slug) => {
    entries.push({
      url: `${baseUrl}/prompts/${slug}`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  });

  return entries.sort((a, b) => (b.priority || 0) - (a.priority || 0));
}
