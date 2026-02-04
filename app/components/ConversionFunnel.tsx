'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Star, Check, ArrowRight, Play, Users, TrendingUp, Zap, MessageCircle, X } from 'lucide-react'
import Link from 'next/link'

interface VoiceAgentProps {
  isVisible: boolean
  onToggle: () => void
}

function VoiceAgent({ isVisible, onToggle }: VoiceAgentProps) {
  return (
    <>
      {/* Botón flotante para mostrar/ocultar el agente */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={onToggle}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        >
          {isVisible ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </button>
      </div>

      {/* Modal del agente de voz */}
      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-zinc-200 dark:border-zinc-700">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                🤖 Asistente de Voz IA
              </h3>
              <button
                onClick={onToggle}
                className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <iframe
                src="https://elevenlabs.io/app/talk-to?agent_id=agent_01jzq9c12eek7a564sba1a4tfk"
                className="w-full h-96 border-0 rounded-lg"
                title="Asistente de Voz IA"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

interface FunnelStepProps {
  step: number
  title: string
  description: string
  icon: React.ReactNode
  isActive: boolean
  onClick: () => void
}

function FunnelStep({ step, title, description, icon, isActive, onClick }: FunnelStepProps) {
  return (
    <div 
      className={`relative p-6 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
        isActive 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg' 
          : 'border-zinc-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-600'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-full ${
          isActive 
            ? 'bg-blue-500 text-white' 
            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
        }`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Paso {step}: {title}
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            {description}
          </p>
        </div>
        <ArrowRight className={`w-5 h-5 transition-transform ${
          isActive ? 'text-blue-500 scale-110' : 'text-zinc-400'
        }`} />
      </div>
    </div>
  )
}

interface TestimonialProps {
  name: string
  role: string
  content: string
  rating: number
}

function Testimonial({ name, role, content, rating }: TestimonialProps) {
  return (
    <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700">
      <div className="flex items-center space-x-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`w-4 h-4 ${
              i < rating ? 'text-yellow-400 fill-current' : 'text-zinc-300 dark:text-zinc-600'
            }`} 
          />
        ))}
      </div>
      <p className="text-zinc-700 dark:text-zinc-300 mb-4 italic">
        "{content}"
      </p>
      <div>
        <p className="font-semibold text-zinc-900 dark:text-white">{name}</p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{role}</p>
      </div>
    </div>
  )
}

export default function ConversionFunnel() {
  const [activeStep, setActiveStep] = useState(1)
  const [showVoiceAgent, setShowVoiceAgent] = useState(false)

  const funnelSteps = [
    {
      step: 1,
      title: "Descubre el Poder de la IA",
      description: "Conoce cómo nuestras herramientas pueden transformar tu negocio",
      icon: <Zap className="w-6 h-6" />,
      action: () => {
        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
      }
    },
    {
      step: 2,
      title: "Prueba Gratuita",
      description: "Experimenta todas las funcionalidades sin compromiso",
      icon: <Play className="w-6 h-6" />,
      action: () => {
        window.location.href = '/dashboard'
      }
    },
    {
      step: 3,
      title: "Únete a la Comunidad",
      description: "Accede a recursos exclusivos y soporte premium",
      icon: <Users className="w-6 h-6" />,
      action: () => {
        window.location.href = '/auth'
      }
    },
    {
      step: 4,
      title: "Escala tu Negocio",
      description: "Optimiza y escala con nuestros planes profesionales",
      icon: <TrendingUp className="w-6 h-6" />,
      action: () => {
        window.location.href = '/planes'
      }
    }
  ]

  // Testimonials removed as requested - maintaining professional presentation without fake reviews
  const testimonials: any[] = []

  const features = [
    {
      title: "Escritor IA Avanzado",
      description: "Genera contenido de alta calidad en segundos",
      benefits: ["Múltiples tonos y estilos", "SEO optimizado", "Corrección automática"]
    },
    {
      title: "Email Marketing IA",
      description: "Email marketing inteligente que convierte",
      benefits: ["Segmentación inteligente", "A/B testing", "Analíticas avanzadas"]
    },
    {
      title: "Gestión de Contactos",
      description: "CRM integrado para maximizar conversiones",
      benefits: ["Importación masiva", "Etiquetado inteligente", "Seguimiento automático"]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-blue-50 dark:from-zinc-900 dark:to-blue-900">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-zinc-900 dark:text-white mb-6">
            Transforma tu Negocio con
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> IA</span>
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-300 mb-8 max-w-3xl mx-auto">
            La plataforma todo-en-uno que potencia tu marketing, genera contenido profesional 
            y multiplica tus conversiones con inteligencia artificial.
          </p>
          
          {/* CTA Principal */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link 
              href="/dashboard"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg"
            >
              🚀 Comenzar Prueba Gratuita
            </Link>
            <button 
              onClick={() => setShowVoiceAgent(true)}
              className="border-2 border-blue-600 text-blue-600 dark:text-blue-400 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-600 hover:text-white transition-all duration-300"
            >
              🎤 Hablar con IA
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">10,000+</div>
              <div className="text-zinc-600 dark:text-zinc-400">Usuarios Activos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">500%</div>
              <div className="text-zinc-600 dark:text-zinc-400">Aumento en Conversiones</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 dark:text-green-400">24/7</div>
              <div className="text-zinc-600 dark:text-zinc-400">Disponibilidad</div>
            </div>
          </div>
        </div>
      </section>

      {/* Funnel Steps */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-zinc-900 dark:text-white mb-12">
            Tu Camino al Éxito en 4 Pasos
          </h2>
          <div className="space-y-6">
            {funnelSteps.map((step, index) => (
              <FunnelStep
                key={step.step}
                step={step.step}
                title={step.title}
                description={step.description}
                icon={step.icon}
                isActive={activeStep === step.step}
                onClick={() => {
                  setActiveStep(step.step)
                  step.action()
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white dark:bg-zinc-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-zinc-900 dark:text-white mb-12">
            Herramientas que Impulsan Resultados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-zinc-50 dark:bg-zinc-900 p-8 rounded-lg border border-zinc-200 dark:border-zinc-700">
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center text-zinc-700 dark:text-zinc-300">
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-zinc-900 dark:text-white mb-12">
            Lo que Dicen Nuestros Clientes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Testimonial key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            ¿Listo para Revolucionar tu Negocio?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Únete a miles de empresarios que ya están transformando sus resultados
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/dashboard"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all duration-300 hover:scale-105"
            >
              Comenzar Ahora - Gratis
            </Link>
            <Link 
              href="/planes"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300"
            >
              Ver Planes
            </Link>
          </div>
        </div>
      </section>

      {/* Voice Agent */}
      <VoiceAgent 
        isVisible={showVoiceAgent} 
        onToggle={() => setShowVoiceAgent(!showVoiceAgent)} 
      />
    </div>
  )
}
