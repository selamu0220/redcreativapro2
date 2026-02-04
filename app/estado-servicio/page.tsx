'use client'

import { Metadata } from 'next'
import { useState, useEffect } from 'react'

const metadata: Metadata = {
  title: 'Estado del Servicio - Red Creativa Pro',
  description: 'Verifica el estado actual de todos los servicios de Red Creativa Pro en tiempo real.',
  keywords: ['estado', 'servicio', 'uptime', 'disponibilidad', 'Red Creativa Pro'],
  authors: [{ name: 'Red Creativa Pro' }],
  openGraph: {
    title: 'Estado del Servicio - Red Creativa Pro',
    description: 'Verifica el estado actual de todos los servicios de Red Creativa Pro en tiempo real.',
    type: 'website',
  },
}

type ServiceStatus = 'operational' | 'degraded' | 'outage' | 'maintenance'

interface Service {
  name: string
  description: string
  status: ServiceStatus
  uptime: string
  responseTime: string
  lastChecked: string
}

interface Incident {
  id: string
  title: string
  description: string
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved'
  severity: 'low' | 'medium' | 'high' | 'critical'
  startTime: string
  endTime?: string
  updates: {
    time: string
    message: string
  }[]
}

export default function EstadoServicioPage() {
  const [services, setServices] = useState<Service[]>([])
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [lastUpdate, setLastUpdate] = useState<string>('')

  useEffect(() => {
    // Simular datos de servicios
    const mockServices: Service[] = [
      {
        name: 'Escritor IA',
        description: 'Servicio principal de mejora de textos con IA',
        status: 'operational',
        uptime: '99.9%',
        responseTime: '245ms',
        lastChecked: new Date().toLocaleTimeString('es-ES')
      },
      {
        name: 'Correos IA',
        description: 'Integración con Gmail y procesamiento de correos',
        status: 'operational',
        uptime: '99.8%',
        responseTime: '312ms',
        lastChecked: new Date().toLocaleTimeString('es-ES')
      },
      {
        name: 'API de Google AI Studio',
        description: 'Conexión con los servicios de IA de Google',
        status: 'operational',
        uptime: '99.95%',
        responseTime: '189ms',
        lastChecked: new Date().toLocaleTimeString('es-ES')
      },
      {
        name: 'Base de Datos',
        description: 'Almacenamiento de configuraciones y datos de usuario',
        status: 'operational',
        uptime: '99.99%',
        responseTime: '45ms',
        lastChecked: new Date().toLocaleTimeString('es-ES')
      },
      {
        name: 'Autenticación',
        description: 'Sistema de login y gestión de sesiones',
        status: 'operational',
        uptime: '99.9%',
        responseTime: '123ms',
        lastChecked: new Date().toLocaleTimeString('es-ES')
      },
      {
        name: 'Pagos (Stripe)',
        description: 'Procesamiento de suscripciones y pagos',
        status: 'operational',
        uptime: '99.95%',
        responseTime: '267ms',
        lastChecked: new Date().toLocaleTimeString('es-ES')
      }
    ]

    // Simular incidentes (vacío para mostrar que todo está bien)
    const mockIncidents: Incident[] = []

    setServices(mockServices)
    setIncidents(mockIncidents)
    setLastUpdate(new Date().toLocaleString('es-ES'))
  }, [])

  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case 'operational':
        return 'text-green-400'
      case 'degraded':
        return 'text-yellow-400'
      case 'outage':
        return 'text-red-400'
      case 'maintenance':
        return 'text-blue-400'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: ServiceStatus) => {
    switch (status) {
      case 'operational':
        return '✅'
      case 'degraded':
        return '⚠️'
      case 'outage':
        return '❌'
      case 'maintenance':
        return '🔧'
      default:
        return '❓'
    }
  }

  const getStatusText = (status: ServiceStatus) => {
    switch (status) {
      case 'operational':
        return 'Operativo'
      case 'degraded':
        return 'Degradado'
      case 'outage':
        return 'Fuera de Servicio'
      case 'maintenance':
        return 'Mantenimiento'
      default:
        return 'Desconocido'
    }
  }

  const overallStatus = services.every(s => s.status === 'operational') ? 'operational' : 'degraded'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Header */}
      <div className="bg-gray-900/50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Estado del Servicio</h1>
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Estado General */}
        <div className="text-center mb-12">
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full border-2 ${
            overallStatus === 'operational' 
              ? 'border-green-400 bg-green-400/10' 
              : 'border-yellow-400 bg-yellow-400/10'
          }`}>
            <span className="text-2xl">{getStatusIcon(overallStatus)}</span>
            <span className={`text-xl font-semibold ${
              overallStatus === 'operational' ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {overallStatus === 'operational' ? 'Todos los Sistemas Operativos' : 'Algunos Sistemas con Problemas'}
            </span>
          </div>
          <p className="text-gray-300 mt-4">Última actualización: {lastUpdate}</p>
        </div>

        {/* Incidentes Activos */}
        {incidents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Incidentes Activos</h2>
            <div className="space-y-4">
              {incidents.map((incident) => (
                <div key={incident.id} className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">{incident.title}</h3>
                      <p className="text-gray-300">{incident.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      incident.severity === 'critical' ? 'bg-red-600 text-white' :
                      incident.severity === 'high' ? 'bg-orange-600 text-white' :
                      incident.severity === 'medium' ? 'bg-yellow-600 text-black' :
                      'bg-blue-600 text-white'
                    }`}>
                      {incident.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Iniciado: {incident.startTime}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de Servicios */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Estado de los Servicios</h2>
          <div className="bg-gray-800 rounded-2xl overflow-hidden">
            {services.map((service, index) => (
              <div key={index} className={`p-6 ${index !== services.length - 1 ? 'border-b border-gray-700' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">{getStatusIcon(service.status)}</span>
                      <h3 className="text-lg font-semibold text-white">{service.name}</h3>
                      <span className={`text-sm font-medium ${getStatusColor(service.status)}`}>
                        {getStatusText(service.status)}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{service.description}</p>
                  </div>
                  <div className="text-right text-sm text-gray-400">
                    <div className="mb-1">Uptime: <span className="text-green-400">{service.uptime}</span></div>
                    <div className="mb-1">Respuesta: <span className="text-blue-400">{service.responseTime}</span></div>
                    <div>Verificado: {service.lastChecked}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Métricas de Rendimiento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-800 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">99.9%</div>
            <div className="text-gray-300">Uptime Promedio</div>
            <div className="text-sm text-gray-400 mt-1">Últimos 30 días</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">230ms</div>
            <div className="text-gray-300">Tiempo de Respuesta</div>
            <div className="text-sm text-gray-400 mt-1">Promedio global</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">0</div>
            <div className="text-gray-300">Incidentes Activos</div>
            <div className="text-sm text-gray-400 mt-1">En este momento</div>
          </div>
        </div>

        {/* Historial de Incidentes */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Historial Reciente</h2>
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-semibold text-white mb-2">¡Sin Incidentes Recientes!</h3>
              <p className="text-gray-400">Todos nuestros servicios han estado funcionando perfectamente en los últimos 30 días.</p>
            </div>
          </div>
        </div>

        {/* Suscripción a Actualizaciones */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Mantente Informado</h3>
          <p className="text-blue-100 mb-6">Recibe notificaciones sobre el estado de nuestros servicios</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="tu@email.com"
              className="flex-1 px-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200">
              Suscribirse
            </button>
          </div>
          <p className="text-blue-200 text-sm mt-4">Te notificaremos solo sobre incidentes importantes</p>
        </div>

        {/* Enlaces Útiles */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-xl p-6 text-center hover:bg-gray-750 transition-colors duration-200">
            <div className="text-3xl mb-3">📞</div>
            <h4 className="text-lg font-semibold text-white mb-2">¿Problemas?</h4>
            <p className="text-gray-400 text-sm mb-4">Contacta a nuestro equipo de soporte</p>
            <a href="/contacto" className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200">
              Contactar Soporte →
            </a>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 text-center hover:bg-gray-750 transition-colors duration-200">
            <div className="text-3xl mb-3">📊</div>
            <h4 className="text-lg font-semibold text-white mb-2">Métricas Detalladas</h4>
            <p className="text-gray-400 text-sm mb-4">Ver estadísticas completas de rendimiento</p>
            <button className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200">
              Próximamente →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
