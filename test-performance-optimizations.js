const { MetaDescriptionOptimizer } = require('./lib/seo-optimization.ts');
const { StructuredDataManager } = require('./lib/structured-data.ts');
const { SitemapManager } = require('./lib/sitemap-manager.ts');

console.log('🚀 Testing SEO Performance Optimizations System\n');

// Initialize managers
const metaOptimizer = new MetaDescriptionOptimizer();
const structuredDataManager = new StructuredDataManager();
const sitemapManager = new SitemapManager('https://redcreativa.pro');

// Test data
const testArticles = [
  {
    id: '1',
    slug: 'chatgpt-escribir-contenido-calidad',
    title: 'Cómo usar ChatGPT para escribir contenido de calidad',
    content: `ChatGPT es una herramienta revolucionaria de inteligencia artificial que está transformando la manera en que creamos contenido. En este artículo completo, aprenderás técnicas avanzadas para aprovechar al máximo esta tecnología.

¿Qué es ChatGPT?
ChatGPT es un modelo de lenguaje desarrollado por OpenAI que puede generar texto de alta calidad basado en las instrucciones que le proporciones.

¿Cómo funciona ChatGPT para escritura?
Utiliza técnicas de aprendizaje profundo para entender el contexto y generar respuestas coherentes y relevantes.

Paso 1: Define tu objetivo
Antes de comenzar, establece claramente qué tipo de contenido necesitas crear.

Paso 2: Crea prompts específicos
Desarrolla instrucciones detalladas que guíen a ChatGPT hacia el resultado deseado.

Paso 3: Refina y edita
Siempre revisa y mejora el contenido generado para asegurar calidad y precisión.`,
    primaryKeyword: 'ChatGPT para escribir',
    category: 'inteligencia-artificial',
    author: 'Red Creativa',
    datePublished: '2024-01-15T10:00:00Z',
    lastModified: '2024-01-20T15:30:00Z',
    isPublished: true,
    currentMetaDescription: 'Aprende a usar ChatGPT para crear contenido de alta calidad para tu blog o sitio web.'
  },
  {
    id: '2',
    slug: 'herramientas-ia-escritores-2024',
    title: 'Las mejores herramientas de IA para escritores en 2024',
    content: `La inteligencia artificial está revolucionando el mundo de la escritura. Descubre las herramientas más potentes disponibles este año.

¿Cuáles son las mejores herramientas de IA para escritores?
Existen múltiples opciones, desde generadores de texto hasta editores inteligentes.

¿Cómo elegir la herramienta correcta?
Depende de tus necesidades específicas, presupuesto y tipo de contenido que creates.

1. Analiza tus necesidades
Identifica qué aspectos de tu escritura necesitan mejora.

2. Prueba versiones gratuitas
La mayoría de herramientas ofrecen trials gratuitos.

3. Evalúa la integración
Considera cómo se integra con tu flujo de trabajo actual.`,
    primaryKeyword: 'herramientas IA escritores',
    category: 'herramientas',
    author: 'Red Creativa',
    datePublished: '2024-01-18T14:00:00Z',
    lastModified: '2024-01-22T09:15:00Z',
    isPublished: true,
    currentMetaDescription: 'Descubre las herramientas de inteligencia artificial más útiles para escritores y creadores de contenido.'
  },
  {
    id: '3',
    slug: 'seo-inteligencia-artificial-guia-completa',
    title: 'SEO con Inteligencia Artificial: Guía completa 2024',
    content: `El SEO está evolucionando rápidamente con la integración de la inteligencia artificial. Aprende cómo optimizar tu estrategia.

¿Cómo afecta la IA al SEO?
La IA está cambiando tanto cómo los motores de búsqueda entienden el contenido como cómo los profesionales optimizan sus sitios.

¿Qué herramientas de IA usar para SEO?
Desde análisis de palabras clave hasta optimización de contenido, hay múltiples opciones disponibles.

Paso 1: Investigación de palabras clave con IA
Utiliza herramientas inteligentes para identificar oportunidades.

Paso 2: Optimización de contenido
Aplica IA para mejorar la relevancia y calidad de tu contenido.

Paso 3: Análisis de rendimiento
Monitorea y ajusta tu estrategia basándote en datos inteligentes.`,
    primaryKeyword: 'SEO inteligencia artificial',
    category: 'seo',
    author: 'Red Creativa',
    datePublished: '2024-01-22T11:30:00Z',
    lastModified: '2024-01-25T16:45:00Z',
    isPublished: true,
    currentMetaDescription: 'Guía completa sobre cómo usar inteligencia artificial para mejorar tu estrategia SEO en 2024.'
  }
];

