// Herramienta de debugging completa para configuración de email
export class EmailDebugger {
  private static logs: Array<{
    timestamp: string;
    level: 'info' | 'warn' | 'error' | 'debug';
    source: string;
    message: string;
    data?: any;
  }> = [];

  static log(level: 'info' | 'warn' | 'error' | 'debug', source: string, message: string, data?: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      source,
      message,
      data: data ? JSON.parse(JSON.stringify(data)) : undefined
    };
    
    this.logs.push(logEntry);
    
    // También log a consola con colores
    const emoji = {
      info: '📋',
      warn: '⚠️',
      error: '❌',
      debug: '🔍'
    }[level];
    
    console.log(`${emoji} [${source}] ${message}`, data || '');
    
    // Mantener solo los últimos 100 logs
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100);
    }
  }

  static getLogs() {
    return [...this.logs];
  }

  static clearLogs() {
    this.logs = [];
  }

  static exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }

  // Función para analizar el estado actual de la configuración
  static analyzeCurrentState() {
    this.log('debug', 'EmailDebugger', '🔍 Analizando estado actual de configuración');
    
    // Verificar localStorage
    const localStorageState = {
      selectedProvider: localStorage.getItem('selectedEmailProvider'),
      gmailUser: localStorage.getItem('gmailUser'),
      gmailPassword: localStorage.getItem('gmailPassword') ? '[PRESENTE]' : null,
      web3formsKey: localStorage.getItem('web3forms_key') ? '[PRESENTE]' : null,
      web3formsSender: localStorage.getItem('sender_email'),
      resendKey: localStorage.getItem('resendKey') ? '[PRESENTE]' : null,
      resendSender: localStorage.getItem('resendSender'),
      emailConfigSynced: localStorage.getItem('emailConfigSynced'),
      emailConfigSyncedAt: localStorage.getItem('emailConfigSyncedAt')
    };
    
    this.log('info', 'EmailDebugger', 'Estado localStorage:', localStorageState);
    
    // Verificar validez de configuración por proveedor
    const validationResults = {
      gmail: !!(localStorageState.gmailUser && localStorage.getItem('gmailPassword')),
      web3forms: !!(localStorage.getItem('web3forms_key') && localStorageState.web3formsSender),
      resend: !!(localStorage.getItem('resendKey') && localStorageState.resendSender)
    };
    
    this.log('info', 'EmailDebugger', 'Validación por proveedor:', validationResults);
    
    // Verificar si la configuración actual es válida
    const currentProvider = localStorageState.selectedProvider;
    const isCurrentConfigValid = currentProvider ? validationResults[currentProvider as keyof typeof validationResults] : false;
    
    this.log('info', 'EmailDebugger', `Configuración actual (${currentProvider}) es válida:`, isCurrentConfigValid);
    
    return {
      localStorage: localStorageState,
      validation: validationResults,
      currentProvider,
      isCurrentConfigValid
    };
  }

  // Función para probar la configuración actual
  static async testCurrentConfig(userEmail: string) {
    this.log('debug', 'EmailDebugger', '🧪 Probando configuración actual');
    
    const state = this.analyzeCurrentState();
    
    if (!state.isCurrentConfigValid) {
      this.log('error', 'EmailDebugger', 'Configuración actual no es válida');
      return { success: false, error: 'Configuración no válida' };
    }
    
    try {
      // Probar sincronización a BD
      this.log('debug', 'EmailDebugger', 'Probando sincronización a BD...');
      
      const syncResponse = await fetch('/api/user/email-provider', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail,
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        body: JSON.stringify(this.buildConfigFromLocalStorage())
      });
      
      if (!syncResponse.ok) {
        const error = await syncResponse.text();
        this.log('error', 'EmailDebugger', 'Error en sincronización:', error);
        return { success: false, error: `Error sincronización: ${error}` };
      }
      
      this.log('info', 'EmailDebugger', '✅ Sincronización exitosa');
      
      // Probar lectura desde BD
      this.log('debug', 'EmailDebugger', 'Probando lectura desde BD...');
      
      const readResponse = await fetch('/api/user/email-provider', {
        method: 'GET',
        headers: {
          'x-user-email': userEmail,
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        }
      });
      
      if (!readResponse.ok) {
        const error = await readResponse.text();
        this.log('error', 'EmailDebugger', 'Error en lectura:', error);
        return { success: false, error: `Error lectura: ${error}` };
      }
      
      const dbConfig = await readResponse.json();
      this.log('info', 'EmailDebugger', 'Configuración en BD:', dbConfig);
      
      // Probar envío de email de prueba
      this.log('debug', 'EmailDebugger', 'Probando envío de email...');
      
      const testEmailResponse = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail,
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        body: JSON.stringify({
          to: userEmail,
          subject: 'Test de configuración - EmailDebugger',
          text: 'Este es un email de prueba para verificar que la configuración funciona correctamente.'
        })
      });
      
      if (!testEmailResponse.ok) {
        const error = await testEmailResponse.text();
        this.log('error', 'EmailDebugger', 'Error en envío:', error);
        return { success: false, error: `Error envío: ${error}` };
      }
      
      this.log('info', 'EmailDebugger', '✅ Email de prueba enviado exitosamente');
      
      return { success: true, message: 'Todas las pruebas pasaron exitosamente' };
      
    } catch (error) {
      this.log('error', 'EmailDebugger', 'Error en test:', error);
      return { success: false, error: `Error inesperado: ${error}` };
    }
  }

  // Función para construir configuración desde localStorage
  private static buildConfigFromLocalStorage() {
    const selectedProvider = localStorage.getItem('selectedEmailProvider');
    
    switch (selectedProvider) {
      case 'gmail':
        return {
          provider: 'gmail' as const,
          config: {
            gmailUser: localStorage.getItem('gmailUser'),
            gmailPassword: localStorage.getItem('gmailPassword')
          }
        };
      case 'web3forms':
        return {
          provider: 'web3forms' as const,
          config: {
            web3formsKey: localStorage.getItem('web3forms_key'),
          senderEmail: localStorage.getItem('sender_email')
          }
        };
      case 'resend':
        return {
          provider: 'resend' as const,
          config: {
            resendApiKey: localStorage.getItem('resendKey'),
            resendFromEmail: localStorage.getItem('resendSender')
          }
        };
      default:
        return null;
    }
  }

  // Función para generar reporte completo
  static generateReport(userEmail?: string) {
    this.log('debug', 'EmailDebugger', '📊 Generando reporte completo');
    
    const state = this.analyzeCurrentState();
    const logs = this.getLogs();
    
    const report = {
      timestamp: new Date().toISOString(),
      userEmail,
      currentState: state,
      recentLogs: logs.slice(-20), // Últimos 20 logs
      recommendations: this.generateRecommendations(state)
    };
    
    this.log('info', 'EmailDebugger', 'Reporte generado:', report);
    
    return report;
  }

  // Función para generar recomendaciones
  private static generateRecommendations(state: any) {
    const recommendations = [];
    
    if (!state.currentProvider) {
      recommendations.push('❌ No hay proveedor seleccionado. Ve a Ajustes y selecciona un proveedor.');
    } else if (!state.isCurrentConfigValid) {
      recommendations.push(`❌ La configuración de ${state.currentProvider} está incompleta. Verifica los campos requeridos.`);
    }
    
    if (!state.localStorage.emailConfigSynced) {
      recommendations.push('⚠️ La configuración no está sincronizada con la base de datos.');
    }
    
    if (state.localStorage.emailConfigSyncedAt) {
      const lastSync = new Date(state.localStorage.emailConfigSyncedAt);
      const now = new Date();
      const minutesSinceSync = (now.getTime() - lastSync.getTime()) / (1000 * 60);
      
      if (minutesSinceSync > 10) {
        recommendations.push(`⚠️ La última sincronización fue hace ${Math.round(minutesSinceSync)} minutos. Considera refrescar.`);
      }
    }
    
    if (recommendations.length === 0) {
      recommendations.push('✅ La configuración parece estar correcta.');
    }
    
    return recommendations;
  }
}

// Función global para debugging rápido (solo en el cliente)
if (typeof window !== 'undefined') {
  (window as any).emailDebug = {
    analyze: () => EmailDebugger.analyzeCurrentState(),
    test: (userEmail: string) => EmailDebugger.testCurrentConfig(userEmail),
    report: (userEmail?: string) => EmailDebugger.generateReport(userEmail),
    logs: () => EmailDebugger.getLogs(),
    clear: () => EmailDebugger.clearLogs(),
    export: () => EmailDebugger.exportLogs()
  };
}

export default EmailDebugger;