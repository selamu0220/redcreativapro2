Objetivo y KPIs
- Alcanzar 100 vistas únicas en 14 días (y 300 en 30 días).
- Elevar CTR orgánico al ≥2% y bajar posición media a <25 en 30 días.
- Mejorar Site Health de 70% a ≥90% corrigiendo 3 errores y 21 avisos en 7 días.

Situación Actual
- Tráfico orgánico 0; 11 keywords; 360 impresiones; posición media 35,1; 13 backlinks; 7 páginas rastreadas.
- Consultas principales: “red creativa”, “red creativo”, “plantilla para solicitudes creativas”, “corrector de textos ia”, “ia para profesionales de escritura”, “textos automáticos”, “desarrollo de apis”, “creador de redacciones automático”, “herramientas avanzadas de inteligencia artificial para copywriting”.
- GA4 y GSC sin conexión; AI visibility n/a.

Plan de 4 Semanas (quick wins en 14 días)
- Semana 0 (Días 1-2): Instrumentación
  - Conectar Google Search Console y GA4; verificar propiedad DNS.
  - Publicar `sitemap.xml` y `robots.txt`; enviar sitemap en GSC; revisar cobertura.
  - Mapear 10 keywords prioritarias en España y asignarlas a URLs específicas.
- Semana 1 (Días 3-7): Técnica on-site
  - Optimizar `title` (≤60), `meta description` (120–155), `H1` único y jerarquía `H2/H3`.
  - Añadir `canonical`, `Open Graph`, `Twitter Cards`, `lang="es"` y `hreflang` si aplica.
  - Implementar `schema.org`: `Organization`, `WebSite+SearchAction`, `BreadcrumbList`, `Article` (blog).
  - Mejorar Core Web Vitals: imágenes `width/height` y `loading="lazy"`, fuentes locales, CSS crítico, dividir JS.
- Semana 2 (Días 8-14): Contenido e intención
  - Publicar 2 landings y 4 artículos orientados a queries actuales (ver Contenido).
  - Landing “Plantilla para solicitudes creativas” con descarga gratuita; CTA claro.
  - Página “Corrector de textos IA” (comparativa + guía); captar “corrector de textos ia”.
  - Internlinking: hub “Herramientas de IA para Copywriting”; breadcrumbs.
- Semana 3 (Días 15-21): Autoridad y distribución
  - 5–8 backlinks seguros: perfiles, directorios creativos/tech españoles, guest post en Medium/dev.to con canonical.
  - Difusión: 2 posts LinkedIn, 1 hilo en X, 2 comunidades (Reddit/Telegram), comentarios en blogs relevantes.
- Semana 4 (Días 22-30): Optimización continua
  - Revisar GSC: ajustar titles para subir CTR; 2 FAQs basadas en consultas de bajo click.
  - Ampliar cobertura: +2 artículos long-tail; `FAQPage` en landings.
  - Auditar enlaces rotos/duplicados; consolidar con canonical.

Arquitectura de Contenido
- Landings transaccionales:
  - `/` Propuesta clara: Herramientas/servicios de IA para redacción profesional.
  - `/plantilla-solicitudes-creativas` (keyword principal + descarga).
  - `/corrector-textos-ia` (comparativa/guía). 
  - `/herramientas-ia-copywriting` hub con listado y fichas.
- Artículos informativos (semana 2–4):
  - “Cómo usar IA para profesionales de escritura”.
  - “Textos automáticos: cuándo usarlos y cuándo no”.
  - “Desarrollo de APIs para proyectos creativos con IA”.
  - “Creador de redacciones automático: guía y ejemplos”.
- Estructura interna: breadcrumbs Home > Categoría > Página; CTA consistente.

