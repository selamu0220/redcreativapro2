# Script: SEO Technical Audit
# Autor: Claude (Opencode)
# Fecha: Febrero 2026
# Descripción: Script para auditar configuraciones SEO técnicas

#!/bin/bash

echo "=========================================="
echo "SEO TECHNICAL AUDIT - Red Creativa Pro"
echo "=========================================="
echo ""

DOMAIN="https://redcreativa.pro"
SITEMAP_URL="$DOMAIN/sitemap.xml"

echo "Iniciando auditoría para: $DOMAIN"
echo "Fecha: $(date)"
echo ""

# ==========================================
# 1. VERIFICAR SSL/HTTPS
# ==========================================
echo "🔒 [1/15] Verificando SSL Certificate..."
if curl -s --head "$DOMAIN" | grep -q "200"; then
    echo "✅ SSL activo - Dominio accesible"
else
    echo "❌ ERROR: Dominio no accesible o sin SSL"
fi
echo ""

# ==========================================
# 2. VERIFICAR SITEMAP
# ==========================================
echo "🗺️  [2/15] Verificando sitemap.xml..."
if curl -s "$SITEMAP_URL" | grep -q "<urlset"; then
    echo "✅ Sitemap.xml existe y es válido"
    URL_COUNT=$(curl -s "$SITEMAP_URL" | grep -o "<url>" | wc -l)
    echo "   📊 URLs en sitemap: $URL_COUNT"
else
    echo "❌ ERROR: Sitemap.xml no encontrado o inválido"
fi
echo ""

# ==========================================
# 3. VERIFICAR ROBOTS.TXT
# ==========================================
echo "🤖 [3/15] Verificando robots.txt..."
ROBOTS_URL="$DOMAIN/robots.txt"
if curl -s "$ROBOTS_URL" | grep -q "User-agent"; then
    echo "✅ robots.txt existe"
    if curl -s "$ROBOTS_URL" | grep -q "Sitemap"; then
        echo "   ✅ Referencia a sitemap incluida"
    else
        echo "   ⚠️  ADVERTENCIA: Falta referencia a sitemap"
    fi
else
    echo "❌ ERROR: robots.txt no encontrado"
fi
echo ""

# ==========================================
# 4. VERIFICAR FAVICON
# ==========================================
echo "🎨 [4/15] Verificando favicon..."
FAVICON_URL="$DOMAIN/favicon.ico"
if curl -s --head "$FAVICON_URL" | grep -q "200"; then
    echo "✅ Favicon existe"
else
    echo "⚠️  ADVERTENCIA: Favicon no encontrado en /favicon.ico"
fi
echo ""

# ==========================================
# 5. CHECK META TAGS BÁSICOS
# ==========================================
echo "🏷️  [5/15] Verificando meta tags..."
HTML=$(curl -s "$DOMAIN")

