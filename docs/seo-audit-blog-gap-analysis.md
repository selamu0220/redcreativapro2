# Auditoría SEO & GEO: "Cómo escribir artículos de blog" vs 200 Factores

Comparación entre tu página actual (`app/blog/escribir-articulos-blog-ia/page.tsx`) y la Checklist Maestra 2025.

## ✅ Lo que ya tienes (Aprobado)
*   **Factores Técnicos:**
    *   [x] **Metadata:** Title, Description, Keywords, OpenGraph y Twitter Cards configurados.
    *   [x] **Schema.org:** JSON-LD de tipo `Article` implementado correctamente.
    *   [x] **Estructura Semántica:** Uso correcto de `<header>`, `<article>`, `<h1>`, `<h2>`.
    *   [x] **Enlaces Internos:** Breadcrumbs/Volver ("Volver al Blog") y Call-to-Action interno.
    *   [x] **Multimedia:** Iconos SVG (`lucide-react`) para romper el texto.

## ⚠️ Lo que FALTA (Oportunidades Críticas)

### 1. Factores GEO (Para rankear en ChatGPT/IA)
*   [ ] **Estructura "Direct Answer":** El primer párrafo después del H1 es vago ("Metodología...").
    *   *Solución:* Añadir un párrafo de definición de <50 palabras: "Escribir artículos con IA es el proceso de..."
*   [ ] **Tabla de Contenidos (ToC):** No hay índice con enlaces ancla. Las IAs lo usan para entender la estructura.
*   [ ] **Tablas de Datos:** No hay tablas comparativas (ej: Escritura Humana vs IA). Las IAs *aman* las tablas.
*   [ ] **Citas de Autoridad:** No hay enlaces externos a estudios o fuentes confiables.

### 2. Factores de Contenido "High Intent"
*   [ ] **Autoría (E-E-A-T):** El JSON-LD dice "Selamu", pero no hay bio visible del autor con credenciales en la página.
*   [ ] **Fecha de Actualización:** Muestra "15 de mayo de 2025" hardcodeado. Debería ser dinámico o reflejar la última edición real.
*   [ ] **Profundidad:** El contenido es muy genérico ("lorem ipsum" style placeholders en algunas secciones). Faltan pasos accionables reales.

### 3. Factores de UX/Interacción
*   [ ] **Tiempo de Lectura Real:** Dice "min min de lectura" (error en el código).
*   [ ] **Barra de Progreso de Lectura:** No detectada.
*   [ ] **Botones de Compartir:** No detectados.

## 🚀 Plan de Acción Inmediato
1.  **Corregir el "Direct Answer":** Reescribir el intro.
2.  **Añadir Tabla de Contenidos:** Componente `TableOfContents`.
3.  **Añadir Bio de Autor:** Componente `AuthorBio` al final.
4.  **Insertar una Tabla Comparativa:** "Herramientas de IA vs Métodos Tradicionales".
