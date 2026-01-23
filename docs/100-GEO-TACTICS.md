# 100 Tácticas GEO: Cómo Ser Recomendado por IA

> **GEO** = Generative Engine Optimization  
> La guía definitiva para ser citado por ChatGPT, Gemini, Claude y Perplexity.
>
> ✅ = Implementado en Red Creativa Pro | ⏳ = Parcial | ❌ = Pendiente

---

## 🎯 Fundamentos de Citabilidad (1-15)

### Estructura de Respuesta Directa

1. ✅ **Comienza con definiciones** — Inicia cada sección con "X es..." para facilitar extracción por IA.
2. ⏳ **Formato pregunta-respuesta** — Usa títulos en forma de pregunta que simulen queries de usuarios.
3. ⏳ **Respuestas de 40-60 palabras** — El "snippet perfecto" para que la IA cite directamente.
4. ⏳ **TL;DR al inicio** — Resumen ejecutivo en las primeras líneas de cada artículo.
5. ⏳ **Conclusiones al final de cada sección** — No solo al final del artículo.

### Datos Únicos y Estadísticas

6. ⏳ **Incluye estadísticas propias** — "Según nuestro análisis de 500 empresas..."
7. ⏳ **Porcentajes específicos** — "73% de usuarios prefieren X" vs "la mayoría prefiere X".
8. ✅ **Fechas concretas** — "En enero 2025" vs "recientemente".
9. ⏳ **Cita fuentes con números** — "[1] Estudio de Harvard 2024".
10. ⏳ **Crea benchmarks propios** — Datos originales que solo tú tienes.

### Autoridad y Entidades

11. ⏳ **Menciona expertos por nombre** — "Según John Doe, CEO de X..."
12. ⏳ **Asocia tu marca con entidades conocidas** — Wikidata, Crunchbase, LinkedIn.
13. ✅ **Usa Schema.org Person** — Para autores con credenciales verificables. *(`app/components/seo/SchemaMarkup.tsx`)*
14. ⏳ **Knowledge Panel de Google** — Trabaja para obtener uno para tu marca.
15. ⏳ **Citas cruzadas** — Menciona otras autoridades del sector para crear red semántica.

---

## 📝 Contenido Citeable (16-35)

### Formatos que Funcionan

16. ✅ **Tablas comparativas** — Las IAs aman extraer datos tabulares.
17. ✅ **Listas numeradas** — "Los 5 pasos para..." son fácilmente citables.
18. ✅ **Definiciones en negrita** — **Término:** definición en formato consistente.
19. ⏳ **FAQ estructurado** — Mínimo 5 preguntas frecuentes por artículo. *(Schema FAQPage no implementado)*
20. ✅ **Guías paso a paso** — Numeradas, claras, con resultados esperados.

### Profundidad de Contenido

21. ✅ **Cobertura exhaustiva** — Responde TODAS las posibles preguntas sobre el tema.
22. ✅ **Evita contenido thin** — Mínimo 1,500 palabras para temas importantes. *(Artículos del blog son extensos)*
23. ✅ **Actualiza regularmente** — "Última actualización: [fecha]" visible.
24. ⏳ **Múltiples perspectivas** — Pro/con, alternativas, casos de uso.
25. ✅ **Ejemplos concretos** — Casos reales > teoría abstracta.

### Lenguaje y Tono

26. ✅ **Evita jerga innecesaria** — Claridad sobre complejidad.
27. ✅ **Voz activa** — "La IA procesa" vs "es procesado por la IA".
28. ✅ **Frases cortas** — Más fáciles de extraer y citar.
29. ✅ **Consistencia terminológica** — Usa el mismo término para el mismo concepto.
30. ✅ **Evita hipérboles** — "El mejor" genera desconfianza en IAs.

### Originalidad

31. ✅ **Coined terms** — Crea términos propios como "GEO™" o "Citabilidad™". *(Red Creativa Pro, StealthWrite)*
32. ⏳ **Frameworks únicos** — "El método de las 5C para..."
33. ⏳ **Investigación original** — Encuestas, análisis, estudios propios.
34. ⏳ **Perspectivas contrarias** — "Por qué X está equivocado sobre Y".
35. ⏳ **Predicciones** — Con fecha y métricas verificables.

---

## 🔧 Optimización Técnica (36-55)

### Schema Markup

36. ✅ **Article schema** — Con datePublished y dateModified. *(60+ artículos con jsonLd)*
37. ❌ **FAQPage schema** — Para todas las secciones de preguntas.
38. ⏳ **HowTo schema** — Para guías paso a paso. *(Algunos artículos lo tienen)*
39. ✅ **Person schema** — Para autores con sameAs a perfiles sociales.
40. ✅ **Organization schema** — Con logo, foundingDate, description. *(`SchemaMarkup.tsx`, `StructuredData.tsx`)*
41. ❌ **Speakable schema** — Para contenido optimizado para voz/IA.
42. ❌ **BreadcrumbList** — Para jerarquía de navegación clara.
43. ⏳ **WebPage schema** — Con lastReviewed y reviewedBy.

