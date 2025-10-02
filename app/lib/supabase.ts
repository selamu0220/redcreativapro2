import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase para el cliente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to get auth headers for API requests
export const getAuthHeaders = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Supabase session error:', error);
      throw new Error(`Session error: ${error.message}`);
    }
    
    if (!session?.access_token || !session?.user) {
      console.warn('No authenticated user found');
      throw new Error('No authenticated user found');
    }
    
    console.log('Auth headers created for user:', session.user.id);
    
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'x-user-uid': session.user.id,
      'x-user-email': session.user.email || '',
      'Content-Type': 'application/json'
    };
  } catch (error) {
    console.error('Error getting auth headers:', error);
    throw error;
  }
};