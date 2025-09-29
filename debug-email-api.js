// Script para debuggear el API de email directamente
import { kv } from '@vercel/kv';

async function debugEmailAPI() {
  console.log('🔍 === DEBUGGING EMAIL API ===');
  
  try {
    // 1. Verificar configuración en KV store
    console.log('\n📦 Verificando KV store...');
    const kvConfig = await kv.get('email-config');
    console.log('KV Config:', kvConfig);
    
    // 2. Simular headers que enviaría el frontend
    const testHeaders = {
      'x-selected-provider': 'web3forms',
      'x-web3forms-key': 'test-key',
      'x-web3forms-sender': 'test@example.com'
    };
    
    console.log('\n🔑 Headers de prueba:', testHeaders);
    
    // 3. Simular la lógica del API
    console.log('\n⚙️ Simulando lógica del API...');
    
    // Intentar cargar configuración actual
    let config = kvConfig || {};
    console.log('Config inicial:', config);
    
    // Verificar si la configuración es válida
    const selectedProvider = config.selectedProvider || testHeaders['x-selected-provider'];
    console.log('Selected provider:', selectedProvider);
    
    if (!selectedProvider) {
      console.error('❌ No hay proveedor seleccionado');
      return;
    }
    
    // Verificar configuración específica del proveedor
    let providerConfig = config[selectedProvider];
    console.log(`Config para ${selectedProvider}:`, providerConfig);
    
    // Si no hay configuración, intentar desde headers
    if (!providerConfig || Object.keys(providerConfig).length === 0) {
      console.log('⚠️ Configuración vacía, intentando desde headers...');
      
      if (selectedProvider === 'web3forms') {
        providerConfig = {
          accessKey: testHeaders['x-web3forms-key'],
          senderEmail: testHeaders['x-web3forms-sender']
        };
      }
      
      console.log('Config desde headers:', providerConfig);
    }
    
    // Validar configuración final
    if (!providerConfig || !providerConfig.accessKey) {
      console.error('❌ Configuración inválida:', providerConfig);
      console.error('❌ Error: No hay configuración de email válida');
      return;
    }
    
    console.log('✅ Configuración válida encontrada:', providerConfig);
    
  } catch (error) {
    console.error('💥 Error en debug:', error);
  }
}

// Ejecutar debug
debugEmailAPI().catch(console.error);

export { debugEmailAPI };