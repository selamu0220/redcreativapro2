/**
 * Script para forzar indexación de páginas en Google Search Console
 * Uso: node force-indexing.js [urls...]
 * Ejemplo: node force-indexing.js https://redcreativa.pro/prompts/email-b2b
 */

const URLS_TO_INDEX = [
  'https://redcreativa.pro/prompts/email-b2b',
  'https://redcreativa.pro/prompts/anuncios-facebook',
  'https://redcreativa.pro/prompts/linkedin-posts',
  'https://redcreativa.pro/prompts/titulares-blog',
  'https://redcreativa.pro/prompts/seo-meta-descriptions',
  'https://redcreativa.pro/prompts/guiones-video',
  'https://redcreativa.pro/prompts/landing-page',
  'https://redcreativa.pro/prompts/cold-outreach',
  'https://redcreativa.pro/prompts/descripcion-producto-ecommerce',
  'https://redcreativa.pro/prompts/twitter-hilos',
];

async function submitToIndexNow(urls) {
  const endpoint = 'https://api.indexnow.org/indexnow';
  const host = 'redcreativa.pro';
  const key = process.env.INDEXNOW_KEY || 'redcreativa-index-key';
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        host,
        key,
        urlList: urls,
      }),
    });
    
    if (response.ok) {
      console.log('✅ URLs enviadas a IndexNow:', urls.length);
      return true;
    } else {
      console.log('⚠️ IndexNow respondió:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Error IndexNow:', error.message);
    return false;
  }
}

async function pingSitemap() {
  const sitemapUrl = 'https://redcreativa.pro/sitemap.xml';
  const searchEngines = [
    `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
    `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
  ];
  
  for (const endpoint of searchEngines) {
    try {
      const response = await fetch(endpoint);
      if (response.ok) {
        console.log(`✅ Sitemap enviado a ${new URL(endpoint).hostname}`);
      }
    } catch (error) {
      console.log(`⚠️ Error enviando a ${endpoint}:`, error.message);
    }
  }
}

async function main() {
  console.log('🚀 Forzando indexación de nuevas páginas...\n');
  
  // 1. Submit a IndexNow
  console.log('📤 Enviando a IndexNow...');
  await submitToIndexNow(URLS_TO_INDEX);
  
  // 2. Ping sitemap
  console.log('\n📤 Enviando sitemap a buscadores...');
  await pingSitemap();
  
  console.log('\n✨ Proceso completado');
  console.log('\n📋 URLs enviadas:');
  URLS_TO_INDEX.forEach((url, i) => {
    console.log(`  ${i + 1}. ${url}`);
  });
  
  console.log('\n💡 Próximos pasos:');
  console.log('  1. Ve a Google Search Console → URL Inspection');
  console.log('  2. Solicita indexación manual para cada URL');
  console.log('  3. Monitorea el estado en "Cobertura" dentro de 24-48h');
}

// Si se pasan URLs por argumento, usar esas
const args = process.argv.slice(2);
if (args.length > 0) {
  URLS_TO_INDEX.length = 0;
  URLS_TO_INDEX.push(...args);
}

main().catch(console.error);
