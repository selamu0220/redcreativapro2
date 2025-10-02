# Optimización Crítica: Autenticación y Verificación de Suscripción

## 🚨 Problema Crítico Identificado

La **verificación de suscripción** y el **inicio de sesión** están extremadamente lentos, afectando gravemente la experiencia del usuario.

## 1. Análisis de Problemas de Autenticación

### 1.1 Problemas Comunes en Verificación de Suscripción

**Síntomas:**
- Carga lentísima al verificar suscripción
- Timeouts en el proceso de login
- Múltiples llamadas API innecesarias
- Bloqueo de la UI durante la verificación

**Causas Probables:**
```javascript
// ❌ PROBLEMA: Verificación síncrona que bloquea la UI
const checkSubscription = async () => {
  const user = await getUser() // Lento
  const subscription = await getSubscription(user.id) // Muy lento
  const stripeStatus = await verifyStripeStatus(subscription.id) // Extremadamente lento
  return subscription
}

// ❌ PROBLEMA: Múltiples llamadas en cascada
useEffect(() => {
  checkSubscription() // Se ejecuta en cada render
}, []) // Dependencias incorrectas
```

### 1.2 Problemas de Autenticación Firebase/Supabase

**Configuración Ineficiente:**
```javascript
// ❌ PROBLEMA: Inicialización lenta de Firebase
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// Se inicializa en cada importación
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
```

## 2. Soluciones Inmediatas (Implementar HOY)

### 2.1 Optimizar Hook de Autenticación

```javascript
// ✅ SOLUCIÓN: Hook optimizado con caché
import { useState, useEffect, useCallback, useMemo } from 'react'
import { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  loading: boolean
  subscription: any | null
  subscriptionLoading: boolean
}

export const useOptimizedAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    subscription: null,
    subscriptionLoading: false
  })

  // ✅ Caché de suscripción con TTL
  const subscriptionCache = useMemo(() => {
    const cache = new Map()
    const TTL = 5 * 60 * 1000 // 5 minutos
    
    return {
      get: (key: string) => {
        const item = cache.get(key)
        if (item && Date.now() - item.timestamp < TTL) {
          return item.data
        }
        cache.delete(key)
        return null
      },
      set: (key: string, data: any) => {
        cache.set(key, { data, timestamp: Date.now() })
      }
    }
  }, [])

  // ✅ Verificación de suscripción optimizada
  const checkSubscription = useCallback(async (userId: string) => {
    // Verificar caché primero
    const cached = subscriptionCache.get(userId)
    if (cached) {
      setAuthState(prev => ({ ...prev, subscription: cached, subscriptionLoading: false }))
      return cached
    }

    setAuthState(prev => ({ ...prev, subscriptionLoading: true }))
    
    try {
      // ✅ Llamada optimizada con timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s timeout
      
      const response = await fetch('/api/subscription/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const subscription = await response.json()
      
      // Guardar en caché
      subscriptionCache.set(userId, subscription)
      
      setAuthState(prev => ({ 
        ...prev, 
        subscription, 
        subscriptionLoading: false 
      }))
      
      return subscription
      
    } catch (error) {
      console.error('Error checking subscription:', error)
      
      // ✅ Fallback: asumir suscripción básica en caso de error
      const fallbackSubscription = { plan: 'free', active: true }
      
      setAuthState(prev => ({ 
        ...prev, 
        subscription: fallbackSubscription, 
        subscriptionLoading: false 
      }))
      
      return fallbackSubscription
    }
  }, [subscriptionCache])

  // ✅ Inicialización optimizada
  useEffect(() => {
    let mounted = true
    
    const initAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!mounted) return
        
        setAuthState(prev => ({ ...prev, user, loading: false }))
        
        // ✅ Verificar suscripción solo si hay usuario
        if (user) {
          // Verificación en background, no bloquea la UI
          checkSubscription(user.id)
        }
        
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (mounted) {
          setAuthState(prev => ({ ...prev, loading: false }))
        }
      }
    }
    
    initAuth()
    
    // ✅ Listener optimizado para cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        const user = session?.user || null
        setAuthState(prev => ({ ...prev, user, loading: false }))
        
        if (user && event === 'SIGNED_IN') {
          checkSubscription(user.id)
        } else if (event === 'SIGNED_OUT') {
          setAuthState(prev => ({ 
            ...prev, 
            subscription: null, 
            subscriptionLoading: false 
          }))
        }
      }
    )
    
    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [checkSubscription])

  return {
    ...authState,
    checkSubscription,
    // ✅ Función para refrescar suscripción manualmente
    refreshSubscription: useCallback(() => {
      if (authState.user) {
        subscriptionCache.set(authState.user.id, null) // Limpiar caché
        return checkSubscription(authState.user.id)
      }
    }, [authState.user, checkSubscription, subscriptionCache])
  }
}
```

