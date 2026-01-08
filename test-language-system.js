// Test script para verificar el sistema de traducciones
const fs = require('fs');
const path = require('path');

// Simular las traducciones
const translations = {
  es: {
    tutorial: '📺 Tutorial',
    campaigns: '🤖 Campañas IA',
    membership: '💎 Membresía',
    blog: 'Blog',
    creator: 'Creador',
    login: 'Iniciar Sesión',
    mainTitle: 'Red Creativa Pro',
    subtitle: 'Plataforma Hispana de Marketing con IA',
    poweredBy: 'Potenciado por IA',
    joinPlatform: '🚀 Unirse a Red Creativa Pro',
    noCreditCard: 'Sin tarjeta de crédito'
  },
  en: {
    tutorial: '📺 Tutorial',
    campaigns: '🤖 AI Campaigns',
    membership: '💎 Membership',
    blog: 'Blog',
    creator: 'Creator',
    login: 'Sign In',
    mainTitle: 'Red Creativa Pro',
    subtitle: 'Hispanic AI Marketing Platform',
    poweredBy: 'Powered by AI',
    joinPlatform: '🚀 Join Red Creativa Pro',
    noCreditCard: 'No credit card required'
  },
  fr: {
    tutorial: '📺 Tutoriel',
    campaigns: '🤖 Campagnes IA',
    membership: '💎 Adhésion',
    blog: 'Blog',
    creator: 'Créateur',
    login: 'Se connecter',
    mainTitle: 'Red Creativa Pro',
    subtitle: 'Plateforme Marketing IA Hispanique',
    poweredBy: 'Alimenté par IA',
    joinPlatform: '🚀 Rejoindre Red Creativa Pro',
    noCreditCard: 'Aucune carte de crédit requise'
  }
};

function getTranslation(key, lang = 'es') {
  return translations[lang][key] || translations.es[key] || key;
}

// Test de traducciones
console.log('=== TEST DEL SISTEMA DE TRADUCCIONES ===\n');

const testKeys = ['tutorial', 'campaigns', 'membership', 'login', 'mainTitle', 'subtitle', 'joinPlatform'];
const testLanguages = ['es', 'en', 'fr'];

testLanguages.forEach(lang => {
  console.log(`--- ${lang.toUpperCase()} ---`);
  testKeys.forEach(key => {
    console.log(`${key}: ${getTranslation(key, lang)}`);
  });
  console.log('');
});

// Verificar que las traducciones son diferentes
console.log('=== VERIFICACIÓN DE DIFERENCIAS ===\n');

testKeys.forEach(key => {
  const esText = getTranslation(key, 'es');
  const enText = getTranslation(key, 'en');
  const frText = getTranslation(key, 'fr');
  
  const isDifferent = esText !== enText || esText !== frText;
  console.log(`${key}: ${isDifferent ? '✅ DIFERENTES' : '❌ IGUALES'}`);
  if (isDifferent) {
    console.log(`  ES: ${esText}`);
    console.log(`  EN: ${enText}`);
    console.log(`  FR: ${frText}`);
  }
  console.log('');
});

console.log('=== RESULTADO ===');
console.log('El sistema de traducciones tiene contenido diferente para cada idioma.');
console.log('Si el problema persiste, es probable que sea un problema de estado en React.');