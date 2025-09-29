'use client';

import EmailDebugger from './emailDebugger';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';

// Tipos para la configuración de email
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

// Clase para monitoreo en tiempo real de la sincronización
export class RealTimeSyncMonitor {
  private static instance: RealTimeSyncMonitor;
  private isMonitoring = false;
  private intervalId: NodeJS.Timeout | null = null;
  private lastLocalStorageState: string | null = null;
  private lastDatabaseState: string | null = null;
  private syncCheckInterval = 2000; // 2 segundos

  static getInstance(): RealTimeSyncMonitor {
    if (!RealTimeSyncMonitor.instance) {
      RealTimeSyncMonitor.instance = new RealTimeSyncMonitor();
    }
    return RealTimeSyncMonitor.instance;
  }

  // Iniciar monitoreo en tiempo real
  startMonitoring(): void {
    if (this.isMonitoring) {
      EmailDebugger.log('warn', 'SYNC_MONITOR', 'El monitoreo ya está activo');
      return;
    }

    this.isMonitoring = true;
    EmailDebugger.log('info', 'SYNC_MONITOR', '🔄 Iniciando monitoreo en tiempo real de sincronización');

    // Verificación inicial
    this.checkSyncStatus();

    // Configurar verificación periódica
    this.intervalId = setInterval(() => {
      this.checkSyncStatus();
    }, this.syncCheckInterval);
  }

