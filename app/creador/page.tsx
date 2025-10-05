'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Heart, Lightbulb, User, Zap, ArrowLeft, ExternalLink, Coffee, Target, Sparkles, Calendar, MessageCircle, Bug, Users } from 'lucide-react';

export default function CreadorPage() {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span className="font-medium">Volver a Red Creativa Pro</span>
              </Link>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="relative mb-8">
            <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-primary/20 shadow-lg">
              <img
                src="https://i.ibb.co/bfb1ncN/image.png"
                alt="Creador de Red Creativa Pro"
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
              />
              {!imageLoaded && (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <User className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-4">
            Hola, soy Sela, creador de{' '}
            <span className="text-primary">Red Creativa Pro</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            Estudiante de Humanidades que soñaba con crear herramientas que realmente ahorren tiempo
          </p>
          
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Badge variant="secondary" className="px-3 py-1">
              <User className="h-3 w-3 mr-1" />
              Estudiante de Humanidades
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Target className="h-3 w-3 mr-1" />
              Emprendedor
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Coffee className="h-3 w-3 mr-1" />
              Autónomo
            </Badge>
          </div>
        </div>

        {/* Mi Historia */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Mi Historia
            </CardTitle>
            <CardDescription>
              Cómo nació Red Creativa Pro
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Como estudiante, siempre estaba buscando maneras de optimizar mi tiempo. Entre clases, trabajos y proyectos personales, 
              cada minuto contaba. Me frustraba ver cuánto tiempo perdía en tareas repetitivas de escritura y creación de contenido.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Pensaba: <em>"¿No habrá una forma de automatizar esto? ¿Una herramienta que realmente me ayude a ser más productivo?"</em>
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Así comenzó mi búsqueda por crear algo que no solo me ayudara a mí, sino a otros que enfrentaran los mismos desafíos.
            </p>
          </CardContent>
        </Card>

        {/* La Inspiración */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              El Momento que Cambió Todo
            </CardTitle>
            <CardDescription>
              Cuando ChatGPT me dejó alucinando
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-primary">
              <p className="text-muted-foreground leading-relaxed italic">
                "La primera vez que vi lo que ChatGPT podía hacer, literalmente me quedé alucinando. 
                No era solo una herramienta más, era como tener un asistente creativo disponible 24/7."
              </p>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Esa experiencia me abrió los ojos. Vi el potencial increíble de la IA para transformar la forma en que trabajamos. 
              Pero también me di cuenta de que la mayoría de las herramientas eran complicadas, caras o simplemente no estaban 
              diseñadas para personas como yo.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Ahí nació la idea: crear una plataforma que fuera <strong>simple, accesible y realmente útil</strong> para cualquier persona 
              que quisiera aprovechar el poder de la IA en su trabajo diario.
            </p>
          </CardContent>
        </Card>

        {/* Acceso Completo al Creador */}
        <Card className="mb-8 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              Tienes Acceso Completo al Creador
            </CardTitle>
            <CardDescription>
              Habla directamente conmigo, sin intermediarios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">💬 Contacto Directo</h4>
                <p className="text-sm text-muted-foreground">
                  No soy una gran empresa con múltiples capas de soporte. Soy Sela, y puedes hablar directamente conmigo 
                  sobre cualquier duda, sugerencia o problema.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">⚡ Feedback Inmediato</h4>
                <p className="text-sm text-muted-foreground">
                  Tu opinión y sugerencias son fundamentales. Las implemento rápidamente porque construimos 
                  juntos la herramienta que realmente necesitas.
                </p>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="bg-gradient-to-r from-blue/10 to-primary/10 p-6 rounded-lg">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Heart className="h-4 w-4 text-blue-500" />
                Cuando te suscribes, obtienes:
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Acceso directo al creador para resolver dudas
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Influencia real en el desarrollo de nuevas funciones
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Relación personal, no corporativa
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Ser parte de una comunidad pequeña y cercana
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Apoyas a un Emprendedor */}
        <Card className="mb-8 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Apoyas a un Emprendimiento Pequeñito
            </CardTitle>
            <CardDescription>
              Tu suscripción hace la diferencia
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">🏢 Esto NO es una corporación</h4>
                <p className="text-sm text-muted-foreground">
                  Red Creativa Pro no es una gran empresa con miles de empleados. Soy un estudiante autónomo 
                  que trabaja desde su habitación, con mucha pasión y pocas horas de sueño.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">💝 Tu apoyo es real</h4>
                <p className="text-sm text-muted-foreground">
                  Cada suscripción me ayuda a seguir desarrollando nuevas funcionalidades, mantener los servidores 
                  funcionando y dedicar más tiempo a mejorar la plataforma.
                </p>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Cuando te suscribes, estás:
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  Apoyando el sueño de un estudiante emprendedor
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  Invirtiendo en innovación hecha con pasión
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  Ayudando a que este proyecto crezca de forma sostenible
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  Siendo parte de una comunidad que valora la creatividad
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Contacto Directo y Agendar Llamada */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-6">
                  Agenda una Llamada Conmigo
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  ¿Encontraste alguna debilidad en la app? ¿Tienes ideas para mejorarla? 
                  Hablemos directamente. Tu feedback es invaluable para hacer Red Creativa Pro mejor.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="p-6 bg-background rounded-lg border">
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="h-6 w-6 text-primary" />
                    <h3 className="text-xl font-semibold">Reunión de Feedback</h3>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Agenda una llamada de 30 minutos para contarme qué debilidades encuentras en la app, 
                    qué funciones te gustaría ver, o simplemente para conocernos mejor.
                  </p>
                  <Button className="w-full" size="lg">
                    <Calendar className="h-4 w-4 mr-2" />
                    Agendar Llamada
                  </Button>
                </div>
                
                <div className="p-6 bg-background rounded-lg border">
                  <div className="flex items-center gap-3 mb-4">
                    <MessageCircle className="h-6 w-6 text-primary" />
                    <h3 className="text-xl font-semibold">Contacto Inmediato</h3>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    ¿Prefieres escribir? Envíame un mensaje directo con tus sugerencias, 
                    problemas que hayas encontrado, o cualquier duda que tengas.
                  </p>
                  <Button variant="outline" className="w-full" size="lg">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Enviar Mensaje
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feedback y Debilidades */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">
                Ayúdame a Mejorar Red Creativa Pro
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Tu experiencia usando la app es fundamental. Cuéntame qué no funciona bien, 
                qué te resulta confuso, o qué funciones echas en falta.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-background rounded-lg border">
                  <Bug className="h-8 w-8 text-red-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Reporta Bugs</h3>
                  <p className="text-sm text-muted-foreground">
                    ¿Algo no funciona como debería? Cuéntamelo y lo arreglo rápido
                  </p>
                </div>
                <div className="p-6 bg-background rounded-lg border">
                  <Lightbulb className="h-8 w-8 text-yellow-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Sugiere Mejoras</h3>
                  <p className="text-sm text-muted-foreground">
                    ¿Tienes ideas para nuevas funciones? Tu creatividad impulsa el desarrollo
                  </p>
                </div>
                <div className="p-6 bg-background rounded-lg border">
                  <Users className="h-8 w-8 text-blue-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Comparte tu Experiencia</h3>
                  <p className="text-sm text-muted-foreground">
                    ¿Cómo usas la app? Tu flujo de trabajo me ayuda a entender mejor las necesidades
                  </p>
                </div>
              </div>
              
              <Button size="lg" className="px-8">
                <MessageCircle className="h-4 w-4 mr-2" />
                Compartir Feedback
              </Button>
            </div>
          </div>
        </section>

        {/* Invitación a Probar Gratis */}
        <section className="py-16 bg-gradient-to-r from-green-500/10 to-primary/10">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Prueba Primero, Paga Solo Si Te Sirve
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Te invito a que pruebes Red Creativa Pro sin pagar primero. Si realmente le sacas provecho 
              y te ayuda en tu trabajo, entonces considera suscribirte para apoyar el proyecto.
            </p>
            
            <div className="bg-background/80 backdrop-blur-sm rounded-lg p-8 max-w-2xl mx-auto mb-8">
              <h3 className="text-xl font-semibold mb-4">Mi Filosofía</h3>
              <p className="text-muted-foreground">
                Creo que las herramientas deben demostrar su valor antes de pedir dinero. 
                Usa Red Creativa Pro, explora todas sus funciones, y solo si realmente te ayuda 
                a ser más productivo, entonces apoya el proyecto con una suscripción.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8">
                <Sparkles className="h-4 w-4 mr-2" />
                Probar Gratis Ahora
              </Button>
              <Button variant="outline" size="lg" className="px-8">
                <Heart className="h-4 w-4 mr-2" />
                Conocer Planes
              </Button>
            </div>
          </div>
        </section>

        {/* Call to Action Final */}
        <section className="py-16 bg-gradient-to-r from-primary/10 to-blue-500/10">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">
              ¿Listo para Unirte a Red Creativa Pro?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Únete a una comunidad pequeña pero comprometida con la productividad y la creatividad. 
              Habla directamente conmigo y construyamos juntos la herramienta perfecta.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8">
                <Sparkles className="h-4 w-4 mr-2" />
                Unirme a Red Creativa Pro
              </Button>
              <Button variant="outline" size="lg" className="px-8">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contactar a Sela
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>Hecho con ❤️ por un estudiante emprendedor</p>
            <p className="mt-2">
              <Link href="/" className="hover:text-primary transition-colors">
                Red Creativa Pro
              </Link>
              {' • '}
              <Link href="/contacto" className="hover:text-primary transition-colors">
                Contacto
              </Link>
              {' • '}
              <Link href="/planes" className="hover:text-primary transition-colors">
                Membresía
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}