'use client'

// Re-exportar las configuraciones de Supabase desde archivos separados
export { supabaseServer, getServerAuthHeaders, validateAccessToken } from './supabase-server';
export { supabaseClient, getAuthHeaders, useSupabase } from './supabase-client';

// Mantener compatibilidad con importaciones existentes
export { supabaseClient as supabase } from './supabase-client';

// Importar supabaseClient para uso interno
import { supabaseClient } from './supabase-client';
import { useState, useEffect } from 'react';

// Helper function to handle network errors with retry logic
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      console.error(`Operation failed (attempt ${attempt}):`, error);
      
      // Si es el último intento o no es un error de red, lanzar el error
      if (attempt === maxRetries || !isNetworkError(error)) {
        throw error;
      }
      
      // Esperar antes del siguiente intento (backoff exponencial)
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Operation failed after all retry attempts');
};

// Helper function to detect network errors
const isNetworkError = (error: any): boolean => {
  return (
    error?.message?.includes('Failed to fetch') ||
    error?.message?.includes('Network request failed') ||
    error?.message?.includes('fetch') ||
    error?.code === 'NETWORK_ERROR' ||
    error?.name === 'AbortError' ||
    error?.name === 'TimeoutError'
  );
};

// Helper function to check Supabase connection health
export const checkSupabaseHealth = async (): Promise<boolean> => {
  if (!supabaseClient) {
    console.warn('Supabase client not available for health check');
    return false;
  }
  
  try {
    // Intentar una operación simple para verificar conectividad
    const { error } = await supabaseClient.auth.getSession();
    return !error;
  } catch (error) {
    console.warn('Supabase health check failed:', error);
    return false;
  }
};

// Modo offline/fallback para autenticación
export const createOfflineAuthState = () => {
  return {
    user: null,
    session: null,
    isOffline: true,
    error: 'Working in offline mode - authentication services unavailable'
  };
};

// Hook para manejo de estado de autenticación con fallback
export const useSupabaseWithFallback = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [lastHealthCheck, setLastHealthCheck] = useState(Date.now());
  
  // Verificar conectividad periódicamente
  useEffect(() => {
    const checkConnectivity = async () => {
      const healthy = await checkSupabaseHealth();
      setIsOnline(healthy);
      setLastHealthCheck(Date.now());
    };
    
    // Verificar inmediatamente
    checkConnectivity();
    
    // Verificar cada 30 segundos
    const interval = setInterval(checkConnectivity, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  return {
    supabase: isOnline ? supabaseClient : null,
    isOnline,
    lastHealthCheck,
    offlineState: isOnline ? null : createOfflineAuthState()
  };
};