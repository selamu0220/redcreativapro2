'use client';

import { EmailDebugger } from './emailDebugger';
import { RealTimeSyncMonitor } from './realTimeSync';

// Interfaz para resultados de pruebas
interface TestResult {
  testName: string;
  success: boolean;
  message: string;
  details?: any;
  timestamp: string;
}

// Interfaz para configuración de email
interface EmailConfig {
  provider: string;
  config: {
    gmailUser?: string;
    gmailPassword?: string;
    web3formsKey?: string;
    senderEmail?: string;
    resendApiKey?: string;
    resendFromEmail?: string;
  };
}

// Clase para testing exhaustivo del flujo de email
export class EmailFlowTester {
  private static instance: EmailFlowTester;
  private testResults: TestResult[] = [];

  static getInstance(): EmailFlowTester {
    if (!EmailFlowTester.instance) {
      EmailFlowTester.instance = new EmailFlowTester();
    }
    return EmailFlowTester.instance;
  }

  // Ejecutar suite completa de pruebas
  async runCompleteTestSuite(): Promise<TestResult[]> {
    this.testResults = [];
    EmailDebugger.log('info', 'FLOW_TESTER', '🧪 Iniciando suite completa de pruebas de flujo de email');

    try {
      // 1. Pruebas de localStorage
      await this.testLocalStorageOperations();
      
      // 2. Pruebas de API de configuración
      await this.testEmailConfigAPI();
      
      // 3. Pruebas de sincronización
      await this.testSynchronization();
      
      // 4. Pruebas de API de envío
      await this.testEmailSendingAPI();
      
      // 5. Pruebas de persistencia
      await this.testPersistence();
      
      // 6. Pruebas de escenarios de error
      await this.testErrorScenarios();

      EmailDebugger.log('info', 'FLOW_TESTER', '✅ Suite de pruebas completada', {
        totalTests: this.testResults.length,
        passed: this.testResults.filter(r => r.success).length,
        failed: this.testResults.filter(r => !r.success).length
      });

    } catch (error) {
      EmailDebugger.log('error', 'FLOW_TESTER', 'Error durante suite de pruebas', { error });
    }

    return this.testResults;
  }

  // Pruebas de localStorage
  async testLocalStorageOperations(): Promise<void> {
    EmailDebugger.log('info', 'FLOW_TESTER', '📱 Iniciando pruebas de localStorage');

    // Test 1: Escribir configuración Gmail
    try {
      localStorage.setItem('emailProvider', 'gmail');
      localStorage.setItem('gmailUser', 'test@gmail.com');
      localStorage.setItem('gmailPassword', 'testpassword');
      
      const provider = localStorage.getItem('emailProvider');
      const user = localStorage.getItem('gmailUser');
      const password = localStorage.getItem('gmailPassword');
      
      this.addTestResult('localStorage_write_gmail', 
        provider === 'gmail' && user === 'test@gmail.com' && password === 'testpassword',
        'Escritura de configuración Gmail en localStorage',
        { provider, user, hasPassword: !!password }
      );
    } catch (error) {
      this.addTestResult('localStorage_write_gmail', false, 'Error al escribir Gmail en localStorage', { error });
    }

    // Test 2: Leer configuración
    try {
      const config = this.readLocalStorageConfig();
      this.addTestResult('localStorage_read', 
        !!config && config.provider === 'gmail',
        'Lectura de configuración desde localStorage',
        config
      );
    } catch (error) {
      this.addTestResult('localStorage_read', false, 'Error al leer localStorage', { error });
    }

    // Test 3: Limpiar configuración
    try {
      this.clearLocalStorageConfig();
      const config = this.readLocalStorageConfig();
      this.addTestResult('localStorage_clear', 
        !config,
        'Limpieza de configuración en localStorage',
        { configAfterClear: config }
      );
    } catch (error) {
      this.addTestResult('localStorage_clear', false, 'Error al limpiar localStorage', { error });
    }
  }

  // Pruebas de API de configuración
  async testEmailConfigAPI(): Promise<void> {
    EmailDebugger.log('info', 'FLOW_TESTER', '🔌 Iniciando pruebas de API de configuración');

    // Test 1: GET configuración (sin configuración)
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        this.addTestResult('api_get_empty', false, 'No hay userEmail para pruebas', { error: 'userEmail requerido' });
        return;
      }

