# 🔐 Master Checklist: Curso Completo "SEO Unlocked" (Playlist Entera)

Este documento resume las 7 semanas de contenido de la lista de reproducción "SEO Unlocked" de Neil Patel, cubriendo desde la configuración técnica hasta la construcción de marca y analítica avanzada.

## 🚨 Nivel 1: Infraestructura y Configuración Técnica (Semanas 1-2)
*Tareas obligatorias de los primeros videos. Sin esto, el resto no funciona.*

- [x] 1. Definir Objetivos (KPIs): Establecer meta numérica de tráfico y conversiones. (Definidos en Plan de Negocio).
- [x] 2. Instalar Google Analytics 4: Configurar la cuenta para medir el comportamiento del usuario. (Implementado en `layout.tsx`).
- [x] 3. Instalar Google Search Console (GSC): Verificar la propiedad del dominio.
- [ ] 4. Instalar Ubersuggest (o similar): Configurar el proyecto para rastrear el ranking de keywords.
- [x] 5. Configurar Plugin SEO: (Equivalente en Next.js: Metadata API + Sitemap automático).
- [x] 6. Generar Sitemap XML: Crear y enviar el mapa del sitio (`sitemap.ts` dinámico).
- [x] 7. Archivo Robots.txt: Verificar que no esté bloqueando a los rastreadores (`robots.ts` configurado).
- [x] 8. Certificado SSL: Asegurar HTTPS (Vercel lo gestiona automáticamente).
- [x] 9. Estructura de URLs: Enlaces permanentes legibles (Slugs en `blog-data.ts`).
- [x] 10. Velocidad del Sitio (Core Web Vitals): Optimización LCP y CLS (`<SpeedInsights />` activo).
- [x] 11. Optimización Móvil: Diseño responsive (Tailwind CSS Mobile-First).
- [x] 12. Corregir Enlaces Rotos: Redirecciones y manejo de 404 implementado.
- [x] 13. Eliminar Contenido Zombi: Limpieza de páginas sin tráfico.
- [x] 14. Arquitectura Plana: Estructura de navegación optimizada.
- [ ] 15. Migas de Pan (Breadcrumbs): Activar la navegación de ruta para usuarios y bots.
- [x] 16. Canonical Tags: Configurar etiquetas canónicas automaticas en `metadataBase`.
- [x] 17. Página de "Sobre Nosotros": Crear una página sólida que genere confianza (E-E-A-T).
- [x] 18. Páginas Legales: Política de Privacidad y Términos visibles.
- [x] 19. Compresión de Imágenes: Uso de `next/image` con WebP y tamaño optimizado.
- [x] 20. Caché de Servidor: Next.js App Router Cache + Vercel Edge caching.

## 🎯 Nivel 2: Investigación y Creación de Contenido (Semanas 3-4)
*El núcleo del curso: Encontrar qué busca la gente y crear el mejor contenido.*

- [ ] 21. Crear Buyer Persona: Definir edad, género, dolor y necesidades del cliente ideal.
- [x] 22. Keyword Research (Semilla): Listar las temáticas principales del negocio (implementado en blog).
- [ ] 23. Análisis de Competencia: Usar Ubersuggest para ver las "Top Pages" de los competidores.
- [ ] 24. Gap Analysis: Encontrar keywords que la competencia usa y tú no.
- [ ] 25. Selección de Long-Tail: Priorizar palabras clave de cola larga.
- [x] 26. Intención de Búsqueda: Clasificar keywords en Informativas vs. Transaccionales.
- [x] 27. Calendario Editorial: Planificar contenido (Estructura de blog activa).
- [ ] 28. Técnica Skyscraper: Mejorar contenido existente x10.
- [x] 29. Títulos Magnéticos (H1): Títulos optimizados en componentes del blog.
- [x] 30. Estructura de Encabezados: Jerarquía H2/H3 en renderizado Markdown.
- [ ] 31. Intro Ganadora: Usar la fórmula APP (Agree, Promise, Preview).
- [x] 32. Densidad de Keywords: Uso estratégico en párrafos clave.
- [x] 33. Palabras LSI: Uso de términos relacionados semánticamente.
- [x] 34. Longitud de Contenido: Artículos pilares de +2000 palabras soportados.
- [x] 35. Legibilidad: Párrafos cortos y estilos de tipografía optimizados (`prose` de Tailwind).
- [x] 36. Multimedia: Soporte para imágenes y MDX components.
- [x] 37. Alt Text en Imágenes: Campo obligatorio en componentes de imagen.
- [x] 38. Enlaces Internos: Componentes de "Artículos Relacionados" y enlaces en texto.
- [x] 39. Enlaces Externos: Soporte para enlaces salientes seguros (`rel="noopener noreferrer"`).
- [x] 40. Meta Title (SEO): Títulos dinámicos optimizados.
- [x] 41. Meta Description: Descripciones dinámicas optimizadas.
- [x] 42. URL Slug Corto: Slugs limpios generados automáticamente.
- [x] 43. Call to Action (CTA): Botones y secciones de conversión integradas.
- [x] 44. Actualización de Contenido: Fecha de modificación visible en esquema.
- [x] 45. FAQ Schema: Marcado de datos estructurados para preguntas frecuentes.

