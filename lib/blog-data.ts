export interface BlogPost {
  id: string
  title: string
  excerpt: string
  content?: string
  category: string
  subcategory?: string
  tags: string[]
  readTime: string
  date: string
  author: {
    name: string
    avatar: string
    bio: string
  }
  featured: boolean
  trending: boolean
  views: number
  likes: number
  seoTitle?: string
  seoDescription?: string
  image?: string
}

export interface Category {
  id: string
  name: string
  description: string
  icon: string
  subcategories: Subcategory[]
  color: string
}

export interface Subcategory {
  id: string
  name: string
  description: string
}

export const categories: Category[] = [
  {
    id: 'escritura-ia',
    name: 'Escritura con IA',
    description: 'Técnicas y herramientas para escribir con inteligencia artificial',
    icon: '🤖',
    color: 'bg-blue-500',
    subcategories: [
      { id: 'fundamentos', name: 'Fundamentos', description: 'Conceptos básicos de escritura con IA' },
      { id: 'tecnicas-avanzadas', name: 'Técnicas Avanzadas', description: 'Métodos profesionales y especializados' },
      { id: 'casos-uso', name: 'Casos de Uso', description: 'Aplicaciones prácticas en diferentes industrias' }
    ]
  },
  {
    id: 'herramientas-ia',
    name: 'Herramientas IA',
    description: 'Revisiones y comparativas de software de escritura IA',
    icon: '🛠️',
    color: 'bg-purple-500',
    subcategories: [
      { id: 'chatgpt', name: 'ChatGPT', description: 'Guías y trucos para ChatGPT' },
      { id: 'claude', name: 'Claude', description: 'Uso profesional de Claude AI' },
      { id: 'gemini', name: 'Gemini', description: 'Google Gemini para escritura' },
      { id: 'otras-herramientas', name: 'Otras Herramientas', description: 'Jasper, Copy.ai, Writesonic y más' }
    ]
  },
  {
    id: 'copywriting-ia',
    name: 'Copywriting IA',
    description: 'Escritura persuasiva y de ventas con inteligencia artificial',
    icon: '✍️',
    color: 'bg-green-500',
    subcategories: [
      { id: 'emails-ventas', name: 'Emails de Ventas', description: 'Automatización de email marketing' },
      { id: 'landing-pages', name: 'Landing Pages', description: 'Textos que convierten' },
      { id: 'anuncios', name: 'Anuncios', description: 'Copy para Facebook, Google Ads y más' },
      { id: 'ecommerce', name: 'E-commerce', description: 'Descripciones de productos y fichas' }
    ]
  },
  {
    id: 'seo-contenido',
    name: 'SEO y Contenido',
    description: 'Optimización para buscadores con IA',
    icon: '🔍',
    color: 'bg-orange-500',
    subcategories: [
      { id: 'investigacion-keywords', name: 'Research de Keywords', description: 'Encontrar palabras clave con IA' },
      { id: 'contenido-seo', name: 'Contenido SEO', description: 'Artículos optimizados para Google' },
      { id: 'meta-tags', name: 'Meta Tags', description: 'Títulos y descripciones que rankean' },
      { id: 'contenido-largo', name: 'Contenido Largo', description: 'Artículos de más de 2000 palabras' }
    ]
  },
  {
    id: 'prompts-ia',
    name: 'Prompts IA',
    description: 'Colección de prompts efectivos para escritura',
    icon: '💡',
    color: 'bg-yellow-500',
    subcategories: [
      { id: 'prompts-basicos', name: 'Prompts Básicos', description: 'Para principiantes en IA' },
      { id: 'prompts-avanzados', name: 'Prompts Avanzados', description: 'Para usuarios experimentados' },
      { id: 'prompts-industria', name: 'Por Industria', description: 'Prompts específicos por sector' },
      { id: 'prompt-engineering', name: 'Prompt Engineering', description: 'Técnicas de ingeniería de prompts' }
    ]
  },
  {
    id: 'marketing-contenidos',
    name: 'Marketing de Contenidos',
    description: 'Estrategias de contenido con IA',
    icon: '📈',
    color: 'bg-red-500',
    subcategories: [
      { id: 'estrategia-contenido', name: 'Estrategia', description: 'Planificación de contenido con IA' },
      { id: 'redes-sociales', name: 'Redes Sociales', description: 'Posts para Instagram, LinkedIn, Twitter' },
      { id: 'blog-corporativo', name: 'Blog Corporativo', description: 'Contenido empresarial' },
      { id: 'newsletters', name: 'Newsletters', description: 'Boletines automatizados' }
    ]
  },
  {
    id: 'automatizacion',
    name: 'Automatización',
    description: 'Workflows y procesos automatizados de escritura',
    icon: '⚡',
    color: 'bg-indigo-500',
    subcategories: [
      { id: 'workflows', name: 'Workflows', description: 'Procesos automatizados de escritura' },
      { id: 'integraciones', name: 'Integraciones', description: 'APIs y conectores' },
      { id: 'zapier-make', name: 'Zapier & Make', description: 'Automatización sin código' },
      { id: 'scripts-personalizados', name: 'Scripts', description: 'Automatización con código' }
    ]
  },
  {
    id: 'casos-estudio',
    name: 'Casos de Estudio',
    description: 'Ejemplos reales de éxito con IA',
    icon: '📊',
    color: 'bg-teal-500',
    subcategories: [
      { id: 'empresas', name: 'Empresas', description: 'Casos de éxito empresariales' },
      { id: 'freelancers', name: 'Freelancers', description: 'Historias de freelancers exitosos' },
      { id: 'agencias', name: 'Agencias', description: 'Casos de agencias de marketing' },
      { id: 'ecommerce-casos', name: 'E-commerce', description: 'Tiendas online que triunfan con IA' }
    ]
  },
  {
    id: 'tendencias-futuro',
    name: 'Tendencias y Futuro',
    description: 'El futuro de la escritura con IA',
    icon: '🚀',
    color: 'bg-pink-500',
    subcategories: [
      { id: 'nuevas-tecnologias', name: 'Nuevas Tecnologías', description: 'GPT-5, Claude 4 y más' },
      { id: 'predicciones', name: 'Predicciones', description: 'El futuro de la IA en escritura' },
      { id: 'etica-ia', name: 'Ética IA', description: 'Uso responsable de la IA' },
      { id: 'regulaciones', name: 'Regulaciones', description: 'Leyes y normativas sobre IA' }
    ]
  },
  {
    id: 'tutoriales-practicos',
    name: 'Tutoriales Prácticos',
    description: 'Guías paso a paso para dominar la escritura IA',
    icon: '🎯',
    color: 'bg-cyan-500',
    subcategories: [
      { id: 'principiantes', name: 'Principiantes', description: 'Para quienes empiezan con IA' },
      { id: 'intermedio', name: 'Intermedio', description: 'Usuarios con experiencia básica' },
      { id: 'avanzado', name: 'Avanzado', description: 'Para expertos en IA' },
      { id: 'masterclass', name: 'Masterclass', description: 'Cursos completos y detallados' }
    ]
  }
]

