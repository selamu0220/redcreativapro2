const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kkdjorivsmewtzflgcyw.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZGpvcml2c21ld3R6ZmxnY3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMTM1MzcsImV4cCI6MjA4NDc4OTUzN30.IcDUAXQV5VVCemNa8wS-y2Tdf52mVuvL5NGlJkEeTwE';
const SITE_URL = 'https://redcreativa.pro';

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

async function main() {
  log('\n' + '='.repeat(70), 'cyan');
  log('  GENERANDO SITEMAP DESDE BASE DE DATOS REAL', 'cyan');
  log('='.repeat(70) + '\n', 'cyan');

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    log('🔌 Conectando a Supabase...', 'blue');
    
    // Obtener todos los posts publicados
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('slug, title, language, published_at, updated_at, status')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) {
      log(`❌ Error: ${error.message}`, 'red');
      throw error;
    }

    log(`✅ ${posts.length} posts publicados encontrados\n`, 'green');

    // Agrupar por idioma
    const postsByLang = {};
    posts.forEach(post => {
      const lang = post.language || 'es';
      if (!postsByLang[lang]) postsByLang[lang] = [];
      postsByLang[lang].push(post);
    });

    // Mostrar distribución
    log('Distribución por idioma:', 'cyan');
    Object.entries(postsByLang).forEach(([lang, posts]) => {
      log(`  ${lang.toUpperCase()}: ${posts.length} posts`, 'blue');
    });

    // Generar sitemap
    const urls = [];

    // Homepage
    urls.push({
      loc: SITE_URL,
      priority: 1.0,
      changefreq: 'daily',
      lastmod: new Date().toISOString().split('T')[0]
    });

    // Páginas estáticas principales
    const staticPages = [
      { path: '/blog', priority: 0.9 },
      { path: '/prompts', priority: 0.8 },
      { path: '/planes', priority: 0.8 },
      { path: '/escritor-ia', priority: 0.9 },
      { path: '/herramientas', priority: 0.8 },
      { path: '/contacto', priority: 0.6 },
      { path: '/preguntas-frecuentes', priority: 0.7 },
      { path: '/politica-privacidad', priority: 0.5 },
      { path: '/terminos-servicio', priority: 0.5 },
      { path: '/aviso-legal', priority: 0.5 }
    ];

    staticPages.forEach(page => {
      urls.push({
        loc: `${SITE_URL}${page.path}`,
        priority: page.priority,
        changefreq: 'weekly',
        lastmod: new Date().toISOString().split('T')[0]
      });
    });

    // Posts de blog en TODOS los idiomas
    Object.entries(postsByLang).forEach(([lang, langPosts]) => {
      const prefix = lang === 'es' ? '' : `/${lang}`;
      langPosts.forEach(post => {
        urls.push({
          loc: `${SITE_URL}${prefix}/blog/${post.slug}`,
          priority: 0.8,
          changefreq: 'weekly',
          lastmod: (post.updated_at || post.published_at).split('T')[0]
        });
      });
    });

    // Generar XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    urls.forEach(url => {
      xml += `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>
`;
    });

    xml += '</urlset>';

    // Guardar
    const publicDir = path.join(__dirname, '..', 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);

    const totalPosts = Object.values(postsByLang).reduce((acc, arr) => acc + arr.length, 0);
    
    log(`\n✅ Sitemap generado: ${urls.length} URLs`, 'green');
    log(`   - Homepage: 1`, 'reset');
    log(`   - Páginas estáticas: ${staticPages.length}`, 'reset');
    log(`   - Posts de blog: ${totalPosts} (en ${Object.keys(postsByLang).length} idiomas)`, 'reset');
    log(`\n📄 Archivo: public/sitemap.xml\n`, 'cyan');

    // Crear directorio reports si no existe
    const reportsDir = path.join(__dirname, '..', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    // Guardar lista de todos los posts
    let allPostsList = '';
    Object.entries(postsByLang).forEach(([lang, langPosts]) => {
      const prefix = lang === 'es' ? '' : `/${lang}`;
      langPosts.forEach(p => {
        allPostsList += `${prefix}/blog/${p.slug}\n`;
      });
    });
    fs.writeFileSync(path.join(reportsDir, 'blog-posts-real.txt'), allPostsList);

    log('✅ Lista de posts guardada en: reports/blog-posts-real.txt', 'green');

    // Mostrar primeros 10 posts de cada idioma
    log('\nMuestra de posts por idioma:', 'cyan');
    Object.entries(postsByLang).forEach(([lang, langPosts]) => {
      log(`\n  ${lang.toUpperCase()}:`, 'blue');
      langPosts.slice(0, 5).forEach((post, i) => {
        const prefix = lang === 'es' ? '' : `/${lang}`;
        log(`    ${i + 1}. ${prefix}/blog/${post.slug}`, 'green');
      });
      if (langPosts.length > 5) {
        log(`    ... y ${langPosts.length - 5} más`, 'reset');
      }
    });

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

main();
