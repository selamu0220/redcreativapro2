# CLI seo:new — Crear artículos long‑tail

Uso básico:
- `npm run seo:new -- --id=slug --title="Titulo" --desc="Meta/Resumen" --tags=tag1,tag2`

Opcionales:
- `--category=creatividad` `--subcategory=marketing-digital` `--author=selamu`
- `--date=2025-12-02` `--readTime="10 min"` `--keywords="k1, k2"`
 - `--preset=ecommerce-belleza|saas-seguridad|educacion`

Qué hace:
- Crea `app/blog/<id>/page.tsx` con metadata, JSON‑LD y estructura escaneable
- Si se usa `--preset`, añade Pasos, Prompts y `FAQPage` acorde al nicho
- Inserta entrada en `lib/blog-data.ts` con `seoTitle/seoDescription/image`
 - Genera `docs/seo/pins/<id>.md` y `docs/seo/social/<id>-thread.md` automáticamente

Después:
- Añade pines y hilos usando `npm run seo:promote` (ver rutas en docs)
- Genera URLs para GSC con `npm run seo:gen`
