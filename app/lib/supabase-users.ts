import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente de Supabase con service role para operaciones del servidor
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
  email_provider?: 'gmail' | 'resend';
  email_provider_config?: {
    gmailUser?: string;
    gmailPassword?: string;
    resendApiKey?: string;
    resendFromEmail?: string;
  };
  created_at: string;
  last_active_at: string;
  updated_at: string;
}

export interface EmailProviderConfig {
  provider: 'gmail' | 'resend';
  config: {
    gmailUser?: string;
    gmailPassword?: string;
    resendApiKey?: string;
    resendFromEmail?: string;
  };
}

// Función para obtener usuario por email
export async function getSupabaseUserByEmail(email: string): Promise<SupabaseUser | null> {
  try {
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

// Función para actualizar configuración de email provider
export async function updateSupabaseUserEmailProvider(
  email: string,
  providerConfig: EmailProviderConfig
): Promise<boolean> {
  try {
    console.log(`🔄 updateSupabaseUserEmailProvider: Actualizando configuración para ${email}`);
    console.log(`📝 Configuración recibida:`, {
      provider: providerConfig.provider,
      configKeys: Object.keys(providerConfig.config || {})
    });

    const normalizedEmail = email.toLowerCase();
    const now = new Date().toISOString();

    // Primero verificar si el usuario existe
    let user = await getSupabaseUserByEmail(normalizedEmail);
    
    if (!user) {
      // Crear usuario si no existe
      console.log(`👤 Usuario no existe, creando: ${email}`);
      user = await createOrUpdateSupabaseUser(normalizedEmail, {
        email_provider: providerConfig.provider,
        email_provider_config: providerConfig.config
      });
      
      if (!user) {
        console.error('Error creando usuario');
        return false;
      }
      
      console.log('✅ Usuario creado con configuración de email provider');
      return true;
    }

    // Actualizar configuración de email provider
    const { error } = await supabase
      .from('users')
      .update({
        email_provider: providerConfig.provider,
        email_provider_config: providerConfig.config,
        last_active_at: now,
        updated_at: now
      })
      .eq('email', normalizedEmail);

    if (error) {
      console.error('Error actualizando configuración de email provider:', error);
      return false;
    }

    console.log('✅ Configuración de email provider actualizada exitosamente');
    return true;
  } catch (error) {
    console.error('Error en updateSupabaseUserEmailProvider:', error);
    return false;
  }
}

// Función para obtener configuración de email provider
export async function getSupabaseUserEmailProvider(
  email: string
): Promise<EmailProviderConfig | null> {
  try {
    console.log(`🔍 getSupabaseUserEmailProvider: Buscando configuración para ${email}`);
    
    const user = await getSupabaseUserByEmail(email);
    
    if (!user) {
      console.log(`❌ No se encontró usuario para ${email}`);
      return null;
    }

    console.log(`👤 Usuario encontrado:`, {
      email: user.email,
      email_provider: user.email_provider,
      has_email_config: !!user.email_provider_config
    });

    if (!user.email_provider || !user.email_provider_config) {
      console.log(`❌ Usuario ${email} no tiene configuración de email provider`);
      return null;
    }

    const result = {
      provider: user.email_provider,
      config: user.email_provider_config
    };

    console.log(`✅ Configuración encontrada:`, {
      provider: result.provider,
      configKeys: Object.keys(result.config)
    });

    return result;
  } catch (error) {
    console.error('Error en getSupabaseUserEmailProvider:', error);
    return null;
  }
}

// Función para limpiar configuración de email provider
export async function clearSupabaseUserEmailProvider(email: string): Promise<boolean> {
  try {
    console.log(`🧹 clearSupabaseUserEmailProvider: Limpiando configuración para ${email}`);
    
    const normalizedEmail = email.toLowerCase();
    const now = new Date().toISOString();

    const { error } = await supabase
      .from('users')
      .update({
        email_provider: null,
        email_provider_config: null,
        last_active_at: now,
        updated_at: now
      })
      .eq('email', normalizedEmail);

    if (error) {
      console.error('Error limpiando configuración de email provider:', error);
      return false;
    }

    console.log('✅ Configuración de email provider limpiada exitosamente');
    return true;
  } catch (error) {
    console.error('Error en clearSupabaseUserEmailProvider:', error);
    return false;
  }
}

// Función para obtener todos los usuarios (para migración)
export async function getAllSupabaseUsers(): Promise<SupabaseUser[]> {
  try {
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