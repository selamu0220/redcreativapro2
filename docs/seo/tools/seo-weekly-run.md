# Ejecutar Acciones (seo:weekly:run)

Comando:
- `npm run seo:weekly:run -- --limit=5` (ejecuta hasta N comandos)
- `npm run seo:weekly:run -- --limit=5 --dry=true` (solo genera plan)
- Filtros: `--onlyCategory=creatividad` o `--excludeCategory=ia-educacion`
- Control: `--pauseMs=500` entre comandos, `--retries=1` reintentos por error
- Límite diario: `--maxDaily=10` (usa contador persistente por día)

Entrada:
- Usa el último `weekly-actions-YYYY-WW.md`

Salida:
- `docs/seo/analytics/logs/weekly-actions-run-YYYY-MM-WW.log` con resultados
- Plan en `*.plan` si `--dry=true`
- Contador: `docs/seo/analytics/logs/daily-run-counter.json` con `{ date, count }`