export const authors = [
  {
    name: 'Carlos Mendoza',
    avatar: '/avatars/carlos.jpg',
    bio: 'Experto en IA y marketing digital con más de 8 años de experiencia. Fundador de Red Creativa Pro.'
  },
  {
    name: 'Ana García',
    avatar: '/avatars/ana.jpg',
    bio: 'Copywriter especializada en IA y automatización. Autora de más de 500 artículos sobre escritura digital.'
  },
  {
    name: 'Miguel Torres',
    avatar: '/avatars/miguel.jpg',
    bio: 'Desarrollador y consultor en IA. Especialista en integración de herramientas de escritura automatizada.'
  },
  {
    name: 'Laura Rodríguez',
    avatar: '/avatars/laura.jpg',
    bio: 'SEO Manager y content strategist. Experta en posicionamiento orgánico con contenido generado por IA.'
  }
]

export const blogPosts: BlogPost[] = [
  // Escritura con IA - Fundamentos
  {
    id: 'como-usar-ia-para-escribir-mejor',
    title: 'Cómo usar IA para escribir mejor: Guía completa 2025',
    excerpt: 'Descubre las mejores técnicas y herramientas de inteligencia artificial para mejorar tu escritura profesional y crear contenido de calidad.',
    category: 'escritura-ia',
    subcategory: 'fundamentos',
    tags: ['principiantes', 'guía', 'técnicas', 'productividad'],
    readTime: '8 min',
    date: '2025-01-29',
    author: authors[0],
    featured: true,
    trending: true,
    views: 15420,
    likes: 342,
    seoTitle: 'Cómo usar IA para escribir mejor - Guía completa 2025',
    seoDescription: 'Aprende a usar inteligencia artificial para mejorar tu escritura. Técnicas, herramientas y consejos profesionales para crear contenido de calidad.'
  },
  {
    id: 'fundamentos-escritura-inteligencia-artificial',
    title: 'Fundamentos de la escritura con inteligencia artificial',
    excerpt: 'Los conceptos básicos que todo escritor debe conocer antes de empezar a usar herramientas de IA para crear contenido profesional.',
    category: 'escritura-ia',
    subcategory: 'fundamentos',
    tags: ['fundamentos', 'conceptos', 'principiantes', 'teoría'],
    readTime: '6 min',
    date: '2025-01-28',
    author: authors[1],
    featured: false,
    trending: true,
    views: 8930,
    likes: 156,
    seoTitle: 'Fundamentos de escritura con IA - Conceptos básicos',
    seoDescription: 'Aprende los conceptos fundamentales de la escritura con inteligencia artificial. Guía para principiantes.'
  },
  {
    id: 'primeros-pasos-escritura-ia',
    title: 'Primeros pasos en la escritura con IA: De cero a experto',
    excerpt: 'Una guía completa para dar tus primeros pasos en el mundo de la escritura asistida por inteligencia artificial.',
    category: 'escritura-ia',
    subcategory: 'fundamentos',
    tags: ['principiantes', 'tutorial', 'paso-a-paso', 'básico'],
    readTime: '10 min',
    date: '2025-01-27',
    author: authors[2],
    featured: false,
    trending: false,
    views: 6750,
    likes: 98,
    seoTitle: 'Primeros pasos escritura IA - Tutorial completo',
    seoDescription: 'Guía paso a paso para empezar con la escritura IA. De principiante a experto en inteligencia artificial.'
  },

  // Escritura con IA - Técnicas Avanzadas
  {
    id: 'tecnicas-avanzadas-escritura-ia-profesional',
    title: 'Técnicas avanzadas de escritura IA para profesionales',
    excerpt: 'Domina las técnicas más sofisticadas de escritura con IA. Métodos profesionales para crear contenido de alta calidad.',
    category: 'escritura-ia',
    subcategory: 'tecnicas-avanzadas',
    tags: ['avanzado', 'profesional', 'técnicas', 'calidad'],
    readTime: '12 min',
    date: '2025-01-26',
    author: authors[0],
    featured: true,
    trending: false,
    views: 12340,
    likes: 287,
    seoTitle: 'Técnicas avanzadas escritura IA profesional',
    seoDescription: 'Domina técnicas avanzadas de escritura con IA. Métodos profesionales para contenido de alta calidad.'
  },
  {
    id: 'optimizacion-prompts-escritura-creativa',
    title: 'Optimización de prompts para escritura creativa avanzada',
    excerpt: 'Aprende a crear prompts sofisticados que generen contenido creativo y original usando técnicas de prompt engineering.',
    category: 'escritura-ia',
    subcategory: 'tecnicas-avanzadas',
    tags: ['prompts', 'creatividad', 'optimización', 'engineering'],
    readTime: '9 min',
    date: '2025-01-25',
    author: authors[3],
    featured: false,
    trending: true,
    views: 9870,
    likes: 203,
    seoTitle: 'Optimización prompts escritura creativa IA',
    seoDescription: 'Crea prompts avanzados para escritura creativa con IA. Técnicas de prompt engineering profesional.'
  },

  // Herramientas IA - ChatGPT
  {
    id: 'chatgpt-escritura-profesional-guia-completa',
    title: 'ChatGPT para escritura profesional: Guía completa 2025',
    excerpt: 'Todo lo que necesitas saber para usar ChatGPT como herramienta de escritura profesional. Trucos, técnicas y mejores prácticas.',
    category: 'herramientas-ia',
    subcategory: 'chatgpt',
    tags: ['chatgpt', 'profesional', 'guía', 'técnicas'],
    readTime: '15 min',
    date: '2025-01-24',
    author: authors[1],
    featured: true,
    trending: true,
    views: 18750,
    likes: 456,
    seoTitle: 'ChatGPT escritura profesional - Guía completa 2025',
    seoDescription: 'Domina ChatGPT para escritura profesional. Guía completa con trucos, técnicas y mejores prácticas 2025.'
  },
  {
    id: 'chatgpt-4-vs-chatgpt-3-escritura',
    title: 'ChatGPT-4 vs ChatGPT-3.5: ¿Cuál es mejor para escribir?',
    excerpt: 'Comparativa detallada entre las versiones de ChatGPT para determinar cuál es la mejor opción para escritura profesional.',
    category: 'herramientas-ia',
    subcategory: 'chatgpt',
    tags: ['comparativa', 'chatgpt-4', 'chatgpt-3.5', 'análisis'],
    readTime: '8 min',
    date: '2025-01-23',
    author: authors[2],
    featured: false,
    trending: false,
    views: 11230,
    likes: 189,
    seoTitle: 'ChatGPT-4 vs ChatGPT-3.5 para escritura',
    seoDescription: 'Comparativa completa ChatGPT-4 vs ChatGPT-3.5 para escritura. Descubre cuál es mejor para tus necesidades.'
  },

  // Herramientas IA - Claude
  {
    id: 'claude-ai-escritura-larga-contenido',
    title: 'Claude AI para escritura de contenido largo y detallado',
    excerpt: 'Descubre cómo usar Claude AI para crear artículos largos, informes detallados y contenido extenso de alta calidad.',
    category: 'herramientas-ia',
    subcategory: 'claude',
    tags: ['claude', 'contenido-largo', 'artículos', 'detallado'],
    readTime: '11 min',
    date: '2025-01-22',
    author: authors[3],
    featured: false,
    trending: true,
    views: 7890,
    likes: 134,
    seoTitle: 'Claude AI escritura contenido largo - Guía práctica',
    seoDescription: 'Usa Claude AI para crear contenido largo y detallado. Técnicas para artículos extensos de alta calidad.'
  },

  // Copywriting IA - Emails de Ventas
  {
    id: 'automatizar-correos-electronicos-ia',
    title: 'Cómo automatizar correos electrónicos con IA en 2025',
    excerpt: 'Aprende a crear emails profesionales automáticamente usando inteligencia artificial. Ahorra tiempo y mejora tus comunicaciones.',
    category: 'copywriting-ia',
    subcategory: 'emails-ventas',
    tags: ['email-marketing', 'automatización', 'ventas', 'conversión'],
    readTime: '6 min',
    date: '2025-01-21',
    author: authors[0],
    featured: false,
    trending: false,
    views: 13450,
    likes: 298,
    seoTitle: 'Automatizar emails con IA - Guía completa 2025',
    seoDescription: 'Automatiza tus emails con IA. Crea correos profesionales que convierten usando inteligencia artificial.'
  },
  {
    id: 'secuencias-email-marketing-ia-automaticas',
    title: 'Secuencias de email marketing automáticas con IA',
    excerpt: 'Crea secuencias de email marketing que convierten usando IA. Desde el welcome email hasta la venta final.',
    category: 'copywriting-ia',
    subcategory: 'emails-ventas',
    tags: ['secuencias', 'email-marketing', 'automatización', 'funnel'],
    readTime: '13 min',
    date: '2025-01-20',
    author: authors[1],
    featured: true,
    trending: false,
    views: 9650,
    likes: 187,
    seoTitle: 'Secuencias email marketing IA automáticas',
    seoDescription: 'Crea secuencias de email marketing automáticas con IA. Del welcome email a la venta final.'
  },

  // Copywriting IA - Landing Pages
  {
    id: 'ia-copywriting-ventas',
    title: 'IA para copywriting: Cómo escribir textos que venden',
    excerpt: 'Técnicas avanzadas de copywriting con IA para crear textos persuasivos que conviertan visitantes en clientes.',
    category: 'copywriting-ia',
    subcategory: 'landing-pages',
    tags: ['copywriting', 'ventas', 'conversión', 'persuasión'],
    readTime: '8 min',
    date: '2025-01-19',
    author: authors[2],
    featured: false,
    trending: true,
    views: 16780,
    likes: 389,
    seoTitle: 'IA copywriting ventas - Textos que convierten',
    seoDescription: 'Usa IA para copywriting de ventas. Crea textos persuasivos que conviertan visitantes en clientes.'
  },
  {
    id: 'landing-pages-alta-conversion-ia',
    title: 'Landing pages de alta conversión creadas con IA',
    excerpt: 'Aprende a crear landing pages que convierten usando IA. Desde el headline hasta el call-to-action perfecto.',
    category: 'copywriting-ia',
    subcategory: 'landing-pages',
    tags: ['landing-pages', 'conversión', 'cta', 'headlines'],
    readTime: '10 min',
    date: '2025-01-18',
    author: authors[3],
    featured: false,
    trending: false,
    views: 8920,
    likes: 156,
    seoTitle: 'Landing pages alta conversión con IA',
    seoDescription: 'Crea landing pages de alta conversión con IA. Del headline al CTA perfecto usando inteligencia artificial.'
  },

  // SEO y Contenido
  {
    id: 'optimizar-contenido-seo-ia',
    title: 'Cómo optimizar contenido SEO con inteligencia artificial',
    excerpt: 'Estrategias avanzadas para crear contenido optimizado para buscadores usando herramientas de IA. Mejora tu posicionamiento web.',
    category: 'seo-contenido',
    subcategory: 'contenido-seo',
    tags: ['seo', 'posicionamiento', 'google', 'optimización'],
    readTime: '9 min',
    date: '2025-01-17',
    author: authors[3],
    featured: true,
    trending: true,
    views: 14560,
    likes: 312,
    seoTitle: 'Optimizar contenido SEO con IA - Guía 2025',
    seoDescription: 'Optimiza tu contenido SEO con IA. Estrategias avanzadas para mejorar tu posicionamiento en Google.'
  },
  {
    id: 'investigacion-keywords-ia-herramientas',
    title: 'Investigación de keywords con IA: Herramientas y técnicas',
    excerpt: 'Descubre cómo usar IA para encontrar las mejores keywords para tu contenido. Herramientas y estrategias profesionales.',
    category: 'seo-contenido',
    subcategory: 'investigacion-keywords',
    tags: ['keywords', 'investigación', 'seo', 'herramientas'],
    readTime: '12 min',
    date: '2025-01-16',
    author: authors[0],
    featured: false,
    trending: false,
    views: 10340,
    likes: 198,
    seoTitle: 'Investigación keywords con IA - Herramientas 2025',
    seoDescription: 'Investiga keywords con IA. Herramientas y técnicas profesionales para encontrar las mejores palabras clave.'
  },

  // Prompts IA
  {
    id: 'mejores-prompts-ia-escritura',
    title: 'Los 50 mejores prompts de IA para escritura profesional',
    excerpt: 'Colección completa de prompts probados para generar contenido de calidad con herramientas de inteligencia artificial.',
    category: 'prompts-ia',
    subcategory: 'prompts-avanzados',
    tags: ['prompts', 'colección', 'profesional', 'plantillas'],
    readTime: '12 min',
    date: '2025-01-15',
    author: authors[1],
    featured: true,
    trending: true,
    views: 22340,
    likes: 567,
    seoTitle: '50 mejores prompts IA escritura profesional',
    seoDescription: 'Colección de los 50 mejores prompts de IA para escritura profesional. Plantillas probadas y efectivas.'
  },
  {
    id: 'prompt-engineering-escritura-avanzada',
    title: 'Prompt Engineering para escritura avanzada con IA',
    excerpt: 'Domina el arte del prompt engineering para obtener resultados excepcionales en tus textos generados por IA.',
    category: 'prompts-ia',
    subcategory: 'prompt-engineering',
    tags: ['prompt-engineering', 'avanzado', 'técnicas', 'optimización'],
    readTime: '14 min',
    date: '2025-01-14',
    author: authors[2],
    featured: false,
    trending: true,
    views: 11890,
    likes: 234,
    seoTitle: 'Prompt Engineering escritura IA avanzada',
    seoDescription: 'Domina prompt engineering para escritura IA avanzada. Técnicas profesionales para mejores resultados.'
  },

  // Marketing de Contenidos
  {
    id: 'estrategia-contenido-ia-2025',
    title: 'Estrategia de contenido con IA: Plan completo para 2025',
    excerpt: 'Crea una estrategia de contenido ganadora usando IA. Planificación, creación y distribución automatizada.',
    category: 'marketing-contenidos',
    subcategory: 'estrategia-contenido',
    tags: ['estrategia', 'planificación', 'contenido', 'marketing'],
    readTime: '16 min',
    date: '2025-01-13',
    author: authors[3],
    featured: true,
    trending: false,
    views: 13670,
    likes: 289,
    seoTitle: 'Estrategia contenido IA 2025 - Plan completo',
    seoDescription: 'Crea tu estrategia de contenido con IA para 2025. Planificación, creación y distribución automatizada.'
  },
  {
    id: 'contenido-redes-sociales-ia-automatico',
    title: 'Contenido para redes sociales automático con IA',
    excerpt: 'Automatiza la creación de contenido para Instagram, LinkedIn, Twitter y más usando inteligencia artificial.',
    category: 'marketing-contenidos',
    subcategory: 'redes-sociales',
    tags: ['redes-sociales', 'automatización', 'instagram', 'linkedin'],
    readTime: '9 min',
    date: '2025-01-12',
    author: authors[0],
    featured: false,
    trending: true,
    views: 15230,
    likes: 342,
    seoTitle: 'Contenido redes sociales automático IA',
    seoDescription: 'Automatiza contenido para redes sociales con IA. Instagram, LinkedIn, Twitter y más plataformas.'
  },

  // Herramientas IA - Otras Herramientas
  {
    id: 'herramientas-ia-escritura-2025',
    title: 'Las 15 mejores herramientas de IA para escritura en 2025',
    excerpt: 'Revisión completa de las herramientas de inteligencia artificial más efectivas para crear contenido profesional.',
    category: 'herramientas-ia',
    subcategory: 'otras-herramientas',
    tags: ['herramientas', 'comparativa', 'revisión', 'software'],
    readTime: '11 min',
    date: '2025-01-11',
    author: authors[1],
    featured: false,
    trending: false,
    views: 19450,
    likes: 423,
    seoTitle: '15 mejores herramientas IA escritura 2025',
    seoDescription: 'Las 15 mejores herramientas de IA para escritura en 2025. Comparativa completa y revisión detallada.'
  },
  {
    id: 'jasper-vs-copy-ai-comparativa-completa',
    title: 'Jasper vs Copy.ai: Comparativa completa 2025',
    excerpt: 'Análisis detallado de las dos herramientas de copywriting IA más populares. Precios, características y rendimiento.',
    category: 'herramientas-ia',
    subcategory: 'otras-herramientas',
    tags: ['jasper', 'copy-ai', 'comparativa', 'copywriting'],
    readTime: '13 min',
    date: '2025-01-10',
    author: authors[2],
    featured: false,
    trending: false,
    views: 8760,
    likes: 167,
    seoTitle: 'Jasper vs Copy.ai comparativa completa 2025',
    seoDescription: 'Comparativa Jasper vs Copy.ai 2025. Análisis detallado de precios, características y rendimiento.'
  },

  // Blogging
  {
    id: 'escribir-articulos-blog-ia',
    title: 'Cómo escribir artículos de blog perfectos con IA',
    excerpt: 'Metodología paso a paso para crear artículos de blog atractivos y bien estructurados usando inteligencia artificial.',
    category: 'tutoriales-practicos',
    subcategory: 'intermedio',
    tags: ['blogging', 'artículos', 'estructura', 'metodología'],
    readTime: '7 min',
    date: '2025-01-09',
    author: authors[3],
    featured: false,
    trending: false,
    views: 12890,
    likes: 245,
    seoTitle: 'Escribir artículos blog perfectos con IA',
    seoDescription: 'Aprende a escribir artículos de blog perfectos con IA. Metodología paso a paso para contenido atractivo.'
  },

  // Automatización
  {
    id: 'workflows-automatizacion-escritura-ia',
    title: 'Workflows de automatización para escritura con IA',
    excerpt: 'Crea flujos de trabajo automatizados que te permitan producir contenido de calidad a escala usando IA.',
    category: 'automatizacion',
    subcategory: 'workflows',
    tags: ['workflows', 'automatización', 'productividad', 'escalabilidad'],
    readTime: '15 min',
    date: '2025-01-08',
    author: authors[0],
    featured: true,
    trending: false,
    views: 7650,
    likes: 143,
    seoTitle: 'Workflows automatización escritura IA',
    seoDescription: 'Crea workflows de automatización para escritura IA. Produce contenido de calidad a escala.'
  },

  // Casos de Estudio
  {
    id: 'caso-estudio-empresa-contenido-ia',
    title: 'Caso de estudio: Empresa aumentó tráfico 300% con IA',
    excerpt: 'Análisis detallado de cómo una empresa B2B triplicó su tráfico orgánico usando estrategias de contenido con IA.',
    category: 'casos-estudio',
    subcategory: 'empresas',
    tags: ['caso-estudio', 'tráfico', 'b2b', 'resultados'],
    readTime: '11 min',
    date: '2025-01-07',
    author: authors[1],
    featured: false,
    trending: true,
    views: 9340,
    likes: 198,
    seoTitle: 'Caso estudio empresa tráfico 300% IA',
    seoDescription: 'Caso de estudio real: empresa aumentó tráfico 300% con IA. Estrategias y resultados detallados.'
  },

  // Tendencias y Futuro
  {
    id: 'futuro-escritura-inteligencia-artificial',
    title: 'El futuro de la escritura: Tendencias de IA para 2025-2030',
    excerpt: 'Análisis de las tendencias emergentes en escritura con IA y cómo prepararse para el futuro del contenido digital.',
    category: 'tendencias-futuro',
    subcategory: 'predicciones',
    tags: ['futuro', 'tendencias', 'predicciones', '2030'],
    readTime: '10 min',
    date: '2025-01-06',
    author: authors[2],
    featured: false,
    trending: false,
    views: 11230,
    likes: 234,
    seoTitle: 'Futuro escritura IA tendencias 2025-2030',
    seoDescription: 'El futuro de la escritura con IA. Tendencias y predicciones para 2025-2030 en contenido digital.'
  },

  // Branding
  {
    id: 'personalizar-tono-voz-ia',
    title: 'Cómo personalizar el tono de voz en textos generados por IA',
    excerpt: 'Guía completa para mantener la consistencia de marca y personalidad en contenido creado con inteligencia artificial.',
    category: 'escritura-ia',
    subcategory: 'tecnicas-avanzadas',
    tags: ['tono-voz', 'branding', 'personalidad', 'consistencia'],
    readTime: '6 min',
    date: '2025-01-05',
    author: authors[3],
    featured: false,
    trending: false,
    views: 8450,
    likes: 156,
    seoTitle: 'Personalizar tono voz IA textos generados',
    seoDescription: 'Personaliza el tono de voz en textos IA. Mantén consistencia de marca en contenido generado por IA.'
  },

  // Tutoriales Prácticos - Principiantes
  {
    id: 'guia-principiantes-escritura-ia-2025',
    title: 'Guía para principiantes: Escritura con IA desde cero',
    excerpt: 'Todo lo que necesitas saber para empezar con la escritura IA. Desde conceptos básicos hasta tu primer artículo.',
    category: 'tutoriales-practicos',
    subcategory: 'principiantes',
    tags: ['principiantes', 'guía', 'básico', 'tutorial'],
    readTime: '14 min',
    date: '2025-01-04',
    author: authors[0],
    featured: true,
    trending: false,
    views: 16780,
    likes: 378,
    seoTitle: 'Guía principiantes escritura IA desde cero',
    seoDescription: 'Guía completa para principiantes en escritura IA. Aprende desde cero hasta crear tu primer artículo.'
  },

  // Más artículos para completar 40+
  {
    id: 'ia-vs-redactor-humano',
    title: 'IA vs Redactor Humano: ¿Cuál elegir en 2025?',
    excerpt: 'Comparativa detallada entre la escritura con IA y redactores humanos. Ventajas, desventajas y cuándo usar cada opción.',
    category: 'escritura-ia',
    subcategory: 'casos-uso',
    tags: ['comparativa', 'humano-vs-ia', 'decisión', 'análisis'],
    readTime: '10 min',
    date: '2025-01-03',
    author: authors[1],
    featured: false,
    trending: false,
    views: 13450,
    likes: 267,
    seoTitle: 'IA vs Redactor Humano comparativa 2025',
    seoDescription: 'IA vs Redactor Humano: comparativa completa. Ventajas, desventajas y cuándo usar cada opción en 2025.'
  },
  {
    id: 'mejorar-textos-ia-gratis',
    title: 'Cómo mejorar textos con IA gratis: 10 herramientas',
    excerpt: 'Descubre las mejores herramientas gratuitas de IA para mejorar tus textos. Corrección, estilo y optimización sin costo.',
    category: 'herramientas-ia',
    subcategory: 'otras-herramientas',
    tags: ['gratis', 'herramientas', 'mejora', 'corrección'],
    readTime: '8 min',
    date: '2025-01-02',
    author: authors[2],
    featured: false,
    trending: true,
    views: 18920,
    likes: 445,
    seoTitle: 'Mejorar textos IA gratis - 10 herramientas',
    seoDescription: 'Mejora tus textos con IA gratis. 10 herramientas gratuitas para corrección, estilo y optimización.'
  },
  {
    id: 'escritor-ia-gratis-online',
    title: 'Mejor escritor de IA gratis online 2025',
    excerpt: 'Comparativa de los mejores escritores de IA gratuitos disponibles online. Características, limitaciones y recomendaciones.',
    category: 'herramientas-ia',
    subcategory: 'otras-herramientas',
    tags: ['gratis', 'online', 'escritor-ia', 'comparativa'],
    readTime: '9 min',
    date: '2025-01-01',
    author: authors[3],
    featured: false,
    trending: false,
    views: 21340,
    likes: 512,
    seoTitle: 'Mejor escritor IA gratis online 2025',
    seoDescription: 'Los mejores escritores de IA gratis online 2025. Comparativa completa con características y limitaciones.'
  }
]