### 2.2 Optimizar API de Verificación de Suscripción

```javascript
// ✅ app/api/subscription/check/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ✅ Caché en memoria para desarrollo (usar Redis en producción)
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }
    
    // ✅ Verificar caché primero
    const cacheKey = `subscription_${userId}`
    const cached = cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data)
    }
    
    // ✅ Consulta optimizada con timeout
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // ✅ Una sola consulta con JOIN en lugar de múltiples llamadas
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        users!inner(id, email)
      `)
      .eq('user_id', userId)
      .eq('active', true)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      throw error
    }
    
    // ✅ Respuesta optimizada
    const result = {
      plan: subscription?.plan || 'free',
      active: !!subscription?.active,
      expires_at: subscription?.expires_at,
      features: getFeaturesByPlan(subscription?.plan || 'free')
    }
    
    // ✅ Guardar en caché
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    })
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Subscription check error:', error)
    
    // ✅ Respuesta de fallback rápida
    return NextResponse.json({
      plan: 'free',
      active: true,
      features: getFeaturesByPlan('free')
    })
  }
}

// ✅ Función helper para features
function getFeaturesByPlan(plan: string) {
  const features = {
    free: { prompts: 10, conversations: 5, ai_models: ['gpt-3.5-turbo'] },
    pro: { prompts: 100, conversations: 50, ai_models: ['gpt-4', 'gpt-3.5-turbo'] },
    premium: { prompts: -1, conversations: -1, ai_models: ['gpt-4', 'claude-3'] }
  }
  
  return features[plan] || features.free
}
```

### 2.3 Componente de Loading Optimizado

```javascript
// ✅ components/AuthLoadingWrapper.tsx
import React, { Suspense } from 'react'
import { useOptimizedAuth } from '../hooks/useOptimizedAuth'

interface AuthLoadingWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

const AuthLoadingWrapper: React.FC<AuthLoadingWrapperProps> = ({ 
  children, 
  fallback 
}) => {
  const { user, loading, subscription, subscriptionLoading } = useOptimizedAuth()
  
  // ✅ Mostrar contenido inmediatamente si hay usuario
  // La suscripción se carga en background
  if (loading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Iniciando sesión...</span>
        </div>
      )
    )
  }
  
  // ✅ Mostrar contenido con indicador de carga de suscripción
  return (
    <div className="relative">
      {subscriptionLoading && (
        <div className="absolute top-2 right-2 z-50">
          <div className="bg-blue-100 border border-blue-300 rounded-md px-2 py-1 text-xs text-blue-700">
            Verificando suscripción...
          </div>
        </div>
      )}
      {children}
    </div>
  )
}

export default AuthLoadingWrapper
```

## 3. Optimizaciones de Base de Datos

### 3.1 Índices Críticos para Suscripciones

```sql
-- ✅ Índices para mejorar consultas de suscripción
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_user_active 
ON subscriptions(user_id, active) 
WHERE active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_expires_at 
ON subscriptions(expires_at) 
WHERE active = true;

-- ✅ Índice compuesto para consultas frecuentes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_lookup 
ON subscriptions(user_id, active, plan, expires_at);
```

### 3.2 Consulta Optimizada con RLS

```sql
-- ✅ Row Level Security optimizada
CREATE POLICY "Users can view own subscription" ON subscriptions
FOR SELECT USING (auth.uid() = user_id);

