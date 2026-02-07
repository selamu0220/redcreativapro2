import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kkdjorivsmewtzflgcyw.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrZGpvcml2c21ld3R6ZmxnY3l3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTIxMzUzNywiZXhwIjoyMDg0Nzg5NTM3fQ.AwwX9KFAaJc3rLrpqGCqBL6LULRFDYdHua9_R2KwGyE'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const slug = 'plantilla-solicitudes-creativas-2025'
const newTitle = 'Biblioteca de Recursos Digitales con IA Gratis: Guía 2026 para Proyectos Creativos Perfectos'
const newContent = `
😩 **¿Te pasa esto muy seguido?**

Abres el documento y la pantalla queda en blanco. Las ideas no fluyen, el tiempo corre y el estrés aumenta. Es el problema clásico de millones de estudiantes.

En 2026, eso ya no es necesario. Las herramientas de inteligencia artificial gratuitas, combinadas con una sólida **biblioteca de recursos digitales**, te ayudan a empezar, estructurar y terminar tus trabajos de forma rápida y profesional.

## ¿Qué ofrece una plataforma completa con IA y recursos digitales?

**Red Creativa Pro** no solo genera textos originales según tus instrucciones, sino que te da acceso a una biblioteca de recursos llena de materiales listos para usar. Crea contenido nuevo sin copiar, adaptado a tus necesidades escolares.

Con esta combinación puedes:

- ✅ Sacar ideas únicas y originales
- ✅ Armar esquemas en segundos
- ✅ Lograr textos claros y con tono profesional
- ✅ Acceder a recursos digitales para enriquecer tus entregas

## Ventajas reales de una herramienta gratuita con biblioteca incluida

### Ahorras horas de trabajo

Un ensayo largo o un proyecto completo deja de quitarte la tarde entera. La IA genera borradores en minutos y la biblioteca de recursos digitales te da materiales extra al instante.

### Nunca más bloqueo creativo

La IA te da estructura e ideas de inicio. Además, busca inspiración directa en la base de datos de recursos.

### Calidad superior y variedad

Corrige errores, mejora el lenguaje y te ayuda en diferentes tipos de contenidos: textos, infografías e incluso ideas para contenido audiovisual.

## Cómo usar Red Creativa Pro paso a paso

Plataforma 100% gratuita para hispanohablantes, sin registros complicados.

1. **Describe tu tema con detalle** — Ejemplo: "Impacto del cambio climático en la agricultura latinoamericana actual"
2. **Elige el formato** — Ensayo, resumen, informe o incluso guion para proyectos creativos
3. **Selecciona la extensión deseada**
4. **Genera → revisa → personaliza** con tu estilo

> 🔑 **Clave:** Usa la IA y los recursos digitales como apoyo. Siempre añade tu toque personal.

## Explora la Biblioteca de Recursos Digitales

Red Creativa Pro incluye una completa biblioteca de recursos con:

- 📄 Plantillas listas
- 📝 Ejemplos de trabajos
- 🖼️ Imágenes libres
- 📚 Referencias verificadas

Ideal para dar seguimiento a tus proyectos y enriquecerlos sin buscar en mil páginas.

## Tres prompts poderosos para resultados increíbles

### 1. Ensayo estructurado

> "Actúa como estudiante universitario. Crea esquema + borrador de 900 palabras sobre redes sociales y salud mental de jóvenes en 2026. Incluye intro atractiva, tres argumentos con ejemplos, contraargumento y conclusión fuerte."

### 2. Resumen rápido

> "Resume este texto de ciencias (pega aquí) en 6-8 puntos claros para secundaria. Usa lenguaje sencillo."

### 3. Mejorar texto propio

> "Reescribe este párrafo: más fluido, sin repeticiones, evita voz pasiva y mantén tono formal pero natural."

## Bonus: Creación de contenidos más allá del texto

Red Creativa Pro también te ayuda en proyectos creativos:

- 🎬 Guiones para videos
- 📊 Ideas de infografías
- 🎥 Sugerencias para contenido audiovisual
- 📋 Organización de apuntes y listas de vocabulario

Perfecto para trabajos multimodales que incluyen imágenes, presentaciones o elementos visuales.

## Uso ético y responsable

Aprende más y estresa menos:

- ✅ Usa la IA y recursos para ideas iniciales y revisiones
- ✅ Reescribe todo con tus palabras
- ✅ Verifica datos importantes
- ✅ Cita fuentes cuando corresponda

Los detectores de IA en 2026 aún fallan mucho. Con edición personal, es casi imposible que te detecten… y aprendes de verdad.

## En resumen

Una plataforma con IA gratuita + biblioteca de recursos digitales te da tiempo, reduce estrés y eleva la calidad de tus proyectos creativos. Tus notas mejoran y comprendes mejor las materias.

**Red Creativa Pro** te ofrece todo esto sin costo.

---

🔥 **¿Listo para transformar tus trabajos escolares?**

[Entra hoy y descubre la potencia de la creación de contenidos inteligente. ¡Tu éxito empieza ahora! 🚀](/escritor-ia)
`

const newTags = ['Biblioteca Digital', 'IA Gratis', 'Recursos Creativos', 'Proyectos Escolares', 'Productividad']

async function updateArticle() {
    console.log(`🔄 Actualizando artículo: ${slug}`)

    // First check if article exists
    const { data: existing } = await supabase
        .from('blog_posts')
        .select('id, title')
        .eq('slug', slug)
        .single()

    if (!existing) {
        console.error(`❌ Artículo no encontrado: ${slug}`)
        return
    }

    console.log(`   📄 Artículo encontrado: ${existing.title}`)

    const { error } = await supabase
        .from('blog_posts')
        .update({
            title: newTitle,
            content: newContent.trim(),
            tags: newTags,
            updated_at: new Date().toISOString()
        })
        .eq('slug', slug)

    if (error) {
        console.error('❌ Error:', error)
        return
    }

    console.log('✅ Artículo actualizado exitosamente')
    console.log(`   📝 Nuevo título: ${newTitle}`)
    console.log(`   🏷️ Tags: ${newTags.join(', ')}`)
}

updateArticle().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
})
