'use client'

import { Metadata } from 'next'
import { useState } from 'react'

const metadata: Metadata = {
  title: 'Preguntas Frecuentes - Red Creativa Pro',
  description: 'Encuentra respuestas a las preguntas más comunes sobre Red Creativa Pro, planes, funcionalidades y soporte técnico.',
  keywords: ['FAQ', 'preguntas frecuentes', 'ayuda', 'soporte', 'Red Creativa Pro'],
  authors: [{ name: 'Red Creativa Pro' }],
  openGraph: {
    title: 'Preguntas Frecuentes - Red Creativa Pro',
    description: 'Encuentra respuestas a las preguntas más comunes sobre Red Creativa Pro, planes, funcionalidades y soporte técnico.',
    type: 'website',
  },
}

export default function PreguntasFrecuentesPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  const faqCategories = [
    {
      category: "Cuenta y Registro",
      icon: "👤",
      questions: [
        {
          question: "¿Cómo creo una cuenta en Red Creativa Pro?",
          answer: "Puedes crear una cuenta visitando la página de registro y proporcionando tu email. También puedes registrarte usando tu cuenta de Google para mayor comodidad."
        },
        {
          question: "¿Puedo cambiar mi email de registro?",
          answer: "Sí, puedes cambiar tu email desde la sección de configuración de tu cuenta. Ten en cuenta que necesitarás verificar el nuevo email."
        },
        {
          question: "¿Qué hago si olvido mi contraseña?",
          answer: "Usa la opción 'Olvidé mi contraseña' en la página de inicio de sesión. Te enviaremos un enlace para restablecer tu contraseña."
        }
      ]
    },
    {
      category: "Planes y Facturación",
      icon: "💳",
      questions: [
        {
          question: "¿Cuáles son las diferencias entre los planes?",
          answer: "El Plan Gratuito incluye funciones básicas con límites de uso. El Plan Pro ofrece acceso completo sin límites y funciones avanzadas. El Plan Premium incluye todas las funciones Pro más características exclusivas."
        },
        {
          question: "¿Puedo cambiar de plan en cualquier momento?",
          answer: "Sí, puedes actualizar o degradar tu plan en cualquier momento desde la sección 'Planes' en tu cuenta. Los cambios se aplican inmediatamente."
        },
        {
          question: "¿Cómo cancelo mi suscripción?",
          answer: "Puedes cancelar tu suscripción desde la configuración de tu cuenta. Tu plan seguirá activo hasta el final del período de facturación actual."
        },
        {
          question: "¿Ofrecen reembolsos?",
          answer: "Ofrecemos reembolsos dentro de los primeros 7 días de la suscripción si no estás satisfecho con el servicio. Contacta a nuestro soporte para procesar el reembolso."
        }
      ]
    },
    {
      category: "Escritor IA",
      icon: "✍️",
      questions: [
        {
          question: "¿Cómo funciona el Escritor IA?",
          answer: "El Escritor IA utiliza inteligencia artificial avanzada para mejorar tus textos. Simplemente pega tu texto, selecciona el tipo de mejora que deseas y la IA optimizará tu contenido."
        },
        {
          question: "¿Qué tipos de mejoras puedo solicitar?",
          answer: "Puedes solicitar corrección ortográfica, mejora de estilo, optimización SEO, cambio de tono, traducción, y muchas otras opciones de mejora de texto."
        },
        {
          question: "¿Hay límites en la longitud del texto?",
          answer: "El Plan Gratuito tiene límites en la cantidad de texto que puedes procesar. Los planes de pago ofrecen límites mucho más amplios o ilimitados según el plan."
        }
      ]
    },
    {
      category: "Correos IA",
      icon: "📧",
      questions: [
        {
          question: "¿Cómo configuro mi cuenta de Gmail?",
          answer: "Ve a Ajustes > Configuración de Gmail y sigue las instrucciones para conectar tu cuenta. Necesitarás autorizar el acceso a tu cuenta de Gmail."
        },
        {
          question: "¿Es seguro conectar mi Gmail?",
          answer: "Sí, utilizamos OAuth2 de Google para una conexión segura. No almacenamos tu contraseña y solo accedemos a los permisos que autorizas específicamente."
        },
        {
          question: "¿Puedo usar múltiples cuentas de Gmail?",
          answer: "Actualmente soportamos una cuenta de Gmail por usuario. Si necesitas cambiar de cuenta, puedes desconectar la actual y conectar una nueva."
        }
      ]
    },
    {
      category: "API y Configuración",
      icon: "⚙️",
      questions: [
        {
          question: "¿Necesito mi propia API key de Google AI Studio?",
          answer: "No es necesario. Red Creativa Pro incluye una API key por defecto para que puedas empezar a usar el servicio inmediatamente. Sin embargo, puedes configurar tu propia API key si lo prefieres."
        },
        {
          question: "¿Cómo obtengo mi propia API key?",
          answer: "Visita Google AI Studio, crea una cuenta, y genera una API key. Luego ve a Ajustes en Red Creativa Pro y configura tu API key personal."
        },
        {
          question: "¿Qué ventajas tiene usar mi propia API key?",
          answer: "Usar tu propia API key te da control total sobre el uso y los límites, y puede ofrecer mejor rendimiento durante picos de tráfico."
        }
      ]
    },
    {
      category: "Soporte Técnico",
      icon: "🔧",
      questions: [
        {
          question: "¿Qué hago si encuentro un error?",
          answer: "Si encuentras un error, intenta refrescar la página primero. Si el problema persiste, contacta a nuestro soporte con una descripción detallada del problema."
        },
        {
          question: "¿Cómo reporto un bug?",
          answer: "Puedes reportar bugs a través de nuestro formulario de contacto o enviando un email a soporte@redcreativapro.com con detalles del problema y pasos para reproducirlo."
        },
        {
          question: "¿Cuál es el tiempo de respuesta del soporte?",
          answer: "Nuestro tiempo de respuesta promedio es de 24 horas para emails y inmediato para chat en vivo durante horario de oficina."
        }
      ]
    }
  ]

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Header */}
      <div className="bg-gray-900/50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Preguntas Frecuentes</h1>
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">¿Tienes Preguntas?</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Encuentra respuestas rápidas a las preguntas más comunes sobre Red Creativa Pro
          </p>
        </div>

        {/* Buscador */}
        <div className="mb-12">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Buscar en preguntas frecuentes..."
              className="w-full px-6 py-4 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-gray-800 rounded-2xl p-6">
              <div className="flex items-center mb-6">
                <span className="text-3xl mr-3">{category.icon}</span>
                <h3 className="text-2xl font-bold text-white">{category.category}</h3>
              </div>
              
              <div className="space-y-4">
                {category.questions.map((faq, faqIndex) => {
                  const globalIndex = categoryIndex * 100 + faqIndex
                  return (
                    <div key={faqIndex} className="border border-gray-700 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleFAQ(globalIndex)}
                        className="w-full px-6 py-4 text-left bg-gray-700 hover:bg-gray-650 transition-colors duration-200 flex items-center justify-between"
                      >
                        <span className="text-white font-medium">{faq.question}</span>
                        <svg 
                          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${openFAQ === globalIndex ? 'rotate-180' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {openFAQ === globalIndex && (
                        <div className="px-6 py-4 bg-gray-750 border-t border-gray-600">
                          <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">¿No encontraste tu respuesta?</h3>
          <p className="text-blue-100 mb-6">Nuestro equipo de soporte está listo para ayudarte</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contacto" 
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
            >
              Contactar Soporte
            </a>
            <a 
              href="/centro-ayuda" 
              className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200"
            >
              Centro de Ayuda
            </a>
          </div>
        </div>

        {/* Enlaces útiles */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-xl p-6 text-center hover:bg-gray-750 transition-colors duration-200">
            <div className="text-3xl mb-3">📚</div>
            <h4 className="text-lg font-semibold text-white mb-2">Guías de Usuario</h4>
            <p className="text-gray-400 text-sm mb-4">Tutoriales detallados para aprovechar al máximo Red Creativa Pro</p>
            <a href="/centro-ayuda" className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200">
              Ver Guías →
            </a>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 text-center hover:bg-gray-750 transition-colors duration-200">
            <div className="text-3xl mb-3">🎯</div>
            <h4 className="text-lg font-semibold text-white mb-2">Estado del Servicio</h4>
            <p className="text-gray-400 text-sm mb-4">Verifica el estado actual de nuestros servicios</p>
            <a href="/estado-servicio" className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200">
              Ver Estado →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}