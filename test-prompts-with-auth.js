// Test del sistema de prompts con autenticación real
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Configuración de Supabase
const supabaseUrl = 'https://kvhhppipogfvcwtphiak.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2aGhwcGlwb2dmdmN3dHBoaWFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMjY5MDAsImV4cCI6MjA2NTYwMjkwMH0.OBMgZxLR7NGST109ouHlorX8lKOLpsa_bZHnzWkZnoM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Función para crear un usuario de prueba y obtener token
async function getAuthToken() {
  console.log('🔐 Obteniendo token de autenticación...');
  
  try {
    // Intentar crear un usuario de prueba
    const testEmail = 'test@example.com';
    const testPassword = 'testpassword123';
    
    // Primero intentar hacer login
    let { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    // Si el login falla, intentar crear el usuario
    if (loginError) {
      console.log('👤 Usuario no existe, creando usuario de prueba...');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword
      });
      
      if (signUpError) {
        console.error('❌ Error creando usuario:', signUpError.message);
        return null;
      }
      
      // Usar los datos del signup
      loginData = signUpData;
    }
    
    if (loginData?.session?.access_token) {
      console.log('✅ Token obtenido exitosamente');
      return {
        token: loginData.session.access_token,
        email: loginData.user?.email,
        userId: loginData.user?.id
      };
    }
    
    console.error('❌ No se pudo obtener el token');
    return null;
  } catch (error) {
    console.error('💥 Error obteniendo token:', error.message);
    return null;
  }
}

// Función para probar la creación de un prompt con autenticación real
async function testCreatePromptWithAuth(authData) {
  console.log('\n🧪 Probando creación de prompt con autenticación real...');
  
  try {
    const response = await fetch('http://localhost:3000/api/prompts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.token}`,
        'x-user-email': authData.email
      },
      body: JSON.stringify({
        type: 'prompt',
        data: {
          name: 'Test Prompt Real',
          content: 'Este es un prompt de prueba con autenticación real',
          category: 'Test'
        }
      })
    });

    const result = await response.text();
    console.log('📊 Status:', response.status);
    console.log('📄 Response:', result);
    
    if (response.ok) {
      console.log('✅ Prompt creado exitosamente');
      return JSON.parse(result);
    } else {
      console.log('❌ Error al crear prompt');
      return null;
    }
  } catch (error) {
    console.error('💥 Error en la prueba:', error.message);
    return null;
  }
}

// Función para probar la creación de un grupo con autenticación real
async function testCreateGroupWithAuth(authData) {
  console.log('\n🧪 Probando creación de grupo con autenticación real...');
  
  try {
    const response = await fetch('http://localhost:3000/api/prompts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.token}`,
        'x-user-email': authData.email
      },
      body: JSON.stringify({
        type: 'group',
        data: {
          name: 'Test Group Real',
          description: 'Este es un grupo de prueba con autenticación real',
          prompts: []
        }
      })
    });

    const result = await response.text();
    console.log('📊 Status:', response.status);
    console.log('📄 Response:', result);
    
    if (response.ok) {
      console.log('✅ Grupo creado exitosamente');
      return JSON.parse(result);
    } else {
      console.log('❌ Error al crear grupo');
      return null;
    }
  } catch (error) {
    console.error('💥 Error en la prueba:', error.message);
    return null;
  }
}

// Función para probar la creación de una cadena con autenticación real
async function testCreateChainWithAuth(authData) {
  console.log('\n🧪 Probando creación de cadena con autenticación real...');
  
  try {
    const response = await fetch('http://localhost:3000/api/prompts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.token}`,
        'x-user-email': authData.email
      },
      body: JSON.stringify({
        type: 'chain',
        data: {
          name: 'Test Chain Real',
          description: 'Esta es una cadena de prueba con autenticación real',
          steps: [
            {
              id: 'step-1',
              promptId: 'test-prompt-1',
              order: 0,
              waitForResponse: true
            }
          ]
        }
      })
    });

    const result = await response.text();
    console.log('📊 Status:', response.status);
    console.log('📄 Response:', result);
    
    if (response.ok) {
      console.log('✅ Cadena creada exitosamente');
      return JSON.parse(result);
    } else {
      console.log('❌ Error al crear cadena');
      return null;
    }
  } catch (error) {
    console.error('💥 Error en la prueba:', error.message);
    return null;
  }
}

// Función para probar la obtención de prompts
async function testGetPrompts(authData) {
  console.log('\n🧪 Probando obtención de prompts...');
  
  try {
    const response = await fetch('http://localhost:3000/api/prompts?type=prompts', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authData.token}`,
        'x-user-email': authData.email
      }
    });

    const result = await response.text();
    console.log('📊 Status:', response.status);
    console.log('📄 Response:', result);
    
    if (response.ok) {
      console.log('✅ Prompts obtenidos exitosamente');
      return JSON.parse(result);
    } else {
      console.log('❌ Error al obtener prompts');
      return null;
    }
  } catch (error) {
    console.error('💥 Error en la prueba:', error.message);
    return null;
  }
}

// Ejecutar todas las pruebas
async function runAllTestsWithAuth() {
  console.log('🚀 Iniciando pruebas del sistema de prompts con autenticación real\n');
  
  // Obtener token de autenticación
  const authData = await getAuthToken();
  if (!authData) {
    console.error('❌ No se pudo obtener token de autenticación. Abortando pruebas.');
    return;
  }
  
  console.log(`👤 Usuario autenticado: ${authData.email}`);
  console.log(`🆔 User ID: ${authData.userId}`);
  
  // Ejecutar pruebas
  await testCreatePromptWithAuth(authData);
  await testCreateGroupWithAuth(authData);
  await testCreateChainWithAuth(authData);
  await testGetPrompts(authData);
  
  console.log('\n🏁 Pruebas completadas');
}

// Ejecutar las pruebas
runAllTestsWithAuth().catch(console.error);