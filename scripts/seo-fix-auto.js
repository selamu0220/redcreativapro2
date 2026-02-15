#!/usr/bin/env node
/**
 * SEO FIX AUTO - Genera redirects y correcciones automáticamente
 * 
 * Este script analiza el sitemap y genera redirects para URLs problemáticas
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 SEO Fix Auto - Generando correcciones...\n');

// URLs problemáticas comunes que generan 404s
const common404Patterns = [
  // Variaciones de mayúsculas/minúsculas
  { from: '/Blog', to: '/blog' },
  { from: '/BLOG', to: '/blog' },
  { from: '/Prompts', to: '/prompts' },
  { from: '/Herramientas', to: '/herramientas' },
  { from: '/Planes', to: '/planes' },
  { from: '/Contacto', to: '/contacto' },
  
  // Espacios y caracteres especiales
  { from: '/blog%20', to: '/blog' },
  { from: '/prompts%20', to: '/prompts' },
  
  // Extensiones incorrectas
  { from: '/blog.html', to: '/blog' },
  { from: '/blog.htm', to: '/blog' },
  { from: '/index.html', to: '/' },
  { from: '/index.htm', to: '/' },
  { from: '/home.html', to: '/' },
  
  // Páginas antiguas comunes
  { from: '/inicio.html', to: '/' },
  { from: '/principal', to: '/' },
  { from: '/welcome', to: '/' },
  { from: '/default.html', to: '/' },
  
  // Español variations
  { from: '/herramientas.html', to: '/herramientas' },
  { from: '/planes.html', to: '/planes' },
  { from: '/contacto.html', to: '/contacto' },
  
  // Blog slug variations
  { from: '/articulos', to: '/blog' },
  { from: '/post', to: '/blog' },
  { from: '/posts', to: '/blog' },
  { from: '/noticias', to: '/blog' },
  { from: '/novedades', to: '/blog' },
  
  // Tool variations
  { from: '/herramientas-ia', to: '/herramientas' },
  { from: '/tools-ia', to: '/herramientas' },
  { from: '/ai-tools', to: '/herramientas' },
  { from: '/ia-tools', to: '/herramientas' },
  
  // Prompt variations
  { from: '/plantillas', to: '/prompts' },
  { from: '/templates', to: '/prompts' },
  { from: '/prompt', to: '/prompts' },
  { from: '/promptss', to: '/prompts' }, // common typo
  
  // Comparativas
  { from: '/comparacion', to: '/comparativas' },
  { from: '/comparaciones', to: '/comparativas' },
  { from: '/vs', to: '/comparativas' },
  { from: '/versus', to: '/comparativas' },
  
  // Alternativas
  { from: '/alternativa', to: '/alternativas' },
  { from: '/alternativo', to: '/alternativas' },
  { from: '/similar', to: '/alternativas' },
  { from: '/mejores-alternativas', to: '/alternativas' },
  
  // Escritor IA variations
  { from: '/escritor', to: '/escritor-ia' },
  { from: '/escritorai', to: '/escritor-ia' },
  { from: '/escritor-ai', to: '/escritor-ia' },
  { from: '/ai-writer', to: '/escritor-ia' },
  { from: '/ai-escritor', to: '/escritor-ia' },
  { from: '/redactor-ia', to: '/escritor-ia' },
  { from: '/redactor', to: '/escritor-ia' },
  
  // Guía variations  
  { from: '/guias', to: '/guia' },
  { from: '/guías', to: '/guia' },
  { from: '/tutorial', to: '/guia' },
  { from: '/tutoriales', to: '/guia' },
  
  // Help
  { from: '/ayuda', to: '/centro-ayuda' },
  { from: '/soporte', to: '/centro-ayuda' },
  { from: '/faq', to: '/preguntas-frecuentes' },
  { from: '/preguntas', to: '/preguntas-frecuentes' },
  
  // Legales
  { from: '/legal', to: '/aviso-legal' },
  { from: '/legales', to: '/aviso-legal' },
  { from: '/politica-privacidad', to: '/aviso-legal' },
  { from: '/politicas', to: '/aviso-legal' },
  { from: '/terminos', to: '/terminos-servicio' },
  { from: '/terms-of-use', to: '/terminos-servicio' },
  { from: '/condiciones', to: '/terminos-servicio' },
];

// Leer el archivo de configuración actual de Next.js
const nextConfigPath = path.join(__dirname, '..', 'next.config.mjs');

console.log('📝 Leyendo configuración actual...\n');

let nextConfig = fs.readFileSync(nextConfigPath, 'utf8');

// Buscar dónde insertar los nuevos redirects
const redirectMarker = '// SEO Redirects - 301 Permanent Redirects';

// Verificar si los redirects ya existen
const existingRedirects = common404Patterns.map(p => p.from);
console.log(`✅ Generados ${common404Patterns.length} redirects potenciales\n`);

// Mostrar los redirects que se agregarán
console.log('📋 Redirects a agregar:');
console.log('='.repeat(60));

// Crear los nuevos redirects
const newRedirects = common404Patterns.map(pattern => {
  console.log(`   ${pattern.from} → ${pattern.to}`);
  return {
    source: pattern.from.toLowerCase(),
    destination: pattern.to,
    permanent: true,
  };
});

console.log('\n' + '='.repeat(60));
console.log(`\n✅ Total: ${newRedirects.length} redirects generados`);

// Guardar en un archivo separado para referencia
const outputPath = path.join(__dirname, '..', 'data', 'seo-auto-redirects.json');
const redirectsData = {
  timestamp: new Date().toISOString(),
  total: newRedirects.length,
  redirects: newRedirects
};

// Crear directorio si no existe
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(redirectsData, null, 2));
console.log(`\n📄 Guardado en: ${outputPath}`);

// Ahora agregar los redirects al next.config.mjs
console.log('\n🔧 Agregando redirects al next.config.mjs...\n');

// Buscar el array de redirects en el archivo
const redirectsArrayMatch = nextConfig.match(/redirects = async \(\) => \{[\s\S]*?return \[[\s\S]*?\];/);

if (redirectsArrayMatch) {
  console.log('✅ Encontrado array de redirects');
  
  // Agregar los nuevos redirects al inicio del array
  const newRedirectsCode = newRedirects.map(r => `
        {
            source: '${r.source}',
            destination: '${r.destination}',
            permanent: true,
        },`).join('');
  
  // Insertar después del primer { y antes de "return ["
  const insertPoint = nextConfig.indexOf('return [');
  if (insertPoint > -1) {
    nextConfig = nextConfig.slice(0, insertPoint) + newRedirectsCode + nextConfig.slice(insertPoint);
    
    // Escribir el archivo actualizado
    fs.writeFileSync(nextConfigPath, nextConfig);
    console.log('✅ Redirects agregados a next.config.mjs');
  }
} else {
  console.log('⚠️ No se encontró el array de redirects. Agregando manualmente...');
  
  // Agregar al final del archivo
  const newSection = `

// SEO FIX AUTO - Redirects adicionales (${new Date().toISOString().split('T')[0]})
nextConfig.redirects = async () => {
    return [
${newRedirects.map(r => `        {
            source: '${r.source}',
            destination: '${r.destination}',
            permanent: true,
        },`).join('')}
    ];
};
`;
  
  fs.writeFileSync(nextConfigPath, nextConfig + newSection);
  console.log('✅ Redirects agregados manualmente');
}

console.log('\n✨ Proceso completado!');
console.log('\n⚠️  Recuerda ejecutar "pnpm build" para aplicar los cambios');
