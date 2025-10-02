// Test del sistema de prompts
import fetch from 'node-fetch';

// Función para probar la creación de un prompt
async function testCreatePrompt() {
  console.log('🧪 Probando creación de prompt...');
  
  try {
    const response = await fetch('http://localhost:3000/api/prompts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
        'x-user-email': 'test@example.com'
      },
      body: JSON.stringify({
        type: 'prompt',
        data: {
          name: 'Test Prompt',
          content: 'Este es un prompt de prueba',
          category: 'Test',
          userId: 'test-user-123'
        }
      })
    });

    const result = await response.text();
    console.log('📊 Status:', response.status);
    console.log('📄 Response:', result);
    
    if (response.ok) {
      console.log('✅ Prompt creado exitosamente');
    } else {
      console.log('❌ Error al crear prompt');
    }
  } catch (error) {
    console.error('💥 Error en la prueba:', error.message);
  }
}

// Función para probar la creación de un grupo
async function testCreateGroup() {
  console.log('\n🧪 Probando creación de grupo...');
  
  try {
    const response = await fetch('http://localhost:3000/api/prompts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
        'x-user-email': 'test@example.com'
      },
      body: JSON.stringify({
        type: 'group',
        data: {
          name: 'Test Group',
          description: 'Este es un grupo de prueba',
          prompts: [],
          userId: 'test-user-123'
        }
      })
    });

    const result = await response.text();
    console.log('📊 Status:', response.status);
    console.log('📄 Response:', result);
    
    if (response.ok) {
      console.log('✅ Grupo creado exitosamente');
    } else {
      console.log('❌ Error al crear grupo');
    }
  } catch (error) {
    console.error('💥 Error en la prueba:', error.message);
  }
}

// Función para probar la creación de una cadena
async function testCreateChain() {
  console.log('\n🧪 Probando creación de cadena...');
  
  try {
    const response = await fetch('http://localhost:3000/api/prompts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
        'x-user-email': 'test@example.com'
      },
      body: JSON.stringify({
        type: 'chain',
        data: {
          name: 'Test Chain',
          description: 'Esta es una cadena de prueba',
          steps: [
            {
              id: 'step-1',
              promptId: 'test-prompt-1',
              order: 0,
              waitForResponse: true
            }
          ],
          userId: 'test-user-123'
        }
      })
    });

    const result = await response.text();
    console.log('📊 Status:', response.status);
    console.log('📄 Response:', result);
    
    if (response.ok) {
      console.log('✅ Cadena creada exitosamente');
    } else {
      console.log('❌ Error al crear cadena');
    }
  } catch (error) {
    console.error('💥 Error en la prueba:', error.message);
  }
}

// Ejecutar todas las pruebas
async function runAllTests() {
  console.log('🚀 Iniciando pruebas del sistema de prompts\n');
  
  await testCreatePrompt();
  await testCreateGroup();
  await testCreateChain();
  
  console.log('\n🏁 Pruebas completadas');
}

// Ejecutar si se llama directamente
runAllTests().catch(console.error);

export {
  testCreatePrompt,
  testCreateGroup,
  testCreateChain,
  runAllTests
};