// Script para registrar usuarios manualmente en la base de datos local
// Uso: node register-user.js email@ejemplo.com

const fs = require('fs');
const path = require('path');

const usersFile = path.join(__dirname, 'data', 'users.json');

function ensureUsersFile() {
  const dir = path.dirname(usersFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify([], null, 2));
  }
}

function registerUser(email, subscriptionStatus = 'free') {
  try {
    ensureUsersFile();
    
    let users = [];
    try {
      const data = fs.readFileSync(usersFile, 'utf8');
      users = JSON.parse(data);
    } catch (error) {
      console.log('⚠️ Creando archivo de usuarios nuevo');
    }

    // Verificar si el usuario ya existe
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      console.log(`ℹ️ El usuario ${email} ya existe`);
      return existingUser;
    }

    // Crear nuevo usuario
    const newUser = {
      id: Date.now().toString(),
      email: email,
      subscriptionStatus: subscriptionStatus,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      aiStudioApiKey: null,
      apiKey: null
    };

    users.push(newUser);
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    
    console.log(`✅ Usuario registrado exitosamente: ${email}`);
    return newUser;
  } catch (error) {
    console.error('❌ Error al registrar usuario:', error);
    return null;
  }
}

// Si se ejecuta desde línea de comandos
if (require.main === module) {
  const email = process.argv[2];
  if (!email) {
    console.log('Uso: node register-user.js email@ejemplo.com');
    process.exit(1);
  }
  
  registerUser(email);
}

module.exports = { registerUser };