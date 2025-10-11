import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase para el servidor
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

// Cliente de Supabase para el servidor (sin hooks de React)
const supabaseServer = (supabaseUrl && supabaseAnonKey && isValidSupabaseUrl(supabaseUrl)) 
  ? createClient(supabaseUrl, supabaseAnonKey, 
  {
    auth: {
      persistSession: false, // No persistir sesión en el servidor
      autoRefreshToken: false, // No auto-refrescar en el servidor
      detectSessionInUrl: false, // No detectar sesión en URL en el servidor
      flowType: 'pkce'
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-server'
      }
    },
    // Configuración de base de datos
    db: {
      schema: 'public'
    }
  }
) : null;

export { supabaseServer };

// Helper function para obtener headers de autenticación en el servidor
export const getServerAuthHeaders = (accessToken?: string): any => {
  if (!accessToken) {
    return {};
  }
  
  return {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'apikey': supabaseAnonKey || ''
  };
};

// Función para validar un token de acceso
export const validateAccessToken = async (accessToken: string): Promise<boolean> => {
  if (!supabaseServer || !accessToken) {
    return false;
  }
  
  try {
    const { data, error } = await supabaseServer.auth.getUser(accessToken);
    return !error && !!data.user;
  } catch (error) {
    console.error('Error validating access token:', error);
    return false;
  }
};