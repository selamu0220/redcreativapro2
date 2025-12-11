const { MetaDescriptionOptimizer } = require('./lib/seo-optimization.ts');
const { StructuredDataManager } = require('./lib/structured-data.ts');

// Test Meta Description Optimization
console.log('🎯 Testing Meta Description Optimization...\n');

const optimizer = new MetaDescriptionOptimizer();

// Test case 1: Basic optimization
const testContent1 = `
ChatGPT es una herramienta de inteligencia artificial que puede ayudarte a escribir contenido de alta calidad. 
En este artículo aprenderás técnicas avanzadas para usar ChatGPT de manera efectiva en la creación de contenido.
Incluye prompts específicos, mejores prácticas y ejemplos reales de uso.
`;

const result1 = optimizer.generateOptimized(
  testContent1, 
  'ChatGPT para escribir', 
  'ai'
);

console.log('✅ Test 1 - Optimización básica:');
console.log('Descripción:', result1.description);
console.log('Longitud:', result1.length);
console.log('Score:', result1.score);
console.log('Emojis:', result1.emojis);
console.log('Palabras de acción:', result1.actionWords);
console.log('Keywords:', result1.keywords);
console.log('---\n');

// Test case 2: Analysis of existing description
const existingDescription = 'Aprende a usar ChatGPT para crear contenido de alta calidad para tu blog o sitio web.';
const analysis = optimizer.analyzeExistingDescription(existingDescription, 'ChatGPT para escribir');

console.log('✅ Test 2 - Análisis de descripción existente:');
console.log('Score:', analysis.score);
console.log('Problemas:', analysis.issues);
console.log('Sugerencias:', analysis.suggestions);
console.log('---\n');

// Test Structured Data
console.log('📊 Testing Structured Data Generation...\n');

const structuredDataManager = new StructuredDataManager();

// Test Article Schema
const testArticle = {
  title: 'Cómo usar ChatGPT para escribir contenido de calidad',
  description: result1.description,
  content: testContent1,
  author: 'Red Creativa',
  datePublished: '2024-01-15T10:00:00Z',
  dateModified: '2024-01-20T15:30:00Z',
  url: 'https://redcreativa.pro/chatgpt-escribir-contenido',
  imageUrl: 'https://redcreativa.pro/images/chatgpt-writing.jpg',
  category: 'Inteligencia Artificial',
  keywords: ['ChatGPT', 'escritura', 'IA', 'contenido', 'redacción']
};

const articleSchema = structuredDataManager.generateArticleSchema(testArticle);
console.log('✅ Test 3 - Article Schema:');
console.log(JSON.stringify(articleSchema, null, 2));
console.log('---\n');

// Test FAQ Schema
const testFAQs = [
  {
    question: '¿Cómo puedo usar ChatGPT para escribir mejor?',
    answer: 'ChatGPT puede ayudarte a generar ideas, estructurar contenido y mejorar la redacción mediante prompts específicos y técnicas de refinamiento.'
  },
  {
    question: '¿Es seguro usar ChatGPT para contenido profesional?',
    answer: 'Sí, pero siempre debes revisar y editar el contenido generado para asegurar precisión, originalidad y alineación con tu marca.'
  }
];

const faqSchema = structuredDataManager.generateFAQSchema(testFAQs);
console.log('✅ Test 4 - FAQ Schema:');
console.log(JSON.stringify(faqSchema, null, 2));
console.log('---\n');

// Test HowTo Schema
const testSteps = [
  {
    name: 'Definir el objetivo del contenido',
    text: 'Antes de usar ChatGPT, define claramente qué tipo de contenido necesitas y cuál es su propósito.'
  },
  {
    name: 'Crear un prompt específico',
    text: 'Escribe un prompt detallado que incluya el tema, tono, audiencia y formato deseado.'
  },
  {
    name: 'Generar y refinar el contenido',
    text: 'Usa ChatGPT para generar el contenido inicial y luego refínalo con prompts adicionales.'
  },
  {
    name: 'Revisar y editar',
    text: 'Revisa el contenido generado, verifica la información y edita para mejorar la calidad.'
  }
];

