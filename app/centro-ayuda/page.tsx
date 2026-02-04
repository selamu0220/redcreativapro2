import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Centro de Ayuda - Red Creativa Pro',
  description: 'Encuentra respuestas a tus preguntas y obtén ayuda para usar Red Creativa Pro de manera efectiva.',
  keywords: ['ayuda', 'soporte', 'guías', 'tutoriales', 'Red Creativa Pro'],
  authors: [{ name: 'Red Creativa Pro' }],
  openGraph: {
    title: 'Centro de Ayuda - Red Creativa Pro',
    description: 'Encuentra respuestas a tus preguntas y obtén ayuda para usar Red Creativa Pro de manera efectiva.',
    type: 'website',
  },
}

export default function CentroAyudaPage() {
  const helpCategories = [
    {
      title: "Primeros Pasos",
      icon: "🚀",
      articles: [
        "Cómo crear tu primera cuenta",
        "Configuración inicial de la API",
        "Tu primer texto mejorado",
        "Navegando por la interfaz"
      ]
    },
    {
      title: "Escritor IA",
      icon: "✍️",
      articles: [
        "Cómo usar el Escritor IA",
        "Tipos de mejoras disponibles",
        "Consejos para mejores resultados",
        "Límites y restricciones"
      ]
    },
    {
      title: "Correos IA",
      icon: "📧",
      articles: [
        "Configurar Gmail con la aplicación",
        "Crear correos profesionales",
        "Plantillas de correo",
        "Solución de problemas de envío"
      ]
    },
    {
      title: "Planes y Facturación",
      icon: "💳",
      articles: [
        "Diferencias entre planes",
        "Cómo actualizar tu plan",
        "Gestión de facturación",
        "Cancelar suscripción"
      ]
    },
    {
      title: "Configuración",
      icon: "⚙️",
      articles: [
        "Configurar API de Google AI Studio",
        "Ajustar parámetros de IA",
        "Gestión de cuenta",
        "Configuración de privacidad"
      ]
    },
    {
      title: "Solución de Problemas",
      icon: "🔧",
      articles: [
        "Errores comunes y soluciones",
        "Problemas de conexión",
        "Recuperar cuenta",
        "Contactar soporte técnico"
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="bg-card/50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">Centro de Ayuda</h1>
            <a 
              href="/" 
              className="text-primary hover:text-primary/80 transition-colors duration-200 flex items-center gap-2"
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
        {/* Buscador */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">¿En qué podemos ayudarte?</h2>
          <div className="max-w-2xl mx-auto relative">
            <input
              type="text"
              placeholder="Buscar en el centro de ayuda..."
              className="w-full px-6 py-4 bg-input border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Categorías de ayuda */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {helpCategories.map((category, index) => (
            <div 
              key={index}
              className="bg-card rounded-2xl p-6 hover:bg-card/80 transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">{category.icon}</span>
                <h3 className="text-xl font-bold text-foreground">{category.title}</h3>
              </div>
              <ul className="space-y-2">
                {category.articles.map((article, articleIndex) => (
                  <li key={articleIndex}>
                    <a 
                      href="#" 
                      className="text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center group"
                    >
                      <svg className="w-4 h-4 mr-2 text-muted-foreground group-hover:text-primary transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {article}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Sección de contacto rápido */}
        <div className="mt-16 bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-4">¿No encuentras lo que buscas?</h3>
          <p className="text-primary/80 mb-6">Nuestro equipo de soporte está aquí para ayudarte</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contacto" 
              className="bg-background text-primary px-6 py-3 rounded-lg font-semibold hover:bg-muted transition-colors duration-200"
            >
              Contactar Soporte
            </a>
            <a 
              href="/preguntas-frecuentes" 
              className="bg-transparent border-2 border-border text-foreground px-6 py-3 rounded-lg font-semibold hover:bg-background hover:text-primary transition-all duration-200"
            >
              Ver FAQ
            </a>
          </div>
        </div>

        {/* Enlaces útiles */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-card rounded-xl p-6 hover:bg-card/80 transition-colors duration-200">
              <div className="text-3xl mb-3">📚</div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Guías Detalladas</h4>
              <p className="text-muted-foreground text-sm">Tutoriales paso a paso para dominar todas las funciones</p>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-card rounded-xl p-6 hover:bg-card/80 transition-colors duration-200">
              <div className="text-3xl mb-3">🎥</div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Videos Tutoriales</h4>
              <p className="text-muted-foreground text-sm">Aprende visualmente con nuestros videos explicativos</p>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-card rounded-xl p-6 hover:bg-card/80 transition-colors duration-200">
              <div className="text-3xl mb-3">💬</div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Comunidad</h4>
              <p className="text-muted-foreground text-sm">Conecta con otros usuarios y comparte experiencias</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
