#!/usr/bin/env node
/**
 * SEO INDEXING FIXES - Soluciones para problemas de indexación
 * 
 * Problemas a resolver:
 * - 546 URLs duplicadas sin canonical
 * - 42 páginas descubiertas sin indexar  
 * - 21 páginas con redirección
 * - 18 páginas 404
 * - 6 páginas con noindex
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 APLICANDO CORRECCIONES SEO CRÍTICAS\n');
console.log('=====================================\n');

// =====================================================
// FIX 1: Actualizar robots.txt (YA COMPLETADO)
// =====================================================
console.log('✅ FIX 1: robots.txt actualizado con:');
console.log('   • Soporte para bots de IA (GPTBot, ClaudeBot, PerplexityBot)');
console.log('   • Bloqueo de páginas de test y debug');
console.log('   • Referencias a sitemaps\n');

// =====================================================
// FIX 2: Crear página 404 personalizada
// =====================================================
const notFoundPage = `'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function NotFound() {
  useEffect(() => {
    // Registrar error 404 en analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', '404_error', {
        page_path: window.location.pathname,
        page_title: '404 - Página no encontrada',
      });
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-lg">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Página no encontrada
        </h2>
        <p className="text-gray-600 mb-8">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver al inicio
          </Link>
          
          <div className="mt-8">
            <p className="text-sm text-gray-500 mb-4">O visita nuestras secciones principales:</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/blog" className="text-blue-600 hover:underline">
                Blog
              </Link>
              <Link href="/alternativas" className="text-blue-600 hover:underline">
                Alternativas IA
              </Link>
              <Link href="/comparativas" className="text-blue-600 hover:underline">
                Comparativas
              </Link>
              <Link href="/glosario" className="text-blue-600 hover:underline">
                Glosario
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-12 text-sm text-gray-400">
          <p>Si crees que esto es un error, por favor contáctanos.</p>
        </div>
      </div>
    </div>
  );
}`;

const notFoundPath = path.join(__dirname, '..', 'app', 'not-found.tsx');
fs.writeFileSync(notFoundPath, notFoundPage);
console.log('✅ FIX 2: Página 404 personalizada creada');
console.log('   Ubicación: app/not-found.tsx\n');

// =====================================================
// FIX 3: Crear helper de canonical
// =====================================================
const canonicalHelper = `/**
 * Helper para generar URLs canónicas
 * 
 * USO:
 * import { generateCanonicalUrl, generateAlternateUrls } from '@/lib/canonical';
 * 
 * const canonical = generateCanonicalUrl('/blog/post-slug');
 * const alternates = generateAlternateUrls('/blog/post-slug');
 */

const SITE_URL = 'https://redcreativa.pro';
const LOCALES = ['es', 'de', 'fr', 'it', 'zh', 'pt'];

/**
 * Genera URL canónica para una ruta
 */
