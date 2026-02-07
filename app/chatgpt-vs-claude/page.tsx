import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Zap, Star, Brain, Cpu, TrendingUp, Scale, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'ChatGPT vs Claude 2025 | Comparativa Completa ¿Cuál es Mejor?',
  description: 'Comparativa detallada entre ChatGPT y Claude. Analizamos precio, capacidades, idiomas, contexto, código y casos de uso. ¿Cuál IA elegir en 2025? Nuestra recomendación.',
  keywords: ['chatgpt vs claude', 'chatgpt o claude', 'comparativa chatgpt claude', 'cual es mejor chatgpt o claude', 'chatgpt 4 vs claude 3', 'diferencias chatgpt claude', 'anthropic vs openai'],
  alternates: { canonical: 'https://redcreativa.pro/chatgpt-vs-claude' },
  openGraph: {
    title: 'ChatGPT vs Claude 2025 | Comparativa Completa',
    description: 'Análisis detallado de ambas IAs.',
    type: 'website',
    images: [{ url: 'https://redcreativa.pro/api/og?title=ChatGPT+vs+Claude', width: 1200, height: 630 }]
  },
  twitter: { card: 'summary_large_image', title: 'ChatGPT vs Claude 2025', description: 'Comparativa completa' }
}

const comparacion = [
  { criterio: 'Contexto', chatgpt: '128K tokens (Plus)', claude: '200K tokens (Pro)', winner: 'Claude' },
  { criterio: 'Precio', chatgpt: '$20/mes (Plus)', claude: '$20/mes (Pro)', winner: 'Empate' },
  { criterio: 'Código', chatgpt: 'Excelente', claude: 'Muy bueno', winner: 'ChatGPT' },
  { criterio: 'Análisis', chatgpt: 'Bueno', claude: 'Excelente', winner: 'Claude' },
  { criterio: 'Español', chatgpt: 'Muy bueno', claude: 'Muy bueno', winner: 'Empate' },
  { criterio: 'Escritura', chatgpt: 'Muy bueno', claude: 'Excelente', winner: 'Claude' },
  { criterio: 'Herramientas', chatgpt: 'GPTs, plugins', claude: 'Artifacts, extensiones', winner: 'Empate' },
  { criterio: 'Acceso Web', chatgpt: 'Plus con Browse', claude: 'Pro con web', winner: 'Empate' },
]

const casosUso = [
  { nombre: 'Programación', chatgpt: '✓✓✓✓✓', claude: '✓✓✓✓', conclusion: 'ChatGPT mejor para código' },
  { nombre: 'Análisis de Datos', chatgpt: '✓✓✓✓', claude: '✓✓✓✓✓', conclusion: 'Claude mejor para análisis' },
  { nombre: 'Escritura Creativa', chatgpt: '✓✓✓✓', claude: '✓✓✓✓✓', conclusion: 'Claude mejor estilo' },
  { nombre: 'Resumen de Documentos', chatgpt: '✓✓✓✓', claude: '✓✓✓✓✓', conclusion: 'Claude mejor contexto' },
  { nombre: 'Email Marketing', chatgpt: '✓✓✓✓', claude: '✓✓✓✓✓', conclusion: 'Claude más natural' },
  { nombre: ' investigación', chatgpt: '✓✓✓✓', claude: '✓✓✓✓✓', conclusion: 'Claude más profundo' },
]

