// Script para debuggear el entorno exacto de Next.js
const { createClient } = require('@supabase/supabase-js');

// Simular el entorno de Next.js
process.env.NODE_ENV = 'development';

// Cargar variables de entorno manualmente
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  for (const line of lines) {
    if (line.includes('=') && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim();
      if (key && value) {
        process.env[key] = value;
      }
    }
  }
} catch (error) {
  console.error('Error leyendo .env.local:', error);
}

console.log('🔧 Debuggeando entorno de Next.js\n');

console.log('=== VARIABLES DE ENTORNO ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'PRESENTE' : 'NO PRESENTE');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'PRESENTE' : 'NO PRESENTE');

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Variables de entorno de Supabase no encontradas');
  process.exit(1);
}

// Crear cliente exactamente como en supabase-users.ts
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('\n=== CLIENTE SUPABASE ===');
console.log('Cliente creado exitosamente');

// Función exacta de supabase-users.ts
async function getSupabaseUserByEmail(email) {
  try {
    console.log(`🔍 getSupabaseUserByEmail: Buscando usuario ${email}`);
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
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
      has_email_config: !!data.email_provider_config,
      email_provider_config_type: typeof data.email_provider_config,
      email_provider_config_value: data.email_provider_config
    });

    return data;
  } catch (error) {
    console.error('Error en getSupabaseUserByEmail:', error);
    return null;
  }
}

async function testWithNextJSEnv() {
  console.log('\n=== PRUEBA CON ENTORNO NEXT.JS ===');
  
  const testEmail = 'selamu.garcia@gmail.com';
  const user = await getSupabaseUserByEmail(testEmail);
  
  if (user) {
    console.log('\n📊 Análisis detallado:');
    console.log('- email_provider_config es null?', user.email_provider_config === null);
    console.log('- email_provider_config es undefined?', user.email_provider_config === undefined);
    console.log('- email_provider_config es objeto vacío?', 
      typeof user.email_provider_config === 'object' && 
      user.email_provider_config !== null && 
      Object.keys(user.email_provider_config).length === 0
    );
    console.log('- Tipo de email_provider_config:', typeof user.email_provider_config);
    console.log('- Valor de email_provider_config:', user.email_provider_config);
    
    // Verificar si la condición del servidor se cumple
    const hasConfig = !!(user.email_provider && user.email_provider_config);
    console.log('\n🔍 Evaluación de condiciones:');
    console.log('- user.email_provider:', user.email_provider);
    console.log('- !!user.email_provider:', !!user.email_provider);
    console.log('- user.email_provider_config:', user.email_provider_config);
    console.log('- !!user.email_provider_config:', !!user.email_provider_config);
    console.log('- Condición final (ambos true):', hasConfig);
  }
}

testWithNextJSEnv();