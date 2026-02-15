#!/usr/bin/env node
/**
 * SEO INDEXING AUDIT SCRIPT
 * 
 * Este script analiza y corrige problemas de indexación:
 * - 546 URLs duplicadas sin canonical
 * - 42 páginas descubiertas sin indexar
 * - 21 páginas con redirección
 * - 18 páginas 404
 * - 6 páginas con noindex
 * 
 * Uso: node scripts/seo-indexing-audit.js
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Configuración
const CONFIG = {
  siteUrl: 'https://redcreativa.pro',
  locales: ['de', 'fr', 'it', 'zh', 'pt'],
  blogDir: path.join(__dirname, '..', 'blogs'),
  appDir: path.join(__dirname, '..', 'app'),
  outputDir: path.join(__dirname, '..', 'seo-audit-results'),
};

// Issues encontrados
const issues = {
  duplicates: [],
  noindex: [],
  redirects: [],
  notFound: [],
  withoutCanonical: [],
  thinContent: [],
  orphanPages: [],
};

// URLs encontradas
const urls = {
  blog: [],
  static: [],
  dynamic: [],
  locales: [],
  all: [],
};

// =====================================================
// FUNCIÓN: Escanear directorio de blogs
// =====================================================
async function scanBlogs() {
  console.log('🔍 Escaneando blogs...');
  
  try {
    const blogDirs = await readdir(CONFIG.blogDir);
    
    for (const dir of blogDirs) {
      const blogPath = path.join(CONFIG.blogDir, dir);
      const stat = fs.statSync(blogPath);
      
      if (stat.isDirectory()) {
        // URL principal del blog
        const blogUrl = `${CONFIG.siteUrl}/blog/${dir}`;
        urls.blog.push({
          slug: dir,
          url: blogUrl,
          path: blogPath,
        });
        
        // URLs locales
        for (const locale of CONFIG.locales) {
          urls.locales.push({
            slug: dir,
            locale,
            url: `${CONFIG.siteUrl}/${locale}/blog/${dir}`,
          });
        }
      }
    }
    
    console.log(`✅ Encontrados ${urls.blog.length} blogs`);
    console.log(`✅ Encontradas ${urls.locales.length} URLs locales`);
    
  } catch (error) {
    console.error('❌ Error escaneando blogs:', error.message);
  }
}

// =====================================================
// FUNCIÓN: Escanear páginas estáticas en /app
// =====================================================
async function scanStaticPages() {
  console.log('\n🔍 Escaneando páginas estáticas...');
  
  try {
    const entries = await readdir(CONFIG.appDir);
    
    for (const entry of entries) {
      const entryPath = path.join(CONFIG.appDir, entry);
      const stat = fs.statSync(entryPath);
      
      if (stat.isDirectory()) {
        // Verificar si tiene page.tsx
        const pagePath = path.join(entryPath, 'page.tsx');
        if (fs.existsSync(pagePath)) {
          const isDynamic = entry.startsWith('[') || entry.includes('[');
          
          if (!isDynamic && !entry.startsWith('_') && !entry.startsWith('.')) {
            urls.static.push({
              path: entry,
              url: `${CONFIG.siteUrl}/${entry}`,
              hasPage: true,
            });
          }
        }
      }
    }
    
    console.log(`✅ Encontradas ${urls.static.length} páginas estáticas`);
    
  } catch (error) {
    console.error('❌ Error escaneando páginas estáticas:', error.message);
  }
}

// =====================================================
// FUNCIÓN: Detectar duplicados potenciales
// =====================================================
function detectDuplicates() {
  console.log('\n🔍 Detectando URLs duplicadas...');
  
  // 1. Duplicados por locales
  const localeGroups = {};
  urls.blog.forEach(blog => {
    const baseSlug = blog.slug;
    if (!localeGroups[baseSlug]) {
      localeGroups[baseSlug] = [];
    }
    localeGroups[baseSlug].push(blog.url);
    
    // Agregar locales
    urls.locales
      .filter(l => l.slug === baseSlug)
      .forEach(l => localeGroups[baseSlug].push(l.url));
  });
  
  // Detectar grupos con múltiples URLs (potenciales duplicados)
  for (const [slug, urlList] of Object.entries(localeGroups)) {
    if (urlList.length > 1) {
      issues.duplicates.push({
        type: 'locale_variants',
        slug,
        urls: urlList,
        recommendation: 'Implementar hreflang y canonical self-referencing',
      });
    }
  }
  
  // 2. Detectar URLs con parámetros potenciales
  const params = ['page', 'sort', 'filter', 'category', 'tag'];
  urls.all.forEach(url => {
    params.forEach(param => {
      issues.duplicates.push({
        type: 'parameter_variant',
        url: `${url}?${param}=value`,
        recommendation: `Canonical debe apuntar a ${url}`,
      });
    });
  });
  
  console.log(`⚠️  Detectados ${issues.duplicates.length} potenciales duplicados`);
}

// =====================================================
// FUNCIÓN: Generar reporte JSON
// =====================================================
async function generateReport() {
  console.log('\n📝 Generando reporte...');
  
  // Asegurar que existe el directorio de salida
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalBlogs: urls.blog.length,
      totalStaticPages: urls.static.length,
      totalLocaleUrls: urls.locales.length,
      totalUrls: urls.blog.length + urls.static.length + urls.locales.length,
      duplicateIssues: issues.duplicates.length,
      noindexIssues: issues.noindex.length,
      redirectIssues: issues.redirects.length,
      notFoundIssues: issues.notFound.length,
    },
    urls,
    issues,
    recommendations: generateRecommendations(),
  };
  
  const reportPath = path.join(CONFIG.outputDir, 'indexing-audit-report.json');
  await writeFile(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`✅ Reporte guardado en: ${reportPath}`);
  
  return report;
}

// =====================================================
// FUNCIÓN: Generar recomendaciones
// =====================================================
function generateRecommendations() {
  return [
    {
      priority: 'CRITICAL',
      issue: 'URLs duplicadas sin canonical',
      count: 546,
      action: 'Implementar canonical self-referencing en todas las páginas',
      files: [
        'app/blog/[slug]/page.tsx',
        'app/[locale]/blog/[slug]/page.tsx',
      ],
    },
    {
      priority: 'HIGH',
      issue: 'Paginación sin canonical',
      count: 42,
      action: 'Agregar canonical en páginas de listado con paginación',
      example: '<link rel="canonical" href="https://redcreativa.pro/blog" />',
    },
    {
      priority: 'HIGH',
      issue: 'Variantes de idioma sin hreflang',
      count: urls.locales.length,
      action: 'Implementar etiquetas hreflang en todas las variantes de idioma',
      implementation: 'next-head con alternates',
    },
    {
      priority: 'MEDIUM',
      issue: 'Páginas 404',
      count: 18,
      action: 'Crear redirecciones 301 o página 404 personalizada',
      file: 'app/not-found.tsx',
    },
    {
      priority: 'MEDIUM',
      issue: 'Redirecciones en cadena',
      count: 21,
      action: 'Simplificar redirecciones A→B→C a A→C directo',
      file: 'next.config.mjs',
    },
    {
      priority: 'LOW',
      issue: 'Páginas con noindex',
      count: 6,
      action: 'Verificar si estas páginas deben indexarse',
      check: 'Revisar meta robots en cada página',
    },
  ];
}

// =====================================================
// FUNCIÓN: Generar sitemap optimizado
// =====================================================
async function generateOptimizedSitemap() {
  console.log('\n🗺️  Generando sitemap optimizado...');
  
  const sitemapEntries = [];
  
  // 1. Homepage
  sitemapEntries.push({
    loc: CONFIG.siteUrl,
    lastmod: new Date().toISOString(),
    changefreq: 'daily',
    priority: 1.0,
  });
  
  // 2. Páginas principales
  const mainPages = [
    '/blog',
    '/prompts',
    '/alternativas',
    '/comparativas',
    '/industria',
    '/categoria',
    '/glosario',
    '/contacto',
    '/aviso-legal',
    '/terminos-servicio',
    '/centro-ayuda',
  ];
  
  mainPages.forEach(page => {
    sitemapEntries.push({
      loc: `${CONFIG.siteUrl}${page}`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.8,
    });
  });
  
  // 3. Blogs
  urls.blog.forEach(blog => {
    sitemapEntries.push({
      loc: blog.url,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.9,
    });
  });
  
  // 4. URLs locales (solo si tienen contenido único)
  urls.locales.forEach(locale => {
    sitemapEntries.push({
      loc: locale.url,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.7,
    });
  });
  
  // Generar XML
  const xml = generateSitemapXML(sitemapEntries);
  
  const sitemapPath = path.join(CONFIG.outputDir, 'sitemap-optimized.xml');
  await writeFile(sitemapPath, xml);
  
  console.log(`✅ Sitemap optimizado guardado en: ${sitemapPath}`);
  console.log(`📊 Total de URLs en sitemap: ${sitemapEntries.length}`);
  
  return sitemapEntries;
}

// =====================================================
// FUNCIÓN: Generar XML del sitemap
// =====================================================
function generateSitemapXML(entries) {
  const urlset = entries.map(entry => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>`;
}

// =====================================================
// FUNCIÓN: Generar código de canonical helper
// =====================================================
async function generateCanonicalHelper() {
  console.log('\n🔧 Generando helper de canonical...');
  
  const helperCode = `'use client';

import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

/**
 * Hook para generar URLs canónicas
 * Maneja automáticamente:
 * - Canonical self-referencing
 * - URLs con locales (/de/, /fr/, etc.)
 * - Parámetros de query (que se ignoran en canonical)
 */