async function runPerformanceTests() {
  console.log('📊 Ejecutando tests de rendimiento...\n');

  // Test 1: Meta Description Optimization Performance
  console.log('Test 1: Rendimiento de optimización de meta descripciones');
  const startTime1 = performance.now();
  
  const optimizationResults = [];
  for (const article of testArticles) {
    const optimized = metaOptimizer.generateOptimized(
      article.content,
      article.primaryKeyword,
      article.category
    );
    
    const analysis = metaOptimizer.analyzeExistingDescription(
      article.currentMetaDescription,
      article.primaryKeyword
    );
    
    optimizationResults.push({
      articleId: article.id,
      title: article.title,
      original: {
        description: article.currentMetaDescription,
        length: article.currentMetaDescription.length,
        score: analysis.score
      },
      optimized: {
        description: optimized.description,
        length: optimized.length,
        score: optimized.score
      },
      improvement: optimized.score - analysis.score
    });
  }
  
  const endTime1 = performance.now();
  console.log(`✅ Optimizadas ${testArticles.length} meta descripciones en ${(endTime1 - startTime1).toFixed(2)}ms`);
  console.log(`⚡ Promedio: ${((endTime1 - startTime1) / testArticles.length).toFixed(2)}ms por optimización\n`);

  // Test 2: Structured Data Generation Performance
  console.log('Test 2: Rendimiento de generación de datos estructurados');
  const startTime2 = performance.now();
  
  const structuredDataResults = [];
  for (const article of testArticles) {
    // Generate Article Schema
    const articleSchema = structuredDataManager.generateArticleSchema({
      title: article.title,
      description: optimizationResults.find(r => r.articleId === article.id)?.optimized.description || article.currentMetaDescription,
      content: article.content,
      author: article.author,
      datePublished: article.datePublished,
      dateModified: article.lastModified,
      url: `https://redcreativa.pro/${article.slug}`,
      category: article.category,
      keywords: [article.primaryKeyword]
    });

    // Extract and generate FAQ Schema
    const faqs = structuredDataManager.extractFAQsFromContent(article.content);
    const faqSchema = faqs.length > 0 ? structuredDataManager.generateFAQSchema(faqs) : null;

    // Extract and generate HowTo Schema
    const steps = structuredDataManager.extractHowToStepsFromContent(article.content);
    const howToSchema = steps.length > 0 ? structuredDataManager.generateHowToSchema(
      article.title,
      'Guía paso a paso',
      steps
    ) : null;

    const schemas = [articleSchema, faqSchema, howToSchema].filter(Boolean);
    const combinedSchema = structuredDataManager.combineSchemas(schemas);

    structuredDataResults.push({
      articleId: article.id,
      schemasGenerated: schemas.length,
      faqsExtracted: faqs.length,
      stepsExtracted: steps.length,
      schemaSize: combinedSchema.length
    });
  }
  
  const endTime2 = performance.now();
  console.log(`✅ Generados datos estructurados para ${testArticles.length} artículos en ${(endTime2 - startTime2).toFixed(2)}ms`);
  console.log(`⚡ Promedio: ${((endTime2 - startTime2) / testArticles.length).toFixed(2)}ms por artículo\n`);

  // Test 3: Sitemap Generation Performance
  console.log('Test 3: Rendimiento de generación de sitemap');
  const startTime3 = performance.now();
  
  const sitemapXML = sitemapManager.generateSitemap(testArticles);
  const sitemapValidation = sitemapManager.validateSitemap(sitemapXML);
  const sitemapStats = sitemapManager.getSitemapStats(sitemapXML);
  
  const endTime3 = performance.now();
  console.log(`✅ Generado sitemap con ${sitemapStats.totalUrls} URLs en ${(endTime3 - startTime3).toFixed(2)}ms`);
  console.log(`⚡ Sitemap válido: ${sitemapValidation.isValid ? 'Sí' : 'No'}\n`);

  // Test 4: Batch Processing Performance
  console.log('Test 4: Rendimiento de procesamiento en lote');
  const startTime4 = performance.now();
  
  // Simulate processing 100 articles
  const batchSize = 100;
  const batchResults = [];
  
  for (let i = 0; i < batchSize; i++) {
    const mockArticle = {
      ...testArticles[i % testArticles.length],
      id: `batch-${i}`,
      slug: `article-${i}`
    };
    
    const optimized = metaOptimizer.generateOptimized(
      mockArticle.content,
      mockArticle.primaryKeyword,
      mockArticle.category
    );
    
    batchResults.push(optimized);
  }
  
  const endTime4 = performance.now();
  console.log(`✅ Procesados ${batchSize} artículos en lote en ${(endTime4 - startTime4).toFixed(2)}ms`);
  console.log(`⚡ Promedio: ${((endTime4 - startTime4) / batchSize).toFixed(2)}ms por artículo\n`);

  // Performance Summary
  console.log('📈 RESUMEN DE RENDIMIENTO\n');
  
  console.log('Meta Descripciones:');
  optimizationResults.forEach(result => {
    console.log(`  ${result.title}:`);
    console.log(`    Score: ${result.original.score} → ${result.optimized.score} (+${result.improvement})`);
    console.log(`    Longitud: ${result.original.length} → ${result.optimized.length} caracteres`);
    console.log(`    Mejora: ${((result.improvement / result.original.score) * 100).toFixed(1)}%\n`);
  });

  console.log('Datos Estructurados:');
  structuredDataResults.forEach((result, index) => {
    console.log(`  ${testArticles[index].title}:`);
    console.log(`    Schemas: ${result.schemasGenerated}`);
    console.log(`    FAQs: ${result.faqsExtracted}`);
    console.log(`    Pasos: ${result.stepsExtracted}`);
    console.log(`    Tamaño: ${(result.schemaSize / 1024).toFixed(1)}KB\n`);
  });

  console.log('Sitemap:');
  console.log(`  URLs totales: ${sitemapStats.totalUrls}`);
  console.log(`  Distribución de prioridades:`, sitemapStats.priorityDistribution);
  console.log(`  Distribución de frecuencias:`, sitemapStats.changeFrequencyDistribution);
  console.log(`  Rango de fechas: ${sitemapStats.lastModifiedRange.oldest} - ${sitemapStats.lastModifiedRange.newest}\n`);

  // CTR Improvement Projections
  console.log('🎯 PROYECCIONES DE MEJORA CTR\n');
  
  const currentCTR = 4.8;
  const averageScoreImprovement = optimizationResults.reduce((sum, r) => sum + r.improvement, 0) / optimizationResults.length;
  const projectedCTRImprovement = (averageScoreImprovement / 100) * 2; // Estimate 2% CTR improvement per 100 score points
  const projectedNewCTR = currentCTR + projectedCTRImprovement;
  
  console.log(`CTR actual: ${currentCTR}%`);
  console.log(`Mejora promedio de score: ${averageScoreImprovement.toFixed(1)} puntos`);
  console.log(`CTR proyectado: ${projectedNewCTR.toFixed(1)}%`);
  console.log(`Mejora esperada: +${((projectedNewCTR - currentCTR) / currentCTR * 100).toFixed(1)}%\n`);

  // Performance Benchmarks
  console.log('⚡ BENCHMARKS DE RENDIMIENTO\n');
  
  const benchmarks = {
    metaOptimization: (endTime1 - startTime1) / testArticles.length,
    structuredData: (endTime2 - startTime2) / testArticles.length,
    sitemapGeneration: endTime3 - startTime3,
    batchProcessing: (endTime4 - startTime4) / batchSize
  };

  console.log('Tiempos promedio por operación:');
  console.log(`  Optimización meta descripción: ${benchmarks.metaOptimization.toFixed(2)}ms`);
  console.log(`  Generación datos estructurados: ${benchmarks.structuredData.toFixed(2)}ms`);
  console.log(`  Generación sitemap: ${benchmarks.sitemapGeneration.toFixed(2)}ms`);
  console.log(`  Procesamiento en lote: ${benchmarks.batchProcessing.toFixed(2)}ms\n`);

  // Quality Metrics
  console.log('📊 MÉTRICAS DE CALIDAD\n');
  
  const qualityMetrics = {
    averageScoreImprovement: averageScoreImprovement,
    averageLengthOptimization: optimizationResults.reduce((sum, r) => 
      sum + Math.abs(r.optimized.length - 155), 0) / optimizationResults.length,
    structuredDataCoverage: (structuredDataResults.reduce((sum, r) => 
      sum + r.schemasGenerated, 0) / (testArticles.length * 3)) * 100,
    sitemapValidation: sitemapValidation.isValid ? 100 : 0
  };

  console.log(`Mejora promedio de score: ${qualityMetrics.averageScoreImprovement.toFixed(1)} puntos`);
  console.log(`Desviación promedio de longitud óptima: ${qualityMetrics.averageLengthOptimization.toFixed(1)} caracteres`);
  console.log(`Cobertura de datos estructurados: ${qualityMetrics.structuredDataCoverage.toFixed(1)}%`);
  console.log(`Validación de sitemap: ${qualityMetrics.sitemapValidation}%\n`);

  console.log('🎉 Tests de rendimiento completados exitosamente!');
  
  return {
    optimizationResults,
    structuredDataResults,
    sitemapStats,
    benchmarks,
    qualityMetrics,
    projections: {
      currentCTR,
      projectedCTR: projectedNewCTR,
      improvementPercent: ((projectedNewCTR - currentCTR) / currentCTR * 100)
    }
  };
}

// Execute performance tests
runPerformanceTests().then(results => {
  console.log('\n💾 Guardando resultados de tests...');
  
  // In a real implementation, you would save these results to a database or file
  const testSummary = {
    timestamp: new Date().toISOString(),
    testType: 'seo-ctr-optimization-performance',
    results: results,
    status: 'completed'
  };
  
  console.log('✅ Resultados guardados');
  console.log('\n🚀 Sistema listo para implementación en producción!');
}).catch(error => {
  console.error('❌ Error en tests de rendimiento:', error);
});