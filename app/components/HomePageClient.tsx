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
    Quote,
    Star,
    Instagram,
    Heart,
    Coffee,
    Code,
    Github
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
                  Creado por y para creativos
                </Badge>
                
                <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8 leading-[0.95] animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
                  Red Creativa Pro <br />
                  <span className="text-primary italic font-serif bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Tu equipo, no tu herramienta.</span>
                </h1>
  
                    <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-200">
                      Entendemos el contexto cultural y emocional de tu audiencia para generar artículos, correos y anuncios que conectan de verdad. Tan naturales que nadie sabrá que hay tecnología detrás.
                    </p>
  
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
                  <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95" asChild>
                    <Link href="/dashboard">
                      Empezar juntos <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-full hover:bg-muted/50 transition-all active:scale-95" asChild>
                    <Link href="#historia">
                      Mi historia
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
                    Nuestro sistema analiza el tono y la emoción de tu audiencia. Genera ideas y textos que conectan de verdad, manteniendo tu esencia en cada palabra.
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
                            <Sparkles className="h-5 w-5 text-primary" /> Sugerencia inteligente
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
                    <span className="text-muted-foreground">Simplifica tu flujo de trabajo.</span>
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
              <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="text-4xl font-bold mb-6">Estamos empezando una revolución</h2>
                  <p className="text-lg text-muted-foreground">
                    Acabamos de lanzar y estamos buscando pioneros. Sé de los primeros en probar nuestra tecnología y cuéntanos tu experiencia.
                  </p>
              </div>
  
              <div className="max-w-xl mx-auto">
                <Card className="bg-background border-dashed border-2 flex flex-col items-center justify-center p-12 text-center hover:bg-muted/50 transition-colors cursor-pointer group">
                  <Link href="https://es.trustpilot.com/review/redcreativa.pro" target="_blank" className="flex flex-col items-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Star className="h-8 w-8 text-primary fill-primary" />
                    </div>
                    <CardTitle className="mb-4 text-2xl">Danos tu opinión en Trustpilot</CardTitle>
                    <CardDescription className="text-base mb-6 text-center">
                      Tu feedback es el motor de nuestra plataforma. Comparte tu experiencia y ayúdanos a construir la mejor herramienta para el mercado hispano.
                    </CardDescription>
                    <Button variant="outline" className="rounded-full">
                      Escribir reseña <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </Card>
              </div>
              
              <div className="mt-16 text-center">
                <div className="inline-flex items-center gap-6 px-8 py-4 rounded-full bg-background border shadow-sm">
                  <div className="text-sm font-medium">
                    Únete a los primeros <span className="text-primary font-bold">100</span> usuarios fundadores.
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 -translate-x-1/2" />
          </section>

          {/* Story & Support Section */}
          <section id="historia" className="py-32 bg-background border-y scroll-mt-24">
            <div className="container mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-20 items-center">
                <div className="space-y-10">
                    <div className="space-y-6">
                      <h2 className="text-4xl font-bold">La historia detrás del código</h2>
                      <p className="text-xl text-muted-foreground leading-relaxed">
                        Este proyecto nació de la necesidad de crear herramientas que se sientan humanas, no robóticas. He diseñado este espacio para que sea <span className="text-foreground font-semibold">nuestro</span>.
                      </p>
                      <p className="text-lg text-muted-foreground leading-relaxed">
                        Red Creativa Pro crece con cada sugerencia tuya. No somos una corporación fría, somos un equipo donde tú eres quien da forma al futuro.
                      </p>
                    </div>

                  <div className="grid sm:grid-cols-2 gap-8">
                    <div className="p-6 rounded-2xl bg-muted/30 border border-primary/10 space-y-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Code className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-bold text-lg">Mejora el código</h3>
                      <p className="text-sm text-muted-foreground">¿Eres dev? Si quieres ayudar a mejorar las funciones o proponer cambios técnicos, escríbeme. Hagámoslo juntos.</p>
                      <Button variant="link" className="p-0 h-auto text-primary" asChild>
                        <Link href="https://instagram.com/pau_programar" target="_blank" className="flex items-center gap-2">
                          Háblame por Instagram <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>

                    <div className="p-6 rounded-2xl bg-muted/30 border border-primary/10 space-y-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Coffee className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-bold text-lg">Apoya el proyecto</h3>
                      <p className="text-sm text-muted-foreground">Si valoras el esfuerzo y quieres ayudarme a mantener los servidores y seguir estudiando, puedes apoyar económicamente.</p>
                      <Button variant="link" className="p-0 h-auto text-primary" asChild>
                        <Link href="/planes" className="flex items-center gap-2">
                          Ver formas de apoyo <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="aspect-[4/5] bg-muted rounded-[2rem] overflow-hidden border-8 border-background shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 flex flex-col justify-end p-8 text-white">
                      <p className="text-xl font-medium italic">"Empecé esto en mi habitación con un café y muchas ganas de crear algo útil para todos."</p>
                      <div className="mt-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center font-bold border-2 border-white">RC</div>
                        <div>
                          <p className="font-bold">El Creador</p>
                          <p className="text-sm opacity-80">Estudiante & Dev</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Decorative element */}
                  <div className="absolute -top-10 -right-10 h-32 w-32 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                </div>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="py-24 container mx-auto px-4">
            <Card className="bg-primary text-primary-foreground p-12 md:p-20 text-center overflow-hidden relative">
              <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
                  Forma parte de esto
                </h2>
                <p className="text-xl opacity-90 leading-relaxed">
                  No estás comprando un software corporativo. Estás uniéndote a un equipo que busca simplificar el marketing para humanos.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <Button size="lg" variant="secondary" className="h-14 px-10 text-lg rounded-full w-full sm:w-auto font-bold" asChild>
                    <Link href="/dashboard">
                      Únete a nosotros gratis
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-full w-full sm:w-auto bg-transparent border-primary-foreground/20 hover:bg-white/10" asChild>
                    <Link href="https://instagram.com/pau_programar" target="_blank">
                      Pregúntame lo que quieras
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

              <div className="text-xs text-muted-foreground font-mono flex flex-col md:flex-row items-center gap-4">
                <span>© 2025 RED CREATIVA PRO</span>
                <Separator orientation="vertical" className="hidden md:block h-4" />
                  <span>UN PROYECTO INDEPENDIENTE</span>
                <Separator orientation="vertical" className="hidden md:block h-4" />
                <span>MADE WITH <Heart className="inline h-3 w-3 text-red-500 fill-red-500" /> IN SPAIN</span>
              </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