  // Detener monitoreo
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    EmailDebugger.log('info', 'SYNC_MONITOR', '⏹️ Monitoreo detenido');
  }

  // Verificar estado de sincronización
  private async checkSyncStatus(): Promise<void> {
    try {
      // Obtener estado actual de localStorage
      const currentLocalStorage = this.getLocalStorageState();
      
      // Obtener estado actual de la base de datos
      const currentDatabaseState = await this.getDatabaseState();

      // Verificar cambios en localStorage
      if (currentLocalStorage !== this.lastLocalStorageState) {
        EmailDebugger.log('info', 'SYNC_MONITOR', '📱 Cambio detectado en localStorage', {
          previous: this.lastLocalStorageState ? 'Configurado' : 'Vacío',
          current: currentLocalStorage ? 'Configurado' : 'Vacío',
          timestamp: new Date().toISOString()
        });
        this.lastLocalStorageState = currentLocalStorage;
      }

      // Verificar cambios en la base de datos
      if (currentDatabaseState !== this.lastDatabaseState) {
        EmailDebugger.log('info', 'SYNC_MONITOR', '🗄️ Cambio detectado en base de datos', {
          previous: this.lastDatabaseState ? 'Configurado' : 'Vacío',
          current: currentDatabaseState ? 'Configurado' : 'Vacío',
          timestamp: new Date().toISOString()
        });
        this.lastDatabaseState = currentDatabaseState;
      }

      // Verificar sincronización
      this.compareSyncStates(currentLocalStorage, currentDatabaseState);

    } catch (error) {
      EmailDebugger.log('error', 'SYNC_MONITOR', 'Error durante verificación de sincronización', {
        error: error instanceof Error ? error.message : error
      });
    }
  }

  // Obtener estado de localStorage
  private getLocalStorageState(): string | null {
    try {
      const emailProvider = localStorage.getItem('emailProvider');
      const gmailUser = localStorage.getItem('gmailUser');
      const gmailPassword = localStorage.getItem('gmailPassword');
      const web3formsKey = localStorage.getItem('web3forms_key');
      const senderEmail = localStorage.getItem('senderEmail');
      const resendApiKey = localStorage.getItem('resendApiKey');
      const resendFromEmail = localStorage.getItem('resendFromEmail');

      if (!emailProvider) return null;

      const config: any = { provider: emailProvider };
      
      if (emailProvider === 'gmail' && gmailUser && gmailPassword) {
        config.gmailUser = gmailUser;
        config.gmailPassword = '***';
      } else if (emailProvider === 'web3forms' && web3formsKey && senderEmail) {
        config.web3formsKey = '***';
        config.senderEmail = senderEmail;
      } else if (emailProvider === 'resend' && resendApiKey && resendFromEmail) {
        config.resendApiKey = '***';
        config.resendFromEmail = resendFromEmail;
      }

      return JSON.stringify(config);
    } catch (error) {
      EmailDebugger.log('error', 'SYNC_MONITOR', 'Error al leer localStorage', { error });
      return null;
    }
  }

  // Obtener estado de la base de datos
  private async getDatabaseState(): Promise<string | null> {
    try {
      // Obtener email del usuario desde localStorage
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        EmailDebugger.log('warn', 'SYNC_MONITOR', 'No hay email de usuario para consultar BD');
        return null;
      }

      // Usar fetch nativo aquí ya que este es un utility class sin acceso a hooks
      const response = await fetch('/api/user/email-provider', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail,
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        }
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      if (!data.config || !data.config.provider) {
        return null;
      }

      // Crear una versión sanitizada para comparación
      const sanitizedConfig = {
        provider: data.config.provider,
        ...Object.keys(data.config.config || {}).reduce((acc: any, key) => {
          if (key.includes('password') || key.includes('key') || key.includes('Key')) {
            acc[key] = '***';
          } else {
            acc[key] = data.config.config[key];
          }
          return acc;
        }, {})
      };

      return JSON.stringify(sanitizedConfig);
    } catch (error) {
      EmailDebugger.log('error', 'SYNC_MONITOR', 'Error al obtener estado de BD', { error });
      return null;
    }
  }

  // Comparar estados de sincronización
  private compareSyncStates(localState: string | null, dbState: string | null): void {
    const isInSync = localState === dbState;
    
    if (!isInSync) {
      EmailDebugger.log('warn', 'SYNC_MONITOR', '⚠️ DESINCRONIZACIÓN DETECTADA', {
        localStorage: localState ? 'Configurado' : 'Vacío',
        database: dbState ? 'Configurado' : 'Vacío',
        localConfig: localState,
        dbConfig: dbState,
        timestamp: new Date().toISOString()
      });
    } else {
      EmailDebugger.log('info', 'SYNC_MONITOR', '✅ Estados sincronizados correctamente', {
        hasConfig: !!localState,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Forzar sincronización manual
  async forceSyncFromLocalStorage(): Promise<boolean> {
    try {
      EmailDebugger.log('info', 'SYNC_MONITOR', '🔄 Forzando sincronización desde localStorage');
      
      const emailProvider = localStorage.getItem('emailProvider');
      if (!emailProvider) {
        EmailDebugger.log('warn', 'SYNC_MONITOR', 'No hay configuración en localStorage para sincronizar');
        return false;
      }

      // Construir configuración desde localStorage
      const config: any = {};
      
      if (emailProvider === 'gmail') {
        config.gmailUser = localStorage.getItem('gmailUser');
        config.gmailPassword = localStorage.getItem('gmailPassword');
      } else if (emailProvider === 'web3forms') {
        config.web3formsKey = localStorage.getItem('web3forms_key');
        config.senderEmail = localStorage.getItem('senderEmail');
      } else if (emailProvider === 'resend') {
        config.resendApiKey = localStorage.getItem('resendApiKey');
        config.resendFromEmail = localStorage.getItem('resendFromEmail');
      }

      // Enviar a la base de datos
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        EmailDebugger.log('warn', 'SYNC_MONITOR', 'No hay email de usuario para sincronizar');
        return false;
      }

      const response = await fetch('/api/user/email-provider', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail,
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        body: JSON.stringify({
          provider: emailProvider,
          ...config
        })
      });

      if (response.ok) {
        EmailDebugger.log('info', 'SYNC_MONITOR', '✅ Sincronización forzada exitosa');
        return true;
      } else {
        EmailDebugger.log('error', 'SYNC_MONITOR', '❌ Error en sincronización forzada', {
          status: response.status,
          statusText: response.statusText
        });
        return false;
      }
    } catch (error) {
      EmailDebugger.log('error', 'SYNC_MONITOR', 'Error durante sincronización forzada', {
        error: error instanceof Error ? error.message : error
      });
      return false;
    }
  }

  // Obtener reporte de estado actual
  async getStatusReport(): Promise<any> {
    const localState = this.getLocalStorageState();
    const dbState = await this.getDatabaseState();
    
    return {
      isMonitoring: this.isMonitoring,
      syncInterval: this.syncCheckInterval,
      localStorage: {
        hasConfig: !!localState,
        config: localState
      },
      database: {
        hasConfig: !!dbState,
        config: dbState
      },
      isInSync: localState === dbState,
      timestamp: new Date().toISOString()
    };
  }
}

// Funciones globales para acceso desde consola del navegador (solo en el cliente)
if (typeof window !== 'undefined') {
  (window as any).syncMonitor = {
    start: () => RealTimeSyncMonitor.getInstance().startMonitoring(),
    stop: () => RealTimeSyncMonitor.getInstance().stopMonitoring(),
    status: () => RealTimeSyncMonitor.getInstance().getStatusReport(),
    forceSync: () => RealTimeSyncMonitor.getInstance().forceSyncFromLocalStorage()
  };
}

export default RealTimeSyncMonitor;