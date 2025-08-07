'use client'

import Link from 'next/link'
import { useState } from 'react'

const blogPosts = [
  {
    id: 'como-usar-ia-para-escribir-mejor',
    title: 'Cómo usar IA para escribir mejor: Guía completa 2025',
    excerpt: 'Descubre las mejores técnicas y herramientas de inteligencia artificial para mejorar tu escritura profesional y crear contenido de calidad.',
    category: 'Escritura IA',
    readTime: '8 min',
    date: '2025-01-29',
    emoji: '🤖'
  },
  {
    id: 'automatizar-correos-electronicos-ia',
    title: 'Cómo automatizar correos electrónicos con IA en 2025',
    excerpt: 'Aprende a crear emails profesionales automáticamente usando inteligencia artificial. Ahorra tiempo y mejora tus comunicaciones.',
    category: 'Email Marketing',
    readTime: '6 min',
    date: '2025-01-28',
    emoji: '📧'
  },
  {
    id: 'mejores-prompts-ia-escritura',
    title: 'Los 50 mejores prompts de IA para escritura profesional',
    excerpt: 'Colección completa de prompts probados para generar contenido de calidad con herramientas de inteligencia artificial.',
    category: 'Prompts IA',
    readTime: '12 min',
    date: '2025-01-27',
    emoji: '💡'
  },
  {
    id: 'ia-vs-redactor-humano',
    title: 'IA vs Redactor Humano: ¿Cuál elegir en 2025?',
    excerpt: 'Comparativa detallada entre la escritura con IA y redactores humanos. Ventajas, desventajas y cuándo usar cada opción.',
    category: 'Análisis',
    readTime: '10 min',
    date: '2025-01-26',
    emoji: '⚖️'
  },
  {
    id: 'optimizar-contenido-seo-ia',
    title: 'Cómo optimizar contenido SEO con inteligencia artificial',
    excerpt: 'Estrategias avanzadas para crear contenido optimizado para buscadores usando herramientas de IA. Mejora tu posicionamiento web.',
    category: 'SEO',
    readTime: '9 min',
    date: '2025-01-25',
    emoji: '🔍'
  },
  {
    id: 'herramientas-ia-escritura-2025',
    title: 'Las 15 mejores herramientas de IA para escritura en 2025',
    excerpt: 'Revisión completa de las herramientas de inteligencia artificial más efectivas para crear contenido profesional.',
    category: 'Herramientas',
    readTime: '11 min',
    date: '2025-01-24',
    emoji: '🛠️'
  },
  {
    id: 'escribir-articulos-blog-ia',
    title: 'Cómo escribir artículos de blog perfectos con IA',
    excerpt: 'Metodología paso a paso para crear artículos de blog atractivos y bien estructurados usando inteligencia artificial.',
    category: 'Blogging',
    readTime: '7 min',
    date: '2025-01-23',
    emoji: '📝'
  },
  {
    id: 'ia-copywriting-ventas',
    title: 'IA para copywriting: Cómo escribir textos que venden',
    excerpt: 'Técnicas avanzadas de copywriting con IA para crear textos persuasivos que conviertan visitantes en clientes.',
    category: 'Copywriting',
    readTime: '8 min',
    date: '2025-01-22',
    emoji: '✍️'
  },
  {
    id: 'personalizar-tono-voz-ia',
    title: 'Cómo personalizar el tono de voz en textos generados por IA',
    excerpt: 'Guía completa para mantener la consistencia de marca y personalidad en contenido creado con inteligencia artificial.',
    category: 'Branding',
    readTime: '6 min',
    date: '2025-01-21',
    emoji: '🎭'
  },
  {
    id: 'futuro-escritura-inteligencia-artificial',
    title: 'El futuro de la escritura: Tendencias de IA para 2025-2030',
    excerpt: 'Análisis de las tendencias emergentes en escritura con IA y cómo prepararse para el futuro del contenido digital.',
    category: 'Tendencias',
    readTime: '10 min',
    date: '2025-01-20',
    emoji: '🚀'
  }
]

const categories = ['Todos', 'Escritura IA', 'Email Marketing', 'Prompts IA', 'SEO', 'Herramientas', 'Copywriting']

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('Todos')

  const filteredPosts = selectedCategory === 'Todos' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
                <span className="text-black font-bold text-xs">RC</span>
              </div>
              <span className="text-sm font-medium text-white">Red Creativa Pro</span>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/escritor-ia" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Escritor IA
              </Link>
              <Link href="/correos-ia" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Correos IA
              </Link>
              <Link href="/planes" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Planes
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Blog de <span className="text-white">Escritura IA</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Guías, tutoriales y consejos para dominar la escritura con inteligencia artificial
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-white text-black'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.id}`}
              className="group bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 transition-colors"
            >
              <div className="aspect-video bg-zinc-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center">
                  <span className="text-6xl">{post.emoji}</span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-white bg-zinc-800 px-2 py-1 rounded">
                    {post.category}
                  </span>
                  <span className="text-xs text-zinc-500">{post.readTime}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-zinc-300 transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-zinc-400 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">{post.date}</span>
                  <span className="text-sm text-white group-hover:text-zinc-300 transition-colors">
                    Leer más →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center bg-zinc-900 border border-zinc-800 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            ¿Listo para mejorar tu escritura con IA?
          </h2>
          <p className="text-zinc-400 mb-6">
            Únete a miles de usuarios que ya están creando contenido profesional con Red Creativa Pro
          </p>
          <Link
            href="/auth"
            className="inline-flex items-center px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition-colors"
          >
            Comenzar gratis
          </Link>
        </div>
      </div>
    </div>
  )
}