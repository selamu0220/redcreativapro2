'use client'

import Link from 'next/link'
import Image from 'next/image'
import { SimpleMainNavigation } from './SimpleMainNavigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Clock, 
  CheckCircle2, 
  MessageSquare, 
  PenTool, 
  Mail, 
  Users, 
  ArrowUpRight,
  Target,
  BarChart3,
  Globe2,
  Quote
} from 'lucide-react'

export default function HomePageClient() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      <SimpleMainNavigation />

      <main>
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 overflow-hidden border-b">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="outline" className="mb-6 px-4 py-1.5 text-xs font-medium uppercase tracking-wider bg-background/50 backdrop-blur-sm border-primary/20 text-primary animate-in fade-in slide-in-from-bottom-3 duration-1000">
                La nueva era del marketing con IA
              </Badge>
              
              <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8 leading-[0.95] animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
                Tu marketing no necesita más tiempo. <br />
                <span className="text-primary italic font-serif bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Necesita inteligencia.</span>
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-200">
                Transforma tu flujo de trabajo con la primera plataforma de IA diseñada específicamente para la cultura y el idioma español.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
                <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95" asChild>
                  <Link href="/dashboard">
                    Empezar gratis <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-full hover:bg-muted/50 transition-all active:scale-95" asChild>
                  <Link href="/planes">
                    Explorar soluciones
                  </Link>
                </Button>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-6 text-sm font-medium text-muted-foreground animate-in fade-in duration-1000 delay-500">
                <div className="flex items-center gap-2.5">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span>Resultados en segundos</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span>Español nativo real</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span>Privacidad garantizada</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Background Gradient Orbs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px]" />
          </div>
        </section>

        {/* Value Proposition Sections */}
        <section className="py-32 space-y-32">
          {/* Prop 1: Copywriting */}
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8 order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                  <PenTool className="h-3.5 w-3.5" /> Generación de Contenido
                </div>
                <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                  Adiós a la hoja en blanco. <br />
                  <span className="text-muted-foreground">Escribe como un experto.</span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Nuestra IA no solo traduce, entiende el contexto cultural y emocional de tu audiencia. Genera artículos, correos y anuncios que conectan de verdad, manteniendo tu tono de voz único en cada palabra.
                </p>
                <ul className="space-y-4">
                  {[
                    "Blog posts optimizados para SEO en minutos",
                    "Secuencias de email que convierten lectores en clientes",
                    "Copy persuasivo basado en frameworks de marketing real"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-1 h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="text-sm font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative order-1 lg:order-2">
                <div className="aspect-square bg-muted rounded-3xl overflow-hidden border shadow-2xl relative group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="p-8 h-full flex flex-col justify-center">
                    <Card className="border-2 border-primary/20 shadow-xl bg-background/80 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" /> Sugerencia de la IA
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="h-2 w-3/4 bg-muted rounded-full animate-pulse" />
                        <div className="h-2 w-full bg-muted rounded-full animate-pulse delay-75" />
                        <div className="h-2 w-5/6 bg-muted rounded-full animate-pulse delay-150" />
                        <div className="pt-4 border-t italic text-muted-foreground text-sm">
                          "Optimiza tu mensaje para un público joven en España usando un tono cercano pero profesional..."
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Prop 2: Analytics/SEO */}
          <div className="bg-muted/30 py-24">
            <div className="container mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="relative">
                  <div className="aspect-video bg-background rounded-2xl border shadow-xl flex items-center justify-center overflow-hidden">
                    <div className="grid grid-cols-4 items-end gap-2 h-32 px-12 w-full">
                      {[40, 70, 55, 90, 65, 80, 100].map((h, i) => (
                        <div 
                          key={i} 
                          className="bg-primary/40 rounded-t-sm w-full animate-in slide-in-from-bottom duration-1000" 
                          style={{ height: `${h}%`, transitionDelay: `${i * 100}ms` }} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                    <Target className="h-3.5 w-3.5" /> Estrategia y SEO
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                    Domina los buscadores <br />
                    <span className="text-muted-foreground">con datos, no conjeturas.</span>
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Nuestras herramientas de análisis SEO identifican oportunidades de tráfico que tu competencia está ignorando. Analizamos la intención de búsqueda real para que cada contenido que publiques tenga un propósito claro.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="h-10 w-10 rounded-lg bg-background border flex items-center justify-center shadow-sm">
                        <BarChart3 className="h-5 w-5 text-primary" />
                      </div>
                      <h4 className="font-bold">Análisis de Intención</h4>
                      <p className="text-sm text-muted-foreground">Entiende por qué tus clientes buscan lo que buscan.</p>
                    </div>
                    <div className="space-y-3">
                      <div className="h-10 w-10 rounded-lg bg-background border flex items-center justify-center shadow-sm">
                        <Globe2 className="h-5 w-5 text-primary" />
                      </div>
                      <h4 className="font-bold">SEO Local</h4>
                      <p className="text-sm text-muted-foreground">Optimiza tu presencia para mercados específicos en LATAM y España.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Prop 3: Automation */}
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                  <Zap className="h-3.5 w-3.5" /> Automatización Inteligente
                </div>
                <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                  Recupera tu tiempo. <br />
                  <span className="text-muted-foreground">Deja que la IA trabaje por ti.</span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Conecta tus flujos de trabajo y automatiza tareas repetitivas. Desde la gestión de prospectos hasta la creación de informes, Red Creativa Pro se integra en tu día a día para que te enfoques en lo que importa: crecer.
                </p>
                <div className="flex gap-4">
                  <Button asChild size="lg">
                    <Link href="/dashboard">Ver automatizaciones</Link>
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card className="shadow-lg hover:-translate-y-1 transition-transform">
                  <CardHeader className="pb-2">
                    <Mail className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-base">Email Marketing</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    Respuestas automáticas y secuencias de nutrición inteligentes.
                  </CardContent>
                </Card>
                <Card className="shadow-lg mt-8 hover:-translate-y-1 transition-transform">
                  <CardHeader className="pb-2">
                    <Users className="h-8 w-8 text-blue-500 mb-2" />
                    <CardTitle className="text-base">Gestión de Leads</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    Cualificación y seguimiento automático de nuevos contactos.
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials / Proof Section */}
        <section className="py-24 border-t bg-muted/20 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-4xl font-bold mb-6">Lo que dicen quienes ya están escalando</h2>
              <p className="text-lg text-muted-foreground">
                Casos reales de profesionales y empresas que han transformado su marketing con Red Creativa Pro.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative z-10">
              {[
                {
                  quote: "Red Creativa Pro redujo mi tiempo de redacción de 4 horas a solo 15 minutos por artículo. La calidad del español es impecable, nada que ver con otras herramientas.",
                  author: "Elena R.",
                  role: "Content Manager en Agencia Digital",
                  image: "https://i.pravatar.cc/150?u=elena"
                },
                {
                  quote: "Gracias a las herramientas SEO de la plataforma, logramos posicionar 5 keywords críticas en la primera página en menos de dos meses. Esencial para cualquier ecommerce.",
                  author: "Carlos M.",
                  role: "Fundador de Tienda Online",
                  image: "https://i.pravatar.cc/150?u=carlos"
                },
                {
                  quote: "Lo que más valoro es la transparencia y que esté pensado para nuestro idioma. No es una simple traducción de una herramienta americana, se nota el cariño.",
                  author: "Marta G.",
                  role: "Consultora SEO Freelance",
                  image: "https://i.pravatar.cc/150?u=marta"
                }
              ].map((t, i) => (
                <Card key={i} className="bg-background border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                  <CardContent className="pt-8">
                    <Quote className="h-8 w-8 text-primary/20 mb-4" />
                    <p className="text-muted-foreground leading-relaxed mb-6 italic">
                      "{t.quote}"
                    </p>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-muted border">
                        <Image src={t.image} alt={t.author} width={40} height={40} unoptimized />
                      </div>
                      <div>
                        <div className="font-bold text-sm">{t.author}</div>
                        <div className="text-xs text-muted-foreground">{t.role}</div>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            <div className="mt-16 text-center">
              <div className="inline-flex items-center gap-6 px-8 py-4 rounded-full bg-background border shadow-sm">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted overflow-hidden">
                      <Image src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" width={32} height={32} unoptimized />
                    </div>
                  ))}
                </div>
                <div className="text-sm font-medium">
                  Únete a más de <span className="text-primary font-bold">500+</span> profesionales hoy.
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 -translate-x-1/2" />
        </section>

        {/* Final CTA */}
        <section className="py-24 container mx-auto px-4">
          <Card className="bg-primary text-primary-foreground p-12 md:p-20 text-center overflow-hidden relative">
            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
                ¿Listo para elevar tu marketing?
              </h2>
              <p className="text-xl opacity-90 leading-relaxed">
                Empieza hoy mismo de forma gratuita. Sin compromisos, sin complicaciones. Solo resultados.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button size="lg" variant="secondary" className="h-14 px-10 text-lg rounded-full w-full sm:w-auto font-bold" asChild>
                  <Link href="/dashboard">
                    Crear cuenta gratis
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-full w-full sm:w-auto bg-transparent border-primary-foreground/20 hover:bg-white/10" asChild>
                  <Link href="/contacto">
                    Hablar con soporte
                  </Link>
                </Button>
              </div>
            </div>
            {/* Decorative background element */}
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-black/10 rounded-full blur-3xl" />
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">RC</span>
              </div>
              <span className="font-bold text-lg tracking-tight">Red Creativa Pro</span>
              <Badge variant="secondary" className="text-[10px] scale-90 ml-2">BETA</Badge>
            </div>
            
            <nav className="flex gap-8 text-sm text-muted-foreground font-medium">
              <Link href="/politica-privacidad" className="hover:text-foreground transition-colors">Privacidad</Link>
              <Link href="/terminos-servicio" className="hover:text-foreground transition-colors">Términos</Link>
              <Link href="https://es.trustpilot.com/review/redcreativa.pro" target="_blank" className="hover:text-foreground transition-colors flex items-center gap-1">
                Trustpilot <ArrowUpRight className="h-3 w-3" />
              </Link>
            </nav>

            <div className="text-xs text-muted-foreground font-mono flex items-center gap-4">
              <span>© 2025 RED CREATIVA PRO</span>
              <Separator orientation="vertical" className="h-4" />
              <span>MADE IN SPAIN</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

