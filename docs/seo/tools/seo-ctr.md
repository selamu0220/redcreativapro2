# CTR Merge y Apply

Archivos de entrada:
- `docs/seo/analytics/ga-pages.csv` (exporta desde GA con columnas Path y CTR)
- `docs/seo/analytics/title-suggestions.md` (generado por `npm run seo:suggest`)

Comandos:
- Merge CTR con sugerencias: `npm run seo:merge:ctr`
  - Salida: `docs/seo/analytics/title-suggestions-with-ctr.md`
- Aplicar una sugerencia: `npm run seo:apply:suggest -- --id=slug --titleIndex=1 --metaIndex=1 --apply=true`
  - Actualiza `metadata.title/description`, `openGraph` y `twitter` del `app/blog/<id>/page.tsx`

Flujo recomendado:
1) Genera sugerencias: `npm run seo:suggest`
2) Exporta CTR y combina: `npm run seo:merge:ctr`
3) Elige variante con mejor CTR/beneficio y aplica: `npm run seo:apply:suggest ...`

