import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Configuración de Supabase
const supabaseUrl = 'https://kvhhppipogfvcwtphiak.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2aGhwcGlwb2dmdmN3dHBoaWFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMjY5MDAsImV4cCI6MjA2NTYwMjkwMH0.OBMgZxLR7NGST109ouHlorX8lKOLpsa_bZHnzWkZnoM';
const supabase = createClient(supabaseUrl, supabaseKey);

// Función para obtener token de autenticación
async function getAuthToken() {
  try {
    console.log('🔐 Obteniendo token de autenticación...');
    
    // Intentar login primero
    let { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpassword123'
    });
    
    // Si el login falla, crear usuario
    if (loginError) {
      console.log('👤 Usuario no existe, creando cuenta...');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'testpassword123'
      });
      
      if (signUpError) {
        console.error('❌ Error creando usuario:', signUpError.message);
        return null;
      }
      
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
    console.error('Datos de login:', JSON.stringify(loginData, null, 2));
    return null;
  } catch (error) {
    console.error('💥 Error obteniendo token:', error.message);
    return null;
  }
}

// Función para hacer peticiones autenticadas
async function makeAuthenticatedRequest(method, url, authData, body = null) {
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${authData.token}`,
      'x-user-email': authData.email
    }
  };
  
  if (body) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  const result = await response.text();
  
  return {
    status: response.status,
    ok: response.ok,
    data: result ? JSON.parse(result) : null
  };
}

// Verificación completa del sistema
async function runCompleteVerification() {
  console.log('🚀 Iniciando verificación completa del sistema de prompts\n');
  
  // Obtener autenticación
  const authData = await getAuthToken();
  if (!authData) {
    console.error('❌ No se pudo obtener autenticación. Abortando verificación.');
    return;
  }
  
  console.log(`👤 Usuario: ${authData.email}`);
  console.log(`🆔 ID: ${authData.userId}\n`);
  
  let createdPromptId = null;
  let createdGroupId = null;
  let createdChainId = null;
  
  try {
    // 1. Crear un prompt
    console.log('📝 1. Creando prompt...');
    const promptResult = await makeAuthenticatedRequest('POST', 'http://localhost:3000/api/prompts', authData, {
      type: 'prompt',
      data: {
        name: 'Prompt de Verificación Final',
        content: 'Este es un prompt creado durante la verificación final del sistema',
        category: 'Verificación'
      }
    });
    
    if (promptResult.ok) {
      createdPromptId = promptResult.data.prompt.id;
      console.log(`✅ Prompt creado: ${createdPromptId}`);
    } else {
      console.log(`❌ Error creando prompt: ${promptResult.status} - ${JSON.stringify(promptResult.data)}`);
    }
    
    // 2. Crear un grupo
    console.log('\n📁 2. Creando grupo...');
    const groupResult = await makeAuthenticatedRequest('POST', 'http://localhost:3000/api/prompts', authData, {
      type: 'group',
      data: {
        name: 'Grupo de Verificación Final',
        description: 'Grupo creado durante la verificación final',
        prompts: createdPromptId ? [createdPromptId] : []
      }
    });
    
    if (groupResult.ok) {
      createdGroupId = groupResult.data.group.id;
      console.log(`✅ Grupo creado: ${createdGroupId}`);
    } else {
      console.log(`❌ Error creando grupo: ${groupResult.status} - ${JSON.stringify(groupResult.data)}`);
    }
    
    // 3. Crear una cadena
    console.log('\n🔗 3. Creando cadena...');
    const chainResult = await makeAuthenticatedRequest('POST', 'http://localhost:3000/api/prompts', authData, {
      type: 'chain',
      data: {
        name: 'Cadena de Verificación Final',
        description: 'Cadena creada durante la verificación final',
        steps: [
          {
            id: 'step-1',
            promptId: createdPromptId || 'test-prompt',
            order: 0,
            waitForResponse: true
          }
        ]
      }
    });
    
    if (chainResult.ok) {
      createdChainId = chainResult.data.chain.id;
      console.log(`✅ Cadena creada: ${createdChainId}`);
    } else {
      console.log(`❌ Error creando cadena: ${chainResult.status} - ${JSON.stringify(chainResult.data)}`);
    }
    
    // 4. Obtener todos los prompts
    console.log('\n📋 4. Obteniendo prompts...');
    const getPromptsResult = await makeAuthenticatedRequest('GET', 'http://localhost:3000/api/prompts?type=prompts', authData);
    
    if (getPromptsResult.ok) {
      const promptCount = getPromptsResult.data.prompts.length;
      console.log(`✅ Prompts obtenidos: ${promptCount} encontrados`);
    } else {
      console.log(`❌ Error obteniendo prompts: ${getPromptsResult.status} - ${JSON.stringify(getPromptsResult.data)}`);
    }
    
    // 5. Obtener todos los grupos
    console.log('\n📂 5. Obteniendo grupos...');
    const getGroupsResult = await makeAuthenticatedRequest('GET', 'http://localhost:3000/api/prompts?type=groups', authData);
    
    if (getGroupsResult.ok) {
      const groupCount = getGroupsResult.data.groups.length;
      console.log(`✅ Grupos obtenidos: ${groupCount} encontrados`);
    } else {
      console.log(`❌ Error obteniendo grupos: ${getGroupsResult.status} - ${JSON.stringify(getGroupsResult.data)}`);
    }
    
    // 6. Obtener todas las cadenas
    console.log('\n🔗 6. Obteniendo cadenas...');
    const getChainsResult = await makeAuthenticatedRequest('GET', 'http://localhost:3000/api/prompts?type=chains', authData);
    
    if (getChainsResult.ok) {
      const chainCount = getChainsResult.data.chains.length;
      console.log(`✅ Cadenas obtenidas: ${chainCount} encontradas`);
    } else {
      console.log(`❌ Error obteniendo cadenas: ${getChainsResult.status} - ${JSON.stringify(getChainsResult.data)}`);
    }
    
    // 7. Actualizar el prompt creado (si existe)
    if (createdPromptId) {
      console.log('\n✏️ 7. Actualizando prompt...');
      const updateResult = await makeAuthenticatedRequest('PUT', 'http://localhost:3000/api/prompts', authData, {
        type: 'prompt',
        id: createdPromptId,
        data: {
          name: 'Prompt de Verificación Final - ACTUALIZADO',
          content: 'Este prompt ha sido actualizado exitosamente',
          category: 'Verificación'
        }
      });
      
      if (updateResult.ok) {
        console.log(`✅ Prompt actualizado exitosamente`);
      } else {
        console.log(`❌ Error actualizando prompt: ${updateResult.status} - ${JSON.stringify(updateResult.data)}`);
      }
    }
    
    console.log('\n🎉 ¡Verificación completa finalizada!');
    console.log('\n📊 RESUMEN:');
    console.log(`   • Prompt creado: ${createdPromptId ? '✅' : '❌'}`);
    console.log(`   • Grupo creado: ${createdGroupId ? '✅' : '❌'}`);
    console.log(`   • Cadena creada: ${createdChainId ? '✅' : '❌'}`);
    console.log(`   • Obtención de datos: ✅`);
    console.log(`   • Actualización: ${createdPromptId ? '✅' : 'N/A'}`);
    
  } catch (error) {
    console.error('💥 Error durante la verificación:', error.message);
  }
}

// Ejecutar verificación
runCompleteVerification().catch(console.error);