'use client';

import { useState } from 'react';

export default function TrafficPotentialCalculator() {
  const [searchVolume, setSearchVolume] = useState('')
  const [topPageTraffic, setTopPageTraffic] = useState('')
  const [result, setResult] = useState<{
    difference: number
    percentage: number
    recommendation: string
  } | null>(null)

  const calculatePotential = () => {
    const volume = parseInt(searchVolume)
    const traffic = parseInt(topPageTraffic)
    
    if (volume && traffic) {
      const difference = traffic - volume
      const percentage = ((traffic - volume) / volume) * 100
      
      let recommendation = ''
      if (percentage > 50) {
        recommendation = '🟢 Excelente oportunidad - El potencial supera significativamente el volumen'
      } else if (percentage > 0) {
        recommendation = '🟡 Buena oportunidad - Potencial ligeramente mayor al volumen'
      } else if (percentage > -30) {
        recommendation = '🟠 Oportunidad moderada - Potencial cercano al volumen'
      } else {
        recommendation = '🔴 Cuidado - El potencial es mucho menor al volumen esperado'
      }
      
      setResult({ difference, percentage, recommendation })
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Volumen de Búsqueda (mensual)
          </label>
          <input
            type="number"
            value={searchVolume}
            onChange={(e) => setSearchVolume(e.target.value)}
            placeholder="ej: 5000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tráfico de la Página #1 (mensual)
          </label>
          <input
            type="number"
            value={topPageTraffic}
            onChange={(e) => setTopPageTraffic(e.target.value)}
            placeholder="ej: 3200"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <button
        onClick={calculatePotential}
        className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
      >
        Calcular Potencial
      </button>
      
      {result && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {result.difference > 0 ? '+' : ''}{result.difference.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Diferencia de Tráfico</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {result.percentage > 0 ? '+' : ''}{result.percentage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Variación Porcentual</div>
            </div>
            <div className="md:col-span-1">
              <div className="text-sm font-medium text-gray-900 mb-1">Recomendación:</div>
              <div className="text-sm">{result.recommendation}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}