'use client'

import React, { useState, useEffect } from 'react'
import { useOptimizedAuth } from '../hooks/useOptimizedAuth'
import { useAuthPerformanceMetrics } from '../utils/AuthPerformanceMonitor'
import AuthLoadingWrapper from '../components/AuthLoadingWrapper'
import { Clock, CheckCircle, AlertCircle, BarChart3, RefreshCw } from 'lucide-react'

// Componente de prueba para verificar las optimizaciones
export default function AuthOptimizationTest() {
  const auth = useOptimizedAuth()
  const { metrics, stats, recordEvent, reset, generateReport } = useAuthPerformanceMetrics()
  const [testResults, setTestResults] = useState<any[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [showReport, setShowReport] = useState(false)
  
  // Ejecutar pruebas de rendimiento
  const runPerformanceTests = async () => {
    setIsRunningTests(true)
    const results = []
    
    try {
      // Test 1: Verificar tiempo de carga inicial
      console.log('🧪 Iniciando pruebas de optimización de autenticación...')
      const startTime = performance.now()
      
      // Test 2: Verificar caché de suscripción
      console.log('📊 Probando caché de suscripción...')
      const cacheTestStart = performance.now()
      
      // Primera llamada (debería ser cache miss)
      await auth.refreshSubscription()
      const firstCallTime = performance.now() - cacheTestStart
      
      // Segunda llamada inmediata (debería ser cache hit)
      const secondCacheTestStart = performance.now()
      await auth.refreshSubscription()
      const secondCallTime = performance.now() - secondCacheTestStart
      
      results.push({
        test: 'Cache Performance',
        firstCall: `${firstCallTime.toFixed(1)}ms`,
        secondCall: `${secondCallTime.toFixed(1)}ms`,
        improvement: `${((firstCallTime - secondCallTime) / firstCallTime * 100).toFixed(1)}%`,
        status: secondCallTime < firstCallTime * 0.1 ? 'pass' : 'warning'
      })
      
      // Test 3: Verificar API optimizada
      console.log('🚀 Probando API optimizada...')
      const apiTestStart = performance.now()
      
      try {
        const response = await fetch('/api/subscription/check', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        const apiCallTime = performance.now() - apiTestStart
        const data = await response.json()
        
        results.push({
          test: 'API Response Time',
          time: `${apiCallTime.toFixed(1)}ms`,
          status: apiCallTime < 1000 ? 'pass' : apiCallTime < 2000 ? 'warning' : 'fail',
          cached: data.cached || false
        })
      } catch (error) {
        results.push({
          test: 'API Response Time',
          error: error.message,
          status: 'fail'
        })
      }
      
      // Test 4: Verificar métricas de rendimiento
      console.log('📈 Verificando métricas de rendimiento...')
      const currentStats = stats
      
      results.push({
        test: 'Performance Metrics',
        cacheHitRate: `${currentStats.cacheHitRate.toFixed(1)}%`,
        avgResponseTime: `${currentStats.averageResponseTime.toFixed(1)}ms`,
        errorRate: `${currentStats.errorRate.toFixed(1)}%`,
        status: currentStats.cacheHitRate > 50 && currentStats.averageResponseTime < 1000 ? 'pass' : 'warning'
      })
      
      // Test 5: Verificar funcionalidad de premium
      console.log('💎 Probando verificación de premium...')
      const premiumTestStart = performance.now()
      const isPremium = auth.isPremium
      const hasAdvancedFeatures = auth.hasFeatureAccess('advanced_analytics')
      const premiumTestTime = performance.now() - premiumTestStart
      
      results.push({
        test: 'Premium Check',
        isPremium: isPremium ? 'Yes' : 'No',
        hasAdvancedFeatures: hasAdvancedFeatures ? 'Yes' : 'No',
        time: `${premiumTestTime.toFixed(1)}ms`,
        status: premiumTestTime < 100 ? 'pass' : 'warning'
      })
      
      const totalTime = performance.now() - startTime
      console.log(`✅ Pruebas completadas en ${totalTime.toFixed(1)}ms`)
      
      results.push({
        test: 'Total Test Time',
        time: `${totalTime.toFixed(1)}ms`,
        status: totalTime < 5000 ? 'pass' : 'warning'
      })
      
    } catch (error) {
      console.error('❌ Error en las pruebas:', error)
      results.push({
        test: 'Test Execution',
        error: error.message,
        status: 'fail'
      })
    }
    
    setTestResults(results)
    setIsRunningTests(false)
  }
  
  // Componente para mostrar resultados de pruebas
  const TestResult = ({ result }: { result: any }) => {
    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'pass':
          return <CheckCircle className="w-5 h-5 text-green-500" />
        case 'warning':
          return <AlertCircle className="w-5 h-5 text-yellow-500" />
        case 'fail':
          return <AlertCircle className="w-5 h-5 text-red-500" />
        default:
          return <Clock className="w-5 h-5 text-gray-500" />
      }
    }
    
    return (
      <div className="bg-gray-800 rounded-lg p-4 mb-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-white">{result.test}</h3>
          {getStatusIcon(result.status)}
        </div>
        
        <div className="text-sm text-gray-300 space-y-1">
          {Object.entries(result).map(([key, value]) => {
            if (key === 'test' || key === 'status') return null
            return (
              <div key={key} className="flex justify-between">
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                <span className="font-mono">{String(value)}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  
  return (
    <AuthLoadingWrapper 
      showPerformanceMetrics={true}
      enableSkeletonMode={false}
    >
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              🚀 Auth Optimization Test Suite
            </h1>
            <p className="text-gray-400">
              Verificación de optimizaciones de autenticación y suscripción
            </p>
          </div>
          
          {/* Estado actual de autenticación */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Estado Actual
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-700 rounded p-4">
                <div className="text-sm text-gray-400">Usuario Autenticado</div>
                <div className="text-lg font-semibold text-white">
                  {auth.isAuthenticated ? '✅ Sí' : '❌ No'}
                </div>
              </div>
              
              <div className="bg-gray-700 rounded p-4">
                <div className="text-sm text-gray-400">Plan Premium</div>
                <div className="text-lg font-semibold text-white">
                  {auth.isPremium ? '💎 Premium' : '🆓 Free'}
                </div>
              </div>
              
              <div className="bg-gray-700 rounded p-4">
                <div className="text-sm text-gray-400">Estado de Carga</div>
                <div className="text-lg font-semibold text-white">
                  {auth.loading || auth.subscriptionLoading ? '⏳ Cargando' : '✅ Listo'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Métricas de rendimiento */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">📊 Métricas de Rendimiento</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-700 rounded p-3 text-center">
                <div className="text-2xl font-bold text-green-400">{metrics.cacheHits}</div>
                <div className="text-xs text-gray-400">Cache Hits</div>
              </div>
              
              <div className="bg-gray-700 rounded p-3 text-center">
                <div className="text-2xl font-bold text-yellow-400">{metrics.cacheMisses}</div>
                <div className="text-xs text-gray-400">Cache Misses</div>
              </div>
              
              <div className="bg-gray-700 rounded p-3 text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {stats.cacheHitRate.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-400">Hit Rate</div>
              </div>
              
              <div className="bg-gray-700 rounded p-3 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {metrics.averageResponseTime.toFixed(0)}ms
                </div>
                <div className="text-xs text-gray-400">Avg Response</div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={reset}
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Reset Metrics
              </button>
              
              <button
                onClick={() => setShowReport(!showReport)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                {showReport ? 'Hide' : 'Show'} Report
              </button>
            </div>
            
            {showReport && (
              <div className="mt-4 bg-gray-900 rounded p-4">
                <pre className="text-xs text-gray-300 whitespace-pre-wrap overflow-x-auto">
                  {generateReport()}
                </pre>
              </div>
            )}
          </div>
          
          {/* Controles de prueba */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">🧪 Ejecutar Pruebas</h2>
            
            <div className="flex gap-4 mb-4">
              <button
                onClick={runPerformanceTests}
                disabled={isRunningTests}
                className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
              >
                {isRunningTests ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                {isRunningTests ? 'Ejecutando...' : 'Ejecutar Pruebas'}
              </button>
              
              <button
                onClick={() => auth.refreshSubscription()}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Refresh Subscription
              </button>
              
              <button
                onClick={() => auth.clearCache()}
                className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Clear Cache
              </button>
            </div>
          </div>
          
          {/* Resultados de pruebas */}
          {testResults.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">📋 Resultados de Pruebas</h2>
              
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <TestResult key={index} result={result} />
                ))}
              </div>
              
              <div className="mt-4 p-4 bg-gray-700 rounded">
                <h3 className="font-semibold text-white mb-2">📝 Resumen</h3>
                <div className="text-sm text-gray-300">
                  <div>Total de pruebas: {testResults.length}</div>
                  <div>Exitosas: {testResults.filter(r => r.status === 'pass').length}</div>
                  <div>Advertencias: {testResults.filter(r => r.status === 'warning').length}</div>
                  <div>Fallidas: {testResults.filter(r => r.status === 'fail').length}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthLoadingWrapper>
  )
}