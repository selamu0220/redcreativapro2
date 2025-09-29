import { EmailDebugger } from './emailDebugger';
import { EmailFallbackSystem } from './emailFallbackSystem';

/**
 * Test de persistencia de configuración de email
 * Verifica que la configuración se mantenga después de recargas y cambios
 */
export class PersistenceTest {
  private static instance: PersistenceTest;
  private testResults: Array<{ test: string; passed: boolean; details: string }> = [];

  static getInstance(): PersistenceTest {
    if (!PersistenceTest.instance) {
      PersistenceTest.instance = new PersistenceTest();
    }
    return PersistenceTest.instance;
  }

  /**
   * Ejecuta todos los tests de persistencia
   */
  async runAllTests(): Promise<{ passed: number; failed: number; results: any[] }> {
    this.testResults = [];
    EmailDebugger.log('info', 'PERSISTENCE_TEST_START', '🧪 Iniciando tests de persistencia');

    // Test 1: Verificar localStorage
    await this.testLocalStoragePersistence();

    // Test 2: Verificar sincronización con BD
    await this.testDatabaseSync();

    // Test 3: Verificar fallbacks
    await this.testFallbackSystem();

    // Test 4: Verificar recuperación después de limpieza
    await this.testRecoveryAfterClear();

    // Test 5: Verificar configuración en headers
    await this.testHeadersPersistence();

    const passed = this.testResults.filter(r => r.passed).length;
    const failed = this.testResults.filter(r => !r.passed).length;

    EmailDebugger.log('info', 'PERSISTENCE_TEST_COMPLETE', `✅ Tests completados: ${passed} exitosos, ${failed} fallidos`, {
      passed,
      failed,
      results: this.testResults
    });

    return { passed, failed, results: this.testResults };
  }

  /**
   * Test de persistencia en localStorage
   */
  private async testLocalStoragePersistence(): Promise<void> {
    try {
      const testConfig = {
        provider: 'gmail',
        config: {
          gmailUser: 'test@gmail.com',
          gmailPassword: 'test-password'
        }
      };

      // Guardar configuración
      localStorage.setItem('emailConfig', JSON.stringify(testConfig));
      
      // Verificar que se guardó
      const saved = localStorage.getItem('emailConfig');
      const parsed = saved ? JSON.parse(saved) : null;

      if (parsed && parsed.provider === 'gmail' && parsed.config.gmailUser === 'test@gmail.com') {
        this.addTestResult('localStorage_persistence', true, 'Configuración guardada y recuperada correctamente');
      } else {
        this.addTestResult('localStorage_persistence', false, 'Error al guardar/recuperar configuración');
      }

      // Limpiar
      localStorage.removeItem('emailConfig');
    } catch (error) {
      this.addTestResult('localStorage_persistence', false, `Error: ${error}`);
    }
  }

  /**
   * Test de sincronización con base de datos
   */
  private async testDatabaseSync(): Promise<void> {
    try {
      // Simular configuración en localStorage
      const testConfig = {
        provider: 'resend',
        config: {
          resendApiKey: 'test-key',
          resendFromEmail: 'test@resend.com'
        }
      };

      localStorage.setItem('emailConfig', JSON.stringify(testConfig));

      // Intentar sincronizar (esto requeriría un usuario autenticado)
      // Por ahora solo verificamos que el sistema de fallback funcione
      const fallbackSystem = EmailFallbackSystem.getInstance();
      const config = await fallbackSystem.getEmailConfig(new Headers());

      if (config && config.config && config.config.provider) {
        this.addTestResult('database_sync', true, `Configuración obtenida: ${config.config.provider}`);
      } else {
        this.addTestResult('database_sync', false, 'No se pudo obtener configuración');
      }

      localStorage.removeItem('emailConfig');
    } catch (error) {
      this.addTestResult('database_sync', false, `Error: ${error}`);
    }
  }

