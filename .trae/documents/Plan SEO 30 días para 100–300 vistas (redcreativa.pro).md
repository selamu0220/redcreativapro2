## Objetivo y KPIs
- Objetivo principal: 100 vistas únicas en 14 días y 300 en 30 días.
- KPIs de tráfico: `Usuarios (GA4)`, `Sesiones`, `Vistas únicas por URL`, `Origen/medio`.
- KPIs de visibilidad: `Impresiones (GSC)`, `CTR orgánico ≥2%`, `Posición media <25` a 30 días.
- Salud del sitio: subir de 70% a ≥90% en 7 días (resolver 3 errores y 21 avisos críticos).
- Indexación: `Páginas válidas indexadas` ≥10 en 14 días.
- Contenido: 2 landings + 4 artículos publicados en 14 días.

## Línea Base y Supuestos
- Base actual: 0 tráfico orgánico; 11 keywords; 360 impresiones; posición 35,1; 13 backlinks; 7 páginas rastreadas; GA4/GSC sin conexión.
- Mercado: España, idioma `es-ES`. Intención mixta (informativa/transaccional suave).
- Infraestructura: dominio activo y posibilidad de editar metadatos, schema, robots/sitemap.

## Estrategia General
- Capturar demanda existente (consultas actuales) con landings y guías; aumentar CTR con titles/descriptions orientados a beneficio.
- Acelerar indexación con sitemap, enlaces internos, difusión y solicitudes GSC.
- Mejorar señales técnicas (CWV, schema, OG/Twitter) y E‑E‑A‑T para elegibilidad en AI Overviews.

## Roadmap 4 semanas (con quick wins en 14 días)
- Semana 0 (Días 1–2) Instrumentación
  - Conectar GSC y GA4 (DNS y tag). Publicar `robots.txt` y `sitemap.xml`. Enviar sitemap y revisar cobertura.
  - Mapear 10 keywords prioritarias (España) y asignarlas a URLs.
- Semana 1 (Días 3–7) Técnica on‑site
  - Optimizar `title` (≤60), `meta` (120–155), `H1` único; jerarquía `H2/H3`.
  - Añadir `canonical`, `OG/Twitter`, `lang="es"`, `hreflang es-ES` si aplica.
  - Implementar `schema`: `Organization`, `WebSite+SearchAction`, `BreadcrumbList`, `Article`.
  - Core Web Vitals (LCP <2.5s, CLS <0.1, INP <200ms): lazy, dimensiones de imagen, CSS crítico, dividir JS.
- Semana 2 (Días 8–14) Contenido e intención
  - Publicar 2 landings y 4 artículos (ver briefs). Hub "Herramientas de IA para Copywriting" e interlinking.
  - CTA y banners "Descarga gratuita"; checklist de indexación por URL.
- Semana 3 (Días 15–21) Autoridad y distribución
  - 5–8 backlinks seguros (perfiles/directorios + guest post con canonical). Difusión en LinkedIn/X/Reddit/Telegram.
- Semana 4 (Días 22–30) Optimización continua
  - Revisar GSC: ajustar titles para subir CTR; añadir 2 FAQs por consultas low‑click.
  - Ampliar cobertura con 2 artículos long‑tail; auditoría de enlaces rotos/duplicados y canonicals.

## Backlog Priorizado (ICE)
- Alto impacto/medio esfuerzo: conectar GA4/GSC; sitemap/robots; titles/meta; schema básico; dos landings; hub + interlinking.
- Medio impacto/bajo esfuerzo: OG/Twitter; banners CTA; FAQs; mejora de anchors internos.
- Alto impacto/alto esfuerzo: optimización CWV (imágenes/JS/CSS); 4 artículos informativos; backlinks relevantes.

## Arquitectura de Contenido
- Landings:
  - `/` Propuesta clara (servicios/herramientas IA para redacción profesional).
  - `/plantilla-solicitudes-creativas` (keyword+descarga gratuita).
  - `/corrector-textos-ia` (comparativa+guía).
  - `/herramientas-ia-copywriting` (hub con listado/fichas).
- Artículos (semana 2–4):
  - Cómo usar IA para profesionales de escritura.
  - Textos automáticos: cuándo sí/no.
  - Desarrollo de APIs creativas con IA.
  - Creador de redacciones automático: guía y ejemplos.
- Estructura: breadcrumbs `Home > Categoría > Página`, CTA constante y secciones FAQ.

## Briefs y Plantillas
- Fórmula de `title`: `[beneficio] + [consulta] + [modificador] + [año]`.
- Fórmula de `meta`: `[resultado en tiempo] + [prueba/ejemplo] + [CTA]`.
- Landing plantilla solicitudes creativas:
  - Objetivo: captación + leads. Secciones: problema, solución (plantilla), cómo usarla, ejemplos, CTA de descarga, FAQ.
- Página corrector IA:
  - Objetivo: captar intención "corrector de textos ia". Secciones: qué es, comparativa herramientas, guía paso a paso, ejemplos antes/después, buenas prácticas, FAQ.
- Artículo informativo (800–1200+ palabras):
  - Introducción con intención, subtítulos H2 orientados a preguntas, ejemplos/capturas, checklist, FAQPage.

