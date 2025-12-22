import { MetadataRoute } from 'next'
import { blogPosts } from '@/lib/blog-data'
import { getAllPromptSlugs } from '@/lib/prompts-data'
import { SUPPORTED_LANGUAGES, LanguageCode } from './lib/language/config'
import { addLanguageToPath } from './lib/language/routing'

export default function sitemap(): MetadataRoute.Sitemap {
  // IMPORTANTE: Este dominio debe coincidir con tu configuración en Vercel
  // Si en Vercel configuraste www como principal, usa 'https://www.redcreativa.pro'
  // Si configuraste sin www como principal, usa 'https://redcreativa.pro'
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://redcreativa.pro'
  const currentDate = new Date()
  
  // Define main page paths (without language prefix)
  const mainPagePaths = [
    { path: '/', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/escritor-ia', priority: 0.95, changeFrequency: 'weekly' as const },
    { path: '/correos-ia', priority: 0.95, changeFrequency: 'weekly' as const },
    { path: '/seo-dashboard', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/dashboard', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/planes', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/blog', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/plantilla-solicitudes-creativas', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/corrector-textos-ia', priority: 0.85, changeFrequency: 'weekly' as const },
    { path: '/herramientas-ia-copywriting', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/buscar', priority: 0.6, changeFrequency: 'weekly' as const },
    { path: '/contacto', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/centro-ayuda', priority: 0.75, changeFrequency: 'weekly' as const },
    { path: '/preguntas-frecuentes', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/prompts', priority: 0.7, changeFrequency: 'weekly' as const },
    { path: '/plantillas', priority: 0.65, changeFrequency: 'weekly' as const },
    { path: '/calendario', priority: 0.6, changeFrequency: 'weekly' as const },
    { path: '/documentos', priority: 0.6, changeFrequency: 'weekly' as const },
    { path: '/contactos', priority: 0.55, changeFrequency: 'weekly' as const },
    { path: '/estadisticas', priority: 0.55, changeFrequency: 'weekly' as const },
    { path: '/ajustes', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/suscripcion', priority: 0.5, changeFrequency: 'weekly' as const },
    { path: '/historial', priority: 0.45, changeFrequency: 'weekly' as const },
    { path: '/auth', priority: 0.4, changeFrequency: 'monthly' as const },
    { path: '/auth/signup', priority: 0.4, changeFrequency: 'monthly' as const },
    { path: '/aviso-legal', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/politica-privacidad', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/terminos-servicio', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/politica-cookies', priority: 0.25, changeFrequency: 'yearly' as const },
  ];

  // Generate multi-language sitemap entries
  const generateMultiLanguageEntries = (): MetadataRoute.Sitemap => {
    const entries: MetadataRoute.Sitemap = [];

    // Generate entries for each main page in all languages
    mainPagePaths.forEach(({ path, priority, changeFrequency }) => {
      Object.keys(SUPPORTED_LANGUAGES).forEach(langCode => {
        const language = langCode as LanguageCode;
        const localizedPath = addLanguageToPath(path, language);
        const url = `${baseUrl}${localizedPath}`;

        // Adjust priority slightly based on language (Spanish gets highest priority as default)
        let adjustedPriority = priority;
        if (language === 'es') {
          adjustedPriority = priority; // Keep original priority for Spanish
        } else if (language === 'en') {
          adjustedPriority = Math.max(0.1, priority - 0.05); // Slightly lower for English
        } else {
          adjustedPriority = Math.max(0.1, priority - 0.1); // Lower for other languages
        }

        entries.push({
          url,
          lastModified: currentDate,
          changeFrequency,
          priority: Math.round(adjustedPriority * 100) / 100,
        });
      });
    });

    return entries;
  };

  // Generate blog entries for all languages
  const generateBlogEntries = (): MetadataRoute.Sitemap => {
    const entries: MetadataRoute.Sitemap = [];

    blogPosts.forEach((post) => {
      // Calculate base priority for the blog post
      let basePriority = 0.6;
      
      // Increase priority by category
      if (post.category === 'creatividad' || post.category === 'productividad') {
        basePriority += 0.1;
      }
      if (post.category === 'ia-educacion') {
        basePriority += 0.05;
      }
      
      // Increase priority by special status
      if (post.featured) {
        basePriority += 0.15;
      }
      if (post.trending) {
        basePriority += 0.1;
      }
      
      // Increase priority by popularity (views)
      if (post.views > 4000) {
        basePriority += 0.1;
      } else if (post.views > 2500) {
        basePriority += 0.05;
      }
      
      // Limit maximum priority for articles
      basePriority = Math.min(basePriority, 0.85);
      
      // Determine change frequency based on popularity and status
      let changeFrequency: 'daily' | 'weekly' | 'monthly' = 'monthly';
      
      if (post.featured || post.trending || post.views > 3500) {
        changeFrequency = 'weekly';
      }
      if (post.featured && post.trending && post.views > 4500) {
        changeFrequency = 'daily';
      }
      
      // Last modified date based on publication date
      const lastModified = new Date(post.publishedAt);

      // Generate entries for each language
      Object.keys(SUPPORTED_LANGUAGES).forEach(langCode => {
        const language = langCode as LanguageCode;
        const blogPath = `/blog/${post.id}`;
        const localizedPath = addLanguageToPath(blogPath, language);
        const url = `${baseUrl}${localizedPath}`;

        // Adjust priority based on language
        let adjustedPriority = basePriority;
        if (language === 'es') {
          adjustedPriority = basePriority; // Keep original priority for Spanish
        } else if (language === 'en') {
          adjustedPriority = Math.max(0.1, basePriority - 0.05); // Slightly lower for English
        } else {
          adjustedPriority = Math.max(0.1, basePriority - 0.1); // Lower for other languages
        }

        entries.push({
          url,
          lastModified,
          changeFrequency,
          priority: Math.round(adjustedPriority * 100) / 100,
        });
      });
    });

    return entries;
  };

  // Combine all entries
  const mainLanguageEntries = generateMultiLanguageEntries();
  const blogLanguageEntries = generateBlogEntries();

  // Generate prompts entries for all languages
  const generatePromptsEntries = (): MetadataRoute.Sitemap => {
    const entries: MetadataRoute.Sitemap = []
    const slugs = getAllPromptSlugs()

    slugs.forEach((slug) => {
      const basePriority = 0.65
      const changeFrequency: 'daily' | 'weekly' | 'monthly' = 'weekly'

      Object.keys(SUPPORTED_LANGUAGES).forEach(langCode => {
        const language = langCode as LanguageCode
        const promptsPath = `/prompts/${slug}`
        const localizedPath = addLanguageToPath(promptsPath, language)
        const url = `${baseUrl}${localizedPath}`

        let adjustedPriority = basePriority
        if (language === 'es') {
          adjustedPriority = basePriority
        } else if (language === 'en') {
          adjustedPriority = Math.max(0.1, basePriority - 0.05)
        } else {
          adjustedPriority = Math.max(0.1, basePriority - 0.1)
        }

        entries.push({
          url,
          lastModified: currentDate,
          changeFrequency,
          priority: Math.round(adjustedPriority * 100) / 100,
        })
      })
    })

    return entries
  }

  const promptsLanguageEntries = generatePromptsEntries()
  const allPages = [...mainLanguageEntries, ...blogLanguageEntries, ...promptsLanguageEntries];
  
  // Sort by priority (highest to lowest) for better organization
  return allPages.sort((a, b) => (b.priority || 0) - (a.priority || 0));
}