      const response = await fetch('/api/user/email-provider', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-email': userEmail,
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        }
      });
      
      this.addTestResult('api_get_empty', 
        response.status === 404 || (response.ok && !await response.clone().json().then(d => d.provider)),
        'GET configuración cuando no existe',
        { status: response.status, ok: response.ok }
      );
    } catch (error) {
      this.addTestResult('api_get_empty', false, 'Error en GET configuración vacía', { error });
    }

    // Test 2: POST configuración
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        this.addTestResult('api_post_config', false, 'No hay userEmail para pruebas', { error: 'userEmail requerido' });
        return;
      }

      const testConfig = {
        provider: 'web3forms',
        web3formsKey: 'test-key-123',
        senderEmail: 'test@example.com'
      };
      
      const response = await fetch('/api/user/email-provider', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-email': userEmail,
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        body: JSON.stringify(testConfig)
      });
      
      this.addTestResult('api_post_config', 
        response.ok,
        'POST configuración nueva',
        { status: response.status, ok: response.ok }
      );
    } catch (error) {
      this.addTestResult('api_post_config', false, 'Error en POST configuración', { error });
    }

    // Test 3: GET configuración (con configuración)
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        this.addTestResult('api_get_existing', false, 'No hay userEmail para pruebas', { error: 'userEmail requerido' });
        return;
      }

      const response = await fetch('/api/user/email-provider', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-email': userEmail,
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        this.addTestResult('api_get_existing', 
          !!data.provider && data.provider === 'web3forms',
          'GET configuración existente',
          { config: data }
        );
      } else {
        this.addTestResult('api_get_existing', false, 'Error al obtener configuración existente', { status: response.status });
      }
    } catch (error) {
      this.addTestResult('api_get_existing', false, 'Error en GET configuración existente', { error });
    }
  }

  // Pruebas de sincronización
  async testSynchronization(): Promise<void> {
    EmailDebugger.log('info', 'FLOW_TESTER', '🔄 Iniciando pruebas de sincronización');

    // Test 1: Sincronización localStorage -> BD
    try {
      // Configurar localStorage
      localStorage.setItem('emailProvider', 'web3forms');
      localStorage.setItem('web3forms_key', 'test-key');
      localStorage.setItem('senderEmail', 'test@example.com');
      
      // Forzar sincronización
      const syncMonitor = RealTimeSyncMonitor.getInstance();
      const syncResult = await syncMonitor.forceSyncFromLocalStorage();
      
      this.addTestResult('sync_localStorage_to_db', 
        syncResult,
        'Sincronización localStorage -> BD',
        { syncResult }
      );
    } catch (error) {
      this.addTestResult('sync_localStorage_to_db', false, 'Error en sincronización localStorage -> BD', { error });
    }

    // Test 2: Verificar sincronización
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
      
      const syncMonitor = RealTimeSyncMonitor.getInstance();
      const status = await syncMonitor.getStatusReport();
      
      this.addTestResult('sync_verification', 
        status.isInSync,
        'Verificación de sincronización',
        status
      );
    } catch (error) {
      this.addTestResult('sync_verification', false, 'Error en verificación de sincronización', { error });
    }
  }

  // Pruebas de API de envío
  async testEmailSendingAPI(): Promise<void> {
    EmailDebugger.log('info', 'FLOW_TESTER', '📧 Iniciando pruebas de API de envío');

    // Test 1: Envío con configuración válida
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-web3forms-key': 'test-key',
          'x-web3forms-sender': 'test@example.com',
          'x-selected-provider': 'web3forms',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        body: JSON.stringify({
          to: 'recipient@example.com',
          subject: 'Test Email',
          message: 'This is a test email from flow tester'
        })
      });
      
      this.addTestResult('api_send_email', 
        response.status !== 500, // No debe ser error interno
        'Envío de email con configuración válida',
        { status: response.status, ok: response.ok }
      );
    } catch (error) {
      this.addTestResult('api_send_email', false, 'Error en API de envío', { error });
    }

    // Test 2: Envío sin configuración
    try {
      this.clearLocalStorageConfig();
      
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        body: JSON.stringify({
          to: 'recipient@example.com',
          subject: 'Test Email',
          message: 'This should fail'
        })
      });
      
      const data = await response.json();
      
      this.addTestResult('api_send_no_config', 
        !response.ok && data.error && data.error.includes('configuración'),
        'Envío sin configuración (debe fallar)',
        { status: response.status, error: data.error }
      );
    } catch (error) {
      this.addTestResult('api_send_no_config', false, 'Error en prueba sin configuración', { error });
    }
  }

  // Pruebas de persistencia
  async testPersistence(): Promise<void> {
    EmailDebugger.log('info', 'FLOW_TESTER', '💾 Iniciando pruebas de persistencia');

    // Test 1: Persistencia después de limpiar localStorage
    try {
      // Configurar y sincronizar
      localStorage.setItem('emailProvider', 'resend');
      localStorage.setItem('resendApiKey', 'test-api-key');
      localStorage.setItem('resendFromEmail', 'test@resend.com');
      
      const syncMonitor = RealTimeSyncMonitor.getInstance();
      await syncMonitor.forceSyncFromLocalStorage();
      
      // Limpiar localStorage
      this.clearLocalStorageConfig();
      
      // Verificar que la configuración persiste en BD
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        this.addTestResult('persistence_after_clear', false, 'No hay userEmail para pruebas', { error: 'userEmail requerido' });
        return;
      }

      const response = await fetch('/api/user/email-provider', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-email': userEmail,
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        this.addTestResult('persistence_after_clear', 
          !!data.provider && data.provider === 'resend',
          'Persistencia en BD después de limpiar localStorage',
          { config: data }
        );
      } else {
        this.addTestResult('persistence_after_clear', false, 'No hay persistencia en BD', { status: response.status });
      }
    } catch (error) {
      this.addTestResult('persistence_after_clear', false, 'Error en prueba de persistencia', { error });
    }
  }

  // Pruebas de escenarios de error
  async testErrorScenarios(): Promise<void> {
    EmailDebugger.log('info', 'FLOW_TESTER', '⚠️ Iniciando pruebas de escenarios de error');

    // Test 1: Configuración incompleta
    try {
      localStorage.setItem('emailProvider', 'gmail');
      localStorage.setItem('gmailUser', 'test@gmail.com');
      // No establecer gmailPassword
      
      const config = this.readLocalStorageConfig();
      const isValid = this.validateConfig(config);
      
      this.addTestResult('error_incomplete_config', 
        !isValid,
        'Detección de configuración incompleta',
        { config, isValid }
      );
    } catch (error) {
      this.addTestResult('error_incomplete_config', false, 'Error en prueba de configuración incompleta', { error });
    }

    // Test 2: Proveedor inválido
    try {
      localStorage.setItem('emailProvider', 'invalid-provider');
      localStorage.setItem('someKey', 'someValue');
      
      const config = this.readLocalStorageConfig();
      const isValid = this.validateConfig(config);
      
      this.addTestResult('error_invalid_provider', 
        !isValid,
        'Detección de proveedor inválido',
        { config, isValid }
      );
    } catch (error) {
      this.addTestResult('error_invalid_provider', false, 'Error en prueba de proveedor inválido', { error });
    }
  }

  // Métodos auxiliares
  private readLocalStorageConfig(): EmailConfig | null {
    try {
      const provider = localStorage.getItem('emailProvider');
      if (!provider) return null;

      const config: any = {};
      
      if (provider === 'gmail') {
        config.gmailUser = localStorage.getItem('gmailUser');
        config.gmailPassword = localStorage.getItem('gmailPassword');
      } else if (provider === 'web3forms') {
        config.web3formsKey = localStorage.getItem('web3forms_key');
        config.senderEmail = localStorage.getItem('senderEmail');
      } else if (provider === 'resend') {
        config.resendApiKey = localStorage.getItem('resendApiKey');
        config.resendFromEmail = localStorage.getItem('resendFromEmail');
      }

      return { provider, config };
    } catch (error) {
      return null;
    }
  }

  private clearLocalStorageConfig(): void {
    const keys = [
      'emailProvider', 'gmailUser', 'gmailPassword',
      'web3forms_key', 'sender_email', 'resendApiKey', 'resendFromEmail',
      'emailConfigSynced', 'emailConfigSyncedAt'
    ];
    
    keys.forEach(key => localStorage.removeItem(key));
  }

  private validateConfig(config: EmailConfig | null): boolean {
    if (!config || !config.provider) return false;

    switch (config.provider) {
      case 'gmail':
        return !!(config.config.gmailUser && config.config.gmailPassword);
      case 'web3forms':
        return !!(config.config.web3formsKey && config.config.senderEmail);
      case 'resend':
        return !!(config.config.resendApiKey && config.config.resendFromEmail);
      default:
        return false;
    }
  }

  private addTestResult(testName: string, success: boolean, message: string, details?: any): void {
    const result: TestResult = {
      testName,
      success,
      message,
      details,
      timestamp: new Date().toISOString()
    };
    
    this.testResults.push(result);
    
    const logLevel = success ? 'info' : 'error';
    const icon = success ? '✅' : '❌';
    
    EmailDebugger.log(logLevel, 'FLOW_TESTER', `${icon} ${testName}: ${message}`, details);
  }

  // Obtener reporte de resultados
  getTestReport(): any {
    const passed = this.testResults.filter(r => r.success);
    const failed = this.testResults.filter(r => !r.success);
    
    return {
      summary: {
        total: this.testResults.length,
        passed: passed.length,
        failed: failed.length,
        successRate: this.testResults.length > 0 ? (passed.length / this.testResults.length * 100).toFixed(2) + '%' : '0%'
      },
      results: this.testResults,
      failedTests: failed,
      timestamp: new Date().toISOString()
    };
  }

  // Limpiar resultados
  clearResults(): void {
    this.testResults = [];
  }
}

// Funciones globales para uso en consola del navegador (solo en el cliente)
if (typeof window !== 'undefined') {
  (window as any).emailFlowTest = {
    runAll: () => EmailFlowTester.getInstance().runCompleteTestSuite(),
    testLocalStorage: () => EmailFlowTester.getInstance().testLocalStorageOperations(),
    testAPI: () => EmailFlowTester.getInstance().testEmailConfigAPI(),
    testSync: () => EmailFlowTester.getInstance().testSynchronization(),
    testSending: () => EmailFlowTester.getInstance().testEmailSendingAPI(),
    testPersistence: () => EmailFlowTester.getInstance().testPersistence(),
    testErrors: () => EmailFlowTester.getInstance().testErrorScenarios(),
    getReport: () => EmailFlowTester.getInstance().getTestReport()
  };
}

export default EmailFlowTester;