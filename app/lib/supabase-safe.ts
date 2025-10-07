import { createClient } from '@supabase/supabase-js';

// Validar que las URLs de Supabase sean válidas
export function isValidSupabaseUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:' && parsedUrl.hostname.includes('supabase');
  } catch {
    return false;
  }
}

// Función para crear un cliente Supabase de forma segura
export function createSafeSupabaseClient(url?: string, key?: string) {
  const supabaseUrl = url || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = key || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Missing Supabase environment variables. Some features may not work properly.');
    return null;
  }

  if (!isValidSupabaseUrl(supabaseUrl)) {
    console.warn('Invalid Supabase URL format. Some features may not work properly.');
    return null;
  }

  try {
    return createClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error);
    return null;
  }
}

// Función para obtener un cliente Supabase con validación
export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Missing Supabase environment variables during build');
    return null;
  }
  
  if (!isValidSupabaseUrl(supabaseUrl)) {
    console.warn('Invalid Supabase URL during build');
    return null;
  }
  
  try {
    // Verificar que las variables no sean placeholders
  if (!supabaseUrl || !supabaseServiceKey || 
      supabaseUrl === 'your_supabase_url' || 
      supabaseServiceKey === 'your_supabase_service_role_key') {
    console.warn('Supabase environment variables not configured or using placeholder values');
    return null;
  }
  
  try {
    // Validar URL
    new URL(supabaseUrl);
    return createClient(supabaseUrl, supabaseServiceKey);
  } catch (error) {
    console.warn('Failed to initialize Supabase client during build:', error);
    return null;
  }
  } catch (error) {
    console.warn('Failed to create Supabase client during build:', error);
    return null;
  }
}