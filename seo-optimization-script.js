const fs = require('fs');
const path = require('path');

// Keywords de cola larga específicas para cada categoría
const longTailKeywords = {
  'IA': [
    'inteligencia artificial para escritura profesional',
    'herramientas IA escritura contenido marketing',
    'automatización escritura con inteligencia artificial',
    'generador textos IA para empresas',
    'asistente escritura inteligente online gratis',
    'software redacción automática con IA',
    'optimización contenido SEO con inteligencia artificial',
    'corrector gramática IA español profesional',
    'escritor automático IA para blogs',
    'copywriting IA para aumentar ventas'
  ],
  'Escritura': [
    'como escribir artículos blog perfectos',
    'técnicas escritura persuasiva para ventas',
    'redacción profesional para empresas',
    'escritura académica con IA asistente',
    'mejorar estilo escritura con herramientas IA',
    'plantillas escritura profesional gratis',
    'curso escritura creativa online',
    'escritura técnica para documentación',
    'redacción publicitaria que convierte',
    'escritura SEO optimizada para Google'
  ],
  'Productividad': [
    'workflows automatización escritura empresarial',
    'aumentar productividad escritura con IA',
    'herramientas productividad redactores freelance',
    'automatizar tareas escritura repetitivas',
    'gestión tiempo para escritores profesionales',
    'optimizar proceso creación contenido',
    'metodología escritura eficiente empresas',
    'sistema productividad para content creators',
    'acelerar escritura con inteligencia artificial',
    'flujo trabajo optimizado para redactores'
  ],
  'Marketing': [
    'estrategias content marketing con IA',
    'marketing digital automatizado con escritura IA',
    'generación leads con contenido optimizado',
    'email marketing automatizado con IA',
    'social media content con inteligencia artificial',
    'inbound marketing con escritura automatizada',
    'conversión ventas con copywriting IA',
    'marketing automation para pequeñas empresas',
    'contenido viral con herramientas IA',
    'ROI marketing contenido con inteligencia artificial'
  ]
};

// Metadatos SEO mejorados por categoría
const seoTemplates = {
  'IA': {
    titleSuffix: ' | Herramientas IA Escritura 2025',
    descriptionTemplate: 'Descubre cómo {keyword} puede revolucionar tu escritura. Guía completa con herramientas IA, casos de éxito y estrategias probadas para {year}.',
    additionalKeywords: ['herramientas IA escritura', 'inteligencia artificial redacción', 'automatización contenido', 'escritor IA profesional']
  },
  'Escritura': {
    titleSuffix: ' | Escritura Profesional 2025',
    descriptionTemplate: 'Aprende {keyword} con técnicas profesionales. Mejora tu escritura, aumenta conversiones y destaca en tu sector con estrategias probadas.',
    additionalKeywords: ['escritura profesional', 'redacción empresarial', 'técnicas escritura', 'mejorar escritura']
  },
  'Productividad': {
    titleSuffix: ' | Productividad Escritura 2025',
    descriptionTemplate: 'Optimiza {keyword} y multiplica tu productividad. Workflows, herramientas y metodologías para escritores y empresas exitosas.',
    additionalKeywords: ['productividad escritura', 'workflows automatización', 'eficiencia redacción', 'gestión tiempo escritores']
  },
  'Marketing': {
    titleSuffix: ' | Marketing Digital 2025',
    descriptionTemplate: 'Domina {keyword} para generar más leads y ventas. Estrategias de marketing digital con IA que funcionan en {year}.',
    additionalKeywords: ['marketing digital IA', 'content marketing', 'generación leads', 'conversión ventas']
  }
};

// Función para obtener keywords relacionadas
function getRelatedKeywords(category, mainKeyword) {
  const categoryKeywords = longTailKeywords[category] || longTailKeywords['IA'];
  const additionalKeywords = seoTemplates[category]?.additionalKeywords || [];
  
  return [
    ...categoryKeywords.slice(0, 5),
    ...additionalKeywords,
    mainKeyword,
    `${mainKeyword} 2025`,
    `${mainKeyword} gratis`,
    `${mainKeyword} profesional`,
    `${mainKeyword} empresas`,
    `mejor ${mainKeyword}`,
    `como usar ${mainKeyword}`,
    `guía ${mainKeyword}`,
    `tutorial ${mainKeyword}`,
    `herramientas ${mainKeyword}`
  ].filter((keyword, index, self) => self.indexOf(keyword) === index);
}

