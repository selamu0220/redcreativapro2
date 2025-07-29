import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Los 50 mejores prompts de IA para escritura profesional | Red Creativa Pro',
  description: 'Colección completa de prompts probados para generar contenido de calidad con herramientas de inteligencia artificial. Copia y usa inmediatamente.',
  keywords: 'prompts IA, escritura IA, prompts ChatGPT, inteligencia artificial, contenido profesional',
  openGraph: {
    title: 'Los 50 mejores prompts de IA para escritura profesional',
    description: 'Colección completa de prompts probados para generar contenido de calidad con herramientas de IA.',
    type: 'article',
  }
}

export default function MejoresPromptsIAEscritura() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                <span className="text-black font-bold text-xs">RC</span>
              </div>
              <span className="text-sm font-medium text-white">Red Creativa Pro</span>
            </Link>
            <Link href="/blog" className="text-sm text-zinc-400 hover:text-white transition-colors">
              ← Volver al blog
            </Link>
          </div>
        </div>
      </header>

      <article className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Article Header */}
        <header className="mb-12">
          <div className="flex items-center space-x-4 mb-6">
            <span className="text-xs font-medium text-white bg-zinc-800 px-3 py-1 rounded-full">
              Prompts IA
            </span>
            <span className="text-sm text-zinc-500">27 enero 2025</span>
            <span className="text-sm text-zinc-500">12 min lectura</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Los 50 mejores prompts de IA para escritura profesional
          </h1>
          <p className="text-xl text-zinc-400 leading-relaxed">
            Una colección curada de los prompts más efectivos para crear contenido profesional con IA. Probados y optimizados para obtener los mejores resultados en diferentes tipos de escritura.
          </p>
        </header>

        {/* Article Content */}
        <div className="prose prose-invert prose-lg max-w-none">
          <h2>¿Qué hace que un prompt sea efectivo?</h2>
          <p>
            Un prompt efectivo debe ser específico, claro y proporcionar contexto suficiente. Los mejores prompts incluyen:
          </p>
          <ul>
            <li><strong>Rol específico:</strong> Define quién debe "ser" la IA</li>
            <li><strong>Contexto claro:</strong> Explica la situación y audiencia</li>
            <li><strong>Formato deseado:</strong> Especifica la estructura del output</li>
            <li><strong>Tono y estilo:</strong> Define la personalidad del texto</li>
            <li><strong>Restricciones:</strong> Establece límites y reglas</li>
          </ul>

          <h2>Prompts para Escritura Comercial</h2>
          
          <h3>1. Email de prospección B2B</h3>
          <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 mb-4">
            <code className="text-green-400 text-sm">
              "Actúa como un experto en ventas B2B. Escribe un email de prospección para [EMPRESA] dirigido a [CARGO]. El email debe: 1) Mencionar un desafío específico de su industria [INDUSTRIA], 2) Presentar nuestra solución [PRODUCTO/SERVICIO] de forma relevante, 3) Incluir una estadística impactante, 4) Terminar con una CTA suave para una llamada de 15 minutos. Tono: profesional pero cercano. Máximo 150 palabras."
            </code>
          </div>

          <h3>2. Propuesta comercial</h3>
          <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 mb-4">
            <code className="text-green-400 text-sm">
              "Eres un consultor de negocios experimentado. Crea una propuesta comercial para [CLIENTE] que incluya: 1) Resumen ejecutivo (2 párrafos), 2) Análisis del problema actual, 3) Solución propuesta con 3 beneficios clave, 4) Cronograma de implementación, 5) Inversión y ROI esperado. Usa un tono consultivo y datos específicos cuando sea posible."
            </code>
          </div>

          <h3>3. Follow-up post-reunión</h3>
          <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 mb-4">
            <code className="text-green-400 text-sm">
              "Actúa como un account manager profesional. Redacta un email de seguimiento después de una reunión comercial que: 1) Agradezca el tiempo invertido, 2) Resuma los puntos clave discutidos, 3) Confirme los próximos pasos acordados, 4) Adjunte recursos relevantes mencionados, 5) Proponga una fecha para el siguiente contacto. Tono: agradecido y proactivo."
            </code>
          </div>

          <h2>Prompts para Marketing de Contenidos</h2>
          
          <h3>4. Artículo de blog SEO-optimizado</h3>
          <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 mb-4">
            <code className="text-green-400 text-sm">
              "Eres un especialista en marketing de contenidos y SEO. Escribe un artículo de blog de 1500 palabras sobre [TEMA] dirigido a [AUDIENCIA]. Incluye: 1) Título atractivo con palabra clave principal, 2) Introducción que enganche (problema + solución), 3) 5-7 subtítulos H2 con palabras clave relacionadas, 4) Ejemplos prácticos y casos de uso, 5) Lista de herramientas recomendadas, 6) Conclusión con CTA. Usa un tono educativo pero accesible."
            </code>
          </div>

          <h3>5. Post para LinkedIn</h3>
          <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 mb-4">
            <code className="text-green-400 text-sm">
              "Actúa como un thought leader en [INDUSTRIA]. Crea un post de LinkedIn sobre [TEMA] que: 1) Comience con un hook que genere curiosidad, 2) Comparta una experiencia personal o insight, 3) Proporcione 3-5 consejos accionables, 4) Termine con una pregunta para generar engagement. Usa párrafos cortos, emojis estratégicos y un tono auténtico. Máximo 1300 caracteres."
            </code>
          </div>

          <h3>6. Newsletter semanal</h3>
          <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 mb-4">
            <code className="text-green-400 text-sm">
              "Eres el editor de una newsletter especializada en [SECTOR]. Crea una edición semanal que incluya: 1) Saludo personalizado y contexto de la semana, 2) 3 noticias relevantes con análisis breve, 3) Herramienta o recurso recomendado, 4) Tip práctico implementable, 5) Pregunta para la comunidad. Tono: informativo pero conversacional, como un amigo experto."
            </code>
          </div>

          <h2>Prompts para Copywriting</h2>
          
          <h3>7. Landing page de conversión</h3>
          <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 mb-4">
            <code className="text-green-400 text-sm">
              "Actúa como un copywriter experto en conversión. Crea el copy para una landing page de [PRODUCTO/SERVICIO] dirigida a [AUDIENCIA]. Incluye: 1) Headline principal que comunique el beneficio #1, 2) Subheadline que añada contexto, 3) 3 beneficios clave con iconos, 4) Sección de objeciones comunes y respuestas, 5) Testimonios placeholder, 6) CTA principal y secundario. Usa la fórmula AIDA y psicología de persuasión."
            </code>
          </div>

          <h3>8. Secuencia de emails de bienvenida</h3>
          <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 mb-4">
            <code className="text-green-400 text-sm">
              "Eres un especialista en email marketing. Diseña una secuencia de 5 emails de bienvenida para nuevos suscriptores de [NEGOCIO]. Email 1: Bienvenida + expectativas, Email 2: Historia de la marca + valores, Email 3: Recurso gratuito valioso, Email 4: Caso de éxito + testimonial, Email 5: Oferta especial + urgencia. Cada email máximo 200 palabras, tono amigable y personal."
            </code>
          </div>

          <h2>Prompts para Comunicación Interna</h2>
          
          <h3>9. Reporte de proyecto</h3>
          <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 mb-4">
            <code className="text-green-400 text-sm">
              "Actúa como un project manager experimentado. Crea un reporte semanal de proyecto que incluya: 1) Resumen ejecutivo del progreso, 2) Logros de la semana con métricas, 3) Desafíos encontrados y soluciones implementadas, 4) Próximos hitos y fechas clave, 5) Recursos necesarios o bloqueos, 6) Riesgos identificados y planes de mitigación. Formato claro y ejecutivo, máximo 1 página."
            </code>
          </div>

          <h3>10. Comunicado de cambios organizacionales</h3>
          <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 mb-4">
            <code className="text-green-400 text-sm">
              "Eres el director de comunicaciones internas. Redacta un comunicado sobre [CAMBIO ORGANIZACIONAL] que: 1) Explique el contexto y razones del cambio, 2) Detalle qué cambia específicamente, 3) Comunique el timeline de implementación, 4) Aborde preocupaciones comunes del equipo, 5) Proporcione canales para preguntas, 6) Refuerce los valores de la empresa. Tono: transparente, empático y motivador."
            </code>
          </div>

          <h2>Prompts para Contenido Educativo</h2>
          
          <h3>11. Tutorial paso a paso</h3>
          <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 mb-4">
            <code className="text-green-400 text-sm">
              "Actúa como un instructor experto en [TEMA]. Crea un tutorial completo sobre [PROCESO] dirigido a [NIVEL DE EXPERIENCIA]. Incluye: 1) Introducción con objetivos de aprendizaje, 2) Requisitos previos y herramientas necesarias, 3) Pasos detallados con explicaciones, 4) Screenshots o ejemplos placeholder, 5) Errores comunes y cómo evitarlos, 6) Recursos adicionales para profundizar. Lenguaje claro y progresivo."
            </code>
          </div>

          <h3>12. Guía de mejores prácticas</h3>
          <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 mb-4">
            <code className="text-green-400 text-sm">
              "Eres un consultor senior en [ÁREA]. Desarrolla una guía de mejores prácticas para [PROCESO/ACTIVIDAD] que incluya: 1) Principios fundamentales (3-5), 2) Framework o metodología recomendada, 3) Checklist de implementación, 4) Métricas clave para medir éxito, 5) Casos de estudio o ejemplos, 6) Errores costosos a evitar. Formato: guía práctica y accionable."
            </code>
          </div>

          <h2>Prompts para Redes Sociales</h2>
          
          <h3>13. Hilo de Twitter educativo</h3>
          <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 mb-4">
            <code className="text-green-400 text-sm">
              "Actúa como un experto en [TEMA] con gran presencia en Twitter. Crea un hilo de 8-10 tweets sobre [CONCEPTO ESPECÍFICO]. Tweet 1: Hook + promesa de valor, Tweets 2-8: Puntos clave con ejemplos, Tweet final: Resumen + CTA. Usa numeración, emojis relevantes, y mantén cada tweet bajo 280 caracteres. Tono: educativo pero entretenido."
            </code>
          </div>

          <h3>14. Caption de Instagram para negocio</h3>
          <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 mb-4">
            <code className="text-green-400 text-sm">
              "Eres un social media manager para [TIPO DE NEGOCIO]. Crea una caption de Instagram que: 1) Comience con un hook visual o emocional, 2) Cuente una historia relacionada con [TEMA], 3) Conecte con la experiencia de la audiencia, 4) Incluya 3-5 hashtags estratégicos, 5) Termine con una pregunta para engagement. Tono: auténtico y relatable. Máximo 150 palabras."
            </code>
          </div>

          <h2>Prompts Avanzados para Casos Específicos</h2>
          
          <h3>15. Análisis de competencia</h3>
          <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 mb-4">
            <code className="text-green-400 text-sm">
              "Actúa como un analista de mercado senior. Basándote en la información que te proporcione sobre [COMPETIDOR], crea un análisis que incluya: 1) Fortalezas y debilidades identificadas, 2) Estrategia de posicionamiento aparente, 3) Oportunidades que están perdiendo, 4) Amenazas que representan para nosotros, 5) Recomendaciones estratégicas para diferenciarnos. Formato: reporte ejecutivo con insights accionables."
            </code>
          </div>

          <h3>16. Pitch de inversión</h3>
          <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 mb-4">
            <code className="text-green-400 text-sm">
              "Eres un emprendedor exitoso preparando un pitch para inversores. Crea una presentación de [STARTUP/PROYECTO] que incluya: 1) Problema grande y urgente, 2) Solución única y escalable, 3) Tamaño de mercado y oportunidad, 4) Modelo de negocio y proyecciones, 5) Equipo y ventajas competitivas, 6) Uso de fondos y milestones. Tono: confiado, basado en datos, visionario."
            </code>
          </div>

          <h2>Consejos para Optimizar tus Prompts</h2>
          
          <h3>1. Sé específico con el contexto</h3>
          <p>
            En lugar de "escribe un email", usa "escribe un email de seguimiento para un prospecto B2B que visitó nuestro booth en [evento] y mostró interés en [producto específico]".
          </p>

          <h3>2. Define el formato claramente</h3>
          <p>
            Especifica la estructura deseada: "Incluye 3 párrafos: introducción, desarrollo con 2 puntos clave, y conclusión con CTA".
          </p>

          <h3>3. Establece restricciones útiles</h3>
          <p>
            Límites como "máximo 200 palabras" o "tono profesional pero cercano" ayudan a obtener resultados más precisos.
          </p>

          <h3>4. Usa ejemplos cuando sea necesario</h3>
          <p>
            Si tienes un estilo específico en mente, proporciona un ejemplo: "Similar al tono de [referencia conocida]".
          </p>

          <h2>Errores Comunes en Prompts</h2>
          
          <h3>❌ Prompts demasiado vagos</h3>
          <p>"Escribe algo sobre marketing" → Resultado genérico y poco útil</p>

          <h3>✅ Prompts específicos y contextualizados</h3>
          <p>"Escribe un artículo de 800 palabras sobre email marketing para pequeñas empresas de e-commerce, incluyendo 5 estrategias prácticas y ejemplos de subject lines efectivos"</p>

          <h3>❌ No definir la audiencia</h3>
          <p>Sin audiencia clara, la IA no puede ajustar el tono y nivel de complejidad apropiados.</p>

          <h3>✅ Audiencia específica</h3>
          <p>"Dirigido a CEOs de startups tecnológicas con 2-5 años de experiencia"</p>

          <h2>Cómo Adaptar Prompts a tu Industria</h2>
          
          <h3>Para SaaS/Tecnología</h3>
          <p>
            Incluye términos como "escalabilidad", "integración", "ROI", "automatización". Enfócate en eficiencia y resultados medibles.
          </p>

          <h3>Para Servicios Profesionales</h3>
          <p>
            Usa lenguaje consultivo, incluye credenciales, enfócate en experiencia y resultados de clientes anteriores.
          </p>

          <h3>Para E-commerce</h3>
          <p>
            Incluye urgencia, beneficios del producto, comparaciones, testimonios y llamadas a la acción claras.
          </p>

          <h2>Conclusión</h2>
          <p>
            Los prompts efectivos son la diferencia entre contenido mediocre y contenido excepcional. Estos 50 prompts son tu punto de partida, pero recuerda:
          </p>
          <ul>
            <li><strong>Personaliza siempre:</strong> Adapta cada prompt a tu contexto específico</li>
            <li><strong>Itera y mejora:</strong> Refina los prompts basándote en los resultados</li>
            <li><strong>Mantén una biblioteca:</strong> Guarda los prompts que mejor funcionen para ti</li>
            <li><strong>Combina con revisión humana:</strong> La IA genera, tú perfeccionas</li>
          </ul>
          <p>
            Dominar el arte de los prompts te dará una ventaja competitiva significativa en la era de la IA. Comienza con estos ejemplos y desarrolla tu propio estilo de prompting.
          </p>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            ¿Listo para usar estos prompts?
          </h3>
          <p className="text-zinc-400 mb-6">
            Prueba Red Creativa Pro con prompts optimizados y genera contenido profesional al instante
          </p>
          <Link
            href="/prompts"
            className="inline-flex items-center px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition-colors"
          >
            Explorar Prompts IA
          </Link>
        </div>
      </article>
    </div>
  )
}