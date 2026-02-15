# 🔍 Diagnóstico SEO Inteligente - Red Creativa Pro

Este sistema de scripts automatiza el diagnóstico y corrección de problemas de indexación en tu sitio.

## 📊 Problema Identificado

Tu sitemap tiene **1,158 URLs** pero muchas devuelven **404** porque:
1. Las URLs existen en el sitemap pero NO en la base de datos
2. Hay inconsistencias entre www y non-www
3. URLs de idiomas sin contenido real

## 🚀 Scripts Disponibles

### 1. `npm run seo:diagnostic` - Diagnóstico Masivo
Verifica el estado HTTP de TODAS las URLs en tu sitemap.

```bash
npm run seo:diagnostic
```

**Qué hace:**
- Descarga el sitemap.xml
- Verifica 1,158 URLs (200 vs 404)
- Genera reportes en `/reports/`
- Identifica URLs fantasmas

**Output:**
- `reports/urls-200-ok.txt` - URLs que funcionan
- `reports/urls-404-error.txt` - URLs con error
- `reports/seo-diagnostic-{fecha}.txt` - Reporte completo

---

### 2. `npm run seo:compare-db` - Comparar con Supabase
Compara URLs del sitemap contra posts reales en la base de datos.

```bash
# Configurar variables de entorno primero:
set NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
set NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key

npm run seo:compare-db
```

**Qué hace:**
- Consulta tabla `blog_posts` en Supabase
- Compara slugs con URLs del sitemap
- Identifica discrepancias

**Output:**
- Lista de URLs fantasmas (en sitemap, no en BD)
- Lista de posts en BD pero no en sitemap
- Distribución por idiomas

---

### 3. `npm run seo:sitemap:clean` - Generar Sitemap Limpio
Crea un sitemap.xml SOLO con URLs que existen en la base de datos.

```bash
set NEXT_PUBLIC_SUPABASE_URL=xxx
set NEXT_PUBLIC_SUPABASE_ANON_KEY=yyy

npm run seo:sitemap:clean
```

**Qué hace:**
- Lee posts de Supabase
- Genera sitemap limpio en `public/sitemap-clean.xml`
- Excluye URLs fantasmas
- Incluye alternates para idiomas

---

### 4. `npm run seo:reindex` - Cola de Reindexación
Prepara URLs para solicitar indexación manual en Google Search Console.

```bash
npm run seo:reindex -- --limit=50 --filter=blog
```

**Opciones:**
- `--urls=archivo.txt` - Archivo con URLs (default: urls-200-ok.txt)
- `--limit=50` - Máximo de URLs a procesar
- `--filter=blog` - Solo URLs que contengan "blog"
- `--delay=2000` - Milisegundos entre requests

**Output:**
- `reports/reindex-queue-{fecha}.json` - Cola de indexación
- `reports/gsc-commands-{fecha}.txt` - URLs para GSC
- `reports/indexing-api-script-{fecha}.py` - Script Python para Indexing API

---

## 📋 Plan de Acción Recomendado

### FASE 0: Diagnóstico (Hacer AHORA)

```bash
# Paso 1: Ejecutar diagnóstico completo
npm run seo:diagnostic

# Paso 2: Comparar con base de datos
set NEXT_PUBLIC_SUPABASE_URL=https://zqqvwjkvopitfhgjtdqg.supabase.co
set NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
npm run seo:compare-db
```

**Tiempo estimado:** 5-10 minutos

**Resultado esperado:**
- Lista de URLs que realmente funcionan
- Lista de URLs fantasmas a eliminar
- Entendimiento del alcance del problema

---

### FASE 1: Corrección Crítica (Hoy mismo)

#### Opción A: Generar Sitemap Limpio (RECOMENDADO)

```bash
# Generar sitemap solo con URLs reales
npm run seo:sitemap:clean

# Revisar el archivo generado
notepad public/sitemap-clean.xml

# Si está correcto, reemplazar el sitemap
move public\sitemap-clean.xml public\sitemap.xml

# Regenerar con next-sitemap
npm run build
```

#### Opción B: Configurar Redirecciones www → non-www

Edita `next.config.mjs`:

```javascript
async redirects() {
  return [
    {
      source: "/:path*",
      has: [{ type: "host", value: "www.redcreativa.pro" }],
      destination: "https://redcreativa.pro/:path*",
      permanent: true
    }
  ];
}
```

