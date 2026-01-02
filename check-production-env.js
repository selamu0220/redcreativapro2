#!/usr/bin/env node

/**
 * Script para verificar la configuración de producción
 * Identifica problemas comunes que causan páginas en blanco
 */

console.log('🔍 DIAGNÓSTICO DE PRODUCCIÓN - Red Creativa Pro\n')
console.log('=' .repeat(60))

// 1. Verificar variables de entorno críticas
console.log('\n📋 VARIABLES DE ENTORNO CRÍTICAS:\n')

const criticalEnvVars = [
  'KINDE_CLIENT_ID',
  'KINDE_CLIENT_SECRET',
  'KINDE_ISSUER_URL',
  'KINDE_SITE_URL',
  'KINDE_POST_LOGOUT_REDIRECT_URL',
  'KINDE_POST_LOGIN_REDIRECT_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
]

let hasErrors = false

criticalEnvVars.forEach(varName => {
  const value = process.env[varName]
  const status = value ? '✅' : '❌'
  console.log(`${status} ${varName}: ${value ? (varName.includes('SECRET') || varName.includes('KEY') ? '[OCULTO]' : value) : 'NO CONFIGURADO'}`)
  
  if (!value) {
    hasErrors = true
  }
  
  // Verificar si las URLs de Kinde apuntan a localhost
  if (varName.includes('KINDE') && varName.includes('URL') && value && value.includes('localhost')) {
    console.log(`   ⚠️  ADVERTENCIA: ${varName} apunta a localhost en lugar de producción`)
    hasErrors = true
  }
})

console.log('\n' + '=' .repeat(60))

// 2. Verificar configuración de Kinde
console.log('\n🔐 CONFIGURACIÓN DE KINDE:\n')

const kindeIssuer = process.env.KINDE_ISSUER_URL
const kindeSiteUrl = process.env.KINDE_SITE_URL
const kindePostLogin = process.env.KINDE_POST_LOGIN_REDIRECT_URL
const kindePostLogout = process.env.KINDE_POST_LOGOUT_REDIRECT_URL

if (kindeSiteUrl && kindeSiteUrl.includes('localhost')) {
  console.log('❌ KINDE_SITE_URL está configurado para localhost')
  console.log('   Debe ser: https://redcreativa.pro')
  hasErrors = true
} else if (kindeSiteUrl) {
  console.log(`✅ KINDE_SITE_URL: ${kindeSiteUrl}`)
}

if (kindePostLogin && kindePostLogin.includes('localhost')) {
  console.log('❌ KINDE_POST_LOGIN_REDIRECT_URL está configurado para localhost')
  console.log('   Debe ser: https://redcreativa.pro/dashboard')
  hasErrors = true
} else if (kindePostLogin) {
  console.log(`✅ KINDE_POST_LOGIN_REDIRECT_URL: ${kindePostLogin}`)
}

if (kindePostLogout && kindePostLogout.includes('localhost')) {
  console.log('❌ KINDE_POST_LOGOUT_REDIRECT_URL está configurado para localhost')
  console.log('   Debe ser: https://redcreativa.pro')
  hasErrors = true
} else if (kindePostLogout) {
  console.log(`✅ KINDE_POST_LOGOUT_REDIRECT_URL: ${kindePostLogout}`)
}

console.log('\n' + '=' .repeat(60))

// 3. Instrucciones de solución
if (hasErrors) {
  console.log('\n❌ SE ENCONTRARON PROBLEMAS\n')
  console.log('📝 SOLUCIÓN:\n')
  console.log('1. Ve a tu panel de Vercel: https://vercel.com/dashboard')
  console.log('2. Selecciona tu proyecto "redcreativapro"')
  console.log('3. Ve a Settings > Environment Variables')
  console.log('4. Actualiza las siguientes variables:\n')
  console.log('   KINDE_SITE_URL=https://redcreativa.pro')
  console.log('   KINDE_POST_LOGIN_REDIRECT_URL=https://redcreativa.pro/dashboard')
  console.log('   KINDE_POST_LOGOUT_REDIRECT_URL=https://redcreativa.pro')
  console.log('\n5. También actualiza en Kinde (https://selamu.kinde.com):')
  console.log('   - Ve a Settings > Applications')
  console.log('   - Selecciona tu aplicación')
  console.log('   - En "Allowed callback URLs" agrega:')
  console.log('     https://redcreativa.pro/api/auth/kinde_callback')
  console.log('   - En "Allowed logout redirect URLs" agrega:')
  console.log('     https://redcreativa.pro')
  console.log('\n6. Redeploy tu aplicación en Vercel')
  console.log('\n' + '=' .repeat(60))
} else {
  console.log('\n✅ CONFIGURACIÓN CORRECTA\n')
  console.log('Si la página sigue en blanco, revisa:')
  console.log('1. Los logs de Vercel para errores de runtime')
  console.log('2. La consola del navegador para errores de JavaScript')
  console.log('3. Que el build se haya completado correctamente')
}

console.log('\n')
