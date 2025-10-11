const fs = require('fs');
const path = require('path');

// Configuración optimizada para sitemap
const sitemapConfig = {
  // Páginas principales con alta prioridad
  mainPages: [
    { url: '/', priority: 1.0, changefreq: 'daily' },
    { url: '/blog', priority: 0.9, changefreq: 'daily' },
    { url: '/contacto', priority: 0.8, changefreq: 'monthly' },
    { url: '/preguntas-frecuentes', priority: 0.7, changefreq: 'monthly' },
    { url: '/calendario', priority: 0.6, changefreq: 'weekly' }
  ],
  
  // Configuración para artículos del blog
  blogConfig: {
    basePriority: 0.8,
    featuredBoost: 0.1,
    trendingBoost: 0.05,
    categoryBoosts: {
      'Escritura Académica con IA': 0.1,
      'Escritura Profesional': 0.08,
      'Automatización de Contenido': 0.09,
      'SEO y Marketing': 0.07,
      'Herramientas IA': 0.06
    }
  }
};

// Función para generar sitemap optimizado
function generateOptimizedSitemap() {
  const sitemapPath = path.join(__dirname, 'app', 'sitemap.ts');
  
  const optimizedSitemapContent = `import { MetadataRoute } from 'next'
import { blogPosts } from '@/lib/blog-data'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://redcreativapro.com'
  
  // Páginas principales optimizadas
  const mainPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: \`\${baseUrl}/blog\`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: \`\${baseUrl}/contacto\`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: \`\${baseUrl}/preguntas-frecuentes\`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: \`\${baseUrl}/calendario\`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: \`\${baseUrl}/auth\`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: \`\${baseUrl}/auth/signup\`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: \`\${baseUrl}/contactos\`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: \`\${baseUrl}/documentos\`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: \`\${baseUrl}/prompts\`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    }
  ]

  // Artículos del blog con prioridades optimizadas
  const blogSitemapEntries: MetadataRoute.Sitemap = blogPosts.map((post) => {
    // Calcular prioridad dinámica basada en múltiples factores
    let priority = 0.7 // Prioridad base para artículos
    
    // Boost por categoría
    const categoryBoosts: { [key: string]: number } = {
      'Escritura Académica con IA': 0.15,
      'Escritura Profesional': 0.12,
      'Automatización de Contenido': 0.14,
      'SEO y Marketing': 0.11,
      'Herramientas IA': 0.10,
      'Copywriting con IA': 0.13,
      'Content Marketing': 0.09
    }
    
    if (categoryBoosts[post.category]) {
      priority += categoryBoosts[post.category]
    }
    
    // Boost por featured y trending
    if (post.featured) priority += 0.1
    if (post.trending) priority += 0.05
    
    // Boost por views (normalizado)
    const viewsBoost = Math.min(post.views / 10000, 0.05)
    priority += viewsBoost
    
    // Limitar prioridad máxima
    priority = Math.min(priority, 0.95)
    
    // Determinar frecuencia de cambio
    let changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' = 'weekly'
    
    if (post.featured || post.trending) {
      changeFrequency = 'daily'
    } else if (post.views > 5000) {
      changeFrequency = 'weekly'
    } else {
      changeFrequency = 'monthly'
    }
    
    return {
      url: \`\${baseUrl}/blog/\${post.id}\`,
      lastModified: new Date(post.publishedAt),
      changeFrequency,
      priority: Math.round(priority * 100) / 100, // Redondear a 2 decimales
    }
  })

  return [...mainPages, ...blogSitemapEntries]
}`;

  // Escribir el sitemap optimizado
  fs.writeFileSync(sitemapPath, optimizedSitemapContent, 'utf8');
  console.log('✅ Sitemap optimizado generado exitosamente');
}

// Función para optimizar robots.txt
function optimizeRobotsTxt() {
  const robotsPath = path.join(__dirname, 'app', 'robots.ts');
  
  const optimizedRobotsContent = `import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://redcreativapro.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/debug/',
          '/private/',
          '/*.json$',
          '/auth/reset-password',
          '/auth/verify-email'
        ],
        crawlDelay: 1,
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/static/',
          '/debug/',
          '/private/'
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
          '/debug/',
          '/private/'
        ],
        crawlDelay: 1,
      },
      {
        userAgent: 'facebookexternalhit',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/debug/',
          '/private/'
        ],
      },
      {
        userAgent: 'Twitterbot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/debug/',
          '/private/'
        ],
      },
      {
        userAgent: 'LinkedInBot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/debug/',
          '/private/'
        ],
      }
    ],
    sitemap: \`\${baseUrl}/sitemap.xml\`,
    host: baseUrl,
  }
}`;

  // Escribir robots.txt optimizado
  fs.writeFileSync(robotsPath, optimizedRobotsContent, 'utf8');
  console.log('✅ Robots.txt optimizado generado exitosamente');
}

