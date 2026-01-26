const fs = require('fs');
const path = require('path');

// Función para contar keywords en todos los artículos
function auditKeywords() {
  const blogDir = path.join(__dirname, 'app', 'blog');
  let totalKeywords = 0;
  let articlesProcessed = 0;
  const keywordsByCategory = {};
  
  if (!fs.existsSync(blogDir)) {
    console.log('❌ Directorio de blog no encontrado');
    return { totalKeywords: 0, articlesProcessed: 0 };
  }
  
  const articles = fs.readdirSync(blogDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  articles.forEach(articleSlug => {
    const articlePath = path.join(blogDir, articleSlug, 'page.tsx');
    
    if (fs.existsSync(articlePath)) {
      const content = fs.readFileSync(articlePath, 'utf8');
      
      // Extraer keywords del metadata (formato string o array)
      const keywordsMatch = content.match(/keywords:\s*['"`]([^'"`]+)['"`]/s) || content.match(/keywords:\s*\[(.*?)\]/s);
      if (keywordsMatch) {
        const keywordsStr = keywordsMatch[1];
        const keywords = keywordsStr.split(',').map(k => k.trim().replace(/['"]/g, '')).filter(k => k.length > 0);
        totalKeywords += keywords.length;
        
        // Extraer categoría
        const categoryMatch = content.match(/category:\s*['"]([^'"]+)['"]/);
        const category = categoryMatch ? categoryMatch[1] : 'Sin categoría';
        
        if (!keywordsByCategory[category]) {
          keywordsByCategory[category] = 0;
        }
        keywordsByCategory[category] += keywords.length;
      }
      
      articlesProcessed++;
    }
  });
  
  return { totalKeywords, articlesProcessed, keywordsByCategory };
}

// Función para auditar enlaces internos
function auditInternalLinks() {
  const blogDir = path.join(__dirname, 'app', 'blog');
  let totalInternalLinks = 0;
  let articlesWithLinks = 0;
  
  if (!fs.existsSync(blogDir)) {
    return { totalInternalLinks: 0, articlesWithLinks: 0 };
  }
  
  const articles = fs.readdirSync(blogDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  articles.forEach(articleSlug => {
    const articlePath = path.join(blogDir, articleSlug, 'page.tsx');
    
    if (fs.existsSync(articlePath)) {
      const content = fs.readFileSync(articlePath, 'utf8');
      
      // Contar enlaces internos
      const internalLinksMatches = content.match(/href="\/blog\/[^"]+"/g);
      if (internalLinksMatches) {
        totalInternalLinks += internalLinksMatches.length;
        articlesWithLinks++;
      }
    }
  });
  
  return { totalInternalLinks, articlesWithLinks };
}

// Función para auditar Schema markup
function auditSchemaMarkup() {
  const blogDir = path.join(__dirname, 'app', 'blog');
  let articlesWithSchema = 0;
  let totalArticles = 0;
  
  if (!fs.existsSync(blogDir)) {
    return { articlesWithSchema: 0, totalArticles: 0 };
  }
  
  const articles = fs.readdirSync(blogDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  articles.forEach(articleSlug => {
    const articlePath = path.join(blogDir, articleSlug, 'page.tsx');
    
    if (fs.existsSync(articlePath)) {
      const content = fs.readFileSync(articlePath, 'utf8');
      
      // Verificar si tiene Schema markup
      if (content.includes('jsonLd') || content.includes('@type')) {
        articlesWithSchema++;
      }
      
      totalArticles++;
    }
  });
  
  return { articlesWithSchema, totalArticles };
}

// Función para auditar meta tags
function auditMetaTags() {
  const blogDir = path.join(__dirname, 'app', 'blog');
  let articlesWithOptimizedMeta = 0;
  let totalArticles = 0;
  
  if (!fs.existsSync(blogDir)) {
    return { articlesWithOptimizedMeta: 0, totalArticles: 0 };
  }
  
  const articles = fs.readdirSync(blogDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  articles.forEach(articleSlug => {
    const articlePath = path.join(blogDir, articleSlug, 'page.tsx');
    
    if (fs.existsSync(articlePath)) {
      const content = fs.readFileSync(articlePath, 'utf8');
      
      // Verificar elementos SEO esenciales
      const hasTitle = content.includes('title:');
      const hasDescription = content.includes('description:');
      const hasKeywords = content.includes('keywords:');
      const hasOpenGraph = content.includes('openGraph:');
      const hasTwitter = content.includes('twitter:');
      
      if (hasTitle && hasDescription && hasKeywords && hasOpenGraph && hasTwitter) {
        articlesWithOptimizedMeta++;
      }
      
      totalArticles++;
    }
  });
  
  return { articlesWithOptimizedMeta, totalArticles };
}

// Función para verificar archivos técnicos SEO
function auditTechnicalSEO() {
  const checks = {
    sitemap: fs.existsSync(path.join(__dirname, 'app', 'sitemap.ts')),
    robots: fs.existsSync(path.join(__dirname, 'app', 'robots.ts')),
    middleware: fs.existsSync(path.join(__dirname, 'middleware.ts')),
    nextConfig: fs.existsSync(path.join(__dirname, 'next.config.js')),
    seoConfig: fs.existsSync(path.join(__dirname, 'lib', 'seo-config.ts')),
    webVitals: fs.existsSync(path.join(__dirname, 'components', 'WebVitals.tsx'))
  };
  
  return checks;
}

// Función principal de auditoría
function runSEOAudit() {
  console.log('🔍 INICIANDO AUDITORÍA COMPLETA DE SEO...\n');
  
  // Auditar keywords
  console.log('📊 AUDITANDO KEYWORDS...');
  const keywordAudit = auditKeywords();
  console.log(`✅ Total de keywords: ${keywordAudit.totalKeywords}`);
  console.log(`✅ Artículos procesados: ${keywordAudit.articlesProcessed}`);
  console.log(`✅ Promedio de keywords por artículo: ${Math.round(keywordAudit.totalKeywords / keywordAudit.articlesProcessed)}`);
  
  if (keywordAudit.keywordsByCategory) {
    console.log('\\n📈 KEYWORDS POR CATEGORÍA:');
    Object.entries(keywordAudit.keywordsByCategory).forEach(([category, count]) => {
      console.log(`  - ${category}: ${count} keywords`);
    });
  }
  
  // Auditar enlaces internos
  console.log('\\n🔗 AUDITANDO ENLACES INTERNOS...');
  const linksAudit = auditInternalLinks();
  console.log(`✅ Total de enlaces internos: ${linksAudit.totalInternalLinks}`);
  console.log(`✅ Artículos con enlaces: ${linksAudit.articlesWithLinks}`);
  
  // Auditar Schema markup
  console.log('\\n🏷️ AUDITANDO SCHEMA MARKUP...');
  const schemaAudit = auditSchemaMarkup();
  console.log(`✅ Artículos con Schema: ${schemaAudit.articlesWithSchema}/${schemaAudit.totalArticles}`);
  console.log(`✅ Cobertura Schema: ${Math.round((schemaAudit.articlesWithSchema / schemaAudit.totalArticles) * 100)}%`);
  
  // Auditar meta tags
  console.log('\\n🏷️ AUDITANDO META TAGS...');
  const metaAudit = auditMetaTags();
  console.log(`✅ Artículos con meta tags optimizados: ${metaAudit.articlesWithOptimizedMeta}/${metaAudit.totalArticles}`);
  console.log(`✅ Cobertura meta tags: ${Math.round((metaAudit.articlesWithOptimizedMeta / metaAudit.totalArticles) * 100)}%`);
  
  // Auditar SEO técnico
  console.log('\\n⚙️ AUDITANDO SEO TÉCNICO...');
  const technicalAudit = auditTechnicalSEO();
  Object.entries(technicalAudit).forEach(([check, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${check}: ${passed ? 'Configurado' : 'Faltante'}`);
  });
  
  // Generar reporte final
  console.log('\\n📋 REPORTE FINAL DE SEO:');
  console.log('================================');
  console.log(`🎯 KEYWORDS TOTALES: ${keywordAudit.totalKeywords} (Objetivo: >500)`);
  console.log(`📄 ARTÍCULOS OPTIMIZADOS: ${keywordAudit.articlesProcessed}`);
  console.log(`🔗 ENLACES INTERNOS: ${linksAudit.totalInternalLinks}`);
  console.log(`🏷️ SCHEMA MARKUP: ${Math.round((schemaAudit.articlesWithSchema / schemaAudit.totalArticles) * 100)}% cobertura`);
  console.log(`📊 META TAGS: ${Math.round((metaAudit.articlesWithOptimizedMeta / metaAudit.totalArticles) * 100)}% optimizados`);
  
  // Calcular score SEO
  const seoScore = calculateSEOScore({
    keywords: keywordAudit.totalKeywords,
    articles: keywordAudit.articlesProcessed,
    internalLinks: linksAudit.totalInternalLinks,
    schemaPercentage: (schemaAudit.articlesWithSchema / schemaAudit.totalArticles) * 100,
    metaPercentage: (metaAudit.articlesWithOptimizedMeta / metaAudit.totalArticles) * 100,
    technicalChecks: Object.values(technicalAudit).filter(Boolean).length
  });
  
  console.log(`\\n🏆 SCORE SEO GENERAL: ${seoScore}/100`);
  
  if (seoScore >= 90) {
    console.log('🎉 ¡EXCELENTE! Tu SEO está altamente optimizado');
  } else if (seoScore >= 70) {
    console.log('👍 BUENO: Tu SEO está bien optimizado');
  } else if (seoScore >= 50) {
    console.log('⚠️ REGULAR: Necesitas más optimizaciones');
  } else {
    console.log('❌ MALO: Requiere optimización urgente');
  }
  
  // Generar recomendaciones
  generateRecommendations(keywordAudit, linksAudit, schemaAudit, metaAudit, technicalAudit);
}

// Función para calcular score SEO
function calculateSEOScore(metrics) {
  let score = 0;
  
  // Keywords (30 puntos máximo)
  score += Math.min((metrics.keywords / 500) * 30, 30);
  
  // Enlaces internos (20 puntos máximo)
  score += Math.min((metrics.internalLinks / 100) * 20, 20);
  
  // Schema markup (15 puntos máximo)
  score += (metrics.schemaPercentage / 100) * 15;
  
  // Meta tags (15 puntos máximo)
  score += (metrics.metaPercentage / 100) * 15;
  
  // Checks técnicos (20 puntos máximo)
  score += (metrics.technicalChecks / 6) * 20;
  
  return Math.round(score);
}

// Función para generar recomendaciones
function generateRecommendations(keywords, links, schema, meta, technical) {
  console.log('\\n💡 RECOMENDACIONES PARA MEJORAR:');
  console.log('================================');
  
  if (keywords.totalKeywords < 500) {
    console.log('📈 Añadir más keywords de cola larga a los artículos existentes');
  }
  
  if (links.totalInternalLinks < 100) {
    console.log('🔗 Crear más enlaces internos entre artículos relacionados');
  }
  
  if ((schema.articlesWithSchema / schema.totalArticles) < 0.9) {
    console.log('🏷️ Implementar Schema markup en todos los artículos');
  }
  
  if ((meta.articlesWithOptimizedMeta / meta.totalArticles) < 0.9) {
    console.log('📊 Optimizar meta tags en artículos faltantes');
  }
  
  Object.entries(technical).forEach(([check, passed]) => {
    if (!passed) {
      console.log(`⚙️ Configurar ${check} para SEO técnico`);
    }
  });
  
  console.log('\\n🎯 PRÓXIMOS PASOS RECOMENDADOS:');
  console.log('1. Crear más contenido con keywords específicas');
  console.log('2. Implementar link building interno automático');
  console.log('3. Monitorear Core Web Vitals regularmente');
  console.log('4. Actualizar contenido existente con nuevas keywords');
  console.log('5. Crear páginas de categorías optimizadas');
}

// Ejecutar auditoría
runSEOAudit();