#### Opción C: Eliminar URLs de Idiomas sin Contenido

Edita `next-sitemap.config.js` y comenta las líneas de idiomas que no tienen posts:

```javascript
alternateRefs: [
  // { href: 'https://redcreativa.pro/en', hreflang: 'en' }, // Sin contenido aún
  // { href: 'https://redcreativa.pro/de', hreflang: 'de' }, // Sin contenido aún
  // Solo español por ahora:
  { href: 'https://redcreativa.pro', hreflang: 'es' },
],
```

**Tiempo estimado:** 15-30 minutos

---

### FASE 2: Reindexación Manual (Mañana)

```bash
# Generar cola de indexación (top 50 URLs)
npm run seo:reindex -- --limit=50

# Abrir el archivo de comandos
notepad reports\gsc-commands-*.txt
```

**Proceso manual en Google Search Console:**
1. Ve a https://search.google.com/search-console
2. Selecciona tu propiedad: `redcreativa.pro`
3. Para cada URL en la lista:
   - Copia la URL de inspección
   - Pégala en el navegador
   - Espera el análisis
   - Click "Solicitar Indexación"
   - Espera confirmación (~30 segundos)
   - Pasa a la siguiente URL

**Tiempo estimado:** 30-45 minutos para 50 URLs

**IMPORTANTE:**
- No envíes más de 100 URLs por día manualmente
- Prioriza homepage y posts más importantes
- Espaciar requests 30-60 segundos

---

### FASE 3: Monitoreo (Semanal)

Configura recordatorio para revisar GSC cada semana:

```bash
# Crear tarea programada (Windows)
schtasks /create /tn "SEO-Weekly-Check" /tr "node scripts/seo-diagnostic.js" /sc weekly /d SUN /st 09:00
```

**Qué revisar:**
- Páginas "Discovered - currently not indexed"
- Páginas "Crawled - currently not indexed"
- Nuevos errores 404
- Core Web Vitals

---

## 🔧 Variables de Entorno

Crea un archivo `.env.local` con:

```env
# Supabase (Obligatorio para scripts de BD)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key

# Site URL (Opcional, default: https://redcreativa.pro)
NEXT_PUBLIC_SITE_URL=https://redcreativa.pro
```

---

## 📈 Métricas de Éxito

Después de implementar las correcciones, deberías ver:

| Métrica | Antes | Después (Objetivo) |
|---------|-------|-------------------|
| URLs en sitemap | 1,158 | < 100 (solo reales) |
| URLs con 404 | ~1,000+ | 0 |
| Páginas indexadas | Bajo | > 80% de URLs reales |
| "Discovered not indexed" | Alto | < 10 |
| Core Web Vitals | ? | LCP <2.5s, CLS <0.1 |

---

## 🆘 Solución de Problemas

### "No se encontraron posts en la base de datos"
Verifica que:
- Las credenciales de Supabase son correctas
- La tabla se llama `blog_posts`
- Los posts tienen `published_at` no nulo

### "Error: Cannot find module '@supabase/supabase-js'"
Instala la dependencia:
```bash
npm install @supabase/supabase-js
```

### "Timeout al verificar URLs"
Reduce el número de requests simultáneos:
```bash
# Editar scripts/seo-diagnostic.js
const CONCURRENCY = 5; // Reducir de 10 a 5
```

---

## 📞 Siguientes Pasos

1. **Ejecuta el diagnóstico AHORA:**
   ```bash
   npm run seo:diagnostic
   ```

2. **Comparte los resultados:**
   - reports/seo-diagnostic-*.txt
   - reports/urls-404-error.txt

3. **Decide la estrategia:**
   - ¿Cuántas URLs reales tienes?
   - ¿Cuántas son fantasmas?
   - ¿Prefieres crear contenido o limpiar el sitemap?

4. **Implementa las correcciones** siguiendo las Fases 1-3

---

## 📚 Recursos Adicionales

- [Google Search Console](https://search.google.com/search-console)
- [Guía de Indexación de Google](https://developers.google.com/search/docs/fundamentals/how-search-works)
- [Indexing API Documentation](https://developers.google.com/search/apis/indexing-api/v3/quickstart)

---

**¿Listo para comenzar?** Ejecuta:
```bash
npm run seo:diagnostic
```

Y comparte el reporte generado en `reports/` para analizar los resultados.
