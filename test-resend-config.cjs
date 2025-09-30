// Test script to verify Resend configuration save/retrieve functionality
const { kv } = require('@vercel/kv');

// Simulate the hybrid storage system
const hasKV = !!process.env.KV_URL || !!process.env.KV_REST_API_URL;
const memoryStorage = new Map();

async function kvGet(key, fallback) {
  try {
    if (hasKV) {
      const value = await kv.get(key);
      return value ?? fallback();
    } else {
      const value = memoryStorage.get(key);
      return value ?? fallback();
    }
  } catch {
    return fallback();
  }
}

async function kvSet(key, value, ttlSeconds) {
  try {
    if (hasKV) {
      await kv.set(key, value, ttlSeconds ? { ex: ttlSeconds } : undefined);
    } else {
      memoryStorage.set(key, value);
    }
  } catch (error) {
    console.error(`Error setting ${key}:`, error);
  }
}

async function getUsersAsync() {
  return kvGet('users', () => []);
}

async function saveUsersAsync(users) {
  await kvSet('users', users);
}

async function getUserByEmailAsync(email) {
  const users = await getUsersAsync();
  const target = (email || '').toLowerCase();
  return users.find(user => (user.email || '').toLowerCase() === target) || null;
}

async function updateUserEmailProviderAsync(email, providerConfig) {
  try {
    console.log(`🔄 updateUserEmailProviderAsync: Actualizando configuración para ${email}`);
    console.log(`📝 Configuración recibida:`, {
      provider: providerConfig.provider,
      config: providerConfig.config,
      configKeys: Object.keys(providerConfig.config || {}),
      configValues: providerConfig.config
    });
    
    const users = await getUsersAsync();
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) {
      // Create new user if doesn't exist
      const newUser = {
        email,
        subscriptionStatus: 'free',
        emailProvider: providerConfig.provider,
        emailProviderConfig: providerConfig.config,
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString()
      };
      users.push(newUser);
      console.log('✅ New user created with email provider configuration:', email);
      console.log('👤 Nuevo usuario creado:', {
        email: newUser.email,
        emailProvider: newUser.emailProvider,
        emailProviderConfig: newUser.emailProviderConfig
      });
    } else {
      // Update existing user with email provider configuration
      const oldConfig = {
        emailProvider: users[userIndex].emailProvider,
        emailProviderConfig: users[userIndex].emailProviderConfig
      };
      
      users[userIndex] = {
        ...users[userIndex],
        emailProvider: providerConfig.provider,
        emailProviderConfig: providerConfig.config,
        lastActiveAt: new Date().toISOString()
      };
      
      console.log('✅ Email provider configuration updated for existing user:', email);
      console.log('🔄 Configuración anterior:', oldConfig);
      console.log('🆕 Configuración nueva:', {
        emailProvider: users[userIndex].emailProvider,
        emailProviderConfig: users[userIndex].emailProviderConfig
      });
    }

    await saveUsersAsync(users);
    console.log('💾 Configuración guardada exitosamente');
    return true;
  } catch (error) {
    console.error('Error updating email provider configuration:', error);
    return false;
  }
}

async function getUserEmailProviderAsync(email) {
  try {
    console.log(`🔍 getUserEmailProviderAsync: Buscando configuración para ${email}`);
    
    const user = await getUserByEmailAsync(email);
    console.log(`👤 Usuario encontrado:`, {
      exists: !!user,
      email: user?.email,
      hasEmailProvider: !!user?.emailProvider,
      emailProvider: user?.emailProvider,
      hasEmailProviderConfig: !!user?.emailProviderConfig,
      emailProviderConfig: user?.emailProviderConfig
    });
    
    if (!user) {
      console.log(`❌ No se encontró usuario para ${email}`);
      return null;
    }

    const result = {
      provider: user.emailProvider || 'gmail',
      config: user.emailProviderConfig || {}
    };
    
    console.log(`✅ Configuración devuelta:`, result);
    return result;
  } catch (error) {
    console.error('Error getting email provider configuration:', error);
    return null;
  }
}

// Test the functionality
(async () => {
  console.log('🧪 Testing Resend configuration save/retrieve...');
  console.log('🔧 Storage system:', hasKV ? 'Vercel KV' : 'In-memory');
  
  const email = 'selamu.garcia@gmail.com';
  const config = {
    provider: 'resend',
    config: {
      resendApiKey: 'test-key-123',
      resendFromEmail: 'test@example.com'
    }
  };
  
  console.log('\n1. Saving config...');
  const saved = await updateUserEmailProviderAsync(email, config);
  console.log('✅ Saved:', saved);
  
  console.log('\n2. Retrieving config immediately...');
  const retrieved = await getUserEmailProviderAsync(email);
  console.log('📋 Retrieved:', retrieved);
  
  console.log('\n3. Checking if config matches...');
  const matches = retrieved && 
    retrieved.provider === config.provider &&
    retrieved.config.resendApiKey === config.config.resendApiKey &&
    retrieved.config.resendFromEmail === config.config.resendFromEmail;
  
  console.log('🎯 Configuration matches:', matches);
  
  if (!matches) {
    console.log('❌ PROBLEM IDENTIFIED: Configuration not persisting correctly');
    console.log('Expected:', config);
    console.log('Got:', retrieved);
  } else {
    console.log('✅ SUCCESS: Configuration is working correctly');
  }
})().catch(console.error);