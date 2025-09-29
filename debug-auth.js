// Script de depuración para verificar el estado de autenticación
console.log('🔍 Iniciando depuración de autenticación...');

// Verificar si estamos en el navegador
if (typeof window !== 'undefined') {
  console.log('✅ Ejecutándose en el navegador');
  
  // Verificar localStorage
  console.log('📦 Verificando localStorage...');
  const keys = Object.keys(localStorage);
  console.log('🔑 Claves en localStorage:', keys);
  
  // Buscar claves relacionadas con Firebase
  const firebaseKeys = keys.filter(key => key.includes('firebase') || key.includes('auth'));
  console.log('🔥 Claves de Firebase encontradas:', firebaseKeys);
  
  firebaseKeys.forEach(key => {
    const value = localStorage.getItem(key);
    console.log(`📄 ${key}:`, value ? 'Presente' : 'Vacío');
  });
  
  // Verificar si Firebase está inicializado
  console.log('🔥 Verificando inicialización de Firebase...');
  
  // Intentar acceder a Firebase Auth
  setTimeout(async () => {
    try {
      // Importar Firebase dinámicamente
      const { getApps } = await import('firebase/app');
      const apps = getApps();
      console.log('📱 Apps de Firebase inicializadas:', apps.length);
      
      if (apps.length > 0) {
        console.log('✅ Firebase está inicializado');
        
        // Verificar Auth
        const { getAuth } = await import('firebase/auth');
        const auth = getAuth(apps[0]);
        console.log('🔐 Auth inicializado:', !!auth);
        console.log('👤 Usuario actual:', auth.currentUser ? 'Autenticado' : 'No autenticado');
        
        if (auth.currentUser) {
          console.log('📧 Email del usuario:', auth.currentUser.email);
          console.log('🆔 UID del usuario:', auth.currentUser.uid);
          
          // Intentar obtener token
          try {
            const token = await auth.currentUser.getIdToken();
            console.log('🎫 Token obtenido:', token ? 'Sí' : 'No');
            console.log('🎫 Longitud del token:', token ? token.length : 0);
          } catch (tokenError) {
            console.error('❌ Error obteniendo token:', tokenError);
          }
        }
      } else {
        console.log('❌ Firebase no está inicializado');
      }
    } catch (error) {
      console.error('❌ Error verificando Firebase:', error);
    }
  }, 1000);
  
} else {
  console.log('❌ No se está ejecutando en el navegador');
}

console.log('🔍 Script de depuración cargado. Revisa la consola en 1 segundo...');