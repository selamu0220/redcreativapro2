import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Zap, Star, Terminal, Cpu, Sparkles, BookOpen, Target, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Prompt Engineering 2025 | Guía Completa para Dominar IA',
  description: 'Aprende prompt engineering desde cero. Técnicas avanzadas paraChatGPT, Claude y cualquier IA. Aprende a escribir prompts que obtienen resultados precisos. Curso gratis.',
  keywords: ['prompt engineering', 'como escribir prompts', 'tecnicas prompt', 'chatgpt prompts', 'claude prompts', 'inteligencia artificial prompts', 'prompt engineering español', 'mejores prompts ia'],
  alternates: { canonical: 'https://redcreativa.pro/prompt-engineering' },
  openGraph: {
    title: 'Prompt Engineering 2025 | Guía Completa para Dominar IA',
    description: 'Aprende a dominar cualquier IA con buenos prompts.',
    type: 'website',
    images: [{ url: 'https://redcreativa.pro/api/og?title=Prompt+Engineering', width: 1200, height: 630 }]
  },
  twitter: { card: 'summary_large_image', title: 'Prompt Engineering 2025', description: 'Guía completa' }
}

const principios = [
  { titulo: 'Sé Específico', descripcion: 'En lugar de "escribe sobre marketing", di "escribe un email de cold outreach para vender software CRM a directores de marketing"', ejemplo: '✗ "Ayúdame con mi negocio" vs ✓ "Dame 5 ideas para aumentar conversiones en mi tienda online de moda"' },
  { titulo: 'Da Contexto', descripcion: 'Explica quién eres, a quién te diriges y cuál es el objetivo', ejemplo: 'Incluye: rol, audiencia, tono, formato, longitud' },
  { titulo: 'Estructura tu Prompt', descripcion: 'Usa secciones claras: Contexto, Tarea, Restricciones, Ejemplos', ejemplo: 'Background → Task → Constraints → Examples → Output' },
  { titulo: 'Itera y Mejora', descripcion: 'Los prompts perfectos se construyen probando y ajustando', ejemplo: 'Prompt → Resultado → Análisis → Mejora → Nuevo Prompt' },
  { titulo: 'Usa few-shot', descripcion: 'Da ejemplos del resultado que buscas', ejemplo: 'Input: X → Output: Y (dame 3-5 ejemplos)' },
  { titulo: 'Especifica el Formato', descripcion: 'Di exactamente cómo quieres la respuesta', ejemplo: 'Tabla, lista, JSON, markdown, ensayo de 500 palabras...' },
]

const tecnicas = [
  { nombre: 'Chain-of-Thought', descripcion: 'Pide a la IA que piense paso a paso', uso: 'Análisis complejos, matemáticas, lógica' },
  { nombre: 'Zero-shot', descripcion: 'Sin ejemplos, solo la instrucción', uso: 'Tareas simples, cuando conoces el resultado' },
  { nombre: 'Few-shot', descripcion: 'Con 1-5 ejemplos', uso: 'Estilizar output, mantener consistencia' },
  { nombre: 'Role-playing', descripcion: 'Asigna un rol experto a la IA', uso: 'Consultor, escritor, coder,律师' },
  { nombre: 'System Instructions', descripcion: 'Instrucciones globales que definen el comportamiento', uso: 'Tono, formato, restricciones generales' },
  { nombre: 'Self-Consistency', descripcion: 'Pide múltiples respuestas y la mejor', uso: 'Decisiones importantes, creatividad' },
]

const estructuraPrompt = [
  { parte: 'Contexto/Rol', descripcion: 'Quién eres tú y para quién es el contenido', requerido: true },
  { parte: 'Tarea', descripcion: 'Qué quieres que haga exactamente', requerido: true },
  { parte: 'Formato', descripcion: 'Cómo quieres el output', requerido: false },
  { parte: 'Tono', descripcion: 'Formal, casual, profesional...', requerido: false },
  { parte: 'Longitud', descripcion: '200 palabras, 1 página, breve...', requerido: false },
  { parte: 'Restricciones', descripcion: 'Qué evitar o incluir', requerido: false },
  { parte: 'Ejemplos', descripcion: 'Muestra el estilo deseado', requerido: false },
]

