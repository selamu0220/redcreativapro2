import { Metadata } from 'next'
import { Button } from '../components/ui/button'

export const metadata: Metadata = {
  title: 'Contacto - Red Creativa Pro',
  description: 'Ponte en contacto con nuestro equipo de soporte. Estamos aquí para ayudarte con cualquier pregunta o problema.',
  keywords: ['contacto', 'soporte', 'ayuda', 'Red Creativa Pro', 'atención al cliente'],
  authors: [{ name: 'Red Creativa Pro' }],
  openGraph: {
    title: 'Contacto - Red Creativa Pro',
    description: 'Ponte en contacto con nuestro equipo de soporte. Estamos aquí para ayudarte con cualquier pregunta o problema.',
    type: 'website',
  },
}

export default function ContactoPage() {
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
          <h2 className="text-4xl font-bold text-white mb-4">¿Necesitas Ayuda?</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Nuestro equipo de soporte está aquí para ayudarte. Elige la forma de contacto que prefieras.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Formulario de Contacto */}
          <div className="bg-gray-800 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Envíanos un Mensaje</h3>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="asunto" className="block text-sm font-medium text-gray-300 mb-2">
                  Asunto *
                </label>
                <select
                  id="asunto"
                  name="asunto"
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Selecciona un asunto</option>
                  <option value="soporte-tecnico">Soporte Técnico</option>
                  <option value="facturacion">Facturación</option>
                  <option value="cuenta">Problemas de Cuenta</option>
                  <option value="funcionalidad">Consulta sobre Funcionalidad</option>
                  <option value="sugerencia">Sugerencia</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label htmlFor="mensaje" className="block text-sm font-medium text-gray-300 mb-2">
                  Mensaje *
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  rows={6}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Describe tu consulta o problema..."
                ></textarea>
              </div>

              <Button
                type="submit"
                className="w-full"
              >
                Enviar Mensaje
              </Button>
            </form>
          </div>

          {/* Métodos de Contacto */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Otras Formas de Contacto</h3>
              <div className="space-y-4">
                {contactMethods.map((method, index) => (
                  <div key={index} className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-all duration-300">
                    <div className="flex items-start">
                      <span className="text-3xl mr-4">{method.icon}</span>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-white mb-1">{method.title}</h4>
                        <p className="text-gray-400 text-sm mb-2">{method.description}</p>
                        <p className="text-blue-400 mb-3">{method.contact}</p>
                        <button className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200">
                          {method.action} →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Horarios de Atención */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Horarios de Atención</h4>
              <div className="space-y-2 text-gray-300">
                <div className="flex justify-between">
                  <span>Lunes - Viernes:</span>
                  <span>9:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Sábados:</span>
                  <span>10:00 - 14:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Domingos:</span>
                  <span>Cerrado</span>
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-4">
                * Horario en España (CET/CEST)
              </p>
            </div>

            {/* Tiempo de Respuesta */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-2">Tiempo de Respuesta</h4>
              <ul className="text-green-100 space-y-1">
                <li>• Chat en vivo: Inmediato</li>
                <li>• Email: 24 horas</li>
                <li>• WhatsApp: 2-4 horas</li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ Rápido */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Preguntas Frecuentes</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {faqCategories.map((faq, index) => (
              <div key={index} className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors duration-200">
                <h4 className="text-lg font-semibold text-white mb-3">{faq.question}</h4>
                <p className="text-gray-300 text-sm">{faq.answer}</p>
                <a href="/preguntas-frecuentes" className="text-blue-400 hover:text-blue-300 text-sm font-medium mt-3 inline-block transition-colors duration-200">
                  Ver más →
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Final */}
        <div className="mt-16 text-center">
          <div className="bg-gray-800 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">¿Necesitas ayuda inmediata?</h3>
            <p className="text-gray-300 mb-6">Consulta nuestro centro de ayuda para encontrar respuestas rápidas</p>
            <Button asChild>
              <a href="/centro-ayuda">
                Ir al Centro de Ayuda
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}