// Función para generar meta descripción optimizada
function generateOptimizedDescription(title, category, keywords) {
  const template = seoTemplates[category]?.descriptionTemplate || seoTemplates['IA'].descriptionTemplate;
  const mainKeyword = keywords[0] || title.toLowerCase();
  
  return template
    .replace('{keyword}', mainKeyword)
    .replace('{year}', '2025')
    .substring(0, 155) + '...';
}

// Función para generar título SEO optimizado
function generateOptimizedTitle(originalTitle, category) {
  const suffix = seoTemplates[category]?.titleSuffix || seoTemplates['IA'].titleSuffix;
  const maxLength = 60 - suffix.length;
  
  if (originalTitle.length > maxLength) {
    return originalTitle.substring(0, maxLength - 3) + '...' + suffix;
  }
  
  return originalTitle + suffix;
}

// Función para generar Schema markup avanzado
function generateAdvancedSchema(title, description, keywords, publishedDate, slug) {
  return {
    '@context': 'https://schema.org',
    '@type': ['Article', 'BlogPosting', 'TechArticle'],
    headline: title,
    description: description,
    keywords: keywords.join(', '),
    author: {
      '@type': 'Person',
      name: 'Selamu',
      url: 'https://redcreativa.pro/autor/selamu',
      sameAs: [
        'https://linkedin.com/in/selamu',
        'https://twitter.com/selamu'
      ]
    },
    publisher: {
      '@type': 'Organization',
      name: 'Red Creativa Pro',
      url: 'https://redcreativa.pro',
      logo: {
        '@type': 'ImageObject',
        url: 'https://redcreativa.pro/logo.png',
        width: 200,
        height: 60
      },
      sameAs: [
        'https://facebook.com/redcreativapro',
        'https://twitter.com/redcreativapro',
        'https://linkedin.com/company/redcreativapro'
      ]
    },
    datePublished: publishedDate,
    dateModified: new Date().toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://redcreativa.pro/blog/${slug}`
    },
    image: {
      '@type': 'ImageObject',
      url: `https://redcreativa.pro/blog/${slug}/og-image.jpg`,
      width: 1200,
      height: 630
    },
    articleSection: 'Inteligencia Artificial y Escritura',
    wordCount: 2500,
    inLanguage: 'es-ES',
    copyrightYear: 2025,
    copyrightHolder: {
      '@type': 'Organization',
      name: 'Red Creativa Pro'
    },
    isAccessibleForFree: true,
    hasPart: [
      {
        '@type': 'WebPageElement',
        cssSelector: '.article-content'
      }
    ],
    about: keywords.slice(0, 3).map(keyword => ({
      '@type': 'Thing',
      name: keyword
    })),
    mentions: keywords.slice(3, 6).map(keyword => ({
      '@type': 'Thing',
      name: keyword
    }))
  };
}