## Optimización Técnica
- `robots.txt`: permitir todo; bloquear `/admin`; línea `Sitemap: https://redcreativa.pro/sitemap.xml`.
- `sitemap.xml` dinámico: todas las URLs canónicas; actualizar tras publicar.
- `canonical` en cada página; evitar duplicados y parámetros.
- `Open Graph/Twitter`: `og:title`, `og:description`, `og:image 1200x630`, `twitter:card=summary_large_image`.
- `lang` y `hreflang`: `es-ES`.
- Fuentes: sistema o preloads; minimizar FOIT/FOUT.

## Core Web Vitals (criterios)
- LCP <2.5s (ideal <2.0s): imagen principal optimizada, `preload` si hero, CSS crítico inline.
- CLS <0.1: reservar `width/height` en imágenes, evitar inserciones tardías, fuentes estables.
- INP <200ms: diferir JS no crítico, dividir bundles, evitar listeners pesados.
- Imágenes: WebP/AVIF con `srcset/sizes`, `loading="lazy"` fuera de viewport.

## Marcado Estructurado (JSON-LD)
- `Organization`: nombre, logo, URL, contacto.
- `WebSite` + `SearchAction`: caja de búsqueda site.
- `BreadcrumbList`: coherente con rutas.
- `Article`: headline, datePublished, author, image.
- `FAQPage`: pares pregunta/respuesta reales.

## Instrumentación y Medición
- GA4:
  - Crear propiedad y `Data Stream Web`. Instalar etiqueta. Conversions: `cta_download`, `cta_contact`, `newsletter_subscribe`.
  - UTM estándar: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`.
- GSC:
  - Verificación DNS. Enviar `sitemap.xml`. Revisar `Cobertura`, `Rendimiento`, `Inspeccionar URL` post‑publicación.
- Dashboard Looker Studio:
  - Fuentes GA4+GSC. KPIs: usuarios, sesiones, CTR, impresiones, top páginas/consultas, posición media.

## Interlinking (hub & spoke)
- Hub `/herramientas-ia-copywriting` enlaza a fichas y landings; usar anchors descriptivos.
- En cada artículo: 2–3 enlaces internos con intención relacionada; bloque "Relacionado".
- Breadcrumbs y enlaces a `/` y categorías.

## Distribución y Promoción
- Canales: LinkedIn (empresa+personal), X (hilo), Reddit r/copywriting / r/marketing_es, Telegram/WhatsApp de redactores.
- Calendario 14 días: publicar landing día 4; difusión multicanal días 7–9; newsletter día 8; recordatorio día 12.
- Mensajes: beneficio claro + prueba (ejemplo/captura) + CTA descarga.
- UTM en todos los enlaces; acortar con dominio propio si posible.

## Link Building Seguro
- Perfiles/directorios: LinkedIn Company, GitHub org, Product Hunt, BetaList, About.me, Domestika/Behance (si aplica), directorios tech españoles.
- Guest posts: Medium/dev.to con `rel="canonical"` apuntando a la URL original.
- Outreach: ofrecer plantilla gratuita; anchors naturales; `nofollow` si baja calidad.

## Cadencia de Optimización
- Diario: `site:redcreativa.pro` en Google; cobertura en GSC; enviar solicitudes de indexación en nuevas URLs.
- Semanal: revisar CTR y posición por consulta; reescribir titles/metas de las 5 peores páginas por CTR.
- Quincenal: auditoría de enlaces rotos/duplicados; consolidación con canonicals.

## Riesgos y Mitigación
- Indexación lenta: enlazar desde home y hub; sitemap actualizado; solicitar indexación; difusión social.
- Thin content: añadir FAQs, ejemplos, capturas; 800–1200+ palabras por pieza; enriquecer con guías prácticas.
- Enlaces de baja calidad: usar `nofollow`; priorizar relevancia.
- CWV regresiones: monitorizar en GSC/CrUX; revertir cambios que afecten LCP/CLS/INP.

## Checklist Operativa (14 días)
- Día 1: Conectar GSC/GA4; publicar `robots.txt` y `sitemap.xml`; enviar sitemap; auditar 3 errores/21 avisos.
- Día 2–3: Optimizar metadatos; `canonical/OG/Twitter`; `Organization/WebSite` schema.
- Día 4–6: Publicar `/plantilla-solicitudes-creativas`, `/corrector-textos-ia` y hub `/herramientas-ia-copywriting`.
- Día 7–9: Difusión multicanal con UTM; 3–5 backlinks; actualizar títulos por CTR.
- Día 10–14: 2 artículos informativos; `FAQPage` en landings; revisar CWV; más enlaces.

## Señales de Confianza (E‑E‑A‑T)
- Página de autor y sobre nosotros; datos de contacto; política de privacidad/condiciones.
- Experiencia demostrable: ejemplos/casos; capturas de procesos y resultados.

## Criterios de Éxito y Plan B
- Éxito 14 días: ≥100 vistas únicas totales; ≥10 páginas válidas indexadas; CTR medio ≥2% en consultas con ≥50 impresiones.
- Si en día 7 las impresiones <300: reforzar difusión (2 post extras), añadir 5–10 enlaces internos desde home/hub, publicar 1 artículo adicional orientado a long‑tail.

## Entregables
- 2 landings + 4 artículos con metadatos y schema correctos.
- `robots.txt` y `sitemap.xml` actualizados; `canonical` consistente.
- Dashboard Looker Studio operativo; reporte semanal con decisiones (titles/meta/FAQs).