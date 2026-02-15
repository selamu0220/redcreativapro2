#!/usr/bin/env node
/**
 * Generador de Sitemap desde Supabase
 * Crea un sitemap.xml limpio solo con URLs que existen en la BD
 * 
 * Uso: node scripts/generate-sitemap-from-db.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://redcreativa.pro';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function generateSitemapXml(urls) {
  const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

  const xmlFooter = '</urlset>';

  const urlEntries = urls.map(url => {
    const priority = url.priority || 0.7;
    const changefreq = url.changefreq || 'weekly';
    const lastmod = url.lastmod || new Date().toISOString();

    let entry = `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>`;

    // Añadir alternates si existen
    if (url.alternates && url.alternates.length > 0) {
      url.alternates.forEach(alt => {
        entry += `
    <xhtml:link rel="alternate" hreflang="${alt.lang}" href="${alt.href}" />`;
      });
    }

    entry += `
  </url>`;
    return entry;
  }).join('\n');

  return xmlHeader + urlEntries + '\n' + xmlFooter;
}

async function main() {
  log('\n' + '='.repeat(70), 'cyan');
  log('  GENERADOR DE SITEMAP DESDE SUPABASE', 'cyan');
  log('  Crea sitemap.xml limpio con URLs reales', 'cyan');
  log('='.repeat(70) + '\n', 'cyan');

  // Verificar credenciales
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    log('❌ ERROR: Variables de entorno no configuradas', 'red');
    log('\nConfigura:', 'yellow');
    log('  NEXT_PUBLIC_SUPABASE_URL=xxx', 'yellow');
    log('  NEXT_PUBLIC_SUPABASE_ANON_KEY=yyy\n', 'yellow');
    process.exit(1);
  }

  try {
    // Conectar a Supabase
    log('🔌 Conectando a Supabase...', 'blue');
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Obtener posts
    log('📊 Consultando posts publicados...', 'blue');
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('slug, title, language, published_at, updated_at')
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false });

    if (error) {
      throw error;
    }

    log(`✅ ${posts.length} posts publicados encontrados\n`, 'green');

    // Construir URLs
    const urls = [];

    // Homepage
    urls.push({
      loc: SITE_URL,
      priority: 1.0,
      changefreq: 'daily',
      lastmod: new Date().toISOString()
    });

    // Páginas principales
    const staticPages = [
      { path: '/blog', priority: 0.9, changefreq: 'daily' },
      { path: '/prompts', priority: 0.8, changefreq: 'weekly' },
      { path: '/planes', priority: 0.8, changefreq: 'weekly' },
      { path: '/escritor-ia', priority: 0.9, changefreq: 'weekly' },
      { path: '/herramientas', priority: 0.8, changefreq: 'weekly' },
      { path: '/contacto', priority: 0.6, changefreq: 'monthly' },
      { path: '/preguntas-frecuentes', priority: 0.7, changefreq: 'monthly' },
      { path: '/politica-privacidad', priority: 0.5, changefreq: 'monthly' },
      { path: '/terminos-servicio', priority: 0.5, changefreq: 'monthly' },
      { path: '/aviso-legal', priority: 0.5, changefreq: 'monthly' }
    ];

    staticPages.forEach(page => {
      urls.push({
        loc: `${SITE_URL}${page.path}`,
        priority: page.priority,
        changefreq: page.changefreq,
        lastmod: new Date().toISOString()
      });
    });

    // Posts del blog
    posts.forEach(post => {
      const lang = post.language || 'es';
      const prefix = lang === 'es' ? '' : `/${lang}`;
      const lastmod = post.updated_at || post.published_at;

      urls.push({
        loc: `${SITE_URL}${prefix}/blog/${post.slug}`,
        priority: 0.8,
        changefreq: 'weekly',
        lastmod: lastmod
      });
    });

    log(`📋 Total de URLs generadas: ${urls.length}`, 'cyan');
    log(`  - Homepage: 1`, 'reset');
    log(`  - Páginas estáticas: ${staticPages.length}`, 'reset');
    log(`  - Posts de blog: ${posts.length}\n`, 'reset');

    // Generar XML
    const sitemapXml = generateSitemapXml(urls);

    // Guardar archivo
    const publicDir = path.join(__dirname, '..', 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const sitemapPath = path.join(publicDir, 'sitemap-clean.xml');
    fs.writeFileSync(sitemapPath, sitemapXml);

    log(`✅ Sitemap generado: ${sitemapPath}`, 'green');
    log(`   Tamaño: ${(sitemapXml.length / 1024).toFixed(2)} KB`, 'green');
    log(`   URLs: ${urls.length}\n`, 'green');

    // También generar lista simple para revisión
    const urlsList = urls.map(u => u.loc).join('\n');
    const reportsDir = path.join(__dirname, '..', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const listPath = path.join(reportsDir, 'sitemap-urls-clean.txt');
    fs.writeFileSync(listPath, urlsList);

    log(`✅ Lista de URLs: ${listPath}\n`, 'green');

    // Instrucciones
    log('='.repeat(70), 'yellow');
    log('INSTRUCCIONES PARA IMPLEMENTAR', 'yellow');
    log('='.repeat(70) + '\n', 'yellow');

    log('1. Revisar el sitemap generado:', 'cyan');
    log(`   ${sitemapPath}\n`, 'reset');

    log('2. Si todo está correcto, reemplazar el sitemap actual:', 'cyan');
    log('   - Copiar sitemap-clean.xml a sitemap.xml', 'reset');
    log('   - O configurar next-sitemap para usar este archivo\n', 'reset');

    log('3. Enviar a Google Search Console:', 'cyan');
    log('   - Ve a Sitemaps en GSC', 'reset');
    log(`   - Envía: ${SITE_URL}/sitemap-clean.xml`, 'reset');
    log('   - O reemplaza el sitemap existente\n', 'reset');

    log('4. Configurar redirección en next.config.mjs:', 'cyan');
    log('   Para redirigir de www a non-www (o viceversa):\n', 'reset');

    log('async redirects() {', 'blue');
    log('  return [', 'blue');
    log('    {', 'blue');
    log('      source: "/:path*",', 'blue');
    log('      has: [{ type: "host", value: "www.redcreativa.pro" }],', 'blue');
    log('      destination: "https://redcreativa.pro/:path*",', 'blue');
    log('      permanent: true', 'blue');
    log('    }', 'blue');
    log('  ];', 'blue');
    log('}\n', 'blue');

    log('5. Para implementación automática en build:', 'cyan');
    log('   Agrega este script a package.json:', 'reset');
    log('   "postbuild": "node scripts/generate-sitemap-from-db.js"\n', 'reset');

    log('='.repeat(70), 'green');
    log('¡Sitemap limpio generado exitosamente! ✓', 'green');
    log('='.repeat(70) + '\n', 'green');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

main();