if echo "$HTML" | grep -q "<title>"; then
    TITLE=$(echo "$HTML" | grep -oP '(?<=<title>)[^<]+')
    TITLE_LENGTH=${#TITLE}
    echo "   📄 Title: $TITLE"
    echo "   📏 Longitud: $TITLE_LENGTH caracteres"
    if [ $TITLE_LENGTH -lt 50 ] || [ $TITLE_LENGTH -gt 60 ]; then
        echo "   ⚠️  ADVERTENCIA: Title debería ser 50-60 caracteres"
    else
        echo "   ✅ Longitud de title óptima"
    fi
else
    echo "   ❌ ERROR: No se encontró title tag"
fi

if echo "$HTML" | grep -q 'name="description"'; then
    DESC=$(echo "$HTML" | grep -oP '(?<=name="description" content=")[^"]+')
    DESC_LENGTH=${#DESC}
    echo "   📝 Meta Description: $DESC"
    echo "   📏 Longitud: $DESC_LENGTH caracteres"
    if [ $DESC_LENGTH -lt 150 ] || [ $DESC_LENGTH -gt 160 ]; then
        echo "   ⚠️  ADVERTENCIA: Description debería ser 150-160 caracteres"
    else
        echo "   ✅ Longitud de description óptima"
    fi
else
    echo "   ❌ ERROR: No se encontró meta description"
fi
echo ""

# ==========================================
# 6. VERIFICAR OPEN GRAPH
# ==========================================
echo "📱 [6/15] Verificando Open Graph tags..."
if echo "$HTML" | grep -q 'property="og:title"'; then
    echo "✅ og:title presente"
else
    echo "⚠️  Falta og:title"
fi

if echo "$HTML" | grep -q 'property="og:description"'; then
    echo "✅ og:description presente"
else
    echo "⚠️  Falta og:description"
fi

if echo "$HTML" | grep -q 'property="og:image"'; then
    echo "✅ og:image presente"
else
    echo "⚠️  Falta og:image"
fi
echo ""

# ==========================================
# 7. VERIFICAR CANONICAL TAGS
# ==========================================
echo "🔗 [7/15] Verificando canonical tags..."
if echo "$HTML" | grep -q 'rel="canonical"'; then
    CANONICAL=$(echo "$HTML" | grep -oP '(?<=rel="canonical" href=")[^"]+')
    echo "✅ Canonical tag presente: $CANONICAL"
else
    echo "⚠️  ADVERTENCIA: No se encontró canonical tag"
fi
echo ""

# ==========================================
# 8. CHECK H1 TAGS
# ==========================================
echo "🎯 [8/15] Verificando H1 tags..."
H1_COUNT=$(echo "$HTML" | grep -o "<h1" | wc -l)
echo "   Número de H1 tags: $H1_COUNT"
if [ $H1_COUNT -eq 1 ]; then
    H1_TEXT=$(echo "$HTML" | grep -oP '(?<=<h1>)[^<]+' | head -1)
    echo "   ✅ Un solo H1 (correcto)"
    echo "   📝 Texto H1: $H1_TEXT"
elif [ $H1_COUNT -eq 0 ]; then
    echo "   ❌ ERROR: No se encontró H1 tag"
else
    echo "   ⚠️  ADVERTENCIA: Múltiples H1 tags encontrados"
fi
echo ""

# ==========================================
# 9. VERIFICAR IMAGES SIN ALT
# ==========================================
echo "🖼️  [9/15] Verificando imágenes sin alt text..."
IMG_COUNT=$(echo "$HTML" | grep -o "<img" | wc -l)
IMG_NO_ALT=$(echo "$HTML" | grep "<img" | grep -v "alt=" | wc -l)
echo "   Total imágenes: $IMG_COUNT"
echo "   Imágenes sin alt: $IMG_NO_ALT"
if [ $IMG_NO_ALT -eq 0 ]; then
    echo "✅ Todas las imágenes tienen alt text"
else
    echo "⚠️  $IMG_NO_ALT imágenes sin alt text"
fi
echo ""

# ==========================================
# 10. CHECK SCHEMA MARKUP
# ==========================================
echo "📋 [10/15] Verificando Schema markup..."
if echo "$HTML" | grep -q "application/ld+json"; then
    SCHEMA_COUNT=$(echo "$HTML" | grep -o "application/ld+json" | wc -l)
    echo "✅ Schema markup presente ($SCHEMA_COUNT instancias)"
else
    echo "⚠️  No se encontró Schema markup JSON-LD"
fi
echo ""

# ==========================================
# 11. VERIFICAR VIEWPORT (Mobile)
# ==========================================
echo "📱 [11/15] Verificando viewport meta tag..."
if echo "$HTML" | grep -q 'name="viewport"'; then
    echo "✅ Viewport meta tag presente"
else
    echo "❌ ERROR: Falta viewport meta tag (crítico para mobile)"
fi
echo ""

# ==========================================
# 12. CHECK CHARSET
# ==========================================
echo "🔤 [12/15] Verificando charset..."
if echo "$HTML" | grep -q "charset=utf-8" || echo "$HTML" | grep -q "charset=UTF-8"; then
    echo "✅ UTF-8 charset configurado"
else
    echo "⚠️  Verificar configuración de charset"
fi
echo ""

# ==========================================
# 13. VERIFICAR CSS/JS MINIFICADOS (básico)
# ==========================================
echo "⚡ [13/15] Verificando recursos..."
CSS_COUNT=$(echo "$HTML" | grep -o "\.css" | wc -l)
JS_COUNT=$(echo "$HTML" | grep -o "\.js" | wc -l)
echo "   Archivos CSS: $CSS_COUNT"
echo "   Archivos JS: $JS_COUNT"
if [ $CSS_COUNT -gt 5 ] || [ $JS_COUNT -gt 5 ]; then
    echo "⚠️  Considerar concatenar/minificar recursos"
else
    echo "✅ Número de recursos optimizado"
fi
echo ""

# ==========================================
# 14. CHECK GOOGLE ANALYTICS
# ==========================================
echo "📊 [14/15] Verificando Google Analytics..."
if echo "$HTML" | grep -q "google-analytics" || echo "$HTML" | grep -q "gtag"; then
    echo "✅ Google Analytics detectado"
else
    echo "⚠️  No se detectó Google Analytics"
fi
echo ""

# ==========================================
# 15. RESUMEN
# ==========================================
echo "=========================================="
echo "📊 RESUMEN DE AUDITORÍA"
echo "=========================================="
echo ""
echo "✅ Completado: Verifica cada punto arriba"
echo "⚠️  Advertencias: Requiere atención"
echo "❌ Errores: Deben corregirse inmediatamente"
echo ""
echo "Próximos pasos:"
echo "1. Corregir todos los errores marcados con ❌"
echo "2. Atender advertencias marcadas con ⚠️"
echo "3. Re-ejecutar script después de correcciones"
echo ""
echo "=========================================="
echo "Auditoría completada: $(date)"
echo "=========================================="
