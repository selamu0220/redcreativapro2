
import { createClient } from '@supabase/supabase-js';

// Cliente de Supabase singleton
let supabaseClient: ReturnType<typeof createClient> | null = null;

/**
 * Obtiene el cliente de Supabase configurado.
 * Utiliza las variables de entorno para la configuración.
 *
 * @returns El cliente de Supabase configurado.
 * @throws Un error si las variables de entorno no están configuradas.
 */
export function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Variables de entorno de Supabase no configuradas correctamente.');
    }

    supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  return supabaseClient;
}

/**
 * Función de compatibilidad que devuelve el cliente de Supabase.
 * Mantiene la misma interfaz que la función anterior para facilitar la migración.
 *
 * @param userId - El ID del usuario (ya no se usa, pero se mantiene para compatibilidad).
 * @returns El cliente de Supabase.
 */
export async function getDbConnection(userId?: string) {
  return getSupabaseClient();
}
