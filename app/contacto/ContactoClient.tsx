'use client'

import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { SimpleMainNavigation } from '../components/SimpleMainNavigation'
import Footer from '../components/Footer'
import { Mail, MessageSquare, Phone, ArrowLeft, Send } from 'lucide-react'
import Link from 'next/link'

export default function ContactoClient() {
  const contactMethods = [
    {
      icon: Mail,
      title: "Email",
      description: "Respuesta en 24 horas",
      contact: "soporte@redcreativapro.com",
      action: "Enviar Email"
    },
    {
      icon: MessageSquare,
      title: "Chat en Vivo",
      description: "Lun-Vie 9:00-18:00",
      contact: "Disponible en la aplicación",
      action: "Iniciar Chat"
    },
    {
      icon: Phone,
      title: "WhatsApp",
      description: "Respuesta rápida",
      contact: "+34 600 000 000",
      action: "Enviar Mensaje"
    }
  ]

  const faqs = [
    {
      question: "¿Cómo puedo cambiar mi plan?",
      answer: "Puedes cambiar tu plan desde la sección 'Planes' en tu panel de control o contactando directamente con facturación."
    },
    {
      question: "¿Qué hacer si mi API key no funciona?",
      answer: "Verifica que la API key esté correctamente configurada en la sección de Ajustes y que tengas créditos disponibles."
    },
    {
      question: "¿Cómo cancelo mi suscripción?",
      answer: "La suscripción puede cancelarse en cualquier momento desde la gestión de facturación en tu perfil."
    }
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-24">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            ¿Necesitas ayuda?
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Nuestro equipo de soporte está aquí para ayudarte. Elige el método de contacto que prefieras o envíanos un mensaje.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-24">
          <div className="lg:col-span-2 space-y-8">
            {/* Contact Form */}
            <Card className="border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <CardTitle>Envíanos un mensaje</CardTitle>
                <CardDescription>
                  Cuéntanos en qué podemos ayudarte y te responderemos lo antes posible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nombre</label>
                      <Input placeholder="Tu nombre" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input type="email" placeholder="tu@email.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Asunto</label>
                    <Input placeholder="¿En qué podemos ayudarte?" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mensaje</label>
                    <Textarea 
                      placeholder="Describe tu consulta con detalle..." 
                      className="min-h-[150px]"
                    />
                  </div>
                  <Button className="w-full sm:w-auto bg-zinc-900 text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200">
                    <Send className="mr-2 h-4 w-4" />
                    Enviar mensaje
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* FAQs */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold tracking-tight mb-6">Preguntas frecuentes</h3>
              <div className="grid gap-4">
                {faqs.map((faq, i) => (
                  <Card key={i} className="border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <CardHeader className="p-6">
                      <CardTitle className="text-lg mb-2">{faq.question}</CardTitle>
                      <CardDescription className="text-zinc-600 dark:text-zinc-400">
                        {faq.answer}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {contactMethods.map((method, i) => (
              <Card key={i} className="border-zinc-200 dark:border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                      <method.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold">{method.title}</h4>
                      <p className="text-xs text-muted-foreground">{method.description}</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium mb-4">{method.contact}</p>
                  <Button variant="outline" className="w-full justify-between group">
                    {method.action}
                    <ArrowLeft className="h-4 w-4 rotate-180 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}

            <Card className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black border-none overflow-hidden relative">
              <CardContent className="p-8">
                <h4 className="text-xl font-bold mb-4">Soporte Prioritario</h4>
                <p className="text-sm text-zinc-300 dark:text-zinc-600 mb-6">
                  ¿Eres cliente Pro? Accede al chat prioritario 24/7 desde tu panel de control.
                </p>
                <Link href="/dashboard">
                  <Button className="w-full bg-white text-black dark:bg-black dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800">
                    Ir al Dashboard
                  </Button>
                </Link>
              </CardContent>
              <div className="absolute -right-8 -bottom-8 opacity-10">
                <MessageSquare className="h-32 w-32" />
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
