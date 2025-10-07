import { createClient } from '@supabase/supabase-js';

// Función para obtener el cliente de Supabase de manera segura
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Missing Supabase environment variables. Some features may not work properly.');
    // Retornar un cliente mock para evitar errores durante el build
    return null;
  }

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
}

// Interfaces
export interface SupabaseUser {
  id: string;
  email: string;
  subscription_status: 'free' | 'trial' | 'pro' | 'premium';
  trial_start_date?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  stripe_price_id?: string;
  stripe_product_id?: string;
  subscription_plan?: 'monthly' | 'yearly' | 'lifetime';
  subscription_active?: boolean;
  subscription_cancel_at_period_end?: boolean;
  subscription_current_period_start?: string;
  subscription_current_period_end?: string;
  subscription_canceled_at?: string;
  subscription_created?: string;
  last_payment_status?: 'succeeded' | 'failed' | 'pending' | 'canceled';
  next_billing_date?: string;
  is_premium?: boolean;
  ai_studio_api_key?: string;
  gmail_user?: string;
  gmail_password?: string;
  gmail_config_notified?: boolean;
  email_provider?: 'gmail';
  email_provider_config?: {
    // Old email system properties removed
    [key: string]: any;
  };
  created_at: string;
  last_active_at: string;
  updated_at: string;
}

// Removed old email system interface: EmailProviderConfig

// Función para obtener usuario por email
export async function getSupabaseUserByEmail(email: string): Promise<SupabaseUser | null> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn('Supabase client not available. Returning null.');
      return null;
    }

    console.log(`🔍 getSupabaseUserByEmail: Buscando usuario ${email}`);
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - usuario no encontrado
        console.log(`❌ Usuario no encontrado: ${email}`);
        return null;
      }
      console.error('Error buscando usuario:', error);
      return null;
    }

    console.log(`✅ Usuario encontrado:`, {
      email: data.email,
      subscription_status: data.subscription_status,
      email_provider: data.email_provider,
      has_email_config: !!data.email_provider_config
    });

    return data;
  } catch (error) {
    console.error('Error en getSupabaseUserByEmail:', error);
    return null;
  }
}

// Función para crear o actualizar usuario
export async function createOrUpdateSupabaseUser(
  email: string,
  userData: Partial<SupabaseUser>
): Promise<SupabaseUser | null> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn('Supabase client not available. Returning null.');
      return null;
    }

    console.log(`🔄 createOrUpdateSupabaseUser: Procesando usuario ${email}`);
    
    const normalizedEmail = email.toLowerCase();
    const now = new Date().toISOString();
    
    // Intentar actualizar primero
    const { data: updateData, error: updateError } = await supabase
      .from('users')
      .update({
        ...userData,
        last_active_at: now,
        updated_at: now
      })
      .eq('email', normalizedEmail)
      .select()
      .single();

    if (!updateError && updateData) {
      console.log(`✅ Usuario actualizado: ${email}`);
      return updateData;
    }

    // Si no existe, crear nuevo usuario
    if (updateError?.code === 'PGRST116') {
      console.log(`👤 Creando nuevo usuario: ${email}`);
      
      const newUser = {
        email: normalizedEmail,
        subscription_status: 'free' as const,
        trial_start_date: now,
        created_at: now,
        last_active_at: now,
        updated_at: now,
        ...userData
      };

      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .insert(newUser)
        .select()
        .single();

      if (insertError) {
        console.error('Error creando usuario:', insertError);
        return null;
      }

      console.log(`✅ Usuario creado exitosamente: ${email}`);
      return insertData;
    }

    console.error('Error actualizando usuario:', updateError);
    return null;
  } catch (error) {
    console.error('Error en createOrUpdateSupabaseUser:', error);
    return null;
  }
}

// Removed old email system functions: updateSupabaseUserEmailProvider, getSupabaseUserEmailProvider, clearSupabaseUserEmailProvider

// Función para obtener todos los usuarios (para migración)
export async function getAllSupabaseUsers(): Promise<SupabaseUser[]> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn('Supabase client not available. Returning empty array.');
      return [];
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error obteniendo usuarios:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error en getAllSupabaseUsers:', error);
    return [];
  }
}