#!/usr/bin/env node

/**
 * Target Articles Creator for Keyword Expansion
 * Creates new articles targeting high-opportunity keywords
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 Starting Target Articles Creation for Keyword Expansion...\n');

// High-opportunity keyword clusters for IA/Writing niche
const KEYWORD_CLUSTERS = [
  {
    primary: 'generador de contenido con ia',
    secondary: ['crear contenido automatico', 'herramientas contenido ia', 'automatizar creacion contenido'],
    intent: 'commercial',
    difficulty: 'medium',
    volume: 'high'
  },
  {
    primary: 'como escribir con inteligencia artificial',
    secondary: ['escribir textos con ia', 'redaccion automatica ia', 'asistente escritura inteligente'],
    intent: 'informational',
    difficulty: 'low',
    volume: 'high'
  },
  {
    primary: 'chatgpt para escritores',
    secondary: ['chatgpt redaccion', 'usar chatgpt escribir', 'prompts chatgpt escritura'],
    intent: 'informational',
    difficulty: 'medium',
    volume: 'very-high'
  },
  {
    primary: 'ia para marketing de contenidos',
    secondary: ['marketing contenidos automatizado', 'estrategia contenido ia', 'content marketing ia'],
    intent: 'commercial',
    difficulty: 'medium',
    volume: 'high'
  },
  {
    primary: 'corrector de textos inteligente',
    secondary: ['revisar textos con ia', 'corrector automatico', 'mejorar redaccion ia'],
    intent: 'commercial',
    difficulty: 'low',
    volume: 'medium'
  },
  {
    primary: 'plantillas de prompts para ia',
    secondary: ['prompts efectivos ia', 'ejemplos prompts escritura', 'biblioteca prompts'],
    intent: 'informational',
    difficulty: 'low',
    volume: 'medium'
  },
  {
    primary: 'automatizar email marketing con ia',
    secondary: ['emails automaticos ia', 'secuencias email ia', 'personalizar emails ia'],
    intent: 'commercial',
    difficulty: 'medium',
    volume: 'high'
  },
  {
    primary: 'seo con inteligencia artificial',
    secondary: ['optimizar seo ia', 'contenido seo automatico', 'keywords con ia'],
    intent: 'commercial',
    difficulty: 'high',
    volume: 'high'
  },
  {
    primary: 'traducir textos con ia',
    secondary: ['traductor inteligente', 'traduccion automatica', 'localizar contenido ia'],
    intent: 'commercial',
    difficulty: 'low',
    volume: 'medium'
  },
  {
    primary: 'crear ebooks con ia',
    secondary: ['escribir libro ia', 'generar ebook automatico', 'autor virtual'],
    intent: 'informational',
    difficulty: 'low',
    volume: 'medium'
  },
  {
    primary: 'ia para redes sociales',
    secondary: ['contenido social media ia', 'posts automaticos', 'social media manager ia'],
    intent: 'commercial',
    difficulty: 'medium',
    volume: 'high'
  },
  {
    primary: 'copywriting con inteligencia artificial',
    secondary: ['copy persuasivo ia', 'ventas con ia', 'textos comerciales ia'],
    intent: 'commercial',
    difficulty: 'medium',
    volume: 'high'
  },
  {
    primary: 'resumir textos con ia',
    secondary: ['resumen automatico', 'sintetizar contenido', 'extracto inteligente'],
    intent: 'informational',
    difficulty: 'low',
    volume: 'medium'
  },
  {
    primary: 'parafrasear con inteligencia artificial',
    secondary: ['reescribir textos ia', 'reformular contenido', 'sinonimos inteligentes'],
    intent: 'informational',
    difficulty: 'low',
    volume: 'medium'
  },
  {
    primary: 'crear cursos online con ia',
    secondary: ['contenido educativo ia', 'material didactico automatico', 'lecciones con ia'],
    intent: 'commercial',
    difficulty: 'medium',
    volume: 'medium'
  }
];

// Article templates based on intent
const ARTICLE_TEMPLATES = {
  informational: {
    structure: [
      'Introducción y definición',
      'Beneficios principales',
      'Guía paso a paso',
      'Herramientas recomendadas',
      'Ejemplos prácticos',
      'Consejos y mejores prácticas',
      'Errores comunes a evitar',
      'Conclusión y próximos pasos'
    ],
    wordCount: '2000-2500',
    tone: 'educativo y accesible'
  },
  commercial: {
    structure: [
      'Problema y necesidad',
      'Solución con IA',
      'Comparativa de herramientas',
      'Casos de uso específicos',
      'Implementación práctica',
      'ROI y beneficios',
      'Recomendaciones finales',
      'Call to action'
    ],
    wordCount: '1800-2200',
    tone: 'persuasivo pero informativo'
  }
};

// Generate article slug from keyword
function generateSlug(keyword) {
  return keyword
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Generate optimized meta description
function generateMetaDescription(keyword, intent) {
  const actionWords = ['Descubre', 'Aprende', 'Domina', 'Mejora'];
  const emojis = ['🚀', '✨', '💡', '🎯'];
  
  const action = actionWords[Math.floor(Math.random() * actionWords.length)];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  
  if (intent === 'commercial') {
    return `${emoji} ${action} ${keyword} ★ Herramientas, estrategias y casos reales ✓ Guía completa 2025 → ¡Resultados garantizados!`;
  } else {
    return `${emoji} ${action} ${keyword} paso a paso ★ Guía completa con ejemplos ✓ Técnicas profesionales → ¡Fácil y efectivo!`;
  }
}

// Generate article content outline
function generateContentOutline(cluster, template) {
  const { primary, secondary, intent } = cluster;
  const { structure } = template;
  
  return structure.map((section, index) => {
    const keywords = index % 2 === 0 ? [primary] : secondary;
    const keyword = keywords[Math.floor(Math.random() * keywords.length)];
    
    return {
      heading: section,
      targetKeyword: keyword,
      wordCount: Math.floor(template.wordCount.split('-')[0] / structure.length),
      keyPoints: [
        `Explicar ${keyword} en contexto`,
        `Beneficios específicos de ${keyword}`,
        `Ejemplos prácticos de ${keyword}`,
        `Herramientas para ${keyword}`
      ]
    };
  });
}

// Create article page.tsx file
function createArticlePage(cluster, slug) {
  const metaDescription = generateMetaDescription(cluster.primary, cluster.intent);
  const template = ARTICLE_TEMPLATES[cluster.intent];
  const outline = generateContentOutline(cluster, template);
  
  const pageContent = `import { Metadata } from 'next'
import Head from 'next/head'

export const metadata: Metadata = {
  title: '${cluster.primary.charAt(0).toUpperCase() + cluster.primary.slice(1)} | Guía Completa 2025',
  description: '${metaDescription}',
  keywords: '${[cluster.primary, ...cluster.secondary].join(', ')}, IA, inteligencia artificial, escritura, contenido',
  alternates: { canonical: 'https://redcreativa.pro/blog/${slug}' },
  openGraph: {
    title: '${cluster.primary.charAt(0).toUpperCase() + cluster.primary.slice(1)} | Guía Completa 2025',
    description: '${metaDescription}',
    type: 'article',
    url: 'https://redcreativa.pro/blog/${slug}',
    images: [{
      url: 'https://redcreativa.pro/blog/${slug}/og-image.jpg',
      width: 1200,
      height: 630,
      alt: '${cluster.primary}'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: '${cluster.primary.charAt(0).toUpperCase() + cluster.primary.slice(1)} | Guía Completa 2025',
    description: '${metaDescription}',
    images: ['https://redcreativa.pro/blog/${slug}/og-image.jpg']
  },
  robots: { index: true, follow: true }
};

export default function ${slug.replace(/-/g, '').charAt(0).toUpperCase() + slug.replace(/-/g, '').slice(1)}Page() {
  // Structured Data for SEO
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${cluster.primary.charAt(0).toUpperCase() + cluster.primary.slice(1)}",
    "description": "${metaDescription}",
    "author": {
      "@type": "Person",
      "name": "Red Creativa",
      "url": "https://redcreativa.pro"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Red Creativa",
      "logo": {
        "@type": "ImageObject",
        "url": "https://redcreativa.pro/logo.png"
      }
    },
    "datePublished": "${new Date().toISOString()}",
    "dateModified": "${new Date().toISOString()}",
    "url": "https://redcreativa.pro/blog/${slug}",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://redcreativa.pro/blog/${slug}"
    },
    "articleSection": "IA y Escritura",
    "keywords": "${[cluster.primary, ...cluster.secondary].join(', ')}",
    "image": {
      "@type": "ImageObject",
      "url": "https://redcreativa.pro/blog/${slug}/og-image.jpg",
      "width": 1200,
      "height": 630
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Qué es ${cluster.primary}?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "${cluster.primary} es una tecnología que utiliza inteligencia artificial para automatizar y mejorar procesos de escritura y creación de contenido."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuáles son los beneficios de ${cluster.primary}?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Los principales beneficios incluyen ahorro de tiempo, mejora de la calidad, consistencia en el tono y escalabilidad en la producción de contenido."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cómo empezar con ${cluster.primary}?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Puedes empezar eligiendo las herramientas adecuadas, definiendo tus objetivos y siguiendo una metodología estructurada paso a paso."
        }
      }
    ]
  };

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([articleSchema, faqSchema])
          }}
        />
      </Head>
      
      <article className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            ${cluster.primary.charAt(0).toUpperCase() + cluster.primary.slice(1)}: Guía Completa 2025
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            ${metaDescription.replace(/[🚀✨💡🎯★✓→]/g, '').trim()}
          </p>
        </header>

        <div className="prose prose-lg max-w-none">
          ${outline.map((section, index) => `
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">${section.heading}</h2>
            <div className="bg-blue-50 p-6 rounded-lg mb-4">
              <p className="text-gray-700">
                <strong>Keyword objetivo:</strong> ${section.targetKeyword}
              </p>
              <p className="text-gray-700 mt-2">
                <strong>Puntos clave a desarrollar:</strong>
              </p>
              <ul className="list-disc list-inside mt-2 text-gray-600">
                ${section.keyPoints.map(point => `<li>${point}</li>`).join('\n                ')}
              </ul>
              <p className="text-sm text-gray-500 mt-4">
                📝 <em>Desarrollar aproximadamente ${section.wordCount} palabras para esta sección</em>
              </p>
            </div>
          </section>`).join('\n          ')}

          <section className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Próximos Pasos</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">🚀 Herramientas Recomendadas</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <a href="/escritor-ia" className="text-blue-600 hover:underline">Escritor IA Profesional</a></li>
                  <li>• <a href="/correos-ia" className="text-blue-600 hover:underline">Generador de Emails IA</a></li>
                  <li>• <a href="/herramientas-ia-copywriting" className="text-blue-600 hover:underline">Suite Copywriting IA</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">📚 Artículos Relacionados</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  ${cluster.secondary.slice(0, 3).map(keyword => 
                    `<li>• <a href="/blog/${generateSlug(keyword)}" className="text-blue-600 hover:underline">${keyword}</a></li>`
                  ).join('\n                  ')}
                </ul>
              </div>
            </div>
          </section>
        </div>
      </article>
    </>
  );
}

// SEO Keywords: ${[cluster.primary, ...cluster.secondary].join(', ')}, inteligencia artificial, escritura automatizada, contenido IA, herramientas escritura, marketing digital IA, redaccion inteligente, automatizacion contenido, asistente escritura, generador textos IA`;

  return pageContent;
}

// Create article directory and files
function createArticle(cluster) {
  const slug = generateSlug(cluster.primary);
  const articleDir = path.join('app/blog', slug);
  
  // Create directory
  if (!fs.existsSync(articleDir)) {
    fs.mkdirSync(articleDir, { recursive: true });
  } else {
    console.log(`⚠️  Article ${slug} already exists, skipping...`);
    return null;
  }
  
  // Create page.tsx
  const pageContent = createArticlePage(cluster, slug);
  fs.writeFileSync(path.join(articleDir, 'page.tsx'), pageContent);
  
  // Create placeholder og-image.jpg info
  const ogImageInfo = `# OG Image for ${cluster.primary}

## Specifications:
- Size: 1200x630px
- Format: JPG
- Title: "${cluster.primary.charAt(0).toUpperCase() + cluster.primary.slice(1)}"
- Subtitle: "Guía Completa 2025"
- Brand: "Red Creativa"
- Colors: Blue gradient background
- Include relevant icons/illustrations

## Keywords to highlight:
${cluster.secondary.slice(0, 3).map(k => `- ${k}`).join('\n')}
`;
  
  fs.writeFileSync(path.join(articleDir, 'og-image-specs.md'), ogImageInfo);
  
  return {
    slug,
    primary: cluster.primary,
    secondary: cluster.secondary,
    intent: cluster.intent,
    difficulty: cluster.difficulty,
    volume: cluster.volume,
    targetKeywords: [cluster.primary, ...cluster.secondary].length,
    estimatedTraffic: calculateEstimatedTraffic(cluster.volume, cluster.difficulty)
  };
}

// Calculate estimated monthly traffic
function calculateEstimatedTraffic(volume, difficulty) {
  const volumeMultiplier = {
    'very-high': 5000,
    'high': 2000,
    'medium': 800,
    'low': 300
  };
  
  const difficultyMultiplier = {
    'low': 0.8,
    'medium': 0.5,
    'high': 0.2
  };
  
  const baseTraffic = volumeMultiplier[volume] || 500;
  const difficultyFactor = difficultyMultiplier[difficulty] || 0.3;
  
  return Math.round(baseTraffic * difficultyFactor);
}

// Main execution
async function main() {
  console.log(`🎯 Creating ${KEYWORD_CLUSTERS.length} target articles for keyword expansion\n`);
  
  const results = [];
  let created = 0;
  let totalKeywords = 0;
  let estimatedTraffic = 0;
  
  for (const cluster of KEYWORD_CLUSTERS) {
    const result = createArticle(cluster);
    if (result) {
      results.push(result);
      created++;
      totalKeywords += result.targetKeywords;
      estimatedTraffic += result.estimatedTraffic;
      
      console.log(`✅ Created: ${result.slug}`);
      console.log(`   Keywords: ${result.targetKeywords} | Traffic: ${result.estimatedTraffic}/month`);
    }
  }
  
  // Summary
  console.log('\n📊 KEYWORD EXPANSION SUMMARY');
  console.log('=============================');
  console.log(`Articles created: ${created}`);
  console.log(`Total target keywords: ${totalKeywords}`);
  console.log(`Estimated monthly traffic: ${estimatedTraffic.toLocaleString()}`);
  console.log(`Average keywords per article: ${Math.round(totalKeywords / created)}`);
  
  // Intent breakdown
  const intentBreakdown = {};
  results.forEach(result => {
    intentBreakdown[result.intent] = (intentBreakdown[result.intent] || 0) + 1;
  });
  
  console.log('\nContent intent distribution:');
  Object.entries(intentBreakdown).forEach(([intent, count]) => {
    console.log(`  ${intent}: ${count} articles`);
  });
  
  // Difficulty breakdown
  const difficultyBreakdown = {};
  results.forEach(result => {
    difficultyBreakdown[result.difficulty] = (difficultyBreakdown[result.difficulty] || 0) + 1;
  });
  
  console.log('\nKeyword difficulty distribution:');
  Object.entries(difficultyBreakdown).forEach(([difficulty, count]) => {
    console.log(`  ${difficulty}: ${count} articles`);
  });
  
  // Save report
  const reportPath = 'keyword-expansion-report.json';
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      articlesCreated: created,
      totalTargetKeywords: totalKeywords,
      estimatedMonthlyTraffic: estimatedTraffic,
      avgKeywordsPerArticle: Math.round(totalKeywords / created),
      intentBreakdown,
      difficultyBreakdown
    },
    articles: results
  }, null, 2));
  
  console.log(`\n📄 Report saved to: ${reportPath}`);
  console.log('\n🚀 Next Steps:');
  console.log('1. Review and customize the generated article outlines');
  console.log('2. Create OG images based on the specifications');
  console.log('3. Develop full content for each section');
  console.log('4. Monitor keyword rankings and adjust strategy');
  console.log('\n🎉 Keyword Expansion Articles Created!');
}

main().catch(console.error);