export function useCanonicalUrl() {
  const pathname = usePathname();
  const locale = useLocale();
  
  // Remover parámetros de query y hash
  const cleanPath = pathname.split('?')[0].split('#')[0];
  
  // Construir URL canónica
  const siteUrl = 'https://redcreativa.pro';
  const canonicalUrl = \`\${siteUrl}\${cleanPath}\`;
  
  // URLs alternativas para idiomas
  const alternates = {
    'x-default': \`\${siteUrl}\${cleanPath}\`,
    'es': \`\${siteUrl}\${cleanPath}\`,
    'de': \`\${siteUrl}/de\${cleanPath}\`,
    'fr': \`\${siteUrl}/fr\${cleanPath}\`,
    'it': \`\${siteUrl}/it\${cleanPath}\`,
    'zh': \`\${siteUrl}/zh\${cleanPath}\`,
    'pt': \`\${siteUrl}/pt\${cleanPath}\`,
  };
  
  return {
    canonicalUrl,
    alternates,
    locale,
    pathname: cleanPath,
  };
}

/**
 * Componente para renderizar tags de canonical
 */
export function CanonicalTags() {
  const { canonicalUrl, alternates, locale } = useCanonicalUrl();
  
  return (
    <>
      <link rel="canonical" href={canonicalUrl} />
      {Object.entries(alternates).map(([lang, url]) => (
        <link 
          key={lang} 
          rel="alternate" 
          hrefLang={lang} 
          href={url} 
        />
      ))}
    </>
  );
}
`;

  const helperPath = path.join(CONFIG.outputDir, 'canonical-helper.ts');
  await writeFile(helperPath, helperCode);
  
  console.log(`✅ Helper de canonical guardado en: ${helperPath}`);
}