export function generateCanonicalUrl(path: string): string {
  // Remover trailing slash excepto para homepage
  const cleanPath = path === '/' ? '/' : path.replace(/\\/$/, '');
  return \`\${SITE_URL}\${cleanPath}\`;
}

/**
 * Genera URLs alternativas para todos los idiomas
 */
export function generateAlternateUrls(path: string): Record<string, string> {
  const cleanPath = path === '/' ? '' : path.replace(/\\/$/, '');
  
  const alternates: Record<string, string> = {
    'x-default': \`\${SITE_URL}\${cleanPath}\`,
  };
  
  LOCALES.forEach(locale => {
    const localePath = locale === 'es' 
      ? cleanPath 
      : \`/\${locale}\${cleanPath}\`;
    alternates[locale] = \`\${SITE_URL}\${localePath}\`;
  });
  
  return alternates;
}

/**
 * Genera metadata completa con canonical
 */
export function generateMetadataWithCanonical(
  title: string,
  description: string,
  path: string,
  options?: {
    ogImage?: string;
    type?: 'website' | 'article';
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
  }
) {
  const canonicalUrl = generateCanonicalUrl(path);
  const alternates = generateAlternateUrls(path);
  
  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: alternates,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Red Creativa Pro',
      locale: 'es_ES',
      type: options?.type || 'website',
      ...(options?.ogImage && { images: [{ url: options.ogImage }] }),
      ...(options?.publishedTime && { publishedTime: options.publishedTime }),
      ...(options?.modifiedTime && { modifiedTime: options.modifiedTime }),
      ...(options?.author && { authors: [options.author] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(options?.ogImage && { images: [options.ogImage] }),
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  };
}
`;

const libDir = path.join(__dirname, '..', 'lib');
if (!fs.existsSync(libDir)) {
  fs.mkdirSync(libDir, { recursive: true });
}

const canonicalPath = path.join(libDir, 'canonical.ts');
fs.writeFileSync(canonicalPath, canonicalHelper);
console.log('✅ FIX 3: Helper de canonical creado');
console.log('   Ubicación: lib/canonical.ts\n');

// =====================================================
// FIX 4: Actualizar next.config.mjs con redirecciones 301
// =====================================================
console.log('📋 FIX 4: Verificar redirecciones 301 en next.config.mjs');
console.log('   Acción: Añadir las siguientes redirecciones:\n');

const redirectExamples = `
// Añadir a next.config.mjs en la sección de redirects:
async redirects() {
  return [
    // Redirecciones de URLs antiguas a nuevas
    {
      source: '/old-blog/:slug',
      destination: '/blog/:slug',
      permanent: true, // 301
    },
    // Redirección de www a non-www (o viceversa)
    {
      source: '/:path*',
      has: [
        {
          type: 'host',
          value: 'www.redcreativa.pro',
        },
      ],
      destination: 'https://redcreativa.pro/:path*',
      permanent: true,
    },
    // Redirección HTTP a HTTPS
    {
      source: '/:path*',
      has: [
        {
          type: 'header',
          key: 'x-forwarded-proto',
          value: 'http',
        },
      ],
      destination: 'https://redcreativa.pro/:path*',
      permanent: true,
    },
  ];
},
`;

console.log(redirectExamples);

// =====================================================
// FIX 5: Generar lista de acciones manuales
// =====================================================
const actionItems = `# CHECKLIST DE ACCIONES MANUALES - SEO INDEXACIÓN

## Acciones Prioritarias (Realizar en orden)

### 1. Verificar páginas con noindex (6 páginas)
- [ ] Buscar en Search Console cuáles son las 6 páginas con "noindex"
- [ ] Revisar si deben indexarse:
  - Si SÍ deben indexar: Eliminar meta robots noindex
  - Si NO deben indexar: Mantener bloqueo

### 2. Corregir URLs duplicadas (546 páginas)
Las duplicadas típicas son:
- [ ] Páginas con/sin trailing slash (/blog vs /blog/)
- [ ] Páginas con parámetros de query (?page=2, ?sort=date)
- [ ] Variantes de idioma sin hreflang (/de/blog vs /blog)
- [ ] Versiones www vs non-www
- [ ] Versiones HTTP vs HTTPS

**Solución:** Implementar canonical self-referencing en todas las páginas.

### 3. Crear función getBlogPost en lib/blogs.ts
\`\`\`typescript
export async function getBlogPost(slug: string) {
  // Implementar lectura de archivos markdown de /blogs/
  const filePath = path.join(process.cwd(), 'blogs', slug, 'post.md');
  // ... parse markdown frontmatter
}

export async function getAllBlogPosts() {
  // Listar todos los blogs y retornar array
}
\`\`\`

### 4. Actualizar páginas principales con canonical
Aplicar a cada página en app/*/page.tsx:
- [ ] app/blog/[slug]/page.tsx
- [ ] app/blog/(listing)/page.tsx  
- [ ] app/alternativas/page.tsx
- [ ] app/comparativas/page.tsx
- [ ] app/glosario/page.tsx
- [ ] app/industria/page.tsx
- [ ] app/categoria/page.tsx

### 5. Verificar y corregir 18 páginas 404
En Search Console:
- [ ] Descargar lista completa de URLs 404
- [ ] Para cada URL, decidir:
  - Crear redirección 301 a página relevante
  - O dejar como 404 si no tiene tráfico/backlinks

### 6. Corregir 21 redirecciones problemáticas
- [ ] Identificar cadenas A→B→C
- [ ] Simplificar a A→C directo
- [ ] Cambiar 302 temporales a 301 permanentes

### 7. Mejorar 42 páginas "descubiertas sin indexar"
- [ ] Revisar calidad de contenido
- [ ] Asegurar mínimo 300 palabras
- [ ] Agregar contenido único y valioso
- [ ] Verificar que no sean thin content

### 8. Optimizar 10 páginas "rastreadas sin indexar"
- [ ] Google detectó estas páginas pero eligió no indexarlas
- [ ] Causas típicas:
  - Contenido duplicado
  - Calidad baja
  - Competencia fuerte
  - Falta de enlaces internos
- [ ] Acciones: Mejorar contenido, agregar enlaces, canonical correcto

## Testing

### Después de aplicar fixes:
1. [ ] Ejecutar \`npm run build\` sin errores
2. [ ] Verificar en desarrollo que los canonicals están presentes:
   - Inspeccionar elemento → <head> → buscar <link rel="canonical">
3. [ ] Verificar hreflang en páginas con idiomas:
   - Debe haber tags <link rel="alternate" hreflang="...">
4. [ ] Probar página 404: /pagina-que-no-existe
5. [ ] Desplegar a producción
6. [ ] Usar "Inspect URL" en Google Search Console
7. [ ] Solicitar indexación de páginas principales
8. [ ] Monitorear reporte de cobertura semanalmente

## Herramientas útiles:
- Google Search Console (principal)
- Screaming Frog (auditoría técnica)
- PageSpeed Insights (velocidad)
- Rich Results Test (schema markup)
- Mobile-Friendly Test (mobile)
`;

const checklistPath = path.join(__dirname, '..', 'SEO_INDEXING_CHECKLIST.md');
fs.writeFileSync(checklistPath, actionItems);
console.log('✅ FIX 5: Checklist de acciones manuales creado');
console.log('   Ubicación: SEO_INDEXING_CHECKLIST.md\n');

// =====================================================
// RESUMEN
// =====================================================
console.log('=====================================');
console.log('✅ CORRECCIONES APLICADAS');
console.log('=====================================\n');

console.log('📁 ARCHIVOS CREADOS:');
console.log('   1. public/robots.txt (actualizado)');
console.log('   2. app/not-found.tsx (nuevo)');
console.log('   3. lib/canonical.ts (nuevo)');
console.log('   4. SEO_INDEXING_CHECKLIST.md (nuevo)\n');

console.log('🚀 SIGUIENTES PASOS:');
console.log('   1. Revisar SEO_INDEXING_CHECKLIST.md');
console.log('   2. Implementar función getBlogPost en lib/blogs.ts');
console.log('   3. Actualizar páginas principales con canonical');
console.log('   4. Añadir redirecciones 301 en next.config.mjs');
console.log('   5. Ejecutar: npm run build');
console.log('   6. Desplegar y verificar en Search Console\n');

console.log('⚠️  RECUERDA:');
console.log('   • Las 546 URLs duplicadas se resolverán con canonicals');
console.log('   • Las 18 páginas 404 necesitan redirecciones manuales');
console.log('   • Las 42 páginas sin indexar necesitan mejora de contenido');
console.log('   • Monitorear Search Console semanalmente después de los cambios');
