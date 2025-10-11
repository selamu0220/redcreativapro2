'use client'

import { Button } from '../components/ui/button'
import SimpleLanguageToggle from '@/app/components/SimpleLanguageToggle'
import { useSimpleTranslations } from '@/app/lib/simple-translations'

export default function ContactoClient() {
  const { t } = useSimpleTranslations()
  
  const contactMethods = [
    {
      icon: "📧",
      title: "Email",
      description: "Respuesta en 24 horas",
      contact: "soporte@redcreativapro.com",
      action: "Enviar Email"
    },
    {
      icon: "💬",
      title: "Chat en Vivo",
      description: "Lun-Vie 9:00-18:00",
      contact: "Disponible en la aplicación",
      action: "Iniciar Chat"
    },
    {
      icon: "📱",
      title: "WhatsApp",
      description: "Respuesta rápida",
      contact: "+34 XXX XXX XXX",
      action: "Enviar Mensaje"
    }
  ]

  const faqCategories = [
    {
      question: "¿Cómo puedo cambiar mi plan?",
      answer: "Puedes cambiar tu plan desde la sección 'Planes' en tu cuenta."
    },
    {
      question: "¿Qué hacer si mi API key no funciona?",
      answer: "Verifica que la API key esté correctamente configurada en Ajustes."
    },
    {
      question: "¿Cómo cancelo mi suscripción?",
      answer: "Puedes cancelar tu suscripción desde la configuración de tu cuenta."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Header */}
      <div className="bg-gray-900/50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Contacto</h1>
            <a 
              href="/" 
              className="text-blue-400 hover:text-blue-300 transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al inicio
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            ¿Necesitas Ayuda?
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Nuestro equipo de soporte está aquí para ayudarte. Elige el método de contacto que prefieras.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {contactMethods.map((method, index) => (
            <div key={index} className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
              <div className="text-4xl mb-4">{method.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-white">{method.title}</h3>
              <p className="text-gray-400 mb-4">{method.description}</p>
              <p className="text-blue-400 mb-6 font-medium">{method.contact}</p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                {method.action}
              </Button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-800/30 rounded-xl p-8 border border-gray-700">
          <h3 className="text-2xl font-bold mb-8 text-center text-white">Preguntas Frecuentes</h3>
          <div className="space-y-6">
            {faqCategories.map((faq, index) => (
              <div key={index} className="border-b border-gray-700 pb-6 last:border-b-0">
                <h4 className="text-lg font-semibold mb-3 text-blue-400">{faq.question}</h4>
                <p className="text-gray-300">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="mt-16 bg-gray-800/30 rounded-xl p-8 border border-gray-700">
          <h3 className="text-2xl font-bold mb-8 text-center text-white">Envíanos un Mensaje</h3>
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nombre</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="tu@email.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Asunto</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="¿En qué podemos ayudarte?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Mensaje</label>
              <textarea 
                rows={6}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe tu consulta o problema..."
              />
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3">
              Enviar Mensaje
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}