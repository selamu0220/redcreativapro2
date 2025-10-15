import { MetadataRoute } from 'next'
import { blogPosts } from '@/lib/blog-data'

export default function sitemap(): MetadataRoute.Sitemap {
  // Use environment variable for base URL, but always use production domain for sitemap
  // This ensures Google Search Console gets the correct URLs regardless of environment
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.redcreativa.pro'
  const baseUrl = envUrl.includes('localhost') ? 'https://www.redcreativa.pro' : envUrl
  const currentDate = new Date()
  
  // Páginas principales con prioridades optimizadas
  const mainPages: MetadataRoute.Sitemap = [
    // Página principal - máxima prioridad
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    
    // Herramientas principales - alta prioridad
    {
      url: `${baseUrl}/escritor-ia`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/correos-ia`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/seo-dashboard`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    
    // Dashboard y gestión - alta prioridad para usuarios
    {
      url: `${baseUrl}/dashboard`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/planes`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    
    // Blog - contenido dinámico importante
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    
    // Páginas de soporte y contacto
    {
      url: `${baseUrl}/contacto`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/centro-ayuda`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/preguntas-frecuentes`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    
    // Herramientas secundarias
    {
      url: `${baseUrl}/prompts`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/plantillas`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.65,
    },
    {
      url: `${baseUrl}/calendario`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    
    // Gestión de contenido y organización
    {
      url: `${baseUrl}/documentos`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contactos`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.55,
    },
    {
      url: `${baseUrl}/estadisticas`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.55,
    },
    
    // Configuración y cuenta
    {
      url: `${baseUrl}/ajustes`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/suscripcion`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/historial`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.45,
    },
    
    // Autenticación
    {
      url: `${baseUrl}/auth`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/auth/signup`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    
    // Páginas legales - menor prioridad pero necesarias
    {
      url: `${baseUrl}/aviso-legal`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/politica-privacidad`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terminos-servicio`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/politica-cookies`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.25,
    },
  ]

  // Categorización de artículos del blog con prioridades optimizadas
  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => {
    // Determinar prioridad basada en múltiples factores
    let priority = 0.6 // Prioridad base para artículos
    
    // Aumentar prioridad por categoría
    if (post.category === 'creatividad' || post.category === 'productividad') {
      priority += 0.1
    }
    if (post.category === 'ia-educacion') {
      priority += 0.05
    }
    
    // Aumentar prioridad por estado especial
    if (post.featured) {
      priority += 0.15
    }
    if (post.trending) {
      priority += 0.1
    }
    
    // Aumentar prioridad por popularidad (views)
    if (post.views > 4000) {
      priority += 0.1
    } else if (post.views > 2500) {
      priority += 0.05
    }
    
    // Limitar prioridad máxima para artículos
    priority = Math.min(priority, 0.85)
    
    // Determinar frecuencia de cambio basada en popularidad y estado
    let changeFrequency: 'daily' | 'weekly' | 'monthly' = 'monthly'
    
    if (post.featured || post.trending || post.views > 3500) {
      changeFrequency = 'weekly'
    }
    if (post.featured && post.trending && post.views > 4500) {
      changeFrequency = 'daily'
    }
    
    // Fecha de última modificación basada en fecha de publicación
    const lastModified = new Date(post.publishedAt)
    
    return {
      url: `${baseUrl}/blog/${post.id}`,
      lastModified,
      changeFrequency,
      priority: Math.round(priority * 100) / 100, // Redondear a 2 decimales
    }
  })

  // Combinar todas las páginas
  const allPages = [...mainPages, ...blogEntries]
  
  // Ordenar por prioridad (mayor a menor) para mejor organización
  return allPages.sort((a, b) => (b.priority || 0) - (a.priority || 0))
}