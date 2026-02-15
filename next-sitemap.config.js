const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://redcreativa.pro',
  generateRobotsTxt: false,
  generateIndexSitemap: false,
  sitemapSize: 5000,
  changefreq: 'daily',
  priority: 0.7,
  exclude: [
    // Dashboard y áreas privadas
    '/dashboard/*',
    '/admin/*',
    '/auth/*',
    '/api/*',
    '/configuracion/*',
    '/ajustes/*',
    '/calendario/*',
    '/contactos/*',
    '/documentos/*',
    '/historial/*',
    '/suscripcion/*',
    '/subscription/manage*',
    '/correosia/*',
    
    // Páginas de test y debug
    '/test-*',
    '/debug*',
    '/diagnostico-*',
    '/fix-*',
    '/check-*',
    '/verify-*',
    '/boveda-automatizacion',
    '/buscar',
    '/analytics1234',
    '/browser-fix-*',
    '/final-*',
    '/extract-*',
    '/find-*',
    '/emergency-*',
    '/demo-*',
    '/append-*',
    '/apply-*',
    '/create-*',
    '/lighthouse',
    '/perf*',
    '/static-test',
    '/simple-audio-test',
    '/audio-test',
    '/test-simple',
    '/test-no-auth',
    '/test-localization',
    '/test-isolated',
    '/test-localized-templates',
    '/test-agent-mode-changes',
    '/test-error',
    '/test-basic',
    '/test-user-registration',
    '/test-voice-guide',
    '/check-user-registration',
    '/auth-debug',
    '/debug-minimal',
    '/debug-env',
    
    // Herramientas internas
    '/seo-dashboard/*',
    '/tools/*',
    '/seo-merge*',
    '/seo-apply*',
    '/seo-gen*',
    '/seo-new*',
    '/seo-suggest*',
    '/seo-weekly*',
    
    // Páginas específicas
    '/cancel',
    '/success',
    '/sitemap-visual',
    '/sentry-example-page',
    '/importar-exportar',
    '/unsubscribe',
    '/voice-guide',
    '/ai-browser',
    '/estado-servicio',
    '/estadisticas-simple',
    '/playground',
    '/creador',
    '/lead-magnets',
    '/privacy-policy/*',
    '/terms-of-service/*',
  ],
  transform: async (config, path) => {
    let priority = config.priority;
    let changefreq = config.changefreq;

    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    } 
    else if (path.startsWith('/blog') || path.startsWith('/escritor-ia')) {
      priority = 0.9;
      changefreq = 'daily';
    }
    else if (path.startsWith('/guia') || path.startsWith('/prompts')) {
      priority = 0.85;
      changefreq = 'weekly';
    }
    else if (path.startsWith('/herramientas') || path.startsWith('/correos-ia')) {
      priority = 0.8;
      changefreq = 'weekly';
    }
    else if (path.startsWith('/categoria') || path.startsWith('/industria') || 
             path.startsWith('/comparativas') || path.startsWith('/alternativas')) {
      priority = 0.75;
      changefreq = 'weekly';
    }
    else if (path.startsWith('/politica') || path.startsWith('/terminos') || 
             path.startsWith('/aviso-legal')) {
      priority = 0.5;
      changefreq = 'monthly';
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
    };
  },
  additionalPaths: async (config) => {
    const paths = [
      // Páginas principales
      await config.transform(config, '/'),
      await config.transform(config, '/blog'),
      await config.transform(config, '/prompts'),
      await config.transform(config, '/planes'),
      await config.transform(config, '/escritor-ia'),
      await config.transform(config, '/herramientas'),
      await config.transform(config, '/contacto'),
      
      // Páginas de contenido
      await config.transform(config, '/preguntas-frecuentes'),
      await config.transform(config, '/centro-ayuda'),
      await config.transform(config, '/glosario'),
      await config.transform(config, '/guia/escritor-ia'),
      await config.transform(config, '/mejores-herramientas-ia-escritura'),
      await config.transform(config, '/escritor-ia-gratis'),
      
      // Páginas de categoría
      await config.transform(config, '/categoria'),
      await config.transform(config, '/industria'),
      await config.transform(config, '/alternativas'),
      await config.transform(config, '/comparativas'),
      
      // Páginas legales
      await config.transform(config, '/politica-privacidad'),
      await config.transform(config, '/politica-cookies'),
      await config.transform(config, '/terminos-servicio'),
      await config.transform(config, '/aviso-legal'),
    ];

    // Si tenemos credenciales de Supabase, agregar posts reales
    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        const { data: posts, error } = await supabase
          .from('blog_posts')
          .select('slug, language, updated_at')
          .eq('status', 'published');

        if (!error && posts) {
          for (const post of posts) {
            const langPrefix = post.language === 'es' ? '' : `/${post.language}`;
            const path = `${langPrefix}/blog/${post.slug}`;
            paths.push({
              loc: `https://redcreativa.pro${path}`,
              lastmod: (post.updated_at || new Date()).toISOString(),
              changefreq: 'weekly',
              priority: 0.8,
            });
          }
        }
      } catch (e) {
        console.warn('No se pudieron cargar posts de Supabase:', e.message);
      }
    }

    return paths;
  },
};