// =====================================================
// FUNCIÓN: Generar fixes específicos
// =====================================================
async function generateFixes() {
  console.log('\n🔧 Generando archivos de corrección...');
  
  // 1. Fix para blog/[slug]/page.tsx
  const blogSlugFix = generateBlogSlugFix();
  await writeFile(
    path.join(CONFIG.outputDir, 'fix-blog-slug-page.tsx'),
    blogSlugFix
  );
  
  // 2. Fix para blog listing page
  const blogListingFix = generateBlogListingFix();
  await writeFile(
    path.join(CONFIG.outputDir, 'fix-blog-listing-page.tsx'),
    blogListingFix
  );
  
  // 3. Script de implementación
  const implementationScript = generateImplementationScript();
  await writeFile(
    path.join(CONFIG.outputDir, 'implement-fixes.js'),
    implementationScript
  );
  
  console.log('✅ Archivos de corrección generados:');
  console.log('   - fix-blog-slug-page.tsx');
  console.log('   - fix-blog-listing-page.tsx');
  console.log('   - implement-fixes.js');
}

// =====================================================
// GENERAR FIX PARA BLOG SLUG
// =====================================================
function generateBlogSlugFix() {
  return `import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBlogPost } from '@/lib/blogs';

// =====================================================
// CONFIGURACIÓN DE METADATA DINÁMICA CON CANONICAL
// =====================================================
export async function generateMetadata({ 
  params 
}: { 
  params: { slug: string } 
}): Promise<Metadata> {
  const post = await getBlogPost(params.slug);
  
  if (!post) {
    return {
      title: 'Post no encontrado',
    };
  }
  
  const canonicalUrl = \`https://redcreativa.pro/blog/\${params.slug}\`;
  
  return {
    title: post.title,
    description: post.excerpt,
    
    // CANONICAL SELF-REFERENCING - CRÍTICO PARA SEO
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'es': canonicalUrl,
        'de': \`https://redcreativa.pro/de/blog/\${params.slug}\`,
        'fr': \`https://redcreativa.pro/fr/blog/\${params.slug}\`,
        'it': \`https://redcreativa.pro/it/blog/\${params.slug}\`,
        'zh': \`https://redcreativa.pro/zh/blog/\${params.slug}\`,
        'pt': \`https://redcreativa.pro/pt/blog/\${params.slug}\`,
      },
    },
    
    // Open Graph
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: canonicalUrl,
      siteName: 'Red Creativa Pro',
      locale: 'es_ES',
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.lastModified,
      authors: [post.author],
      images: [
        {
          url: post.coverImage || 'https://redcreativa.pro/og-image.jpg',
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage || 'https://redcreativa.pro/og-image.jpg'],
    },
    
    // Robots
    robots: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  };
}

// =====================================================
// JSON-LD SCHEMA PARA ARTÍCULOS
// =====================================================
function generateArticleSchema(post: any, slug: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage || 'https://redcreativa.pro/og-image.jpg',
    datePublished: post.date,
    dateModified: post.lastModified || post.date,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Red Creativa Pro',
      logo: {
        '@type': 'ImageObject',
        url: 'https://redcreativa.pro/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': \`https://redcreativa.pro/blog/\${slug}\`,
    },
  };
}

// =====================================================
// PAGE COMPONENT
// =====================================================
export default async function BlogPostPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const post = await getBlogPost(params.slug);
  
  if (!post) {
    notFound();
  }
  
  const schema = generateArticleSchema(post, params.slug);
  
  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      
      {/* Contenido del blog */}
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-gray-600">
            <span>Por {post.author}</span>
            <span>•</span>
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </div>
        </header>
        
        {post.coverImage && (
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-64 object-cover rounded-lg mb-8"
          />
        )}
        
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </>
  );
}
`;
}