export default function PromptEngineeringPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="outline"> <Terminal className="w-3 h-3 mr-1" /> Guía Completa 2025 </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Prompt <span className="text-primary">Engineering</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Domina el arte de comunicarte con la inteligencia artificial. Aprende técnicas 
            comprovadas para escribir prompts que obtienen resultados precisos y consistentes.
          </p>
        </div>

        {/* CTA Principal */}
        <Card className="mb-16 border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
          <CardContent className="p-8 text-center">
            <Badge className="mb-4 bg-green-500/10 text-green-600">+50 Prompts Incluidos</Badge>
            <h2 className="text-3xl font-bold mb-4">Domina la IA con Buenos Prompts</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Descarga nuestra guía de prompt engineering con 50+ prompts listos 
              para usar con ChatGPT, Claude, Gemini y cualquier IA.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm">
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> Principios fundamentales</div>
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> 6 técnicas avanzadas</div>
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> 50+ prompts listos</div>
            </div>
            <Button size="lg" asChild><Link href="/prompts">Descargar Guía <ArrowRight className="w-4 h-4 ml-2" /></Link></Button>
          </CardContent>
        </Card>

        {/* 6 Principios */}
        <h2 className="text-3xl font-bold mb-8 text-center">Los 6 Principios del Prompt Engineering</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {principios.map((princ,
            i) => (
            <Card key={i} className="hover:border-primary/30 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" />{princ.titulo}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{princ.descripcion}</p>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs">{princ.ejemplo}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Técnicas Avanzadas */}
        <h2 className="text-3xl font-bold mb-8 text-center">6 Técnicas Avanzadas</h2>
        <Card className="mb-16 overflow-hidden">
          <CardHeader><CardTitle className="flex items-center gap-2"><Cpu className="w-5 h-5" /> Técnicas Profesionales</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tecnicas.map((tec, i) => (
                <div key={i} className="p-4 border rounded-lg hover:border-primary/30 transition-colors">
                  <h3 className="font-bold mb-2">{tec.nombre}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{tec.descripcion}</p>
                  <p className="text-xs text-primary"><strong>Uso:</strong> {tec.uso}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Estructura de un Prompt */}
        <h2 className="text-3xl font-bold mb-8 text-center">Estructura de un Prompt Perfecto</h2>
        <Card className="mb-16">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold mb-4 flex items-center gap-2"><Target className="w-5 h-5" /> Componentes</h3>
                <ul className="space-y-3">
                  {estructuraPrompt.map((part, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Badge variant={part.requerido ? 'destructive' : 'secondary'} className="text-xs">{part.requerido ? 'Req' : 'Opt'}</Badge>
                      <div>
                        <p className="font-medium">{part.parte}</p>
                        <p className="text-xs text-muted-foreground">{part.descripcion}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-4">Ejemplo Completo</h3>
                <div className="p-4 bg-muted rounded-lg text-sm font-mono">
                  <p className="text-primary mb-2">// Contexto</p>
                  <p className="mb-3">Eres un experto copywriter con 10 años en marketing B2B.</p>
                  <p className="text-primary mb-2">// Tarea</p>
                  <p className="mb-3">Escribe un email de cold outreach para vender un software CRM a directores de marketing de empresas tecnológicas.</p>
                  <p className="text-primary mb-2">// Formato</p>
                  <p className="mb-3">Email de máximo 150 palabras con asunto incluido.</p>
                  <p className="text-primary mb-2">// Tono</p>
                  <p>Profesional pero cercano, sin ser agresivo.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Final */}
        <div className="text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">¿Listo para dominar la IA?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Aprende prompt engineering y obtén resultados 10x mejores 
            con cualquier inteligencia artificial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild><Link href="/prompts">Ver Colección de Prompts <ArrowRight className="h-4 w-4 ml-2" /></Link></Button>
            <Button size="lg" variant="outline" asChild><Link href="/">Probar Gratis</Link></Button>
          </div>
        </div>
      </div>
    </main>
  )
}
