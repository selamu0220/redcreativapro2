// Script para crear usuario usando Supabase
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://kvhhppipogfvcwtphiak.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2aGhwcGlwb2dmdmN3dHBoaWFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDAyNjkwMCwiZXhwIjoyMDY1NjAyOTAwfQ.9ZgWe1W8A7nD-ojTLT5Iqp3AoQXDP-hEZsENcDCHqr4';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupUser() {
  try {
    console.log('🔄 Creando usuario selamu.garcia@gmail.com en Supabase...');
    
    // Verificar si el usuario ya existe
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'selamu.garcia@gmail.com')
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error al verificar usuario:', checkError);
      return;
    }
    
    if (existingUser) {
      console.log('✅ Usuario ya existe:', existingUser);
    } else {
      // Crear nuevo usuario
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: 'selamu.garcia@gmail.com',
          subscription_status: 'free',
          is_premium: false,
          created_at: new Date().toISOString(),
          last_active_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Error al crear usuario:', createError);
        return;
      }
      
      console.log('✅ Usuario creado:', newUser);
    }
    
    // Crear configuración de página por defecto
    console.log('🔄 Creando configuración de página...');
    
    const { data: existingSettings, error: settingsCheckError } = await supabase
      .from('user_page_settings')
      .select('*')
      .eq('user_email', 'selamu.garcia@gmail.com')
      .single();
    
    if (settingsCheckError && settingsCheckError.code !== 'PGRST116') {
      console.error('❌ Error al verificar configuración:', settingsCheckError);
      return;
    }
    
    if (existingSettings) {
      console.log('✅ Configuración ya existe:', existingSettings);
    } else {
      const { data: newSettings, error: settingsCreateError } = await supabase
        .from('user_page_settings')
        .insert({
          user_email: 'selamu.garcia@gmail.com',
          title: 'Únete a nuestra lista de correo',
          description: 'Recibe las últimas actualizaciones y contenido exclusivo directamente en tu bandeja de entrada.',
          call_to_action_text: 'Suscribirse',
          success_message: '¡Gracias por suscribirte! Te enviaremos contenido valioso muy pronto.',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (settingsCreateError) {
        console.error('❌ Error al crear configuración:', settingsCreateError);
        return;
      }
      
      console.log('✅ Configuración de página creada:', newSettings);
    }
    
    console.log('🎉 ¡Setup completado exitosamente!');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
    console.error('Stack:', error.stack);
  }
}

setupUser();