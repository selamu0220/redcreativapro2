#!/usr/bin/env node

/**
 * Script para solucionar problemas de CSS en la paginación del blog
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Solucionando problemas de CSS en la paginación del blog...\n');

// 1. Crear CSS específico para paginación
console.log('1. Añadiendo CSS específico para paginación...');

const paginationCSS = `
/* Estilos específicos para paginación del blog */
@layer utilities {
  /* Forzar estilos consistentes en todas las páginas */
  .blog-pagination-container {
    position: relative;
    z-index: 1;
  }
  
  .blog-pagination-container * {
    box-sizing: border-box !important;
  }
  
  /* Asegurar que los artículos mantengan sus estilos */
  .blog-article-card {
    background-color: hsl(var(--card)) !important;
    border: 1px solid hsl(var(--border)) !important;
    border-radius: 0.75rem !important;
    overflow: hidden !important;
    transition: all 0.3s ease !important;
  }
  
  .blog-article-card:hover {
    transform: translateY(-4px) !important;
    box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important;
  }
  
  .blog-article-image {
    width: 100% !important;
    height: 12rem !important;
    object-fit: cover !important;
    transition: transform 0.3s ease !important;
  }
  
  .blog-article-image:hover {
    transform: scale(1.05) !important;
  }
  
  .blog-article-content {
    padding: 1.5rem !important;
  }
  
  .blog-article-title {
    color: hsl(var(--foreground)) !important;
    font-size: 1.25rem !important;
    font-weight: 700 !important;
    line-height: 1.4 !important;
    margin-bottom: 0.75rem !important;
  }
  
  .blog-article-excerpt {
    color: hsl(var(--muted-foreground)) !important;
    font-size: 0.875rem !important;
    line-height: 1.5 !important;
    margin-bottom: 1rem !important;
  }
  
  .blog-article-meta {
    display: flex !important;
    align-items: center !important;
    gap: 1rem !important;
    font-size: 0.75rem !important;
    color: hsl(var(--muted-foreground)) !important;
    margin-bottom: 0.75rem !important;
  }
  
  .blog-article-tags {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 0.5rem !important;
    margin-bottom: 1rem !important;
  }
  
  .blog-article-tag {
    background-color: hsl(var(--muted)) !important;
    color: hsl(var(--muted-foreground)) !important;
    padding: 0.25rem 0.5rem !important;
    border-radius: 0.375rem !important;
    font-size: 0.75rem !important;
  }
  
  .blog-article-link {
    display: inline-flex !important;
    align-items: center !important;
    gap: 0.5rem !important;
    color: hsl(var(--foreground)) !important;
    font-weight: 500 !important;
    text-decoration: none !important;
    transition: color 0.3s ease !important;
  }
  
  .blog-article-link:hover {
    color: hsl(var(--muted-foreground)) !important;
  }
  
  /* Estilos específicos para la tercera página y siguientes */
  .blog-page-3-plus .blog-article-card {
    animation: fadeInUp 0.6s ease-out !important;
    animation-fill-mode: both !important;
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* Forzar re-render de estilos en paginación */
  .pagination-forced-render {
    transform: translateZ(0) !important;
    backface-visibility: hidden !important;
  }
  
  /* Asegurar que los botones de paginación funcionen */
  .blog-pagination-button {
    background-color: hsl(var(--muted)) !important;
    color: hsl(var(--muted-foreground)) !important;
    border: 1px solid hsl(var(--border)) !important;
    padding: 0.5rem 1rem !important;
    border-radius: 0.5rem !important;
    transition: all 0.3s ease !important;
    cursor: pointer !important;
  }
  
  .blog-pagination-button:hover:not(:disabled) {
    background-color: hsl(var(--secondary)) !important;
    color: hsl(var(--secondary-foreground)) !important;
  }
  
  .blog-pagination-button:disabled {
    opacity: 0.5 !important;
    cursor: not-allowed !important;
  }
  
  .blog-pagination-button.active {
    background-color: hsl(var(--primary)) !important;
    color: hsl(var(--primary-foreground)) !important;
  }
}`;

// Añadir el CSS al final de globals.css
if (fs.existsSync('app/globals.css')) {
  const currentCSS = fs.readFileSync('app/globals.css', 'utf8');
  
  if (!currentCSS.includes('blog-pagination-container')) {
    fs.appendFileSync('app/globals.css', '\n' + paginationCSS);
    console.log('✅ CSS de paginación añadido a globals.css');
  } else {
    console.log('⚠️  CSS de paginación ya existe en globals.css');
  }
} else {
  console.log('❌ No se encontró globals.css');
}

console.log('\n2. Creando componente mejorado para artículos del blog...');

// 2. Crear un componente mejorado para los artículos
const improvedBlogCard = `import Link from "next/link";
import { ArrowRight, Clock, Calendar, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { BlogPost } from "@/lib/blog-data";

interface ImprovedBlogCardProps {
  post: BlogPost;
  index: number;
  currentPage: number;
}

export default function ImprovedBlogCard({ post, index, currentPage }: ImprovedBlogCardProps) {
  // Añadir clase especial para páginas 3+
  const pageClass = currentPage >= 3 ? 'blog-page-3-plus' : '';
  
  return (
    <motion.article
      className={\`blog-article-card pagination-forced-render \${pageClass}\`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      key={\`\${post.id}-\${currentPage}-\${index}\`} // Key único para forzar re-render
    >
      <div className="relative overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="blog-article-image"
          loading="lazy"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
            {post.category}
          </span>
        </div>
      </div>

      <div className="blog-article-content">
        <div className="blog-article-meta">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{post.readTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{post.views} vistas</span>
          </div>
        </div>

        <h3 className="blog-article-title line-clamp-2">
          {post.title}
        </h3>

        <p className="blog-article-excerpt line-clamp-3">
          {post.excerpt}
        </p>

        <div className="blog-article-tags">
          {post.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="blog-article-tag">
              {tag}
            </span>
          ))}
        </div>

        <Link href={\`/blog/\${post.id}\`} className="blog-article-link">
          Leer más
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.article>
  );
}`;

fs.writeFileSync('app/components/ImprovedBlogCard.tsx', improvedBlogCard);
console.log('✅ Componente ImprovedBlogCard creado');

console.log('\n3. Creando componente de paginación mejorado...');

// 3. Crear componente de paginación mejorado
const improvedPagination = `interface ImprovedPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function ImprovedPagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: ImprovedPaginationProps) {
  return (
    <div className="blog-pagination-container flex justify-center items-center gap-2 mb-12">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="blog-pagination-button"
        type="button"
      >
        Anterior
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={\`page-\${page}\`}
          onClick={() => onPageChange(page)}
          className={\`blog-pagination-button \${
            currentPage === page ? 'active' : ''
          }\`}
          type="button"
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="blog-pagination-button"
        type="button"
      >
        Siguiente
      </button>
    </div>
  );
}`;

fs.writeFileSync('app/components/ImprovedPagination.tsx', improvedPagination);
console.log('✅ Componente ImprovedPagination creado');

console.log('\n4. Creando parche para el componente principal del blog...');

// 4. Crear un parche para el blog principal
const blogPatch = `// Parche para app/blog/page.tsx
// Añadir estas importaciones al inicio del archivo:
import ImprovedBlogCard from "@/app/components/ImprovedBlogCard";
import ImprovedPagination from "@/app/components/ImprovedPagination";

// Reemplazar la sección de Articles Grid con:
{paginatedPosts.length > 0 ? (
  <div className="blog-pagination-container">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
      {paginatedPosts.map((post, index) => (
        <ImprovedBlogCard
          key={\`\${post.id}-\${currentPage}-\${index}\`}
          post={post}
          index={index}
          currentPage={currentPage}
        />
      ))}
    </div>
  </div>
) : (
  // ... resto del código de "no se encontraron artículos"
)}

// Reemplazar la sección de Pagination con:
{totalPages > 1 && (
  <ImprovedPagination
    currentPage={currentPage}
    totalPages={totalPages}
    onPageChange={setCurrentPage}
  />
)}`;

fs.writeFileSync('blog-patch-instructions.md', `# Instrucciones para aplicar el parche del blog

## Cambios necesarios en app/blog/page.tsx:

1. **Añadir importaciones** al inicio del archivo:
\`\`\`typescript
import ImprovedBlogCard from "@/app/components/ImprovedBlogCard";
import ImprovedPagination from "@/app/components/ImprovedPagination";
\`\`\`

2. **Reemplazar la sección Articles Grid** (línea ~280 aproximadamente):
${blogPatch}

## Beneficios de estos cambios:

- ✅ CSS específico para paginación
- ✅ Keys únicos para forzar re-render
- ✅ Estilos consistentes en todas las páginas
- ✅ Animaciones mejoradas
- ✅ Mejor manejo de la hidratación

## Aplicar cambios automáticamente:

Ejecuta: \`node apply-blog-patch.js\`
`);

console.log('✅ Instrucciones de parche creadas en blog-patch-instructions.md');

console.log('\n5. Optimizando configuración de Next.js...');

// 5. Crear configuración optimizada de Next.js
const optimizedNextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations - REDUCIR configuraciones experimentales
  experimental: {
    // Remover optimizeCss que puede causar problemas
    // optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // Compression and optimization
  compress: true,
  poweredByHeader: false,
  trailingSlash: false,
  skipTrailingSlashRedirect: false,
  generateEtags: true,
  
  // Advanced image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Bundle optimization - SIMPLIFICADO
  webpack: (config, { dev, isServer }) => {
    // Fix for "self is not defined" error
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    // Simplificar optimizaciones para evitar problemas de CSS
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
      };
    }
    
    return config;
  },
  
  // Headers for performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  },
  
  // Redirects optimization
  async redirects() {
    return [];
  },
  
  // Rewrites optimization  
  async rewrites() {
    return [];
  },
}

module.exports = nextConfig`;

fs.writeFileSync('next.config.optimized.js', optimizedNextConfig);
console.log('✅ Configuración optimizada de Next.js creada (next.config.optimized.js)');

console.log('\n📋 RESUMEN DE CAMBIOS REALIZADOS:\n');

console.log('✅ 1. CSS específico para paginación añadido a globals.css');
console.log('✅ 2. Componente ImprovedBlogCard creado');
console.log('✅ 3. Componente ImprovedPagination creado');
console.log('✅ 4. Instrucciones de parche creadas');
console.log('✅ 5. Configuración optimizada de Next.js creada');

console.log('\n🚀 PRÓXIMOS PASOS:\n');

console.log('1. Revisar blog-patch-instructions.md');
console.log('2. Aplicar los cambios manualmente o ejecutar apply-blog-patch.js');
console.log('3. Opcional: Reemplazar next.config.js con next.config.optimized.js');
console.log('4. Reiniciar el servidor de desarrollo');
console.log('5. Probar la tercera página del blog');

console.log('\n✨ Los cambios deberían solucionar los problemas de CSS en la paginación.');