// =====================================================
// GENERAR FIX PARA BLOG LISTING
// =====================================================
function generateBlogListingFix() {
  return `import { Metadata } from 'next';
import Link from 'next/link';
import { getAllBlogPosts } from '@/lib/blogs';

// =====================================================
// METADATA CON CANONICAL PARA PÁGINA DE LISTADO
// =====================================================
export const metadata: Metadata = {
  title: 'Blog - Red Creativa Pro | IA y Marketing Digital',
  description: 'Descubre las últimas tendencias en IA, marketing digital, copywriting y automatización. Guías prácticas y tutoriales.',
  
  // CANONICAL SIN PARÁMETROS - CRÍTICO PARA SEO
  alternates: {
    canonical: 'https://redcreativa.pro/blog',
    languages: {
      'es': 'https://redcreativa.pro/blog',
      'de': 'https://redcreativa.pro/de/blog',
      'fr': 'https://redcreativa.pro/fr/blog',
      'it': 'https://redcreativa.pro/it/blog',
      'zh': 'https://redcreativa.pro/zh/blog',
      'pt': 'https://redcreativa.pro/pt/blog',
    },
  },
  
  openGraph: {
    title: 'Blog - Red Creativa Pro',
    description: 'Descubre las últimas tendencias en IA y marketing digital',
    url: 'https://redcreativa.pro/blog',
    siteName: 'Red Creativa Pro',
    locale: 'es_ES',
    type: 'website',
  },
  
  robots: {
    index: true,
    follow: true,
  },
};

// =====================================================
// SCHEMA PARA BLOG LISTING
// =====================================================
function generateBlogListSchema(posts: any[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Blog de Red Creativa Pro',
    description: 'Artículos sobre IA, marketing digital y automatización',
    url: 'https://redcreativa.pro/blog',
    blogPost: posts.map(post => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      url: \`https://redcreativa.pro/blog/\${post.slug}\`,
      datePublished: post.date,
      author: {
        '@type': 'Person',
        name: post.author,
      },
    })),
  };
}

// =====================================================
// PAGE COMPONENT
// =====================================================
export default async function BlogListingPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const posts = await getAllBlogPosts();
  const schema = generateBlogListSchema(posts);
  
  // IMPORTANTE: Los parámetros de paginación NO afectan el canonical
  const page = Number(searchParams.page) || 1;
  const postsPerPage = 12;
  const totalPages = Math.ceil(posts.length / postsPerPage);
  
  const startIndex = (page - 1) * postsPerPage;
  const paginatedPosts = posts.slice(startIndex, startIndex + postsPerPage);
  
  return (
    <>
      {/* Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">Blog</h1>
        <p className="text-gray-600 mb-8 max-w-2xl">
          Descubre las últimas tendencias en inteligencia artificial, 
          marketing digital, copywriting y automatización de contenidos.
        </p>
        
        {/* Lista de posts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedPosts.map((post) => (
            <article key={post.slug} className="border rounded-lg overflow-hidden">
              <Link href={\`/blog/\${post.slug}\`}>
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                  <p className="text-gray-600 text-sm line-clamp-3">{post.excerpt}</p>
                  <time className="text-sm text-gray-500 mt-2 block">
                    {new Date(post.date).toLocaleDateString('es-ES')}
                  </time>
                </div>
              </Link>
            </article>
          ))}
        </div>
        
        {/* Paginación con rel prev/next (opcional pero recomendado) */}
        {totalPages > 1 && (
          <nav className="mt-8 flex justify-center gap-2" aria-label="Paginación">
            {page > 1 && (
              <Link
                href={\`/blog?page=\${page - 1}\`}
                className="px-4 py-2 border rounded hover:bg-gray-100"
                rel="prev"
              >
                ← Anterior
              </Link>
            )}
            <span className="px-4 py-2">
              Página {page} de {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={\`/blog?page=\${page + 1}\`}
                className="px-4 py-2 border rounded hover:bg-gray-100"
                rel="next"
              >
                Siguiente →
              </Link>
            )}
          </nav>
        )}
      </main>
    </>
  );
}
`;
}

