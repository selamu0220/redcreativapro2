const fs = require('fs');
const path = require('path');

// Leer la lista de artículos faltantes
const missingArticles = fs.readFileSync('missing-articles.txt', 'utf8').split('\n').filter(Boolean);

console.log(`Procesando ${missingArticles.length} artículos faltantes...`);

const extractedArticles = [];

// Función para extraer título del contenido
function extractTitle(content) {
  const titleMatch = content.match(/<h1[^>]*>([^<]+)<\/h1>/) || 
                    content.match(/title:\s*['"`]([^'"`]+)['"`]/) ||
                    content.match(/# ([^\n]+)/);
  return titleMatch ? titleMatch[1].trim() : '';
}

// Función para extraer descripción
function extractDescription(content) {
  const descMatch = content.match(/<meta[^>]*name=['"`]description['"`][^>]*content=['"`]([^'"`]+)['"`]/) ||
                   content.match(/description:\s*['"`]([^'"`]+)['"`]/) ||
                   content.match(/<p[^>]*>([^<]{50,200})<\/p>/);
  return descMatch ? descMatch[1].trim() : '';
}

// Función para extraer keywords
function extractKeywords(content) {
  const keywordsMatch = content.match(/<meta[^>]*name=['"`]keywords['"`][^>]*content=['"`]([^'"`]+)['"`]/) ||
                       content.match(/keywords:\s*\[([^\]]+)\]/) ||
                       content.match(/tags:\s*\[([^\]]+)\]/);
  if (keywordsMatch) {
    return keywordsMatch[1].split(',').map(k => k.trim().replace(/['"`]/g, ''));
  }
  return [];
}

// Función para categorizar artículos
function categorizeArticle(id, title) {
  if (id.includes('caso-estudio') || title.includes('Caso de Estudio')) {
    return { category: 'negocios', subcategory: 'estrategia-empresarial' };
  }
  if (id.includes('herramientas') || id.includes('tools') || title.includes('Herramientas')) {
    return { category: 'productividad', subcategory: 'herramientas-ia' };
  }
  if (id.includes('copywriting') || id.includes('ventas') || title.includes('Copywriting')) {
    return { category: 'creatividad', subcategory: 'marketing-digital' };
  }
  if (id.includes('seo') || id.includes('optimization') || title.includes('SEO')) {
    return { category: 'creatividad', subcategory: 'marketing-digital' };
  }
  if (id.includes('automatizacion') || id.includes('workflows') || title.includes('Automatización')) {
    return { category: 'productividad', subcategory: 'automatizacion' };
  }
  if (id.includes('escritura') || id.includes('redactor') || id.includes('writer') || title.includes('Escritura')) {
    return { category: 'creatividad', subcategory: 'contenido-creativo' };
  }
  return { category: 'ia-educacion', subcategory: 'metodologias-ia' };
}

// Procesar cada artículo faltante
missingArticles.forEach(articleId => {
  const articlePath = path.join(__dirname, 'app', 'blog', articleId, 'page.tsx');
  
  if (fs.existsSync(articlePath)) {
    const content = fs.readFileSync(articlePath, 'utf8');
    
    const title = extractTitle(content);
    const description = extractDescription(content);
    const keywords = extractKeywords(content);
    const { category, subcategory } = categorizeArticle(articleId, title);
    
    // Generar fecha aleatoria en los últimos 6 meses
    const now = new Date();
    const sixMonthsAgo = new Date(now.getTime() - (6 * 30 * 24 * 60 * 60 * 1000));
    const randomDate = new Date(sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime()));
    
    // Calcular tiempo de lectura estimado
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.max(3, Math.ceil(wordCount / 200));
    
    const article = {
      id: articleId,
      title: title || articleId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      excerpt: description || `Descubre todo sobre ${title || articleId.replace(/-/g, ' ')} y cómo puede transformar tu estrategia digital.`,
      category,
      subcategory,
      author: 'selamu',
      publishedAt: randomDate.toISOString().split('T')[0],
      readTime,
      tags: keywords.length > 0 ? keywords.slice(0, 5) : ['IA', 'Escritura', 'Productividad'],
      featured: Math.random() > 0.8,
      trending: Math.random() > 0.7,
      views: Math.floor(Math.random() * 5000) + 500,
      image: `https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(title || articleId)}&image_size=landscape`,
      content: `El contenido completo está en la página individual del artículo: /blog/${articleId}`
    };
    
    extractedArticles.push(article);
    console.log(`✓ Procesado: ${articleId}`);
  } else {
    console.log(`✗ No encontrado: ${articlePath}`);
  }
});

console.log(`\n✅ Extraídos ${extractedArticles.length} artículos`);

// Generar el código para agregar al array
const articlesCode = extractedArticles.map(article => {
  return `  {
    id: '${article.id}',
    title: '${article.title.replace(/'/g, "\\'")}',
    excerpt: '${article.excerpt.replace(/'/g, "\\'")}',
    category: '${article.category}',
    subcategory: '${article.subcategory}',
    author: '${article.author}',
    publishedAt: '${article.publishedAt}',
    readTime: ${article.readTime},
    tags: [${article.tags.map(tag => `'${tag}'`).join(', ')}],
    featured: ${article.featured},
    trending: ${article.trending},
    views: ${article.views},
    image: '${article.image}',
    content: '${article.content}'
  }`;
}).join(',\n');

// Guardar el código generado
fs.writeFileSync('missing-articles-code.txt', articlesCode);
console.log('\\n📝 Código generado y guardado en missing-articles-code.txt');
console.log('\\n🎯 Listo para agregar al array blogPosts!');