'use client'

import Link from 'next/link'
import Image from 'next/image'
import { SimpleMainNavigation } from './SimpleMainNavigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowRight, Sparkles, Zap, Clock, CheckCircle2, MessageSquare, PenTool, Mail, Users, ArrowUpRight } from 'lucide-react'

export default function HomePageClient() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <SimpleMainNavigation />

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <Badge variant="secondary" className="mb-6 px-3 py-1 text-xs font-mono uppercase tracking-widest">
                Versión Beta — Acceso Anticipado
              </Badge>
              
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
                Marketing con IA <br />
                <span className="text-muted-foreground italic font-serif">sin fricciones.</span>
              </h1>

              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                Herramientas de inteligencia artificial optimizadas para el mercado hispano. 
                Escritura, campañas y automatización en un solo lugar.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                <Button size="lg" className="h-12 px-8 text-base rounded-full" asChild>
                  <Link href="/dashboard">
                    Empezar ahora <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 text-base rounded-full" asChild>
                  <Link href="/planes">
                    Ver planes
                  </Link>
                </Button>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-sm text-muted-foreground/60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-foreground" />
                  <span>Sin tarjeta de crédito</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-foreground" />
                  <span>Acceso inmediato</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-foreground" />
                  <span>Cancela cuando quieras</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Subtle Background Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10" />
        </section>

        {/* Banner Section */}
        <section className="py-12 bg-muted/30 border-y">
          <div className="container mx-auto px-4">
            <Card className="border-dashed bg-background/50 backdrop-blur-sm overflow-hidden group">
              <div className="flex flex-col md:flex-row items-center justify-between p-8 gap-6">
                <div className="space-y-2">
                  <Badge variant="outline" className="text-[10px] uppercase tracking-tighter">Gratis</Badge>
                  <h3 className="text-2xl font-bold">Plantilla para Solicitudes Creativas</h3>
                  <p className="text-muted-foreground max-w-md">
                    Mejora tus resultados con IA usando nuestra guía profesional para redactar briefs perfectos.
                  </p>
                </div>
                <Button asChild variant="secondary" className="group-hover:translate-x-1 transition-transform">
                  <Link href="/plantilla-solicitudes-creativas">
                    Descargar ahora <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </section>

        <Separator className="container mx-auto" />

        {/* Creator Section */}
        <section className="py-24 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-background border rounded-full">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-muted">
                    <Image 
                      src="https://i.ibb.co/bfb1ncN/image.png" 
                      alt="Selamu" 
                      width={32}
                      height={32}
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <span className="text-sm font-medium italic">Un proyecto independiente de Selamu</span>
                </div>

                <h2 className="text-4xl font-bold tracking-tight">
                  Construido por una persona real, <br />
                  <span className="text-muted-foreground">para personas reales.</span>
                </h2>

                <p className="text-lg text-muted-foreground leading-relaxed">
                  Red Creativa Pro no es una corporación sin rostro. Soy un estudiante de Humanidades 
                  obsesionado con la eficiencia. Cada herramienta aquí ha sido creada para resolver 
                  problemas que yo mismo enfrenté.
                </p>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-bold flex items-center gap-2">
                      <Sparkles className="h-4 w-4" /> Ética IA
                    </h4>
                    <p className="text-sm text-muted-foreground">Herramientas diseñadas para aumentar tu creatividad, no para reemplazarla.</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold flex items-center gap-2">
                      <Zap className="h-4 w-4" /> Sin Engaños
                    </h4>
                    <p className="text-sm text-muted-foreground">Sin suscripciones ocultas ni letras pequeñas. Transparencia total.</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-4">
                  <Button asChild>
                    <Link href="/creador">Mi historia</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/contacto">Hablemos</Link>
                  </Button>
                </div>
              </div>

              <Card className="bg-primary text-primary-foreground p-8 relative overflow-hidden">
                <blockquote className="text-2xl font-medium leading-relaxed relative z-10">
                  "Creo que las herramientas deben demostrar su valor antes de pedir dinero. 
                  Explora todo, y solo si te ayuda a ser más productivo, apoya el proyecto."
                </blockquote>
                <div className="mt-8 flex items-center gap-4 relative z-10">
                  <Separator className="w-12 bg-primary-foreground/30" />
                  <span className="font-mono text-sm uppercase tracking-widest opacity-70">Filosofía de producto</span>
                </div>
                {/* Decorative background element */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-[10px]">RC</span>
              </div>
              <span className="font-bold text-sm tracking-tight">Red Creativa Pro</span>
              <Badge variant="secondary" className="text-[10px] scale-90">BETA</Badge>
            </div>
            
            <nav className="flex gap-8 text-sm text-muted-foreground">
              <Link href="/politica-privacidad" className="hover:text-foreground transition-colors">Privacidad</Link>
              <Link href="/terminos-servicio" className="hover:text-foreground transition-colors">Términos</Link>
              <Link href="https://es.trustpilot.com/review/redcreativa.pro" className="hover:text-foreground transition-colors flex items-center gap-1">
                Trustpilot <ArrowUpRight className="h-3 w-3" />
              </Link>
            </nav>

            <p className="text-xs text-muted-foreground font-mono">
              © 2024 RED CREATIVA PRO — MADE IN SPAIN
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
