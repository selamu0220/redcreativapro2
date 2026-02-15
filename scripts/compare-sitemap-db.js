#!/usr/bin/env node
/**
 * Comparador Sitemap vs Supabase
 * Identifica discrepancias entre URLs en sitemap y posts reales en BD
 * 
 * Uso: node scripts/compare-sitemap-db.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuración - Estas variables deben estar en .env.local
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  log('\n' + '='.repeat(70), 'cyan');
  log('  COMPARADOR: SITEMAP vs BASE DE DATOS SUPABASE', 'cyan');
  log('  Identificación de URLs fantasmas', 'cyan');
  log('='.repeat(70) + '\n', 'cyan');

  // Verificar credenciales
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    log('❌ ERROR: Variables de entorno no configuradas', 'red');
    log('\nPor favor configura:', 'yellow');
    log('  NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co', 'yellow');
    log('  NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key', 'yellow');
    log('\nO ejecuta con:', 'yellow');
    log('  NEXT_PUBLIC_SUPABASE_URL=xxx NEXT_PUBLIC_SUPABASE_ANON_KEY=yyy node scripts/compare-sitemap-db.js\n', 'yellow');
    process.exit(1);
  }

  try {
    // Conectar a Supabase
    log('🔌 Conectando a Supabase...', 'blue');
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Obtener todos los posts de la base de datos
    log('📊 Consultando posts en la base de datos...', 'blue');
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('slug, title, language, published_at, translation_group_id')
      .order('published_at', { ascending: false });

    if (error) {
      log(`❌ Error consultando Supabase: ${error.message}`, 'red');
      throw error;
    }

    log(`✅ ${posts.length} posts encontrados en la base de datos\n`, 'green');

    // Leer URLs del sitemap (si existe el archivo generado por el diagnóstico anterior)
    const reportsDir = path.join(__dirname, '..', 'reports');
    let sitemapUrls = [];
    
    // Intentar leer archivo de URLs OK generado previamente
    const urls200Path = path.join(reportsDir, 'urls-200-ok.txt');
    const urls404Path = path.join(reportsDir, 'urls-404-error.txt');
    
    if (fs.existsSync(urls200Path)) {
      sitemapUrls = fs.readFileSync(urls200Path, 'utf8')
        .split('\n')
        .filter(url => url.trim());
      log(`📄 Cargadas ${sitemapUrls.length} URLs del archivo urls-200-ok.txt`, 'blue');
    }
    
    if (fs.existsSync(urls404Path)) {
      const urls404 = fs.readFileSync(urls404Path, 'utf8')
        .split('\n')
        .filter(url => url.trim());
      log(`📄 Cargadas ${urls404.length} URLs con error 404`, 'blue');
      sitemapUrls = [...sitemapUrls, ...urls404];
    }

    if (sitemapUrls.length === 0) {
      log('\n⚠️  No se encontraron archivos de URLs previos.', 'yellow');
      log('Ejecuta primero: node scripts/seo-diagnostic.js\n', 'yellow');
      
      // De todos modos, mostrar información útil
      log('Mostrando información de la base de datos:\n', 'cyan');
    }

    // Analizar posts por idioma
    const postsByLanguage = {};
    posts.forEach(post => {
      const lang = post.language || 'es';
      if (!postsByLanguage[lang]) postsByLanguage[lang] = [];
      postsByLanguage[lang].push(post);
    });

    log('\n' + '='.repeat(70), 'magenta');
    log('ANÁLISIS DE POSTS POR IDIOMA', 'magenta');
    log('='.repeat(70) + '\n', 'magenta');

    Object.entries(postsByLanguage).forEach(([lang, langPosts]) => {
      log(`${lang.toUpperCase()}: ${langPosts.length} posts`, 'cyan');
    });

    // Análisis de slugs únicos
    const uniqueSlugs = new Set(posts.map(p => p.slug));
    log(`\n📊 Slugs únicos: ${uniqueSlugs.size}`, 'blue');
    log(`📊 Total de registros (incluyendo traducciones): ${posts.length}\n`, 'blue');

    // Si tenemos URLs del sitemap, hacer comparación
    if (sitemapUrls.length > 0) {
      log('\n' + '='.repeat(70), 'red');
      log('COMPARACIÓN SITEMAP vs BASE DE DATOS', 'red');
      log('='.repeat(70) + '\n', 'red');

      const blogUrls = sitemapUrls.filter(url => url.includes('/blog/'));
      const otherUrls = sitemapUrls.filter(url => !url.includes('/blog/'));

      log(`🔗 URLs de blog en sitemap: ${blogUrls.length}`, 'yellow');
      log(`🔗 Otras URLs: ${otherUrls.length}\n`, 'yellow');

      // Extraer slugs del sitemap
      const sitemapSlugs = blogUrls.map(url => {
        const match = url.match(/\/blog\/([^/\?]+)/);
        return match ? match[1] : null;
      }).filter(Boolean);

      // Comparar slugs
      const dbSlugs = new Set(posts.map(p => p.slug));
      const sitemapSlugSet = new Set(sitemapSlugs);

      // Slugs que están en sitemap pero NO en BD (URLs fantasmas)
      const ghostSlugs = [...sitemapSlugSet].filter(slug => !dbSlugs.has(slug));
      
      // Slugs que están en BD pero quizás no en sitemap
      const missingFromSitemap = [...dbSlugs].filter(slug => !sitemapSlugSet.has(slug));

      log(`❌ URLs FANTASMAS (en sitemap, no en BD): ${ghostSlugs.length}`, 'red');
      log(`✓ Posts en BD pero no verificados: ${missingFromSitemap.length}\n`, 'blue');

      if (ghostSlugs.length > 0) {
        log('URLs FANTASMAS (primeros 20):', 'red');
        ghostSlugs.slice(0, 20).forEach(slug => {
          log(`  - /blog/${slug}`, 'red');
        });
        if (ghostSlugs.length > 20) {
          log(`  ... y ${ghostSlugs.length - 20} más`, 'red');
        }
        console.log('');
      }

      // Guardar reporte
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const comparisonReport = {
        timestamp,
        stats: {
          totalPostsInDB: posts.length,
          uniqueSlugsInDB: uniqueSlugs.size,
          urlsInSitemap: sitemapUrls.length,
          blogUrlsInSitemap: blogUrls.length,
          ghostUrls: ghostSlugs.length,
          potentiallyMissing: missingFromSitemap.length
        },
        ghostSlugs,
        potentiallyMissing,
        postsByLanguage: Object.fromEntries(
          Object.entries(postsByLanguage).map(([k, v]) => [k, v.length])
        ),
        allPosts: posts.map(p => ({
          slug: p.slug,
          title: p.title,
          language: p.language,
          published_at: p.published_at
        }))
      };

      const reportPath = path.join(reportsDir, `db-comparison-${timestamp}.json`);
      fs.writeFileSync(reportPath, JSON.stringify(comparisonReport, null, 2));

      // Guardar lista de URLs fantasmas
      const ghostPath = path.join(reportsDir, 'ghost-urls.txt');
      fs.writeFileSync(ghostPath, ghostSlugs.map(s => `/blog/${s}`).join('\n'));

      log(`\n✅ Reporte guardado en: ${reportPath}`, 'green');
      log(`✅ Lista de URLs fantasmas: ${ghostPath}`, 'green');

      // Recomendaciones
      log('\n' + '='.repeat(70), 'yellow');
      log('RECOMENDACIONES INMEDIATAS', 'yellow');
      log('='.repeat(70) + '\n', 'yellow');

      if (ghostSlugs.length > 0) {
        log(`🚨 CRÍTICO: Tienes ${ghostSlugs.length} URLs que no existen en tu base de datos`, 'red');
        log('   pero están en el sitemap enviado a Google.', 'red');
        log('\n   Acciones:', 'yellow');
        log('   1. Eliminar estas URLs del sitemap inmediatamente', 'yellow');
        log('   2. O crear el contenido real para estas URLs', 'yellow');
        log('   3. Generar redirecciones 301 si las URLs cambiaron\n', 'yellow');
      }

      if (posts.length === 0) {
        log('🚨 CRÍTICO: No hay posts en la base de datos', 'red');
        log('   Tu blog está vacío pero el sitemap tiene URLs.', 'red');
        log('\n   Solución:', 'yellow');
        log('   - Crear posts reales en Supabase', 'yellow');
        log('   - O generar un sitemap vacío mientras creates contenido\n', 'yellow');
      }

      if (posts.length > 0 && ghostSlugs.length === 0) {
        log('✅ Excelente: Todas las URLs del sitemap existen en la base de datos', 'green');
        log('   El problema de indexación está en otro lugar.\n', 'green');
      }
    }

    // Mostrar muestra de posts existentes
    log('\n' + '='.repeat(70), 'cyan');
    log('MUESTRA DE POSTS EXISTENTES (últimos 10)', 'cyan');
    log('='.repeat(70) + '\n', 'cyan');

    posts.slice(0, 10).forEach(post => {
      const lang = post.language || 'es';
      const prefix = lang === 'es' ? '' : `/${lang}`;
      log(`${prefix}/blog/${post.slug}`, 'green');
      log(`  Título: ${post.title?.substring(0, 60)}...`, 'reset');
      log(`  Idioma: ${lang} | Fecha: ${post.published_at?.split('T')[0]}\n`, 'reset');
    });

    log('\n' + '='.repeat(70), 'green');
    log('Análisis completado ✓', 'green');
    log('='.repeat(70) + '\n', 'green');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

main();
