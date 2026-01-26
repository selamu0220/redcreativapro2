# Conexión GA4 y GSC

## GA4
- Crear propiedad y Data Stream Web
- Añadir `NEXT_PUBLIC_GA_MEASUREMENT_ID` en `.env.local`
- Opcional: `NEXT_PUBLIC_ENABLE_GA=true` para staging
- Eventos recomendados: `cta_download`, `cta_contact`, `newsletter_subscribe`

## GSC
- Verificar propiedad via DNS
- Publicar `robots.txt` y `sitemap.xml`
- Enviar `sitemap.xml` y revisar Cobertura, Rendimiento
- Usar “Inspeccionar URL” tras publicar nuevas páginas

## Looker Studio
- Fuente: GA4 + GSC
- Métricas clave: usuarios, sesiones, CTR, impresiones, top páginas/consultas, posición media
- Panel semanal para decisiones (titles/meta/FAQs)
