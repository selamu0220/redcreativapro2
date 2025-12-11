## Objetivo y Métricas Clave
- Meta: 100 visitas/día sostenidas (≈3.000/mes) desde tráfico orgánico.
- KPIs: `impressions`, `clicks`, `CTR`, `avg position` (GSC), páginas por sesión y tasa de rebote (GA/Mock), conversiones a CTA plantilla.
- Origen de datos: `app/api/seo/analytics/route.ts:35` (GSC/GA vía Supabase) con mocks si no hay clave.

## Enfoque Temático (Topical Authority)
- Tema principal: “IA + Productividad Creativa” (unifica `creatividad`, `productividad`, `tecnologia`).
- Silo por taxonomía: mantener enlaces internos dentro de cada silo y evitar cruzar temas dispares.
- Corrección de taxonomía: el post con `category: 'desarrollo-tecnico'` debe alinearse con `tecnologia` o añadirse a `categories` para consistencia.
  - Detección: `lib/blog-data.ts:461–469` (post) y `lib/blog-data.ts:36–93` (categorías definidas).

## Arquitectura de Contenido y Enlazado Interno
- Reforzar silos: usar listados por categoría y migas jerárquicas en cada post `app/components/blog/BlogPostLayout.tsx:49–56`.
- Unificar “Artículos relacionados”: usar el componente real (`components/blog/RelatedArticles.tsx:6,31`) y retirar el mock `app/components/blog/RelatedArticles.tsx:23–60`.
- Mejorar `getRelatedPosts` con orden por score (categoría > tags > featured/trending/views) y diversidad.
  - Punto de extensión: `lib/blog-data.ts:1824–1835`.
- Mantener enlaces contextuales dentro del cuerpo (anclas naturales) con el motor interno si procede (`app/components/ContentWithInternalLinks.tsx`, `lib/internal-linking.ts`).

## Palabras Clave y Oportunidades (Fruta Baja)
- Identificar long-tail con volumen 100–500 y baja competencia.
- Extraer queries y posiciones 11–20 desde GSC y atacar con contenido específico.
  - API: `app/api/seo/analytics/route.ts:128–173` (tráfico por fecha) y almacenamiento `app/api/seo/analytics/route.ts:229–250`.
- Generar backlog de 20 temas long-tail bajo el tema principal, con intención clara (informacional → tutorial/guía; transaccional → landing/CTA).

## Producción Editorial (Formato y Cadencia)
- Por ciclo de publicación: 2 piezas long-tail tipo “Cómo + caso de uso” y 1 pieza evergreen (guía/glosario).
- Estructura de cada artículo: H1 orientado a consulta, introducción breve, pasos accionables, FAQ y enlaces internos del silo.
- Reutilización: derivar versiones para Dev.to, IndieHackers y Reddit con enfoque “case study” del sistema SEO técnico.

## Evergreen y Glosario
- Crear sección `Glosario`: términos de IA/SEO/productividad con rutas semánticas, índice y enlaces cruzados.
  - Nueva ruta propuesta: `app/glosario/[termino]/page.tsx` + índice `app/glosario/page.tsx`.
  - Vincular desde artículos y breadcrumbs.
- Convertir tutoriales existentes en hubs de referencia: `app/voice-guide/page.tsx`, `app/config/tutorial-scripts.ts`.

## Optimización de CTR (Pipeline existente)
- Generar variaciones de títulos/metas para nuevos posts: `scripts/seo-suggest.js` → `docs/seo/analytics/title-suggestions.md`.
- Planificar mejoras de CTR con CSV de Analytics: `scripts/seo-ctr-auto.js` leyendo `docs/seo/analytics/ga-pages.csv`.
  - Plan sin aplicar: `--apply=false` para revisión editorial; aplicar manualmente en los 3–5 peores CTR.
  - Seguimiento: `docs/seo/analytics/ctr-auto-plan.md`, `ctr-change-plan.md`, `ctr-auto-summary-YYYY-MM-DD.md`.

## Distribución y Off-Page
- Promocionar la plantilla gratuita destacada: Home CTA `app/page.tsx:163–174` y landing `app/plantilla-solicitudes-creativas/page.tsx`.
- Asegurar el asset de descarga: el PDF debe existir o usar el endpoint de lead magnet (`app/api/lead-magnets/download/[id]/route.ts`).
- Publicaciones en: Reddit (webdev, nextjs, emprendimiento), IndieHackers y Dev.to con enfoque ‘infraestructura SEO automatizada + resultados’ enlazando a la landing.
- Backlinks dirigidos: outreach a newsletters de seguridad/IA/educación según silo activo.

## Datos Estructurados y Breadcrumbs
- Consolidar una implementación única de `BreadcrumbList` (evitar duplicidad de scripts): preferir utilidad central (`lib/structured-data.ts`) o un único componente SEO (`app/components/seo/SchemaMarkup.tsx`).
- Asegurar migas y JSON-LD en posts y listados: `app/components/blog/BlogPostLayout.tsx:49–56` y componentes SEO (`components/seo/Breadcrumbs.tsx`).

## Core Web Vitals (LCP y CLS)
- LCP: si el héroe incluye imagen, usar `HeroImage` con `preload=true` (`app/components/ui/OptimizedImage.tsx:228–236`) o `next/image priority` en el LCP real.
- CLS:
  - `stripe-buy-button` reservar altura estable (min-h/skeleton) en `app/planes/page.tsx:344–359`.
  - Banners dinámicos: reservar espacio o convertir a overlay fijo.
    - `PaymentAuthGuard` banner: `app/components/PaymentAuthGuard.tsx:178–200`.
    - Avisos en `correos-ia`: aplicar mismo patrón si existen banners.

## Freshness y Mantenimiento
- Detectar contenido con caída de CTR y actualizar `dateModified` + pequeños incrementos de valor (ejemplos, FAQ, recursos).
- Script de frescura propuesto: recorrer `blogPosts` >90 días, marcar para “actualizar y re-promocionar”; puede integrarse con el flujo de `seo-ctr-auto.js`.

## Medición y Revisión Continua
- Reporte semanal: usar `scripts/seo-weekly-report*.js` sobre `docs/seo/analytics/ga-pages.csv` para priorizar acciones.
- Consolidar tablero en Supabase (si claves disponibles) usando `seo_analytics` (`app/api/seo/analytics/route.ts:239–247`).
- Criterio de salida del ciclo: mantener 100 visitas/día durante ≥2 semanas con variación <15%.

## Próximas Implementaciones (tras aprobación)
- Corregir taxonomía y silos (`lib/blog-data.ts`).
- Unificar “Relacionados” al componente con datos reales y mejorar scoring.
- Añadir Glosario con index y enlaces, integrarlo a breadcrumbs/sitemap.
- Aplicar mitigaciones CLS y prioridad de imagen LCP donde corresponda.
- Formalizar el pipeline semanal (sugerencias → plan CTR → aplicación → distribución).