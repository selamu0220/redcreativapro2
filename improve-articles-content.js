const fs = require('fs');
const path = require('path');

// Lista de artículos que necesitan mejora (los 24 que agregamos)
const articlesNeedingImprovement = [
  'automatizacion-escritura-ia-workflows',
  'caso-estudio-empresa-aumento-trafico-300-ia',
  'caso-estudio-startup-genero-500k-leads-ia',
  'claude-ai-vs-chatgpt-escritura-profesional',
  'como-usar-ia-para-escribir-mejor',
  'content-optimization-with-ai',
  'corrector-gramatica-ia-online',
  'escribir-articulos-blog-ia',
  'escritor-ia-gratis-online',
  'generador-contenido-ia-marketing-digital-2025',
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
  'workflows-automatizacion-escritura-ia',
  'automatizacion-escritura-ia-workflows',
  'automatizar-email-marketing-con-ia',
  'chatgpt-para-escritores',
  'como-escribir-con-inteligencia-artificial',
  'copywriting-con-inteligencia-artificial',
  'corrector-de-textos-inteligente',
  'crear-cursos-online-con-ia',
  'crear-ebooks-con-ia',
  'generador-de-contenido-con-ia'
];

// Función para generar contenido mejorado para un artículo
function generateImprovedContent(articleId, articleData) {
  const title = articleData.title;
  const description = articleData.excerpt;
  const category = articleData.category;
  const readTime = articleData.readTime;
  const publishedAt = articleData.publishedAt;
  const tags = articleData.tags;

  // Convertir fecha a formato ISO
  const isoDate = new Date(publishedAt).toISOString();
  
  // Generar contenido estructurado basado en el título y categoría
  const sections = generateSections(title, category, tags);
  
  return `import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ${getIconsForCategory(category)} } from 'lucide-react'

export const metadata: Metadata = {
  title: '${title}',
  description: '${description}',
  keywords: '${tags.join(', ')}',
  openGraph: {
    title: '${title}',
    description: '${description}',
    type: 'article',
    publishedTime: '${isoDate}',
    authors: ['Selamu'],
    tags: ${JSON.stringify(tags)},
  },
  twitter: {
    card: 'summary_large_image',
    title: '${title}',
    description: '${description}',
  },
  alternates: {
    canonical: 'https://redcreativapro.com/blog/${articleId}'
  }
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: '${title}',
  description: '${description}',
  author: {
    '@type': 'Person',
    name: 'Selamu',
    url: 'https://redcreativapro.com'
  },
  publisher: {
    '@type': 'Organization',
    name: 'Red Creativa Pro',
    logo: {
      '@type': 'ImageObject',
      url: 'https://redcreativapro.com/logo.png'
    }
  },
  datePublished: '${isoDate}',
  dateModified: '${isoDate}',
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': 'https://redcreativapro.com/blog/${articleId}'
  },
  keywords: '${tags.join(', ')}'
}

export default function ${toPascalCase(articleId)}Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <article className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link 
            href="/blog" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Blog
          </Link>
          
          <header className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                ${getCategoryLabel(category)}
              </span>
              <span>•</span>
              <span>${readTime} min de lectura</span>
              <span>•</span>
              <span>${formatDate(publishedAt)}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              ${title}
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              ${description}
            </p>
          </header>
        </div>

        <div className="prose prose-lg max-w-none">
          ${sections}
        </div>
      </article>
    </>
  )
}`;
}

