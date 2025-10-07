import { createClient } from '@supabase/supabase-js';

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

// Solo crear el cliente si tenemos variables válidas
const supabase = (supabaseUrl && supabaseAnonKey && isValidSupabaseUrl(supabaseUrl)) 
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
      // Configuración de fetch con timeout y reintentos
      fetch: (url, options = {}) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
        
        return fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            ...((options as any).headers || {}),
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }).finally(() => {
          clearTimeout(timeoutId);
        });
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

export { supabase };

// Helper function to get auth headers for API requests with retry logic
export const getAuthHeaders = async (retries = 3): Promise<any> => {
  if (!supabase) {
    console.warn('Supabase client not available');
    return {};
  }
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
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
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.error('Failed to refresh session:', refreshError);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      
      console.log('Auth headers created for user:', session.user.id);
      
      return {
        'Authorization': `Bearer ${session.access_token}`,
        'x-user-uid': session.user.id,
        'x-user-email': session.user.email || '',
        'Content-Type': 'application/json'
      };
    } catch (error: any) {
      console.error(`Error getting auth headers (attempt ${attempt}):`, error);
      
      if (attempt === retries) {
        throw error;
      }
      
      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  throw new Error('Failed to get auth headers after all retry attempts');
};

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
  if (!supabase) {
    console.warn('Supabase client not available for health check');
    return false;
  }
  
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    return !error;
  } catch (error) {
    console.error('Supabase health check failed:', error);
    return false;
  }
};