### Estructura HTML

44. ✅ **Jerarquía de headings** — H1 > H2 > H3 sin saltar niveles.
45. ✅ **Un solo H1 por página** — Que sea la pregunta principal.
46. ⏳ **IDs en headings** — Para deep linking y citación precisa.
47. ✅ **Tablas semánticas** — `<table>` con `<thead>` y `<tbody>`.
48. ✅ **Listas semánticas** — `<ol>` para orden, `<ul>` para conjuntos.
49. ✅ **`<article>` wrapper** — Delimita el contenido principal.
50. ⏳ **`<time datetime="">`** — Para todas las fechas.

### Performance

51. ✅ **LCP < 2.5s** — Las IAs priorizan sitios rápidos. *(Next.js optimizado)*
52. ✅ **Core Web Vitals verdes** — Señal de calidad técnica. *(Lighthouse audits)*
53. ✅ **Mobile-first** — Googlebot (usado por Gemini) es mobile-first. *(Responsive design)*
54. ✅ **Sin JavaScript crítico** — El contenido debe ser accesible sin JS. *(Server Components)*
55. ✅ **Sitemap XML actualizado** — Para descubrimiento eficiente. *(`app/sitemap.ts`, `app/blog/sitemap.xml/route.ts`)*

---

## 🤖 Acceso de Crawlers IA (56-70)

### robots.txt

56. ✅ **Permite GPTBot** — `User-agent: GPTBot` + `Allow: /`. *(`app/robots.ts` - Permite con restricciones)*
57. ❌ **Permite Claude-Web** — Para citaciones en Claude. *(No configurado)*
58. ❌ **Permite PerplexityBot** — El que más cita actualmente. *(No configurado)*
59. ✅ **Permite Googlebot** — Compartido con Gemini. *(Configurado)*
60. ❌ **Permite CCBot** — Para Common Crawl (usado en training). *(No configurado)*

### Decisiones Estratégicas

61. ✅ **Bloquea contenido premium si es necesario** — Pero ten contenido público citeable. *(/admin, /dashboard bloqueados)*
62. ⏳ **Crea contenido específico para IA** — `/ai/` o `/facts/` secciones.
63. ⏳ **Monitorea logs de crawlers** — ¿Qué páginas visitan las IAs?
64. ✅ **Rate limiting inteligente** — No bloquees accidentalmente bots buenos.
65. ✅ **URLs limpias** — `/tema-especifico/` > `/?p=123`. *(Blog con slugs limpios)*

### Metadatos

66. ✅ **Meta description citeable** — Que funcione como respuesta directa.
67. ✅ **Title con keyword principal** — Formato pregunta cuando aplique.
68. ✅ **Canonical claro** — Evita duplicación de señales.
69. ✅ **Open Graph completo** — Para cuando IAs muestran previews.
70. ✅ **hreflang correcto** — Si tienes versiones en múltiples idiomas. *(ES/EN implementado)*

---

## 🏛️ Construcción de Autoridad (71-85)

### Presencia Digital

71. ❌ **Wikipedia (si aplica)** — Solo para marcas notables, no spam.
72. ❌ **Wikidata** — Más accesible que Wikipedia, igual de importante.
73. ❌ **Google Knowledge Panel** — Verifica tu marca/persona.
74. ❌ **Crunchbase** — Para empresas tech.
75. ⏳ **LinkedIn verificado** — Para personas y empresas.

### Menciones y Citaciones

76. ⏳ **Digital PR** — Ser mencionado en medios como fuente.
77. ⏳ **Guest posting estratégico** — En sitios de alta autoridad.
78. ⏳ **Podcast appearances** — Con transcripciones publicadas.
79. ⏳ **Conferencias y charlas** — Con videos y transcripts.
80. ⏳ **Whitepapers y estudios** — Citeables por naturaleza.

### Consistencia de Marca

81. ✅ **NAP consistente** — Nombre, dirección, teléfono idénticos. *(Schema Organization)*
82. ✅ **Mismo logo en todos lados** — Consistencia visual.
83. ✅ **Bio unificada** — Descripción de empresa/persona idéntica.
84. ✅ **Enlaces sameAs** — Conecta todos tus perfiles en Schema. *(Schema Person con sameAs)*
85. ✅ **Firma de autor estandarizada** — En todos los contenidos.

---

## 📊 Medición y Tracking (86-95)

### Monitoreo de Citaciones