// Función para obtener posts por categoría
export function getPostsByCategory(categoryId: string): BlogPost[] {
  return blogPosts.filter(post => post.category === categoryId)
}

// Función para obtener posts por subcategoría
export function getPostsBySubcategory(categoryId: string, subcategoryId: string): BlogPost[] {
  return blogPosts.filter(post => post.category === categoryId && post.subcategory === subcategoryId)
}

// Función para obtener posts destacados
export function getFeaturedPosts(): BlogPost[] {
  return blogPosts.filter(post => post.featured).slice(0, 6)
}

// Función para obtener posts trending
export function getTrendingPosts(): BlogPost[] {
  return blogPosts.filter(post => post.trending).slice(0, 8)
}

// Función para obtener posts más populares (por views)
export function getPopularPosts(): BlogPost[] {
  return [...blogPosts].sort((a, b) => b.views - a.views).slice(0, 8)
}

// Función para obtener posts recientes
export function getRecentPosts(): BlogPost[] {
  return [...blogPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8)
}

// Función para buscar posts
export function searchPosts(query: string): BlogPost[] {
  const lowercaseQuery = query.toLowerCase()
  return blogPosts.filter(post => 
    post.title.toLowerCase().includes(lowercaseQuery) ||
    post.excerpt.toLowerCase().includes(lowercaseQuery) ||
    post.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
    post.category.toLowerCase().includes(lowercaseQuery)
  )
}

// Función para obtener posts relacionados
export function getRelatedPosts(currentPostId: string, limit: number = 4): BlogPost[] {
  const currentPost = blogPosts.find(post => post.id === currentPostId)
  if (!currentPost) return []

  const relatedPosts = blogPosts
    .filter(post => post.id !== currentPostId)
    .filter(post => 
      post.category === currentPost.category ||
      post.tags.some(tag => currentPost.tags.includes(tag))
    )
    .slice(0, limit)

  return relatedPosts
}