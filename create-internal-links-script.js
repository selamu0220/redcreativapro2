const fs = require('fs');
const path = require('path');

// Mapeo de keywords y temas relacionados para enlaces internos
const relatedTopicsMap = {
  'ia': ['inteligencia artificial', 'escritura ia', 'herramientas ia', 'automatización', 'asistente ia'],
  'escritura': ['redacción', 'contenido', 'copywriting', 'textos', 'artículos'],
  'seo': ['optimización', 'posicionamiento', 'google', 'keywords', 'contenido seo'],
  'marketing': ['digital', 'ventas', 'conversión', 'leads', 'estrategias'],
  'productividad': ['workflows', 'automatización', 'eficiencia', 'herramientas', 'gestión'],
  'casos-estudio': ['resultados', 'éxito', 'empresas', 'clientes', 'roi'],
  'herramientas': ['software', 'plataformas', 'aplicaciones', 'gratis', 'profesional'],
  'corrector': ['gramática', 'ortografía', 'revisión', 'edición', 'calidad']
};

// Función para extraer información del artículo
function extractArticleInfo(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const slug = path.basename(path.dirname(filePath));
    
    // Extraer título
    const titleMatch = content.match(/title:\s*['"`]([^'"`]+)['"`]/);
    const title = titleMatch ? titleMatch[1] : slug;
    
    // Extraer keywords
    const keywordsMatch = content.match(/keywords:\s*['"`]([^'"`]+)['"`]/);
    const keywords = keywordsMatch ? keywordsMatch[1].toLowerCase() : '';
    
    // Determinar categorías del artículo
    const categories = [];
    const contentLower = (title + ' ' + keywords).toLowerCase();
    
    Object.keys(relatedTopicsMap).forEach(category => {
      const topics = relatedTopicsMap[category];
      if (topics.some(topic => contentLower.includes(topic))) {
        categories.push(category);
      }
    });
    
    return {
      slug,
      title,
      keywords,
      categories,
      filePath
    };
  } catch (error) {
    console.error(`Error procesando ${filePath}:`, error.message);
    return null;
  }
}

// Función para encontrar artículos relacionados
function findRelatedArticles(currentArticle, allArticles, maxLinks = 3) {
  const related = [];
  
  allArticles.forEach(article => {
    if (article.slug === currentArticle.slug) return;
    
    let score = 0;
    
    // Puntuación por categorías compartidas
    const sharedCategories = currentArticle.categories.filter(cat => 
      article.categories.includes(cat)
    );
    score += sharedCategories.length * 3;
    
    // Puntuación por keywords similares
    const currentKeywords = currentArticle.keywords.split(',').map(k => k.trim());
    const articleKeywords = article.keywords.split(',').map(k => k.trim());
    
    currentKeywords.forEach(keyword => {
      if (articleKeywords.some(ak => ak.includes(keyword) || keyword.includes(ak))) {
        score += 2;
      }
    });
    
    // Puntuación por palabras en título
    const currentTitleWords = currentArticle.title.toLowerCase().split(' ');
    const articleTitleWords = article.title.toLowerCase().split(' ');
    
    currentTitleWords.forEach(word => {
      if (word.length > 3 && articleTitleWords.includes(word)) {
        score += 1;
      }
    });
    
    if (score > 0) {
      related.push({ ...article, score });
    }
  });
  
  return related
    .sort((a, b) => b.score - a.score)
    .slice(0, maxLinks);
}

// Función para generar componente de enlaces internos
function generateInternalLinksComponent(relatedArticles) {
  if (relatedArticles.length === 0) return '';
  
  return `
      {/* Enlaces Internos Relacionados */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 my-8 border border-blue-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <ArrowRight className="w-5 h-5 mr-2 text-blue-600" />
          Artículos Relacionados
        </h3>
        <div className="grid gap-4 md:grid-cols-${Math.min(relatedArticles.length, 2)}">
          ${relatedArticles.map(article => `
          <Link 
            href="/blog/${article.slug}"
            className="group block p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
          >
            <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
              ${article.title}
            </h4>
            <p className="text-sm text-gray-600 mt-2 flex items-center">
              <ArrowRight className="w-4 h-4 mr-1" />
              Leer más
            </p>
          </Link>`).join('')}
        </div>
      </div>`;
}

// Función para generar enlaces contextuales en el contenido
function generateContextualLinks(content, relatedArticles) {
  let updatedContent = content;
  
  relatedArticles.forEach(article => {
    // Buscar menciones naturales en el texto para crear enlaces
    const titleWords = article.title.toLowerCase().split(' ');
    const keyPhrases = [
      article.title,
      ...titleWords.filter(word => word.length > 5),
      ...article.categories.map(cat => relatedTopicsMap[cat]).flat()
    ];
    
    keyPhrases.forEach(phrase => {
      if (phrase.length > 4) {
        const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
        const matches = updatedContent.match(regex);
        
        if (matches && matches.length === 1) { // Solo enlazar la primera mención
          updatedContent = updatedContent.replace(
            regex,
            `<Link href="/blog/${article.slug}" className="text-blue-600 hover:text-blue-800 underline font-medium">${phrase}</Link>`
          );
        }
      }
    });
  });
  
  return updatedContent;
}

// Función para añadir breadcrumbs mejorados
function generateEnhancedBreadcrumbs(article) {
  const categoryName = article.categories[0] || 'General';
  const categoryMap = {
    'ia': 'Inteligencia Artificial',
    'escritura': 'Escritura Profesional',
    'seo': 'SEO y Posicionamiento',
    'marketing': 'Marketing Digital',
    'productividad': 'Productividad',
    'casos-estudio': 'Casos de Éxito',
    'herramientas': 'Herramientas',
    'corrector': 'Corrección de Textos'
  };
  
  return `
        {/* Breadcrumbs Mejorados */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-blue-600 transition-colors">Blog</Link>
          <span>/</span>
          <Link href="/blog?category=${categoryName}" className="hover:text-blue-600 transition-colors">
            ${categoryMap[categoryName] || categoryName}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">${article.title}</span>
        </nav>`;
}

// Función principal para optimizar un artículo
function optimizeArticleWithInternalLinks(article, allArticles) {
  try {
    let content = fs.readFileSync(article.filePath, 'utf8');
    
    // Encontrar artículos relacionados
    const relatedArticles = findRelatedArticles(article, allArticles);
    
    if (relatedArticles.length === 0) {
      console.log(`⚠️  No se encontraron artículos relacionados para: ${article.slug}`);
      return;
    }
    
    // Generar componentes
    const internalLinksComponent = generateInternalLinksComponent(relatedArticles);
    const enhancedBreadcrumbs = generateEnhancedBreadcrumbs(article);
    
    // Buscar donde insertar los enlaces internos (antes del cierre del componente principal)
    const insertionPoint = content.lastIndexOf('</div>\n    </div>\n  )\n}');
    
    if (insertionPoint !== -1) {
      // Insertar enlaces internos antes del cierre
      content = content.slice(0, insertionPoint) + 
                internalLinksComponent + 
                content.slice(insertionPoint);
    }
    
    // Reemplazar breadcrumbs existentes si los hay
    const breadcrumbsRegex = /\{\/\* Breadcrumbs.*?\*\/\}[\s\S]*?<\/nav>/;
    if (breadcrumbsRegex.test(content)) {
      content = content.replace(breadcrumbsRegex, enhancedBreadcrumbs.trim());
    } else {
      // Insertar breadcrumbs después del primer div del componente
      const firstDivMatch = content.match(/(<div[^>]*className[^>]*>)/);
      if (firstDivMatch) {
        const insertAfter = content.indexOf(firstDivMatch[1]) + firstDivMatch[1].length;
        content = content.slice(0, insertAfter) + 
                  enhancedBreadcrumbs + 
                  content.slice(insertAfter);
      }
    }
    
    // Generar enlaces contextuales (comentado para evitar sobreoptimización)
    // content = generateContextualLinks(content, relatedArticles.slice(0, 1));
    
    fs.writeFileSync(article.filePath, content);
    console.log(`✅ Enlaces internos añadidos: ${article.slug} (${relatedArticles.length} enlaces)`);
    
  } catch (error) {
    console.error(`❌ Error optimizando ${article.slug}:`, error.message);
  }
}

// Función principal
function createInternalLinksSystem() {
  const blogDir = path.join(__dirname, 'app', 'blog');
  
  if (!fs.existsSync(blogDir)) {
    console.error('❌ Directorio de blog no encontrado');
    return;
  }
  
  console.log('🔗 Iniciando sistema de enlaces internos automático...');
  
  // Obtener todos los artículos
  const articleDirs = fs.readdirSync(blogDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && dirent.name !== '[id]')
    .map(dirent => dirent.name);
  
  const allArticles = [];
  
  // Extraer información de todos los artículos
  articleDirs.forEach(articleDir => {
    const pagePath = path.join(blogDir, articleDir, 'page.tsx');
    if (fs.existsSync(pagePath)) {
      const articleInfo = extractArticleInfo(pagePath);
      if (articleInfo) {
        allArticles.push(articleInfo);
      }
    }
  });
  
  console.log(`📊 Analizando ${allArticles.length} artículos para enlaces internos...`);
  
  let optimizedCount = 0;
  let totalLinksAdded = 0;
  
  // Optimizar cada artículo
  allArticles.forEach(article => {
    const relatedCount = findRelatedArticles(article, allArticles).length;
    if (relatedCount > 0) {
      optimizeArticleWithInternalLinks(article, allArticles);
      optimizedCount++;
      totalLinksAdded += relatedCount;
    }
  });
  
  console.log(`\n🎉 Sistema de enlaces internos completado!`);
  console.log(`📊 Estadísticas:`);
  console.log(`   • Artículos optimizados: ${optimizedCount}`);
  console.log(`   • Total enlaces internos añadidos: ${totalLinksAdded}`);
  console.log(`   • Promedio enlaces por artículo: ${(totalLinksAdded / optimizedCount).toFixed(1)}`);
  console.log(`🔍 Mejoras implementadas:`);
  console.log(`   • Enlaces internos automáticos entre artículos relacionados`);
  console.log(`   • Breadcrumbs mejorados con categorías`);
  console.log(`   • Sistema de puntuación por relevancia`);
  console.log(`   • Componentes visuales atractivos para enlaces`);
  console.log(`   • Navegación mejorada entre contenidos`);
}

// Ejecutar optimización
createInternalLinksSystem();