import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase para el cliente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);