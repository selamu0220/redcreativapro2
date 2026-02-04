'use client'

import { useState } from 'react'
import { SimpleMainNavigation } from '../components/SimpleMainNavigation'
import Footer from '../components/Footer'

// FAQ data exported for use in metadata and schema
export const faqCategories = [
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

export default function PreguntasFrecuentesClient() {
    const [openFAQ, setOpenFAQ] = useState<number | null>(null)

    const toggleFAQ = (index: number) => {
        setOpenFAQ(openFAQ === index ? null : index)
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <SimpleMainNavigation />

            <main className="flex-grow">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Hero Section */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-foreground mb-4">Preguntas Frecuentes</h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Encuentra respuestas rápidas a las preguntas más comunes sobre Red Creativa Pro
                        </p>
                    </div>

                    {/* Buscador */}
                    <div className="mb-12">
                        <div className="relative max-w-2xl mx-auto">
                            <input
                                type="text"
                                placeholder="Buscar en preguntas frecuentes..."
                                className="w-full px-6 py-4 bg-muted border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                            />
                            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* FAQ Categories */}
                    <div className="space-y-8">
                        {faqCategories.map((category, categoryIndex) => (
                            <div key={categoryIndex} className="bg-card border border-border rounded-2xl p-6">
                                <div className="flex items-center mb-6">
                                    <span className="text-3xl mr-3">{category.icon}</span>
                                    <h2 className="text-2xl font-bold text-foreground">{category.category}</h2>
                                </div>

                                <dl className="space-y-4">
                                    {category.questions.map((faq, faqIndex) => {
                                        const globalIndex = categoryIndex * 100 + faqIndex
                                        return (
                                            <div key={faqIndex} className="border border-border rounded-lg overflow-hidden">
                                                <dt>
                                                    <button
                                                        onClick={() => toggleFAQ(globalIndex)}
                                                        className="w-full px-6 py-4 text-left bg-muted hover:bg-muted/80 transition-colors duration-200 flex items-center justify-between"
                                                        aria-expanded={openFAQ === globalIndex}
                                                        aria-controls={`faq-answer-${globalIndex}`}
                                                    >
                                                        <span className="text-foreground font-medium">{faq.question}</span>
                                                        <svg
                                                            className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${openFAQ === globalIndex ? 'rotate-180' : ''}`}
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>
                                                </dt>
                                                {openFAQ === globalIndex && (
                                                    <dd
                                                        id={`faq-answer-${globalIndex}`}
                                                        className="px-6 py-4 bg-background border-t border-border"
                                                    >
                                                        <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                                                    </dd>
                                                )}
                                            </div>
                                        )
                                    })}
                                </dl>
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
                        <div className="bg-card border border-border rounded-xl p-6 text-center hover:bg-muted/50 transition-colors duration-200">
                            <div className="text-3xl mb-3">📚</div>
                            <h4 className="text-lg font-semibold text-foreground mb-2">Guías de Usuario</h4>
                            <p className="text-muted-foreground text-sm mb-4">Tutoriales detallados para aprovechar al máximo Red Creativa Pro</p>
                            <a href="/centro-ayuda" className="text-primary hover:text-primary/80 font-medium transition-colors duration-200">
                                Ver Guías →
                            </a>
                        </div>
                        <div className="bg-card border border-border rounded-xl p-6 text-center hover:bg-muted/50 transition-colors duration-200">
                            <div className="text-3xl mb-3">🎯</div>
                            <h4 className="text-lg font-semibold text-foreground mb-2">Estado del Servicio</h4>
                            <p className="text-muted-foreground text-sm mb-4">Verifica el estado actual de nuestros servicios</p>
                            <a href="/estado-servicio" className="text-primary hover:text-primary/80 font-medium transition-colors duration-200">
                                Ver Estado →
                            </a>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
