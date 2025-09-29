#!/usr/bin/env node

/**
 * Script de Diagnóstico para Problemas de Envío de Email
 * Identifica automáticamente problemas de configuración comunes
 */

const fs = require('fs');
const path = require('path');

class EmailDiagnostic {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.suggestions = [];
  }

  // Verificar archivos de configuración
  checkConfigFiles() {
    console.log('🔍 Verificando archivos de configuración...');
    
    const envFiles = ['.env', '.env.local', '.env.example'];
    const existingFiles = [];
    
    envFiles.forEach(file => {
      if (fs.existsSync(file)) {
        existingFiles.push(file);
        console.log(`✅ Encontrado: ${file}`);
      } else {
        console.log(`❌ No encontrado: ${file}`);
      }
    });
    
    if (existingFiles.length === 0) {
      this.issues.push('No se encontraron archivos de configuración de entorno');
    }
    
    return existingFiles;
  }

  // Verificar variables de entorno
  checkEnvironmentVariables() {
    console.log('\n🔍 Verificando variables de entorno...');
    
    const requiredVars = {
      'WEB3FORMS_ACCESS_KEY': 'Web3Forms (Recomendado - más fácil)',
      'RESEND_API_KEY': 'Resend (Alternativa)',
      'GMAIL_USER': 'Gmail SMTP',
      'GMAIL_APP_PASSWORD': 'Gmail SMTP'
    };
    
    const envContent = this.readEnvFiles();
    const configuredProviders = [];
    
    Object.entries(requiredVars).forEach(([varName, description]) => {
      const value = envContent[varName] || process.env[varName];
      
      if (value && value !== 'your_key_here' && value !== 'tu-email@gmail.com' && value !== 'xxxx-xxxx-xxxx-xxxx') {
        console.log(`✅ ${varName}: Configurado (${description})`);
        if (varName.includes('WEB3FORMS')) configuredProviders.push('web3forms');
        if (varName.includes('RESEND')) configuredProviders.push('resend');
        if (varName.includes('GMAIL')) configuredProviders.push('gmail');
      } else {
        console.log(`❌ ${varName}: No configurado o valor por defecto (${description})`);
      }
    });
    
    if (configuredProviders.length === 0) {
      this.issues.push('No hay ningún proveedor de email configurado correctamente');
      this.suggestions.push('Configura al menos un proveedor de email (Web3Forms es el más fácil)');
    }
    
    return configuredProviders;
  }

  // Leer archivos de entorno
  readEnvFiles() {
    const envVars = {};
    const files = ['.env', '.env.local'];
    
    files.forEach(file => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        
        lines.forEach(line => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valueParts] = trimmed.split('=');
            if (key && valueParts.length > 0) {
              envVars[key.trim()] = valueParts.join('=').trim();
            }
          }
        });
      }
    });
    
    return envVars;
  }

  // Verificar configuración de Web3Forms
  checkWeb3FormsConfig() {
    console.log('\n🔍 Verificando configuración específica de Web3Forms...');
    
    const envVars = this.readEnvFiles();
    const web3formsKey = envVars.WEB3FORMS_ACCESS_KEY || process.env.WEB3FORMS_ACCESS_KEY;
    
    if (!web3formsKey || web3formsKey === 'your_web3forms_access_key_here') {
      this.issues.push('Web3Forms Access Key no está configurado');
      this.suggestions.push('1. Ve a https://web3forms.com/');
      this.suggestions.push('2. Crea una cuenta gratuita');
      this.suggestions.push('3. Obtén tu Access Key');
      this.suggestions.push('4. Agrégala a tu archivo .env.local como WEB3FORMS_ACCESS_KEY=tu_key_aqui');
    } else {
      console.log('✅ Web3Forms Access Key configurado');
      
      // Verificar formato del key
      if (web3formsKey.length < 30) {
        this.warnings.push('El Web3Forms Access Key parece ser muy corto, verifica que sea correcto');
      }
    }
  }

  // Verificar archivos de la aplicación
  checkApplicationFiles() {
    console.log('\n🔍 Verificando archivos de la aplicación...');
    
    const criticalFiles = [
      'app/api/send-email/route.ts',
      'app/ajustes/page.tsx',
      'app/correos-ia/page.tsx'
    ];
    
    criticalFiles.forEach(file => {
      if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
      } else {
        console.log(`❌ ${file}`);
        this.issues.push(`Archivo crítico faltante: ${file}`);
      }
    });
  }

  // Generar reporte
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 REPORTE DE DIAGNÓSTICO DE EMAIL');
    console.log('='.repeat(60));
    
    if (this.issues.length > 0) {
      console.log('\n❌ PROBLEMAS ENCONTRADOS:');
      this.issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  ADVERTENCIAS:');
      this.warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning}`);
      });
    }
    
    if (this.suggestions.length > 0) {
      console.log('\n💡 SUGERENCIAS PARA SOLUCIONAR:');
      this.suggestions.forEach((suggestion, index) => {
        console.log(`   ${index + 1}. ${suggestion}`);
      });
    }
    
    if (this.issues.length === 0 && this.warnings.length === 0) {
      console.log('\n✅ ¡Todo parece estar configurado correctamente!');
      console.log('   Si aún tienes problemas, verifica:');
      console.log('   - Que el servidor esté ejecutándose (npm run dev)');
      console.log('   - Que no haya errores en la consola del navegador');
      console.log('   - Que los datos del formulario estén completos');
    }
    
    console.log('\n' + '='.repeat(60));
  }

  // Ejecutar diagnóstico completo
  run() {
    console.log('🚀 Iniciando diagnóstico de configuración de email...\n');
    
    this.checkConfigFiles();
    const providers = this.checkEnvironmentVariables();
    this.checkWeb3FormsConfig();
    this.checkApplicationFiles();
    
    this.generateReport();
    
    // Instrucciones específicas según el estado
    if (this.issues.length > 0) {
      console.log('\n🔧 PASOS RECOMENDADOS:');
      console.log('1. Configura Web3Forms (es la opción más fácil):');
      console.log('   - Ve a https://web3forms.com y crea una cuenta');
      console.log('   - Obtén tu Access Key');
      console.log('   - Agrégala a .env.local: WEB3FORMS_ACCESS_KEY=tu_key');
      console.log('2. Reinicia el servidor: npm run dev');
      console.log('3. Ve a http://localhost:3000/ajustes para configurar');
      console.log('4. Prueba el envío de email desde la aplicación');
    }
  }
}

// Ejecutar diagnóstico
if (require.main === module) {
  const diagnostic = new EmailDiagnostic();
  diagnostic.run();
}

module.exports = EmailDiagnostic;