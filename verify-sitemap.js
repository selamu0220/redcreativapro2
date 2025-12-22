#!/usr/bin/env node

/**
 * Script para verificar la configuración del sitemap
 * Verifica que:
 * 1. El sitemap se genera correctamente
 * 2. Todas las URLs usan el dominio correcto (sin www)
 * 3. No hay URLs duplicadas
 * 4. Las prioridades están bien configuradas
 */

const https = require('https');
const http = require('http');

const DOMAIN = 'https://redcreativa.pro';
const SITEMAP_URL = `${DOMAIN}/sitemap.xml`;

console.log('🔍 Verificando configuración del sitemap...\n');

// Función para hacer peticiones HTTP
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SitemapVerifier/1.0)'
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function verifySitemap() {
  try {
    console.log(`📡 Verificando acceso a: ${SITEMAP_URL}`);
    
    const response = await fetchUrl(SITEMAP_URL);
    
    console.log(`✅ Status Code: ${response.statusCode}`);
    console.log(`📋 Content-Type: ${response.headers['content-type']}`);
    console.log(`📦 Content-Length: ${response.headers['content-length']} bytes\n`);
    
    if (response.statusCode !== 200) {
      console.error(`❌ Error: El sitemap no está accesible (Status: ${response.statusCode})`);
      process.exit(1);
    }
    
    // Verificar que es XML válido
    if (!response.headers['content-type']?.includes('xml')) {
      console.warn(`⚠️  Advertencia: Content-Type no es XML: ${response.headers['content-type']}`);
    }
    
    // Analizar el contenido del sitemap
    const sitemapContent = response.body;
    
    // Contar URLs
    const urlMatches = sitemapContent.match(/<url>/g);
    const urlCount = urlMatches ? urlMatches.length : 0;
    console.log(`📊 Total de URLs en el sitemap: ${urlCount}`);
    
    // Verificar que no hay URLs con www
    const wwwUrls = sitemapContent.match(/https:\/\/www\.redcreativa\.pro/g);
    if (wwwUrls && wwwUrls.length > 0) {
      console.error(`❌ Error: Se encontraron ${wwwUrls.length} URLs con www (deben ser sin www)`);
      process.exit(1);
    } else {
      console.log('✅ Todas las URLs usan el dominio correcto (sin www)');
    }
    
    // Verificar que todas las URLs usan HTTPS
    const httpUrls = sitemapContent.match(/<loc>http:\/\//g);
    if (httpUrls && httpUrls.length > 0) {
      console.error(`❌ Error: Se encontraron ${httpUrls.length} URLs con HTTP (deben ser HTTPS)`);
      process.exit(1);
    } else {
      console.log('✅ Todas las URLs usan HTTPS');
    }
    
    // Extraer todas las URLs
    const urlRegex = /<loc>(.*?)<\/loc>/g;
    const urls = [];
    let match;
    while ((match = urlRegex.exec(sitemapContent)) !== null) {
      urls.push(match[1]);
    }
    
    // Verificar URLs duplicadas
    const uniqueUrls = new Set(urls);
    if (urls.length !== uniqueUrls.size) {
      console.error(`❌ Error: Se encontraron URLs duplicadas (${urls.length} total, ${uniqueUrls.size} únicas)`);
      process.exit(1);
    } else {
      console.log('✅ No hay URLs duplicadas');
    }
    
    // Verificar prioridades
    const priorityRegex = /<priority>(.*?)<\/priority>/g;
    const priorities = [];
    while ((match = priorityRegex.exec(sitemapContent)) !== null) {
      priorities.push(parseFloat(match[1]));
    }
    
    const maxPriority = Math.max(...priorities);
    const minPriority = Math.min(...priorities);
    console.log(`📈 Prioridad máxima: ${maxPriority}`);
    console.log(`📉 Prioridad mínima: ${minPriority}`);
    
    if (maxPriority > 1.0 || minPriority < 0.0) {
      console.error('❌ Error: Las prioridades deben estar entre 0.0 y 1.0');
      process.exit(1);
    } else {
      console.log('✅ Todas las prioridades están en el rango correcto');
    }
    
    // Verificar changeFrequency
    const changeFreqRegex = /<changefreq>(.*?)<\/changefreq>/g;
    const validFrequencies = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
    let invalidFreq = false;
    
    while ((match = changeFreqRegex.exec(sitemapContent)) !== null) {
      if (!validFrequencies.includes(match[1])) {
        console.error(`❌ Error: Frecuencia de cambio inválida: ${match[1]}`);
        invalidFreq = true;
      }
    }
    
    if (!invalidFreq) {
      console.log('✅ Todas las frecuencias de cambio son válidas');
    }
    
    console.log('\n✅ Verificación del sitemap completada exitosamente!');
    console.log('\n📝 Próximos pasos:');
    console.log('1. Envía el sitemap a Google Search Console: https://search.google.com/search-console');
    console.log('2. URL del sitemap: https://redcreativa.pro/sitemap.xml');
    console.log('3. Verifica que el dominio www.redcreativa.pro redirija a redcreativa.pro');
    console.log('4. Espera 24-48 horas para que Google procese el sitemap');
    
  } catch (error) {
    console.error('❌ Error al verificar el sitemap:', error.message);
    process.exit(1);
  }
}

// Verificar también robots.txt
async function verifyRobots() {
  try {
    console.log('\n🤖 Verificando robots.txt...');
    const robotsUrl = `${DOMAIN}/robots.txt`;
    const response = await fetchUrl(robotsUrl);
    
    if (response.statusCode !== 200) {
      console.error(`❌ Error: robots.txt no está accesible (Status: ${response.statusCode})`);
      return;
    }
    
    console.log('✅ robots.txt es accesible');
    
    // Verificar que contiene la referencia al sitemap
    if (response.body.includes('sitemap.xml')) {
      console.log('✅ robots.txt contiene referencia al sitemap');
    } else {
      console.warn('⚠️  Advertencia: robots.txt no contiene referencia al sitemap');
    }
    
    // Verificar que no tiene www
    if (response.body.includes('www.redcreativa.pro')) {
      console.error('❌ Error: robots.txt contiene URLs con www');
    } else {
      console.log('✅ robots.txt usa el dominio correcto (sin www)');
    }
    
  } catch (error) {
    console.error('❌ Error al verificar robots.txt:', error.message);
  }
}

// Ejecutar verificaciones
async function main() {
  await verifySitemap();
  await verifyRobots();
}

main();