export default function ChatGPTvsClaudePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="outline"> <Scale className="w-3 h-3 mr-1" /> Comparativa 2025 </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            <span className="text-primary">ChatGPT</span> vs <span className="text-purple-600">Claude</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comparativa completa entre las dos inteligencias artificiales más populares. 
            Analizamos precio, capacidades, contexto, código y casos de uso.
          </p>
        </div>

        {/* CTA Principal */}
        <Card className="mb-16 border-primary/20 bg-gradient-to-r from-primary/10 via-purple-500/5 to-primary/10">
          <CardContent className="p-8 text-center">
            <Badge className="mb-4 bg-green-500/10 text-green-600">Nuestra Recomendación</Badge>
            <h2 className="text-3xl font-bold mb-4">¿Cuál Elegir?</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              ChatGPT es mejor para código y tareas generales. Claude es superior para análisis profundo, 
              escritura creativa y contextos largos. Para español, ambas son excelentes.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm">
              <div className="flex items-center gap-2 text-primary"><Brain className="w-4 h-4" />ChatGPT: Código + General</div>
              <div className="flex items-center gap-2 text-purple-600"><Cpu className="w-4 h-4" />Claude: Análisis + Escritura</div>
            </div>
            <div className="flex gap-4 justify-center">
              <Button size="lg" asChild><Link href="/alternativas/chatgpt">Ver Alternativas ChatGPT</Link></Button>
              <Button size="lg" variant="outline" asChild><Link href="/alternativas/claude">Alternativas Claude</Link></Button>
            </div>
          </CardContent>
        </Card>

        {/* Comparación Detallada */}
        <h2 className="text-3xl font-bold mb-8 text-center">Comparación Detallada</h2>
        <Card className="mb-16 overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4">Criterio</th>
                  <th className="text-center p-4 text-primary">ChatGPT</th>
                  <th className="text-center p-4 text-purple-600">Claude</th>
                  <th className="text-center p-4">Ganador</th>
                </tr>
              </thead>
              <tbody>
                {comparacion.map ((item, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-4 font-medium">{item.criterio}</td>
                    <td className="text-center p-4">{item.chatgpt}</td>
                    <td className="text-center p-4">{item.claude}</td>
                    <td className="text-center p-4">
                      <Badge variant={item.winner === 'Empate' ? 'secondary' : 'default'}>
                        {item.winner}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Casos de Uso */}
        <h2 className="text-3xl font-bold mb-8 text-center">Casos de Uso Recomendados</h2>
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5 text-primary" />Cuándo Usar ChatGPT</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500" /><span>Programación y debugging</span></li>
                <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500" /><span>Tareas generales y preguntas</span></li>
                <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500" /><span>Integración con APIs</span></li>
                <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500" /><span>GPTs personalizados</span></li>
                <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500" /><span>Traducción rápida</span></li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Cpu className="w-5 h-5 text-purple-600" />Cuándo Usar Claude</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500" /><span>Análisis de documentos largos</span></li>
                <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500" /><span>Escritura creativa y formal</span></li>
                <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500" /><span>Resumen de reportes</span></li>
                <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500" /><span> Investigación académica</span></li>
                <li className="flex items-start gap-3"><CheckCircle className="w-5 h-5 text-green-500" /><span>Copywriting de alto nivel</span></li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Matriz de Decisión */}
        <h2 className="text-3xl font-bold mb-8 text-center">Matriz de Decisión</h2>
        <Card className="mb-16 overflow-hidden">
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5" /> ¿Cuál Elegir Según Tu Caso?</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4">Tarea</th>
                    <th className="text-center p-4">ChatGPT</th>
                    <th className="text-center p-4">Claude</th>
                    <th className="text-left p-4">Recomendación</th>
                  </tr>
                </thead>
                <tbody>
                  {casosUso.map ((caso, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-4 font-medium">{caso.nombre}</td>
                      <td className="text-center p-4">{caso.chatgpt}</td>
                      <td className="text-center p-4">{caso.claude}</td>
                      <td className="p-4 text-primary">{caso.conclusion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* CTA Final */}
        <div className="text-center bg-gradient-to-r from-primary/10 via-purple-500/5 to-primary/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">¿Aún no decides?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Para escribir en español con SEO automático, prueba Red Creativa Pro. 
            Combina lo mejor de ambas IAs en una herramienta especializada.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild><Link href="/">Probar Red Creativa Pro <ArrowRight className="h-4 w-4 ml-2" /></Link></Button>
            <Button size="lg" variant="outline" asChild><Link href="/mejores-ia-2025">Ver Ranking IAs</Link></Button>
          </div>
        </div>
      </div>
    </main>
  )
}