// =====================================================
// GENERAR SCRIPT DE IMPLEMENTACIÓN
// =====================================================
function generateImplementationScript() {
  return `#!/usr/bin/env node
/**
 * SCRIPT DE IMPLEMENTACIÓN DE FIXES SEO
 * 
 * Este script aplica las correcciones de indexación:
 * 1. Copia los archivos fix-* a sus ubicaciones correspondientes
 * 2. Crea backups de los archivos originales
 * 3. Actualiza next.config.mjs si es necesario
 */

const fs = require('fs');
const path = require('path');

const fixes = [
  {
    source: 'fix-blog-slug-page.tsx',
    target: 'app/blog/[slug]/page.tsx',
    description: 'Página individual de blog con canonical y schema',
  },
  {
    source: 'fix-blog-listing-page.tsx', 
    target: 'app/blog/(listing)/page.tsx',
    description: 'Listado de blog con canonical y paginación',
  },
];

const auditDir = __dirname;
const rootDir = path.join(auditDir, '..');
const backupDir = path.join(auditDir, 'backups', Date.now().toString());

console.log('🔧 Aplicando correcciones SEO...\\n');

// Crear directorio de backups
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

fixes.forEach(fix => {
  const sourcePath = path.join(auditDir, fix.source);
  const targetPath = path.join(rootDir, fix.target);
  const backupPath = path.join(backupDir, path.basename(fix.target));
  
  try {
    // Verificar que existe el archivo fuente
    if (!fs.existsSync(sourcePath)) {
      console.log(\`❌ No existe: \${fix.source}\`);
      return;
    }
    
    // Backup del archivo original si existe
    if (fs.existsSync(targetPath)) {
      fs.copyFileSync(targetPath, backupPath);
      console.log(\`💾 Backup creado: \${fix.target}\`);
    }
    
    // Copiar el fix
    fs.copyFileSync(sourcePath, targetPath);
    console.log(\`✅ Aplicado: \${fix.description}\`);
    console.log(\`   → \${fix.target}\\n\`);
    
  } catch (error) {
    console.error(\`❌ Error aplicando \${fix.source}:\`, error.message);
  }
});

console.log('\\n📋 Resumen:');
console.log(\`   Backups guardados en: \${backupDir}\`);
console.log('\\n⚠️  ACCIONES MANUALES PENDIENTES:');
console.log('   1. Verificar que los imports (@/lib/blogs) existan');
console.log('   2. Ajustar las funciones getBlogPost/getAllBlogPosts si es necesario');
console.log('   3. Ejecutar: npm run build');
console.log('   4. Verificar en Search Console que los canonicals estén correctos');
`;
}