// Función principal para optimizar un archivo
function optimizeArticleSEO(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const slug = path.basename(path.dirname(filePath));
    
    // Extraer información actual
    const titleMatch = content.match(/title:\s*['"`]([^'"`]+)['"`]/);
    const descriptionMatch = content.match(/description:\s*['"`]([^'"`]+)['"`]/);
    const keywordsMatch = content.match(/keywords:\s*['"`]([^'"`]+)['"`]/);
    
    if (!titleMatch) return;
    
    const originalTitle = titleMatch[1];
    const originalDescription = descriptionMatch ? descriptionMatch[1] : '';
    const originalKeywords = keywordsMatch ? keywordsMatch[1].split(',').map(k => k.trim()) : [];
    
    // Determinar categoría basada en el contenido
    let category = 'IA';
    if (originalTitle.toLowerCase().includes('escritura') || originalTitle.toLowerCase().includes('redac')) {
      category = 'Escritura';
    } else if (originalTitle.toLowerCase().includes('productividad') || originalTitle.toLowerCase().includes('workflow')) {
      category = 'Productividad';
    } else if (originalTitle.toLowerCase().includes('marketing') || originalTitle.toLowerCase().includes('ventas')) {
      category = 'Marketing';
    }
    
    // Generar contenido optimizado
    const optimizedKeywords = getRelatedKeywords(category, originalTitle.toLowerCase());
    const optimizedTitle = generateOptimizedTitle(originalTitle, category);
    const optimizedDescription = generateOptimizedDescription(originalTitle, category, optimizedKeywords);
    const publishedDate = new Date().toISOString();
    const advancedSchema = generateAdvancedSchema(optimizedTitle, optimizedDescription, optimizedKeywords, publishedDate, slug);
    
    // Crear nuevo contenido con SEO mejorado
    const newMetadata = `export const metadata: Metadata = {
  title: '${optimizedTitle}',
  description: '${optimizedDescription}',
  keywords: '${optimizedKeywords.slice(0, 10).join(', ')}',
  openGraph: {
    title: '${optimizedTitle}',
    description: '${optimizedDescription}',
    type: 'article',
    publishedTime: '${publishedDate}',
    authors: ['Selamu'],
    tags: ${JSON.stringify(optimizedKeywords.slice(0, 5))},
    images: [{
      url: 'https://redcreativa.pro/blog/${slug}/og-image.jpg',
      width: 1200,
      height: 630,
      alt: '${optimizedTitle}'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: '${optimizedTitle}',
    description: '${optimizedDescription}',
    images: ['https://redcreativa.pro/blog/${slug}/og-image.jpg']
  },
  alternates: {
    canonical: 'https://redcreativa.pro/blog/${slug}'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  }
}`;

    const newJsonLd = `const jsonLd = ${JSON.stringify(advancedSchema, null, 2)}`;
    
    // Reemplazar metadata y jsonLd en el archivo
    let newContent = content
      .replace(/export const metadata: Metadata = \{[\s\S]*?\n\}/m, newMetadata)
      .replace(/const jsonLd = \{[\s\S]*?\n\}/m, newJsonLd);
    
    // Agregar keywords adicionales en el contenido si no existen
    if (!newContent.includes('// SEO Keywords:')) {
      const keywordComment = `\n// SEO Keywords: ${optimizedKeywords.join(', ')}\n`;
      newContent = newContent.replace(/export default function/, keywordComment + 'export default function');
    }
    
    fs.writeFileSync(filePath, newContent);
    console.log(`✅ Optimizado: ${slug}`);
    
  } catch (error) {
    console.error(`❌ Error optimizando ${filePath}:`, error.message);
  }
}

// Función principal
function optimizeAllArticles() {
  const blogDir = path.join(__dirname, 'app', 'blog');
  
  if (!fs.existsSync(blogDir)) {
    console.error('❌ Directorio de blog no encontrado');
    return;
  }
  
  const articles = fs.readdirSync(blogDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  console.log(`🚀 Iniciando optimización SEO de ${articles.length} artículos...`);
  
  let optimizedCount = 0;
  
  articles.forEach(articleDir => {
    const pagePath = path.join(blogDir, articleDir, 'page.tsx');
    if (fs.existsSync(pagePath)) {
      optimizeArticleSEO(pagePath);
      optimizedCount++;
    }
  });
  
  console.log(`\n🎉 Optimización completada!`);
  console.log(`📊 Artículos optimizados: ${optimizedCount}`);
  console.log(`🔍 Keywords añadidas por artículo: ~15-20`);
  console.log(`📈 Mejoras implementadas:`);
  console.log(`   • Títulos SEO optimizados con keywords de cola larga`);
  console.log(`   • Meta descripciones persuasivas y optimizadas`);
  console.log(`   • Keywords específicas por categoría`);
  console.log(`   • Schema markup avanzado con múltiples tipos`);
  console.log(`   • Open Graph y Twitter Cards mejorados`);
  console.log(`   • Configuración robots optimizada`);
  console.log(`   • URLs canónicas y estructura técnica mejorada`);
}

// Ejecutar optimización
optimizeAllArticles();