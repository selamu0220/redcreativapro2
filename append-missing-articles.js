const fs = require('fs');
const path = require('path');

const blogDataPath = path.join(process.cwd(), 'lib', 'blog-data.ts');
let content = fs.readFileSync(blogDataPath, 'utf8');

const missingArticlesData = [
  {
    id: 'automatizacion-escritura-ia-workflows',
    title: 'Automatización de Escritura con IA: Workflows que Ahorran 20 Horas Semanales',
    excerpt: 'Descubre workflows de automatización para escritura con IA que pueden ahorrarte hasta 20 horas semanales. Guía práctica con ejemplos reales y herramientas.',
    category: 'productividad',
    subcategory: 'automatizacion',
    author: 'selamu',
    publishedAt: '2025-01-01',
    readTime: '18 min',
    tags: ['automatización escritura IA', 'workflows IA', 'automatizar contenido', 'escritura automática', 'productividad IA'],
    featured: false,
    trending: true,
    views: 5552,
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Automatizaci%C3%B3n%20de%20Escritura%20con%20IA%3A%20Workflows%20que%20Ahorran%2020%20Horas%20Semanales&image_size=landscape_16_9',
    content: 'Contenido en desarrollo...'
  },
  {
    id: 'automatizar-email-marketing-con-ia',
    title: 'Automatizar Email Marketing con IA: Guía Completa 2025',
    excerpt: 'Aprende a automatizar completamente tus campañas de email marketing usando inteligencia artificial. Estrategias de personalización y segmentación avanzada.',
    category: 'creatividad',
    subcategory: 'marketing-digital',
    author: 'selamu',
    publishedAt: '2025-01-10',
    readTime: '15 min',
    tags: ['email marketing IA', 'automatización email', 'marketing digital IA', 'personalización masiva', 'conversión email'],
    featured: true,
    trending: false,
    views: 4210,
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Automatizar%20Email%20Marketing%20con%20IA%3A%20Gu%C3%ADa%20Completa%202025&image_size=landscape_16_9',
    content: 'Contenido en desarrollo...'
  },
  {
    id: 'chatgpt-para-escritores',
    title: 'ChatGPT para Escritores: Cómo Potenciar tu Creatividad sin Perder tu Voz',
    excerpt: 'Guía práctica para escritores sobre cómo usar ChatGPT como asistente creativo. Prompts, técnicas de edición y mejores prácticas para autores.',
    category: 'creatividad',
    subcategory: 'contenido-creativo',
    author: 'selamu',
    publishedAt: '2025-02-05',
    readTime: '12 min',
    tags: ['ChatGPT para escritores', 'escritura creativa IA', 'asistente redacción', 'prompts para autores', 'creatividad aumentada'],
    featured: false,
    trending: false,
    views: 3890,
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=ChatGPT%20para%20Escritores%3A%20C%C3%B3mo%20Potenciar%20tu%20Creatividad%20sin%20Perder%20tu%20Voz&image_size=landscape_16_9',
    content: 'Contenido en desarrollo...'
  },
  {
    id: 'como-escribir-con-inteligencia-artificial',
    title: 'Cómo Escribir con Inteligencia Artificial: De Principiante a Experto',
    excerpt: 'Todo lo que necesitas saber para empezar a escribir con IA. Desde la elección de herramientas hasta la optimización de resultados finales.',
    category: 'tecnologia',
    subcategory: 'metodologias-ia',
    author: 'selamu',
    publishedAt: '2025-01-20',
    readTime: '20 min',
    tags: ['escribir con IA', 'guía escritura IA', 'tutorial redacción IA', 'herramientas escritura 2025', 'metodología IA'],
    featured: false,
    trending: true,
    views: 6120,
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=C%C3%B3mo%20Escribir%20con%20Inteligencia%20Artificial%3A%20De%20Principiante%20a%20Experto&image_size=landscape_16_9',
    content: 'Contenido en desarrollo...'
  },
  {
    id: 'copywriting-con-inteligencia-artificial',
    title: 'Copywriting con Inteligencia Artificial: Textos Persuasivos en Minutos',
    excerpt: 'Domina el arte del copywriting asistido por IA. Cómo crear landing pages, anuncios y textos de venta que convierten usando modelos de lenguaje.',
    category: 'creatividad',
    subcategory: 'marketing-digital',
    author: 'selamu',
    publishedAt: '2025-02-15',
    readTime: '14 min',
    tags: ['copywriting IA', 'textos persuasivos', 'conversión marketing', 'landing pages IA', 'anuncios optimizados'],
    featured: true,
    trending: false,
    views: 4560,
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Copywriting%20con%20Inteligencia%20Artificial%3A%20Textos%20Persuasivos%20en%20Minutos&image_size=landscape_16_9',
    content: 'Contenido en desarrollo...'
  },
  {
    id: 'corrector-de-textos-inteligente',
    title: 'Corrector de Textos Inteligente: Más allá de la Simple Ortografía',
    excerpt: 'Descubre cómo los nuevos correctores basados en IA mejoran el estilo, la coherencia y el tono de tus escritos profesionales.',
    category: 'productividad',
    subcategory: 'herramientas-ia',
    author: 'selamu',
    publishedAt: '2025-03-01',
    readTime: '10 min',
    tags: ['corrector inteligente', 'edición de textos IA', 'mejora de estilo', 'gramática avanzada', 'revisión automática'],
    featured: false,
    trending: false,
    views: 2980,
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Corrector%20de%20Textos%20Inteligente%3A%20M%C3%A1s%20all%C3%A1%20de%20la%20Simple%20Ortograf%C3%ADa&image_size=landscape_16_9',
    content: 'Contenido en desarrollo...'
  },
  {
    id: 'crear-cursos-online-con-ia',
    title: 'Cómo Crear Cursos Online con IA: De la Idea al Lanzamiento en 48 Horas',
    excerpt: 'Estrategia completa para diseñar, estructurar y crear el contenido de tu curso online usando inteligencia artificial de forma eficiente.',
    category: 'ia-educacion',
    subcategory: 'metodologias-ia',
    author: 'selamu',
    publishedAt: '2025-03-10',
    readTime: '22 min',
    tags: ['crear cursos IA', 'infoproductos IA', 'educación online', 'diseño instruccional IA', 'lanzamiento cursos'],
    featured: true,
    trending: true,
    views: 7450,
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=C%C3%B3mo%20Crear%20Cursos%20Online%20con%20IA%3A%20De%20la%20Idea%20al%20Lanzamiento%20en%2048%20Horas&image_size=landscape_16_9',
    content: 'Contenido en desarrollo...'
  },
  {
    id: 'crear-ebooks-con-ia',
    title: 'Guía para Crear Ebooks con IA: Publica tu Libro en Tiempo Récord',
    excerpt: 'Aprende a usar la IA para investigar, esquematizar y redactar tu primer ebook. Consejos sobre autoedición y publicación digital.',
    category: 'creatividad',
    subcategory: 'contenido-creativo',
    author: 'selamu',
    publishedAt: '2025-03-20',
    readTime: '19 min',
    tags: ['crear ebooks IA', 'publicar libros IA', 'escritura creativa', 'marketing de contenidos', 'lead magnets'],
    featured: false,
    trending: false,
    views: 5230,
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Gu%C3%ADa%20para%20Crear%20Ebooks%20con%20IA%3A%20Publica%20tu%20Libro%20en%20Tiempo%20R%C3%A9cord&image_size=landscape_16_9',
    content: 'Contenido en desarrollo...'
  },
  {
    id: 'generador-de-contenido-con-ia',
    title: 'El Futuro del Generador de Contenido con IA: Tendencias para 2025',
    excerpt: 'Analizamos cómo evolucionarán las herramientas de generación de contenido y qué esperar de los nuevos modelos de lenguaje en el ámbito creativo.',
    category: 'tecnologia',
    subcategory: 'apis-ia',
    author: 'selamu',
    publishedAt: '2025-04-01',
    readTime: '13 min',
    tags: ['generador contenido IA', 'tendencias IA 2025', 'futuro contenido', 'LLM creatividad', 'tecnología creativa'],
    featured: false,
    trending: false,
    views: 4120,
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=El%20Futuro%20del%20Generador%20de%20Contenido%20con%20IA%3A%20Tendencias%20para%202025&image_size=landscape_16_9',
    content: 'Contenido en desarrollo...'
  }
];

// Find insertion point
const lastBraceIndex = content.lastIndexOf('];');
if (lastBraceIndex === -1) {
  console.error('No insertion point found');
  process.exit(1);
}

const formattedArticles = missingArticlesData.map(post => {
  return `  {
    id: '${post.id}',
    title: '${post.title}',
    excerpt: '${post.excerpt}',
    category: '${post.category}',
    subcategory: '${post.subcategory}',
    author: '${post.author}',
    publishedAt: '${post.publishedAt}',
    readTime: '${post.readTime}',
    tags: [${post.tags.map(t => `'${t}'`).join(', ')}],
    featured: ${post.featured},
    trending: ${post.trending},
    views: ${post.views},
    image: '${post.image}',
    content: \`${post.content}\`
  }`;
}).join(',\n');

const newContent = content.slice(0, lastBraceIndex - 1) + ',\n' + formattedArticles + '\n' + content.slice(lastBraceIndex);

fs.writeFileSync(blogDataPath, newContent);
console.log('Successfully added ' + missingArticlesData.length + ' missing articles to blog-data.ts');