// Función para crear archivo de configuración SEO adicional
function createSEOConfig() {
  const seoConfigPath = path.join(__dirname, 'lib', 'seo-config.ts');
  
  const seoConfigContent = `// Configuración SEO centralizada
export const seoConfig = {
  // Configuración del sitio
  site: {
    name: 'Red Creativa Pro',
    description: 'Plataforma líder en herramientas de IA para escritura profesional, académica y creativa. Automatiza tu contenido con inteligencia artificial.',
    url: 'https://redcreativapro.com',
    logo: 'https://redcreativapro.com/logo.png',
    image: 'https://redcreativapro.com/og-image.jpg'
  },
  
  // Keywords principales del sitio
  mainKeywords: [
    'herramientas ia escritura',
    'automatización contenido ia',
    'escritura académica inteligencia artificial',
    'copywriting con ia',
    'generación contenido automatizado',
    'redacción profesional ia',
    'optimización seo ia',
    'content marketing inteligencia artificial'
  ],
  
  // Configuración por categorías
  categories: {
    'Escritura Académica con IA': {
      keywords: [
        'herramientas ia escritura académica',
        'automatización papers investigación',
        'generación bibliografías ia',
        'corrección textos académicos ia'
      ],
      description: 'Herramientas de IA especializadas en escritura académica y científica'
    },
    'Escritura Profesional': {
      keywords: [
        'redacción profesional ia',
        'automatización documentos empresariales',
        'generación reportes ia',
        'escritura corporativa inteligente'
      ],
      description: 'Soluciones de IA para escritura profesional y corporativa'
    },
    'Automatización de Contenido': {
      keywords: [
        'automatización contenido digital',
        'generación masiva contenido ia',
        'workflows automatizados escritura',
        'escalabilidad contenido ia'
      ],
      description: 'Automatización completa de procesos de creación de contenido'
    }
  },
  
  // Configuración de Schema markup
  schema: {
    organization: {
      '@type': 'Organization',
      name: 'Red Creativa Pro',
      url: 'https://redcreativapro.com',
      logo: 'https://redcreativapro.com/logo.png',
      sameAs: [
        'https://twitter.com/redcreativapro',
        'https://linkedin.com/company/redcreativapro',
        'https://facebook.com/redcreativapro'
      ]
    },
    website: {
      '@type': 'WebSite',
      name: 'Red Creativa Pro',
      url: 'https://redcreativapro.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://redcreativapro.com/blog?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    }
  }
}

// Función para generar meta tags optimizados
export function generateMetaTags(page: {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: string
}) {
  const baseKeywords = seoConfig.mainKeywords
  const allKeywords = page.keywords ? [...baseKeywords, ...page.keywords] : baseKeywords
  
  return {
    title: page.title,
    description: page.description,
    keywords: allKeywords.join(', '),
    openGraph: {
      title: page.title,
      description: page.description,
      url: page.url || seoConfig.site.url,
      siteName: seoConfig.site.name,
      images: [{
        url: page.image || seoConfig.site.image,
        width: 1200,
        height: 630,
        alt: page.title
      }],
      type: page.type || 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.description,
      images: [page.image || seoConfig.site.image]
    },
    alternates: {
      canonical: page.url || seoConfig.site.url
    }
  }
}`;

  // Crear directorio lib si no existe
  const libDir = path.join(__dirname, 'lib');
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
  }
  
  fs.writeFileSync(seoConfigPath, seoConfigContent, 'utf8');
  console.log('✅ Configuración SEO centralizada creada');
}

// Ejecutar todas las optimizaciones
console.log('🚀 Iniciando optimización de sitemap y robots.txt...');

try {
  generateOptimizedSitemap();
  optimizeRobotsTxt();
  createSEOConfig();
  
  console.log('\\n✅ OPTIMIZACIÓN COMPLETADA:');
  console.log('- Sitemap.xml optimizado con prioridades dinámicas');
  console.log('- Robots.txt mejorado para mejor crawling');
  console.log('- Configuración SEO centralizada creada');
  console.log('- Frecuencias de actualización optimizadas');
  console.log('- Prioridades basadas en categorías y engagement');
  
} catch (error) {
  console.error('❌ Error durante la optimización:', error);
}