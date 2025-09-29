import { getUserEmailProviderAsync, getUserByEmailAsync } from './app/lib/database.ts';

async function debugEmailConfig() {
  console.log('🔍 Iniciando diagnóstico de configuración de email...');
  
  // Obtener el email del usuario desde argumentos de línea de comandos
  const userEmail = process.argv[2];
  
  if (!userEmail) {
    console.log('❌ Por favor proporciona un email de usuario como argumento');
    console.log('Uso: node debug-email-config.js usuario@ejemplo.com');
    process.exit(1);
  }
  
  console.log(`📧 Verificando configuración para: ${userEmail}`);
  
  try {
    // 1. Verificar si el usuario existe
    console.log('\n1️⃣ Verificando si el usuario existe...');
    const user = await getUserByEmailAsync(userEmail);
    
    if (!user) {
      console.log('❌ Usuario no encontrado en la base de datos');
      return;
    }
    
    console.log('✅ Usuario encontrado');
    console.log('📊 Datos del usuario:', {
      email: user.email,
      subscriptionStatus: user.subscriptionStatus,
      emailProvider: user.emailProvider,
      hasEmailProviderConfig: !!user.emailProviderConfig,
      emailProviderConfigKeys: user.emailProviderConfig ? Object.keys(user.emailProviderConfig) : [],
      createdAt: user.createdAt,
      lastActiveAt: user.lastActiveAt
    });
    
    // 2. Verificar configuración del proveedor de email
    console.log('\n2️⃣ Verificando configuración del proveedor de email...');
    const emailProviderConfig = await getUserEmailProviderAsync(userEmail);
    
    console.log('📧 Configuración del proveedor:', {
      hasConfig: !!emailProviderConfig,
      provider: emailProviderConfig?.provider,
      configKeys: emailProviderConfig?.config ? Object.keys(emailProviderConfig.config) : [],
      configEmpty: !emailProviderConfig?.config || Object.keys(emailProviderConfig.config).length === 0
    });
    
    if (emailProviderConfig?.config) {
      console.log('🔧 Detalles de configuración:');
      
      // Mostrar configuración sin revelar credenciales sensibles
      const config = emailProviderConfig.config;
      const safeConfig = {};
      
      Object.keys(config).forEach(key => {
        if (key.includes('password') || key.includes('key') || key.includes('Key')) {
          safeConfig[key] = config[key] ? `***${config[key].slice(-4)}` : 'No configurado';
        } else {
          safeConfig[key] = config[key] || 'No configurado';
        }
      });
      
      console.log(safeConfig);
    }
    
    // 3. Simular la validación que hace el API de envío
    console.log('\n3️⃣ Simulando validación del API de envío...');
    
    if (!emailProviderConfig || !emailProviderConfig.config || Object.keys(emailProviderConfig.config).length === 0) {
      console.log('❌ PROBLEMA ENCONTRADO: No hay configuración válida');
      console.log('   Esto causaría el error: "No hay configuración de email"');
      
      // Sugerencias de solución
      console.log('\n💡 Posibles soluciones:');
      console.log('   1. Ir a Ajustes y configurar un proveedor de email');
      console.log('   2. Verificar que la configuración se esté guardando correctamente');
      console.log('   3. Revisar los logs del navegador para errores de JavaScript');
      
    } else {
      console.log('✅ Configuración válida encontrada');
      console.log(`   Proveedor: ${emailProviderConfig.provider}`);
      
      // Verificar campos requeridos según el proveedor
      const provider = emailProviderConfig.provider;
      const config = emailProviderConfig.config;
      
      let isValid = true;
      const missingFields = [];
      
      if (provider === 'gmail') {
        if (!config.gmailUser) missingFields.push('gmailUser');
        if (!config.gmailPassword) missingFields.push('gmailPassword');
      } else if (provider === 'web3forms') {
        if (!config.web3formsKey) missingFields.push('web3formsKey');
        if (!config.senderEmail) missingFields.push('senderEmail');
      } else if (provider === 'resend') {
        if (!config.resendApiKey) missingFields.push('resendApiKey');
        if (!config.resendFromEmail) missingFields.push('resendFromEmail');
      }
      
      if (missingFields.length > 0) {
        console.log(`❌ PROBLEMA: Faltan campos requeridos para ${provider}:`, missingFields);
        isValid = false;
      } else {
        console.log(`✅ Todos los campos requeridos para ${provider} están presentes`);
      }
      
      if (isValid) {
        console.log('\n🎉 La configuración parece estar correcta');
        console.log('   Si aún tienes problemas, revisa:');
        console.log('   - Los logs del servidor en la consola');
        console.log('   - Que las credenciales sean válidas');
        console.log('   - La conectividad de red');
      }
    }
    
  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error);
  }
}

// Ejecutar diagnóstico
debugEmailConfig().catch(console.error);