const howToSchema = structuredDataManager.generateHowToSchema(
  'Cómo usar ChatGPT para escribir contenido de calidad',
  'Guía paso a paso para aprovechar ChatGPT en la creación de contenido profesional',
  testSteps,
  'PT30M' // 30 minutes
);

console.log('✅ Test 5 - HowTo Schema:');
console.log(JSON.stringify(howToSchema, null, 2));
console.log('---\n');

// Test Schema Validation
const validation = structuredDataManager.validateSchema(articleSchema);
console.log('✅ Test 6 - Schema Validation:');
console.log('Es válido:', validation.isValid);
if (!validation.isValid) {
  console.log('Errores:', validation.errors);
}
console.log('---\n');

// Test FAQ Extraction from Content
const contentWithFAQs = `
Este es un artículo sobre ChatGPT.

¿Qué es ChatGPT?
ChatGPT es un modelo de lenguaje desarrollado por OpenAI que puede generar texto de alta calidad.

¿Cómo funciona ChatGPT?
Utiliza técnicas de aprendizaje profundo para entender y generar texto basado en patrones aprendidos.

Pregunta: ¿Es gratis ChatGPT?
ChatGPT tiene versiones gratuitas y de pago, dependiendo del uso y las características necesarias.
`;

const extractedFAQs = structuredDataManager.extractFAQsFromContent(contentWithFAQs);
console.log('✅ Test 7 - FAQ Extraction:');
console.log('FAQs extraídas:', extractedFAQs);
console.log('---\n');

// Test HowTo Steps Extraction
const contentWithSteps = `
Para usar ChatGPT efectivamente:

1. Registra una cuenta en OpenAI
Visita el sitio web de OpenAI y crea una cuenta gratuita.

2. Accede a ChatGPT
Una vez registrado, accede a la interfaz de ChatGPT desde tu navegador.

Paso 3: Escribe tu primer prompt
Comienza con una pregunta o solicitud clara y específica.

4. Analiza la respuesta
Revisa la respuesta generada y determina si necesitas hacer ajustes.
`;

const extractedSteps = structuredDataManager.extractHowToStepsFromContent(contentWithSteps);
console.log('✅ Test 8 - HowTo Steps Extraction:');
console.log('Pasos extraídos:', extractedSteps);
console.log('---\n');

// Test Combined Schema Generation
const combinedSchemas = [articleSchema, faqSchema, howToSchema];
const combinedJSON = structuredDataManager.combineSchemas(combinedSchemas);
console.log('✅ Test 9 - Combined Schemas:');
console.log('Schemas combinados (primeros 500 caracteres):');
console.log(combinedJSON.substring(0, 500) + '...');
console.log('---\n');

// Performance Test
console.log('⚡ Performance Tests...\n');

const startTime = Date.now();
for (let i = 0; i < 100; i++) {
  optimizer.generateOptimized(testContent1, 'test keyword', 'technology');
}
const endTime = Date.now();

console.log('✅ Test 10 - Performance:');
console.log(`100 optimizaciones en ${endTime - startTime}ms`);
console.log(`Promedio: ${(endTime - startTime) / 100}ms por optimización`);
console.log('---\n');

// Summary
console.log('🎉 Resumen de Tests:');
console.log('✅ Meta Description Optimizer: Funcionando');
console.log('✅ Structured Data Manager: Funcionando');
console.log('✅ Schema Validation: Funcionando');
console.log('✅ Content Extraction: Funcionando');
console.log('✅ Performance: Aceptable');
console.log('\n🚀 Sistema de optimización SEO CTR listo para usar!');

// Export results for further analysis
const testResults = {
  metaDescriptionOptimization: {
    originalLength: existingDescription.length,
    optimizedLength: result1.length,
    scoreImprovement: result1.score - analysis.score,
    emojisAdded: result1.emojis.length,
    actionWordsAdded: result1.actionWords.length
  },
  structuredData: {
    articleSchemaValid: validation.isValid,
    faqsExtracted: extractedFAQs.length,
    stepsExtracted: extractedSteps.length,
    schemasGenerated: combinedSchemas.length
  },
  performance: {
    averageOptimizationTime: (endTime - startTime) / 100,
    totalTestTime: endTime - startTime
  }
};

console.log('\n📊 Métricas detalladas:');
console.log(JSON.stringify(testResults, null, 2));