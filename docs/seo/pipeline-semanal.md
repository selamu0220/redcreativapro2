# Pipeline semanal de SEO y CTR

## Objetivo
- Priorizar acciones que aumenten impresiones y clics, mantener 100 visitas/día.

## Pasos
- Generar sugerencias de títulos/metas:
  - `node scripts/seo-suggest.js` → `docs/seo/analytics/title-suggestions.md`
- Detectar páginas con bajo CTR y planificar cambios:
  - `node scripts/seo-ctr-auto.js --mode=median --apply=false`
  - Revisar `docs/seo/analytics/ctr-auto-plan.md` y `ctr-change-plan.md`
- Aplicar ajustes manuales a 3–5 páginas con peor CTR:
  - Usar comandos sugeridos por plan o editar metadatos.
- Publicar y distribuir:
  - Caso de estudio en Reddit/Dev.to/IndieHackers con enlaces a la landing de la plantilla.
- Reporte semanal:
  - `scripts/seo-weekly-report.js` → `docs/seo/analytics/weekly-report-YYYY-WW.md`
  - `scripts/seo-weekly-summary.js` → `docs/seo/analytics/weekly-summary-YYYY-WW.md`
- Backlog de contenidos:
  - Añadir 2 long-tail y 1 evergreen (glosario/guía) por ciclo.

## Notas
- Mantener silos estrictos entre `creatividad`, `productividad`, `tecnologia`.
- Actualizar `dateModified` y contenido en piezas con caídas de CTR.