86. ⏳ **Busca tu marca en ChatGPT** — "¿Qué sabes sobre [tu marca]?"
87. ⏳ **Busca en Perplexity** — Revisa las fuentes citadas.
88. ⏳ **Google Alerts** — Para menciones de marca.
89. ⏳ **Busca "según [tu marca]"** — En todas las IAs.
90. ⏳ **Compara con competidores** — ¿Quién es citado más?

### Analytics Específicos

91. ⏳ **UTM para tráfico IA** — `utm_source=chatgpt` en enlaces.
92. ⏳ **Analiza referrers** — `chat.openai.com`, `perplexity.ai`.
93. ✅ **Tracking de páginas citadas** — ¿Cuáles generan más citaciones? *(GEO Analytics implementado)*
94. ⏳ **Tiempo de indexación** — ¿Cuánto tarda la IA en conocer tu contenido nuevo?
95. ✅ **Core Web Vitals dashboard** — Correlación con citaciones. *(Performance profiling)*

---

## 🚀 Tácticas Avanzadas (96-100)

96. ❌ **Crea un Custom GPT** — Sobre tu área de expertise usando tu contenido.
97. ❌ **API de tu conocimiento** — Que otras IAs puedan consultar programáticamente.
98. ❌ **Contenido en formato llms.txt** — Estándar emergente para contexto de IA.
99. ⏳ **Responde en foros** — Reddit, Quora, StackOverflow con enlaces a tu contenido.
100. ⏳ **Optimiza para voice search** — Las IAs de voz son el próximo campo de batalla.

---

## 📈 Resumen de Implementación

| Estado | Cantidad | Porcentaje |
|--------|----------|------------|
| ✅ **Completado** | 45 | 45% |
| ⏳ **Parcial** | 36 | 36% |
| ❌ **Pendiente** | 19 | 19% |

### 🔴 Prioridades Críticas (❌ que debes hacer YA)

| # | Táctica | Impacto |
|---|---------|---------|
| 37 | **FAQPage schema** | Alto - IAs extraen FAQ directamente |
| 41 | **Speakable schema** | Alto - Optimización para voz/IA |
| 42 | **BreadcrumbList** | Medio - Navegación clara |
| 57 | **Permitir Claude-Web** | Alto - Claude es muy usado |
| 58 | **Permitir PerplexityBot** | Crítico - El que más cita |
| 72 | **Wikidata** | Alto - Base de Knowledge Graphs |
| 98 | **llms.txt** | Medio - Estándar emergente |

### 🟡 Oportunidades Rápidas (⏳ → ✅)

| # | Táctica | Esfuerzo |
|---|---------|----------|
| 19 | Agregar FAQ con schema a artículos | Medio |
| 46 | IDs en headings para deep linking | Bajo |
| 50 | `<time datetime="">` en fechas | Bajo |
| 60 | Agregar CCBot a robots.ts | Bajo |

---

## 🎯 Checklist Rápido

```
[x] ¿Tiene respuesta directa en las primeras 60 palabras?
[ ] ¿Incluye al menos 3 estadísticas con fuente?
[ ] ¿Tiene FAQ con mínimo 5 preguntas + schema?
[x] ¿Schema Article + FAQPage implementado? (Solo Article)
[x] ¿Autor con credenciales y Schema Person?
[x] ¿"Última actualización" visible?
[~] ¿robots.txt permite GPTBot y PerplexityBot? (Solo GPTBot)
[x] ¿Core Web Vitals en verde?
[ ] ¿Título en formato pregunta cuando aplica?
[x] ¿Tablas o listas para datos comparables?
```

---

## 🛠️ Componentes GEO Existentes

Tu proyecto ya incluye estas herramientas de GEO:

| Componente | Ruta | Función |
|------------|------|---------|
| `GEOOptimizationPanel` | `app/components/GEOOptimizationPanel.tsx` | Panel de análisis GEO en tiempo real |
| `useGEOOptimization` | `hooks/useGEOOptimization.ts` | Hook con scoring E-E-A-T |
| `SchemaMarkup` | `app/components/seo/SchemaMarkup.tsx` | Schema Organization, Person, Article |
| `StructuredData` | `app/components/seo/StructuredData.tsx` | Datos estructurados dinámicos |
| `geo-optimization.ts` | `lib/geo-optimization.ts` | Lógica de optimización GEO |
| `robots.ts` | `app/robots.ts` | Control de crawlers IA |
| `sitemap.ts` | `app/sitemap.ts` | Sitemap dinámico |

---

> **Próximo paso recomendado:** Implementar robots.ts con PerplexityBot y Claude-Web, y agregar FAQPage schema a los artículos principales.

---

*Última actualización: Enero 2025*  
*Auditoría realizada sobre Red Creativa Pro*
