# CTR Auto — Plan y Aplicación

Comando:
- `npm run seo:ctr:auto -- --threshold=1.5` (umbral fijo, genera plan)
- `npm run seo:ctr:auto -- --mode=median --delta=0.2` (umbral dinámico: mediana*(1-delta))
- `npm run seo:ctr:auto -- --mode=median --delta=0.2 --maxApply=5 --apply=true` (aplica cambios a un máximo de N páginas)
- `npm run seo:ctr:auto -- --mode=median --delta=0.2 --maxApply=5 --minAgeDays=14 --apply=true` (excluye páginas recientes)
 - Filtros de categoría: `--onlyCategory=creatividad` o `--excludeCategory=ia-educacion`

Entrada:
- `docs/seo/analytics/ga-pages.csv` (Path, CTR)

Salida:
- `docs/seo/analytics/ctr-auto-plan.md` con páginas bajo umbral y comandos sugeridos
- Si `--apply=true`, actualiza títulos/meta en `app/blog/<id>/page.tsx`
- Resumen diario: `docs/seo/analytics/ctr-auto-summary-YYYY-MM-DD.md`
 - Plan de cambios pendiente (si `--apply=false`): `docs/seo/analytics/ctr-change-plan.md`
