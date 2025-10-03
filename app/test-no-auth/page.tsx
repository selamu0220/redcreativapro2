'use client'

import { useState, useEffect } from 'react'

export default function TestNoAuthPage() {
  const [message, setMessage] = useState('Cargando...')
  const [count, setCount] = useState(0)

  useEffect(() => {
    setMessage('Página cargada sin autenticación')
    console.log('Test page loaded without auth')
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Página de Prueba Sin Auth
          </h1>
          <p className="text-xl text-blue-200">Esta página no usa autenticación ni componentes complejos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-semibold mb-4 text-yellow-300">Estado del Sistema</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span>{message}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span>Sin dependencias de auth</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                <span>Sin componentes externos</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-300">Interacción</h2>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{count}</div>
                <div className="text-sm text-gray-300">Contador de prueba</div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setCount(prev => prev + 1)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                >
                  Incrementar
                </button>
                <button
                  onClick={() => setCount(0)}
                  className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                >
                  Reiniciar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-300">Sistema funcionando correctamente</span>
          </div>
        </div>
      </div>
    </div>
  )
}