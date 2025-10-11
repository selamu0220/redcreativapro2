const fs = require('fs');
const path = require('path');

// Lista de todos los artículos encontrados
const articleDirs = [
  'ai-content-creation-tools-comparison',
  'ai-writer-for-marketing',
  'aprende-escribir-articulos-blog-perfectos-ia',
  'asistente-escritura-ia-inteligente',
  'automatizacion-escritura-ia-workflows',
  'automatizar-correos-electronicos-ia',
  'caso-estudio-agencia-marketing-automatizo-clientes-ia',
  'caso-estudio-b2b-genero-1200-leads-mes-ia',
  'caso-estudio-ecommerce-aumento-ventas-400-ia',
  'caso-estudio-empresa-aumento-trafico-300-ia',
  'caso-estudio-startup-genero-500k-leads-ia',
  'claude-ai-vs-chatgpt-escritura-profesional',
  'como-usar-ia-para-escribir-mejor',
  'content-optimization-with-ai',
  'corrector-gramatica-ia-online',
  'escribir-articulos-blog-ia',
  'escritor-ia-gratis-online',
  'generador-textos-ia-automatico',
  'herramientas-ia-escritura-2025',
  'herramientas-ia-escritura-profesional-2025',
  'ia-copywriting-ventas',
  'ia-copywriting-ventas-conversion-2025',
  'ia-vs-redactor-humano',
  'mejorar-textos-ia-gratis',
  'mejores-prompts-ia-escritura',
  'optimizar-contenido-seo-ia',
  'optimizar-contenido-seo-ia-2025',
  'personalizar-tono-voz-ia',
  'redactor-ia-profesional-2025',
  'software-redaccion-automatica-2025',
  'workflows-automatizacion-escritura-ia'
];

function extractMetadataFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extraer título del metadata
    const titleMatch = content.match(/title:\s*['"`]([^'"`]+)['"`]/);
    const title = titleMatch ? titleMatch[1].replace(' | Red Creativa Pro', '') : '';
    
    // Extraer descripción
    const descMatch = content.match(/description:\s*['"`]([^'"`]+)['"`]/);
    const description = descMatch ? descMatch[1] : '';
    
    // Extraer keywords
    const keywordsMatch = content.match(/keywords:\s*['"`]([^'"`]+)['"`]/);
    const keywords = keywordsMatch ? keywordsMatch[1].split(',').map(k => k.trim()) : [];
    
    // Extraer fecha de publicación
    const dateMatch = content.match(/publishedTime:\s*['"`]([^'"`]+)['"`]/);
    const publishedAt = dateMatch ? dateMatch[1].split('T')[0] : '2024-01-15';
    
    // Extraer tiempo de lectura del contenido
    const readTimeMatch = content.match(/(\d+)\s*min\s*de\s*lectura/);
    const readTime = readTimeMatch ? `${readTimeMatch[1]} min` : '10 min';
    
    return {
      title,
      description,
      keywords,
      publishedAt,
      readTime
    };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return null;
  }
}

function categorizeArticle(id, keywords) {
  const keywordStr = keywords.join(' ').toLowerCase();
  
  if (keywordStr.includes('educación') || keywordStr.includes('académica') || keywordStr.includes('investigación')) {
    return { category: 'ia-educacion', subcategory: 'investigacion-academica' };
  } else if (keywordStr.includes('productividad') || keywordStr.includes('automatización') || keywordStr.includes('workflow')) {
    return { category: 'productividad', subcategory: 'automatizacion' };
  } else if (keywordStr.includes('desarrollo') || keywordStr.includes('software') || keywordStr.includes('api')) {
    return { category: 'tecnologia', subcategory: 'desarrollo-software' };
  } else if (keywordStr.includes('marketing') || keywordStr.includes('contenido') || keywordStr.includes('creatividad')) {
    return { category: 'creatividad', subcategory: 'marketing-digital' };
  } else if (keywordStr.includes('negocio') || keywordStr.includes('empresa') || keywordStr.includes('estrategia')) {
    return { category: 'negocios', subcategory: 'estrategia-empresarial' };
  } else {
    return { category: 'creatividad', subcategory: 'contenido-creativo' };
  }
}

function generateBlogPost(id, metadata) {
  if (!metadata) return null;
  
  const { category, subcategory } = categorizeArticle(id, metadata.keywords);
  const views = Math.floor(Math.random() * 5000) + 1000; // Random views between 1000-6000
  const featured = Math.random() > 0.7; // 30% chance of being featured
  const trending = Math.random() > 0.8; // 20% chance of being trending
  
  return {
    id,
    title: metadata.title,
    excerpt: metadata.description,
    category,
    subcategory,
    author: 'selamu',
    publishedAt: metadata.publishedAt,
    readTime: metadata.readTime,
    tags: metadata.keywords.slice(0, 5), // Take first 5 keywords as tags
    featured,
    trending,
    views,
    image: `https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(metadata.title)}&image_size=landscape_16_9`,
    content: `${metadata.description}

## Introducción

Este artículo forma parte de nuestra serie completa sobre inteligencia artificial aplicada a la creación de contenido y marketing digital.

## Contenido Principal

[El contenido completo se encuentra en la página individual del artículo]

## Conclusión

La implementación de estas técnicas y herramientas puede transformar significativamente tu proceso de trabajo y resultados.

*Para acceder al contenido completo y detallado de este artículo, visita la página individual.*`
  };
}

// Procesar todos los artículos
const blogPosts = [];
const blogDir = path.join(__dirname, 'app', 'blog');

articleDirs.forEach(articleId => {
  const articlePath = path.join(blogDir, articleId, 'page.tsx');
  if (fs.existsSync(articlePath)) {
    const metadata = extractMetadataFromFile(articlePath);
    const blogPost = generateBlogPost(articleId, metadata);
    if (blogPost) {
      blogPosts.push(blogPost);
    }
  }
});

// Generar el código para insertar en blog-data.ts
console.log('// Artículos extraídos automáticamente:');
console.log('const extractedArticles = [');
blogPosts.forEach((post, index) => {
  console.log('  {');
  console.log(`    id: '${post.id}',`);
  console.log(`    title: '${post.title}',`);
  console.log(`    excerpt: '${post.excerpt}',`);
  console.log(`    category: '${post.category}',`);
  console.log(`    subcategory: '${post.subcategory}',`);
  console.log(`    author: '${post.author}',`);
  console.log(`    publishedAt: '${post.publishedAt}',`);
  console.log(`    readTime: '${post.readTime}',`);
  console.log(`    tags: [${post.tags.map(tag => `'${tag}'`).join(', ')}],`);
  console.log(`    featured: ${post.featured},`);
  console.log(`    trending: ${post.trending},`);
  console.log(`    views: ${post.views},`);
  console.log(`    image: '${post.image}',`);
  console.log(`    content: \`${post.content}\``);
  console.log(`  }${index < blogPosts.length - 1 ? ',' : ''}`);
});
console.log('];');

console.log(`\n// Total de artículos extraídos: ${blogPosts.length}`);