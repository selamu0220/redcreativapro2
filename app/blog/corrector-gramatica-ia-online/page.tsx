import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Corrector de Gramática IA Online - Corrige Textos con Inteligencia Artificial',
  description: 'Corrector de gramática IA online gratis. Corrige errores ortográficos, gramaticales y de estilo con inteligencia artificial. ¡Mejora tus textos ahora!',
  keywords: 'corrector gramatica ia, corrector ortografico ia, revisar textos ia, corrector online gratis, gramatica inteligencia artificial',
  openGraph: {
    title: 'Corrector de Gramática IA Online - Corrige Textos con Inteligencia Artificial',
    description: 'Corrector de gramática IA online gratis. Corrige errores ortográficos, gramaticales y de estilo con inteligencia artificial.',
    type: 'article',
  }
}

export default function CorrectorGramaticaIAPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <article className="prose prose-invert prose-lg max-w-none">
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Corrector de Gramática IA Online: Perfecciona tus Textos Automáticamente
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Descubre cómo un corrector de gramática IA puede transformar tus textos, eliminando errores y mejorando la calidad de tu escritura con precisión profesional.
            </p>
          </header>

          <div className="space-y-8">
            <section>
              <h2 className="text-3xl font-bold mb-4">¿Qué es un Corrector de Gramática IA?</h2>
              <p className="text-gray-300 mb-4">
                Un corrector de gramática IA es una herramienta avanzada que utiliza inteligencia artificial para detectar y corregir errores en textos de forma automática. Va más allá de los correctores tradicionales, analizando el contexto, la coherencia y el estilo para ofrecer correcciones precisas y sugerencias de mejora. Si buscas un <Link href="/blog/asistente-escritura-ia-inteligente" className="text-blue-400 hover:text-blue-300 underline">asistente de escritura IA más completo</Link>, también tenemos opciones avanzadas.
              </p>
              <p className="text-gray-300">
                Estas herramientas aprovechan modelos de lenguaje natural entrenados con millones de textos para entender las sutilezas del idioma y proporcionar correcciones contextualmente apropiadas. Para conocer más sobre <Link href="/blog/como-usar-ia-para-escribir-mejor" className="text-blue-400 hover:text-blue-300 underline">cómo usar IA para escribir mejor</Link>, consulta nuestra guía completa.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">Tipos de Errores que Detecta</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-red-900/20 border border-red-800 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3 text-red-400">🔤 Errores Ortográficos</h3>
                  <ul className="text-gray-300 space-y-1 text-sm">
                    <li>• Palabras mal escritas</li>
                    <li>• Acentuación incorrecta</li>
                    <li>• Mayúsculas y minúsculas</li>
                    <li>• Separación de palabras</li>
                  </ul>
                </div>
                <div className="bg-blue-900/20 border border-blue-800 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3 text-blue-400">📝 Errores Gramaticales</h3>
                  <ul className="text-gray-300 space-y-1 text-sm">
                    <li>• Concordancia verbal</li>
                    <li>• Uso de preposiciones</li>
                    <li>• Tiempos verbales</li>
                    <li>• Estructura sintáctica</li>
                  </ul>
                </div>
                <div className="bg-green-900/20 border border-green-800 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3 text-green-400">🎨 Errores de Estilo</h3>
                  <ul className="text-gray-300 space-y-1 text-sm">
                    <li>• Repeticiones innecesarias</li>
                    <li>• Frases demasiado largas</li>
                    <li>• Tono inconsistente</li>
                    <li>• Claridad y fluidez</li>
                  </ul>
                </div>
                <div className="bg-purple-900/20 border border-purple-800 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3 text-purple-400">🔗 Errores de Coherencia</h3>
                  <ul className="text-gray-300 space-y-1 text-sm">
                    <li>• Conectores lógicos</li>
                    <li>• Flujo de ideas</li>
                    <li>• Referencias pronominales</li>
                    <li>• Consistencia temporal</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">Ventajas sobre Correctores Tradicionales</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-green-500 rounded-full p-2 mt-1">
                    <span className="text-white text-sm">🧠</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Comprensión Contextual</h3>
                    <p className="text-gray-300">Entiende el contexto completo del texto, no solo palabras aisladas</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-500 rounded-full p-2 mt-1">
                    <span className="text-white text-sm">⚡</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Corrección Inteligente</h3>
                    <p className="text-gray-300">Sugiere mejoras de estilo y claridad, no solo correcciones básicas</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-500 rounded-full p-2 mt-1">
                    <span className="text-white text-sm">🎯</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Adaptación de Registro</h3>
                    <p className="text-gray-300">Ajusta las correcciones según el tipo de texto y audiencia objetivo</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-red-500 rounded-full p-2 mt-1">
                    <span className="text-white text-sm">📚</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Aprendizaje Continuo</h3>
                    <p className="text-gray-300">Mejora constantemente con nuevos datos y patrones de escritura</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">Cómo Usar el Corrector IA</h2>
              <div className="bg-gray-900 p-6 rounded-lg">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">1</div>
                    <div>
                      <h3 className="text-lg font-semibold">Pega tu Texto</h3>
                      <p className="text-gray-300 text-sm">Copia y pega el contenido que quieres revisar</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">2</div>
                    <div>
                      <h3 className="text-lg font-semibold">Selecciona el Tipo</h3>
                      <p className="text-gray-300 text-sm">Indica si es formal, informal, académico, etc.</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">3</div>
                    <div>
                      <h3 className="text-lg font-semibold">Revisa Automáticamente</h3>
                      <p className="text-gray-300 text-sm">La IA analiza y corrige errores instantáneamente</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">4</div>
                    <div>
                      <h3 className="text-lg font-semibold">Acepta o Modifica</h3>
                      <p className="text-gray-300 text-sm">Revisa las sugerencias y aplica las que consideres apropiadas</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">Casos de Uso Principales</h2>
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-6">
                  <h3 className="text-xl font-semibold">📧 Emails Profesionales</h3>
                  <p className="text-gray-300 mb-2">
                    Asegura que tus comunicaciones empresariales sean impecables y transmitan profesionalismo.
                  </p>
                  <div className="bg-gray-800 p-3 rounded text-sm">
                    <p className="text-red-400">❌ Antes: "Estimado Sr. García, le escribo para informarle que hemos recibido su solicitud y la estamos revisando."</p>
                    <p className="text-green-400">✅ Después: "Estimado Sr. García, le confirmamos la recepción de su solicitud, que actualmente se encuentra en proceso de revisión."</p>
                  </div>
                </div>

                <div className="border-l-4 border-green-500 pl-6">
                  <h3 className="text-xl font-semibold">📝 Documentos Académicos</h3>
                  <p className="text-gray-300 mb-2">
                    Perfecciona tesis, ensayos y trabajos de investigación con correcciones académicas precisas.
                  </p>
                  <div className="bg-gray-800 p-3 rounded text-sm">
                    <p className="text-red-400">❌ Antes: "Los resultados obtenidos demuestran que existe una correlación significativa entre las variables estudiadas."</p>
                    <p className="text-green-400">✅ Después: "Los resultados obtenidos evidencian una correlación significativa entre las variables analizadas."</p>
                  </div>
                </div>

                <div className="border-l-4 border-purple-500 pl-6">
                  <h3 className="text-xl font-semibold">🌐 Contenido Web</h3>
                  <p className="text-gray-300 mb-2">
                    Optimiza páginas web, blogs y contenido digital para mejorar la experiencia del usuario.
                  </p>
                  <div className="bg-gray-800 p-3 rounded text-sm">
                    <p className="text-red-400">❌ Antes: "Nuestros servicios son los mejores del mercado y ofrecemos soluciones innovadoras."</p>
                    <p className="text-green-400">✅ Después: "Ofrecemos servicios líderes en el mercado con soluciones innovadoras adaptadas a sus necesidades."</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">Comparativa de Precisión</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-700">
                  <thead>
                    <tr className="bg-gray-800">
                      <th className="border border-gray-700 p-3 text-left">Tipo de Error</th>
                      <th className="border border-gray-700 p-3 text-left">Corrector Básico</th>
                      <th className="border border-gray-700 p-3 text-left">Corrector IA</th>
                      <th className="border border-gray-700 p-3 text-left">Mejora</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-700 p-3">Ortografía</td>
                      <td className="border border-gray-700 p-3 text-yellow-400">85%</td>
                      <td className="border border-gray-700 p-3 text-green-400">98%</td>
                      <td className="border border-gray-700 p-3 text-green-400">+13%</td>
                    </tr>
                    <tr className="bg-gray-900">
                      <td className="border border-gray-700 p-3">Gramática</td>
                      <td className="border border-gray-700 p-3 text-red-400">60%</td>
                      <td className="border border-gray-700 p-3 text-green-400">92%</td>
                      <td className="border border-gray-700 p-3 text-green-400">+32%</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-700 p-3">Estilo</td>
                      <td className="border border-gray-700 p-3 text-red-400">30%</td>
                      <td className="border border-gray-700 p-3 text-green-400">87%</td>
                      <td className="border border-gray-700 p-3 text-green-400">+57%</td>
                    </tr>
                    <tr className="bg-gray-900">
                      <td className="border border-gray-700 p-3">Coherencia</td>
                      <td className="border border-gray-700 p-3 text-red-400">15%</td>
                      <td className="border border-gray-700 p-3 text-green-400">78%</td>
                      <td className="border border-gray-700 p-3 text-green-400">+63%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">Consejos para Mejores Resultados</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-900 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-green-400">✅ Mejores Prácticas</h3>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• Proporciona contexto sobre el tipo de texto</li>
                    <li>• Revisa las sugerencias antes de aplicarlas</li>
                    <li>• Usa párrafos completos para mejor análisis</li>
                    <li>• Especifica la audiencia objetivo</li>
                    <li>• Mantén tu estilo personal único</li>
                  </ul>
                </div>
                <div className="bg-gray-900 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-red-400">❌ Errores Comunes</h3>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• Aceptar todas las sugerencias automáticamente</li>
                    <li>• No considerar el contexto específico</li>
                    <li>• Usar textos demasiado fragmentados</li>
                    <li>• Ignorar el registro apropiado</li>
                    <li>• No revisar el resultado final</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">Impacto en la Productividad</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-blue-300 mb-2">75%</div>
                  <p className="text-sm text-gray-300">Reducción en tiempo de revisión</p>
                </div>
                <div className="bg-gradient-to-br from-green-900 to-green-800 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-green-300 mb-2">90%</div>
                  <p className="text-sm text-gray-300">Menos errores en texto final</p>
                </div>
                <div className="bg-gradient-to-br from-purple-900 to-purple-800 p-6 rounded-lg text-center">
                  <div className="text-3xl font-bold text-purple-300 mb-2">3x</div>
                  <p className="text-sm text-gray-300">Mayor velocidad de escritura</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold mb-4">El Futuro de la Corrección Automática</h2>
              <p className="text-gray-300 mb-4">
                Los correctores de gramática IA evolucionan hacia sistemas más sofisticados que no solo corrigen errores, sino que actúan como asistentes de escritura inteligentes, adaptándose al estilo personal de cada usuario y aprendiendo de sus preferencias.
              </p>
              <div className="bg-gray-900 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Próximas Innovaciones</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>🔮 <strong>Corrección predictiva:</strong> Anticipar errores antes de que ocurran</li>
                  <li>🎨 <strong>Adaptación de estilo:</strong> Aprender y replicar estilos específicos</li>
                  <li>🌍 <strong>Multiidioma:</strong> Corrección simultánea en varios idiomas</li>
                  <li>🔊 <strong>Corrección por voz:</strong> Análisis de texto dictado</li>
                </ul>
              </div>
            </section>

            <div className="bg-gradient-to-r from-red-900 to-orange-900 p-8 rounded-lg text-center">
              <h2 className="text-2xl font-bold mb-4">Perfecciona tus Textos Ahora</h2>
              <p className="text-gray-300 mb-6">
                Prueba nuestro corrector de gramática IA y elimina errores mientras mejoras la calidad de tu escritura.
              </p>
              <Link 
                href="/escritor-ia" 
                className="inline-block bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Corregir Textos con IA
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}