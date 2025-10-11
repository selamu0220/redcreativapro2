'use client'

import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

// Configuración de Supabase para el cliente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validar que las URLs de Supabase sean válidas
function isValidSupabaseUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:' && parsedUrl.hostname.includes('supabase');
  } catch {
    return false;
  }
}

if (!supabaseUrl || !supabaseAnonKey || !isValidSupabaseUrl(supabaseUrl)) {
  console.warn('Missing or invalid Supabase environment variables. Some features may not work properly.');
}

// Cliente de Supabase para el cliente (con hooks de React)
const supabaseClient = (supabaseUrl && supabaseAnonKey && isValidSupabaseUrl(supabaseUrl)) 
  ? createClient(supabaseUrl, supabaseAnonKey, 
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // Configuración mejorada para manejo de tokens
      flowType: 'pkce',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'sb-auth-token',
      // Configuración de red más robusta
      debug: process.env.NODE_ENV === 'development'
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-web'
      },
      // Configuración de fetch con timeout y reintentos mejorada
      fetch: async (url, options = {}) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // Aumentado a 20 segundos
        
        try {
          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
              ...((options as any).headers || {}),
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          
          clearTimeout(timeoutId);
          return response;
        } catch (error: any) {
          clearTimeout(timeoutId);
          
          // Manejo específico para errores de refresh de tokens
          if (url.includes('/token?grant_type=refresh_token')) {
            console.warn('Token refresh failed, clearing session:', error.message);
            // Limpiar la sesión corrupta
            if (typeof window !== 'undefined') {
              localStorage.removeItem('sb-kvhhppipogfvcwtphiak-auth-token');
              sessionStorage.removeItem('sb-kvhhppipogfvcwtphiak-auth-token');
            }
            // Retornar una respuesta que indique que no hay sesión
            return new Response(JSON.stringify({ error: 'invalid_grant' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            });
          }
          
          // Manejo mejorado de errores de conectividad
          if (error.name === 'AbortError') {
            console.warn('Supabase request timeout:', url);
            throw new Error('Connection timeout - please check your internet connection');
          }
          if (error.message === 'Failed to fetch') {
            console.warn('Supabase connection failed:', url);
            throw new Error('Unable to connect to authentication service - working in offline mode');
          }
          throw error;
        }
      }
    },
    // Configuración de base de datos
    db: {
      schema: 'public'
    },
    // Configuración de realtime
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
) : null;

export { supabaseClient };

// Helper function to get auth headers for API requests with retry logic
export const getAuthHeaders = async (retries = 3): Promise<any> => {
  if (!supabaseClient) {
    console.warn('Supabase client not available');
    return {};
  }
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      let { data: { session }, error } = await supabaseClient.auth.getSession();
      
      if (error) {
        console.error(`Supabase session error (attempt ${attempt}):`, error);
        
        // Si es el último intento, lanzar el error
        if (attempt === retries) {
          throw new Error(`Session error after ${retries} attempts: ${error.message}`);
        }
        
        // Esperar antes del siguiente intento (backoff exponencial)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        continue;
      }
      
      if (!session?.access_token || !session?.user) {
        console.warn(`No authenticated user found (attempt ${attempt})`);
        
        if (attempt === retries) {
          throw new Error('No authenticated user found after multiple attempts');
        }
        
        // Intentar refrescar la sesión
        const { data: { session: refreshedSession }, error: refreshError } = await supabaseClient.auth.refreshSession();
        if (refreshError || !refreshedSession) {
          console.error('Failed to refresh session:', refreshError);
        } else {
          session = refreshedSession;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      
      const headers = {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      'x-user-uid': session.user.id,
      'x-user-email': session.user.email || ''
    };
    
    return headers;
      
    } catch (error: any) {
      console.error(`Error getting auth headers (attempt ${attempt}):`, error);
      
      if (attempt === retries) {
        throw new Error(`Failed to get auth headers after ${retries} attempts: ${error.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  return {};
};

// Hook personalizado para usar Supabase en componentes
export const useSupabase = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabaseClient) {
      setError('Supabase client not available');
      setLoading(false);
      return;
    }

    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error) {
          // Manejo específico para errores de token inválido
          if (error.message.includes('invalid_grant') || error.message.includes('refresh_token_not_found')) {
            console.warn('Invalid token detected, clearing session:', error.message);
            // Limpiar tokens corruptos
            if (typeof window !== 'undefined') {
              localStorage.removeItem('sb-kvhhppipogfvcwtphiak-auth-token');
              sessionStorage.removeItem('sb-kvhhppipogfvcwtphiak-auth-token');
            }
            setSession(null);
            setError(null); // No mostrar error al usuario
          } else {
            console.error('Session error:', error);
            setError(error.message);
          }
        } else {
          setSession(session);
          setError(null);
        }
      } catch (err: any) {
        console.error('Error getting initial session:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setLoading(false);
        
        // Limpiar errores cuando hay cambios de estado exitosos
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setError(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    supabase: supabaseClient,
    session,
    loading,
    error,
    user: session?.user || null
  };
};