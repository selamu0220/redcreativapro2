'use client';

import React, { useState, useEffect } from 'react';

const ClearWeb3FormsPage = () => {
  const [output, setOutput] = useState<string>('');

  const log = (message: string) => {
    setOutput(prev => prev + message + '\n');
    console.log(message);
  };

  const clearOutput = () => {
    setOutput('');
  };

  const showCurrentStorage = () => {
    clearOutput();
    log('📋 Contenido actual del localStorage:');
    log('='.repeat(50));
    
    if (typeof window === 'undefined') {
      log('❌ No se puede acceder a localStorage en el servidor');
      return;
    }
    
    if (localStorage.length === 0) {
      log('❌ localStorage está vacío');
      return;
    }
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        log(`${key}: ${value}`);
      }
    }
    log('='.repeat(50));
    log(`Total de elementos: ${localStorage.length}`);
  };

  const clearWeb3Forms = () => {
    clearOutput();
    log('🧹 Iniciando limpieza de Web3Forms...');
    
    if (typeof window === 'undefined') {
      log('❌ No se puede acceder a localStorage en el servidor');
      return;
    }
    
    // Lista de posibles claves relacionadas con Web3Forms
    const web3formsKeys = [
      'web3forms_api_key',
      'web3forms_access_key',
      'web3forms_email',
      'web3forms_config',
      'web3forms_enabled',
      'web3forms_provider',
      'Web3Forms_config',
      'Web3Forms_key',
      'selectedEmailProvider',
      'email_provider'
    ];
    
    let removedCount = 0;
    
    // Eliminar claves específicas de Web3Forms
    web3formsKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        const value = localStorage.getItem(key);
        localStorage.removeItem(key);
        log(`🗑️ Eliminado: ${key} = ${value}`);
        removedCount++;
      }
    });
    
    // Verificar si el proveedor de email está configurado como web3forms
    const emailProvider = localStorage.getItem('selectedEmailProvider') || localStorage.getItem('email_provider');
    if (emailProvider === 'web3forms') {
      log('🚨 Proveedor de email configurado como web3forms - eliminando...');
      localStorage.removeItem('selectedEmailProvider');
      localStorage.removeItem('email_provider');
      log('✅ Proveedor web3forms eliminado');
      removedCount++;
    }
    
    // Buscar cualquier clave que contenga 'web3' (case insensitive)
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (key.toLowerCase().includes('web3')) {
        const value = localStorage.getItem(key);
        localStorage.removeItem(key);
        log(`🗑️ Eliminado (contiene web3): ${key} = ${value}`);
        removedCount++;
      }
    });
    
    if (removedCount === 0) {
      log('✅ No se encontraron configuraciones de Web3Forms para eliminar');
    } else {
      log(`✅ Limpieza completada. ${removedCount} elementos eliminados.`);
    }
    
    log('\n🔄 Ve a /correos-ia para verificar que el problema se haya resuelto.');
  };

  const clearAllStorage = () => {
    if (typeof window === 'undefined') return;
    
    if (confirm('⚠️ ¿Estás seguro de que quieres eliminar TODA la configuración del localStorage? Esto eliminará todas las configuraciones guardadas.')) {
      clearOutput();
      const itemCount = localStorage.length;
      localStorage.clear();
      log(`🗑️ localStorage completamente limpiado. ${itemCount} elementos eliminados.`);
      log('🔄 Recarga la aplicación para empezar con configuración limpia.');
    }
  };

  // Mostrar el contenido actual al cargar la página
  useEffect(() => {
    showCurrentStorage();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-zinc-800 p-8 rounded-lg shadow-xl">
          <h1 className="text-3xl font-bold mb-6 text-center">🧹 Limpiar Configuraciones de Web3Forms</h1>
          <p className="text-zinc-300 mb-8 text-center">
            Esta herramienta eliminará cualquier configuración de Web3Forms que pueda estar causando problemas en la aplicación.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button
              onClick={clearWeb3Forms}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              🗑️ Limpiar Web3Forms
            </button>
            <button
              onClick={showCurrentStorage}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              📋 Ver localStorage Actual
            </button>
            <button
              onClick={clearAllStorage}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              ⚠️ Limpiar TODO el localStorage
            </button>
          </div>
          
          <div className="bg-black p-4 rounded-lg font-mono text-green-400 whitespace-pre-wrap max-h-96 overflow-y-auto">
            {output || 'Esperando acción...'}
          </div>
          
          <div className="mt-6 text-center">
            <a 
              href="/correos-ia" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              🔄 Ir a Correos IA
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClearWeb3FormsPage;