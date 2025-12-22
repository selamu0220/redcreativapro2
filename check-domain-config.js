#!/usr/bin/env node

/**
 * Script para verificar la configuración actual del dominio
 * y ayudar a decidir qué configuración usar
 */

const https = require('https');

console.log('🔍 Verificando configuración actual del dominio...\n');

function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DomainChecker/1.0)'
      }
    }, (res) => {
      resolve({
        url,
        statusCode: res.statusCode,
        location: res.headers.location,
        contentType: res.headers['content-type']
      });
    }).on('error', (err) => {
      resolve({
        url,
        error: err.message
      });
    });
  });
}

async function main() {
  console.log('📡 Verificando redirecciones...\n');
  
  // Verificar ambas versiones
  const withoutWww = await checkUrl('https://redcreativa.pro');
  const withWww = await checkUrl('https://www.redcreativa.pro');
  
  console.log('1️⃣  Sin www (redcreativa.pro):');
  console.log(`   Status: ${withoutWww.statusCode}`);
  if (withoutWww.location) {
    console.log(`   Redirige a: ${withoutWww.location}`);
  }
  console.log('');
  
  console.log('2️⃣  Con www (www.redcreativa.pro):');
  console.log(`   Status: ${withWww.statusCode}`);
  if (withWww.location) {
    console.log(`   Redirige a: ${withWww.location}`);
  }
  console.log('');
  
  // Analizar y recomendar
  console.log('📊 Análisis:\n');
  
  if (withoutWww.statusCode === 200 && withWww.statusCode >= 300 && withWww.statusCode < 400) {
    console.log('✅ CONFIGURACIÓN CORRECTA DETECTADA:');
    console.log('   - redcreativa.pro es el dominio principal (200 OK)');
    console.log('   - www.redcreativa.pro redirige al principal');
    console.log('');
    console.log('📝 Acción requerida:');
    console.log('   1. Asegúrate de que tu .env tenga:');
    console.log('      NEXT_PUBLIC_SITE_URL=https://redcreativa.pro');
    console.log('   2. El sitemap y robots.txt ya están configurados correctamente');
    console.log('   3. Redeploy tu aplicación en Vercel');
    console.log('');
  } else if (withWww.statusCode === 200 && withoutWww.statusCode >= 300 && withoutWww.statusCode < 400) {
    console.log('⚠️  CONFIGURACIÓN INVERTIDA DETECTADA:');
    console.log('   - www.redcreativa.pro es el dominio principal (200 OK)');
    console.log('   - redcreativa.pro redirige a www');
    console.log('');
    console.log('📝 Tienes 2 opciones:\n');
    console.log('   OPCIÓN A (Recomendada): Cambiar a dominio sin www');
    console.log('   1. Ve a Vercel Dashboard → Settings → Domains');
    console.log('   2. Configura redcreativa.pro como dominio principal');
    console.log('   3. Configura www.redcreativa.pro para redirigir a redcreativa.pro');
    console.log('   4. Asegúrate de que tu .env tenga:');
    console.log('      NEXT_PUBLIC_SITE_URL=https://redcreativa.pro');
    console.log('   5. Redeploy tu aplicación');
    console.log('');
    console.log('   OPCIÓN B: Mantener www como principal');
    console.log('   1. Actualiza tu .env:');
    console.log('      NEXT_PUBLIC_SITE_URL=https://www.redcreativa.pro');
    console.log('   2. Redeploy tu aplicación');
    console.log('   3. El sitemap y robots.txt se actualizarán automáticamente');
    console.log('');
  } else if (withoutWww.statusCode === 200 && withWww.statusCode === 200) {
    console.log('⚠️  PROBLEMA: Ambos dominios responden con 200 OK');
    console.log('   Esto puede causar contenido duplicado en Google');
    console.log('');
    console.log('📝 Acción requerida:');
    console.log('   1. Ve a Vercel Dashboard → Settings → Domains');
    console.log('   2. Elige UNO como dominio principal');
    console.log('   3. Configura el otro para redirigir al principal');
    console.log('   4. Actualiza NEXT_PUBLIC_SITE_URL en tu .env');
    console.log('   5. Redeploy tu aplicación');
    console.log('');
  } else {
    console.log('❌ ERROR: No se pudo determinar la configuración');
    console.log('   Verifica que tu sitio esté desplegado correctamente en Vercel');
    console.log('');
  }
  
  console.log('🔗 Enlaces útiles:');
  console.log('   - Vercel Dashboard: https://vercel.com/dashboard');
  console.log('   - Google Search Console: https://search.google.com/search-console');
  console.log('   - Documentación: Ver SOLUCION_SITEMAP_GOOGLE.md');
  console.log('');
}

main();