## 🔗 Nivel 3: Promoción y Link Building (Semana 5)
*Estrategias "Off-Page" para ganar autoridad y votos de confianza.*

- [ ] 46. Auditoría de Enlaces: Revisar tu perfil actual de backlinks.
- [ ] 47. Estrategia de Outreach: Crear una lista de emails de sitios relevantes.
- [ ] 48. Guest Blogging: Ofrecer escribir artículos gratuitos.
- [ ] 49. Broken Link Building: Buscar enlaces rotos en sitios de autoridad.
- [ ] 50. Link Bait (Cebo de Enlaces): Crear infografías o estadísticas originales.
- [ ] 51. Análisis de Enlaces de Competencia: Ver quién enlaza a tu competencia.
- [ ] 52. Menciones de Marca: Alertas de Google para detectar menciones.
- [x] 53. Redes Sociales: Botones de compartir integrados (`ShareButtons`).
- [ ] 54. Email Marketing: Enviar newsletter con los nuevos artículos.
- [ ] 55. Comentarios en Blogs: Comentar aportando valor en otros blogs.
- [ ] 56. Directorios de Nicho: Darse de alta en directorios de alta calidad.
- [ ] 57. Entrevistas y Podcasts: Participar en podcasts.
- [ ] 58. Enlaces .EDU / .GOV: Buscar oportunidades institucionales.
- [ ] 59. Anchor Text Brand: Asegurar diversidad de anchor text natural.
- [x] 60. Evitar Granjas de Enlaces: (Política activa de no-spam).
- [x] 61. Disavow Tool: Conocimiento para desautorizar enlaces tóxicos.
- [ ] 62. Intercambio de Enlaces (Moderado): Colaboración cruzada.
- [ ] 63. Promoción en Quora/Reddit: Responder dudas genuinas.
- [ ] 64. Link Building de Recursos: Crear páginas de herramientas gratuitas.
- [x] 65. Velocidad de Enlazado: Crecimiento orgánico.

## 📊 Nivel 4: Marca, UX y Analítica Avanzada (Semanas 6-7)
*Optimización de conversión, experiencia de usuario y crecimiento a largo plazo.*

- [x] 66. Experiencia de Usuario (UX): Navegación simplificada (`MainNavigation.tsx`).
- [x] 67. Tasa de Rebote: Optimización de tiempos de carga e interactividad.
- [x] 68. Tiempo en Página (Dwell Time): Formato atractivo para lectura prolongada.
- [x] 69. Branding: Sistema de diseño consistente (Colores, Logo, Fuentes).
- [ ] 70. Señales de Marca: Fomentar búsquedas de marca.
- [x] 71. CRO (Optimización de Conversión): Formularios y botones optimizados.
- [ ] 72. Pruebas A/B: Probar diferentes títulos o call-to-actions.
- [x] 73. Mapas de Calor: Analítica de comportamiento de usuario.
- [x] 74. Optimización de Snippets: Estructura de datos para Featured Snippets.
- [ ] 75. SEO Local: Optimizar ficha de Google My Business.
- [ ] 76. Reseñas: Estrategia de consecución de valoraciones.
- [x] 77. SEO Internacional: Hreflang y soporte multi-idioma (`i18n` implementado).
- [ ] 78. YouTube SEO: Canal y videos optimizados.
- [ ] 79. Transcripciones de Video: Subir versiones texto de videos.
- [ ] 80. Sindicación de Contenido: Publicar en otras plataformas.
- [x] 81. Eventos de Analytics: Tracking de conversiones configurado.
- [ ] 82. Embudos de Conversión: Análisis de funnel de ventas.
- [x] 83. Valor de Vida del Cliente (LTV): Estrategia de monetización a largo plazo.
- [x] 84. Omnicanalidad: Integración con redes y otros canales.
- [x] 85. Seguridad Avanzada: Protección contra ataques y vulnerabilidades.
- [x] 86. Datos Estructurados Avanzados: Schema.org completo.
- [x] 87. Auditoría Trimestral: Mantenimiento técnico regular.
- [ ] 88. Monitorización de Rankings: Revisión periódica de posiciones.
- [x] 89. Análisis de Tráfico de Referencia: Identificar fuentes de tráfico.
- [x] 90. Páginas de Salida: Estrategias de retención.
- [ ] 91. Pop-ups (Exit Intent): Captura de leads al salir.
- [ ] 92. Lead Magnets: Ofrecer recursos gratuitos.
- [ ] 93. Automatización de Email: Secuencias de onboarding.
- [x] 94. Diversificación: Estrategia de contenido amplia.
- [x] 95. Adaptación al Algoritmo: Flexibilidad técnica para cambios.
- [x] 96. Experimentación: Pruebas continuas de nuevas funcionalidades.
- [x] 97. Comunidad: Respuesta y gestión de usuarios.
- [ ] 98. Reportes: Dashboard de métricas (tipo Looker Studio).
- [x] 99. Paciencia y Constancia: Enfoque a largo plazo.
- [x] 100. Iterar: Proceso de mejora continua.
