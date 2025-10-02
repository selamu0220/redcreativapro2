import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { SubscriptionStatus } from '../../../lib/middleware/subscription'

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Cache en memoria para optimizar consultas
interface CacheEntry {
  data: SubscriptionStatus
  timestamp: number
  userId: string
}

// Cache global con Map para mejor rendimiento
const subscriptionCache = new Map<string, CacheEntry>()
const CACHE_DURATION_PREMIUM = 5 * 60 * 1000 // 5 minutos para usuarios premium
const CACHE_DURATION_FREE = 1 * 60 * 1000 // 1 minuto para usuarios free
const MAX_CACHE_SIZE = 1000 // Límite de entradas en cache

// Métricas de rendimiento
interface ApiMetrics {
  totalRequests: number
  cacheHits: number
  cacheMisses: number
  averageResponseTime: number
  errors: number
  lastReset: number
}

let apiMetrics: ApiMetrics = {
  totalRequests: 0,
  cacheHits: 0,
  cacheMisses: 0,
  averageResponseTime: 0,
  errors: 0,
  lastReset: Date.now()
}

// Funciones de utilidad para cache
function isCacheValid(entry: CacheEntry): boolean {
  const now = Date.now()
  const maxAge = entry.data.isActive ? CACHE_DURATION_PREMIUM : CACHE_DURATION_FREE
  return (now - entry.timestamp) < maxAge
}

function cleanupCache(): void {
  if (subscriptionCache.size <= MAX_CACHE_SIZE) return
  
  // Eliminar entradas más antiguas si el cache está lleno
  const entries = Array.from(subscriptionCache.entries())
  entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
  
  // Eliminar el 20% más antiguo
  const toRemove = Math.floor(entries.length * 0.2)
  for (let i = 0; i < toRemove; i++) {
    subscriptionCache.delete(entries[i][0])
  }
}

// Características premium por plan
const PREMIUM_FEATURES = [
  'enhanced_auto_improve',
  'advanced_ai_models',
  'unlimited_generations',
  'priority_support',
  'custom_templates',
  'export_formats',
  'collaboration_tools',
  'advanced_formatting',
  'analytics',
  'api_access',
  'white_label',
  'bulk_operations'
]

// Función optimizada para verificar suscripción
async function checkSubscriptionStatusOptimized(userId: string): Promise<SubscriptionStatus> {
  const startTime = performance.now()
  
  try {
    // Verificar cache primero
    const cached = subscriptionCache.get(userId)
    if (cached && isCacheValid(cached)) {
      apiMetrics.cacheHits++
      return cached.data
    }
    
    apiMetrics.cacheMisses++
    
    // Consulta optimizada con índices específicos
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('id, user_id, plan_type, status, expires_at, created_at')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    let subscriptionStatus: SubscriptionStatus
    
    if (error || !subscription) {
      subscriptionStatus = {
        isActive: false,
        plan: 'free',
        features: []
      }
    } else {
      // Verificar expiración para planes mensuales
      const now = new Date()
      const expiresAt = subscription.expires_at ? new Date(subscription.expires_at) : null
      
      if (subscription.plan_type === 'monthly' && expiresAt && expiresAt < now) {
        // Marcar como expirado de forma asíncrona (no bloquear la respuesta)
        supabase
          .from('subscriptions')
          .update({ status: 'expired' })
          .eq('id', subscription.id)
          .then(() => console.log(`Subscription ${subscription.id} marked as expired`))
          .catch(err => console.error('Error updating expired subscription:', err))
        
        subscriptionStatus = {
          isActive: false,
          plan: 'free',
          features: []
        }
      } else {
        // Determinar características según el plan
        const features = ['monthly', 'lifetime', 'discounted'].includes(subscription.plan_type) 
          ? PREMIUM_FEATURES 
          : []
        
        subscriptionStatus = {
          isActive: true,
          plan: subscription.plan_type as 'monthly' | 'lifetime' | 'discounted',
          expiresAt: expiresAt || undefined,
          features
        }
      }
    }
    
    // Actualizar cache
    subscriptionCache.set(userId, {
      data: subscriptionStatus,
      timestamp: Date.now(),
      userId
    })
    
    // Limpiar cache si es necesario
    cleanupCache()
    
    // Actualizar métricas de tiempo de respuesta
    const responseTime = performance.now() - startTime
    apiMetrics.averageResponseTime = (
      (apiMetrics.averageResponseTime * (apiMetrics.totalRequests - 1) + responseTime) / 
      apiMetrics.totalRequests
    )
    
    return subscriptionStatus
    
  } catch (error) {
    apiMetrics.errors++
    console.error('Error in checkSubscriptionStatusOptimized:', error)
    
    // Retornar datos del cache si están disponibles, aunque hayan expirado
    const cached = subscriptionCache.get(userId)
    if (cached) {
      console.warn('Using expired cache due to error')
      return cached.data
    }
    
    // Fallback a usuario free
    return {
      isActive: false,
      plan: 'free',
      features: []
    }
  }
}

// Endpoint GET para verificar suscripción
export async function GET(request: NextRequest) {
  const startTime = performance.now()
  apiMetrics.totalRequests++
  
  try {
    // Obtener token de autorización
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      )
    }
    
    const token = authHeader.substring(7)
    
    // Verificar token con Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }
    
    // Verificar suscripción de forma optimizada
    const subscriptionStatus = await checkSubscriptionStatusOptimized(user.id)
    
    const responseTime = performance.now() - startTime
    
    return NextResponse.json({
      success: true,
      data: subscriptionStatus,
      meta: {
        responseTime: Math.round(responseTime * 100) / 100,
        cached: apiMetrics.cacheHits > apiMetrics.cacheMisses,
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    apiMetrics.errors++
    console.error('Error in subscription check API:', error)
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        success: false
      },
      { status: 500 }
    )
  }
}

// Endpoint POST para forzar actualización de cache
export async function POST(request: NextRequest) {
  apiMetrics.totalRequests++
  
  try {
    // Obtener token de autorización
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      )
    }
    
    const token = authHeader.substring(7)
    
    // Verificar token con Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }
    
    // Limpiar cache para este usuario
    subscriptionCache.delete(user.id)
    
    // Obtener datos frescos
    const subscriptionStatus = await checkSubscriptionStatusOptimized(user.id)
    
    return NextResponse.json({
      success: true,
      data: subscriptionStatus,
      meta: {
        cacheCleared: true,
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    apiMetrics.errors++
    console.error('Error in subscription refresh API:', error)
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        success: false
      },
      { status: 500 }
    )
  }
}

// Endpoint para obtener métricas de rendimiento (solo para desarrollo)
export async function OPTIONS(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'No disponible en producción' }, { status: 403 })
  }
  
  return NextResponse.json({
    metrics: apiMetrics,
    cacheSize: subscriptionCache.size,
    cacheEntries: Array.from(subscriptionCache.entries()).map(([userId, entry]) => ({
      userId: userId.substring(0, 8) + '...',
      plan: entry.data.plan,
      isActive: entry.data.isActive,
      age: Date.now() - entry.timestamp,
      valid: isCacheValid(entry)
    }))
  })
}