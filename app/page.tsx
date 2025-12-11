import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Red Creativa Pro | Herramientas de IA para Copywriting',
  description: 'Plataforma hispana de marketing con IA: escritura, campañas y automatización. Prueba la plantilla gratuita y el corrector de textos IA.',
  alternates: { canonical: 'https://redcreativa.pro/' },
  openGraph: {
    title: 'Red Creativa Pro | Herramientas de IA para Copywriting',
    description: 'Crea contenido y automatiza tu marketing con IA para el mercado hispano.',
    type: 'website',
    images: [{ url: 'https://redcreativa.pro/og-default.jpg', width: 1200, height: 630 }]
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true }
}

export default function HomePage() {

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur">
        <div className="container mx-auto px-4">
          <nav className="flex h-14 items-center justify-between">
            {/* Logo */}
            <Link className="flex items-center space-x-2" href="/">
              <div className="h-6 w-6 rounded-sm bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">RC</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">Red Creativa Pro Beta</span>
            </Link>
            
            {/* Navigation */}
            <div className="flex items-center space-x-6">
              <Link prefetch={false} href="/correos-ia" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600">
                🤖 Campañas IA
              </Link>
              <Link prefetch={false} href="/planes" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600">
                💎 Membresía
              </Link>
              <Link prefetch={false} href="/herramientas-ia-copywriting" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600">
                🧰 Herramientas IA
              </Link>
              <Link prefetch={false} href="/blog" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600">
                Blog
              </Link>
              <Link prefetch={false} href="/auth" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600">
                Iniciar Sesión
              </Link>
              <Link prefetch={false} href="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                Ver Demo
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32">
          <div className="container mx-auto px-4 text-center">
            {/* Beta Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              VERSION BETA - Acceso anticipado disponible
            </div>

            {/* Main Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-blue-600">
              Red Creativa Pro
            </h1>

            {/* Subtitle */}
            <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold mb-4 text-gray-600 dark:text-gray-300">
              Plataforma Hispana de Marketing con IA
            </h2>
            
            {/* Powered by */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <span className="text-sm text-gray-500">Potenciado por IA</span>
              <span className="text-sm font-semibold text-blue-600">OpenRouter</span>
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">AI</span>
            </div>

            {/* Description */}
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Crea contenido, gestiona campañas y automatiza tu marketing con herramientas de inteligencia artificial diseñadas específicamente para el mercado hispanohablante.
            </p>

            {/* Key Benefits */}
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full">
                <span className="text-2xl">🤖</span>
                <span className="font-semibold">IA</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">Escritura inteligente</span>
              </div>
              
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full">
                <span className="text-2xl">⚡</span>
                <span className="font-semibold">Auto</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">Flujo automático</span>
              </div>
              
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full">
                <span className="text-2xl">⏰</span>
                <span className="font-semibold">24h</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">Configuración rápida</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mb-8">
              <Link prefetch={false} href="/dashboard" className="inline-block bg-blue-600 text-white text-lg px-8 py-4 font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all duration-300">
                🚀 Unirse a Red Creativa Pro
              </Link>
            </div>

            {/* Feature Checkmarks */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-6">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Sin tarjeta de crédito</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Acceso inmediato</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Cancela cuando quieras</span>
              </div>
            </div>

            {/* Creator Link */}
            <div className="text-center">
              <Link aria-label="Conoce al creador" href="/creador" className="inline-flex items-center gap-3 text-base text-gray-800 dark:text-gray-200 rounded-full px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                <Image 
                  src="https://i.ibb.co/bfb1ncN/image.png" 
                  alt="Selamu, creador de Red Creativa Pro" 
                  width={28}
                  height={28}
                  className="rounded-full object-cover object-center ring-1 ring-gray-200 dark:ring-gray-700"
                  unoptimized
                />
                <span>Conoce al creador</span>
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-6 bg-blue-50 dark:bg-blue-900/20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 md:p-6 border rounded-lg bg-white dark:bg-gray-800">
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-blue-700 dark:text-blue-300">Descarga gratuita: Plantilla para solicitudes creativas</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Mejora briefs y resultados con una guía práctica.</p>
              </div>
              <Link href="/plantilla-solicitudes-creativas?utm_source=site&utm_medium=banner&utm_campaign=plantilla" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700">Descargar ahora</Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                Herramientas Potenciadas por IA
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Descubre el poder de la inteligencia artificial aplicada al marketing y la creación de contenido
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow duration-200">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Escritor IA</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Genera contenido de alta calidad para blogs, redes sociales y campañas de marketing</p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow duration-200">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Correos IA</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Crea campañas de email marketing personalizadas y efectivas</p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow duration-200">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Chat con Prompts</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Interactúa con IA usando prompts optimizados para mejores resultados</p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow duration-200">
                <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">Gestión de Contactos</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Organiza y segmenta tu base de datos de clientes de manera inteligente</p>
              </div>
            </div>
          </div>
        </section>

        {/* About Creator Section */}
        <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-8">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 overflow-hidden border-2 border-blue-200">
                  <Image 
                    src="https://i.ibb.co/bfb1ncN/image.png" 
                    alt="Selamu, creador de Red Creativa Pro" 
                    width={64}
                    height={64}
                    className="w-full h-full object-cover object-center ring-2 ring-blue-200/60"
                    unoptimized
                  />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                  Sobre el Creador
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Estudiante de Humanidades que decidió crear herramientas que realmente ahorren tiempo
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-6 border">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">💡</span>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Emprendimiento Personal</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    No soy una gran empresa. Soy una persona real que cree en crear herramientas útiles. Cada función está pensada desde la experiencia real de uso.
                  </p>
                </div>

                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-6 border">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🤝</span>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Acceso Directo</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Puedes hablar directamente conmigo. Tu feedback impulsa las mejoras. Construimos juntos la herramienta que realmente necesitas.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-100/50 to-purple-100/50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg p-8 mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Mi Filosofía</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  "Creo que las herramientas deben demostrar su valor antes de pedir dinero. Prueba Red Creativa Pro, explora todas sus funciones, y solo si realmente te ayuda a ser más productivo, entonces considera apoyar el proyecto."
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/creador" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    <span className="mr-2">📖</span>
                    Leer Mi Historia Completa
                  </Link>
                  <Link href="/contacto?utm_source=home&utm_medium=cta&utm_campaign=contacto" className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                    <span className="mr-2">💬</span>
                    Contactar Directamente
                  </Link>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                ✨ Cuando te suscribes, apoyas directamente a un emprendedor independiente
              </p>
              <div className="mt-6">
                <Link href="/suscripcion?utm_source=home&utm_medium=cta&utm_campaign=newsletter" className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
                  📧 Suscribirme a novedades
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="h-6 w-6 rounded-sm bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">RC</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">Red Creativa Pro</span>
              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">BETA</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Plataforma completa de marketing digital con IA
            </p>
            <div className="flex justify-center items-center gap-4 mb-4">
              <Link 
                href="https://es.trustpilot.com/review/redcreativa.pro" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 flex items-center gap-2"
              >
                ⭐ Déjanos una reseña en Trustpilot
              </Link>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              © 2024 Red Creativa Pro. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
