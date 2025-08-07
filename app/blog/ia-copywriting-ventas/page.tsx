import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'IA para copywriting: Cómo escribir textos profesionales | Red Creativa Pro',
  description: 'Técnicas avanzadas de copywriting con inteligencia artificial para crear textos persuasivos y profesionales que mejoren tu comunicación.',
  keywords: 'IA copywriting, copywriting inteligencia artificial, textos persuasivos IA, redacción profesional IA',
  openGraph: {
    title: 'IA para copywriting: Cómo escribir textos profesionales',
    description: 'Técnicas avanzadas de copywriting con inteligencia artificial para crear textos persuasivos y profesionales.',
    type: 'article',
  }
}

export default function IACopywritingVentas() {
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
            <nav className="flex items-center space-x-6">
              <Link href="/blog" className="text-sm text-zinc-400 hover:text-white transition-colors">
                ← Volver al Blog
              </Link>
              <Link href="/escritor-ia" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Escritor IA
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <article className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Article Header */}
        <header className="mb-12">
          <div className="flex items-center space-x-4 mb-6">
            <span className="text-xs font-medium text-white bg-zinc-800 px-3 py-1 rounded-full">
              Copywriting
            </span>
            <span className="text-sm text-zinc-500">8 min de lectura</span>
            <span className="text-sm text-zinc-500">22 Enero 2025</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            IA para copywriting: Cómo escribir textos que venden
          </h1>
          <p className="text-xl text-zinc-400 leading-relaxed">
            Técnicas avanzadas de copywriting con inteligencia artificial para crear textos persuasivos que conviertan visitantes en clientes y aumenten tus ventas.
          </p>
        </header>

        {/* Article Content */}
        <div className="prose prose-invert prose-lg max-w-none">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">🎯 Lo que dominarás</h2>
            <ul className="text-zinc-300 space-y-2">
              <li><a href="#fundamentos" className="hover:text-white transition-colors">• Fundamentos del copywriting persuasivo</a></li>
              <li><a href="#formulas" className="hover:text-white transition-colors">• Fórmulas de copywriting con IA</a></li>
              <li><a href="#tipos-copy" className="hover:text-white transition-colors">• Tipos de copy para diferentes objetivos</a></li>
              <li><a href="#prompts-avanzados" className="hover:text-white transition-colors">• Prompts avanzados para ventas</a></li>
              <li><a href="#casos-exito" className="hover:text-white transition-colors">• Casos de éxito reales</a></li>
            </ul>
          </div>

          <p className="text-zinc-300 text-lg mb-8">
            El copywriting es el arte de escribir textos que persuaden y venden. Con la inteligencia artificial, puedes crear copys altamente efectivos que conecten emocionalmente con tu audiencia y generen más conversiones.
          </p>

          <h2 id="fundamentos" className="text-3xl font-bold text-white mb-6">🧠 Fundamentos del copywriting persuasivo</h2>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Los 4 pilares del copy que vende</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="text-lg font-semibold text-white mb-2">1. 🎯 Atención</h4>
                  <p className="text-zinc-300">Captura la atención inmediatamente con un titular irresistible</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="text-lg font-semibold text-white mb-2">2. 🧲 Interés</h4>
                  <p className="text-zinc-300">Mantén el interés con beneficios claros y relevantes</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="text-lg font-semibold text-white mb-2">3. 💎 Deseo</h4>
                  <p className="text-zinc-300">Crea deseo mostrando la transformación que ofreces</p>
                </div>
                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="text-lg font-semibold text-white mb-2">4. ⚡ Acción</h4>
                  <p className="text-zinc-300">Impulsa la acción con llamadas claras y urgencia</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Psicología de la persuasión en copywriting</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-zinc-800 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🧠 Principio</h4>
                <p className="text-zinc-300 text-sm font-medium">Escasez</p>
                <p className="text-zinc-400 text-xs mt-1">Limitado en tiempo o cantidad</p>
              </div>
              <div className="bg-zinc-800 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">👥 Principio</h4>
                <p className="text-zinc-300 text-sm font-medium">Prueba social</p>
                <p className="text-zinc-400 text-xs mt-1">Testimonios y casos de éxito</p>
              </div>
              <div className="bg-zinc-800 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🎁 Principio</h4>
                <p className="text-zinc-300 text-sm font-medium">Reciprocidad</p>
                <p className="text-zinc-400 text-xs mt-1">Dar valor antes de pedir</p>
              </div>
              <div className="bg-zinc-800 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">👑 Principio</h4>
                <p className="text-zinc-300 text-sm font-medium">Autoridad</p>
                <p className="text-zinc-400 text-xs mt-1">Credibilidad y expertise</p>
              </div>
              <div className="bg-zinc-800 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">❤️ Principio</h4>
                <p className="text-zinc-300 text-sm font-medium">Simpatía</p>
                <p className="text-zinc-400 text-xs mt-1">Conexión emocional</p>
              </div>
              <div className="bg-zinc-800 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🤝 Principio</h4>
                <p className="text-zinc-300 text-sm font-medium">Compromiso</p>
                <p className="text-zinc-400 text-xs mt-1">Coherencia con decisiones</p>
              </div>
            </div>
          </div>

          <h2 id="formulas" className="text-3xl font-bold text-white mb-6">📐 Fórmulas de copywriting con IA</h2>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Fórmula AIDA con IA</h3>
            <div className="space-y-4">
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-2">🎯 Atención (Attention)</h4>
                <div className="mb-3">
                  <p className="text-zinc-300 text-sm mb-2">Prompt para titular:</p>
                  <code className="text-green-400 text-xs block bg-zinc-900 p-2 rounded">
                    "Crea 10 titulares irresistibles para [PRODUCTO/SERVICIO] que capturen la atención de [AUDIENCIA]. Usa números, preguntas o declaraciones impactantes."
                  </code>
                </div>
                <p className="text-zinc-400 text-sm">Ejemplo: "¿Cansado de perder clientes por emails aburridos?"</p>
              </div>

              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-2">🧲 Interés (Interest)</h4>
                <div className="mb-3">
                  <p className="text-zinc-300 text-sm mb-2">Prompt para despertar interés:</p>
                  <code className="text-green-400 text-xs block bg-zinc-900 p-2 rounded">
                    "Escribe un párrafo que mantenga el interés sobre [PRODUCTO]. Incluye un beneficio específico y una estadística impactante."
                  </code>
                </div>
                <p className="text-zinc-400 text-sm">Ejemplo: "Algunos clientes han reportado aumentos en ventas de hasta 300% en 30 días, dependiendo de factores como la audiencia y estrategia"</p>
              </div>

              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-2">💎 Deseo (Desire)</h4>
                <div className="mb-3">
                  <p className="text-zinc-300 text-sm mb-2">Prompt para crear deseo:</p>
                  <code className="text-green-400 text-xs block bg-zinc-900 p-2 rounded">
                    "Describe la transformación que experimentará [AUDIENCIA] al usar [PRODUCTO]. Usa lenguaje emocional y pinta un futuro deseable."
                  </code>
                </div>
                <p className="text-zinc-400 text-sm">Ejemplo: "Imagina el potencial de despertar cada mañana con nuevos clientes esperándote, con una buena estrategia"</p>
              </div>

              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-2">⚡ Acción (Action)</h4>
                <div className="mb-3">
                  <p className="text-zinc-300 text-sm mb-2">Prompt para llamada a la acción:</p>
                  <code className="text-green-400 text-xs block bg-zinc-900 p-2 rounded">
                    "Crea una llamada a la acción urgente y específica para [OBJETIVO]. Incluye beneficio inmediato y elemento de escasez."
                  </code>
                </div>
                <p className="text-zinc-400 text-sm">Ejemplo: "Únete hoy y recibe 50% de descuento (solo 24 horas)"</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Fórmula PAS (Problema-Agitación-Solución)</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-zinc-800 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">😰 Problema</h4>
                <p className="text-zinc-300 text-sm mb-2">Identifica el dolor específico</p>
                <code className="text-green-400 text-xs">
                  "¿Te frustran los emails que nadie abre?"
                </code>
              </div>
              <div className="bg-zinc-800 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🔥 Agitación</h4>
                <p className="text-zinc-300 text-sm mb-2">Intensifica el problema</p>
                <code className="text-green-400 text-xs">
                  "Cada email ignorado es dinero perdido..."
                </code>
              </div>
              <div className="bg-zinc-800 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">✅ Solución</h4>
                <p className="text-zinc-300 text-sm mb-2">Presenta tu producto como la cura</p>
                <code className="text-green-400 text-xs">
                  "Con Red Creativa Pro, tus emails convertirán"
                </code>
              </div>
            </div>
          </div>

          <h2 id="tipos-copy" className="text-3xl font-bold text-white mb-6">📝 Tipos de copy para diferentes objetivos</h2>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Copy para páginas de venta</h3>
            <div className="space-y-4">
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-2">🎯 Estructura recomendada:</h4>
                <ol className="text-zinc-300 space-y-2">
                  <li>1. <strong className="text-white">Titular impactante</strong> - Captura atención inmediata</li>
                  <li>2. <strong className="text-white">Subtítulo explicativo</strong> - Clarifica la propuesta</li>
                  <li>3. <strong className="text-white">Identificación del problema</strong> - Conecta con el dolor</li>
                  <li>4. <strong className="text-white">Presentación de la solución</strong> - Tu producto como héroe</li>
                  <li>5. <strong className="text-white">Beneficios específicos</strong> - Qué ganará el cliente</li>
                  <li>6. <strong className="text-white">Prueba social</strong> - Testimonios y casos de éxito</li>
                  <li>7. <strong className="text-white">Oferta irresistible</strong> - Precio, bonos, garantía</li>
                  <li>8. <strong className="text-white">Urgencia y escasez</strong> - Razón para actuar ahora</li>
                  <li>9. <strong className="text-white">CTA poderoso</strong> - Llamada a la acción clara</li>
                </ol>
              </div>
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-2">🤖 Prompt maestro para sales page:</h4>
                <code className="text-green-400 text-sm block whitespace-pre-wrap">
{`"Crea una página de venta completa para [PRODUCTO] dirigida a [AUDIENCIA].
Incluye:
- Titular que capture atención inmediata
- Identificación clara del problema principal
- Presentación de la solución única
- 5 beneficios específicos con emociones
- 3 testimonios creíbles
- Oferta con precio, bonos y garantía
- Urgencia genuina
- CTA irresistible
Tono: [TONO] | Longitud: [PALABRAS]"`}
                </code>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Copy para emails de venta</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">📧 Elementos clave:</h4>
                <ul className="text-zinc-300 space-y-2">
                  <li>• <strong className="text-white">Asunto irresistible</strong> - 30-50 caracteres</li>
                  <li>• <strong className="text-white">Apertura personal</strong> - Conexión inmediata</li>
                  <li>• <strong className="text-white">Historia o caso</strong> - Narrativa envolvente</li>
                  <li>• <strong className="text-white">Beneficio claro</strong> - Qué gana el lector</li>
                  <li>• <strong className="text-white">CTA específico</strong> - Un solo objetivo</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">⚡ Tipos de email:</h4>
                <ul className="text-zinc-300 space-y-2">
                  <li>• <strong className="text-white">Bienvenida</strong> - Primera impresión</li>
                  <li>• <strong className="text-white">Educativo</strong> - Aporta valor</li>
                  <li>• <strong className="text-white">Promocional</strong> - Vende directamente</li>
                  <li>• <strong className="text-white">Seguimiento</strong> - Recupera interés</li>
                  <li>• <strong className="text-white">Urgencia</strong> - Cierra la venta</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Copy para redes sociales</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-zinc-800 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">📱 Instagram</h4>
                <ul className="text-zinc-300 text-sm space-y-1">
                  <li>• Visual + copy emocional</li>
                  <li>• Hashtags estratégicos</li>
                  <li>• Stories interactivas</li>
                  <li>• CTA en bio</li>
                </ul>
              </div>
              <div className="bg-zinc-800 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">💼 LinkedIn</h4>
                <ul className="text-zinc-300 text-sm space-y-1">
                  <li>• Contenido profesional</li>
                  <li>• Casos de éxito B2B</li>
                  <li>• Insights de industria</li>
                  <li>• Networking activo</li>
                </ul>
              </div>
              <div className="bg-zinc-800 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🐦 Twitter/X</h4>
                <ul className="text-zinc-300 text-sm space-y-1">
                  <li>• Mensajes concisos</li>
                  <li>• Hilos informativos</li>
                  <li>• Engagement directo</li>
                  <li>• Tendencias relevantes</li>
                </ul>
              </div>
            </div>
          </div>

          <h2 id="prompts-avanzados" className="text-3xl font-bold text-white mb-6">🚀 Prompts avanzados para ventas</h2>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Prompts por industria</h3>
            <div className="space-y-4">
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-2">🏥 SaaS/Tecnología</h4>
                <code className="text-green-400 text-sm block whitespace-pre-wrap">
{`"Crea copy para una herramienta SaaS de [FUNCIÓN] dirigida a [PROFESIÓN].
Enfócate en:
- ROI y ahorro de tiempo específico
- Integración con herramientas existentes  
- Escalabilidad y seguridad
- Prueba gratuita sin compromiso
Incluye datos técnicos creíbles y casos de uso reales."`}
                </code>
              </div>

              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-2">🛍️ E-commerce</h4>
                <code className="text-green-400 text-sm block whitespace-pre-wrap">
{`"Escribe copy de producto para [PRODUCTO] en tienda online.
Incluye:
- Beneficios emocionales y funcionales
- Especificaciones técnicas clave
- Comparación con competencia
- Urgencia por stock limitado
- Garantía y política de devolución
Tono: persuasivo pero confiable"`}
                </code>
              </div>

              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-2">🎓 Educación/Cursos</h4>
                <code className="text-green-400 text-sm block whitespace-pre-wrap">
{`"Crea copy para curso online de [TEMA] dirigido a [NIVEL].
Destaca:
- Transformación específica que lograrán
- Metodología única y probada
- Instructor experto con credenciales
- Resultados de estudiantes anteriores
- Acceso de por vida y actualizaciones
Usa lenguaje inspiracional y aspiracional"`}
                </code>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Prompts para diferentes etapas del funnel</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-zinc-800 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🔍 Awareness</h4>
                <p className="text-zinc-300 text-sm mb-2">Crear conciencia del problema</p>
                <code className="text-green-400 text-xs">
                  "¿Sabías que 90% de las empresas pierden clientes por...?"
                </code>
              </div>
              <div className="bg-zinc-800 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🤔 Consideration</h4>
                <p className="text-zinc-300 text-sm mb-2">Evaluar soluciones disponibles</p>
                <code className="text-green-400 text-xs">
                  "Comparamos las 5 mejores opciones para..."
                </code>
              </div>
              <div className="bg-zinc-800 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">💳 Decision</h4>
                <p className="text-zinc-300 text-sm mb-2">Impulsar la compra final</p>
                <code className="text-green-400 text-xs">
                  "Únete a 10,000+ clientes satisfechos hoy"
                </code>
              </div>
            </div>
          </div>

          <h2 id="casos-exito" className="text-3xl font-bold text-white mb-6">🏆 Casos de éxito reales</h2>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Caso 1: Startup SaaS - 400% más conversiones</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">❌ Copy original:</h4>
                <div className="bg-zinc-800 p-4 rounded-lg">
                  <p className="text-zinc-400 text-sm italic">
                    "Nuestra plataforma de gestión de proyectos es muy buena y tiene muchas funciones útiles para equipos."
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">✅ Copy optimizado con IA:</h4>
                <div className="bg-zinc-800 p-4 rounded-lg">
                  <p className="text-green-400 text-sm">
                    "¿Cansado de reuniones infinitas que no llevan a nada? Nuestros clientes reducen 70% el tiempo en reuniones y entregan proyectos 3 semanas antes."
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 bg-zinc-800 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-2">📊 Resultados:</h4>
              <ul className="text-zinc-300 space-y-1">
                <li>• 400% más conversiones en landing page</li>
                <li>• 250% más clics en emails</li>
                <li>• 60% reducción en costo por adquisición</li>
              </ul>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Caso 2: E-commerce - 180% más ventas</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">🎯 Estrategia aplicada:</h4>
                <ul className="text-zinc-300 space-y-2">
                  <li>• Identificación de objeciones principales</li>
                  <li>• Copy emocional en descripciones de producto</li>
                  <li>• Urgencia genuina en ofertas limitadas</li>
                  <li>• Testimonios específicos y creíbles</li>
                </ul>
              </div>
              <div className="bg-zinc-800 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-white mb-2">💡 Prompt utilizado:</h4>
                <code className="text-green-400 text-sm">
                  "Reescribe esta descripción de producto enfocándote en cómo mejorará la vida diaria del cliente. Usa lenguaje emocional y beneficios específicos, no características técnicas."
                </code>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-700 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">🎯 Domina el copywriting con Red Creativa Pro</h2>
            <p className="text-zinc-300 text-lg mb-6">
              Red Creativa Pro incluye plantillas de copywriting probadas y prompts especializados para cada tipo de copy que necesites crear.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-zinc-800 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">📝 Plantillas</h4>
                <p className="text-zinc-300 text-sm">50+ plantillas de copy probadas</p>
              </div>
              <div className="bg-zinc-800 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">🎯 Prompts</h4>
                <p className="text-zinc-300 text-sm">Prompts especializados por industria</p>
              </div>
              <div className="bg-zinc-800 p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">📊 Análisis</h4>
                <p className="text-zinc-300 text-sm">Análisis de persuasión automático</p>
              </div>
            </div>
            <Link
              href="/escritor-ia"
              className="inline-flex items-center px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition-colors"
            >
              Crear mi primer copy que venda
            </Link>
          </div>

          <h2 className="text-3xl font-bold text-white mb-6">📚 Recursos adicionales</h2>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">📖 Libros recomendados</h3>
              <ul className="text-zinc-300 space-y-2">
                <li>• "Influence" - Robert Cialdini</li>
                <li>• "Cashvertising" - Drew Eric Whitman</li>
                <li>• "The Copywriter's Handbook" - Robert Bly</li>
                <li>• "Scientific Advertising" - Claude Hopkins</li>
              </ul>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">🔧 Herramientas útiles</h3>
              <ul className="text-zinc-300 space-y-2">
                <li>• Red Creativa Pro (copywriting con IA)</li>
                <li>• Hemingway Editor (legibilidad)</li>
                <li>• CoSchedule Headline Analyzer</li>
                <li>• Grammarly (corrección)</li>
              </ul>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">💡 Consejos finales para copywriting exitoso</h3>
            <ul className="text-zinc-300 space-y-3">
              <li className="flex items-start space-x-3">
                <span className="text-white font-bold">•</span>
                <span><strong className="text-white">Conoce a tu audiencia:</strong> Investiga sus miedos, deseos y objeciones</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-white font-bold">•</span>
                <span><strong className="text-white">Prueba constantemente:</strong> A/B testing en titulares y CTAs</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-white font-bold">•</span>
                <span><strong className="text-white">Sé específico:</strong> Números y detalles concretos venden más</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-white font-bold">•</span>
                <span><strong className="text-white">Cuenta historias:</strong> Las narrativas conectan emocionalmente</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-white font-bold">•</span>
                <span><strong className="text-white">Mide resultados:</strong> Analiza qué copy convierte mejor</span>
              </li>
            </ul>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            ¿Listo para crear copy que realmente venda?
          </h2>
          <p className="text-zinc-400 mb-6">
            Usa Red Creativa Pro y convierte más visitantes en clientes con copywriting inteligente
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/escritor-ia"
              className="inline-flex items-center px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition-colors"
            >
              Empezar a vender más
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center px-6 py-3 bg-zinc-800 text-white font-medium rounded-lg hover:bg-zinc-700 transition-colors"
            >
              Ver más artículos
            </Link>
          </div>
        </div>
      </article>
    </div>
  )
}