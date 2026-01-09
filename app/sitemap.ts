import { MetadataRoute } from 'next'
import { blogPosts } from '@/lib/blog-data'
import { getAllPromptSlugs } from '@/lib/prompts-data'
import { SUPPORTED_LANGUAGES, LanguageCode } from './lib/language/config'
import { addLanguageToPath } from './lib/language/routing'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://redcreativa.pro'
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
    { path: '/herramientas-ia', priority: 0.8, changeFrequency: 'weekly' as const },
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
  const filesystemBlogSlugs = [
    'ai-content-creation-tools-comparison',
    'ai-writer-for-marketing',
    'aprende-escribir-articulos-blog-perfectos-ia',
    'asistente-escritura-ia-inteligente',
    'asuntos-carrito-moda-ia-espanol',
    'automatizacion-escritura-ia-workflows',
    'automatizar-correos-electronicos-ia',
    'automatizar-email-marketing-con-ia',
    'automatizar-email-marketing-ia-personalizacion',
    'automatizar-resumenes-reuniones-ia-notion',
    'caso-estudio-agencia-marketing-automatizo-clientes-ia',
    'caso-estudio-b2b-genero-1200-leads-mes-ia',
    'caso-estudio-ecommerce-aumento-ventas-400-ia',
    'caso-estudio-empresa-aumento-trafico-300-ia',
    'caso-estudio-startup-genero-500k-leads-ia',
    'chatgpt-para-escritores',
    'claude-ai-vs-chatgpt-escritura-profesional',
    'colaboracion-academica-ia-equipos-investigacion-4-0',
    'cold-email-ia-saas-b2b-espanol',
    'como-escribir-con-inteligencia-artificial',
    'como-generar-1000-articulos-mes-ia',
    'como-usar-ia-para-escribir-mejor',
    'content-optimization-with-ai',
    'copywriting-con-inteligencia-artificial',
    'corrector-de-textos-inteligente',
    'corrector-gramatica-ia-online',
    'creador-redacciones-automatico-guia-ejemplos',
    'crear-cursos-online-con-ia',
    'crear-ebooks-con-ia',
    'desarrollo-apis-creativas-ia',
    'escribir-articulos-blog-ia',
    'escritor-ia-gratis-online',
    'escritura-academica-ia-tesis-investigacion',
    'estructura-imryd-ia-papers-espanol',
    'generador-contenido-ia-marketing-digital-2025',
    'generador-de-contenido-con-ia',
    'generador-textos-ia-automatico',
    'herramientas-ia-escritura-2025',
    'herramientas-ia-escritura-profesional-2025',
    'herramientas-ia-resumen-textos-legales-espanol',
    'ia-copywriting-aumentar-ventas-500-porciento',
    'ia-copywriting-ventas',
    'ia-copywriting-ventas-conversion-2025',
    'ia-para-marketing-de-contenidos',
    'ia-para-redes-sociales',
    'ia-vs-redactor-humano',
    'imryd-errores-comunes-ia-espanol',
    'mejor-herramienta-ia-escritura-gratis-2025',
    'mejorar-textos-ia-gratis',
    'mejorar-textos-ventas-ia-paso-a-paso',
    'mejores-prompts-ia-escritura',
    'nurturing-email-ia-saas-seguridad-espanol',
    'nurturing-seguridad-ciso-ia-espanol',
    'onboarding-email-ia-saas-seguridad-espanol',
    'optimizar-contenido-seo-ia',
    'optimizar-contenido-seo-ia-2025',
    'parafrasear-con-inteligencia-artificial',
    'personalizar-tono-voz-ia',
    'plantilla-prompts-mejorar-correos-ventas-b2b',
    'plantillas-correos-ia-ecommerce-espanol',
    'plantillas-de-prompts-para-ia',
    'plantillas-postcompra-belleza-ia-espanol',
    'prompts-copywriters-freelance-b2b-espanol',
    'prompts-ia-tesis-espanol',
    'redactor-ia-profesional-2025',
    'reposicion-belleza-ia-espanol',
    'reposicion-cabello-ia-espanol',
    'resumir-textos-con-ia',
    'revision-literatura-ia-papers-universitarios-espanol',
    'seo-con-inteligencia-artificial',
    'seo-contenido-ia-posicionamiento-google-2025',
    'software-redaccion-automatica-2025',
    'textos-automaticos-cuando-usarlos-cuando-no',
    'traducir-textos-con-ia',
    'workflows-automatizacion-escritura-ia'
  ];

  // Merge blog slugs from data and filesystem
  const allBlogSlugs = Array.from(new Set([
    ...blogPosts.map(post => post.id),
    ...filesystemBlogSlugs
  ]));

  const entries: MetadataRoute.Sitemap = [];

  // 1. Static Pages
  mainPagePaths.forEach(({ path, priority, changeFrequency }) => {
    Object.keys(SUPPORTED_LANGUAGES).forEach(langCode => {
      const language = langCode as LanguageCode;
      const localizedPath = addLanguageToPath(path, language);
      const url = `${baseUrl}${localizedPath}`;

      let adjustedPriority = priority;
      if (language !== 'es') adjustedPriority = Math.max(0.1, priority - 0.1);

      entries.push({
        url,
        lastModified: currentDate,
        changeFrequency,
        priority: Math.round(adjustedPriority * 100) / 100,
      });
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

    Object.keys(SUPPORTED_LANGUAGES).forEach(langCode => {
      const language = langCode as LanguageCode;
      const blogPath = `/blog/${slug}`;
      const localizedPath = addLanguageToPath(blogPath, language);
      const url = `${baseUrl}${localizedPath}`;

      let adjustedPriority = basePriority;
      if (language !== 'es') adjustedPriority = Math.max(0.1, basePriority - 0.1);

      entries.push({
        url,
        lastModified,
        changeFrequency,
        priority: Math.round(adjustedPriority * 100) / 100,
      });
    });
  });

  // 3. Prompts
  const promptSlugs = getAllPromptSlugs();
  promptSlugs.forEach((slug) => {
    const basePriority = 0.7;
    Object.keys(SUPPORTED_LANGUAGES).forEach(langCode => {
      const language = langCode as LanguageCode;
      const promptsPath = `/prompts/${slug}`;
      const localizedPath = addLanguageToPath(promptsPath, language);
      const url = `${baseUrl}${localizedPath}`;

      let adjustedPriority = basePriority;
      if (language !== 'es') adjustedPriority = Math.max(0.1, basePriority - 0.1);

      entries.push({
        url,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: Math.round(adjustedPriority * 100) / 100,
      });
    });
  });

  return entries.sort((a, b) => (b.priority || 0) - (a.priority || 0));
}