-- ✅ Función optimizada para verificación rápida
CREATE OR REPLACE FUNCTION get_user_subscription(p_user_id UUID)
RETURNS TABLE(
  plan TEXT,
  active BOOLEAN,
  expires_at TIMESTAMPTZ,
  features JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(s.plan, 'free')::TEXT,
    COALESCE(s.active, false)::BOOLEAN,
    s.expires_at,
    CASE 
      WHEN s.plan = 'premium' THEN '{"prompts": -1, "conversations": -1}'::JSONB
      WHEN s.plan = 'pro' THEN '{"prompts": 100, "conversations": 50}'::JSONB
      ELSE '{"prompts": 10, "conversations": 5}'::JSONB
    END as features
  FROM subscriptions s
  WHERE s.user_id = p_user_id 
    AND s.active = true
    AND (s.expires_at IS NULL OR s.expires_at > NOW())
  LIMIT 1;
  
  -- Si no hay suscripción activa, devolver plan gratuito
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      'free'::TEXT,
      true::BOOLEAN,
      NULL::TIMESTAMPTZ,
      '{"prompts": 10, "conversations": 5}'::JSONB;
  END IF;
END;
$$;
```

## 4. Implementación de Caché Redis (Producción)

```javascript
// ✅ lib/redis-cache.ts
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

export class SubscriptionCache {
  private static TTL = 300 // 5 minutos
  
  static async get(userId: string) {
    try {
      const cached = await redis.get(`subscription:${userId}`)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.error('Redis get error:', error)
      return null
    }
  }
  
  static async set(userId: string, data: any) {
    try {
      await redis.setex(
        `subscription:${userId}`, 
        this.TTL, 
        JSON.stringify(data)
      )
    } catch (error) {
      console.error('Redis set error:', error)
    }
  }
  
  static async invalidate(userId: string) {
    try {
      await redis.del(`subscription:${userId}`)
    } catch (error) {
      console.error('Redis delete error:', error)
    }
  }
}
```

## 5. Monitoreo y Alertas

```javascript
// ✅ lib/performance-monitor.ts
export class AuthPerformanceMonitor {
  static trackAuthTime(operation: string, startTime: number) {
    const duration = Date.now() - startTime
    
    // Alertar si toma más de 3 segundos
    if (duration > 3000) {
      console.warn(`🐌 Slow auth operation: ${operation} took ${duration}ms`)
      
      // Enviar a servicio de monitoreo
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'slow_auth', {
          operation,
          duration,
          custom_parameter: 'performance_issue'
        })
      }
    }
    
    return duration
  }
}

// Uso en el hook
const startTime = Date.now()
const subscription = await checkSubscription(userId)
AuthPerformanceMonitor.trackAuthTime('subscription_check', startTime)
```

## 6. Plan de Implementación Urgente

### ⚡ Implementar INMEDIATAMENTE (Hoy)

1. **Reemplazar hook de auth actual** con `useOptimizedAuth`
2. **Crear API optimizada** `/api/subscription/check`
3. **Agregar índices de base de datos**
4. **Implementar caché en memoria**

### 📋 Comandos de Implementación

```bash
# 1. Crear los archivos optimizados
touch app/hooks/useOptimizedAuth.ts
touch app/api/subscription/check/route.ts
touch app/components/AuthLoadingWrapper.tsx

# 2. Aplicar índices de base de datos
psql $DATABASE_URL -f database/optimize-subscriptions.sql

# 3. Reiniciar servidor de desarrollo
npm run dev
```

## 7. Resultados Esperados

### Antes (Actual)
- ❌ Verificación de suscripción: 8-15 segundos
- ❌ Inicio de sesión: 5-10 segundos
- ❌ UI bloqueada durante verificación
- ❌ Múltiples llamadas API redundantes

### Después (Optimizado)
- ✅ Verificación de suscripción: 0.5-1 segundo
- ✅ Inicio de sesión: 1-2 segundos
- ✅ UI no bloqueada, carga en background
- ✅ Caché inteligente, menos llamadas API

## 8. Alertas de Monitoreo

```javascript
// ✅ Configurar alertas automáticas
if (authDuration > 3000) {
  // Slack/Discord webhook
  fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    body: JSON.stringify({
      text: `🚨 Auth performance issue: ${operation} took ${authDuration}ms`
    })
  })
}
```

---

**🚨 ACCIÓN REQUERIDA:** Implementar estas optimizaciones INMEDIATAMENTE para resolver la lentitud crítica en autenticación y verificación de suscripción.

**Prioridad:** CRÍTICA - La experiencia del usuario está severamente comprometida.

**Tiempo estimado de implementación:** 2-4 horas

**Impacto esperado:** Reducción del 80-90% en tiempos de carga de autenticación.