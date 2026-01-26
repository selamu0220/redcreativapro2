# Reporte Semanal (seo:weekly)

Comando:
- `npm run seo:weekly -- --minAgeDays=14 --limit=10`
- Filtros de categoría: `--onlyCategory=creatividad` o `--excludeCategory=ia-educacion`

Entrada:
- `docs/seo/analytics/ga-pages.csv` (Path, CTR)

Salida:
- `docs/seo/analytics/weekly-report-YYYY-WW.md` con las páginas de menor CTR, recomendaciones y resúmenes aplicados recientes.
 - `docs/seo/analytics/weekly-summary-YYYY-WW.md` con top 5 por categoría (rápido para alertas).