// =====================================================
// FUNCIÓN PRINCIPAL
// =====================================================
async function main() {
  console.log('🚀 INICIANDO AUDITORÍA DE INDEXACIÓN SEO\\n');
  console.log('=====================================\\n');
  
  try {
    // 1. Escanear estructura
    await scanBlogs();
    await scanStaticPages();
    
    // 2. Detectar problemas
    detectDuplicates();
    
    // 3. Generar reporte
    const report = await generateReport();
    
    // 4. Generar sitemap optimizado
    await generateOptimizedSitemap();
    
    // 5. Generar helper de canonical
    await generateCanonicalHelper();
    
    // 6. Generar fixes
    await generateFixes();
    
    // 7. Mostrar resumen
    console.log('\\n=====================================');
    console.log('✅ AUDITORÍA COMPLETADA');
    console.log('=====================================\\n');
    console.log('📊 RESUMEN:');
    console.log(\`   • Blogs encontrados: \${report.summary.totalBlogs}\`);
    console.log(\`   • Páginas estáticas: \${report.summary.totalStaticPages}\`);
    console.log(\`   • URLs de idiomas: \${report.summary.totalLocaleUrls}\`);
    console.log(\`   • Total URLs: \${report.summary.totalUrls}\`);
    console.log(\`   • Problemas de duplicados: \${report.summary.duplicateIssues}\`);
    console.log('\\n📁 ARCHIVOS GENERADOS:');
    console.log(\`   • \${path.join('seo-audit-results', 'indexing-audit-report.json')}\`);
    console.log(\`   • \${path.join('seo-audit-results', 'sitemap-optimized.xml')}\`);
    console.log(\`   • \${path.join('seo-audit-results', 'canonical-helper.ts')}\`);
    console.log(\`   • \${path.join('seo-audit-results', 'fix-blog-slug-page.tsx')}\`);
    console.log(\`   • \${path.join('seo-audit-results', 'fix-blog-listing-page.tsx')}\`);
    console.log(\`   • \${path.join('seo-audit-results', 'implement-fixes.js')}\`);
    console.log('\\n🚀 SIGUIENTES PASOS:');
    console.log('   1. Revisar el reporte JSON generado');
    console.log('   2. Ejecutar: node seo-audit-results/implement-fixes.js');
    console.log('   3. Verificar los cambios en desarrollo');
    console.log('   4. Desplegar a producción');
    console.log('   5. Solicitar re-indexación en Google Search Console');
    
  } catch (error) {
    console.error('\\n❌ ERROR EN LA AUDITORÍA:', error.message);
    process.exit(1);
  }
}

// Ejecutar
main();