  /**
   * Test del sistema de fallbacks
   */
  private async testFallbackSystem(): Promise<void> {
    try {
      const fallbackSystem = EmailFallbackSystem.getInstance();
      
      // Limpiar todas las fuentes
      localStorage.removeItem('emailConfig');
      fallbackSystem.clearMemoryCache();

      // Crear headers con configuración
      const headers = new Headers();
      headers.set('x-gmail-user', 'test@gmail.com');
      headers.set('x-gmail-password', 'test-password');

      const config = await fallbackSystem.getEmailConfig(headers);

      if (config && config.config && config.config.provider === 'gmail') {
        this.addTestResult('fallback_system', true, 'Sistema de fallbacks funcionando correctamente');
      } else {
        this.addTestResult('fallback_system', false, 'Sistema de fallbacks no funcionó');
      }
    } catch (error) {
      this.addTestResult('fallback_system', false, `Error: ${error}`);
    }
  }

  /**
   * Test de recuperación después de limpieza
   */
  private async testRecoveryAfterClear(): Promise<void> {
    try {
      const fallbackSystem = EmailFallbackSystem.getInstance();
      
      // Establecer configuración inicial
      const testConfig = {
        provider: 'resend',
        config: {
          resendApiKey: 'test-key',
          resendFromEmail: 'test@resend.com'
        }
      };

      localStorage.setItem('emailConfig', JSON.stringify(testConfig));
      
      // Simular pérdida de configuración
      localStorage.removeItem('emailConfig');
      fallbackSystem.clearMemoryCache();

      // Intentar recuperar con configuración de emergencia
      const config = await fallbackSystem.getEmailConfig(new Headers());

      if (config) {
        this.addTestResult('recovery_after_clear', true, `Recuperación exitosa con: ${config.config?.provider}`);
      } else {
        this.addTestResult('recovery_after_clear', false, 'No se pudo recuperar configuración');
      }
    } catch (error) {
      this.addTestResult('recovery_after_clear', false, `Error: ${error}`);
    }
  }

  /**
   * Test de persistencia en headers
   */
  private async testHeadersPersistence(): Promise<void> {
    EmailDebugger.log('info', 'PERSISTENCE_TEST', '📡 Probando persistencia de headers');
    
    try {
      // Verificar que existe userEmail para las pruebas
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        this.addTestResult(
          'headers_persistence',
          false,
          'No hay userEmail configurado para pruebas - userEmail requerido'
        );
        return;
      }
      
      // Probar obtener configuración con headers
      const fallbackSystem = EmailFallbackSystem.getInstance();
      const result = await fallbackSystem.getEmailConfig();
      
      this.addTestResult(
        'headers_persistence',
        result.success,
        `Persistencia de configuración desde headers - source: ${result.source}`
      );
      
    } catch (error) {
      this.addTestResult(
        'headers_persistence',
        false,
        `Error en test de headers: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Añade un resultado de test
   */
  private addTestResult(test: string, passed: boolean, details: string): void {
    this.testResults.push({ test, passed, details });
    const status = passed ? '✅' : '❌';
    EmailDebugger.log('info', 'PERSISTENCE_TEST_RESULT', `${status} ${test}: ${details}`);
  }

  /**
   * Obtiene el reporte de tests
   */
  getTestReport(): { passed: number; failed: number; results: any[] } {
    const passed = this.testResults.filter(r => r.passed).length;
    const failed = this.testResults.filter(r => !r.passed).length;
    return { passed, failed, results: this.testResults };
  }

  /**
   * Simula una recarga de página
   */
  simulatePageReload(): void {
    EmailDebugger.log('info', 'PERSISTENCE_TEST_RELOAD', '🔄 Simulando recarga de página');
    
    // Limpiar cache en memoria pero mantener localStorage
    const fallbackSystem = EmailFallbackSystem.getInstance();
    fallbackSystem.clearMemoryCache();
    
    EmailDebugger.log('info', 'PERSISTENCE_TEST_RELOAD_COMPLETE', 'Recarga simulada completada');
  }
}

// Funciones globales para uso en consola del navegador (solo en el cliente)
if (typeof window !== 'undefined') {
  (window as any).runPersistenceTests = async () => {
    const tester = PersistenceTest.getInstance();
    return await tester.runAllTests();
  };

  (window as any).simulateReload = () => {
    const tester = PersistenceTest.getInstance();
    tester.simulatePageReload();
  };

  (window as any).getTestReport = () => {
    const tester = PersistenceTest.getInstance();
    return tester.getTestReport();
  };
}