Optimización Técnica
- `robots.txt`: permitir todo, bloquear `/admin` si existe; incluir `Sitemap: https://redcreativa.pro/sitemap.xml`.
- `sitemap.xml` dinámico con todas las URLs.
- `canonical` en cada página; evitar duplicados.
- `Open Graph/Twitter`: `og:title`, `og:description`, `og:image` (1200x630), `twitter:card=summary_large_image`.
- `schema.org`:
  - `Organization` (nombre, logo, contacto), `WebSite` + `SearchAction`.
  - `Article` en posts; `FAQPage` en secciones FAQ.
- Rendimiento: imágenes WebP/AVIF con `srcset/sizes` y `lazy`; CSS crítico inline; diferir JS; fuentes del sistema o precarga.

On-Page para subir CTR
- Titles sugeridos:
  - “Corrector de textos IA: guía práctica y ejemplos”.
  - “Plantilla para solicitudes creativas (descarga gratuita)”.
  - “Herramientas avanzadas de IA para copywriting [2025]”.
- Meta descriptions:
  - “Aprende a corregir texto con IA en minutos. Ejemplos, herramientas y buenas prácticas”.
  - “Descarga gratis la plantilla de solicitudes creativas. Mejora briefs y resultados”.
- Alinear H1 con intención de búsqueda; incluir beneficio.

Link Building Seguro
- Directorios y perfiles: Crunchbase, LinkedIn Company, GitHub org, Product Hunt, BetaList, About.me, directorios españoles (Domestika/Behance si aplica).
- Guest post en Medium/dev.to con canonical a tu sitio.
- Outreach amable: ofrecer la plantilla gratuita para conseguir enlaces.

Distribución (100 vistas en 14 días)
- Compartir la landing de la plantilla:
  - LinkedIn (empresa + personal), X (hilo), Reddit r/copywriting y r/marketing_es, grupos de Telegram/WhatsApp de redactores.
- Banner en home “Descarga gratuita”.
- Newsletter (Buttondown/Substack): 1 envío con la plantilla y guía.
- UTM en todos los enlaces para medir fuentes.

Medición y Cadencia
- Diario: `site:redcreativa.pro` en Google, cobertura en GSC, indexación.
- Semanal: CTR y posición por consulta; actualizar titles de las 5 peores páginas por CTR.
- Tablero en Looker Studio: GA4 + GSC; métricas clave (usuarios, sesiones, CTR, impresiones, top páginas/consultas).

Riesgos y Mitigación
- Indexación lenta: usar “Inspeccionar URL” en GSC; enlazar desde home y sitemap; difusión social.
- Thin content: añadir FAQs, ejemplos y capturas; mínimo 800–1200 palabras por pieza informativa.
- Enlaces de baja calidad: usar `rel="nofollow"` donde convenga; priorizar relevancia temática.

Checklist Operativa (14 días)
- Día 1: Conectar GSC/GA4; publicar `robots.txt` y `sitemap.xml`; enviar sitemap; auditar 3 errores/21 avisos.
- Día 2–3: Optimizar metadatos + `canonical/OG/Twitter` en todas las páginas; `Organization/WebSite` schema.
- Día 4–6: Publicar `/plantilla-solicitudes-creativas`, `/corrector-textos-ia` y hub `/herramientas-ia-copywriting`.
- Día 7–9: Difusión multicanal con UTM; 3–5 backlinks seguros; actualizar títulos por CTR.
- Día 10–14: 2 artículos informativos; FAQs con `FAQPage`; revisar Core Web Vitals; más enlaces.
## Acciones técnicas realizadas
- Silos y taxonomía corregidos; relacionados con scoring mejorado.
- BreadcrumbList consolidado en posts y plantillas.
- Glosario creado e integrado en sitemap.
- CLS mitigado en pagos y banners; LCP revisado.
- Backlog long-tail creado (20 temas) y 3 borradores publicados.
- Descarga de plantilla migrada a lead magnet con email.
- Scripts añadidos: validación de taxonomía y plan de frescura.
- Títulos/metas aplicados a 3 nuevos artículos y plan CTR generado.