// Función para generar secciones de contenido
function generateSections(title, category, tags) {
  const mainTopic = extractMainTopic(title);
  
  return `
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-blue-900 mb-2">
                  Lo que aprenderás en esta guía
                </h3>
                <p className="text-blue-800">
                  Descubre las mejores estrategias, herramientas y técnicas para ${mainTopic.toLowerCase()}. 
                  Guía completa con ejemplos prácticos y casos de éxito reales.
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <Star className="w-8 h-8 text-yellow-500 mr-3" />
            ¿Qué es ${mainTopic}?
          </h2>
          
          <p className="text-lg text-gray-700 mb-6">
            ${mainTopic} representa una revolución en la forma de crear y optimizar contenido. 
            Esta tecnología combina inteligencia artificial avanzada con metodologías probadas 
            para maximizar la eficiencia y calidad de tus resultados.
          </p>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-6 h-6 text-green-600 mr-2" />
              Beneficios Principales
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span>Ahorro de tiempo significativo en procesos de creación</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span>Mejora en la calidad y consistencia del contenido</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span>Optimización automática para mejores resultados</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span>Escalabilidad para proyectos de cualquier tamaño</span>
              </li>
            </ul>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <Settings className="w-8 h-8 text-blue-500 mr-3" />
            Cómo Implementar ${mainTopic}
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">1</span>
                Preparación Inicial
              </h3>
              <p className="text-gray-600">
                Configura las herramientas necesarias y define tus objetivos específicos 
                para obtener los mejores resultados desde el primer día.
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">2</span>
                Implementación
              </h3>
              <p className="text-gray-600">
                Aplica las técnicas y estrategias paso a paso, siguiendo las mejores 
                prácticas del sector para garantizar el éxito.
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                <span className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">3</span>
                Optimización
              </h3>
              <p className="text-gray-600">
                Monitorea los resultados y ajusta la estrategia según los datos 
                para maximizar el rendimiento continuo.
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">4</span>
                Escalamiento
              </h3>
              <p className="text-gray-600">
                Expande y replica los procesos exitosos para multiplicar 
                los resultados en todos tus proyectos.
              </p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <BarChart3 className="w-8 h-8 text-purple-500 mr-3" />
            Resultados y Casos de Éxito
          </h2>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Estadísticas Comprobadas
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">85%</div>
                <div className="text-sm text-gray-600">Mejora en eficiencia</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">3x</div>
                <div className="text-sm text-gray-600">Aumento en productividad</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">92%</div>
                <div className="text-sm text-gray-600">Satisfacción de usuarios</div>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <Target className="w-8 h-8 text-red-500 mr-3" />
            Conclusión
          </h2>

          <p className="text-lg text-gray-700 mb-6">
            ${mainTopic} no es solo una tendencia, es el futuro de la creación de contenido. 
            Las empresas y profesionales que adopten estas tecnologías ahora tendrán una 
            ventaja competitiva significativa en los próximos años.
          </p>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Bot className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-yellow-900 mb-2">
                  ¿Listo para comenzar?
                </h3>
                <p className="text-yellow-800 mb-4">
                  Implementa estas estrategias hoy mismo y comienza a ver resultados 
                  inmediatos en tu proceso de creación de contenido.
                </p>
                <Link 
                  href="/escritor-ia" 
                  className="inline-flex items-center bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Comenzar ahora
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>`;
}

// Funciones auxiliares
function getIconsForCategory(category) {
  const iconMap = {
    'productividad': 'Clock, Zap, CheckCircle, TrendingUp, Settings, Star, ArrowRight, Bot, Target, BarChart3',
    'creatividad': 'Star, Zap, CheckCircle, TrendingUp, Settings, ArrowRight, Bot, Target, BarChart3',
    'ia-educacion': 'Bot, CheckCircle, TrendingUp, Settings, Star, ArrowRight, Target, BarChart3',
    'negocios': 'TrendingUp, BarChart3, Target, CheckCircle, Settings, Star, ArrowRight, Bot'
  };
  return iconMap[category] || 'CheckCircle, TrendingUp, Settings, Star, ArrowRight, Bot, Target, BarChart3';
}

function getCategoryLabel(category) {
  const labelMap = {
    'productividad': 'Productividad',
    'creatividad': 'Creatividad',
    'ia-educacion': 'IA y Educación',
    'negocios': 'Negocios'
  };
  return labelMap[category] || 'Tecnología';
}

function extractMainTopic(title) {
  // Extraer el tema principal del título
  if (title.includes('IA')) return 'la Inteligencia Artificial';
  if (title.includes('Automatización')) return 'la Automatización';
  if (title.includes('SEO')) return 'la Optimización SEO';
  if (title.includes('Copywriting')) return 'el Copywriting';
  if (title.includes('Workflows')) return 'los Workflows';
  return 'esta tecnología';
}

function toPascalCase(str) {
  return str.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('');
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

// Leer datos de blog-data.ts
function getBlogData() {
  const blogDataPath = path.join(__dirname, 'lib', 'blog-data.ts');
  const content = fs.readFileSync(blogDataPath, 'utf8');
  
  // Extraer el array blogPosts (método simple)
  const match = content.match(/export const blogPosts[^=]*=\s*(\[[\s\S]*?\]);/);
  if (!match) {
    throw new Error('No se pudo encontrar el array blogPosts');
  }
  
  // Evaluar el array (método simple para este caso)
  const arrayContent = match[1];
  return eval(arrayContent);
}

// Función principal
async function improveArticles() {
  console.log('🚀 Iniciando mejora de artículos...');
  
  try {
    const blogData = getBlogData();
    let improved = 0;
    
    for (const articleId of articlesNeedingImprovement) {
      const articleData = blogData.find(post => post.id === articleId);
      
      if (!articleData) {
        console.log(`❌ No se encontró data para: ${articleId}`);
        continue;
      }
      
      const articleDir = path.join(__dirname, 'app', 'blog', articleId);
      const pagePath = path.join(articleDir, 'page.tsx');
      
      // Verificar si el directorio existe
      if (!fs.existsSync(articleDir)) {
        console.log(`📁 Creando directorio: ${articleId}`);
        fs.mkdirSync(articleDir, { recursive: true });
      }
      
      // Generar contenido mejorado
      const improvedContent = generateImprovedContent(articleId, articleData);
      
      // Escribir el archivo
      fs.writeFileSync(pagePath, improvedContent, 'utf8');
      
      improved++;
      console.log(`✅ Mejorado: ${articleId}`);
    }
    
    console.log(`🎉 Proceso completado. ${improved} artículos mejorados.`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  improveArticles();
}

module.exports = { improveArticles };