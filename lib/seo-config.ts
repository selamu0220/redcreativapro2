// Configuración SEO centralizada
export const seoConfig = {
  // Configuración del sitio
  site: {
    name: 'Red Creativa Pro',
    description: 'Plataforma líder en herramientas de IA para escritura profesional, académica y creativa. Automatiza tu contenido con inteligencia artificial.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://redcreativa.pro',
    logo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://redcreativa.pro'}/logo.png`,
    image: `${process.env.NEXT_PUBLIC_APP_URL || 'https://redcreativa.pro'}/og-image.jpg`
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
      url: process.env.NEXT_PUBLIC_APP_URL || 'https://redcreativa.pro',
      logo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://redcreativa.pro'}/logo.png`,
      sameAs: [
        'https://twitter.com/redcreativapro',
        'https://linkedin.com/company/redcreativapro',
        'https://facebook.com/redcreativapro'
      ]
    },
    website: {
      '@type': 'WebSite',
      name: 'Red Creativa Pro',
      url: process.env.NEXT_PUBLIC_APP_URL || 'https://redcreativa.pro',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${process.env.NEXT_PUBLIC_APP_URL || 'https://redcreativa.pro'}/blog?q={search_term_string}`,
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
}