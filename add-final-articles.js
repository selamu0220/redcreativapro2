const fs = require('fs');

// Leer el archivo actual
let content = fs.readFileSync('lib/blog-data.ts', 'utf8');

// Artículos adicionales a agregar (continuando desde donde quedamos)
const additionalArticles = [
  {
    id: 'caso-estudio-b2b-genero-1200-leads-mes-ia',
    title: 'Caso de Estudio: Empresa B2B Generó 1,200 Leads/Mes con IA',
    excerpt: 'Descubre cómo una empresa B2B SaaS generó 1,200 leads cualificados mensuales, redujo CAC 70% y aumentó conversión 280% usando automatización con IA.',
    category: 'productividad',
    subcategory: 'automatizacion',
    author: 'selamu',
    publishedAt: '2024-12-20',
    readTime: '17 min',
    tags: ['caso estudio B2B IA', 'generación leads B2B', 'automatización B2B', 'lead generation SaaS', 'marketing automation B2B'],
    featured: false,
    trending: false,
    views: 2711,
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Caso%20de%20Estudio%3A%20Empresa%20B2B%20Gener%C3%B3%201%2C200%20Leads%2FMes%20con%20IA&image_size=landscape_16_9'
  },
  {
    id: 'caso-estudio-ecommerce-aumento-ventas-400-ia',
    title: 'Caso de Estudio: E-commerce Aumentó Ventas 400% con IA en 8 Meses',
    excerpt: 'Descubre cómo una tienda online aumentó ventas 400%, redujo CAC 65% y mejoró ROAS 320% usando IA para personalización, automatización y optimización de conversiones.',
    category: 'productividad',
    subcategory: 'automatizacion',
    author: 'selamu',
    publishedAt: '2024-12-20',
    readTime: '16 min',
    tags: ['caso estudio ecommerce IA', 'aumento ventas IA', 'personalización ecommerce', 'automatización marketing', 'ROAS optimization'],
    featured: true,
    trending: false,
    views: 2207,
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Caso%20de%20Estudio%3A%20E-commerce%20Aument%C3%B3%20Ventas%20400%25%20con%20IA%20en%208%20Meses&image_size=landscape_16_9'
  }
];

// Función para generar el contenido del artículo
function generateContent(article) {
  return `${article.excerpt}

## Introducción

Este artículo forma parte de nuestra serie completa sobre inteligencia artificial aplicada a la creación de contenido y marketing digital.

## Contenido Principal

[El contenido completo se encuentra en la página individual del artículo]

## Conclusión

La implementación de estas técnicas y herramientas puede transformar significativamente tu proceso de trabajo y resultados.

*Para acceder al contenido completo y detallado de este artículo, visita la página individual.*`;
}

// Buscar la posición de inserción (antes del último cierre del array)
const lastBraceIndex = content.lastIndexOf('  }\n];');

if (lastBraceIndex === -1) {
  console.error('No se pudo encontrar la posición de inserción');
  process.exit(1);
}

// Generar el código para los nuevos artículos
let newArticlesCode = '';
additionalArticles.forEach(article => {
  newArticlesCode += `,
  {
    id: '${article.id}',
    title: '${article.title}',
    excerpt: '${article.excerpt}',
    category: '${article.category}',
    subcategory: '${article.subcategory}',
    author: '${article.author}',
    publishedAt: '${article.publishedAt}',
    readTime: '${article.readTime}',
    tags: [${article.tags.map(tag => `'${tag}'`).join(', ')}],
    featured: ${article.featured},
    trending: ${article.trending},
    views: ${article.views},
    image: '${article.image}',
    content: \`${generateContent(article)}\`
  }`;
});

// Insertar los nuevos artículos
const beforeInsertion = content.substring(0, lastBraceIndex);
const afterInsertion = content.substring(lastBraceIndex);

const newContent = beforeInsertion + newArticlesCode + '\n' + afterInsertion;

// Escribir el archivo actualizado
fs.writeFileSync('lib/blog-data.ts', newContent);

console.log(`✅ Se agregaron exitosamente ${additionalArticles.length} artículos adicionales`);
console.log('📊 Total de artículos ahora en el array principal');